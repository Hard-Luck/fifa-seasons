# FA26 League Tracker - Implementation Tickets

## Phase 1: Foundation & Setup

- [x] **T1.1** Initialize Next.js project with TypeScript, App Router, Tailwind CSS
- [x] **T1.2** Install dependencies (Prisma, NextAuth, React Hook Form, Zod)
- [x] **T1.3** Set up Prisma schema with SQLite and create migrations
- [x] **T1.4** Create mock teams.json with 2 test teams (different names for fuzzy search)
- [x] **T1.5** Set up environment variables and .env.example

## Phase 2: Authentication

- [x] **T2.1** Configure NextAuth with credentials provider
- [x] **T2.2** Create auth API route handler
- [x] **T2.3** Build simple login page
- [x] **T2.4** Add middleware for route protection
- [x] **T2.5** Create seed script to add 2 test users

## Phase 3: Core Database Operations

- [x] **T3.1** Create Prisma client singleton utility
- [x] **T3.2** Create server action to create a league
- [x] **T3.3** Create server action to fetch leagues for a user
- [x] **T3.4** Test: Create a league between two users

## Phase 4: Dashboard Page (Minimal)

- [x] **T4.1** Create basic dashboard layout with navigation
- [x] **T4.2** Display active league name and status
- [x] **T4.3** Show league table with calculated standings
- [x] **T4.4** Show career scores for both players
- [x] **T4.5** Add "Create New League" button/form

## Phase 5: Add Game Feature

- [x] **T5.1** Create add game page route `/league/[leagueId]`
- [x] **T5.2** Build game form with home/away player display
- [x] **T5.3** Create searchable team selector component using teams.json
- [x] **T5.4** Add score inputs (home/away)
- [x] **T5.5** Add XG inputs (decimal)
- [x] **T5.6** Add per-player stat inputs (goals, hat tricks, outside box, headers, penalties missed, red cards)
- [x] **T5.7** Create server action to save game with GamePlayerStats
- [x] **T5.8** Test: Add a game and verify database records

## Phase 6: Game Calculations & Updates

- [x] **T6.1** Create utility to calculate league points from game result
- [x] **T6.2** Create utility to calculate career bonuses from GamePlayerStats
- [x] **T6.3** Apply Sheffield United 2x multiplier to bonuses
- [x] **T6.4** Create utility to calculate xPts from XG values
- [x] **T6.5** Update User.careerScore on game creation
- [x] **T6.6** Test: Verify league points, bonuses, and xPts calculations

## Phase 7: Dashboard - League Table

- [x] **T7.1** Query all games for active league
- [x] **T7.2** Calculate league standings (wins, draws, losses, points)
- [x] **T7.3** Calculate xPts totals per player
- [x] **T7.4** Display league table with actual points vs xPts
- [x] **T7.5** Show league status and check for early completion
- [x] **T7.6** Display last 5 games with results

## Phase 8: Stats Page

- [x] **T8.1** Create stats page route `/stats`
- [x] **T8.2** Query and display league-level stats (W/D/L, goals, avg XG)
- [x] **T8.3** Calculate and display league-level bonus breakdown
- [x] **T8.4** Display career totals (games played, total bonuses by type)
- [x] **T8.5** Create match history table with all games
- [x] **T8.6** Add per-game bonus breakdown display
- [ ] **T8.7** Add search and sort functionality to match history

## Phase 9: League End Logic

- [ ] **T9.1** Create utility to check if league is mathematically decided
- [ ] **T9.2** Auto-update league status to "finished" when condition met
- [ ] **T9.3** Prevent adding games to finished leagues
- [ ] **T9.4** Add UI indicator for finished leagues

## Phase 10: Polish & UX

- [ ] **T10.1** Add loading states to forms and data fetching
- [ ] **T10.2** Add error handling and validation messages
- [ ] **T10.3** Improve mobile responsiveness
- [ ] **T10.4** Add confirmation dialogs for important actions
- [ ] **T10.5** Style team badges in selectors
- [ ] **T10.6** Add league/career bonus tooltips explaining scoring

## Phase 11: Data Population (Optional)

- [ ] **T11.1** Replace mock teams.json with real FC26 teams data
- [ ] **T11.2** Add team badges from API
- [ ] **T11.3** Verify all leagues and teams are present

---

## Testing Checklist

- [ ] Create two users via seed
- [ ] Login as user 1
- [ ] Create a league
- [ ] Add multiple games with different stats
- [ ] Verify league table calculates correctly
- [ ] Verify career bonuses calculate correctly (including Sheffield United 2x)
- [ ] Verify xPts calculate correctly from XG
- [ ] Check stats page shows correct aggregations
- [ ] Verify league auto-completes when mathematically decided
- [ ] Test with Sheffield United team to verify double bonuses
