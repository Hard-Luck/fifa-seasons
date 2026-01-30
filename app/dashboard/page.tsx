import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { CreateLeagueForm } from "../components/CreateLeagueForm";
import { getUsers } from "../actions/leagues";
import { calculateLeagueStandings } from "@/lib/standings";
import type { Game } from "@prisma/client";
import { TeamBadge } from "../components/TeamBadge";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [user, activeLeague, finishedLeagues, users] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.league.findFirst({
      where: {
        OR: [{ playerAId: session.user.id }, { playerBId: session.user.id }],
        status: "active",
      },
      include: {
        playerA: true,
        playerB: true,
        games: {
          orderBy: { playedAt: "desc" },
        },
      },
    }),
    prisma.league.findMany({
      where: {
        OR: [{ playerAId: session.user.id }, { playerBId: session.user.id }],
        status: "finished",
      },
      include: {
        playerA: true,
        playerB: true,
        champion: true,
        games: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    getUsers(),
  ]);

  const standings = activeLeague
    ? calculateLeagueStandings(
        activeLeague.games,
        activeLeague.playerAId,
        activeLeague.playerBId,
        activeLeague.playerA.name,
        activeLeague.playerB.name,
      )
    : [];

  const last5Games = activeLeague?.games.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Prize Money */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Prize Money</h2>
          <div className="text-3xl font-bold text-blue-600">
            {(() => {
              if (!activeLeague) return `£${user?.prizeMoney || 0}`;

              const playerA = activeLeague.playerA;
              const playerB = activeLeague.playerB;

              if (playerA.prizeMoney === playerB.prizeMoney) {
                return `£${Math.abs(playerA.prizeMoney)} Tied`;
              }

              const leader =
                playerA.prizeMoney > playerB.prizeMoney ? playerA : playerB;
              const amount = Math.abs(leader.prizeMoney);

              return `£${amount} ${leader.name}`;
            })()}
          </div>
        </div>

        {/* Active League */}
        {activeLeague ? (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{activeLeague.name}</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-medium">
                    {activeLeague.playerA.name}
                  </span>
                  <span className="text-gray-600">
                    Prize: £{activeLeague.playerA.prizeMoney}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-medium">
                    {activeLeague.playerB.name}
                  </span>
                  <span className="text-gray-600">
                    Prize: £{activeLeague.playerB.prizeMoney}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={`/league/${activeLeague.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Game
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">League Table</h3>
              {standings.length > 0 && standings[0].played > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Player</th>
                        <th className="text-center py-2">P</th>
                        <th className="text-center py-2">W</th>
                        <th className="text-center py-2">D</th>
                        <th className="text-center py-2">L</th>
                        <th className="text-center py-2">GF</th>
                        <th className="text-center py-2">GA</th>
                        <th className="text-center py-2">GD</th>
                        <th className="text-center py-2 font-bold">Pts</th>
                        <th className="text-center py-2 text-purple-600">
                          xPts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((player) => (
                        <tr key={player.userId} className="border-b">
                          <td className="py-2 font-medium">
                            {player.userName}
                          </td>
                          <td className="text-center">{player.played}</td>
                          <td className="text-center">{player.wins}</td>
                          <td className="text-center">{player.draws}</td>
                          <td className="text-center">{player.losses}</td>
                          <td className="text-center">{player.goalsFor}</td>
                          <td className="text-center">{player.goalsAgainst}</td>
                          <td className="text-center">
                            {player.goalDifference > 0 ? "+" : ""}
                            {player.goalDifference}
                          </td>
                          <td className="text-center font-bold">
                            {player.points}
                          </td>
                          <td className="text-center text-purple-600">
                            {player.xPts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No games played yet</p>
              )}
            </div>

            {last5Games.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Games</h3>
                <div className="space-y-3">
                  {last5Games.map((game: Game) => (
                    <div
                      key={game.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <TeamBadge teamName={game.homeTeam} size="sm" />
                          {game.homeTeam}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <TeamBadge teamName={game.awayTeam} size="sm" />
                          {game.awayTeam}
                        </div>
                      </div>
                      <div className="text-center font-bold">
                        <div>
                          {game.homeScore} - {game.awayScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          xG: {game.homeXG.toFixed(1)} -{" "}
                          {game.awayXG.toFixed(1)}
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
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">No Active League</h2>
            <p className="text-gray-600 mb-4">
              Create a new league to get started
            </p>
            <CreateLeagueForm currentUserId={session.user.id!} users={users} />
          </div>
        )}

        {/* Historical Leagues */}
        {finishedLeagues.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Historical Leagues
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finishedLeagues.map((league) => {
                const totalGamesPlayed = league.games.length;
                const isChampion = league.championId === session.user?.id;

                return (
                  <Link
                    key={league.id}
                    href={`/league/${league.id}`}
                    className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">{league.name}</h3>
                      {isChampion && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                          🏆 Champion
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Games Played:</span>
                        <span className="font-medium">{totalGamesPlayed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Champion:</span>
                        <span className="font-medium">
                          {league.champion?.name || "Tied"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium">
                          {new Date(league.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
