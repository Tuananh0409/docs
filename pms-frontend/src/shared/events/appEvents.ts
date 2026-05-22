export const APP_EVENTS = {
  workspacesChanged: "pms:workspaces-changed",
  projectsChanged: "pms:projects-changed",
} as const;

export type WorkspacesChangedDetail = {
  workspaceId?: number;
};

export type ProjectsChangedDetail = {
  workspaceId: number;
  projectId?: number;
  priorityName?: string | null;
  priorityColorCode?: string | null;
  priorityWeight?: number | null;
  statusName?: string | null;
  privacyMode?: string | null;
};

export function notifyWorkspacesChanged(detail?: WorkspacesChangedDetail) {
  window.dispatchEvent(
    new CustomEvent<WorkspacesChangedDetail>(APP_EVENTS.workspacesChanged, { detail }),
  );
}

export function notifyProjectsChanged(detail: ProjectsChangedDetail) {
  window.dispatchEvent(
    new CustomEvent<ProjectsChangedDetail>(APP_EVENTS.projectsChanged, { detail }),
  );
}
