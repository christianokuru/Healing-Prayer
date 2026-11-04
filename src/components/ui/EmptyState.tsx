import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  /** The next step, usually a Button or link. */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-line px-4 py-10 text-center",
        className,
      )}
    >
      <p className="font-display text-h3 font-semibold">{title}</p>
      {description && <p className="max-w-prose text-muted">{description}</p>}
      {action}
    </div>
  );
}
