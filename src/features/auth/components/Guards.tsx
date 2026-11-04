import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Role } from "@/lib/api";
import { getSession } from "@/lib/auth/getSession";
import { homeFor, loginUrl } from "@/lib/auth/redirects";

type RequireUserProps = {
  /** Where to come back to after logging in. */
  area: string;
  role?: Role;
  children: ReactNode;
};

/**
 * Server-side guard for member and admin areas (prd.md section 5). Render inside <Suspense>:
 * it reads the session cookie. The backend still checks every request; this is for UX.
 */
export async function RequireUser({ area, role, children }: RequireUserProps) {
  const user = await getSession();
  if (!user) redirect(loginUrl(area));
  if (role === "admin" && user.role !== "admin") redirect("/dashboard");
  return children;
}

/** On login and register pages: someone already logged in goes straight to their area. */
export async function RedirectIfLoggedIn() {
  const user = await getSession().catch(() => null);
  if (user) redirect(homeFor(user));
  return null;
}
