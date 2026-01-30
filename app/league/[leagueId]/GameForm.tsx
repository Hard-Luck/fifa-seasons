"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/app/actions/games";
import teamsData from "@/data/teams.json";
import { TeamSelector } from "@/app/components/TeamSelector";

interface League {
  id: string;
  name: string;
  playerA: { id: string; name: string };
  playerB: { id: string; name: string };
}

interface GameFormProps {
  league: League;
}

interface PlayerStats {
  hatTricks: string | number;
  outsideBoxGoals: string | number;
  headerGoals: string | number;
  penaltiesMissed: string | number;
  redCards: string | number;
}

export function GameForm({ league }: GameFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Get all teams
  const allTeams = Object.entries(teamsData.leagues).flatMap(
    ([leagueName, teams]) =>
      Object.entries(teams).map(([teamName, teamData]) => ({
        name: teamName,
        league: leagueName,
        ...teamData,
        stars: teamData.rating,
      })),
  );

  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    homeScore: "" as string | number,
    awayScore: "" as string | number,
    homeXG: "" as string | number,
    awayXG: "" as string | number,
  });

  const [homeStats, setHomeStats] = useState<PlayerStats>({
    hatTricks: "",
    outsideBoxGoals: "",
    headerGoals: "",
    penaltiesMissed: "",
    redCards: "",
  });

  const [awayStats, setAwayStats] = useState<PlayerStats>({
    hatTricks: "",
    outsideBoxGoals: "",
    headerGoals: "",
    penaltiesMissed: "",
    redCards: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const homeScore = parseInt(String(formData.homeScore)) || 0;
      const awayScore = parseInt(String(formData.awayScore)) || 0;
      const homeXG = parseFloat(String(formData.homeXG)) || 0;
      const awayXG = parseFloat(String(formData.awayXG)) || 0;

      await createGame({
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

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Players */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Players</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">{league.playerA.name}</div>
            <div className="font-medium">Player A</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">{league.playerB.name}</div>
            <div className="font-medium">Player B</div>
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Teams</h2>
        <div className="grid grid-cols-2 gap-4">
          <TeamSelector
            label={`${league.playerA.name}'s Team`}
            value={formData.homeTeam}
            onChange={(team) => setFormData({ ...formData, homeTeam: team })}
            teams={allTeams}
            required
          />
          <TeamSelector
            label={`${league.playerB.name}'s Team`}
            value={formData.awayTeam}
            onChange={(team) => setFormData({ ...formData, awayTeam: team })}
            teams={allTeams}
            required
          />
        </div>
      </div>

      {/* Score */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Score</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Score
            </label>
            <input
              type="number"
              min="0"
              value={formData.homeScore}
              onChange={(e) =>
                setFormData({ ...formData, homeScore: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, awayScore: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
      </div>

      {/* XG */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Expected Goals (xG)</h2>
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
              required
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
              required
            />
          </div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Player Stats</h2>
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
                      setHomeStats({ ...homeStats, hatTricks: e.target.value })
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
                      setAwayStats({ ...awayStats, hatTricks: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-700">Goals Outside Box</td>
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
                <td className="py-3 px-4 text-gray-700">Penalties Missed</td>
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
                      setHomeStats({ ...homeStats, redCards: e.target.value })
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
                      setAwayStats({ ...awayStats, redCards: e.target.value })
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

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Game"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
