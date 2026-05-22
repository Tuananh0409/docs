import { FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { ProjectPriorityBadge } from "./ProjectPriorityBadge";
import { projectPath } from "@/shared/routes/paths";
import type { ProjectSummary } from "../types";

type Props = {
  project: ProjectSummary;
  workspaceSlug: string;
};

export function ProjectCard({ project, workspaceSlug }: Props) {
  const color = project.colorCode ?? "#2563eb";

  return (
    <Link
      to={projectPath(workspaceSlug, project.slug, "backlog")}
      className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300/70 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          <FolderKanban className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900 group-hover:text-brand-700">
            {project.name}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{project.code}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ProjectPriorityBadge name={project.priorityName} />
        {project.statusName && (
          <Badge variant="muted" className="border border-slate-200 bg-slate-50">
            {project.statusName}
          </Badge>
        )}
        {project.myRole && (
          <Badge variant="brand" className="border-0 bg-brand-600 text-white">
            {project.myRole}
          </Badge>
        )}
      </div>
    </Link>
  );
}
