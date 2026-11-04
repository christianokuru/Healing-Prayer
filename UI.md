# UI Guide

How the site looks, how each screen is laid out at each screen size, and how it behaves for the user. Read with `prd.md` (what the site does) and `ENGINEERING.md` (how the code is written).

Approved reference: the booking sample at https://claude.ai/artifact/BoKn3TSyqcZyi4yL2iun8N. When this guide is silent, match the sample.

---

## 1. Principles

1. **Mobile first.** Design and build the phone layout first, then add tablet, desktop and wide-screen layouts on top with `min-width` breakpoints only. Never design desktop first and squeeze it down.
2. **Calm and warm.** Lots of space, soft shapes, one strong colour. Nothing flashy. Many users come here at a hard moment.
3. **Easy for everyone.** Large text, large tap targets, plain words. Assume an older user on a cheap Android phone.
4. **One job per screen.** Each screen has one obvious main action.
5. **Never lose what the user typed.** Drafts survive going back, errors and slot clashes.
6. **Light on data.** Fast on a weak 3G connection.
7. **Bigger screens get more room, not stretched content.** Wider screens add columns or side panels. Text never runs wider than about 70 characters.

---

## 2. Screen sizes

Tailwind v4 default breakpoints. Build the base styles for phones, then layer up.

| Tier | Tailwind | Width | Typical device |
|---|---|---|---|
| Phone | base | 0 – 639 px | Phones (design at 360 and 400) |
| Large phone / small tablet | `sm` | 640 px + | Big phones in landscape, small tablets |
| Tablet | `md` | 768 px + | Tablets in portrait |
| Desktop | `lg` | 1024 px + | Tablets in landscape, laptops |
| Large desktop | `xl` | 1280 px + | Desktop monitors |
| Wide monitor | `2xl` | 1536 px + | Large and ultra-wide monitors |

**Test widths:** 360, 400, 768, 1024, 1280, 1440, 1920, 2560.

**What changes at each tier (site-wide)**

| | Phone | Tablet (`md`) | Desktop (`lg`) | Large / wide (`xl`, `2xl`) |
|---|---|---|---|---|
| Side gutter | 16 px | 24 px | 32 px | 40 px |
| Body text | 17 px | 17 px | 18 px | 18 px |
| Navigation | Top bar + menu sheet | Top bar with inline links | Same (admin: left sidebar) | Same |
| Content width | Full | Full | Max 1200 px, centred | Max 1200 px (admin 1440 px), centred |
| Reading text | Full | Max 65ch | Max 65ch | Max 65ch |
| Dialogs | Bottom sheet | Centred modal | Centred modal | Centred modal |
| Lists of records | Cards | Cards (2 columns where useful) | Table | Table |

- Wide monitors (`2xl`) never add a new layout of their own. They keep the `xl` layout, centred, with more empty space around it. The only exception is admin tables, which may use the extra width up to 1440 px.
- All gutters use `max(<size>, env(safe-area-inset-left/right))` so notched phones are safe.
- Nothing ever scrolls sideways except data tables, inside their own scroll box.

---

## 3. Design tokens

All colours, sizes and fonts come from tokens in `globals.css` (Tailwind v4 `@theme`). No raw hex values or one-off pixel sizes in components. The colours are placeholders the church may change later; changing them means editing only this table and `globals.css`.

### 3.1 Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F7F5F9` | `#16111A` | Page background |
| `surface` | `#FFFFFF` | `#211A27` | Cards, panels, inputs |
| `ink` | `#231A2B` | `#F1ECF4` | Main text |
| `muted` | `#645A6E` | `#ADA2B8` | Secondary text, labels |
| `line` | `#E2DBE8` | `#3A2F43` | Borders, dividers |
| `plum` | `#4B2A5E` | `#CDAEE2` | Brand, main buttons, selected state |
| `plum-ink` | `#FFFFFF` | `#1C1322` | Text on `plum` |
| `plum-soft` | `#EEE5F4` | `#34253F` | Full days, chosen-time box, soft highlights |
| `gold` | `#8A5F00` | `#E6BE62` | Accent, "yours", focus ring |
| `gold-soft` | `#F7EDD3` | `#3A2F17` | "Your booking" backgrounds, info banners |
| `ok` / `ok-soft` | `#2B6A4C` / `#E3F1E9` | `#82CBA5` / `#1B3328` | Free, success, completed |
| `danger` / `danger-soft` | `#9E2A37` / `#FBE8EA` | `#F2939D` / `#3E1F25` | Errors, cancelled |
| `off` | `#EDEAF0` | `#2A2231` | Disabled, taken, no session |

- Light is the default. Dark follows the device setting.
- Every text and background pair meets WCAG AA (4.5:1 for text, 3:1 for large text and UI edges). Check any new pair before using it.
- Status colours (`ok`, `danger`) are never used as brand colours.

### 3.2 Typography

| Role | Font | Weights |
|---|---|---|
| Headings | Lora (serif) | 500, 600 |
| Everything else | Atkinson Hyperlegible (sans) | 400, 700 |

Loaded with `next/font/google`, Latin subset only, `display: swap`.

| Token | Phone | `lg` and up | Use |
|---|---|---|---|
| `text-display` | 30 px | 44 px | Homepage hero only |
| `text-h1` | 28 px | 34 px | Page titles |
| `text-h2` | 22 px | 24 px | Section and card titles |
| `text-h3` | 19 px | 20 px | Small headings |
| `text-body` | 17 px | 18 px | Body text |
| `text-small` | 15 px | 15 px | Notes, helper text |
| `text-label` | 12 px, uppercase, `0.12em` tracking | same | Eyebrow labels |

- Use `clamp()` so sizes grow smoothly between phone and `lg`.
- Line height: 1.5 for body, 1.2 for headings. Headings use `text-wrap: balance`.
- Numbers that line up (times, dates in tables) use `tabular-nums`.
- Never below 15 px for anything a user must read; 12 px only for uppercase labels.

### 3.3 Spacing, radius, shadow, motion

- **Spacing:** 4 px base. Use 4, 8, 12, 16, 20, 24, 32, 40, 56, 80. Layouts use `gap`, not margins between siblings.
- **Radius:** `sm` 10 px (buttons in grids, inputs), `md` 14 px (boxes, banners), `lg` 20 px (cards, panels), `full` for pills and main buttons.
- **Shadow:** one soft shadow token, used only on raised things (sticky bar, active toggle, dialogs). Cards use a border, not a shadow.
- **Motion:** 150–200 ms ease-out for state changes. One special animation only: the red flash when a slot is just taken. Everything respects `prefers-reduced-motion`.

---

## 4. Layout shells

### 4.1 Public pages (`/`, `/book`, auth pages)
- **Phone:** top bar with the wordmark ("Healing Prayer" in Lora, "North-West" as a small label below) and a menu button that opens a sheet. A "Book prayer" button sits in the sheet and on the page.
- **`md`+:** top bar with inline links (Home, Book prayer, Log in or My bookings).
- Footer: address, contact, session times (read from the schedule).

### 4.2 Member area (`/dashboard`)
- Same top bar as public, with the member's name and a Log out item in the menu.

### 4.3 Admin area (`/admin/*`)
- **Phone and tablet:** top bar with page title and a menu sheet (Bookings, Schedule, Log out).
- **`lg`+:** fixed left sidebar (240 px) with the same items; content to the right, max 1440 px.

### 4.4 Wordmark
There is no logo. The wordmark is text: "Healing Prayer" in Lora 600 in `plum`, with "North-West" under it in the label style. Use it in the header, the favicon (a plum "H" in a rounded square) and emails.

---

## 5. Components

Primitives live in `components/ui`. Every interactive element has a visible focus ring (3 px `gold`, 2 px offset).

| Component | Rules |
|---|---|
| **Button** | Main: `plum` fill, `plum-ink` text, pill shape, 52 px tall. Secondary: outline with `line`. Text link: `plum`, underlined. Loading state shows a spinner and a verb ("Booking…") and is disabled. On phones, main buttons in forms are full width. |
| **Field** | Label above the input, always visible (no placeholder-only labels). Helper or error text below. Error: `danger` text and border, message says how to fix it. Inputs 48 px tall, 17 px text so phones do not zoom. |
| **Textarea** | Same as Field, at least 180 px tall, resizable. Counter under it on the right. |
| **Pill / badge** | Small rounded label for status: Free (`ok`), Full (`plum`), Your booking (`gold`), Booked, Completed, Cancelled. Always text, never colour alone. |
| **Banner** | Full-width message at the top of the content. Error (`danger-soft`) or info (`gold-soft`). Inside an `aria-live="polite"` region. |
| **Card** | `surface`, 1 px `line` border, `lg` radius, 16 px padding (20 px at `md`+). |
| **Dialog** | Bottom sheet on phones, centred modal (max 480 px) at `md`+. Focus is trapped, Escape closes. Used for confirms such as "Cancel this booking?". |
| **Segmented toggle** | Pill-shaped track in `off`, active option raised on `surface`. Used for "Upcoming days / Calendar". |
| **Toast** | Short confirmation at the bottom ("Booking cancelled"). Disappears after about 3 seconds. Never the only place an error is shown. |
| **Skeleton** | Grey shapes in the layout of the real content while loading. No spinners for whole pages. |
| **Empty state** | Short sentence plus the next action ("No bookings yet." + "Book prayer"). |

### Booking-specific components

| Component | Rules |
|---|---|
| **Slot button** | At least 56 px tall, min 112 px wide, in an auto-fill grid. Shows the time (bold) and a status word under it. States: free (`surface`, `line` border), selected (`plum` fill), taken (`off`, time crossed out, "Taken"), yours (`gold-soft`, "Yours"), locked by weekly limit (`off`, "—"). Each has a full `aria-label` such as "7:30 PM, free". |
| **Day card** | Eyebrow weekday, date in `text-h2`, status pill on the right, then the slot grid. Full day: `plum-soft` background, "Full" pill, one line of text, no buttons. Blocked date: dashed border, transparent background, "No session" pill with the reason. Day with your booking: "Your booking" pill and a note about the one-per-week rule. |
| **Calendar** | Month grid, Monday first, prev/next buttons (44 px). Day cells: open (white with `ok` dot), full (`plum-soft`), not available (faded, not focusable as a button). Today has a dashed outline. Legend under the grid. |
| **Progress steps** | Three labelled bars: Choose a time, Prayer point, Confirm. Current step bold with `aria-current="step"`. Hidden on the success screen. |
| **Chosen-time box** | `plum-soft` box showing the date and time range with a "Change" link. Used at the top of steps 2 and 3. |
| **Sticky booking bar** | Phone and tablet only. Fixed to the bottom, shows the chosen date and time and a Continue button. Respects the bottom safe area. Content gets bottom padding so nothing is hidden under it. |
| **Booking summary panel** | `lg`+ only. Replaces the sticky bar. A sticky card in the right column showing the chosen time (or "No time chosen yet"), and the Continue button. |

---

## 6. Screens

For each screen: the phone layout first, then what changes on bigger screens.

### 6.1 Homepage (`/`)
Sections in order: hero, about, what we do, when sessions run (from the live schedule), how booking works (3 steps), location and contact, footer.

- **Phone:** one column. Hero: heading, one sentence, "Book prayer" button, then the photo below. "How booking works" as a numbered vertical list. Contact details as selectable text with copy buttons.
- **`md`:** "What we do" in two columns. "How booking works" as three cards in a row.
- **`lg`+:** hero splits in two: text on the left, photo on the right. About section: text left (max 65ch), photo right.
- **`xl`/`2xl`:** same as `lg`, centred at 1200 px. The hero does not fill the screen height.
- Real church photos only, served as WebP/AVIF via `next/image`, with sizes set per breakpoint. No stock imagery.

### 6.2 Login, register, forgot and reset password
- **All sizes:** one centred card, max 440 px wide, on `bg`. Wordmark above it.
- Register shows the privacy note: "Only church admins can read your prayer points."
- Errors show next to the field when they belong to a field, and in a banner otherwise.
- After login from the booking page, the user returns to the same chosen time.

### 6.3 Booking (`/book`)
Matches the approved sample.

- **Phone:**
  - Title, one-line intro, progress steps, banner area, "Upcoming days / Calendar" toggle.
  - **Upcoming days:** a single column of day cards.
  - **Calendar:** month grid, then the tapped day's card below it.
  - Choosing a time shows the sticky booking bar.
  - **Step 2:** chosen-time box, prayer point textarea with counter, privacy note with a lock icon, Back and Continue.
  - **Step 3:** a summary list (Day, Time, Session, Prayer point with Edit), then Back and Confirm booking.
  - **Success:** tick icon, "Your prayer session is booked", the date and time, "View my bookings" and "Back to times".
- **`md` (tablet):**
  - Day cards in a 2-column grid. Slot grids show 4 across.
  - Calendar sits on the left and the tapped day's card on the right.
  - The sticky bar stays.
- **`lg`+ (desktop):**
  - Two columns: main area (about two-thirds) and the booking summary panel (about one-third, sticky at the top). The sticky bottom bar is not used.
  - Steps 2 and 3 keep the same two columns, with the form on the left and the summary panel on the right.
- **`xl`/`2xl`:** same as `lg`, centred at 1200 px. Day cards stay in 2 columns; this is a focused task, so no extra columns.
- **Behaviour (all sizes):** the prayer point survives going back, changing time and `SLOT_TAKEN`. On `SLOT_TAKEN`, return to step 1, flash the lost slot, and show the banner "Sorry, that time was just taken by someone else. Your prayer point is saved. Please pick another time."

### 6.4 Member dashboard (`/dashboard`)
- **Phone:**
  - "Your next session" card at the top: date, time and a Cancel button (which opens a confirm dialog).
  - Under it, upcoming bookings, then past bookings as simple cards with status pills.
  - Empty state: "You have no bookings yet." + Book prayer.
- **`md`+:** next session card and a "Book another" card side by side. Past bookings in a 2-column card grid.
- **`lg`+:** centred at 960 px. Past bookings become a simple table (Date, Time, Status).

### 6.5 Admin bookings (`/admin`)
- **Phone:**
  - Opens on **This week**: a list of sessions in time order. Each card has the time, member name, phone (tap to copy), status pill and "Mark completed".
  - Filters (date range, status) live in a sheet behind a "Filter" button. Pagination is a "Load more" button.
- **`md`:** cards in 2 columns. Filters shown inline above the list.
- **`lg`+:** sidebar layout. Table with columns: Date, Time, Member, Phone, Status, Actions. Filters in a bar above the table. Numbered pagination.
- **`xl`/`2xl`:** table may widen to 1440 px. Add an Email column at `xl`.

### 6.6 Admin booking detail (`/admin/appointments/[id]`)
- **Phone:** member details, then date and time, then the prayer point in full in readable body text (never truncated, keeps line breaks), then actions (Mark completed, Cancel) as full-width buttons.
- **`lg`+:** two columns. The prayer point on the left (max 65ch), and details and actions in a side card on the right.

### 6.7 Admin schedule (`/admin/schedule`)
- **Phone:**
  - Three sections stacked: Session rules, Blocked dates, Booking window.
  - Each rule is a card: "Thursday · 7:00 – 9:00 PM · 30 min", an on/off switch, and Edit and Delete.
  - Add and edit open a sheet with a live preview of the times the rule creates ("7:00, 7:30, 8:00, 8:30 PM").
- **`md`:** the rule form opens in a centred modal.
- **`lg`+:** rules on the left (two-thirds). Blocked dates and booking window stacked on the right.
- **Before saving any change:** show "N future bookings fall outside the new schedule. They will not be cancelled." with a link to them.

---

## 7. States

Every screen that loads data has all four of these:

| State | Rule |
|---|---|
| Loading | Skeleton in the shape of the content. |
| Empty | One sentence plus the next action. |
| Error | Banner with what happened and what to do, plus a Try again button. |
| Success | Toast for small actions, a full screen for a booking. |

---

## 8. Accessibility

- WCAG 2.2 AA.
- Tap targets at least 44 × 44 px (slot buttons 56 px tall).
- Colour is never the only signal: full days say "Full", taken slots are crossed out and say "Taken".
- Real `<button>`, `<a>`, `<label>` elements. Headings in order (one `h1` per page).
- The calendar works with the keyboard: arrow keys move between days, Enter selects.
- Errors and slot changes are announced through `aria-live`.
- Focus moves to the new step's heading or first field after each booking step.
- Pages work at 200% zoom with no sideways scroll.
- Respect `prefers-reduced-motion`.

---

## 9. Words

- Plain, warm and short. Talk to the user ("you"), in active voice.
- Buttons say what happens: "Book prayer", "Continue", "Confirm booking", "Cancel booking".
- Times look like "7:30 PM". Dates look like "Thursday 12 November" in headings and "Thu 12 Nov" in compact places.
- Errors say what went wrong and what to do next. No "Oops", no blame.
- Use "prayer session" for the booking, "prayer point" for the text, and "time" for a slot in user-facing text. "Slot" is an internal word.

---

## 10. Performance

- Homepage under 200 KB of JS on first load. Largest content shows within 2.5 s on a mid-range phone over 4G.
- Two font families, Latin subset only, no extra weights.
- Images: `next/image`, responsive sizes, lazy below the fold, no image over 200 KB.
- No carousels, background videos or animation libraries.

---

## 11. Review checklist (every screen)

- [ ] Built phone first; looks right at 360 and 400 px.
- [ ] Checked at 768, 1024, 1440 and 2560 px. Nothing stretches beyond its max width.
- [ ] Light and dark both checked.
- [ ] Keyboard only works; focus is visible.
- [ ] Loading, empty and error states exist.
- [ ] Only tokens used; no raw colours or sizes.
- [ ] Words follow section 9.
