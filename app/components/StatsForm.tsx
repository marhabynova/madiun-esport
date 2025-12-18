"use client"
import React, { useState } from 'react'

export type StatDefinition = {
    key: string
    label: string
    type: 'number' | 'text' | 'boolean' | 'select'
    required?: boolean
    options?: string[]
}

type Props = {
    stats: StatDefinition[]
    onSubmit?: (values: Record<string, unknown>) => void
}

export default function StatsForm({ stats, onSubmit }: Props) {
    const initial = stats.reduce<Record<string, unknown>>((acc, s) => ({ ...acc, [s.key]: s.type === 'boolean' ? false : '' }), {})
    const [values, setValues] = useState<Record<string, unknown>>(initial)

    function handleChange(key: string, v: unknown) {
        setValues(prev => ({ ...prev, [key]: v }))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (onSubmit) onSubmit(values)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {stats.map(s => {
                const id = `${s.key}-input`
                return (
                    <div key={s.key}>
                        <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1">{s.label}{s.required ? ' *' : ''}</label>
                        {s.type === 'number' && (
                            <input
                                id={id}
                                type="number"
                                value={typeof values[s.key] === 'number' ? (values[s.key] as number) : ''}
                                onChange={e => handleChange(s.key, e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border rounded p-2"
                            />
                        )}
                        {s.type === 'text' && (
                            <input
                                id={id}
                                type="text"
                                value={String(values[s.key] ?? '')}
                                onChange={e => handleChange(s.key, e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        )}
                        {s.type === 'boolean' && (
                            <input id={id} type="checkbox" checked={Boolean(values[s.key])} onChange={e => handleChange(s.key, e.target.checked)} />
                        )}
                        {s.type === 'select' && (
                            <select id={id} value={String(values[s.key] ?? '')} onChange={e => handleChange(s.key, e.target.value)} className="w-full border rounded p-2">
                                <option value="">-- choose --</option>
                                {(s.options || []).map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )
            })}

            <div>
                <button type="submit" className="px-4 py-2 bg-foreground text-background rounded">Submit</button>
            </div>
        </form>
    )
}
