import { useGameStore } from '../../store/gameStore.js';
import { AltarCard } from '../Card/CardComponent.js';
import type { PlayerId } from '../../engine/types.js';

interface AltarProps {
  playerId: PlayerId;
}

export function Altar({ playerId }: AltarProps) {
  const { gameState, selection, setSelection, dispatch } = useGameStore(s => ({
    gameState: s.gameState,
    selection: s.selection,
    setSelection: s.setSelection,
    dispatch: s.dispatch,
  }));

  const player = gameState.players[playerId];
  const isActive = gameState.activePlayerId === playerId;
  const altar = player.altar;

  function handleAncestorClick(idx: number) {
    if (!isActive) return;
    const card = altar[idx];
    const cost = Math.max(1, card.cost - 1);
    if (player.energy < cost) return;
    if (player.battlefield.length >= 7) return;

    if (selection.kind === 'ancestor' && selection.altarIndex === idx) {
      setSelection({ kind: 'none' });
    } else {
      setSelection({ kind: 'ancestor', altarIndex: idx });
      // Auto-invoke at next available slot
      dispatch({
        type: 'INVOKE_ANCESTOR',
        playerId,
        altarIndex: idx,
        targetSlot: player.battlefield.length,
      });
      setSelection({ kind: 'none' });
    }
  }

  const label = playerId === 'p1' ? 'AUTEL P1' : 'AUTEL P2';
  const accentColor = player.hero.faction === 'orisha' ? 'text-amber-400' : 'text-green-400';

  return (
    <div className="flex flex-col items-center gap-2 w-20">
      <div className={`text-xs font-bold ${accentColor} tracking-wider`}>{label}</div>
      <div className={`text-xs text-gray-500`}>{altar.length}/6</div>

      <div className="flex flex-col gap-1 items-center">
        {altar.length === 0 && (
          <div className="text-gray-700 text-xs text-center">vide</div>
        )}
        {altar.map((card, idx) => {
          const cost = Math.max(1, card.cost - 1);
          const canInvoke = isActive && player.energy >= cost && player.battlefield.length < 7;
          return (
            <AltarCard
              key={idx}
              card={card}
              clickable={canInvoke}
              onClick={() => handleAncestorClick(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}
