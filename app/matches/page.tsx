import { prisma } from '../../lib/prisma'
import ListStates from '../components/ListStates'

export default async function Page() {
    const matches = await prisma.match.findMany({ take: 20, orderBy: { createdAt: 'desc' } })

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Matches</h1>
            <ListStates items={matches} emptyMessage="No matches found">
                <ul className="space-y-3">
                    {matches.map((m: any) => (
                        <li key={m.id} className="p-3 border rounded bg-white">
                            <div className="font-medium">{m.name ?? `Match ${m.id}`}</div>
                            <div className="text-sm text-zinc-500">Status: {m.status}</div>
                        </li>
                    ))}
                </ul>
            </ListStates>
        </main>
    )
}
