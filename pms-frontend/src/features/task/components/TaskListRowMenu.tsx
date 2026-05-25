import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

type Props = {
  onOpen: () => void;
  onDelete?: () => void;
};

export function TaskListRowMenu({ onOpen, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded p-1 text-[#6B778C] opacity-0 transition hover:bg-[#091e420a] group-hover:opacity-100 data-[open=true]:opacity-100"
        data-open={open}
        aria-label="Thao tác"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-md border border-[#DFE1E6] bg-white py-1 shadow-lg">
          <button
            type="button"
            className="block w-full px-3 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F4F5F7]"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onOpen();
            }}
          >
            Xem chi tiết
          </button>
          {onDelete && (
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-sm text-[#DE350B] hover:bg-[#FFEBE6]"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
            >
              Xóa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
