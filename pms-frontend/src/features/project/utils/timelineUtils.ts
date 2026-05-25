import type { ProjectDetail } from "../types";
import type { TaskSummary } from "@/features/task/types";

const DAY_MS = 86_400_000;

export type TimelineZoom = "week" | "month";

export const ZOOM_DAY_WIDTH: Record<TimelineZoom, number> = {
  week: 28,
  month: 10,
};

export type TimelineBar = {
  id: string;
  kind: "project" | "task";
  label: string;
  subLabel?: string;
  task?: TaskSummary;
  start: Date;
  end: Date;
  color: string;
};

export function parseDay(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const part = iso.slice(0, 10);
  const [y, m, d] = part.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.max(0, Math.round(ms / DAY_MS));
}

export function taskBarSpan(task: TaskSummary): { start: Date; end: Date } {
  const created = parseDay(task.createdAt) ?? new Date();
  const start = startOfDay(parseDay(task.startDate) ?? created);
  let end = parseDay(task.deadline) ? startOfDay(parseDay(task.deadline)!) : start;
  if (end.getTime() < start.getTime()) end = start;
  return { start, end };
}

export function formatDayIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function deadlineIsoFromDay(d: Date): string {
  return `${formatDayIso(d)}T23:59:59Z`;
}

export function startIsoFromDay(d: Date): string {
  return `${formatDayIso(d)}T00:00:00Z`;
}

export function buildTimelineBars(
  project: ProjectDetail,
  tasks: TaskSummary[],
): TimelineBar[] {
  const rows: TimelineBar[] = [];
  const pStart = parseDay(project.startDate);
  const pEnd = parseDay(project.endDate);
  if (pStart && pEnd && pEnd >= pStart) {
    rows.push({
      id: "project",
      kind: "project",
      label: project.name,
      subLabel: "Dự án",
      start: pStart,
      end: pEnd,
      color: project.colorCode ?? "#6554C0",
    });
  }

  const taskRows = tasks.map((task) => {
    const { start, end } = taskBarSpan(task);
    return {
      id: `task-${task.id}`,
      kind: "task" as const,
      label: task.title,
      subLabel: task.taskKey,
      task,
      start,
      end,
      color: task.statusColorCode ?? "#2684FF",
    };
  });
  taskRows.sort((a, b) => a.start.getTime() - b.start.getTime());
  rows.push(...taskRows);
  return rows;
}

export function computeTimelineRange(
  project: ProjectDetail,
  bars: TimelineBar[],
  paddingDays = 14,
): { start: Date; end: Date; totalDays: number } {
  const today = startOfDay(new Date());
  let start = addDays(today, -paddingDays);
  let end = addDays(today, paddingDays * 2);

  for (const b of bars) {
    if (b.start < start) start = startOfDay(b.start);
    if (b.end > end) end = startOfDay(b.end);
  }

  const pStart = parseDay(project.startDate);
  const pEnd = parseDay(project.endDate);
  if (pStart && pStart < start) start = pStart;
  if (pEnd && pEnd > end) end = pEnd;

  end = addDays(end, paddingDays);
  const totalDays = daysBetween(start, end) + 1;
  return { start, end, totalDays };
}

export function dayOffset(rangeStart: Date, day: Date): number {
  return daysBetween(rangeStart, day);
}

export function formatWeekLabel(d: Date): string {
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

/** Cột header theo khối 7 ngày. */
export function buildWeekColumns(
  rangeStart: Date,
  totalDays: number,
  dayWidth: number,
): { key: string; label: string; left: number; width: number }[] {
  const cols: { key: string; label: string; left: number; width: number }[] = [];
  for (let i = 0; i < totalDays; i += 7) {
    const span = Math.min(7, totalDays - i);
    const d = addDays(rangeStart, i);
    cols.push({
      key: `w-${i}`,
      label: formatWeekLabel(d),
      left: i * dayWidth,
      width: span * dayWidth,
    });
  }
  return cols;
}

export function todayOffset(rangeStart: Date, totalDays: number): number | null {
  const off = dayOffset(rangeStart, new Date());
  if (off < 0 || off > totalDays) return null;
  return off;
}
