import { type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "md" | "lg";
};

const sizeClass = { md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ title, children, onClose, size = "md" }: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${sizeClass[size]} rounded-2xl bg-white p-6 text-slate-900 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/80`}
      >
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
        {children}
      </div>
    </div>,
    document.body,
  );
}
