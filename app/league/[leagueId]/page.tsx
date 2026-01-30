import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/app/components/Navigation";
import { GameForm } from "./GameForm";
import { GamesList } from "./GamesList";
import { notFound } from "next/navigation";

export default async function AddGamePage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const session = await auth();
  const { leagueId } = await params;

  if (!session?.user?.id) {
    return null;
  }

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      playerA: true,
      playerB: true,
      champion: true,
      games: {
        orderBy: { playedAt: "desc" },
        include: {
          playerStats: true,
        },
      },
    },
  });

  if (!league) {
    notFound();
  }

  const isFinished = league.status === "finished";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isFinished ? "League Summary" : "Add Game"}
              </h1>
              <p className="mt-2 text-gray-600">{league.name}</p>
            </div>
            {isFinished && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Champion</div>
                <div className="text-xl font-bold text-yellow-600">
                  🏆 {league.champion?.name || "Tied"}
                </div>
              </div>
            )}
          </div>
          {isFinished && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This league has finished. {league.games.length} games were
                played.
              </p>
            </div>
          )}
        </div>

        {!isFinished && <GameForm league={league} />}

        {league.games.length > 0 && (
          <GamesList
            league={{
              id: league.id,
              name: league.name,
              playerA: league.playerA,
              playerB: league.playerB,
            }}
            games={league.games}
          />
        )}
      </main>
    </div>
  );
}
