# CHANGELOG — madira-web

## Unreleased

- `services/events/sseAdapter.ts` — emit SSE now sends both named events and default `data` messages that include `type`, improving compatibility with clients that only handle `onmessage`.
- `app/hooks/useSSE.tsx` — expose `source` (EventSource) so components can register named event listeners.
- `app/components/FinalizeMatchButton.tsx` — register named (`match.finalized`) and default (`message`) SSE listeners; improved API response parsing and error handling; small accessibility/UX improvements.

All changes are tested locally; run `pnpm test` in the `madira-web` folder to verify.
