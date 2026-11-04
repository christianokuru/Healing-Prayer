import type { Slot } from "./api/types";
import { CHURCH, CHURCH_DETAILS_ARE_PLACEHOLDERS } from "./church";
import { SITE_URL } from "./config";
import { formatDayLong, toDateKey } from "./time";

// Structured data (schema.org JSON-LD) for search engines. Pure builders, rendered by <JsonLd>.

type Thing = Record<string, unknown>;

const CHURCH_ID = `${SITE_URL}/#church`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;
export const LOGO_URL = `${SITE_URL}/apple-icon.png`;

function postalAddress(): Thing {
  const a = CHURCH.address;
  return {
    "@type": "PostalAddress",
    streetAddress: a.street,
    addressLocality: a.city,
    addressRegion: a.region,
    postalCode: a.postalCode,
    addressCountry: a.country,
  };
}

/** Contact details only once they are real (see lib/church.ts). */
function contactDetails(placeholders: boolean): Thing {
  if (placeholders) return {};
  return { address: postalAddress(), telephone: CHURCH.phone, email: CHURCH.email };
}

export function churchJsonLd(placeholders = CHURCH_DETAILS_ARE_PLACEHOLDERS): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": CHURCH_ID,
    name: CHURCH.name,
    alternateName: CHURCH.shortName,
    url: SITE_URL,
    logo: LOGO_URL,
    image: OG_IMAGE_URL,
    description: CHURCH.description,
    ...contactDetails(placeholders),
    potentialAction: {
      "@type": "ReserveAction",
      name: "Book a prayer session",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/book`,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
    },
  };
}

export function websiteJsonLd(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: CHURCH.name,
    url: SITE_URL,
    inLanguage: "en-CA",
    publisher: { "@id": CHURCH_ID },
  };
}

/**
 * One Event per upcoming session day, for Google's event listings.
 * Events need a real street address, so none are produced while details are placeholders.
 */
export function sessionEventsJsonLd(
  slots: Slot[],
  timeZone: string,
  placeholders = CHURCH_DETAILS_ARE_PLACEHOLDERS,
  now: Date = new Date(),
): Thing[] {
  if (placeholders) return [];
  const byDay = new Map<string, Slot[]>();
  for (const slot of slots) {
    if (new Date(slot.end) <= now) continue;
    const key = toDateKey(slot.start, timeZone);
    byDay.set(key, [...(byDay.get(key) ?? []), slot]);
  }
  return [...byDay.values()].flatMap((daySlots) => {
    const sorted = [...daySlots].sort((a, b) => a.start.localeCompare(b.start));
    const first = sorted[0];
    const last = sorted.at(-1);
    if (!first || !last) return [];
    const free = sorted.some((s) => s.state === "free" && s.bookable);
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: `One-on-one prayer sessions · ${formatDayLong(first.start, timeZone)}`,
      description:
        "A quiet, private prayer session with a member of the prayer team. Free. Book a time online.",
      startDate: first.start,
      endDate: last.end,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      image: OG_IMAGE_URL,
      location: { "@type": "Place", name: CHURCH.name, address: postalAddress() },
      organizer: { "@type": "Organization", name: CHURCH.name, url: SITE_URL },
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "CAD",
        url: `${SITE_URL}/book`,
        availability: free ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      },
    };
  });
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so it can't close the tag. */
export function serializeJsonLd(data: Thing | Thing[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
