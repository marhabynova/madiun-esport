import Link from "next/link";
import { prisma } from '../../../lib/prisma';

export default async function TournamentDetail({ params }: { params: { tournamentId: string } }) {
    const tournament = await prisma.tournament.findUnique({ where: { id: params.tournamentId } });
    if (!tournament) return <div className="p-6 text-red-600">Tournament not found</div>;
    return (
        <main className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">{tournament.name}</h1>
            <div className="mb-4 text-zinc-600">Status: {tournament.status}</div>
            <nav className="flex gap-4 mb-8">
                <Link href={`./standings`} className="px-4 py-2 rounded bg-primary text-white font-semibold">Standings</Link>
                <Link href={`./bracket`} className="px-4 py-2 rounded bg-accent text-white font-semibold">Bracket</Link>
            </nav>
            <div className="text-zinc-500">Tournament details and stages coming soon.</div>
        </main>
    );
}
