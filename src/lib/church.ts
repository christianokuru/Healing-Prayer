// Church contact details, shared by the footer and the homepage.
// PLACEHOLDER: replace every value when the church sends its details (MASTER.md open questions).

export const CHURCH_DETAILS_ARE_PLACEHOLDERS = true;

export const CHURCH = {
  name: "Healing Prayer North-West",
  addressLines: ["123 Example Street", "Toronto, ON  M5V 0A0"],
  phone: "+1 416 555 0100",
  email: "hello@example.org",
} as const;

export function mapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH.addressLines.join(", "))}`;
}
