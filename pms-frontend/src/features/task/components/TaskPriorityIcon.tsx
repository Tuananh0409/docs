import { taskPriorityLabel } from "@/shared/config/task-priority-options";
import {
  normalizeTaskPriority,
  priorityColor,
  type TaskPriorityName,
} from "../utils/taskUi";
import type { TaskPriorityOption } from "../hooks/useTaskPriorities";

type Size = "xs" | "sm" | "md";

const SIZE_PX: Record<Size, number> = { xs: 14, sm: 17, md: 20 };

type Props = {
  priority: string;
  size?: Size;
  className?: string;
  showLabel?: boolean;
  compactLabel?: boolean;
  colorCode?: string | null;
  options?: TaskPriorityOption[];
};

function IconSvg({ priority, px }: { priority: TaskPriorityName; px: number }) {
  const stroke = 1.25;
  const common = {
    width: px,
    height: px,
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  if (priority === "Highest") {
    return (
      <svg {...common}>
        <path
          d="M4 7.5L8 4l4 3.5"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 11.5L8 8l4 3.5"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (priority === "High") {
    return (
      <svg {...common}>
        <path
          d="M3.5 10.5L8 5.5l4.5 5"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (priority === "Medium") {
    return (
      <svg {...common}>
        <path
          d="M4 6h8"
          stroke="currentColor"
          strokeWidth={stroke + 0.15}
          strokeLinecap="round"
        />
        <path
          d="M4 10h8"
          stroke="currentColor"
          strokeWidth={stroke + 0.15}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (priority === "Lowest") {
    return (
      <svg {...common}>
        <path
          d="M4 4.5L8 8l4-3.5"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 8.5L8 12l4-3.5"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Low
  return (
    <svg {...common}>
      <path
        d="M3.5 5.5L8 10.5l4.5-5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TaskPriorityIcon({
  priority,
  size = "sm",
  className = "",
  showLabel = false,
  compactLabel = false,
  colorCode,
  options,
}: Props) {
  const px = SIZE_PX[size];
  const label = normalizeTaskPriority(priority, options);
  const color = priorityColor(priority, options, colorCode);

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 ${className}`}
      style={{ color }}
      title={taskPriorityLabel(label)}
    >
      <IconSvg priority={label} px={px} />
      {showLabel && (
        <span
          className={`font-normal leading-none text-[#42526E] ${
            compactLabel ? "text-xs" : "text-sm"
          }`}
        >
          {taskPriorityLabel(label)}
        </span>
      )}
    </span>
  );
}
