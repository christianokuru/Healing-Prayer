import type { User } from "../api/types";

/** Where a user lands after logging in when no `next` page was asked for. */
export function homeFor(user: Pick<User, "role">): string {
  return user.role === "admin" ? "/admin" : "/dashboard";
}

/**
 * A `next` value that is safe to redirect to: a path on this site only.
 * Blocks "//evil.com", "/\evil.com" and full URLs, so login can't be used to send people elsewhere.
 */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }
  return next;
}

/** The login URL that brings the visitor back to `path` afterwards. */
export function loginUrl(path: string): string {
  return `/login?next=${encodeURIComponent(path)}`;
}
