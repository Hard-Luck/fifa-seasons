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

        return newGame
    })

    revalidatePath("/dashboard")
    revalidatePath(`/league/${data.leagueId}`)
    revalidatePath("/stats")

    return game
}
