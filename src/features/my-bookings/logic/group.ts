import type { Appointment } from "@/lib/api";

export type GroupedBookings = {
  /** Booked and not started yet, soonest first. The first is "your next session". */
  upcoming: Appointment[];
  /** Everything else (held, completed, cancelled), newest first. */
  history: Appointment[];
};

export function groupBookings(
  appointments: Appointment[],
  now: Date = new Date(),
): GroupedBookings {
  const upcoming = appointments
    .filter((a) => a.status === "booked" && new Date(a.slot_start) > now)
    .sort((a, b) => a.slot_start.localeCompare(b.slot_start));
  const ids = new Set(upcoming.map((a) => a.id));
  const history = appointments
    .filter((a) => !ids.has(a.id))
    .sort((a, b) => b.slot_start.localeCompare(a.slot_start));
  return { upcoming, history };
}

/** The status word for the history list. A booked session in the past has been held. */
export function historyLabel(a: Appointment): { text: string; tone: "ok" | "neutral" } {
  if (a.status === "cancelled") return { text: "Cancelled", tone: "neutral" };
  return { text: "Completed", tone: "ok" };
}
