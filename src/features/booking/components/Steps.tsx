"use client";

import { forwardRef, type ReactNode } from "react";
import {
  ArchCard,
  Button,
  ButtonLink,
  Eyebrow,
  Field,
  SingleCandle,
  Textarea,
  Verse,
} from "@/components/ui";
import type { Slot } from "@/lib/api";
import { cn } from "@/lib/cn";
import { PRAYER_POINT_MAX } from "@/lib/config";
import { formatDayLong, formatDayShort, formatTimeRange } from "@/lib/time";
import { codePointLength } from "@/lib/validation";
import { slotMinutes } from "../logic/days";

export type Step = 1 | 2 | 3 | 4;

const STEP_NAMES = ["Choose a time", "Prayer point", "Confirm"];
const ROMAN = ["I", "II", "III"];

/** I · II · III progress (UI.md section 5, "Progress steps"). */
export function StepProgress({ step }: { step: Step }) {
  if (step === 4) return null;
  return (
    <ol aria-label="Booking steps" className="m-0 grid list-none grid-cols-3 gap-2 p-0">
      {STEP_NAMES.map((name, i) => {
        const n = i + 1;
        const current = n === step;
        return (
          <li
            key={name}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex flex-col gap-1.5 text-[0.75rem] text-muted before:h-1 before:rounded-full before:bg-line md:text-small",
              n <= step && "before:bg-plum",
              current && "font-bold text-ink",
            )}
          >
            <span className="caps text-gold">{ROMAN[i]}</span>
            {name}
          </li>
        );
      })}
    </ol>
  );
}

/** Heading that takes focus when its step opens, so screen readers announce the change. */
export const StepHeading = forwardRef<HTMLHeadingElement, { children: ReactNode }>(
  function StepHeading({ children }, ref) {
    return (
      <h2 ref={ref} tabIndex={-1} className="text-h2 text-plum outline-none">
        {children}
      </h2>
    );
  },
);

/** The chosen date and time with a Change link (steps II and III). */
export function ChosenTime({
  slot,
  timeZone,
  onChange,
}: {
  slot: Slot;
  timeZone: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-plum-soft px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="font-display text-h3 leading-tight text-plum">
          {formatDayLong(slot.start, timeZone)}
        </span>
        <span className="text-small text-muted tabular-nums">
          {formatTimeRange(slot.start, slot.end, timeZone)}
        </span>
      </div>
      <Button variant="link" onClick={onChange}>
        Change
      </Button>
    </div>
  );
}

type PrayerStepProps = {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function PrayerPoint({ value, error, onChange, onBack, onContinue }: PrayerStepProps) {
  const count = codePointLength(value);
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
      className="flex flex-col gap-4"
    >
      <Field
        id="prayer_point"
        label="What would you like prayer for?"
        error={error ?? undefined}
        hint={error ? undefined : "Write as much or as little as you like."}
        count={`${count.toLocaleString("en-US")} / ${PRAYER_POINT_MAX.toLocaleString("en-US")}`}
      >
        {(control) => (
          <Textarea
            {...control}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="For example: healing for my mother, guidance on a decision at work…"
          />
        )}
      </Field>
      <p className="flex gap-2.5 rounded-md bg-plum-soft px-4 py-3 text-small">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="mt-0.5 size-4 shrink-0 text-plum"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <span>
          Only church admins can read this. It is never sent by email or shown to other members.
        </span>
      </p>
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

type ConfirmProps = {
  slot: Slot;
  timeZone: string;
  prayer: string;
  pending: boolean;
  onEditPrayer: () => void;
  onBack: () => void;
  onConfirm: () => void;
};

export function Confirm({
  slot,
  timeZone,
  prayer,
  pending,
  onEditPrayer,
  onBack,
  onConfirm,
}: ConfirmProps) {
  const rows: [string, ReactNode][] = [
    ["Day", formatDayLong(slot.start, timeZone)],
    [
      "Time",
      <span key="t" className="tabular-nums">
        {formatTimeRange(slot.start, slot.end, timeZone)}
      </span>,
    ],
    ["Session", `One-on-one, ${slotMinutes(slot)} minutes`],
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="m-0 flex flex-col rounded-lg border border-line bg-surface px-4 md:px-5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[96px_1fr] gap-3 border-b border-line py-3 md:grid-cols-[120px_1fr]"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="m-0 font-bold">{value}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[96px_1fr] gap-3 py-3 md:grid-cols-[120px_1fr]">
          <dt className="text-muted">Prayer point</dt>
          <dd className="m-0 flex min-w-0 flex-col items-start gap-1">
            <span className="line-clamp-4 [overflow-wrap:anywhere] whitespace-pre-wrap">
              {prayer}
            </span>
            <Button variant="link" onClick={onEditPrayer} className="-ml-1">
              Edit
            </Button>
          </dd>
        </div>
      </dl>
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <Button onClick={onConfirm} loading={pending} loadingText="Booking…">
          Confirm booking
        </Button>
      </div>
    </div>
  );
}

export const Success = forwardRef<
  HTMLHeadingElement,
  { slot: Slot; timeZone: string; onAgain: () => void }
>(function Success({ slot, timeZone, onAgain }, ref) {
  return (
    <ArchCard className="mx-auto w-full max-w-[560px]">
      <SingleCandle className="h-11 w-auto md:h-[60px]" />
      <Eyebrow>Booked</Eyebrow>
      <h2 ref={ref} tabIndex={-1} className="text-h2 text-plum outline-none">
        Your prayer session is booked
      </h2>
      <p className="font-display text-h3 text-plum">{formatDayLong(slot.start, timeZone)}</p>
      <p className="font-bold tabular-nums">{formatTimeRange(slot.start, slot.end, timeZone)}</p>
      <p className="max-w-[40ch] text-muted">
        We have sent a confirmation to your email. You can cancel any time before the session
        starts.
      </p>
      <Verse reference="Matthew 18:20" className="max-w-[34ch] [&_blockquote]:text-muted">
        For where two or three are gathered together in my name, there am I in the midst of them.
      </Verse>
      <div className="flex w-full flex-col gap-2.5 pt-1 sm:flex-row sm:justify-center">
        <ButtonLink href="/dashboard">View my bookings</ButtonLink>
        <Button variant="secondary" onClick={onAgain}>
          Back to times
        </Button>
      </div>
    </ArchCard>
  );
});

/** The chosen time and Continue: a bottom bar on phones and tablets, a side panel on desktop. */
export function ChoiceBar({
  slot,
  timeZone,
  onContinue,
}: {
  slot: Slot | null;
  timeZone: string;
  onContinue: () => void;
}) {
  if (!slot) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-double border-line bg-surface/95 pt-3 gutter pb-[calc(12px+env(safe-area-inset-bottom,0px))] shadow-raised backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-content items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-display text-h3 leading-tight text-plum">
            {formatDayShort(slot.start, timeZone)}
          </span>
          <span className="text-small text-muted tabular-nums">
            {formatTimeRange(slot.start, slot.end, timeZone)} · {slotMinutes(slot)} minutes
          </span>
        </div>
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
}

export function SummaryPanel({
  slot,
  timeZone,
  showContinue,
  onContinue,
}: {
  slot: Slot | null;
  timeZone: string;
  showContinue: boolean;
  onContinue: () => void;
}) {
  return (
    <aside
      aria-label="Your booking"
      className="sticky top-6 hidden flex-col gap-3 rounded-lg border-[3px] border-double border-line bg-surface p-5 lg:flex"
    >
      <Eyebrow>Your booking</Eyebrow>
      <p className="font-display text-h3 text-plum">
        {slot ? formatDayLong(slot.start, timeZone) : "No time chosen yet"}
      </p>
      <p className="text-muted tabular-nums">
        {slot
          ? `${formatTimeRange(slot.start, slot.end, timeZone)} · ${slotMinutes(slot)} minutes`
          : "Pick a free time from the list."}
      </p>
      {showContinue && (
        <Button onClick={onContinue} disabled={!slot}>
          Continue
        </Button>
      )}
      <p className="border-t border-line pt-3 font-verse text-small text-muted italic">
        Only church admins can read your prayer point.
      </p>
    </aside>
  );
}
