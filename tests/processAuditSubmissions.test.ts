import { jest } from '@jest/globals'

describe('processAuditSubmissions', () => {
    beforeEach(() => {
        jest.resetModules()
    })

    test('no submissions -> nothing persisted', async () => {
        const mockPrisma: any = {
            auditLog: { findMany: jest.fn().mockResolvedValue([]) },
            revision: { create: jest.fn() },
        }

        // mock the prisma module used by the script
        const prismaPath = require.resolve('../lib/prisma')
        jest.doMock(prismaPath, () => mockPrisma)

        const { main } = await import('../scripts/processAuditSubmissions.cjs')
        await main()

        expect(mockPrisma.auditLog.findMany).toHaveBeenCalled()
        expect(mockPrisma.revision.create).not.toHaveBeenCalled()
    })

    test('process one submission -> create revision, persist stats, mark processed', async () => {
        const submit = { id: 's1', entityId: 'm1', meta: { playerStats: [{ playerId: 'p1', stats: { kills: 3 } }], teamStats: [{ teamId: 't1', stats: { score: 10 } }], extra: { notes: 'ok' } } }

        const mockPrisma: any = {
            auditLog: {
                findMany: jest.fn().mockResolvedValue([submit]),
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(true),
            },
            revision: { create: jest.fn().mockResolvedValue(true) },
            matchPlayerStats: { create: jest.fn().mockResolvedValue(true) },
            matchTeamStats: { create: jest.fn().mockResolvedValue(true) },
            matchExtra: { create: jest.fn().mockResolvedValue(true) },
        }

        const prismaPath = require.resolve('../lib/prisma')
        jest.doMock(prismaPath, () => mockPrisma)

        const { main } = await import('../scripts/processAuditSubmissions.cjs')
        await main()

        expect(mockPrisma.revision.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ entityId: 'm1' }) }))
        expect(mockPrisma.matchPlayerStats.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ matchId: 'm1', playerId: 'p1' }) }))
        expect(mockPrisma.matchTeamStats.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ matchId: 'm1', teamId: 't1' }) }))
        expect(mockPrisma.matchExtra.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ matchId: 'm1' }) }))
        expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'PROCESS_STAT_SUBMISSION', entityId: 'm1' }) }))
    })
})
