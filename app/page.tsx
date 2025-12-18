import Skeleton from "./components/Skeleton";
import EmptyState from "./components/EmptyState";
import Link from "next/link";
import { prisma } from "../lib/prisma";

export default async function Home() {
  // Fetch data for dashboard sections
  let liveMatch = null, upcoming = [], leaderboard = [], news = [];
  let error = null;
  try {
    [liveMatch] = await prisma.match.findMany({ where: { status: "LIVE" }, orderBy: { scheduledAt: "asc" }, take: 1 });
    upcoming = await prisma.match.findMany({ where: { status: "SCHEDULED" }, orderBy: { scheduledAt: "asc" }, take: 3 });
    leaderboard = await prisma.team?.findMany?.({ orderBy: { createdAt: "desc" }, take: 5 }) || [];
    news = await prisma.news?.findMany?.({ orderBy: { createdAt: "desc" }, take: 3 }) || [];
  } catch (e) {
    error = "Failed to load dashboard data";
  }

  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Madiun Esport Arena Dashboard</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">Live Match</h2>
        {error ? (
          <EmptyState message={error} />
        ) : !liveMatch ? (
          <EmptyState message="No live match right now" />
        ) : (
          <Link href={`/matches/${liveMatch.id}`} className="block p-4 rounded bg-primary text-white font-semibold shadow-md">
            {liveMatch.name || `Match ${liveMatch.id}`}
          </Link>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Upcoming Matches</h2>
        {error ? (
          <EmptyState message={error} />
        ) : upcoming.length === 0 ? (
          <EmptyState message="No upcoming matches" />
        ) : (
          <ul className="space-y-2">
            {upcoming.map((m) => (
              <li key={m.id} className="p-3 rounded bg-white shadow border">
                <Link href={`/matches/${m.id}`} className="font-medium text-blue-700 hover:underline">
                  {m.name || `Match ${m.id}`}
                </Link>
                <div className="text-sm text-zinc-500">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "TBA"}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
        {error ? (
          <EmptyState message={error} />
        ) : leaderboard.length === 0 ? (
          <EmptyState message="No leaderboard data" />
        ) : (
          <ul className="space-y-2">
            {leaderboard.map((t) => (
              <li key={t.id} className="p-3 rounded bg-white shadow border flex items-center gap-3">
                <span className="font-semibold text-neutral-700">{t.name}</span>
                <span className="ml-auto bg-accent text-white rounded px-2 py-1 text-xs">{t.slug}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">News</h2>
        {error ? (
          <EmptyState message={error} />
        ) : news.length === 0 ? (
          <EmptyState message="No news yet" />
        ) : (
          <ul className="space-y-2">
            {news.map((n) => (
              <li key={n.id} className="p-3 rounded bg-white shadow border">
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-zinc-500">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
