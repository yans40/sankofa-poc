import { describe, it, expect } from 'vitest';
import type { GameState, UnitInstance, Card } from '../../types.js';
import { scoreAction } from '../scoring.js';
import { initialGameState } from '../../gameState.js';
import { applyAction } from '../../reducers.js';

function startedGame(): GameState {
  let state = initialGameState('orisha', 'zulu');
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

function makeUnit(
  ownerId: 'p1' | 'p2',
  attack: number,
  health: number,
  extra: Partial<UnitInstance> = {},
): UnitInstance {
  return {
    instanceId: `u-${Math.random().toString(36).slice(2)}`,
    card: {
      id: 'test',
      name: 'Test',
      faction: 'neutral',
      type: 'unit',
      cost: 1,
      attack,
      health,
      rarity: 'common',
      keywords: [],
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
    ...extra,
  };
}

function withBattlefield(state: GameState, p1Units: UnitInstance[], p2Units: UnitInstance[]): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      p1: { ...state.players.p1, battlefield: p1Units },
      p2: { ...state.players.p2, battlefield: p2Units },
    },
  };
}

function cardInHand(state: GameState, playerId: 'p1' | 'p2', card: Card): GameState {
  const player = state.players[playerId];
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, hand: [card, ...player.hand] },
    },
  };
}

function withEnergy(state: GameState, playerId: 'p1' | 'p2', energy: number): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...state.players[playerId], energy, maxEnergy: energy },
    },
  };
}

describe('scoreAction — END_TURN', () => {
  it('returns 0', () => {
    const state = startedGame();
    const score = scoreAction(state, { type: 'END_TURN', playerId: 'p1' }, 'p1');
    expect(score).toBe(0);
  });
});

describe('scoreAction — PLAY_UNIT', () => {
  it('scores a 3/4 at cost 3 as +4 (7 - 3)', () => {
    let state = startedGame();
    const unitCard: Card = {
      id: 'test-unit-3-4',
      name: 'Test 3/4',
      faction: 'neutral',
      type: 'unit',
      cost: 3,
      attack: 3,
      health: 4,
      rarity: 'common',
      keywords: [],
      effects: [],
      flavorText: '',
      artUrl: '',
    };
    state = cardInHand(state, 'p1', unitCard);
    const score = scoreAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'test-unit-3-4', targetSlot: 0 }, 'p1');
    expect(score).toBe(4); // (3+4) - 3 = 4
  });

  it('adds +2 bonus for unit with battlecry (on_play effect)', () => {
    let state = startedGame();
    const battlecryCard: Card = {
      id: 'test-battlecry',
      name: 'Battlecry Unit',
      faction: 'neutral',
      type: 'unit',
      cost: 3,
      attack: 3,
      health: 4,
      rarity: 'common',
      keywords: ['battlecry'],
      effects: [
        {
          trigger: 'on_play',
          description: 'Deal 1 damage',
          resolve: { kind: 'damage', amount: 1, target: { scope: 'enemy_hero' } },
        },
      ],
      flavorText: '',
      artUrl: '',
    };
    state = cardInHand(state, 'p1', battlecryCard);
    const score = scoreAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'test-battlecry', targetSlot: 0 }, 'p1');
    expect(score).toBe(6); // (3+4) - 3 + 2 battlecry bonus = 6
  });

  it('can score negative for overcosted unit', () => {
    let state = startedGame();
    const weakCard: Card = {
      id: 'test-weak',
      name: 'Weak',
      faction: 'neutral',
      type: 'unit',
      cost: 5,
      attack: 1,
      health: 1,
      rarity: 'common',
      keywords: [],
      effects: [],
      flavorText: '',
      artUrl: '',
    };
    state = cardInHand(state, 'p1', weakCard);
    const score = scoreAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'test-weak', targetSlot: 0 }, 'p1');
    expect(score).toBe(-3); // (1+1) - 5 = -3
  });
});

describe('scoreAction — PLAY_SPELL', () => {
  it('kill-guaranteed damage spell scores dmg × 1.5 − cost', () => {
    let state = startedGame();
    state = withEnergy(state, 'p1', 10);
    const spellCard: Card = {
      id: 'test-kill-spell',
      name: 'Kill Spell',
      faction: 'neutral',
      type: 'spell',
      cost: 2,
      rarity: 'common',
      keywords: [],
      effects: [
        {
          trigger: 'on_play',
          description: 'Deal 3 damage to target',
          resolve: { kind: 'damage', amount: 3, target: { scope: 'choose_enemy' } },
        },
      ],
      flavorText: '',
      artUrl: '',
    };
    const target = makeUnit('p2', 2, 3); // exactly 3 hp → killed by 3 dmg
    state = cardInHand(state, 'p1', spellCard);
    state = withBattlefield(state, [], [target]);

    const score = scoreAction(
      state,
      { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'test-kill-spell', targetInstanceId: target.instanceId },
      'p1',
    );
    expect(score).toBe(3 * 1.5 - 2); // 4.5 - 2 = 2.5
  });

  it('non-kill damage spell scores dmg × 0.5 − cost', () => {
    let state = startedGame();
    state = withEnergy(state, 'p1', 10);
    const spellCard: Card = {
      id: 'test-chip-spell',
      name: 'Chip Spell',
      faction: 'neutral',
      type: 'spell',
      cost: 1,
      rarity: 'common',
      keywords: [],
      effects: [
        {
          trigger: 'on_play',
          description: 'Deal 2 damage to target',
          resolve: { kind: 'damage', amount: 2, target: { scope: 'choose_enemy' } },
        },
      ],
      flavorText: '',
      artUrl: '',
    };
    const target = makeUnit('p2', 1, 5); // 5 hp → not killed by 2 dmg
    state = cardInHand(state, 'p1', spellCard);
    state = withBattlefield(state, [], [target]);

    const score = scoreAction(
      state,
      { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'test-chip-spell', targetInstanceId: target.instanceId },
      'p1',
    );
    expect(score).toBe(2 * 0.5 - 1); // 1 - 1 = 0
  });

  it('heal spell on full-HP hero scores -Infinity', () => {
    let state = startedGame();
    state = withEnergy(state, 'p1', 10);
    const healCard: Card = {
      id: 'test-heal-hero',
      name: 'Heal Hero',
      faction: 'neutral',
      type: 'spell',
      cost: 2,
      rarity: 'common',
      keywords: [],
      effects: [
        {
          trigger: 'on_play',
          description: 'Heal hero 5',
          resolve: { kind: 'heal', amount: 5, target: { scope: 'self' } },
        },
      ],
      flavorText: '',
      artUrl: '',
    };
    state = cardInHand(state, 'p1', healCard);
    // Hero starts at full HP (30/30)
    const score = scoreAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'test-heal-hero' }, 'p1');
    expect(score).toBe(-Infinity);
  });

  it('heal spell on damaged hero scores positively', () => {
    let state = startedGame();
    state = withEnergy(state, 'p1', 10);
    state = {
      ...state,
      players: { ...state.players, p1: { ...state.players.p1, heroHealth: 20 } },
    };
    const healCard: Card = {
      id: 'test-heal-hero2',
      name: 'Heal Hero',
      faction: 'neutral',
      type: 'spell',
      cost: 2,
      rarity: 'common',
      keywords: [],
      effects: [
        {
          trigger: 'on_play',
          description: 'Heal hero 5',
          resolve: { kind: 'heal', amount: 5, target: { scope: 'self' } },
        },
      ],
      flavorText: '',
      artUrl: '',
    };
    state = cardInHand(state, 'p1', healCard);
    const score = scoreAction(state, { type: 'PLAY_SPELL', playerId: 'p1', cardId: 'test-heal-hero2' }, 'p1');
    expect(score).toBeGreaterThan(0); // 5 * 0.8 - 2 = 2
    expect(score).toBe(5 * 0.8 - 2);
  });
});

describe('scoreAction — ATTACK', () => {
  it('favourable trade (attacker survives, target dies) scores > 0', () => {
    const state = startedGame();
    const attacker = makeUnit('p1', 3, 4); // 3 attack, 4 health
    const target = makeUnit('p2', 1, 2);   // 1 attack, 2 health — killed by 3 atk, counter = 1 (survives)
    const s = withBattlefield(state, [attacker], [target]);

    const score = scoreAction(
      s,
      { type: 'ATTACK', playerId: 'p1', attackerInstanceId: attacker.instanceId, targetType: 'unit', targetInstanceId: target.instanceId },
      'p1',
    );
    // damage dealt = 2 (min(3, 2)), kill bonus = 1+2 = 3, no attacker penalty
    // score = 2 * 1.2 + (1+2) = 2.4 + 3 = 5.4
    expect(score).toBeGreaterThan(0);
  });

  it('unfavourable trade (attacker dies, no kill) scores negatively', () => {
    const state = startedGame();
    const attacker = makeUnit('p1', 1, 1); // 1 atk, 1 hp — will die
    const target = makeUnit('p2', 5, 10);  // 5 atk, 10 hp — not killed by 1 atk
    const s = withBattlefield(state, [attacker], [target]);

    const score = scoreAction(
      s,
      { type: 'ATTACK', playerId: 'p1', attackerInstanceId: attacker.instanceId, targetType: 'unit', targetInstanceId: target.instanceId },
      'p1',
    );
    // damage = 1, no kill, attacker dies (penalty = 1+1 = 2)
    // score = 1 * 1.2 + 0 - 2 = -0.8
    expect(score).toBeLessThan(0);
  });

  it('hero attack scores positive', () => {
    const state = startedGame();
    const attacker = makeUnit('p1', 4, 5);
    const s = withBattlefield(state, [attacker], []);

    const score = scoreAction(
      s,
      { type: 'ATTACK', playerId: 'p1', attackerInstanceId: attacker.instanceId, targetType: 'hero' },
      'p1',
    );
    expect(score).toBe(4 * 1.5); // 6
  });
});

describe('scoreAction — divine shield interactions', () => {
  it('attacking a unit with divine shield deals 0 effective damage', () => {
    const state = startedGame();
    const attacker = makeUnit('p1', 4, 4);
    const target = makeUnit('p2', 2, 3, { hasDivineShield: true });
    const s = withBattlefield(state, [attacker], [target]);

    const score = scoreAction(
      s,
      { type: 'ATTACK', playerId: 'p1', attackerInstanceId: attacker.instanceId, targetType: 'unit', targetInstanceId: target.instanceId },
      'p1',
    );
    // divine shield absorbed: damage = 0, no kill, attacker takes 2 dmg but survives
    // score = 0 * 1.2 + 0 - 0 (doesn't die) = 0 or slightly negative
    expect(score).toBeLessThanOrEqual(0);
  });

  it('attacker with divine shield does not lose value when counterattacked', () => {
    const state = startedGame();
    const attacker = makeUnit('p1', 2, 1, { hasDivineShield: true }); // 1 hp but DS
    const target = makeUnit('p2', 5, 3); // target has 3 hp, killed by 2 atk
    const s = withBattlefield(state, [attacker], [target]);

    const score = scoreAction(
      s,
      { type: 'ATTACK', playerId: 'p1', attackerInstanceId: attacker.instanceId, targetType: 'unit', targetInstanceId: target.instanceId },
      'p1',
    );
    // DS protects attacker from 5 dmg counter: no attacker penalty
    // kill: targetVal = 5+3 = 8, damage = min(2,3) = 2
    // score = 2 * 1.2 + 8 = 10.4
    expect(score).toBeGreaterThan(0);
  });
});
