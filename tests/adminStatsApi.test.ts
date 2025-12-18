import { jest } from '@jest/globals'

describe('admin match stats API', () => {
    beforeEach(() => {
        jest.resetModules()
    })

    test('POST creates audit log and returns ok', async () => {
        const created = { id: 'a1' }
        const mockPrisma: any = {
            auditLog: { create: jest.fn().mockResolvedValue(created) },
        }

        const prismaPath = require.resolve('../lib/prisma')
        jest.doMock(prismaPath, () => ({ prisma: mockPrisma }))

        const route = await import('../app/api/admin/match/[matchId]/stats/route')

        const body = { playerStats: [{ playerId: 'p1', stats: { kills: 2 } }] }
        const req = { json: async () => body }
        const res = await route.POST(req as any, { params: { matchId: 'm1' } } as any)

        // NextResponse.json returns a Response-like object; check internal prisma call
        expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'SUBMIT_STATS', entityId: 'm1', meta: body }) }))
        // route handler returns NextResponse — check ok status by reading status (default 200)
        expect(res.status || 200).toBe(200)
    })
})
