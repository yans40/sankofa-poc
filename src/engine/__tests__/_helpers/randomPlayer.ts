import type { GameState, GameAction, PlayerId } from '../../types.js';
import { applyAction } from '../../reducers.js';
import { generateLegalMoves } from '../../ai/moveGenerator.js';

/**
 * Plays a random legal action each iteration.
 * With probability `endTurnProb` (default 0.3) ends the turn early.
 * Returns the sequence of actions played (ending with END_TURN).
 */
export function randomPlayerTurn(
  state: GameState,
  playerId: PlayerId,
  endTurnProb = 0.3,
): GameAction[] {
  const actions: GameAction[] = [];
  let current = state;

  for (let i = 0; i < 50; i++) {
    if (current.phase === 'gameover') break;
    if (current.activePlayerId !== playerId) break;

    if (Math.random() < endTurnProb) {
      actions.push({ type: 'END_TURN', playerId });
      break;
    }

    const moves = generateLegalMoves(current, playerId);
    const nonEnd = moves.filter(m => m.type !== 'END_TURN');

    if (nonEnd.length === 0) {
      actions.push({ type: 'END_TURN', playerId });
      break;
    }

    const pick = nonEnd[Math.floor(Math.random() * nonEnd.length)];
    actions.push(pick);
    current = applyAction(current, pick);
  }

  return actions;
}
