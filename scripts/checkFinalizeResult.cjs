#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const matchId = process.argv[2]
    if (!matchId) {
        console.error('Usage: node scripts/checkFinalizeResult.cjs <matchId>')
        process.exit(1)
    }
    try {
        const match = await prisma.match.findUnique({ where: { id: matchId } })
        const revision = await prisma.revision.findFirst({ where: { entityId: matchId } })
        const audit = await prisma.auditLog.findFirst({ where: { entityId: matchId } })
        const aggregate = await prisma.leaderboardAggregate.findUnique({ where: { tournamentId: match.tournamentId } })

        console.log('match.status =', match ? match.status : 'NOT FOUND')
        console.log('revision exists =', !!revision)
        console.log('audit exists =', !!audit)
        console.log('aggregate exists =', !!aggregate)
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

if (require.main === module) main()
