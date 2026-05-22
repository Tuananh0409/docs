import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import type { ProjectDetail, ProjectMember } from "../../types";
import {
  buildTimelineBars,
  buildWeekColumns,
  computeTimelineRange,
  dayOffset,
  formatMonthYear,
  todayOffset,
  type TimelineBar,
  type TimelineZoom,
  ZOOM_DAY_WIDTH,
} from "../../utils/timelineUtils";
import { taskApi } from "@/features/task/api/taskApi";
import { TaskDetailModal } from "@/features/task/components/TaskDetailModal";
import type { TaskStatus, TaskSummary } from "@/features/task/types";
import { filterTasksByQuery, isDoneStatus } from "@/features/task/utils/taskUi";
import { ApiClientError } from "@/shared/api/client";
import { useToast } from "@/shared/context/ToastContext";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import {
  TimelineTaskBar,
  type TimelineDateCommit,
} from "./TimelineTaskBar";
const LEFT_COL_WIDTH = 280;
const ROW_HEIGHT = 40;

type Props = {
  project: ProjectDetail;
  workspaceSlug: string;
  projectSlug: string;
  members: ProjectMember[];
  canWrite: boolean;
  canDelete: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  refreshKey: number;
  onTasksChanged: () => void;
};

export function ProjectTimelineTab({
  project,
  workspaceSlug,
  projectSlug,
  members,
  canWrite,
  canDelete,
  searchQuery,
  onSearchChange,
  refreshKey,
  onTasksChanged,
}: Props) {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState<TimelineZoom>("week");
  const [rangeShift, setRangeShift] = useState(0);
  const [hideDone, setHideDone] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<number | null>(null);
  const toast = useToast();

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

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

  const filtered = useMemo(() => {
    let list = filterTasksByQuery(tasks, searchQuery);
    if (hideDone) {
      list = list.filter((t) => !isDoneStatus(t.statusName));
    }
    return list;
  }, [tasks, searchQuery, hideDone]);

  const bars = useMemo(
    () => buildTimelineBars(project, filtered),
    [project, filtered],
  );

  const dayWidth = ZOOM_DAY_WIDTH[zoom];

  const range = useMemo(() => {
    const base = computeTimelineRange(project, bars);
    const shiftDays = rangeShift * (zoom === "week" ? 28 : 60);
    const start = new Date(base.start.getTime() + shiftDays * 86_400_000);
    const end = new Date(base.end.getTime() + shiftDays * 86_400_000);
    const totalDays =
      Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return { start, end, totalDays };
  }, [project, bars, rangeShift, zoom]);

  const weekCols = useMemo(
    () => buildWeekColumns(range.start, range.totalDays, dayWidth),
    [range.start, range.totalDays, dayWidth],
  );

  const chartWidth = range.totalDays * dayWidth;
  const todayOff = todayOffset(range.start, range.totalDays);

  const scrollToToday = useCallback(() => {
    if (todayOff == null || !bodyScrollRef.current) return;
    const x = todayOff * dayWidth - bodyScrollRef.current.clientWidth / 3;
    bodyScrollRef.current.scrollLeft = Math.max(0, x);
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  }, [todayOff, dayWidth]);

  useEffect(() => {
    if (!loading && todayOff != null) {
      const t = window.setTimeout(scrollToToday, 50);
      return () => window.clearTimeout(t);
    }
  }, [loading, scrollToToday, todayOff]);

  function syncHeaderScroll(scrollLeft: number) {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollLeft;
    }
  }

  function handleBodyScroll(el: HTMLDivElement) {
    syncHeaderScroll(el.scrollLeft);
    if (leftColRef.current && leftColRef.current.scrollTop !== el.scrollTop) {
      leftColRef.current.scrollTop = el.scrollTop;
    }
  }

  function handleLeftScroll(el: HTMLDivElement) {
    if (bodyScrollRef.current && bodyScrollRef.current.scrollTop !== el.scrollTop) {
      bodyScrollRef.current.scrollTop = el.scrollTop;
    }
  }

  const commitTaskDates = useCallback(
    async (taskId: number, payload: TimelineDateCommit) => {
      setSavingTaskId(taskId);
      const prev = tasks.find((t) => t.id === taskId);
      try {
        const updated = await taskApi.update(workspaceSlug, projectSlug, taskId, {
          startDate: payload.startDate,
          deadline: payload.deadline,
        });
        setTasks((list) =>
          list.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  startDate: updated.startDate,
                  deadline: updated.deadline,
                  updatedAt: updated.updatedAt,
                }
              : t,
          ),
        );
        onTasksChanged();
        toast.success("Đã lưu ngày công việc");
      } catch (err) {
        if (prev) {
          setTasks((list) =>
            list.map((t) => (t.id === taskId ? prev : t)),
          );
        }
        const msg =
          err instanceof ApiClientError ? err.message : "Không lưu được ngày";
        toast.error(msg);
        throw err;
      } finally {
        setSavingTaskId(null);
      }
    },
    [workspaceSlug, projectSlug, tasks, onTasksChanged, toast],
  );

  function renderBar(row: TimelineBar) {
    if (row.kind === "project" || !row.task) {
      const left = dayOffset(range.start, row.start) * dayWidth;
      const spanDays = Math.max(1, dayOffset(row.start, row.end) + 1);
      const width = spanDays * dayWidth - 2;
      return (
        <div
          key={row.id}
          className="absolute top-1/2 h-6 max-w-full -translate-y-1/2 truncate rounded-[3px] px-2 text-left text-[11px] font-medium leading-6 text-white shadow-sm"
          style={{
            left: left + 1,
            width: Math.max(dayWidth - 2, width),
            backgroundColor: row.color,
          }}
          title={row.label}
        >
          {row.label}
        </div>
      );
    }

    return (
      <TimelineTaskBar
        key={row.id}
        bar={row}
        rangeStart={range.start}
        dayWidth={dayWidth}
        canWrite={canWrite}
        saving={savingTaskId === row.task.id}
        onCommit={commitTaskDates}
        onOpen={setDetailTaskId}
      />
    );
  }

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-1 flex-col bg-white">
      {error && (
        <div className="px-4 pt-3">
          <ErrorAlert message={error} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE1E6] px-4 py-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm công việc…"
            className="w-full rounded-[3px] border border-[#DFE1E6] py-1.5 pl-9 pr-3 text-sm focus:border-[#4C9AFF] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHideDone((v) => !v)}
            className={[
              "inline-flex items-center gap-1 rounded-[3px] border px-3 py-1.5 text-sm font-medium",
              hideDone
                ? "border-[#0052CC] bg-[#DEEBFF] text-[#0052CC]"
                : "border-[#DFE1E6] bg-white text-[#42526E] hover:bg-[#F4F5F7]",
            ].join(" ")}
          >
            <Filter className="h-3.5 w-3.5" />
            {hideDone ? "Đang ẩn hoàn thành" : "Ẩn hoàn thành"}
          </button>
          <button
            type="button"
            onClick={scrollToToday}
            className="rounded-[3px] border border-[#DFE1E6] bg-white px-3 py-1.5 text-sm font-medium text-[#42526E] hover:bg-[#F4F5F7]"
          >
            Hôm nay
          </button>
          <div className="flex items-center rounded-[3px] border border-[#DFE1E6]">
            <button
              type="button"
              onClick={() => setRangeShift((s) => s - 1)}
              className="px-2 py-1.5 hover:bg-[#F4F5F7]"
              aria-label="Lùi"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[120px] border-x border-[#DFE1E6] px-3 py-1.5 text-center text-sm font-medium capitalize text-[#172B4D]">
              {formatMonthYear(range.start)}
            </span>
            <button
              type="button"
              onClick={() => setRangeShift((s) => s + 1)}
              className="px-2 py-1.5 hover:bg-[#F4F5F7]"
              aria-label="Tiến"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <select
            value={zoom}
            onChange={(e) => setZoom(e.target.value as TimelineZoom)}
            className="rounded-[3px] border border-[#DFE1E6] bg-white px-2 py-1.5 text-sm text-[#42526E]"
          >
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
          </select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Cột trái — danh sách công việc */}
        <div
          ref={leftColRef}
          className="shrink-0 overflow-y-auto border-r border-[#DFE1E6] bg-[#FAFBFC]"
          style={{ width: LEFT_COL_WIDTH }}
          onScroll={(e) => handleLeftScroll(e.currentTarget)}
        >
          <div
            className="sticky top-0 z-20 flex h-9 items-center border-b border-[#DFE1E6] bg-[#F4F5F7] px-3 text-xs font-semibold text-[#44546F]"
          >
            Công việc
          </div>
          {bars.length === 0 ? (
            <p className="px-3 py-8 text-sm text-[#6B778C]">Chưa có công việc.</p>
          ) : (
            bars.map((row) => (
              <div
                key={row.id}
                className="flex h-10 flex-col justify-center border-b border-[#EBECF0] px-3"
                style={{ height: ROW_HEIGHT }}
              >
                <span className="truncate text-sm font-medium text-[#172B4D]">
                  {row.kind === "task" ? (
                    <>
                      <span className="text-[#0052CC]">{row.subLabel}</span> {row.label}
                    </>
                  ) : (
                    row.label
                  )}
                </span>
                {row.kind === "project" && (
                  <span className="text-[10px] text-[#6B778C]">{row.subLabel}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Biểu đồ Gantt */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={headerScrollRef}
            className="overflow-hidden border-b border-[#DFE1E6] bg-[#F4F5F7]"
          >
            <div className="relative h-9" style={{ width: chartWidth }}>
              {weekCols.map((col) => (
                <div
                  key={col.key}
                  className="absolute top-0 flex h-full items-center border-r border-[#DFE1E6] px-2 text-xs font-semibold text-[#44546F]"
                  style={{ left: col.left, width: col.width }}
                >
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          <div
            ref={bodyScrollRef}
            className="flex-1 overflow-auto"
            onScroll={(e) => handleBodyScroll(e.currentTarget)}
          >
            <div className="relative" style={{ width: chartWidth }}>
              {/* Lưới ngày */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: range.totalDays }).map((_, i) => (
                  <div
                    key={i}
                    className={[
                      "h-full shrink-0 border-r border-[#EBECF0]",
                      i % 7 === 0 ? "bg-[#FAFBFC]" : "bg-white",
                    ].join(" ")}
                    style={{ width: dayWidth }}
                  />
                ))}
              </div>

              {/* Vạch hôm nay */}
              {todayOff != null && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-[#0052CC]"
                  style={{ left: todayOff * dayWidth + dayWidth / 2 }}
                />
              )}

              {/* Hàng thanh */}
              {bars.map((row) => (
                <div
                  key={row.id}
                  className="relative border-b border-[#EBECF0]"
                  style={{ height: ROW_HEIGHT }}
                >
                  {renderBar(row)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="shrink-0 border-t border-[#EBECF0] px-4 py-2 text-xs text-[#6B778C]">
        {canWrite ? (
          <>
            Kéo <strong>thanh</strong> để dời cả khoảng thời gian, kéo <strong>hai đầu</strong>{" "}
            để đổi ngày bắt đầu / hạn chót. Bấm thanh để mở chi tiết.
          </>
        ) : (
          <>
            Thanh: <strong>ngày bắt đầu</strong> → <strong>hạn chót</strong> (mặc định theo ngày
            tạo nếu chưa đặt).
          </>
        )}
      </p>

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
