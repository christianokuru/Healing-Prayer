import {
  addDays,
  clockToMinutes,
  daysBetween,
  formatDateKeyLong,
  formatDayLong,
  formatDayShort,
  formatMonth,
  formatTime,
  formatTimeRange,
  isClockTime,
  isDateKey,
  isoWeekday,
  minutesToClock,
  toDateKey,
  weekStart,
  zonedToUtc,
} from "./time";

const TZ = "America/Toronto";

describe("display in the church's time zone", () => {
  it("shows a winter 7:00 PM slot on the right day although UTC is a day ahead", () => {
    const start = "2026-11-13T00:00:00Z";
    expect(formatTime(start, TZ)).toBe("7:00 PM");
    expect(formatDayLong(start, TZ)).toBe("Thursday 12 November");
    expect(formatDayShort(start, TZ)).toBe("Thu 12 Nov");
    expect(toDateKey(start, TZ)).toBe("2026-11-12");
  });

  it("shows a summer 7:00 PM slot (UTC−4)", () => {
    expect(formatTime("2026-06-11T23:00:00Z", TZ)).toBe("7:00 PM");
    expect(toDateKey("2026-06-11T23:00:00Z", TZ)).toBe("2026-06-11");
  });

  it("formats ranges", () => {
    expect(formatTimeRange("2026-11-13T00:00:00Z", "2026-11-13T00:30:00Z", TZ)).toBe(
      "7:00 – 7:30 PM",
    );
    expect(formatTimeRange("2026-11-12T16:30:00Z", "2026-11-12T17:00:00Z", TZ)).toBe(
      "11:30 AM – 12:00 PM",
    );
  });

  it("formats date keys without shifting the day", () => {
    expect(formatDateKeyLong("2026-11-12")).toBe("Thursday 12 November");
    expect(formatMonth("2026-12-01")).toBe("December 2026");
  });
});

describe("zonedToUtc", () => {
  it("converts winter and summer evenings", () => {
    expect(zonedToUtc("2026-11-12", "19:00", TZ)?.toISOString()).toBe("2026-11-13T00:00:00.000Z");
    expect(zonedToUtc("2026-06-11", "19:00", TZ)?.toISOString()).toBe("2026-06-11T23:00:00.000Z");
  });

  it("keeps 7:00 PM on the Thursdays either side of the clock changes", () => {
    // Clocks go back on Sunday 1 November 2026 and forward on Sunday 14 March 2027.
    expect(zonedToUtc("2026-10-29", "19:00", TZ)?.toISOString()).toBe("2026-10-29T23:00:00.000Z");
    expect(zonedToUtc("2026-11-05", "19:00", TZ)?.toISOString()).toBe("2026-11-06T00:00:00.000Z");
    expect(zonedToUtc("2027-03-11", "19:00", TZ)?.toISOString()).toBe("2027-03-12T00:00:00.000Z");
    expect(zonedToUtc("2027-03-18", "19:00", TZ)?.toISOString()).toBe("2027-03-18T23:00:00.000Z");
  });

  it("returns null for a local time that does not exist (spring forward)", () => {
    expect(zonedToUtc("2027-03-14", "02:30", TZ)).toBeNull();
  });

  it("returns the first occurrence of a repeated local time (fall back)", () => {
    // 1:30 AM happens twice on 1 November 2026: first in EDT (05:30Z), then in EST (06:30Z).
    expect(zonedToUtc("2026-11-01", "01:30", TZ)?.toISOString()).toBe("2026-11-01T05:30:00.000Z");
  });

  // Provinces change their clock rules (British Columbia, for example), and machines carry
  // different versions of the time zone database. So check the result in the zone itself
  // instead of hard-coding a UTC value.
  it.each([
    "America/Vancouver",
    "America/Edmonton",
    "America/Winnipeg",
    "America/Halifax",
    "America/St_Johns",
  ])("gives 7:00 PM local time on the right day in %s", (zone) => {
    const instant = zonedToUtc("2026-11-12", "19:00", zone);
    expect(instant).not.toBeNull();
    expect(formatTime(instant!, zone)).toBe("7:00 PM");
    expect(toDateKey(instant!, zone)).toBe("2026-11-12");
  });
});

describe("calendar helpers", () => {
  it("adds days across months and years", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-11-04", "2027-01-06")).toBe(63);
  });

  it("numbers weekdays 1 (Monday) to 7 (Sunday)", () => {
    expect(isoWeekday("2026-11-09")).toBe(1);
    expect(isoWeekday("2026-11-12")).toBe(4);
    expect(isoWeekday("2026-11-15")).toBe(7);
  });

  it("finds the Monday that starts the week", () => {
    expect(weekStart("2026-11-12")).toBe("2026-11-09");
    expect(weekStart("2026-11-15")).toBe("2026-11-09");
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
  });

  it("validates date keys and clock times", () => {
    expect(isDateKey("2026-11-12")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("12/11/2026")).toBe(false);
    expect(isClockTime("19:30")).toBe(true);
    expect(isClockTime("24:00")).toBe(false);
    expect(clockToMinutes("19:30")).toBe(1170);
    expect(minutesToClock(1170)).toBe("19:30");
  });
});
