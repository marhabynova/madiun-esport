import { jest } from '@jest/globals'
import type { PrismaClient } from '@prisma/client'

describe('processAuditSubmissions', () => {
    beforeEach(() => {
        jest.resetModules()
    })

    test('no submissions -> nothing persisted', async () => {
        const mockPrisma = {
            auditLog: { findMany: jest.fn().mockResolvedValue([]) },
            revision: { create: jest.fn() },
        } as unknown as PrismaClient

        // mock the prisma module used by the script
        const prismaPath = require.resolve('../lib/prisma')
        jest.doMock(prismaPath, () => mockPrisma)

        const { main } = await import('../scripts/processAuditSubmissions.cjs')
        await main()

        expect((mockPrisma as unknown as { auditLog: { findMany: jest.Mock } }).auditLog.findMany).toHaveBeenCalled()
        expect((mockPrisma as unknown as { revision: { create: jest.Mock } }).revision.create).not.toHaveBeenCalled()
    })

    test('process one submission -> create revision, persist stats, mark processed', async () => {
        const submit = { id: 's1', entityId: 'm1', meta: { playerStats: [{ playerId: 'p1', stats: { kills: 3 } }], teamStats: [{ teamId: 't1', stats: { score: 10 } }], extra: { notes: 'ok' } } }

        const mockPrisma = {
            auditLog: {
                findMany: jest.fn().mockResolvedValue([submit]),
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(true),
            },
            revision: { create: jest.fn().mockResolvedValue(true) },
            matchPlayerStats: { create: jest.fn().mockResolvedValue(true) },
            matchTeamStats: { create: jest.fn().mockResolvedValue(true) },
            matchExtra: { create: jest.fn().mockResolvedValue(true) },
        } as unknown as PrismaClient

        const prismaPath = require.resolve('../lib/prisma')
        jest.doMock(prismaPath, () => mockPrisma)

        const { main } = await import('../scripts/processAuditSubmissions.cjs')
        await main()

        expect((mockPrisma as unknown as { revision: { create: jest.Mock } }).revision.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ entityId: 'm1' }) }))
        expect((mockPrisma as unknown as { matchPlayerStats: { create: jest.Mock } }).matchPlayerStats.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ matchId: 'm1', playerId: 'p1' }) }))
        expect((mockPrisma as unknown as { matchTeamStats: { create: jest.Mock } }).matchTeamStats.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ matchId: 'm1', teamId: 't1' }) }))
        expect((mockPrisma as unknown as { matchExtra: { create: jest.Mock } }).matchExtra.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ matchId: 'm1' }) }))
        expect((mockPrisma as unknown as { auditLog: { create: jest.Mock } }).auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'PROCESS_STAT_SUBMISSION', entityId: 'm1' }) }))
    })
})
