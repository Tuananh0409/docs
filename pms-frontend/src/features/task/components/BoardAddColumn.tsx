import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { ApiClientError } from "@/shared/api/client";
import { useToast } from "@/shared/context/ToastContext";

const COLUMN_COLORS = [
  "#94A3B8",
  "#3B82F6",
  "#8B5CF6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
] as const;

type Props = {
  onCreate: (statusName: string, colorCode: string) => Promise<void>;
  disabled?: boolean;
};

export function BoardAddColumn({ onCreate, disabled }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(COLUMN_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (saving) return;
      if (rootRef.current?.contains(e.target as Node)) return;
      close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, saving]);

  function close() {
    setOpen(false);
    setName("");
    setColor(COLUMN_COLORS[0]);
  }

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await onCreate(trimmed, color);
      close();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Không tạo được cột");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-md",
          "border border-slate-300 bg-white text-slate-700 shadow-sm transition",
          "hover:border-slate-400 hover:bg-slate-50",
          open ? "border-brand-500 ring-1 ring-brand-500/30" : "",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
        aria-label="Thêm cột"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
          role="dialog"
          aria-label="Thêm cột mới"
        >
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tên cột
          </label>
          <input
            ref={inputRef}
            value={name}
            disabled={saving}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder="VD: Testing, Blocked..."
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-500"
            maxLength={50}
          />

          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Màu</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {COLUMN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                disabled={saving}
                onClick={() => setColor(c)}
                className={[
                  "h-5 w-5 rounded-full border-2 transition",
                  color === c ? "border-slate-800 scale-110" : "border-transparent",
                ].join(" ")}
                style={{ backgroundColor: c }}
                aria-label={`Màu ${c}`}
                aria-pressed={color === c}
              />
            ))}
          </div>

          <div className="mt-3 flex gap-1.5">
            <button
              type="button"
              disabled={saving || !name.trim()}
              onClick={() => void submit()}
              className="flex-1 rounded bg-brand-600 px-2 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "..." : "Tạo"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={close}
              className="rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
