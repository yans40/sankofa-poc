import type { Card, GameState, PlayerState, PlayerId, GriotState } from './types.js';
import cardsData from '../data/cards.json' assert { type: 'json' };
import heroesData from '../data/heroes.json' assert { type: 'json' };

const allCards = cardsData as Card[];
const allHeroes = heroesData as (Card & { health: number })[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(faction: 'orisha' | 'zulu'): Card[] {
  const pool = allCards.filter(c => c.faction === faction && c.type !== 'hero');
  // 3 copies of each non-legendary card (§10.3)
  const deck: Card[] = [];
  for (const card of pool) {
    const copies = card.rarity === 'legendary' ? 1 : 3;
    for (let i = 0; i < copies; i++) {
      deck.push({ ...card, reincarnationCount: 0 });
    }
  }
  return shuffle(deck);
}

function emptyGriotState(): GriotState {
  return {
    spellsPlayedThisTurn: 0,
    totalSpellsPlayed: 0,
    nextSpellDiscount: false,
    impiActive: false,
  };
}

function buildPlayerState(id: PlayerId, faction: 'orisha' | 'zulu'): PlayerState {
  const heroData = allHeroes.find(h => h.faction === faction);
  if (!heroData) throw new Error(`Hero not found for faction ${faction}`);
  const hero: Card = { ...heroData, type: 'hero' };

  const deck = buildDeck(faction);
  const hand = deck.splice(0, 3);

  return {
    id,
    hero,
    heroHealth: 30,
    heroMaxHealth: 30,
    heroPowerUsedThisTurn: false,
    heroAttack: 0,
    heroDivineShield: false,
    heroWeaponCharges: 0,
    energy: 0,
    maxEnergy: 0,
    hand,
    deck,
    battlefield: [],
    altar: [],
    rituals: [],
    exile: [],
    fatigueDamage: 0,
    griotState: emptyGriotState(),
  };
}

export function initialGameState(
  p1Faction: 'orisha' | 'zulu' = 'orisha',
  p2Faction: 'orisha' | 'zulu' = 'zulu',
): GameState {
  return {
    players: {
      p1: buildPlayerState('p1', p1Faction),
      p2: buildPlayerState('p2', p2Faction),
    },
    activePlayerId: 'p1',
    turn: 1,
    phase: 'mulligan',
    worldCycle: 'dawn',
    winner: null,
    log: [
      {
        turn: 1,
        phase: 'mulligan',
        actor: 'system',
        message: 'La partie commence. Phase de Mulligan.',
        timestamp: Date.now(),
      },
    ],
    mulliganDone: { p1: false, p2: false },
  };
}

export function getCardById(id: string): Card | undefined {
  return allCards.find(c => c.id === id);
}

export function addLog(
  state: GameState,
  actor: GameState['log'][number]['actor'],
  message: string,
): GameState {
  return {
    ...state,
    log: [
      ...state.log,
      {
        turn: state.turn,
        phase: state.phase,
        actor,
        message,
        timestamp: Date.now(),
      },
    ],
  };
}

export function getOpponentId(playerId: PlayerId): PlayerId {
  return playerId === 'p1' ? 'p2' : 'p1';
}

export function drawCard(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  if (player.deck.length === 0) {
    const fatigue = player.fatigueDamage + 1;
    const newHealth = player.heroHealth - fatigue;
    let next: GameState = {
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          fatigueDamage: fatigue,
          heroHealth: Math.max(0, newHealth),
        },
      },
    };
    next = addLog(next, 'system', `${playerId} subit ${fatigue} dégât(s) de fatigue.`);
    if (newHealth <= 0) {
      next = { ...next, phase: 'gameover', winner: getOpponentId(playerId) };
    }
    return next;
  }
  const [drawn, ...remaining] = player.deck;
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        hand: [...player.hand, drawn],
        deck: remaining,
      },
    },
  };
}
