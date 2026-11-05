export type AreaIcon = "bookings" | "book" | "home" | "schedule";

export type AreaLink = {
  href: string;
  label: string;
  icon: AreaIcon;
  /** Only the exact page counts as current (not pages under it). */
  exact?: boolean;
};

export const MEMBER_LINKS: AreaLink[] = [
  { href: "/dashboard", label: "My bookings", icon: "bookings", exact: true },
  { href: "/dashboard/book", label: "Book prayer", icon: "book" },
  { href: "/", label: "Back to website", icon: "home" },
];

// Admin screens are added here as they are built (MASTER.md next steps).
export const ADMIN_LINKS: AreaLink[] = [
  { href: "/admin", label: "Bookings", icon: "bookings" },
  { href: "/", label: "Back to website", icon: "home" },
];

/** The current page's link: exact match, or a deeper page under it (not for "/" or exact links). */
export function isActive(pathname: string, href: string, exact = false): boolean {
  if (exact || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
