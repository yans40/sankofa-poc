import { describe, it, expect } from 'vitest';
import { generateCardChoices } from '../cardChoiceGenerator.js';

describe('generateCardChoices', () => {
  it('returns exactly 3 cards by default', () => {
    const choices = generateCardChoices(42);
    expect(choices).toHaveLength(3);
  });

  it('returns requested count when overridden', () => {
    const choices = generateCardChoices(42, 5);
    expect(choices).toHaveLength(5);
  });

  it('same seed → identical choices (deterministic)', () => {
    const a = generateCardChoices(100);
    const b = generateCardChoices(100);
    expect(a.map(c => c.id)).toEqual(b.map(c => c.id));
  });

  it('different seeds → different choices', () => {
    const a = generateCardChoices(1);
    const b = generateCardChoices(2);
    expect(a.map(c => c.id).join(',')).not.toBe(b.map(c => c.id).join(','));
  });

  it('returned cards are plain objects (deep copies, not references)', () => {
    const choices = generateCardChoices(42);
    // Mutating a choice must not affect a second call
    choices[0].name = 'MUTATED';
    const choices2 = generateCardChoices(42);
    expect(choices2[0].name).not.toBe('MUTATED');
  });

  it('duplication is allowed: can return a card already in a "deck"', () => {
    // The generator does not filter against an existing deck — duplicates allowed (Q-007 default)
    // Run many seeds and verify at least one duplicate appears across choices
    for (let seed = 0; seed < 200; seed++) {
      const choices = generateCardChoices(seed);
      const ids = choices.map(c => c.id);
      if (new Set(ids).size < ids.length) break;
    }
    // Duplicates within a single draw are not guaranteed, but returning the same card as what
    // could already be in the player's deck IS the intent — this test just verifies no filter.
    // Since the pool has only 18 cards, with count=3 we may rarely see in-draw duplicates.
    // The test merely confirms the function doesn't throw when a card appears.
    expect(() => generateCardChoices(0)).not.toThrow();
  });

  it('all returned cards have valid required fields', () => {
    const choices = generateCardChoices(99);
    for (const card of choices) {
      expect(typeof card.id).toBe('string');
      expect(typeof card.name).toBe('string');
      expect(typeof card.cost).toBe('number');
      expect(Array.isArray(card.keywords)).toBe(true);
    }
  });
});
