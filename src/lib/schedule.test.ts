import { nextOpenDay, summariseRules } from "./schedule";

describe("summariseRules", () => {
  it("orders by weekday then time and words each rule", () => {
    expect(
      summariseRules([
        { weekday: 4, start_time: "19:00", end_time: "21:00", slot_minutes: 30 },
        { weekday: 2, start_time: "10:00", end_time: "11:00", slot_minutes: 20 },
        { weekday: 4, start_time: "09:00", end_time: "10:00", slot_minutes: 15 },
      ]),
    ).toEqual([
      { day: "Tuesday", times: "10:00 – 11:00 AM", length: "20-minute sessions" },
      { day: "Thursday", times: "9:00 – 10:00 AM", length: "15-minute sessions" },
      { day: "Thursday", times: "7:00 – 9:00 PM", length: "30-minute sessions" },
    ]);
  });

  it("is empty when there are no rules", () => {
    expect(summariseRules([])).toEqual([]);
  });
});

describe("nextOpenDay", () => {
  const TZ = "America/Toronto";
  const slot = (start: string, state: "free" | "taken" | "mine", bookable = state === "free") => ({
    start,
    end: start,
    state,
    bookable,
  });

  it("skips full days and returns the first open day's first time and free count", () => {
    const slots = [
      // Thu 5 Nov: past or full
      slot("2026-11-06T00:00:00.000Z", "taken"),
      slot("2026-11-06T00:30:00.000Z", "free", false),
      // Thu 12 Nov: 7:00 taken, 3 free
      slot("2026-11-13T01:00:00.000Z", "free"),
      slot("2026-11-13T00:00:00.000Z", "taken"),
      slot("2026-11-13T00:30:00.000Z", "free"),
      slot("2026-11-13T01:30:00.000Z", "free"),
    ];
    expect(nextOpenDay(slots, TZ)).toEqual({
      firstStart: "2026-11-13T00:00:00.000Z",
      freeCount: 3,
    });
  });

  it("is null when nothing can be booked", () => {
    expect(nextOpenDay([slot("2026-11-13T00:00:00.000Z", "taken")], TZ)).toBeNull();
    expect(nextOpenDay([], TZ)).toBeNull();
  });
});
