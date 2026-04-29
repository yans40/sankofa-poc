import { create } from 'zustand';
import type { GameState, GameAction, PlayerId } from '../engine/types.js';
import { initialGameState } from '../engine/gameState.js';
import { applyAction } from '../engine/reducers.js';
import type { RunState } from '../engine/run/runState.js';
import { createRun } from '../engine/run/runState.js';
import { selectCard, startCombat } from '../engine/run/runReducer.js';
import { applyCombatTurn } from '../engine/run/runOrchestrator.js';
import { aiPlayTurn } from '../engine/ai/heuristic.js';

export type SelectionMode =
  | { kind: 'none' }
  | { kind: 'attacking'; attackerInstanceId: string }
  | { kind: 'hero_power' }
  | { kind: 'ancestor'; altarIndex: number }
  | { kind: 'spell'; cardId: string; needsTarget: boolean }
  | { kind: 'offering'; ritualInstanceId: string };

interface GameStore {
  gameState: GameState;
  selection: SelectionMode;
  p1Faction: 'orisha' | 'zulu';
  p2Faction: 'orisha' | 'zulu';
  screen: 'faction_select' | 'mulligan' | 'hotseat' | 'game' | 'gameover';
  hotSeatPending: PlayerId | null;
  run: RunState | null;

  startGame: (p1: 'orisha' | 'zulu', p2: 'orisha' | 'zulu') => void;
  dispatch: (action: GameAction) => void;
  setSelection: (mode: SelectionMode) => void;
  confirmHotSeat: () => void;
  selectRunCard: (cardId: string) => void;
  initRun: (faction: 'orisha' | 'zulu') => void;
  startRunCombat: () => void;
  resetRun: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: initialGameState('orisha', 'zulu'),
  selection: { kind: 'none' },
  p1Faction: 'orisha',
  p2Faction: 'zulu',
  screen: 'faction_select',
  hotSeatPending: null,
  run: null,

  startGame: (p1, p2) => {
    const state = initialGameState(p1, p2);
    set({ gameState: state, p1Faction: p1, p2Faction: p2, screen: 'mulligan', selection: { kind: 'none' } });
  },

  dispatch: (action) => {
    const run = get().run;

    // Run mode: route all combat actions through applyCombatTurn (handles AI + gameover)
    if (run?.phase === 'combat') {
      const syncedRun: RunState = { ...run, currentCombat: get().gameState };
      const updatedRun = applyCombatTurn(syncedRun, action, aiPlayTurn);
      set({
        run: updatedRun,
        gameState: updatedRun.currentCombat ?? get().gameState,
        selection: { kind: 'none' },
      });
      return;
    }

    // Hot-seat mode
    const prev = get().gameState;
    const next = applyAction(prev, action);
    const wasActive = prev.activePlayerId;
    const isActive = next.activePlayerId;
    const turnChanged = wasActive !== isActive && next.phase !== 'gameover' && next.phase !== 'mulligan';
    const mulliganDone = prev.phase === 'mulligan' && next.phase !== 'mulligan';

    if (next.phase === 'gameover') {
      set({ gameState: next, selection: { kind: 'none' }, screen: 'gameover' });
    } else if (mulliganDone) {
      set({ gameState: next, selection: { kind: 'none' }, screen: 'game' });
    } else if (turnChanged) {
      set({ gameState: next, selection: { kind: 'none' }, screen: 'hotseat', hotSeatPending: isActive });
    } else {
      set({ gameState: next, selection: { kind: 'none' } });
    }
  },

  setSelection: (mode) => set({ selection: mode }),

  confirmHotSeat: () => {
    set({ screen: 'game', hotSeatPending: null });
  },

  selectRunCard: (cardId) => {
    const run = get().run;
    if (!run || run.phase !== 'card_selection') return;
    const nextRun = selectCard(run, cardId);
    set({ run: nextRun });
  },

  initRun: (faction) => {
    const seed = Math.floor(Math.random() * 1_000_000);
    const run = createRun(faction, seed);
    set({ run });
  },

  startRunCombat: () => {
    const run = get().run;
    if (!run || run.phase !== 'starting') return;
    const nextRun = startCombat(run);
    set({ run: nextRun, gameState: nextRun.currentCombat!, selection: { kind: 'none' } });
  },

  resetRun: () => set({ run: null }),
}));
