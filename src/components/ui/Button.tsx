import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const VARIANTS = {
  primary: "rounded-full bg-plum px-6 text-plum-ink hover:bg-plum-2",
  /** Main action on dusk, plum or night backgrounds. */
  gold: "rounded-full bg-gold-bright px-6 text-night hover:brightness-105",
  secondary: "rounded-full border-[1.5px] border-line bg-surface px-6 text-ink hover:border-plum",
  /** Light pill on dusk, e.g. the header's main link. */
  light: "rounded-full bg-plum-ink px-6 text-plum hover:brightness-95",
  /** Outline on dusk or plum. */
  outlineLight:
    "rounded-full border-[1.5px] border-plum-ink/70 px-6 text-plum-ink hover:bg-plum-ink/10",
  link: "px-1 text-plum underline underline-offset-4 hover:no-underline",
} as const;

/** Shared with ButtonLink so links that look like buttons stay identical to buttons. */
export function buttonClasses(variant: ButtonVariant = "primary", block = false): string {
  return cn(
    "inline-flex min-h-13 items-center justify-center gap-2 font-bold transition-[filter,border-color,background-color] duration-150 disabled:cursor-not-allowed disabled:opacity-45",
    variant === "link" && "min-h-11",
    VARIANTS[variant],
    block && "w-full",
  );
}

export type ButtonVariant = keyof typeof VARIANTS;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Stretch to the full width of the container. */
  block?: boolean;
  /** Shows a spinner, disables the button and replaces the label with `loadingText`. */
  loading?: boolean;
  loadingText?: string;
};

export function Button({
  variant = "primary",
  block = false,
  loading = false,
  loadingText,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses(variant, block), className)}
      {...rest}
    >
      {loading && <Spinner />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
