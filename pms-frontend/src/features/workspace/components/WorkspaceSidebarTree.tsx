import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronRight, Ellipsis, ListChecks, Plus } from "lucide-react";
import { projectApi } from "@/features/project/api/projectApi";
import { patchProjectPriority } from "@/features/project/utils/projectPriority";
import { ProjectListControls } from "@/features/project/components/ProjectListControls";
import { SidebarPriorityLegend } from "@/features/project/components/SidebarPriorityLegend";
import {
  sidebarProjectRowAccent,
  sidebarProjectRowAccentStyle,
  SidebarPriorityMark,
} from "@/features/project/components/SidebarPriorityMark";
import type { ProjectSummary } from "@/features/project/types";
import { workspaceApi } from "../api/workspaceApi";
import type { Workspace } from "../types";
import { ApiClientError } from "@/shared/api/client";
import { useAuth } from "@/shared/context/AuthContext";
import {
  APP_EVENTS,
  type ProjectsChangedDetail,
  type WorkspacesChangedDetail,
} from "@/shared/events/appEvents";
import { SIDEBAR_SECTION_LABEL } from "@/shared/components/layout/sidebarStyles";
import { createProjectPath, projectPath, workspacePath } from "@/shared/routes/paths";
import {
  persistProjectListSort,
  persistProjectPriorityFilter,
  readProjectListSort,
  readProjectPriorityFilter,
} from "@/shared/utils/projectListPrefs";
import {
  applyProjectListView,
  type ProjectListSort,
} from "@/shared/utils/projectListUtils";
import { canCreateWorkspace } from "@/shared/utils/workspacePermissions";
import { WorkspaceAvatar } from "./WorkspaceAvatar";

const EXPANDED_KEY = "pms.sidebar.expandedWorkspaces";

function readExpandedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function persistExpandedIds(ids: Set<number>) {
  localStorage.setItem(EXPANDED_KEY, JSON.stringify([...ids]));
}

function workspaceRowClass(active: boolean) {
  return [
    "flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pr-1 transition-colors",
    active ? "bg-[#eef0f3] font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

function projectItemClass({ isActive }: { isActive: boolean }) {
  return [
    "flex min-h-[28px] items-center gap-2 rounded-md py-1 pl-2 pr-2 text-[13px] transition-colors",
    isActive
      ? "bg-[#eef0f3] font-medium text-slate-900"
      : "text-slate-600 hover:bg-slate-50",
  ].join(" ");
}

type Props = {
  onWorkspacesLoaded?: (workspaces: Workspace[]) => void;
};

export function WorkspaceSidebarTree({ onWorkspacesLoaded }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const canCreate = canCreateWorkspace(user);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(() => readExpandedIds());
  const [projectsByWorkspace, setProjectsByWorkspace] = useState<
    Record<number, ProjectSummary[]>
  >({});
  const [loadingProjects, setLoadingProjects] = useState<Set<number>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState(() => readProjectPriorityFilter());
  const [projectSort, setProjectSort] = useState<ProjectListSort>(() => readProjectListSort());

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await workspaceApi.list();
      setWorkspaces(list);
      onWorkspacesLoaded?.(list);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Không tải được phòng ban",
      );
    } finally {
      setLoading(false);
    }
  }, [onWorkspacesLoaded]);

  const loadProjects = useCallback(
    async (workspaceId: number) => {
      const wsSlug = workspaces.find((w) => w.id === workspaceId)?.slug;
      if (!wsSlug) return;
      setLoadingProjects((prev) => new Set(prev).add(workspaceId));
      try {
        const projects = await projectApi.listByWorkspace(wsSlug);
        setProjectsByWorkspace((prev) => ({ ...prev, [workspaceId]: projects }));
      } catch {
        setProjectsByWorkspace((prev) => ({ ...prev, [workspaceId]: [] }));
      } finally {
        setLoadingProjects((prev) => {
          const next = new Set(prev);
          next.delete(workspaceId);
          return next;
        });
      }
    },
    [workspaces],
  );

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    function handleWorkspacesChanged(event: Event) {
      const detail = (event as CustomEvent<WorkspacesChangedDetail>).detail;
      void loadWorkspaces().then(() => {
        if (detail?.workspaceId == null) return;
        setExpanded((prev) => {
          const next = new Set(prev);
          next.add(detail.workspaceId!);
          persistExpandedIds(next);
          return next;
        });
        loadProjects(detail.workspaceId);
      });
    }

    function handleProjectsChanged(event: Event) {
      const detail = (event as CustomEvent<ProjectsChangedDetail>).detail;
      if (detail?.workspaceId == null) return;

      if (detail.projectId != null) {
        setProjectsByWorkspace((prev) => {
          const list = prev[detail.workspaceId];
          if (!list) return prev;
          return {
            ...prev,
            [detail.workspaceId]: list.map((p) => {
              if (p.id !== detail.projectId) return p;
              let next = p;
              if (detail.priorityName) {
                next = patchProjectPriority(next, detail.priorityName);
              }
              if (detail.statusName != null) {
                next = { ...next, statusName: detail.statusName };
              }
              return next;
            }),
          };
        });
      }

      loadProjects(detail.workspaceId);
    }

    window.addEventListener(APP_EVENTS.workspacesChanged, handleWorkspacesChanged);
    window.addEventListener(APP_EVENTS.projectsChanged, handleProjectsChanged);
    return () => {
      window.removeEventListener(APP_EVENTS.workspacesChanged, handleWorkspacesChanged);
      window.removeEventListener(APP_EVENTS.projectsChanged, handleProjectsChanged);
    };
  }, [loadWorkspaces, loadProjects]);

  const activeWorkspaceId = useMemo(() => {
    const match = location.pathname.match(/^\/workspaces\/([^/]+)/);
    if (!match || match[1] === "new") return null;
    const slug = decodeURIComponent(match[1]);
    return workspaces.find((w) => w.slug === slug)?.id ?? null;
  }, [location.pathname, workspaces]);

  useEffect(() => {
    if (activeWorkspaceId == null) return;
    setExpanded((prev) => {
      if (prev.has(activeWorkspaceId)) return prev;
      const next = new Set(prev);
      next.add(activeWorkspaceId);
      persistExpandedIds(next);
      return next;
    });
    if (!projectsByWorkspace[activeWorkspaceId]) {
      loadProjects(activeWorkspaceId);
    }
  }, [activeWorkspaceId, loadProjects, projectsByWorkspace]);

  useEffect(() => {
    expanded.forEach((id) => {
      if (!projectsByWorkspace[id] && !loadingProjects.has(id)) {
        loadProjects(id);
      }
    });
  }, [expanded, projectsByWorkspace, loadingProjects, loadProjects]);

  const toggleExpanded = (workspaceId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(workspaceId)) {
        next.delete(workspaceId);
      } else {
        next.add(workspaceId);
        if (!projectsByWorkspace[workspaceId]) loadProjects(workspaceId);
      }
      persistExpandedIds(next);
      return next;
    });
  };

  if (loading) {
    return <p className="px-2 py-2 text-xs text-slate-500">Đang tải phòng ban…</p>;
  }

  if (error) {
    return <p className="px-2 py-2 text-xs text-red-600">{error}</p>;
  }

  return (
    <div>
      <ProjectListControls
        compact
        priorityFilter={priorityFilter}
        sort={projectSort}
        onPriorityFilterChange={(value) => {
          setPriorityFilter(value);
          persistProjectPriorityFilter(value);
        }}
        onSortChange={(value) => {
          setProjectSort(value);
          persistProjectListSort(value);
        }}
      />
      <SidebarPriorityLegend />

      <div className="mb-2 flex items-center justify-between px-1">
        <p className={SIDEBAR_SECTION_LABEL}>Phòng ban</p>
        {canCreate && (
          <NavLink
            to="/workspaces/new"
            className={({ isActive }) =>
              [
                "rounded-md p-1 text-slate-400 transition",
                isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 hover:text-slate-700",
              ].join(" ")
            }
            title="Tạo phòng ban"
            aria-label="Tạo phòng ban"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </NavLink>
        )}
      </div>

      {workspaces.length === 0 ? (
        <p className="px-2 py-2 text-xs leading-relaxed text-slate-500">
          {canCreate ? "Chưa có phòng ban. Nhấn + để tạo." : "Chưa tham gia phòng ban nào."}
        </p>
      ) : (
        <ul className="space-y-1">
          {workspaces.map((workspace) => {
            const isExpanded = expanded.has(workspace.id);
            const rawProjects = projectsByWorkspace[workspace.id];
            const visibleProjects =
              rawProjects != null
                ? applyProjectListView(rawProjects, priorityFilter, projectSort)
                : undefined;
            const isLoadingProjects = loadingProjects.has(workspace.id);
            const filterActive = priorityFilter.length > 0;
            const isActiveWorkspace =
              activeWorkspaceId === workspace.id &&
              !location.pathname.includes("/projects/");
            const canAddProject =
              workspace.myRole?.toLowerCase() === "admin" ||
              workspace.myRole?.toLowerCase() === "member";

            return (
              <li key={workspace.id}>
                <div className="group flex items-center gap-0.5 rounded-lg hover:bg-slate-50/80">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(workspace.id)}
                    className="flex h-8 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Thu gọn" : "Mở rộng dự án"}
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                      strokeWidth={2.5}
                    />
                  </button>

                  <Link
                    to={workspacePath(workspace.slug)}
                    className={workspaceRowClass(isActiveWorkspace)}
                    title={workspace.name}
                  >
                    <WorkspaceAvatar workspace={workspace} size="sm" />
                    <span className="truncate text-[13px]">{workspace.name}</span>
                  </Link>

                  <div className="flex shrink-0 items-center gap-0.5 pr-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      to={workspacePath(workspace.slug)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Chi tiết phòng ban"
                      aria-label="Chi tiết"
                    >
                      <Ellipsis className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </Link>
                    {canAddProject && (
                      <Link
                        to={createProjectPath(workspace.slug)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Tạo dự án"
                        aria-label="Tạo dự án"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </Link>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mb-1 ml-[22px] border-l border-slate-200 pl-2">
                    {isLoadingProjects && !rawProjects && (
                      <p className="py-1.5 text-[11px] text-slate-400">Đang tải dự án…</p>
                    )}
                    {rawProjects && rawProjects.length === 0 && !isLoadingProjects && (
                      <p className="py-1.5 text-[11px] text-slate-400">Chưa có dự án</p>
                    )}
                    {rawProjects &&
                      rawProjects.length > 0 &&
                      visibleProjects &&
                      visibleProjects.length === 0 &&
                      !isLoadingProjects && (
                        <p className="py-1.5 text-[11px] text-slate-400">
                          Không có dự án {filterActive ? "khớp bộ lọc" : ""}
                        </p>
                      )}
                    {visibleProjects && visibleProjects.length > 0 && (
                      <ul className="space-y-0.5 py-0.5">
                        {visibleProjects.map((project) => (
                          <li key={project.id}>
                            <NavLink
                              to={projectPath(workspace.slug, project.slug, "backlog")}
                              className={({ isActive }) =>
                                [
                                  projectItemClass({ isActive }),
                                  sidebarProjectRowAccent(project.priorityName),
                                ].join(" ")
                              }
                              style={sidebarProjectRowAccentStyle(project.priorityName)}
                              title={
                                project.priorityName
                                  ? `${project.name} · ${project.priorityName}`
                                  : project.name
                              }
                            >
                              <ListChecks
                                className="h-4 w-4 shrink-0 text-slate-400"
                                strokeWidth={2}
                              />
                              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                                <SidebarPriorityMark name={project.priorityName} />
                                <span className="truncate">{project.name}</span>
                              </span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
