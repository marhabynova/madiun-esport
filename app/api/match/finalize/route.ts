import { NextResponse } from 'next/server'
import { finalizeMatch } from '../../../../services/match/finalizeMatch.service'
import { AppError } from '../../../../lib/errors'

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
    } catch (err: any) {
        // Map known AppError shapes (statusCode) to HTTP responses
        if (err && typeof err.statusCode === 'number') {
            const status = err.statusCode
            const message = err.message || 'Error'
            return NextResponse.json({ error: message }, { status })
        }

        // Handle common Prisma 'not found' error code
        if (err && err.code === 'P2025') {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
        }

        // Fallback
        const msg = (err && err.message) || 'Internal server error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
