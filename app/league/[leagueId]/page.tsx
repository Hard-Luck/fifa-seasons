import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/app/components/Navigation";
import { GameForm } from "./GameForm";
import { TeamBadge } from "@/app/components/TeamBadge";
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

        {isFinished && league.games.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">All Games</h2>
            <div className="space-y-3">
              {league.games.map((game) => (
                <div
                  key={game.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <TeamBadge teamName={game.homeTeam} size="sm" />
                      <span className="text-sm text-gray-600">{game.homeTeam}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TeamBadge teamName={game.awayTeam} size="sm" />
                      <span className="text-sm text-gray-600">{game.awayTeam}</span>
                    </div>
                  </div>
                  <div className="text-center font-bold">
                    <div>
                      {game.homeScore} - {game.awayScore}
                    </div>
                    <div className="text-xs text-gray-500">
                      xG: {game.homeXG.toFixed(1)} - {game.awayXG.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex-1 text-right text-sm text-gray-600">
                    {new Date(game.playedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
