import { Filter } from "lucide-react";
import { PROJECT_PRIORITY_OPTIONS } from "@/shared/config/project-options";
import type { ProjectListSort } from "@/shared/utils/projectListUtils";

type Props = {
  priorityFilter: string;
  sort: ProjectListSort;
  onPriorityFilterChange: (value: string) => void;
  onSortChange: (value: ProjectListSort) => void;
  /** Sidebar: select nhỏ hơn */
  compact?: boolean;
  className?: string;
};

const selectClass = (compact: boolean) =>
  [
    "rounded-md border border-slate-200 bg-white text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30",
    compact ? "h-7 min-w-0 flex-1 px-1.5 text-[11px]" : "h-8 px-2 text-xs",
  ].join(" ");

export function ProjectListControls({
  priorityFilter,
  sort,
  onPriorityFilterChange,
  onSortChange,
  compact = false,
  className = "",
}: Props) {
  return (
    <div
      className={[
        compact ? "mb-2 space-y-1.5 px-1" : "mb-3 flex flex-wrap items-end gap-3",
        className,
      ].join(" ")}
    >
      <div className={compact ? "flex items-center gap-1" : "flex min-w-[140px] flex-col gap-1"}>
        {compact ? (
          <Filter className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
        ) : (
          <label className="text-xs font-medium text-slate-600">Lọc ưu tiên</label>
        )}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className={selectClass(compact)}
          aria-label="Lọc theo độ ưu tiên"
        >
          <option value="">Tất cả</option>
          {PROJECT_PRIORITY_OPTIONS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className={compact ? "flex items-center gap-1" : "flex min-w-[140px] flex-col gap-1"}>
        {!compact && <label className="text-xs font-medium text-slate-600">Sắp xếp</label>}
        {compact && <span className="w-3 shrink-0" aria-hidden />}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ProjectListSort)}
          className={selectClass(compact)}
          aria-label="Sắp xếp dự án"
        >
          <option value="priority">Ưu tiên (cao → thấp)</option>
          <option value="name">Tên A → Z</option>
        </select>
      </div>
    </div>
  );
}
