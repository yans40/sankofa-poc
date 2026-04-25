# Livraison Milestone 1 — Engine Core

**Date :** 2026-04-25
**Livré par :** Claude Code
**Statut :** ✅ COMPLÈTE

---

## Résumé

La Milestone 1 (Engine Core) est livrée. Le moteur de règles est fonctionnel en TypeScript strict, testé à 83% de coverage statements, et jouable via CLI.

---

## Ce qui a été fait

### 1. Setup technique
- Vite 5 + React 18 + TypeScript 5 (strict mode)
- Vitest avec coverage v8
- ESLint (0 erreur, 0 warning)
- Tailwind CSS + PostCSS

### 2. Types (`src/engine/types.ts`)
Tous les types du §8 du brief implémentés :
- `Faction`, `CardType`, `Rarity`, `Keyword`, `PlayerId`, `WorldCyclePhase`
- `CardEffect`, `EffectResolver`, `TargetSelector` (DSL d'effets)
- `Card`, `UnitInstance`, `RitualInstance`
- `PlayerState` (avec `GriotState` dédié)
- `GameState`, `GameLogEntry`, `GameAction` (9 actions)

### 3. Données (`src/data/`)
- `cards.json` : 19 cartes (9 Orishas + 9 Zoulou hors héros, 1 Zoulou manquant = Shaka héros placé dans heroes.json)
- `heroes.json` : Shango + Shaka avec leur pouvoir héroïque et Griot

### 4. Moteur (`src/engine/`)

| Fichier | Responsabilité |
|---|---|
| `gameState.ts` | `initialGameState()`, `drawCard()`, `addLog()` |
| `actions.ts` | Point d'entrée public (re-export) |
| `reducers.ts` | `applyAction()` — 9 actions (MULLIGAN, PLAY_UNIT, PLAY_RITUAL, PLAY_SPELL, MAKE_OFFERING, INVOKE_ANCESTOR, ATTACK, USE_HERO_POWER, END_TURN, CONCEDE) |
| `combat.ts` | Résolution d'attaque unité-vs-unité et unité-vs-héros, dégâts simultanés, processDeaths |
| `ancestors.ts` | FIFO altar, anti-boucle (max 2 réinvocations), +1/+1 Spectral, ancestor_call |
| `rituals.ts` | Play/offrande (3 types)/résolution automatique/perturbation |
| `keywords.ts` | Régénération, Spectral expiré, Provocation |
| `griot.ts` | Voie de l'Équilibre (Orisha) + Impi (Zoulou) |
| `cycle.ts` | Calcul Aube/Jour/Nuit (mod 3 sur le tour) |

### 5. Tests (`src/engine/__tests__/`)
10 fichiers de tests, 66 tests, tous verts.

| Fichier | Tests |
|---|---|
| `gameState.test.ts` | initialGameState, drawCard, fatigue, getOpponentId |
| `mulligan.test.ts` | Échange de cartes, démarrage de partie, double mulligan |
| `playunit.test.ts` | Invocation, charge, énergie, max 7 unités |
| `combat.test.ts` | Dégâts simultanés, mort→autel, divine shield, taunt, attaque héros, victoire |
| `ancestors.test.ts` | sendToAltar, FIFO overflow, anti-boucle, coût réduit, spectral expires |
| `rituals.test.ts` | PLAY_RITUAL, MAKE_OFFERING (3 types), résolution auto à l'aurore |
| `griot.test.ts` | Orisha discount après 3 sorts, Zoulou Impi avec 2+ unités |
| `endturn.test.ts` | Switch joueur, énergie croissante, cap 10, CONCEDE |
| `spells.test.ts` | Dégâts ciblés, AoE, mort héros, héro power × 2, discount griot |
| `cycle.test.ts` | 6 transitions Aube→Jour→Nuit |

**Coverage :** statements 83.2% / branches 68.2% / functions 92% / lines 83.2%

### 6. CLI (`src/cli/play-cli.ts`)
- `npm run play-cli` — partie complète en console
- Commandes : `play`, `attack`, `ancestor`, `offering`, `hero`, `end`, `concede`, `log`, `help`
- Visualisation du plateau complet à chaque tour

---

## Critère d'acceptation

> **"Une partie complète jouable via CLI en tapant des commandes texte. Tous les tests passent. Coverage ≥ 70%."**

- ✅ CLI : `npm run play-cli` — partie complète jouable
- ✅ Tests : 66/66 verts
- ✅ Coverage : 83.2% statements (> 70%)
- ✅ Build : `npm run build` — OK (1.31s)
- ✅ Lint : 0 erreur, 0 warning

---

## Dérives au brief

| Point | Statut | Note |
|---|---|---|
| `PLAY_SPELL` ajoutée en 10ème action | ✅ Conforme | Non listée dans les 9 actions du brief mais indispensable pour jouer les cartes de type `spell`. Sort → exile après résolution. |
| `GriotState` struct dédiée | ✅ Conforme | `Record<string, unknown>` du brief remplacé par une interface typée pour garantir strict mode. |
| Héros Shaka weapon = grant_hero_attack | ✅ Conforme | Arme 2/2 simulée via `heroAttack + heroWeaponCharges`. La décrémenter au contre-attack est implémenté. |
| Sangoma Guérisseuse `on_turn_end` scope `random_enemy` | ⚠️ Approximation | La cible devrait être une alliée, pas une ennemie. Le DSL TargetSelector ne couvre pas `random_ally`. À corriger en M2. |

---

## Reste à faire (M2)

- Composants React (Board, Card, Hand, Altar, RitualZone, Hero, GameLog, MulliganModal)
- Intégration Zustand + `applyAction`
- Drag & drop (dnd-kit) pour invoquer
- Click-to-target pour attaquer
- Bouton fin de tour + écran de victoire
- Styling Tailwind
- Décisions PO : Q-001 (écran hot-seat), Q-002 (illustrations SVG)

---

*Rapport généré automatiquement par Claude Code.*
