import type { GameState, GameAction, PlayerId, Card, UnitInstance } from '../types.js';
import { getOpponentId } from '../gameState.js';
import { getSpellCostModifier } from '../griot.js';

function unitValue(unit: UnitInstance): number {
  return unit.currentAttack + unit.currentHealth;
}

function cardStatValue(card: Card): number {
  return (card.attack ?? 0) + (card.health ?? 0);
}

function hasFavorableOnPlay(card: Card): boolean {
  return card.effects.some(
    e =>
      e.trigger === 'on_play' &&
      e.resolve.kind !== 'custom',
  );
}

export function scoreAction(
  state: GameState,
  action: GameAction,
  aiPlayerId: PlayerId,
): number {
  const player = state.players[aiPlayerId];
  const opponentId = getOpponentId(aiPlayerId);
  const opponent = state.players[opponentId];

  if (action.type === 'END_TURN') return 0;

  if (action.type === 'PLAY_UNIT') {
    const card = player.hand.find(c => c.id === action.cardId);
    if (!card) return -Infinity;
    const base = cardStatValue(card) - card.cost;
    const battlecryBonus = hasFavorableOnPlay(card) ? 2 : 0;
    return base + battlecryBonus;
  }

  if (action.type === 'PLAY_SPELL') {
    const card = player.hand.find(c => c.id === action.cardId);
    if (!card) return -Infinity;

    const discount = getSpellCostModifier(state, aiPlayerId);
    const effectiveCost = Math.max(0, card.cost + discount);
    let score = -effectiveCost;

    for (const effect of card.effects) {
      if (effect.trigger !== 'on_play') continue;
      const resolve = effect.resolve;

      if (resolve.kind === 'damage') {
        const dmg = resolve.amount;
        const scope = resolve.target.scope;

        if (scope === 'all_enemies') {
          score += dmg * opponent.battlefield.length * 0.8;
          score += dmg * 0.5; // also hits hero
        } else if (scope === 'enemy_hero') {
          score += dmg;
        } else if (scope === 'choose_enemy') {
          const targetId = action.targetInstanceId;
          if (!targetId) break;
          if (targetId === `hero_${opponentId}`) {
            score += dmg * 1.0;
          } else {
            const targetUnit = opponent.battlefield.find(u => u.instanceId === targetId);
            if (targetUnit) {
              const killsTarget = !targetUnit.hasDivineShield && targetUnit.currentHealth <= dmg;
              score += killsTarget ? dmg * 1.5 : dmg * 0.5;
            }
          }
        } else if (scope === 'random_enemy') {
          score += dmg * 0.7;
        }
      }

      if (resolve.kind === 'heal') {
        const amount = resolve.amount;
        const scope = resolve.target.scope;

        if (scope === 'self') {
          const healable = player.heroMaxHealth - player.heroHealth;
          if (healable <= 0) return -Infinity;
          score += Math.min(amount, healable) * 0.8;
        } else if (scope === 'all_allies') {
          const total = player.battlefield.reduce((sum, u) => {
            const healable = u.maxHealth - u.currentHealth;
            return sum + Math.min(amount, healable) * 0.6;
          }, 0);
          score += total;
        } else if (scope === 'choose_ally') {
          const targetId = action.targetInstanceId;
          if (targetId) {
            const targetUnit = player.battlefield.find(u => u.instanceId === targetId);
            if (targetUnit) {
              const healable = targetUnit.maxHealth - targetUnit.currentHealth;
              if (healable <= 0) return -Infinity;
              score += Math.min(amount, healable) * 0.8;
            }
          }
        }
      }

      if (resolve.kind === 'draw') {
        score += resolve.count * 1.5;
      }

      if (resolve.kind === 'buff') {
        const scope = resolve.target.scope;
        if (scope === 'all_allies') {
          score += player.battlefield.length * (resolve.attack + resolve.health) * 0.5;
        }
      }
    }

    return score;
  }

  if (action.type === 'ATTACK') {
    const attacker = player.battlefield.find(u => u.instanceId === action.attackerInstanceId);
    if (!attacker) return -Infinity;

    if (action.targetType === 'hero') {
      return attacker.currentAttack * 1.5;
    }

    if (!action.targetInstanceId) return -Infinity;
    const target = opponent.battlefield.find(u => u.instanceId === action.targetInstanceId);
    if (!target) return -Infinity;

    const attackerVal = unitValue(attacker);
    const targetVal = unitValue(target);

    const damageDealt = target.hasDivineShield ? 0 : Math.min(attacker.currentAttack, target.currentHealth);
    const targetActuallyKilled = !target.hasDivineShield && target.currentHealth <= attacker.currentAttack;
    const attackerActuallyDies = !attacker.hasDivineShield && attacker.currentHealth <= target.currentAttack;

    let score = damageDealt * 1.2;
    if (targetActuallyKilled) score += targetVal;
    if (attackerActuallyDies) score -= attackerVal;

    return score;
  }

  return 0;
}
