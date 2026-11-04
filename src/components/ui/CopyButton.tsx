"use client";

import { cn } from "@/lib/cn";
import { useToast } from "./Toast";

type CopyButtonProps = {
  value: string;
  /** What is being copied, for the button's accessible name, e.g. "phone number". */
  label: string;
  className?: string;
};

/** Copies text and confirms with a toast. If copying is blocked, the text stays selectable. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const { showToast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`Copied ${label}.`);
    } catch {
      showToast(`Could not copy. Select the ${label} and copy it instead.`);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-small font-bold text-plum hover:border-plum",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
      Copy
    </button>
  );
}
