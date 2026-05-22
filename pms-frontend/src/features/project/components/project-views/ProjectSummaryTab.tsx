import type { ReactNode } from "react";
import { Calendar } from "lucide-react";

import type { ProjectDetail, ProjectMember } from "../../types";

import { Badge } from "@/shared/components/ui/Badge";

import { ProjectPriorityBadge } from "../ProjectPriorityBadge";

import { ProjectPrioritySelect } from "../ProjectPrioritySelect";

import { ProjectPrivacySelect } from "../ProjectPrivacySelect";

import { ProjectStatusSelect } from "../ProjectStatusSelect";

import { getPrivacyModeLabel } from "@/shared/config/workspace-options";

import { ProjectAttachmentsSection } from "../ProjectAttachmentsSection";



type Props = {

  project: ProjectDetail;

  workspaceSlug: string;

  projectSlug: string;

  members: ProjectMember[];

  canUpload: boolean;

  canManageProject?: boolean;

  canEditPriority?: boolean;

  onPriorityChange?: (priorityName: string) => void;

  onStatusChange?: (statusName: string) => void;

  onPrivacyChange?: (privacyMode: string) => void;

  metaSaving?: "priority" | "status" | "privacy" | null;

};



function formatDate(iso: string | null) {

  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("vi-VN");

}



function MetaField({

  label,

  children,

}: {

  label: string;

  children: ReactNode;

}) {

  return (

    <div className="flex min-w-[140px] flex-col gap-1">

      <span className="text-xs font-medium text-slate-500">{label}</span>

      {children}

    </div>

  );

}



export function ProjectSummaryTab({

  project,

  workspaceSlug,

  projectSlug,

  members,

  canUpload,

  canManageProject,

  canEditPriority,

  onPriorityChange,

  onStatusChange,

  onPrivacyChange,

  metaSaving,

}: Props) {

  const theme = project.colorCode ?? "#2563eb";

  const saving = metaSaving != null;



  return (

    <div className="flex-1 bg-[#f6f7f9] p-6">

      <div className="mx-auto max-w-4xl space-y-6">

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="h-2" style={{ backgroundColor: theme }} />

          <div className="p-6">

            <div className="flex flex-wrap items-end gap-4">

              {canEditPriority && onPriorityChange ? (

                <MetaField label="Độ ưu tiên">

                  <ProjectPrioritySelect

                    key={`summary-priority-${project.id}-${project.priorityName}-${project.updatedAt}`}

                    value={project.priorityName}

                    disabled={saving}

                    onChange={onPriorityChange}

                  />

                </MetaField>

              ) : (

                <ProjectPriorityBadge name={project.priorityName} />

              )}

              {canManageProject && onStatusChange ? (

                <MetaField label="Trạng thái">

                  <ProjectStatusSelect

                    key={`summary-status-${project.id}-${project.statusName}-${project.updatedAt}`}

                    value={project.statusName}

                    disabled={saving}

                    onChange={onStatusChange}

                  />

                </MetaField>

              ) : (

                project.statusName && <Badge variant="muted">{project.statusName}</Badge>

              )}

              {canManageProject && onPrivacyChange ? (

                <MetaField label="Quyền riêng tư">

                  <ProjectPrivacySelect

                    key={`summary-privacy-${project.id}-${project.privacyMode}-${project.updatedAt}`}

                    value={project.privacyMode}

                    disabled={saving}

                    onChange={onPrivacyChange}

                  />

                </MetaField>

              ) : (

                <Badge variant="muted">{getPrivacyModeLabel(project.privacyMode)}</Badge>

              )}

              {project.myRole && <Badge variant="brand">Vai trò: {project.myRole}</Badge>}

            </div>

            <p className="mt-4 leading-relaxed text-slate-700">

              {project.description || "Chưa có mô tả dự án."}

            </p>

            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">

              <Calendar className="h-4 w-4" />

              {formatDate(project.startDate)} → {formatDate(project.endDate)}

            </p>

          </div>

        </div>



        {canUpload && (

          <ProjectAttachmentsSection

            workspaceSlug={workspaceSlug}

            projectSlug={projectSlug}

            canUpload={canUpload}

          />

        )}



        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-base font-semibold text-slate-900">

            Thành viên ({members.length})

          </h2>

          <ul className="mt-4 divide-y divide-slate-100">

            {members.map((m) => (

              <li key={m.userId} className="flex items-center justify-between py-3">

                <div>

                  <p className="font-medium text-slate-900">{m.username}</p>

                  <p className="text-xs text-slate-500">{m.email}</p>

                </div>

                <Badge variant="muted">{m.roleName}</Badge>

              </li>

            ))}

          </ul>

        </div>

      </div>

    </div>

  );

}


