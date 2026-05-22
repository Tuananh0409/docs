import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { taskPriorityLabel } from "@/shared/config/task-priority-options";
import { useTaskPriorities } from "../hooks/useTaskPriorities";
import { normalizeTaskPriority } from "../utils/taskUi";
import { TaskPriorityDropdownList } from "./TaskPriorityDropdownList";
import { TaskPriorityIcon } from "./TaskPriorityIcon";

type Props = {
  value: string;
  onChange: (priority: string) => void;
  disabled?: boolean;
  className?: string;
  /** inline = ô bảng list (không viền) */
  variant?: "field" | "inline";
};

export function TaskPriorityMenu({
  value,
  onChange,
  disabled,
  className = "",
  variant = "field",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const { priorities } = useTaskPriorities();
  const current = priorities.find(
    (p) => p.name.toLowerCase() === normalizeTaskPriority(value, priorities).toLowerCase(),
  );
  const label = taskPriorityLabel(normalizeTaskPriority(value, priorities));

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.left,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function onScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const dropdown = open && !disabled && (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[168px]"
      style={{ top: menuPos.top, left: menuPos.left }}
    >
      <TaskPriorityDropdownList
        value={value}
        priorities={priorities}
        onSelect={(p) => {
          onChange(p);
          setOpen(false);
        }}
      />
    </div>
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Độ ưu tiên: ${label}`}
        className={
          variant === "inline"
            ? "inline-flex max-w-full items-center gap-1 rounded px-1 py-0.5 hover:bg-[#091e420a] disabled:opacity-50"
            : "flex w-full items-center justify-between gap-2 rounded border border-[#DFE1E6] bg-white px-2 py-1.5 hover:bg-[#F4F5F7] disabled:opacity-50"
        }
      >
        <TaskPriorityIcon
          priority={value}
          size="md"
          showLabel
          showTitle={false}
          colorCode={current?.colorCode}
          options={priorities}
        />
        {!disabled && variant === "field" && (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#6B778C]" />
        )}
      </button>
      {variant === "inline" && dropdown && createPortal(dropdown, document.body)}
      {variant === "field" && open && !disabled && (
        <div className="absolute left-0 z-50 mt-1 min-w-[168px] w-max">
          <TaskPriorityDropdownList
            value={value}
            priorities={priorities}
            onSelect={(p) => {
              onChange(p);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
