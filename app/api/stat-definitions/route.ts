import { NextResponse } from 'next/server'

type StatDefinition = {
    key: string
    label: string
    type: 'number' | 'text' | 'boolean' | 'select'
    required?: boolean
    options?: string[]
}

const SAMPLE: StatDefinition[] = [
    { key: 'kills', label: 'Kills', type: 'number', required: true },
    { key: 'deaths', label: 'Deaths', type: 'number', required: true },
    { key: 'assists', label: 'Assists', type: 'number' },
    { key: 'mvp', label: 'MVP', type: 'boolean' },
]

export async function GET() {
    return NextResponse.json(SAMPLE)
}
