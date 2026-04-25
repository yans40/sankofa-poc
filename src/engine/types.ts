// ============ ENUMS & PRIMITIVES ============

export type Faction = 'orisha' | 'zulu' | 'neutral';
export type CardType = 'unit' | 'ritual' | 'spell' | 'artifact' | 'location' | 'hero';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type PlayerId = 'p1' | 'p2';
export type WorldCyclePhase = 'dawn' | 'day' | 'night';

export type Keyword =
  | 'charge'
  | 'taunt'
  | 'divine_shield'
  | 'battlecry'
  | 'deathrattle'
  | 'ancestor_call'
  | 'regeneration'
  | 'spectral';

// ============ EFFECT DSL ============

export type TargetSelector =
  | { scope: 'self' }
  | { scope: 'enemy_hero' }
  | { scope: 'all_enemies' }
  | { scope: 'all_allies' }
  | { scope: 'random_enemy' }
  | { scope: 'choose_enemy' }
  | { scope: 'choose_ally' };

export type EffectResolver =
  | { kind: 'damage'; amount: number; target: TargetSelector }
  | { kind: 'heal'; amount: number; target: TargetSelector }
  | { kind: 'draw'; count: number; ownerOnly: true }
  | { kind: 'summon_token'; cardId: string; count: number }
  | { kind: 'buff'; attack: number; health: number; target: TargetSelector }
  | { kind: 'destroy'; target: TargetSelector }
  | { kind: 'silence'; target: TargetSelector }
  | { kind: 'grant_hero_attack'; amount: number; duration: 'this_turn' }
  | { kind: 'grant_charge_all_allies' }
  | { kind: 'grant_divine_shield_hero' }
  | { kind: 'custom'; fn: string };

export interface CardEffect {
  trigger: 'on_play' | 'on_death' | 'on_ancestor_summon' | 'on_turn_start' | 'on_turn_end';
  description: string;
  resolve: EffectResolver;
}

// ============ CARDS ============

export interface Card {
  id: string;
  name: string;
  faction: Faction;
  type: CardType;
  cost: number;
  attack?: number;
  health?: number;
  rarity: Rarity;
  keywords: Keyword[];
  effects: CardEffect[];
  flavorText: string;
  artUrl: string;
  initialCharges?: number;
  reincarnationCount?: number;
}

// ============ INSTANCES ============

export interface UnitInstance {
  instanceId: string;
  card: Card;
  currentAttack: number;
  currentHealth: number;
  maxHealth: number;
  hasAttackedThisTurn: boolean;
  justSummoned: boolean;
  isSpectral: boolean;
  spectralExpiresAtTurn: number | null;
  hasDivineShield: boolean;
  ownerId: PlayerId;
}

export interface RitualInstance {
  instanceId: string;
  card: Card;
  remainingCharges: number;
  ownerId: PlayerId;
  ready: boolean;
}

// ============ PLAYER STATE ============

export interface PlayerState {
  id: PlayerId;
  hero: Card;
  heroHealth: number;
  heroMaxHealth: number;
  heroPowerUsedThisTurn: boolean;
  heroAttack: number;
  heroWeaponCharges: number;
  energy: number;
  maxEnergy: number;
  hand: Card[];
  deck: Card[];
  battlefield: UnitInstance[];
  altar: Card[];
  rituals: RitualInstance[];
  exile: Card[];
  fatigueDamage: number;
  griotState: GriotState;
}

export interface GriotState {
  spellsPlayedThisTurn: number;
  totalSpellsPlayed: number;
  nextSpellDiscount: boolean;
  impiActive: boolean;
}

// ============ GAME STATE ============

export interface GameLogEntry {
  turn: number;
  phase: GameState['phase'];
  actor: PlayerId | 'system';
  message: string;
  timestamp: number;
}

export interface GameState {
  players: Record<PlayerId, PlayerState>;
  activePlayerId: PlayerId;
  turn: number;
  phase: 'mulligan' | 'aurore' | 'principal' | 'crepuscule' | 'gameover';
  worldCycle: WorldCyclePhase;
  winner: PlayerId | null;
  log: GameLogEntry[];
  mulliganDone: Record<PlayerId, boolean>;
}

// ============ ACTIONS ============

export type GameAction =
  | { type: 'MULLIGAN'; playerId: PlayerId; cardIndices: number[] }
  | { type: 'PLAY_UNIT'; playerId: PlayerId; cardId: string; targetSlot: number }
  | { type: 'PLAY_RITUAL'; playerId: PlayerId; cardId: string }
  | { type: 'PLAY_SPELL'; playerId: PlayerId; cardId: string; targetInstanceId?: string }
  | { type: 'MAKE_OFFERING'; playerId: PlayerId; ritualInstanceId: string; offeringType: 'energy' | 'card' | 'unit'; payload: string | null }
  | { type: 'INVOKE_ANCESTOR'; playerId: PlayerId; altarIndex: number; targetSlot: number }
  | { type: 'ATTACK'; playerId: PlayerId; attackerInstanceId: string; targetType: 'unit' | 'hero'; targetInstanceId?: string }
  | { type: 'USE_HERO_POWER'; playerId: PlayerId; targetInstanceId?: string }
  | { type: 'END_TURN'; playerId: PlayerId }
  | { type: 'CONCEDE'; playerId: PlayerId };
