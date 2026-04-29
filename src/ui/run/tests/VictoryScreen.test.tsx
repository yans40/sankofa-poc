// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VictoryScreen } from '../VictoryScreen.js';
import * as storeModule from '../../../store/gameStore.js';
import type { RunState } from '../../../engine/run/runState.js';

vi.mock('../../../store/gameStore.js', () => ({
  useGameStore: vi.fn(),
}));

const useGameStoreMock = storeModule.useGameStore as unknown as ReturnType<typeof vi.fn>;

function makeRun(overrides: Partial<RunState> = {}): Partial<RunState> {
  return {
    phase: 'victory',
    combatIndex: 2,
    heroHp: 18,
    heroMaxHp: 30,
    faction: 'zulu',
    playerDeck: new Array(22).fill({ id: 'X' }),
    cardChoices: null,
    ...overrides,
  };
}

const resetRun = vi.fn();
const initRun = vi.fn();

beforeEach(() => {
  resetRun.mockReset();
  initRun.mockReset();
  useGameStoreMock.mockImplementation((selector: (s: object) => unknown) =>
    selector({ run: makeRun(), resetRun, initRun }),
  );
});

describe('VictoryScreen', () => {
  it('returns null when run is null', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: null, resetRun, initRun }),
    );
    const { container } = render(<VictoryScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('shows victory title', () => {
    render(<VictoryScreen />);
    expect(screen.getByText(/Sankofa accompli/i)).toBeTruthy();
  });

  it('shows combats won 3/3', () => {
    render(<VictoryScreen />);
    expect(screen.getByText('3 / 3')).toBeTruthy();
  });

  it('shows hero HP', () => {
    render(<VictoryScreen />);
    expect(screen.getByText('18 / 30')).toBeTruthy();
  });

  it('shows cards added (playerDeck.length - 20)', () => {
    render(<VictoryScreen />);
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('shows 2 buttons: Rejouer and Retour', () => {
    render(<VictoryScreen />);
    expect(screen.getByRole('button', { name: /rejouer/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /retour/i })).toBeTruthy();
  });

  it('"Rejouer" resets run and starts a new one with same faction', () => {
    render(<VictoryScreen />);
    fireEvent.click(screen.getByRole('button', { name: /rejouer/i }));
    expect(resetRun).toHaveBeenCalledTimes(1);
    expect(initRun).toHaveBeenCalledWith('zulu');
  });

  it('"Retour" calls resetRun only', () => {
    render(<VictoryScreen />);
    fireEvent.click(screen.getByRole('button', { name: /retour/i }));
    expect(resetRun).toHaveBeenCalledTimes(1);
    expect(initRun).not.toHaveBeenCalled();
  });
});
