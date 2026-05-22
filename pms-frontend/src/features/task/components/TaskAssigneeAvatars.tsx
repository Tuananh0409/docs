import type { TaskAssignee } from "../types";

type Props = {
  assignees: TaskAssignee[];
  max?: number;
  size?: "sm" | "md";
};

const sizeClass = {
  sm: "h-5 w-5 text-[9px] ring-1",
  md: "h-7 w-7 text-[10px] ring-2",
};

export function TaskAssigneeAvatars({ assignees, max = 3, size = "md" }: Props) {
  const dim = sizeClass[size];
  if (assignees.length === 0) {
    return (
      <span
        className={`flex items-center justify-center rounded-full bg-slate-100 text-slate-400 ${dim}`}
      >
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
          className={`flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800 ring-white ${dim}`}
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
        <span
          className={`flex items-center justify-center rounded-full bg-slate-200 font-medium text-slate-600 ring-white ${dim}`}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
