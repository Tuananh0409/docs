import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { ProjectMember } from "../../types";
import { taskApi } from "@/features/task/api/taskApi";
import { TaskCreateModal } from "@/features/task/components/TaskCreateModal";
import { TaskDetailModal } from "@/features/task/components/TaskDetailModal";
import { TaskAssigneeAvatars } from "@/features/task/components/TaskAssigneeAvatars";
import type { TaskStatus, TaskSummary } from "@/features/task/types";
import {
  filterTasksByQuery,
  formatDeadline,
  groupTasksByStatus,
  priorityColor,
} from "@/features/task/utils/taskUi";
import { ApiClientError } from "@/shared/api/client";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  members: ProjectMember[];
  canWrite: boolean;
  canDelete: boolean;
  searchQuery: string;
  refreshKey: number;
  onTasksChanged: () => void;
};

export function ProjectBoardTab({
  workspaceSlug,
  projectSlug,
  members,
  canWrite,
  canDelete,
  searchQuery,
  refreshKey,
  onTasksChanged,
}: Props) {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState("Todo");
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskList, statusList] = await Promise.all([
        taskApi.listByProject(workspaceSlug, projectSlug),
        taskApi.listStatuses(),
      ]);
      setTasks(taskList);
      setStatuses(statusList);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được task");
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, projectSlug]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(
    () => filterTasksByQuery(tasks, searchQuery),
    [tasks, searchQuery],
  );
  const grouped = useMemo(
    () => groupTasksByStatus(filtered, statuses),
    [filtered, statuses],
  );

  async function handleDrop(statusName: string, taskId: number) {
    if (!canWrite) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.statusName === statusName) return;
    try {
      await taskApi.updateStatus(workspaceSlug, projectSlug, taskId, statusName);
      onTasksChanged();
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không đổi trạng thái");
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-1 flex-col bg-[#f6f7f9] p-6">
      {error && <ErrorAlert message={error} className="mb-4" />}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((col) => {
          const columnTasks = grouped.get(col.statusName) ?? [];
          return (
            <div
              key={col.id}
              className="flex w-72 shrink-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = draggingId ?? Number(e.dataTransfer.getData("taskId"));
                if (id) void handleDrop(col.statusName, id);
                setDraggingId(null);
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                <span className="text-sm font-semibold text-slate-800">{col.statusName}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: col.colorCode ?? "#94a3b8" }}
                >
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex min-h-[200px] flex-1 flex-col gap-2 p-2">
                {columnTasks.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">Chưa có task</p>
                ) : (
                  columnTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      draggable={canWrite}
                      onDragStart={(e) => {
                        setDraggingId(task.id);
                        e.dataTransfer.setData("taskId", String(task.id));
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => setDetailTaskId(task.id)}
                      className={`rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-brand-300 hover:shadow ${
                        draggingId === task.id ? "opacity-50" : ""
                      }`}
                    >
                      <p className="text-xs font-medium text-slate-500">{task.taskKey}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{task.title}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: priorityColor(task.priority) }}
                          title={task.priority}
                        />
                        <TaskAssigneeAvatars assignees={task.assignees} max={2} />
                      </div>
                      {task.deadline && (
                        <p
                          className={`mt-1 text-[11px] ${
                            task.overdue ? "font-medium text-red-600" : "text-slate-500"
                          }`}
                        >
                          {formatDeadline(task.deadline)}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
              {canWrite && (
                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateDefaultStatus(col.statusName);
                      setShowCreate(true);
                    }}
                    className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreate && (
        <TaskCreateModal
          workspaceSlug={workspaceSlug}
          projectSlug={projectSlug}
          members={members}
          statuses={statuses}
          defaultStatusName={createDefaultStatus}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            onTasksChanged();
            load();
          }}
        />
      )}

      {detailTaskId != null && (
        <TaskDetailModal
          workspaceSlug={workspaceSlug}
          projectSlug={projectSlug}
          taskId={detailTaskId}
          members={members}
          statuses={statuses}
          canWrite={canWrite}
          canDelete={canDelete}
          onClose={() => setDetailTaskId(null)}
          onUpdated={() => {
            onTasksChanged();
            load();
          }}
          onDeleted={() => {
            onTasksChanged();
            setDetailTaskId(null);
            load();
          }}
        />
      )}
    </div>
  );
}
