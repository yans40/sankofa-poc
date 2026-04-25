// Re-export applyAction as the single public API of the engine
export { applyAction } from './reducers.js';
export type { GameState, GameAction, PlayerId } from './types.js';
export { initialGameState } from './gameState.js';
