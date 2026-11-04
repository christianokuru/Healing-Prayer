import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Manuscript ornaments (UI.md sections 3.4 and 5). Decorative parts are hidden from screen readers.

type Tone = "light" | "dark";

/** A thin two-stroke cross. */
export function Cross({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={Math.round(size * 1.36)}
      viewBox="0 0 22 30"
      className={cn("shrink-0", className)}
    >
      <path d="M11 1v28M3 9h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Short rule, cross, short rule. */
export function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center gap-3.5 text-gold before:h-px before:w-[min(90px,22vw)] before:bg-line after:h-px after:w-[min(90px,22vw)] after:bg-line",
        className,
      )}
    >
      <Cross size={16} />
    </div>
  );
}

/** Engraved small-capitals label. */
export function Eyebrow({
  tone = "light",
  className,
  ...rest
}: ComponentProps<"p"> & { tone?: Tone }) {
  return (
    <p
      className={cn("caps", tone === "light" ? "text-gold" : "text-gold-glow", className)}
      {...rest}
    />
  );
}

type VerseProps = {
  /** The words, without quotation marks. */
  children: ReactNode;
  /** e.g. "James 5:16" */
  reference: string;
  tone?: Tone;
  /** "rule-left" for heroes, "rules" (above and below) for body text, "plain" for centred bands. */
  variant?: "rule-left" | "rules" | "plain";
  className?: string;
};

/** A King James Version verse with its reference (UI.md section 5). */
export function Verse({
  children,
  reference,
  tone = "light",
  variant = "plain",
  className,
}: VerseProps) {
  return (
    <figure
      className={cn(
        "m-0",
        variant === "rule-left" &&
          cn("border-l pl-4", tone === "light" ? "border-gold" : "border-gold-glow/60"),
        variant === "rules" && "border-y border-line py-5",
        className,
      )}
    >
      <blockquote
        className={cn(
          "m-0 font-verse text-verse italic",
          tone === "light" ? "text-plum" : "text-plum-ink",
        )}
      >
        “{children}”
      </blockquote>
      <figcaption className={cn("mt-2 caps", tone === "light" ? "text-gold" : "text-gold-glow")}>
        {reference}
      </figcaption>
    </figure>
  );
}

/** Framed box with a double border, for notices such as "Find us". */
export function Notice({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-[3px] border-double border-plum bg-surface p-5 md:gap-4 md:p-6",
        className,
      )}
      {...rest}
    />
  );
}

/** Arch-topped card, with a printed frame unless `framed` is false. */
export function ArchCard({
  framed = true,
  className,
  ...rest
}: ComponentProps<"div"> & { framed?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2.5 rounded-arch border border-line bg-surface px-5 pt-11 pb-6 text-center md:gap-3 md:px-6 md:pt-14 md:pb-7",
        framed && "frame",
        className,
      )}
      {...rest}
    />
  );
}

export type OrderItem = { label: string; value: string };

/** "Order of service" list: label, dotted leader, value (UI.md section 3.4). */
export function OrderList({
  title,
  items,
  footnote,
  tone = "light",
  className,
}: {
  title: string;
  items: OrderItem[];
  footnote?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "relative rounded-sm border p-4 outline outline-1 outline-offset-[5px] md:p-5",
        dark ? "border-gold-glow/45 outline-gold-glow/45" : "border-line bg-surface outline-line",
        className,
      )}
    >
      <p className={cn("mb-3 text-center caps", dark ? "text-gold-glow" : "text-gold")}>{title}</p>
      <dl className="m-0 flex flex-col">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-baseline gap-2 py-1 text-body md:gap-2.5 md:py-1.5 md:text-[1.1875rem]"
          >
            <dt>{item.label}</dt>
            <span
              aria-hidden="true"
              className={cn(
                "min-w-4 flex-1 -translate-y-1.5 border-b-2 border-dotted",
                dark ? "border-gold-glow/55" : "border-line",
              )}
            />
            <dd className="m-0 font-bold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
      {footnote && (
        <p
          className={cn(
            "mt-2 text-center font-verse text-small italic md:mt-2.5 md:text-[1.0625rem]",
            dark ? "text-plum-soft" : "text-muted",
          )}
        >
          {footnote}
        </p>
      )}
    </div>
  );
}
