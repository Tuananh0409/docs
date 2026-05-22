import { priorityMenuItemClass, sortTaskPriorities } from "../utils/taskUi";
import type { TaskPriorityOption } from "../hooks/useTaskPriorities";
import { TaskPriorityIcon } from "./TaskPriorityIcon";

type Props = {
  value: string;
  priorities: TaskPriorityOption[];
  onSelect: (priority: string) => void;
  className?: string;
  compact?: boolean;
};

export function TaskPriorityDropdownList({
  value,
  priorities,
  onSelect,
  className = "",
  compact = false,
}: Props) {
  const sorted = sortTaskPriorities(priorities);

  return (
    <ul
      className={[
        "overflow-hidden rounded bg-white py-1 shadow-[0_4px_8px_-2px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]",
        "border border-[#DFE1E6]",
        className,
      ].join(" ")}
    >
      {sorted.map((p) => {
        const selected = p.name === value;
        return (
          <li key={p.name}>
            <button
              type="button"
              className={priorityMenuItemClass(selected, compact)}
              onClick={() => onSelect(p.name)}
            >
              <TaskPriorityIcon
                priority={p.name}
                size={compact ? "sm" : "md"}
                showLabel
                compactLabel={compact}
                colorCode={p.colorCode}
                options={priorities}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
