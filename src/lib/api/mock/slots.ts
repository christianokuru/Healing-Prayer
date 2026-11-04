import {
  addDays,
  clockToMinutes,
  daysBetween,
  isoWeekday,
  minutesToClock,
  toDateKey,
  weekStart,
  zonedToUtc,
} from "../../time";
import type { Slot } from "../types";
import type { MockAppointment, MockRule } from "./store";

// Slot building for the mock. Mirrors ISAAC.md section 5 step by step, so the mock and
// the real backend agree. This is the only frontend code allowed to compute slots.

export type ScheduleData = {
  timezone: string;
  bookingWindowWeeks: number;
  rules: MockRule[];
  blockedDates: Set<string>;
};

type GeneratedSlot = { start: Date; end: Date };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Steps 1 and 2: every slot the schedule offers between two date keys (inclusive). */
export function generateSlots(schedule: ScheduleData, from: string, to: string): GeneratedSlot[] {
  const out: GeneratedSlot[] = [];
  for (let i = 0; i <= daysBetween(from, to); i++) {
    const day = addDays(from, i);
    if (schedule.blockedDates.has(day)) continue;
    for (const rule of schedule.rules) {
      if (!rule.active || rule.weekday !== isoWeekday(day)) continue;
      const end = clockToMinutes(rule.end_time);
      for (
        let t = clockToMinutes(rule.start_time);
        t + rule.slot_minutes <= end;
        t += rule.slot_minutes
      ) {
        const start = zonedToUtc(day, minutesToClock(t), schedule.timezone);
        // A local time that does not exist (clocks spring forward) is skipped.
        if (!start) continue;
        out.push({ start, end: new Date(start.getTime() + rule.slot_minutes * 60_000) });
      }
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const isActive = (a: MockAppointment) => a.status !== "cancelled";

const overlaps = (a: GeneratedSlot, b: { slot_start: string; slot_end: string }) =>
  a.start.getTime() < new Date(b.slot_end).getTime() &&
  new Date(b.slot_start).getTime() < a.end.getTime();

export function windowEnd(schedule: ScheduleData, now: Date): Date {
  return new Date(now.getTime() + schedule.bookingWindowWeeks * WEEK_MS);
}

/** Monday date keys of weeks where `userId` holds an active booking. */
export function bookedWeeks(
  appointments: MockAppointment[],
  userId: string | null,
  timezone: string,
): Set<string> {
  if (!userId) return new Set();
  return new Set(
    appointments
      .filter((a) => a.user_id === userId && isActive(a))
      .map((a) => weekStart(toDateKey(a.slot_start, timezone))),
  );
}

/** Steps 3 to 5: the `GET /api/slots` response. */
export function buildSlots(input: {
  schedule: ScheduleData;
  appointments: MockAppointment[];
  from: string;
  to: string;
  userId: string | null;
  now: Date;
}): { slots: Slot[]; week_booked: string[] } {
  const { schedule, from, to, userId, now } = input;
  const active = input.appointments.filter(isActive);
  const weeks = bookedWeeks(active, userId, schedule.timezone);
  const limit = windowEnd(schedule, now);

  const slots: Slot[] = generateSlots(schedule, from, to).map((slot) => {
    const booking = active.find((a) => overlaps(slot, a));
    const state = !booking ? "free" : booking.user_id === userId ? "mine" : "taken";
    const week = weekStart(toDateKey(slot.start, schedule.timezone));
    const bookable =
      state === "free" && slot.start > now && slot.start <= limit && !weeks.has(week);
    return { start: slot.start.toISOString(), end: slot.end.toISOString(), state, bookable };
  });

  // Step 5: active bookings that no longer match the schedule still show.
  const starts = new Set(slots.map((s) => s.start));
  for (const a of active) {
    const day = toDateKey(a.slot_start, schedule.timezone);
    if (day < from || day > to || starts.has(new Date(a.slot_start).toISOString())) continue;
    slots.push({
      start: new Date(a.slot_start).toISOString(),
      end: new Date(a.slot_end).toISOString(),
      state: a.user_id === userId ? "mine" : "taken",
      bookable: false,
    });
  }

  slots.sort((a, b) => a.start.localeCompare(b.start));
  // Only weeks that overlap the requested range.
  const firstWeek = weekStart(from);
  const week_booked = [...weeks].filter((w) => w >= firstWeek && w <= to).sort();
  return { slots, week_booked };
}
