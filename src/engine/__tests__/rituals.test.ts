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

function makeRitualCard(charges = 2): Card {
  return {
    id: 'test-ritual',
    name: 'Rituel Test',
    faction: 'neutral',
    type: 'ritual',
    cost: 2,
    rarity: 'rare',
    keywords: [],
    effects: [
      {
        trigger: 'on_play',
        description: 'Test: soigne héros de 5 PV',
        resolve: { kind: 'heal', amount: 5, target: { scope: 'self' } },
      },
    ],
    flavorText: '',
    artUrl: '',
    initialCharges: charges,
  };
}

describe('PLAY_RITUAL', () => {
  it('places ritual in zone with correct charges', () => {
    let state = startedGame();
    const ritual = makeRitualCard(2);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [ritual], energy: 5 },
      },
    };

    const next = applyAction(state, { type: 'PLAY_RITUAL', playerId: 'p1', cardId: 'test-ritual' });
    expect(next.players.p1.rituals).toHaveLength(1);
    expect(next.players.p1.rituals[0].remainingCharges).toBe(2);
    expect(next.players.p1.rituals[0].ready).toBe(false);
    expect(next.players.p1.energy).toBe(3);
    expect(next.players.p1.hand).toHaveLength(0);
  });
});

describe('MAKE_OFFERING', () => {
  it('reduces charges and marks ready at 0', () => {
    let state = startedGame();
    const ritual = makeRitualCard(1);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [ritual], energy: 5 },
      },
    };
    state = applyAction(state, { type: 'PLAY_RITUAL', playerId: 'p1', cardId: 'test-ritual' });
    const ritualInstanceId = state.players.p1.rituals[0].instanceId;

    const next = applyAction(state, {
      type: 'MAKE_OFFERING',
      playerId: 'p1',
      ritualInstanceId,
      offeringType: 'energy',
      payload: null,
    });

    expect(next.players.p1.rituals[0].remainingCharges).toBe(0);
    expect(next.players.p1.rituals[0].ready).toBe(true);
  });

  it('offering with card removes it from hand to exile', () => {
    let state = startedGame();
    const ritual = makeRitualCard(2);
    const handCard: Card = {
      id: 'fodder',
      name: 'Fodder',
      faction: 'neutral',
      type: 'spell',
      cost: 1,
      rarity: 'common',
      keywords: [],
      effects: [],
      flavorText: '',
      artUrl: '',
    };
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [ritual, handCard], energy: 5 },
      },
    };
    state = applyAction(state, { type: 'PLAY_RITUAL', playerId: 'p1', cardId: 'test-ritual' });
    const ritualInstanceId = state.players.p1.rituals[0].instanceId;

    const next = applyAction(state, {
      type: 'MAKE_OFFERING',
      playerId: 'p1',
      ritualInstanceId,
      offeringType: 'card',
      payload: 'fodder',
    });

    expect(next.players.p1.hand.find(c => c.id === 'fodder')).toBeUndefined();
    expect(next.players.p1.exile.find(c => c.id === 'fodder')).toBeDefined();
  });
});

describe('Ritual resolution (aurore)', () => {
  it('resolves ready ritual at turn start and heals hero', () => {
    let state = startedGame();
    const ritual = makeRitualCard(1);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [ritual], energy: 5, heroHealth: 15, heroMaxHealth: 30 },
      },
    };
    state = applyAction(state, { type: 'PLAY_RITUAL', playerId: 'p1', cardId: 'test-ritual' });
    const ritualInstanceId = state.players.p1.rituals[0].instanceId;

    // Make offering to complete ritual
    state = applyAction(state, {
      type: 'MAKE_OFFERING',
      playerId: 'p1',
      ritualInstanceId,
      offeringType: 'energy',
      payload: null,
    });
    expect(state.players.p1.rituals[0].ready).toBe(true);

    // End turn p1, end turn p2 → p1 gets next turn with aurore resolution
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    state = applyAction(state, { type: 'END_TURN', playerId: 'p2' });

    // Ritual should have resolved and healed
    expect(state.players.p1.rituals).toHaveLength(0);
    expect(state.players.p1.heroHealth).toBe(20); // 15 + 5
  });
});
