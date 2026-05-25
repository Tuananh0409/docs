import type { TaskStatus, TaskSummary } from "../types";
import {
  DEFAULT_TASK_PRIORITY,
  TASK_PRIORITY_OPTIONS,
  taskPriorityColor,
  type TaskPriorityName,
} from "@/shared/config/task-priority-options";
import type { TaskPriorityOption } from "../hooks/useTaskPriorities";

export { DEFAULT_TASK_PRIORITY };
export type { TaskPriorityName };

/** Thứ tự dropdown (cao → thấp) — ưu tiên danh sách từ API. */
export function sortTaskPriorities(options: TaskPriorityOption[]): TaskPriorityOption[] {
  return [...options].sort((a, b) => b.weight - a.weight);
}

export function priorityNames(options: TaskPriorityOption[]): TaskPriorityName[] {
  return sortTaskPriorities(options).map((p) => p.name);
}

export function normalizeTaskPriority(
  priority: string | null | undefined,
  options: readonly { name: string }[] = TASK_PRIORITY_OPTIONS,
): TaskPriorityName {
  const raw = (priority ?? "").trim().toLowerCase();
  if (raw === "lowest") return "Lowest";
  if (raw === "urgent" || raw === "highest") return "Highest";
  if (raw === "high") return "High";
  if (raw === "medium") return "Medium";
  if (raw === "low") return "Low";
  const hit = options.find((p) => p.name.toLowerCase() === raw);
  return (hit?.name as TaskPriorityName) ?? DEFAULT_TASK_PRIORITY;
}

export function priorityColor(
  priority: string | null | undefined,
  options?: TaskPriorityOption[],
  colorCode?: string | null,
): string {
  if (colorCode) return colorCode;
  const name = normalizeTaskPriority(priority, options ?? TASK_PRIORITY_OPTIONS);
  const list = options ?? TASK_PRIORITY_OPTIONS;
  const opt = list.find((p) => p.name.toLowerCase() === name.toLowerCase());
  const code =
    opt && "colorCode" in opt
      ? opt.colorCode
      : opt && "color" in opt
        ? (opt as { color: string }).color
        : null;
  return taskPriorityColor(name, code);
}

export function taskPriorityName(task: { priorityName?: string | null }): string {
  return task.priorityName ?? DEFAULT_TASK_PRIORITY;
}

export function priorityMenuItemClass(selected: boolean, compact = false): string {
  const base = compact
    ? "relative flex w-full min-w-0 items-center gap-2 whitespace-nowrap py-1.5 text-left text-xs text-[#42526E]"
    : "relative flex w-full min-w-0 items-center gap-2.5 whitespace-nowrap py-2 text-left text-sm text-[#42526E]";
  const pad = selected
    ? "border-l-[3px] border-l-[#0052CC] bg-[#F4F5F7] pl-2.5"
    : "border-l-[3px] border-l-transparent pl-2.5";
  return `${base} ${pad} hover:bg-[#F4F5F7]`;
}

export function formatDeadline(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function countByStatus(tasks: TaskSummary[], statusName: string): number {
  return tasks.filter(
    (t) => t.statusName?.toLowerCase() === statusName.toLowerCase(),
  ).length;
}

export function groupTasksByStatus(
  tasks: TaskSummary[],
  statuses: TaskStatus[],
): Map<string, TaskSummary[]> {
  const map = new Map<string, TaskSummary[]>();
  for (const s of statuses) {
    map.set(s.statusName, []);
  }
  for (const task of tasks) {
    const key = task.statusName ?? "Todo";
    const list = map.get(key) ?? [];
    list.push(task);
    map.set(key, list);
  }
  return map;
}

export function filterTasksByQuery(tasks: TaskSummary[], query: string): TaskSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) => t.title.toLowerCase().includes(q) || t.taskKey.toLowerCase().includes(q),
  );
}

export function isDoneStatus(statusName: string | null | undefined): boolean {
  return (statusName ?? "").trim().toLowerCase() === "done";
}

export function taskResolution(statusName: string | null | undefined): string {
  return isDoneStatus(statusName) ? "Hoàn thành" : "Chưa xử lý";
}

/** Ngày kiểu Jira list: «22 May 2026». */
export function formatTaskListDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Ngày + giờ cho bảng danh sách (vi-VN). */
export function formatTaskListDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatTaskDueDate(iso: string | null | undefined): string {
  if (!iso) return "Không có";
  return formatTaskListDate(iso);
}

export type TaskListSortKey = "created" | "updated" | "status";
export type TaskListSortDir = "asc" | "desc";

export function sortTasksForListView(
  tasks: TaskSummary[],
  statuses: TaskStatus[],
  sortKey: TaskListSortKey,
  sortDir: TaskListSortDir,
): TaskSummary[] {
  const statusOrder = new Map(
    statuses.map((s, i) => [s.statusName.toLowerCase(), i]),
  );
  const mul = sortDir === "asc" ? 1 : -1;

  return [...tasks].sort((a, b) => {
    if (sortKey === "created") {
      return (
        mul *
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      );
    }
    if (sortKey === "updated") {
      return (
        mul *
        (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      );
    }
    const sa = statusOrder.get((a.statusName ?? "").toLowerCase()) ?? 999;
    const sb = statusOrder.get((b.statusName ?? "").toLowerCase()) ?? 999;
    if (sa !== sb) return mul * (sa - sb);
    return a.taskKey.localeCompare(b.taskKey);
  });
}

export function statusColorForTask(
  statusName: string | null | undefined,
  statuses: TaskStatus[],
): string {
  const s = statuses.find(
    (x) => x.statusName.toLowerCase() === (statusName ?? "").toLowerCase(),
  );
  return s?.colorCode ?? "#42526E";
}

/** Sắp xếp theo thứ tự cột Kanban rồi mã task. */
export function sortTasksForList(
  tasks: TaskSummary[],
  statuses: TaskStatus[],
): TaskSummary[] {
  const order = new Map(statuses.map((s, i) => [s.statusName.toLowerCase(), i]));
  return [...tasks].sort((a, b) => {
    const sa = order.get((a.statusName ?? "").toLowerCase()) ?? 999;
    const sb = order.get((b.statusName ?? "").toLowerCase()) ?? 999;
    if (sa !== sb) return sa - sb;
    return a.taskKey.localeCompare(b.taskKey);
  });
}

/** Đổi thứ tự cột Kanban (kéo cột A thả vào vị trí cột B). */
export function reorderStatusesList<T extends { id: number }>(
  list: T[],
  fromId: number,
  toId: number,
): T[] {
  const fromIdx = list.findIndex((c) => c.id === fromId);
  const toIdx = list.findIndex((c) => c.id === toId);
  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return list;
  const next = [...list];
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next;
}
