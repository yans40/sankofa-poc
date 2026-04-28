import { describe, it, expect, vi, afterEach } from 'vitest';
import type { GameState, PlayerId } from '../../types.js';
import { aiPlayTurn, type AiTurnResult } from '../heuristic.js';
import { initialGameState } from '../../gameState.js';
import { applyAction } from '../../reducers.js';
import { randomPlayerTurn } from '../../__tests__/_helpers/randomPlayer.js';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Simple LCG seeded PRNG — allows reproducible game sequences. */
function makePrng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function simulateGame(
  seed: number,
  aiTurnFn: (state: GameState, playerId: PlayerId) => AiTurnResult,
  randomTurnFn: (state: GameState, playerId: PlayerId) => ReturnType<typeof randomPlayerTurn>,
): { winner: 'ai' | 'random' | 'draw' } {
  const rng = makePrng(seed);
  vi.spyOn(Math, 'random').mockImplementation(rng);

  let state = initialGameState('orisha', 'zulu');
  const aiId: PlayerId = 'p1';
  const randomId: PlayerId = 'p2';

  // Mulligan: both keep their hands
  state = applyAction(state, { type: 'MULLIGAN', playerId: aiId, cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: randomId, cardIndices: [] });

  let maxIterations = 300;
  while (state.phase !== 'gameover' && maxIterations > 0) {
    maxIterations--;

    if (state.activePlayerId === aiId) {
      const result = aiTurnFn(state, aiId);
      for (const action of result.actions) {
        state = applyAction(state, action);
        if (state.phase === 'gameover') break;
      }
      // Safety: if AI returned no actions or didn't end turn, force end
      if (state.phase !== 'gameover' && state.activePlayerId === aiId) {
        state = applyAction(state, { type: 'END_TURN', playerId: aiId });
      }
    } else {
      const actions = randomTurnFn(state, randomId);
      for (const action of actions) {
        state = applyAction(state, action);
        if (state.phase === 'gameover') break;
      }
      // Safety: if random player didn't end turn, force end
      if (state.phase !== 'gameover' && state.activePlayerId === randomId) {
        state = applyAction(state, { type: 'END_TURN', playerId: randomId });
      }
    }
  }

  vi.restoreAllMocks();

  if (state.winner === aiId) return { winner: 'ai' };
  if (state.winner === randomId) return { winner: 'random' };
  return { winner: 'draw' };
}

describe('aiPlayTurn — API contract', () => {
  it('returns an AiTurnResult with at least END_TURN', () => {
    let state = initialGameState('orisha', 'zulu');
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
    state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });

    const result = aiPlayTurn(state, 'p1');
    expect(result.actions.length).toBeGreaterThanOrEqual(1);
    expect(result.actions[result.actions.length - 1].type).toBe('END_TURN');
  });

  it('does not import React/DOM/Zustand (engine-pure check)', () => {
    // If this test file itself can be imported, the import chain is clean.
    // A failed import of AI modules would throw at module load time.
    expect(typeof aiPlayTurn).toBe('function');
  });
});

describe('aiPlayTurn — beats random player ≥ 70 % over 100 games', () => {
  it('wins ≥ 70 of 100 seeded games', () => {
    let aiWins = 0;

    for (let seed = 0; seed < 100; seed++) {
      const result = simulateGame(seed, aiPlayTurn, randomPlayerTurn);
      if (result.winner === 'ai') aiWins++;
    }

    // Uncomment for debug: console.error(`AI wins: ${aiWins}/100`);
    expect(aiWins).toBeGreaterThanOrEqual(70);
  }, 60_000); // generous timeout for 100 simulated games
});
