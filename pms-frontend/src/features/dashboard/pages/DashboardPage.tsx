import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiClientError } from "@/shared/api/client";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { useAuth } from "@/shared/context/AuthContext";
import { canCreateWorkspace } from "@/shared/utils/workspacePermissions";
import { taskApi } from "@/features/task/api/taskApi";
import type { MyTasksSummary } from "@/features/task/types";
import { workspaceApi } from "@/features/workspace/api/workspaceApi";
import type { Workspace } from "@/features/workspace/types";
import { workspacePath } from "@/shared/routes/paths";

export function DashboardPage() {
  const { user } = useAuth();
  const canCreate = canCreateWorkspace(user);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [taskSummary, setTaskSummary] = useState<MyTasksSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ws, tasks] = await Promise.all([
        workspaceApi.list(),
        taskApi.mineSummary().catch(() => null),
      ]);
      setWorkspaces(ws);
      setTaskSummary(tasks);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Không tải được dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title={`Xin chào, ${user?.username ?? "bạn"}`}
        description="Tổng quan workspace và công việc được gán cho bạn."
      />

      {error && <ErrorAlert message={error} className="mb-4" />}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Workspace",
            value: loading ? "—" : String(workspaces.length),
            live: true,
          },
          {
            label: "Task của tôi",
            value: loading
              ? "—"
              : taskSummary != null
                ? String(taskSummary.totalAssigned)
                : "0",
            live: true,
          },
          {
            label: "Đang làm",
            value: loading
              ? "—"
              : taskSummary != null
                ? String(taskSummary.inProgress)
                : "0",
            live: true,
          },
          {
            label: "Quá hạn",
            value: loading
              ? "—"
              : taskSummary != null
                ? String(taskSummary.overdue)
                : "0",
            live: true,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Workspace gần đây</h2>
          <Link to="/workspaces">
            <Button variant="secondary">Xem tất cả</Button>
          </Link>
        </div>

        {loading ? (
          <LoadingState />
        ) : workspaces.length === 0 ? (
          <p className="text-sm text-slate-500">
            {canCreate ? (
              <>
                Chưa có workspace.{" "}
                <Link to="/workspaces" className="font-medium text-brand-600 hover:underline">
                  Tạo workspace đầu tiên
                </Link>
              </>
            ) : (
              <>
                Bạn chưa thuộc workspace nào. Chờ admin mời hoặc kiểm tra{" "}
                <span className="font-medium text-slate-700">thông báo</span> (🔔 trên góc phải).
              </>
            )}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {workspaces.slice(0, 5).map((w) => (
              <li key={w.id}>
                <Link
                  to={workspacePath(w.slug)}
                  className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{w.name}</span>
                  <span className="text-sm text-slate-500">{w.myRole}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
