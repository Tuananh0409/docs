import type { ProjectDetail } from "../types";
import { applyPriorityFields } from "@/shared/config/project-options";

export function notifyProjectPatchDetail(
  project: ProjectDetail,
  patch: Partial<Pick<ProjectDetail, "priorityName" | "statusName" | "privacyMode">>,
) {
  let next = { ...project, ...patch };
  if (patch.priorityName) {
    next = applyPriorityFields(next, patch.priorityName);
  }
  return next;
}
