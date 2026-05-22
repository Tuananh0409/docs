export type TaskAssignee = {
  userId: number;
  username: string;
  email: string;
};

export type TaskStatus = {
  id: number;
  statusName: string;
  position: number;
  colorCode: string | null;
};

export type TaskSummary = {
  id: number;
  taskKey: string;
  title: string;
  priority: string;
  statusId: number | null;
  statusName: string | null;
  statusColorCode: string | null;
  deadline: string | null;
  overdue: boolean;
  milestoneId: number | null;
  milestoneName: string | null;
  createdByUserId: number;
  createdByUsername: string;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
};

export type TaskDetail = TaskSummary & {
  projectId: number;
  projectCode: string;
  description: string | null;
};

export type MyTask = {
  id: number;
  taskKey: string;
  title: string;
  priority: string;
  statusName: string | null;
  statusColorCode: string | null;
  deadline: string | null;
  overdue: boolean;
  workspaceId: number;
  workspaceName: string;
  workspaceSlug: string;
  projectId: number;
  projectName: string;
  projectSlug: string;
  projectCode: string;
  assignees: TaskAssignee[];
  updatedAt: string;
};

export type MyTasksSummary = {
  totalAssigned: number;
  overdue: number;
  inProgress: number;
  done: number;
};

export type TaskComment = {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
};

export type TaskHistoryEntry = {
  id: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changedByUserId: number;
  changedByUsername: string;
  createdAt: string;
};

export type TaskAttachment = {
  id: number;
  taskId: number;
  fileName: string;
  fileType: string | null;
  fileSize: number;
  uploadedByUserId: number;
  uploadedByUsername: string;
  downloadUrl: string;
  createdAt: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority?: string;
  statusName?: string;
  milestoneId?: number;
  deadline?: string;
  assigneeUserIds?: number[];
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  priority?: string;
  statusName?: string;
  milestoneId?: number;
  deadline?: string;
  clearDeadline?: boolean;
  assigneeUserIds?: number[];
};
