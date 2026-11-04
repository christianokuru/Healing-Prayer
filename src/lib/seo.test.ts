import type { Slot } from "./api/types";
import { churchJsonLd, serializeJsonLd, sessionEventsJsonLd, websiteJsonLd } from "./seo";

const TZ = "America/Toronto";
const NOW = new Date("2026-11-04T15:00:00Z");
const slot = (
  start: string,
  end: string,
  state: Slot["state"],
  bookable = state === "free",
): Slot => ({
  start,
  end,
  state,
  bookable,
});

describe("churchJsonLd", () => {
  it("describes the church with a booking action", () => {
    const data = churchJsonLd(true);
    expect(data).toMatchObject({ "@type": "Church", name: "Healing Prayer North-West" });
    expect(data.potentialAction).toMatchObject({ "@type": "ReserveAction" });
  });

  it("leaves placeholder contact details out", () => {
    const data = churchJsonLd(true);
    expect(data).not.toHaveProperty("address");
    expect(data).not.toHaveProperty("telephone");
    expect(data).not.toHaveProperty("email");
  });

  it("includes a structured address once details are real", () => {
    expect(churchJsonLd(false).address).toMatchObject({
      "@type": "PostalAddress",
      addressRegion: "ON",
      addressCountry: "CA",
    });
  });
});

describe("websiteJsonLd", () => {
  it("links the website to the church", () => {
    expect(websiteJsonLd()).toMatchObject({ "@type": "WebSite", inLanguage: "en-CA" });
  });
});

describe("sessionEventsJsonLd", () => {
  const slots = [
    // Thu 12 Nov: one free
    slot("2026-11-13T00:00:00.000Z", "2026-11-13T00:30:00.000Z", "taken"),
    slot("2026-11-13T00:30:00.000Z", "2026-11-13T01:00:00.000Z", "free"),
    // Thu 19 Nov: full
    slot("2026-11-20T00:00:00.000Z", "2026-11-20T00:30:00.000Z", "taken"),
    slot("2026-11-20T00:30:00.000Z", "2026-11-20T01:00:00.000Z", "taken"),
    // Past day
    slot("2026-10-30T00:00:00.000Z", "2026-10-30T00:30:00.000Z", "taken"),
  ];

  it("makes nothing while contact details are placeholders", () => {
    expect(sessionEventsJsonLd(slots, TZ, true, NOW)).toEqual([]);
  });

  it("makes one free event per upcoming day, spanning its sessions", () => {
    const events = sessionEventsJsonLd(slots, TZ, false, NOW);
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      "@type": "Event",
      name: "One-on-one prayer sessions · Thursday 12 November",
      startDate: "2026-11-13T00:00:00.000Z",
      endDate: "2026-11-13T01:00:00.000Z",
      isAccessibleForFree: true,
      offers: { price: 0, availability: "https://schema.org/InStock" },
    });
    expect(events[1]).toMatchObject({ offers: { availability: "https://schema.org/SoldOut" } });
    expect(events[0]?.location).toMatchObject({ address: { "@type": "PostalAddress" } });
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so the data cannot close the script tag", () => {
    expect(serializeJsonLd({ name: "</script><b>" })).toBe('{"name":"\\u003c/script>\\u003cb>"}');
  });
});
