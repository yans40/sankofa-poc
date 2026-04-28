import type { Card, Faction } from '../../../engine/types.js';
import cardsData from '../../cards.json' assert { type: 'json' };

const allCards = cardsData as Card[];

function card(id: string): Card {
  const found = allCards.find(c => c.id === id);
  if (!found) throw new Error(`Card not found: ${id}`);
  return { ...found };
}

function deck(ids: string[]): Card[] {
  return ids.map(card);
}

export interface OpponentConfig {
  faction: Faction;
  deck: Card[];
}

// TODO M5: rebalance — difficulty is set by card quality only, not AI tuning
export const opponentDecks: [OpponentConfig, OpponentConfig, OpponentConfig] = [
  {
    // Combat 1 — Easy: orisha flood of cheap units
    faction: 'orisha',
    deck: deck(['O01', 'O01', 'O01', 'O02', 'O02', 'O02', 'O03', 'O03', 'O05', 'O05']),
  },
  {
    // Combat 2 — Medium: zulu balanced curve + one late-game threat
    faction: 'zulu',
    deck: deck(['Z01', 'Z01', 'Z02', 'Z02', 'Z04', 'Z04', 'Z05', 'Z05', 'Z07', 'Z09']),
  },
  {
    // Combat 3 — Hard: zulu power units + removal spells
    faction: 'zulu',
    deck: deck(['Z02', 'Z02', 'Z03', 'Z03', 'Z04', 'Z05', 'Z05', 'Z07', 'Z07', 'Z08']),
  },
];
