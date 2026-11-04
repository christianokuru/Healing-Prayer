/** Marks sample content that the church still has to replace. Removed once real content arrives. */
export function PlaceholderMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="ml-2 inline-flex rounded-full border border-dashed border-gold px-2 py-0.5 align-middle text-label font-bold tracking-[0.12em] text-gold uppercase">
      Sample text
    </span>
  );
}

/** Stand-in for a church photo until real photos arrive. */
export function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} (photo to come)`}
      className="flex aspect-[4/3] w-full max-w-full items-end rounded-lg bg-plum-soft p-5 md:aspect-[16/7] lg:aspect-[4/3]"
    >
      <span className="rounded-full bg-surface px-3 py-1 text-small text-muted">
        {label} · photo to come
      </span>
    </div>
  );
}
