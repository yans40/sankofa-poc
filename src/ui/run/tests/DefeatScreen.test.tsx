// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefeatScreen } from '../DefeatScreen.js';
import * as storeModule from '../../../store/gameStore.js';
import type { RunState } from '../../../engine/run/runState.js';

vi.mock('../../../store/gameStore.js', () => ({
  useGameStore: vi.fn(),
}));

const useGameStoreMock = storeModule.useGameStore as unknown as ReturnType<typeof vi.fn>;

function makeRun(overrides: Partial<RunState> = {}): Partial<RunState> {
  return {
    phase: 'defeat',
    combatIndex: 1,
    heroHp: 0,
    heroMaxHp: 30,
    faction: 'orisha',
    playerDeck: new Array(21).fill({ id: 'X' }),
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
    selector({ run: makeRun(), resetRun, initRun, runTotalDamageDealt: 0 }),
  );
});

describe('DefeatScreen', () => {
  it('returns null when run is null', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: null, resetRun, initRun, runTotalDamageDealt: 0 }),
    );
    const { container } = render(<DefeatScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('shows defeat title', () => {
    render(<DefeatScreen />);
    expect(screen.getByText(/Le voyage s'arrête ici/i)).toBeTruthy();
  });

  it('shows combat index where defeat occurred (combatIndex + 1 / 3)', () => {
    render(<DefeatScreen />);
    expect(screen.getByText('2 / 3')).toBeTruthy();
  });

  it('defeat at combat 0 shows 1 / 3', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: makeRun({ combatIndex: 0 }), resetRun, initRun, runTotalDamageDealt: 0 }),
    );
    render(<DefeatScreen />);
    expect(screen.getByText('1 / 3')).toBeTruthy();
  });

  it('shows cards added (playerDeck.length - 20)', () => {
    render(<DefeatScreen />);
    // playerDeck.length = 21, cards added = 1
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('shows 2 buttons: Réessayer and Retour', () => {
    render(<DefeatScreen />);
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /retour/i })).toBeTruthy();
  });

  it('shows HP lost (heroMaxHp - heroHp)', () => {
    render(<DefeatScreen />);
    // heroHp: 0, heroMaxHp: 30 → PV perdus = 30
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('shows total damage dealt', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: makeRun(), resetRun, initRun, runTotalDamageDealt: 42 }),
    );
    render(<DefeatScreen />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('"Réessayer" resets and starts a new run with same faction', () => {
    render(<DefeatScreen />);
    fireEvent.click(screen.getByRole('button', { name: /réessayer/i }));
    expect(resetRun).toHaveBeenCalledTimes(1);
    expect(initRun).toHaveBeenCalledWith('orisha');
  });

  it('"Retour" calls resetRun only', () => {
    render(<DefeatScreen />);
    fireEvent.click(screen.getByRole('button', { name: /retour/i }));
    expect(resetRun).toHaveBeenCalledTimes(1);
    expect(initRun).not.toHaveBeenCalled();
  });
});
