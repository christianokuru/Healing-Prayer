import type { PublicRule } from "./api/types";
import { clockToMinutes, formatClockRange, weekdayName } from "./time";

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
