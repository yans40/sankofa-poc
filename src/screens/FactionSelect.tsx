import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';

const FACTION_INFO = {
  orisha: {
    label: 'Orishas',
    hero: 'Shango, Seigneur du Tonnerre',
    griot: 'Voie de l\'Équilibre — tous les 3 sorts joués, le suivant coûte 1 de moins',
    color: 'amber',
    emoji: '⚡',
  },
  zulu: {
    label: 'Zoulou',
    hero: 'Shaka, Roi-Lion',
    griot: 'Impi — vos unités gagnent +1 attaque tant que vous contrôlez 2+ unités',
    color: 'green',
    emoji: '🦁',
  },
} as const;

type Faction = 'orisha' | 'zulu';

function FactionCard({ faction, selected, onSelect }: { faction: Faction; selected: boolean; onSelect: () => void }) {
  const info = FACTION_INFO[faction];
  const border = selected
    ? faction === 'orisha' ? 'border-amber-400 shadow-amber-400/40 shadow-xl' : 'border-green-400 shadow-green-400/40 shadow-xl'
    : 'border-gray-600 hover:border-gray-400';

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col gap-2 rounded-xl border-2 p-5 text-left transition-all duration-200 ${border} bg-gray-900 w-56`}
    >
      <div className="text-4xl">{info.emoji}</div>
      <div className={`text-xl font-bold ${faction === 'orisha' ? 'text-amber-400' : 'text-green-400'}`}>
        {info.label}
      </div>
      <div className="text-gray-300 text-sm font-medium">{info.hero}</div>
      <div className="text-gray-500 text-xs leading-relaxed">{info.griot}</div>
      {selected && (
        <div className={`text-xs font-bold mt-1 ${faction === 'orisha' ? 'text-amber-300' : 'text-green-300'}`}>
          ✓ Sélectionné
        </div>
      )}
    </button>
  );
}

export function FactionSelect() {
  const startGame = useGameStore(s => s.startGame);
  const [p1, setP1] = useState<Faction>('orisha');
  const [p2, setP2] = useState<Faction>('zulu');

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white tracking-wide mb-2">SANKOFA</h1>
        <p className="text-gray-400 text-lg">Rites of War — POC</p>
      </div>

      <div className="flex gap-16">
        {/* Player 1 */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-white font-bold text-lg">Joueur 1</h2>
          <div className="flex gap-3">
            {(['orisha', 'zulu'] as Faction[]).map(f => (
              <FactionCard key={f} faction={f} selected={p1 === f} onSelect={() => setP1(f)} />
            ))}
          </div>
        </div>

        <div className="flex items-center text-gray-600 text-4xl font-black">VS</div>

        {/* Player 2 */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-white font-bold text-lg">Joueur 2</h2>
          <div className="flex gap-3">
            {(['orisha', 'zulu'] as Faction[]).map(f => (
              <FactionCard key={f} faction={f} selected={p2 === f} onSelect={() => setP2(f)} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => startGame(p1, p2)}
        className="mt-4 px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-full shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:scale-105"
      >
        ⚔ COMMENCER LA PARTIE
      </button>
    </div>
  );
}
