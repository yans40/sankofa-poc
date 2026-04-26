import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { HandCard } from '../Card/CardComponent.js';
import type { PlayerId } from '../../engine/types.js';

interface MulliganPhaseProps {
  playerId: PlayerId;
}

export function MulliganPhase({ playerId }: MulliganPhaseProps) {
  const { gameState, dispatch } = useGameStore(s => ({ gameState: s.gameState, dispatch: s.dispatch }));
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const player = gameState.players[playerId];
  const isDone = gameState.mulliganDone[playerId];

  if (isDone) {
    // Waiting for opponent
    const opponentId: PlayerId = playerId === 'p1' ? 'p2' : 'p1';
    if (!gameState.mulliganDone[opponentId]) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6">
          <h2 className="text-white text-2xl font-bold">En attente de {opponentId.toUpperCase()}…</h2>
          <p className="text-gray-400">Passe l'écran à l'autre joueur.</p>
          <button
            onClick={() => dispatch({ type: 'MULLIGAN', playerId: opponentId, cardIndices: [] })}
            className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-full"
          >
            {opponentId.toUpperCase()} — Garder toutes mes cartes
          </button>
          <button
            onClick={() => {
              const modal = document.getElementById('p2-mulligan');
              if (modal) modal.style.display = 'flex';
            }}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full"
          >
            {opponentId.toUpperCase()} — Choisir mes cartes à remplacer
          </button>

          {/* Hidden p2 mulligan picker */}
          <div id="p2-mulligan" className="hidden fixed inset-0 bg-gray-950 flex-col items-center justify-center gap-6">
            <MulliganPicker playerId={opponentId} />
          </div>
        </div>
      );
    }
    return null;
  }

  function toggle(idx: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function confirm() {
    dispatch({ type: 'MULLIGAN', playerId, cardIndices: Array.from(selected) });
  }

  const faction = player.hero.faction;
  const accentColor = faction === 'orisha' ? 'text-amber-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h2 className={`text-3xl font-black ${accentColor}`}>{playerId.toUpperCase()} — Mulligan</h2>
        <p className="text-gray-400 mt-1">Clique sur les cartes à remplacer, puis confirme.</p>
      </div>

      <div className="flex gap-4">
        {player.hand.map((card, idx) => (
          <div
            key={idx}
            onClick={() => toggle(idx)}
            className={`relative transition-all duration-150 ${selected.has(idx) ? '-translate-y-3' : ''}`}
          >
            <HandCard card={card} playable />
            {selected.has(idx) && (
              <div className="absolute inset-0 rounded-lg bg-red-500/30 border-2 border-red-400 flex items-center justify-center">
                <span className="text-red-300 font-black text-lg">✕</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={() => { setSelected(new Set()); confirm(); }}
          className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-full transition-all hover:scale-105">
          Garder ces cartes
        </button>
        {selected.size > 0 && (
          <button onClick={confirm}
            className="px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-full transition-all hover:scale-105">
            Remplacer {selected.size} carte{selected.size > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}

function MulliganPicker({ playerId }: { playerId: PlayerId }) {
  const { gameState, dispatch } = useGameStore(s => ({ gameState: s.gameState, dispatch: s.dispatch }));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const player = gameState.players[playerId];

  function toggle(idx: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function confirm() {
    dispatch({ type: 'MULLIGAN', playerId, cardIndices: Array.from(selected) });
    const el = document.getElementById('p2-mulligan');
    if (el) el.style.display = 'none';
  }

  return (
    <>
      <h2 className="text-3xl font-black text-green-400">{playerId.toUpperCase()} — Mulligan</h2>
      <p className="text-gray-400">Clique pour remplacer</p>
      <div className="flex gap-4">
        {player.hand.map((card, idx) => (
          <div key={idx} onClick={() => toggle(idx)}
            className={`relative transition-all ${selected.has(idx) ? '-translate-y-3' : ''}`}>
            <HandCard card={card} playable />
            {selected.has(idx) && (
              <div className="absolute inset-0 rounded-lg bg-red-500/30 border-2 border-red-400 flex items-center justify-center">
                <span className="text-red-300 font-black text-lg">✕</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={confirm}
        className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-full">
        Confirmer
      </button>
    </>
  );
}

export function MulliganScreen() {
  const gameState = useGameStore(s => s.gameState);
  // Show p1 first, then p2
  if (!gameState.mulliganDone.p1) return <MulliganPhase playerId="p1" />;
  if (!gameState.mulliganDone.p2) return <MulliganPhase playerId="p1" />;
  return null;
}
