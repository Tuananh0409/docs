import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { newToastId } from "@/shared/components/files/pendingFiles";

export type ToastVariant = "success" | "error" | "info";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  actions?: ToastAction[];
};

type ToastApi = {
  success: (message: string, actions?: ToastAction[]) => void;
  error: (message: string, actions?: ToastAction[]) => void;
  info: (message: string, actions?: ToastAction[]) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 4000;

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const styles =
    toast.variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : toast.variant === "error"
        ? "border-red-200 bg-red-50 text-red-900"
        : "border-sky-200 bg-sky-50 text-sky-900";

  const Icon =
    toast.variant === "success"
      ? CheckCircle2
      : toast.variant === "error"
        ? XCircle
        : Info;

  const iconClass =
    toast.variant === "success"
      ? "text-emerald-600"
      : toast.variant === "error"
        ? "text-red-600"
        : "text-sky-600";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-slate-900/10 transition ${styles}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} strokeWidth={2} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{toast.message}</p>
        {toast.actions && toast.actions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-2">
            {toast.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-0.5 opacity-60 transition hover:opacity-100"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant, actions?: ToastAction[]) => {
      const id = newToastId();
      setToasts((prev) => [...prev, { id, message, variant, actions }]);
      const dismissMs = actions?.length ? 8000 : AUTO_DISMISS_MS;
      window.setTimeout(() => dismiss(id), dismissMs);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, actions) => showToast(message, "success", actions),
      error: (message, actions) => showToast(message, "error", actions),
      info: (message, actions) => showToast(message, "info", actions),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast phải dùng trong ToastProvider");
  }
  return ctx;
}
