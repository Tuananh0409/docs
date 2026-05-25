import { type FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "@/shared/api/client";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { inputClass } from "@/shared/components/ui/formStyles";
import type { ProjectMember } from "@/features/project/types";
import { taskApi } from "../api/taskApi";
import type { TaskStatus } from "../types";
import { useTaskPriorities } from "../hooks/useTaskPriorities";
import { TaskPriorityMenu } from "./TaskPriorityMenu";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  members: ProjectMember[];
  statuses: TaskStatus[];
  defaultStatusName?: string;
  /** yyyy-MM-dd — từ ô lịch khi bấm + */
  defaultDeadline?: string;
  onClose: () => void;
  onCreated: () => void;
};

export function TaskCreateModal({
  workspaceSlug,
  projectSlug,
  members,
  statuses,
  defaultStatusName = "Todo",
  defaultDeadline = "",
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { defaultPriority } = useTaskPriorities();
  const [priority, setPriority] = useState(defaultPriority);
  const [statusName, setStatusName] = useState(defaultStatusName);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [reporterUserId, setReporterUserId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatusName(defaultStatusName);
  }, [defaultStatusName]);

  useEffect(() => {
    setDeadline(defaultDeadline);
  }, [defaultDeadline]);

  function toggleAssignee(userId: number) {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await taskApi.create(workspaceSlug, projectSlug, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        statusName,
        deadline: deadline || undefined,
        assigneeUserIds: assigneeIds.length > 0 ? assigneeIds : undefined,
        reporterUserId:
          reporterUserId !== "" ? reporterUserId : undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tạo được công việc");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Tạo công việc mới" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <label className="block text-sm font-medium text-slate-700">
          Tiêu đề *
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Mô tả ngắn công việc"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Mô tả
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Trạng thái
            <select
              value={statusName}
              onChange={(e) => setStatusName(e.target.value)}
              className={inputClass}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.statusName}>
                  {s.statusName}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="block text-sm font-medium text-slate-700">Ưu tiên</span>
            <TaskPriorityMenu
              value={priority}
              onChange={setPriority}
              className="mt-1"
            />
          </div>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Hạn hoàn thành
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Người báo cáo
          <select
            value={reporterUserId}
            onChange={(e) =>
              setReporterUserId(e.target.value ? Number(e.target.value) : "")
            }
            className={inputClass}
          >
            <option value="">Mặc định (bạn)</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.username}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Người thực hiện</legend>
          <div className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {members.map((m) => (
              <label
                key={m.userId}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={assigneeIds.includes(m.userId)}
                  onChange={() => toggleAssignee(m.userId)}
                />
                <span>{m.username}</span>
                <span className="text-xs text-slate-400">{m.email}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={saving || !title.trim()}>
            {saving ? "Đang lưu…" : "Tạo công việc"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
