import { Suspense } from "react";
import { getPublicSchedule, getServerApi } from "@/lib/api/server";
import { nextOpenDay } from "@/lib/schedule";
import { addDays, formatDayShort, formatTime, todayKey } from "@/lib/time";

const LOOK_AHEAD_DAYS = 27;

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2.5 self-start rounded-full border border-plum-ink/35 bg-plum-ink/15 px-4 py-2.5 text-small">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full bg-gold-glow shadow-[0_0_12px_var(--gold-glow)]"
      />
      <span>{children}</span>
    </p>
  );
}

async function loadNextSessionText(): Promise<string> {
  try {
    const schedule = await getPublicSchedule();
    const api = await getServerApi();
    const from = todayKey(schedule.timezone);
    const { slots } = await api.slots({ from, to: addDays(from, LOOK_AHEAD_DAYS) });
    const next = nextOpenDay(slots, schedule.timezone);
    if (!next) return "New session times will be announced soon";
    const times = next.freeCount === 1 ? "1 time free" : `${next.freeCount} times free`;
    const day = formatDayShort(next.firstStart, schedule.timezone);
    return `Next session · ${day}, ${formatTime(next.firstStart, schedule.timezone)} · ${times}`;
  } catch {
    return "Prayer sessions every week";
  }
}

async function NextSessionText() {
  return <Pill>{await loadNextSessionText()}</Pill>;
}

/** "Next session · Thu 12 Nov, 7:00 PM · 3 times free", live from the API. */
export function NextSessionPill() {
  return (
    <Suspense fallback={<Pill>Finding the next session…</Pill>}>
      <NextSessionText />
    </Suspense>
  );
}
