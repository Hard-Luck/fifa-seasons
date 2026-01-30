"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createLeague(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const opponentId = formData.get("opponentId") as string
    const footballLeague = formData.get("footballLeague") as string
    const totalGames = parseInt(formData.get("totalGames") as string) || 10

    if (!opponentId || !footballLeague) {
        throw new Error("Missing required fields")
    }

    // Auto-generate league name as sequential number with league suffix
    const leagueCount = await prisma.league.count()
    const name = `${leagueCount + 1} - ${footballLeague}`

    const league = await prisma.league.create({
        data: {
            name,
            footballLeague,
            totalGames,
            playerAId: session.user.id,
            playerBId: opponentId,
            status: "active"
        }
    })

    revalidatePath("/dashboard")
    return league
}

export async function getUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
        }
    })
}
