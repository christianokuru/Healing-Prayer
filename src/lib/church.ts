// Church details, shared by the footer, the homepage and search metadata.
// PLACEHOLDER: replace every contact value when the church sends its details (MASTER.md open
// questions), then set CHURCH_DETAILS_ARE_PLACEHOLDERS to false. While it is true, the address,
// phone and email are kept out of structured data so search engines never index fake details.

export const CHURCH_DETAILS_ARE_PLACEHOLDERS = true;

const ADDRESS = {
  street: "123 Example Street",
  city: "Toronto",
  /** Two-letter province code. */
  region: "ON",
  postalCode: "M5V 0A0",
  /** ISO country code. */
  country: "CA",
} as const;

export const CHURCH = {
  name: "Healing Prayer North-West",
  shortName: "Healing Prayer",
  /** One sentence used for search results and share previews. */
  description:
    "Book a quiet, one-on-one prayer session with the prayer team at Healing Prayer North-West. In person at the church, every week.",
  address: ADDRESS,
  addressLines: [ADDRESS.street, `${ADDRESS.city}, ${ADDRESS.region}  ${ADDRESS.postalCode}`],
  phone: "+1 416 555 0100",
  email: "hello@example.org",
} as const;

export function mapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH.addressLines.join(", "))}`;
}
