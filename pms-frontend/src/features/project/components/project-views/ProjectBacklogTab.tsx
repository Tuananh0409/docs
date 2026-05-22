import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Equal,
  GripHorizontal,
  Plus,
  User,
} from "lucide-react";
import type { ProjectDetail, ProjectMember } from "../../types";
import { taskApi } from "@/features/task/api/taskApi";
import { TaskCreateModal } from "@/features/task/components/TaskCreateModal";
import { TaskDetailModal } from "@/features/task/components/TaskDetailModal";
import type { TaskStatus, TaskSummary } from "@/features/task/types";
import {
  countByStatus,
  filterTasksByQuery,
  formatDeadline,
  priorityColor,
} from "@/features/task/utils/taskUi";
import { ApiClientError } from "@/shared/api/client";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { StatusCountPills } from "../project-shell/StatusCountPills";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  project: ProjectDetail;
  members: ProjectMember[];
  canWrite: boolean;
  canDelete: boolean;
  searchQuery: string;
  refreshKey: number;
  onTasksChanged: () => void;
};

export function ProjectBacklogTab({
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
  const [boardOpen, setBoardOpen] = useState(true);
  const [backlogOpen, setBacklogOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

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

  const boardTasks = useMemo(
    () =>
      filtered.filter(
        (t) => t.statusName && t.statusName.toLowerCase() !== "done",
      ),
    [filtered],
  );

  const backlogTasks = useMemo(() => filtered, [filtered]);

  async function handleStatusChange(taskId: number, statusName: string) {
    if (!canWrite) return;
    try {
      await taskApi.updateStatus(workspaceSlug, projectSlug, taskId, statusName);
      onTasksChanged();
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không đổi trạng thái");
    }
  }

  if (loading) return <LoadingState />;

  const statusPills = statuses.map((s) => ({
    label: s.statusName,
    count: countByStatus(filtered, s.statusName),
    color: s.colorCode ?? "#94a3b8",
  }));

  return (
    <div className="flex flex-1 flex-col bg-[#f6f7f9]">
      {error && (
        <div className="px-6 pt-3">
          <ErrorAlert message={error} />
        </div>
      )}

      <section className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => setBoardOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-800"
          >
            {boardOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
            Board
            <span className="font-normal text-slate-500">
              ({boardTasks.length} work items)
            </span>
          </button>
          <StatusCountPills pills={statusPills} />
        </div>
        {boardOpen && (
          <div className="px-6 pb-4">
            {boardTasks.length === 0 ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                <p className="text-sm text-slate-500">Chưa có công việc trên board.</p>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50"
                  >
                    <Plus className="h-4 w-4" />
                    Tạo
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {boardTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    statuses={statuses}
                    canWrite={canWrite}
                    onOpen={() => setDetailTaskId(task.id)}
                    onStatusChange={(name) => handleStatusChange(task.id, name)}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <div className="flex items-center justify-center border-b border-slate-200 bg-white py-1">
        <GripHorizontal className="h-4 w-4 text-slate-300" aria-hidden />
      </div>

      <section className="flex-1 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => setBacklogOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-800"
          >
            {backlogOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
            Backlog
            <span className="font-normal text-slate-500">
              ({backlogTasks.length} work items)
            </span>
          </button>
          <StatusCountPills pills={statusPills} />
        </div>

        {backlogOpen && (
          <div className="px-6 pb-6">
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {backlogTasks.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có task trong backlog.
                </li>
              ) : (
                backlogTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    statuses={statuses}
                    canWrite={canWrite}
                    onOpen={() => setDetailTaskId(task.id)}
                    onStatusChange={(name) => handleStatusChange(task.id, name)}
                  />
                ))
              )}
            </ul>

            {canWrite && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                <Plus className="h-4 w-4" />
                Tạo
              </button>
            )}
          </div>
        )}
      </section>

      {showCreate && (
        <TaskCreateModal
          workspaceSlug={workspaceSlug}
          projectSlug={projectSlug}
          members={members}
          statuses={statuses}
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

function TaskRow({
  task,
  statuses,
  canWrite,
  onOpen,
  onStatusChange,
}: {
  task: TaskSummary;
  statuses: TaskStatus[];
  canWrite: boolean;
  onOpen: () => void;
  onStatusChange: (statusName: string) => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-2.5 transition hover:bg-slate-50/80">
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left text-sm text-slate-800"
      >
        <span className="font-medium text-slate-500">{task.taskKey}</span> {task.title}
        {task.overdue && (
          <span className="ml-2 text-xs font-medium text-red-600">Quá hạn</span>
        )}
      </button>
      <select
        value={task.statusName ?? "Todo"}
        disabled={!canWrite}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
      >
        {statuses.map((s) => (
          <option key={s.id} value={s.statusName}>
            {s.statusName}
          </option>
        ))}
      </select>
      <Equal
        className="h-4 w-4"
        strokeWidth={2.5}
        style={{ color: priorityColor(task.priority) }}
        aria-label={`Ưu tiên ${task.priority}`}
      />
      {task.deadline && (
        <span className="text-xs text-slate-500">{formatDeadline(task.deadline)}</span>
      )}
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        {task.assignees.length > 0 ? (
          <span className="text-[10px] font-semibold">
            {task.assignees[0].username.slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <User className="h-4 w-4" />
        )}
      </span>
    </li>
  );
}
