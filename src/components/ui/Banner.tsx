import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BannerProps = {
  tone?: "error" | "info";
  className?: string;
  children: ReactNode;
};

/**
 * A message at the top of the content. Errors use role="alert" so screen readers
 * announce them as soon as they appear.
 */
export function Banner({ tone = "error", className, children }: BannerProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-md px-4 py-3",
        isError ? "bg-danger-soft font-bold text-danger" : "bg-gold-soft text-ink",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mt-[0.2em] size-[1.1em] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d={isError ? "M12 7v6M12 17h.01" : "M12 11v6M12 7h.01"} />
      </svg>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
