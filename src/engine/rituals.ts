import type { Card, GameState, PlayerId, RitualInstance } from './types.js';
import { addLog, getOpponentId } from './gameState.js';
import { processDeaths } from './combat.js';

function generateInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function playRitual(state: GameState, playerId: PlayerId, card: Card): GameState {
  const player = state.players[playerId];
  if (player.energy < card.cost) return state;
  if (player.rituals.length >= 2) return state;

  const instance: RitualInstance = {
    instanceId: generateInstanceId(),
    card,
    remainingCharges: card.initialCharges ?? 1,
    ownerId: playerId,
    ready: false,
  };

  // Remove only first occurrence
  const idx = player.hand.findIndex(c => c.id === card.id);
  const handCopy = [...player.hand];
  if (idx !== -1) handCopy.splice(idx, 1);

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        energy: player.energy - card.cost,
        hand: handCopy,
        rituals: [...player.rituals, instance],
      },
    },
  };
  next = addLog(next, playerId, `${card.name} mis en jeu (${instance.remainingCharges} charges).`);
  return next;
}

export function makeOffering(
  state: GameState,
  playerId: PlayerId,
  ritualInstanceId: string,
  offeringType: 'energy' | 'card' | 'unit',
  payload: string | null,
): GameState {
  const player = state.players[playerId];
  const ritualIdx = player.rituals.findIndex(r => r.instanceId === ritualInstanceId);
  if (ritualIdx === -1) return state;

  const ritual = player.rituals[ritualIdx];
  if (ritual.ready) return state;

  let newPlayer = { ...player };

  if (offeringType === 'energy') {
    if (player.energy < 1) return state;
    newPlayer = { ...newPlayer, energy: player.energy - 1 };
  } else if (offeringType === 'card') {
    if (!payload) return state;
    const cardIdx = player.hand.findIndex(c => c.id === payload);
    if (cardIdx === -1) return state;
    const newHand = [...player.hand];
    newHand.splice(cardIdx, 1);
    newPlayer = { ...newPlayer, hand: newHand, exile: [...player.exile, player.hand[cardIdx]] };
  } else if (offeringType === 'unit') {
    if (!payload) return state;
    const unitIdx = player.battlefield.findIndex(u => u.instanceId === payload);
    if (unitIdx === -1) return state;
    const sacrificed = player.battlefield[unitIdx];
    const newBattlefield = player.battlefield.filter(u => u.instanceId !== payload);
    newPlayer = { ...newPlayer, battlefield: newBattlefield, exile: [...player.exile, sacrificed.card] };
  }

  const newCharges = ritual.remainingCharges - 1;
  const ready = newCharges <= 0;
  const updatedRitual: RitualInstance = { ...ritual, remainingCharges: Math.max(0, newCharges), ready };

  const newRituals = [...newPlayer.rituals];
  newRituals[ritualIdx] = updatedRitual;

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...newPlayer, rituals: newRituals },
    },
  };

  next = addLog(next, playerId, `Offrande au Rituel ${ritual.card.name} (charges restantes: ${Math.max(0, newCharges)}).`);
  return next;
}

export function resolveReadyRituals(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  const ready = player.rituals.filter(r => r.ready);
  if (ready.length === 0) return state;

  let next = state;
  const resolved: RitualInstance[] = [];

  for (const ritual of ready) {
    next = addLog(next, 'system', `Rituel ${ritual.card.name} se résout !`);
    next = executeRitualEffect(next, playerId, ritual);
    resolved.push(ritual);
  }

  const remaining = next.players[playerId].rituals.filter(r => !r.ready);
  const exile = [...next.players[playerId].exile, ...resolved.map(r => r.card)];

  next = {
    ...next,
    players: {
      ...next.players,
      [playerId]: { ...next.players[playerId], rituals: remaining, exile },
    },
  };

  next = processDeaths(next);
  return next;
}

function executeRitualEffect(
  state: GameState,
  playerId: PlayerId,
  ritual: RitualInstance,
): GameState {
  const opponentId = getOpponentId(playerId);
  for (const effect of ritual.card.effects) {
    const resolver = effect.resolve;
    if (resolver.kind === 'heal' && resolver.target.scope === 'self') {
      const player = state.players[playerId];
      const newHealth = Math.min(player.heroMaxHealth, player.heroHealth + resolver.amount);
      state = {
        ...state,
        players: {
          ...state.players,
          [playerId]: { ...player, heroHealth: newHealth },
        },
      };
      state = addLog(state, playerId, `Héros soigné de ${resolver.amount} PV.`);
    } else if (resolver.kind === 'damage' && resolver.target.scope === 'all_enemies') {
      const opponent = state.players[opponentId];
      const damagedBf = opponent.battlefield.map(u => ({
        ...u,
        currentHealth: u.hasDivineShield ? u.currentHealth : u.currentHealth - resolver.amount,
        hasDivineShield: u.hasDivineShield ? false : u.hasDivineShield,
      }));
      state = {
        ...state,
        players: {
          ...state.players,
          [opponentId]: { ...opponent, battlefield: damagedBf },
        },
      };
    }
  }
  return state;
}

export function disruptRitual(
  state: GameState,
  playerId: PlayerId,
  ritualInstanceId: string,
): GameState {
  const player = state.players[playerId];
  const ritual = player.rituals.find(r => r.instanceId === ritualInstanceId);
  if (!ritual) return state;

  const newRituals = player.rituals.filter(r => r.instanceId !== ritualInstanceId);
  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        rituals: newRituals,
        exile: [...player.exile, ritual.card],
      },
    },
  };
  next = addLog(next, 'system', `Rituel ${ritual.card.name} de ${playerId} perturbé et exilé.`);
  return next;
}
