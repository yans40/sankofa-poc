import { describe, it, expect, vi, afterEach } from 'vitest';
import type { GameState, PlayerId, GameAction } from '../../types.js';
import type { AiTurnResult } from '../../ai/heuristic.js';
import type { RunState } from '../runState.js';
import { createRun } from '../runState.js';
import { startCombat, selectCard } from '../runReducer.js';
import { applyCombatTurn } from '../runOrchestrator.js';
import { generateLegalMoves } from '../../ai/moveGenerator.js';
import { applyAction } from '../../reducers.js';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Stub AI: picks random legal actions. Terminates with END_TURN. */
function randomAiStub(state: GameState, playerId: PlayerId): AiTurnResult {
  const actions: GameAction[] = [];
  let current = state;

  for (let i = 0; i < 50; i++) {
    if (current.phase === 'gameover') break;
    if (current.activePlayerId !== playerId) break;

    const moves = generateLegalMoves(current, playerId);
    const nonEnd = moves.filter(m => m.type !== 'END_TURN');

    if (nonEnd.length === 0) {
      actions.push({ type: 'END_TURN', playerId });
      break;
    }

    const pick = nonEnd[Math.floor(Math.random() * nonEnd.length)];
    actions.push(pick);
    current = applyAction(current, pick);
  }

  if (actions.length === 0 || actions[actions.length - 1].type !== 'END_TURN') {
    actions.push({ type: 'END_TURN', playerId });
  }

  return { actions };
}

/** Plays a run from 'starting' until victory/defeat using randomAiStub. */
function playFullRun(seed: number): { final: RunState; iterations: number } {
  let state = createRun('zulu', seed);
  let iterations = 0;

  while (state.phase !== 'victory' && state.phase !== 'defeat' && iterations < 2000) {
    iterations++;
    if (state.phase === 'starting') {
      state = startCombat(state);
    } else if (state.phase === 'combat') {
      state = applyCombatTurn(state, { type: 'END_TURN', playerId: 'p1' }, randomAiStub);
    } else if (state.phase === 'card_selection') {
      state = selectCard(state, state.cardChoices![0].id);
    }
  }

  return { final: state, iterations };
}

describe('applyCombatTurn — unit', () => {
  it('is a no-op when phase is not combat', () => {
    const run = createRun('orisha', 1);
    const after = applyCombatTurn(run, { type: 'END_TURN', playerId: 'p1' }, randomAiStub);
    expect(after.phase).toBe('starting');
    expect(after.currentCombat).toBeNull();
  });

  it('AI exception guard: forces END_TURN and does not crash', () => {
    const run = startCombat(createRun('orisha', 1));
    const throwingAi = (): AiTurnResult => { throw new Error('AI crashed'); };
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => applyCombatTurn(run, { type: 'END_TURN', playerId: 'p1' }, throwingAi)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('AI threw'), expect.any(Error));
  });

  it('returns updated heroHp after combat actions', () => {
    const run = startCombat(createRun('orisha', 5));
    const after = applyCombatTurn(run, { type: 'END_TURN', playerId: 'p1' }, randomAiStub);
    // heroHp is synced from the combat state
    expect(typeof after.heroHp).toBe('number');
    expect(after.heroHp).toBeGreaterThanOrEqual(0);
  });
});

describe('single combat resolution', () => {
  it('combat resolves to card_selection, victory, or defeat (never stays in combat)', () => {
    const rng = (() => {
      let s = 7;
      return () => {
        s = (s * 1664525 + 1013904223) & 0x7fffffff;
        return s / 0x7fffffff;
      };
    })();
    vi.spyOn(Math, 'random').mockImplementation(rng);

    let state = startCombat(createRun('orisha', 7));
    for (let i = 0; i < 500 && state.phase === 'combat'; i++) {
      state = applyCombatTurn(state, { type: 'END_TURN', playerId: 'p1' }, randomAiStub);
    }

    expect(['card_selection', 'victory', 'defeat']).toContain(state.phase);
  });

  it('combatIndex stays ≤ 2 after one combat', () => {
    for (let seed = 0; seed < 10; seed++) {
      let state = startCombat(createRun('zulu', seed));
      for (let i = 0; i < 500 && state.phase === 'combat'; i++) {
        state = applyCombatTurn(state, { type: 'END_TURN', playerId: 'p1' }, randomAiStub);
      }
      expect(state.combatIndex).toBeLessThanOrEqual(2);
    }
  });
});

describe('50 seeded runs — no crash, all terminate', () => {
  it('seeds 0..49 all reach victory or defeat', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = (() => {
        let s = seed;
        return () => {
          s = (s * 1664525 + 1013904223) & 0x7fffffff;
          return s / 0x7fffffff;
        };
      })();
      vi.spyOn(Math, 'random').mockImplementation(rng);

      const { final } = playFullRun(seed);
      vi.restoreAllMocks();

      expect(['victory', 'defeat']).toContain(final.phase);
      expect(final.combatIndex).toBeLessThanOrEqual(2);
    }
  }, 60_000);
});
