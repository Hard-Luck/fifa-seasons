interface GameWithStats {
    id: string
    homeUserId: string
    awayUserId: string
    homeScore: number
    awayScore: number
    homeXG: number
    awayXG: number
    homeTeam: string
    awayTeam: string
    playedAt: Date
}

interface PlayerStandings {
    userId: string
    userName: string
    played: number
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
    xPts: number
}

export function calculateLeagueStandings(
    games: GameWithStats[],
    playerAId: string,
    playerBId: string,
    playerAName: string,
    playerBName: string
): PlayerStandings[] {
    const standings: Record<string, PlayerStandings> = {
        [playerAId]: {
            userId: playerAId,
            userName: playerAName,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            xPts: 0,
        },
        [playerBId]: {
            userId: playerBId,
            userName: playerBName,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            xPts: 0,
        },
    }

    for (const game of games) {
        const homePlayer = standings[game.homeUserId]
        const awayPlayer = standings[game.awayUserId]

        // Update games played
        homePlayer.played++
        awayPlayer.played++

        // Update goals
        homePlayer.goalsFor += game.homeScore
        homePlayer.goalsAgainst += game.awayScore
        awayPlayer.goalsFor += game.awayScore
        awayPlayer.goalsAgainst += game.homeScore

        // Determine result and update points
        if (game.homeScore > game.awayScore) {
            homePlayer.wins++
            homePlayer.points += 3
            awayPlayer.losses++
        } else if (game.awayScore > game.homeScore) {
            awayPlayer.wins++
            awayPlayer.points += 3
            homePlayer.losses++
        } else {
            homePlayer.draws++
            homePlayer.points += 1
            awayPlayer.draws++
            awayPlayer.points += 1
        }

        // Calculate xPts
        if (game.homeXG > game.awayXG) {
            homePlayer.xPts += 3
        } else if (game.homeXG === game.awayXG) {
            homePlayer.xPts += 1
        }

        if (game.awayXG > game.homeXG) {
            awayPlayer.xPts += 3
        } else if (game.awayXG === game.homeXG) {
            awayPlayer.xPts += 1
        }
    }

    // Calculate goal difference
    standings[playerAId].goalDifference = standings[playerAId].goalsFor - standings[playerAId].goalsAgainst
    standings[playerBId].goalDifference = standings[playerBId].goalsFor - standings[playerBId].goalsAgainst

    return [standings[playerAId], standings[playerBId]].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
        return b.goalsFor - a.goalsFor
    })
}
