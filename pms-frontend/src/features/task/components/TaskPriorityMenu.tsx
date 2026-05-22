import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTaskPriorities } from "../hooks/useTaskPriorities";
import { normalizeTaskPriority } from "../utils/taskUi";
import { TaskPriorityDropdownList } from "./TaskPriorityDropdownList";
import { TaskPriorityIcon } from "./TaskPriorityIcon";

type Props = {
  value: string;
  onChange: (priority: string) => void;
  disabled?: boolean;
  className?: string;
};

export function TaskPriorityMenu({ value, onChange, disabled, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { priorities } = useTaskPriorities();
  const current = priorities.find(
    (p) => p.name.toLowerCase() === normalizeTaskPriority(value, priorities).toLowerCase(),
  );

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded border border-[#DFE1E6] bg-white px-2 py-1.5 hover:bg-[#F4F5F7] disabled:opacity-50"
      >
        <TaskPriorityIcon
          priority={value}
          size="md"
          showLabel
          colorCode={current?.colorCode}
          options={priorities}
        />
        <ChevronDown className="h-4 w-4 shrink-0 text-[#6B778C]" />
      </button>
      {open && !disabled && (
        <div className="absolute left-0 right-0 z-30 mt-1">
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
