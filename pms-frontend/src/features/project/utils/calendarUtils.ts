import type { TaskSummary } from "@/features/task/types";

export type CalendarDay = {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
};

export type CalendarWeek = CalendarDay[];

const DAY_MS = 86_400_000;

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Thứ Hai = đầu tuần. */
export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function buildMonthGrid(year: number, month: number): CalendarWeek[] {
  const first = new Date(year, month, 1);
  const gridStart = startOfWeekMonday(first);
  const weeks: CalendarWeek[] = [];

  let cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(cursor),
        iso: toIsoDate(cursor),
        inCurrentMonth: cursor.getMonth() === month,
      });
      cursor = new Date(cursor.getTime() + DAY_MS);
    }
    weeks.push(week);
    if (w >= 4 && cursor.getMonth() !== month && cursor.getDate() <= 7) {
      break;
    }
  }
  return weeks;
}

export function formatCalendarMonth(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

export function isToday(iso: string): boolean {
  return iso === toIsoDate(new Date());
}

export function deadlineDayKey(deadline: string | null | undefined): string | null {
  if (!deadline) return null;
  return deadline.slice(0, 10);
}

export function groupTasksByDeadline(tasks: TaskSummary[]): Map<string, TaskSummary[]> {
  const map = new Map<string, TaskSummary[]>();
  for (const task of tasks) {
    const key = deadlineDayKey(task.deadline);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(task);
    map.set(key, list);
  }
  return map;
}

export const CALENDAR_WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
