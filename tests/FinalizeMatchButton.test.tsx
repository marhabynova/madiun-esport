/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('../app/hooks/useSSE', () => ({
    __esModule: true,
    default: () => ({ connected: true, source: null }),
}))

import FinalizeMatchButton from '../app/components/FinalizeMatchButton'

describe('FinalizeMatchButton', () => {
    beforeEach(() => {
        jest.resetAllMocks()
            // clear fetch mocks
            ; (global as unknown as { fetch?: jest.Mock }).fetch = jest.fn()
        // simple localStorage mock for node testEnvironment
        const store: Record<string, string> = {}
            ; (global as unknown as { localStorage?: Record<string, unknown> }).localStorage = {
                getItem: jest.fn((k: string) => store[k] ?? null),
                setItem: jest.fn((k: string, v: string) => (store[k] = v)),
            }
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('finalizes match via POST and shows finalized message', async () => {
        ; (global as unknown as { fetch?: jest.Mock }).fetch = jest.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) // finalize
            .mockResolvedValueOnce({ ok: false }) // poll

        render(<FinalizeMatchButton matchId="m1" initialStatus="PENDING" />)

        // open confirm modal
        fireEvent.click(screen.getByRole('button', { name: /Finalize Match/i }))
        // confirm
        fireEvent.click(screen.getByRole('button', { name: /Confirm/i }))

        await waitFor(() => expect((global as unknown as { fetch?: jest.Mock }).fetch).toHaveBeenCalled())
        expect(await screen.findByText(/Finalized|Match finalized/)).toBeInTheDocument()
    })
})
