PR: chore(prisma): downgrade to v4.15.0 for local compatibility

## Summary

- Downgrade `prisma` and `@prisma/client` to `4.15.0` to restore local dev compatibility.
- Add `url = env("DATABASE_URL")` to `prisma/schema.prisma` for v4.
- Normalize Prisma config to use a canonical `prisma.config.cjs`.
- Remove adapter/accelerateUrl injection for v4 compatibility and centralize Prisma client in `lib/prisma`.
- Ran `prisma generate`, `prisma db push`, seeded DB and ran tests locally (all passing).

## Files changed (high level)

- package.json, pnpm-lock.yaml
- prisma/schema.prisma
- prisma.config.cjs
- lib/prisma.{ts,js}
- services/\* (match finalize service + helpers)
- tests/\* (unit + integration)

## Why

Prisma v7 introduced a client engine/CLI config change that broke local runs in our environment. Downgrading to v4.15.0 restores a stable developer experience while we plan a proper migration to v7.

## Notes / Next steps

- Consider a planned upgrade to Prisma v7 with dedicated work: update schema usage, move datasource URL to config, and adopt engine/adapters as required.
- This PR is intended as a short-term compatibility fix to unblock development and CI.
- This PR is intended as a short-term compatibility fix to unblock development and CI.

## Local dev & run instructions (quick)

1. Install deps:

```powershell
cd madira-web
pnpm install
```

2. Ensure your `.env` has `DATABASE_URL` pointing to local Postgres (example `.env.example` included)

3. Generate client, push schema and seed DB:

```powershell
$env:PRISMA_CLIENT_ENGINE='library'
pnpm prisma generate --schema prisma/schema.prisma
pnpm prisma db push --schema prisma/schema.prisma --accept-data-loss
node prisma/seed.js
```

4. Run tests:

```powershell
pnpm test
```

5. Run dev server:

```powershell
pnpm dev
```

## How to push this branch (if not pushed already)

1. Add remote and push (replace <remote-url>):

```powershell
cd "d:\MADIUN ESPORT ARENA (MADIRA)\madira-web"
git remote add origin <remote-url>  # only if not configured
git fetch origin
git push origin fix/prisma-downgrade
```

2. Create PR with GitHub CLI:

```powershell
gh pr create --base main --head fix/prisma-downgrade --title "chore(prisma): downgrade to v4.15.0 for local compatibility" --body-file PR_DRAFT.md --draft
```
