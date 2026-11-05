import { ArchCard, Badge, ButtonLink, Eyebrow, Notice, SingleCandle, Verse } from "@/components/ui";
import type { Appointment } from "@/lib/api";
import { getPublicSchedule, getServerApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/getSession";
import { formatDayLong, formatTimeRange } from "@/lib/time";
import { groupBookings, historyLabel } from "../logic/group";
import { CancelBooking } from "./CancelBooking";

function when(a: Appointment, tz: string) {
  return `${formatDayLong(a.slot_start, tz)}, ${formatTimeRange(a.slot_start, a.slot_end, tz)}`;
}

function NextSession({ next, tz }: { next: Appointment; tz: string }) {
  return (
    <ArchCard>
      <Eyebrow>Your next session</Eyebrow>
      <p className="font-display text-h2 leading-tight text-plum">
        {formatDayLong(next.slot_start, tz)}
      </p>
      <p className="text-[1.0625rem] font-bold tabular-nums md:text-[1.25rem]">
        {formatTimeRange(next.slot_start, next.slot_end, tz)}
      </p>
      <Verse reference="Philippians 4:6" className="max-w-[36ch] [&_blockquote]:text-muted">
        In every thing by prayer and supplication with thanksgiving let your requests be made known
        unto God.
      </Verse>
      <div className="pt-1">
        <CancelBooking id={next.id} when={when(next, tz)} />
      </div>
    </ArchCard>
  );
}

function NoBookings() {
  return (
    <ArchCard>
      <SingleCandle className="h-11 w-auto md:h-[60px]" />
      <Eyebrow>Your next session</Eyebrow>
      <p className="font-display text-h2 leading-tight text-plum">You have no bookings yet</p>
      <p className="max-w-[36ch] text-muted">
        Choose a time that suits you and the prayer team will be ready for you.
      </p>
      <Verse reference="Matthew 7:7" className="max-w-[34ch] [&_blockquote]:text-muted">
        Ask, and it shall be given you; seek, and ye shall find.
      </Verse>
      <ButtonLink href="/dashboard/book">Book prayer</ButtonLink>
    </ArchCard>
  );
}

function Register({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="border-y-[3px] border-double border-line bg-surface">
      <h2 className="px-1 pt-4 pb-1.5 caps text-gold">{title}</h2>
      <ul className="m-0 list-none p-0">{children}</ul>
    </section>
  );
}

/** The member dashboard (UI.md section 6.4). */
export async function MyBookings() {
  const [schedule, user, api] = await Promise.all([
    getPublicSchedule(),
    getSession(),
    getServerApi(),
  ]);
  const tz = schedule.timezone;
  const { appointments } = await api.appointments.mine();
  const { upcoming, history } = groupBookings(appointments);
  const [next, ...later] = upcoming;
  const firstName = user?.full_name.split(" ")[0] ?? "friend";

  return (
    <div className="mx-auto flex max-w-content flex-col gap-6 py-6 gutter md:gap-8 md:py-10 lg:px-10 lg:py-12">
      <div className="flex flex-col gap-1.5 md:gap-2">
        <Eyebrow>My bookings</Eyebrow>
        <h1 className="text-h1 text-plum">Peace be with you, {firstName}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
        {next ? <NextSession next={next} tz={tz} /> : <NoBookings />}

        <div className="flex flex-col gap-6">
          {later.length > 0 && (
            <Register title="Also booked">
              {later.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 border-t border-line px-1 py-3"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-display text-h3 leading-tight text-plum">
                      {formatDayLong(a.slot_start, tz)}
                    </span>
                    <span className="text-small text-muted tabular-nums">
                      {formatTimeRange(a.slot_start, a.slot_end, tz)}
                    </span>
                  </span>
                  <CancelBooking id={a.id} when={when(a, tz)} variant="link" />
                </li>
              ))}
            </Register>
          )}

          {history.length > 0 && (
            <Register title="Past and cancelled">
              {history.map((a) => {
                const label = historyLabel(a);
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 border-t border-line px-1 py-3"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="font-display text-h3 leading-tight text-plum">
                        {formatDayLong(a.slot_start, tz)}
                      </span>
                      <span className="text-small text-muted tabular-nums">
                        {formatTimeRange(a.slot_start, a.slot_end, tz)}
                      </span>
                    </span>
                    <Badge tone={label.tone}>{label.text}</Badge>
                  </li>
                );
              })}
            </Register>
          )}

          {next && (
            <Notice className="border-line">
              <Eyebrow>Book another</Eyebrow>
              <p>
                You can book one session each week, up to {schedule.booking_window_weeks} weeks
                ahead.
              </p>
              <div>
                <ButtonLink href="/dashboard/book">See free times</ButtonLink>
              </div>
            </Notice>
          )}
        </div>
      </div>
    </div>
  );
}
