import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { createSend } from "./client";
import { createApi, type Api } from "./endpoints";
import type { PublicSchedule } from "./types";

/**
 * The API for Server Components and layouts. Forwards the visitor's cookies.
 * Calls `API_INTERNAL_URL` (FastAPI on the server) when set, otherwise this site's
 * own origin, which serves the mock in mock mode.
 */
export async function getServerApi(): Promise<Api> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = process.env.API_INTERNAL_URL ?? `${proto}://${host}`;
  return createApi(createSend({ origin, cookie: cookieStore.toString() }));
}

/** The public schedule, fetched once per request however many components need it. */
export const getPublicSchedule = cache(async (): Promise<PublicSchedule> => {
  const api = await getServerApi();
  return api.schedule();
});
