import { describe, it, expect } from "vitest";
import {
    calculatePrizeMoney,
    calculateIndividualBonuses,
    type GameStats,
} from "@/lib/prizeMoney";

// Helper to create empty stats
const emptyStats = (): GameStats => ({
    goals: 0,
    hatTricks: 0,
    outsideBoxGoals: 0,
    headerGoals: 0,
    penaltiesMissed: 0,
    redCards: 0,
    xg: 0,
});

describe("Prize Money Calculation - Zero Sum Game", () => {
    describe("Basic Scenarios", () => {
        it("should be zero-sum for a draw with no bonuses", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 0, 0);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 0, 0);

            expect(p1Money).toBe(0);
            expect(p2Money).toBe(0);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should be zero-sum for a 1-1 draw", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 1, 1);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 1, 1);

            expect(p1Money).toBe(0);
            expect(p2Money).toBe(0);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should be zero-sum for a 3-3 draw", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 3, 3);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 3, 3);

            expect(p1Money).toBe(0);
            expect(p2Money).toBe(0);
            expect(p1Money + p2Money).toBe(0);
        });
    });

    describe("Simple Wins", () => {
        it("should calculate correctly when player 1 wins 1-0", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 1, 0);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 0, 1);

            // P1: +1 goal diff, +2 win = +3
            // P2: -1 goal diff, -2 loss = -3
            expect(p1Money).toBe(3);
            expect(p2Money).toBe(-3);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should calculate correctly when player 1 wins 3-0", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 3, 0);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 0, 3);

            // P1: +3 goal diff, +2 win = +5
            // P2: -3 goal diff, -2 loss = -5
            expect(p1Money).toBe(5);
            expect(p2Money).toBe(-5);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should calculate correctly when player 2 wins 2-1", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 1, 2);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 2, 1);

            // P1: -1 goal diff, -2 loss = -3
            // P2: +1 goal diff, +2 win = +3
            expect(p1Money).toBe(-3);
            expect(p2Money).toBe(3);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should calculate correctly when player 2 wins 5-2", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 2, 5);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 5, 2);

            // P1: -3 goal diff, -2 loss = -5
            // P2: +3 goal diff, +2 win = +5
            expect(p1Money).toBe(-5);
            expect(p2Money).toBe(5);
            expect(p1Money + p2Money).toBe(0);
        });
    });

    describe("Individual Bonuses", () => {
        it("should handle hat trick bonus correctly", () => {
            const p1Stats = { ...emptyStats(), hatTricks: 1 };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 3, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 3);

            // P1: +3 goal diff, +2 win, +2 hat trick = +7
            // P2: -3 goal diff, -2 loss, -2 (opponent hat trick) = -7
            expect(p1Money).toBe(7);
            expect(p2Money).toBe(-7);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle multiple hat tricks", () => {
            const p1Stats = { ...emptyStats(), hatTricks: 2 };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 6, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 6);

            // P1: +6 goal diff, +2 win, +4 hat tricks = +12
            // P2: -6 goal diff, -2 loss, -4 (opponent hat tricks) = -12
            expect(p1Money).toBe(12);
            expect(p2Money).toBe(-12);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle outside box goals", () => {
            const p1Stats = { ...emptyStats(), outsideBoxGoals: 2 };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 2, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 2);

            // P1: +2 goal diff, +2 win, +4 outside box = +8
            // P2: -2 goal diff, -2 loss, -4 (opponent outside box) = -8
            expect(p1Money).toBe(8);
            expect(p2Money).toBe(-8);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle header goals", () => {
            const p1Stats = { ...emptyStats(), headerGoals: 3 };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 3, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 3);

            // P1: +3 goal diff, +2 win, +3 headers = +8
            // P2: -3 goal diff, -2 loss, -3 (opponent headers) = -8
            expect(p1Money).toBe(8);
            expect(p2Money).toBe(-8);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle penalty misses", () => {
            const p1Stats = { ...emptyStats(), penaltiesMissed: 2 };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 1, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 1);

            // P1: +1 goal diff, +2 win, -2 penalties missed = +1
            // P2: -1 goal diff, -2 loss, +2 (opponent penalties missed) = -1
            expect(p1Money).toBe(1);
            expect(p2Money).toBe(-1);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle red cards", () => {
            const p1Stats = { ...emptyStats(), redCards: 1 };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 1, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 1);

            // P1: +1 goal diff, +2 win, -1 red card = +2
            // P2: -1 goal diff, -2 loss, +1 (opponent red card) = -2
            expect(p1Money).toBe(2);
            expect(p2Money).toBe(-2);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle bonuses on both sides", () => {
            const p1Stats = { ...emptyStats(), hatTricks: 1, headerGoals: 1 };
            const p2Stats = { ...emptyStats(), outsideBoxGoals: 1 };

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 4, 1);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 1, 4);

            // P1: +3 goal diff, +2 win, +2 hat trick, +1 header, -2 (opp outside box) = +6
            // P2: -3 goal diff, -2 loss, +2 outside box, -2 (opp hat trick), -1 (opp header) = -6
            expect(p1Money).toBe(6);
            expect(p2Money).toBe(-6);
            expect(p1Money + p2Money).toBe(0);
        });
    });

    describe("Complex Scenarios", () => {
        it("should handle combination: win with hat trick and headers", () => {
            const p1Stats = { ...emptyStats(), hatTricks: 1, headerGoals: 2 };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 3, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 3);

            // P1: +3 goal diff, +2 win, +2 hat trick, +2 headers = +9
            // P2: -3 goal diff, -2 loss, -2 (opp hat trick), -2 (opp headers) = -9
            expect(p1Money).toBe(9);
            expect(p2Money).toBe(-9);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle loss with penalties missed and red cards", () => {
            const p1Stats = { ...emptyStats(), penaltiesMissed: 1, redCards: 2 };
            const p2Stats = { ...emptyStats(), outsideBoxGoals: 2 };

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 0, 3);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 3, 0);

            // P1: -3 goal diff, -2 loss, -1 penalty, -2 red cards, -4 (opp outside box) = -12
            // P2: +3 goal diff, +2 win, +4 outside box, +1 (opp penalty), +2 (opp red cards) = +12
            expect(p1Money).toBe(-12);
            expect(p2Money).toBe(12);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle everything: both players with all bonuses", () => {
            const p1Stats = {
                ...emptyStats(),
                hatTricks: 1,
                outsideBoxGoals: 1,
                headerGoals: 1,
                penaltiesMissed: 1,
                redCards: 1
            };
            const p2Stats = {
                ...emptyStats(),
                hatTricks: 1,
                outsideBoxGoals: 2,
                headerGoals: 2,
                penaltiesMissed: 0,
                redCards: 0
            };

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 4, 3);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 3, 4);

            // P1: +1 goal diff, +2 win, +2 hat, +2 outside, +1 header, -1 penalty, -1 red, -2 (opp hat), -4 (opp outside), -2 (opp header) = -2
            // P2: -1 goal diff, -2 loss, +2 hat, +4 outside, +2 header, -2 (opp hat), -2 (opp outside), -1 (opp header), +1 (opp penalty), +1 (opp red) = +2
            expect(p1Money).toBe(-2);
            expect(p2Money).toBe(2);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle draw with bonuses on both sides", () => {
            const p1Stats = { ...emptyStats(), hatTricks: 1 };
            const p2Stats = { ...emptyStats(), outsideBoxGoals: 1 };

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 2, 2);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 2, 2);

            // P1: 0 goal diff, 0 win/loss, +2 hat trick, -2 (opp outside box) = 0
            // P2: 0 goal diff, 0 win/loss, +2 outside box, -2 (opp hat trick) = 0
            expect(p1Money).toBe(0);
            expect(p2Money).toBe(0);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle high scoring game with multiple bonuses", () => {
            const p1Stats = {
                ...emptyStats(),
                hatTricks: 2,
                outsideBoxGoals: 3,
                headerGoals: 4
            };
            const p2Stats = {
                ...emptyStats(),
                hatTricks: 1,
                headerGoals: 2,
                penaltiesMissed: 2
            };

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 7, 4);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 4, 7);

            // P1: +3 goal diff, +2 win, +4 hat, +6 outside, +4 header, -2 (opp hat), -2 (opp header), +2 (opp penalty) = +17
            // P2: -3 goal diff, -2 loss, +2 hat, +2 header, -2 penalty, -4 (opp hat), -6 (opp outside), -4 (opp header) = -17
            expect(p1Money).toBe(17);
            expect(p2Money).toBe(-17);
            expect(p1Money + p2Money).toBe(0);
        });
    });

    describe("Sheffield United Multiplier", () => {
        it("should double all prize money for Sheffield United winner", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Sheffield United", 3, 0);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 0, 3);

            // P1 (Sheffield): (+3 goal diff + +2 win) * 2 = +10
            // P2: -3 goal diff, -2 loss = -5
            // Note: This breaks zero-sum! Sheffield United gets double but opponent doesn't lose double
            expect(p1Money).toBe(10);
            expect(p2Money).toBe(-5);
            expect(p1Money + p2Money).toBe(5); // Not zero-sum
        });

        it("should double all prize money for Sheffield United loser", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Sheffield United", 0, 3);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 3, 0);

            // P1 (Sheffield): (-3 goal diff + -2 loss) * 2 = -10
            // P2: +3 goal diff, +2 win = +5
            expect(p1Money).toBe(-10);
            expect(p2Money).toBe(5);
            expect(p1Money + p2Money).toBe(-5); // Not zero-sum
        });

        it("should double everything including bonuses for Sheffield United", () => {
            const p1Stats = { ...emptyStats(), hatTricks: 1, outsideBoxGoals: 1 };
            const p2Stats = { ...emptyStats(), headerGoals: 1 };

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Sheffield United", 3, 1);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 1, 3);

            // P1 (Sheffield): (+2 goal diff + +2 win + +2 hat + +2 outside - -1 header) * 2 = +14
            // P2: -2 goal diff, -2 loss, +1 header, -2 (opp hat), -2 (opp outside) = -7
            expect(p1Money).toBe(14);
            expect(p2Money).toBe(-7);
            expect(p1Money + p2Money).toBe(7); // Not zero-sum with Sheffield multiplier
        });

        it("should apply to Sheffield United even in opponent's favor", () => {
            const p1Stats = emptyStats();
            const p2Stats = { ...emptyStats(), hatTricks: 2, outsideBoxGoals: 2 };

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Sheffield United", 1, 5);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Arsenal", 5, 1);

            // P1 (Sheffield): (-4 goal diff + -2 loss - -4 hat - -4 outside) * 2 = -28
            // P2: +4 goal diff, +2 win, +4 hat, +4 outside = +14
            expect(p1Money).toBe(-28);
            expect(p2Money).toBe(14);
            expect(p1Money + p2Money).toBe(-14); // Not zero-sum
        });

        it("should handle both teams as Sheffield United", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Sheffield United", 2, 1);
            const p2Money = calculatePrizeMoney(stats, stats, "Sheffield United FC", 1, 2);

            // P1 (Sheffield): (+1 goal diff + +2 win) * 2 = +6
            // P2 (Sheffield): (-1 goal diff + -2 loss) * 2 = -6
            expect(p1Money).toBe(6);
            expect(p2Money).toBe(-6);
            expect(p1Money + p2Money).toBe(0); // Zero-sum when both have multiplier
        });
    });

    describe("calculateIndividualBonuses helper", () => {
        it("should calculate zero for empty stats", () => {
            expect(calculateIndividualBonuses(emptyStats())).toBe(0);
        });

        it("should calculate hat tricks correctly", () => {
            const stats = { ...emptyStats(), hatTricks: 2 };
            expect(calculateIndividualBonuses(stats)).toBe(4);
        });

        it("should calculate outside box goals correctly", () => {
            const stats = { ...emptyStats(), outsideBoxGoals: 3 };
            expect(calculateIndividualBonuses(stats)).toBe(6);
        });

        it("should calculate headers correctly", () => {
            const stats = { ...emptyStats(), headerGoals: 5 };
            expect(calculateIndividualBonuses(stats)).toBe(5);
        });

        it("should subtract penalties missed", () => {
            const stats = { ...emptyStats(), penaltiesMissed: 2 };
            expect(calculateIndividualBonuses(stats)).toBe(-2);
        });

        it("should subtract red cards", () => {
            const stats = { ...emptyStats(), redCards: 3 };
            expect(calculateIndividualBonuses(stats)).toBe(-3);
        });

        it("should calculate combination of all bonuses", () => {
            const stats = {
                ...emptyStats(),
                hatTricks: 1,           // +2
                outsideBoxGoals: 2,     // +4
                headerGoals: 3,         // +3
                penaltiesMissed: 1,     // -1
                redCards: 2             // -2
            };
            expect(calculateIndividualBonuses(stats)).toBe(6);
        });
    });

    describe("Edge Cases", () => {
        it("should handle 0-0 draw", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 0, 0);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 0, 0);

            expect(p1Money).toBe(0);
            expect(p2Money).toBe(0);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle very high score", () => {
            const stats = emptyStats();
            const p1Money = calculatePrizeMoney(stats, stats, "Arsenal", 10, 0);
            const p2Money = calculatePrizeMoney(stats, stats, "Liverpool", 0, 10);

            // P1: +10 goal diff, +2 win = +12
            // P2: -10 goal diff, -2 loss = -12
            expect(p1Money).toBe(12);
            expect(p2Money).toBe(-12);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should handle negative bonuses exceeding positive", () => {
            const p1Stats = {
                ...emptyStats(),
                penaltiesMissed: 5,
                redCards: 5
            };
            const p2Stats = emptyStats();

            const p1Money = calculatePrizeMoney(p1Stats, p2Stats, "Arsenal", 1, 0);
            const p2Money = calculatePrizeMoney(p2Stats, p1Stats, "Liverpool", 0, 1);

            // P1: +1 goal diff, +2 win, -5 penalty, -5 red = -7
            // P2: -1 goal diff, -2 loss, +5 (opp penalty), +5 (opp red) = +7
            expect(p1Money).toBe(-7);
            expect(p2Money).toBe(7);
            expect(p1Money + p2Money).toBe(0);
        });

        it("should verify zero-sum property across random scenarios", () => {
            // Scenario 1
            const s1p1 = { ...emptyStats(), hatTricks: 1, headerGoals: 2, redCards: 1 };
            const s1p2 = { ...emptyStats(), outsideBoxGoals: 1, penaltiesMissed: 2 };
            const m1p1 = calculatePrizeMoney(s1p1, s1p2, "Arsenal", 3, 2);
            const m1p2 = calculatePrizeMoney(s1p2, s1p1, "Chelsea", 2, 3);
            expect(m1p1 + m1p2).toBe(0);

            // Scenario 2
            const s2p1 = { ...emptyStats(), hatTricks: 2, outsideBoxGoals: 3 };
            const s2p2 = { ...emptyStats(), headerGoals: 1, redCards: 1 };
            const m2p1 = calculatePrizeMoney(s2p1, s2p2, "Man City", 5, 1);
            const m2p2 = calculatePrizeMoney(s2p2, s2p1, "Tottenham", 1, 5);
            expect(m2p1 + m2p2).toBe(0);

            // Scenario 3: Draw
            const s3p1 = { ...emptyStats(), hatTricks: 1 };
            const s3p2 = { ...emptyStats(), outsideBoxGoals: 1 };
            const m3p1 = calculatePrizeMoney(s3p1, s3p2, "Newcastle", 3, 3);
            const m3p2 = calculatePrizeMoney(s3p2, s3p1, "Aston Villa", 3, 3);
            expect(m3p1 + m3p2).toBe(0);
        });
    });
});
