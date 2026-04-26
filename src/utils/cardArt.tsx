import type { Card } from '../engine/types.js';

const FACTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  orisha:  { bg: '#5C2D0A', border: '#FFD700', text: '#FFE580' },
  zulu:    { bg: '#1A3320', border: '#DC143C', text: '#FF6B6B' },
  neutral: { bg: '#2A2A3A', border: '#888',    text: '#CCC' },
};

const TYPE_ICON: Record<string, string> = {
  unit:    '⚔',
  spell:   '✦',
  ritual:  '◈',
  hero:    '♔',
  artifact:'◉',
  location:'⬡',
};

interface CardArtProps {
  card: Card;
  width?: number;
  height?: number;
}

export function CardArtSVG({ card, width = 120, height = 160 }: CardArtProps) {
  const col = FACTION_COLORS[card.faction] ?? FACTION_COLORS.neutral;
  const icon = TYPE_ICON[card.type] ?? '?';
  const shortName = card.name.length > 16 ? card.name.slice(0, 14) + '…' : card.name;

  return (
    <svg width={width} height={height} viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="158" rx="8" fill={col.bg} stroke={col.border} strokeWidth="2" />
      <text x="60" y="85" textAnchor="middle" fontSize="36" fill={col.border} opacity="0.4">{icon}</text>
      <text x="60" y="125" textAnchor="middle" fontSize="9.5" fill={col.text} fontFamily="sans-serif"
        style={{ wordBreak: 'break-word' }}>{shortName}</text>
    </svg>
  );
}

export function HeroArtSVG({ card, width = 80, height = 80 }: CardArtProps) {
  const col = FACTION_COLORS[card.faction] ?? FACTION_COLORS.neutral;
  return (
    <svg width={width} height={height} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={col.bg} stroke={col.border} strokeWidth="3" />
      <text x="40" y="47" textAnchor="middle" fontSize="28" fill={col.border}>♔</text>
    </svg>
  );
}
