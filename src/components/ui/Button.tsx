import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const VARIANTS = {
  primary: "rounded-full bg-plum px-6 text-plum-ink hover:brightness-110",
  secondary: "rounded-full border-[1.5px] border-line bg-surface px-6 text-ink hover:border-plum",
  link: "px-1 text-plum underline underline-offset-4 hover:no-underline",
} as const;

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
      className={cn(
        "inline-flex min-h-13 items-center justify-center gap-2 font-bold transition-[filter,border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-45",
        variant === "link" && "min-h-11",
        VARIANTS[variant],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
