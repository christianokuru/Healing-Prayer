"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Buttons shown at the bottom, e.g. Cancel and Confirm. */
  actions?: ReactNode;
};

/**
 * Bottom sheet on phones, centred modal from `md`. Built on the native <dialog>,
 * which traps focus, makes the page behind inert and closes on Escape.
 */
export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Escape fires "cancel". Let the parent decide, so state stays the source of truth.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-0 mt-auto w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-scrim",
        "md:m-auto md:max-w-[480px]",
      )}
    >
      <div className="flex flex-col gap-4 rounded-t-[22px] bg-surface px-4 pt-2.5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] md:rounded-lg md:p-6">
        {/* iOS-style grabber on the phone sheet. */}
        <span aria-hidden="true" className="mx-auto h-1.5 w-10 rounded-full bg-line md:hidden" />
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-h3 md:text-h2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-off"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
        {actions && (
          <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">{actions}</div>
        )}
      </div>
    </dialog>
  );
}
