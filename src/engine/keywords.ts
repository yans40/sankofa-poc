import type { UnitInstance, GameState, PlayerId } from './types.js';
import { addLog } from './gameState.js';

export function applyRegeneration(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  const healed = player.battlefield.map(unit => {
    if (!unit.card.keywords.includes('regeneration')) return unit;
    if (unit.currentHealth >= unit.maxHealth) return unit;
    const restored = Math.min(unit.currentHealth + 1, unit.maxHealth);
    return { ...unit, currentHealth: restored };
  });
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, battlefield: healed },
    },
  };
}

export function removeExpiredSpectral(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  const survived: UnitInstance[] = [];
  const exiled: typeof player.exile = [...player.exile];
  let next = state;

  for (const unit of player.battlefield) {
    if (unit.isSpectral && unit.spectralExpiresAtTurn !== null && state.turn >= unit.spectralExpiresAtTurn) {
      exiled.push(unit.card);
      next = addLog(next, 'system', `${unit.card.name} (Spectral) est exilé.`);
    } else {
      survived.push(unit);
    }
  }

  return {
    ...next,
    players: {
      ...next.players,
      [playerId]: { ...player, battlefield: survived, exile: exiled },
    },
  };
}

export function hasTaunt(units: UnitInstance[]): boolean {
  return units.some(u => u.card.keywords.includes('taunt'));
}

export function getValidAttackTargets(
  attackerOwnerId: PlayerId,
  state: GameState,
): { unitTargets: UnitInstance[]; heroTargetable: boolean } {
  const opponentId: PlayerId = attackerOwnerId === 'p1' ? 'p2' : 'p1';
  const opponent = state.players[opponentId];

  if (hasTaunt(opponent.battlefield)) {
    return {
      unitTargets: opponent.battlefield.filter(u => u.card.keywords.includes('taunt')),
      heroTargetable: false,
    };
  }
  return { unitTargets: opponent.battlefield, heroTargetable: true };
}
