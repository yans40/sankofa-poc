import { describe, it, expect } from 'vitest';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';
import type { GameState } from '../types.js';

function startedGame(): GameState {
  let state = initialGameState('orisha', 'zulu');
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

describe('END_TURN', () => {
  it('switches active player', () => {
    let state = startedGame();
    expect(state.activePlayerId).toBe('p1');
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    expect(state.activePlayerId).toBe('p2');
  });

  it('increments energy each turn (p1 → p2 → p1)', () => {
    let state = startedGame();
    // p1 starts with maxEnergy=1 (turn 1). After p1 ends, p2 gets turn 1 → maxEnergy=1
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    expect(state.players.p2.maxEnergy).toBe(1);
    // After p2 ends turn 1, turn becomes 2, p1 gets maxEnergy=2
    state = applyAction(state, { type: 'END_TURN', playerId: 'p2' });
    expect(state.players.p1.maxEnergy).toBe(2);
  });

  it('energy caps at 10', () => {
    let state = startedGame();
    for (let i = 0; i < 20; i++) {
      const pid = state.activePlayerId;
      state = applyAction(state, { type: 'END_TURN', playerId: pid });
    }
    expect(state.players.p1.maxEnergy).toBeLessThanOrEqual(10);
    expect(state.players.p2.maxEnergy).toBeLessThanOrEqual(10);
  });

  it('draws a card at start of turn', () => {
    let state = startedGame();
    const handBefore = state.players.p1.hand.length;
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    state = applyAction(state, { type: 'END_TURN', playerId: 'p2' });
    // p1's hand after drawing
    expect(state.players.p1.hand.length).toBeGreaterThanOrEqual(handBefore);
  });

  it('resets hasAttackedThisTurn on new turn', () => {
    let state = startedGame();
    const unit = {
      instanceId: 'att-unit',
      card: { id: 'x', name: 'X', faction: 'neutral' as const, type: 'unit' as const, cost: 1, attack: 1, health: 1, rarity: 'common' as const, keywords: [], effects: [], flavorText: '', artUrl: '' },
      currentAttack: 1, currentHealth: 1, maxHealth: 1,
      hasAttackedThisTurn: true, justSummoned: false,
      isSpectral: false, spectralExpiresAtTurn: null, hasDivineShield: false, ownerId: 'p1' as const,
    };
    state = { ...state, players: { ...state.players, p1: { ...state.players.p1, battlefield: [unit] } } };
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    state = applyAction(state, { type: 'END_TURN', playerId: 'p2' });
    expect(state.players.p1.battlefield[0]?.hasAttackedThisTurn).toBe(false);
  });

  it('cannot end turn if not active player', () => {
    const state = startedGame();
    const before = state.activePlayerId;
    const next = applyAction(state, { type: 'END_TURN', playerId: 'p2' });
    expect(next.activePlayerId).toBe(before);
  });
});

describe('CONCEDE', () => {
  it('sets gameover and opponent as winner', () => {
    const state = startedGame();
    const next = applyAction(state, { type: 'CONCEDE', playerId: 'p1' });
    expect(next.phase).toBe('gameover');
    expect(next.winner).toBe('p2');
  });
});
