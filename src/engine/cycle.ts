import type { WorldCyclePhase } from './types.js';

export function computeWorldCycle(turn: number): WorldCyclePhase {
  const mod = ((turn - 1) % 3);
  if (mod === 0) return 'dawn';
  if (mod === 1) return 'day';
  return 'night';
}
