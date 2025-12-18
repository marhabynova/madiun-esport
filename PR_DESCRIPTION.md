PR: SSE compatibility + Finalize flow robustness

Summary

This PR improves match finalization reliability and SSE event compatibility:

- Emit both named SSE events and default `data` messages including a `type` field so clients that only listen to `onmessage` receive events.
- Expose EventSource via `useSSE` so components may register named event listeners.
- Make `FinalizeMatchButton` more robust:
  - Registers both named (`match.finalized`) and default (`message`) listeners.
  - Improved POST error handling and parsing.
  - Adds polling fallback (`/api/match/[matchId]/status`) when SSE is disconnected.
- Add API GET `/api/match/[matchId]/status` for status polling by clients.
- Tests updated/added; all tests pass locally.

Files changed (high-level)

- services/events/sseAdapter.ts
- app/hooks/useSSE.tsx
- app/components/FinalizeMatchButton.tsx
- app/api/match/[matchId]/status/route.ts
- tests/api/finalize.route.test.ts
- madira-web/CHANGELOG.md
- madira-web/PR_BODY.md

Testing

Run locally from repository root:

```bash
cd madira-web
pnpm install
pnpm test
```

Manual verification

```bash
cd madira-web
# ensure DATABASE_URL is configured if necessary
pnpm dev
# open http://localhost:3000, open a match page and click "Finalize Match"
```

Notes & rationale

- Event delivery should not block domain operations: `emitMatchFinalizedEvent` catches errors and continue; SSE adapter also swallows per-connection errors.
- The default `data` messages include `type` to keep backward compatibility with clients that don't use named events.
- Polling fallback reduces race conditions or missing events when SSE fails to connect.

Reviewer checklist

- [ ] Verify tests pass locally (`pnpm test`).
- [ ] Ensure no business logic moved to UI (all logic remains in `services/`).
- [ ] Review `sseAdapter` to ensure no leaking resources.
- [ ] Sanity-check `finalizeMatch` service flow and audit/revision creation.

Push & PR instructions

If you can push from your machine (SSH configured):

```bash
cd madira-web
git push -u origin staging-for-pr
gh pr create --fill
```

Or, use HTTPS remote if SSH not available (replace owner/repo):

```bash
cd madira-web
git remote set-url origin https://github.com/<owner>/<repo>.git
git push -u origin staging-for-pr
gh pr create --fill
```

If you want I can format a PR description for the `gh pr create` body or make additional changes before you push.
