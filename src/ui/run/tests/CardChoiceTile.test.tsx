// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Card } from '../../../engine/types.js';
import { CardChoiceTile } from '../CardChoiceTile.js';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'T01',
    name: 'Test Warrior',
    faction: 'zulu',
    type: 'unit',
    cost: 3,
    attack: 2,
    health: 4,
    rarity: 'common',
    keywords: [],
    effects: [],
    flavorText: '',
    artUrl: '',
    ...overrides,
  };
}

describe('CardChoiceTile', () => {
  it('renders card name and stats', () => {
    render(<CardChoiceTile card={makeCard()} onClick={() => {}} />);
    expect(screen.getByRole('button', { name: /Test Warrior/i })).toBeTruthy();
    expect(screen.getByText('ATK 2')).toBeTruthy();
    expect(screen.getByText('HP 4')).toBeTruthy();
  });

  it('triggers onClick when enabled', () => {
    const onClick = vi.fn();
    render(<CardChoiceTile card={makeCard()} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled blocks click and applies dimmed state', () => {
    const onClick = vi.fn();
    render(<CardChoiceTile card={makeCard()} onClick={onClick} disabled />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button.className.includes('opacity-50')).toBe(true);
  });

  it('has a non-empty aria-label', () => {
    render(<CardChoiceTile card={makeCard()} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBeTruthy();
  });
});
