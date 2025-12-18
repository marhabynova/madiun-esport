import { prisma } from '../../../../lib/prisma';
import EmptyState from '../../../components/EmptyState';

export default async function StandingsPage({ params }: { params: { tournamentId: string } }) {
    // Fetch aggregate for standings
    const agg = await prisma.standingAggregate.findUnique({ where: { stageId: params.tournamentId } });
    const standings = agg?.payload?.standings || [];
    return (
        <main className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Standings</h1>
            {standings.length === 0 ? (
                <EmptyState message="No standings data yet" />
            ) : (
                <table className="w-full border rounded bg-white">
                    <thead>
                        <tr>
                            <th className="p-2 text-left">Team</th>
                            <th className="p-2 text-left">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((row: any, i: number) => (
                            <tr key={i}>
                                <td className="p-2">{row.teamName}</td>
                                <td className="p-2">{row.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
