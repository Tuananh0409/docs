import { PROJECT_PRIORITY_OPTIONS, PRIORITY_SIDEBAR_LABEL } from "@/shared/config/project-options";

/** Chú giải màu / nhãn ưu tiên trên sidebar. */
export function SidebarPriorityLegend() {
  return (
    <div
      className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[10px] text-slate-500"
      aria-label="Chú giải độ ưu tiên dự án"
    >
      <span className="w-full font-medium text-slate-600">Ưu tiên:</span>
      {PROJECT_PRIORITY_OPTIONS.map((p) => (
        <span key={p.name} className="inline-flex items-center gap-1">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: p.color }}
            aria-hidden
          />
          <span>{PRIORITY_SIDEBAR_LABEL[p.name] ?? p.name}</span>
        </span>
      ))}
    </div>
  );
}
