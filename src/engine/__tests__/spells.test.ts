import { describe, it, expect } from 'vitest';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';
import type { GameState, Card, UnitInstance } from '../types.js';

function startedGame(): GameState {
  let state = initialGameState('orisha', 'zulu');
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

function makeDamageSpell(id: string, amount: number, scope: 'choose_enemy' | 'all_enemies' | 'enemy_hero' = 'choose_enemy'): Card {
  return {
    id,
    name: `Spell-${id}`,
    faction: 'neutral',
    type: 'spell',
    cost: 1,
    rarity: 'common',
    keywords: [],
    effects: [{ trigger: 'on_play', description: `${amount} dmg`, resolve: { kind: 'damage', amount, target: { scope } } }],
    flavorText: '',
    artUrl: '',
  };
}

function makeEnemy(id: string): UnitInstance {
  return {
    instanceId: id,
    card: { id, name: id, faction: 'neutral', type: 'unit', cost: 1, attack: 1, health: 5, rarity: 'common', keywords: [], effects: [], flavorText: '', artUrl: '' },
    currentAttack: 1, currentHealth: 5, maxHealth: 5,
    hasAttackedThisTurn: false, justSummoned: false, isSpectral: false, spectralExpiresAtTurn: null, hasDivineShield: false, ownerId: 'p2',
  };
}

describe('PLAY_SPELL — targeted damage', () => {
  it('deals damage to targeted unit', () => {
    let state = startedGame();
    const spell = makeDamageSpell('dmg3', 3);
    const enemy = makeEnemy('e1');
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [spell], energy: 5 },
        p2: { ...state.players.p2, battlefield: [enemy] },
      },
    };

    const next = applyAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'dmg3', targetInstanceId: 'e1' });
    expect(next.players.p2.battlefield[0].currentHealth).toBe(2); // 5 - 3
    expect(next.players.p1.energy).toBe(4);
    expect(next.players.p1.hand).toHaveLength(0);
    expect(next.players.p1.exile).toHaveLength(1);
  });

  it('kills unit and sends to altar', () => {
    let state = startedGame();
    const spell = makeDamageSpell('kill', 10);
    const enemy = makeEnemy('e2');
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [spell], energy: 5 },
        p2: { ...state.players.p2, battlefield: [enemy] },
      },
    };

    const next = applyAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'kill', targetInstanceId: 'e2' });
    expect(next.players.p2.battlefield).toHaveLength(0);
    expect(next.players.p2.altar).toHaveLength(1);
  });

  it('deals damage to enemy hero', () => {
    let state = startedGame();
    const spell = makeDamageSpell('bolt', 5);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [spell], energy: 5 },
      },
    };

    const next = applyAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'bolt', targetInstanceId: 'hero_p2' });
    expect(next.players.p2.heroHealth).toBe(25);
  });

  it('kills hero ends game', () => {
    let state = startedGame();
    const spell = makeDamageSpell('lethal', 30);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [spell], energy: 5 },
      },
    };

    const next = applyAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'lethal', targetInstanceId: 'hero_p2' });
    expect(next.phase).toBe('gameover');
    expect(next.winner).toBe('p1');
  });

  it('deals damage to all enemies', () => {
    let state = startedGame();
    const spell = makeDamageSpell('aoe', 2, 'all_enemies');
    const e1 = makeEnemy('e1');
    const e2 = makeEnemy('e2');
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, hand: [spell], energy: 5 },
        p2: { ...state.players.p2, battlefield: [e1, e2] },
      },
    };

    const next = applyAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'aoe' });
    expect(next.players.p2.battlefield[0].currentHealth).toBe(3);
    expect(next.players.p2.battlefield[1].currentHealth).toBe(3);
  });
});

describe('USE_HERO_POWER', () => {
  it('Shango deals 1 damage to targeted unit', () => {
    let state = startedGame(); // p1 = orisha (Shango)
    const enemy = makeEnemy('e1');
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, energy: 5 },
        p2: { ...state.players.p2, battlefield: [enemy] },
      },
    };

    const next = applyAction(state, { type: 'USE_HERO_POWER', playerId: 'p1', targetInstanceId: 'e1' });
    expect(next.players.p2.battlefield[0].currentHealth).toBe(4);
    expect(next.players.p1.energy).toBe(3);
    expect(next.players.p1.heroPowerUsedThisTurn).toBe(true);
  });

  it('cannot use hero power twice per turn', () => {
    let state = startedGame();
    state = { ...state, players: { ...state.players, p1: { ...state.players.p1, energy: 10 } } };
    state = applyAction(state, { type: 'USE_HERO_POWER', playerId: 'p1', targetInstanceId: 'hero_p2' });
    const hpBefore = state.players.p2.heroHealth;
    const next = applyAction(state, { type: 'USE_HERO_POWER', playerId: 'p1', targetInstanceId: 'hero_p2' });
    expect(next.players.p2.heroHealth).toBe(hpBefore); // no second use
  });

  it('requires 2 energy', () => {
    const state = startedGame();
    const lowEnergy = { ...state, players: { ...state.players, p1: { ...state.players.p1, energy: 1 } } };
    const next = applyAction(lowEnergy, { type: 'USE_HERO_POWER', playerId: 'p1', targetInstanceId: 'hero_p2' });
    expect(next.players.p1.heroPowerUsedThisTurn).toBe(false);
  });
});

describe('PLAY_SPELL — Orisha griot discount', () => {
  it('applies -1 cost after 3 spells', () => {
    let state = startedGame();
    const spell = makeDamageSpell('cheap', 1);

    // Play 3 spells via hero power simulation (griot tracking)
    state = { ...state, players: { ...state.players, p1: { ...state.players.p1, griotState: { ...state.players.p1.griotState, totalSpellsPlayed: 3, nextSpellDiscount: true }, hand: [spell], energy: 5 } } };

    const next = applyAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'cheap' });
    expect(next.players.p1.energy).toBe(5); // cost was 1, discount = -1, effective cost = 0
  });
});
