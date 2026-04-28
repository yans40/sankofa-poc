import type { RunState } from './runState.js';
import { seededShuffle } from './runState.js';
import { buildGameStateFromDecks } from '../gameState.js';
import { applyAction } from '../reducers.js';
import { generateCardChoices } from './cardChoiceGenerator.js';
import { opponentDecks } from '../../data/decks/run/opponentDecks.js';

/**
 * Transitions: starting | card_selection → combat.
 * Heals +10 HP (capped at heroMaxHp) when combatIndex > 0 (Q-006 default).
 * Shuffles player deck and opponent deck deterministically via run seed.
 */
export function startCombat(state: RunState): RunState {
  if (state.phase !== 'starting' && state.phase !== 'card_selection') {
    throw new Error(`startCombat called in invalid phase: ${state.phase}`);
  }

  const opponent = opponentDecks[state.combatIndex];

  // +10 HP heal between combats, capped at max (Q-006 default: +10 fixed)
  let heroHp = state.heroHp;
  if (state.combatIndex > 0) {
    heroHp = Math.min(state.heroMaxHp, heroHp + 10);
  }

  // Per-combat seeds derived from run seed to keep reproducibility
  const combatSeed = state.seed + state.combatIndex * 7919;
  const shuffledPlayerDeck = seededShuffle([...state.playerDeck], combatSeed);
  const shuffledOpponentDeck = seededShuffle([...opponent.deck], combatSeed + 1009);

  const rawCombat = buildGameStateFromDecks(
    state.faction as 'orisha' | 'zulu',
    shuffledPlayerDeck,
    heroHp,
    state.heroMaxHp,
    opponent.faction as 'orisha' | 'zulu',
    shuffledOpponentDeck,
  );

  // Auto-mulligan: both players keep their full opening hand
  let currentCombat = applyAction(rawCombat, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  currentCombat = applyAction(currentCombat, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });

  return {
    ...state,
    heroHp,
    phase: 'combat',
    currentCombat,
    proverb: null, // populated by ticket #43
  };
}

/**
 * Transitions: card_selection → starting.
 * Adds the chosen card to playerDeck, increments combatIndex.
 * Throws if called outside card_selection phase or with an invalid cardId.
 */
export function selectCard(state: RunState, cardId: string): RunState {
  if (state.phase !== 'card_selection') {
    throw new Error(`selectCard called in invalid phase: ${state.phase}`);
  }
  if (!state.cardChoices) {
    throw new Error('selectCard: cardChoices is null');
  }
  const chosen = state.cardChoices.find(c => c.id === cardId);
  if (!chosen) {
    throw new Error(`selectCard: card "${cardId}" not found in choices`);
  }
  if (state.combatIndex >= 2) {
    throw new Error('selectCard: combatIndex already at maximum (should never reach card_selection after combat 2)');
  }

  const nextCombatIndex = (state.combatIndex + 1) as 0 | 1 | 2;

  return {
    ...state,
    playerDeck: [...state.playerDeck, { ...chosen }],
    cardChoices: null,
    combatIndex: nextCombatIndex,
    phase: 'starting',
  };
}

/**
 * No-op idempotent marker. Valid from victory/defeat.
 * Exists so callers can signal run completion without branching.
 */
export function endRun(state: RunState): RunState {
  return state;
}

/**
 * Internal helper used by runOrchestrator after a combat ends.
 * Resolves the RunState transition (card_selection / victory / defeat).
 */
export function resolveEndOfCombat(state: RunState): RunState {
  const combat = state.currentCombat!;
  const heroHp = combat.players.p1.heroHealth;

  if (combat.winner !== 'p1') {
    return { ...state, phase: 'defeat', heroHp: 0, currentCombat: combat };
  }

  if (state.combatIndex === 2) {
    return { ...state, phase: 'victory', heroHp, currentCombat: combat };
  }

  // Won but more combats to come → offer card choice
  const choiceSeed = state.seed * 31337 + state.combatIndex;
  const cardChoices = generateCardChoices(choiceSeed, 3);

  return {
    ...state,
    phase: 'card_selection',
    heroHp,
    currentCombat: combat,
    cardChoices,
  };
}
