import type { Slot } from "@/lib/api";
import { buildDays, monthGrid, monthsBetween, slotMinutes } from "./days";

const TZ = "America/Toronto";
const NOW = new Date("2026-11-04T15:00:00Z");
const s = (start: string, state: Slot["state"], bookable = state === "free"): Slot => ({
  start,
  end: new Date(new Date(start).getTime() + 30 * 60_000).toISOString(),
  state,
  bookable,
});

const base = {
  blockedDates: [],
  weekBooked: [],
  timeZone: TZ,
  from: "2026-11-04",
  to: "2026-12-30",
  now: NOW,
};

describe("buildDays", () => {
  it("groups slots into church-time days, soonest first", () => {
    const days = buildDays({
      ...base,
      slots: [
        s("2026-11-13T00:30:00.000Z", "free"),
        s("2026-11-06T00:00:00.000Z", "taken"),
        s("2026-11-13T00:00:00.000Z", "taken"),
      ],
    });
    expect(days.map((d) => d.key)).toEqual(["2026-11-05", "2026-11-12"]);
    expect(days[1]?.slots.map((x) => x.start)).toEqual([
      "2026-11-13T00:00:00.000Z",
      "2026-11-13T00:30:00.000Z",
    ]);
  });

  it("labels open, full and your-booking days", () => {
    const days = buildDays({
      ...base,
      slots: [
        s("2026-11-06T00:00:00.000Z", "taken"),
        s("2026-11-06T00:30:00.000Z", "free"),
        s("2026-11-13T00:00:00.000Z", "taken"),
        s("2026-11-13T00:30:00.000Z", "taken"),
        s("2026-11-20T00:00:00.000Z", "mine"),
        s("2026-11-20T00:30:00.000Z", "free", false),
      ],
      weekBooked: ["2026-11-16"],
    });
    expect(days.map((d) => [d.kind, d.freeCount, d.hasMine, d.weekBooked])).toEqual([
      ["open", 1, false, false],
      ["full", 0, false, false],
      ["open", 0, true, true],
    ]);
  });

  it("adds blocked dates in range that have no slots", () => {
    const days = buildDays({
      ...base,
      slots: [],
      blockedDates: [
        { date: "2026-12-24", reason: "Christmas Eve" },
        { date: "2027-01-07", reason: "Out of range" },
      ],
    });
    expect(days).toEqual([
      expect.objectContaining({
        key: "2026-12-24",
        kind: "blocked",
        blockedReason: "Christmas Eve",
      }),
    ]);
  });

  it("drops days whose sessions have all ended", () => {
    const days = buildDays({ ...base, slots: [s("2026-11-03T00:00:00.000Z", "taken")] });
    expect(days).toEqual([]);
  });
});

describe("calendar helpers", () => {
  it("builds a Monday-first month grid", () => {
    const cells = monthGrid("2026-11-12");
    // 1 November 2026 is a Sunday: six empty cells first.
    expect(cells.slice(0, 7).map((c) => c.key)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      "2026-11-01",
    ]);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
  });

  it("lists the months a range covers", () => {
    expect(monthsBetween("2026-11-04", "2027-01-02")).toEqual([
      "2026-11-01",
      "2026-12-01",
      "2027-01-01",
    ]);
  });

  it("measures a slot's length", () => {
    expect(slotMinutes({ start: "2026-11-13T00:00:00Z", end: "2026-11-13T00:30:00Z" })).toBe(30);
  });
});
