import { connection } from "next/server";
import { Suspense } from "react";
import { getPublicSchedule } from "@/lib/api/server";
import { CHURCH } from "@/lib/church";
import { summariseRules } from "@/lib/schedule";
import { Wordmark } from "./Wordmark";

async function FooterSessions() {
  const schedule = await getPublicSchedule().catch(() => null);
  const sessions = schedule ? summariseRules(schedule.rules) : [];
  if (sessions.length === 0) return <p className="text-muted">Session times coming soon.</p>;
  return (
    <ul className="flex flex-col gap-1">
      {sessions.map((s) => (
        <li key={`${s.day}-${s.times}`}>
          <b>{s.day}s</b> · {s.times}
        </li>
      ))}
    </ul>
  );
}

async function Copyright() {
  await connection();
  return (
    <>
      © {new Date().getFullYear()} {CHURCH.name}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-content gap-8 py-12 gutter md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="text-small text-muted">
            One-on-one prayer, in person, with our prayer team.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-small">
          <h2 className="font-sans text-label font-bold tracking-[0.12em] text-muted uppercase">
            Prayer sessions
          </h2>
          <Suspense fallback={<p className="text-muted">Loading times…</p>}>
            <FooterSessions />
          </Suspense>
        </div>
        <div className="flex flex-col gap-2 text-small">
          <h2 className="font-sans text-label font-bold tracking-[0.12em] text-muted uppercase">
            Visit or contact
          </h2>
          <address className="not-italic">
            {CHURCH.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p>{CHURCH.phone}</p>
          <p>{CHURCH.email}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-content py-4 gutter text-small text-muted">
          <Suspense fallback={CHURCH.name}>
            <Copyright />
          </Suspense>
        </p>
      </div>
    </footer>
  );
}
