import { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore.js';

const CYCLE_COLOR: Record<string, string> = {
  dawn: 'text-orange-300',
  day: 'text-yellow-200',
  night: 'text-blue-300',
};

export function GameLog() {
  const { gameState } = useGameStore(s => ({ gameState: s.gameState }));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.log.length]);

  const recent = gameState.log.slice(-40);

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-bold text-gray-400 tracking-wider mb-1 px-1">LOG</div>
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1" style={{ maxHeight: 320 }}>
        {recent.map((entry, i) => {
          const isSystem = entry.actor === 'system';
          const isSeparator = entry.message.startsWith('---');
          if (isSeparator) {
            const cycleMatch = entry.message.match(/Cycle: (\w+)/);
            const cycle = cycleMatch?.[1]?.toLowerCase() ?? 'day';
            return (
              <div key={i} className={`text-xs font-bold ${CYCLE_COLOR[cycle] ?? 'text-gray-300'} mt-1`}>
                {entry.message.replace(/^---\s*/, '').replace(/\s*---$/, '')}
              </div>
            );
          }
          return (
            <div key={i} className={`text-xs leading-snug ${isSystem ? 'text-gray-400 italic' : entry.actor === 'p1' ? 'text-amber-300' : 'text-green-300'}`}>
              {!isSystem && <span className="font-bold">[{entry.actor}] </span>}
              {entry.message}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Cycle & turn indicator */}
      <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between text-xs text-gray-500">
        <span>Tour {gameState.turn}</span>
        <span className={CYCLE_COLOR[gameState.worldCycle]}>{gameState.worldCycle.toUpperCase()}</span>
      </div>
    </div>
  );
}
