// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FactionSelect } from '../FactionSelect.js';
import * as storeModule from '../../store/gameStore.js';

vi.mock('../../store/gameStore.js', () => ({
  useGameStore: vi.fn(),
}));

const useGameStoreMock = storeModule.useGameStore as unknown as ReturnType<typeof vi.fn>;

const startGame = vi.fn();
const initRun = vi.fn();

beforeEach(() => {
  startGame.mockReset();
  initRun.mockReset();
  useGameStoreMock.mockImplementation((selector: (s: object) => unknown) =>
    selector({ startGame, initRun }),
  );
});

describe('FactionSelect — régression hot-seat M2', () => {
  it('affiche les deux boutons de lancement', () => {
    render(<FactionSelect />);
    expect(screen.getByRole('button', { name: /partie libre/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /commencer le voyage/i })).toBeTruthy();
  });

  it('"Partie libre" appelle startGame et pas initRun', () => {
    render(<FactionSelect />);
    fireEvent.click(screen.getByRole('button', { name: /partie libre/i }));
    expect(startGame).toHaveBeenCalledTimes(1);
    expect(initRun).not.toHaveBeenCalled();
  });

  it('"Partie libre" passe les factions p1/p2 par défaut (orisha vs zulu)', () => {
    render(<FactionSelect />);
    fireEvent.click(screen.getByRole('button', { name: /partie libre/i }));
    expect(startGame).toHaveBeenCalledWith('orisha', 'zulu');
  });

  it('"Commencer le voyage" appelle initRun et pas startGame', () => {
    render(<FactionSelect />);
    fireEvent.click(screen.getByRole('button', { name: /commencer le voyage/i }));
    expect(initRun).toHaveBeenCalledTimes(1);
    expect(startGame).not.toHaveBeenCalled();
  });

  it('"Commencer le voyage" utilise la faction p1 sélectionnée', () => {
    render(<FactionSelect />);
    // Two "Zoulou" cards exist (P1 + P2) — first one is P1
    const zuluCards = screen.getAllByRole('button', { name: /zoulou/i });
    fireEvent.click(zuluCards[0]);
    fireEvent.click(screen.getByRole('button', { name: /commencer le voyage/i }));
    expect(initRun).toHaveBeenCalledWith('zulu');
  });
});
