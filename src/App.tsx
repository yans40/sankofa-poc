import { useGameStore } from './store/gameStore.js';
import { FactionSelect } from './screens/FactionSelect.js';
import { HotSeatScreen } from './screens/HotSeatScreen.js';
import { VictoryScreen } from './screens/VictoryScreen.js';
import { MulliganScreen } from './components/MulliganModal/MulliganModal.js';
import { Board } from './components/Board/Board.js';
import { RunRouter } from './ui/run/RunRouter.js';

export default function App() {
  const screen = useGameStore(s => s.screen);
  const run = useGameStore(s => s.run);

  // Run mode takes over when a run is active
  if (run !== null) return <RunRouter />;

  // Hot-seat mode (M2)
  if (screen === 'faction_select') return <FactionSelect />;
  if (screen === 'mulligan')      return <MulliganScreen />;
  if (screen === 'hotseat')       return <HotSeatScreen />;
  if (screen === 'game')          return <Board />;
  if (screen === 'gameover')      return <VictoryScreen />;

  return <FactionSelect />;
}
