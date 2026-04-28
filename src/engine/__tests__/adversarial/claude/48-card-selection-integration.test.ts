import { describe, it, expect } from 'vitest';
import type { Card } from '../../../types.js';
import type { RunState } from '../../../run/runState.js';
import { createRun } from '../../../run/runState.js';
import { selectCard } from '../../../run/runReducer.js';
import { generateCardChoices } from '../../../run/cardChoiceGenerator.js';

/**
 * Adversarial tests — PR #48 (card selection screen, issue #41).
 * QA Challenger Claude — edge cases not covered by the standard RTL suite.
 */

function makeCard(id: string): Card {
  return {
    id,
    name: `Card ${id}`,
    faction: 'zulu',
    type: 'unit',
    cost: 1,
    attack: 1,
    health: 1,
    rarity: 'common',
    keywords: [],
    effects: [],
    flavorText: '',
    artUrl: '',
  };
}

function makeCardSelectionRun(
  combatIndex: 0 | 1 | 2,
  choices: Card[],
): RunState {
  return {
    ...createRun('zulu', 42),
    phase: 'card_selection',
    combatIndex,
    cardChoices: choices,
  };
}

describe('PR #48 adversarial — card selection engine', () => {
  // Q-007 edge case: generateCardChoices never produces in-draw duplicate IDs.
  // The UI uses key={card.id} — if this invariant broke, React would silently
  // merge tiles. 100-seed stress test confirms the invariant holds.
  it('generateCardChoices: no in-draw duplicate IDs across 100 seeds', () => {
    for (let seed = 0; seed < 100; seed++) {
      const choices = generateCardChoices(seed, 3);
      const ids = choices.map(c => c.id);
      expect(new Set(ids).size).toBe(3);
    }
  });

  // Defensive: if cardChoices somehow contained duplicate IDs (future bug in
  // generator or manual test setup), selectCard must add exactly ONE card —
  // not two — because find() returns the first match.
  it('selectCard with duplicate IDs in choices: adds exactly one card (first match)', () => {
    const dupCard = makeCard('DUP01');
    const run = makeCardSelectionRun(0, [dupCard, { ...dupCard }, makeCard('OTHER01')]);
    const before = run.playerDeck.length;

    const next = selectCard(run, 'DUP01');

    expect(next.playerDeck.length).toBe(before + 1);
    expect(next.playerDeck[next.playerDeck.length - 1].id).toBe('DUP01');
    expect(next.cardChoices).toBeNull();
  });

  // The QA initial tested clicking button[0] then button[1] (different tiles).
  // This adversarial test exercises the same-tile guard at the engine level:
  // calling selectCard twice from the same state must throw on the second call.
  it('selectCard twice from same state: second call throws (phase locked after first)', () => {
    const run = makeCardSelectionRun(0, [makeCard('A'), makeCard('B'), makeCard('C')]);
    const next = selectCard(run, 'A');

    expect(next.phase).toBe('starting');
    // Simulates what would happen if UI somehow fired onSelect twice before
    // React re-rendered: the RunState is now in 'starting', selectCard throws.
    expect(() => selectCard(next, 'A')).toThrow('invalid phase');
  });

  // Guard: combatIndex = 2 with card_selection is a forbidden state.
  // resolveEndOfCombat never produces it, but a corrupted store or test
  // setup could trigger it. Engine must reject it.
  it('selectCard at combatIndex 2 throws — no 4th combat possible', () => {
    const run = makeCardSelectionRun(2, [makeCard('X'), makeCard('Y'), makeCard('Z')]);
    expect(() => selectCard(run, 'X')).toThrow('combatIndex already at maximum');
  });

  // Immutability contract: selectCard must not mutate the original RunState.
  it('selectCard is immutable: original state unchanged after call', () => {
    const run = makeCardSelectionRun(0, [makeCard('M'), makeCard('N'), makeCard('O')]);
    const originalDeckLength = run.playerDeck.length;

    selectCard(run, 'M');

    expect(run.playerDeck.length).toBe(originalDeckLength);
    expect(run.phase).toBe('card_selection');
    expect(run.cardChoices).not.toBeNull();
  });
});
