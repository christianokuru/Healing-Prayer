import { Suspense } from "react";
import { ButtonLink, Eyebrow, OrderList, Skeleton, type OrderItem } from "@/components/ui";
import { getPublicSchedule } from "@/lib/api/server";
import { summariseRules } from "@/lib/schedule";
import { timeZoneLabel } from "@/lib/time";
import { SESSIONS } from "../content";

async function OrderOfTheWeek() {
  const schedule = await getPublicSchedule().catch(() => null);
  if (!schedule) {
    return (
      <p className="text-plum-soft">
        We could not load the session times just now. You can still see every free time on the
        booking page.
      </p>
    );
  }
  const sessions = summariseRules(schedule.rules);
  if (sessions.length === 0) {
    return <p className="text-plum-soft">New session times will be announced soon.</p>;
  }
  const lengths = [...new Set(schedule.rules.map((r) => r.slot_minutes))];
  const items: OrderItem[] = [
    ...sessions.map((s) => ({ label: s.day, value: s.times })),
    ...(lengths.length === 1 ? [{ label: "Each session", value: `${lengths[0]} minutes` }] : []),
    { label: "Book up to", value: `${schedule.booking_window_weeks} weeks ahead` },
  ];
  return (
    <OrderList
      tone="dark"
      title="Order of the week"
      items={items}
      footnote={`All times in ${timeZoneLabel(schedule.timezone)} · one session per person each week`}
    />
  );
}

/** The plum band with the live schedule as an "order of the week" (UI.md section 6.1). */
export function Sessions() {
  return (
    <section id="sessions" aria-labelledby="sessions-title" className="py-10">
      <div className="mx-auto max-w-content gutter">
        <div className="relative grid gap-7 overflow-hidden rounded-[26px] bg-plum px-6 py-9 text-plum-ink before:absolute before:-top-16 before:-right-16 before:size-64 before:rounded-full before:bg-[radial-gradient(circle,rgb(255_210_122/0.32),transparent_70%)] lg:grid-cols-2 lg:items-center lg:p-12">
          <div className="relative flex flex-col gap-3">
            <Eyebrow tone="dark">Prayer sessions</Eyebrow>
            <h2 id="sessions-title" className="text-h2">
              {SESSIONS.title}
            </h2>
            <p className="text-plum-soft">{SESSIONS.text}</p>
            <div className="pt-1">
              <ButtonLink href="/book" variant="gold">
                See free times
              </ButtonLink>
            </div>
          </div>
          <Suspense
            fallback={
              <div aria-busy="true">
                <span className="sr-only">Loading session times…</span>
                <Skeleton className="h-44 rounded-sm bg-plum-ink/10" />
              </div>
            }
          >
            <OrderOfTheWeek />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
