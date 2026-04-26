import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useGameStore } from '../../store/gameStore.js';
import { HandCard } from '../Card/CardComponent.js';
import type { Card, PlayerId } from '../../engine/types.js';

interface DraggableCardProps {
  card: Card;
  index: number;
  playable: boolean;
  onClickNonUnit?: () => void;
  onAttemptWhenLocked?: () => void;
}

function DraggableCard({ card, index, playable, onClickNonUnit, onAttemptWhenLocked }: DraggableCardProps) {
  const isUnit = card.type === 'unit';

  // Only units are draggable — spells/rituals use click
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `hand-card-${index}`,
    data: { cardId: card.id, cardIndex: index, cardType: card.type },
    disabled: !playable || !isUnit,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform), zIndex: 50 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Listeners only on units (for drag); spells/rituals get onClick
      {...(isUnit ? listeners : {})}
      {...(isUnit ? attributes : {})}
      onPointerDown={() => {
        if (!playable) onAttemptWhenLocked?.();
      }}
      onClick={() => {
        if (!isUnit && playable) {
          onClickNonUnit?.();
          return;
        }
        if (!playable) onAttemptWhenLocked?.();
      }}
    >
      <HandCard card={card} playable={playable} isDragging={isDragging} />
    </div>
  );
}

interface FaceDownCardProps { count: number }
function FaceDownCards({ count }: FaceDownCardProps) {
  return (
    <div className="flex items-center justify-center gap-2 min-h-[88px]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-14 h-20 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
          <span className="text-gray-600 text-2xl">🂠</span>
        </div>
      ))}
      {count === 0 && <span className="text-gray-600 text-sm">Main vide</span>}
    </div>
  );
}

interface HandProps {
  playerId: PlayerId;
  isOpponent?: boolean;
}

export function Hand({ playerId, isOpponent = false }: HandProps) {
  const { gameState, selection, setSelection, dispatch, pushUiFeedback } = useGameStore(s => ({
    gameState: s.gameState,
    selection: s.selection,
    setSelection: s.setSelection,
    dispatch: s.dispatch,
    pushUiFeedback: s.pushUiFeedback,
  }));

  const player = gameState.players[playerId];
  const isActive = gameState.activePlayerId === playerId;

  if (isOpponent) {
    return <FaceDownCards count={player.hand.length} />;
  }

  function handleNonUnitClick(card: Card) {
    if (!isActive || player.energy < card.cost) return;

    if (card.type === 'ritual') {
      dispatch({ type: 'PLAY_RITUAL', playerId, cardId: card.id });
      return;
    }

    if (card.type === 'spell') {
      const needsTarget = card.effects.some(e =>
        e.resolve.kind === 'damage' &&
        (e.resolve.target.scope === 'choose_enemy' || e.resolve.target.scope === 'choose_ally')
      );
      if (needsTarget) {
        setSelection({ kind: 'spell', cardId: card.id, needsTarget: true });
      } else {
        dispatch({ type: 'PLAY_SPELL', playerId, cardId: card.id });
      }
    }
  }

  function handleLockedCardAttempt(card: Card) {
    if (!isActive) {
      pushUiFeedback('Ce n’est pas ton tour.');
      return;
    }
    if (player.energy < card.cost) {
      pushUiFeedback(`Énergie insuffisante: ${player.energy}/${card.cost}.`);
      return;
    }
    pushUiFeedback('Action indisponible pour cette carte.');
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-gray-500 text-xs select-none">
        Unités: glisser | Sorts/Rituels: cliquer
      </div>
      <div className="flex items-end justify-center gap-2 min-h-[110px] py-1 flex-wrap">
        {player.hand.map((card, i) => {
          const playable = isActive && player.energy >= card.cost;
          const isSpellSelected = selection.kind === 'spell' && selection.cardId === card.id;
          return (
            <div
              key={i}
              className={isSpellSelected ? 'ring-2 ring-yellow-400 rounded-lg' : ''}
            >
              <DraggableCard
                card={card}
                index={i}
                playable={playable}
                onClickNonUnit={() => handleNonUnitClick(card)}
                onAttemptWhenLocked={() => handleLockedCardAttempt(card)}
              />
            </div>
          );
        })}
        {player.hand.length === 0 && (
          <span className="text-gray-600 text-sm">Main vide</span>
        )}
      </div>
    </div>
  );
}
