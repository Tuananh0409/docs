import { useCallback, useEffect, useMemo, useState } from "react";

import { GripVertical, Search } from "lucide-react";

import type { ProjectMember } from "../../types";

import { taskApi } from "@/features/task/api/taskApi";

import { BoardAddColumn } from "@/features/task/components/BoardAddColumn";
import { BoardColumnMenu } from "@/features/task/components/BoardColumnMenu";
import { DeleteBoardColumnModal } from "@/features/task/components/DeleteBoardColumnModal";

import {

  BoardColumnQuickCreate,

  type QuickCreateInput,

} from "@/features/task/components/BoardColumnQuickCreate";

import { TaskDetailModal } from "@/features/task/components/TaskDetailModal";

import { TaskPriorityAssigneeRow } from "@/features/task/components/TaskInlineAssignee";

import { TaskPriorityIcon } from "@/features/task/components/TaskPriorityIcon";

import type { TaskDetail, TaskStatus, TaskSummary } from "@/features/task/types";

import {

  filterTasksByQuery,

  formatDeadline,

  groupTasksByStatus,

  reorderStatusesList,

} from "@/features/task/utils/taskUi";

import { ApiClientError } from "@/shared/api/client";

import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";

import { LoadingState } from "@/shared/components/feedback/LoadingState";

import { useToast } from "@/shared/context/ToastContext";



type Props = {

  workspaceSlug: string;

  projectSlug: string;

  members: ProjectMember[];

  canWrite: boolean;

  canDelete: boolean;

  searchQuery: string;

  refreshKey: number;

  onTasksChanged: () => void;

};



export function ProjectBoardTab({

  workspaceSlug,

  projectSlug,

  members,

  canWrite,

  canDelete,

  searchQuery,

  refreshKey,

  onTasksChanged,

}: Props) {

  const toast = useToast();

  const [tasks, setTasks] = useState<TaskSummary[]>([]);

  const [statuses, setStatuses] = useState<TaskStatus[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);

  const [draggingColumnId, setDraggingColumnId] = useState<number | null>(null);

  const [columnDropTargetId, setColumnDropTargetId] = useState<number | null>(null);

  const [columnToDelete, setColumnToDelete] = useState<TaskStatus | null>(null);

  const [deletingColumn, setDeletingColumn] = useState(false);



  const load = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      const [taskList, statusList] = await Promise.all([

        taskApi.listByProject(workspaceSlug, projectSlug),

        taskApi.listStatuses(workspaceSlug, projectSlug),

      ]);

      setTasks(taskList);

      setStatuses(statusList);

    } catch (err) {

      setError(err instanceof ApiClientError ? err.message : "Không tải được task");

    } finally {

      setLoading(false);

    }

  }, [workspaceSlug, projectSlug]);



  useEffect(() => {

    load();

  }, [load, refreshKey]);



  const filtered = useMemo(

    () => filterTasksByQuery(tasks, searchQuery),

    [tasks, searchQuery],

  );

  const grouped = useMemo(

    () => groupTasksByStatus(filtered, statuses),

    [filtered, statuses],

  );



  function notifyTaskCreated(created: TaskDetail) {

    toast.success(`Đã tạo công việc '${created.taskKey}'.`, [

      {

        label: "Xem",

        onClick: () => setDetailTaskId(created.id),

      },

      {

        label: "Sao chép liên kết",

        onClick: () => {

          const text = `${created.taskKey}: ${created.title}`;

          void navigator.clipboard.writeText(text);

          toast.info("Đã sao chép mã công việc");

        },

      },

    ]);

  }



  async function handleQuickCreate(statusName: string, input: QuickCreateInput) {

    try {

      const created = await taskApi.create(workspaceSlug, projectSlug, {

        title: input.title,

        statusName,

        priority: input.priority ?? "Medium",

        deadline: input.deadline,

        assigneeUserIds: input.assigneeUserIds,

      });

      onTasksChanged();

      await load();

      notifyTaskCreated(created);

    } catch (err) {

      const msg = err instanceof ApiClientError ? err.message : "Không tạo được task";

      setError(msg);

      toast.error(msg);

      throw err;

    }

  }



  async function handleAddColumn(statusName: string, colorCode: string) {

    const created = await taskApi.createStatus(workspaceSlug, projectSlug, {

      statusName,

      colorCode,

    });

    await load();

    toast.success(`Đã thêm cột "${created.statusName}"`);

  }



  async function handleConfirmDeleteColumn(moveToStatusId: number) {

    if (!columnToDelete) return;

    setDeletingColumn(true);

    try {

      await taskApi.deleteStatus(

        workspaceSlug,

        projectSlug,

        columnToDelete.id,

        moveToStatusId,

      );

      onTasksChanged();

      await load();

      toast.success(`Đã xóa cột "${columnToDelete.statusName}"`);

      setColumnToDelete(null);

    } catch (err) {

      toast.error(err instanceof ApiClientError ? err.message : "Không xóa được cột");

    } finally {

      setDeletingColumn(false);

    }

  }



  async function handleTaskDrop(statusName: string, taskId: number) {

    if (!canWrite || draggingColumnId != null) return;

    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.statusName === statusName) return;

    try {

      await taskApi.updateStatus(workspaceSlug, projectSlug, taskId, statusName);

      onTasksChanged();

      await load();

    } catch (err) {

      setError(err instanceof ApiClientError ? err.message : "Không đổi trạng thái");

    }

  }



  async function handleColumnReorder(fromId: number, toId: number) {

    if (!canWrite || fromId === toId) return;

    const previous = statuses;

    const reordered = reorderStatusesList(statuses, fromId, toId);

    setStatuses(reordered);

    try {

      const saved = await taskApi.reorderStatuses(

        workspaceSlug,

        projectSlug,

        reordered.map((s) => s.id),

      );

      setStatuses(saved);

    } catch (err) {

      setStatuses(previous);

      toast.error(

        err instanceof ApiClientError ? err.message : "Không sắp xếp được cột",

      );

    }

  }



  if (loading) return <LoadingState />;



  return (

    <div className="flex min-h-0 flex-1 flex-col bg-[#f0f1f4] p-2">

      {error && <ErrorAlert message={error} className="mb-2" />}



      <div className="flex min-h-0 flex-1 items-start gap-2 overflow-x-auto pb-1.5">

        {statuses.map((col) => {

          const columnTasks = grouped.get(col.statusName) ?? [];

          const isDone = col.statusName.toLowerCase() === "done";

          const accent = col.colorCode ?? "#94a3b8";

          const isColumnDropTarget =

            draggingColumnId != null &&

            columnDropTargetId === col.id &&

            draggingColumnId !== col.id;

          const isColumnDragging = draggingColumnId === col.id;



          return (

            <div

              key={col.id}

              className={[

                "flex w-[260px] shrink-0 flex-col transition",

                isColumnDropTarget ? "scale-[1.02]" : "",

                isColumnDragging ? "opacity-60" : "",

              ].join(" ")}

              onDragEnter={(e) => {

                if (!draggingColumnId) return;

                e.preventDefault();

                setColumnDropTargetId(col.id);

              }}

              onDragOver={(e) => {

                e.preventDefault();

                e.dataTransfer.dropEffect = draggingColumnId != null ? "move" : "move";

              }}

              onDragLeave={(e) => {

                if (e.currentTarget.contains(e.relatedTarget as Node)) return;

                if (columnDropTargetId === col.id) setColumnDropTargetId(null);

              }}

              onDrop={(e) => {

                e.preventDefault();

                const columnIdRaw = e.dataTransfer.getData("columnId");

                const taskIdRaw = e.dataTransfer.getData("taskId");



                if (columnIdRaw) {

                  const fromId = Number(columnIdRaw);

                  if (fromId && fromId !== col.id) {

                    void handleColumnReorder(fromId, col.id);

                  }

                  setDraggingColumnId(null);

                  setColumnDropTargetId(null);

                  return;

                }



                if (taskIdRaw) {

                  const taskId = Number(taskIdRaw);

                  if (taskId) void handleTaskDrop(col.statusName, taskId);

                  setDraggingTaskId(null);

                }

              }}

            >

              <section

                className={[

                  "flex max-h-full min-h-[260px] flex-col overflow-hidden rounded-md border bg-[#f8f9fb] shadow-sm",

                  isColumnDropTarget

                    ? "border-brand-400 ring-2 ring-brand-400/40"

                    : "border-slate-200",

                ].join(" ")}

                style={{ boxShadow: `inset 0 2px 0 0 ${accent}` }}

              >

                <header className="flex shrink-0 items-center gap-0.5 px-1 py-1.5">
                  <div
                    draggable={canWrite}
                    title={canWrite ? "Kéo tiêu đề cột để đổi thứ tự" : undefined}
                    onDragStart={(e) => {
                      if (!canWrite) return;
                      e.stopPropagation();
                      setDraggingColumnId(col.id);
                      setDraggingTaskId(null);
                      e.dataTransfer.setData("columnId", String(col.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDraggingColumnId(null);
                      setColumnDropTargetId(null);
                    }}
                    className={[
                      "flex min-w-0 flex-1 select-none items-center gap-1.5 rounded px-1",
                      canWrite
                        ? "cursor-grab hover:bg-slate-200/60 active:cursor-grabbing"
                        : "",
                    ].join(" ")}
                  >
                    {canWrite && (
                      <GripVertical
                        className="h-3.5 w-3.5 shrink-0 text-slate-400"
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                    <div className="flex min-w-0 items-center gap-1">
                      <h3 className="truncate text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {col.statusName}
                      </h3>
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-semibold text-slate-600">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>
                  {canWrite && (
                    <BoardColumnMenu
                      disabled={loading}
                      onRequestDelete={() => setColumnToDelete(col)}
                    />
                  )}
                </header>



                <div className="flex min-h-[100px] flex-1 flex-col gap-1.5 overflow-y-auto px-2 pb-1">

                {columnTasks.map((task) => (

                  <button

                    key={task.id}

                    type="button"

                    draggable={canWrite && draggingColumnId == null}

                    onDragStart={(e) => {

                      e.stopPropagation();

                      setDraggingTaskId(task.id);

                      setDraggingColumnId(null);

                      e.dataTransfer.setData("taskId", String(task.id));

                      e.dataTransfer.effectAllowed = "move";

                    }}

                    onDragEnd={() => setDraggingTaskId(null)}

                    onClick={() => setDetailTaskId(task.id)}

                    className={[

                      "rounded border border-slate-200/90 bg-white p-2 text-left shadow-sm transition",

                      "hover:border-slate-300",

                      draggingTaskId === task.id ? "opacity-50" : "",

                    ].join(" ")}

                  >

                    <p className="text-sm font-medium leading-snug text-slate-800">{task.title}</p>

                    <div className="mt-1.5 flex items-center justify-between gap-1">

                      <div className="flex items-center gap-1.5">

                        <CheckSquareIcon />

                        <span className="font-mono text-xs text-slate-500">{task.taskKey}</span>

                      </div>

                      <TaskPriorityAssigneeRow

                        workspaceSlug={workspaceSlug}

                        projectSlug={projectSlug}

                        taskId={task.id}

                        assignees={task.assignees}

                        members={members}

                        canWrite={canWrite}

                        onUpdated={load}

                        priority={

                          <TaskPriorityIcon

                            priority={task.priorityName}

                            colorCode={task.priorityColorCode}

                            size="xs"

                          />

                        }

                      />

                    </div>

                    {task.deadline && (

                      <p

                        className={`mt-1 text-xs ${

                          task.overdue ? "font-medium text-red-600" : "text-slate-500"

                        }`}

                      >

                        {formatDeadline(task.deadline)}

                      </p>

                    )}

                  </button>

                ))}



                {isDone && columnTasks.length === 0 && (

                  <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-white/80 px-2 py-4 text-center">

                    <Search className="h-4 w-4 text-slate-300" />

                    <p className="mt-1 text-xs leading-tight text-slate-400">

                      Xem công việc đã hoàn thành

                    </p>

                  </div>

                )}

                </div>



                {canWrite && (

                  <footer className="shrink-0 px-1.5 pb-1.5 pt-0">

                    <BoardColumnQuickCreate

                      statusName={col.statusName}

                      members={members}

                      onCreate={(data) => handleQuickCreate(col.statusName, data)}

                    />

                  </footer>

                )}

              </section>

            </div>

          );

        })}



        {canWrite && (

          <BoardAddColumn

            disabled={loading}

            onCreate={handleAddColumn}

          />

        )}

      </div>



      {columnToDelete != null && (

        <DeleteBoardColumnModal

          status={columnToDelete}

          statuses={statuses}

          taskCount={grouped.get(columnToDelete.statusName)?.length ?? 0}

          saving={deletingColumn}

          onClose={() => !deletingColumn && setColumnToDelete(null)}

          onConfirm={(moveToId) => void handleConfirmDeleteColumn(moveToId)}

        />

      )}



      {detailTaskId != null && (

        <TaskDetailModal

          workspaceSlug={workspaceSlug}

          projectSlug={projectSlug}

          taskId={detailTaskId}

          members={members}

          statuses={statuses}

          canWrite={canWrite}

          canDelete={canDelete}

          onClose={() => setDetailTaskId(null)}

          onUpdated={() => {

            onTasksChanged();

            load();

          }}

          onDeleted={() => {

            onTasksChanged();

            setDetailTaskId(null);

            load();

          }}

        />

      )}

    </div>

  );

}



function CheckSquareIcon() {

  return (

    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-brand-600 text-white">

      <svg className="h-2 w-2" viewBox="0 0 12 12" fill="currentColor" aria-hidden>

        <path d="M10 3L5 8.5 2 6l1-1 2 2 4-4 1 0z" />

      </svg>

    </span>

  );

}


