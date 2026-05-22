import type { TaskAssignee } from "../types";

type Props = {
  assignees: TaskAssignee[];
  max?: number;
};

export function TaskAssigneeAvatars({ assignees, max = 3 }: Props) {
  if (assignees.length === 0) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-400">
        —
      </span>
    );
  }

  const shown = assignees.slice(0, max);
  const extra = assignees.length - shown.length;

  return (
    <div className="flex -space-x-2">
      {shown.map((a) => (
        <span
          key={a.userId}
          title={a.username}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-800 ring-2 ring-white"
        >
          {a.username
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      ))}
      {extra > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 ring-2 ring-white">
          +{extra}
        </span>
      )}
    </div>
  );
}
