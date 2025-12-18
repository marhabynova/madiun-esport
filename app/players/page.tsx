import { prisma } from '../../lib/prisma'
import ListStates from '../components/ListStates'

export default async function Page() {
    const players = await prisma.player?.findMany?.({ take: 20, orderBy: { createdAt: 'desc' } }) || []

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Players</h1>
            <ListStates items={players} emptyMessage="No players">
                <ul className="space-y-3">
                    {players.map((p: any) => (
                        <li key={p.id} className="p-3 border rounded bg-white">
                            <div className="font-medium">{p.name}</div>
                        </li>
                    ))}
                </ul>
            </ListStates>
        </main>
    )
}
