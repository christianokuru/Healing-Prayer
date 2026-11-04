// App-wide constants. Values that change per environment come from env vars (prd.md section 12).

/** Path prefix of the API, relative to the site. Nginx sends it to FastAPI in production. */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

/** When true, `/api/*` is served by the in-memory mock in `lib/api/mock`. */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/** How often the booking page re-fetches slots. */
export const POLL_MS = 5_000;

/**
 * Only for code that runs before the schedule has loaded (for example the mock's seed data).
 * Screens must use the `timezone` from `GET /api/schedule`.
 */
export const FALLBACK_TIMEZONE = "America/Toronto";

export const PRAYER_POINT_MAX = 10_000;
export const ADMIN_PAGE_SIZE = 20;
