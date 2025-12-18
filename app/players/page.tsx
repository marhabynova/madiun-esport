import { Suspense } from "react";
import { prisma } from '../../lib/prisma';
import ListStates from '../components/ListStates';
import Skeleton from '../components/Skeleton';
import type { Player } from '@prisma/client';

async function PlayersList() {
    let players = [];
    let error = null;
    try {
        players = await prisma.player?.findMany?.({ take: 20, orderBy: { createdAt: 'desc' } }) || [];
    } catch (e) {
        error = 'Failed to load players';
    }
    return (
        <ListStates isError={error} items={players} emptyMessage="No players">
            <ul className="space-y-3">
                {players.map((p: Player) => (
                    <li key={p.id} className="p-3 border rounded bg-white">
                        <div className="font-medium">{p.name}</div>
                    </li>
                ))}
            </ul>
        </ListStates>
    );
}

export default function Page() {
    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Players</h1>
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <PlayersList />
            </Suspense>
        </main>
    );
}
