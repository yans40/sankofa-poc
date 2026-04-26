import type { Card, UnitInstance } from '../../engine/types.js';
import { CardArtSVG } from '../../utils/cardArt.js';

const KEYWORD_LABEL: Record<string, string> = {
  charge: 'Charge', taunt: 'Provocation', divine_shield: 'Bouclier Divin',
  battlecry: 'Cri de Guerre', deathrattle: 'Râle', ancestor_call: 'Appel d\'Ancêtre',
  regeneration: 'Régénération', spectral: 'Spectral',
};

interface HandCardProps {
  card: Card;
  playable: boolean;
  onClick?: () => void;
  isDragging?: boolean;
}

export function HandCard({ card, playable, onClick, isDragging }: HandCardProps) {
  const isUnit = card.type === 'unit';
  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      onClick={playable ? onClick : undefined}
      title={card.effects.map(e => e.description).join('\n') || card.name}
      className={[
        'relative flex flex-col rounded-lg border-2 select-none',
        'transition-all duration-150',
        playable
          ? isUnit
            ? 'border-yellow-400 shadow-lg shadow-yellow-400/30 cursor-grab active:cursor-grabbing hover:-translate-y-1'
            : 'border-yellow-400 shadow-lg shadow-yellow-400/30 cursor-pointer hover:-translate-y-1'
          : 'border-gray-600 opacity-50 cursor-default',
        card.faction === 'orisha' ? 'bg-amber-950' : card.faction === 'zulu' ? 'bg-green-950' : 'bg-gray-900',
      ].join(' ')}
      style={{ width: 80, minHeight: 110, opacity }}
    >
      {/* Cost gem */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-600 border border-blue-300 flex items-center justify-center text-xs font-bold text-white z-10">
        {card.cost}
      </div>

      {/* Art */}
      <div className="flex justify-center pt-2">
        <CardArtSVG card={card} width={60} height={72} />
      </div>

      {/* Name */}
      <div className="px-1 py-0.5 text-center text-white font-semibold leading-tight"
        style={{ fontSize: 9 }}>
        {card.name}
      </div>

      {/* Stats */}
      {isUnit && (
        <div className="flex justify-between px-2 pb-1">
          <span className="text-orange-400 font-bold text-xs">{card.attack}</span>
          <span className="text-green-400 font-bold text-xs">{card.health}</span>
        </div>
      )}

      {/* Keywords badge */}
      {card.keywords.length > 0 && (
        <div className="px-1 pb-1 flex flex-wrap gap-0.5">
          {card.keywords.slice(0, 2).map(kw => (
            <span key={kw} className="text-yellow-300 bg-yellow-900/60 rounded px-0.5"
              style={{ fontSize: 7 }}>{KEYWORD_LABEL[kw] ?? kw}</span>
          ))}
        </div>
      )}
    </div>
  );
}

interface BattlefieldUnitProps {
  unit: UnitInstance;
  isSelected: boolean;
  isTargetable: boolean;
  isOwn: boolean;
  onClick: () => void;
}

export function BattlefieldUnit({ unit, isSelected, isTargetable, isOwn, onClick }: BattlefieldUnitProps) {
  const canAct = isOwn && !unit.hasAttackedThisTurn && !unit.justSummoned;

  let ringClass = '';
  if (isSelected) ringClass = 'ring-2 ring-yellow-400 shadow-yellow-400/50 shadow-lg';
  else if (isTargetable) ringClass = 'ring-2 ring-red-400 shadow-red-400/50 shadow-lg animate-pulse';
  else if (canAct && isOwn) ringClass = 'ring-1 ring-green-400/60';

  return (
    <div
      onClick={onClick}
      title={`${unit.card.name}\n${unit.card.effects.map(e => e.description).join('\n')}`}
      className={[
        'relative flex flex-col items-center rounded-lg border-2 cursor-pointer select-none',
        'transition-all duration-150',
        unit.isSpectral ? 'border-purple-400 bg-purple-950/80' : unit.card.faction === 'orisha' ? 'border-amber-600 bg-amber-950' : 'border-green-600 bg-green-950',
        (unit.hasAttackedThisTurn || unit.justSummoned) && !isSelected ? 'opacity-60' : '',
        ringClass,
      ].join(' ')}
      style={{ width: 72, minHeight: 90 }}
    >
      {/* Spectral badge */}
      {unit.isSpectral && (
        <span className="absolute -top-2 right-0 text-purple-300 text-xs">✦</span>
      )}
      {/* Divine shield */}
      {unit.hasDivineShield && (
        <span className="absolute -top-2 left-0 text-yellow-200 text-xs">🛡</span>
      )}
      {/* Taunt indicator */}
      {unit.card.keywords.includes('taunt') && (
        <span className="absolute top-0 right-0 bg-orange-700 text-white rounded-bl px-0.5" style={{ fontSize: 8 }}>PROV</span>
      )}
      {/* Summoning sickness */}
      {unit.justSummoned && (
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-white text-center leading-tight" style={{ fontSize: 7 }}>
          Invoqué<br/>ce tour
        </span>
      )}

      <div className="pt-1">
        <CardArtSVG card={unit.card} width={52} height={58} />
      </div>
      <div className="text-white text-center leading-none px-0.5" style={{ fontSize: 8 }}>
        {unit.card.name.length > 10 ? unit.card.name.slice(0, 9) + '…' : unit.card.name}
      </div>
      <div className="flex w-full justify-between px-1.5 pb-1 mt-auto">
        <span className="text-orange-400 font-bold text-sm">{unit.currentAttack}</span>
        <span className="text-green-400 font-bold text-sm">{unit.currentHealth}</span>
      </div>
    </div>
  );
}

interface AltarCardProps {
  card: Card;
  clickable: boolean;
  onClick: () => void;
}

export function AltarCard({ card, clickable, onClick }: AltarCardProps) {
  return (
    <div
      onClick={clickable ? onClick : undefined}
      title={`${card.name} — Coût réinvocation: ${Math.max(1, card.cost - 1)}\n${clickable ? 'Cliquer pour réinvoquer' : ''}`}
      className={[
        'flex flex-col items-center rounded border cursor-pointer select-none transition-all',
        clickable ? 'border-purple-400 hover:border-purple-200 hover:scale-105' : 'border-gray-600 opacity-60',
        card.faction === 'orisha' ? 'bg-amber-950/80' : 'bg-green-950/80',
      ].join(' ')}
      style={{ width: 52, minHeight: 64 }}
    >
      <CardArtSVG card={card} width={44} height={52} />
      <div className="text-purple-300 text-center leading-none px-0.5 pb-0.5" style={{ fontSize: 7 }}>
        {card.name.length > 9 ? card.name.slice(0, 8) + '…' : card.name}
      </div>
      <div className="text-blue-300 font-bold" style={{ fontSize: 8 }}>
        ⚡{Math.max(1, card.cost - 1)}
      </div>
    </div>
  );
}
