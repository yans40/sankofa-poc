import type {
  GameState,
  GameAction,
  PlayerId,
  Card,
  UnitInstance,
  EffectResolver,
} from './types.js';
import { addLog, drawCard, getOpponentId } from './gameState.js';
import { resolveUnitAttackUnit, resolveUnitAttackHero, processDeaths } from './combat.js';
import { invokeAncestor } from './ancestors.js';
import { playRitual, makeOffering, resolveReadyRituals } from './rituals.js';
import { applyRegeneration, removeExpiredSpectral, getValidAttackTargets } from './keywords.js';
import { computeWorldCycle } from './cycle.js';
import { updateGriotState, onSpellPlayed, getSpellCostModifier } from './griot.js';

function generateInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============ MULLIGAN ============

function reduceMulligan(state: GameState, action: Extract<GameAction, { type: 'MULLIGAN' }>): GameState {
  if (state.phase !== 'mulligan') return state;
  const { playerId, cardIndices } = action;
  const player = state.players[playerId];

  if (state.mulliganDone[playerId]) return state;

  let hand = [...player.hand];
  let deck = [...player.deck];
  const returned: Card[] = [];

  for (const idx of cardIndices.sort((a, b) => b - a)) {
    if (idx >= 0 && idx < hand.length) {
      returned.push(hand.splice(idx, 1)[0]);
    }
  }

  // Shuffle returned cards back, draw replacements
  deck = [...deck, ...returned];
  // Simple shuffle of the new cards in deck
  for (let i = deck.length - 1; i > deck.length - 1 - returned.length; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  for (let i = 0; i < returned.length; i++) {
    const [drawn, ...rest] = deck;
    hand = [...hand, drawn];
    deck = rest;
  }

  const mulliganDone = { ...state.mulliganDone, [playerId]: true };

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, hand, deck },
    },
    mulliganDone,
  };

  next = addLog(next, playerId, `Mulligan : ${cardIndices.length} carte(s) échangée(s).`);

  // Both players done → start game
  if (mulliganDone.p1 && mulliganDone.p2) {
    next = startTurn(next, 'p1');
  }

  return next;
}

// ============ START / END TURN ============

function startTurn(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  const newMaxEnergy = Math.min(10, player.maxEnergy + 1);
  const worldCycle = computeWorldCycle(state.turn);

  // Reset units
  const resetBattlefield = player.battlefield.map(u => ({
    ...u,
    hasAttackedThisTurn: false,
    justSummoned: false,
  }));

  let next: GameState = {
    ...state,
    activePlayerId: playerId,
    phase: 'aurore',
    worldCycle,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        energy: newMaxEnergy,
        maxEnergy: newMaxEnergy,
        heroPowerUsedThisTurn: false,
        heroAttack: 0,
        heroWeaponCharges: 0,
        griotState: {
          ...player.griotState,
          spellsPlayedThisTurn: 0,
        },
        battlefield: resetBattlefield,
      },
    },
  };

  next = addLog(next, 'system', `--- Tour ${state.turn} — ${playerId} — Cycle: ${worldCycle} ---`);

  // Aurore: resolve ready rituals
  next = resolveReadyRituals(next, playerId);
  // Remove expired spectral units
  next = removeExpiredSpectral(next, playerId);

  // Draw card
  next = drawCard(next, playerId);

  // Move to main phase
  next = { ...next, phase: 'principal' };

  // Update griot state
  next = updateGriotState(next, playerId);

  return next;
}

function reduceEndTurn(state: GameState, action: Extract<GameAction, { type: 'END_TURN' }>): GameState {
  if (state.phase === 'gameover' || state.phase === 'mulligan') return state;
  const { playerId } = action;
  if (state.activePlayerId !== playerId) return state;

  // Crépuscule phase: on_turn_end effects
  let next: GameState = { ...state, phase: 'crepuscule' };
  next = applyTurnEndEffects(next, playerId);
  next = applyRegeneration(next, playerId);

  // Switch to opponent
  const opponentId = getOpponentId(playerId);
  const newTurn = playerId === 'p2' ? state.turn + 1 : state.turn;

  next = { ...next, turn: newTurn };
  next = startTurn(next, opponentId);

  return next;
}

function applyTurnEndEffects(state: GameState, playerId: PlayerId): GameState {
  const player = state.players[playerId];
  let next = state;

  for (const unit of player.battlefield) {
    for (const effect of unit.card.effects) {
      if (effect.trigger === 'on_turn_end') {
        next = resolveEffect(next, playerId, effect.resolve);
      }
    }
  }

  return next;
}

// ============ PLAY UNIT ============

function reducePlayUnit(state: GameState, action: Extract<GameAction, { type: 'PLAY_UNIT' }>): GameState {
  if (state.phase !== 'principal') return state;
  const { playerId, cardId, targetSlot } = action;
  const player = state.players[playerId];
  if (state.activePlayerId !== playerId) return state;

  const cardIdx = player.hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return state;
  const card = player.hand[cardIdx];
  if (player.energy < card.cost) return state;
  if (player.battlefield.length >= 7) return state;

  const hasCharge = card.keywords.includes('charge');
  const hasDivineShield = card.keywords.includes('divine_shield');

  const newUnit: UnitInstance = {
    instanceId: generateInstanceId(),
    card,
    currentAttack: card.attack ?? 0,
    currentHealth: card.health ?? 0,
    maxHealth: card.health ?? 0,
    hasAttackedThisTurn: false,
    justSummoned: !hasCharge,
    isSpectral: false,
    spectralExpiresAtTurn: null,
    hasDivineShield,
    ownerId: playerId,
  };

  const newHand = [...player.hand];
  newHand.splice(cardIdx, 1);

  const slot = Math.min(targetSlot, player.battlefield.length);
  const newBattlefield = [...player.battlefield];
  newBattlefield.splice(slot, 0, newUnit);

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        energy: player.energy - card.cost,
        hand: newHand,
        battlefield: newBattlefield,
      },
    },
  };

  next = addLog(next, playerId, `${card.name} invoqué (coût ${card.cost}).`);

  // Battlecry effects (not triggered on ancestor summon)
  for (const effect of card.effects) {
    if (effect.trigger === 'on_play') {
      next = resolveEffect(next, playerId, effect.resolve);
    }
  }

  next = processDeaths(next);
  next = updateGriotState(next, playerId);
  return next;
}

// ============ PLAY SPELL ============

function reducePlaySpell(state: GameState, action: Extract<GameAction, { type: 'PLAY_SPELL' }>): GameState {
  if (state.phase !== 'principal') return state;
  const { playerId, cardId, targetInstanceId } = action;
  const player = state.players[playerId];
  if (state.activePlayerId !== playerId) return state;

  const cardIdx = player.hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return state;
  const card = player.hand[cardIdx];

  const discount = getSpellCostModifier(state, playerId);
  const effectiveCost = Math.max(0, card.cost + discount);
  if (player.energy < effectiveCost) return state;

  const newHand = [...player.hand];
  newHand.splice(cardIdx, 1);

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        energy: player.energy - effectiveCost,
        hand: newHand,
        exile: [...player.exile, card],
      },
    },
  };

  next = addLog(next, playerId, `Sort ${card.name} joué (coût ${effectiveCost}).`);

  for (const effect of card.effects) {
    if (effect.trigger === 'on_play') {
      const resolver = effect.resolve;
      if (
        (resolver.kind === 'damage' || resolver.kind === 'destroy') &&
        (resolver.target.scope === 'choose_enemy' || resolver.target.scope === 'choose_ally') &&
        targetInstanceId
      ) {
        next = resolveTargetedEffect(next, playerId, resolver, targetInstanceId);
      } else {
        next = resolveEffect(next, playerId, resolver);
      }
    }
  }

  next = onSpellPlayed(next, playerId);
  next = processDeaths(next);
  next = updateGriotState(next, playerId);
  return next;
}

// ============ ATTACK ============

function reduceAttack(state: GameState, action: Extract<GameAction, { type: 'ATTACK' }>): GameState {
  if (state.phase !== 'principal') return state;
  const { playerId, attackerInstanceId, targetType, targetInstanceId } = action;
  if (state.activePlayerId !== playerId) return state;

  const player = state.players[playerId];
  const attacker = player.battlefield.find(u => u.instanceId === attackerInstanceId);
  if (!attacker) return state;
  if (attacker.hasAttackedThisTurn) return state;
  if (attacker.justSummoned) return state;

  const { unitTargets, heroTargetable } = getValidAttackTargets(playerId, state);

  if (targetType === 'unit') {
    if (!targetInstanceId) return state;
    const validTarget = unitTargets.find(u => u.instanceId === targetInstanceId);
    if (!validTarget) return state;
    return resolveUnitAttackUnit(state, attackerInstanceId, targetInstanceId, playerId);
  }

  if (targetType === 'hero') {
    if (!heroTargetable) return state;
    return resolveUnitAttackHero(state, attackerInstanceId, playerId);
  }

  return state;
}

// ============ USE HERO POWER ============

function reduceUseHeroPower(state: GameState, action: Extract<GameAction, { type: 'USE_HERO_POWER' }>): GameState {
  if (state.phase !== 'principal') return state;
  const { playerId, targetInstanceId } = action;
  const player = state.players[playerId];
  if (state.activePlayerId !== playerId) return state;
  if (player.heroPowerUsedThisTurn) return state;
  if (player.energy < 2) return state;

  const heroPowerCost = 2;
  const faction = player.hero.faction;

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        energy: player.energy - heroPowerCost,
        heroPowerUsedThisTurn: true,
      },
    },
  };

  if (faction === 'orisha') {
    // Shango: deal 1 damage to a target
    if (targetInstanceId) {
      next = addLog(next, playerId, `Pouvoir héroïque de Shango : 1 dégât.`);
      next = resolveTargetedEffect(next, playerId, { kind: 'damage', amount: 1, target: { scope: 'choose_enemy' } }, targetInstanceId);
    }
  } else if (faction === 'zulu') {
    // Shaka: equip 2/2 weapon (1 charge)
    next = addLog(next, playerId, `Pouvoir héroïque de Shaka : arme 2/2 équipée.`);
    next = {
      ...next,
      players: {
        ...next.players,
        [playerId]: {
          ...next.players[playerId],
          heroAttack: 2,
          heroWeaponCharges: 1,
        },
      },
    };
  }

  next = processDeaths(next);
  return next;
}

// ============ CONCEDE ============

function reduceConcede(state: GameState, action: Extract<GameAction, { type: 'CONCEDE' }>): GameState {
  const winner = getOpponentId(action.playerId);
  let next: GameState = { ...state, phase: 'gameover', winner };
  next = addLog(next, action.playerId, `${action.playerId} a abandonné.`);
  return next;
}

// ============ EFFECT RESOLVERS ============

function resolveEffect(
  state: GameState,
  playerId: PlayerId,
  resolver: EffectResolver,
): GameState {
  const opponentId = getOpponentId(playerId);

  switch (resolver.kind) {
    case 'draw': {
      let next = state;
      const target = resolver.ownerOnly ? playerId : playerId;
      for (let i = 0; i < resolver.count; i++) next = drawCard(next, target);
      return next;
    }
    case 'heal': {
      if (resolver.amount <= 0) return state;

      if (resolver.target.scope === 'self') {
        const p = state.players[playerId];
        return {
          ...state,
          players: {
            ...state.players,
            [playerId]: {
              ...p,
              heroHealth: Math.min(p.heroMaxHealth, p.heroHealth + resolver.amount),
            },
          },
        };
      }

      if (resolver.target.scope === 'random_ally') {
        const p = state.players[playerId];
        const candidates = p.battlefield.filter(u => u.currentHealth < u.maxHealth);
        if (candidates.length === 0) return state;

        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const live = p.battlefield.find(u => u.instanceId === pick.instanceId);
        if (!live || live.currentHealth <= 0) return state;

        const newHealth = Math.min(live.maxHealth, live.currentHealth + resolver.amount);
        return {
          ...state,
          players: {
            ...state.players,
            [playerId]: {
              ...p,
              battlefield: p.battlefield.map(u =>
                u.instanceId === live.instanceId ? { ...u, currentHealth: newHealth } : u,
              ),
            },
          },
        };
      }

      return state;
    }
    case 'damage': {
      if (resolver.target.scope === 'all_enemies') {
        const opponent = state.players[opponentId];
        const damagedBf = opponent.battlefield.map(u => ({
          ...u,
          currentHealth: u.hasDivineShield ? u.currentHealth : u.currentHealth - resolver.amount,
          hasDivineShield: u.hasDivineShield ? false : u.hasDivineShield,
        }));
        return {
          ...state,
          players: {
            ...state.players,
            [opponentId]: { ...opponent, battlefield: damagedBf },
          },
        };
      }
      if (resolver.target.scope === 'enemy_hero') {
        const opponent = state.players[opponentId];
        const newHp = Math.max(0, opponent.heroHealth - resolver.amount);
        let next: GameState = {
          ...state,
          players: {
            ...state.players,
            [opponentId]: { ...opponent, heroHealth: newHp },
          },
        };
        if (newHp === 0) {
          next = { ...next, phase: 'gameover', winner: playerId };
          next = addLog(next, 'system', `${opponentId} héros est mort. ${playerId} gagne !`);
        }
        return next;
      }
      return state;
    }
    case 'buff': {
      if (resolver.target.scope === 'all_allies') {
        const p = state.players[playerId];
        const buffed = p.battlefield.map(u => ({
          ...u,
          currentAttack: u.currentAttack + resolver.attack,
          currentHealth: u.currentHealth + resolver.health,
          maxHealth: u.maxHealth + resolver.health,
        }));
        return {
          ...state,
          players: {
            ...state.players,
            [playerId]: { ...p, battlefield: buffed },
          },
        };
      }
      return state;
    }
    case 'grant_hero_attack': {
      const p = state.players[playerId];
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...p,
            heroAttack: p.heroAttack + resolver.amount,
            heroWeaponCharges: p.heroWeaponCharges + 1,
          },
        },
      };
    }
    case 'grant_charge_all_allies': {
      const p = state.players[playerId];
      const charged = p.battlefield.map(u => ({ ...u, justSummoned: false }));
      return {
        ...state,
        players: { ...state.players, [playerId]: { ...p, battlefield: charged } },
      };
    }
    case 'grant_divine_shield_hero': {
      const p = state.players[playerId];
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: { ...p, heroAttack: p.heroAttack },
        },
      };
    }
    case 'summon_token': {
      // Tokens are handled post-death in processDeaths via deathrattle
      return state;
    }
    default:
      return state;
  }
}

function resolveTargetedEffect(
  state: GameState,
  _playerId: PlayerId,
  resolver: EffectResolver,
  targetInstanceId: string,
): GameState {
  if (resolver.kind === 'damage') {
    // Check if target is a unit
    for (const pid of ['p1', 'p2'] as PlayerId[]) {
      const unit = state.players[pid].battlefield.find(u => u.instanceId === targetInstanceId);
      if (unit) {
        const updatedUnit = unit.hasDivineShield
          ? { ...unit, hasDivineShield: false }
          : { ...unit, currentHealth: unit.currentHealth - resolver.amount };
        const newState = {
          ...state,
          players: {
            ...state.players,
            [pid]: {
              ...state.players[pid],
              battlefield: state.players[pid].battlefield.map(u =>
                u.instanceId === targetInstanceId ? updatedUnit : u,
              ),
            },
          },
        };
        return processDeaths(newState);
      }
    }
    // Target is a hero
    if (targetInstanceId === 'hero_p1' || targetInstanceId === 'hero_p2') {
      const targetPid: PlayerId = targetInstanceId === 'hero_p1' ? 'p1' : 'p2';
      const p = state.players[targetPid];
      const newHp = Math.max(0, p.heroHealth - resolver.amount);
      let next: GameState = {
        ...state,
        players: {
          ...state.players,
          [targetPid]: { ...p, heroHealth: newHp },
        },
      };
      if (newHp === 0) {
        const winner = targetPid === 'p1' ? 'p2' : 'p1';
        next = { ...next, phase: 'gameover', winner };
        next = addLog(next, 'system', `${targetPid} héros est mort. ${winner} gagne !`);
      }
      return next;
    }
  }

  if (resolver.kind === 'destroy') {
    for (const pid of ['p1', 'p2'] as PlayerId[]) {
      const unit = state.players[pid].battlefield.find(u => u.instanceId === targetInstanceId);
      if (unit) {
        const killed = { ...unit, currentHealth: 0 };
        const newState = {
          ...state,
          players: {
            ...state.players,
            [pid]: {
              ...state.players[pid],
              battlefield: state.players[pid].battlefield.map(u =>
                u.instanceId === targetInstanceId ? killed : u,
              ),
            },
          },
        };
        return processDeaths(newState);
      }
    }
  }

  return state;
}

// ============ INVOKE ANCESTOR ============

function reduceInvokeAncestor(state: GameState, action: Extract<GameAction, { type: 'INVOKE_ANCESTOR' }>): GameState {
  if (state.phase !== 'principal') return state;
  if (state.activePlayerId !== action.playerId) return state;
  return invokeAncestor(state, action.playerId, action.altarIndex, action.targetSlot);
}

// ============ PLAY RITUAL ============

function reducePlayRitual(state: GameState, action: Extract<GameAction, { type: 'PLAY_RITUAL' }>): GameState {
  if (state.phase !== 'principal') return state;
  if (state.activePlayerId !== action.playerId) return state;
  const player = state.players[action.playerId];
  const card = player.hand.find(c => c.id === action.cardId);
  if (!card) return state;
  return playRitual(state, action.playerId, card);
}

// ============ MAKE OFFERING ============

function reduceMakeOffering(state: GameState, action: Extract<GameAction, { type: 'MAKE_OFFERING' }>): GameState {
  if (state.phase !== 'principal') return state;
  if (state.activePlayerId !== action.playerId) return state;
  return makeOffering(state, action.playerId, action.ritualInstanceId, action.offeringType, action.payload);
}

// ============ MAIN REDUCER ============

export function applyAction(state: GameState, action: GameAction): GameState {
  if (state.phase === 'gameover') return state;

  switch (action.type) {
    case 'MULLIGAN':         return reduceMulligan(state, action);
    case 'PLAY_UNIT':        return reducePlayUnit(state, action);
    case 'PLAY_RITUAL':      return reducePlayRitual(state, action);
    case 'PLAY_SPELL':       return reducePlaySpell(state, action);
    case 'MAKE_OFFERING':    return reduceMakeOffering(state, action);
    case 'INVOKE_ANCESTOR':  return reduceInvokeAncestor(state, action);
    case 'ATTACK':           return reduceAttack(state, action);
    case 'USE_HERO_POWER':   return reduceUseHeroPower(state, action);
    case 'END_TURN':         return reduceEndTurn(state, action);
    case 'CONCEDE':          return reduceConcede(state, action);
    default:                 return state;
  }
}
