/** Marks sample content that the church still has to replace. Removed once real content arrives. */
export function PlaceholderMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="ml-2 inline-flex rounded-full border border-dashed border-gold px-2 py-0.5 align-middle font-sans text-[0.6875rem] font-bold tracking-[0.12em] text-gold uppercase">
      Sample text
    </span>
  );
}

/** Arch photo frame with a warm candlelit stand-in until real photos arrive. */
export function ArchPhoto({ label }: { label: string }) {
  return (
    <div className="aspect-[4/5] w-full max-w-[300px] justify-self-center rounded-arch border border-line p-2.5 frame md:max-w-[380px]">
      <div
        role="img"
        aria-label={`${label} (photo to come)`}
        className="relative grid h-full place-items-end justify-center overflow-hidden rounded-[190px_190px_12px_12px] bg-[linear-gradient(180deg,#e9c9a1,#d9a07a_40%,#7d4a6b)] p-5 before:absolute before:inset-0 before:bg-[radial-gradient(60%_40%_at_50%_75%,rgb(255_226_150/0.8),transparent_70%)]"
      >
        <span className="relative rounded-full bg-surface/90 px-3 py-1 text-small text-muted">
          {label} · photo to come
        </span>
      </div>
    </div>
  );
}
