"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateGame, deleteGame } from "@/app/actions/games";
import teamsData from "@/data/teams.json";
import { TeamSelector } from "@/app/components/TeamSelector";

interface League {
  id: string;
  name: string;
  playerA: { id: string; name: string };
  playerB: { id: string; name: string };
}

interface GameData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeXG: number;
  awayXG: number;
  playerStats: Array<{
    isHome: boolean;
    hatTricks: number;
    outsideBoxGoals: number;
    headerGoals: number;
    penaltiesMissed: number;
    redCards: number;
  }>;
}

interface EditGameModalProps {
  league: League;
  game: GameData;
  onClose: () => void;
}

interface PlayerStats {
  hatTricks: string | number;
  outsideBoxGoals: string | number;
  headerGoals: string | number;
  penaltiesMissed: string | number;
  redCards: string | number;
}

export function EditGameModal({ league, game, onClose }: EditGameModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allTeams = Object.entries(teamsData.leagues).flatMap(
    ([leagueName, teams]) =>
      Object.entries(teams).map(([teamName, teamData]) => ({
        name: teamName,
        league: leagueName,
        ...teamData,
        stars: teamData.rating,
      })),
  );

  const homePlayerStats = game.playerStats.find((s) => s.isHome);
  const awayPlayerStats = game.playerStats.find((s) => !s.isHome);

  const [formData, setFormData] = useState({
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    homeScore: game.homeScore as string | number,
    awayScore: game.awayScore as string | number,
    homeXG: game.homeXG as string | number,
    awayXG: game.awayXG as string | number,
  });

  const [homeStats, setHomeStats] = useState<PlayerStats>({
    hatTricks: homePlayerStats?.hatTricks || "",
    outsideBoxGoals: homePlayerStats?.outsideBoxGoals || "",
    headerGoals: homePlayerStats?.headerGoals || "",
    penaltiesMissed: homePlayerStats?.penaltiesMissed || "",
    redCards: homePlayerStats?.redCards || "",
  });

  const [awayStats, setAwayStats] = useState<PlayerStats>({
    hatTricks: awayPlayerStats?.hatTricks || "",
    outsideBoxGoals: awayPlayerStats?.outsideBoxGoals || "",
    headerGoals: awayPlayerStats?.headerGoals || "",
    penaltiesMissed: awayPlayerStats?.penaltiesMissed || "",
    redCards: awayPlayerStats?.redCards || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const homeScore = parseInt(String(formData.homeScore)) || 0;
      const awayScore = parseInt(String(formData.awayScore)) || 0;
      const homeXG =
        formData.homeXG !== ""
          ? parseFloat(String(formData.homeXG))
          : homeScore;
      const awayXG =
        formData.awayXG !== ""
          ? parseFloat(String(formData.awayXG))
          : awayScore;

      await updateGame({
        gameId: game.id,
        leagueId: league.id,
        homeUserId: league.playerA.id,
        awayUserId: league.playerB.id,
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        homeScore,
        awayScore,
        homeXG,
        awayXG,
        homeStats: {
          goals: homeScore,
          hatTricks: parseInt(String(homeStats.hatTricks)) || 0,
          outsideBoxGoals: parseInt(String(homeStats.outsideBoxGoals)) || 0,
          headerGoals: parseInt(String(homeStats.headerGoals)) || 0,
          penaltiesMissed: parseInt(String(homeStats.penaltiesMissed)) || 0,
          redCards: parseInt(String(homeStats.redCards)) || 0,
          xg: homeXG,
        },
        awayStats: {
          goals: awayScore,
          hatTricks: parseInt(String(awayStats.hatTricks)) || 0,
          outsideBoxGoals: parseInt(String(awayStats.outsideBoxGoals)) || 0,
          headerGoals: parseInt(String(awayStats.headerGoals)) || 0,
          penaltiesMissed: parseInt(String(awayStats.penaltiesMissed)) || 0,
          redCards: parseInt(String(awayStats.redCards)) || 0,
          xg: awayXG,
        },
      });

      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update game");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this game? This will reverse all prize money calculations.",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteGame(game.id);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete game");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Game</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Players */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Players</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded">
                <div className="text-sm text-gray-500">
                  {league.playerA.name}
                </div>
                <div className="font-medium">Player A</div>
              </div>
              <div className="p-3 bg-white rounded">
                <div className="text-sm text-gray-500">
                  {league.playerB.name}
                </div>
                <div className="font-medium">Player B</div>
              </div>
            </div>
          </div>

          {/* Teams */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Teams</h3>
            <div className="grid grid-cols-2 gap-4">
              <TeamSelector
                label={`${league.playerA.name}'s Team`}
                value={formData.homeTeam}
                onChange={(team) =>
                  setFormData({ ...formData, homeTeam: team })
                }
                teams={allTeams}
                required
              />
              <TeamSelector
                label={`${league.playerB.name}'s Team`}
                value={formData.awayTeam}
                onChange={(team) =>
                  setFormData({ ...formData, awayTeam: team })
                }
                teams={allTeams}
                required
              />
            </div>
          </div>

          {/* Score */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Score</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.homeScore}
                  onChange={(e) => {
                    const score = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      homeScore: score,
                      homeXG: prev.homeXG === "" ? score : prev.homeXG,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Away Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.awayScore}
                  onChange={(e) => {
                    const score = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      awayScore: score,
                      awayXG: prev.awayXG === "" ? score : prev.awayXG,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* XG */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Expected Goals (xG)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Optional - defaults to actual goals if not entered
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home xG
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.homeXG}
                  onChange={(e) =>
                    setFormData({ ...formData, homeXG: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Away xG
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.awayXG}
                  onChange={(e) =>
                    setFormData({ ...formData, awayXG: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Player Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Player Stats</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Stat
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      {league.playerA.name}
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      {league.playerB.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-700">Hat Tricks</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={homeStats.hatTricks}
                        onChange={(e) =>
                          setHomeStats({
                            ...homeStats,
                            hatTricks: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={awayStats.hatTricks}
                        onChange={(e) =>
                          setAwayStats({
                            ...awayStats,
                            hatTricks: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-700">
                      Goals Outside Box
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={homeStats.outsideBoxGoals}
                        onChange={(e) =>
                          setHomeStats({
                            ...homeStats,
                            outsideBoxGoals: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={awayStats.outsideBoxGoals}
                        onChange={(e) =>
                          setAwayStats({
                            ...awayStats,
                            outsideBoxGoals: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-700">Header Goals</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={homeStats.headerGoals}
                        onChange={(e) =>
                          setHomeStats({
                            ...homeStats,
                            headerGoals: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={awayStats.headerGoals}
                        onChange={(e) =>
                          setAwayStats({
                            ...awayStats,
                            headerGoals: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-700">
                      Penalties Missed
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={homeStats.penaltiesMissed}
                        onChange={(e) =>
                          setHomeStats({
                            ...homeStats,
                            penaltiesMissed: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={awayStats.penaltiesMissed}
                        onChange={(e) =>
                          setAwayStats({
                            ...awayStats,
                            penaltiesMissed: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-700">Red Cards</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={homeStats.redCards}
                        onChange={(e) =>
                          setHomeStats({
                            ...homeStats,
                            redCards: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={awayStats.redCards}
                        onChange={(e) =>
                          setAwayStats({
                            ...awayStats,
                            redCards: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete Game
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Update Game"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
