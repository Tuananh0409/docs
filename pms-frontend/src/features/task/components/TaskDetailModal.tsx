import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { ProjectMember } from "@/features/project/types";
import { ApiClientError } from "@/shared/api/client";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { inputClass } from "@/shared/components/ui/formStyles";
import { taskApi } from "../api/taskApi";
import type {
  TaskAttachment,
  TaskComment,
  TaskDetail,
  TaskHistoryEntry,
  TaskStatus,
} from "../types";
import { PRIORITIES, formatDeadline, priorityColor } from "../utils/taskUi";
import { TaskAssigneeAvatars } from "./TaskAssigneeAvatars";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  taskId: number;
  members: ProjectMember[];
  statuses: TaskStatus[];
  canWrite: boolean;
  canDelete: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

export function TaskDetailModal({
  workspaceSlug,
  projectSlug,
  taskId,
  members,
  statuses,
  canWrite,
  canDelete,
  onClose,
  onUpdated,
  onDeleted,
}: Props) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [t, c, h, a] = await Promise.all([
        taskApi.get(workspaceSlug, projectSlug, taskId),
        taskApi.listComments(workspaceSlug, projectSlug, taskId),
        taskApi.listHistory(workspaceSlug, projectSlug, taskId),
        taskApi.listAttachments(workspaceSlug, projectSlug, taskId),
      ]);
      setTask(t);
      setComments(c);
      setHistory(h);
      setAttachments(a);
      setAssigneeIds(t.assignees.map((x) => x.userId));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được task");
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, projectSlug, taskId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!task || !canWrite) return;
    setSaving(true);
    setError("");
    try {
      const hasDeadline = Boolean(task.deadline);
      const updated = await taskApi.update(workspaceSlug, projectSlug, taskId, {
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        statusName: task.statusName ?? undefined,
        deadline: hasDeadline ? formatDeadline(task.deadline) : undefined,
        clearDeadline: !hasDeadline,
        assigneeUserIds: assigneeIds,
      });
      setTask(updated);
      onUpdated();
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không lưu được");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await taskApi.addComment(workspaceSlug, projectSlug, taskId, commentText.trim());
      setCommentText("");
      const c = await taskApi.listComments(workspaceSlug, projectSlug, taskId);
      setComments(c);
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không gửi được bình luận");
    }
  }

  async function handleDeleteTask() {
    if (!confirm("Xóa công việc này?")) return;
    try {
      await taskApi.delete(workspaceSlug, projectSlug, taskId);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không xóa được");
    }
  }

  async function handleUpload(file: File) {
    try {
      await taskApi.uploadAttachment(workspaceSlug, projectSlug, taskId, file);
      setAttachments(await taskApi.listAttachments(workspaceSlug, projectSlug, taskId));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Upload thất bại");
    }
  }

  function toggleAssignee(userId: number) {
    if (!canWrite) return;
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  if (loading && !task) {
    return (
      <Modal title="Chi tiết công việc" onClose={onClose}>
        <p className="text-sm text-slate-500">Đang tải…</p>
      </Modal>
    );
  }

  if (!task) {
    return (
      <Modal title="Chi tiết công việc" onClose={onClose}>
        <p className="text-sm text-red-600">{error || "Không tìm thấy task"}</p>
      </Modal>
    );
  }

  return (
    <Modal title={`${task.taskKey} — ${task.title}`} onClose={onClose} size="lg">
      <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span
              className="rounded px-2 py-0.5 font-semibold text-white"
              style={{ backgroundColor: priorityColor(task.priority) }}
            >
              {task.priority}
            </span>
            {task.overdue && (
              <span className="rounded bg-red-100 px-2 py-0.5 font-medium text-red-700">
                Quá hạn
              </span>
            )}
            <TaskAssigneeAvatars assignees={task.assignees} />
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Tiêu đề
            <input
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              disabled={!canWrite}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mô tả
            <textarea
              value={task.description ?? ""}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              disabled={!canWrite}
              rows={3}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Trạng thái
              <select
                value={task.statusName ?? "Todo"}
                onChange={(e) => setTask({ ...task, statusName: e.target.value })}
                disabled={!canWrite}
                className={inputClass}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.statusName}>
                    {s.statusName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Ưu tiên
              <select
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                disabled={!canWrite}
                className={inputClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Deadline
            <input
              type="date"
              value={task.deadline ? formatDeadline(task.deadline) : ""}
              onChange={(e) =>
                setTask({
                  ...task,
                  deadline: e.target.value ? `${e.target.value}T23:59:59Z` : null,
                })
              }
              disabled={!canWrite}
              className={inputClass}
            />
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Người thực hiện</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  disabled={!canWrite}
                  onClick={() => toggleAssignee(m.userId)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    assigneeIds.includes(m.userId)
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m.username}
                </button>
              ))}
            </div>
          </fieldset>

          {canWrite && (
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </Button>
          )}
        </form>

        <section>
          <h3 className="text-sm font-semibold text-slate-800">Bình luận</h3>
          <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {comments.length === 0 ? (
              <li className="text-xs text-slate-400">Chưa có bình luận</li>
            ) : (
              comments.map((c) => (
                <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-800">{c.username}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleString("vi-VN")}
                  </span>
                  <p className="mt-1 text-slate-700">{c.content}</p>
                </li>
              ))
            )}
          </ul>
          <form onSubmit={handleAddComment} className="mt-2 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận…"
              className={`${inputClass} mt-0 flex-1`}
            />
            <Button type="submit" variant="secondary" disabled={!commentText.trim()}>
              Gửi
            </Button>
          </form>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800">Tệp đính kèm</h3>
          {canWrite && (
            <input
              type="file"
              className="mt-2 block w-full text-sm text-slate-600"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
                e.target.value = "";
              }}
            />
          )}
          <ul className="mt-2 space-y-1">
            {attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <a
                  href={a.downloadUrl}
                  className="text-brand-600 hover:underline"
                  download
                >
                  {a.fileName}
                </a>
                <span className="text-xs text-slate-400">{a.uploadedByUsername}</span>
              </li>
            ))}
          </ul>
        </section>

        {history.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-800">Lịch sử</h3>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600">
              {history.map((h) => (
                <li key={h.id}>
                  <span className="font-medium">{h.changedByUsername}</span> — {h.fieldName}:{" "}
                  {h.oldValue ?? "—"} → {h.newValue ?? "—"}
                </li>
              ))}
            </ul>
          </section>
        )}

        {canDelete && (
          <Button type="button" variant="danger" className="gap-1" onClick={handleDeleteTask}>
            <Trash2 className="h-4 w-4" />
            Xóa task
          </Button>
        )}
      </div>
    </Modal>
  );
}
