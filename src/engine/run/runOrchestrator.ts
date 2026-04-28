import type { GameAction, PlayerId } from '../types.js';
import type { AiTurnResult } from '../ai/heuristic.js';
import type { RunState } from './runState.js';
import { applyAction } from '../reducers.js';
import { aiPlayTurn } from '../ai/heuristic.js';
import { resolveEndOfCombat } from './runReducer.js';

type AiFn = (state: Parameters<typeof aiPlayTurn>[0], playerId: PlayerId) => AiTurnResult;

/**
 * Applies a single player action to the active combat.
 * When the action is END_TURN, runs the AI opponent's full turn automatically.
 * Transitions to card_selection / victory / defeat when the combat ends.
 *
 * @param ai Injectable AI function — defaults to aiPlayTurn, overridable in tests.
 */
export function applyCombatTurn(
  state: RunState,
  playerAction: GameAction,
  ai: AiFn = aiPlayTurn,
): RunState {
  if (state.phase !== 'combat' || state.currentCombat === null) {
    return state;
  }

  let combat = applyAction(state.currentCombat, playerAction);

  if (combat.phase === 'gameover') {
    return resolveEndOfCombat({ ...state, currentCombat: combat });
  }

  // After player END_TURN the active player switches to p2 — run the AI
  if (playerAction.type === 'END_TURN') {
    let aiResult: AiTurnResult;
    try {
      aiResult = ai(combat, 'p2');
    } catch (e) {
      // Guard: AI exception must never lock the combat
      console.warn('[RunOrchestrator] AI threw an exception — forcing END_TURN for p2', e);
      aiResult = { actions: [{ type: 'END_TURN', playerId: 'p2' }] };
    }

    for (const action of aiResult.actions) {
      combat = applyAction(combat, action);
      if (combat.phase === 'gameover') break;
    }

    // Safety: if AI returned no END_TURN or the loop exited early
    if (combat.phase !== 'gameover' && combat.activePlayerId === 'p2') {
      combat = applyAction(combat, { type: 'END_TURN', playerId: 'p2' });
    }

    if (combat.phase === 'gameover') {
      return resolveEndOfCombat({ ...state, currentCombat: combat });
    }
  }

  const heroHp = combat.players.p1.heroHealth;
  return { ...state, currentCombat: combat, heroHp };
}
