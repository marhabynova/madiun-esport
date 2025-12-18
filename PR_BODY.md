# PR Draft: SSE compatibility and Finalize flow improvements

## Summary

This branch (`staging-for-pr`) contains fixes and improvements related to match finalization and SSE event delivery:

- services/events/sseAdapter.ts: emit both named SSE events and a default `data` message with `type` for compatibility.
- app/hooks/useSSE.tsx: expose `source` (EventSource) so components can register named event listeners.
- app/components/FinalizeMatchButton.tsx: register named (`match.finalized`) and default (`message`) SSE listeners, improved API response parsing, error handling, and polling fallback when SSE is disconnected.
- app/api/match/[matchId]/status/route.ts: new GET endpoint for polling match status.
- tests updated/added for routes and behavior. All tests pass locally.

## Files changed (high-level)

- services/events/sseAdapter.ts
- app/hooks/useSSE.tsx
- app/components/FinalizeMatchButton.tsx
- app/api/match/[matchId]/status/route.ts
- tests/api/finalize.route.test.ts
- madira-web/CHANGELOG.md

## Testing

Run locally from `madira-web`:

```bash
pnpm install
pnpm test
```

Manual verification:

```bash
# ensure DATABASE_URL in madira-web/.env if needed
cd madira-web
pnpm dev
# open http://localhost:3000, navigate to a match page, try finalize
```

## Notes for reviewer

- All business logic remains in `services/` following project rules.
- The SSE adapter and service emitters are defensive; failures in event delivery do not block finalize flows.

## Push / PR instructions

If you have SSH access configured:

```bash
cd madira-web
git push -u origin staging-for-pr
gh pr create --fill
```

If SSH is not available, use HTTPS remote (replace owner/repo):

```bash
cd madira-web
git remote set-url origin https://github.com/<owner>/<repo>.git
git push -u origin staging-for-pr
gh pr create --fill
```

If you prefer, run the push commands and I will help prepare PR description or address reviewer feedback.
