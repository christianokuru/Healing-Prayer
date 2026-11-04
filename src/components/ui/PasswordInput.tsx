"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Input } from "./Input";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

/** Password field with a Show/Hide button, so people can check what they typed. */
export function PasswordInput({ className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...rest} type={visible ? "text" : "password"} className={cn("pr-20", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-1 right-1 min-w-16 rounded-sm px-3 text-small font-bold text-plum hover:bg-off"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
