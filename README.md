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

## Checks

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
```
