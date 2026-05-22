import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, CornerDownLeft, Plus, User } from "lucide-react";
import type { ProjectMember } from "@/features/project/types";
import { useTaskPriorities } from "../hooks/useTaskPriorities";
import { normalizeTaskPriority } from "../utils/taskUi";
import { TaskPriorityDropdownList } from "./TaskPriorityDropdownList";
import { TaskPriorityIcon } from "./TaskPriorityIcon";

export type QuickCreateInput = {
  title: string;
  priority?: string;
  deadline?: string;
  assigneeUserIds?: number[];
};

type Props = {
  statusName: string;
  members: ProjectMember[];
  onCreate: (input: QuickCreateInput) => Promise<void>;
  disabled?: boolean;
};

export function BoardColumnQuickCreate({
  statusName,
  members,
  onCreate,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { priorities, defaultPriority } = useTaskPriorities();
  const [priority, setPriority] = useState(defaultPriority);
  const [deadline, setDeadline] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [showPriority, setShowPriority] = useState(false);
  const [showAssignee, setShowAssignee] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (saving) return;
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      // Không đóng khi đang chọn ngày (date picker nằm ngoài root)
      if (dateRef.current && document.activeElement === dateRef.current) return;
      close();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, saving]);

  function close() {
    setOpen(false);
    setTitle("");
    setPriority(defaultPriority);
    setDeadline("");
    setAssigneeIds([]);
    setShowPriority(false);
    setShowAssignee(false);
  }

  function toggleAssignee(userId: number) {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  async function submit() {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await onCreate({
        title: trimmed,
        priority,
        deadline: deadline || undefined,
        assigneeUserIds: assigneeIds.length > 0 ? assigneeIds : undefined,
      });
      close();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1 rounded px-1 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200/60 disabled:opacity-50"
      >
        <Plus className="h-3 w-3" />
        Tạo
      </button>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative rounded border-2 border-brand-500 bg-white p-1.5 shadow-sm"
    >
      <input
        ref={inputRef}
        value={title}
        disabled={saving}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
          if (e.key === "Escape") close();
        }}
        placeholder="Việc cần làm là gì?"
        className="w-full border-0 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
        aria-label={`Tạo task trong ${statusName}`}
      />

      <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-slate-100 pt-1">
        <div className="flex items-center gap-0.5">
          {/* Priority */}
          <div className="relative">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowAssignee(false);
                setShowPriority((v) => !v);
              }}
              className="flex items-center gap-0.5 rounded p-1 text-slate-600 hover:bg-slate-100"
              title="Độ ưu tiên"
            >
              <TaskPriorityIcon
                priority={priority}
                size="sm"
                options={priorities}
                colorCode={
                  priorities.find((p) => p.name === normalizeTaskPriority(priority, priorities))
                    ?.colorCode
                }
              />
              <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
            </button>
            {showPriority && (
              <div className="absolute bottom-full left-0 z-20 mb-1 min-w-[140px]">
                <TaskPriorityDropdownList
                  value={priority}
                  priorities={priorities}
                  compact
                  onSelect={(p) => {
                    setPriority(p);
                    setShowPriority(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Due date */}
          <button
            type="button"
            disabled={saving}
            onClick={() => dateRef.current?.showPicker?.() ?? dateRef.current?.click()}
            className={`rounded p-1 hover:bg-slate-100 ${
              deadline ? "text-brand-600" : "text-slate-600"
            }`}
            title={deadline ? `Hạn: ${deadline}` : "Hạn hoàn thành"}
          >
            <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <input
            ref={dateRef}
            type="date"
            value={deadline}
            disabled={saving}
            onChange={(e) => setDeadline(e.target.value)}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            tabIndex={-1}
            aria-hidden
          />

          {/* Assignee */}
          <div className="relative">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowPriority(false);
                setShowAssignee((v) => !v);
              }}
              className={`relative rounded p-1 hover:bg-slate-100 ${
                assigneeIds.length > 0 ? "text-brand-600" : "text-slate-600"
              }`}
              title="Gán người làm"
            >
              <User className="h-3.5 w-3.5" strokeWidth={2} />
              {assigneeIds.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-brand-600 text-[8px] font-bold text-white">
                  {assigneeIds.length}
                </span>
              )}
            </button>
            {showAssignee && (
              <div className="absolute bottom-full left-0 z-20 mb-1 w-44 rounded-md border border-slate-200 bg-white shadow-lg">
                <p className="border-b border-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                  Người thực hiện
                </p>
                <ul className="max-h-32 overflow-y-auto py-0.5">
                  {members.length === 0 ? (
                    <li className="px-2 py-1.5 text-[10px] text-slate-400">Chưa có thành viên</li>
                  ) : (
                    members.map((m) => (
                      <li key={m.userId}>
                        <label className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            className="h-3 w-3 rounded border-slate-300"
                            checked={assigneeIds.includes(m.userId)}
                            onChange={() => toggleAssignee(m.userId)}
                          />
                          <span className="truncate text-xs text-slate-700">{m.username}</span>
                        </label>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!title.trim() || saving}
          onClick={() => void submit()}
          title="Enter để tạo"
          className="rounded border border-slate-200 bg-slate-50 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        >
          <CornerDownLeft className="h-3 w-3" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
