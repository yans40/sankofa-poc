import { useGameStore } from './store/gameStore.js';
import { FactionSelect } from './screens/FactionSelect.js';
import { HotSeatScreen } from './screens/HotSeatScreen.js';
import { VictoryScreen } from './screens/VictoryScreen.js';
import { MulliganScreen } from './components/MulliganModal/MulliganModal.js';
import { Board } from './components/Board/Board.js';

export default function App() {
  const screen = useGameStore(s => s.screen);

  if (screen === 'faction_select') return <FactionSelect />;
  if (screen === 'mulligan')      return <MulliganScreen />;
  if (screen === 'hotseat')       return <HotSeatScreen />;
  if (screen === 'game')          return <Board />;
  if (screen === 'gameover')      return <VictoryScreen />;

  return <FactionSelect />;
}
