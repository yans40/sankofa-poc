# Sankofa: Rites of War — POC Brief

> **Document type :** Product Brief — POC technique
> **Auteur :** Product Owner (Yans)
> **Destinataire :** Claude Code (lead engineer)
> **Version :** 1.0
> **Date cible début :** À définir
> **Durée estimée :** 4 à 6 semaines (1 dev temps plein équivalent)
> **Référence métier :** `Sankofa_Rulebook_v0.1.docx` (joint au repository)

---

## 1. TL;DR

Construire un **prototype jouable navigateur** d'un jeu de cartes stratégique inspiré de Hearthstone, mécaniquement original (Autel des Ancêtres, Rituels multi-tours), sur thématique culturelle africaine.

**Livrable final attendu :** une application web React + TypeScript permettant à deux joueurs de jouer une partie complète en mode hot-seat (sur la même machine), avec 20 cartes implémentées (10 Orishas + 10 Zoulou), sur un seul navigateur Chrome desktop.

**Pas de backend, pas de multijoueur en ligne, pas d'authentification** dans cette phase.

---

## 2. Contexte produit

Sankofa: Rites of War est un projet de CCG (Collectible Card Game) en construction. Le rulebook v0.1 est déjà rédigé et figé pour la durée du POC. La direction artistique est définie (cf. illustrations de référence dans `/assets/references/`).

Le POC sert **trois objectifs métier** :

1. **Valider la jouabilité** des trois mécaniques signature (Autel, Rituels, Griot) en conditions réelles de partie.
2. **Servir de support de pitch** pour des co-fondateurs, illustrateurs et investisseurs early-stage.
3. **Établir l'architecture technique** réutilisable pour la suite (alpha online, mobile).

Le POC **n'est pas** un produit livrable utilisateur final. Il sera utilisé en interne et lors de présentations restreintes.

---

## 3. Objectifs (OKRs)

### Objectif principal
> *Démontrer en partie réelle que les mécaniques de Sankofa créent un gameplay distinct et engageant.*

### Key Results mesurables

| KR | Métrique | Cible |
|---|---|---|
| KR1 | Une partie complète peut être jouée du début à la fin sans bug bloquant | 100% |
| KR2 | Durée moyenne d'une partie (sur 10 tests internes) | Entre 8 et 14 minutes |
| KR3 | Les 3 mécaniques signature (Autel, Rituels, Griot) sont déclenchées au moins une fois par partie en moyenne | ≥ 1 |
| KR4 | Couverture de tests unitaires sur le moteur de règles | ≥ 70 % |
| KR5 | Temps de chargement initial de l'app | < 3 secondes |
| KR6 | Performance : 60 fps sur Chrome desktop (M1 ou équivalent) | 100% du temps de jeu |

---

## 4. Périmètre

### 4.1 In Scope (MUST HAVE)

#### Gameplay
- ✅ Mode 2 joueurs en hot-seat sur la même machine (un seul navigateur)
- ✅ Sélection de faction au lancement de partie (Orishas / Zoulou)
- ✅ Mulligan en début de partie (1 fois par joueur)
- ✅ Tour par tour respectant les 3 phases (Aurore / Principale / Crépuscule)
- ✅ Énergie spirituelle croissante de 1 à 10
- ✅ Système d'invocation depuis la main avec coût d'énergie
- ✅ Combat unité-vs-unité et unité-vs-héros (résolution simultanée des dégâts)
- ✅ Fin de partie quand un héros atteint 0 PV
- ✅ Mécanique d'**Autel** complète (max 6 cartes, FIFO vers l'Exil, statut Spectral à la réinvocation, anti-boucle 2x)
- ✅ Mécanique de **Rituel** complète (face visible, charges, offrandes, perturbation, résolution au tour suivant)
- ✅ **Griot passif** factionnel (1 par héros)
- ✅ **Cycle du Monde** simple (Aube/Jour/Nuit selon le tour)
- ✅ Mots-clés implémentés : `Charge`, `Provocation`, `Bouclier Divin`, `Cri de Guerre`, `Râle`, `Appel d'Ancêtre`, `Régénération`, `Spectral`

#### UI/UX
- ✅ Plateau de jeu lisible : main du joueur actif visible, main adverse cachée (face cachée)
- ✅ Visualisation de l'Autel des deux joueurs en permanence sur les côtés
- ✅ Visualisation de la Zone de Rituels en cours
- ✅ Indicateur du Cycle du Monde et du tour actuel
- ✅ Drag & drop des cartes depuis la main vers le plateau
- ✅ Click-to-target pour les attaques et les sorts
- ✅ Animations basiques (apparition, mort, dégâts) — pas besoin d'effets sophistiqués
- ✅ Historique d'actions (game log) défilant à droite
- ✅ Bouton "Fin de tour"
- ✅ Écran de victoire/défaite

#### Données
- ✅ 20 cartes implémentées : 10 Orishas + 10 Zoulou (liste complète en §10)
- ✅ 2 héros : Shango (Orishas) et Shaka (Zoulou)
- ✅ Cartes définies en JSON, chargées au runtime
- ✅ Illustrations placeholder (utiliser des images statiques 400x500px stockées localement, ou générer via SVG simple)

### 4.2 Out of Scope (NE PAS DÉVELOPPER dans ce POC)

- ❌ Multijoueur en ligne, networking, lobby
- ❌ Authentification, comptes utilisateurs, profils
- ❌ Backend, base de données, persistance
- ❌ Deck builder (le deck est généré aléatoirement à partir de la pool de 10 cartes par faction au début)
- ❌ Monétisation, packs de cartes, économie
- ❌ Mode solo, IA, campagne narrative
- ❌ Mode arène, tournois, classement
- ❌ Animations 3D, effets de particules avancés
- ❌ Audio (musique, sons d'effet) — peut être ajouté en bonus si temps disponible
- ❌ Mobile / responsive design tactile (focus desktop Chrome uniquement)
- ❌ Internationalisation (FR uniquement pour ce POC)
- ❌ Mots-clés non listés en §4.1 (Frénésie, Furtivité, Élan, Pulsation, Perturbation, etc. — réservés à v0.2)
- ❌ Artefacts et Lieux comme types de cartes (réservés à v0.2)
- ❌ Cartes neutres (le deck est mono-faction strict pour le POC)

---

## 5. User Stories prioritaires

### Joueur 1 (premier tour)

> **En tant que** Joueur 1, **je veux** voir mes 3 cartes initiales, **afin de** décider lesquelles garder au mulligan.

**Critères d'acceptation :**
- Les 3 cartes sont visibles avec leur nom, coût, attaque, vie, effet
- Un bouton "Garder ces cartes" et un bouton "Remplacer ces cartes" sont accessibles
- Je peux cliquer sur n'importe quel sous-ensemble de cartes pour les remplacer

### Joueur en tour de jeu

> **En tant que** joueur en tour de jeu, **je veux** glisser une carte unité de ma main vers le plateau, **afin de** l'invoquer en payant son coût.

**Critères d'acceptation :**
- L'action consomme l'énergie correspondante (vérifiée avant invocation)
- Si l'énergie est insuffisante, la carte est rejetée avec un message visuel
- L'unité apparaît sur le plateau à un slot libre, marquée "Juste invoquée"
- Si elle a `Charge`, elle peut attaquer immédiatement ; sinon non

### Combat

> **En tant que** joueur en tour de jeu, **je veux** cliquer sur une de mes unités puis sur une cible adverse, **afin de** résoudre une attaque.

**Critères d'acceptation :**
- Les dégâts s'échangent simultanément
- Une unité à 0 PV est immédiatement détruite et placée dans l'Autel
- Une unité avec `Bouclier Divin` ignore le premier dégât
- Une unité ne peut attaquer qu'une fois par tour

### Réinvocation depuis l'Autel

> **En tant que** joueur en tour de jeu, **je veux** sélectionner un Ancêtre dans mon Autel et l'invoquer, **afin de** le ramener avec le statut Spectral.

**Critères d'acceptation :**
- Le coût payé est `coût_original - 1` (minimum 1)
- L'unité revient avec `+1/+1` et le statut Spectral
- L'effet `Cri de Guerre` ne se déclenche PAS
- L'effet `Appel d'Ancêtre` se déclenche s'il existe
- À la fin du tour suivant, l'Ancêtre est exilé automatiquement

### Lancement de Rituel

> **En tant que** joueur, **je veux** lancer un Rituel et y faire une offrande chaque tour, **afin de** voir l'effet se déclencher au tour de résolution.

**Critères d'acceptation :**
- Le Rituel s'affiche dans la Zone de Rituels avec ses charges visibles
- Je peux cliquer sur le Rituel pour faire une offrande (énergie / carte / unité)
- Quand les charges atteignent 0, le Rituel est marqué "Prêt"
- Au début de mon tour suivant, l'effet se résout automatiquement
- Le Rituel résolu disparaît en Exil

---

## 6. Stack technique recommandée

| Couche | Choix | Justification |
|---|---|---|
| Langage | **TypeScript 5.x (strict mode)** | Type safety critique pour un moteur de règles complexe |
| Framework UI | **React 18** | Standard, écosystème mature, hot-reload rapide |
| Bundler | **Vite 5** | Démarrage instantané, HMR ultra rapide |
| State management | **Zustand** | Simple, type-safe, pas de boilerplate Redux |
| Styling | **Tailwind CSS 3** | Vélocité maximale pour un POC, théming via tokens |
| Animation | **Framer Motion** (light usage) | Pour les transitions de cartes, mort d'unité |
| Drag & Drop | **dnd-kit** | Plus moderne et accessible que react-dnd |
| Tests unitaires | **Vitest** | Compatible Vite natif, syntaxe Jest |
| Linter | **ESLint + Prettier** | Standard |
| Versioning | **Git, conventions Conventional Commits** | Lisibilité de l'historique |

**Ne pas utiliser** : Redux Saga, GraphQL, Server-Side Rendering, Next.js, Web Components, Phaser/Pixi (overkill pour POC).

---

## 7. Architecture technique

### 7.1 Structure de dossier proposée

```
sankofa-poc/
├─ public/
│  └─ assets/
│     ├─ cards/             # PNG/SVG par carte (20 fichiers)
│     ├─ heroes/            # 2 portraits de héros
│     └─ ui/                # textures de plateau, gemmes
├─ src/
│  ├─ engine/               # Moteur de règles pur (sans React)
│  │  ├─ types.ts           # Toutes les interfaces du domaine
│  │  ├─ gameState.ts       # GameState + initialGameState()
│  │  ├─ actions.ts         # Toutes les actions joueur
│  │  ├─ reducers.ts        # Pure reducer per action
│  │  ├─ keywords.ts        # Effets de chaque mot-clé
│  │  ├─ rituals.ts         # Logique de chargement/résolution
│  │  ├─ ancestors.ts       # Logique de l'Autel
│  │  ├─ griot.ts           # Passifs factionnels
│  │  ├─ combat.ts          # Résolution du combat
│  │  ├─ cycle.ts           # Cycle du Monde
│  │  └─ __tests__/         # Tests unitaires Vitest
│  ├─ data/
│  │  ├─ cards.json         # Base de cartes
│  │  └─ heroes.json        # Héros
│  ├─ store/                # Zustand
│  │  └─ gameStore.ts
│  ├─ components/           # React UI
│  │  ├─ Board/
│  │  ├─ Card/
│  │  ├─ Hand/
│  │  ├─ Altar/
│  │  ├─ RitualZone/
│  │  ├─ Hero/
│  │  ├─ GameLog/
│  │  └─ MulliganModal/
│  ├─ hooks/
│  ├─ utils/
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
└─ README.md
```

### 7.2 Principe d'architecture

**Le moteur (`src/engine/`) doit être pur, sans React, sans accès au DOM, sans I/O.**

Toute action joueur passe par une fonction signature :
```typescript
applyAction(state: GameState, action: GameAction): GameState
```

La fonction est **immutable** (Immer ou cloning manuel). Cette discipline garantit :
- Tests unitaires faciles
- Replay possible (rejouer une suite d'actions reproduit l'état)
- Détection facile de bugs (state machine déterministe)
- Réutilisable en backend ou en mobile sans réécriture

L'UI React **ne contient pas de logique de règles**. Elle dispatche des actions, lit l'état, affiche.

---

## 8. Modèle de données (TypeScript)

```typescript
// ============ CARDS ============

export type Faction = 'orisha' | 'zulu' | 'neutral';
export type CardType = 'unit' | 'ritual' | 'spell' | 'artifact' | 'location' | 'hero';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Keyword =
  | 'charge'
  | 'taunt'              // Provocation
  | 'divine_shield'      // Bouclier Divin
  | 'battlecry'          // Cri de Guerre
  | 'deathrattle'        // Râle
  | 'ancestor_call'      // Appel d'Ancêtre
  | 'regeneration'       // Régénération
  | 'spectral';

export interface CardEffect {
  trigger: 'on_play' | 'on_death' | 'on_ancestor_summon' | 'on_turn_start' | 'on_turn_end';
  description: string;            // texte FR pour affichage
  resolve: EffectResolver;        // fonction pure, voir 8.2
}

export interface Card {
  id: string;                     // ex: "orisha_001_shango"
  name: string;
  faction: Faction;
  type: CardType;
  cost: number;
  attack?: number;                // unit only
  health?: number;                // unit only
  rarity: Rarity;
  keywords: Keyword[];
  effects: CardEffect[];
  flavorText: string;
  artUrl: string;                 // chemin vers /assets/cards/...
  // Ritual-specific
  initialCharges?: number;
  // Reinvocation tracking
  reincarnationCount?: number;    // 0 par défaut
}

// ============ STATE ============

export interface UnitInstance {
  instanceId: string;             // unique par instance (uuid)
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
  ready: boolean;                 // charges atteintes 0
}

export interface PlayerState {
  id: PlayerId;
  hero: Card;
  heroHealth: number;
  heroMaxHealth: number;
  heroPowerUsedThisTurn: boolean;
  energy: number;
  maxEnergy: number;
  hand: Card[];
  deck: Card[];
  battlefield: UnitInstance[];    // max 7
  altar: Card[];                  // max 6, ordre LIFO (dernière = sommet)
  rituals: RitualInstance[];      // max 2
  exile: Card[];
  fatigueDamage: number;          // commence à 0, +1 chaque pioche échouée
  griotState: Record<string, unknown>; // état du passif factionnel
}

export type PlayerId = 'p1' | 'p2';
export type WorldCyclePhase = 'dawn' | 'day' | 'night';

export interface GameState {
  players: Record<PlayerId, PlayerState>;
  activePlayerId: PlayerId;
  turn: number;
  phase: 'mulligan' | 'aurore' | 'principal' | 'crepuscule' | 'gameover';
  worldCycle: WorldCyclePhase;
  winner: PlayerId | null;
  log: GameLogEntry[];
}

// ============ ACTIONS ============

export type GameAction =
  | { type: 'MULLIGAN'; playerId: PlayerId; cardIndices: number[] }
  | { type: 'PLAY_UNIT'; playerId: PlayerId; cardId: string; targetSlot: number }
  | { type: 'PLAY_RITUAL'; playerId: PlayerId; cardId: string }
  | { type: 'MAKE_OFFERING'; playerId: PlayerId; ritualInstanceId: string;
      offeringType: 'energy' | 'card' | 'unit'; payload: string | null }
  | { type: 'INVOKE_ANCESTOR'; playerId: PlayerId; altarIndex: number; targetSlot: number }
  | { type: 'ATTACK'; playerId: PlayerId; attackerInstanceId: string;
      targetType: 'unit' | 'hero'; targetInstanceId?: string }
  | { type: 'USE_HERO_POWER'; playerId: PlayerId; targetInstanceId?: string }
  | { type: 'END_TURN'; playerId: PlayerId }
  | { type: 'CONCEDE'; playerId: PlayerId };

export interface GameLogEntry {
  turn: number;
  phase: GameState['phase'];
  actor: PlayerId | 'system';
  message: string;
  timestamp: number;
}
```

### 8.2 Format `EffectResolver`

Plutôt que d'écrire des fonctions JS arbitraires (difficiles à sérialiser), définir un **DSL d'effets** sous forme de tags + paramètres :

```typescript
export type EffectResolver =
  | { kind: 'damage'; amount: number; target: TargetSelector }
  | { kind: 'heal'; amount: number; target: TargetSelector }
  | { kind: 'draw'; count: number; ownerOnly: true }
  | { kind: 'summon_token'; cardId: string; count: number }
  | { kind: 'buff'; attack: number; health: number; target: TargetSelector }
  | { kind: 'destroy'; target: TargetSelector }
  | { kind: 'silence'; target: TargetSelector };

export type TargetSelector =
  | { scope: 'self' }
  | { scope: 'enemy_hero' }
  | { scope: 'all_enemies' }
  | { scope: 'all_allies' }
  | { scope: 'random_enemy' }
  | { scope: 'choose_enemy' }      // demande l'input du joueur
  | { scope: 'choose_ally' };
```

Cette structure garde tous les effets **déclaratifs**, sérialisables, testables.

---

## 9. UI/UX — wireframe textuel du plateau

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Cycle: NUIT]                              Tour 9             [⚙]   │
├────────────┬───────────────────────────────────────────┬─────────────┤
│            │                                           │             │
│   AUTEL    │       MAIN ADVERSE (face cachée)          │   AUTEL     │
│     P2     │        🂠 🂠 🂠 🂠                            │     P1      │
│  [3 cartes]│                                           │  [2 cartes] │
│            │                                           │             │
│            │  [HÉROS P2 — Shaka]    PV: 22  ⚡ 0/8     │             │
│            │                                           │             │
│            │   ╔═══════════════════════════════════╗   │             │
│   RITUEL   │   ║ CHAMP DE BATAILLE P2              ║   │   RITUEL    │
│     P2     │   ║ [Unité] [Unité] [____] [____]    ║   │     P1      │
│  [vide]    │   ╚═══════════════════════════════════╝   │  [Rituel    │
│            │                                           │   2/3]      │
│            │   ╔═══════════════════════════════════╗   │             │
│            │   ║ CHAMP DE BATAILLE P1              ║   │  [LOG]      │
│            │   ║ [Unité] [Unité] [Unité] [____]   ║   │  Tour 9     │
│            │   ╚═══════════════════════════════════╝   │  P1 attaque │
│            │                                           │  P2 perd... │
│            │  [HÉROS P1 — Shango]   PV: 18  ⚡ 7/9     │             │
│            │                                           │             │
│            │       MAIN P1                              │             │
│            │      [Carte] [Carte] [Carte] [Carte]      │             │
│            │                                           │             │
├────────────┴───────────────────────────────────────────┴─────────────┤
│                          [ FIN DE TOUR ]                              │
└──────────────────────────────────────────────────────────────────────┘
```

**Points UX critiques :**

- Les Autels sont **en permanence visibles** sur les côtés (signature visuelle).
- La main adverse est **face cachée** (montrer uniquement le nombre de cartes).
- Le hover sur une carte affiche son texte complet en infobulle agrandie.
- Le drag & drop d'une carte de la main vers un slot du plateau lance l'invocation.
- Cliquer sur une unité la sélectionne (cadre doré) ; cliquer sur une cible adverse résout l'attaque.
- L'icône `Provocation` brille subtilement pour signaler les ciblages obligatoires.
- Une animation rapide (200ms) accompagne chaque mouvement, mort, dégât.

---

## 10. Cartes du POC — données complètes

### 10.1 Faction Orishas

| ID | Nom | Coût | Att/PV | Mots-clés | Effet | Rareté |
|---|---|---|---|---|---|---|
| O01 | Acolyte de Shango | 1 | 1/2 | — | — | C |
| O02 | Servante de Yemoja | 2 | 2/3 | Régénération [1] | — | C |
| O03 | Forgeron d'Ogun | 2 | 3/2 | — | Cri de Guerre : votre héros gagne +1 attaque ce tour | C |
| O04 | Éclair Mineur | 2 | — | — | Sort : inflige 3 dégâts à une cible | C |
| O05 | Tambour de Shango | 3 | 2/4 | Provocation | — | C |
| O06 | Médium des Orishas | 3 | 2/3 | — | Appel d'Ancêtre : pioche 1 carte | R |
| O07 | Rituel de Yemoja | 4 | — | (Charges 2) | Rituel : soigne votre héros de 10 PV | R |
| O08 | Esprit Tonnerre | 4 | 4/4 | Cri de Guerre | Inflige 2 dégâts à toutes les unités adverses | E |
| O09 | Yemoja, Mère des Eaux | 6 | 4/7 | Cri de Guerre | Soigne votre héros de 5 PV et tire 1 carte | E |
| O10 | Shango, Seigneur du Tonnerre | — (héros) | 30 PV | Pouvoir héroïque : 2 énergie → inflige 1 dégât | Griot : Voie de l'Équilibre — tous les 3 sorts joués, le suivant coûte 1 de moins | Légendaire |

### 10.2 Faction Zoulou

| ID | Nom | Coût | Att/PV | Mots-clés | Effet | Rareté |
|---|---|---|---|---|---|---|
| Z01 | Jeune Recrue Impi | 1 | 2/1 | — | — | C |
| Z02 | Lancier Zoulou | 2 | 2/3 | — | — | C |
| Z03 | Iklwa | 2 | — | — | Sort : inflige 2 dégâts à une unité adverse | C |
| Z04 | Vétéran de Rorke's Drift | 3 | 3/3 | Charge | — | C |
| Z05 | Sangoma Guérisseuse | 3 | 2/4 | — | À la fin de votre tour : soigne une unité alliée de 2 PV | C |
| Z06 | Bouclier Isihlangu | 3 | — | — | Artefact : votre héros gagne Bouclier Divin (consommé au prochain dégât) | R |
| Z07 | Capitaine Cetshwayo | 4 | 3/4 | — | Cri de Guerre : vos autres unités Zoulou gagnent +1/+1 | R |
| Z08 | Charge des Cornes | 4 | — | — | Sort : vos unités gagnent Charge ce tour | R |
| Z09 | Champion Légendaire Mzilikazi | 6 | 6/5 | Charge | Râle : invoque un Lancier Zoulou 2/3 | E |
| Z10 | Shaka, Roi-Lion | — (héros) | 30 PV | Pouvoir héroïque : 2 énergie → équipe une arme 2/2 (1 charge) | Griot : Impi — vos unités gagnent +1 attaque tant que vous contrôlez 2+ unités Zoulou | Légendaire |

### 10.3 Construction des decks

Chaque joueur joue avec un deck généré aléatoirement à partir de sa pool de 9 cartes (hors héros) :
- Total **30 cartes** : 3 exemplaires de chaque carte non-Légendaire (3 × 9 = 27) + 3 exemplaires d'une carte rare au choix (à random)
- Le héros est figé selon la faction choisie

Pour le POC, **n'inclus pas de deck builder** : le deck est simplement la pool 3x.

---

## 11. Plan de livraison en 3 milestones

### Milestone 1 — Engine Core (semaine 1-2)

**Livrable :** moteur de règles testé en pure TypeScript, sans UI.

**Tâches :**
- Setup repo, Vite, TS strict, Vitest, ESLint
- Définir tous les types (§8)
- Implémenter `initialGameState`, `applyAction` pour les 9 actions
- Implémenter le combat, l'Autel, les Rituels, les Cycles
- Tests unitaires couvrant : invocation, attaque, mort vers Autel, réinvocation Spectrale, mulligan, fatigue, victoire
- CLI rudimentaire (`npm run play-cli`) qui simule une partie tour par tour en console

**Critère d'acceptation :** une partie complète peut être jouée via CLI en tapant des commandes texte. Tous les tests passent. Coverage ≥ 70%.

### Milestone 2 — UI minimale jouable (semaine 3-4)

**Livrable :** application React rudimentaire affichant l'état et permettant les actions de base.

**Tâches :**
- Composants : `Board`, `Hand`, `Card`, `HeroPanel`, `Altar`, `RitualZone`, `GameLog`, `MulliganModal`
- Intégration Zustand connectée à `applyAction`
- Drag & drop pour invoquer
- Click-to-target pour attaquer
- Bouton fin de tour
- Écran de victoire
- Styling Tailwind minimal mais lisible

**Critère d'acceptation :** une partie peut être jouée intégralement à la souris, sans recourir à la console. Aucun bug bloquant en 5 parties consécutives de test interne.

### Milestone 3 — Polish + Cartes complètes (semaine 5-6)

**Livrable :** version POC présentable, 20 cartes opérationnelles, animations basiques.

**Tâches :**
- Implémenter les 20 cartes avec leurs effets via le DSL
- Animations Framer Motion : apparition, mort, dégâts
- Indicateur de Cycle du Monde animé
- Game log pretty-printed
- Écran d'accueil et sélection de faction
- README détaillé : install, run, play
- Démo vidéo de 60 secondes (capture d'une partie)

**Critère d'acceptation :** la cible des KRs (cf. §3) est atteinte. Le projet peut être démontré en pitch.

---

## 12. Test plan

### 12.1 Tests unitaires (obligatoire)

Couvrir au minimum :
- `applyAction` pour chacune des 9 actions
- Mort d'unité → Autel (et FIFO en cas de dépassement)
- Réinvocation Ancêtre : coût réduit, +1/+1, Spectral, Cri de Guerre désactivé
- Anti-boucle : 3ème entrée à l'Autel = exil
- Rituel : charge, offrande des 3 types, résolution, perturbation
- Combat : dégâts simultanés, Bouclier Divin
- Cycle du Monde : transitions, effets globaux
- Fatigue : croissance des dégâts
- Victoire : héros à 0 PV

### 12.2 Tests manuels (checklist pré-démo)

Cf. Annexe C du Rulebook (checklist de playtest). À exécuter avant chaque session de démonstration.

---

## 13. Risques techniques & mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Effets de cartes complexes difficiles à exprimer dans le DSL | Moyenne | Élevé | Limiter le POC aux cartes simples ; documenter le DSL ; conserver une "escape hatch" `kind: 'custom'` qui appelle une fonction nommée |
| Bug de timing entre Cri de Guerre et état du plateau | Élevée | Moyen | Tests unitaires exhaustifs ; ordre de résolution figé : (1) appliquer changement de zone, (2) déclencher effets, (3) state-based actions |
| UI drag & drop bugué sur certaines tailles d'écran | Moyenne | Faible | Fixer la résolution cible : 1920×1080 ; afficher une alerte si plus petit |
| Périmètre qui dérive vers des fonctionnalités non prévues | Élevée | Élevé | Strictement refuser tout ce qui n'est pas en §4.1 ; toute idée nouvelle → backlog v0.2 |
| Mauvaise maintenabilité après le POC | Moyenne | Moyen | Discipline architecturale §7.2 ; revue de code obligatoire ; pas de "vite et sale" qui ne soit pas commenté `// TODO POC` |

---

## 14. Questions ouvertes (à trancher avant kickoff)

1. **Hot-seat strict ou interface "passe ton tour" sécurisée ?** L'adversaire ne doit-il jamais voir ma main, même au moment du passage de tour ? → Ma reco : afficher un écran "Joueur 2 — clique pour révéler ta main" entre chaque transition.

2. **Pour les illustrations placeholders, on génère via IA, on utilise du libre de droits, ou on dessine en SVG simple ?** → Ma reco : SVG simples aux couleurs de chaque carte avec le nom centré. Évite les questions de droits, accélère le dev.

3. **Gestion de la résolution des Rituels au début de tour : automatique ou requiert un click ?** → Ma reco : automatique avec animation de 1 seconde, joueur ne peut pas l'éviter.

4. **Quelle URL de déploiement pour la démo ?** Vercel/Netlify gratuit suffit pour ce POC.

5. **Le repo est public ou privé ?** Je recommande **privé** jusqu'à pitch officiel.

---

## 15. Critères globaux d'acceptation du POC

Le POC sera considéré comme **livré et accepté** si toutes les conditions suivantes sont réunies :

- ☐ Les 6 KRs de §3 sont atteints
- ☐ Le code est sur un repo Git, branche `main` stable
- ☐ Un `README.md` documente : prérequis, install, lancement, comment jouer
- ☐ Tests unitaires passants en CI (GitHub Actions ou équivalent local)
- ☐ Démo vidéo de 60 secondes hébergée (Loom, YouTube non listé, ou MP4 dans le repo)
- ☐ Une partie complète jouée en interne sans bug bloquant (validée par le PO)
- ☐ Le POC se lance en `npm install && npm run dev` en moins de 30 secondes sur une machine standard

---

## 16. Annexes

### Annexe A — Référence Rulebook

Le rulebook officiel `Sankofa_Rulebook_v0.1.docx` est la **source de vérité** pour toute règle non explicitement contredite par ce brief. En cas de conflit, le brief prévaut pour le POC ; le rulebook prévaut pour la suite.

Sections du rulebook utiles :
- §6 Structure du tour
- §9 Système de Rituels
- §10 Système d'Ancêtres
- §11 Cycle du Monde
- §12 Combat
- §13 Mots-clés
- §14 Règles avancées
- §17 Formule de Power Level

### Annexe B — Conventions de code

- TypeScript strict mode activé
- Pas d'`any`, sauf `unknown` justifié et casté immédiatement
- Pas de mutation directe dans le moteur ; cloning ou Immer
- Nommage : composants en PascalCase, fonctions camelCase, types/interfaces PascalCase, constantes UPPER_SNAKE_CASE
- Fichiers : un composant par fichier, nommé identiquement
- Commits : Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`)
- Pas de `console.log` dans le code committé (sauf dans le mode CLI explicite)

### Annexe C — Définition de "Done" pour une carte

Une carte est considérée comme implémentée si :
- Elle apparaît dans `cards.json` avec tous les champs de l'interface `Card`
- Ses effets sont implémentés via le DSL ou marqués `// TODO`
- Elle a un test unitaire spécifique (au moins 1 cas par effet)
- Son texte de règles affiché en UI correspond exactement au texte du tableau §10
- Elle a une illustration (placeholder SVG ou image)

---

## M4 — Voyage de Sankofa (addendum post-POC)

> **Statut :** Cadré par le PM — en attente d'arbitrage PO sur Q-006 à Q-009.
> **Objectif :** Prouver que le POC est rejouable. IA adversaire + mode run-based 3 combats.
> **Philosophie :** Profondeur avant largeur. Pas de nouvelle faction, pas de PvP. Le minimum viable pour répondre à la question : *« j'ai envie d'en relancer une ? »*

### M4.1 — IA adversaire heuristique

- À chaque tour, l'IA évalue chaque coup possible par un score simple = **(dégâts potentiels infligés) + (valeur statline des unités jouées) − (mana inutilisé si non optimal)**. Joue le coup au meilleur score, recalcule, s'arrête quand aucun coup n'a un score > 0.
- Pas de prédiction sur les tours suivants. Pas de bluff. Pas d'apprentissage.
- **Seuils de validation** : l'IA doit battre un joueur qui joue au hasard ≥ 70 % du temps ; doit perdre face à un joueur sensé ≥ 50 % du temps. Ces seuils sont la définition de « correct » — ne pas viser plus.
- Implémentation attendue dans `src/engine/ai/heuristic.ts` (engine pur, sans React/DOM).

### M4.2 — Mode Voyage (run-based)

- **Une run = 3 combats successifs** contre 3 adversaires de difficulté croissante (decks IA prédéfinis, non générés).
- **Deck de départ** : 20 cartes liées à la faction choisie au lancement.
- **Entre chaque combat** : le joueur choisit 1 carte parmi 3 propositions aléatoires à ajouter à son deck (21, puis 22 cartes).
- **PV héros** : conservés entre combats + soin partiel au début de chaque nouveau combat (montant : cf. Q-006).
- **Fin de run** : victoire si les 3 combats sont gagnés ; défaite si PV héros = 0 lors d'un combat.
- **Pas** de meta-progression entre runs, pas de récompense persistante.
- Implémentation attendue dans `src/engine/run/runState.ts`.

### M4.3 — Lore

- Avant chaque combat, un proverbe ou fragment Sankofa s'affiche (3 proverbes hardcodés pour M4).
- Le nom *Voyage de Sankofa* renvoie au sens du concept (retourner chercher ce qu'on a oublié).

### M4.4 — Hors-périmètre M4

- ❌ PvP en ligne (M6)
- ❌ Nouvelle faction (M5)
- ❌ Meta-progression / collection / packs
- ❌ Matchmaking / backend / persistance entre sessions
- ❌ Campagne narrative complète (M7)

### M4.5 — Critère d'acceptation M4

> Verdict subjectif du PO après une run complète : *« j'ai envie d'en relancer une »*. Si non, M5/M6 sont gelés et la stratégie est rouverte.

Questions ouvertes : Q-006, Q-007, Q-008, Q-009 (voir `docs/QUESTIONS.md`).

---

**Fin du brief.**

*Pour toute question pendant le développement, créer une issue GitHub taguée `question:` ou consulter directement le PO.*
