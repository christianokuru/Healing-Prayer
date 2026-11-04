import Link from "next/link";
import { getSession } from "@/lib/auth/getSession";
import { cn } from "@/lib/cn";
import { accountLink, type NavLink } from "../nav";

const STYLES = {
  bar: "ml-2 inline-flex min-h-11 items-center rounded-full border-[1.5px] border-line bg-surface px-5 font-bold hover:border-plum",
  menu: "flex min-h-13 items-center font-display text-h3 font-semibold",
} as const;

type Variant = keyof typeof STYLES;

export function AccountLinkView({ link, variant }: { link: NavLink; variant: Variant }) {
  return (
    <Link href={link.href} className={cn(STYLES[variant])}>
      {link.label}
    </Link>
  );
}

/** "Log in", "My bookings" or "Admin". Reads the session, so render inside <Suspense>. */
export async function AccountLink({ variant }: { variant: Variant }) {
  // The header must never break the page, so any failure shows "Log in".
  const user = await getSession().catch(() => null);
  return <AccountLinkView link={accountLink(user)} variant={variant} />;
}
