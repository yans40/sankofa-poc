import { describe, it, expect } from 'vitest';
import { initialGameState } from '../gameState.js';
import { applyAction } from '../reducers.js';
import { onSpellPlayed, getSpellCostModifier, updateGriotState } from '../griot.js';
import type { GameState } from '../types.js';

function startedGame(p1: 'orisha' | 'zulu' = 'orisha', p2: 'orisha' | 'zulu' = 'zulu'): GameState {
  let state = initialGameState(p1, p2);
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p1', cardIndices: [] });
  state = applyAction(state, { type: 'MULLIGAN', playerId: 'p2', cardIndices: [] });
  return state;
}

describe('Griot — Orisha Voie de l\'Équilibre', () => {
  it('no discount before 3 spells', () => {
    const state = startedGame();
    expect(getSpellCostModifier(state, 'p1')).toBe(0);
  });

  it('discount applied after 3 spells', () => {
    let state = startedGame();
    state = onSpellPlayed(state, 'p1');
    state = onSpellPlayed(state, 'p1');
    state = onSpellPlayed(state, 'p1');
    state = updateGriotState(state, 'p1');
    expect(getSpellCostModifier(state, 'p1')).toBe(-1);
  });

  it('discount resets after 6th spell', () => {
    let state = startedGame();
    for (let i = 0; i < 3; i++) state = onSpellPlayed(state, 'p1');
    state = updateGriotState(state, 'p1');
    expect(getSpellCostModifier(state, 'p1')).toBe(-1);
    // 4th spell consumes discount
    for (let i = 0; i < 3; i++) state = onSpellPlayed(state, 'p1');
    state = updateGriotState(state, 'p1');
    expect(getSpellCostModifier(state, 'p1')).toBe(-1); // 6 total → discount again
  });
});

describe('Griot — Zulu Impi', () => {
  it('impi inactive with < 2 units', () => {
    const state = startedGame('zulu', 'orisha');
    expect(state.players.p1.griotState.impiActive).toBe(false);
  });

  it('impi activates with 2+ zulu units', () => {
    let state = startedGame('zulu', 'orisha');
    const unit1 = { instanceId: 'u1', card: { id: 'z', name: 'Z', faction: 'zulu' as const, type: 'unit' as const, cost: 1, attack: 2, health: 2, rarity: 'common' as const, keywords: [], effects: [], flavorText: '', artUrl: '' }, currentAttack: 2, currentHealth: 2, maxHealth: 2, hasAttackedThisTurn: false, justSummoned: false, isSpectral: false, spectralExpiresAtTurn: null, hasDivineShield: false, ownerId: 'p1' as const };
    const unit2 = { ...unit1, instanceId: 'u2' };
    state = { ...state, players: { ...state.players, p1: { ...state.players.p1, battlefield: [unit1, unit2] } } };
    state = updateGriotState(state, 'p1');
    expect(state.players.p1.griotState.impiActive).toBe(true);
  });
});
