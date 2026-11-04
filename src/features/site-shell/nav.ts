import type { User } from "@/lib/api";

export type NavLink = { href: string; label: string };

export const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book prayer" },
];

/** The account link changes with who is logged in. */
export function accountLink(user: User | null): NavLink {
  if (!user) return { href: "/login", label: "Log in" };
  if (user.role === "admin") return { href: "/admin", label: "Admin" };
  return { href: "/dashboard", label: "My bookings" };
}

/** One row of the phone menu: an iOS-style inset list row with a chevron. */
export const MENU_ROW =
  "flex min-h-12 items-center justify-between px-4 text-[1.0625rem] font-medium text-ink active:bg-off after:text-[1.375rem] after:leading-none after:text-muted after:content-['›']";

/** Pages whose top is the dusk sky: the header sits over it, transparent (UI.md section 4.1). */
export const DUSK_PATHS = ["/", "/book"];
