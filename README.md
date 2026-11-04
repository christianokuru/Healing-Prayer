# Healing Prayer North-West

Booking site for one-on-one prayer sessions. Frontend: Next.js 16, TypeScript, Tailwind v4.

Start with [`MASTER.md`](./MASTER.md). It explains the project, the other docs (`prd.md`, `ENGINEERING.md`, `UI.md`) and the current status. Backend developer: start with [`ISAAC.md`](./ISAAC.md).

## Run it

```bash
npm ci
cp .env.example .env.local   # mock mode on by default
npm run dev
```

Open http://localhost:3000. In mock mode the API at `/api/*` is served by an in-memory fake backend. Demo accounts: member `ngozi@example.com` / `password123`, admin `admin@example.com` / `admin12345`. The design token sheet is at http://localhost:3000/dev/tokens.

## Test on your phone

1. Connect the phone to the same Wi-Fi as your computer.
2. Run `npm run dev` and note the **Network** address it prints, for example `http://192.168.1.20:3000`.
3. Open that address on the phone.

Buttons need the page's JavaScript, which the dev server only sends to allowed addresses. Home networks (`192.168.x.x`, `10.x.x.x`) are allowed in `next.config.ts`. If buttons do nothing on your phone, add your computer's address to `DEV_ALLOWED_ORIGINS` in `.env.local` and restart `npm run dev`.

## Checks

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
```
