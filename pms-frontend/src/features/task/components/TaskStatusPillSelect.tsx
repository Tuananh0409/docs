import { ChevronDown } from "lucide-react";
import type { TaskStatus } from "../types";
import { statusColorForTask } from "../utils/taskUi";

type Props = {
  statusName: string | null;
  statuses: TaskStatus[];
  disabled?: boolean;
  onChange: (statusName: string) => void;
};

export function TaskStatusPillSelect({
  statusName,
  statuses,
  disabled,
  onChange,
}: Props) {
  const label = statusName ?? "Todo";
  const bg = statusColorForTask(statusName, statuses);

  return (
    <div className="relative inline-flex max-w-full">
      <span
        className="inline-flex max-w-full items-center gap-0.5 rounded-[3px] px-2 py-0.5 text-[11px] font-bold uppercase leading-4 text-white"
        style={{ backgroundColor: bg }}
      >
        <span className="truncate">{label}</span>
        {!disabled && (
          <ChevronDown className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2.5} aria-hidden />
        )}
      </span>
      {!disabled && (
        <select
          value={label}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Đổi trạng thái"
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.statusName}>
              {s.statusName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
