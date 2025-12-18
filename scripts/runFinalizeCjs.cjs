/* eslint-disable @typescript-eslint/no-require-imports */
#!/usr/bin / env node
/* Simple CommonJS script to exercise finalize logic using @prisma/client
    This duplicates the minimal finalize steps so it can run without ts-node. */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function recalcAggregatesForTournament(tx, tournamentId) {
    const matches = await tx.match.findMany({ where: { tournamentId, status: 'COMPLETED' } })
    const totalMatches = matches.length
    const totals = matches.reduce((acc, m) => {
        acc.scoreA += m.scoreA || 0
        acc.scoreB += m.scoreB || 0
        return acc
    }, { scoreA: 0, scoreB: 0 })

    const payload = { totalMatches, totals }

    await tx.leaderboardAggregate.upsert({
        where: { tournamentId },
        create: { tournamentId, payload },
        update: { payload },
    })
}

async function finalize(matchId, actorId, reason) {
    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (!match) {
        console.error('Match not found')
        process.exit(2)
    }
    if (match.status === 'COMPLETED') {
        console.error('Match already completed')
        process.exit(3)
    }

    // Basic validation: require scores or presence of stat records
    const hasScores = match.scoreA != null && match.scoreB != null
    let foundStatRecords = false
    try {
        const p = prisma
        const models = ['matchPlayerStats', 'matchTeamStats', 'matchExtra']
        for (const name of models) {
            if (p[name] && typeof p[name].findMany === 'function') {
                const recs = await p[name].findMany({ where: { matchId } })
                if (Array.isArray(recs) && recs.length > 0) {
                    foundStatRecords = true
                    break
                }
            }
        }
    } catch {
        // ignore
    }

    if (!hasScores && !foundStatRecords) {
        console.error('Validation failed: missing scores or stat records')
        process.exit(4)
    }

    await prisma.$transaction(async (tx) => {
        await tx.revision.create({ data: { entityType: 'MATCH', entityId: match.id, payload: match, actorId: actorId || null, reason: reason || null } })
        await tx.auditLog.create({ data: { action: 'FINALIZE_MATCH', entityType: 'MATCH', entityId: match.id, actorId: actorId || null, meta: { before: match, reason: reason || null } } })
        await tx.match.update({ where: { id: matchId }, data: { status: 'COMPLETED' } })
        await recalcAggregatesForTournament(tx, match.tournamentId)
    })

    console.log('Finalize completed for', matchId)
}

if (require.main === module) {
    const matchId = process.argv[2]
    if (!matchId) {
        console.error('Usage: node scripts/runFinalizeCjs.cjs <matchId> [actorId] [reason]')
        process.exit(1)
    }
    const actorId = process.argv[3]
    const reason = process.argv[4]

    finalize(matchId, actorId, reason)
        .then(() => prisma.$disconnect())
        .catch((e) => { console.error(e); prisma.$disconnect().finally(() => process.exit(1)) })
}
