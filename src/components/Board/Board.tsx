import { DndContext, type DragEndEvent, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameStore } from '../../store/gameStore.js';
import { BattlefieldUnit } from '../Card/CardComponent.js';
import { Hand } from '../Hand/Hand.js';
import { HeroPanel } from '../HeroPanel/HeroPanel.js';
import { Altar } from '../Altar/Altar.js';
import { RitualZone } from '../RitualZone/RitualZone.js';
import { GameLog } from '../GameLog/GameLog.js';
import type { PlayerId, UnitInstance } from '../../engine/types.js';

// ─── Battlefield strip ────────────────────────────────────────────────────────
function Battlefield({ playerId }: { playerId: PlayerId }) {
  const { gameState, selection, setSelection, dispatch } = useGameStore(s => ({
    gameState: s.gameState,
    selection: s.selection,
    setSelection: s.setSelection,
    dispatch: s.dispatch,
  }));

  const { isOver, setNodeRef } = useDroppable({ id: `battlefield-${playerId}` });
  const activeId = gameState.activePlayerId;
  const isOwnSide = playerId === activeId;
  const opponentId: PlayerId = activeId === 'p1' ? 'p2' : 'p1';
  const opponent = gameState.players[opponentId];
  const player = gameState.players[playerId];

  function handleUnitClick(unit: UnitInstance) {
    // Clicking own unit while in 'none' mode → select for attack
    if (isOwnSide && selection.kind === 'none') {
      if (!unit.hasAttackedThisTurn && !unit.justSummoned) {
        setSelection({ kind: 'attacking', attackerInstanceId: unit.instanceId });
      }
      return;
    }
    // Clicking own unit while attacking → deselect
    if (isOwnSide && selection.kind === 'attacking') {
      setSelection({ kind: 'none' });
      return;
    }
    // Clicking enemy unit as attack target
    if (!isOwnSide && selection.kind === 'attacking') {
      const hasTaunt = opponent.battlefield.some(u => u.card.keywords.includes('taunt'));
      const isTaunt = unit.card.keywords.includes('taunt');
      if (hasTaunt && !isTaunt) return; // must attack taunt first
      dispatch({
        type: 'ATTACK',
        playerId: activeId,
        attackerInstanceId: selection.attackerInstanceId,
        targetType: 'unit',
        targetInstanceId: unit.instanceId,
      });
      setSelection({ kind: 'none' });
      return;
    }
    // Spell targeting enemy unit
    if (!isOwnSide && selection.kind === 'spell' && selection.needsTarget) {
      dispatch({
        type: 'PLAY_SPELL',
        playerId: activeId,
        cardId: selection.cardId,
        targetInstanceId: unit.instanceId,
      });
      setSelection({ kind: 'none' });
      return;
    }
    // Hero power targeting enemy unit
    if (!isOwnSide && selection.kind === 'hero_power') {
      dispatch({
        type: 'USE_HERO_POWER',
        playerId: activeId,
        targetInstanceId: unit.instanceId,
      });
      setSelection({ kind: 'none' });
    }
  }

  function isUnitTargetable(unit: UnitInstance): boolean {
    if (isOwnSide) return false;
    if (selection.kind !== 'attacking' && selection.kind !== 'spell' && selection.kind !== 'hero_power') return false;
    if (selection.kind === 'attacking') {
      const hasTaunt = opponent.battlefield.some(u => u.card.keywords.includes('taunt'));
      return hasTaunt ? unit.card.keywords.includes('taunt') : true;
    }
    return true;
  }

  function isUnitSelected(unit: UnitInstance): boolean {
    return selection.kind === 'attacking' && selection.attackerInstanceId === unit.instanceId;
  }

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex items-center justify-center gap-2 min-h-[100px] rounded-xl border-2 border-dashed transition-all px-3 py-2',
        isOver && isOwnSide ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700 bg-gray-900/30',
      ].join(' ')}
      style={{ minWidth: 420 }}
    >
      {player.battlefield.length === 0 && (
        <span className="text-gray-700 text-sm select-none">
          {isOwnSide ? 'Glisse tes unités ici' : 'Champ adverse vide'}
        </span>
      )}
      {player.battlefield.map(unit => (
        <BattlefieldUnit
          key={unit.instanceId}
          unit={unit}
          isOwn={isOwnSide}
          isSelected={isUnitSelected(unit)}
          isTargetable={isUnitTargetable(unit)}
          onClick={() => handleUnitClick(unit)}
        />
      ))}
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export function Board() {
  const { gameState, selection, dispatch, setSelection } = useGameStore(s => ({
    gameState: s.gameState,
    selection: s.selection,
    dispatch: s.dispatch,
    setSelection: s.setSelection,
  }));

  // Require 8px of movement before drag activates — allows normal clicks to work
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeId = gameState.activePlayerId;
  const opponentId: PlayerId = activeId === 'p1' ? 'p2' : 'p1';
  const activePlayer = gameState.players[activeId];

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;
    if (!over) return;
    if (over.id === `battlefield-${activeId}`) {
      const cardId = active.data.current?.cardId as string | undefined;
      const cardType = active.data.current?.cardType as string | undefined;
      if (!cardId || cardType !== 'unit') return;
      dispatch({
        type: 'PLAY_UNIT',
        playerId: activeId,
        cardId,
        targetSlot: activePlayer.battlefield.length,
      });
    }
  }

  // Click outside deselects
  function handleBoardClick() {
    setSelection({ kind: 'none' });
  }

  const activeLabel = `${activeId.toUpperCase()} — ${activePlayer.hero.name.split(',')[0]}`;
  const cycleBg: Record<string, string> = { dawn: 'text-orange-300', day: 'text-yellow-200', night: 'text-blue-300' };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="flex h-screen w-screen bg-gray-950 overflow-hidden select-none"
        onClick={handleBoardClick}
      >
        {/* ── Left column : Altars ── */}
        <div className="flex flex-col justify-between py-4 px-2 gap-4 w-24 border-r border-gray-800">
          <Altar playerId={opponentId} />
          <div className="flex flex-col gap-2">
            <RitualZone playerId={opponentId} />
            <RitualZone playerId={activeId} />
          </div>
          <Altar playerId={activeId} />
        </div>

        {/* ── Center : main play area ── */}
        <div className="flex flex-col flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-1 border-b border-gray-800 text-xs">
            <span className="text-gray-500">Tour {gameState.turn}</span>
            <span className={`font-bold ${cycleBg[gameState.worldCycle]}`}>
              ◆ {gameState.worldCycle.toUpperCase()}
            </span>
            <span className="text-gray-400 font-semibold">{activeLabel}</span>
          </div>

          {/* Opponent hand (face down) */}
          <div className="py-2 px-4">
            <Hand playerId={opponentId} isOpponent />
          </div>

          {/* Opponent hero */}
          <div className="flex justify-center pb-2">
            <HeroPanel playerId={opponentId} />
          </div>

          {/* Opponent battlefield */}
          <div className="flex justify-center px-4 pb-1">
            <Battlefield playerId={opponentId} />
          </div>

          {/* Attack mode banner */}
          {selection.kind === 'attacking' && (
            <div className="mx-4 py-1 text-center text-sm font-bold text-red-300 bg-red-900/40 border border-red-700 rounded animate-pulse">
              ⚔ Mode Attaque — clique une unité ou le héros adverse
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 px-4 my-1">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-700 text-xs">⚔</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Active player battlefield */}
          <div className="flex justify-center px-4 pt-1">
            <Battlefield playerId={activeId} />
          </div>

          {/* Active player hero */}
          <div className="flex justify-center pt-2">
            <HeroPanel playerId={activeId} />
          </div>

          {/* Active player hand */}
          <div className="flex-1 flex items-end justify-center pb-2 px-4 gap-2">
            <Hand playerId={activeId} />
          </div>

          {/* End turn button */}
          <div className="flex justify-center pb-3">
            <button
              onClick={() => dispatch({ type: 'END_TURN', playerId: activeId })}
              className="px-10 py-2 bg-green-700 hover:bg-green-600 text-white font-black text-base rounded-full shadow-lg shadow-green-700/30 transition-all hover:scale-105"
            >
              Fin de tour ➜
            </button>
          </div>
        </div>

        {/* ── Right column : Game log ── */}
        <div className="w-52 border-l border-gray-800 p-3 flex flex-col">
          <GameLog />
        </div>
      </div>
    </DndContext>
  );
}
