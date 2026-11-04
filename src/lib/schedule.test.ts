import { summariseRules } from "./schedule";

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
