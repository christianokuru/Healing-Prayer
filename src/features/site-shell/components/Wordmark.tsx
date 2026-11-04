import Link from "next/link";

/** The text wordmark (no logo yet, UI.md section 4.4). */
export function Wordmark() {
  return (
    <Link
      href="/"
      className="flex flex-col leading-none"
      aria-label="Healing Prayer North-West, home"
    >
      <span className="font-display text-h3 font-semibold text-plum">Healing Prayer</span>
      <span className="mt-1 text-label text-muted uppercase">North-West</span>
    </Link>
  );
}
