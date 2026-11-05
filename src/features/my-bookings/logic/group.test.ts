import type { Appointment } from "@/lib/api";
import { groupBookings, historyLabel } from "./group";

const NOW = new Date("2026-11-05T12:00:00Z");
const a = (id: string, slot_start: string, status: Appointment["status"]): Appointment => ({
  id,
  slot_start,
  slot_end: slot_start,
  status,
  prayer_point: "x",
  created_at: slot_start,
});

describe("groupBookings", () => {
  it("puts future booked sessions first, soonest first, and everything else in history", () => {
    const { upcoming, history } = groupBookings(
      [
        a("later", "2026-11-27T00:00:00Z", "booked"),
        a("past", "2026-10-23T00:00:00Z", "completed"),
        a("next", "2026-11-13T00:00:00Z", "booked"),
        a("cancelled-future", "2026-11-20T00:00:00Z", "cancelled"),
        a("older", "2026-10-02T00:00:00Z", "cancelled"),
      ],
      NOW,
    );
    expect(upcoming.map((x) => x.id)).toEqual(["next", "later"]);
    expect(history.map((x) => x.id)).toEqual(["cancelled-future", "past", "older"]);
  });

  it("labels history", () => {
    expect(historyLabel(a("1", "2026-10-02T00:00:00Z", "cancelled")).text).toBe("Cancelled");
    expect(historyLabel(a("2", "2026-10-02T00:00:00Z", "completed")).text).toBe("Completed");
    expect(historyLabel(a("3", "2026-10-02T00:00:00Z", "booked")).text).toBe("Completed");
  });
});
