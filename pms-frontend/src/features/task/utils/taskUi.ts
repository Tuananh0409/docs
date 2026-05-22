import type { TaskStatus, TaskSummary } from "../types";

export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;

export function priorityColor(priority: string): string {
  switch (priority) {
    case "Urgent":
      return "#ef4444";
    case "High":
      return "#f97316";
    case "Low":
      return "#94a3b8";
    default:
      return "#eab308";
  }
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
