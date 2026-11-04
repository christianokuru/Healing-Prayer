# UI Guide

How the site looks, how each screen is laid out at each screen size, and how it behaves for the user. Read with `prd.md` (what the site does) and `ENGINEERING.md` (how the code is written).

**Visual style: Candlelight × Manuscript** (approved 2026-11-04). A warm chapel at dusk, with candles and arches, printed on parchment with manuscript ornament: engraved capitals, ✠ dividers, drop caps, framed notices and an "order of service" list.

Approved references (when this guide is silent, match them):
- **Style, all screens:** https://claude.ai/artifact/AddXHW5nMkmh5k98MPPnyF (homepage, booking, log in, my bookings)
- **Booking behaviour:** https://claude.ai/artifact/BoKn3TSyqcZyi4yL2iun8N (flow and states; its colours are superseded by the style above)

---

## 1. Principles

1. **Mobile first.** Design and build the phone layout first, then add tablet, desktop and wide-screen layouts on top with `min-width` breakpoints only. Never design desktop first and squeeze it down.
2. **Churchy, calm and warm.** It should feel like a chapel, not a generic website: dusk light, candles, arches, Scripture, parchment and ornament. Nothing loud. Many users come here at a hard moment.
3. **Scripture is part of the design.** Every main screen carries a short King James Version verse that fits its job (public domain, so free to use).
4. **Easy for everyone.** Large text, large tap targets, plain words. Assume an older user on a cheap Android phone.
5. **One job per screen.** Each screen has one obvious main action.
6. **Never lose what the user typed.** Drafts survive going back, errors and slot clashes.
7. **Light on data.** Fast on a weak 3G connection.
8. **Bigger screens get more room, not stretched content.** Wider screens add columns or side panels. Text never runs wider than about 70 characters.

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

All colours, sizes and fonts come from tokens in `globals.css` (Tailwind v4 `@theme`). No raw hex values or one-off pixel sizes in components. Changing a colour means editing only this table and `globals.css`. The one exception is illustrations (the candles, the photo stand-in), which keep their own fixed colours inside the SVG or gradient.

### 3.1 Colour

**Light only for now.** A night version may come later, so every colour is a token defined once on `:root`; a night theme will only redefine these tokens.

| Token | Value | Use |
|---|---|---|
| `bg` | `#F6EFE3` | Parchment page background (with a faint paper grain) |
| `surface` | `#FFFAF1` | Cards, panels, inputs on parchment |
| `ink` | `#2B1D33` | Main text |
| `muted` | `#65566B` | Secondary text |
| `line` | `#D6C3A3` | Rules, borders, frames |
| `plum` | `#3E2350` | Brand, headings, main buttons, selected state |
| `plum-2` | `#5A3570` | Hover on plum |
| `plum-ink` | `#FFF7EA` | Text on `plum`, `night` and the dusk sky |
| `plum-soft` | `#ECE0EA` | Full days, verse bands, soft highlights |
| `gold` | `#7A560F` | Gold text and icons on light: labels, numerals, ✠, "yours", focus ring |
| `gold-bright` | `#C9962E` | Gold fills: gold buttons, candle stands |
| `gold-glow` | `#F0C96A` | Gold text and lines on dark (dusk, plum, night) |
| `gold-soft` | `#F6E9C8` | "Your booking" backgrounds, info banners |
| `night` | `#24142F` | Footer, darkest part of the dusk sky, text on gold buttons |
| `ok` / `ok-soft` | `#2B6A4C` / `#E1EFE5` | Free, success, completed |
| `danger` / `danger-soft` | `#9E2A37` / `#F7E3E5` | Errors, cancelled |
| `off` | `#ECE5DA` | Disabled, taken, no session |
| `scrim` | `rgb(36 20 47 / 0.5)` | Dim layer behind dialogs and sheets |

**Dusk sky** (hero and page banners): a vertical gradient `night` → `#45285A` → `#8D566C` → `#DCA066`, with faint light rays from the top right. Text on it is `plum-ink`; labels are `gold-glow`. Keep text in the top two-thirds, where contrast is high.

- Every text and background pair meets WCAG AA (4.5:1 for text, 3:1 for large text and UI edges). A unit test checks the pairs.
- Status colours (`ok`, `danger`) are never used as brand colours.

### 3.2 Typography

| Role | Font | Weights | Used for |
|---|---|---|---|
| Display | Cormorant Garamond | 600, 600 italic | Page titles, section headings, dates on cards |
| Caps | Cinzel | 600, 700 | Small engraved labels, Roman numerals, drop caps |
| Verse | EB Garamond | 400 italic | Scripture and quotes |
| Text | Atkinson Hyperlegible | 400, 700 | Everything people read or type: body, forms, buttons, times |

Loaded with `next/font/google`, Latin subset only, `display: swap`. Forms, times and booking details always use Atkinson Hyperlegible for readability.

| Token | Phone | `lg` and up | Font | Use |
|---|---|---|---|---|
| `text-display` | 46 px | 86 px | Display | Homepage hero only |
| `text-h1` | 38 px | 58 px | Display | Page titles, banners |
| `text-h2` | 32 px | 50 px | Display | Section headings |
| `text-h3` | 24 px | 28 px | Display | Card titles, dates |
| `text-verse` | 20 px | 24 px | Verse | Scripture lines |
| `text-body` | 17 px | 18 px | Text | Body text |
| `text-small` | 15 px | 15 px | Text | Notes, helper text |
| `text-label` | 12 px | 12 px | Caps | Engraved labels, uppercase, `0.2em` tracking |

- Use `clamp()` so sizes grow smoothly between phone and `lg`.
- Line height: 1.6 for body, 1.05–1.2 for display. Headings use `text-wrap: balance`.
- Italic display words in `gold-glow` (on dusk) or `plum` (on light) may emphasise one phrase per heading, e.g. "Bring what is on *your heart.*"
- Numbers that line up (times, dates in tables) use `tabular-nums`.
- Never below 15 px for anything a user must read; 12 px only for Cinzel labels.

### 3.3 Spacing, radius, shadow, motion

- **Spacing:** 4 px base. Use 4, 8, 12, 16, 20, 24, 32, 40, 56, 80. Layouts use `gap`, not margins between siblings.
- **Radius:** `sm` 12 px (slot buttons, inputs), `md` 14 px (boxes, banners), `lg` 18 px (cards, panels), `arch` (`200px 200px 18px 18px`) for arch-topped cards, `full` for pills and main buttons.
- **Shadow:** one soft shadow token, used only on raised things (sticky bar, active toggle, dialogs). Cards use a border, not a shadow.
- **Motion:** 150–200 ms ease-out for state changes. Two special animations only: candle flames flicker gently, and the red flash when a slot is just taken. Everything respects `prefers-reduced-motion`.
- **Smooth scrolling (Lenis):** the whole site uses Lenis for mouse wheel and trackpad scrolling.
  - Touch scrolling on phones and tablets stays native (`syncTouch` off).
  - Off entirely when the user prefers reduced motion.
  - Paused under an open dialog. Inner scroll areas (textareas, dialogs, anything with `data-lenis-prevent`) scroll natively.
  - In-page anchor links scroll smoothly through Lenis.

### 3.4 Ornaments

Manuscript details that give the site its character. Use them to mark structure, never as clutter.

| Ornament | Where |
|---|---|
| **Cross** (thin, two strokes, `gold-glow` on dark / `gold` on light) | Wordmark, chapel illustration, ✠ dividers |
| **✠ divider**: a short rule, a cross, a short rule | Between major homepage sections, under verse bands |
| **Double rule** (`3px double line`) | Header bottom on parchment, ministries list, framed notices, the booking bar's top edge |
| **Frame**: a border plus an outline 5–6 px outside it | Order of the week, arch photo, arch cards, "Find us" notice |
| **Drop cap** (Cinzel, `plum`, ~3 lines tall) | First paragraph of "About us" only |
| **Order of service list**: label, dotted leader, value | Session times on the homepage |
| **Roman numerals** (Cinzel, `gold`) | Steps: How booking works, booking progress |
| **Arch** | Hero illustration, photo frames, step cards, auth card, "Your next session" card |
| **Candles** (SVG, flames flicker) | Hero chapel, a single candle on the auth card |

---

## 4. Layout shells

### 4.1 Public pages
- **Header, two variants:**
  - **Over dusk** (`/`, `/book`): transparent, sits on top of the dusk hero or banner. Wordmark and links in `plum-ink`, the main link as a light pill.
  - **On parchment** (dashboards, other pages): `bg` with a double rule underneath. Wordmark in `plum`, the main link as a plum pill.
- **Phone:** wordmark and a Menu button that opens a bottom sheet. **`md`+:** inline links (Home, Book prayer, and Log in, My bookings or Admin).
- **Footer:** `night` background. Wordmark, a one-line description, session times and contact details, with `gold-glow` labels.

### 4.2 Member area (`/dashboard`)
- Header on parchment, footer as above. Greeting heading: "Peace be with you, {first name}".

### 4.3 Admin area (`/admin/*`)
- Same style as the member area: parchment, plum headings, engraved labels, framed cards. Admin pages are denser, so they use fewer ornaments (no verses or drop caps in tables).
- **Phone and tablet:** top bar with page title and a menu sheet (Bookings, Schedule, Log out).
- **`lg`+:** fixed left sidebar (240 px) with the same items; content to the right, max 1440 px.

### 4.4 Wordmark
There is no logo. The wordmark is a thin cross followed by "Healing Prayer" in Cormorant Garamond 600, with "North-West" under it in Cinzel caps (`0.32em` tracking). On dusk: `plum-ink` text, `gold-glow` cross and caps. On parchment: `plum` text, `gold` cross and caps. Use it in the header, the favicon (a gold cross on plum) and emails.

---

## 5. Components

Primitives live in `components/ui`. Every interactive element has a visible focus ring (3 px `gold`, 2 px offset; `gold-glow` on dark).

| Component | Rules |
|---|---|
| **Button** | Pill, 52 px tall. **Primary:** `plum` fill, `plum-ink` text. **Gold:** `gold-bright` fill, `night` text, for the main action on dusk or plum. **Secondary:** `surface` with a `line` border. **Light:** `plum-ink` fill, `plum` text, on dusk. **Text link:** `plum`, underlined. Loading shows a spinner and a verb ("Booking…") and is disabled. On phones, main buttons in forms are full width. |
| **Field** | Label above the input, always visible (no placeholder-only labels). Helper or error text below. Error: `danger` text and border, message says how to fix it. Inputs 50 px tall, `bg` fill with a `line` border, 17 px text so phones do not zoom. |
| **Textarea** | Same as Field, at least 180 px tall, resizable. Counter under it on the right. |
| **Pill / badge** | Small rounded label for status: Free (`ok`), Full (`plum`), Your booking (`gold` on `gold-soft`), Booked, Completed, Cancelled. Always text, never colour alone. |
| **Banner** | Full-width message at the top of the content. Error (`danger-soft`) or info (`gold-soft`). Inside an `aria-live="polite"` region. |
| **Card** | `surface`, 1 px `line` border, `lg` radius, 16 px padding (20 px at `md`+). **Framed** variant adds a thin inner frame (like a printed page), used for day cards. |
| **Arch card** | `surface`, `arch` radius, frame outline, centred content. Used for steps, the auth card and "Your next session". |
| **Verse** | EB Garamond italic in `text-verse`, then the reference in Cinzel caps (`gold` or `gold-glow`). On light: rules above and below, or a gold rule on the left. Always KJV. |
| **Divider** | The ✠ divider from section 3.4. Decorative, `aria-hidden`. |
| **Notice** | Framed box with a double border, centred caps label, used for "Find us" and "Book another". |
| **Order list** | Label, dotted leader, value, in a framed box. Used for session times. |
| **Dusk banner** | The dusk sky at the top of inner public pages (`/book`): engraved label, `text-h1` title, one verse, a curved parchment edge at the bottom. |
| **Dialog** | Bottom sheet on phones, centred modal (max 480 px) at `md`+. Focus is trapped, Escape closes. Used for confirms such as "Cancel this booking?". |
| **Segmented toggle** | Pill-shaped track in `off`, active option raised on `surface`. Used for "Upcoming days / Calendar". |
| **Toast** | Short confirmation at the bottom ("Booking cancelled"). Disappears after about 3 seconds. Never the only place an error is shown. |
| **Skeleton** | Grey shapes in the layout of the real content while loading. No spinners for whole pages. |
| **Empty state** | Short sentence plus the next action ("No bookings yet." + "Book prayer"). |

### Booking-specific components

| Component | Rules |
|---|---|
| **Slot button** | At least 56 px tall, min 112 px wide, in an auto-fill grid. Shows the time (bold) and a status word under it. States: free (`surface`, `line` border), selected (`plum` fill), taken (`off`, time crossed out, "Taken"), yours (`gold-soft`, "Yours"), locked by weekly limit (`off`, "—"). Each has a full `aria-label` such as "7:30 PM, free". |
| **Day card** | Framed card. Weekday in Cinzel caps, date in Cormorant (`text-h3`, `plum`), status pill on the right, then the slot grid. Slots in one row of 4 on desktop, 2 × 2 on tablets, auto-fill on phones; times never wrap. Full day: `plum-soft` background, "Full" pill, one line of text, no buttons. Blocked date: dashed border, transparent background, "No session" pill with the reason. Day with your booking: "Your booking" pill and a note about the one-per-week rule. |
| **Calendar** | Month grid, Monday first, prev/next buttons (44 px). Day cells: open (white with `ok` dot), full (`plum-soft`), not available (faded, not focusable as a button). Today has a dashed outline. Legend under the grid. |
| **Progress steps** | Three labelled bars, each with a Roman numeral in Cinzel: I Choose a time, II Prayer point, III Confirm. Current step bold with a `plum` bar and `aria-current="step"`. Hidden on the success screen. |
| **Chosen-time box** | `plum-soft` box showing the date and time range with a "Change" link. Used at the top of steps 2 and 3. |
| **Sticky booking bar** | Phone and tablet only. Fixed to the bottom, shows the chosen date and time and a Continue button. Respects the bottom safe area. Content gets bottom padding so nothing is hidden under it. |
| **Booking summary panel** | `lg`+ only. Replaces the sticky bar. A sticky card with a double-rule frame in the right column: "Your booking" label, the chosen date in Cormorant (or "No time chosen yet"), the time, Continue, and the privacy line in italic. |

---

## 6. Screens

For each screen: the phone layout first, then what changes on bigger screens.

### 6.1 Homepage (`/`)
Sections in order (see the style reference):
1. **Hero** on the dusk sky, header over it: "Next session" pill (date, time, how many times are free), display heading with one italic phrase, one-line lead, a verse (James 5:16) with a gold rule on its left, **Book a prayer session** (gold) and **How it works** (outline). The chapel arch with three candles beside it. A curved parchment edge at the bottom.
2. **About us:** heading, first paragraph with a drop cap, second paragraph, a verse between rules (Matthew 11:28), and an arch photo frame.
3. ✠ divider.
4. **When we gather to pray:** a plum band with a soft candle glow. Left: label, heading, one line, **See free times** (gold). Right: the framed **Order of the week** list (day ........ time, each session ........ length, book up to ........ weeks), from the live schedule, with the time zone named.
5. **How booking works:** three arch cards numbered I, II, III.
6. **Verse band:** a ✠, a verse (Psalm 147:3) and its reference on a soft plum wash.
7. **Our ministries:** bulletin list between double rules, each title with a ✠, two columns from `lg`.
8. **Find us:** a framed notice with address, phone and email rows, each with Copy, and a maps link.
9. Footer.

- **Phone:** one column; the chapel sits under the hero text. **`lg`+:** hero, about and the sessions band split into two columns.
- **`xl`/`2xl`:** centred at 1200 px. The hero does not fill the screen height.
- Real church photos replace the arch photo placeholder later, via `next/image`. No stock imagery.

### 6.2 Login, register, forgot and reset password
- **All sizes:** wordmark above one centred **arch card** (max 440 px) on parchment, with a framed outline, a single lit candle at the top, the title in Cormorant `plum`, and a short verse (log in: James 4:8). Fields and buttons in Atkinson. A ✠ divider above the footer link.
- Register shows the privacy note: "Only church admins can read your prayer points."
- Password fields have a Show/Hide button. A field's hint is hidden while it shows an error, so the two never repeat each other.
- Someone already logged in who opens login or register goes straight to their area.
- Errors show next to the field when they belong to a field, and in a banner otherwise.
- After login from the booking page, the user returns to the same chosen time.

### 6.3 Booking (`/book`)
Flow and states match the booking sample; style matches the style reference. Header over a **dusk banner** ("Book prayer" label, "Choose a time to be prayed with", James 5:16), then the steps on parchment.

- **Phone:**
  - Title, one-line intro, progress steps, banner area, "Upcoming days / Calendar" toggle.
  - **Upcoming days:** a single column of day cards.
  - **Calendar:** month grid, then the tapped day's card below it.
  - Choosing a time shows the sticky booking bar.
  - **Step 2:** chosen-time box, prayer point textarea with counter, privacy note with a lock icon, Back and Continue.
  - **Step 3:** a summary list (Day, Time, Session, Prayer point with Edit), then Back and Confirm booking.
  - **Success:** tick icon, "Your prayer session is booked", the date and time, "View my bookings" and "Back to times".
- **`md` (tablet):**
  - Day cards in a 2-column grid. Slot grids show 2 × 2.
  - Calendar sits on the left and the tapped day's card on the right.
  - The sticky bar stays.
- **`lg`+ (desktop):**
  - Two columns: main area (about two-thirds) and the booking summary panel (about one-third, sticky at the top). The sticky bottom bar is not used.
  - Day cards in one column, with the 4 times in one row.
  - Steps 2 and 3 keep the same two columns, with the form on the left and the summary panel on the right.
- **`xl`/`2xl`:** same as `lg`, centred at 1200 px. This is a focused task, so no extra columns.
- **Behaviour (all sizes):** the prayer point survives going back, changing time and `SLOT_TAKEN`. On `SLOT_TAKEN`, return to step 1, flash the lost slot, and show the banner "Sorry, that time was just taken by someone else. Your prayer point is saved. Please pick another time."

### 6.4 Member dashboard (`/dashboard`)
- **Phone:**
  - Engraved "My bookings" label and the greeting "Peace be with you, {first name}".
  - **Your next session** in an arch card: date in Cormorant, time, a verse (Philippians 4:6), and Cancel booking (opens a confirm dialog).
  - **Past sessions** as a register: rows between double rules, date in Cormorant, time, status pill.
  - **Book another** notice: one line about the weekly rule and **See free times**.
  - Empty state: "You have no bookings yet." + Book prayer, in the same arch card.
- **`md`+:** the next-session card on the left; past sessions and Book another stacked on the right.
- **`lg`+:** centred at 1200 px, same two columns.

### 6.5 Admin bookings (`/admin`)
- **Phone:**
  - Opens on **This week**: a list of sessions in time order. Each card has the time, member name, phone (tap to copy), status pill and "Mark completed".
  - Filters (date range, status) live in a sheet behind a "Filter" button. Pagination is a "Load more" button.
- **`md`:** cards in 2 columns. Filters shown inline above the list.
- **`lg`+:** sidebar layout. Table with columns: Date, Time, Member, Phone, Status, Actions. Filters in a bar above the table. Numbered pagination.
- **`xl`/`2xl`:** table may widen to 1440 px. Add an Email column at `xl`.
- Style: parchment, Cinzel column headers, rows separated by `line` rules, dates in Atkinson for scanning (Cormorant only for the page title).

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
- Four font families (section 3.2), Latin subset only, only the listed weights. Decorative fonts (Cinzel, EB Garamond) are only used for short text.
- Images: `next/image`, responsive sizes, lazy below the fold, no image over 200 KB.
- No carousels, background videos or animation libraries, except Lenis for smooth scrolling (section 3.3).

---

## 11. Review checklist (every screen)

- [ ] Built phone first; looks right at 360 and 400 px.
- [ ] Checked at 768, 1024, 1440 and 2560 px. Nothing stretches beyond its max width.
- [ ] Light theme checked (no night version yet). Colours only through tokens so a night version can be added later.
- [ ] Looks like the style reference: parchment, plum and gold, engraved labels, a verse where the screen calls for one.
- [ ] Keyboard only works; focus is visible.
- [ ] Loading, empty and error states exist.
- [ ] Only tokens used; no raw colours or sizes.
- [ ] Words follow section 9.
