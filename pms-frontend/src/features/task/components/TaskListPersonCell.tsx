import { User } from "lucide-react";

function avatarBg(userId: number): string {
  const hues = [174, 199, 221, 262, 291, 24, 142];
  const h = hues[userId % hues.length];
  return `hsl(${h} 55% 42%)`;
}

function initials(username: string): string {
  return username
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  userId: number;
  username: string;
  emptyLabel?: string;
};

/** Ô người (assignee / reporter) kiểu Jira list — avatar + tên. */
export function TaskListPersonCell({
  userId,
  username,
  emptyLabel = "Chưa gán",
}: Props) {
  if (!username?.trim()) {
    return (
      <div className="flex min-w-[120px] items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DFE1E6] text-[#6B778C]">
          <User className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span className="truncate text-sm text-[#6B778C]">{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex min-w-[120px] max-w-[200px] items-center gap-2">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
        style={{ backgroundColor: avatarBg(userId) }}
      >
        {initials(username)}
      </span>
      <span className="truncate text-sm text-[#172B4D]">{username}</span>
    </div>
  );
}
