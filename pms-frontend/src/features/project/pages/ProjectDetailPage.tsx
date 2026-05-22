import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { workspaceApi } from "@/features/workspace/api/workspaceApi";
import type { Member } from "@/features/workspace/types";
import { ApiClientError } from "@/shared/api/client";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { useToast } from "@/shared/context/ToastContext";
import { notifyProjectsChanged } from "@/shared/events/appEvents";
import { PROJECT_COLOR_PRESETS } from "@/shared/config/project-options";
import { workspacePath } from "@/shared/routes/paths";
import { DEFAULT_PROJECT_TAB, parseProjectTab } from "../config/projectTabs";
import { ProjectShellHeader } from "../components/project-shell/ProjectShellHeader";
import { ProjectTabNav } from "../components/project-shell/ProjectTabNav";
import { ProjectViewToolbar } from "../components/project-shell/ProjectViewToolbar";
import { ProjectBacklogTab } from "../components/project-views/ProjectBacklogTab";
import { ProjectBoardTab } from "../components/project-views/ProjectBoardTab";
import { ProjectSettingsPanel } from "../components/project-views/ProjectSettingsPanel";
import { ProjectSummaryTab } from "../components/project-views/ProjectSummaryTab";
import { projectApi } from "../api/projectApi";
import type { ProjectDetail, ProjectMember } from "../types";

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function canManageProject(role: string | null | undefined) {
  const r = role?.toLowerCase();
  return r === "pm" || r === "lead" || r === "admin";
}

function canWriteTasks(role: string | null | undefined) {
  const r = role?.toLowerCase();
  return r === "pm" || r === "lead" || r === "admin" || r === "member";
}

export function ProjectDetailPage() {
  const { workspaceSlug, projectSlug } = useParams<{
    workspaceSlug: string;
    projectSlug: string;
  }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const activeTab = parseProjectTab(searchParams.get("tab") ?? DEFAULT_PROJECT_TAB);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<Member[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("Active");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editColor, setEditColor] = useState<string>(PROJECT_COLOR_PRESETS[0]);
  const [editPrivacy, setEditPrivacy] = useState("PRIVATE");
  const [editLeadUserId, setEditLeadUserId] = useState("");

  const load = useCallback(async () => {
    if (!workspaceSlug || !projectSlug) return;
    setLoading(true);
    setError("");
    try {
      const [ws, proj, mem] = await Promise.all([
        workspaceApi.get(workspaceSlug),
        projectApi.get(workspaceSlug, projectSlug),
        projectApi.listMembers(workspaceSlug, projectSlug),
      ]);
      setWorkspaceName(ws.name);
      setProject(proj);
      setMembers(mem);
      setEditName(proj.name);
      setEditDescription(proj.description ?? "");
      setEditStatus(proj.statusName ?? "Active");
      setEditStart(toDateInput(proj.startDate));
      setEditEnd(toDateInput(proj.endDate));
      setEditColor(proj.colorCode ?? PROJECT_COLOR_PRESETS[0]);
      setEditPrivacy(proj.privacyMode ?? "PRIVATE");
      setEditLeadUserId(
        proj.projectLeadUserId != null ? String(proj.projectLeadUserId) : "",
      );

      if (canManageProject(proj.myRole)) {
        const wsMem = await workspaceApi.listMembers(workspaceSlug);
        setWorkspaceMembers(wsMem);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được dự án");
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, projectSlug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (!project || !workspaceSlug || !projectSlug) return;
    setSaving(true);
    try {
      const updated = await projectApi.update(workspaceSlug, projectSlug, {
        name: editName,
        description: editDescription,
        statusName: editStatus,
        startDate: editStart || undefined,
        endDate: editEnd || undefined,
        colorCode: editColor,
        privacyMode: editPrivacy,
        projectLeadUserId: editLeadUserId ? Number(editLeadUserId) : undefined,
      });
      setProject(updated);
      setShowSettings(false);
      toast.success("Đã cập nhật dự án");
      notifyProjectsChanged({ workspaceId: project.workspaceId });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không cập nhật được");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!project || !workspaceSlug || !projectSlug) return;
    if (!confirm(`Xóa dự án "${project.name}"?`)) return;
    try {
      await projectApi.delete(workspaceSlug, projectSlug);
      toast.success("Đã xóa dự án");
      notifyProjectsChanged({ workspaceId: project.workspaceId });
      navigate(workspacePath(workspaceSlug));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không xóa được dự án");
    }
  }

  if (loading) return <LoadingState />;

  if (error && !project) {
    return (
      <div className="p-6">
        <ErrorAlert message={error} />
        {workspaceSlug && (
          <Link
            to={workspacePath(workspaceSlug)}
            className="mt-4 inline-block text-sm text-brand-600"
          >
            ← Quay lại phòng ban
          </Link>
        )}
      </div>
    );
  }

  if (!project || !workspaceSlug || !projectSlug) return null;

  const manage = canManageProject(project.myRole);
  const writeTasks = canWriteTasks(project.myRole);
  const isWsAdmin = project.myRole?.toLowerCase() === "admin";
  const isProjectMember = project.myRole != null || isWsAdmin;
  const showWorkToolbar = activeTab === "backlog" || activeTab === "board";
  const bumpTasks = () => setTaskRefreshKey((k) => k + 1);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-white">
      <ProjectShellHeader
        workspaceName={workspaceName}
        workspaceSlug={workspaceSlug}
        project={project}
        memberCount={members.length}
        canManage={manage}
        onOpenSettings={() => setShowSettings(true)}
      />
      <ProjectTabNav activeTab={activeTab} />

      {error && (
        <div className="px-6 pt-3">
          <ErrorAlert message={error} />
        </div>
      )}

      {showWorkToolbar && (
        <ProjectViewToolbar
          members={members}
          searchQuery={taskSearch}
          onSearchChange={setTaskSearch}
        />
      )}

      <div className="flex flex-1 flex-col">
        {activeTab === "summary" && (
          <ProjectSummaryTab
            project={project}
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
            members={members}
            canUpload={isProjectMember}
          />
        )}
        {activeTab === "board" && workspaceSlug && projectSlug && (
          <ProjectBoardTab
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
            members={members}
            canWrite={writeTasks}
            canDelete={manage}
            searchQuery={taskSearch}
            refreshKey={taskRefreshKey}
            onTasksChanged={bumpTasks}
          />
        )}
        {activeTab === "backlog" && workspaceSlug && projectSlug && (
          <ProjectBacklogTab
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
            project={project}
            members={members}
            canWrite={writeTasks}
            canDelete={manage}
            searchQuery={taskSearch}
            refreshKey={taskRefreshKey}
            onTasksChanged={bumpTasks}
          />
        )}
      </div>

      {showSettings && manage && (
        <ProjectSettingsPanel
          editName={editName}
          editDescription={editDescription}
          editStatus={editStatus}
          editStart={editStart}
          editEnd={editEnd}
          editColor={editColor}
          editPrivacy={editPrivacy}
          editLeadUserId={editLeadUserId}
          workspaceMembers={workspaceMembers}
          saving={saving}
          isWsAdmin={isWsAdmin}
          onChangeName={setEditName}
          onChangeDescription={setEditDescription}
          onChangeStatus={setEditStatus}
          onChangeStart={setEditStart}
          onChangeEnd={setEditEnd}
          onChangeColor={setEditColor}
          onChangePrivacy={setEditPrivacy}
          onChangeLead={setEditLeadUserId}
          onClose={() => setShowSettings(false)}
          onSubmit={handleSaveSettings}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
