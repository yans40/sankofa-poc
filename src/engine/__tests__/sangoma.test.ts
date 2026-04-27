import { describe, it, expect, vi, afterEach } from 'vitest';
import cardsData from '../../data/cards.json' assert { type: 'json' };
import type { Card, GameState, UnitInstance } from '../types.js';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';

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

describe('Sangoma Guérisseuse (Z05) — random_ally heal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const z05 = allCards.find(c => c.id === 'Z05')!;
  const z01 = allCards.find(c => c.id === 'Z01')!;
  const z04 = allCards.find(c => c.id === 'Z04')!;

  it('Z05 on_turn_end uses random_ally (issue #26)', () => {
    const e = z05.effects.find(x => x.trigger === 'on_turn_end');
    expect(e?.resolve.kind).toBe('heal');
    if (e?.resolve.kind === 'heal') {
      expect(e.resolve.target.scope).toBe('random_ally');
      expect(e.resolve.amount).toBe(2);
    }
  });

  it('no wounded ally: end turn leaves full-HP Sangoma unchanged', () => {
    let state = startedGame();
    const sangoma = makeUnit('sangoma-1', z05, 4, 4);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [sangoma] },
      },
    };
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    const u = state.players.p1.battlefield.find(x => x.instanceId === 'sangoma-1');
    expect(u?.currentHealth).toBe(4);
  });

  it('two wounded allies: exactly one receives heal (random)', () => {
    let state = startedGame();
    const sangoma = makeUnit('sangoma-1', z05, 4, 4);
    const allyA = makeUnit('ally-a', z04, 1, 3);
    const allyB = makeUnit('ally-b', z04, 1, 3);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [sangoma, allyA, allyB] },
      },
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });

    const a = state.players.p1.battlefield.find(x => x.instanceId === 'ally-a');
    const b = state.players.p1.battlefield.find(x => x.instanceId === 'ally-b');
    expect(a && b).toBeTruthy();
    const healedA = a!.currentHealth > 1;
    const healedB = b!.currentHealth > 1;
    expect(healedA !== healedB).toBe(true);
    expect(healedA || healedB).toBe(true);
  });

  it('heal is capped at maxHp', () => {
    let state = startedGame();
    const bigHealCard: Card = {
      ...z01,
      id: 'TEST-HEAL-CAP',
      effects: [
        {
          trigger: 'on_turn_end',
          description: 'test',
          resolve: { kind: 'heal', amount: 50, target: { scope: 'random_ally' } },
        },
      ],
    };
    const healer = makeUnit('healer-cap', bigHealCard, 5, 5);
    const target = makeUnit('target-cap', z01, 2, 5);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [healer, target] },
      },
    };
    vi.spyOn(Math, 'random').mockReturnValue(0);
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    const t = state.players.p1.battlefield.find(x => x.instanceId === 'target-cap');
    expect(t?.currentHealth).toBe(5);
  });

  it('heal amount <= 0 is no-op', () => {
    let state = startedGame();
    const noopHealCard: Card = {
      ...z01,
      id: 'TEST-HEAL-ZERO',
      effects: [
        {
          trigger: 'on_turn_end',
          description: 'test',
          resolve: { kind: 'heal', amount: 0, target: { scope: 'random_ally' } },
        },
      ],
    };
    const unitA = makeUnit('u-a', noopHealCard, 5, 5);
    const unitB = makeUnit('u-b', z01, 1, 3);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [unitA, unitB] },
      },
    };
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    expect(state.players.p1.battlefield.find(x => x.instanceId === 'u-b')?.currentHealth).toBe(1);
  });

  it('heal amount negative is no-op', () => {
    let state = startedGame();
    const negHealCard: Card = {
      ...z01,
      id: 'TEST-HEAL-NEG',
      effects: [
        {
          trigger: 'on_turn_end',
          description: 'test',
          resolve: { kind: 'heal', amount: -3, target: { scope: 'random_ally' } },
        },
      ],
    };
    const unitA = makeUnit('neg-a', negHealCard, 5, 5);
    const unitB = makeUnit('neg-b', z04, 1, 3);
    state = {
      ...state,
      players: {
        ...state.players,
        p1: { ...state.players.p1, battlefield: [unitA, unitB] },
      },
    };
    state = applyAction(state, { type: 'END_TURN', playerId: 'p1' });
    expect(state.players.p1.battlefield.find(x => x.instanceId === 'neg-b')?.currentHealth).toBe(1);
  });

  it('regression: heal self (hero) from battlecry still works', () => {
    let state = startedGame();
    const o09 = allCards.find(c => c.id === 'O09')!;
    state = {
      ...state,
      phase: 'principal',
      activePlayerId: 'p1',
      players: {
        ...state.players,
        p1: {
          ...state.players.p1,
          energy: 10,
          heroHealth: 20,
          hand: [o09],
          battlefield: [],
        },
      },
    };
    state = applyAction(state, { type: 'PLAY_UNIT', playerId: 'p1', cardId: 'O09', targetSlot: 0 });
    expect(state.players.p1.heroHealth).toBe(25);
  });

  it('only zulu cards use on_turn_end heal with random_ally (smoke)', () => {
    const offenders = allCards.filter(
      c =>
        c.faction === 'zulu' &&
        c.effects.some(
          e =>
            e.trigger === 'on_turn_end' &&
            e.resolve.kind === 'heal' &&
            e.resolve.target.scope !== 'random_ally',
        ),
    );
    expect(offenders.map(c => c.id)).toEqual([]);
  });
});
