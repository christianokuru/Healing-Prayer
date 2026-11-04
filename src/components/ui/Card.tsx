import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" | "li" };

export function Card({ as: Tag = "div", className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn("rounded-lg border border-line bg-surface p-4 md:p-5", className)}
      {...rest}
    />
  );
}
