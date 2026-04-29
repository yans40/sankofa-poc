import { useGameStore } from '../../store/gameStore.js';

const INITIAL_DECK_SIZE = 20;

export function VictoryScreen() {
  const run = useGameStore(s => s.run);
  const resetRun = useGameStore(s => s.resetRun);
  const initRun = useGameStore(s => s.initRun);

  if (!run) return null;

  const cardsAdded = run.playerDeck.length - INITIAL_DECK_SIZE;

  function handleReplay() {
    resetRun();
    initRun(run!.faction as 'orisha' | 'zulu');
  }

  function handleHome() {
    resetRun();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="text-center space-y-4">
        <div className="text-7xl">🏆</div>
        <h1 className="text-5xl font-black text-amber-400">Sankofa accompli</h1>
        <p className="text-gray-300 text-lg max-w-md mx-auto">
          Le voyage s'achève. Les trois épreuves ont été surmontées.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-amber-800/40 bg-amber-950/20 p-6 space-y-3">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-amber-400/80 mb-4">
          Récapitulatif
        </h2>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Combats gagnés</span>
          <span className="font-bold text-green-400">3 / 3</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">PV héros final</span>
          <span className="font-bold text-white">{run.heroHp} / {run.heroMaxHp}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Cartes ajoutées</span>
          <span className="font-bold text-blue-300">{cardsAdded}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Taille du deck final</span>
          <span className="font-bold text-blue-300">{run.playerDeck.length}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleReplay}
          className="rounded-full bg-yellow-500 px-10 py-3 text-base font-black text-black shadow-lg shadow-yellow-500/25 transition-transform duration-200 hover:scale-[1.02] hover:bg-yellow-400 active:scale-[0.98]"
        >
          Rejouer
        </button>
        <button
          type="button"
          onClick={handleHome}
          className="rounded-full bg-gray-700 px-10 py-3 text-base font-bold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-gray-600 active:scale-[0.98]"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
