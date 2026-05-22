import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckSquare, ChevronDown, CornerDownLeft, User, Zap } from "lucide-react";
import type { ProjectMember } from "@/features/project/types";

export type WorkItemType = "task" | "epic";

export type CalendarQuickCreateInput = {
  title: string;
  workItemType?: WorkItemType;
  assigneeUserIds?: number[];
};

const WORK_TYPES: { id: WorkItemType; label: string; icon: "task" | "epic" }[] = [
  { id: "task", label: "Task", icon: "task" },
  { id: "epic", label: "Epic", icon: "epic" },
];

type Props = {
  anchorEl: HTMLElement;
  members: ProjectMember[];
  onCreate: (input: CalendarQuickCreateInput) => Promise<void>;
  onCancel: () => void;
};

export function CalendarDayQuickCreate({
  anchorEl,
  members,
  onCreate,
  onCancel,
}: Props) {
  const [title, setTitle] = useState("");
  const [workType, setWorkType] = useState<WorkItemType>("task");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [showAssignee, setShowAssignee] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const typeMeta = WORK_TYPES.find((t) => t.id === workType)!;

  useLayoutEffect(() => {
    function updatePos() {
      const rect = anchorEl.getBoundingClientRect();
      const w = Math.max(rect.width, 280);
      let left = rect.left;
      if (left + w > window.innerWidth - 8) {
        left = window.innerWidth - w - 8;
      }
      setPos({
        top: rect.top,
        left,
        width: w,
      });
    }
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [anchorEl]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (saving) return;
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorEl.contains(target)) return;
      onCancel();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [anchorEl, onCancel, saving]);

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
        workItemType: workType,
        assigneeUserIds: assigneeIds.length > 0 ? assigneeIds : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function TypeIcon({ kind }: { kind: "task" | "epic" }) {
    if (kind === "epic") {
      return <Zap className="h-4 w-4 text-[#6554C0]" fill="#6554C0" strokeWidth={0} />;
    }
    return <CheckSquare className="h-4 w-4 text-[#2684FF]" strokeWidth={2} />;
  }

  const popover = (
    <div
      ref={popoverRef}
      className="fixed z-[200] rounded-[3px] border-2 border-[#2684FF] bg-white shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]"
      style={{
        left: pos.left,
        top: pos.top,
        width: pos.width,
        transform: "translateY(calc(-100% - 6px))",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-2">
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
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Cần làm gì?"
          className="w-full resize-none border-0 bg-transparent text-sm leading-snug text-[#172B4D] outline-none placeholder:text-[#97A0AF]"
          aria-label="Tiêu đề công việc mới"
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[#EBECF0] px-2 py-1.5">
        <div className="flex items-center gap-1">
          {/* Loại công việc */}
          <div className="relative">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowAssignee(false);
                setShowTypeMenu((v) => !v);
              }}
              className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-sm font-medium text-[#172B4D] hover:bg-[#F4F5F7]"
            >
              <TypeIcon kind={typeMeta.icon} />
              <span>{typeMeta.label}</span>
              <ChevronDown className="h-3 w-3 text-[#6B778C]" />
            </button>
            {showTypeMenu && (
              <ul className="absolute bottom-full left-0 z-10 mb-1 min-w-[120px] rounded-[3px] border border-[#DFE1E6] bg-white py-1 shadow-lg">
                {WORK_TYPES.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-[#F4F5F7]"
                      onClick={() => {
                        setWorkType(t.id);
                        setShowTypeMenu(false);
                      }}
                    >
                      <TypeIcon kind={t.icon} />
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Người thực hiện */}
          <div className="relative">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowTypeMenu(false);
                setShowAssignee((v) => !v);
              }}
              className="rounded p-1 text-[#6B778C] hover:bg-[#F4F5F7]"
              title="Gán người thực hiện"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DFE1E6]">
                <User className="h-3.5 w-3.5 text-[#6B778C]" strokeWidth={2} />
              </span>
            </button>
            {showAssignee && (
              <ul className="absolute bottom-full left-0 z-10 mb-1 w-44 rounded-[3px] border border-[#DFE1E6] bg-white py-1 shadow-lg">
                {members.length === 0 ? (
                  <li className="px-2 py-1.5 text-xs text-[#97A0AF]">Chưa có thành viên</li>
                ) : (
                  members.map((m) => (
                    <li key={m.userId}>
                      <label className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-[#F4F5F7]">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-[#DFE1E6]"
                          checked={assigneeIds.includes(m.userId)}
                          onChange={() => toggleAssignee(m.userId)}
                        />
                        <span className="truncate text-sm text-[#172B4D]">{m.username}</span>
                      </label>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!title.trim() || saving}
          onClick={() => void submit()}
          className="inline-flex shrink-0 items-center gap-1 rounded-[3px] px-2 py-1 text-sm font-medium text-[#42526E] hover:bg-[#F4F5F7] disabled:opacity-40"
        >
          {saving ? "…" : "Tạo"}
          <span className="inline-flex items-center rounded border border-[#DFE1E6] bg-[#F4F5F7] px-1 py-0.5">
            <CornerDownLeft className="h-3 w-3" strokeWidth={2} />
          </span>
        </button>
      </div>
    </div>
  );

  return createPortal(popover, document.body);
}
