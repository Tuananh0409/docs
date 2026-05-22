import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { taskApi } from "../api/taskApi";
import type { MyTask, MyTasksSummary } from "../types";
import { formatDeadline } from "../utils/taskUi";
import { ApiClientError } from "@/shared/api/client";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { projectPath } from "@/shared/routes/paths";
import { TaskAssigneeAvatars } from "../components/TaskAssigneeAvatars";
import { TaskPriorityIcon } from "../components/TaskPriorityIcon";

export function MyTasksPage() {
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [summary, setSummary] = useState<MyTasksSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "overdue" | "in_progress" | "done">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, sum] = await Promise.all([taskApi.listMine(), taskApi.mineSummary()]);
      setTasks(list);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được công việc");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = tasks.filter((t) => {
    if (filter === "overdue") return t.overdue;
    if (filter === "in_progress")
      return t.statusName?.toLowerCase() === "in progress";
    if (filter === "done") return t.statusName?.toLowerCase() === "done";
    return true;
  });

  return (
    <>
      <PageHeader
        title="Công việc của tôi"
        description="Các task được gán cho bạn trên mọi dự án."
      />

      {error && <ErrorAlert message={error} className="mb-4" />}

      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Được gán", value: summary.totalAssigned, key: "all" as const },
            { label: "Quá hạn", value: summary.overdue, key: "overdue" as const },
            { label: "Đang làm", value: summary.inProgress, key: "in_progress" as const },
            { label: "Hoàn thành", value: summary.done, key: "done" as const },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setFilter(s.key)}
              className={`rounded-xl border p-4 text-left transition ${
                filter === s.key
                  ? "border-brand-400 bg-brand-50/50 ring-2 ring-brand-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Không có công việc nào trong bộ lọc này.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          {filtered.map((task) => (
            <li key={task.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  to={projectPath(task.workspaceSlug, task.projectSlug, "board")}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  {task.taskKey}
                </Link>
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-500">
                  {task.workspaceName} / {task.projectName}
                </p>
              </div>
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                style={{
                  backgroundColor: task.statusColorCode ?? "#94a3b8",
                }}
              >
                {task.statusName ?? "—"}
              </span>
              <TaskPriorityIcon
                priority={task.priorityName}
                colorCode={task.priorityColorCode}
                size="sm"
                showLabel
              />
              {task.deadline && (
                <span
                  className={`text-xs ${task.overdue ? "font-medium text-red-600" : "text-slate-500"}`}
                >
                  {formatDeadline(task.deadline)}
                </span>
              )}
              <TaskAssigneeAvatars assignees={task.assignees} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
