import type { GameState, GameAction, PlayerId } from '../types.js';
import { applyAction } from '../reducers.js';
import { generateLegalMoves } from './moveGenerator.js';
import { scoreAction } from './scoring.js';

export interface AiTurnResult {
  /** Sequence of actions to apply in order, ending with END_TURN. */
  actions: GameAction[];
  /** Optional trace for debugging — not used in production. */
  reasoning?: string[];
}

/**
 * Greedy one-step lookahead: pick the highest-scoring action each iteration.
 * No minmax, no MCTS, no lookahead. Intentional — the goal is a correct AI, not optimal.
 *
 * Mana waste is not penalised per action because greedy ordering already favours
 * high-value plays first; residual mana waste is an accepted imprecision.
 */
export function aiPlayTurn(state: GameState, aiPlayerId: PlayerId): AiTurnResult {
  const actions: GameAction[] = [];
  const reasoning: string[] = [];
  let current = state;

  // Safety cap: no real game exceeds 50 actions per turn
  for (let iterations = 0; iterations < 50; iterations++) {
    if (current.phase === 'gameover') break;
    if (current.activePlayerId !== aiPlayerId) break;

    const moves = generateLegalMoves(current, aiPlayerId);

    let bestScore = 0; // only play if score strictly positive
    let bestMove: GameAction | null = null;

    for (const move of moves) {
      if (move.type === 'END_TURN') continue;
      const score = scoreAction(current, move, aiPlayerId);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    if (!bestMove) {
      const endTurn: GameAction = { type: 'END_TURN', playerId: aiPlayerId };
      actions.push(endTurn);
      reasoning.push(`No beneficial move (best=${bestScore.toFixed(2)}), ending turn`);
      break;
    }

    actions.push(bestMove);
    reasoning.push(`${bestMove.type} score=${bestScore.toFixed(2)}`);
    current = applyAction(current, bestMove);
  }

  return { actions, reasoning };
}
