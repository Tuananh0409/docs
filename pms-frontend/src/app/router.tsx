import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { MilestonesPage } from "@/features/project/pages/MilestonesPage";
import { CreateProjectPage } from "@/features/project/pages/CreateProjectPage";
import { ProjectDetailPage } from "@/features/project/pages/ProjectDetailPage";
import { ProjectsPage } from "@/features/project/pages/ProjectsPage";
import { ReportsPage } from "@/features/report/pages/ReportsPage";
import { MembersPage } from "@/features/settings/pages/MembersPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { MyTasksPage } from "@/features/task/pages/MyTasksPage";
import { AcceptInvitationPage } from "@/features/workspace/pages/AcceptInvitationPage";
import { CreateWorkspacePage } from "@/features/workspace/pages/CreateWorkspacePage";
import { WorkspaceDetailPage } from "@/features/workspace/pages/WorkspaceDetailPage";
import { WorkspaceListPage } from "@/features/workspace/pages/WorkspaceListPage";
import { AppShell } from "@/shared/components/layout/AppShell";
import { RequireAuth } from "./RequireAuth";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="workspaces" element={<WorkspaceListPage />} />
          <Route path="workspaces/new" element={<CreateWorkspacePage />} />
          <Route path="workspaces/:workspaceSlug" element={<WorkspaceDetailPage />} />
          <Route path="workspaces/:workspaceSlug/projects/new" element={<CreateProjectPage />} />
          <Route
            path="workspaces/:workspaceSlug/projects/:projectSlug"
            element={<ProjectDetailPage />}
          />
          <Route path="my-tasks" element={<MyTasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="milestones" element={<MilestonesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="invitations/:token/accept"
            element={<AcceptInvitationPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
