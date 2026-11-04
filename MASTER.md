# MASTER: Healing Prayer North-West

Read this file first, every session. It tells you what this project is, which documents rule it, how to work, and where the work stands.

---

## 1. The project in one paragraph

A small website for **Healing Prayer North-West**. Members create an account, pick a free time for a one-on-one prayer session, and write a prayer point. Admins set when sessions run, see every booking and get an email for each one. The frontend (Next.js) is built here. The backend (FastAPI + PostgreSQL) is built by a separate developer, Isaac, against the API in `prd.md`.

---

## 2. The documents

| File | Answers | Owner of |
|---|---|---|
| `prd.md` | **What** we are building and **why** | Features, business rules, pages, API contract, data model, acceptance checks |
| `ENGINEERING.md` | **How the code** is structured and written | Folder layout, layers, data fetching, types, errors, testing, tooling |
| `UI.md` | **How it looks and feels** at every screen size | Tokens, breakpoints, components, screen layouts, states, accessibility, words |
| `MASTER.md` | **How to work** and **where we are** | This routine, status, decision log |
| `ISAAC.md` | **What the backend developer must build** | Backend milestones, endpoint list, error codes, slot rules, "What's new" log for Isaac |

**When documents disagree:**
1. The user's latest instruction wins.
2. Then `prd.md` for behaviour and rules.
3. Then `ENGINEERING.md` for code and `UI.md` for design.
4. `ISAAC.md` follows `prd.md`. If they differ, fix `ISAAC.md`.

Never quietly pick one. Fix the losing document in the same change, and mention it to the user.

---

## 3. Before every task

1. Read `MASTER.md` (this file), including the status in section 6.
2. Read the parts of `prd.md`, `ENGINEERING.md` and `UI.md` that the task touches. For a new feature or screen, read all three in full.
3. Check that the task fits the current phase (section 6). If it does not, say so before starting.
4. If the documents do not answer something that matters (a rule, an API field, a layout), ask the user. Do not invent business rules or API fields.

## 4. While working

- Stay inside the scope in `prd.md`. Items under "Not in v1" are not built unless the user asks.
- Follow `ENGINEERING.md` exactly: layers, naming, one way to do each thing.
- Follow `UI.md` exactly: build the phone layout first, then `md`, `lg`, `xl`/`2xl`. Use tokens only.
- Build against the mock API until the real endpoint exists. The mock must match the API contract in `prd.md`.
- Keep changes small and focused on the task.

## 5. After every task

1. Run the checks in `ENGINEERING.md` ("Definition of done") and the `UI.md` review checklist for any screen touched.
2. If the work changed a rule, an API shape, a layout or a convention, update the matching document **in the same change**.
3. If anything affects the backend (an endpoint, field, error code, rule, email or setting), update `ISAAC.md` in the same change: the relevant section **and** a dated line in its "What's new" table. Tell the user Isaac has something new.
4. Update section 6 below: what was done, what is next, any new open questions.
5. Add any decision the user made to the decision log (section 7).
6. Tell the user, in plain words, what changed and anything that is still open.

---

## 6. Status

**Current phase:** Phase 1, UI with mock data (see `prd.md` section 13). Step 4 (auth screens and guards) awaiting merge.

**Done**
- PRD v3 written (admin-set schedule).
- `ENGINEERING.md` written.
- `UI.md` written.
- Booking screen sample approved: https://claude.ai/artifact/BoKn3TSyqcZyi4yL2iun8N
- Repo set up (`christianokuru/healing-prayer`, Next.js 16.4.5 starter). Docs added to the repo.
- Phase 0: code in `src/`, strict TypeScript, lint layer rules, Prettier, Vitest, Playwright, CI. Design tokens and fonts in `globals.css`. Token sheet at `/dev/tokens`, checked at 360 to 2560 px in light and dark. Token contrast test.
- Phase 1 step 1: shared components in `components/ui`, `cn()` helper, component gallery at `/dev/components`, unit and browser tests.
- Lenis smooth scrolling. Canadian time zone setting. `ISAAC.md` created.
- Phase 1 step 2: `lib/time.ts` (daylight saving safe), `lib/validation.ts`, `lib/errors.ts`, API client (`lib/api`), mock API served at `/api/*` in mock mode with seed data and demo accounts.
- Phase 1 step 3: public layout (header with phone menu sheet, footer), homepage with all sections, live session times from the schedule, placeholder copy marked "Sample text".
- Phase 1 step 4: register, login, forgot and reset password; `proxy.ts` and server guards for `/dashboard` and `/admin`; temporary welcome pages for both areas.

**Next**
1. Phase 1, step 5: the booking flow at `/book` (upcoming days list, calendar view, prayer point, confirm), matching the approved sample.
2. Then member dashboard, admin bookings, admin schedule (`prd.md` section 13, Phase 1).

**Open questions**
- Church content still needed: about text, services, address, contact details, photos. Placeholders live in `src/features/home/content.ts` and `src/lib/church.ts`; set the `*_PLACEHOLDER(S)` flags to false when replaced.
- API contract (`prd.md` section 8, summarised in `ISAAC.md`) to be reviewed and frozen with Isaac. Share `ISAAC.md` with him.
- Church location in Canada, to set the real time zone (placeholder `America/Toronto`).

---

## 7. Decision log

Newest first. One line each.

| Date | Decision |
|---|---|
| 2026-11-04 | Session cookie name `hp_session` (configurable with `SESSION_COOKIE_NAME`); added to `ISAAC.md`. |
| 2026-11-04 | Placeholder content is shown with a "Sample text" mark and "photo to come" blocks until the church sends real content. No stock photos. |
| 2026-11-04 | The mock API runs as a real `/api/*` inside the Next.js server (mock mode only), not in the browser, so server-side login checks work against it. |
| 2026-11-04 | `ISAAC.md` holds everything the backend developer must build, with a dated "What's new" log. Updated whenever backend work changes. |
| 2026-11-04 | Time zone is Canadian, not Nigerian: a backend setting, placeholder `America/Toronto` until the church confirms. Daylight saving aware. Isaac to be told. |
| 2026-11-04 | Lenis smooth scrolling site-wide, mouse and trackpad only; native on touch; off for reduced motion. |
| 2026-11-04 | Added a `scrim` colour token for dialog backdrops (darkens in both themes). |
| 2026-11-04 | Light-mode gold darkened from `#9A6B00` to `#8A5F00` so gold text on gold-soft meets WCAG AA. |
| 2026-11-04 | Work flow: one branch and one pull request per task; the user reviews and merges. `CLAUDE.md` loads `MASTER.md` and `AGENTS.md`. |
| 2026-11-04 | Separate docs: `prd.md` (what), `ENGINEERING.md` (code), `UI.md` (design), `MASTER.md` (routine and status). |
| 2026-11-04 | UI is mobile first, then tablet, desktop and wide monitors. |
| 2026-11-04 | Booking page is `/book`, public to browse, login required at Continue. |
| 2026-11-04 | Booking screen opens on an "Upcoming days" list; the calendar is the second view. |
| 2026-11-04 | Colours: deep plum with soft gold. Fonts: Lora and Atkinson Hyperlegible. Placeholder until the church chooses. No logo; text wordmark. |
| 2026-11-04 | Live updates by polling every 5 seconds with SWR. SSE later if needed. |
| 2026-11-04 | Admin sets session days, times and slot length. Changing the schedule never cancels bookings. |
| 2026-11-04 | Keep the split: Next.js frontend (Chris), FastAPI backend (Isaac). Accounts required to book. |
