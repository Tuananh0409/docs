/** Khớp project_status (seed V2). */
export const PROJECT_STATUS_OPTIONS = [
  { name: "Active", color: "#22C55E" },
  { name: "On Hold", color: "#F59E0B" },
  { name: "Completed", color: "#3B82F6" },
  { name: "Archived", color: "#6B7280" },
] as const;

export const PROJECT_STATUS_NAMES = PROJECT_STATUS_OPTIONS.map((s) => s.name);

export function statusColor(name: string | null | undefined): string {
  return (
    PROJECT_STATUS_OPTIONS.find((s) => s.name.toLowerCase() === name?.toLowerCase())?.color ??
    "#94A3B8"
  );
}

/** Khớp bảng project_priorities (seed V2) — weight cao = ưu tiên hơn. */
export const PROJECT_PRIORITY_OPTIONS = [
  { name: "Urgent", color: "#EF4444", weight: 4 },
  { name: "High", color: "#F97316", weight: 3 },
  { name: "Medium", color: "#EAB308", weight: 2 },
  { name: "Low", color: "#94A3B8", weight: 1 },
] as const;

export const DEFAULT_PROJECT_PRIORITY = "Medium";

export function priorityColor(name: string | null | undefined): string {
  return getPriorityOption(name)?.color ?? "#94A3B8";
}

export function getPriorityOption(name: string | null | undefined) {
  return PROJECT_PRIORITY_OPTIONS.find(
    (p) => p.name.toLowerCase() === name?.toLowerCase(),
  );
}

/** Gắn priority vào object dự án khi API chưa trả đủ field. */
export function applyPriorityFields<
  T extends {
    priorityName?: string | null;
    priorityColorCode?: string | null;
    priorityWeight?: number | null;
  },
>(project: T, priorityName: string): T {
  const opt = getPriorityOption(priorityName);
  return {
    ...project,
    priorityName,
    priorityColorCode: opt?.color ?? project.priorityColorCode ?? null,
    priorityWeight: opt?.weight ?? project.priorityWeight ?? null,
  };
}

/** Urgent / High — cần nhìn thấy ngay trên sidebar. */
export function isElevatedPriority(name: string | null | undefined): boolean {
  const weight = getPriorityOption(name)?.weight ?? 0;
  return weight >= 3;
}

/** Nhãn ngắn tiếng Việt cho sidebar. */
export const PRIORITY_SIDEBAR_LABEL: Record<string, string> = {
  Urgent: "Khẩn",
  High: "Cao",
  Medium: "TB",
  Low: "Thấp",
};

export { WORKSPACE_COLOR_PRESETS as PROJECT_COLOR_PRESETS } from "./workspace-options";
export { WORKSPACE_PRIVACY_OPTIONS as PROJECT_PRIVACY_OPTIONS } from "./workspace-options";
