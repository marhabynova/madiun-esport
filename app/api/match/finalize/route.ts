import { NextResponse } from 'next/server'
import { finalizeMatch } from '../../../../services/match/finalizeMatch.service'
// AppError is available for tests; avoid unused import in runtime handler
// (keep import commented for now to satisfy docs/tests when needed)
// import { AppError } from '../../../../lib/errors'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { matchId, actorId: bodyActorId, reason } = body || {}
        if (!matchId) return NextResponse.json({ error: 'matchId is required' }, { status: 400 })

        // optional actor header (used for auth / audit). Client may set `x-actor-id` header.
        const headerActor = request.headers && typeof request.headers.get === 'function' ? request.headers.get('x-actor-id') || undefined : undefined
        const actorId = bodyActorId || headerActor

        // Optional enforcement: if FINALIZE_AUTH_TOKEN is set, require Authorization header or actorId
        const finalizeToken = process.env.FINALIZE_AUTH_TOKEN
        if (finalizeToken) {
            const authHeader = request.headers && typeof request.headers.get === 'function' ? request.headers.get('authorization') : null
            const hasValidToken = authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === finalizeToken
            if (!hasValidToken && !actorId) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
            }
        }

        await finalizeMatch(matchId, actorId, reason)
        return NextResponse.json({ ok: true })
    } catch (err: unknown) {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>
            if (typeof e.statusCode === 'number') {
                const status = e.statusCode
                const message = typeof e.message === 'string' ? e.message : 'Error'
                return NextResponse.json({ error: message }, { status })
            }

            if (e.code === 'P2025') {
                return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
            }

            if (typeof e.message === 'string') {
                return NextResponse.json({ error: e.message }, { status: 500 })
            }
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
