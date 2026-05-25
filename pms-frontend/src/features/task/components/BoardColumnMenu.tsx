import { useEffect, useRef, useState } from "react";
import { Ellipsis, Trash2 } from "lucide-react";

type Props = {
  onRequestDelete: () => void;
  disabled?: boolean;
};

export function BoardColumnMenu({ onRequestDelete, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleDelete() {
    setOpen(false);
    onRequestDelete();
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        title="More actions"
        aria-label="More actions"
        aria-expanded={open}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={[
          "flex h-6 w-6 items-center justify-center rounded text-slate-600",
          "hover:bg-slate-200/80 hover:text-slate-900 disabled:opacity-50",
          open ? "bg-slate-200/80 text-slate-900" : "",
        ].join(" ")}
      >
        <Ellipsis className="h-4 w-4" strokeWidth={2} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-40 mt-0.5 min-w-[148px] rounded-md border border-slate-200 bg-white py-0.5 shadow-lg"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm text-black hover:bg-slate-100"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0 text-black" strokeWidth={2} />
            Xóa cột
          </button>
        </div>
      )}
    </div>
  );
}
