"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { calculatePrizeMoney, type GameStats } from "@/lib/prizeMoney"

interface CreateGameData {
    leagueId: string
    homeUserId: string
    awayUserId: string
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    homeXG: number
    awayXG: number
    homeStats: GameStats
    awayStats: GameStats
}

export async function createGame(data: CreateGameData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify league exists and is active
    const league = await prisma.league.findUnique({
        where: { id: data.leagueId }
    })

    if (!league || league.status !== "active") {
        throw new Error("League not found or not active")
    }

    // Calculate prize money for each player (zero-sum game)
    const homePrizeMoney = calculatePrizeMoney(
        data.homeStats,
        data.awayStats,
        data.homeTeam,
        data.homeScore,
        data.awayScore
    )
    const awayPrizeMoney = calculatePrizeMoney(
        data.awayStats,
        data.homeStats,
        data.awayTeam,
        data.awayScore,
        data.homeScore
    )

    // Create game and stats in a transaction
    const game = await prisma.$transaction(async (tx) => {
        // Create game
        const newGame = await tx.game.create({
            data: {
                leagueId: data.leagueId,
                homeUserId: data.homeUserId,
                awayUserId: data.awayUserId,
                homeTeam: data.homeTeam,
                awayTeam: data.awayTeam,
                homeScore: data.homeScore,
                awayScore: data.awayScore,
                homeXG: data.homeXG,
                awayXG: data.awayXG,
            }
        })

        // Create home player stats
        await tx.gamePlayerStats.create({
            data: {
                gameId: newGame.id,
                userId: data.homeUserId,
                ...data.homeStats,
                isHome: true,
            }
        })

        // Create away player stats
        await tx.gamePlayerStats.create({
            data: {
                gameId: newGame.id,
                userId: data.awayUserId,
                ...data.awayStats,
                isHome: false,
            }
        })

        // Update prize money
        await tx.user.update({
            where: { id: data.homeUserId },
            data: { prizeMoney: { increment: homePrizeMoney } }
        })

        await tx.user.update({
            where: { id: data.awayUserId },
            data: { prizeMoney: { increment: awayPrizeMoney } }
        })

        // Check if league should end early (mathematically decided)
        const allGames = await tx.game.findMany({
            where: { leagueId: data.leagueId },
        })

        const gamesPlayed = allGames.length
        const remainingGames = league.totalGames - gamesPlayed

        if (remainingGames > 0) {
            // Calculate current standings
            const standings: Record<string, number> = {
                [data.homeUserId]: 0,
                [data.awayUserId]: 0,
            }

            for (const game of allGames) {
                if (game.homeScore > game.awayScore) {
                    standings[game.homeUserId] = (standings[game.homeUserId] || 0) + 3
                } else if (game.awayScore > game.homeScore) {
                    standings[game.awayUserId] = (standings[game.awayUserId] || 0) + 3
                } else {
                    standings[game.homeUserId] = (standings[game.homeUserId] || 0) + 1
                    standings[game.awayUserId] = (standings[game.awayUserId] || 0) + 1
                }
            }

            const homePoints = standings[data.homeUserId] || 0
            const awayPoints = standings[data.awayUserId] || 0
            const maxPossiblePoints = remainingGames * 3

            // Determine if it's mathematically impossible for the trailing player to catch up
            const leadingPoints = Math.max(homePoints, awayPoints)
            const trailingPoints = Math.min(homePoints, awayPoints)

            // Only end if trailer can't even tie: trailingPoints + maxPossible < leadingPoints
            if (trailingPoints + maxPossiblePoints < leadingPoints) {
                const championId = homePoints > awayPoints ? data.homeUserId : data.awayUserId
                await tx.league.update({
                    where: { id: data.leagueId },
                    data: {
                        status: "finished",
                        championId,
                    }
                })
            }
        }

        // Check if all games are played
        if (gamesPlayed >= league.totalGames) {
            // Calculate final standings to determine champion
            const standings: Record<string, number> = {
                [data.homeUserId]: 0,
                [data.awayUserId]: 0,
            }

            for (const game of allGames) {
                if (game.homeScore > game.awayScore) {
                    standings[game.homeUserId] = (standings[game.homeUserId] || 0) + 3
                } else if (game.awayScore > game.homeScore) {
                    standings[game.awayUserId] = (standings[game.awayUserId] || 0) + 3
                } else {
                    standings[game.homeUserId] = (standings[game.homeUserId] || 0) + 1
                    standings[game.awayUserId] = (standings[game.awayUserId] || 0) + 1
                }
            }

            const homePoints = standings[data.homeUserId] || 0
            const awayPoints = standings[data.awayUserId] || 0
            const championId = homePoints > awayPoints ? data.homeUserId : awayPoints > homePoints ? data.awayUserId : null

            await tx.league.update({
                where: { id: data.leagueId },
                data: {
                    status: "finished",
                    championId,
                }
            })
        }

        return newGame
    })

    revalidatePath("/dashboard")
    revalidatePath(`/league/${data.leagueId}`)
    revalidatePath("/stats")

    return game
}
