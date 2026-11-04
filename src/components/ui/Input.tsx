import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// 17 px text stops phones zooming in on focus.
const CONTROL =
  "w-full rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 text-field text-ink placeholder:text-muted md:rounded-sm focus:border-plum focus:outline-none focus-visible:ring-[3px] focus-visible:ring-plum-soft aria-invalid:border-danger";

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, "min-h-11 md:min-h-12.5", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return (
    <textarea className={cn(CONTROL, "min-h-40 resize-y py-3 md:min-h-45", className)} {...rest} />
  );
}
