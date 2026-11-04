import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CHURCH, CHURCH_DETAILS_ARE_PLACEHOLDERS, mapsUrl } from "@/lib/church";
import { ABOUT, HERO, HOME_COPY_IS_PLACEHOLDER, SERVICES, STEPS } from "../content";
import { PhotoPlaceholder, PlaceholderMark } from "./Placeholder";

const primaryLink =
  "inline-flex min-h-13 items-center justify-center rounded-full bg-plum px-7 font-bold text-plum-ink hover:brightness-110";
const secondaryLink =
  "inline-flex min-h-13 items-center justify-center rounded-full border-[1.5px] border-line bg-surface px-7 font-bold hover:border-plum";

export function Section({
  id,
  eyebrow,
  title,
  placeholder = false,
  className,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  placeholder?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("py-14 md:py-20", className)}>
      <div className="mx-auto flex max-w-content flex-col gap-8 gutter">
        <div className="flex max-w-prose flex-col gap-2">
          <p className="text-label text-muted uppercase">
            {eyebrow}
            <PlaceholderMark show={placeholder} />
          </p>
          <h2 id={`${id}-title`} className="text-h1">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="py-12 md:py-16 lg:py-24">
      <div className="mx-auto grid max-w-content items-center gap-10 gutter lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-5">
          <p className="text-label text-muted uppercase">{HERO.eyebrow}</p>
          <h1 id="hero-title" className="text-display">
            {HERO.title}
          </h1>
          <p className="max-w-prose text-muted">{HERO.text}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className={primaryLink}>
              Book prayer
            </Link>
            <a href="#how-it-works" className={secondaryLink}>
              How it works
            </a>
          </div>
        </div>
        <PhotoPlaceholder label="Our prayer team" />
      </div>
    </section>
  );
}

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About us"
      title={ABOUT.title}
      placeholder={HOME_COPY_IS_PLACEHOLDER}
      className="bg-surface"
    >
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex max-w-prose flex-col gap-4">
          {ABOUT.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <PhotoPlaceholder label="Our church" />
      </div>
    </Section>
  );
}

export function Services() {
  return (
    <Section
      id="what-we-do"
      eyebrow="What we do"
      title="Ways we serve"
      placeholder={HOME_COPY_IS_PLACEHOLDER}
    >
      <ul className="grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <li
            key={s.title}
            className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-5"
          >
            <h3 className="text-h3">{s.title}</h3>
            <p className="text-muted">{s.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function HowItWorks() {
  return (
    <Section id="how-it-works" eyebrow="Booking" title="How booking works" className="bg-surface">
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-lg border border-line bg-bg p-5 md:flex-col"
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-plum font-display text-h3 font-semibold text-plum-ink"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-h3">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p>
        We email you a confirmation straight away.{" "}
        <Link href="/book" className="font-bold text-plum underline underline-offset-4">
          Book prayer now
        </Link>
      </p>
    </Section>
  );
}

function ContactRow({
  label,
  value,
  copyLabel,
}: {
  label: string;
  value: string;
  copyLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div className="flex min-w-0 flex-col">
        <span className="text-small text-muted">{label}</span>
        <span className="font-bold break-words select-all">{value}</span>
      </div>
      <CopyButton value={value} label={copyLabel} />
    </div>
  );
}

export function Contact() {
  const address = CHURCH.addressLines.join(", ");
  return (
    <Section
      id="contact"
      eyebrow="Visit or contact"
      title="Find us"
      placeholder={CHURCH_DETAILS_ARE_PLACEHOLDERS}
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="rounded-lg border border-line bg-surface px-5">
          <ContactRow label="Address" value={address} copyLabel="address" />
          <ContactRow label="Phone" value={CHURCH.phone} copyLabel="phone number" />
          <ContactRow label="Email" value={CHURCH.email} copyLabel="email address" />
        </div>
        <div className="flex flex-col items-start gap-4">
          <p className="max-w-prose">
            Prayer sessions take place in person at the church. Please arrive a few minutes early
            and ask for the prayer team at the front desk.
          </p>
          <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className={secondaryLink}>
            Open in Google Maps
          </a>
        </div>
      </div>
    </Section>
  );
}
