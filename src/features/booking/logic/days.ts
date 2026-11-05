import type { PublicBlockedDate, Slot } from "@/lib/api";
import { addDays, daysBetween, isoWeekday, toDateKey, weekStart } from "@/lib/time";

// Turns the API's slots into the day cards and calendar cells of the booking screen.
// No slot maths here: availability comes from the API; this only groups and labels it.

export type DayKind = "open" | "full" | "blocked";

export type BookingDay = {
  /** Date key in the church's time zone. */
  key: string;
  kind: DayKind;
  slots: Slot[];
  /** Times someone can book right now. */
  freeCount: number;
  hasMine: boolean;
  /** The member already has a booking this week, so other times are locked. */
  weekBooked: boolean;
  blockedReason: string | null;
};

export function buildDays(input: {
  slots: Slot[];
  blockedDates: PublicBlockedDate[];
  weekBooked: string[];
  timeZone: string;
  from: string;
  to: string;
  now?: Date;
}): BookingDay[] {
  const { slots, blockedDates, timeZone, from, to, now = new Date() } = input;
  const weeks = new Set(input.weekBooked);
  const byDay = new Map<string, Slot[]>();

  for (const slot of slots) {
    if (new Date(slot.end) <= now) continue;
    const key = toDateKey(slot.start, timeZone);
    byDay.set(key, [...(byDay.get(key) ?? []), slot]);
  }

  const days: BookingDay[] = [...byDay].map(([key, daySlots]) => {
    const sorted = [...daySlots].sort((a, b) => a.start.localeCompare(b.start));
    const freeCount = sorted.filter((s) => s.state === "free" && s.bookable).length;
    const hasMine = sorted.some((s) => s.state === "mine");
    const weekBooked = weeks.has(weekStart(key));
    const anyFree = sorted.some((s) => s.state === "free");
    return {
      key,
      kind: anyFree || hasMine ? "open" : "full",
      slots: sorted,
      freeCount,
      hasMine,
      weekBooked,
      blockedReason: null,
    };
  });

  for (const blocked of blockedDates) {
    if (blocked.date < from || blocked.date > to || byDay.has(blocked.date)) continue;
    days.push({
      key: blocked.date,
      kind: "blocked",
      slots: [],
      freeCount: 0,
      hasMine: false,
      weekBooked: false,
      blockedReason: blocked.reason,
    });
  }

  return days.sort((a, b) => a.key.localeCompare(b.key));
}

export type CalendarCell =
  { key: string; day: number; inMonth: true } | { key: null; inMonth: false };

/** A Monday-first month grid for the month containing `monthKey` (any date in it). */
export function monthGrid(monthKey: string): CalendarCell[] {
  const first = `${monthKey.slice(0, 7)}-01`;
  const lead = isoWeekday(first) - 1;
  const [y, m] = first.split("-").map(Number) as [number, number];
  const length = daysBetween(
    first,
    addDays(`${m === 12 ? y + 1 : y}-${String((m % 12) + 1).padStart(2, "0")}-01`, 0),
  );
  const cells: CalendarCell[] = Array.from({ length: lead }, () => ({ key: null, inMonth: false }));
  for (let d = 0; d < length; d++) {
    const key = addDays(first, d);
    cells.push({ key, day: d + 1, inMonth: true });
  }
  return cells;
}

/** First-of-month keys for every month between two date keys. */
export function monthsBetween(from: string, to: string): string[] {
  const months: string[] = [];
  let [y, m] = from.split("-").map(Number) as [number, number];
  const [ty, tm] = to.split("-").map(Number) as [number, number];
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}-${String(m).padStart(2, "0")}-01`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

/** Minutes between a slot's start and end, for "30 minutes". */
export function slotMinutes(slot: Pick<Slot, "start" | "end">): number {
  return Math.round((new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60_000);
}
