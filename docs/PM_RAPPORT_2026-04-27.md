# Rapport PM — 2026-04-27

**Agent :** Claude PM (`docs/CROSS_REVIEW_CONVENTIONS.md` §5)
**Sprint clôturé :** Sprint 01 (M1 Engine Core)
**Sprint ouvert :** Sprint 02 (M2 clôture + M3 démarrage)

---

## 1. Synthèse milestones

| Milestone | Issues ouvertes | Issues closes | PR mergées | Coverage | Statut |
|---|---|---|---|---|---|
| M1 — Engine Core | 0 | 7 (#4–#10) | 6 (PRs #1,#3,#7-#10,#15) | stmts 83 % / branches 68 % | 🟢 COMPLÈTE |
| M2 — UI minimale | 1 (#26) | 9 (#17–#25) | PRs #1, #2 (pre-tracking) | — | 🟡 DERNIER BUG |
| M3 — Polish + 20 cartes | 4 (#28–#31) | 0 | — | — | 🔴 NON DÉMARRÉ |

---

## 2. Trous identifiés

### M1 — Engine Core
**Livré** :
- Moteur complet : 9 actions, 6 sous-systèmes, CLI, 66 tests, 83% statements coverage
- Tous les types du brief §8 implémentés en strict TypeScript

**Manquant/incomplet** :
- [bug] `processDeaths` ne déclenche pas les effets `on_death` → deathrattle de Z09 non fonctionnel
- [bug] `grant_divine_shield_hero` est un no-op dans `reducers.ts` → Z06 ne protège pas le héros
- [note] Ces deux bugs ont été découverts lors de l'audit M3 ; ils n'ont pas empêché M1 d'être acceptée car aucun test ne couvrait ces cas précis

### M2 — UI minimale
**Livré** (via PRs #1/#2/#3 mergées 2026-04-26, avant création formelle des tickets) :
- Zustand store connecté à `applyAction` (`src/store/gameStore.ts`)
- Tous les composants : Board, Card, Hand, Altar, RitualZone, HeroPanel, GameLog, MulliganModal
- Drag & drop dnd-kit pour invoquer les unités
- Click-to-target pour attaques et sorts
- Bouton fin de tour + transition hot-seat
- Écran de victoire, FactionSelect

**Manquant/incomplet** :
- [bug] Sangoma Guérisseuse (Z05) — `scope: 'random_enemy'` au lieu de `random_ally` dans `cards.json`, et la logique `heal` dans `resolveEffect` ne cible pas les unités alliées → issue #26 ouverte

### M3 — Polish + 20 cartes
**Livré** : rien (sprint non démarré)

**Manquant** (4 issues créées) :
- [fix/engine] Deathrattle `on_death` + `heroDivineShield` — issue #28
- [feat/ux] Animations Framer Motion — issue #29
- [docs] README — issue #30
- [feat/ux+chore] Polish FactionSelect + déploiement Vercel — issue #31

---

## 3. Issues créées dans ce passage

| # | Titre | Milestone | Size | Assignation prévue |
|---|---|---|---|---|
| #28 | Effets moteur manquants : deathrattle on_death + grant_divine_shield_hero | M3 | M | Claude |
| #29 | Animations Framer Motion — apparition, mort, dégâts | M3 | M | Cursor |
| #30 | README — install, run, play | M3 | S | Claude ou Cursor |
| #31 | Polish écran d'accueil + déploiement Vercel | M3 | S | Cursor |

Issues closes dans ce passage : #17, #18, #19, #20, #21, #22, #23, #24, #25 (code déjà livré).

PR ouverte : [#32 — docs(pm): sprint 02 planning](https://github.com/yans40/sankofa-poc/pull/32)

---

## 4. Questions ouvertes au PO

| Question | Statut | Impact |
|---|---|---|
| Q-004 — Plateforme de déploiement (Vercel vs Netlify) | 🔴 OUVERTE | Bloque #31 — par défaut Vercel si pas de réponse avant fin Sprint 02 |
| Q-005 — Visibilité du repo (public vs privé) | 🔴 OUVERTE | Bloque tout déploiement public |

---

## 5. Recommandations

1. **Démarrer #26 immédiatement** (Sangoma fix) — c'est le seul ticket qui bloque la clôture de M2. Simple correction dans `cards.json` + extension de `resolveEffect` pour le scope `random_ally` sur les unités.

2. **#28 en parallèle de #29** — les deux sont indépendants. Claude prend le moteur, Cursor prend les animations.

3. **Trancher Q-004 et Q-005 avant fin Sprint 02** — sans URL publique, la démo de pitch est impossible. Recommandation : Vercel, repo privé avec preview link partageable.

4. **Audit des 20 cartes en M3** — au-delà des bugs identifiés (#26, #28), faire un passage complet sur `cards.json` pour s'assurer que tous les effets sont correctement sérialisés avant les animations.

---

*Rapport généré par l'agent PM Claude — 2026-04-27.*
