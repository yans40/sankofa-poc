import { useGameStore } from '../../store/gameStore.js';
import { Board } from '../../components/Board/Board.js';
import { CardSelectionScreen } from './CardSelectionScreen.js';
import { RunMapScreen } from './RunMapScreen.js';
import { VictoryScreen } from './VictoryScreen.js';
import { DefeatScreen } from './DefeatScreen.js';

export function RunRouter() {
  const run = useGameStore(s => s.run);
  const selectRunCard = useGameStore(s => s.selectRunCard);
  const phase = run?.phase;

  switch (phase) {
    case 'starting':
      return <RunMapScreen />;

    case 'combat':
      return <Board />;

    case 'card_selection':
      if (!run?.cardChoices) return null;
      return (
        <CardSelectionScreen
          cardChoices={run.cardChoices}
          onSelect={selectRunCard}
          combatIndex={run.combatIndex as 0 | 1}
        />
      );

    case 'victory':
      return <VictoryScreen />;

    case 'defeat':
      return <DefeatScreen />;

    default:
      return null;
  }
}
