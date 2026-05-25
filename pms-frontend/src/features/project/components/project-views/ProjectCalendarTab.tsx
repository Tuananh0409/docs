import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import type { ProjectMember } from "../../types";
import {
  buildMonthGrid,
  CALENDAR_WEEKDAY_LABELS,
  formatCalendarMonth,
  groupTasksByDeadline,
  isToday,
} from "../../utils/calendarUtils";
import { taskApi } from "@/features/task/api/taskApi";
import { CalendarDayQuickCreate } from "@/features/task/components/CalendarDayQuickCreate";
import { CalendarTaskChip } from "@/features/task/components/CalendarTaskChip";
import { TaskDetailModal } from "@/features/task/components/TaskDetailModal";
import type { TaskStatus, TaskSummary } from "@/features/task/types";
import { filterTasksByQuery } from "@/features/task/utils/taskUi";
import { ApiClientError } from "@/shared/api/client";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Button } from "@/shared/components/ui/Button";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  members: ProjectMember[];
  canWrite: boolean;
  canDelete: boolean;
  refreshKey: number;
  onTasksChanged: () => void;
};

export function ProjectCalendarTab({
  workspaceSlug,
  projectSlug,
  members,
  canWrite,
  canDelete,
  refreshKey,
  onTasksChanged,
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [createAnchor, setCreateAnchor] = useState<{
    iso: string;
    el: HTMLElement;
  } | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

  const creatingDayIso = createAnchor?.iso ?? null;

  const defaultStatusName =
    statuses.find((s) => s.statusName.toLowerCase() === "todo")?.statusName ??
    statuses[0]?.statusName ??
    "Todo";

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
      setError(err instanceof ApiClientError ? err.message : "Không tải được công việc");
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

  const byDeadline = useMemo(() => groupTasksByDeadline(filtered), [filtered]);
  const weeks = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  function goToday() {
    const n = new Date();
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth());
  }

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  async function handleQuickCreate(
    dayIso: string,
    input: {
      title: string;
      workItemType?: string;
      assigneeUserIds?: number[];
    },
  ) {
    setError("");
    try {
      await taskApi.create(workspaceSlug, projectSlug, {
        title: input.title,
        statusName: defaultStatusName,
        deadline: dayIso,
        assigneeUserIds: input.assigneeUserIds,
      });
      setCreateAnchor(null);
      onTasksChanged();
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tạo được công việc");
    }
  }

  function openCreateForDay(iso: string, cellEl: HTMLElement) {
    setCreateAnchor({ iso, el: cellEl });
    setHoveredDay(iso);
  }

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-1 flex-col bg-white">
      {error && (
        <div className="px-6 pt-3">
          <ErrorAlert message={error} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE1E6] px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm trong lịch"
              className="w-full rounded-[3px] border border-[#DFE1E6] bg-white py-1.5 pl-9 pr-3 text-sm text-[#172B4D] focus:border-[#4C9AFF] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF]"
            />
          </div>
          <Button type="button" variant="secondary" className="gap-1 text-xs" disabled>
            <Filter className="h-3.5 w-3.5" />
            Người thực hiện
          </Button>
          <Button type="button" variant="secondary" className="text-xs" disabled>
            Loại
          </Button>
          <Button type="button" variant="secondary" className="text-xs" disabled>
            Trạng thái
          </Button>
          <Button type="button" variant="secondary" className="text-xs" disabled>
            Thêm bộ lọc
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="rounded-[3px] border border-[#DFE1E6] bg-white px-3 py-1.5 text-sm font-medium text-[#42526E] hover:bg-[#F4F5F7]"
          >
            Hôm nay
          </button>
          <div className="flex items-center rounded-[3px] border border-[#DFE1E6]">
            <button
              type="button"
              onClick={goPrevMonth}
              className="px-2 py-1.5 text-[#42526E] hover:bg-[#F4F5F7]"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] border-x border-[#DFE1E6] px-3 py-1.5 text-center text-sm font-medium capitalize text-[#172B4D]">
              {formatCalendarMonth(viewYear, viewMonth)}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              className="px-2 py-1.5 text-[#42526E] hover:bg-[#F4F5F7]"
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <select
            disabled
            className="rounded-[3px] border border-[#DFE1E6] bg-white px-2 py-1.5 text-sm text-[#42526E]"
            defaultValue="month"
          >
            <option value="month">Tháng</option>
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="overflow-hidden rounded-[3px] border border-[#DFE1E6]">
          <div className="grid grid-cols-7 border-b border-[#DFE1E6] bg-[#F4F5F7]">
            {CALENDAR_WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="px-2 py-2 text-center text-xs font-semibold text-[#44546F]"
              >
                {label}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7 border-b border-[#DFE1E6] last:border-b-0"
            >
              {week.map((day) => {
                const dayTasks = byDeadline.get(day.iso) ?? [];
                const todayCell = isToday(day.iso);
                const hovered = hoveredDay === day.iso;
                const creating = creatingDayIso === day.iso;

                return (
                  <div
                    key={day.iso}
                    data-calendar-day={day.iso}
                    className={[
                      "relative min-h-[100px] border-r border-[#DFE1E6] p-1.5 last:border-r-0",
                      day.inCurrentMonth ? "bg-white" : "bg-[#FAFBFC]",
                      hovered && !creating ? "bg-[#EBECF0]/50" : "",
                    ].join(" ")}
                    onMouseEnter={() => setHoveredDay(day.iso)}
                    onMouseLeave={() => {
                      if (creatingDayIso !== day.iso) setHoveredDay(null);
                    }}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span
                        className={[
                          "inline-flex h-6 w-6 items-center justify-center text-xs font-medium",
                          todayCell
                            ? "rounded-[3px] bg-[#0052CC] text-white"
                            : day.inCurrentMonth
                              ? "text-[#172B4D]"
                              : "text-[#97A0AF]",
                        ].join(" ")}
                      >
                        {day.date.getDate()}
                      </span>
                      {canWrite && (hovered || creating) && (
                        <div className="group/plus relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const cell = (e.currentTarget as HTMLElement).closest(
                                "[data-calendar-day]",
                              ) as HTMLElement | null;
                              if (cell) openCreateForDay(day.iso, cell);
                            }}
                            className={[
                              "rounded p-0.5 hover:bg-[#091e420a]",
                              creating ? "text-[#0052CC]" : "text-[#42526E]",
                            ].join(" ")}
                            aria-label="Tạo công việc"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <span className="pointer-events-none absolute right-0 top-full z-20 mt-1 hidden whitespace-nowrap rounded-[3px] bg-[#172B4D] px-2 py-1 text-xs text-white shadow-md group-hover/plus:block">
                            Tạo công việc
                          </span>
                        </div>
                      )}
                    </div>

                    {creating ? (
                      <div
                        className="min-h-[40px] rounded-[3px] border border-[#DFE1E6] bg-[#F4F5F7]"
                        aria-hidden
                      />
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {dayTasks.slice(0, 4).map((task) => (
                          <CalendarTaskChip
                            key={task.id}
                            task={task}
                            onOpen={() => setDetailTaskId(task.id)}
                          />
                        ))}
                        {dayTasks.length > 4 && (
                          <span className="px-1 text-[10px] text-[#6B778C]">
                            +{dayTasks.length - 4} nữa
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#6B778C]">
          Chỉ hiển thị công việc có <strong>hạn chót</strong>. Bấm <strong>+</strong>{" "}
          để mở form tạo phía trên ô ngày (giống Jira).
        </p>
      </div>

      {createAnchor != null && canWrite && (
        <CalendarDayQuickCreate
          anchorEl={createAnchor.el}
          members={members}
          onCancel={() => setCreateAnchor(null)}
          onCreate={(input) => handleQuickCreate(createAnchor.iso, input)}
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
