// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RunRouter } from '../RunRouter.js';
import * as storeModule from '../../../store/gameStore.js';
import type { RunState } from '../../../engine/run/runState.js';
import type { Card } from '../../../engine/types.js';

vi.mock('../../../store/gameStore.js', () => ({
  useGameStore: vi.fn(),
}));

// Silence child component render errors (Board, CardSelectionScreen need full store)
vi.mock('../../../components/Board/Board.js', () => ({
  Board: () => <div data-testid="board">Board</div>,
}));
vi.mock('../CardSelectionScreen.js', () => ({
  CardSelectionScreen: () => <div data-testid="card-selection">CardSelection</div>,
}));
vi.mock('../RunMapScreen.js', () => ({
  RunMapScreen: () => <div data-testid="run-map">RunMapScreen</div>,
}));
vi.mock('../VictoryScreen.js', () => ({
  VictoryScreen: () => <div data-testid="victory">VictoryScreen</div>,
}));
vi.mock('../DefeatScreen.js', () => ({
  DefeatScreen: () => <div data-testid="defeat">DefeatScreen</div>,
}));

function mockRun(phase: RunState['phase']): Partial<RunState> {
  return {
    phase,
    combatIndex: 0,
    cardChoices: phase === 'card_selection'
      ? [{ id: 'C1' } as Card, { id: 'C2' } as Card, { id: 'C3' } as Card]
      : null,
  };
}

const useGameStoreMock = storeModule.useGameStore as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  useGameStoreMock.mockImplementation((selector: (s: object) => unknown) =>
    selector({ run: null, selectRunCard: vi.fn() }),
  );
});

describe('RunRouter', () => {
  it('returns null when run is null', () => {
    const { container } = render(<RunRouter />);
    expect(container.firstChild).toBeNull();
  });

  it('renders RunMapScreen for phase starting', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: mockRun('starting'), selectRunCard: vi.fn() }),
    );
    render(<RunRouter />);
    expect(screen.getByTestId('run-map')).toBeTruthy();
  });

  it('renders Board for phase combat', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: mockRun('combat'), selectRunCard: vi.fn() }),
    );
    render(<RunRouter />);
    expect(screen.getByTestId('board')).toBeTruthy();
  });

  it('renders CardSelectionScreen for phase card_selection', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: mockRun('card_selection'), selectRunCard: vi.fn() }),
    );
    render(<RunRouter />);
    expect(screen.getByTestId('card-selection')).toBeTruthy();
  });

  it('renders VictoryScreen for phase victory', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: mockRun('victory'), selectRunCard: vi.fn() }),
    );
    render(<RunRouter />);
    expect(screen.getByTestId('victory')).toBeTruthy();
  });

  it('renders DefeatScreen for phase defeat', () => {
    useGameStoreMock.mockImplementation((sel: (s: object) => unknown) =>
      sel({ run: mockRun('defeat'), selectRunCard: vi.fn() }),
    );
    render(<RunRouter />);
    expect(screen.getByTestId('defeat')).toBeTruthy();
  });
});
