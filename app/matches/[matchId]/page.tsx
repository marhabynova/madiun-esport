import React from 'react'
import prisma from '../../../lib/prisma'
import FinalizeMatchButton from '../../components/FinalizeMatchButton'

export default async function MatchPage({ params }: { params: { matchId: string } }) {
    const match = await prisma.match.findUnique({ where: { id: params.matchId } })
    if (!match) return <div>Match not found</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Match: {match.slug}</h1>
            <p>Status: {match.status}</p>
            <p>Scheduled: {match.scheduledAt?.toString() ?? 'TBD'}</p>
            <div className="mt-4">
                <h2 className="text-xl">Score</h2>
                <p>{match.scoreA ?? '-'} : {match.scoreB ?? '-'}</p>
            </div>
            <div className="mt-6">
                <FinalizeMatchButton matchId={match.id} initialStatus={match.status} />
            </div>
        </div>
    )
}
