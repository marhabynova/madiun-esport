This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local development (MADIRA specifics)

This project uses Prisma (Postgres) and a few dev helpers. Quick steps to run locally:

1. Install dependencies

```powershell
cd madira-web
pnpm install
```

2. Create `.env` in `madira-web` (example provided in `.env.example`) — at minimum set:

```
DATABASE_URL="postgresql://madira:madira1922@localhost:5433/madira"
NEXT_PUBLIC_APP_NAME=MADIRA
NODE_ENV=development
```

3. Generate Prisma client, push schema and seed the DB

```powershell
cd madira-web
# ensure PRISMA_CLIENT_ENGINE=library when using the bundled client engine locally
$env:PRISMA_CLIENT_ENGINE='library'
pnpm prisma generate --schema prisma/schema.prisma
pnpm prisma db push --schema prisma/schema.prisma --accept-data-loss
node prisma/seed.js
```

4. Run tests

```powershell
pnpm test
```

5. Run the dev server

```powershell
pnpm dev
```

## Development helpers added by Copilot

- `app/components/ListStates.tsx` – reusable wrapper enforcing `loading` / `empty` / `error` states for list pages. Use on all lists to comply with UI rules.
- `app/components/StatsForm.tsx` + `app/components/AdminStatsFormClient.tsx` – client-side generator for stat input forms built from `StatDefinition`.
- `app/api/stat-definitions/route.ts` – example endpoint returning `StatDefinition` array.
- `app/api/admin/match/[matchId]/stats/route.ts` – accepts stats submissions and records an `AuditLog` (service layer must process further).
- `scripts/processAuditSubmissions.cjs` and npm script `process:submissions` – processes `SUBMIT_STATS` audit logs into `Revision` records.

Notes on enabling persistence:

- The repo now includes optional Prisma models (`MatchPlayerStats`, `MatchTeamStats`, `MatchExtra`, `StatDefinition`) in `prisma/schema.prisma`.
- To persist submitted stats into the DB, run:

```powershell
cd madira-web
pnpm prisma generate --schema prisma/schema.prisma
pnpm prisma db push --schema prisma/schema.prisma --accept-data-loss
node scripts/processAuditSubmissions.cjs
```

Or, if you prefer declarative migrations, a SQL migration is included at `prisma/migrations/20251217_add_stats_models/migration.sql`.
Apply it with your usual migration workflow, for example:

```bash
cd madira-web
# generate client
pnpm prisma generate
# apply migrations (deploy)
pnpm prisma migrate deploy
```

The processor will create `Revision` records and, when `playerStats` / `teamStats` / `extra` are present in the audit `meta`, will insert into the corresponding tables.

Per project rules, all stat calculations and aggregate updates must remain in the service layer — the processor only persists submitted raw stats and revisions; leaderboard recalculation is still performed by the service functions.

Follow the repo's rules: UI must not compute business logic; use service layer (`scripts/processAuditSubmissions.cjs` demonstrates server-side processing pattern).

## Running the submissions worker in production

Two recommended options to run the `workerProcess.cjs` (which periodically runs `processAuditSubmissions.main()`):

- PM2 (cross-platform, recommended):

  1.  Install PM2 globally: `npm i -g pm2`
  2.  Start the worker: `pnpm pm2:start-worker` (or `pm2 start pm2.ecosystem.config.js`)
  3.  View logs: `pm2 logs madira-worker-submissions`
  4.  Stop: `pnpm pm2:stop-worker` or `pm2 stop madira-worker-submissions`

- Windows Scheduled Task (simple, no extra deps):

  1.  Use the provided PowerShell loop `scripts/run-worker.ps1`.
  2.  Create a Scheduled Task that runs PowerShell on system startup with this command:

```powershell
PowerShell -NoProfile -ExecutionPolicy Bypass -File "C:\path\to\madira-web\scripts\run-worker.ps1"
```

    3. Ensure `.env` is present and points to a reachable database, and the worker is run from the repo root.

Notes:

- Configure `PROCESS_SUBMISSIONS_INTERVAL_MS` env var to change the polling interval (default 60000 ms).
- The worker only persists raw submissions and creates revisions; aggregate recalculation remains in service code.
- The worker only persists raw submissions and creates revisions; aggregate recalculation remains in service code.

### systemd (Linux)

An example `systemd` unit is provided at `deploy/madira-worker.service`. To enable on a Linux host:

```bash
# copy file and set WorkingDirectory
sudo cp deploy/madira-worker.service /etc/systemd/system/madira-worker.service
sudo systemctl daemon-reload
sudo systemctl enable --now madira-worker.service
sudo journalctl -u madira-worker.service -f
```

Edit `WorkingDirectory` and `ExecStart` in the unit file to match your deployment paths and Node location.

Notes:

- If you encounter Prisma client runtime errors related to engine/adapters, the repository currently pins `prisma` and `@prisma/client` to `4.15.0` for local development compatibility. Upgrading to Prisma v7 requires a separate migration.
- For secure finalize operations, set `FINALIZE_AUTH_TOKEN` env var and store the token in client localStorage as `finalizeToken` when testing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
