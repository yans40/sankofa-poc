import { useGameStore } from '../../store/gameStore.js';
import { HeroArtSVG } from '../../utils/cardArt.js';
import type { PlayerId } from '../../engine/types.js';

interface HeroPanelProps {
  playerId: PlayerId;
}

export function HeroPanel({ playerId }: HeroPanelProps) {
  const { gameState, selection, setSelection, dispatch } = useGameStore(s => ({
    gameState: s.gameState,
    selection: s.selection,
    setSelection: s.setSelection,
    dispatch: s.dispatch,
  }));

  const player = gameState.players[playerId];
  const isActive = gameState.activePlayerId === playerId;
  const isOpponent = gameState.activePlayerId !== playerId;
  const hero = player.hero;

  // Is this hero a valid attack target?
  const isAttackTarget = (() => {
    if (selection.kind !== 'attacking') return false;
    if (!isOpponent) return false;
    const opponent = gameState.players[playerId];
    const hasTaunt = opponent.battlefield.some(u => u.card.keywords.includes('taunt'));
    return !hasTaunt;
  })();

  const isSpellTarget = selection.kind === 'spell' && selection.needsTarget && isOpponent;

  function handleClick() {
    if (selection.kind === 'attacking') {
      if (isAttackTarget) {
        dispatch({
          type: 'ATTACK',
          playerId: gameState.activePlayerId,
          attackerInstanceId: selection.attackerInstanceId,
          targetType: 'hero',
        });
      }
      setSelection({ kind: 'none' });
      return;
    }
    if (selection.kind === 'spell' && isSpellTarget) {
      dispatch({
        type: 'PLAY_SPELL',
        playerId: gameState.activePlayerId,
        cardId: selection.cardId,
        targetInstanceId: `hero_${playerId}`,
      });
      setSelection({ kind: 'none' });
      return;
    }
    if (selection.kind === 'hero_power' && isOpponent) {
      dispatch({
        type: 'USE_HERO_POWER',
        playerId: gameState.activePlayerId,
        targetInstanceId: `hero_${playerId}`,
      });
      setSelection({ kind: 'none' });
    }
  }

  const ringClass = isAttackTarget || isSpellTarget
    ? 'ring-2 ring-red-400 shadow-red-400/50 shadow-lg animate-pulse cursor-pointer'
    : '';

  const canUseHeroPower = isActive && !player.heroPowerUsedThisTurn && player.energy >= 2;

  function handleHeroPower() {
    if (!canUseHeroPower) return;
    const heroPowerNeedsTarget = hero.faction === 'orisha'; // Shango targets; Shaka auto
    if (heroPowerNeedsTarget) {
      setSelection({ kind: 'hero_power' });
    } else {
      dispatch({ type: 'USE_HERO_POWER', playerId });
    }
  }

  const hpPercent = Math.max(0, (player.heroHealth / player.heroMaxHealth) * 100);
  const hpColor = hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Hero portrait */}
      <div
        onClick={handleClick}
        className={`relative rounded-full transition-all duration-150 ${ringClass}`}
      >
        <HeroArtSVG card={hero} width={72} height={72} />
        {/* HP overlay */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-600 rounded px-2 py-0.5 text-xs font-bold text-white whitespace-nowrap">
          {player.heroHealth}/{player.heroMaxHealth}
        </div>
        {/* Weapon attack badge */}
        {player.heroAttack > 0 && (
          <div className="absolute -top-1 -right-1 bg-orange-600 border border-orange-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white">
            {player.heroAttack}
          </div>
        )}
      </div>

      {/* HP bar */}
      <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-2">
        <div className={`h-full rounded-full transition-all ${hpColor}`} style={{ width: `${hpPercent}%` }} />
      </div>

      {/* Energy */}
      <div className="flex items-center gap-1 text-xs text-blue-300 font-bold">
        <span>⚡</span>
        <span>{player.energy}/{player.maxEnergy}</span>
      </div>

      {/* Hero name */}
      <div className="text-gray-400 text-xs text-center max-w-[80px] leading-tight">
        {hero.name.split(',')[0]}
      </div>

      {/* Hero power button */}
      {isActive && (
        <button
          onClick={handleHeroPower}
          disabled={!canUseHeroPower}
          title={`Pouvoir héroïque (2⚡)${player.heroPowerUsedThisTurn ? ' — déjà utilisé' : ''}`}
          className={[
            'mt-1 w-10 h-10 rounded-full border-2 text-lg transition-all',
            canUseHeroPower
              ? 'border-yellow-400 bg-yellow-900/40 hover:bg-yellow-800/60 cursor-pointer hover:scale-110'
              : 'border-gray-600 bg-gray-900 opacity-40 cursor-not-allowed',
          ].join(' ')}
        >
          {hero.faction === 'orisha' ? '⚡' : '⚔'}
        </button>
      )}
    </div>
  );
}
