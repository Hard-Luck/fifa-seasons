"use client";

import Image from "next/image";
import { useState } from "react";
import teamsData from "@/data/teams.json";

interface TeamBadgeProps {
  teamName: string;
  size?: "sm" | "md" | "lg";
}

export function TeamBadge({ teamName, size = "md" }: TeamBadgeProps) {
  const [error, setError] = useState(false);

  const sizes = {
    sm: { width: 20, height: 20, className: "w-5 h-5" },
    md: { width: 24, height: 24, className: "w-6 h-6" },
    lg: { width: 32, height: 32, className: "w-8 h-8" },
  };

  // Get badge URL for team
  const getTeamBadge = (name: string) => {
    for (const teams of Object.values(teamsData.leagues)) {
      const team = (teams as Record<string, { badge: string }>)[name];
      if (team?.badge) {
        return team.badge;
      }
    }
    return undefined;
  };

  const badge = getTeamBadge(teamName);

  if (!badge || error) {
    // Fallback placeholder for missing or failed images
    const sizeConfig = sizes[size];
    return (
      <div
        className={`${sizeConfig.className} bg-gray-200 rounded-sm flex items-center justify-center text-gray-500 text-xs font-bold`}
        title={teamName}
      >
        {teamName.charAt(0).toUpperCase()}
      </div>
    );
  }

  const sizeConfig = sizes[size];

  return (
    <Image
      src={badge}
      alt={`${teamName} badge`}
      width={sizeConfig.width}
      height={sizeConfig.height}
      className={`${sizeConfig.className} object-contain`}
      onError={() => setError(true)}
    />
  );
}
