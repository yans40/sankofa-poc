import { CardArtSVG } from '../../utils/cardArt.js';
import type { Card } from '../../engine/types.js';

interface CardChoiceTileProps {
  card: Card;
  onClick: () => void;
  disabled?: boolean;
}

export function CardChoiceTile({ card, onClick, disabled = false }: CardChoiceTileProps) {
  const ariaLabel = `${card.name}, cout ${card.cost}, attaque ${card.attack ?? 0}, vie ${card.health ?? 0}`;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={[
        'group relative w-[180px] rounded-xl border-2 p-3 text-left',
        'transition-transform duration-150 hover:scale-105',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
        card.faction === 'orisha' ? 'border-amber-500 bg-amber-950/80' : 'border-green-600 bg-green-950/80',
        disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full border border-blue-300 bg-blue-600 text-sm font-bold text-white">
        {card.cost}
      </div>

      <div className="flex justify-center pt-2">
        <CardArtSVG card={card} width={120} height={144} />
      </div>

      <div className="mt-2 text-center text-sm font-semibold text-white">{card.name}</div>

      <div className="mt-2 flex justify-between px-1 text-sm font-bold">
        <span className="text-orange-400">ATK {card.attack ?? '-'}</span>
        <span className="text-green-400">HP {card.health ?? '-'}</span>
      </div>
    </button>
  );
}

export type { CardChoiceTileProps };
