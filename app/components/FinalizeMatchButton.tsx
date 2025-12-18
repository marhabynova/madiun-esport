"use client"
import React, { useCallback, useEffect, useState } from 'react'
import useSSE from '../hooks/useSSE'
import ConfirmModal from './ConfirmModal'

export default function FinalizeMatchButton({ matchId, initialStatus }: { matchId: string; initialStatus: string }) {
    const [status, setStatus] = useState(initialStatus)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const onMessage = useCallback((data: any) => {
        if (!data) return
        if (data.type === 'match.finalized' && data.matchId === matchId) {
            setStatus('COMPLETED')
            setMessage('Match finalized')
        }
    }, [matchId])

    const sse = useSSE('/api/events/sse', onMessage)

    useEffect(() => {
        if (sse.connected) setMessage('Live connected')
    }, [sse.connected])

    // Register named event listener in addition to default onmessage handler.
    useEffect(() => {
        if (!sse.source) return
        const handler = (ev: MessageEvent) => {
            try {
                const data = JSON.parse(ev.data)
                onMessage?.(data)
            } catch (e) {
                onMessage?.(ev.data)
            }
        }

        // listen to specific domain event
        sse.source.addEventListener('match.finalized', handler as EventListener)
        // keep default message listener as well
        sse.source.addEventListener('message', handler as EventListener)

        return () => {
            try {
                sse.source?.removeEventListener('match.finalized', handler as EventListener)
                sse.source?.removeEventListener('message', handler as EventListener)
            } catch (e) {
                // ignore cleanup errors
            }
        }
    }, [sse.source, onMessage])

    const [confirmOpen, setConfirmOpen] = useState(false)

    const doFinalize = async () => {
        setConfirmOpen(false)
        setLoading(true)
        setMessage(null)
        try {
            const actorId = typeof window !== 'undefined' ? localStorage.getItem('actorId') : null
            const headers: any = { 'Content-Type': 'application/json' }
            if (actorId) headers['x-actor-id'] = actorId
            // if FINALIZE_AUTH_TOKEN present, client can put it in localStorage as 'finalizeToken'
            const token = typeof window !== 'undefined' ? localStorage.getItem('finalizeToken') : null
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/match/finalize', {
                method: 'POST',
                headers,
                body: JSON.stringify({ matchId }),
            })

            // Try to parse JSON error body safely
            let json: any = null
            try {
                json = await res.json()
            } catch (e) {
                // ignore non-json response
            }

            if (!res.ok) {
                const errMsg = (json && (json.error || json.message)) || `Request failed (${res.status})`
                throw new Error(errMsg)
            }

            // success
            setStatus('COMPLETED')
            setMessage('Finalized')
        } catch (err: any) {
            setMessage(err?.message || 'Error')
        } finally {
            setLoading(false)
        }
    }

    // Polling fallback: if SSE not connected, poll status endpoint until completed
    useEffect(() => {
        if (status === 'COMPLETED') return
        if (sse.connected) return

        let mounted = true
        let intervalId: number | null = null
        const poll = async () => {
            try {
                const res = await fetch(`/api/match/${matchId}/status`)
                if (!mounted) return
                if (!res.ok) return
                const json = await res.json()
                const m = json?.match
                if (m && m.status === 'COMPLETED') {
                    setStatus('COMPLETED')
                    setMessage('Match finalized (polled)')
                    if (intervalId) {
                        clearInterval(intervalId)
                        intervalId = null
                    }
                }
            } catch (e) {
                // ignore network errors; will retry
            }
        }

        // initial poll then interval
        poll()
        intervalId = window.setInterval(poll, 5000)

        return () => {
            mounted = false
            if (intervalId) clearInterval(intervalId)
        }
    }, [sse.connected, matchId, status])

    return (
        <div>
            <div className="flex items-center gap-3">
                <div>Status: <strong>{status}</strong></div>
                <button
                    className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                    onClick={() => setConfirmOpen(true)}
                    disabled={loading || status === 'COMPLETED'}
                >
                    {loading ? 'Finalizing...' : 'Finalize Match'}
                </button>
            </div>
            {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
            <ConfirmModal
                open={confirmOpen}
                title="Confirm Finalize"
                message="Are you sure you want to finalize this match? This action is irreversible."
                onConfirm={doFinalize}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    )
}
