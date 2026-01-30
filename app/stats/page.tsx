import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "../components/Navigation";
import { calculateLeagueStandings } from "@/lib/standings";
import type { Game, GamePlayerStats } from "@prisma/client";
import { TeamBadge } from "../components/TeamBadge";

type GameWithStats = Game & {
  playerStats: GamePlayerStats[];
};

function calculateCareerBonusFromStats(
  stats: {
    goals: number;
    hatTricks: number;
    outsideBoxGoals: number;
    headerGoals: number;
    penaltiesMissed: number;
    redCards: number;
  },
  teamName: string,
  isWin: boolean,
): number {
  let bonus = 0;
  if (isWin) bonus += 2;
  bonus += stats.goals;
  bonus += stats.hatTricks;
  bonus += stats.outsideBoxGoals * 2;
  bonus += stats.headerGoals;
  bonus -= stats.penaltiesMissed;
  bonus -= stats.redCards;

  if (teamName.toLowerCase().includes("sheffield united")) {
    bonus *= 2;
  }

  return bonus;
}

export default async function StatsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Get active league and all games
  const activeLeague = await prisma.league.findFirst({
    where: {
      OR: [{ playerAId: session.user.id }, { playerBId: session.user.id }],
      status: "active",
    },
    include: {
      playerA: true,
      playerB: true,
      games: {
        include: {
          playerStats: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { playedAt: "desc" },
      },
    },
  });

  // Get all games for career stats
  const allUserGames = await prisma.game.findMany({
    where: {
      OR: [{ homeUserId: session.user.id }, { awayUserId: session.user.id }],
    },
    include: {
      playerStats: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Calculate career stats
  const totalGames = allUserGames.length;
  let totalGoals = 0;
  let totalHatTricks = 0;
  let totalOutsideBox = 0;
  let totalHeaders = 0;
  let totalPensMissed = 0;
  let totalRedCards = 0;
  let totalWinBonus = 0;

  for (const game of allUserGames) {
    const isHome = game.homeUserId === session.user.id;
    const isWin = isHome
      ? game.homeScore > game.awayScore
      : game.awayScore > game.homeScore;

    if (isWin) totalWinBonus += 2;

    const stats = game.playerStats[0];
    if (stats) {
      totalGoals += stats.goals;
      totalHatTricks += stats.hatTricks;
      totalOutsideBox += stats.outsideBoxGoals;
      totalHeaders += stats.headerGoals;
      totalPensMissed += stats.penaltiesMissed;
      totalRedCards += stats.redCards;
    }
  }

  // League stats
  const standings = activeLeague
    ? calculateLeagueStandings(
        activeLeague.games,
        activeLeague.playerAId,
        activeLeague.playerBId,
        activeLeague.playerA.name,
        activeLeague.playerB.name,
      )
    : [];

  const leagueStats = standings.find((s) => s.userId === session.user!.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stats & History</h1>
        </div>

        {/* Prize Money & Career Stats */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Career Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
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
              <div className="text-sm text-gray-600">Prize Money Leader</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalGames}</div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalGoals}</div>
              <div className="text-sm text-gray-600">Total Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalWinBonus}</div>
              <div className="text-sm text-gray-600">Win Bonuses</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Bonus Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">{totalGoals} goals</div>
                <div className="text-gray-600">+{totalGoals} pts</div>
              </div>
              <div>
                <div className="font-medium">{totalHatTricks} hat tricks</div>
                <div className="text-gray-600">+{totalHatTricks} pts</div>
              </div>
              <div>
                <div className="font-medium">{totalOutsideBox} outside box</div>
                <div className="text-gray-600">+{totalOutsideBox * 2} pts</div>
              </div>
              <div>
                <div className="font-medium">{totalHeaders} headers</div>
                <div className="text-gray-600">+{totalHeaders} pts</div>
              </div>
              <div>
                <div className="font-medium">{totalPensMissed} pens missed</div>
                <div className="text-red-600">-{totalPensMissed} pts</div>
              </div>
              <div>
                <div className="font-medium">{totalRedCards} red cards</div>
                <div className="text-red-600">-{totalRedCards} pts</div>
              </div>
            </div>
          </div>
        </div>

        {/* League Stats */}
        {activeLeague && leagueStats && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current League Stats</h2>
            <div className="mb-4">
              <h3 className="font-medium text-gray-700">{activeLeague.name}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {leagueStats.wins}
                </div>
                <div className="text-sm text-gray-600">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {leagueStats.draws}
                </div>
                <div className="text-sm text-gray-600">Draws</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {leagueStats.losses}
                </div>
                <div className="text-sm text-gray-600">Losses</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {leagueStats.goalsFor} - {leagueStats.goalsAgainst}
                </div>
                <div className="text-sm text-gray-600">Goals (F-A)</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center p-4 bg-gray-50 rounded">
              <div>
                <div className="text-sm text-gray-600">League Points</div>
                <div className="text-2xl font-bold">{leagueStats.points}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Expected Points</div>
                <div className="text-2xl font-bold text-purple-600">
                  {leagueStats.xPts}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Difference</div>
                <div
                  className={`text-2xl font-bold ${leagueStats.points - leagueStats.xPts > 0 ? "text-green-600" : leagueStats.points - leagueStats.xPts < 0 ? "text-red-600" : "text-gray-600"}`}
                >
                  {leagueStats.points - leagueStats.xPts > 0 ? "+" : ""}
                  {leagueStats.points - leagueStats.xPts}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match History */}
        {activeLeague && activeLeague.games.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Match History</h2>
            <div className="space-y-4">
              {activeLeague.games.map((game: GameWithStats) => {
                const homeStats = game.playerStats.find(
                  (s: GamePlayerStats) => s.isHome,
                );
                const awayStats = game.playerStats.find(
                  (s: GamePlayerStats) => !s.isHome,
                );
                const isHomeWin = game.homeScore > game.awayScore;
                const isAwayWin = game.awayScore > game.homeScore;

                const homeBonus = homeStats
                  ? calculateCareerBonusFromStats(
                      homeStats,
                      game.homeTeam,
                      isHomeWin,
                    )
                  : 0;

                const awayBonus = awayStats
                  ? calculateCareerBonusFromStats(
                      awayStats,
                      game.awayTeam,
                      isAwayWin,
                    )
                  : 0;

                return (
                  <div key={game.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm text-gray-600">
                        {new Date(game.playedAt).toLocaleDateString()}{" "}
                        {new Date(game.playedAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center mb-3">
                      <div className="text-right">
                        <div className="font-medium flex items-center justify-end gap-2">
                          {game.homeTeam}
                          <TeamBadge teamName={game.homeTeam} size="sm" />
                        </div>
                        <div className="text-sm text-gray-600">
                          {activeLeague.playerA.id === game.homeUserId
                            ? activeLeague.playerA.name
                            : activeLeague.playerB.name}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {game.homeScore} - {game.awayScore}
                        </div>
                        <div className="text-sm text-gray-500">
                          xG: {game.homeXG.toFixed(1)} -{" "}
                          {game.awayXG.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <TeamBadge teamName={game.awayTeam} size="sm" />
                          {game.awayTeam}
                        </div>
                        <div className="text-sm text-gray-600">
                          {activeLeague.playerB.id === game.awayUserId
                            ? activeLeague.playerB.name
                            : activeLeague.playerA.name}
                        </div>
                      </div>
                    </div>

                    {/* Bonuses */}
                    <div className="pt-3 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-medium">
                            Career Bonus:{" "}
                            <span className="text-blue-600">+{homeBonus}</span>
                          </div>
                          {homeStats && (
                            <div className="text-xs text-gray-600 mt-1">
                              {isHomeWin && <span>Win +2 • </span>}
                              {homeStats.goals > 0 && (
                                <span>Goals +{homeStats.goals} • </span>
                              )}
                              {homeStats.outsideBoxGoals > 0 && (
                                <span>
                                  Outside +{homeStats.outsideBoxGoals * 2}{" "}
                                  •{" "}
                                </span>
                              )}
                              {homeStats.headerGoals > 0 && (
                                <span>Headers +{homeStats.headerGoals} • </span>
                              )}
                              {homeStats.penaltiesMissed > 0 && (
                                <span className="text-red-600">
                                  Pens -{homeStats.penaltiesMissed} •{" "}
                                </span>
                              )}
                              {homeStats.redCards > 0 && (
                                <span className="text-red-600">
                                  Red -{homeStats.redCards}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            Career Bonus:{" "}
                            <span className="text-blue-600">+{awayBonus}</span>
                          </div>
                          {awayStats && (
                            <div className="text-xs text-gray-600 mt-1">
                              {isAwayWin && <span>Win +2 • </span>}
                              {awayStats.goals > 0 && (
                                <span>Goals +{awayStats.goals} • </span>
                              )}
                              {awayStats.outsideBoxGoals > 0 && (
                                <span>
                                  Outside +{awayStats.outsideBoxGoals * 2}{" "}
                                  •{" "}
                                </span>
                              )}
                              {awayStats.headerGoals > 0 && (
                                <span>Headers +{awayStats.headerGoals} • </span>
                              )}
                              {awayStats.penaltiesMissed > 0 && (
                                <span className="text-red-600">
                                  Pens -{awayStats.penaltiesMissed} •{" "}
                                </span>
                              )}
                              {awayStats.redCards > 0 && (
                                <span className="text-red-600">
                                  Red -{awayStats.redCards}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
