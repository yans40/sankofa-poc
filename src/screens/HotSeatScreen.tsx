import { useGameStore } from '../store/gameStore.js';

export function HotSeatScreen() {
  const { hotSeatPending, confirmHotSeat, gameState } = useGameStore(s => ({
    hotSeatPending: s.hotSeatPending,
    confirmHotSeat: s.confirmHotSeat,
    gameState: s.gameState,
  }));

  const pid = hotSeatPending ?? gameState.activePlayerId;
  const player = gameState.players[pid];
  const heroName = player.hero.name;
  const faction = player.hero.faction;

  const accentColor = faction === 'orisha' ? 'text-amber-400' : 'text-green-400';
  const btnColor = faction === 'orisha'
    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/40'
    : 'bg-green-700 hover:bg-green-600 shadow-green-700/40';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-3">
        <p className="text-gray-400 text-xl">Passe l'écran à</p>
        <h2 className={`text-4xl font-black ${accentColor}`}>{pid.toUpperCase()}</h2>
        <p className="text-gray-300 text-lg">{heroName}</p>
        <p className="text-gray-600 text-sm">(Cache l'écran pendant le passage)</p>
      </div>

      <div className="w-40 h-1 bg-gray-800 rounded" />

      <button
        onClick={confirmHotSeat}
        className={`px-10 py-4 ${btnColor} text-white font-black text-xl rounded-full shadow-lg transition-all duration-200 hover:scale-105`}
      >
        👁 Révéler ma main
      </button>
    </div>
  );
}
