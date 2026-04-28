import type { Card } from '../types.js';
import cardsData from '../../data/cards.json' assert { type: 'json' };
import { seededShuffle } from './runState.js';

const cardPool = (cardsData as Card[]).filter(c => c.type !== 'hero');

/**
 * Returns `count` cards from the global pool using a seeded shuffle.
 * Duplicates with the existing deck are allowed (Q-007 default).
 */
export function generateCardChoices(seed: number, count = 3): Card[] {
  if (cardPool.length === 0) {
    throw new Error('Card pool is empty — cannot generate choices');
  }
  const shuffled = seededShuffle([...cardPool], seed);
  return shuffled.slice(0, count).map(c => ({ ...c }));
}
