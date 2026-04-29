import type { CSSProperties } from 'react';
import { useGameStore } from '../../store/gameStore.js';

const STEP_LABELS = ['Combat 1', 'Combat 2', 'Combat 3'];

function StepIndicator({ index, combatIndex }: { index: number; combatIndex: number }) {
  const done = combatIndex > index;
  const current = combatIndex === index;

  const ring = done
    ? 'border-green-500 bg-green-900/60 text-green-300'
    : current
      ? 'border-yellow-400 bg-yellow-900/40 text-yellow-300 ring-2 ring-yellow-400/40'
      : 'border-gray-600 bg-gray-900/40 text-gray-500';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-all ${ring}`}
        aria-label={`${STEP_LABELS[index]} ${done ? 'terminé' : current ? 'en cours' : 'à venir'}`}
      >
        {done ? '✓' : current ? '⚔' : '○'}
      </div>
      <span className={`text-xs font-semibold ${current ? 'text-yellow-300' : done ? 'text-green-400' : 'text-gray-500'}`}>
        {STEP_LABELS[index]}
      </span>
    </div>
  );
}

export function RunMapScreen() {
  const run = useGameStore(s => s.run);
  const startRunCombat = useGameStore(s => s.startRunCombat);

  if (!run) return null;

  const { combatIndex, heroHp, heroMaxHp, playerDeck } = run;
  const hpPercent = Math.max(0, Math.round((heroHp / heroMaxHp) * 100));
  const isFirstCombat = combatIndex === 0;
  const btnLabel = isFirstCombat ? 'Commencer le voyage' : 'Commencer le combat';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black flex flex-col items-center justify-center gap-10 px-4 py-12">
      <header className="text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Voyage de Sankofa
        </p>
        <h1 className="text-4xl font-black text-white">
          Combat {combatIndex + 1} / 3
        </h1>
      </header>

      {/* Journey steps */}
      <div className="flex items-center gap-4" role="list" aria-label="Étapes du voyage">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4" role="listitem">
            <StepIndicator index={i} combatIndex={combatIndex} />
            {i < 2 && <div className="h-px w-10 bg-gray-700" />}
          </div>
        ))}
      </div>

      {/* Hero stats */}
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-950/80 p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-400">PV du héros</span>
            <span className="text-white">{heroHp} / {heroMaxHp}</span>
          </div>
          <div
            className="h-3 w-full rounded-full bg-gray-800 overflow-hidden"
            style={{ '--hp': `${hpPercent}%` } as CSSProperties}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all [width:var(--hp)]"
              role="progressbar"
              aria-valuenow={heroHp}
              aria-valuemin={0}
              aria-valuemax={heroMaxHp}
              aria-label="Points de vie"
            />
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Cartes dans le deck</span>
          <span className="font-bold text-blue-300">{playerDeck.length}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={startRunCombat}
        className="rounded-full bg-yellow-500 px-12 py-4 text-lg font-black text-black shadow-lg shadow-yellow-500/25 transition-transform duration-200 hover:scale-[1.02] hover:bg-yellow-400 active:scale-[0.98]"
      >
        {btnLabel}
      </button>
    </div>
  );
}
