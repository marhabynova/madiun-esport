import { Suspense } from "react";
import { prisma } from '../../lib/prisma';
import ListStates from '../components/ListStates';
import Skeleton from '../components/Skeleton';
import type { Tournament } from '@prisma/client';

async function TournamentsList() {
    let tournaments = [];
    let error = null;
    try {
        tournaments = await prisma.tournament.findMany({ take: 20, orderBy: { createdAt: 'desc' } });
    } catch (e) {
        error = 'Failed to load tournaments';
    }
    return (
        <ListStates isError={error} items={tournaments} emptyMessage="No tournaments">
            <ul className="space-y-3">
                {tournaments.map((t: Tournament) => (
                    <li key={t.id} className="p-3 border rounded bg-white">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-zinc-500">Status: {t.status}</div>
                    </li>
                ))}
            </ul>
        </ListStates>
    );
}

export default function Page() {
    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Tournaments</h1>
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <TournamentsList />
            </Suspense>
        </main>
    );
}
