import { type FormEvent, useId } from "react";
import { ChevronDown } from "lucide-react";
import type { Member } from "@/features/workspace/types";
import { validateAttachmentFile } from "@/shared/components/files/attachmentRules";
import { FileDropZone } from "@/shared/components/files/FileDropZone";
import { PendingFileList } from "@/shared/components/files/PendingFileList";
import { useToast } from "@/shared/context/ToastContext";
import {
  ColorPresetPicker,
  FormField,
  inputClass,
  Panel,
} from "@/shared/components/ui";
import {
  PROJECT_COLOR_PRESETS,
  PROJECT_PRIVACY_OPTIONS,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
} from "@/shared/config/project-options";
import type { PendingFileMeta } from "@/shared/components/files/pendingFiles";
import type { ProjectCreatePreviewState } from "./ProjectCreatePreview";

type Props = {
  members: Member[];
  loadingMembers: boolean;
  error: string;
  state: ProjectCreatePreviewState;
  showAdvanced: boolean;
  code: string;
  slug: string;
  onStateChange: (patch: Partial<ProjectCreatePreviewState>) => void;
  onShowAdvancedChange: (open: boolean) => void;
  onCodeChange: (code: string) => void;
  onSlugChange: (slug: string) => void;
  pendingFiles: PendingFileMeta[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  submitting?: boolean;
  onSubmit: (e: FormEvent) => void;
};

export function ProjectCreateForm({
  members,
  loadingMembers,
  error,
  state,
  showAdvanced,
  code,
  slug,
  onStateChange,
  onShowAdvancedChange,
  onCodeChange,
  onSlugChange,
  pendingFiles,
  onFilesAdd,
  onFileRemove,
  submitting = false,
  onSubmit,
}: Props) {
  const advId = useId();
  const toast = useToast();

  function handleFilesAdd(files: FileList) {
    try {
      const valid: File[] = [];
      for (const file of Array.from(files)) {
        const err = validateAttachmentFile(file);
        if (err) toast.error(err);
        else valid.push(file);
      }
      if (valid.length > 0) onFilesAdd(valid);
    } catch (err) {
      console.error("handleFilesAdd", err);
      toast.error("Không thêm được file. Thử lại hoặc đổi định dạng file.");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form id="create-project-form" onSubmit={onSubmit} className="space-y-6">

      <Panel
        title="Thông tin cơ bản"
        description="Tên và mô tả giúp team hiểu mục tiêu dự án ngay từ đầu."
      >
        <div className="space-y-5">
          <FormField label="Tên dự án" required>
            <input
              required
              maxLength={255}
              value={state.name}
              onChange={(e) => onStateChange({ name: e.target.value })}
              className={inputClass}
              placeholder="Ví dụ: Triển khai CRM quý 3"
            />
          </FormField>
          <FormField
            label="Mô tả"
            hint="Mục tiêu, phạm vi, stakeholder — có thể bổ sung sau."
          >
            <textarea
              value={state.description}
              onChange={(e) => onStateChange({ description: e.target.value })}
              rows={4}
              maxLength={2000}
              className={inputClass}
              placeholder="Dự án nhằm…"
            />
          </FormField>
        </div>
      </Panel>

      <Panel
        title="Thời gian & trạng thái"
        description="Lập kế hoạch và theo dõi tiến độ theo mốc thời gian."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Ngày bắt đầu">
            <input
              type="date"
              value={state.startDate}
              onChange={(e) => onStateChange({ startDate: e.target.value })}
              className={inputClass}
            />
          </FormField>
          <FormField label="Ngày kết thúc" hint="Phải sau hoặc bằng ngày bắt đầu.">
            <input
              type="date"
              value={state.endDate}
              onChange={(e) => onStateChange({ endDate: e.target.value })}
              className={inputClass}
            />
          </FormField>
        </div>
        <FormField label="Trạng thái ban đầu" className="mt-5">
          <select
            value={state.statusName}
            onChange={(e) => onStateChange({ statusName: e.target.value })}
            className={inputClass}
          >
            {PROJECT_STATUS_OPTIONS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Độ ưu tiên"
          className="mt-5"
          hint="Dự án High/Urgent hiển thị trước trong danh sách phòng ban."
        >
          <select
            value={state.priorityName}
            onChange={(e) => onStateChange({ priorityName: e.target.value })}
            className={inputClass}
          >
            {PROJECT_PRIORITY_OPTIONS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
      </Panel>

      <Panel
        title="Quản lý & nhận diện"
        description="Ai phụ trách, màu sắc và quyền truy cập dự án."
      >
        <div className="space-y-5">
          <FormField
            label="Project Lead (PM)"
            hint="Người chịu trách nhiệm chính — mặc định là bạn."
          >
            <select
              value={state.projectLeadUserId}
              onChange={(e) => onStateChange({ projectLeadUserId: e.target.value })}
              disabled={loadingMembers}
              className={inputClass}
            >
              {loadingMembers ? (
                <option value="">Đang tải thành viên…</option>
              ) : (
                members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.username} — {m.roleName}
                  </option>
                ))
              )}
            </select>
          </FormField>

          <FormField label="Màu dự án">
            <ColorPresetPicker
              presets={PROJECT_COLOR_PRESETS}
              value={state.themeColor}
              onChange={(themeColor) => onStateChange({ themeColor })}
            />
          </FormField>

          <FormField label="Quyền riêng tư">
            <select
              value={state.privacyMode}
              onChange={(e) => onStateChange({ privacyMode: e.target.value })}
              className={inputClass}
            >
              {PROJECT_PRIVACY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              {PROJECT_PRIVACY_OPTIONS.find((o) => o.value === state.privacyMode)?.hint}
            </p>
          </FormField>
        </div>
      </Panel>

      <Panel title="Tùy chọn nâng cao" description="Chỉ cần khi muốn ghi đè mã hoặc slug URL.">
        <button
          type="button"
          id={advId}
          onClick={() => onShowAdvancedChange(!showAdvanced)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Mã dự án &amp; slug
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition ${showAdvanced ? "rotate-180" : ""}`}
          />
        </button>
        {showAdvanced && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <FormField label="Mã dự án" hint="Để trống = tự sinh từ tên.">
              <input
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                maxLength={50}
                className={inputClass}
                placeholder="VD: CRM"
              />
            </FormField>
            <FormField label="Slug URL" hint="Để trống = tự sinh.">
              <input
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                maxLength={150}
                className={inputClass}
                placeholder="trien-khai-crm"
              />
            </FormField>
          </div>
        )}
      </Panel>
      </form>

      {/* Ngoài <form> — tránh trình duyệt chặn hộp chọn file trong form */}
      <Panel
        title={
          pendingFiles.length > 0
            ? `Tệp đính kèm (${pendingFiles.length} file đã chọn)`
            : "Tệp đính kèm"
        }
        description="Bấm vùng bên dưới để mở hộp chọn file. Danh sách hiện ngay; upload lên server khi bạn bấm «Tạo dự án»."
      >
        <FileDropZone onFilesSelected={handleFilesAdd} disabled={submitting} />
        {pendingFiles.length > 0 ? (
          <>
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              ✓ Đã chọn {pendingFiles.length} file — sẽ tải lên khi bạn bấm «Tạo dự án».
            </div>
            <PendingFileList files={pendingFiles} onRemove={onFileRemove} disabled={submitting} />
          </>
        ) : (
          <p className="mt-3 text-center text-xs text-slate-400">Chưa chọn file nào.</p>
        )}
      </Panel>
    </div>
  );
}
