export interface GameStats {
    goals: number;
    hatTricks: number;
    outsideBoxGoals: number;
    headerGoals: number;
    penaltiesMissed: number;
    redCards: number;
    xg: number;
}

export function calculateIndividualBonuses(stats: GameStats): number {
    let bonuses = 0;
    bonuses += stats.hatTricks * 2; // +2 per hat trick
    bonuses += stats.outsideBoxGoals * 2; // +2 per outside box goal
    bonuses += stats.headerGoals; // +1 per header goal
    bonuses -= stats.penaltiesMissed; // -1 per penalty missed
    bonuses -= stats.redCards; // -1 per red card
    return bonuses;
}

export function calculatePrizeMoney(
    playerStats: GameStats,
    opponentStats: GameStats,
    teamName: string,
    playerScore: number,
    opponentScore: number
): number {
    let money = 0;

    // Goal difference (can be negative)
    money += playerScore - opponentScore;

    // Win/loss/draw bonus
    if (playerScore > opponentScore) {
        money += 2; // Win bonus
    } else if (playerScore < opponentScore) {
        money -= 2; // Loss penalty
    }
    // Draw: no bonus (0)

    // Individual performance bonuses (zero-sum: your bonuses add, opponent's subtract)
    money += calculateIndividualBonuses(playerStats);
    money -= calculateIndividualBonuses(opponentStats);

    // Sheffield United doubles ALL prize money
    if (teamName.toLowerCase().includes("sheffield united")) {
        money *= 2;
    }

    return money;
}
