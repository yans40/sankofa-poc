import { describe, expect, it } from 'vitest';
import { createRun } from '../../../run/runState.js';
import { startCombat } from '../../../run/runReducer.js';

/**
 * Adversarial non-regression for PR #49:
 * QA initial validated the UI flow, this test locks the RunState JSON
 * round-trip contract for future reload/persistence work.
 */
describe('PR#49 adversarial: RunState JSON round-trip', () => {
  it('keeps critical fields stable after stringify/parse', () => {
    const starting = createRun('zulu', 490042);
    const combat = startCombat(starting);

    const startRoundTrip = JSON.parse(JSON.stringify(starting));
    const combatRoundTrip = JSON.parse(JSON.stringify(combat));

    expect(startRoundTrip.phase).toBe('starting');
    expect(startRoundTrip.combatIndex).toBe(0);
    expect(startRoundTrip.currentCombat).toBeNull();
    expect(startRoundTrip.playerDeck.length).toBe(starting.playerDeck.length);

    expect(combatRoundTrip.phase).toBe('combat');
    expect(combatRoundTrip.combatIndex).toBe(0);
    expect(combatRoundTrip.currentCombat).not.toBeNull();
    expect(combatRoundTrip.heroHp).toBe(combat.heroHp);
    expect(combatRoundTrip.heroMaxHp).toBe(combat.heroMaxHp);
    expect(combatRoundTrip.playerDeck.length).toBe(combat.playerDeck.length);
    expect(combatRoundTrip.currentCombat.players.p1.heroHealth).toBe(
      combat.currentCombat!.players.p1.heroHealth,
    );
  });
});
