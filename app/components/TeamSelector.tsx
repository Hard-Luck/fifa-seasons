"use client";

import { useState, useMemo } from "react";
import { TeamBadge } from "./TeamBadge";
import { searchTeams } from "@/lib/teams";

interface Team {
  name: string;
  league: string;
  rating: number;
  score: number;
  badge: string;
  stars: number;
}

interface TeamSelectorProps {
  value: string;
  onChange: (teamName: string) => void;
  teams: Team[];
  label: string;
  required?: boolean;
}

export function TeamSelector({
  value,
  onChange,
  teams,
  label,
  required,
}: TeamSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    return searchTeams(query, teams);
  }, [query, teams]);

  const selectedTeam = teams.find((t) => t.name === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query || value}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search teams..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
          required={required}
        />
        {selectedTeam && !query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <TeamBadge teamName={selectedTeam.name} size="sm" />
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredTeams.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No teams found
              </div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.name}
                  type="button"
                  onClick={() => {
                    onChange(team.name);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <TeamBadge teamName={team.name} size="sm" />
                  <span className="flex-1">
                    {team.name}{" "}
                    <span className="text-gray-500">(★{team.stars})</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
