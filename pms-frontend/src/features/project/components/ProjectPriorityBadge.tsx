import { priorityColor } from "@/shared/config/project-options";

type Props = {
  name: string | null | undefined;
  className?: string;
};

export function ProjectPriorityBadge({ name, className = "" }: Props) {
  if (!name) return null;
  const color = priorityColor(name);
  return (
    <span
      className={[
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold text-white shadow-sm",
        className,
      ].join(" ")}
      style={{ backgroundColor: color }}
      title={`Độ ưu tiên: ${name}`}
    >
      {name}
    </span>
  );
}
