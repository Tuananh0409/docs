import { Link } from "react-router-dom";
import {
  Download,
  Maximize2,
  MoreHorizontal,
  Settings2,
  Share2,
  Users,
  Zap,
} from "lucide-react";
import type { ProjectDetail } from "../../types";
import { ProjectPriorityBadge } from "../ProjectPriorityBadge";
import { ProjectPrioritySelect } from "../ProjectPrioritySelect";
import { ProjectPrivacySelect } from "../ProjectPrivacySelect";
import { ProjectStatusSelect } from "../ProjectStatusSelect";
import { getPrivacyModeLabel } from "@/shared/config/workspace-options";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { workspacePath } from "@/shared/routes/paths";

type Props = {
  workspaceName: string;
  workspaceSlug: string;
  project: ProjectDetail;
  memberCount: number;
  onOpenSettings?: () => void;
  canManage?: boolean;
  onPriorityChange?: (priorityName: string) => void;
  onStatusChange?: (statusName: string) => void;
  onPrivacyChange?: (privacyMode: string) => void;
  metaSaving?: "priority" | "status" | "privacy" | null;
};

export function ProjectShellHeader({
  workspaceName,
  workspaceSlug,
  project,
  memberCount,
  onOpenSettings,
  canManage,
  onPriorityChange,
  onStatusChange,
  onPrivacyChange,
  metaSaving,
}: Props) {
  const accent = project.colorCode ?? "#eab308";

  return (
    <header className="border-b border-slate-200 bg-white px-6 pt-4">
      <Link
        to={workspacePath(workspaceSlug)}
        className="text-xs font-medium text-slate-500 transition hover:text-brand-600"
      >
        {workspaceName}
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            {project.code.slice(0, 2)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-slate-900">{project.name}</h1>
              {onPriorityChange ? (
                <ProjectPrioritySelect
                  key={`priority-${project.id}-${project.priorityName}-${project.updatedAt}`}
                  compact
                  value={project.priorityName}
                  disabled={metaSaving != null}
                  onChange={onPriorityChange}
                />
              ) : (
                <ProjectPriorityBadge name={project.priorityName} />
              )}
              {canManage && onStatusChange ? (
                <ProjectStatusSelect
                  key={`status-${project.id}-${project.statusName}-${project.updatedAt}`}
                  compact
                  value={project.statusName}
                  disabled={metaSaving != null}
                  onChange={onStatusChange}
                />
              ) : (
                project.statusName && <Badge variant="muted">{project.statusName}</Badge>
              )}
              {canManage && onPrivacyChange ? (
                <ProjectPrivacySelect
                  key={`privacy-${project.id}-${project.privacyMode}-${project.updatedAt}`}
                  compact
                  value={project.privacyMode}
                  disabled={metaSaving != null}
                  onChange={onPrivacyChange}
                />
              ) : (
                <Badge variant="muted">{getPrivacyModeLabel(project.privacyMode)}</Badge>
              )}
              <span
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                title="Thành viên dự án"
              >
                <Users className="h-3.5 w-3.5" />
                {memberCount}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {project.code} · PM: {project.projectManagerUsername ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-slate-500" disabled title="Sắp có">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-slate-500" disabled title="Sắp có">
            <Zap className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-slate-500" disabled title="Sắp có">
            <Download className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-slate-500" disabled title="Sắp có">
            <Maximize2 className="h-4 w-4" />
          </Button>
          {canManage && onOpenSettings && (
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-9 p-0 text-slate-500"
              onClick={onOpenSettings}
              title="Cài đặt dự án"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
          <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-slate-500" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
