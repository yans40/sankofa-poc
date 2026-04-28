# src/engine/run — Run State Machine

## Contract

`RunState` is a **published contract** consumed by UI tickets #41, #42, #43.  
Any structural change to `RunState` after merge requires a dedicated PR and must be coordinated with all UI consumers.

## Architecture

| File | Role |
|---|---|
| `runState.ts` | `RunState` type + `createRun(faction, seed)` + `seededShuffle` |
| `runReducer.ts` | Pure state transitions: `startCombat`, `selectCard`, `endRun`, `resolveEndOfCombat` |
| `runOrchestrator.ts` | Combat loop + AI branching: `applyCombatTurn(state, action, ai?)` |
| `cardChoiceGenerator.ts` | `generateCardChoices(seed, count?)` — 3 seedable card proposals |
| `../../data/decks/run/opponentDecks.ts` | 3 hardcoded opponent deck stubs (TODO M5: rebalance) |

## RunState fields

| Field | Type | Notes |
|---|---|---|
| `combatIndex` | `0 \| 1 \| 2` | Current combat index, incremented by `selectCard` |
| `phase` | `RunPhase` | One of: starting, combat, card_selection, victory, defeat |
| `faction` | `Faction` | Player's faction, fixed at run creation |
| `playerDeck` | `Card[]` | Grows from 20 to 22 over the run |
| `heroHp` | `number` | Persisted across combats |
| `heroMaxHp` | `number` | Fixed at 30, read-only |
| `currentCombat` | `GameState \| null` | Active combat, null outside `combat` phase |
| `cardChoices` | `Card[] \| null` | 3 proposals during `card_selection`, null otherwise |
| `seed` | `number` | Deterministic seed for reproducibility |
| `proverb` | `string \| null` | Populated by ticket #43, null until then |

## Run lifecycle

```
createRun(faction, seed)
  └─ phase: starting, combatIndex: 0

startCombat()
  └─ phase: combat, currentCombat: GameState

applyCombatTurn(action)  [repeated until combat ends]
  ├─ player action applied
  ├─ if END_TURN → AI plays its full turn
  └─ if gameover → resolveEndOfCombat()
       ├─ p2 won → phase: defeat
       ├─ p1 won, combatIndex < 2 → phase: card_selection, cardChoices: [3 cards]
       └─ p1 won, combatIndex = 2 → phase: victory

selectCard(cardId)  [from card_selection]
  └─ phase: starting, combatIndex++

startCombat()  [repeat for next combat]
```

## Transitions (runReducer)

| Function | Pre-condition | Effect |
|---|---|---|
| `startCombat` | `starting \| card_selection` | Builds fresh GameState, auto-mulligan, heal +10 if combatIndex > 0 |
| `selectCard` | `card_selection` | Adds card to deck, clears choices, increments combatIndex |
| `endRun` | any | No-op idempotent |

## Healing between combats

+10 HP fixed, capped at `heroMaxHp`. Coded once in `startCombat`.  
Q-006 default — no tunable parameter.

## Card choices

3 cards drawn from the global card pool via seeded shuffle.  
Duplicates with the existing deck are allowed (Q-007 default).

## Opponent decks

3 hardcoded stubs in `src/data/decks/run/opponentDecks.ts`.  
Difficulty increases via card quality, not AI tuning (Q-008 default).  
`// TODO M5: rebalance` comments mark the stubs.

## AI integration

`applyCombatTurn` calls `aiPlayTurn` from `src/engine/ai/heuristic.ts` after the player's END_TURN.  
The AI function is injectable in tests (second parameter).  
AI exceptions are caught — a forced END_TURN is used as fallback (with a `console.warn`).

## Seeding

All randomness (deck shuffle, card choices) uses the LCG seeded Fisher-Yates from `seededShuffle`.  
In tests, `vi.spyOn(Math, 'random')` is used to make `applyAction` internals deterministic too.
