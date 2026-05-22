import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, LayoutGrid } from "lucide-react";
import { projectApi } from "@/features/project/api/projectApi";
import { ProjectCard } from "@/features/project/components/ProjectCard";
import { ProjectListControls } from "@/features/project/components/ProjectListControls";
import type { ProjectSummary } from "@/features/project/types";
import { ApiClientError } from "@/shared/api/client";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import {
  APP_EVENTS,
  type ProjectsChangedDetail,
} from "@/shared/events/appEvents";
import { createProjectPath } from "@/shared/routes/paths";
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

type Props = {
  workspaceSlug: string;
  workspaceId: number;
  canCreate: boolean;
};

export function WorkspaceProjectsSection({
  workspaceSlug,
  workspaceId,
  canCreate,
}: Props) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(() => readProjectPriorityFilter());
  const [projectSort, setProjectSort] = useState<ProjectListSort>(() => readProjectListSort());

  const visibleProjects = useMemo(
    () => applyProjectListView(projects, priorityFilter, projectSort),
    [projects, priorityFilter, projectSort],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProjects(await projectApi.listByWorkspace(workspaceSlug));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được dự án");
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function onProjectsChanged(event: Event) {
      const detail = (event as CustomEvent<ProjectsChangedDetail>).detail;
      if (detail?.workspaceId === workspaceId) {
        load();
      }
    }
    window.addEventListener(APP_EVENTS.projectsChanged, onProjectsChanged);
    return () =>
      window.removeEventListener(APP_EVENTS.projectsChanged, onProjectsChanged);
  }, [workspaceId, load]);

  const createHref = createProjectPath(workspaceSlug);

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-slate-600" strokeWidth={2} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Dự án</h2>
            <p className="text-xs text-slate-500">
              {priorityFilter
                ? `Đang lọc: ${priorityFilter}`
                : "Ưu tiên cao hiển thị trước (có thể đổi bên dưới)"}
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            to={createHref}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <FolderPlus className="h-4 w-4" />
            Tạo dự án
          </Link>
        )}
      </div>

      <ProjectListControls
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

      {error && <ErrorAlert message={error} className="mb-4" />}
      {loading && <LoadingState />}
      {!loading && !error && projects.length === 0 && (
        <EmptyState
          message="Chưa có dự án trong phòng ban này."
          action={
            canCreate ? (
              <Link
                to={createHref}
                className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Tạo dự án
              </Link>
            ) : undefined
          }
        />
      )}
      {!loading &&
        !error &&
        projects.length > 0 &&
        visibleProjects.length === 0 && (
          <EmptyState message={`Không có dự án mức ${priorityFilter}.`} />
        )}
      {!loading && visibleProjects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((p) => (
            <ProjectCard key={p.id} project={p} workspaceSlug={workspaceSlug} />
          ))}
        </div>
      )}
    </section>
  );
}
