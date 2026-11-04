import Link from "next/link";
import { Cross } from "@/components/ui";

/**
 * Text wordmark with a thin cross (UI.md section 4.4). Plum on parchment; inside a dusk
 * header it switches to light colours.
 */
export function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 leading-none"
      aria-label="Healing Prayer North-West, home"
    >
      <Cross className="text-gold group-data-[tone=dusk]:text-gold-glow" />
      <span className="flex flex-col">
        <span className="font-display text-[1.5rem] leading-none font-semibold text-plum group-data-[tone=dusk]:text-plum-ink">
          Healing Prayer
        </span>
        <span className="mt-1 font-caps text-[0.625rem] font-semibold tracking-[0.32em] text-gold uppercase group-data-[tone=dusk]:text-gold-glow">
          North-West
        </span>
      </span>
    </Link>
  );
}
