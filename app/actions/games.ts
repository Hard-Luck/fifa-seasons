"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { calculatePrizeMoney, type GameStats } from "@/lib/prizeMoney"

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

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

interface UpdateGameData extends CreateGameData {
    gameId: string
}

export async function updateGame(data: UpdateGameData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Get existing game to reverse prize money
    const existingGame = await prisma.game.findUnique({
        where: { id: data.gameId },
        include: {
            playerStats: true,
            league: true,
        }
    })

    if (!existingGame || !existingGame.league) {
        throw new Error("Game not found")
    }

    if (existingGame.league.status !== "active") {
        throw new Error("Cannot edit games in finished league")
    }

    // Calculate OLD prize money to reverse it
    const oldHomeStats = existingGame.playerStats.find(s => s.isHome)
    const oldAwayStats = existingGame.playerStats.find(s => !s.isHome)

    if (!oldHomeStats || !oldAwayStats) {
        throw new Error("Game stats not found")
    }

    const oldHomePrizeMoney = calculatePrizeMoney(
        oldHomeStats,
        oldAwayStats,
        existingGame.homeTeam,
        existingGame.homeScore,
        existingGame.awayScore
    )
    const oldAwayPrizeMoney = calculatePrizeMoney(
        oldAwayStats,
        oldHomeStats,
        existingGame.awayTeam,
        existingGame.awayScore,
        existingGame.homeScore
    )

    // Calculate NEW prize money
    const newHomePrizeMoney = calculatePrizeMoney(
        data.homeStats,
        data.awayStats,
        data.homeTeam,
        data.homeScore,
        data.awayScore
    )
    const newAwayPrizeMoney = calculatePrizeMoney(
        data.awayStats,
        data.homeStats,
        data.awayTeam,
        data.awayScore,
        data.homeScore
    )

    // Update game and stats in a transaction
    await prisma.$transaction(async (tx) => {
        // Update game
        await tx.game.update({
            where: { id: data.gameId },
            data: {
                homeTeam: data.homeTeam,
                awayTeam: data.awayTeam,
                homeScore: data.homeScore,
                awayScore: data.awayScore,
                homeXG: data.homeXG,
                awayXG: data.awayXG,
            }
        })

        // Update player stats
        await tx.gamePlayerStats.update({
            where: { id: oldHomeStats.id },
            data: data.homeStats,
        })

        await tx.gamePlayerStats.update({
            where: { id: oldAwayStats.id },
            data: data.awayStats,
        })

        // Adjust prize money (reverse old, apply new)
        await tx.user.update({
            where: { id: data.homeUserId },
            data: { prizeMoney: { increment: newHomePrizeMoney - oldHomePrizeMoney } }
        })

        await tx.user.update({
            where: { id: data.awayUserId },
            data: { prizeMoney: { increment: newAwayPrizeMoney - oldAwayPrizeMoney } }
        })

        // Recalculate league status
        await recalculateLeagueStatus(tx, data.leagueId, data.homeUserId, data.awayUserId, existingGame.league.totalGames)
    })

    revalidatePath("/dashboard")
    revalidatePath(`/league/${data.leagueId}`)
    revalidatePath("/stats")
}

export async function deleteGame(gameId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Get existing game to reverse prize money
    const existingGame = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            playerStats: true,
            league: true,
        }
    })

    if (!existingGame || !existingGame.league) {
        throw new Error("Game not found")
    }

    if (existingGame.league.status !== "active") {
        throw new Error("Cannot delete games in finished league")
    }

    // Calculate prize money to reverse
    const homeStats = existingGame.playerStats.find(s => s.isHome)
    const awayStats = existingGame.playerStats.find(s => !s.isHome)

    if (!homeStats || !awayStats) {
        throw new Error("Game stats not found")
    }

    const homePrizeMoney = calculatePrizeMoney(
        homeStats,
        awayStats,
        existingGame.homeTeam,
        existingGame.homeScore,
        existingGame.awayScore
    )
    const awayPrizeMoney = calculatePrizeMoney(
        awayStats,
        homeStats,
        existingGame.awayTeam,
        existingGame.awayScore,
        existingGame.homeScore
    )

    // Delete game and reverse prize money in a transaction
    await prisma.$transaction(async (tx) => {
        // Delete player stats first (foreign key constraint)
        await tx.gamePlayerStats.deleteMany({
            where: { gameId }
        })

        // Delete game
        await tx.game.delete({
            where: { id: gameId }
        })

        // Reverse prize money
        await tx.user.update({
            where: { id: existingGame.homeUserId },
            data: { prizeMoney: { decrement: homePrizeMoney } }
        })

        await tx.user.update({
            where: { id: existingGame.awayUserId },
            data: { prizeMoney: { decrement: awayPrizeMoney } }
        })

        // Recalculate league status
        await recalculateLeagueStatus(
            tx,
            existingGame.leagueId,
            existingGame.homeUserId,
            existingGame.awayUserId,
            existingGame.league.totalGames
        )
    })

    revalidatePath("/dashboard")
    revalidatePath(`/league/${existingGame.leagueId}`)
    revalidatePath("/stats")
}

// Helper function to recalculate league status after edit/delete
async function recalculateLeagueStatus(
    tx: TransactionClient,
    leagueId: string,
    playerAId: string,
    playerBId: string,
    totalGames: number
) {
    const allGames = await tx.game.findMany({
        where: { leagueId },
    })

    const gamesPlayed = allGames.length
    const remainingGames = totalGames - gamesPlayed

    const standings: Record<string, number> = {
        [playerAId]: 0,
        [playerBId]: 0,
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

    const playerAPoints = standings[playerAId] || 0
    const playerBPoints = standings[playerBId] || 0
    const maxPossiblePoints = remainingGames * 3

    const leadingPoints = Math.max(playerAPoints, playerBPoints)
    const trailingPoints = Math.min(playerAPoints, playerBPoints)

    if (gamesPlayed < totalGames) {
        // Check if should be finished early
        if (remainingGames > 0 && trailingPoints + maxPossiblePoints < leadingPoints) {
            const championId = playerAPoints > playerBPoints ? playerAId : playerBId
            await tx.league.update({
                where: { id: leagueId },
                data: {
                    status: "finished",
                    championId,
                }
            })
        } else {
            // League should be active
            await tx.league.update({
                where: { id: leagueId },
                data: {
                    status: "active",
                    championId: null,
                }
            })
        }
    } else if (gamesPlayed >= totalGames) {
        // All games played, determine champion
        const championId = playerAPoints > playerBPoints ? playerAId : playerBPoints > playerAPoints ? playerBId : null
        await tx.league.update({
            where: { id: leagueId },
            data: {
                status: "finished",
                championId,
            }
        })
    }
}
