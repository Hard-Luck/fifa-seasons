import teamsData from "@/data/teams.json";

type TeamData = {
    rating: number;
    score: number;
    badge: string;
};

export function getTeamBadge(teamName: string): string | undefined {
    for (const teams of Object.values(teamsData.leagues)) {
        const team = (teams as Record<string, TeamData>)[teamName];
        if (team?.badge) {
            return team.badge;
        }
    }
    return undefined;
}

export function getTeamsByLeague(footballLeague: string) {
    const teams = teamsData.leagues[footballLeague as keyof typeof teamsData.leagues];
    if (!teams) return [];

    return Object.entries(teams).map(([teamName, teamData]) => ({
        name: teamName,
        league: footballLeague,
        ...teamData,
        stars: teamData.rating,
    }));
}

export function getAllTeams() {
    return Object.entries(teamsData.leagues).flatMap(
        ([leagueName, teams]) =>
            Object.entries(teams).map(([teamName, teamData]) => ({
                name: teamName,
                league: leagueName,
                ...teamData,
                stars: teamData.rating,
            })),
    );
}

export function searchTeams(query: string, teams: ReturnType<typeof getAllTeams>) {
    if (!query) return teams;

    const lowerQuery = query.toLowerCase();

    return teams.filter(team => {
        const teamName = team.name.toLowerCase();

        // Direct substring match
        if (teamName.includes(lowerQuery)) return true;

        // Initials match (e.g., "man u" matches "Manchester United")
        const initials = team.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toLowerCase();
        if (initials.includes(lowerQuery.replace(/\s/g, ''))) return true;

        // Fuzzy match - check if all characters appear in order
        let nameIndex = 0;
        for (const char of lowerQuery) {
            if (char === ' ') continue;
            nameIndex = teamName.indexOf(char, nameIndex);
            if (nameIndex === -1) return false;
            nameIndex++;
        }
        return true;
    });
}
