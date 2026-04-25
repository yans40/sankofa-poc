import { describe, it, expect } from 'vitest';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';
import type { GameState, UnitInstance } from '../types.js';

function startedGame(): GameState {
  let state = initialGameState('orisha', 'zulu');
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

function makeUnit(ownerId: 'p1' | 'p2', attack: number, health: number, keywords: UnitInstance['card']['keywords'] = []): UnitInstance {
  return {
    instanceId: `unit-${Math.random()}`,
    card: {
      id: 'test',
      name: 'Test Unit',
      faction: 'neutral',
      type: 'unit',
      cost: 1,
      attack,
      health,
      rarity: 'common',
      keywords,
      effects: [],
      flavorText: '',
      artUrl: '',
    },
    currentAttack: attack,
    currentHealth: health,
    maxHealth: health,
    hasAttackedThisTurn: false,
    justSummoned: false,
    isSpectral: false,
    spectralExpiresAtTurn: null,
    hasDivineShield: false,
    ownerId,
  };
}

describe('ATTACK — unit vs unit', () => {
  it('damages both units simultaneously', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 3, 4);
    const defender = makeUnit('p2', 2, 5);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [defender] },
      },
    };

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'unit',
      targetInstanceId: defender.instanceId,
    });

    const p1Unit = next.players.p1.battlefield[0];
    const p2Unit = next.players.p2.battlefield[0];
    expect(p1Unit.currentHealth).toBe(2); // 4 - 2
    expect(p2Unit.currentHealth).toBe(2); // 5 - 3
  });

  it('kills unit when health reaches 0 and sends to altar', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 5, 4);
    const defender = makeUnit('p2', 1, 3);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [defender] },
      },
    };

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'unit',
      targetInstanceId: defender.instanceId,
    });

    expect(next.players.p2.battlefield).toHaveLength(0);
    expect(next.players.p2.altar).toHaveLength(1);
  });

  it('unit cannot attack twice per turn', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 2, 5);
    const defender = makeUnit('p2', 1, 5);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [defender] },
      },
    };

    let next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'unit',
      targetInstanceId: defender.instanceId,
    });

    const attackerAfter = next.players.p1.battlefield[0];
    expect(attackerAfter.hasAttackedThisTurn).toBe(true);

    // Second attack should fail
    const before = next.players.p2.battlefield[0]?.currentHealth;
    next = applyAction(next, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'unit',
      targetInstanceId: defender.instanceId,
    });
    expect(next.players.p2.battlefield[0]?.currentHealth).toBe(before);
  });
});

describe('ATTACK — divine shield', () => {
  it('absorbs first damage without HP loss', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 3, 4);
    const defender: UnitInstance = { ...makeUnit('p2', 1, 5), hasDivineShield: true };
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [defender] },
      },
    };

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'unit',
      targetInstanceId: defender.instanceId,
    });

    const p2Unit = next.players.p2.battlefield[0];
    expect(p2Unit.currentHealth).toBe(5); // shield absorbed
    expect(p2Unit.hasDivineShield).toBe(false);
  });
});

describe('ATTACK — hero', () => {
  it('deals damage to enemy hero', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 5, 5);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [] },
      },
    };

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'hero',
    });

    expect(next.players.p2.heroHealth).toBe(25);
  });

  it('winning blow sets gameover', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 30, 10);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [] },
      },
    };

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'hero',
    });

    expect(next.phase).toBe('gameover');
    expect(next.winner).toBe('p1');
  });
});

describe('ATTACK — taunt', () => {
  it('cannot attack non-taunt unit if taunt exists', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 3, 4);
    const taunt = makeUnit('p2', 2, 5, ['taunt']);
    const nonTaunt = makeUnit('p2', 1, 5);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [taunt, nonTaunt] },
      },
    };

    const before = state.players.p2.battlefield[1].currentHealth;
    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'unit',
      targetInstanceId: nonTaunt.instanceId,
    });

    // Non-taunt should be untouched
    expect(next.players.p2.battlefield[1]?.currentHealth).toBe(before);
  });

  it('cannot attack hero if taunt exists', () => {
    let state = startedGame();
    const attacker = makeUnit('p1', 3, 4);
    const taunt = makeUnit('p2', 2, 5, ['taunt']);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [attacker] },
        p2: { ...state.players.p2, battlefield: [taunt] },
      },
    };

    const next = applyAction(state, {
      type: 'ATTACK',
      playerId: 'p1',
      attackerInstanceId: attacker.instanceId,
      targetType: 'hero',
    });

    expect(next.players.p2.heroHealth).toBe(30); // hero untouched
  });
});
