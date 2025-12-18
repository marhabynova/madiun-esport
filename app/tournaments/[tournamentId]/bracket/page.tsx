import { prisma } from '../../../../lib/prisma';
import EmptyState from '../../../components/EmptyState';

export default async function BracketPage({ params }: { params: { tournamentId: string } }) {
    // Fetch aggregate for bracket
    const agg = await prisma.leaderboardAggregate.findUnique({ where: { tournamentId: params.tournamentId } });
    const bracket = agg?.payload?.bracket || [];
    return (
        <main className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Bracket</h1>
            {bracket.length === 0 ? (
                <EmptyState message="No bracket data yet" />
            ) : (
                <ul className="space-y-2">
                    {bracket.map((round: any, i: number) => (
                        <li key={i} className="p-3 border rounded bg-white">
                            <div className="font-semibold">Round {i + 1}</div>
                            <div>{JSON.stringify(round)}</div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
