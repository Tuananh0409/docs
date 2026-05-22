import type { CSSProperties } from "react";
import {
  getPriorityOption,
  isElevatedPriority,
  PRIORITY_SIDEBAR_LABEL,
  priorityColor,
} from "@/shared/config/project-options";

type Props = {
  name: string | null | undefined;
};

/** Ký hiệu + nhãn ngắn — đặt sát trước tên dự án trên sidebar. */
export function SidebarPriorityMark({ name }: Props) {
  if (!name) return null;

  const opt = getPriorityOption(name);
  if (!opt) return null;

  const label = PRIORITY_SIDEBAR_LABEL[opt.name] ?? opt.name;
  const color = priorityColor(name);
  const elevated = isElevatedPriority(name);

  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5"
      title={`Ưu tiên: ${opt.name}`}
      aria-label={`Ưu tiên ${opt.name}`}
    >
      <span
        className={[
          "rounded-full ring-1 ring-white",
          elevated ? "h-2.5 w-2.5" : "h-2 w-2",
        ].join(" ")}
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className={[
          "rounded px-1 py-px text-[9px] font-bold leading-none",
          elevated ? "text-white shadow-sm" : "font-semibold",
        ].join(" ")}
        style={
          elevated
            ? { backgroundColor: color }
            : { color, backgroundColor: `${color}22` }
        }
      >
        {label}
      </span>
    </span>
  );
}

export function sidebarProjectRowAccent(name: string | null | undefined): string {
  if (!isElevatedPriority(name)) return "";
  return "border-l-2 pl-1";
}

export function sidebarProjectRowAccentStyle(
  name: string | null | undefined,
): CSSProperties | undefined {
  if (!isElevatedPriority(name)) return undefined;
  return { borderLeftColor: priorityColor(name) };
}
