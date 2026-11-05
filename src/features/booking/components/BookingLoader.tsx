import { redirect } from "next/navigation";
import { getPublicSchedule, getServerApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/getSession";
import { addDays, todayKey } from "@/lib/time";
import { BookingFlow } from "./BookingFlow";

// The slots API answers at most 62 days per request.
const MAX_RANGE_DAYS = 61;

/** Where a member books: inside the account area, keeping any chosen time. */
export function accountBookUrl(slot: string | null): string {
  return slot ? `/dashboard/book?slot=${encodeURIComponent(slot)}` : "/dashboard/book";
}

/** Loads the session, schedule and first slots on the server, then hands over to the flow. */
export async function BookingLoader({
  searchParams,
  area,
}: {
  searchParams: Promise<{ slot?: string | string[] }>;
  /** "public" at /book; "account" at /dashboard/book inside the account sidebar. */
  area: "public" | "account";
}) {
  const [schedule, user, params] = await Promise.all([
    getPublicSchedule(),
    getSession().catch(() => null),
    searchParams,
  ]);
  const slot = typeof params.slot === "string" ? params.slot : null;

  // Logged-in members book inside their account area (UI.md section 6.3).
  if (area === "public" && user) redirect(accountBookUrl(slot));

  const from = todayKey(schedule.timezone);
  const to = addDays(from, Math.min(schedule.booking_window_weeks * 7, MAX_RANGE_DAYS));
  const initial = await (await getServerApi()).slots({ from, to });

  return (
    <BookingFlow
      // Start fresh when the login state or the chosen time changes. After logging in, the
      // page refreshes in place, and the flow's starting step depends on both.
      key={`${user?.id ?? "visitor"}:${slot ?? ""}`}
      loggedIn={user !== null}
      timeZone={schedule.timezone}
      from={from}
      to={to}
      today={from}
      blockedDates={schedule.blocked_dates}
      initial={initial}
      preselect={slot}
    />
  );
}
