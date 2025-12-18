/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv/config')
const prisma = require('../lib/prisma')

async function main() {
    console.log('Scanning for SUBMIT_STATS audit logs...')

    const submits = await prisma.auditLog.findMany({ where: { action: 'SUBMIT_STATS' } })

    for (const s of submits) {
        const already = await prisma.auditLog.findFirst({ where: { action: 'PROCESS_STAT_SUBMISSION', AND: { meta: { path: ['originalAuditId'], equals: s.id } } } }).catch(() => null)
        if (already) {
            continue
        }

        // create a revision representing the submitted stats for the match
        try {
            await prisma.revision.create({
                data: {
                    entityType: 'MATCH_STATS',
                    entityId: s.entityId,
                    payload: s.meta,
                    actorId: null,
                    reason: 'processed from audit log SUBMIT_STATS',
                },
            })

            // If the project has stat models, persist submitted stats into them.
            // Expecting s.meta to possibly contain { playerStats: [{ playerId, stats }], teamStats: [{ teamId, stats }], extra: {...} }
            try {
                if (prisma.matchPlayerStats && Array.isArray(s.meta?.playerStats)) {
                    for (const ps of s.meta.playerStats) {
                        await prisma.matchPlayerStats.create({ data: { matchId: s.entityId, playerId: ps.playerId, stats: ps.stats } })
                    }
                }
                if (prisma.matchTeamStats && Array.isArray(s.meta?.teamStats)) {
                    for (const ts of s.meta.teamStats) {
                        await prisma.matchTeamStats.create({ data: { matchId: s.entityId, teamId: ts.teamId, stats: ts.stats } })
                    }
                }
                if (prisma.matchExtra && s.meta?.extra) {
                    await prisma.matchExtra.create({ data: { matchId: s.entityId, payload: s.meta.extra } })
                }
            } catch (err) {
                console.error('Failed to persist detailed stats for', s.id, err)
            }

            await prisma.auditLog.create({
                data: {
                    action: 'PROCESS_STAT_SUBMISSION',
                    entityType: 'MATCH',
                    entityId: s.entityId,
                    meta: { originalAuditId: s.id },
                },
            })

            console.log('Processed submission', s.id)
        } catch (err) {
            console.error('Failed to process', s.id, err)
        }
    }

    console.log('Done')
}

module.exports = { main }

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err)
            process.exit(1)
        })
}
