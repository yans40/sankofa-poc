import { describe, it, expect } from 'vitest';
import { computeWorldCycle } from '../cycle.js';

describe('computeWorldCycle', () => {
  it('turn 1 → dawn', () => expect(computeWorldCycle(1)).toBe('dawn'));
  it('turn 2 → day',  () => expect(computeWorldCycle(2)).toBe('day'));
  it('turn 3 → night', () => expect(computeWorldCycle(3)).toBe('night'));
  it('turn 4 → dawn (cycle repeats)', () => expect(computeWorldCycle(4)).toBe('dawn'));
  it('turn 5 → day',  () => expect(computeWorldCycle(5)).toBe('day'));
  it('turn 6 → night', () => expect(computeWorldCycle(6)).toBe('night'));
});
