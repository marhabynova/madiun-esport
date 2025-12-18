import { validateStatsForMatch, recalcAggregatesForTournament } from '../services/match/helpers'

describe('helpers', () => {
    test('validateStatsForMatch returns false if match not found', async () => {
        const fakePrisma: any = {
            match: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
        }
        const res = await validateStatsForMatch('nope', fakePrisma)
        expect(res).toBe(false)
    })

    test('validateStatsForMatch returns false if scores missing', async () => {
        const fakePrisma: any = {
            match: { findUnique: jest.fn().mockResolvedValue({ id: '1', scoreA: null, scoreB: null }) },
        }
        const res = await validateStatsForMatch('1', fakePrisma)
        expect(res).toBe(false)
    })

    test('recalcAggregatesForTournament upserts leaderboardAggregate', async () => {
        const matches = [
            { scoreA: 2, scoreB: 1 },
            { scoreA: 3, scoreB: 0 },
        ]
        const fakePrisma: any = {
            match: { findMany: jest.fn().mockResolvedValue(matches) },
            leaderboardAggregate: {
                upsert: jest.fn().mockResolvedValue(true),
            },
        }

        await recalcAggregatesForTournament(fakePrisma, 't1')

        expect(fakePrisma.match.findMany).toHaveBeenCalledWith({ where: { tournamentId: 't1', status: 'COMPLETED' } })
        expect(fakePrisma.leaderboardAggregate.upsert).toHaveBeenCalled()
    })
})
