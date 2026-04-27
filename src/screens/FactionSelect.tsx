import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';

const FACTION_INFO = {
  orisha: {
    label: 'Orishas',
    blurb:
      'Foudre et eaux : combo sorts, équilibre et tempo. Héros : Shango, Seigneur du Tonnerre.',
    hero: 'Shango, Seigneur du Tonnerre',
    griot:
      "Voie de l'Équilibre — tous les 3 sorts joués, le suivant coûte 1 énergie de moins.",
    color: 'amber',
    emoji: '⚡',
    borderSelected: 'border-amber-400 shadow-amber-400/30',
    textAccent: 'text-amber-400',
    badge: 'bg-amber-950/80 text-amber-200 border-amber-700/50',
  },
  zulu: {
    label: 'Zoulou',
    blurb:
      'Armée et rituels : board wide, Impi et pression. Héros : Shaka, Roi-Lion.',
    hero: 'Shaka, Roi-Lion',
    griot: 'Impi — vos unités gagnent +1 attaque tant que vous contrôlez au moins 2 unités.',
    color: 'green',
    emoji: '🦁',
    borderSelected: 'border-green-400 shadow-green-400/30',
    textAccent: 'text-green-400',
    badge: 'bg-green-950/80 text-green-200 border-green-700/50',
  },
} as const;

type Faction = 'orisha' | 'zulu';

function FactionCard({
  faction,
  selected,
  onSelect,
}: {
  faction: Faction;
  selected: boolean;
  onSelect: () => void;
}) {
  const info = FACTION_INFO[faction];
  const idleBorder = 'border-gray-700 hover:border-gray-500 hover:bg-gray-900/80';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'flex flex-col gap-3 rounded-2xl border-2 p-6 text-left transition-all duration-200',
        'bg-gray-900/90 backdrop-blur-sm w-full max-w-[260px] min-h-[240px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
        selected ? `${info.borderSelected} shadow-xl ring-1 ring-white/10` : idleBorder,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-4xl leading-none" aria-hidden>
          {info.emoji}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${info.badge}`}
        >
          {faction === 'orisha' ? 'Orisha' : 'Izulu'}
        </span>
      </div>
      <div>
        <div className={`text-xl font-black tracking-tight ${info.textAccent}`}>{info.label}</div>
        <div className="mt-1 text-sm font-medium text-gray-200">{info.hero}</div>
      </div>
      <p className="text-sm leading-relaxed text-gray-400">{info.blurb}</p>
      <div className="mt-auto border-t border-gray-800 pt-3 text-xs leading-snug text-gray-500">
        <span className="font-semibold text-gray-500">Griot — </span>
        {info.griot}
      </div>
      {selected && (
        <div className={`text-xs font-bold ${info.textAccent}`}>✓ Sélectionné pour ce joueur</div>
      )}
    </button>
  );
}

export function FactionSelect() {
  const startGame = useGameStore(s => s.startGame);
  const [p1, setP1] = useState<Faction>('orisha');
  const [p2, setP2] = useState<Faction>('zulu');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black flex flex-col items-center justify-center gap-12 px-4 py-12">
      <header className="text-center max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-500">Prototype jouable</p>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">
          Sankofa: Rites of War
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Choisissez une faction pour chaque joueur — hot-seat, même écran.
        </p>
      </header>

      <div className="w-full max-w-5xl rounded-2xl border border-gray-800 bg-gray-950/50 p-6 sm:p-10 shadow-2xl shadow-black/40">
        <div className="flex flex-col xl:flex-row items-stretch justify-center gap-10 xl:gap-6">
          {/* Player 1 */}
          <section className="flex flex-1 flex-col gap-5">
            <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-500">
              Joueur 1
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {(['orisha', 'zulu'] as Faction[]).map(f => (
                <FactionCard key={f} faction={f} selected={p1 === f} onSelect={() => setP1(f)} />
              ))}
            </div>
          </section>

          <div className="flex xl:flex-col items-center justify-center gap-2 shrink-0 py-2">
            <span className="hidden xl:block h-24 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
            <span className="xl:hidden w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="rounded-full border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-black text-gray-400">
              VS
            </span>
            <span className="hidden xl:block h-24 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
            <span className="xl:hidden w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>

          {/* Player 2 */}
          <section className="flex flex-1 flex-col gap-5">
            <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-500">
              Joueur 2
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {(['orisha', 'zulu'] as Faction[]).map(f => (
                <FactionCard key={f} faction={f} selected={p2 === f} onSelect={() => setP2(f)} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <button
        type="button"
        onClick={() => startGame(p1, p2)}
        className="rounded-full bg-yellow-500 px-12 py-4 text-lg font-black text-black shadow-lg shadow-yellow-500/25 transition-transform duration-200 hover:scale-[1.02] hover:bg-yellow-400 active:scale-[0.98]"
      >
        Commencer la partie
      </button>
    </div>
  );
}
