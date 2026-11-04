import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { buttonClasses, type ButtonVariant } from "./Button";

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; block?: boolean };

/** A link styled exactly like a Button, for navigation such as "Book prayer". */
export function ButtonLink({ variant = "primary", block, className, ...rest }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses(variant, block), className)} {...rest} />;
}
