import { type FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "@/shared/api/client";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { inputClass } from "@/shared/components/ui/formStyles";
import type { ProjectMember } from "@/features/project/types";
import { taskApi } from "../api/taskApi";
import type { TaskStatus } from "../types";
import { PRIORITIES } from "../utils/taskUi";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  members: ProjectMember[];
  statuses: TaskStatus[];
  defaultStatusName?: string;
  onClose: () => void;
  onCreated: () => void;
};

export function TaskCreateModal({
  workspaceSlug,
  projectSlug,
  members,
  statuses,
  defaultStatusName = "Todo",
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [statusName, setStatusName] = useState(defaultStatusName);
  const [deadline, setDeadline] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatusName(defaultStatusName);
  }, [defaultStatusName]);

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
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tạo được task");
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
          <label className="block text-sm font-medium text-slate-700">
            Ưu tiên
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
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
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
          />
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
            {saving ? "Đang lưu…" : "Tạo task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
