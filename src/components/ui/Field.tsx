import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Props to spread onto the control so the label, hint and error are linked to it. */
export type FieldControlProps = {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Shown on the right under the control, e.g. "120 / 10,000". */
  count?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({ id, label, hint, error, count, className, children }: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {(error || hint || count) && (
        <div className="flex items-start justify-between gap-3 text-small">
          <div className="flex min-w-0 flex-col gap-1">
            {error && (
              <p id={errorId} className="font-bold text-danger">
                {error}
              </p>
            )}
            {hint && (
              <p id={hintId} className="text-muted">
                {hint}
              </p>
            )}
          </div>
          {count && <p className="shrink-0 text-muted tabular-nums">{count}</p>}
        </div>
      )}
    </div>
  );
}
