import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  ChevronRight,
  Columns3,
  GripVertical,
  Plus,
  RefreshCw,
} from "lucide-react";
import type { ProjectMember } from "../../types";
import { taskApi } from "@/features/task/api/taskApi";
import { TaskCreateModal } from "@/features/task/components/TaskCreateModal";
import { TaskDetailModal } from "@/features/task/components/TaskDetailModal";
import { TaskInlineAssignee } from "@/features/task/components/TaskInlineAssignee";
import { TaskInlineReporter } from "@/features/task/components/TaskInlineReporter";
import { TaskListPersonCell } from "@/features/task/components/TaskListPersonCell";
import { TaskListRowMenu } from "@/features/task/components/TaskListRowMenu";
import { TaskPriorityMenu } from "@/features/task/components/TaskPriorityMenu";
import { TaskStatusPillSelect } from "@/features/task/components/TaskStatusPillSelect";
import type { TaskStatus, TaskSummary } from "@/features/task/types";
import {
  filterTasksByQuery,
  formatTaskDueDate,
  formatTaskListDateTime,
  isDoneStatus,
  sortTasksForListView,
  taskResolution,
  type TaskListSortDir,
  type TaskListSortKey,
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

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: TaskListSortDir;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-0.5 normal-case hover:text-[#172B4D]"
    >
      {label}
      {active &&
        (dir === "desc" ? (
          <ArrowDown className="h-3 w-3" aria-hidden />
        ) : (
          <ArrowUp className="h-3 w-3" aria-hidden />
        ))}
    </button>
  );
}

export function ProjectListTab({
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
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<TaskListSortKey>("created");
  const [sortDir, setSortDir] = useState<TaskListSortDir>("desc");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskList, statusList] = await Promise.all([
        taskApi.listByProject(workspaceSlug, projectSlug),
        taskApi.listStatuses(workspaceSlug, projectSlug),
      ]);
      setTasks(taskList);
      setStatuses(statusList);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được công việc");
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, projectSlug]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const rows = useMemo(() => {
    const filtered = filterTasksByQuery(tasks, searchQuery);
    return sortTasksForListView(filtered, statuses, sortKey, sortDir);
  }, [tasks, searchQuery, statuses, sortKey, sortDir]);

  const allSelected = rows.length > 0 && rows.every((t) => selectedIds.has(t.id));

  function toggleSort(key: TaskListSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "created" || key === "updated" ? "desc" : "asc");
    }
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((t) => t.id)));
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

  async function handleReporterUpdated() {
    onTasksChanged();
    await load();
  }

  async function handlePriorityChange(taskId: number, priority: string) {
    if (!canWrite) return;
    try {
      await taskApi.update(workspaceSlug, projectSlug, taskId, { priority });
      onTasksChanged();
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không đổi độ ưu tiên");
    }
  }

  async function handleDeleteTask(task: TaskSummary) {
    if (!canDelete) return;
    if (!confirm(`Xóa công việc "${task.taskKey}"?`)) return;
    try {
      await taskApi.delete(workspaceSlug, projectSlug, task.id);
      onTasksChanged();
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không xóa được công việc");
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-1 flex-col bg-white">
      {error && (
        <div className="px-6 pt-3">
          <ErrorAlert message={error} />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[1400px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-[#DFE1E6] bg-[#F4F5F7]">
            <tr className="text-[11px] font-semibold tracking-wide text-[#44546F]">
              <th className="w-8 px-2 py-2" aria-hidden />
              <th className="w-10 px-2 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-[#DFE1E6]"
                  aria-label="Chọn tất cả"
                />
              </th>
              <th className="min-w-[240px] px-3 py-2 font-semibold normal-case text-[#44546F]">
                Công việc
              </th>
              <th className="w-[180px] px-3 py-2">Người thực hiện</th>
              <th className="w-[160px] px-3 py-2">Người báo cáo</th>
              <th className="w-[130px] px-3 py-2">Độ ưu tiên</th>
              <th className="w-[140px] px-3 py-2">Trạng thái</th>
              <th className="w-[100px] px-3 py-2">Kết quả</th>
              <th className="w-[180px] px-3 py-2">
                <SortHeader
                  label="Ngày tạo"
                  active={sortKey === "created"}
                  dir={sortDir}
                  onClick={() => toggleSort("created")}
                />
              </th>
              <th className="w-[180px] px-3 py-2">
                <SortHeader
                  label="Cập nhật"
                  active={sortKey === "updated"}
                  dir={sortDir}
                  onClick={() => toggleSort("updated")}
                />
              </th>
              <th className="w-[120px] px-3 py-2">Hạn chót</th>
              <th className="w-10 px-2 py-2">
                <Columns3 className="h-4 w-4 text-[#6B778C]" aria-hidden />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-16 text-center text-sm text-[#6B778C]">
                  {searchQuery.trim()
                    ? "Không có công việc khớp tìm kiếm."
                    : "Chưa có công việc trong dự án."}
                </td>
              </tr>
            ) : (
              rows.map((task) => (
                <TaskListRow
                  key={task.id}
                  task={task}
                  statuses={statuses}
                  members={members}
                  workspaceSlug={workspaceSlug}
                  projectSlug={projectSlug}
                  canWrite={canWrite}
                  canDelete={canDelete}
                  selected={selectedIds.has(task.id)}
                  onToggleSelect={() => toggleSelect(task.id)}
                  onOpen={() => setDetailTaskId(task.id)}
                  onDelete={() => void handleDeleteTask(task)}
                  onStatusChange={(name) => handleStatusChange(task.id, name)}
                  onPriorityChange={(p) => handlePriorityChange(task.id, p)}
                  onAssigneesUpdated={load}
                  onReporterUpdated={handleReporterUpdated}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-[#DFE1E6] bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          {canWrite && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1.5 text-sm font-medium text-[#0052CC] hover:bg-[#091e420a]"
            >
              <Plus className="h-4 w-4" />
              Tạo
            </button>
          )}
          {selectedIds.size > 0 && (
            <span className="text-xs text-[#6B778C]">
              Đã chọn {selectedIds.size} mục
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B778C]">
          <span>
            {rows.length} / {tasks.length}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded p-1 hover:bg-[#091e420a]"
            title="Làm mới"
            aria-label="Làm mới danh sách"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>

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

function TaskListRow({
  task,
  statuses,
  members,
  workspaceSlug,
  projectSlug,
  canWrite,
  canDelete,
  selected,
  onToggleSelect,
  onOpen,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onAssigneesUpdated,
  onReporterUpdated,
}: {
  task: TaskSummary;
  statuses: TaskStatus[];
  members: ProjectMember[];
  workspaceSlug: string;
  projectSlug: string;
  canWrite: boolean;
  canDelete: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
  onStatusChange: (statusName: string) => void;
  onPriorityChange: (priority: string) => void;
  onAssigneesUpdated: () => void | Promise<void>;
  onReporterUpdated: () => void | Promise<void>;
}) {
  const done = isDoneStatus(task.statusName);
  const primary = task.assignees[0];

  return (
    <tr className="group border-b border-[#EBECF0] transition hover:bg-[#F4F5F7]/60">
      <td className="px-2 py-1.5 align-middle">
        <GripVertical
          className="h-4 w-4 cursor-grab text-[#C1C7D0] opacity-0 transition group-hover:opacity-100"
          aria-hidden
        />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-[#DFE1E6]"
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-3 py-1.5 align-middle">
        <div className="flex min-w-0 items-center gap-1">
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[#C1C7D0] opacity-40"
            aria-hidden
          />
          <CheckSquare
            className="h-4 w-4 shrink-0 text-[#2684FF]"
            strokeWidth={2}
            aria-hidden
          />
          <button
            type="button"
            onClick={onOpen}
            className={`min-w-0 flex-1 text-left text-sm leading-snug ${
              done ? "text-[#6B778C] line-through" : "text-[#172B4D]"
            }`}
          >
            <span className="font-normal text-[#0052CC] hover:underline">
              {task.taskKey}
            </span>{" "}
            <span className={done ? "line-through" : ""}>{task.title}</span>
            {task.overdue && !done && (
              <span className="ml-2 text-xs font-medium text-[#DE350B]">Quá hạn</span>
            )}
          </button>
        </div>
      </td>
      <td className="px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
        {canWrite ? (
          <div className="flex items-center gap-2">
            <TaskInlineAssignee
              workspaceSlug={workspaceSlug}
              projectSlug={projectSlug}
              taskId={task.id}
              assignees={task.assignees}
              members={members}
              canWrite={canWrite}
              onUpdated={onAssigneesUpdated}
            />
            {primary ? (
              <span className="truncate text-sm text-[#172B4D]">{primary.username}</span>
            ) : (
              <span className="text-sm text-[#6B778C]">Chưa gán</span>
            )}
          </div>
        ) : primary ? (
          <TaskListPersonCell
            userId={primary.userId}
            username={primary.username}
            emptyLabel="Chưa gán"
          />
        ) : (
          <TaskListPersonCell userId={0} username="" emptyLabel="Chưa gán" />
        )}
      </td>
      <td className="px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
        <TaskInlineReporter
          workspaceSlug={workspaceSlug}
          projectSlug={projectSlug}
          taskId={task.id}
          reporterUserId={task.reporterUserId}
          reporterUsername={task.reporterUsername}
          members={members}
          canWrite={canWrite}
          onUpdated={onReporterUpdated}
        />
      </td>
      <td className="px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
        <TaskPriorityMenu
          value={task.priorityName}
          variant="inline"
          disabled={!canWrite}
          onChange={onPriorityChange}
        />
      </td>
      <td className="px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
        <TaskStatusPillSelect
          statusName={task.statusName}
          statuses={statuses}
          disabled={!canWrite}
          onChange={onStatusChange}
        />
      </td>
      <td className="px-3 py-1.5 align-middle text-sm text-[#172B4D]">
        {taskResolution(task.statusName)}
      </td>
      <td className="whitespace-nowrap px-3 py-1.5 align-middle text-sm text-[#172B4D]">
        {formatTaskListDateTime(task.createdAt)}
      </td>
      <td className="whitespace-nowrap px-3 py-1.5 align-middle text-sm text-[#172B4D]">
        {formatTaskListDateTime(task.updatedAt)}
      </td>
      <td
        className={`px-3 py-1.5 align-middle text-sm ${
          task.overdue && task.deadline ? "font-medium text-[#DE350B]" : "text-[#172B4D]"
        }`}
      >
        {formatTaskDueDate(task.deadline)}
      </td>
      <td className="px-2 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
        <TaskListRowMenu
          onOpen={onOpen}
          onDelete={canDelete ? onDelete : undefined}
        />
      </td>
    </tr>
  );
}
