import type { PublicRule, Slot } from "./api/types";
import { clockToMinutes, formatClockRange, toDateKey, weekdayName } from "./time";

export type SessionSummary = { day: string; times: string; length: string };

/** Plain-words lines for the public schedule, Monday first: "Thursday · 7:00 – 9:00 PM · 30 minutes". */
export function summariseRules(rules: PublicRule[]): SessionSummary[] {
  return [...rules]
    .sort(
      (a, b) =>
        a.weekday - b.weekday || clockToMinutes(a.start_time) - clockToMinutes(b.start_time),
    )
    .map((rule) => ({
      day: weekdayName(rule.weekday),
      times: formatClockRange(rule.start_time, rule.end_time),
      length: `${rule.slot_minutes}-minute sessions`,
    }));
}

export type NextOpenDay = { firstStart: string; freeCount: number };

/**
 * The soonest day that still has a time someone can book, with that day's first session
 * time and how many times are free. Null when nothing is bookable.
 */
export function nextOpenDay(slots: Slot[], timeZone: string): NextOpenDay | null {
  const byDay = new Map<string, Slot[]>();
  for (const slot of [...slots].sort((a, b) => a.start.localeCompare(b.start))) {
    const key = toDateKey(slot.start, timeZone);
    byDay.set(key, [...(byDay.get(key) ?? []), slot]);
  }
  for (const daySlots of byDay.values()) {
    const freeCount = daySlots.filter((s) => s.state === "free" && s.bookable).length;
    const first = daySlots[0];
    if (first && freeCount > 0) return { firstStart: first.start, freeCount };
  }
  return null;
}
