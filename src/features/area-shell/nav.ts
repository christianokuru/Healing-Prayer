export type AreaIcon = "bookings" | "book" | "home" | "schedule";

export type AreaLink = { href: string; label: string; icon: AreaIcon };

export const MEMBER_LINKS: AreaLink[] = [
  { href: "/dashboard", label: "My bookings", icon: "bookings" },
  { href: "/book", label: "Book prayer", icon: "book" },
  { href: "/", label: "Back to website", icon: "home" },
];

// Admin screens are added here as they are built (MASTER.md next steps).
export const ADMIN_LINKS: AreaLink[] = [
  { href: "/admin", label: "Bookings", icon: "bookings" },
  { href: "/", label: "Back to website", icon: "home" },
];

/** The current page's link: exact match, or a deeper page under it (not for "/"). */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
