import { describe, it, expect } from 'vitest';
import type { GameState, UnitInstance, Card } from '../../types.js';
import { generateLegalMoves } from '../moveGenerator.js';
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
    instanceId: `u-${ownerId}-${Math.random().toString(36).slice(2)}`,
    card: {
      id: 'test',
      name: 'Test Unit',
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

function withEnergy(state: GameState, playerId: 'p1' | 'p2', energy: number): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...state.players[playerId], energy, maxEnergy: energy },
    },
  };
}

function withHand(state: GameState, playerId: 'p1' | 'p2', cards: Card[]): GameState {
  return {
    ...state,
    players: { ...state.players, [playerId]: { ...state.players[playerId], hand: cards } },
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

describe('generateLegalMoves — empty hand, no units', () => {
  it('returns only END_TURN when mana is 0 and hand is empty', () => {
    let state = startedGame();
    state = withEnergy(state, 'p1', 0);
    state = withHand(state, 'p1', []);

    const moves = generateLegalMoves(state, 'p1');
    expect(moves).toHaveLength(1);
    expect(moves[0].type).toBe('END_TURN');
  });

  it('returns only END_TURN when hand is empty', () => {
    let state = startedGame();
    state = withHand(state, 'p1', []);

    const moves = generateLegalMoves(state, 'p1');
    const nonEnd = moves.filter(m => m.type !== 'END_TURN');
    expect(nonEnd).toHaveLength(0);
  });
});

describe('generateLegalMoves — attack generation', () => {
  it('freshly summoned unit (justSummoned=true) does not appear in attack actions', () => {
    let state = startedGame();
    state = withHand(state, 'p1', []);
    const freshUnit = makeUnit('p1', 3, 3, { justSummoned: true });
    const enemyUnit = makeUnit('p2', 2, 2);
    state = withBattlefield(state, [freshUnit], [enemyUnit]);

    const moves = generateLegalMoves(state, 'p1');
    const attacks = moves.filter(m => m.type === 'ATTACK');
    expect(attacks).toHaveLength(0);
  });

  it('unit that already attacked does not appear in attack actions', () => {
    let state = startedGame();
    state = withHand(state, 'p1', []);
    const usedUnit = makeUnit('p1', 3, 3, { hasAttackedThisTurn: true });
    const enemyUnit = makeUnit('p2', 2, 2);
    state = withBattlefield(state, [usedUnit], [enemyUnit]);

    const moves = generateLegalMoves(state, 'p1');
    const attacks = moves.filter(m => m.type === 'ATTACK');
    expect(attacks).toHaveLength(0);
  });

  it('taunt forces attack on taunt unit only, hero not targetable', () => {
    let state = startedGame();
    state = withHand(state, 'p1', []);
    const attacker = makeUnit('p1', 3, 3);

    const tauntCard: Card = {
      id: 'taunt-unit',
      name: 'Taunt',
      faction: 'neutral',
      type: 'unit',
      cost: 2,
      attack: 2,
      health: 4,
      rarity: 'common',
      keywords: ['taunt'],
      effects: [],
      flavorText: '',
      artUrl: '',
    };
    const tauntUnit: UnitInstance = {
      instanceId: 'taunt-id',
      card: tauntCard,
      currentAttack: 2,
      currentHealth: 4,
      maxHealth: 4,
      hasAttackedThisTurn: false,
      justSummoned: false,
      isSpectral: false,
      spectralExpiresAtTurn: null,
      hasDivineShield: false,
      ownerId: 'p2',
    };
    const nonTaunt = makeUnit('p2', 1, 1);
    state = withBattlefield(state, [attacker], [tauntUnit, nonTaunt]);

    const moves = generateLegalMoves(state, 'p1');
    const attacks = moves.filter(m => m.type === 'ATTACK');

    // Only the taunt unit should be targetable
    expect(attacks.every(a => a.type === 'ATTACK' && a.targetType === 'unit' && a.targetInstanceId === 'taunt-id')).toBe(true);
    expect(attacks.some(a => a.type === 'ATTACK' && a.targetType === 'hero')).toBe(false);
  });

  it('unit with divine_shield appears in attack actions normally', () => {
    let state = startedGame();
    state = withHand(state, 'p1', []);
    const attacker = makeUnit('p1', 3, 3);
    const dsEnemy = makeUnit('p2', 2, 2, { hasDivineShield: true });
    state = withBattlefield(state, [attacker], [dsEnemy]);

    const moves = generateLegalMoves(state, 'p1');
    const unitAttacks = moves.filter(m => m.type === 'ATTACK' && m.targetType === 'unit');
    expect(unitAttacks.length).toBeGreaterThan(0);
  });
});

describe('generateLegalMoves — spell expansion', () => {
  it('choose_enemy spell expands to one action per enemy unit + hero', () => {
    let state = startedGame();
    state = withEnergy(state, 'p1', 10);
    const spellCard: Card = {
      id: 'spell-choose-enemy',
      name: 'Damage spell',
      faction: 'neutral',
      type: 'spell',
      cost: 2,
      rarity: 'common',
      keywords: [],
      effects: [
        {
          trigger: 'on_play',
          description: 'Deal 3 to target',
          resolve: { kind: 'damage', amount: 3, target: { scope: 'choose_enemy' } },
        },
      ],
      flavorText: '',
      artUrl: '',
    };
    state = withHand(state, 'p1', [spellCard]);

    const enemy1 = makeUnit('p2', 1, 1);
    const enemy2 = makeUnit('p2', 2, 2);
    state = withBattlefield(state, [], [enemy1, enemy2]);

    const moves = generateLegalMoves(state, 'p1');
    const spellActions = moves.filter(m => m.type === 'PLAY_SPELL');

    // 2 enemy units + 1 hero target = 3 actions
    expect(spellActions).toHaveLength(3);
  });

  it('non-targeted spell generates exactly one action', () => {
    let state = startedGame();
    state = withEnergy(state, 'p1', 10);
    const aoeSpell: Card = {
      id: 'aoe-spell',
      name: 'AOE',
      faction: 'neutral',
      type: 'spell',
      cost: 3,
      rarity: 'common',
      keywords: [],
      effects: [
        {
          trigger: 'on_play',
          description: 'Deal 2 to all enemies',
          resolve: { kind: 'damage', amount: 2, target: { scope: 'all_enemies' } },
        },
      ],
      flavorText: '',
      artUrl: '',
    };
    state = withHand(state, 'p1', [aoeSpell]);

    const moves = generateLegalMoves(state, 'p1');
    const spellActions = moves.filter(m => m.type === 'PLAY_SPELL');
    expect(spellActions).toHaveLength(1);
  });
});

describe('generateLegalMoves — phase guard', () => {
  it('returns only END_TURN in non-principal phase', () => {
    const state = initialGameState('orisha', 'zulu'); // mulligan phase
    const moves = generateLegalMoves(state, 'p1');
    expect(moves).toHaveLength(1);
    expect(moves[0].type).toBe('END_TURN');
  });

  it('returns only END_TURN when not active player', () => {
    const state = startedGame(); // p1 is active
    const moves = generateLegalMoves(state, 'p2');
    expect(moves).toHaveLength(1);
    expect(moves[0].type).toBe('END_TURN');
  });
});
