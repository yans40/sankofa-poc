# Sprint 01 — M1 Engine Core

## Objectif

Construire le moteur de règles de Sankofa: Rites of War en pure TypeScript, sans interface graphique. Le moteur doit couvrir les 9 actions joueur, les mécaniques signature (Autel des Ancêtres, Rituels, Griot, Cycle du Monde) et les 8 mots-clés du POC. Il doit être entièrement testé et jouable via une interface CLI.

## Critère d'acceptation global

Une partie complète peut être jouée via `npm run play-cli` en tapant des commandes texte. Tous les tests unitaires passent (`npm test`). La couverture de code sur `src/engine/` est >= 70% (`npm run coverage`).

---

## Issues du sprint (ordre de traitement)

| # | Titre | Labels | Taille | Dépend de | Statut |
|---|---|---|---|---|---|
| #4 | Setup projet : Vite, Vitest, ESLint, Prettier, Tailwind | chore, M1 | S | — | backlog |
| #5 | Types TypeScript : src/engine/types.ts | engine, M1 | S | #4 | backlog |
| #6 | Implémenter initialGameState() dans src/engine/gameState.ts | engine, M1 | S | #5 | backlog |
| #7 | Implémenter applyAction() et les 9 reducers dans src/engine/actions.ts + reducers.ts | engine, M1 | L | #6 | backlog |
| #8 | Implémenter les sous-systèmes du moteur : combat, ancestors, rituals, keywords, griot, cycle | engine, M1 | L | #7 | backlog |
| #9 | Tests unitaires Vitest pour le moteur (coverage >= 70%) | test, M1 | M | #8 | backlog |
| #10 | CLI rudimentaire : npm run play-cli | feat, M1 | S | #9 | backlog |

---

## Détail des livrables attendus par issue

### #4 — Setup projet
Repo Vite + react-ts, Vitest, ESLint, Prettier, Tailwind CSS 3. Structure de dossiers `src/engine/`, `src/data/`, `src/store/`, `src/components/` créée. `npm run build`, `npm test`, `npm run lint` tous passants.

### #5 — Types TypeScript
Fichier `src/engine/types.ts` complet avec toutes les interfaces et types du brief §8 : `Card`, `CardEffect`, `EffectResolver`, `TargetSelector`, `UnitInstance`, `RitualInstance`, `PlayerState`, `GameState`, `GameLogEntry`, et l'union `GameAction` (9 variantes). TypeScript strict mode, zéro `any`.

### #6 — initialGameState()
Fonction `initialGameState(p1Faction, p2Faction): GameState` dans `src/engine/gameState.ts`. Deck 30 cartes (pool 3x) mélangé, main initiale de 3 cartes, phase mulligan, tour 1, activePlayer p1, cycle Dawn.

### #7 — applyAction() + 9 reducers
Fonction `applyAction(state, action): GameState` pure et immutable dans `src/engine/actions.ts` + `src/engine/reducers.ts`. Couvre : `MULLIGAN`, `PLAY_UNIT`, `PLAY_RITUAL`, `MAKE_OFFERING`, `INVOKE_ANCESTOR`, `ATTACK`, `USE_HERO_POWER`, `END_TURN`, `CONCEDE`.

### #8 — Sous-systèmes moteur
Six fichiers dans `src/engine/` :
- `combat.ts` : dégâts simultanés, Bouclier Divin, mort vers Autel
- `ancestors.ts` : Autel FIFO max 6, anti-boucle (reincarnationCount >= 2 = Exil), réinvocation Spectrale
- `rituals.ts` : charges, offrandes, résolution automatique au tour suivant, Exil après résolution
- `keywords.ts` : Charge, Provocation, Bouclier Divin, Cri de Guerre, Râle, Appel d'Ancêtre, Régénération, Spectral
- `griot.ts` : passif Shango (Voie de l'Équilibre), passif Shaka (Impi)
- `cycle.ts` : Dawn (tours 1-3), Day (tours 4-6), Night (tours 7+)

### #9 — Tests unitaires Vitest
Suite complète dans `src/engine/__tests__/`. Cas couverts : les 9 actions, mort → Autel, FIFO, réinvocation Spectrale, anti-boucle, Rituel complet, combat + Bouclier Divin, Cycle du Monde, fatigue, victoire. Coverage >= 70%.

### #10 — CLI rudimentaire
Script `scripts/cli.ts` avec commandes : `play <index>`, `attack <attaquant> <cible>`, `end`, `concede`. Affiche l'état de jeu textuel à chaque tour. Intègre le mulligan en console. `npm run play-cli` lance une partie complète.

---

## Calendrier cible

| Semaine | Focus |
|---|---|
| S1 (jours 1-3) | #4 Setup + #5 Types + #6 initialGameState |
| S1 (jours 4-7) | #7 applyAction + 9 reducers |
| S2 (jours 1-4) | #8 Sous-systèmes moteur |
| S2 (jours 5-7) | #9 Tests unitaires + #10 CLI |

---

## Definition of Done — M1

- [ ] Tout le code des 7 issues est committé sur une branche `feature/claude/<slug>` et mergé dans `develop`
- [ ] `npm test` passe (tous les tests verts)
- [ ] `npm run coverage` affiche >= 70% sur `src/engine/`
- [ ] `npm run lint` passe sans erreur
- [ ] `npm run build` produit un bundle sans erreur
- [ ] `npm run play-cli` permet de jouer une partie complète en console
- [ ] Milestone M1 fermée sur GitHub

---

## Notes

- Les sous-systèmes (#8) peuvent être développés en parallèle des reducers (#7) si les types (#5) sont stables.
- La tâche #7 (applyAction) est la plus risquée : prévoir une revue intermédiaire après les 4-5 premiers reducers.
- Le CLI (#10) est volontairement minimal — pas de TUI avancée, seulement stdin/stdout.
- Toute idée nouvelle hors périmètre du brief §4.1 → backlog v0.2, ne pas ouvrir de ticket M1.
- Questions ouvertes du brief §14 non bloquantes pour M1 (elles concernent l'UI, traitées en M2).
