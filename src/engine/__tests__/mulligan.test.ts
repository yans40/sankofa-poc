import { describe, it, expect } from 'vitest';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';

describe('MULLIGAN', () => {
  it('replaces selected cards and stays in mulligan if p2 not done', () => {
    const state = initialGameState('orisha', 'zulu');
    const next = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [0] });
    expect(next.mulliganDone.p1).toBe(true);
    expect(next.mulliganDone.p2).toBe(false);
    expect(next.phase).toBe('mulligan');
    expect(next.players.p1.hand).toHaveLength(3);
  });

  it('starts game when both players complete mulligan', () => {
    let state = initialGameState('orisha', 'zulu');
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
    expect(state.phase).toBe('principal');
    expect(state.activePlayerId).toBe('p1');
  });

  it('cannot mulligan twice', () => {
    let state = initialGameState('orisha', 'zulu');
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
    const before = state.players.p1.hand;
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [0] });
    expect(state.players.p1.hand).toEqual(before);
  });

  it('game starts with correct energy after mulligan', () => {
    let state = initialGameState('orisha', 'zulu');
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
    expect(state.players.p1.maxEnergy).toBe(1);
    expect(state.players.p1.energy).toBe(1);
  });
});
