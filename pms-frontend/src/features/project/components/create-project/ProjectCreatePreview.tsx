import { Calendar, FolderKanban, Lock, Paperclip, User } from "lucide-react";
import { ProjectPriorityBadge } from "@/features/project/components/ProjectPriorityBadge";
import { PROJECT_PRIVACY_OPTIONS } from "@/shared/config/project-options";
import type { Member } from "@/features/workspace/types";

export type ProjectCreatePreviewState = {
  name: string;
  description: string;
  themeColor: string;
  statusName: string;
  priorityName: string;
  startDate: string;
  endDate: string;
  privacyMode: string;
  projectLeadUserId: string;
};

type Props = {
  workspaceName: string;
  members: Member[];
  state: ProjectCreatePreviewState;
  attachmentCount?: number;
};

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("vi-VN");
}

export function ProjectCreatePreview({
  workspaceName,
  members,
  state,
  attachmentCount = 0,
}: Props) {
  const lead = members.find((m) => String(m.userId) === state.projectLeadUserId);
  const privacyLabel =
    PROJECT_PRIVACY_OPTIONS.find((o) => o.value === state.privacyMode)?.label ??
    state.privacyMode;

  return (
    <div className="sticky top-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Xem trước
      </p>
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-100">
        <div
          className="h-24 transition-colors duration-300"
          style={{
            background: `linear-gradient(135deg, ${state.themeColor} 0%, #0f172a 70%)`,
          }}
        />
        <div className="relative px-5 pb-5 pt-0">
          <div
            className="-mt-8 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white"
            style={{ backgroundColor: state.themeColor }}
          >
            <FolderKanban className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {state.name.trim() || "Tên dự án của bạn"}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{workspaceName}</p>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {state.description.trim() || "Mô tả sẽ hiển thị tại đây…"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ProjectPriorityBadge name={state.priorityName} />
            <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
              {state.statusName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              <Lock className="h-3 w-3" />
              {privacyLabel}
            </span>
          </div>
          <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <span className="text-slate-500">PM: </span>
                {lead?.username ?? "—"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {formatDate(state.startDate)} → {formatDate(state.endDate)}
              </span>
            </li>
            {attachmentCount > 0 && (
              <li className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {attachmentCount} tệp đính kèm
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">
        Sau khi tạo, dự án xuất hiện trong sidebar và danh sách phòng ban.
      </p>
    </div>
  );
}
