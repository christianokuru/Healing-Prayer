# PRD: Healing Prayer North-West Appointment Site

Status: Draft v3 (re-planned)
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS. Built by Chris.
- **Backend:** FastAPI + PostgreSQL on a VPS. Built by Isaac.

**What changed from v2:** the admin now picks the session days, times and slot length from the dashboard. Nothing about the schedule is hard-coded any more. The backend now works out the slots and sends them to the frontend.

---

## 1. Overview

A small website for **Healing Prayer North-West** where members book one-on-one prayer sessions. The church runs the sessions in person. The site collects bookings and tells the admin.

**Goals**
- Visitors learn who the church is and what it does.
- Members create an account, pick a free time from the upcoming session days and write a prayer point.
- The admin sets when sessions happen, sees every booking and gets an email for each one.

**Not in v1**
- Payments, a CMS, more than one church, recurring bookings, SMS or WhatsApp, calendar sync, rescheduling.

**Who builds what**

| Part | Owner |
|---|---|
| Pages, UI, calendar, forms, API client, page guards | Frontend (Chris) |
| Database, auth, checks, schedule and slot logic, emails, rate limits | Backend (Isaac) |
| The API in section 8 | Agreed by both, then frozen |

**Isaac:** start with **`ISAAC.md`** (your to-do list and every endpoint), then read sections 3 and 8 to 11 here for full detail.

---

## How it works (plain English)

A short summary for anyone who does not need the technical details. The sections after this one have the full rules.

**Accounts and login**
- Members sign up with their name, email, phone and a password. Passwords are scrambled before saving, so nobody can read them.
- After login, the browser keeps a locked "session cookie", like a wristband that proves who you are. The site's own code cannot read it, so it is hard to steal.
- Forgot password: the member gets a reset link by email. It works once and expires after 1 hour. The site always says "check your email", so nobody can use it to find out who has an account.
- Login, sign-up, password reset and booking are limited to a few tries at a time, to stop guessing.

**Who can see what**
- Logged-out visitors are sent to the login page if they try to open the member or admin areas. Members are kept out of admin pages.
- The real check happens on the server for every action, not just on the page. A member's identity always comes from their login, never from what they type.

**Booking**
1. The member picks a free slot on the calendar and writes a prayer point.
2. The server checks that the slot is real, in the future, not on a blocked day, and that the member has no other booking that week.
3. If two people click the same slot at the same moment, only one gets it. The other sees "That slot was just taken."
4. Emails go out after the booking is saved. If email is down, the booking still works.

**Keeping the calendar up to date**
- While a member is on the booking page, it checks every 5 seconds for slots others have taken. It stops when the tab is hidden and checks again when they come back.

**Member dashboard**
- Shows their bookings, upcoming first. They can cancel any time before a session starts, and the slot frees up straight away.
- Bookings are never deleted, only marked cancelled, so there is always a history.

**Admin: bookings**
- A table of all bookings with filters for date and status. Opening one shows the member's name, phone, email and full prayer point.
- The admin can mark a booking completed or cancelled. If they cancel, the member gets an email.

**Admin: schedule**
- The admin sets when sessions run, for example "Thursday, 7 to 9 PM, 30-minute slots". Rules can be turned on or off.
- The admin can block dates (like Christmas) and choose how many weeks ahead members can book.
- Rules on the same day cannot overlap.
- Before a change is saved, the admin sees how many existing bookings fall outside the new schedule. Those bookings are never cancelled automatically.
- Slots are not stored. They are worked out from the rules each time. Only bookings are saved.

**Emails**
- Admins: every new booking and every cancellation.
- Members: booking confirmation, cancellations and password resets.
- Prayer points are never put in emails. Admins get a link to read them on the site.

**Privacy**
- Only admins can read prayer points. Members never see who booked other slots.

**While the backend is being built**
- The frontend runs on a fake backend in the browser. One setting switches it to the real one.

---

## 2. Users and roles

| Role | Can do |
|---|---|
| Visitor | Read the homepage, register, log in |
| Member (`user`) | Book, view and cancel own bookings |
| Admin (`admin`) | Set the schedule, view all bookings and member details, mark bookings completed or cancelled |

Admins cannot sign up. The backend creates them with a script. There can be several admins.

---

## 3. Business rules

The backend enforces every rule. The frontend repeats some checks for a smoother experience, but never relies on them.

### 3.1 Schedule (set by the admin)

1. All times are in the **church's time zone**, stored as a backend setting (`settings.timezone`, an IANA name). **Placeholder: `America/Toronto`** (Eastern Time) until the church confirms its location in Canada. Changing it needs no code change.
   - Canada uses **daylight saving time**, so the UTC offset changes during the year (Toronto: UTC−5 in winter, UTC−4 from March to November).
   - A 7:00 PM session stays 7:00 PM local time all year. Its UTC value moves by an hour when the clocks change.
   - Never compute with a fixed offset. Generate slots in local time with the time zone database (Python `zoneinfo`), then convert to UTC.
   - Clock changes happen at 2:00 AM, but rules must still be safe: skip a local time that does not exist, and use the first occurrence of a local time that happens twice.
2. The admin creates **session rules**. Each rule is: a weekday, a start time, an end time and a slot length.
   - Example: Thursday, 19:00 to 21:00, 30 minutes. This gives 4 slots: 19:00, 19:30, 20:00, 20:30.
   - A weekday can have more than one rule (for example a morning and an evening session). Rules on the same day must not overlap.
   - Slot length: 15, 20, 30, 45 or 60 minutes. The time range must divide evenly into slots.
   - A rule can be switched off without deleting it.
3. The admin can **block a date** (for example a holiday). No slots are offered on a blocked date.
4. The admin sets the **booking window**: how many weeks ahead members can book. Default 8, allowed 1 to 26.
5. **Changing the schedule never cancels existing bookings.** They stay valid. The admin page shows how many future bookings fall outside the new schedule, so the admin can cancel them by hand if needed.

### 3.2 Bookings

6. **One person per slot.**
7. A member can hold **one active booking per week**. A week runs Monday 00:00 to Sunday 23:59, in the church's time zone.
8. Past slots cannot be booked. A slot that has already started counts as past.
9. A cancelled booking frees its slot straight away.
10. Members can cancel their own booking any time **before it starts**.
11. Bookings are never deleted. They are cancelled, so the admin keeps a history.

### 3.3 Data

12. The API sends and receives all times as ISO 8601 in UTC. The frontend shows them in the church's time zone, which it reads from `GET /api/schedule`. Example (Toronto): 7:00 PM on Thursday 12 November is `2026-11-13T00:00:00Z` (winter, UTC−5); 7:00 PM on Thursday 11 June is `2026-06-11T23:00:00Z` (summer, UTC−4).
13. Prayer point: required, 1 to 10,000 characters. Both sides count Unicode code points (in JavaScript use `[...text].length`, not `text.length`).
14. Phone: digits with an optional leading `+`, 7 to 15 digits. The frontend strips spaces, dashes, dots and brackets before sending, so `(416) 555-0123` arrives as `4165550123`.
15. Password: 8 to 128 characters.
16. Full name: 1 to 100 characters after trimming. Email: up to 254 characters, stored lowercased.

---

## 4. Tech choices (frontend)

| Area | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript | Your stack |
| Styling | Tailwind, with design tokens as CSS variables | Tokens first |
| Data fetching | One typed `fetch` wrapper plus SWR | Small, no extra state library |
| API types | Generated from FastAPI's OpenAPI schema with `openapi-typescript` | One source of truth |
| Forms | Zod schemas that match the backend rules | Catch mistakes before sending |
| Live updates | SWR polling every 5 seconds | Simple. SSE can be added later by calling `mutate()` on each event |
| Mocking | `NEXT_PUBLIC_USE_MOCK=true` swaps in an in-memory mock API | UI work does not wait for the backend |

---

## 5. Pages

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Church homepage |
| `/register` | Public | Create account |
| `/login` | Public | Log in |
| `/forgot-password`, `/reset-password` | Public | Reset password |
| `/dashboard` | Member | My bookings, cancel, "Book prayer" button |
| `/book` | Public to browse, login to book | Upcoming days (or calendar), pick a time, write prayer point |
| `/admin` | Admin | All bookings, with filters |
| `/admin/appointments/[id]` | Admin | One booking in full |
| `/admin/schedule` | Admin | Session rules, blocked dates, booking window |

**Homepage sections:** hero with a "Book prayer" button, about the church, what we do, when sessions run (read live from the schedule, not typed in), how booking works in 3 steps, location and contact, footer.

**Content needed from the church:** about text, services, address, contact details, one or two photos.

**Page guards**
- The `/dashboard` and `/admin` layouts call `GET /api/auth/me` on the server, passing the incoming cookies. No session: redirect to `/login`. Wrong role: redirect to `/dashboard`.
- `proxy.ts` may redirect early when the cookie is missing. This is only a shortcut, not security.
- Hiding a button is only for looks. The backend decides who can do what.

---

## 6. Frontend behaviour

How the code is written: **`ENGINEERING.md`**. How every screen looks and is laid out at each screen size: **`UI.md`**. This section only lists behaviour rules the screens must follow.

**Booking (`/book`)**
- Three steps: choose a time, write the prayer point, confirm. Then a success screen.
- Opens on a list of upcoming session days. A calendar is the second view.
- Each time shows as free, taken or yours. Other members' names are never shown.
- The backend sends every slot with its state. The frontend does no slot maths.
- If the member already has a booking that week, that week's other times are turned off with a note.
- The prayer point is kept when the member goes back, changes the time or hits `SLOT_TAKEN`.
- Visitors can browse times without logging in. Login is asked for at Continue, then they return to the same time.

**Admin schedule (`/admin/schedule`)**
- Manage rules (with on/off), blocked dates and the booking window.
- Before saving a change, call the preview endpoint and show: "N future bookings fall outside the new schedule. They will not be cancelled." Link to those bookings.

**Error messages**

| Code | What the user sees or what happens |
|---|---|
| `SLOT_TAKEN` | "That slot was just taken." Refresh slots, clear the chosen slot |
| `WEEKLY_LIMIT` | "You already have a booking that week." |
| `INVALID_SLOT` | "That slot is no longer available." Refresh slots |
| `UNAUTHENTICATED` | Go to `/login` |
| `INVALID_CREDENTIALS` | "Wrong email or password." |
| `EMAIL_TAKEN` | "An account with this email already exists." |
| `INVALID_TOKEN` | "This reset link is invalid or expired." |
| `RATE_LIMITED` | "Too many tries. Please wait a minute." |
| Anything else | "Something went wrong. Please try again." |

---

## 7. How frontend and backend connect

**Production:** one domain. Nginx sends `/api/*` to FastAPI and everything else to Next.js. Cookies just work and there is no CORS to set up.

**Development:** `rewrites` in `next.config` forward `/api/*` to the FastAPI dev server.

**Auth:** the backend sets an httpOnly, `Secure`, `SameSite=Lax` session cookie. The frontend never sees or stores a token.

---

## 8. API

- JSON fields use `snake_case`.
- Times are ISO 8601 UTC strings (`2026-11-13T00:00:00Z`). Plain dates are `YYYY-MM-DD` in the church's time zone. Clock times in rules are `HH:MM` local time in the church's time zone.
- Every error has this shape, including validation errors:

```json
{ "error": { "code": "SLOT_TAKEN", "message": "That slot was just taken." } }
```

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_INPUT` | 422 | Body or query failed checks. May include `"fields": { "phone": "..." }` |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `UNAUTHENTICATED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Wrong role, or not the owner |
| `NOT_FOUND` | 404 | No such item |
| `INVALID_SLOT` | 400 | Not a bookable slot right now |
| `INVALID_TOKEN` | 400 | Reset token bad, used or expired |
| `EMAIL_TAKEN` | 409 | Email already registered |
| `SLOT_TAKEN` | 409 | Slot already booked |
| `WEEKLY_LIMIT` | 409 | Member already has a booking that week |
| `INVALID_STATE` | 409 | Action not allowed now (for example cancelling a past or already cancelled booking) |
| `SCHEDULE_CONFLICT` | 409 | Rule overlaps another rule on the same day |
| `RATE_LIMITED` | 429 | Too many requests |

### 8.1 Auth

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/api/auth/register` | `full_name`, `email`, `phone`, `password` | `201` `{ user }`, and logs in |
| POST | `/api/auth/login` | `email`, `password` | `200` `{ user }`, sets cookie |
| POST | `/api/auth/logout` | none | `204`, clears cookie |
| GET | `/api/auth/me` | none | `200` `{ user }` or `401` |
| POST | `/api/auth/forgot-password` | `email` | Always `204` |
| POST | `/api/auth/reset-password` | `token`, `password` | `204` |

`user` object:

```json
{ "id": "uuid", "full_name": "Ngozi Okafor", "email": "ngozi@example.com", "phone": "+14165550123", "role": "user" }
```

Reset tokens last 1 hour and work once.

### 8.2 Public schedule summary

**`GET /api/schedule`**: public. Used by the homepage to show when sessions run.

```json
{
  "timezone": "America/Toronto",
  "booking_window_weeks": 8,
  "rules": [ { "weekday": 4, "start_time": "19:00", "end_time": "21:00", "slot_minutes": 30 } ]
}
```

`weekday`: 1 = Monday to 7 = Sunday. Only active rules are listed.

### 8.3 Slots (public, polled)

**`GET /api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD`**

- `from` and `to` are dates in the church's time zone, both included. Range limit 62 days.
- Returns **every** slot in the range that the schedule offers, plus any slot that still holds an active booking. Never includes names.
- `state`: `free`, `taken` or `mine` (`mine` only when logged in).
- `bookable`: false for past slots, slots beyond the window, or slots blocked by the weekly limit for this member.
- `week_booked`: Monday dates (church time zone) of weeks where the logged-in member already has a booking. Only weeks that overlap the requested `from`–`to` range.
- Header: `Cache-Control: no-store`.

```json
{
  "slots": [
    { "start": "2026-11-13T00:00:00Z", "end": "2026-11-13T00:30:00Z", "state": "free",  "bookable": true },
    { "start": "2026-11-13T00:30:00Z", "end": "2026-11-13T01:00:00Z", "state": "mine",  "bookable": false },
    { "start": "2026-11-13T01:00:00Z", "end": "2026-11-13T01:30:00Z", "state": "taken", "bookable": false }
  ],
  "week_booked": ["2026-11-09"]
}
```

This is the only endpoint the polling hook calls.

### 8.4 Bookings (member)

**`POST /api/appointments`**: login required.

```json
// request
{ "slot_start": "2026-11-13T00:00:00Z", "prayer_point": "..." }
// 201 response
{ "appointment": { "id": "uuid", "slot_start": "...", "slot_end": "...", "status": "booked", "prayer_point": "...", "created_at": "..." } }
```

Backend steps: check the session, check the body, check that the slot exists in the current schedule, is in the future, is inside the window and is not on a blocked date, check the weekly limit, insert with the user from the session, turn a database conflict into `409 SLOT_TAKEN`, then send emails after the commit without making the response wait.

**`GET /api/appointments/mine`**: the member's own bookings, soonest upcoming first, then past ones.

```json
{ "appointments": [ { "id": "uuid", "slot_start": "...", "slot_end": "...", "status": "booked", "prayer_point": "...", "created_at": "..." } ] }
```

**`POST /api/appointments/{id}/cancel`**: owner only. Allowed only while `status` is `booked` and the slot has not started; otherwise `409 INVALID_STATE`. Returns `200 { appointment }`.

### 8.5 Admin bookings

**`GET /api/admin/appointments?from=&to=&status=&page=&page_size=`**
- Defaults: all statuses, `page=1`, `page_size=20` (max 100). Sorted by `slot_start`, soonest first.
- Each item has the member fields plus `user { id, full_name, email, phone }` and `cancelled_by` (`member`, `admin` or `null`).

```json
{ "appointments": [ { "id": "uuid", "slot_start": "...", "slot_end": "...", "status": "booked", "prayer_point": "...", "created_at": "...", "cancelled_by": null,
    "user": { "id": "...", "full_name": "Ngozi Okafor", "email": "ngozi@example.com", "phone": "+14165550123" } } ],
  "page": 1, "page_size": 20, "total": 37 }
```

**`GET /api/admin/appointments/{id}`**: one booking, same fields. Returns `{ appointment }`.

**`PATCH /api/admin/appointments/{id}`**: body `{ "status": "completed" | "cancelled" }`. Only from `booked`. Returns `200 { appointment }`.

### 8.6 Admin schedule

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/api/admin/schedule` | none | `200` full settings (below) |
| POST | `/api/admin/schedule/rules` | `weekday`, `start_time`, `end_time`, `slot_minutes`, `active` | `201 { rule }` |
| PATCH | `/api/admin/schedule/rules/{id}` | any rule fields | `200 { rule }` |
| DELETE | `/api/admin/schedule/rules/{id}` | none | `204` |
| POST | `/api/admin/schedule/blocked-dates` | `date`, `reason` (optional) | `201 { blocked_date }` |
| DELETE | `/api/admin/schedule/blocked-dates/{id}` | none | `204` |
| PATCH | `/api/admin/schedule/settings` | `booking_window_weeks` | `200 { settings }` |
| POST | `/api/admin/schedule/preview` | the proposed change (same body as the call it previews, plus `action`: `create_rule`, `update_rule` (+ `id`), `delete_rule` (+ `id`) or `add_blocked_date`) | `200 { affected_count, affected_ids }` |

`GET /api/admin/schedule` response:

```json
{
  "timezone": "America/Toronto",
  "booking_window_weeks": 8,
  "rules": [ { "id": "uuid", "weekday": 4, "start_time": "19:00", "end_time": "21:00", "slot_minutes": 30, "active": true } ],
  "blocked_dates": [ { "id": "uuid", "date": "2026-12-24", "reason": "Christmas Eve" } ]
}
```

Rule checks: `start_time` before `end_time`, the range divides evenly by `slot_minutes`, and no overlap with another rule on the same weekday (`409 SCHEDULE_CONFLICT`).

### 8.7 System

**`GET /api/health`**: `{ "ok": true }` after a quick database check.

### 8.8 Later: live updates with SSE

**`GET /api/slots/stream`** (`text/event-stream`) sends an event whenever a booking or the schedule changes. The frontend treats any event as "fetch `/api/slots` again". Nginx needs `proxy_buffering off` on this path. Postgres `LISTEN/NOTIFY` can tell FastAPI when something changed.

---

## 9. Data model (backend, suggested)

Isaac may adjust it.

```sql
create extension if not exists btree_gist;

create type user_role as enum ('user', 'admin');
create type appointment_status as enum ('booked', 'completed', 'cancelled');

create table users (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  email          text not null unique,          -- store lowercased
  phone          text not null,
  password_hash  text not null,
  role           user_role not null default 'user',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table session_rule (
  id            uuid primary key default gen_random_uuid(),
  weekday       smallint not null check (weekday between 1 and 7),
  start_time    time not null,
  end_time      time not null,
  slot_minutes  smallint not null check (slot_minutes in (15, 20, 30, 45, 60)),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (start_time < end_time)
);

create table blocked_date (
  id      uuid primary key default gen_random_uuid(),
  date    date not null unique,
  reason  text
);

create table settings (
  id                    smallint primary key default 1 check (id = 1),  -- one row only
  booking_window_weeks  smallint not null default 8 check (booking_window_weeks between 1 and 26),
  timezone              text not null default 'America/Toronto'  -- IANA name; placeholder until the church confirms
);

create table appointment (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete restrict,
  slot_start    timestamptz not null,
  slot_end      timestamptz not null,
  prayer_point  text not null check (char_length(prayer_point) between 1 and 10000),
  status        appointment_status not null default 'booked',
  cancelled_by  text check (cancelled_by in ('member', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (slot_start < slot_end),
  -- The double-booking guard. Active bookings may not overlap in time.
  -- Overlap (not just equal start) matters because the admin can change slot length.
  exclude using gist (tstzrange(slot_start, slot_end) with &&) where (status <> 'cancelled')
);

create table password_reset_token (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  used_at     timestamptz
);
```

- Slots are **worked out on request** from the rules, blocked dates and window. Only bookings are stored.
- The booking stores its own `slot_start` and `slot_end`, so later schedule changes do not affect it.
- The weekly limit is checked in the same transaction as the insert. Lock the member's row (`select ... for update`) first so two quick requests cannot both pass.

---

## 10. Emails (backend)

| When | To | Content |
|---|---|---|
| Booking created | All admins | Member name, phone, email, date and time, link to the booking in the admin page |
| Booking created | Member | Confirmation with date and time |
| Member cancels | All admins and the member | Which slot was cancelled |
| Admin cancels | Member | Their booking was cancelled, with the church's contact details |
| Password reset | Member | Reset link (valid 1 hour) |

- **Never put the prayer point in an email.** Link to the admin page instead.
- A failed email must not fail the booking. Log it and retry once.
- Use a mail service or authenticated SMTP. Set SPF and DKIM on the sending domain.

---

## 11. Security and privacy

**Frontend**
- No tokens in `localStorage`. Only the httpOnly cookie.
- Never log prayer points or put them in URLs or analytics.
- Never use `dangerouslySetInnerHTML` with user text.
- On the register page, show a short note: "Only church admins can read your prayer point."
- HTTPS only.

**Backend**
- Hash passwords with argon2 (or bcrypt).
- Check role and ownership on every protected route.
- Take the member's identity from the session, never from the request body.
- Rate limit login, register, password reset and booking.
- Keep Postgres closed to the internet. Nightly backups, with a tested restore.

---

## 12. Environment variables (frontend)

```
NEXT_PUBLIC_SITE_URL=https://example.org
NEXT_PUBLIC_API_BASE=/api
API_PROXY_TARGET=http://localhost:8000   # dev rewrites target
NEXT_PUBLIC_USE_MOCK=false
API_INTERNAL_URL=http://127.0.0.1:8000   # server-side calls go straight to FastAPI (unset in mock mode)
```

---

## 13. Build order (frontend)

### Phase 0: Design tokens
- Set up the colour, type, spacing, radius and shadow tokens and fonts from `UI.md` section 3, in light and dark.
- **Done when** a sample page looks right in both themes using only tokens.

### Phase 1: UI with mock data
1. Shared components: Button, Field, Card, StatusBadge, Dialog.
2. Homepage (placeholder text).
3. Register, login and password pages.
4. Booking flow (upcoming days list, calendar view, prayer point, confirm), matching the approved sample.
5. Member dashboard: my bookings, cancel.
6. Admin bookings: table, filters, detail page.
7. Admin schedule page: rules, blocked dates, window, change preview.
8. `lib/api/mock.ts`: every endpoint in section 8, in memory, with the same errors. The mock works out slots from mock rules the same way the backend will.
- **Done when** every page works on a phone with no backend.

### Phase 2: Agree the API (alongside Phase 1)
- Go through section 8 with Isaac and freeze it.
- Get the OpenAPI schema and generate `types.ts`.

### Phase 3: Connect to the backend
1. Write `client.ts` and `endpoints.ts`, then turn the mock off.
2. Auth and page guards.
3. Slots polling.
4. Booking and cancelling, including `SLOT_TAKEN` and `WEEKLY_LIMIT`.
5. Member dashboard, admin bookings and admin schedule on real data.
6. Loading, empty and error states everywhere.
- **Done when** on staging: the admin sets a schedule, a member registers and books, and the admin sees it.

### Phase 4: Launch
- Deploy on the VPS behind Nginx, same domain as the API.
- Run the checks in section 15 at phone width, in both themes.
- Admin enters the real schedule before launch.

### Phase 5: Later
- Switch polling to SSE.
- Email verification, account deletion, SMS or WhatsApp reminders.

---

## 14. Decisions (settled)

| # | Question | Decision |
|---|---|---|
| 1 | Auth | httpOnly cookie, same domain |
| 2 | JSON casing | `snake_case` |
| 3 | Hosting | Both on one VPS behind Nginx |
| 4 | Member confirmation email | Yes |
| 5 | Bookings per member | One active booking per week (Mon to Sun, church time zone) |
| 6 | Admin actions on bookings | Mark completed or cancelled. No rescheduling |
| 7 | Who sets the schedule | Admin, from `/admin/schedule` |
| 8 | Schedule change with existing bookings | Bookings stay. Admin is shown how many are affected |
| 9 | Booking window | Admin setting, default 8 weeks |
| 10 | Member cancel | Any time before the slot starts |
| 11 | Email verification | Off in v1 |
| 12 | Number of admins | Several |
| 13 | Time zone | Church's Canadian time zone, a backend setting. Placeholder `America/Toronto` until the location is confirmed |

---

## 15. Acceptance checks

**Frontend**
- Every page follows `UI.md`: phone first, and checked at 360, 400, 768, 1024, 1440 and 2560 px, in light and dark.
- The booking screen opens on the "Upcoming days" list. Full days are coloured, blocked days say "No session".
- In the calendar view, only days with sessions can be clicked. Full days are coloured, days with free slots are white, everything else is grey.
- A slot booked on another device shows as taken within about 5 seconds.
- `SLOT_TAKEN` clears the chosen slot, refreshes the times, keeps the prayer point and shows a clear message.
- Logged-out visitors are sent away from `/dashboard` and `/admin`. A member who opens `/admin` is sent away.
- Times show in the church's time zone from `GET /api/schedule`. With `America/Toronto`, a 7:00 PM slot on 12 November arrives as `2026-11-13T00:00:00Z` and shows as Thursday 12 November, 7:00 PM.
- Across a daylight saving change, the same weekly rule still shows 7:00 PM on both sides of the change.
- No prayer point appears in a URL, a log or browser storage.

**Schedule**
- The admin adds a Tuesday 10:00 to 11:00, 20-minute rule. Members see 3 Tuesday slots within about 5 seconds.
- Overlapping rules on the same day are rejected with `SCHEDULE_CONFLICT`.
- A blocked date shows no slots.
- Turning a rule off removes its future free slots, but existing bookings stay and still show to the member and admin.
- Changing the booking window changes how far ahead members can book.

**Backend (checked through the frontend)**
- Two bookings for the same slot at the same time: exactly one succeeds, the other gets `409 SLOT_TAKEN`.
- A cancelled slot can be booked again.
- Days with no rule, blocked dates, times that are not slot starts, past slots and slots beyond the window all return `400 INVALID_SLOT`.
- A second booking in the same week returns `409 WEEKLY_LIMIT`.
- A member cannot see or cancel someone else's booking.
- The admin sees name, email, phone, date, time and the full prayer point.
- The admin email arrives after a booking, and booking still works when the email service is down.

---

## 16. Backend checklist (for Isaac)

Moved to **`ISAAC.md`**, which is kept up to date with every change that affects the backend.
