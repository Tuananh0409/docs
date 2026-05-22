import { priorityColor } from "@/shared/config/project-options";

type Props = {
  name: string | null | undefined;
  className?: string;
};

/** Chấm màu gọn cho sidebar. */
export function ProjectPriorityDot({ name, className = "" }: Props) {
  if (!name) return null;
  return (
    <span
      className={["h-2 w-2 shrink-0 rounded-full", className].join(" ")}
      style={{ backgroundColor: priorityColor(name) }}
      title={name}
      aria-label={`Ưu tiên ${name}`}
    />
  );
}
