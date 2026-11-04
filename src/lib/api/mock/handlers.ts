import { z } from "zod";
import { ADMIN_PAGE_SIZE, SESSION_COOKIE } from "../../config";
import {
  clockToMinutes,
  daysBetween,
  isClockTime,
  isDateKey,
  toDateKey,
  weekStart,
} from "../../time";
import {
  emailSchema,
  fullNameSchema,
  passwordSchema,
  phoneSchema,
  prayerPointSchema,
} from "../../validation";
import type {
  AdminAppointment,
  Appointment,
  ErrorCode,
  ScheduleRule,
  SchedulePreviewInput,
  User,
} from "../types";
import {
  bookedWeeks,
  buildSlots,
  generateSlots,
  isActive,
  windowEnd,
  type ScheduleData,
} from "./slots";
import { newId, resetStore, type MockAppointment, type MockStore, type MockUser } from "./store";

// The mock API: same paths, bodies, responses and error codes as ISAAC.md section 3.
// Pure request → response, so it can be tested without a server.

export { SESSION_COOKIE };
const SLOT_MINUTES = [15, 20, 30, 45, 60] as const;
const MAX_RANGE_DAYS = 62;
const RESET_TOKEN_MS = 60 * 60 * 1000;

type Ctx = {
  request: Request;
  store: MockStore;
  now: Date;
  path: string[];
  user: MockUser | null;
};

// ---- Responses ----

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(data, { status, headers });
}

const STATUS: Record<ErrorCode, number> = {
  INVALID_INPUT: 422,
  INVALID_CREDENTIALS: 401,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INVALID_SLOT: 400,
  INVALID_TOKEN: 400,
  EMAIL_TAKEN: 409,
  SLOT_TAKEN: 409,
  WEEKLY_LIMIT: 409,
  INVALID_STATE: 409,
  SCHEDULE_CONFLICT: 409,
  RATE_LIMITED: 429,
};

class Fail extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

function errorResponse(e: Fail): Response {
  return json(
    { error: { code: e.code, message: e.message, ...(e.fields ? { fields: e.fields } : {}) } },
    STATUS[e.code],
  );
}

function sessionCookie(token: string | null): HeadersInit {
  const value = token
    ? `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax`
    : `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  return { "Set-Cookie": value };
}

// ---- Input ----

async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.output<T>> {
  const raw: unknown = await request.json().catch(() => {
    throw new Fail("INVALID_INPUT", "Body must be JSON.");
  });
  const result = schema.safeParse(raw);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "body";
      fields[key] ??= issue.message;
    }
    throw new Fail("INVALID_INPUT", "Some fields are not valid.", fields);
  }
  return result.data;
}

const dateKey = z.string().refine(isDateKey, "Use YYYY-MM-DD.");
const clock = z.string().refine(isClockTime, "Use HH:MM.");
const isoInstant = z.iso.datetime({ offset: true });

// ---- Views ----

const publicUser = ({ password: _password, ...user }: MockUser): User => user;

const memberView = (a: MockAppointment): Appointment => ({
  id: a.id,
  slot_start: a.slot_start,
  slot_end: a.slot_end,
  status: a.status,
  prayer_point: a.prayer_point,
  created_at: a.created_at,
});

function adminView(store: MockStore, a: MockAppointment): AdminAppointment {
  const user = store.users.find((u) => u.id === a.user_id);
  return {
    ...memberView(a),
    cancelled_by: a.cancelled_by,
    user: {
      id: a.user_id,
      full_name: user?.full_name ?? "Unknown",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  };
}

function scheduleData(store: MockStore): ScheduleData {
  return {
    timezone: store.settings.timezone,
    bookingWindowWeeks: store.settings.booking_window_weeks,
    rules: store.rules,
    blockedDates: new Set(store.blockedDates.map((b) => b.date)),
  };
}

// ---- Guards ----

function requireUser(ctx: Ctx): MockUser {
  if (!ctx.user) throw new Fail("UNAUTHENTICATED", "Please log in.");
  return ctx.user;
}

function requireAdmin(ctx: Ctx): MockUser {
  const user = requireUser(ctx);
  if (user.role !== "admin") throw new Fail("FORBIDDEN", "Admins only.");
  return user;
}

function startSession(store: MockStore, user: MockUser): string {
  const token = newId("s");
  store.sessions.set(token, user.id);
  return token;
}

function readSession(request: Request, store: MockStore): MockUser | null {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === SESSION_COOKIE)?.[1];
  const userId = token ? store.sessions.get(token) : undefined;
  return store.users.find((u) => u.id === userId) ?? null;
}

// ---- Auth ----

async function register(ctx: Ctx) {
  const body = await parseBody(
    ctx.request,
    z.object({
      full_name: fullNameSchema,
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
    }),
  );
  if (ctx.store.users.some((u) => u.email === body.email)) {
    throw new Fail("EMAIL_TAKEN", "An account with this email already exists.");
  }
  const user: MockUser = { id: newId("u"), role: "user", ...body };
  ctx.store.users.push(user);
  return json({ user: publicUser(user) }, 201, sessionCookie(startSession(ctx.store, user)));
}

async function login(ctx: Ctx) {
  const body = await parseBody(
    ctx.request,
    z.object({ email: z.string().trim().toLowerCase(), password: z.string() }),
  );
  const user = ctx.store.users.find((u) => u.email === body.email && u.password === body.password);
  if (!user) throw new Fail("INVALID_CREDENTIALS", "Wrong email or password.");
  return json({ user: publicUser(user) }, 200, sessionCookie(startSession(ctx.store, user)));
}

function logout(ctx: Ctx) {
  for (const [token, userId] of ctx.store.sessions) {
    if (userId === ctx.user?.id) ctx.store.sessions.delete(token);
  }
  return new Response(null, { status: 204, headers: sessionCookie(null) });
}

async function forgotPassword(ctx: Ctx) {
  const body = await parseBody(ctx.request, z.object({ email: z.string().trim().toLowerCase() }));
  const user = ctx.store.users.find((u) => u.email === body.email);
  if (user) {
    ctx.store.resetTokens.set(newId("t"), {
      userId: user.id,
      expiresAt: ctx.now.getTime() + RESET_TOKEN_MS,
      used: false,
    });
  }
  return new Response(null, { status: 204 });
}

async function resetPassword(ctx: Ctx) {
  const body = await parseBody(
    ctx.request,
    z.object({ token: z.string().min(1), password: passwordSchema }),
  );
  const entry = ctx.store.resetTokens.get(body.token);
  const user = entry && ctx.store.users.find((u) => u.id === entry.userId);
  if (!entry || !user || entry.used || entry.expiresAt < ctx.now.getTime()) {
    throw new Fail("INVALID_TOKEN", "This reset link is invalid or expired.");
  }
  entry.used = true;
  user.password = body.password;
  return new Response(null, { status: 204 });
}

// ---- Schedule and slots ----

function publicSchedule(ctx: Ctx) {
  const { settings, rules } = ctx.store;
  return json({
    timezone: settings.timezone,
    booking_window_weeks: settings.booking_window_weeks,
    rules: rules
      .filter((r) => r.active)
      .map(({ weekday, start_time, end_time, slot_minutes }) => ({
        weekday,
        start_time,
        end_time,
        slot_minutes,
      })),
  });
}

function slots(ctx: Ctx) {
  const params = new URL(ctx.request.url).searchParams;
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const fields: Record<string, string> = {};
  if (!isDateKey(from)) fields.from = "Use YYYY-MM-DD.";
  if (!isDateKey(to)) fields.to = "Use YYYY-MM-DD.";
  if (!fields.from && !fields.to) {
    const days = daysBetween(from, to);
    if (days < 0) fields.to = "Must be on or after from.";
    else if (days + 1 > MAX_RANGE_DAYS) fields.to = `Range is limited to ${MAX_RANGE_DAYS} days.`;
  }
  if (Object.keys(fields).length) throw new Fail("INVALID_INPUT", "Invalid date range.", fields);

  const data = buildSlots({
    schedule: scheduleData(ctx.store),
    appointments: ctx.store.appointments,
    from,
    to,
    userId: ctx.user?.id ?? null,
    now: ctx.now,
  });
  return json(data, 200, { "Cache-Control": "no-store" });
}

// ---- Member bookings ----

async function createAppointment(ctx: Ctx) {
  const user = requireUser(ctx);
  const body = await parseBody(
    ctx.request,
    z.object({ slot_start: isoInstant, prayer_point: prayerPointSchema }),
  );
  const schedule = scheduleData(ctx.store);
  const start = new Date(body.slot_start);
  const day = toDateKey(start, schedule.timezone);
  const slot = generateSlots(schedule, day, day).find((s) => s.start.getTime() === start.getTime());

  if (!slot || slot.start <= ctx.now || slot.start > windowEnd(schedule, ctx.now)) {
    throw new Fail("INVALID_SLOT", "That is not a bookable time.");
  }
  const week = weekStart(day);
  if (bookedWeeks(ctx.store.appointments, user.id, schedule.timezone).has(week)) {
    throw new Fail("WEEKLY_LIMIT", "You already have a booking that week.");
  }
  const clash = ctx.store.appointments.some(
    (a) => isActive(a) && new Date(a.slot_start) < slot.end && slot.start < new Date(a.slot_end),
  );
  if (clash) throw new Fail("SLOT_TAKEN", "That slot was just taken.");

  const appointment: MockAppointment = {
    id: newId("a"),
    user_id: user.id,
    slot_start: slot.start.toISOString(),
    slot_end: slot.end.toISOString(),
    status: "booked",
    prayer_point: body.prayer_point,
    created_at: ctx.now.toISOString(),
    cancelled_by: null,
  };
  ctx.store.appointments.push(appointment);
  return json({ appointment: memberView(appointment) }, 201);
}

function myAppointments(ctx: Ctx) {
  const user = requireUser(ctx);
  const now = ctx.now.getTime();
  const mine = ctx.store.appointments.filter((a) => a.user_id === user.id);
  const time = (a: MockAppointment) => new Date(a.slot_start).getTime();
  const upcoming = mine.filter((a) => time(a) > now).sort((a, b) => time(a) - time(b));
  const past = mine.filter((a) => time(a) <= now).sort((a, b) => time(b) - time(a));
  return json({ appointments: [...upcoming, ...past].map(memberView) });
}

function findAppointment(store: MockStore, id: string | undefined): MockAppointment {
  const appointment = store.appointments.find((a) => a.id === id);
  if (!appointment) throw new Fail("NOT_FOUND", "No such appointment.");
  return appointment;
}

function cancelAppointment(ctx: Ctx, id: string | undefined) {
  const user = requireUser(ctx);
  const appointment = findAppointment(ctx.store, id);
  if (appointment.user_id !== user.id) throw new Fail("FORBIDDEN", "Not your appointment.");
  if (appointment.status !== "booked" || new Date(appointment.slot_start) <= ctx.now) {
    throw new Fail("INVALID_STATE", "This booking can no longer be cancelled.");
  }
  appointment.status = "cancelled";
  appointment.cancelled_by = "member";
  return json({ appointment: memberView(appointment) });
}

// ---- Admin bookings ----

function adminList(ctx: Ctx) {
  requireAdmin(ctx);
  const params = new URL(ctx.request.url).searchParams;
  const query = z
    .object({
      from: dateKey.optional(),
      to: dateKey.optional(),
      status: z.enum(["booked", "completed", "cancelled"]).optional(),
      page: z.coerce.number().int().min(1).default(1),
      page_size: z.coerce.number().int().min(1).max(100).default(ADMIN_PAGE_SIZE),
    })
    .safeParse(Object.fromEntries(params));
  if (!query.success) throw new Fail("INVALID_INPUT", "Invalid filters.");
  const { from, to, status, page, page_size } = query.data;
  const tz = ctx.store.settings.timezone;

  const matches = ctx.store.appointments
    .filter((a) => {
      const day = toDateKey(a.slot_start, tz);
      return (!from || day >= from) && (!to || day <= to) && (!status || a.status === status);
    })
    .sort((a, b) => a.slot_start.localeCompare(b.slot_start));

  return json({
    appointments: matches
      .slice((page - 1) * page_size, page * page_size)
      .map((a) => adminView(ctx.store, a)),
    page,
    page_size,
    total: matches.length,
  });
}

function adminGet(ctx: Ctx, id: string | undefined) {
  requireAdmin(ctx);
  return json({ appointment: adminView(ctx.store, findAppointment(ctx.store, id)) });
}

async function adminSetStatus(ctx: Ctx, id: string | undefined) {
  requireAdmin(ctx);
  const appointment = findAppointment(ctx.store, id);
  const body = await parseBody(
    ctx.request,
    z.object({ status: z.enum(["completed", "cancelled"]) }),
  );
  if (appointment.status !== "booked") {
    throw new Fail("INVALID_STATE", "Only booked appointments can be changed.");
  }
  appointment.status = body.status;
  if (body.status === "cancelled") appointment.cancelled_by = "admin";
  return json({ appointment: adminView(ctx.store, appointment) });
}

// ---- Admin schedule ----

const ruleFields = {
  weekday: z.number().int().min(1).max(7),
  start_time: clock,
  end_time: clock,
  slot_minutes: z.union(SLOT_MINUTES.map((n) => z.literal(n))),
  active: z.boolean(),
};
const ruleSchema = z.object(ruleFields);
const rulePatchSchema = z.object(ruleFields).partial();

/** Shape checks plus overlap with other rules on the same weekday. */
function checkRule(rules: ScheduleRule[], rule: ScheduleRule) {
  const start = clockToMinutes(rule.start_time);
  const end = clockToMinutes(rule.end_time);
  if (start >= end) {
    throw new Fail("INVALID_INPUT", "Invalid rule.", { end_time: "Must be after the start time." });
  }
  if ((end - start) % rule.slot_minutes !== 0) {
    throw new Fail("INVALID_INPUT", "Invalid rule.", {
      end_time: `The time range must divide evenly into ${rule.slot_minutes}-minute slots.`,
    });
  }
  const clash = rules.some(
    (r) =>
      r.id !== rule.id &&
      r.weekday === rule.weekday &&
      clockToMinutes(r.start_time) < end &&
      start < clockToMinutes(r.end_time),
  );
  if (clash) throw new Fail("SCHEDULE_CONFLICT", "This overlaps another session on the same day.");
}

function findRule(store: MockStore, id: string | undefined): ScheduleRule {
  const rule = store.rules.find((r) => r.id === id);
  if (!rule) throw new Fail("NOT_FOUND", "No such rule.");
  return rule;
}

function adminSchedule(ctx: Ctx) {
  requireAdmin(ctx);
  const { settings, rules, blockedDates } = ctx.store;
  return json({
    timezone: settings.timezone,
    booking_window_weeks: settings.booking_window_weeks,
    rules,
    blocked_dates: [...blockedDates].sort((a, b) => a.date.localeCompare(b.date)),
  });
}

async function createRule(ctx: Ctx) {
  requireAdmin(ctx);
  const rule: ScheduleRule = { id: newId("r"), ...(await parseBody(ctx.request, ruleSchema)) };
  checkRule(ctx.store.rules, rule);
  ctx.store.rules.push(rule);
  return json({ rule }, 201);
}

async function updateRule(ctx: Ctx, id: string | undefined) {
  requireAdmin(ctx);
  const existing = findRule(ctx.store, id);
  const next = { ...existing, ...(await parseBody(ctx.request, rulePatchSchema)) };
  checkRule(ctx.store.rules, next);
  Object.assign(existing, next);
  return json({ rule: existing });
}

function deleteRule(ctx: Ctx, id: string | undefined) {
  requireAdmin(ctx);
  const rule = findRule(ctx.store, id);
  ctx.store.rules = ctx.store.rules.filter((r) => r !== rule);
  return new Response(null, { status: 204 });
}

const blockedSchema = z.object({ date: dateKey, reason: z.string().trim().max(200).nullish() });

async function addBlockedDate(ctx: Ctx) {
  requireAdmin(ctx);
  const body = await parseBody(ctx.request, blockedSchema);
  if (ctx.store.blockedDates.some((b) => b.date === body.date)) {
    throw new Fail("INVALID_INPUT", "Date already blocked.", {
      date: "This date is already blocked.",
    });
  }
  const blocked_date = { id: newId("b"), date: body.date, reason: body.reason || null };
  ctx.store.blockedDates.push(blocked_date);
  return json({ blocked_date }, 201);
}

function deleteBlockedDate(ctx: Ctx, id: string | undefined) {
  requireAdmin(ctx);
  const before = ctx.store.blockedDates.length;
  ctx.store.blockedDates = ctx.store.blockedDates.filter((b) => b.id !== id);
  if (ctx.store.blockedDates.length === before)
    throw new Fail("NOT_FOUND", "No such blocked date.");
  return new Response(null, { status: 204 });
}

async function updateSettings(ctx: Ctx) {
  requireAdmin(ctx);
  const body = await parseBody(
    ctx.request,
    z.object({ booking_window_weeks: z.number().int().min(1).max(26) }),
  );
  ctx.store.settings.booking_window_weeks = body.booking_window_weeks;
  return json({ settings: ctx.store.settings });
}

const previewSchema = z.discriminatedUnion("action", [
  ruleSchema.extend({ action: z.literal("create_rule") }),
  rulePatchSchema.extend({ action: z.literal("update_rule"), id: z.string() }),
  z.object({ action: z.literal("delete_rule"), id: z.string() }),
  blockedSchema.extend({ action: z.literal("add_blocked_date") }),
]);

/** Future active bookings that would no longer match the schedule after a change. */
async function preview(ctx: Ctx) {
  requireAdmin(ctx);
  const change = (await parseBody(ctx.request, previewSchema)) as SchedulePreviewInput;
  let rules = ctx.store.rules.map((r) => ({ ...r }));
  const blocked = new Set(ctx.store.blockedDates.map((b) => b.date));

  if (change.action === "create_rule") {
    const { action: _action, ...input } = change;
    const rule = { id: "preview", ...input };
    checkRule(rules, rule);
    rules.push(rule);
  } else if (change.action === "update_rule") {
    const { action: _action, id, ...patch } = change;
    const next = { ...findRule(ctx.store, id), ...patch };
    checkRule(rules, next);
    rules = rules.map((r) => (r.id === id ? next : r));
  } else if (change.action === "delete_rule") {
    findRule(ctx.store, change.id);
    rules = rules.filter((r) => r.id !== change.id);
  } else {
    blocked.add(change.date);
  }

  const schedule: ScheduleData = { ...scheduleData(ctx.store), rules, blockedDates: blocked };
  const affected = ctx.store.appointments.filter((a) => {
    if (!isActive(a) || new Date(a.slot_start) <= ctx.now) return false;
    const day = toDateKey(a.slot_start, schedule.timezone);
    return !generateSlots(schedule, day, day).some(
      (s) =>
        s.start.toISOString() === new Date(a.slot_start).toISOString() &&
        s.end.toISOString() === new Date(a.slot_end).toISOString(),
    );
  });
  return json({ affected_count: affected.length, affected_ids: affected.map((a) => a.id) });
}

// ---- Router ----

type Handler = (ctx: Ctx, id: string | undefined) => Response | Promise<Response>;

const ROUTES: [method: string, pattern: string, handler: Handler][] = [
  ["POST", "auth/register", register],
  ["POST", "auth/login", login],
  ["POST", "auth/logout", logout],
  ["GET", "auth/me", (ctx) => json({ user: publicUser(requireUser(ctx)) })],
  ["POST", "auth/forgot-password", forgotPassword],
  ["POST", "auth/reset-password", resetPassword],
  ["GET", "schedule", publicSchedule],
  ["GET", "slots", slots],
  ["POST", "appointments", createAppointment],
  ["GET", "appointments/mine", myAppointments],
  ["POST", "appointments/:id/cancel", cancelAppointment],
  ["GET", "admin/appointments", adminList],
  ["GET", "admin/appointments/:id", adminGet],
  ["PATCH", "admin/appointments/:id", adminSetStatus],
  ["GET", "admin/schedule", adminSchedule],
  ["POST", "admin/schedule/rules", createRule],
  ["PATCH", "admin/schedule/rules/:id", updateRule],
  ["DELETE", "admin/schedule/rules/:id", deleteRule],
  ["POST", "admin/schedule/blocked-dates", addBlockedDate],
  ["DELETE", "admin/schedule/blocked-dates/:id", deleteBlockedDate],
  ["PATCH", "admin/schedule/settings", updateSettings],
  ["POST", "admin/schedule/preview", preview],
  ["GET", "health", () => json({ ok: true })],
  // Mock-only helpers for tests and local development.
  ["POST", "__mock/reset", () => (resetStore(), new Response(null, { status: 204 }))],
  [
    "GET",
    "__mock/reset-token",
    (ctx) => {
      const email = new URL(ctx.request.url).searchParams.get("email")?.toLowerCase();
      const user = ctx.store.users.find((u) => u.email === email);
      const token = [...ctx.store.resetTokens]
        .reverse()
        .find(([, t]) => t.userId === user?.id)?.[0];
      if (!token) throw new Fail("NOT_FOUND", "No reset token for that email.");
      return json({ token });
    },
  ],
];

function match(pattern: string, path: string[]): { ok: boolean; id?: string } {
  const parts = pattern.split("/");
  if (parts.length !== path.length) return { ok: false };
  let id: string | undefined;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === ":id") id = path[i];
    else if (parts[i] !== path[i]) return { ok: false };
  }
  return { ok: true, id };
}

/** Handles one request to `/api/<path>`. */
export async function handleMockRequest(
  request: Request,
  path: string[],
  store: MockStore,
  now: Date = new Date(),
): Promise<Response> {
  const ctx: Ctx = { request, store, now, path, user: readSession(request, store) };
  try {
    for (const [method, pattern, handler] of ROUTES) {
      if (method !== request.method) continue;
      const { ok, id } = match(pattern, path);
      if (ok) return await handler(ctx, id);
    }
    throw new Fail("NOT_FOUND", "No such endpoint.");
  } catch (error) {
    if (error instanceof Fail) return errorResponse(error);
    throw error;
  }
}
