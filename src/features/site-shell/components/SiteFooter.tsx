import { connection } from "next/server";
import { Suspense } from "react";
import { Cross } from "@/components/ui";
import { getPublicSchedule } from "@/lib/api/server";
import { CHURCH } from "@/lib/church";
import { summariseRules } from "@/lib/schedule";

async function FooterSessions() {
  const schedule = await getPublicSchedule().catch(() => null);
  const sessions = schedule ? summariseRules(schedule.rules) : [];
  if (sessions.length === 0) return <p>Session times coming soon.</p>;
  return (
    <ul className="flex flex-col gap-1">
      {sessions.map((s) => (
        <li key={`${s.day}-${s.times}`} className="tabular-nums">
          {s.day}s · {s.times}
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

/** Night footer (UI.md section 4.1). */
export function SiteFooter() {
  return (
    <footer className="mt-8 bg-night text-plum-soft md:mt-12">
      <div className="mx-auto grid max-w-content gap-6 py-9 gutter md:grid-cols-[1.4fr_1fr_1fr] md:gap-8 md:py-12">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2.5">
            <Cross className="text-gold-glow" />
            <span className="font-display text-[1.25rem] font-semibold text-plum-ink md:text-[1.5rem]">
              {CHURCH.name}
            </span>
          </p>
          <p className="text-small">One-on-one prayer, in person, with our prayer team.</p>
        </div>
        <div className="flex flex-col gap-2 text-small">
          <h2 className="caps text-gold-glow">Prayer sessions</h2>
          <Suspense fallback={<p>Loading times…</p>}>
            <FooterSessions />
          </Suspense>
        </div>
        <div className="flex flex-col gap-2 text-small">
          <h2 className="caps text-gold-glow">Visit or contact</h2>
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
      <div className="border-t border-plum-ink/15">
        <p className="mx-auto max-w-content py-4 gutter text-small">
          <Suspense fallback={CHURCH.name}>
            <Copyright />
          </Suspense>
        </p>
      </div>
    </footer>
  );
}
