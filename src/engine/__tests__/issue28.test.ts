import { describe, it, expect } from 'vitest';
import cardsData from '../../data/cards.json' assert { type: 'json' };
import type { Card, GameState, UnitInstance } from '../types.js';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';
import { processDeaths } from '../combat.js';

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

const z09 = allCards.find(c => c.id === 'Z09')!;
const z02 = allCards.find(c => c.id === 'Z02')!;
const z06 = allCards.find(c => c.id === 'Z06')!;
const z01 = allCards.find(c => c.id === 'Z01')!;

describe('Issue #28 — deathrattle on_death', () => {
  it('Z09 Champion Mzilikazi : token Z02 invoqué à la mort', () => {
    let state = startedGame();
    const champion = makeUnit('z09-1', z09, 0, 5); // already dead
    state = {
      ...state,
      players: { ...state.players, p1: { ...state.players.p1, battlefield: [champion] } },
    };
    state = processDeaths(state);
    expect(state.players.p1.battlefield).toHaveLength(1);
    expect(state.players.p1.battlefield[0].card.id).toBe(z02.id);
  });

  it('Z09 token is justSummoned=true (no immediate attack)', () => {
    let state = startedGame();
    const champion = makeUnit('z09-2', z09, 0, 5);
    state = {
      ...state,
      players: { ...state.players, p1: { ...state.players.p1, battlefield: [champion] } },
    };
    state = processDeaths(state);
    expect(state.players.p1.battlefield[0].justSummoned).toBe(true);
  });

  it('Z09 token goes to correct owner', () => {
    let state = startedGame();
    const champion = makeUnit('z09-p2', z09, 0, 5, 'p2');
    state = {
      ...state,
      players: { ...state.players, p2: { ...state.players.p2, battlefield: [champion] } },
    };
    state = processDeaths(state);
    expect(state.players.p2.battlefield).toHaveLength(1);
    expect(state.players.p2.battlefield[0].ownerId).toBe('p2');
    expect(state.players.p1.battlefield).toHaveLength(0);
  });

  it('Z09 sent to altar after death', () => {
    let state = startedGame();
    const altarLengthBefore = state.players.p1.altar.length;
    const champion = makeUnit('z09-altar', z09, 0, 5);
    state = {
      ...state,
      players: { ...state.players, p1: { ...state.players.p1, battlefield: [champion] } },
    };
    state = processDeaths(state);
    expect(state.players.p1.altar.length).toBe(altarLengthBefore + 1);
  });

  it('token capped at 7 units: no token spawned when battlefield full', () => {
    let state = startedGame();
    const filler = allCards.find(c => c.faction === 'zulu' && c.type === 'unit' && !c.keywords.includes('deathrattle'))!;
    const units = Array.from({ length: 6 }, (_, i) => makeUnit(`fill-${i}`, filler, 3, 3));
    const champion = makeUnit('z09-full', z09, 0, 5);
    state = {
      ...state,
      players: { ...state.players, p1: { ...state.players.p1, battlefield: [...units, champion] } },
    };
    state = processDeaths(state);
    // 6 alive fillers remain, no room for token
    expect(state.players.p1.battlefield).toHaveLength(6);
    expect(state.players.p1.battlefield.every(u => u.card.id !== 'Z02')).toBe(true);
  });

  it('unit without on_death effect: no deathrattle triggered', () => {
    let state = startedGame();
    const noEffect = makeUnit('z01-dead', z01, 0, 2);
    state = {
      ...state,
      players: { ...state.players, p1: { ...state.players.p1, battlefield: [noEffect] } },
    };
    state = processDeaths(state);
    expect(state.players.p1.battlefield).toHaveLength(0);
  });
});

describe('Issue #28 — grant_divine_shield_hero (Z06)', () => {
  it('Z06 spell sets heroDivineShield to true on caster', () => {
    let state = startedGame();
    state = {
      ...state,
      phase: 'principal',
      activePlayerId: 'p1',
      players: {
        ...state.players,
        p1: { ...state.players.p1, energy: 10, hand: [z06] },
      },
    };
    state = applyAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'Z06' });
    expect(state.players.p1.heroDivineShield).toBe(true);
  });

  it('hero with divine shield absorbs first damage and pops shield', () => {
    let state = startedGame();
    const attacker = makeUnit('z01-att', z01, 2, 2, 'p2');
    state = {
      ...state,
      phase: 'principal',
      activePlayerId: 'p2',
      players: {
        ...state.players,
        p1: { ...state.players.p1, heroDivineShield: true },
        p2: { ...state.players.p2, battlefield: [attacker] },
      },
    };
    state = applyAction(state, { type: 'ATTACK', playerId: 'p2', attackerInstanceId: 'z01-att', targetType: 'hero' });
    expect(state.players.p1.heroHealth).toBe(30); // no damage taken
    expect(state.players.p1.heroDivineShield).toBe(false); // shield popped
  });

  it('hero without divine shield takes damage normally', () => {
    let state = startedGame();
    const attacker = makeUnit('z01-att2', z01, 2, 2, 'p2');
    state = {
      ...state,
      phase: 'principal',
      activePlayerId: 'p2',
      players: {
        ...state.players,
        p1: { ...state.players.p1, heroDivineShield: false },
        p2: { ...state.players.p2, battlefield: [attacker] },
      },
    };
    state = applyAction(state, { type: 'ATTACK', playerId: 'p2', attackerInstanceId: 'z01-att2', targetType: 'hero' });
    expect(state.players.p1.heroHealth).toBe(28); // 30 - 2
    expect(state.players.p1.heroDivineShield).toBe(false);
  });

  it('heroDivineShield starts as false in initial state', () => {
    const state = startedGame();
    expect(state.players.p1.heroDivineShield).toBe(false);
    expect(state.players.p2.heroDivineShield).toBe(false);
  });
});
