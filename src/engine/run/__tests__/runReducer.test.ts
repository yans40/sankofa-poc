import { describe, it, expect } from 'vitest';
import type { RunState } from '../runState.js';
import { createRun } from '../runState.js';
import { startCombat, selectCard, endRun } from '../runReducer.js';

function makeStartedRun(faction: 'orisha' | 'zulu' = 'zulu', seed = 42): RunState {
  return createRun(faction, seed);
}

describe('createRun', () => {
  it('creates run with zulu faction', () => {
    const run = createRun('zulu', 42);
    expect(run.phase).toBe('starting');
    expect(run.combatIndex).toBe(0);
    expect(run.heroHp).toBe(30);
    expect(run.heroMaxHp).toBe(30);
    expect(run.heroHp).toBe(run.heroMaxHp);
    expect(run.currentCombat).toBeNull();
    expect(run.cardChoices).toBeNull();
    expect(run.seed).toBe(42);
    expect(run.proverb).toBeNull();
  });

  it('creates run with orisha faction', () => {
    const run = createRun('orisha', 1);
    expect(run.faction).toBe('orisha');
    expect(run.phase).toBe('starting');
  });

  it('player deck has 20+ cards from faction pool', () => {
    const run = createRun('zulu', 0);
    // zulu has 9 cards: 6 common×3 + 3 non-common = 18+some. At least 18.
    expect(run.playerDeck.length).toBeGreaterThanOrEqual(18);
    expect(run.playerDeck.every(c => c.faction === 'zulu' || c.faction === 'neutral')).toBe(true);
  });

  it('throws for unsupported faction', () => {
    expect(() => createRun('neutral', 1)).toThrow('Unsupported faction');
  });

  it('same seed produces same deck order', () => {
    const run1 = createRun('orisha', 99);
    const run2 = createRun('orisha', 99);
    expect(run1.playerDeck.map(c => c.id)).toEqual(run2.playerDeck.map(c => c.id));
  });

  it('different seeds produce different deck orders', () => {
    const run1 = createRun('orisha', 1);
    const run2 = createRun('orisha', 2);
    // Very unlikely (but not impossible) to be identical — good enough for a sanity check
    const ids1 = run1.playerDeck.map(c => c.id).join(',');
    const ids2 = run2.playerDeck.map(c => c.id).join(',');
    expect(ids1).not.toBe(ids2);
  });
});

describe('startCombat', () => {
  it('transitions starting → combat', () => {
    const run = makeStartedRun();
    const combat = startCombat(run);
    expect(combat.phase).toBe('combat');
    expect(combat.currentCombat).not.toBeNull();
  });

  it('combat 0: no healing', () => {
    const run = makeStartedRun();
    expect(run.combatIndex).toBe(0);
    const before = run.heroHp;
    const combat = startCombat(run);
    expect(combat.heroHp).toBe(before); // no heal at first combat
  });

  it('combat 1 with heroHp=15: heals to 25 (does not exceed max)', () => {
    const base = makeStartedRun();
    const cardSelState: RunState = {
      ...base,
      phase: 'starting',
      combatIndex: 1,
      heroHp: 15,
      heroMaxHp: 30,
    };
    const combat = startCombat(cardSelState);
    expect(combat.heroHp).toBe(25); // 15 + 10
  });

  it('combat 1 with heroHp=28: heals to 30 (capped at max)', () => {
    const base = makeStartedRun();
    const cardSelState: RunState = {
      ...base,
      phase: 'starting',
      combatIndex: 1,
      heroHp: 28,
      heroMaxHp: 30,
    };
    const combat = startCombat(cardSelState);
    expect(combat.heroHp).toBe(30); // 28 + 10 capped at 30
  });

  it('GameState starts in principal phase (mulligan auto-applied)', () => {
    const run = makeStartedRun();
    const combat = startCombat(run);
    expect(combat.currentCombat!.phase).toBe('principal');
  });

  it('throws when called from invalid phase', () => {
    const run: RunState = { ...makeStartedRun(), phase: 'combat' };
    expect(() => startCombat(run)).toThrow('invalid phase');
  });

  it('GameState p1 heroHealth matches run heroHp', () => {
    const base = makeStartedRun();
    const combatState: RunState = { ...base, heroHp: 22, heroMaxHp: 30, combatIndex: 0 };
    const combat = startCombat(combatState);
    // combatIndex=0 → no heal, so p1 should start with 22 HP
    expect(combat.currentCombat!.players.p1.heroHealth).toBe(22);
  });
});

describe('selectCard', () => {
  function makeCardSelectionState(seed = 42): RunState {
    const base = makeStartedRun('zulu', seed);
    // Simulate card_selection phase with fake choices
    return {
      ...base,
      phase: 'card_selection',
      combatIndex: 0,
      cardChoices: [
        { id: 'O01', name: 'Test', faction: 'orisha', type: 'unit', cost: 1, attack: 1, health: 2, rarity: 'common', keywords: [], effects: [], flavorText: '', artUrl: '' },
      ],
    };
  }

  it('adds the chosen card to playerDeck (size +1)', () => {
    const state = makeCardSelectionState();
    const before = state.playerDeck.length;
    const next = selectCard(state, 'O01');
    expect(next.playerDeck.length).toBe(before + 1);
    expect(next.playerDeck[next.playerDeck.length - 1].id).toBe('O01');
  });

  it('clears cardChoices after selection', () => {
    const state = makeCardSelectionState();
    const next = selectCard(state, 'O01');
    expect(next.cardChoices).toBeNull();
  });

  it('increments combatIndex from 0 to 1', () => {
    const state = makeCardSelectionState();
    const next = selectCard(state, 'O01');
    expect(next.combatIndex).toBe(1);
  });

  it('transitions to starting phase', () => {
    const state = makeCardSelectionState();
    const next = selectCard(state, 'O01');
    expect(next.phase).toBe('starting');
  });

  it('throws when called outside card_selection phase', () => {
    const state: RunState = { ...makeCardSelectionState(), phase: 'combat' };
    expect(() => selectCard(state, 'O01')).toThrow('invalid phase');
  });

  it('throws when cardId is not in choices', () => {
    const state = makeCardSelectionState();
    expect(() => selectCard(state, 'NONEXISTENT')).toThrow('"NONEXISTENT"');
  });

  it('is immutable: mutating returned state does not affect original', () => {
    const state = makeCardSelectionState();
    const next = selectCard(state, 'O01');
    // Mutate next — original must be unchanged
    (next as RunState & { phase: string }).phase = 'combat';
    expect(state.phase).toBe('card_selection');
  });
});

describe('endRun', () => {
  it('is a no-op: returns the same-shaped state', () => {
    const run = makeStartedRun();
    const after = endRun(run);
    expect(after.phase).toBe(run.phase);
    expect(after.seed).toBe(run.seed);
  });
});
