import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/getSession";
import { accountLink, PUBLIC_LINKS, type NavLink } from "../nav";
import { MobileMenu } from "./MobileMenu";
import { Wordmark } from "./Wordmark";

function Nav({ account }: { account: NavLink }) {
  return (
    <>
      <nav aria-label="Main" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {PUBLIC_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-full px-4 font-bold hover:bg-off"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={account.href}
              className="ml-2 inline-flex min-h-11 items-center rounded-full border-[1.5px] border-line bg-surface px-5 font-bold hover:border-plum"
            >
              {account.label}
            </Link>
          </li>
        </ul>
      </nav>
      <MobileMenu links={PUBLIC_LINKS} account={account} />
    </>
  );
}

async function NavWithSession() {
  // The header must never break the page, so any failure shows "Log in".
  const user = await getSession().catch(() => null);
  return <Nav account={accountLink(user)} />;
}

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 py-4 gutter">
        <Wordmark />
        <Suspense fallback={<Nav account={accountLink(null)} />}>
          <NavWithSession />
        </Suspense>
      </div>
    </header>
  );
}
