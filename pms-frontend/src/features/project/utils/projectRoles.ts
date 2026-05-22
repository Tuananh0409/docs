export const PROJECT_ROLE_OPTIONS = [
  { value: "Member", label: "Thành viên" },
  { value: "Lead", label: "Trưởng nhóm" },
  { value: "PM", label: "Quản lý dự án (PM)" },
  { value: "Viewer", label: "Chỉ xem" },
] as const;

export function projectRoleLabel(roleName: string): string {
  const hit = PROJECT_ROLE_OPTIONS.find(
    (r) => r.value.toLowerCase() === roleName.toLowerCase(),
  );
  return hit?.label ?? roleName;
}

/** PM dự án hoặc Admin workspace — khớp BE requireProjectMemberManage. */
export function canManageProjectMembers(myRole: string | null | undefined): boolean {
  const r = myRole?.toLowerCase();
  return r === "admin" || r === "pm";
}
