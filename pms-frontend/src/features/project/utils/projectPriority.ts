import type { ProjectDetail, ProjectSummary } from "../types";
import { applyPriorityFields } from "@/shared/config/project-options";

export function patchProjectPriority<T extends ProjectSummary>(
  project: T,
  priorityName: string,
): T {
  return applyPriorityFields(project, priorityName);
}

export function mergeProjectDetail(
  fromApi: ProjectDetail,
  priorityName: string,
): ProjectDetail {
  return applyPriorityFields(fromApi, priorityName);
}
