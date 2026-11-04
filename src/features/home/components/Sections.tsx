import type { ReactNode } from "react";
import {
  ArchCard,
  ButtonLink,
  ChapelCandles,
  CopyButton,
  Divider,
  Eyebrow,
  Notice,
  Verse,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { CHURCH, CHURCH_DETAILS_ARE_PLACEHOLDERS, mapsUrl } from "@/lib/church";
import { ABOUT, HERO, HOME_COPY_IS_PLACEHOLDER, MINISTRIES, STEPS, VERSE_BAND } from "../content";
import { NextSessionPill } from "./NextSession";
import { ArchPhoto, PlaceholderMark } from "./Placeholder";

const ROMAN = ["I", "II", "III"];

function SectionHead({
  id,
  eyebrow,
  title,
  placeholder = false,
  center = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  placeholder?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex max-w-[640px] flex-col gap-2.5",
        center && "mx-auto items-center text-center",
      )}
    >
      <Eyebrow>
        {eyebrow}
        <PlaceholderMark show={placeholder} />
      </Eyebrow>
      <h2 id={`${id}-title`} className="text-h2 text-plum">
        {title}
      </h2>
    </div>
  );
}

function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("py-16", className)}>
      <div className="mx-auto max-w-content gutter">{children}</div>
    </section>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="dusk dusk-edge overflow-hidden">
      <div className="mx-auto grid max-w-content items-end gap-9 pt-28 gutter pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:pt-32">
        <div className="flex flex-col gap-6">
          <NextSessionPill />
          <h1 id="hero-title" className="text-display">
            {HERO.titleStart} <em className="text-gold-glow">{HERO.titleEmphasis}</em>
          </h1>
          <p className="max-w-[34ch] text-[1.1875rem] text-plum-soft">{HERO.text}</p>
          <Verse
            tone="dark"
            variant="rule-left"
            reference={HERO.verse.reference}
            className="max-w-[32ch]"
          >
            {HERO.verse.text}
          </Verse>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/book" variant="gold">
              Book a prayer session
            </ButtonLink>
            <ButtonLink href="#how-it-works" variant="outlineLight">
              How it works
            </ButtonLink>
          </div>
        </div>
        <ChapelCandles className="max-w-[420px] justify-self-center" />
      </div>
    </section>
  );
}

export function About() {
  return (
    <Section id="about">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex max-w-prose flex-col gap-4">
          <SectionHead
            id="about"
            eyebrow="About us"
            title={ABOUT.title}
            placeholder={HOME_COPY_IS_PLACEHOLDER}
          />
          <p className="dropcap">{ABOUT.paragraphs[0]}</p>
          <p>{ABOUT.paragraphs[1]}</p>
          <Verse variant="rules" reference={ABOUT.verse.reference} className="mt-4">
            {ABOUT.verse.text}
          </Verse>
        </div>
        <ArchPhoto label="Our chapel" />
      </div>
    </Section>
  );
}

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="pt-6">
      <SectionHead id="how-it-works" eyebrow="Booking" title="How booking works" center />
      <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <ArchCard framed={false} className="h-full gap-2 pt-11">
              <span aria-hidden="true" className="font-caps text-[2.125rem] leading-none text-gold">
                {ROMAN[i]}
              </span>
              <h3 className="text-h3 text-plum">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </ArchCard>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function VerseBand() {
  return (
    <div className="flex flex-col items-center gap-4 bg-[linear-gradient(90deg,transparent,var(--plum-soft),transparent)] px-5 py-14 text-center">
      <Divider />
      <Verse
        reference={VERSE_BAND.reference}
        className="max-w-[26ch] [&_blockquote]:text-[clamp(1.625rem,1.2rem+1.6vw,2.25rem)] [&_blockquote]:leading-tight"
      >
        {VERSE_BAND.text}
      </Verse>
    </div>
  );
}

export function Ministries() {
  return (
    <Section id="ministries">
      <SectionHead
        id="ministries"
        eyebrow="What we do"
        title="Our ministries"
        placeholder={HOME_COPY_IS_PLACEHOLDER}
        center
      />
      <ul className="m-0 grid list-none border-y-[3px] border-double border-line p-0 lg:grid-cols-2 lg:gap-x-10">
        {MINISTRIES.map((m) => (
          <li
            key={m.title}
            className="border-b border-line px-1 py-5 last:border-b-0 lg:[&:nth-last-child(2)]:border-b-0"
          >
            <h3 className="text-h3 text-plum">
              <span aria-hidden="true" className="mr-1.5 text-[1.125rem] text-gold">
                ✠
              </span>
              {m.title}
            </h3>
            <p className="text-muted">{m.text}</p>
          </li>
        ))}
      </ul>
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
    <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-left">
      <div className="flex min-w-0 flex-col">
        <span className="text-small text-muted">{label}</span>
        <span className="font-bold break-words select-all">{value}</span>
      </div>
      <CopyButton value={value} label={copyLabel} />
    </div>
  );
}

export function FindUs() {
  return (
    <Section id="contact" className="pt-4">
      <Notice className="mx-auto max-w-[680px] text-center">
        <Eyebrow>
          Visit or contact
          <PlaceholderMark show={CHURCH_DETAILS_ARE_PLACEHOLDERS} />
        </Eyebrow>
        <h2 id="contact-title" className="text-h2 text-plum">
          Find us
        </h2>
        <p className="text-muted">
          Prayer sessions take place in person at the church. Please arrive a few minutes early and
          ask for the prayer team.
        </p>
        <ContactRow label="Address" value={CHURCH.addressLines.join(", ")} copyLabel="address" />
        <ContactRow label="Phone" value={CHURCH.phone} copyLabel="phone number" />
        <ContactRow label="Email" value={CHURCH.email} copyLabel="email address" />
        <div className="pt-2">
          <a
            href={mapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-plum underline underline-offset-4 hover:no-underline"
          >
            Open in Google Maps
          </a>
        </div>
      </Notice>
    </Section>
  );
}
