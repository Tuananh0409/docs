import { type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
  /** Không render header mặc định — dùng cho modal kiểu Jira */
  bare?: boolean;
};

const sizeClass = { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-5xl" };

export function Modal({ title, children, onClose, size = "md", bare = false }: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 pt-8 sm:pt-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby={bare ? undefined : "modal-title"}
    >
      <button
        type="button"
        aria-label="Đóng"
        className="fixed inset-0 bg-slate-900/45"
        onClick={onClose}
      />
      <div
        className={`relative z-10 my-auto w-full ${sizeClass[size]} rounded-xl bg-white text-slate-900 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/80 ${
          bare ? "" : "p-6"
        }`}
      >
        {!bare && (
          <div className="mb-4 flex items-center justify-between">
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
