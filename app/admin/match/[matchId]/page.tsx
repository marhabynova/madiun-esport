import AdminStatsFormClient from '../../../../components/AdminStatsFormClient'
import type { StatDefinition } from '../../../../components/StatsForm'
import { prisma } from '../../../../lib/prisma'

type Props = { params: { matchId: string } }

export default async function Page({ params }: Props) {
    // For now, fetch stat definitions from our API-like source (could be real DB later)
    // Keep server-side: UI must not compute business logic.
    const statDefs: StatDefinition[] = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/stat-definitions`).then(r => r.json()).catch(() => [])

    // Minimal match check (server-side)
    const match = await prisma.match.findUnique({ where: { id: params.matchId } })

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Input Stats for Match</h1>
            {!match ? (
                <div className="text-red-600">Match not found</div>
            ) : (
                <div>
                    <div className="mb-4 text-sm text-zinc-600">Match: {match.slug ?? match.id} — Status: {match.status}</div>
                    <AdminStatsFormClient stats={statDefs} matchId={params.matchId} />
                </div>
            )}
        </main>
    )
}
