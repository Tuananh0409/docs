import { type FormEvent, useCallback, useEffect, useState } from "react";
import { CheckSquare, MoreHorizontal, Trash2, X, Zap } from "lucide-react";
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
import { formatDeadline } from "../utils/taskUi";
import { TaskAssigneeAvatars } from "./TaskAssigneeAvatars";
import { TaskPriorityMenu } from "./TaskPriorityMenu";

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

function statusButtonColor(statusName: string | null, statuses: TaskStatus[]) {
  const s = statuses.find(
    (x) => x.statusName.toLowerCase() === (statusName ?? "").toLowerCase(),
  );
  return s?.colorCode ?? "#3b82f6";
}

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
  const [activeTab, setActiveTab] = useState<"comments" | "history">("comments");

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

  async function persist(patch: Parameters<typeof taskApi.update>[3], reload = true) {
    if (!task || !canWrite) return;
    setSaving(true);
    setError("");
    try {
      const updated = await taskApi.update(workspaceSlug, projectSlug, taskId, patch);
      setTask(updated);
      onUpdated();
      if (reload) await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không lưu được");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(statusName: string) {
    if (!task || task.statusName === statusName) return;
    setSaving(true);
    try {
      const updated = await taskApi.updateStatus(
        workspaceSlug,
        projectSlug,
        taskId,
        statusName,
      );
      setTask(updated);
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không đổi trạng thái");
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
      setComments(await taskApi.listComments(workspaceSlug, projectSlug, taskId));
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
    if (!canWrite || !task) return;
    const next = assigneeIds.includes(userId)
      ? assigneeIds.filter((id) => id !== userId)
      : [...assigneeIds, userId];
    setAssigneeIds(next);
    void persist({ assigneeUserIds: next }, false);
  }

  if (loading && !task) {
    return (
      <Modal title="Công việc" onClose={onClose}>
        <p className="text-sm text-slate-500">Đang tải…</p>
      </Modal>
    );
  }

  if (!task) {
    return (
      <Modal title="Công việc" onClose={onClose}>
        <p className="text-sm text-red-600">{error || "Không tìm thấy công việc"}</p>
      </Modal>
    );
  }

  const statusColor = statusButtonColor(task.statusName, statuses);

  return (
    <Modal title="" onClose={onClose} size="xl" bare>
      <div className="flex max-h-[85vh] flex-col">
        {/* Header kiểu Jira */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
            <CheckSquare className="h-4 w-4 shrink-0 text-brand-600" />
            <span className="font-mono font-medium text-slate-700">{task.taskKey}</span>
            <span className="text-slate-300">/</span>
            <span className="truncate">{task.projectCode}</span>
          </div>
          <div className="flex items-center gap-1">
            {canDelete && (
              <button
                type="button"
                onClick={() => void handleDeleteTask()}
                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Xóa công việc"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
              aria-hidden
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <p className="mx-5 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Cột trái — nội dung chính */}
          <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
            <input
              value={task.title}
              disabled={!canWrite}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              onBlur={() => {
                if (canWrite) void persist({ title: task.title }, false);
              }}
              className="w-full border-0 bg-transparent text-2xl font-semibold text-slate-900 outline-none placeholder:text-slate-300 disabled:opacity-70"
              placeholder="Tiêu đề công việc"
            />

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-800">Mô tả</h3>
              <textarea
                value={task.description ?? ""}
                disabled={!canWrite}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                onBlur={() => {
                  if (canWrite) void persist({ description: task.description ?? "" }, false);
                }}
                rows={4}
                placeholder="Thêm mô tả…"
                className={`${inputClass} mt-2`}
              />
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex gap-4 border-b border-slate-100 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("comments")}
                  className={[
                    "border-b-2 pb-2 font-medium transition",
                    activeTab === "comments"
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  Bình luận
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={[
                    "border-b-2 pb-2 font-medium transition",
                    activeTab === "history"
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  Lịch sử
                </button>
              </div>

              {activeTab === "comments" && (
                <div className="pt-4">
                  <form onSubmit={handleAddComment}>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Viết bình luận…"
                      rows={2}
                      className={inputClass}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="mt-2"
                      disabled={!commentText.trim()}
                    >
                      Gửi
                    </Button>
                  </form>
                  <ul className="mt-4 space-y-3">
                    {comments.map((c) => (
                      <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-semibold text-slate-800">{c.username}</span>
                        <span className="ml-2 text-xs text-slate-400">
                          {new Date(c.createdAt).toLocaleString("vi-VN")}
                        </span>
                        <p className="mt-1 text-slate-700">{c.content}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "history" && (
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  {history.length === 0 ? (
                    <li className="text-slate-400">Chưa có lịch sử</li>
                  ) : (
                    history.map((h) => (
                      <li key={h.id}>
                        <span className="font-medium">{h.changedByUsername}</span> — {h.fieldName}:{" "}
                        {h.oldValue ?? "—"} → {h.newValue ?? "—"}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div className="mt-6">
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
                  <li key={a.id}>
                    <a href={a.downloadUrl} className="text-sm text-brand-600 hover:underline" download>
                      {a.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar phải — Details */}
          <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-slate-50/80 px-4 py-5">
            <div className="flex items-center gap-2">
              <select
                value={task.statusName ?? "Todo"}
                disabled={!canWrite || saving}
                onChange={(e) => void handleStatusChange(e.target.value)}
                className="flex-1 cursor-pointer rounded-md border-0 py-2 pl-3 pr-8 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: statusColor }}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.statusName}>
                    {s.statusName}
                  </option>
                ))}
              </select>
              <span className="rounded p-1 text-slate-400" title="Tự động hóa">
                <Zap className="h-4 w-4" />
              </span>
            </div>

            <h4 className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-500">
              Chi tiết
            </h4>
            <dl className="mt-3 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Người thực hiện</dt>
                <dd className="mt-1">
                  {task.assignees.length > 0 ? (
                    <TaskAssigneeAvatars assignees={task.assignees} max={4} />
                  ) : (
                    <span className="text-slate-400">Chưa gán</span>
                  )}
                  {canWrite && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {members.map((m) => (
                        <button
                          key={m.userId}
                          type="button"
                          onClick={() => toggleAssignee(m.userId)}
                          className={[
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            assigneeIds.includes(m.userId)
                              ? "bg-brand-600 text-white"
                              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {m.username}
                        </button>
                      ))}
                    </div>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Độ ưu tiên</dt>
                <dd className="mt-1">
                  <TaskPriorityMenu
                    value={task.priorityName}
                    disabled={!canWrite || saving}
                    onChange={(priorityName) => {
                      setTask({ ...task, priorityName });
                      void persist({ priority: priorityName }, false);
                    }}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Người tạo</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {task.createdByUsername ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Hạn hoàn thành</dt>
                <dd className="mt-1">
                  <input
                    type="date"
                    disabled={!canWrite}
                    value={task.deadline ? formatDeadline(task.deadline) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTask({
                        ...task,
                        deadline: val ? `${val}T23:59:59Z` : null,
                      });
                    }}
                    onBlur={() => {
                      if (!canWrite) return;
                      void persist({
                        deadline: task.deadline ? formatDeadline(task.deadline) : undefined,
                        clearDeadline: !task.deadline,
                      }, false);
                    }}
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </dd>
              </div>
            </dl>

            {saving && (
              <p className="mt-4 text-xs text-slate-400">Đang lưu…</p>
            )}
          </aside>
        </div>
      </div>
    </Modal>
  );
}
