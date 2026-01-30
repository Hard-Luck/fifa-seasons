Perfect — this is exactly the right moment to lock Copilot in so it doesn’t freestyle 😄
Below is a **single, copy-pasteable `copilot-prompt.md`** you can take straight into your editor and use as the _system prompt / guiding doc_ for Copilot Chat (GPT-5.1 Codex).

It’s structured, explicit, and intentionally a bit bossy — that’s what gets the best results.

---

````md
# Copilot Instructions – FA26 League Tracker

You are building a small Next.js application to track FA26 leagues between two players.
Follow this document strictly. Do not add features that are not listed.

---

## Tech Stack (Do Not Change)

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- NextAuth for authentication
- Prisma ORM
- Postgres (or SQLite initially)
- Free-tier friendly only

---

## Core Constraints

- EXACTLY two players per league
- MAXIMUM of 3 pages
- No public leagues
- Teams are static and loaded from a local JSON file
- No JSON blobs for player stats (use relational tables)

---

## Pages (Required)

### 1. Dashboard (`/dashboard`)

- Show current league table
- Show league status (active / finished)
- Show expected league points (xPts) per player
- Show persistent career score per player
- Show last 5 games in current league
- Clear separation between:
  - League points
  - Career score

---

### 2. Add Game (`/league/:leagueId`)

- Form to log a completed game
- Inputs:
  - Home & away players (auto-filled)
  - League selector
  - League → Team selector
    - Sticky searchable dropdown
    - Teams loaded from `/data/teams.json`
  - Score input (home / away)
- Per-player stats:
  - Goals
  - Hat tricks
  - Goals outside penalty area
  - Header goals
  - Penalties missed
  - Red cards
  - XG (decimal)

- On submit:
  - Create Game record
  - Create 2 GamePlayerStats records
  - Calculate league points
  - Calculate expected points (xPts)
  - Update career score

---

### 3. Stats & History (`/stats`)

- League stats:
  - Wins / draws / losses
  - Goals scored & conceded
  - Avg XG
  - Actual league points vs expected points
- Career stats:
  - Total career score
  - Total games played
- Match history:
  - Searchable
  - Sortable by date

---

## Data Model (Do Not Deviate)

### User

- id
- name
- email
- careerScore
- createdAt

---

### League

- id
- name
- status (active | finished)
- playerAId
- playerBId
- createdAt

---

### Game

- id
- leagueId
- playedAt
- homeUserId
- awayUserId
- homeTeam
- awayTeam
- homeScore
- awayScore
- homeXG
- awayXG

---

### GamePlayerStats

- id
- gameId
- userId
- goals
- hatTricks
- outsideBoxGoals
- headerGoals
- penaltiesMissed
- redCards
- xg
- isHome

---

## League Rules

### League Points

- Win: 3 points
- Draw: 1 point
- Loss: 0 points

### League End Condition

- League finishes early if one player is mathematically unable to overtake the other
- Remaining max points < current point difference

---

## Career Score Rules (Persistent Across Leagues)

Per game, per player:

- Win: +2
- Each goal: +1
- Goal outside penalty area: +2
- Header goal: +1
- Penalty missed: -1
- Red card: -1

Career score never resets.

---

## Expected Points (xPts)

Per game:

- If player XG > opponent XG → 3 xPts
- If equal → 1 xPts
- If lower → 0 xPts

League xPts = sum of xPts per game

---

## Static Teams Data

- Store in `/data/teams.json`
- Example structure:

```json
{
  "Premier League": ["Arsenal", "Liverpool", "Chelsea"],
  "La Liga": ["Barcelona", "Real Madrid"]
}
```
````

- Load client-side
- Use searchable select component

---

## UI Rules

- Minimal navigation
- Mobile-first
- No unnecessary animations
- Make data readable and fast to enter

---

## Non-Goals (Do Not Implement)

- More than 2 players
- Admin roles
- Public leagues
- External football APIs
- Team updates

---

## Output Expectations

- Strong TypeScript typing
- Clear server actions
- No unused components
- No speculative features
- Keep code simple and readable

# Special rules:

- Sheffield united are double points
