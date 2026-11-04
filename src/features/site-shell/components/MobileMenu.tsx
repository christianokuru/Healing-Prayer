"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog } from "@/components/ui";
import type { NavLink } from "../nav";

type MobileMenuProps = { links: NavLink[]; account: NavLink };

/** Phone and small tablet navigation: a button that opens a bottom sheet. */
export function MobileMenu({ links, account }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 font-bold md:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        Menu
      </button>
      <Dialog open={open} onClose={close} title="Menu">
        <nav aria-label="Main">
          <ul className="flex flex-col">
            {[...links, account].map((link) => (
              <li key={link.href} className="border-b border-line last:border-b-0">
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex min-h-13 items-center font-display text-h3 font-semibold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Dialog>
    </>
  );
}
