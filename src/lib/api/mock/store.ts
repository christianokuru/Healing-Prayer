import { FALLBACK_TIMEZONE } from "../../config";
import { addDays, isoWeekday, todayKey, zonedToUtc } from "../../time";
import type { AppointmentStatus, BlockedDate, Role, ScheduleRule } from "../types";

// In-memory data for the mock API. Lives for as long as the Next.js server runs.

export type MockUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  /** Plain text: this is fake data for development only. */
  password: string;
};

export type MockRule = ScheduleRule;

export type MockAppointment = {
  id: string;
  user_id: string;
  slot_start: string;
  slot_end: string;
  status: AppointmentStatus;
  prayer_point: string;
  created_at: string;
  cancelled_by: "member" | "admin" | null;
};

export type MockStore = {
  users: MockUser[];
  sessions: Map<string, string>;
  resetTokens: Map<string, { userId: string; expiresAt: number; used: boolean }>;
  rules: MockRule[];
  blockedDates: BlockedDate[];
  settings: { booking_window_weeks: number; timezone: string };
  appointments: MockAppointment[];
};

export const DEMO_ACCOUNTS = {
  member: { email: "ngozi@example.com", password: "password123" },
  admin: { email: "admin@example.com", password: "admin12345" },
} as const;

let counter = 0;
export const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** The nth Thursday from today (0 = the next one, -1 = the one before that). */
function thursday(n: number, timezone: string, now: Date): string {
  const today = todayKey(timezone, now);
  const ahead = (4 - isoWeekday(today) + 7) % 7 || 7;
  return addDays(today, ahead + n * 7);
}

export function createSeedStore(now: Date = new Date()): MockStore {
  const timezone = FALLBACK_TIMEZONE;
  const users: MockUser[] = [
    {
      id: "u_ngozi",
      full_name: "Ngozi Okafor",
      email: DEMO_ACCOUNTS.member.email,
      phone: "+14165550123",
      role: "user",
      password: DEMO_ACCOUNTS.member.password,
    },
    {
      id: "u_samuel",
      full_name: "Samuel Adeyemi",
      email: "samuel@example.com",
      phone: "+14165550188",
      role: "user",
      password: "password123",
    },
    {
      id: "u_grace",
      full_name: "Grace Thompson",
      email: "grace@example.com",
      phone: "+16475550142",
      role: "user",
      password: "password123",
    },
    {
      id: "u_david",
      full_name: "David Mensah",
      email: "david@example.com",
      phone: "+19055550107",
      role: "user",
      password: "password123",
    },
    {
      id: "u_esther",
      full_name: "Esther Lavoie",
      email: "esther@example.com",
      phone: "+16135550164",
      role: "user",
      password: "password123",
    },
    {
      id: "u_admin",
      full_name: "Pastor Ruth Bello",
      email: DEMO_ACCOUNTS.admin.email,
      phone: "+14165550100",
      role: "admin",
      password: DEMO_ACCOUNTS.admin.password,
    },
  ];

  const book = (
    id: string,
    userId: string,
    day: string,
    clock: string,
    status: AppointmentStatus,
    prayer: string,
  ): MockAppointment => {
    const start = zonedToUtc(day, clock, timezone) ?? new Date(now);
    return {
      id,
      user_id: userId,
      slot_start: start.toISOString(),
      slot_end: new Date(start.getTime() + 30 * 60_000).toISOString(),
      status,
      prayer_point: prayer,
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60_000).toISOString(),
      cancelled_by: status === "cancelled" ? "member" : null,
    };
  };

  const t0 = thursday(0, timezone, now);
  const t1 = thursday(1, timezone, now);
  const t2 = thursday(2, timezone, now);
  const past = thursday(-2, timezone, now);

  return {
    users,
    sessions: new Map(),
    resetTokens: new Map(),
    rules: [
      {
        id: "r_thursday",
        weekday: 4,
        start_time: "19:00",
        end_time: "21:00",
        slot_minutes: 30,
        active: true,
      },
    ],
    blockedDates: [
      { id: "b_christmas_eve", date: `${now.getUTCFullYear()}-12-24`, reason: "Christmas Eve" },
      { id: "b_new_years_eve", date: `${now.getUTCFullYear()}-12-31`, reason: "New Year's Eve" },
    ],
    settings: { booking_window_weeks: 8, timezone },
    appointments: [
      book(
        "a_1",
        "u_samuel",
        t0,
        "19:00",
        "booked",
        "Healing for my back pain and strength for work.",
      ),
      book("a_2", "u_grace", t1, "19:00", "booked", "Guidance on a job offer in another city."),
      book("a_3", "u_samuel", t1, "19:30", "booked", "Peace in my family."),
      book("a_4", "u_david", t1, "20:00", "booked", "My mother's surgery next week."),
      book("a_5", "u_esther", t1, "20:30", "booked", "Wisdom for the youth programme."),
      book("a_6", "u_david", t2, "20:00", "booked", "Thanksgiving for a new baby."),
      book("a_7", "u_ngozi", past, "19:30", "completed", "Healing for my mother."),
      book("a_8", "u_grace", past, "20:00", "cancelled", "Exams next month."),
    ],
  };
}

const globalStore = globalThis as unknown as { __hpMockStore?: MockStore };

/** The shared store. Kept on globalThis so it survives hot reloads in development. */
export function getStore(): MockStore {
  globalStore.__hpMockStore ??= createSeedStore();
  return globalStore.__hpMockStore;
}

export function resetStore(now?: Date): MockStore {
  globalStore.__hpMockStore = createSeedStore(now);
  return globalStore.__hpMockStore;
}
