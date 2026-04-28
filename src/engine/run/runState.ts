import type { Card, Faction, GameState } from '../types.js';
import cardsData from '../../data/cards.json' assert { type: 'json' };

const allCards = cardsData as Card[];

export type RunPhase =
  | 'starting'        // Run created or card selected — ready for startCombat
  | 'combat'          // A combat is in progress
  | 'card_selection'  // Between combats — player picks one card
  | 'victory'         // All 3 combats won
  | 'defeat';         // Hero HP reached 0

export interface RunState {
  /** Index of the current combat (0..2). Incremented by selectCard. */
  combatIndex: 0 | 1 | 2;
  phase: RunPhase;
  faction: Faction;
  /** Player's current deck composition (grows by 1 after each card_selection). */
  playerDeck: Card[];
  /** Hero HP persisted across combats. */
  heroHp: number;
  /** Fixed at run creation (30). */
  heroMaxHp: number;
  /** Active GameState for the current combat, null outside 'combat' phase. */
  currentCombat: GameState | null;
  /** 3 card proposals shown during card_selection, null otherwise. */
  cardChoices: Card[] | null;
  /** Deterministic seed for reproducible shuffles and card choices. */
  seed: number;
  /** Proverb for the current combat — populated by #43, null for now. */
  proverb: string | null;
}

/** LCG seeded Fisher-Yates shuffle — pure, deterministic. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFactionDeck(faction: 'orisha' | 'zulu', seed: number): Card[] {
  const pool = allCards.filter(c => c.faction === faction && c.type !== 'hero');
  const deck: Card[] = [];
  for (const card of pool) {
    const copies = card.rarity === 'legendary' ? 1 : 3;
    for (let i = 0; i < copies; i++) {
      deck.push({ ...card, reincarnationCount: 0 });
    }
  }
  return seededShuffle(deck, seed);
}

export function createRun(faction: Faction, seed: number): RunState {
  if (faction !== 'orisha' && faction !== 'zulu') {
    throw new Error(`Unsupported faction for run: ${faction}`);
  }
  const heroMaxHp = 30;
  return {
    combatIndex: 0,
    phase: 'starting',
    faction,
    playerDeck: buildFactionDeck(faction, seed),
    heroHp: heroMaxHp,
    heroMaxHp,
    currentCombat: null,
    cardChoices: null,
    seed,
    proverb: null,
  };
}
