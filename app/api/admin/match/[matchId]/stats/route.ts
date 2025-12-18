import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

export async function POST(req: Request, { params }: { params: { matchId: string } }) {
    try {
        const body = await req.json()
        // Do not calculate aggregates in UI — persist submission as AuditLog for service layer to pick up
        await prisma.auditLog.create({
            data: {
                action: 'SUBMIT_STATS',
                entityType: 'MATCH',
                entityId: params.matchId,
                meta: body,
            },
        })
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('submit-stats failed', err)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
