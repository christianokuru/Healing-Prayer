"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui";
import { MENU_ROW, type NavLink } from "../nav";

type MobileMenuProps = {
  links: NavLink[];
  /** The account link, streamed in from the server. */
  account: ReactNode;
};

/** Phone and small tablet navigation: a button that opens a bottom sheet. */
export function MobileMenu({ links, account }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close after any navigation, including the streamed account link.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-current px-3.5 text-[0.9375rem] font-semibold active:scale-[0.97] md:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        Menu
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Menu">
        <nav aria-label="Main">
          <ul className="flex flex-col overflow-hidden rounded-[14px] border border-line/70 bg-bg">
            {links.map((link) => (
              <li key={link.href} className="border-b border-line/70">
                <Link href={link.href} onClick={() => setOpen(false)} className={MENU_ROW}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>{account}</li>
          </ul>
        </nav>
      </Dialog>
    </>
  );
}
