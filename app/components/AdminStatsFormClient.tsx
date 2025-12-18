"use client"
import React, { useState } from 'react'
import StatsForm, { StatDefinition } from './StatsForm'

export default function AdminStatsFormClient({ stats, matchId }: { stats: StatDefinition[]; matchId: string }) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle')

    async function handleSubmit(values: Record<string, unknown>) {
        setStatus('submitting')
        try {
            const res = await fetch(`/api/admin/match/${matchId}/stats`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(values),
            })
            if (res.ok) setStatus('submitted')
            else setStatus('error')
        } catch {
            setStatus('error')
        }
    }

    return (
        <div>
            <StatsForm stats={stats} onSubmit={handleSubmit} />
            <div className="mt-2 text-sm text-zinc-600">Status: {status}</div>
        </div>
    )
}
