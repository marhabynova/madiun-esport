import { finalizeMatch } from '../../services/match/finalizeMatch.service'
import prisma from '../../lib/prisma'

jest.setTimeout(20000)

describe('finalizeMatch integration', () => {
    test('finalizeMatch creates revision, audit and leaderboard aggregate', async () => {
        // ensure game
        let game = await prisma.game.findFirst()
        if (!game) {
            game = await prisma.game.create({ data: { key: 'mlbb', name: 'MLBB' } })
        }

        const tournament = await prisma.tournament.create({
            data: { slug: `int-t-${Date.now()}`, name: 'Int Tourn', status: 'ONGOING', gameId: game.id },
        })

        const match = await prisma.match.create({
            data: {
                slug: `int-m-${Date.now()}`,
                stageId: 'stage-1',
                tournamentId: tournament.id,
                status: 'SCHEDULED',
                scoreA: 2,
                scoreB: 1,
            },
        })

        await finalizeMatch(match.id, 'integration-actor', 'integration test')

        const revision = await prisma.revision.findFirst({ where: { entityId: match.id } })
        const audit = await prisma.auditLog.findFirst({ where: { entityId: match.id } })
        const aggregate = await prisma.leaderboardAggregate.findUnique({ where: { tournamentId: tournament.id } })

        expect(revision).toBeTruthy()
        expect(audit).toBeTruthy()
        expect(aggregate).toBeTruthy()

        // cleanup
        await prisma.revision.deleteMany({ where: { entityId: match.id } })
        await prisma.auditLog.deleteMany({ where: { entityId: match.id } })
        await prisma.leaderboardAggregate.deleteMany({ where: { tournamentId: tournament.id } })
        await prisma.match.delete({ where: { id: match.id } })
        await prisma.tournament.delete({ where: { id: tournament.id } })
    })
})
