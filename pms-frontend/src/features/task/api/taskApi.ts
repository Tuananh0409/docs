import { apiFetch, apiUpload } from "@/shared/api/client";
import type {
  CreateTaskPayload,
  MyTask,
  MyTasksSummary,
  TaskAttachment,
  TaskComment,
  TaskDetail,
  TaskHistoryEntry,
  TaskStatus,
  TaskSummary,
  UpdateTaskPayload,
} from "../types";

function taskBase(workspaceSlug: string, projectSlug: string, taskId?: number) {
  const base = `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}/tasks`;
  return taskId != null ? `${base}/${taskId}` : base;
}

export type CreateTaskStatusPayload = {
  statusName: string;
  colorCode?: string;
};

export const taskApi = {
  listStatuses: (workspaceSlug: string, projectSlug: string) =>
    apiFetch<TaskStatus[]>(
      `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}/task-statuses`,
    ),

  createStatus: (
    workspaceSlug: string,
    projectSlug: string,
    body: CreateTaskStatusPayload,
  ) =>
    apiFetch<TaskStatus>(
      `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}/task-statuses`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),

  reorderStatuses: (
    workspaceSlug: string,
    projectSlug: string,
    orderedStatusIds: number[],
  ) =>
    apiFetch<TaskStatus[]>(
      `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}/task-statuses/reorder`,
      {
        method: "PATCH",
        body: JSON.stringify({ orderedStatusIds }),
      },
    ),

  deleteStatus: (
    workspaceSlug: string,
    projectSlug: string,
    statusId: number,
    moveToStatusId?: number,
  ) =>
    apiFetch<void>(
      `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}/task-statuses/${statusId}`,
      {
        method: "DELETE",
        body:
          moveToStatusId != null
            ? JSON.stringify({ moveToStatusId })
            : undefined,
      },
    ),

  listByProject: (workspaceSlug: string, projectSlug: string) =>
    apiFetch<TaskSummary[]>(taskBase(workspaceSlug, projectSlug)),

  get: (workspaceSlug: string, projectSlug: string, taskId: number) =>
    apiFetch<TaskDetail>(taskBase(workspaceSlug, projectSlug, taskId)),

  create: (workspaceSlug: string, projectSlug: string, body: CreateTaskPayload) =>
    apiFetch<TaskDetail>(taskBase(workspaceSlug, projectSlug), {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: number,
    body: UpdateTaskPayload,
  ) =>
    apiFetch<TaskDetail>(taskBase(workspaceSlug, projectSlug, taskId), {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  updateStatus: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: number,
    statusName: string,
  ) =>
    apiFetch<TaskDetail>(`${taskBase(workspaceSlug, projectSlug, taskId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ statusName }),
    }),

  delete: (workspaceSlug: string, projectSlug: string, taskId: number) =>
    apiFetch<void>(taskBase(workspaceSlug, projectSlug, taskId), { method: "DELETE" }),

  listComments: (workspaceSlug: string, projectSlug: string, taskId: number) =>
    apiFetch<TaskComment[]>(`${taskBase(workspaceSlug, projectSlug, taskId)}/comments`),

  addComment: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: number,
    content: string,
  ) =>
    apiFetch<TaskComment>(`${taskBase(workspaceSlug, projectSlug, taskId)}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  deleteComment: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: number,
    commentId: number,
  ) =>
    apiFetch<void>(
      `${taskBase(workspaceSlug, projectSlug, taskId)}/comments/${commentId}`,
      { method: "DELETE" },
    ),

  listHistory: (workspaceSlug: string, projectSlug: string, taskId: number) =>
    apiFetch<TaskHistoryEntry[]>(`${taskBase(workspaceSlug, projectSlug, taskId)}/history`),

  listAttachments: (workspaceSlug: string, projectSlug: string, taskId: number) =>
    apiFetch<TaskAttachment[]>(
      `${taskBase(workspaceSlug, projectSlug, taskId)}/attachments`,
    ),

  uploadAttachment: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: number,
    file: File,
  ) =>
    apiUpload<TaskAttachment>(
      `${taskBase(workspaceSlug, projectSlug, taskId)}/attachments`,
      file,
    ),

  deleteAttachment: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: number,
    attachmentId: number,
  ) =>
    apiFetch<void>(
      `${taskBase(workspaceSlug, projectSlug, taskId)}/attachments/${attachmentId}`,
      { method: "DELETE" },
    ),

  listMine: () => apiFetch<MyTask[]>("/api/tasks/mine"),

  mineSummary: () => apiFetch<MyTasksSummary>("/api/tasks/mine/summary"),
};
