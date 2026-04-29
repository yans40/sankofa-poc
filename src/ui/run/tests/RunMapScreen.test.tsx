// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RunMapScreen } from '../RunMapScreen.js';
import * as storeModule from '../../../store/gameStore.js';
import type { RunState } from '../../../engine/run/runState.js';

vi.mock('../../../store/gameStore.js', () => ({
  useGameStore: vi.fn(),
}));

const useGameStoreMock = storeModule.useGameStore as unknown as ReturnType<typeof vi.fn>;

function makeRun(overrides: Partial<RunState> = {}): Partial<RunState> {
  return {
    phase: 'starting',
    combatIndex: 0,
    heroHp: 30,
    heroMaxHp: 30,
    playerDeck: new Array(20).fill({ id: 'X' }),
    cardChoices: null,
    ...overrides,
  };
}

beforeEach(() => {
  useGameStoreMock.mockImplementation((selector: (s: object) => unknown) =>
    selector({ run: makeRun(), startRunCombat: vi.fn() }),
  );
});

describe('RunMapScreen', () => {
  it('returns null when run is null', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: null, startRunCombat: vi.fn() }),
    );
    const { container } = render(<RunMapScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('displays 3 step indicators', () => {
    render(<RunMapScreen />);
    const steps = screen.getByRole('list', { name: /étapes du voyage/i });
    expect(steps.querySelectorAll('[role="listitem"]')).toHaveLength(3);
  });

  it('shows correct combat title for combatIndex 0', () => {
    render(<RunMapScreen />);
    expect(screen.getByText('Combat 1 / 3')).toBeTruthy();
  });

  it('shows "Commencer le voyage" button for combat 0', () => {
    render(<RunMapScreen />);
    expect(screen.getByRole('button', { name: /commencer le voyage/i })).toBeTruthy();
  });

  it('shows "Commencer le combat" button for combat > 0', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: makeRun({ combatIndex: 1 }), startRunCombat: vi.fn() }),
    );
    render(<RunMapScreen />);
    expect(screen.getByRole('button', { name: /commencer le combat/i })).toBeTruthy();
  });

  it('displays hero HP correctly', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: makeRun({ heroHp: 12, heroMaxHp: 30 }), startRunCombat: vi.fn() }),
    );
    render(<RunMapScreen />);
    expect(screen.getByText('12 / 30')).toBeTruthy();
  });

  it('displays deck size', () => {
    render(<RunMapScreen />);
    expect(screen.getByText('20')).toBeTruthy();
  });

  it('clicking "Commencer" calls startRunCombat', () => {
    const startRunCombat = vi.fn();
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: makeRun(), startRunCombat }),
    );
    render(<RunMapScreen />);
    fireEvent.click(screen.getByRole('button', { name: /commencer/i }));
    expect(startRunCombat).toHaveBeenCalledTimes(1);
  });

  it('first step is current (⚔) at combatIndex 0, others are future (○)', () => {
    render(<RunMapScreen />);
    const listItems = screen.getByRole('list').querySelectorAll('[role="listitem"]');
    expect(listItems[0].textContent).toContain('⚔');
    expect(listItems[1].textContent).toContain('○');
    expect(listItems[2].textContent).toContain('○');
  });

  it('first step shows ✓ at combatIndex 1 (completed)', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: makeRun({ combatIndex: 1 }), startRunCombat: vi.fn() }),
    );
    render(<RunMapScreen />);
    const listItems = screen.getByRole('list').querySelectorAll('[role="listitem"]');
    expect(listItems[0].textContent).toContain('✓');
    expect(listItems[1].textContent).toContain('⚔');
  });
});
