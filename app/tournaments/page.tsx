import { prisma } from '../../lib/prisma'
import ListStates from '../components/ListStates'

export default async function Page() {
    const tournaments = await prisma.tournament.findMany({ take: 20, orderBy: { createdAt: 'desc' } })

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Tournaments</h1>
            <ListStates items={tournaments} emptyMessage="No tournaments">
                <ul className="space-y-3">
                    {tournaments.map((t: any) => (
                        <li key={t.id} className="p-3 border rounded bg-white">
                            <div className="font-medium">{t.name}</div>
                            <div className="text-sm text-zinc-500">Status: {t.status}</div>
                        </li>
                    ))}
                </ul>
            </ListStates>
        </main>
    )
}
