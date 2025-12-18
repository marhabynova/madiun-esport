import { AppError } from '../../lib/errors'

// Mock NextResponse from next/server to a simple shape for tests
jest.mock('next/server', () => ({
    NextResponse: {
        json: (body: any, init: any) => ({ body, status: init?.status ?? 200 }),
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
        const req: any = { json: async () => ({}) }
        const res: any = await POST(req)
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    })

    test('maps AppError.NotFound to 404', async () => {
        ; (finalizeMatch as jest.Mock).mockRejectedValue(new AppError.NotFound('no match'))
        const req: any = { json: async () => ({ matchId: 'not-exists' }) }
        const res: any = await POST(req)
        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty('error', 'no match')
    })

    it('status endpoint returns not found for unknown match', async () => {
        const res = await GET_STATUS(new Request('https://example.test'), { params: { matchId: 'nope' } } as any)
        const json = await res.json()
        expect(res.status).toBe(404)
        expect(json.error).toBeDefined()
    })

    test('maps AppError.Validation to 400', async () => {
        ; (finalizeMatch as jest.Mock).mockRejectedValue(new AppError.Validation('bad stats'))
        const req: any = { json: async () => ({ matchId: 'some-id' }) }
        const res: any = await POST(req)
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', 'bad stats')
    })

    test('returns 200 and ok on success', async () => {
        ; (finalizeMatch as jest.Mock).mockResolvedValue(undefined)
        const req: any = { json: async () => ({ matchId: 'some-id' }) }
        const res: any = await POST(req)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('ok', true)
    })
})
