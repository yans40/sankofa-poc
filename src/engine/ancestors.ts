import type { GameState, PlayerId, UnitInstance } from './types.js';
import { addLog } from './gameState.js';

const ALTAR_MAX = 6;
const MAX_REINCARNATIONS = 2;

function generateInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function sendToAltar(
  state: GameState,
  playerId: PlayerId,
  unit: UnitInstance,
): GameState {
  const player = state.players[playerId];
  const card = unit.card;

  const reincCount = card.reincarnationCount ?? 0;

  // Anti-boucle : 3ème réinvocation = exil direct
  if (reincCount >= MAX_REINCARNATIONS) {
    return {
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          exile: [...player.exile, card],
        },
      },
    };
  }

  let altar = [...player.altar];
  let exile = [...player.exile];

  // FIFO overflow : oldest card (index 0) → exile
  if (altar.length >= ALTAR_MAX) {
    const evicted = altar[0];
    exile = [...exile, evicted];
    altar = altar.slice(1);
  }

  altar = [...altar, { ...card, reincarnationCount: reincCount }];

  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, altar, exile },
    },
  };
}

export function invokeAncestor(
  state: GameState,
  playerId: PlayerId,
  altarIndex: number,
  targetSlot: number,
): GameState {
  const player = state.players[playerId];
  const card = player.altar[altarIndex];
  if (!card) return state;

  const cost = Math.max(1, (card.cost ?? 0) - 1);
  if (player.energy < cost) return state;
  if (player.battlefield.length >= 7) return state;

  const reincCount = (card.reincarnationCount ?? 0) + 1;
  const updatedCard = { ...card, reincarnationCount: reincCount };

  const newUnit: UnitInstance = {
    instanceId: generateInstanceId(),
    card: updatedCard,
    currentAttack: (card.attack ?? 0) + 1,
    currentHealth: (card.health ?? 0) + 1,
    maxHealth: (card.health ?? 0) + 1,
    hasAttackedThisTurn: false,
    justSummoned: true,
    isSpectral: true,
    spectralExpiresAtTurn: state.turn + 1,
    hasDivineShield: false,
    ownerId: playerId,
  };

  const newAltar = player.altar.filter((_, i) => i !== altarIndex);
  const newBattlefield = [...player.battlefield];
  const slot = Math.min(targetSlot, newBattlefield.length);
  newBattlefield.splice(slot, 0, newUnit);

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        energy: player.energy - cost,
        altar: newAltar,
        battlefield: newBattlefield,
      },
    },
  };

  next = addLog(next, playerId, `${card.name} réinvoqué depuis l'Autel comme Spectral (+1/+1, coût ${cost}).`);

  // Trigger ancestor_call effects on allied units
  next = triggerAncestorCallEffects(next, playerId, newUnit);

  return next;
}

function triggerAncestorCallEffects(
  state: GameState,
  playerId: PlayerId,
  _invokedUnit: UnitInstance,
): GameState {
  const player = state.players[playerId];
  let next = state;
  for (const unit of player.battlefield) {
    if (unit.instanceId === _invokedUnit.instanceId) continue;
    if (unit.card.keywords.includes('ancestor_call')) {
      for (const effect of unit.card.effects) {
        if (effect.trigger === 'on_ancestor_summon') {
          next = resolveEffect(next, playerId, effect.resolve);
        }
      }
    }
  }
  return next;
}

import type { EffectResolver } from './types.js';
import { drawCard } from './gameState.js';

function resolveEffect(
  state: GameState,
  playerId: PlayerId,
  resolver: EffectResolver,
): GameState {
  if (resolver.kind === 'draw') {
    let next = state;
    for (let i = 0; i < resolver.count; i++) {
      next = drawCard(next, playerId);
    }
    return next;
  }
  return state;
}
