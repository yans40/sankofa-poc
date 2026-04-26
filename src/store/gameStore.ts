import { create } from 'zustand';
import type { GameState, GameAction, PlayerId } from '../engine/types.js';
import { initialGameState } from '../engine/gameState.js';
import { applyAction } from '../engine/reducers.js';

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
  uiToast: string | null;
  uiLog: string[];
  p1Faction: 'orisha' | 'zulu';
  p2Faction: 'orisha' | 'zulu';
  screen: 'faction_select' | 'mulligan' | 'hotseat' | 'game' | 'gameover';
  hotSeatPending: PlayerId | null;

  startGame: (p1: 'orisha' | 'zulu', p2: 'orisha' | 'zulu') => void;
  dispatch: (action: GameAction) => void;
  setSelection: (mode: SelectionMode) => void;
  pushUiFeedback: (message: string) => void;
  clearUiToast: () => void;
  confirmHotSeat: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: initialGameState('orisha', 'zulu'),
  selection: { kind: 'none' },
  uiToast: null,
  uiLog: [],
  p1Faction: 'orisha',
  p2Faction: 'zulu',
  screen: 'faction_select',
  hotSeatPending: null,

  startGame: (p1, p2) => {
    const state = initialGameState(p1, p2);
    set({ gameState: state, p1Faction: p1, p2Faction: p2, screen: 'mulligan', selection: { kind: 'none' } });
  },

  dispatch: (action) => {
    const prev = get().gameState;
    const next = applyAction(prev, action);
    // Detect turn switch → show hot-seat screen
    const wasActive = prev.activePlayerId;
    const isActive = next.activePlayerId;
    const turnChanged = wasActive !== isActive && next.phase !== 'gameover' && next.phase !== 'mulligan';

    // Detect mulligan completion → move to game
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

  pushUiFeedback: (message) => {
    set(state => ({
      uiToast: message,
      uiLog: [...state.uiLog, message].slice(-80),
    }));
  },

  clearUiToast: () => set({ uiToast: null }),

  confirmHotSeat: () => {
    set({ screen: 'game', hotSeatPending: null });
  },
}));
