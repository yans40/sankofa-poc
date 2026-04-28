// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Card } from '../../../engine/types.js';
import { CardSelectionScreen } from '../CardSelectionScreen.js';

function makeCard(id: string, name: string): Card {
  return {
    id,
    name,
    faction: 'orisha',
    type: 'unit',
    cost: 2,
    attack: 2,
    health: 2,
    rarity: 'common',
    keywords: [],
    effects: [],
    flavorText: '',
    artUrl: '',
  };
}

describe('CardSelectionScreen', () => {
  const cards = [
    makeCard('A1', 'Acolyte'),
    makeCard('A2', 'Lancier'),
    makeCard('A3', 'Sangoma'),
  ];

  it('renders exactly 3 choice tiles', () => {
    render(<CardSelectionScreen cardChoices={cards} onSelect={() => {}} combatIndex={0} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('calls onSelect(card.id) once and locks further selection', () => {
    const onSelect = vi.fn();
    render(<CardSelectionScreen cardChoices={cards} onSelect={onSelect} combatIndex={0} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('A1');
  });

  it('throws in dev when choices length is invalid', () => {
    expect(() => {
      render(<CardSelectionScreen cardChoices={[cards[0], cards[1]]} onSelect={() => {}} combatIndex={0} />);
    }).toThrow('expects exactly 3 choices');
  });

  it('title displays next combat number', () => {
    render(<CardSelectionScreen cardChoices={cards} onSelect={() => {}} combatIndex={1} />);
    expect(screen.getByText('Choisis une carte pour le combat 3 / 3')).toBeTruthy();
  });
});
