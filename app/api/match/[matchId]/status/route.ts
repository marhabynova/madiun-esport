import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function GET(request: Request, { params }: { params: { matchId: string } }) {
    try {
        const { matchId } = params
        if (!matchId) return NextResponse.json({ error: 'matchId is required' }, { status: 400 })

        const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true, status: true, updatedAt: true } })
        if (!match) {
            const r = NextResponse.json({ error: 'Match not found' }, { status: 404 }) as any
            if (typeof r.json !== 'function') r.json = async () => r.body
            return r
        }

        const res = NextResponse.json({ ok: true, match }) as any
        if (typeof res.json !== 'function') res.json = async () => res.body
        return res
    } catch (err: any) {
        const msg = err?.message || 'Internal server error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
