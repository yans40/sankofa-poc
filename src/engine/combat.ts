import type { GameState, PlayerId, UnitInstance, EffectResolver } from './types.js';
import { addLog, getOpponentId, getCardById } from './gameState.js';
import { sendToAltar } from './ancestors.js';

function generateInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function resolveDeathrattleEffect(state: GameState, playerId: PlayerId, resolver: EffectResolver): GameState {
  if (resolver.kind !== 'summon_token') return state;
  const tokenCard = getCardById(resolver.cardId);
  if (!tokenCard) return state;
  const p = state.players[playerId];
  const tokens: UnitInstance[] = [];
  for (let i = 0; i < resolver.count; i++) {
    if (p.battlefield.length + tokens.length >= 7) break;
    tokens.push({
      instanceId: generateInstanceId(),
      card: tokenCard,
      currentAttack: tokenCard.attack ?? 0,
      currentHealth: tokenCard.health ?? 0,
      maxHealth: tokenCard.health ?? 0,
      hasAttackedThisTurn: false,
      justSummoned: true,
      isSpectral: false,
      spectralExpiresAtTurn: null,
      hasDivineShield: tokenCard.keywords.includes('divine_shield'),
      ownerId: playerId,
    });
  }
  if (tokens.length === 0) return state;
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...p, battlefield: [...p.battlefield, ...tokens] },
    },
  };
}

function applyDamageToUnit(unit: UnitInstance, damage: number): UnitInstance {
  if (unit.hasDivineShield && damage > 0) {
    return { ...unit, hasDivineShield: false };
  }
  return { ...unit, currentHealth: unit.currentHealth - damage };
}

function applyDamageToHero(state: GameState, targetId: PlayerId, damage: number): GameState {
  const target = state.players[targetId];
  if (target.heroHealth <= 0) return state;
  if (target.heroDivineShield && damage > 0) {
    return {
      ...state,
      players: { ...state.players, [targetId]: { ...target, heroDivineShield: false } },
    };
  }
  const newHealth = Math.max(0, target.heroHealth - damage);
  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [targetId]: { ...target, heroHealth: newHealth },
    },
  };
  if (newHealth === 0) {
    const winnerId = getOpponentId(targetId);
    next = { ...next, phase: 'gameover', winner: winnerId };
    next = addLog(next, 'system', `${targetId} héros est mort. ${winnerId} gagne !`);
  }
  return next;
}

export function resolveUnitAttackUnit(
  state: GameState,
  attackerId: string,
  targetId: string,
  attackerOwnerId: PlayerId,
): GameState {
  const opponentId = getOpponentId(attackerOwnerId);
  const attackerPlayer = state.players[attackerOwnerId];
  const defenderPlayer = state.players[opponentId];

  const attacker = attackerPlayer.battlefield.find(u => u.instanceId === attackerId);
  const defender = defenderPlayer.battlefield.find(u => u.instanceId === targetId);
  if (!attacker || !defender) return state;

  const updatedAttacker = applyDamageToUnit(attacker, defender.currentAttack);
  const updatedDefender = applyDamageToUnit(defender, attacker.currentAttack);

  const markedAttacker = { ...updatedAttacker, hasAttackedThisTurn: true };

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [attackerOwnerId]: {
        ...attackerPlayer,
        battlefield: attackerPlayer.battlefield.map(u =>
          u.instanceId === attackerId ? markedAttacker : u,
        ),
      },
      [opponentId]: {
        ...defenderPlayer,
        battlefield: defenderPlayer.battlefield.map(u =>
          u.instanceId === targetId ? updatedDefender : u,
        ),
      },
    },
  };

  next = addLog(
    next,
    attackerOwnerId,
    `${attacker.card.name} attaque ${defender.card.name} (${attacker.currentAttack} vs ${defender.currentAttack} dégâts).`,
  );

  next = processDeaths(next);
  return next;
}

export function resolveUnitAttackHero(
  state: GameState,
  attackerId: string,
  attackerOwnerId: PlayerId,
): GameState {
  const opponentId = getOpponentId(attackerOwnerId);
  const attackerPlayer = state.players[attackerOwnerId];
  const attacker = attackerPlayer.battlefield.find(u => u.instanceId === attackerId);
  if (!attacker) return state;

  const markedAttacker = { ...attacker, hasAttackedThisTurn: true };
  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [attackerOwnerId]: {
        ...attackerPlayer,
        battlefield: attackerPlayer.battlefield.map(u =>
          u.instanceId === attackerId ? markedAttacker : u,
        ),
      },
    },
  };

  next = addLog(next, attackerOwnerId, `${attacker.card.name} attaque le héros adverse (${attacker.currentAttack} dégâts).`);
  next = applyDamageToHero(next, opponentId, attacker.currentAttack);

  // Counterattack from hero weapon
  const opponent = next.players[opponentId];
  if (opponent.heroAttack > 0 && opponent.heroWeaponCharges > 0) {
    next = addLog(next, opponentId, `Le héros contre-attaque avec son arme (${opponent.heroAttack} dégâts).`);
    const counterAttacker = next.players[attackerOwnerId].battlefield.find(u => u.instanceId === attackerId);
    if (counterAttacker) {
      const damagedAttacker = applyDamageToUnit(counterAttacker, opponent.heroAttack);
      const newCharges = opponent.heroWeaponCharges - 1;
      next = {
        ...next,
        players: {
          ...next.players,
          [attackerOwnerId]: {
            ...next.players[attackerOwnerId],
            battlefield: next.players[attackerOwnerId].battlefield.map(u =>
              u.instanceId === attackerId ? damagedAttacker : u,
            ),
          },
          [opponentId]: {
            ...next.players[opponentId],
            heroAttack: newCharges <= 0 ? 0 : opponent.heroAttack,
            heroWeaponCharges: newCharges,
          },
        },
      };
    }
  }

  next = processDeaths(next);
  return next;
}

export function processDeaths(state: GameState): GameState {
  let next = state;
  for (const pid of ['p1', 'p2'] as PlayerId[]) {
    const dead = next.players[pid].battlefield.filter(u => u.currentHealth <= 0);
    if (dead.length === 0) continue;

    let afterDeaths = next;
    for (const unit of dead) {
      afterDeaths = addLog(afterDeaths, 'system', `${unit.card.name} est détruit.`);
      afterDeaths = sendToAltar(afterDeaths, pid, unit);
      for (const effect of unit.card.effects) {
        if (effect.trigger !== 'on_death') continue;
        afterDeaths = addLog(afterDeaths, 'system', `${unit.card.name} : effet de mort déclenché.`);
        afterDeaths = resolveDeathrattleEffect(afterDeaths, pid, effect.resolve);
      }
    }

    next = {
      ...afterDeaths,
      players: {
        ...afterDeaths.players,
        [pid]: {
          ...afterDeaths.players[pid],
          battlefield: afterDeaths.players[pid].battlefield.filter(u => u.currentHealth > 0),
        },
      },
    };
  }
  return next;
}
