import { describe, it, expect } from 'vitest';
import { initialGameState, drawCard, getOpponentId } from '../gameState.js';

describe('initialGameState', () => {
  it('creates a valid initial state', () => {
    const state = initialGameState('orisha', 'zulu');
    expect(state.phase).toBe('mulligan');
    expect(state.turn).toBe(1);
    expect(state.winner).toBeNull();
    expect(state.activePlayerId).toBe('p1');
  });

  it('p1 has orisha faction', () => {
    const state = initialGameState('orisha', 'zulu');
    expect(state.players.p1.hero.faction).toBe('orisha');
  });

  it('p2 has zulu faction', () => {
    const state = initialGameState('orisha', 'zulu');
    expect(state.players.p2.hero.faction).toBe('zulu');
  });

  it('both players start with 3 cards in hand', () => {
    const state = initialGameState('orisha', 'zulu');
    expect(state.players.p1.hand).toHaveLength(3);
    expect(state.players.p2.hand).toHaveLength(3);
  });

  it('heroes start with 30 HP', () => {
    const state = initialGameState('orisha', 'zulu');
    expect(state.players.p1.heroHealth).toBe(30);
    expect(state.players.p2.heroHealth).toBe(30);
  });

  it('players start with 0 energy', () => {
    const state = initialGameState('orisha', 'zulu');
    expect(state.players.p1.energy).toBe(0);
    expect(state.players.p2.energy).toBe(0);
  });
});

describe('drawCard', () => {
  it('moves top card from deck to hand', () => {
    const state = initialGameState('orisha', 'zulu');
    const deckSize = state.players.p1.deck.length;
    const handSize = state.players.p1.hand.length;
    const next = drawCard(state, 'p1');
    expect(next.players.p1.hand).toHaveLength(handSize + 1);
    expect(next.players.p1.deck).toHaveLength(deckSize - 1);
  });

  it('applies fatigue when deck is empty', () => {
    const state = initialGameState('orisha', 'zulu');
    const emptyDeckState = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, deck: [] },
      },
    };
    const next = drawCard(emptyDeckState, 'p1');
    expect(next.players.p1.fatigueDamage).toBe(1);
    expect(next.players.p1.heroHealth).toBe(29);
  });

  it('fatigue kills hero at 0 hp', () => {
    const state = initialGameState('orisha', 'zulu');
    const dyingState = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, deck: [], heroHealth: 1, fatigueDamage: 0 },
      },
    };
    const next = drawCard(dyingState, 'p1');
    expect(next.phase).toBe('gameover');
    expect(next.winner).toBe('p2');
  });
});

describe('getOpponentId', () => {
  it('p1 → p2', () => expect(getOpponentId('p1')).toBe('p2'));
  it('p2 → p1', () => expect(getOpponentId('p2')).toBe('p1'));
});
