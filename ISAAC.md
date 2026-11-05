# ISAAC: Backend To-Do and API

Everything the backend needs to build, in one place. Owner: Isaac (FastAPI + PostgreSQL).

- **This file** says what to build and in what order, and lists every endpoint.
- **`prd.md`** holds the full detail: business rules (section 3), full JSON examples (section 8), suggested schema (section 9), emails (section 10), security (section 11).
- If this file and `prd.md` ever disagree, `prd.md` wins. Please flag it so we can fix this file.
- New items are added to **"What's new"** first, with a date. Check that section each time this file changes.

---

## What's new

Newest first.

| Date | Change | Where |
|---|---|---|
| 2026-11-05 | **`GET /api/schedule` now also returns `blocked_dates`**: `[{ "date": "YYYY-MM-DD", "reason": string or null }]`, only upcoming dates up to the end of the booking window, soonest first. The booking page shows them as "No session (Christmas Eve)" days. | `prd.md` 8.2; this file 3.2 |
| 2026-11-04 | **Session cookie name: `hp_session`** (httpOnly, `Secure`, `SameSite=Lax`, `Path=/`). The frontend's `proxy.ts` checks only that this cookie exists before showing `/dashboard` and `/admin`. If you need another name, tell us; it is one setting (`SESSION_COOKIE_NAME`). Logout must clear it. | Section 1 |
| 2026-11-04 | **Keep the time zone database up to date.** Provinces change their clock rules (our CI found British Columbia's November 2026 rule differs between tz database versions). Install the Python `tzdata` package and keep it, and the server's OS tzdata, current. Never hard-code offsets. | Section 5 |
| 2026-11-04 | **Small contract details pinned down** while building the frontend's mock API: (1) `week_booked` only lists weeks that overlap the requested range; (2) preview `action` values are `create_rule`, `update_rule` (+ `id`), `delete_rule` (+ `id`), `add_blocked_date`; (3) field limits: full name 1–100 characters, email up to 254 (stored lowercased), password 8–128; (4) the frontend sends phone numbers already stripped of spaces, dashes, dots and brackets. | `prd.md` 3.3, 8.3, 8.6; this file 3.1, 3.2, 3.5 |
| 2026-11-04 | **This file created.** Start with "Agree first", then work through the milestones. | Whole file |
| 2026-11-04 | **Time zone is Canadian, not Nigerian.** Store it as a setting (`settings.timezone`, IANA name), placeholder `America/Toronto` until the church confirms. **Canada has daylight saving time:** generate slots in local time with `zoneinfo`, never with a fixed offset. 7:00 PM Thursday 12 Nov 2026 in Toronto is `2026-11-13T00:00:00Z`; 7:00 PM Thursday 11 Jun 2026 is `2026-06-11T23:00:00Z`. | `prd.md` 3.1 rule 1, section 9; this file "Slot rules" |

---

## 1. Agree first (before building)

These are already decided on the frontend side. Please confirm or raise concerns.

| Topic | Decision |
|---|---|
| Hosting | One domain. Nginx sends `/api/*` to FastAPI, everything else to Next.js. No CORS needed. |
| Auth | httpOnly session cookie named **`hp_session`**, `Secure`, `SameSite=Lax`, `Path=/`. The frontend never sees a token. Server sessions or a signed JWT in the cookie: your choice. |
| JSON | `snake_case` fields. |
| Times | ISO 8601 **UTC** strings in and out (`2026-11-13T00:00:00Z`). Plain dates `YYYY-MM-DD` and clock times `HH:MM` are in the church's time zone. |
| Time zone | `settings.timezone`, placeholder `America/Toronto`, daylight saving aware. |
| Errors | One shape for every error, including validation: `{ "error": { "code": "...", "message": "...", "fields": { ... } } }` (`fields` only for `INVALID_INPUT`). |
| API docs | Publish FastAPI's OpenAPI schema. The frontend generates its types from it. |

---

## 2. Milestones

Tick these off as you go. Each milestone is usable by the frontend on its own.

### M1. Foundation
- [ ] FastAPI project, PostgreSQL, migrations (Alembic or similar).
- [ ] Tables: `users`, `session_rule`, `blocked_date`, `settings` (one row, includes `timezone` and `booking_window_weeks`), `appointment`, `password_reset_token`. Suggested SQL in `prd.md` section 9.
- [ ] Double-booking guard on `appointment`: exclusion constraint so active bookings never overlap in time (`btree_gist`, `tstzrange(slot_start, slot_end) with &&` where `status <> 'cancelled'`).
- [ ] Exception handlers that turn every error, including Pydantic validation errors, into the shared error shape (section 4).
- [ ] `GET /api/health`.
- [ ] OpenAPI schema published (for example `/api/openapi.json`).
- [ ] Seed: one rule (Thursday 19:00 to 21:00, 30 minutes), settings row, and a script to create the first admin.

### M2. Auth
- [ ] Register, login, logout, me, forgot password, reset password (section 3.1).
- [ ] Passwords hashed with argon2 (or bcrypt). Emails stored lowercased.
- [ ] Reset tokens: random, stored hashed, valid 1 hour, single use.
- [ ] Rate limits on login, register and forgot password.

### M3. Schedule and slots
- [ ] One function that builds slots for a date range (see "Slot rules" below). Used by `GET /api/slots` **and** by booking validation, so they can never disagree.
- [ ] `GET /api/schedule` (public) and `GET /api/slots` (public, adds `mine` when logged in).
- [ ] Admin schedule endpoints, including the change preview.

### M4. Bookings (member)
- [ ] Create, list mine, cancel.
- [ ] Member identity always from the session, never from the body.
- [ ] Weekly limit checked inside the booking transaction (lock the member's row first).
- [ ] Constraint violation → `409 SLOT_TAKEN`.
- [ ] Rate limit booking.

### M5. Admin bookings
- [ ] List with filters and pagination, get one, update status.
- [ ] Every `/api/admin/*` route checks `role = admin`.

### M6. Emails
- [ ] All emails in `prd.md` section 10. **Never include the prayer point.**
- [ ] Sent after the database commit, without blocking the response. A failure is logged and retried once; it never fails the request.
- [ ] SPF and DKIM on the sending domain.

### M7. Operations
- [ ] Staging environment the frontend can test against end to end.
- [ ] PostgreSQL not reachable from the internet. Nightly backups with a tested restore.

### Later
- [ ] `GET /api/slots/stream` (SSE) for instant slot updates. Not needed for v1; the frontend polls every 5 seconds.

---

## 3. Endpoints

Full request and response examples: `prd.md` section 8.

### 3.1 Auth

| Method | Path | Access | Body | Success | Errors |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Public | `full_name` (1–100), `email` (≤254, lowercase it), `phone` (`^\+?\d{7,15}$`), `password` (8–128) | `201 { user }` and sets the cookie | `INVALID_INPUT`, `EMAIL_TAKEN`, `RATE_LIMITED` |
| POST | `/api/auth/login` | Public | `email`, `password` | `200 { user }` and sets the cookie | `INVALID_CREDENTIALS`, `RATE_LIMITED` |
| POST | `/api/auth/logout` | Any | none | `204`, clears the cookie | |
| GET | `/api/auth/me` | Any | none | `200 { user }` | `UNAUTHENTICATED` |
| POST | `/api/auth/forgot-password` | Public | `email` | **Always** `204`, even for unknown emails | `RATE_LIMITED` |
| POST | `/api/auth/reset-password` | Public | `token`, `password` | `204` | `INVALID_TOKEN`, `INVALID_INPUT` |

`user` = `{ id, full_name, email, phone, role }` where `role` is `user` or `admin`.

### 3.2 Public

| Method | Path | Success |
|---|---|---|
| GET | `/api/schedule` | `{ timezone, booking_window_weeks, rules: [{ weekday, start_time, end_time, slot_minutes }], blocked_dates: [{ date, reason }] }`. Active rules only. `weekday` 1 = Monday … 7 = Sunday. `blocked_dates`: upcoming only, up to the end of the booking window, soonest first. |
| GET | `/api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD` | `{ slots: [{ start, end, state, bookable }], week_booked: [YYYY-MM-DD] }`. See below. Header `Cache-Control: no-store`. |
| GET | `/api/health` | `{ "ok": true }` after a quick database check. |

`GET /api/slots` details:
- `from` and `to` are dates in the church's time zone, both included. Max 62 days, otherwise `INVALID_INPUT`.
- Returns every slot the schedule offers in the range, **plus** any slot that still holds an active booking (even if the schedule changed since).
- `state`: `free`, `taken` or `mine` (`mine` only for the logged-in owner). **Never include names.**
- `bookable`: `false` for past slots, slots beyond the window, and slots in a week where the logged-in member already has a booking.
- `week_booked`: the Monday dates (church time zone) of weeks where the logged-in member has an active booking, **only for weeks that overlap the requested range**. Empty when logged out.

### 3.3 Member bookings (login required)

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/api/appointments` | `slot_start`, `prayer_point` | `201 { appointment }` | `UNAUTHENTICATED`, `INVALID_INPUT`, `INVALID_SLOT`, `SLOT_TAKEN`, `WEEKLY_LIMIT`, `RATE_LIMITED` |
| GET | `/api/appointments/mine` | none | `200 { appointments }`, upcoming soonest first, then past | `UNAUTHENTICATED` |
| POST | `/api/appointments/{id}/cancel` | none | `200 { appointment }` | `UNAUTHENTICATED`, `FORBIDDEN` (not owner), `NOT_FOUND`, `INVALID_STATE` (not `booked`, or already started) |

`appointment` = `{ id, slot_start, slot_end, status, prayer_point, created_at }`, `status` is `booked`, `completed` or `cancelled`.

Create steps, in order: session → validate body → slot exists in the current schedule, is in the future, inside the window, not on a blocked date → weekly limit → insert → constraint violation becomes `SLOT_TAKEN` → commit → send emails in the background.

### 3.4 Admin bookings (role `admin`)

| Method | Path | Body / query | Success |
|---|---|---|---|
| GET | `/api/admin/appointments` | `from`, `to`, `status`, `page` (default 1), `page_size` (default 20, max 100) | `{ appointments, page, page_size, total }`, sorted by `slot_start`, soonest first |
| GET | `/api/admin/appointments/{id}` | | `{ appointment }` |
| PATCH | `/api/admin/appointments/{id}` | `{ "status": "completed" \| "cancelled" }`, only from `booked` | `{ appointment }` |

Admin `appointment` adds `cancelled_by` (`member`, `admin` or `null`) and `user: { id, full_name, email, phone }`.

Errors: `UNAUTHENTICATED`, `FORBIDDEN` (not admin), `NOT_FOUND`, `INVALID_STATE`, `INVALID_INPUT`.

### 3.5 Admin schedule (role `admin`)

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/api/admin/schedule` | | `{ timezone, booking_window_weeks, rules: [{ id, weekday, start_time, end_time, slot_minutes, active }], blocked_dates: [{ id, date, reason }] }` |
| POST | `/api/admin/schedule/rules` | `weekday`, `start_time`, `end_time`, `slot_minutes`, `active` | `201 { rule }` |
| PATCH | `/api/admin/schedule/rules/{id}` | any rule fields | `200 { rule }` |
| DELETE | `/api/admin/schedule/rules/{id}` | | `204` |
| POST | `/api/admin/schedule/blocked-dates` | `date`, `reason` (optional) | `201 { blocked_date }` |
| DELETE | `/api/admin/schedule/blocked-dates/{id}` | | `204` |
| PATCH | `/api/admin/schedule/settings` | `booking_window_weeks` (1 to 26) | `200 { settings }` |
| POST | `/api/admin/schedule/preview` | proposed change: `{ action, ... }` where `action` is `create_rule` (+ rule fields), `update_rule` (+ `id` and changed fields), `delete_rule` (+ `id`) or `add_blocked_date` (+ `date`, `reason`). Validates like the real call (`SCHEDULE_CONFLICT`, `INVALID_INPUT`) but saves nothing. | `200 { affected_count, affected_ids }`: future active bookings that would fall outside the new schedule |

Rule checks: `start_time` before `end_time`; the range divides evenly by `slot_minutes`; `slot_minutes` is 15, 20, 30, 45 or 60; no overlap with another rule on the same weekday (`409 SCHEDULE_CONFLICT`).

**Schedule changes never cancel bookings.** Existing bookings keep their own `slot_start` and `slot_end`.

`timezone` is not editable through the API in v1. Set it in the database or config.

---

## 4. Error codes

Every error: `{ "error": { "code": "...", "message": "..." } }`. The frontend switches on `code`, so codes must match exactly.

| Code | HTTP | When |
|---|---|---|
| `INVALID_INPUT` | 422 | Body or query fails validation. Add `"fields": { "phone": "..." }`. |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `UNAUTHENTICATED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Wrong role, or not the owner |
| `NOT_FOUND` | 404 | No such item |
| `INVALID_SLOT` | 400 | Not a bookable slot right now |
| `INVALID_TOKEN` | 400 | Reset token bad, used or expired |
| `EMAIL_TAKEN` | 409 | Email already registered |
| `SLOT_TAKEN` | 409 | Slot already booked |
| `WEEKLY_LIMIT` | 409 | Member already has a booking that week |
| `INVALID_STATE` | 409 | Action not allowed now |
| `SCHEDULE_CONFLICT` | 409 | Rule overlaps another rule on the same day |
| `RATE_LIMITED` | 429 | Too many requests |

---

## 5. Slot rules (the tricky part)

Build slots like this for each date `d` from `from` to `to`, in the church's time zone `tz = ZoneInfo(settings.timezone)`:

1. Skip `d` if it is a blocked date.
2. For each **active** rule with `rule.weekday == d.isoweekday()`, step from `start_time` to `end_time` by `slot_minutes`. For each step `t`, if `t + slot_minutes <= end_time`:
   - `local_start = datetime.combine(d, t, tzinfo=tz)`.
   - **Daylight saving safety:** if that local time does not exist (spring forward), skip it. If it happens twice (fall back), use `fold=0`.
   - Convert start and end to UTC.
3. State: `taken` if an active booking overlaps the slot, `mine` if that booking belongs to the caller, else `free`.
4. `bookable` is `false` if the slot has started, starts after now + `booking_window_weeks`, or the caller already has an active booking that week.
5. Add any active booking in the range that does not match a generated slot (the schedule changed after it was booked), with its own start and end, as `taken` or `mine` and `bookable: false`.

**Week** = Monday 00:00 to Sunday 23:59 in the church's time zone.

Keep the time zone database current (Python `tzdata` package and OS tzdata). Clock rules change: British Columbia's rules for November 2026 differ between database versions.

Booking validation must call the same function and check that the requested `slot_start` is one of the generated, bookable slots.

---

## 6. What the frontend needs from you

1. Confirmation of section 1, or your concerns.
2. The OpenAPI schema URL as soon as anything exists, even partly done.
3. A staging URL when M2 and M3 are working.
4. A test admin account and a test member account on staging.
5. A heads-up before any change to an endpoint, field or error code.

---

## 7. Questions for Isaac

- Server-side sessions or signed JWT in the cookie? (Either works for the frontend.)
- Which email service will you use?
- Any concerns with the exclusion constraint approach for double bookings?
