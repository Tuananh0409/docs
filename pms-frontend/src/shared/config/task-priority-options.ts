/** Fallback khi chưa load API — khớp seed task_priorities (V9 + V10). */
export const TASK_PRIORITY_OPTIONS = [
  { name: "Highest", color: "#E54937", weight: 5 },
  { name: "High", color: "#E54937", weight: 4 },
  { name: "Medium", color: "#E97F33", weight: 3 },
  { name: "Low", color: "#4C9AFF", weight: 2 },
  { name: "Lowest", color: "#4C9AFF", weight: 1 },
] as const;

export const DEFAULT_TASK_PRIORITY = "Medium";

export type TaskPriorityName = (typeof TASK_PRIORITY_OPTIONS)[number]["name"];

export function getTaskPriorityOption(name: string | null | undefined) {
  return TASK_PRIORITY_OPTIONS.find(
    (p) => p.name.toLowerCase() === name?.toLowerCase(),
  );
}

export function taskPriorityColor(name: string | null | undefined, colorCode?: string | null) {
  if (colorCode) return colorCode;
  return getTaskPriorityOption(name)?.color ?? "#6B778C";
}

/** Nhãn hiển thị tiếng Việt (giá trị API vẫn là tên tiếng Anh). */
export const TASK_PRIORITY_LABELS: Record<TaskPriorityName, string> = {
  Highest: "Cao nhất",
  High: "Cao",
  Medium: "Trung bình",
  Low: "Thấp",
  Lowest: "Thấp nhất",
};

export function taskPriorityLabel(name: string | null | undefined): string {
  const opt = getTaskPriorityOption(name);
  if (opt) return TASK_PRIORITY_LABELS[opt.name];
  return name ?? "";
}
