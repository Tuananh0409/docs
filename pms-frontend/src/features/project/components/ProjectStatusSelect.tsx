import { ChevronDown } from "lucide-react";
import { PROJECT_STATUS_OPTIONS, statusColor } from "@/shared/config/project-options";

type Props = {
  value: string | null | undefined;
  onChange: (statusName: string) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
};

const DEFAULT_STATUS = "Active";

export function ProjectStatusSelect({
  value,
  onChange,
  disabled = false,
  compact = false,
  className = "",
}: Props) {
  const current = value ?? DEFAULT_STATUS;
  const color = statusColor(current);

  if (compact) {
    return (
      <span className={["relative inline-flex", className].join(" ")}>
        <select
          value={current}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "cursor-pointer appearance-none rounded-md py-0.5 pl-2 pr-6 text-xs font-semibold text-white shadow-sm",
            "outline-none ring-brand-500/40 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
          style={{ backgroundColor: color }}
          aria-label="Trạng thái dự án"
          title="Trạng thái dự án"
        >
          {PROJECT_STATUS_OPTIONS.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-white/90"
          aria-hidden
        />
      </span>
    );
  }

  return (
    <select
      value={current}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800",
        "outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30",
        "disabled:cursor-not-allowed disabled:bg-slate-50",
        className,
      ].join(" ")}
      aria-label="Trạng thái dự án"
    >
      {PROJECT_STATUS_OPTIONS.map((s) => (
        <option key={s.name} value={s.name}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
