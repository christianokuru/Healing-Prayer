"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Dialog, MENU_ROW } from "@/components/ui";
import { cn } from "@/lib/cn";
import { isActive, type AreaIcon, type AreaLink } from "../nav";

const ICON_PATHS: Record<AreaIcon, ReactNode> = {
  bookings: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" />
    </>
  ),
  book: (
    <>
      <path d="M12 3c-2 3-2 4.5 0 6 2-1.5 2-3 0-6z" />
      <rect x="9" y="11" width="6" height="10" rx="1.5" />
    </>
  ),
  home: <path d="M4 11l8-7 8 7M6 10v10h12V10" />,
  schedule: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

function Icon({ name }: { name: AreaIcon }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/** Sidebar links (desktop). The current page is marked with a gold bar and plum tint. */
export function SidebarLinks({ links }: { links: AreaLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Account">
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-md px-3 font-bold text-muted transition-colors duration-150 hover:bg-off hover:text-ink",
                  active &&
                    "bg-plum-soft text-plum before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-gold-bright hover:bg-plum-soft hover:text-plum",
                )}
              >
                <Icon name={link.icon} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Phone and tablet: a Menu button that opens the same links as an iOS-style sheet. */
export function AreaMenu({ links, footer }: { links: AreaLink[]; footer: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
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
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-current px-3.5 text-[0.9375rem] font-semibold active:scale-[0.97] md:min-h-11 md:px-4 md:text-body"
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
        <nav aria-label="Account">
          <ul className="m-0 flex list-none flex-col overflow-hidden rounded-[14px] border border-line/70 bg-bg p-0">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href} className="border-b border-line/70 last:border-b-0">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(MENU_ROW, "gap-3", active && "font-bold text-plum")}
                  >
                    <span className="flex items-center gap-3">
                      <Icon name={link.icon} />
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {footer}
      </Dialog>
    </>
  );
}
