import { prisma } from '../../lib/prisma'
import ListStates from '../components/ListStates'

export default async function Page() {
    const teams = await prisma.team?.findMany?.({ take: 20, orderBy: { createdAt: 'desc' } }) || []

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Teams</h1>
            <ListStates items={teams} emptyMessage="No teams">
                <ul className="space-y-3">
                    {teams.map((t: any) => (
                        <li key={t.id} className="p-3 border rounded bg-white">
                            <div className="font-medium">{t.name}</div>
                        </li>
                    ))}
                </ul>
            </ListStates>
        </main>
    )
}
