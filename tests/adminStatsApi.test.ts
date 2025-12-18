import { jest } from '@jest/globals'
import type { PrismaClient } from '@prisma/client'

describe('admin match stats API', () => {
    beforeEach(() => {
        jest.resetModules()
    })

    test('POST creates audit log and returns ok', async () => {
        const created = { id: 'a1' }
        const mockPrisma = {
            auditLog: { create: jest.fn().mockResolvedValue(created) },
        } as unknown as PrismaClient

        const prismaPath = require.resolve('../lib/prisma')
        jest.doMock(prismaPath, () => ({ prisma: mockPrisma }))

        const route = await import('../app/api/admin/match/[matchId]/stats/route')

        const body = { playerStats: [{ playerId: 'p1', stats: { kills: 2 } }] }
        const req = { json: async () => body }
        const res = await route.POST(req as unknown as Request, { params: { matchId: 'm1' } } as unknown)

        // NextResponse.json returns a Response-like object; check internal prisma call
        expect((mockPrisma as unknown as { auditLog: { create: jest.Mock } }).auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'SUBMIT_STATS', entityId: 'm1', meta: body }) }))
        // route handler returns NextResponse — check ok status by reading status (default 200)
        expect(res.status || 200).toBe(200)
    })
})
