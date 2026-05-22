import { useEffect, useState } from "react";
import { lookupApi, type TaskPriorityLookup } from "../api/lookupApi";
import {
  DEFAULT_TASK_PRIORITY,
  TASK_PRIORITY_OPTIONS,
  type TaskPriorityName,
} from "@/shared/config/task-priority-options";
import { sortTaskPriorities } from "../utils/taskUi";

export type TaskPriorityOption = {
  id?: number;
  name: TaskPriorityName;
  weight: number;
  colorCode: string | null;
};

const FALLBACK: TaskPriorityOption[] = TASK_PRIORITY_OPTIONS.map((p) => ({
  name: p.name,
  weight: p.weight,
  colorCode: p.color,
}));

/** Gộp API + fallback để luôn có đủ 5 mức (kể cả khi DB chưa chạy V10). */
function mergePriorities(apiRows: TaskPriorityLookup[]): TaskPriorityOption[] {
  const apiByName = new Map(apiRows.map((r) => [r.name, r]));
  const merged: TaskPriorityOption[] = [];

  for (const fb of FALLBACK) {
    const api = apiByName.get(fb.name);
    if (api) {
      merged.push({
        id: api.id,
        name: fb.name,
        weight: api.weight,
        colorCode: api.colorCode,
      });
      apiByName.delete(fb.name);
    } else {
      merged.push({ ...fb });
    }
  }

  for (const r of apiByName.values()) {
    merged.push({
      id: r.id,
      name: r.name as TaskPriorityName,
      weight: r.weight,
      colorCode: r.colorCode,
    });
  }

  return sortTaskPriorities(merged);
}

export function useTaskPriorities() {
  const [priorities, setPriorities] = useState<TaskPriorityOption[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    lookupApi
      .listTaskPriorities()
      .then((rows: TaskPriorityLookup[]) => {
        if (cancelled) return;
        if (rows.length === 0) {
          setPriorities(FALLBACK);
          return;
        }
        setPriorities(mergePriorities(rows));
      })
      .catch(() => {
        setPriorities(FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { priorities, loading, defaultPriority: DEFAULT_TASK_PRIORITY };
}
