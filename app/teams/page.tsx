import { Suspense } from "react";
import { prisma } from '../../lib/prisma';
import ListStates from '../components/ListStates';
import Skeleton from '../components/Skeleton';
import type { Team } from '@prisma/client';

async function TeamsList() {
    let teams = [];
    let error = null;
    try {
        teams = await prisma.team?.findMany?.({ take: 20, orderBy: { createdAt: 'desc' } }) || [];
    } catch (e) {
        error = 'Failed to load teams';
    }
    return (
        <ListStates isError={error} items={teams} emptyMessage="No teams">
            <ul className="space-y-3">
                {teams.map((t: Team) => (
                    <li key={t.id} className="p-3 border rounded bg-white">
                        <div className="font-medium">{t.name}</div>
                    </li>
                ))}
            </ul>
        </ListStates>
    );
}

export default function Page() {
    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Teams</h1>
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <TeamsList />
            </Suspense>
        </main>
    );
}
