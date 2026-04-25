import { describe, it, expect } from 'vitest';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';
import { sendToAltar } from '../ancestors.js';
import type { GameState, UnitInstance, Card } from '../types.js';

function startedGame(): GameState {
  let state = initialGameState('orisha', 'zulu');
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

function makeCard(id = 'test', cost = 3, attack = 2, health = 2): Card {
  return {
    id,
    name: 'Test',
    faction: 'neutral',
    type: 'unit',
    cost,
    attack,
    health,
    rarity: 'common',
    keywords: [],
    effects: [],
    flavorText: '',
    artUrl: '',
    reincarnationCount: 0,
  };
}

function makeUnit(ownerId: 'p1' | 'p2', card: Card): UnitInstance {
  return {
    instanceId: `unit-${Math.random()}`,
    card,
    currentAttack: card.attack ?? 0,
    currentHealth: card.health ?? 0,
    maxHealth: card.health ?? 0,
    hasAttackedThisTurn: false,
    justSummoned: false,
    isSpectral: false,
    spectralExpiresAtTurn: null,
    hasDivineShield: false,
    ownerId,
  };
}

describe('sendToAltar', () => {
  it('adds unit card to player altar', () => {
    const state = startedGame();
    const card = makeCard();
    const unit = makeUnit('p1', card);
    const next = sendToAltar(state, 'p1', unit);
    expect(next.players.p1.altar).toHaveLength(1);
    expect(next.players.p1.altar[0].id).toBe('test');
  });

  it('FIFO overflow evicts oldest card to exile when altar is full (6 cards)', () => {
    let state = startedGame();
    for (let i = 0; i < 6; i++) {
      const unit = makeUnit('p1', makeCard(`card-${i}`));
      state = sendToAltar(state, 'p1', unit);
    }
    expect(state.players.p1.altar).toHaveLength(6);

    const newUnit = makeUnit('p1', makeCard('card-7'));
    const next = sendToAltar(state, 'p1', newUnit);
    expect(next.players.p1.altar).toHaveLength(6);
    expect(next.players.p1.exile).toHaveLength(1);
    expect(next.players.p1.exile[0].id).toBe('card-0');
    expect(next.players.p1.altar[5].id).toBe('card-7');
  });

  it('sends directly to exile after 2 reincarnations (anti-loop)', () => {
    const state = startedGame();
    const card = makeCard('loop-card', 2, 1, 1);
    const unit = makeUnit('p1', { ...card, reincarnationCount: 2 });
    const next = sendToAltar(state, 'p1', unit);
    expect(next.players.p1.altar).toHaveLength(0);
    expect(next.players.p1.exile).toHaveLength(1);
  });
});

describe('INVOKE_ANCESTOR', () => {
  it('reinvokes card with +1/+1 and Spectral status at reduced cost', () => {
    let state = startedGame();
    const card = makeCard('ancestor', 4, 2, 3);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, altar: [card], energy: 10, maxEnergy: 10 },
      },
    };

    const next = applyAction(state, {
      type: 'INVOKE_ANCESTOR',
      playerId: 'p1',
      altarIndex: 0,
      targetSlot: 0,
    });

    const unit = next.players.p1.battlefield[0];
    expect(unit).toBeDefined();
    expect(unit.isSpectral).toBe(true);
    expect(unit.currentAttack).toBe(3); // 2 + 1
    expect(unit.currentHealth).toBe(4); // 3 + 1
    expect(next.players.p1.energy).toBe(7); // 10 - 3 (cost 4-1)
    expect(next.players.p1.altar).toHaveLength(0);
  });

  it('minimum cost is 1', () => {
    let state = startedGame();
    const card = makeCard('cheap', 1, 1, 1);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, altar: [card], energy: 5 },
      },
    };

    const next = applyAction(state, {
      type: 'INVOKE_ANCESTOR',
      playerId: 'p1',
      altarIndex: 0,
      targetSlot: 0,
    });

    expect(next.players.p1.energy).toBe(4); // min cost 1
  });

  it('spectral expires at turn + 1', () => {
    let state = startedGame();
    const card = makeCard('spectral', 3, 2, 2);
    state = {
      ...state,
      turn: 5,
      players: {
        ...state.players,
        p1: { ...state.players.p1, altar: [card], energy: 5 },
      },
    };

    const next = applyAction(state, {
      type: 'INVOKE_ANCESTOR',
      playerId: 'p1',
      altarIndex: 0,
      targetSlot: 0,
    });

    expect(next.players.p1.battlefield[0].spectralExpiresAtTurn).toBe(6);
  });

  it('requires sufficient energy', () => {
    let state = startedGame();
    const card = makeCard('expensive', 5, 3, 3);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, altar: [card], energy: 2 },
      },
    };

    const next = applyAction(state, {
      type: 'INVOKE_ANCESTOR',
      playerId: 'p1',
      altarIndex: 0,
      targetSlot: 0,
    });

    expect(next.players.p1.battlefield).toHaveLength(0);
  });
});
