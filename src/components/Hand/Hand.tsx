import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useGameStore } from '../../store/gameStore.js';
import { HandCard } from '../Card/CardComponent.js';
import type { Card, PlayerId } from '../../engine/types.js';

interface DraggableCardProps {
  card: Card;
  index: number;
  playable: boolean;
  isOpponent: boolean;
}

function DraggableCard({ card, index, playable, isOpponent }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `hand-card-${index}`,
    data: { cardId: card.id, cardIndex: index, cardType: card.type },
    disabled: !playable || isOpponent,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform), zIndex: 50 } : undefined;

  // Opponent: show face-down cards
  if (isOpponent) {
    return (
      <div className="w-14 h-20 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
        <span className="text-gray-600 text-2xl">🂠</span>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <HandCard card={card} playable={playable} isDragging={isDragging} />
    </div>
  );
}

interface HandProps {
  playerId: PlayerId;
  isOpponent?: boolean;
}

export function Hand({ playerId, isOpponent = false }: HandProps) {
  const { gameState, selection, setSelection, dispatch } = useGameStore(s => ({
    gameState: s.gameState,
    selection: s.selection,
    setSelection: s.setSelection,
    dispatch: s.dispatch,
  }));

  const player = gameState.players[playerId];
  const isActive = gameState.activePlayerId === playerId;

  if (isOpponent) {
    return (
      <div className="flex items-center justify-center gap-2 min-h-[88px]">
        {player.hand.map((_, i) => (
          <DraggableCard key={i} card={_} index={i} playable={false} isOpponent />
        ))}
        {player.hand.length === 0 && <span className="text-gray-600 text-sm">Main vide</span>}
      </div>
    );
  }

  function handleCardClick(card: Card) {
    if (!isActive) return;
    if (card.type === 'unit') {
      // Handled via drag-and-drop; click just selects for quick play
      return;
    }
    if (card.type === 'ritual') {
      if (player.energy >= card.cost) {
        dispatch({ type: 'PLAY_RITUAL', playerId, cardId: card.id });
      }
      return;
    }
    if (card.type === 'spell') {
      const needsTarget = card.effects.some(e =>
        e.resolve.kind === 'damage' &&
        (e.resolve.target.scope === 'choose_enemy' || e.resolve.target.scope === 'choose_ally')
      );
      if (player.energy >= card.cost) {
        if (needsTarget) {
          setSelection({ kind: 'spell', cardId: card.id, needsTarget: true });
        } else {
          dispatch({ type: 'PLAY_SPELL', playerId, cardId: card.id });
        }
      }
    }
  }

  return (
    <div className="flex items-end justify-center gap-2 min-h-[110px] py-1">
      {player.hand.map((card, i) => {
        const playable = isActive && player.energy >= card.cost;
        const isSpellSelected = selection.kind === 'spell' && selection.cardId === card.id;
        return (
          <div key={i} className={isSpellSelected ? 'ring-2 ring-yellow-400 rounded-lg' : ''}>
            <DraggableCard
              card={card}
              index={i}
              playable={playable}
              isOpponent={false}
            />
            {/* Click handler for non-unit cards */}
            {card.type !== 'unit' && playable && (
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => handleCardClick(card)}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
            )}
          </div>
        );
      })}
      {player.hand.length === 0 && (
        <span className="text-gray-600 text-sm">Main vide</span>
      )}
    </div>
  );
}
