import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// 17 px text stops phones zooming in on focus.
const CONTROL =
  "w-full rounded-md border-[1.5px] border-line bg-bg px-3.5 text-body text-ink placeholder:text-muted focus:border-plum focus:outline-none focus-visible:ring-[3px] focus-visible:ring-plum-soft aria-invalid:border-danger";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, "min-h-12", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-45 resize-y py-3", className)} {...rest} />;
}
