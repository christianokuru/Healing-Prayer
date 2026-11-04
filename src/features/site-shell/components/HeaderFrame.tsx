"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DUSK_PATHS } from "../nav";

/**
 * The header's outer box. Over the dusk sky on some pages, on parchment elsewhere.
 * Children style themselves with `group-data-[tone=dusk]:` so they stay server components.
 */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const dusk = DUSK_PATHS.includes(usePathname());
  return (
    <header
      data-tone={dusk ? "dusk" : "paper"}
      className={cn(
        "group z-20",
        dusk
          ? "absolute inset-x-0 top-0 text-plum-ink"
          : "relative border-b-[3px] border-double border-line bg-bg text-ink",
      )}
    >
      {children}
    </header>
  );
}
