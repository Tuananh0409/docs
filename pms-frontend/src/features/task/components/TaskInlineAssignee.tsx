import { type MouseEvent as ReactMouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import type { ProjectMember } from "@/features/project/types";
import { taskApi } from "../api/taskApi";
import type { TaskAssignee } from "../types";
import { ApiClientError } from "@/shared/api/client";
import { useToast } from "@/shared/context/ToastContext";

const AVATAR_SIZE = "h-6 w-6";

/** Màu avatar ổn định theo userId (giống Jira). */
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
  workspaceSlug: string;
  projectSlug: string;
  taskId: number;
  assignees: TaskAssignee[];
  members: ProjectMember[];
  canWrite: boolean;
  onUpdated: () => void | Promise<void>;
};

export function TaskInlineAssignee({
  workspaceSlug,
  projectSlug,
  taskId,
  assignees,
  members,
  canWrite,
  onUpdated,
}: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    assignees.map((a) => a.userId),
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIds(assignees.map((a) => a.userId));
  }, [assignees]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSelectedIds(assignees.map((a) => a.userId));
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, assignees]);

  function stopCardClick(e: ReactMouseEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  async function saveAssignees(ids: number[]) {
    setSaving(true);
    try {
      await taskApi.update(workspaceSlug, projectSlug, taskId, {
        assigneeUserIds: ids,
      });
      await onUpdated();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Không gán được người");
    } finally {
      setSaving(false);
    }
  }

  function toggleMember(userId: number) {
    const next = selectedIds.includes(userId)
      ? selectedIds.filter((id) => id !== userId)
      : [...selectedIds, userId];
    setSelectedIds(next);
    void saveAssignees(next);
  }

  const hasAssignee = assignees.length > 0;
  const shown = assignees.slice(0, 2);
  const extra = assignees.length - shown.length;

  if (!canWrite && !hasAssignee) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative shrink-0" onClick={stopCardClick}>
      <button
        type="button"
        disabled={!canWrite || saving}
        onClick={(e) => {
          stopCardClick(e);
          if (canWrite) setOpen((v) => !v);
        }}
        className="flex items-center focus:outline-none disabled:cursor-default"
        title={hasAssignee ? "Người thực hiện" : "Gán người thực hiện"}
        aria-label={hasAssignee ? "Đổi người thực hiện" : "Gán người thực hiện"}
      >
        {!hasAssignee ? (
          <span
            className={`flex ${AVATAR_SIZE} items-center justify-center rounded-full bg-slate-200 text-slate-500 ring-1 ring-slate-300/80`}
          >
            <User className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        ) : (
          <span className="flex -space-x-1.5">
            {shown.map((a) => (
              <span
                key={a.userId}
                className={`flex ${AVATAR_SIZE} items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white`}
                style={{ backgroundColor: avatarBg(a.userId) }}
              >
                {initials(a.username)}
              </span>
            ))}
            {extra > 0 && (
              <span
                className={`flex ${AVATAR_SIZE} items-center justify-center rounded-full bg-slate-300 text-[9px] font-medium text-slate-700 ring-2 ring-white`}
              >
                +{extra}
              </span>
            )}
          </span>
        )}
      </button>

      {open && canWrite && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          onClick={stopCardClick}
        >
          <p className="border-b border-slate-100 px-2 py-1.5 text-[10px] font-medium text-slate-500">
            Người thực hiện
          </p>
          <ul className="max-h-36 overflow-y-auto">
            {members.length === 0 ? (
              <li className="px-2 py-2 text-[10px] text-slate-400">Chưa có thành viên dự án</li>
            ) : (
              members.map((m) => (
                <li key={m.userId}>
                  <label className="flex cursor-pointer items-center gap-2 px-2 py-1.5 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300"
                      checked={selectedIds.includes(m.userId)}
                      disabled={saving}
                      onChange={() => toggleMember(m.userId)}
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white`}
                      style={{ backgroundColor: avatarBg(m.userId) }}
                    >
                      {initials(m.username)}
                    </span>
                    <span className="min-w-0 truncate text-xs text-slate-700">{m.username}</span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Hàng meta: priority (trái) → gán người (phải). */
type RowProps = {
  priority: ReactNode;
} & Props;

export function TaskPriorityAssigneeRow({
  priority,
  workspaceSlug,
  projectSlug,
  taskId,
  assignees,
  members,
  canWrite,
  onUpdated,
}: RowProps) {
  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {priority}
      <TaskInlineAssignee
        workspaceSlug={workspaceSlug}
        projectSlug={projectSlug}
        taskId={taskId}
        assignees={assignees}
        members={members}
        canWrite={canWrite}
        onUpdated={onUpdated}
      />
    </div>
  );
}
