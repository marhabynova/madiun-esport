import { validateStatsForMatch, recalcAggregatesForTournament } from '../services/match/helpers'
import type { PrismaClient } from '@prisma/client'

describe('helpers', () => {
    test('validateStatsForMatch returns false if match not found', async () => {
        const fakePrisma = {
            match: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
        } as unknown as PrismaClient
        const res = await validateStatsForMatch('nope', fakePrisma)
        expect(res).toBe(false)
    })

    test('validateStatsForMatch returns false if scores missing', async () => {
        const fakePrisma = {
            match: { findUnique: jest.fn().mockResolvedValue({ id: '1', scoreA: null, scoreB: null }) },
        } as unknown as PrismaClient
        const res = await validateStatsForMatch('1', fakePrisma)
        expect(res).toBe(false)
    })

    test('recalcAggregatesForTournament upserts leaderboardAggregate', async () => {
        const matches = [
            { scoreA: 2, scoreB: 1 },
            { scoreA: 3, scoreB: 0 },
        ]
        const fakePrisma = {
            match: { findMany: jest.fn().mockResolvedValue(matches) },
            leaderboardAggregate: {
                upsert: jest.fn().mockResolvedValue(true),
            },
        } as unknown as PrismaClient

        await recalcAggregatesForTournament(fakePrisma, 't1')

        expect((fakePrisma as unknown as { match: { findMany: jest.Mock } }).match.findMany).toHaveBeenCalledWith({ where: { tournamentId: 't1', status: 'COMPLETED' } })
        expect((fakePrisma as unknown as { leaderboardAggregate: { upsert: jest.Mock } }).leaderboardAggregate.upsert).toHaveBeenCalled()
    })
})
