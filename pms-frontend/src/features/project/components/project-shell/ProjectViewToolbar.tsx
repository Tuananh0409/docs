import { Filter, Search, SlidersHorizontal } from "lucide-react";
import type { ProjectMember } from "../../types";
import { Button } from "@/shared/components/ui/Button";

type Props = {
  placeholder?: string;
  members: ProjectMember[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

function MemberAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 ring-2 ring-white"
      title={name}
    >
      {initials}
    </span>
  );
}

export function ProjectViewToolbar({
  placeholder = "Tìm trong backlog…",
  members,
  searchQuery,
  onSearchChange,
}: Props) {
  const shown = members.slice(0, 3);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex -space-x-2">
          {shown.map((m) => (
            <MemberAvatar key={m.userId} name={m.username} />
          ))}
        </div>
        <Button type="button" variant="secondary" className="gap-1.5 text-xs" disabled>
          <Filter className="h-3.5 w-3.5" />
          Bộ lọc
        </Button>
      </div>
      <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-slate-500" disabled>
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
