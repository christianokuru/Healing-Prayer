// Visual reference for the design tokens in globals.css (UI.md section 3).

const COLOURS = [
  { name: "bg", use: "Parchment background" },
  { name: "surface", use: "Cards, panels, inputs" },
  { name: "ink", use: "Main text" },
  { name: "muted", use: "Secondary text" },
  { name: "line", use: "Rules, borders, frames" },
  { name: "plum", use: "Brand, headings, buttons" },
  { name: "plum-2", use: "Hover on plum" },
  { name: "plum-ink", use: "Text on plum and dusk" },
  { name: "plum-soft", use: "Full days, verse bands" },
  { name: "gold", use: "Labels, numerals, focus" },
  { name: "gold-bright", use: "Gold buttons, fills" },
  { name: "gold-glow", use: "Gold on dark" },
  { name: "gold-soft", use: "Your booking, info" },
  { name: "night", use: "Footer, deepest dusk" },
  { name: "ok", use: "Free, success" },
  { name: "ok-soft", use: "Success background" },
  { name: "danger", use: "Errors, cancelled" },
  { name: "danger-soft", use: "Error background" },
  { name: "off", use: "Disabled, taken" },
] as const;

const TYPE = [
  {
    token: "text-display",
    className: "text-display text-plum",
    sample: "Bring what is on your heart.",
  },
  { token: "text-h1", className: "text-h1 text-plum", sample: "Choose a time to be prayed with" },
  { token: "text-h2", className: "text-h2 text-plum", sample: "When we gather to pray" },
  { token: "text-h3", className: "text-h3 text-plum", sample: "Thursday 12 November" },
  {
    token: "text-verse",
    className: "font-verse text-verse italic text-plum",
    sample: "“Pray one for another, that ye may be healed.”",
  },
  {
    token: "text-body",
    className: "text-body",
    sample: "One-on-one, 30 minutes, every Thursday evening.",
  },
  { token: "text-body bold", className: "text-body font-bold", sample: "7:30 – 8:00 PM" },
  {
    token: "text-small",
    className: "text-small text-muted",
    sample: "Only church admins can read this.",
  },
  { token: "caps", className: "caps text-gold", sample: "Order of the week" },
] as const;

const RADII = [
  { token: "rounded-sm", className: "rounded-sm", px: "12px" },
  { token: "rounded-md", className: "rounded-md", px: "14px" },
  { token: "rounded-lg", className: "rounded-lg", px: "18px" },
  { token: "rounded-arch", className: "rounded-arch", px: "arch" },
  { token: "rounded-full", className: "rounded-full", px: "pill" },
] as const;

const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 56, 80] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  );
}

export function TokenSheet() {
  return (
    <main className="mx-auto flex max-w-content flex-col gap-12 py-10 gutter lg:py-16">
      <header className="flex flex-col gap-2">
        <p className="text-label text-muted uppercase">Design tokens</p>
        <h1 className="text-h1">Healing Prayer North-West</h1>
        <p className="max-w-prose text-muted">
          Every colour, size and shape used on the site: Candlelight × Manuscript. Light only for
          now.
        </p>
      </header>

      <Section title="Colour">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLOURS.map(({ name, use }) => (
            <li
              key={name}
              className="flex flex-col overflow-hidden rounded-md border border-line bg-surface"
            >
              <span
                className="h-16 border-b border-line"
                style={{ background: `var(--${name})` }}
              />
              <span className="flex flex-col p-3">
                <b className="text-small">{name}</b>
                <span className="text-small text-muted">{use}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
          {TYPE.map(({ token, className, sample }) => (
            <li
              key={token}
              className="flex flex-col gap-1 p-4 md:flex-row md:items-baseline md:gap-6"
            >
              <code className="shrink-0 text-small text-muted md:w-36">{token}</code>
              <span className={`min-w-0 ${className}`}>{sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons and states">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button className="min-h-13 rounded-full bg-plum px-6 font-bold text-plum-ink">
            Confirm booking
          </button>
          <button className="min-h-13 rounded-full border-[1.5px] border-line px-6 font-bold">
            Back
          </button>
          <button className="min-h-13 px-2 font-bold text-plum underline underline-offset-4">
            Change
          </button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
          <span className="flex min-h-14 flex-col items-center justify-center rounded-sm border-[1.5px] border-line bg-surface tabular-nums">
            <b>7:00 PM</b>
            <span className="text-label text-muted">Free</span>
          </span>
          <span className="flex min-h-14 flex-col items-center justify-center rounded-sm bg-plum text-plum-ink tabular-nums">
            <b>7:30 PM</b>
            <span className="text-label">Selected</span>
          </span>
          <span className="flex min-h-14 flex-col items-center justify-center rounded-sm bg-off text-muted tabular-nums">
            <b className="line-through">8:00 PM</b>
            <span className="text-label">Taken</span>
          </span>
          <span className="flex min-h-14 flex-col items-center justify-center rounded-sm bg-gold-soft text-gold tabular-nums">
            <b>8:30 PM</b>
            <span className="text-label font-bold">Yours</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-ok-soft px-3 py-1 text-small font-bold text-ok">
            3 of 4 free
          </span>
          <span className="rounded-full bg-plum px-3 py-1 text-small font-bold text-plum-ink">
            Full
          </span>
          <span className="rounded-full bg-gold-soft px-3 py-1 text-small font-bold text-gold">
            Your booking
          </span>
          <span className="rounded-full bg-danger-soft px-3 py-1 text-small font-bold text-danger">
            Cancelled
          </span>
          <span className="rounded-full bg-off px-3 py-1 text-small font-bold text-muted">
            No session
          </span>
        </div>
        <p className="rounded-md bg-danger-soft px-4 py-3 font-bold text-danger">
          Sorry, that time was just taken by someone else. Please pick another time.
        </p>
        <p className="rounded-md bg-gold-soft px-4 py-3">You can book one session per week.</p>
      </Section>

      <Section title="Shape and depth">
        <div className="flex flex-wrap gap-4">
          {RADII.map(({ token, className, px }) => (
            <div
              key={token}
              className={`flex size-28 flex-col items-center justify-center border border-line bg-surface ${className}`}
            >
              <code className="text-small">{token}</code>
              <span className="text-small text-muted">{px}</span>
            </div>
          ))}
          <div className="flex size-28 flex-col items-center justify-center rounded-lg bg-surface shadow-raised">
            <code className="text-small">shadow-raised</code>
          </div>
        </div>
      </Section>

      <Section title="Spacing (4 px base)">
        <ul className="flex flex-col gap-2">
          {SPACING.map((px) => (
            <li key={px} className="flex items-center gap-4">
              <code className="w-12 text-small text-muted tabular-nums">{px}px</code>
              <span className="h-3 rounded-full bg-plum" style={{ width: px }} />
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
