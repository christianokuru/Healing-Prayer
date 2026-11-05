import { Suspense, type ReactNode } from "react";
import { Eyebrow, Skeleton, Wordmark } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import type { AreaLink } from "../nav";
import { AreaMenu, SidebarLinks } from "./AreaNav";

async function UserCard() {
  const user = await getSession().catch(() => null);
  if (!user) return null;
  const initials = user.full_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-plum font-caps text-[0.8125rem] font-bold text-plum-ink"
      >
        {initials}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-bold">{user.full_name}</span>
        <span className="truncate text-small text-muted">{user.email}</span>
      </span>
    </div>
  );
}

function UserBlock({ logout }: { logout: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Suspense fallback={<Skeleton className="h-10 w-40" />}>
        <UserCard />
      </Suspense>
      {logout}
    </div>
  );
}

type AreaShellProps = {
  /** Label above the links, e.g. "My account" or "Admin". */
  title: string;
  links: AreaLink[];
  /** The Log out control, passed in so this shell stays independent of auth. */
  logout: ReactNode;
  children: ReactNode;
};

/**
 * Member and admin layout (UI.md section 4.2): a clean sidebar on desktop; a frosted top bar
 * with an iOS-style menu sheet on phones and tablets.
 */
export function AreaShell({ title, links, logout, children }: AreaShellProps) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-plum px-4 py-2 font-bold text-plum-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/80 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="flex items-center justify-between gap-4 py-2.5 gutter md:py-3.5">
          <Wordmark />
          <AreaMenu
            links={links}
            footer={
              <div className="rounded-[14px] border border-line/70 bg-bg p-4">
                <UserBlock logout={logout} />
              </div>
            }
          />
        </div>
      </header>

      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line bg-surface/70 px-5 py-7 lg:flex">
        <Wordmark />
        <div className="flex flex-col gap-3">
          <Eyebrow className="px-3">{title}</Eyebrow>
          <SidebarLinks links={links} />
        </div>
        <div className="mt-auto border-t border-line pt-5">
          <UserBlock logout={logout} />
        </div>
      </aside>

      <main id="main" className="min-w-0">
        {children}
      </main>
    </div>
  );
}
