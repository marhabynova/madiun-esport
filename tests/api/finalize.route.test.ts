import { AppError } from '../../lib/errors'

// Mock NextResponse from next/server to a simple shape for tests
jest.mock('next/server', () => ({
    NextResponse: {
        json: (body: unknown, init: unknown) => ({ body, status: (init as unknown as Record<string, unknown>)?.status as number ?? 200 }),
    },
}))

// mock the finalizeMatch service used by the route
jest.mock('../../services/match/finalizeMatch.service', () => ({
    finalizeMatch: jest.fn(),
}))

import { POST } from '../../app/api/match/finalize/route'
import { GET as GET_STATUS } from '../../app/api/match/[matchId]/status/route'
import { finalizeMatch } from '../../services/match/finalizeMatch.service'

describe('API route: POST /api/match/finalize', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('returns 400 when missing matchId', async () => {
        const req = { json: async () => ({}) }
        const res = await POST(req as unknown as Request)
        expect(res.status).toBe(400)
        expect((res as unknown as { body: Record<string, unknown> }).body).toHaveProperty('error')
    })

    test('maps AppError.NotFound to 404', async () => {
        ; (finalizeMatch as jest.Mock).mockRejectedValue(new AppError.NotFound('no match'))
        const req = { json: async () => ({ matchId: 'not-exists' }) }
        const res = await POST(req as unknown as Request)
        expect(res.status).toBe(404)
        expect((res as unknown as { body: Record<string, unknown> }).body).toHaveProperty('error', 'no match')
    })

    it('status endpoint returns not found for unknown match', async () => {
        const res = await GET_STATUS(new Request('https://example.test'), { params: { matchId: 'nope' } } as unknown)
        const json = await (res as unknown as { json: () => Promise<Record<string, unknown>> }).json()
        expect(res.status).toBe(404)
        expect(json.error).toBeDefined()
    })

    test('maps AppError.Validation to 400', async () => {
        ; (finalizeMatch as jest.Mock).mockRejectedValue(new AppError.Validation('bad stats'))
        const req = { json: async () => ({ matchId: 'some-id' }) }
        const res = await POST(req as unknown as Request)
        expect(res.status).toBe(400)
        expect((res as unknown as { body: Record<string, unknown> }).body).toHaveProperty('error', 'bad stats')
    })

    test('returns 200 and ok on success', async () => {
        ; (finalizeMatch as jest.Mock).mockResolvedValue(undefined)
        const req = { json: async () => ({ matchId: 'some-id' }) }
        const res = await POST(req as unknown as Request)
        expect(res.status).toBe(200)
        expect((res as unknown as { body: Record<string, unknown> }).body).toHaveProperty('ok', true)
    })
})
