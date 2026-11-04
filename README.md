# Healing Prayer North-West

Booking site for one-on-one prayer sessions. Frontend: Next.js 16, TypeScript, Tailwind v4.

Start with [`MASTER.md`](./MASTER.md). It explains the project, the other docs (`prd.md`, `ENGINEERING.md`, `UI.md`) and the current status. Backend developer: start with [`ISAAC.md`](./ISAAC.md).

## Run it

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The design token sheet is at http://localhost:3000/dev/tokens.

## Checks

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
```
