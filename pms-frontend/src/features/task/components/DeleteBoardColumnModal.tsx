import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { TaskStatus } from "../types";

/** Jira «Move work from column» — kích thước dialog thực tế (~640×auto), không phải full viewport. */
const MODAL_WIDTH_PX = 640;

const ATLASSIAN_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';

type Props = {
  status: TaskStatus;
  statuses: TaskStatus[];
  taskCount: number;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (moveToStatusId: number) => void;
};

function defaultTargetId(status: TaskStatus, others: TaskStatus[]): number {
  const sorted = [...others].sort((a, b) => a.position - b.position);
  const before = sorted.filter((s) => s.position < status.position).at(-1);
  const after = sorted.find((s) => s.position > status.position);
  return (before ?? after ?? sorted[0]).id;
}

function JiraWarningIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      <path fill="#DE350B" d="M12 2L22 12L12 22L2 12Z" />
      <text
        x="12"
        y="13.5"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily={ATLASSIAN_FONT}
      >
        !
      </text>
    </svg>
  );
}

function StatusBadge({ name }: { name: string }) {
  const label = name.toUpperCase();
  return (
    <span className="inline-flex max-w-full items-center rounded-[3px] border border-[#dfe1e6] bg-[#f4f5f7] px-2 py-[3px] text-[11px] font-bold uppercase leading-[16px] tracking-[0.02em] text-[#44546f]">
      <span className="truncate">{label}</span>
    </span>
  );
}

export function DeleteBoardColumnModal({
  status,
  statuses,
  saving,
  onClose,
  onConfirm,
}: Props) {
  const otherColumns = useMemo(
    () => statuses.filter((s) => s.id !== status.id),
    [statuses, status.id],
  );

  const [moveToId, setMoveToId] = useState(() => defaultTargetId(status, otherColumns));
  const moveToColumn = otherColumns.find((c) => c.id === moveToId);
  const statusLabel = status.statusName.toUpperCase();

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-column-title"
      style={{ fontFamily: ATLASSIAN_FONT }}
    >
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-[#091e42]/50"
        onClick={onClose}
      />

      <div
        className="relative z-10 box-border flex w-full flex-col overflow-hidden rounded-[3px] bg-white shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]"
        style={{ maxWidth: MODAL_WIDTH_PX }}
      >
        {/* Header — nội dung sát trên, giống Jira */}
        <div className="box-border px-6 pt-6">
          <div className="flex gap-3">
            <JiraWarningIcon />
            <div className="min-w-0 flex-1">
              <h2
                id="delete-column-title"
                className="text-[20px] font-medium leading-6 text-[#172b4d]"
              >
                Move work from {statusLabel} column
              </h2>
              <p className="mt-2 text-[14px] font-normal leading-5 text-[#44546f]">
                Select a new home for any work with the {statusLabel} status, including
                work in the backlog.
              </p>
            </div>
          </div>
        </div>

        {/* Mapping — ngay dưới mô tả, không căn giữa modal */}
        <div className="box-border px-6 pb-6 pt-6">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-4">
            <div className="min-w-[140px] shrink-0">
              <p className="mb-2 text-[14px] font-normal leading-5 text-[#44546f]">
                This status will be deleted:
              </p>
              <StatusBadge name={status.statusName} />
            </div>

            <ArrowRight
              className="mb-2 h-5 w-5 shrink-0 text-[#44546f]"
              strokeWidth={2}
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <label
                htmlFor="move-to-status"
                className="mb-2 block text-[14px] font-normal leading-5 text-[#44546f]"
              >
                Move existing work items to:
              </label>
              <div className="relative inline-flex h-10 w-full max-w-[300px] items-center rounded-[3px] border-2 border-[#2684ff] bg-white pl-3 pr-9 shadow-none">
                <StatusBadge name={moveToColumn?.statusName ?? ""} />
                <select
                  id="move-to-status"
                  value={moveToId}
                  disabled={saving || otherColumns.length === 0}
                  onChange={(e) => setMoveToId(Number(e.target.value))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  aria-label="Move existing work items to"
                >
                  {otherColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.statusName}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#44546f]"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer — góc phải dưới */}
        <div className="box-border flex justify-end gap-2 px-6 pb-6">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-8 rounded-[3px] bg-transparent px-3 text-[14px] font-medium text-[#42526e] hover:bg-[#091e420a] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || otherColumns.length === 0}
            onClick={() => onConfirm(moveToId)}
            className="h-8 rounded-[3px] bg-[#de350b] px-3 text-[14px] font-medium text-white hover:bg-[#bf2600] disabled:opacity-50"
          >
            {saving ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
