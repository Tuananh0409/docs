import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import type { Member } from "@/features/workspace/types";
import { projectApi } from "../api/projectApi";
import type { ProjectMember } from "../types";
import {
  PROJECT_ROLE_OPTIONS,
  projectRoleLabel,
} from "../utils/projectRoles";
import { ApiClientError } from "@/shared/api/client";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { inputClass } from "@/shared/components/ui/formStyles";
import { useToast } from "@/shared/context/ToastContext";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  members: ProjectMember[];
  workspaceMembers: Member[];
  canManageMembers: boolean;
  onMembersChanged: () => void | Promise<void>;
};

export function ProjectMembersSection({
  workspaceSlug,
  projectSlug,
  members,
  workspaceMembers,
  canManageMembers,
  onMembersChanged,
}: Props) {
  const toast = useToast();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Member");
  const [adding, setAdding] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const projectUserIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members],
  );

  const candidates = useMemo(
    () => workspaceMembers.filter((m) => !projectUserIds.has(m.userId)),
    [workspaceMembers, projectUserIds],
  );

  async function handleAdd() {
    const userId = Number(selectedUserId);
    if (!userId || adding) return;
    setAdding(true);
    try {
      await projectApi.addMember(workspaceSlug, projectSlug, {
        userId,
        roleName: selectedRole,
      });
      toast.success("Đã thêm thành viên vào dự án");
      setSelectedUserId("");
      setSelectedRole("Member");
      await onMembersChanged();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Không thêm được thành viên");
    } finally {
      setAdding(false);
    }
  }

  async function handleRoleChange(userId: number, roleName: string) {
    setBusyUserId(userId);
    try {
      await projectApi.updateMemberRole(workspaceSlug, projectSlug, userId, roleName);
      toast.success("Đã cập nhật vai trò");
      await onMembersChanged();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Không cập nhật được vai trò");
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleRemove(userId: number, username: string) {
    if (!window.confirm(`Gỡ ${username} khỏi dự án?`)) return;
    setBusyUserId(userId);
    try {
      await projectApi.removeMember(workspaceSlug, projectSlug, userId);
      toast.success("Đã gỡ thành viên");
      await onMembersChanged();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Không gỡ được thành viên");
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          Thành viên ({members.length})
        </h2>
      </div>

      {canManageMembers && (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-600">
            <UserPlus className="h-3.5 w-3.5" />
            Chỉ thêm được người đã có trong phòng ban — tham gia ngay, không cần chấp nhận.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-sm">
              <span className="mb-1 block font-medium text-slate-700">Thành viên phòng ban</span>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={inputClass}
                disabled={adding || candidates.length === 0}
              >
                <option value="">
                  {candidates.length === 0
                    ? "Không còn ai để thêm"
                    : "Chọn thành viên…"}
                </option>
                {candidates.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.username} ({m.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="w-full sm:w-40 text-sm">
              <span className="mb-1 block font-medium text-slate-700">Vai trò dự án</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={inputClass}
                disabled={adding}
              >
                {PROJECT_ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              className="shrink-0"
              disabled={adding || !selectedUserId}
              onClick={() => void handleAdd()}
            >
              {adding ? "Đang thêm…" : "Thêm"}
            </Button>
          </div>
        </div>
      )}

      <ul className="mt-4 divide-y divide-slate-100">
        {members.length === 0 ? (
          <li className="py-4 text-sm text-slate-500">Chưa có thành viên.</li>
        ) : (
          members.map((m) => (
            <li key={m.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{m.username}</p>
                <p className="text-xs text-slate-500">{m.email}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Tham gia {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canManageMembers ? (
                  <>
                    <select
                      value={m.roleName}
                      disabled={busyUserId === m.userId}
                      onChange={(e) => void handleRoleChange(m.userId, e.target.value)}
                      className={`${inputClass} !py-1 text-xs`}
                      aria-label={`Vai trò ${m.username}`}
                    >
                      {PROJECT_ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      className="!px-2 text-xs text-red-600 hover:bg-red-50"
                      disabled={busyUserId === m.userId}
                      onClick={() => void handleRemove(m.userId, m.username)}
                    >
                      Gỡ
                    </Button>
                  </>
                ) : (
                  <Badge variant="muted">{projectRoleLabel(m.roleName)}</Badge>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
