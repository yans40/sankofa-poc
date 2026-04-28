import { useState } from 'react';
import type { Card } from '../../engine/types.js';
import { CardChoiceTile } from './CardChoiceTile.js';

interface CardSelectionScreenProps {
  cardChoices: Card[];
  onSelect: (cardId: string) => void;
  combatIndex: 0 | 1;
}

export function CardSelectionScreen({ cardChoices, onSelect, combatIndex }: CardSelectionScreenProps) {
  const [selectionLocked, setSelectionLocked] = useState(false);

  if (cardChoices.length !== 3) {
    if (import.meta.env.DEV) {
      throw new Error(`CardSelectionScreen expects exactly 3 choices, got ${cardChoices.length}`);
    }
    return (
      <section className="rounded-lg border border-red-500/50 bg-gray-900 p-4 text-center text-red-300">
        Choix indisponible
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-700 bg-gray-950/90 p-6">
      <h2 className="mb-6 text-center text-xl font-bold text-white">
        Choisis une carte pour le combat {combatIndex + 2} / 3
      </h2>

      <div className="flex flex-wrap items-center justify-center gap-4 xl:gap-6">
        {cardChoices.map((card) => (
          <CardChoiceTile
            key={card.id}
            card={card}
            disabled={selectionLocked}
            onClick={() => {
              if (selectionLocked) return;
              setSelectionLocked(true);
              onSelect(card.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}

export type { CardSelectionScreenProps };
