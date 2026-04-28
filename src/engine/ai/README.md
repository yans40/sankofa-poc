# src/engine/ai — Heuristic AI

## Architecture

| File | Role |
|---|---|
| `heuristic.ts` | Entry point: `aiPlayTurn(state, playerId)` — greedy loop |
| `moveGenerator.ts` | `generateLegalMoves(state, playerId)` — all legal `GameAction`s |
| `scoring.ts` | `scoreAction(state, action, playerId)` — pure numeric score |

## Algorithm

Greedy, no lookahead:

1. Generate all legal moves via `generateLegalMoves`.
2. Score each with `scoreAction`. Skip `END_TURN` (score = 0 baseline).
3. Play the move with the highest score **if score > 0**.
4. Apply the move, repeat with updated state.
5. When no move scores > 0, emit `END_TURN`.

## Scoring summary

| Action | Score |
|---|---|
| Play unit | `(attack + hp) − cost + 2 if battlecry` |
| Play damage spell on unit (kill) | `dmg × 1.5 − cost` |
| Play damage spell on unit (no kill) | `dmg × 0.5 − cost` |
| Play damage spell on hero | `dmg × 1.0 − cost` |
| Play heal spell (self) | `min(amount, healable) × 0.8 − cost` |
| Attack unit (trade) | `dmgDealt × 1.2 + targetValue if kill − attackerValue if dies` |
| Attack hero | `attackerAtk × 1.5` |
| End turn | `0` |

## Validated criterion

**Automated:** beats a random player ≥ 70 % over 100 seeded games (`heuristic.integration.test.ts`).

**Not automated:** loses to a sensible human player ≥ 50 % of the time.
This is validated manually by the PO during the M4 rejouabilité test.
The AI is deliberately non-optimal; adding minmax or MCTS is out of scope for this POC.

## Limits

- No hero power usage.
- No ritual/offering/ancestor actions (Rituals, Altar).
- No multicard combo planning (e.g., "grant charge then attack").
- No opponent threat assessment.
- Mana waste not penalised per action (greedy ordering naturally minimises it).
