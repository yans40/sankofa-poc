import { useGameStore } from '../store/gameStore.js';

export function VictoryScreen() {
  const { gameState, startGame, p1Faction, p2Faction } = useGameStore(s => ({
    gameState: s.gameState,
    startGame: s.startGame,
    p1Faction: s.p1Faction,
    p2Faction: s.p2Faction,
  }));

  const winner = gameState.winner;
  if (!winner) return null;

  const winnerPlayer = gameState.players[winner];
  const loser = winner === 'p1' ? 'p2' : 'p1';
  const loserPlayer = gameState.players[loser];
  const faction = winnerPlayer.hero.faction;
  const accentColor = faction === 'orisha' ? 'text-amber-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-4">
        <div className="text-7xl">🏆</div>
        <h1 className={`text-5xl font-black ${accentColor}`}>VICTOIRE</h1>
        <h2 className="text-3xl text-white font-bold">{winner.toUpperCase()} — {winnerPlayer.hero.name}</h2>
        <p className="text-gray-400">
          {loserPlayer.hero.name} a été vaincu après {gameState.turn} tours.
        </p>
        <div className="flex gap-8 justify-center text-sm text-gray-500 mt-2">
          <span>P1 PV restants : {gameState.players.p1.heroHealth}</span>
          <span>P2 PV restants : {gameState.players.p2.heroHealth}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => startGame(p1Faction, p2Faction)}
          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105"
        >
          ⚔ Rejouer
        </button>
        <button
          onClick={() => useGameStore.setState({ screen: 'faction_select' })}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-full transition-all hover:scale-105"
        >
          Changer de faction
        </button>
      </div>
    </div>
  );
}
