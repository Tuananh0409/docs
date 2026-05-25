import { CheckSquare, Clock } from "lucide-react";
import { isDoneStatus } from "../utils/taskUi";
import type { TaskSummary } from "../types";

function avatarBg(userId: number): string {
  const hues = [174, 199, 221, 262, 291, 24, 142];
  return `hsl(${hues[userId % hues.length]} 55% 42%)`;
}

function initials(username: string): string {
  return username
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  task: TaskSummary;
  onOpen: () => void;
};

export function CalendarTaskChip({ task, onOpen }: Props) {
  const done = isDoneStatus(task.statusName);
  const assignee = task.assignees[0];
  const barColor = task.overdue && !done ? "#FFEBE6" : "#F4F5F7";
  const borderColor = task.overdue && !done ? "#E8A0A8" : "#DFE1E6";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      className="flex w-full min-w-0 items-center gap-1 rounded border px-1.5 py-0.5 text-left text-[11px] leading-tight text-[#172B4D] hover:brightness-95"
      style={{ backgroundColor: barColor, borderColor }}
    >
      <CheckSquare
        className={`h-3.5 w-3.5 shrink-0 ${done ? "text-[#36B37E]" : "text-[#2684FF]"}`}
        strokeWidth={2}
      />
      <span className="min-w-0 flex-1 truncate">
        <span className="text-[#0052CC]">{task.taskKey}</span> {task.title}
      </span>
      {task.overdue && !done && (
        <Clock className="h-3 w-3 shrink-0 text-[#DE350B]" strokeWidth={2} aria-hidden />
      )}
      {assignee && (
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold text-white"
          style={{ backgroundColor: avatarBg(assignee.userId) }}
          title={assignee.username}
        >
          {initials(assignee.username)}
        </span>
      )}
    </button>
  );
}
