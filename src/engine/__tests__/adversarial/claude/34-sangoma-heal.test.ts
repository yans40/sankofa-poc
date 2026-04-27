/**
 * Adversarial QA — PR #34 (author:cursor) — Claude QA Challenger
 * Cases not covered by Cursor's sangoma.test.ts:
 *   1. Sangoma heals herself when she is the only wounded ally
 *   2. Cross-player isolation — p1 Sangoma never heals p2 units
 */
import { describe, it, expect } from 'vitest';
import cardsData from '../../../../data/cards.json' assert { type: 'json' };
import type { Card, GameState, UnitInstance } from '../../../types.js';
import { initialGameState } from '../../../gameState.js';
import { applyAction } from '../../../reducers.js';

const allCards = cardsData as Card[];

function startedGame(): GameState {
  let state = initialGameState('orisha', 'zulu');
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

function makeUnit(
  instanceId: string,
  card: Card,
  currentHealth: number,
  maxHealth: number,
  ownerId: 'p1' | 'p2' = 'p1',
): UnitInstance {
  return {
    instanceId,
    card,
    currentAttack: card.attack ?? 0,
    currentHealth,
    maxHealth,
    hasAttackedThisTurn: false,
    justSummoned: false,
    isSpectral: false,
    spectralExpiresAtTurn: null,
    hasDivineShield: false,
    ownerId,
  };
}

const z05 = allCards.find(c => c.id === 'Z05')!;
const z01 = allCards.find(c => c.id === 'Z01')!;

describe('Adversarial — PR #34 Sangoma heal edge cases', () => {
  it('Sangoma wounded alone heals herself', () => {
    // Sangoma is the only unit on p1 battlefield and is wounded.
    // random_ally should include herself as a valid candidate.
    let state = startedGame();
    const sangoma = makeUnit('sangoma-self', z05, 2, 4);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [sangoma] },
      },
    };
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    const u = state.players.p1.battlefield.find(x => x.instanceId === 'sangoma-self');
    expect(u?.currentHealth).toBe(4); // 2 + 2 heal = 4 (== maxHealth)
  });

  it('cross-player isolation: p1 Sangoma never heals p2 units', () => {
    // p2 has a wounded unit; p1 Sangoma fires on_turn_end.
    // p2's unit must remain untouched.
    let state = startedGame();
    const sangoma = makeUnit('sangoma-iso', z05, 4, 4);
    const p2unit = makeUnit('p2-wounded', z01, 1, 3, 'p2');
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [sangoma] },
        p2: { ...state.players.p2, battlefield: [p2unit] },
      },
    };
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    const p2u = state.players.p2.battlefield.find(x => x.instanceId === 'p2-wounded');
    expect(p2u?.currentHealth).toBe(1); // untouched
  });
});
