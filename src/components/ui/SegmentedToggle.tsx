import { cn } from "@/lib/cn";

type Option<T extends string> = { value: T; label: string };

type SegmentedToggleProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex gap-1 self-start rounded-full bg-off p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 rounded-full px-4 text-small transition-colors duration-150",
              active ? "bg-surface font-bold text-ink shadow-raised" : "text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
