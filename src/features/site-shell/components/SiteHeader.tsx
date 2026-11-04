import Link from "next/link";
import { Suspense } from "react";
import { accountLink, PUBLIC_LINKS } from "../nav";
import { AccountLink, AccountLinkView } from "./AccountLink";
import { HeaderFrame } from "./HeaderFrame";
import { MobileMenu } from "./MobileMenu";
import { Wordmark } from "./Wordmark";

// Only the account link waits for the session. Everything else, including the phone menu
// button, is in the static shell, so it never gets swapped out while someone taps it.
const LOGGED_OUT = accountLink(null);

export function SiteHeader() {
  return (
    <HeaderFrame>
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 py-4 gutter">
        <Wordmark />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {PUBLIC_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 font-bold hover:bg-plum-soft group-data-[tone=dusk]:hover:bg-plum-ink/10"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Suspense fallback={<AccountLinkView link={LOGGED_OUT} variant="bar" />}>
                <AccountLink variant="bar" />
              </Suspense>
            </li>
          </ul>
        </nav>
        <MobileMenu
          links={PUBLIC_LINKS}
          account={
            <Suspense fallback={<AccountLinkView link={LOGGED_OUT} variant="menu" />}>
              <AccountLink variant="menu" />
            </Suspense>
          }
        />
      </div>
    </HeaderFrame>
  );
}
