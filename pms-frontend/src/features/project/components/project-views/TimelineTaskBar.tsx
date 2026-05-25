import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDays,
  dayOffset,
  formatDayIso,
  startOfDay,
  type TimelineBar,
} from "../../utils/timelineUtils";
import { isDoneStatus } from "@/features/task/utils/taskUi";

const MIN_DRAG_PX = 4;
const HANDLE_W = 6;

export type TimelineDateCommit = {
  startDate: string;
  deadline: string;
};

type DragMode = "move" | "resize-start" | "resize-end";

type Props = {
  bar: TimelineBar;
  rangeStart: Date;
  dayWidth: number;
  canWrite: boolean;
  saving?: boolean;
  onCommit: (taskId: number, payload: TimelineDateCommit) => Promise<void>;
  onOpen: (taskId: number) => void;
};

export function TimelineTaskBar({
  bar,
  rangeStart,
  dayWidth,
  canWrite,
  saving = false,
  onCommit,
  onOpen,
}: Props) {
  const task = bar.task!;
  const [preview, setPreview] = useState<{ start: Date; end: Date } | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    originStart: Date;
    originEnd: Date;
    moved: boolean;
  } | null>(null);
  const previewRef = useRef<{ start: Date; end: Date } | null>(null);
  const suppressClickRef = useRef(false);

  const start = preview?.start ?? bar.start;
  const end = preview?.end ?? bar.end;
  const done = isDoneStatus(task.statusName);

  const left = dayOffset(rangeStart, start) * dayWidth;
  const spanDays = Math.max(1, dayOffset(start, end) + 1);
  const width = Math.max(dayWidth - 2, spanDays * dayWidth - 2);

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    const finalPreview = previewRef.current;
    dragRef.current = null;
    previewRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    if (!drag || !drag.moved || !finalPreview) {
      setPreview(null);
      return;
    }

    suppressClickRef.current = true;
    const payload: TimelineDateCommit = {
      startDate: formatDayIso(finalPreview.start),
      deadline: formatDayIso(finalPreview.end),
    };
    void onCommit(task.id, payload).finally(() => setPreview(null));
  }, [onCommit, task.id]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaPx = e.clientX - drag.startX;
      if (Math.abs(deltaPx) >= MIN_DRAG_PX) drag.moved = true;
      const deltaDays = Math.round(deltaPx / dayWidth);

      let nextStart = drag.originStart;
      let nextEnd = drag.originEnd;

      if (drag.mode === "move") {
        nextStart = addDays(drag.originStart, deltaDays);
        nextEnd = addDays(drag.originEnd, deltaDays);
      } else if (drag.mode === "resize-start") {
        nextStart = addDays(drag.originStart, deltaDays);
        if (dayOffset(nextStart, nextEnd) < 0) {
          nextStart = startOfDay(nextEnd);
        }
      } else {
        nextEnd = addDays(drag.originEnd, deltaDays);
        if (dayOffset(nextStart, nextEnd) < 0) {
          nextEnd = startOfDay(nextStart);
        }
      }

      const next = { start: startOfDay(nextStart), end: startOfDay(nextEnd) };
      previewRef.current = next;
      setPreview(next);
    }

    function onUp() {
      if (dragRef.current) endDrag();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dayWidth, endDrag]);

  function beginDrag(mode: DragMode, clientX: number) {
    if (!canWrite || saving) return;
    dragRef.current = {
      mode,
      startX: clientX,
      originStart: startOfDay(bar.start),
      originEnd: startOfDay(bar.end),
      moved: false,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      mode === "move" ? "grabbing" : "col-resize";
  }

  function handleBarClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onOpen(task.id);
  }

  return (
    <div
      className={[
        "absolute top-1/2 flex h-6 max-w-full -translate-y-1/2 items-stretch overflow-hidden rounded-[3px] shadow-sm",
        done ? "opacity-70" : "",
        saving ? "opacity-60" : "",
        canWrite ? "cursor-grab" : "cursor-pointer",
      ].join(" ")}
      style={{
        left: left + 1,
        width,
        backgroundColor: bar.color,
      }}
      title={`${bar.subLabel} ${bar.label}`}
      onPointerDown={(e) => {
        if (!canWrite || (e.target as HTMLElement).dataset.handle) return;
        if (e.button !== 0) return;
        e.preventDefault();
        beginDrag("move", e.clientX);
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleBarClick();
      }}
    >
      {canWrite && (
        <span
          data-handle="start"
          className="z-10 w-1.5 shrink-0 cursor-col-resize bg-black/15 hover:bg-black/30"
          style={{ width: HANDLE_W }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            beginDrag("resize-start", e.clientX);
          }}
        />
      )}
      <span className="min-w-0 flex-1 truncate px-1 text-left text-[11px] font-medium leading-6 text-white pointer-events-none">
        {bar.subLabel}
      </span>
      {canWrite && (
        <span
          data-handle="end"
          className="z-10 w-1.5 shrink-0 cursor-col-resize bg-black/15 hover:bg-black/30"
          style={{ width: HANDLE_W }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            beginDrag("resize-end", e.clientX);
          }}
        />
      )}
    </div>
  );
}
