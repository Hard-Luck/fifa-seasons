"use client";

import { useState } from "react";
import { EditGameModal } from "./EditGameModal";
import { TeamBadge } from "@/app/components/TeamBadge";

interface League {
  id: string;
  name: string;
  playerA: { id: string; name: string };
  playerB: { id: string; name: string };
}

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeXG: number;
  awayXG: number;
  playedAt: Date;
  playerStats: Array<{
    isHome: boolean;
    hatTricks: number;
    outsideBoxGoals: number;
    headerGoals: number;
    penaltiesMissed: number;
    redCards: number;
  }>;
}

interface GamesListProps {
  league: League;
  games: Game[];
}

export function GamesList({ league, games }: GamesListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Games</h2>
        <div className="space-y-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
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
              <div className="flex-1 flex justify-end items-center gap-3">
                <div className="text-right text-sm text-gray-600">
                  {new Date(game.playedAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => setEditingGame(game)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingGame && (
        <EditGameModal
          league={league}
          game={editingGame}
          onClose={() => setEditingGame(null)}
        />
      )}
    </>
  );
}
