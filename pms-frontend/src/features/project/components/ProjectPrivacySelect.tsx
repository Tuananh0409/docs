import { ChevronDown } from "lucide-react";
import { WORKSPACE_PRIVACY_OPTIONS } from "@/shared/config/workspace-options";

type Props = {
  value: string | null | undefined;
  onChange: (privacyMode: string) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
};

const DEFAULT_PRIVACY = "PRIVATE";

const PRIVACY_COLORS: Record<string, string> = {
  PRIVATE: "#64748B",
  ORG_WIDE: "#2563EB",
};

export function ProjectPrivacySelect({
  value,
  onChange,
  disabled = false,
  compact = false,
  className = "",
}: Props) {
  const current = (value ?? DEFAULT_PRIVACY).toUpperCase();
  const color = PRIVACY_COLORS[current] ?? PRIVACY_COLORS.PRIVATE;
  const label =
    WORKSPACE_PRIVACY_OPTIONS.find((o) => o.value === current)?.label ?? current;

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
          aria-label="Quyền riêng tư dự án"
          title="Private hoặc Public"
        >
          {WORKSPACE_PRIVACY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-white/90"
          aria-hidden
        />
        <span className="sr-only">{label}</span>
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
      aria-label="Quyền riêng tư dự án"
    >
      {WORKSPACE_PRIVACY_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label} — {o.hint}
        </option>
      ))}
    </select>
  );
}
