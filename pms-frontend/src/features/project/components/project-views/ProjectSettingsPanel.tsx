import { type FormEvent } from "react";
import { Trash2, X } from "lucide-react";
import type { Member } from "@/features/workspace/types";
import { PROJECT_COLOR_PRESETS } from "@/shared/config/project-options";
import { Button } from "@/shared/components/ui/Button";
import { ProjectPrioritySelect } from "../ProjectPrioritySelect";
import { ProjectPrivacySelect } from "../ProjectPrivacySelect";
import { ProjectStatusSelect } from "../ProjectStatusSelect";

type Props = {
  editName: string;
  editDescription: string;
  editStatus: string;
  editPriority: string;
  editStart: string;
  editEnd: string;
  editColor: string;
  editPrivacy: string;
  editLeadUserId: string;
  workspaceMembers: Member[];
  saving: boolean;
  isWsAdmin: boolean;
  onChangeName: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeStatus: (v: string) => void;
  onChangePriority: (v: string) => void;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onChangeColor: (v: string) => void;
  onChangePrivacy: (v: string) => void;
  onChangeLead: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onDelete: () => void;
};

export function ProjectSettingsPanel({
  editName,
  editDescription,
  editStatus,
  editPriority,
  editStart,
  editEnd,
  editColor,
  editPrivacy,
  editLeadUserId,
  workspaceMembers,
  saving,
  isWsAdmin,
  onChangeName,
  onChangeDescription,
  onChangeStatus,
  onChangePriority,
  onChangeStart,
  onChangeEnd,
  onChangeColor,
  onChangePrivacy,
  onChangeLead,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[2px]">
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="project-settings-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="project-settings-title" className="text-lg font-semibold text-slate-900">
            Cài đặt dự án
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto p-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tên</span>
            <input
              required
              value={editName}
              onChange={(e) => onChangeName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Mô tả</span>
            <textarea
              value={editDescription}
              onChange={(e) => onChangeDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Ngày bắt đầu</span>
              <input
                type="date"
                value={editStart}
                onChange={(e) => onChangeStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Ngày kết thúc</span>
              <input
                type="date"
                value={editEnd}
                onChange={(e) => onChangeEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Trạng thái</span>
            <div className="mt-1">
              <ProjectStatusSelect value={editStatus} onChange={onChangeStatus} />
            </div>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Độ ưu tiên</span>
            <div className="mt-1">
              <ProjectPrioritySelect
                value={editPriority}
                onChange={onChangePriority}
              />
            </div>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Project Lead</span>
            <select
              value={editLeadUserId}
              onChange={(e) => onChangeLead(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {workspaceMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.username}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Quyền riêng tư</span>
            <div className="mt-1">
              <ProjectPrivacySelect value={editPrivacy} onChange={onChangePrivacy} />
            </div>
          </label>
          <p className="mt-4 text-xs text-slate-500">Màu dự án</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROJECT_COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChangeColor(c)}
                className={`h-8 w-8 rounded-lg border-2 ${
                  editColor === c ? "border-slate-900 ring-2 ring-brand-500/30" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
          </div>

          {isWsAdmin && (
            <div className="mt-6 border-t border-red-100 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="gap-2 text-red-700"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Xóa dự án
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
