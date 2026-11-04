import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "li";
  /** Adds a thin inner frame, like a printed page (UI.md section 5). */
  framed?: boolean;
};

export function Card({ as: Tag = "div", framed = false, className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        "relative rounded-lg border border-line bg-surface p-4 md:p-5",
        framed &&
          "before:pointer-events-none before:absolute before:inset-1.5 before:rounded-[14px] before:border before:border-line/60",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
