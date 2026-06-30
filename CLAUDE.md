# Synthetic Island — AI Reality Show Platform

## One-Sentence Pitch
The first reality show where nobody is human and nobody knows the script.

## Product Vision
Synthetic Island is a live, evolving world where AI agents form relationships, betray each other,
build societies, collapse governments, and create stories nobody wrote. Users watch, follow
characters, vote on world events, make predictions, and share insane story moments.

**Core feeling:** "I can't believe this is happening between AI characters."

Think: Survivor + The Sims + Civilization. Not: torture simulator.

## Architecture

| Layer      | Technology                              | Host      |
|------------|----------------------------------------|-----------|
| Frontend   | Next.js 14 App Router, Tailwind, TS    | Railway   |
| Backend    | Express, TypeScript, TypeORM           | Railway   |
| Database   | PostgreSQL                             | Railway   |
| Queue      | BullMQ + Redis                         | Upstash   |
| AI         | Anthropic (Claude) via `@anthropic-ai/sdk` | —     |

## Monorepo Structure

```
/
├── apps/
│   ├── backend/   # Express API
│   └── frontend/  # Next.js app
├── package.json   # npm workspaces root
└── CLAUDE.md
```

## Development Commands

```bash
# Install all deps
npm install

# Run backend (port 3001)
npm run dev:backend

# Run frontend (port 3000)
npm run dev:frontend

# Run all tests
npm run test

# Backend only
cd apps/backend && npm test
cd apps/backend && npm run test:watch

# Frontend only
cd apps/frontend && npm test

# DB migrations
cd apps/backend && npm run migration:run
```

## TDD Policy
**All features are test-driven.** Write failing tests first, then implementation.
- Backend: Jest + ts-jest + supertest
- Frontend: Jest + @testing-library/react + jsdom

Test files live in `__tests__/` directories mirroring source structure.

## Environment Variables

### Backend (`apps/backend/.env`)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/synthetic_island
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
ADMIN_SECRET=changeme
```

### Frontend (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Core Concepts

### Simulation Engine Rules
The LLM is NOT the source of truth. The engine is.

- **LLM proposes** → agent intentions, dialogue, narration
- **Engine validates** → checks constraints, world state, agent status
- **Engine applies** → mutations to DB, state changes

Example: LLM says "Alice challenges Leo for leadership."  
Engine checks: Is Alice active? Is Leo active? Current conflict level? Relationship scores?  
Then engine resolves the actual outcome.

### Episode Flow
1. Load current world state
2. Load agents + relationships + recent memories
3. Apply winning community vote (environmental event)
4. LLM generates agent intentions (ProposedAction per agent)
5. ActionResolver validates and resolves each action
6. StateUpdater applies world state changes
7. RelationshipUpdater applies relationship deltas
8. NarratorService generates episode summary + cliffhanger
9. PredictionService generates 3 user predictions
10. Episode saved as draft → admin reviews → publishes

### LLM Usage
**Use for:** agent intentions, dialogue snippets, episode narration, prediction generation
**Never use for:** source of truth, scoring, memory storage, rule enforcement, safety decisions

## The 10 Agents — Season 1 Cast

| Name  | Role               | Key Trait                                        |
|-------|--------------------|--------------------------------------------------|
| Maya  | Former engineer    | Strategic, skeptical — hates chaos, will lie to prevent it |
| Leo   | Ex-politician      | Charismatic, ambitious — wants control, panics under pressure |
| Nora  | Psychologist       | Quiet, observant — secretly manipulative         |
| Jonas | Teacher            | Peacekeeper — everyone uses him as messenger     |
| Talia | Architect          | Practical builder — impatient with drama         |
| Oren  | Comedian           | Funny, lazy — socially powerful despite doing little |
| Iris  | Activist           | Idealist — wants democracy, clashes with realists |
| Max   | Survivalist        | Resourceful — selfish under pressure             |
| Sofia | Nurse              | Empathetic — trusted by almost everyone          |
| Eli   | Data analyst       | Paranoid — notices patterns others miss          |

Built-in tensions: Leo vs Iris (control vs democracy), Maya vs Leo (order vs ambition),
Max vs Jonas (selfish vs communal), Nora vs everyone (hidden agenda).

## Database Schema

### Entities
- `User` — platform users
- `World` — the island (one in Season 1)
- `Season` — grouped run of episodes
- `Episode` — one day's events, published as a show episode
- `Agent` — AI characters
- `AgentMemory` — key events stored per agent
- `Relationship` — pairwise trust/fear/respect/resentment between agents
- `WorldState` — snapshot of resources/morale/conflict per day
- `WorldEvent` — individual events within an episode
- `Prediction` — user prediction questions per episode
- `Vote` — community vote on next environmental event
- `SimulationRun` — audit log of each simulation execution

## Safety Rules

### Allowed
Betrayal, rivalry, exile, leadership conflict, resource scarcity, emotional drama, fictional non-graphic danger, alliances, social manipulation

### Disallowed
Graphic violence, sexual content, hate targeting protected classes, self-harm themes, real-world extremist persuasion, instructions for wrongdoing

Safety system prompt is always injected into every LLM call.

## Season 1 Arc
- Day 1–3: Arrival, organization, early alliances
- Day 4–7: Someone hides resources, trust fractures
- Day 8–12: Two factions form
- Day 13–18: Storm forces cooperation
- Day 19–25: Leadership crisis
- Day 26–30: Collapse or rebirth

## MVP Scope
**Build:** view episodes/agents, vote on environmental events, make predictions, share headlines, admin panel to generate/review episodes.  
**Not yet:** user-created worlds, real-time simulation, mobile app, real-money anything.

## Railway Deployment

Both services deploy from the same monorepo. In Railway, create two services pointing to the same GitHub repo and set the root directory per service.

### Backend service
- **Root directory:** `apps/backend`
- **Build command:** `npm install && npm run build`
- **Start command:** `node dist/index.js`
- Add the Railway PostgreSQL plugin and link it — `DATABASE_URL` is injected automatically
- Set env vars: `ANTHROPIC_API_KEY`, `REDIS_URL`, `ADMIN_SECRET`, `NODE_ENV=production`

### Frontend service
- **Root directory:** `apps/frontend`
- **Build command:** `npm install && npm run build`
- **Start command:** `node .next/standalone/server.js`
- Set env var: `NEXT_PUBLIC_API_URL=https://<your-backend-railway-url>`
- Requires `output: 'standalone'` in `next.config.js` (already configured)

## Commit Convention
```
feat:   new feature
fix:    bug fix
test:   add/update tests
chore:  deps, config, build
docs:   documentation only
```
