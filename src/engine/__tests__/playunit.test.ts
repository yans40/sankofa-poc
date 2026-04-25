import { describe, it, expect } from 'vitest';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';
import type { GameState, Card } from '../types.js';

function startedGame(): GameState {
  let state = initialGameState('orisha', 'zulu');
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

function makeUnit(id = 'unit', cost = 1, hasCharge = false): Card {
  return {
    id,
    name: 'Test Unit',
    faction: 'neutral',
    type: 'unit',
    cost,
    attack: 2,
    health: 3,
    rarity: 'common',
    keywords: hasCharge ? ['charge'] : [],
    effects: [],
    flavorText: '',
    artUrl: '',
    reincarnationCount: 0,
  };
}

describe('PLAY_UNIT', () => {
  it('plays unit and deducts energy', () => {
    let state = startedGame();
    const card = makeUnit('unit1', 1);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [card], energy: 3 },
      },
    };

    const next = applyAction(state, {
      type: 'PLAY_UNIT',
      playerId: 'p1',
      cardId: 'unit1',
      targetSlot: 0,
    });

    expect(next.players.p1.battlefield).toHaveLength(1);
    expect(next.players.p1.hand).toHaveLength(0);
    expect(next.players.p1.energy).toBe(2);
  });

  it('unit without charge is marked justSummoned and cannot attack', () => {
    let state = startedGame();
    const card = makeUnit('slow', 1, false);
    const defender = {
      instanceId: 'def', card: makeUnit('def'), currentAttack: 1, currentHealth: 5, maxHealth: 5,
      hasAttackedThisTurn: false, justSummoned: false, isSpectral: false, spectralExpiresAtTurn: null,
      hasDivineShield: false, ownerId: 'p2' as const,
    };
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [card], energy: 5 },
        p2: { ...state.players.p2, battlefield: [defender] },
      },
    };

    state = applyAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'slow', targetSlot: 0 });
    const unit = state.players.p1.battlefield[0];
    expect(unit.justSummoned).toBe(true);

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: unit.instanceId,
      targetType: 'unit',
      targetInstanceId: 'def',
    });
    expect(next.players.p2.battlefield[0].currentHealth).toBe(5); // no damage
  });

  it('unit with charge can attack immediately', () => {
    let state = startedGame();
    const card = makeUnit('fast', 1, true);
    const defender = {
      instanceId: 'def', card: makeUnit('def'), currentAttack: 1, currentHealth: 5, maxHealth: 5,
      hasAttackedThisTurn: false, justSummoned: false, isSpectral: false, spectralExpiresAtTurn: null,
      hasDivineShield: false, ownerId: 'p2' as const,
    };
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [card], energy: 5 },
        p2: { ...state.players.p2, battlefield: [defender] },
      },
    };

    state = applyAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'fast', targetSlot: 0 });
    const unit = state.players.p1.battlefield[0];
    expect(unit.justSummoned).toBe(false);

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: unit.instanceId,
      targetType: 'unit',
      targetInstanceId: 'def',
    });
    expect(next.players.p2.battlefield[0].currentHealth).toBe(3); // 5 - 2
  });

  it('fails when insufficient energy', () => {
    let state = startedGame();
    const card = makeUnit('expensive', 5);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [card], energy: 2 },
      },
    };

    const next = applyAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'expensive', targetSlot: 0 });
    expect(next.players.p1.battlefield).toHaveLength(0);
    expect(next.players.p1.energy).toBe(2);
  });

  it('max 7 units on battlefield', () => {
    let state = startedGame();
    const units = Array.from({ length: 7 }, (_, i) => ({
      instanceId: `u${i}`,
      card: makeUnit(`u${i}`),
      currentAttack: 2, currentHealth: 3, maxHealth: 3,
      hasAttackedThisTurn: false, justSummoned: false,
      isSpectral: false, spectralExpiresAtTurn: null, hasDivineShield: false, ownerId: 'p1' as const,
    }));
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: units, hand: [makeUnit('overflow', 1)], energy: 5 },
      },
    };

    const next = applyAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'overflow', targetSlot: 0 });
    expect(next.players.p1.battlefield).toHaveLength(7);
  });
});
