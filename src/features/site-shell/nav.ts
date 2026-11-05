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

/** Pages whose top is the dusk sky: the header sits over it, transparent (UI.md section 4.1). */
export const DUSK_PATHS = ["/", "/book"];
