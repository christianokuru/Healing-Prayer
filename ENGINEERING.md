# Engineering Guide: Frontend

How the frontend code is structured and written. Read with `prd.md`. When this guide and the code disagree, fix one of them in the same change.

Stack: Next.js 16 (App Router, React 19), TypeScript (strict), Tailwind v4, SWR, Zod, `openapi-typescript`, Vitest, Playwright.

---

## 1. Principles

1. **Thin edges, pure core.** Routes and components orchestrate and render. Logic lives in pure functions that are easy to test.
2. **One way to do each thing.** One HTTP client, one error type, one time module, one token set. Drift is a bug.
3. **The backend is the authority.** The frontend validates for UX and renders server state. It never computes slots, permissions or business rules on its own.
4. **Server-first.** Server Components by default. `"use client"` only on interactive leaves.
5. **Types flow from the source.** API types come from OpenAPI, form types from Zod schemas. No hand-written types for data that has a source.
6. **Boring over clever.** No abstraction before the third use. No dependency without a concrete need.
7. **Delete-friendly.** A feature is one folder. Removing it leaves no dangling code.

---

## 2. Layout

```
src/
  app/                          routing only
    (public)/page.tsx
    (auth)/login|register|forgot-password|reset-password/page.tsx
    dashboard/layout.tsx        server guard: member
    dashboard/page.tsx
    book/page.tsx               public; asks for login at Continue
    admin/layout.tsx            server guard: admin
    admin/page.tsx
    admin/appointments/[id]/page.tsx
    admin/schedule/page.tsx
    layout.tsx, globals.css, error.tsx, not-found.tsx
  features/
    auth/
    booking/
    my-bookings/
    admin-bookings/
    admin-schedule/
    home/
  components/ui/                design-system primitives, no business logic
  lib/
    api/                        client, endpoints, generated types, mock
    auth/                       getSession (server), useSession (client)
    time.ts                     all date/time logic
    errors.ts                   ApiError + code → message map
    config.ts                   constants (poll interval, page size, …)
    cn.ts                       class merge helper
  proxy.ts                      cheap cookie-presence redirect only
tests/e2e/                      Playwright
```

**Inside a feature** (only create what is needed):

```
features/booking/
  components/      BookingCalendar.tsx, DayCell.tsx, SlotButton.tsx, BookingForm.tsx
  hooks/           useLiveSlots.ts
  logic/           groupSlotsByDay.ts, groupSlotsByDay.test.ts
  schemas.ts       Zod schemas + inferred types
  index.ts         public surface of the feature
```

### Dependency rules (enforced by ESLint `import/no-restricted-paths`)

```
app  →  features  →  components/ui, lib
```

- `app/` imports features only through `features/<name>/index.ts`.
- Features never import other features. Shared code moves to `lib/` or `components/ui/`.
- `lib/` and `components/ui/` never import from `features/` or `app/`.
- Only `lib/api/` calls `fetch`.

---

## 3. Routes (`app/`)

- A page does three things: read params, load data on the server, render feature components. Target under 40 lines.
- Next.js 16: `params`, `searchParams` and `cookies()` are async. Always `await` them.
- Layout guards: `dashboard/layout.tsx` and `admin/layout.tsx` call `getSession()`. No user → `redirect("/login?next=…")`. Wrong role → `redirect("/dashboard")`.
- `proxy.ts` only redirects when the session cookie is absent. No decoding, no role checks. It is not a security boundary.
- Every route segment that loads data gets a `loading.tsx` where it helps UX. Errors bubble to `error.tsx`.

---

## 4. Data layer (`lib/api/`)

```
lib/api/
  schema.d.ts      generated: `openapi-typescript $API/openapi.json -o src/lib/api/schema.d.ts`
  types.ts         friendly aliases: export type Appointment = components["schemas"]["Appointment"]
  client.ts        request<T>()
  endpoints.ts     one function per endpoint, implements the Api interface
  mock/            in-memory implementation of the same Api interface
  index.ts         export const api: Api = USE_MOCK ? mockApi : httpApi
```

- **`Api` interface** is the contract. HTTP and mock both implement it. Components never know which one they got.
- **`request<T>()`**: builds the URL, sets `credentials: "include"` and JSON headers, parses the body, throws `ApiError` on non-2xx using the shared error shape. Unknown shapes become `ApiError("UNKNOWN", …)`.
- **Server vs browser base URL.** In the browser: relative `/api`. On the server: `API_INTERNAL_URL` (for example `http://127.0.0.1:8000`) and forward the incoming cookie header. `client.ts` handles this in one place.
- **Generated files are never edited.** Regenerate when the backend schema changes and fix compile errors.
- **The mock** lives only under `lib/api/mock/`. It is the only frontend code allowed to compute slots (it imitates the backend). It returns the same error codes and shapes, and adds a small artificial delay so loading states are exercised.

---

## 5. State and fetching

| Kind of data | Where it lives |
|---|---|
| Initial page data | Server Component fetch, passed as props |
| Live data (slots) | SWR in a client hook |
| Data after a mutation | SWR `mutate()` for client data, `router.refresh()` for server-rendered data |
| Form input | React Hook Form + Zod resolver |
| UI state (open dialog, selected slot) | Local `useState` |
| Global client state | None. No context store unless a real need appears |

- SWR keys are arrays built by small helpers (`slotsKey(from, to)`), never inline strings.
- `useLiveSlots`: `refreshInterval: POLL_MS`, `refreshWhenHidden: false`, `revalidateOnFocus: true`. Mounted only on the booking page.
- After a booking or cancel: revalidate slots and the my-bookings data. After `SLOT_TAKEN`: revalidate slots and clear the selection.
- No optimistic updates for bookings. The server decides, then we render.

---

## 6. Forms and validation

- One Zod schema per form in the feature's `schemas.ts`. `type X = z.infer<typeof xSchema>`.
- Shared field rules (phone, password, prayer point length) live in `lib/validation.ts` and are composed into feature schemas.
- Prayer point length uses code points: `[...s].length`. Never `s.length`.
- The backend's `INVALID_INPUT.fields` is mapped onto form fields with `setError`. Unknown field errors go to a form-level message.
- Submit buttons are disabled while pending. Double submits are impossible by construction.

---

## 7. Errors

- `ApiError { code, message, status, fields? }` is the only error type crossing the data layer.
- `lib/errors.ts` holds `messageFor(code)`: the single table from code to user-facing text.
- Handling order in a component: the specific codes the screen cares about (for example `SLOT_TAKEN`), then `messageFor()` as a fallback.
- `UNAUTHENTICATED` from any client call → redirect to `/login?next=<current path>`. Handled once, in a shared helper, not per screen.
- Never swallow errors silently. Never `console.log` request bodies (prayer points).

---

## 8. Time

- All time logic lives in `lib/time.ts`. No `new Date(...)` formatting or date maths anywhere else.
- Data is UTC ISO strings end to end. Convert to `Africa/Lagos` only at display, with `Intl.DateTimeFormat` and `timeZone: "Africa/Lagos"`. No date library unless `Intl` is truly not enough.
- Lagos calendar dates (`YYYY-MM-DD`) for API queries are built with the same module.
- `time.ts` has thorough unit tests, including the `18:00Z` → 7:00 PM case and dates near midnight UTC.

---

## 9. Components and styling

Design rules (tokens, breakpoints, component looks, screen layouts) live in `UI.md`. This section covers only how components are coded.

- **`components/ui/`**: Button, Field, Input, Textarea, Card, Badge, Banner, Dialog, SegmentedToggle, Toast (`ToastProvider` + `useToast`), Skeleton, Spinner, EmptyState. Import them from `@/components/ui`. They take props, render markup and never fetch or know about the domain. Add Select when a screen needs it.
- **Class names** are combined with `cn()` from `lib/cn.ts` (clsx + tailwind-merge). It is configured for our custom type tokens; never use `twMerge` directly.
- **Field** uses a render prop so the label, hint and error are always linked: `<Field id label hint error>{(control) => <Input {...control} />}</Field>`.
- **Dialog** is built on the native `<dialog>` (focus trap, inert page, Escape). State lives in the parent through `open` and `onClose`.
- **Living reference:** `/dev/tokens` and `/dev/components` show every token and component. Update them when you add or change one.
- **Feature components** compose ui primitives with domain data.
- One component per file, named after the file. Props type is `<Name>Props`, declared above the component.
- Variants through a small variant map (or `cva` if variants grow), not ad-hoc conditionals in `className`.
- Tailwind v4 with tokens in `globals.css` (`@theme`). **No raw hex, no arbitrary pixel values** in components. Light and dark through tokens only.
- Split a component when it passes about 150 lines or does two jobs.
- Accessibility is part of done: real `<button>` and `<label>`, visible focus, keyboard-operable calendar (arrow keys, Enter), `aria-live` for slot-taken and form errors, colour is never the only signal (full days also get a label).

---

## 10. Naming

| Thing | Convention | Example |
|---|---|---|
| Component | PascalCase, file matches | `SlotButton.tsx` |
| Hook | `use` + noun/verb | `useLiveSlots` |
| Function | verb first, camelCase | `formatLagosTime`, `groupSlotsByDay` |
| Boolean | `is` / `has` / `can` | `isBookable`, `hasWeeklyBooking` |
| Constant | SCREAMING_SNAKE in `config.ts` | `POLL_MS` |
| Zod schema | camelCase + `Schema` | `bookingSchema` |
| Feature folder | kebab-case | `admin-schedule` |
| Test | next to the file, `.test.ts` | `time.test.ts` |

API data stays `snake_case` as received. No casing conversion layer.

---

## 11. TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- No `any`. `unknown` + narrowing at boundaries. No non-null `!` except with a comment explaining why it is safe.
- Prefer `type` aliases. Discriminated unions for states (`{ status: "idle" } | { status: "error"; error: ApiError }`).
- Exhaustive `switch` with a `never` check on unions such as `state` and `status`.
- Path alias `@/*` → `src/*`. No deep relative imports (`../../../`).

---

## 12. Security and privacy rules

- No tokens or user data in `localStorage` or `sessionStorage`.
- Prayer points never appear in URLs, query strings, logs, analytics or error reports.
- No `dangerouslySetInnerHTML` with user content.
- Role checks on the frontend are for UX only. Every protected action relies on the backend's answer.

---

## 13. Testing

| Level | Tool | What |
|---|---|---|
| Unit | Vitest | Everything in `lib/` and every `features/*/logic/` function. `time.ts` and the mock's slot generator are covered thoroughly |
| Component | Vitest + Testing Library | Only components with real behaviour: BookingForm, BookingCalendar keyboard nav, schedule RuleForm |
| End to end | Playwright, against the mock | Register → book → see in dashboard → cancel. Slot taken flow. Guards (logged out, member on `/admin`). Admin edits schedule → slots change |
| End to end (staging) | Playwright, real backend | Same core flows before launch |

- Tests describe behaviour, not implementation. No snapshot tests of markup.
- Any bug fix starts with a failing test when practical.

---

## 14. Tooling

- ESLint: `next/core-web-vitals`, `typescript-eslint` strict, `import/no-restricted-paths` and `no-restricted-imports` for the layer rules (section 2), `no-restricted-globals` so only `lib/api` calls `fetch`, `no-console` (warn, allow `error`).
- Prettier with `printWidth: 100` plus `prettier-plugin-tailwindcss` (sorts classes).
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck` (runs `next typegen` first so route types like `LayoutProps` exist), `format`, `format:check`, `test`, `test:watch`, `test:e2e`. `gen:api` is added in Phase 2.
- Tests: Vitest with jsdom (`vitest.config.mts`), Playwright with `phone` (Pixel 7) and `desktop` (1440 px) projects against a production build in mock mode. `@playwright/test` is pinned to the browser version installed in the dev environment.
- Design tokens have a contrast test (`src/lib/contrast.test.ts`) that fails if any text colour pair drops below WCAG AA in either theme.
- CI (`.github/workflows/ci.yml`) runs `format:check`, `lint`, `typecheck`, `test`, `build` and the mock-mode Playwright suite on every pull request and on pushes to `main`.

---

## 15. Git

- Branches: `feat/…`, `fix/…`, `chore/…`.
- Conventional commits (`feat(booking): handle SLOT_TAKEN`).
- Small, single-purpose commits. Generated files are committed in their own commit.

---

## 16. Definition of done

A change is done when:
- It follows the dependency rules and conventions above.
- `lint`, `typecheck`, `test` and `build` pass.
- It passes the `UI.md` review checklist (phone first, all test widths, light and dark, keyboard only).
- Loading, empty and error states exist and have been seen.
- It works in mock mode, and against the real API once that endpoint exists.

---

## 17. Anti-patterns (reject in review)

- `fetch` outside `lib/api/`.
- Slot or permission logic outside the mock.
- Date formatting outside `lib/time.ts`.
- Hard-coded colours, sizes or user-facing error strings in components.
- A feature importing another feature.
- `"use client"` on a page or layout to avoid thinking about the boundary.
- Hand-written types for API data.
- A shared abstraction with only one or two users.
