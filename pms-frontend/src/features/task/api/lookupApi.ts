import { apiFetch } from "@/shared/api/client";

export type TaskPriorityLookup = {
  id: number;
  name: string;
  weight: number;
  colorCode: string | null;
};

export const lookupApi = {
  listTaskPriorities: () =>
    apiFetch<TaskPriorityLookup[]>("/api/lookups/task-priorities"),
};
