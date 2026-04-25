import type { GameState, PlayerId } from './types.js';

export function updateGriotState(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  const faction = player.hero.faction;

  if (faction === 'orisha') {
    // Voie de l'Équilibre: every 3 spells, next costs 1 less
    const total = player.griotState.totalSpellsPlayed;
    const nextSpellDiscount = total > 0 && total % 3 === 0;
    return {
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          griotState: { ...player.griotState, nextSpellDiscount },
        },
      },
    };
  }

  if (faction === 'zulu') {
    // Impi: units gain +1 attack when controlling 2+ Zulu units
    const zuluCount = player.battlefield.filter(u => u.card.faction === 'zulu').length;
    const impiActive = zuluCount >= 2;
    if (impiActive === player.griotState.impiActive) return state;
    return {
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          griotState: { ...player.griotState, impiActive },
        },
      },
    };
  }

  return state;
}

export function getEffectiveAttack(state: GameState, playerId: PlayerId, baseAttack: number): number {
  const player = state.players[playerId];
  if (player.hero.faction === 'zulu' && player.griotState.impiActive) {
    return baseAttack + 1;
  }
  return baseAttack;
}

export function getSpellCostModifier(state: GameState, playerId: PlayerId): number {
  const player = state.players[playerId];
  if (player.hero.faction === 'orisha' && player.griotState.nextSpellDiscount) {
    return -1;
  }
  return 0;
}

export function onSpellPlayed(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  if (player.hero.faction !== 'orisha') return state;

  const total = player.griotState.totalSpellsPlayed + 1;
  const nextSpellDiscount = total % 3 === 0;

  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        griotState: {
          ...player.griotState,
          totalSpellsPlayed: total,
          spellsPlayedThisTurn: player.griotState.spellsPlayedThisTurn + 1,
          nextSpellDiscount,
        },
      },
    },
  };
}
