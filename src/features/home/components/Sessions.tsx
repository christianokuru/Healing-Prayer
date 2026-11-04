import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { getPublicSchedule } from "@/lib/api/server";
import { summariseRules } from "@/lib/schedule";
import { timeZoneLabel } from "@/lib/time";
import { Section } from "./Sections";

async function SessionList() {
  const schedule = await getPublicSchedule().catch(() => null);
  if (!schedule) {
    return (
      <p className="max-w-prose">
        We could not load the session times just now. You can still see every free time on the{" "}
        <Link href="/book" className="font-bold text-plum underline underline-offset-4">
          booking page
        </Link>
        .
      </p>
    );
  }

  const sessions = summariseRules(schedule.rules);
  if (sessions.length === 0) {
    return (
      <p className="max-w-prose">New session times will be announced soon. Please check back.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 md:grid-cols-2">
        {sessions.map((s) => (
          <li
            key={`${s.day}-${s.times}`}
            className="flex flex-col gap-1 rounded-lg bg-plum-soft p-5"
          >
            <span className="text-label text-muted uppercase">Every week</span>
            <span className="font-display text-h2 font-semibold">{s.day}s</span>
            <span className="text-body font-bold tabular-nums">{s.times}</span>
            <span className="text-muted">{s.length}</span>
          </li>
        ))}
      </ul>
      <p className="text-small text-muted">
        Times are in {timeZoneLabel(schedule.timezone)}. You can book up to{" "}
        {schedule.booking_window_weeks} weeks ahead, one session per week.
      </p>
    </div>
  );
}

function SessionListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2" aria-busy="true">
      <span className="sr-only">Loading session times…</span>
      <Skeleton className="h-36 rounded-lg" />
    </div>
  );
}

export function Sessions() {
  return (
    <Section id="sessions" eyebrow="Prayer sessions" title="When sessions run">
      <Suspense fallback={<SessionListSkeleton />}>
        <SessionList />
      </Suspense>
      <div>
        <Link
          href="/book"
          className="inline-flex min-h-13 items-center justify-center rounded-full bg-plum px-7 font-bold text-plum-ink hover:brightness-110"
        >
          See free times
        </Link>
      </div>
    </Section>
  );
}
