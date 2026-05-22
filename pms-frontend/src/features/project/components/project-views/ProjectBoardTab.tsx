import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ProjectMember } from "../../types";
import { taskApi } from "@/features/task/api/taskApi";
import {
  BoardColumnQuickCreate,
  type QuickCreateInput,
} from "@/features/task/components/BoardColumnQuickCreate";
import { TaskDetailModal } from "@/features/task/components/TaskDetailModal";
import { TaskPriorityAssigneeRow } from "@/features/task/components/TaskInlineAssignee";
import { TaskPriorityIcon } from "@/features/task/components/TaskPriorityIcon";
import type { TaskDetail, TaskStatus, TaskSummary } from "@/features/task/types";
import {
  filterTasksByQuery,
  formatDeadline,
  groupTasksByStatus,
} from "@/features/task/utils/taskUi";
import { ApiClientError } from "@/shared/api/client";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { useToast } from "@/shared/context/ToastContext";

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
  const toast = useToast();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  function notifyTaskCreated(created: TaskDetail) {
    toast.success(`Đã tạo công việc '${created.taskKey}'.`, [
      {
        label: "Xem",
        onClick: () => setDetailTaskId(created.id),
      },
      {
        label: "Sao chép liên kết",
        onClick: () => {
          const text = `${created.taskKey}: ${created.title}`;
          void navigator.clipboard.writeText(text);
          toast.info("Đã sao chép mã công việc");
        },
      },
    ]);
  }

  async function handleQuickCreate(statusName: string, input: QuickCreateInput) {
    try {
      const created = await taskApi.create(workspaceSlug, projectSlug, {
        title: input.title,
        statusName,
        priority: input.priority ?? "Medium",
        deadline: input.deadline,
        assigneeUserIds: input.assigneeUserIds,
      });
      onTasksChanged();
      await load();
      notifyTaskCreated(created);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Không tạo được task";
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }

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
    <div className="flex min-h-0 flex-1 flex-col bg-[#f0f1f4] p-2">
      {error && <ErrorAlert message={error} className="mb-2" />}

      <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto pb-1.5">
        {statuses.map((col) => {
          const columnTasks = grouped.get(col.statusName) ?? [];
          const isDone = col.statusName.toLowerCase() === "done";
          const accent = col.colorCode ?? "#94a3b8";

          return (
            <div
              key={col.id}
              className="flex w-[228px] shrink-0 flex-col"
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
              <section
                className="flex max-h-full min-h-[260px] flex-col overflow-hidden rounded-md border border-slate-200 bg-[#f8f9fb] shadow-sm"
                style={{ boxShadow: `inset 0 2px 0 0 ${accent}` }}
              >
                <header className="flex shrink-0 items-center justify-between gap-1.5 px-2 py-1">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {col.statusName}
                  </h3>
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-semibold text-slate-600">
                    {columnTasks.length}
                  </span>
                </header>

                <div className="flex min-h-[100px] flex-1 flex-col gap-1 overflow-y-auto px-1.5 pb-0.5">
                {columnTasks.map((task) => (
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
                    className={[
                      "rounded border border-slate-200/90 bg-white p-1.5 text-left shadow-sm transition",
                      "hover:border-slate-300",
                      draggingId === task.id ? "opacity-50" : "",
                    ].join(" ")}
                  >
                    <p className="text-xs font-medium leading-snug text-slate-800">{task.title}</p>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <CheckSquareIcon />
                        <span className="font-mono text-[10px] text-slate-500">{task.taskKey}</span>
                      </div>
                      <TaskPriorityAssigneeRow
                        workspaceSlug={workspaceSlug}
                        projectSlug={projectSlug}
                        taskId={task.id}
                        assignees={task.assignees}
                        members={members}
                        canWrite={canWrite}
                        onUpdated={load}
                        priority={
                          <TaskPriorityIcon
                            priority={task.priorityName}
                            colorCode={task.priorityColorCode}
                            size="xs"
                          />
                        }
                      />
                    </div>
                    {task.deadline && (
                      <p
                        className={`mt-1 text-[10px] ${
                          task.overdue ? "font-medium text-red-600" : "text-slate-500"
                        }`}
                      >
                        {formatDeadline(task.deadline)}
                      </p>
                    )}
                  </button>
                ))}

                {isDone && columnTasks.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-white/80 px-2 py-4 text-center">
                    <Search className="h-3.5 w-3.5 text-slate-300" />
                    <p className="mt-1 text-[10px] leading-tight text-slate-400">
                      Xem công việc đã hoàn thành
                    </p>
                  </div>
                )}
                </div>

                {canWrite && (
                  <footer className="shrink-0 px-1.5 pb-1.5 pt-0">
                    <BoardColumnQuickCreate
                      statusName={col.statusName}
                      members={members}
                      onCreate={(data) => handleQuickCreate(col.statusName, data)}
                    />
                  </footer>
                )}
              </section>
            </div>
          );
        })}
      </div>

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

function CheckSquareIcon() {
  return (
    <span className="flex h-3 w-3 items-center justify-center rounded-sm bg-brand-600 text-white">
      <svg className="h-1.5 w-1.5" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <path d="M10 3L5 8.5 2 6l1-1 2 2 4-4 1 0z" />
      </svg>
    </span>
  );
}
