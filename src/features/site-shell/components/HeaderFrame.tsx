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
          : // Phones: frosted glass that stays at the top (iOS style). md+: parchment with a double rule.
            "sticky top-0 border-b border-line/70 bg-bg/80 text-ink backdrop-blur-xl backdrop-saturate-150 md:relative md:border-b-[3px] md:border-double md:bg-bg md:backdrop-blur-none",
      )}
    >
      {children}
    </header>
  );
}
