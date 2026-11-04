import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  ok: "bg-ok-soft text-ok",
  plum: "bg-plum text-plum-ink",
  gold: "bg-gold-soft text-gold",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-off text-muted",
} as const;

export type BadgeTone = keyof typeof TONES;

type BadgeProps = { tone?: BadgeTone; className?: string; children: ReactNode };

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-small leading-none font-bold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
