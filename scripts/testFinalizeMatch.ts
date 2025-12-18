
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { finalizeMatch } from '../services/match/finalizeMatch.service'

const prisma = new PrismaClient({ errorFormat: 'pretty', __internal: { engine: { type: 'library' } } } as any)

async function main() {
    // Ensure at least one game exists
    let game = await prisma.game.findFirst()
    if (!game) {
        game = await prisma.game.create({ data: { key: 'mlbb', name: 'MLBB' } })
    }

    // Create tournament
    const tournament = await prisma.tournament.create({
        data: { slug: `test-tourn-${Date.now()}`, name: 'Test Tourn', status: 'ONGOING', gameId: game.id },
    })

    // Create match with scores
    const match = await prisma.match.create({
        data: {
            slug: `test-match-${Date.now()}`,
            stageId: 'stage-1',
            tournamentId: tournament.id,
            status: 'SCHEDULED',
            scoreA: 2,
            scoreB: 1,
        },
    })

    console.log('Created match', match.id)

    // Call finalizeMatch
    await finalizeMatch(match.id, 'test-actor', 'integration test finalize')
    console.log('finalizeMatch completed')

    // Inspect created Revision / AuditLog / LeaderboardAggregate
    const revision = await prisma.revision.findFirst({ where: { entityId: match.id } })
    const audit = await prisma.auditLog.findFirst({ where: { entityId: match.id } })
    const aggregate = await prisma.leaderboardAggregate.findUnique({ where: { tournamentId: tournament.id } })

    console.log('Revision:', !!revision)
    console.log('Audit:', !!audit)
    console.log('Aggregate:', !!aggregate)

    // Cleanup created test data
    await prisma.revision.deleteMany({ where: { entityId: match.id } })
    await prisma.auditLog.deleteMany({ where: { entityId: match.id } })
    await prisma.leaderboardAggregate.deleteMany({ where: { tournamentId: tournament.id } })
    await prisma.match.delete({ where: { id: match.id } })
    await prisma.tournament.delete({ where: { id: tournament.id } })

    console.log('Cleanup done')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
