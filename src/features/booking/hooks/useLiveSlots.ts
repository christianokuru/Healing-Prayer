"use client";

import useSWR from "swr";
import { api, type SlotsResponse } from "@/lib/api";
import { POLL_MS } from "@/lib/config";

export const slotsKey = (from: string, to: string) => ["slots", from, to] as const;

/**
 * Live slots for the booking page (ENGINEERING.md section 5): polls every 5 seconds,
 * pauses while the tab is hidden and refreshes when it is shown again.
 */
export function useLiveSlots(range: { from: string; to: string }, initial: SlotsResponse) {
  const { data, mutate, isValidating } = useSWR(
    slotsKey(range.from, range.to),
    ([, from, to]) => api.slots({ from, to }),
    {
      fallbackData: initial,
      refreshInterval: POLL_MS,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );
  return { slots: data.slots, weekBooked: data.week_booked, refresh: mutate, isValidating };
}
