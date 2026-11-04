import { cn } from "@/lib/cn";

type SpinnerProps = { className?: string };

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-[1.1em] animate-spin rounded-full border-[2.5px] border-current border-r-transparent",
        className,
      )}
    />
  );
}
