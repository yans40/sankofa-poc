import { useGameStore } from '../../store/gameStore.js';
import type { PlayerId, RitualInstance } from '../../engine/types.js';

interface RitualZoneProps {
  playerId: PlayerId;
}

function RitualCard({ ritual, playerId }: { ritual: RitualInstance; playerId: PlayerId }) {
  const { gameState, dispatch } = useGameStore(s => ({
    gameState: s.gameState,
    dispatch: s.dispatch,
  }));

  const player = gameState.players[playerId];
  const isActive = gameState.activePlayerId === playerId;
  const canOffer = isActive && !ritual.ready && player.energy >= 1;

  const chargeColor = ritual.ready
    ? 'border-yellow-400 bg-yellow-900/40 shadow-yellow-400/30 shadow-lg'
    : 'border-purple-600 bg-purple-950/60';

  return (
    <div className={`flex flex-col items-center rounded-lg border-2 p-2 gap-1 ${chargeColor} w-16`}>
      <div className="text-purple-300 font-bold text-xs text-center leading-tight">
        {ritual.card.name.split(' ')[0]}
      </div>

      {/* Charge pips */}
      <div className="flex gap-0.5">
        {Array.from({ length: ritual.card.initialCharges ?? 1 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i >= ritual.remainingCharges ? 'bg-purple-800' : 'bg-purple-400'}`}
          />
        ))}
      </div>

      {ritual.ready && (
        <div className="text-yellow-300 text-xs font-bold animate-pulse">PRÊT</div>
      )}

      {/* Offering button */}
      {canOffer && (
        <button
          onClick={() => dispatch({
            type: 'MAKE_OFFERING',
            playerId,
            ritualInstanceId: ritual.instanceId,
            offeringType: 'energy',
            payload: null,
          })}
          className="text-xs bg-purple-700 hover:bg-purple-600 text-white rounded px-1 py-0.5 transition-all"
          title="Offrir 1⚡"
        >
          +⚡
        </button>
      )}
    </div>
  );
}

export function RitualZone({ playerId }: RitualZoneProps) {
  const gameState = useGameStore(s => s.gameState);
  const player = gameState.players[playerId];
  const label = playerId === 'p1' ? 'RITUELS P1' : 'RITUELS P2';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-bold text-purple-400 tracking-wider">{label}</div>
      <div className="flex flex-col gap-1">
        {player.rituals.length === 0 && (
          <div className="text-gray-700 text-xs">—</div>
        )}
        {player.rituals.map(r => (
          <RitualCard key={r.instanceId} ritual={r} playerId={playerId} />
        ))}
      </div>
    </div>
  );
}
