import { NextResponse } from 'next/server'

const SAMPLE: any[] = [
    { key: 'kills', label: 'Kills', type: 'number', required: true },
    { key: 'deaths', label: 'Deaths', type: 'number', required: true },
    { key: 'assists', label: 'Assists', type: 'number' },
    { key: 'mvp', label: 'MVP', type: 'boolean' },
]

export async function GET() {
    return NextResponse.json(SAMPLE)
}
