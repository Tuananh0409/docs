import { useEffect, useRef, useState } from "react";
import type { ProjectMember } from "@/features/project/types";
import { taskApi } from "../api/taskApi";
import { ApiClientError } from "@/shared/api/client";
import { useToast } from "@/shared/context/ToastContext";
import { TaskListPersonCell } from "./TaskListPersonCell";

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
  reporterUserId: number;
  reporterUsername: string;
  members: ProjectMember[];
  canWrite: boolean;
  onUpdated: () => void | Promise<void>;
};

export function TaskInlineReporter({
  workspaceSlug,
  projectSlug,
  taskId,
  reporterUserId,
  reporterUsername,
  members,
  canWrite,
  onUpdated,
}: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function selectReporter(userId: number) {
    if (userId === reporterUserId) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await taskApi.update(workspaceSlug, projectSlug, taskId, {
        reporterUserId: userId,
      });
      await onUpdated();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Không đổi người báo cáo");
    } finally {
      setSaving(false);
    }
  }

  if (!canWrite) {
    return (
      <TaskListPersonCell
        userId={reporterUserId}
        username={reporterUsername}
        emptyLabel="—"
      />
    );
  }

  return (
    <div ref={rootRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={saving}
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-full items-center gap-2 rounded px-0.5 py-0.5 hover:bg-[#091e420a] disabled:opacity-50"
        aria-label="Đổi người báo cáo"
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: avatarBg(reporterUserId) }}
        >
          {initials(reporterUsername)}
        </span>
        <span className="truncate text-sm text-[#172B4D]">{reporterUsername}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-52 overflow-y-auto rounded-md border border-[#DFE1E6] bg-white py-1 shadow-lg">
          <p className="border-b border-[#EBECF0] px-2 py-1.5 text-[10px] font-medium text-[#6B778C]">
            Người báo cáo
          </p>
          <ul>
            {members.map((m) => (
              <li key={m.userId}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void selectReporter(m.userId)}
                  className={[
                    "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-[#F4F5F7]",
                    m.userId === reporterUserId ? "bg-[#F4F5F7] font-medium" : "text-[#172B4D]",
                  ].join(" ")}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                    style={{ backgroundColor: avatarBg(m.userId) }}
                  >
                    {initials(m.username)}
                  </span>
                  <span className="truncate">{m.username}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
