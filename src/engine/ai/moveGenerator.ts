import type { GameState, GameAction, PlayerId } from '../types.js';
import { getValidAttackTargets } from '../keywords.js';
import { getOpponentId } from '../gameState.js';
import { getSpellCostModifier } from '../griot.js';

function getSpellActions(state: GameState, playerId: PlayerId, cardId: string): GameAction[] {
  const player = state.players[playerId];
  const card = player.hand.find(c => c.id === cardId);
  if (!card) return [];

  const discount = getSpellCostModifier(state, playerId);
  const effectiveCost = Math.max(0, card.cost + discount);
  if (player.energy < effectiveCost) return [];

  const opponentId = getOpponentId(playerId);
  const opponent = state.players[opponentId];
  const actions: GameAction[] = [];

  const onPlayEffects = card.effects.filter(e => e.trigger === 'on_play');

  const needsEnemyTarget = onPlayEffects.some(
    e =>
      (e.resolve.kind === 'damage' || e.resolve.kind === 'destroy') &&
      (e.resolve.target.scope === 'choose_enemy'),
  );

  const needsAllyTarget = onPlayEffects.some(
    e =>
      (e.resolve.kind === 'heal' || e.resolve.kind === 'buff') &&
      e.resolve.target.scope === 'choose_ally',
  );

  if (needsEnemyTarget) {
    for (const unit of opponent.battlefield) {
      actions.push({ type: 'PLAY_SPELL', playerId, cardId, targetInstanceId: unit.instanceId });
    }
    actions.push({ type: 'PLAY_SPELL', playerId, cardId, targetInstanceId: `hero_${opponentId}` });
  } else if (needsAllyTarget) {
    for (const unit of player.battlefield) {
      actions.push({ type: 'PLAY_SPELL', playerId, cardId, targetInstanceId: unit.instanceId });
    }
  } else {
    actions.push({ type: 'PLAY_SPELL', playerId, cardId });
  }

  return actions;
}

export function generateLegalMoves(state: GameState, playerId: PlayerId): GameAction[] {
  if (state.phase !== 'principal' || state.activePlayerId !== playerId) {
    return [{ type: 'END_TURN', playerId }];
  }

  const player = state.players[playerId];
  const actions: GameAction[] = [];

  for (const card of player.hand) {
    if (card.type === 'unit') {
      if (player.energy >= card.cost && player.battlefield.length < 7) {
        actions.push({ type: 'PLAY_UNIT', playerId, cardId: card.id, targetSlot: 0 });
      }
    } else if (card.type === 'spell') {
      actions.push(...getSpellActions(state, playerId, card.id));
    } else if (card.type === 'ritual') {
      if (player.energy >= card.cost) {
        actions.push({ type: 'PLAY_RITUAL', playerId, cardId: card.id });
      }
    }
  }

  const { unitTargets, heroTargetable } = getValidAttackTargets(playerId, state);

  for (const attacker of player.battlefield) {
    if (attacker.hasAttackedThisTurn || attacker.justSummoned) continue;

    for (const target of unitTargets) {
      actions.push({
        type: 'ATTACK',
        playerId,
        attackerInstanceId: attacker.instanceId,
        targetType: 'unit',
        targetInstanceId: target.instanceId,
      });
    }

    if (heroTargetable) {
      actions.push({
        type: 'ATTACK',
        playerId,
        attackerInstanceId: attacker.instanceId,
        targetType: 'hero',
      });
    }
  }

  actions.push({ type: 'END_TURN', playerId });
  return actions;
}
