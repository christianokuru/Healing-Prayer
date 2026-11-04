import { emailSchema, phoneSchema, prayerPointSchema } from "./validation";

describe("phoneSchema", () => {
  it("normalises common Canadian formats", () => {
    expect(phoneSchema.parse("(416) 555-0123")).toBe("4165550123");
    expect(phoneSchema.parse("+1 416 555 0123")).toBe("+14165550123");
  });

  it("rejects letters and numbers that are too short or long", () => {
    expect(phoneSchema.safeParse("0801-234-ABC").success).toBe(false);
    expect(phoneSchema.safeParse("12345").success).toBe(false);
    expect(phoneSchema.safeParse("+1234567890123456").success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("trims and lowercases", () => {
    expect(emailSchema.parse("  Ngozi@Example.COM ")).toBe("ngozi@example.com");
  });
});

describe("prayerPointSchema", () => {
  it("requires some text", () => {
    expect(prayerPointSchema.safeParse("   ").success).toBe(false);
  });

  it("counts emoji as one character each", () => {
    expect(prayerPointSchema.safeParse("🙏".repeat(10_000)).success).toBe(true);
    expect(prayerPointSchema.safeParse("🙏".repeat(10_001)).success).toBe(false);
  });
});
