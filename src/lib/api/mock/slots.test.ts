import { buildSlots, generateSlots, type ScheduleData } from "./slots";
import type { MockAppointment } from "./store";

const TZ = "America/Toronto";
const NOW = new Date("2026-11-04T15:00:00Z"); // Wednesday 4 November, 10:00 AM in Toronto

const schedule = (overrides: Partial<ScheduleData> = {}): ScheduleData => ({
  timezone: TZ,
  bookingWindowWeeks: 8,
  rules: [
    {
      id: "r1",
      weekday: 4,
      start_time: "19:00",
      end_time: "21:00",
      slot_minutes: 30,
      active: true,
    },
  ],
  blockedDates: new Set(),
  ...overrides,
});

const booking = (over: Partial<MockAppointment>): MockAppointment => ({
  id: "a",
  user_id: "other",
  slot_start: "2026-11-06T00:00:00.000Z",
  slot_end: "2026-11-06T00:30:00.000Z",
  status: "booked",
  prayer_point: "x",
  created_at: NOW.toISOString(),
  cancelled_by: null,
  ...over,
});

describe("generateSlots", () => {
  it("makes four 30-minute slots from 7 to 9 PM on a Thursday, in UTC", () => {
    const slots = generateSlots(schedule(), "2026-11-12", "2026-11-12");
    expect(slots.map((s) => s.start.toISOString())).toEqual([
      "2026-11-13T00:00:00.000Z",
      "2026-11-13T00:30:00.000Z",
      "2026-11-13T01:00:00.000Z",
      "2026-11-13T01:30:00.000Z",
    ]);
  });

  it("follows daylight saving: summer slots are an hour earlier in UTC", () => {
    const slots = generateSlots(schedule(), "2026-06-11", "2026-06-11");
    expect(slots[0]?.start.toISOString()).toBe("2026-06-11T23:00:00.000Z");
  });

  it("skips blocked dates, inactive rules and other weekdays", () => {
    expect(
      generateSlots(
        schedule({ blockedDates: new Set(["2026-12-24"]) }),
        "2026-12-24",
        "2026-12-24",
      ),
    ).toHaveLength(0);
    const off = schedule();
    off.rules[0]!.active = false;
    expect(generateSlots(off, "2026-11-12", "2026-11-12")).toHaveLength(0);
    expect(generateSlots(schedule(), "2026-11-09", "2026-11-11")).toHaveLength(0);
  });
});

describe("buildSlots", () => {
  const build = (appointments: MockAppointment[], userId: string | null, over = {}) =>
    buildSlots({
      schedule: schedule(over),
      appointments,
      from: "2026-11-05",
      to: "2026-11-12",
      userId,
      now: NOW,
    });

  it("marks taken and mine without revealing who booked", () => {
    const result = build(
      [
        booking({ id: "a1", user_id: "other" }),
        booking({
          id: "a2",
          user_id: "me",
          slot_start: "2026-11-13T00:30:00.000Z",
          slot_end: "2026-11-13T01:00:00.000Z",
        }),
      ],
      "me",
    );
    const byStart = Object.fromEntries(result.slots.map((s) => [s.start, s]));
    expect(byStart["2026-11-06T00:00:00.000Z"]).toMatchObject({ state: "taken", bookable: false });
    expect(byStart["2026-11-13T00:30:00.000Z"]).toMatchObject({ state: "mine", bookable: false });
    expect(Object.keys(result.slots[0]!)).toEqual(["start", "end", "state", "bookable"]);
  });

  it("blocks the rest of a week where the member already has a booking", () => {
    const result = build([booking({ user_id: "me" })], "me");
    expect(result.week_booked).toEqual(["2026-11-02"]);
    const sameWeek = result.slots.filter((s) => s.start.startsWith("2026-11-06"));
    expect(sameWeek.every((s) => !s.bookable)).toBe(true);
    const nextWeek = result.slots.find((s) => s.start === "2026-11-13T00:00:00.000Z");
    expect(nextWeek?.bookable).toBe(true);
  });

  it("ignores cancelled bookings", () => {
    const result = build([booking({ status: "cancelled" })], null);
    expect(result.slots[0]).toMatchObject({ state: "free", bookable: true });
  });

  it("makes slots past the booking window not bookable", () => {
    const result = build([], null, { bookingWindowWeeks: 1 });
    expect(result.slots.find((s) => s.start.startsWith("2026-11-06"))?.bookable).toBe(true);
    expect(result.slots.find((s) => s.start.startsWith("2026-11-13"))?.bookable).toBe(false);
  });

  it("still shows a booking that no longer matches the schedule", () => {
    const odd = booking({
      user_id: "me",
      slot_start: "2026-11-10T15:00:00.000Z",
      slot_end: "2026-11-10T15:30:00.000Z",
    });
    const result = build([odd], "me");
    expect(result.slots).toContainEqual({
      start: "2026-11-10T15:00:00.000Z",
      end: "2026-11-10T15:30:00.000Z",
      state: "mine",
      bookable: false,
    });
  });
});
