import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function GET(request: Request, { params }: { params: { matchId: string } }) {
    try {
        const { matchId } = params
        if (!matchId) return NextResponse.json({ error: 'matchId is required' }, { status: 400 })

        const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true, status: true, updatedAt: true } })
        if (!match) {
            const r = NextResponse.json({ error: 'Match not found' }, { status: 404 }) as unknown as {
                body: unknown
                status?: number
                json?: () => Promise<unknown>
            }
            if (typeof r.json !== 'function') r.json = async () => r.body
            return r
        }

        const res = NextResponse.json({ ok: true, match }) as unknown as {
            body: unknown
            status?: number
            json?: () => Promise<unknown>
        }
        if (typeof res.json !== 'function') res.json = async () => res.body
        return res
    } catch (err: unknown) {
        let msg = 'Internal server error'
        if (err && typeof err === 'object' && 'message' in err) {
            const maybe = (err as { message?: unknown }).message
            if (typeof maybe === 'string') msg = maybe
        }
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
