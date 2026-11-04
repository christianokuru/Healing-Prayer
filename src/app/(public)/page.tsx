import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { HomePage } from "@/features/home";
import { getPublicSchedule, getServerApi } from "@/lib/api/server";
import { churchJsonLd, sessionEventsJsonLd, websiteJsonLd } from "@/lib/seo";
import { addDays, todayKey } from "@/lib/time";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

async function loadSessionEvents() {
  try {
    const schedule = await getPublicSchedule();
    const from = todayKey(schedule.timezone);
    const { slots } = await (await getServerApi()).slots({ from, to: addDays(from, 27) });
    return sessionEventsJsonLd(slots, schedule.timezone);
  } catch {
    return [];
  }
}

/** Upcoming session days as schema.org Events (only once the church's address is real). */
async function SessionEvents() {
  return <JsonLd data={await loadSessionEvents()} />;
}

export default function Home() {
  return (
    <>
      <JsonLd data={[churchJsonLd(), websiteJsonLd()]} />
      <Suspense fallback={null}>
        <SessionEvents />
      </Suspense>
      <HomePage />
    </>
  );
}
