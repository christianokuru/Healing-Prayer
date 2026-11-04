// All date and time logic lives here (ENGINEERING.md section 8).
// Data is UTC ISO strings. A "date key" is a calendar date `YYYY-MM-DD` in the
// church's time zone. Never use fixed offsets: the church is in Canada, which
// has daylight saving time.

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(options);
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, f);
  }
  return f;
}

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number };

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = formatter("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** Milliseconds to add to UTC to get local wall-clock time at `date` in `timeZone`. */
function offsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return asUtc - Math.floor(date.getTime() / MINUTE) * MINUTE;
}

const pad = (n: number) => String(n).padStart(2, "0");

function parseDateKey(key: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) throw new Error(`Expected YYYY-MM-DD, got "${key}"`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseClock(clock: string): [number, number] {
  const match = /^(\d{2}):(\d{2})$/.exec(clock);
  if (!match) throw new Error(`Expected HH:MM, got "${clock}"`);
  return [Number(match[1]), Number(match[2])];
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = parseDateKey(value);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function isClockTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [h, m] = parseClock(value);
  return h < 24 && m < 60;
}

/** Minutes since midnight for "HH:MM". */
export function clockToMinutes(clock: string): number {
  const [h, m] = parseClock(clock);
  return h * 60 + m;
}

export function minutesToClock(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** The church-time calendar date of an instant. */
export function toDateKey(instant: Date | string, timeZone: string): string {
  const p = zonedParts(new Date(instant), timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function todayKey(timeZone: string, now: Date = new Date()): string {
  return toDateKey(now, timeZone);
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = parseDateKey(key);
  const date = new Date(Date.UTC(y, m - 1, d) + days * DAY);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = parseDateKey(from);
  const [y2, m2, d2] = parseDateKey(to);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY);
}

/** 1 = Monday … 7 = Sunday, matching the API's `weekday`. */
export function isoWeekday(key: string): number {
  const [y, m, d] = parseDateKey(key);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 0 ? 7 : day;
}

/** The Monday that starts the week containing `key`. Weeks run Monday to Sunday. */
export function weekStart(key: string): string {
  return addDays(key, 1 - isoWeekday(key));
}

/**
 * The UTC instant for a wall-clock time in `timeZone`.
 * Returns null when that local time does not exist (clocks spring forward).
 * When it happens twice (clocks fall back), returns the first occurrence.
 */
export function zonedToUtc(key: string, clock: string, timeZone: string): Date | null {
  const [y, mo, d] = parseDateKey(key);
  const [h, mi] = parseClock(clock);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const candidates = [
    wall - offsetMs(new Date(wall - 12 * 60 * MINUTE), timeZone),
    wall - offsetMs(new Date(wall + 12 * 60 * MINUTE), timeZone),
  ]
    .filter((t) => {
      const p = zonedParts(new Date(t), timeZone);
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) === wall;
    })
    .sort((a, b) => a - b);
  return candidates[0] === undefined ? null : new Date(candidates[0]);
}

// ---- Display ----

/** "7:00 PM" */
export function formatTime(instant: Date | string, timeZone: string): string {
  return formatter("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(
    new Date(instant),
  );
}

/** "7:00 – 7:30 PM", or "11:30 AM – 12:00 PM" when the halves differ. */
export function formatTimeRange(
  start: Date | string,
  end: Date | string,
  timeZone: string,
): string {
  const a = formatTime(start, timeZone);
  const b = formatTime(end, timeZone);
  const [aTime, aHalf] = a.split(" ");
  const bHalf = b.split(" ")[1];
  return aHalf === bHalf ? `${aTime} – ${b}` : `${a} – ${b}`;
}

/** "Thursday 12 November" */
export function formatDayLong(instant: Date | string, timeZone: string): string {
  return formatter("en-GB", { timeZone, weekday: "long", day: "numeric", month: "long" }).format(
    new Date(instant),
  );
}

/** "Thu 12 Nov" */
export function formatDayShort(instant: Date | string, timeZone: string): string {
  return formatter("en-GB", { timeZone, weekday: "short", day: "numeric", month: "short" }).format(
    new Date(instant),
  );
}

// Date keys have no time zone of their own, so format them at UTC noon.
const keyToDate = (key: string) => {
  const [y, m, d] = parseDateKey(key);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

/** "Thursday 12 November" for a date key. */
export function formatDateKeyLong(key: string): string {
  return formatDayLong(keyToDate(key), "UTC");
}

/** "Thu 12 Nov" for a date key. */
export function formatDateKeyShort(key: string): string {
  return formatDayShort(keyToDate(key), "UTC");
}

/** "November 2026" for a date key. */
export function formatMonth(key: string): string {
  return formatter("en-GB", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    keyToDate(key),
  );
}
