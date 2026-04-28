import { describe, expect, it } from 'vitest';
import { createRun } from '../../../run/runState.js';
import { startCombat } from '../../../run/runReducer.js';

/**
 * Adversarial non-regression for PR #47:
 * verifies that two runs remain isolated and serializable.
 */
describe('PR#47 adversarial: run state contract isolation', () => {
  it('keeps concurrent runs isolated and serializable', () => {
    const runA = startCombat(createRun('orisha', 123));
    const runB = startCombat(createRun('zulu', 123));

    expect(runA.phase).toBe('combat');
    expect(runB.phase).toBe('combat');
    expect(runA.currentCombat).not.toBeNull();
    expect(runB.currentCombat).not.toBeNull();

    // Same seed but different faction should not produce identical p1 deck order.
    const deckA = runA.currentCombat!.players.p1.deck.map(c => c.id).join(',');
    const deckB = runB.currentCombat!.players.p1.deck.map(c => c.id).join(',');
    expect(deckA).not.toBe(deckB);

    // Round-trip contract shape for future UI persistence/reload.
    const roundTripA = JSON.parse(JSON.stringify(runA));
    expect(roundTripA.phase).toBe(runA.phase);
    expect(roundTripA.combatIndex).toBe(runA.combatIndex);
    expect(roundTripA.currentCombat).not.toBeNull();

    // Mutating one run must not leak into the other.
    runA.currentCombat!.players.p1.heroHealth = 1;
    expect(runB.currentCombat!.players.p1.heroHealth).not.toBe(1);
  });
});
