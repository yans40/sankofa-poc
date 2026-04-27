# Sprint 02 — M2 Clôture + M3 Démarrage (du 2026-04-27 au 2026-05-11)

## Objectif

Clore définitivement M2 (corriger le dernier bug bloquant) et démarrer M3 avec les quatre tâches qui permettront d'avoir un POC présentable en pitch : effets moteur complets, animations, README et déploiement.

---

## Bilan Sprint 01

| Statut | Détail |
|---|---|
| ✅ M1 Engine Core | 7 issues closes, 66 tests, 83% coverage, CLI fonctionnel |
| ✅ M2 UI minimale | Code livré via PRs #1/#2/#3 avant création formelle des tickets — 9 issues closes (#17-#25), 1 bug restant (#26) |
| ⏳ M3 non démarré | 4 nouvelles issues créées dans ce sprint |

---

## Capacité

- **Claude (Dev + QA)** : 2 tickets visés (#26 bug moteur, #28 effets moteur)
- **Cursor (Dev + QA)** : 2 tickets visés (#29 animations, #31 polish + déploiement)
- **Claude ou Cursor** : 1 ticket partageable (#30 README)

---

## Tickets

| # | Titre | Auteur prévu | Size | Milestone | Statut | PR |
|---|---|---|---|---|---|---|
| #26 | Fix Sangoma Guérisseuse — cible on_turn_end + heal unit | Claude | S | M2 | open | — |
| #28 | Effets moteur manquants : deathrattle on_death + grant_divine_shield_hero | Claude | M | M3 | open | — |
| #29 | Animations Framer Motion — apparition, mort, dégâts | Cursor | M | M3 | open | — |
| #30 | README — install, run, play | Claude ou Cursor | S | M3 | open | — |
| #31 | Polish écran d'accueil + déploiement Vercel | Cursor | S | M3 | open | — |

**Ordre de traitement recommandé :**

```
#26 (M2 bug fix)  →  #28 (moteur)  →  #29 (UI animations, en parallèle de #30)  →  #30 (README)  →  #31 (deploy)
```

#26 est bloquant pour déclarer M2 complète. #28 peut démarrer dès #26 mergé (réutilise le pattern `random_ally`). #29, #30, #31 peuvent démarrer indépendamment.

---

## Trous identifiés par rapport au brief

### M2 — seul trou restant

**Bug Sangoma Guérisseuse (Z05)** — issue #26 :
1. `cards.json` : `scope: 'random_enemy'` → devrait être `random_ally`
2. `reducers.ts` `resolveEffect / heal` : ne gère que le héros — doit gérer une unité `random_ally`

### M3 — trous à traiter dans ce sprint

**Deathrattle non déclenché** — issue #28 :
- `processDeaths` (`combat.ts`) ne déclenche pas les effets `on_death`
- Z09 Champion Mzilikazi : token Lancier Zoulou jamais invoqué à la mort

**`grant_divine_shield_hero` no-op** — issue #28 :
- `resolveEffect` applique `heroAttack: p.heroAttack` (aucun changement)
- `PlayerState` n'a pas de champ `heroDivineShield`
- Z06 Bouclier Isihlangu ne protège pas le héros

**Animations manquantes** — issue #29 :
- Apparition/mort/dégâts instantanés — Framer Motion non intégré

**README absent** — issue #30 :
- Critère §15 bloquant pour démo et pitch

**Démo non hébergée** — issue #31 :
- URL publique requise pour pitch + KR5 (< 3s chargement)

---

## Questions ouvertes au PO

| Question | Statut | Action requise |
|---|---|---|
| Q-004 — URL déploiement | 🔴 OUVERTE | Décision avant fin Sprint 02 pour pouvoir merge #31 |
| Q-005 — Visibilité repo | 🔴 OUVERTE | Décision avant déploiement public |

---

## Non-objectifs du Sprint 02

- Cartes M3 non listées dans ce sprint (deck builder, nouvelles factions)
- Optimisations de performance avancées
- Tests end-to-end (hors périmètre POC)
- Internationalisation

---

## Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Z06 Bouclier Isihlangu = type Artefact (brief §4.2 hors scope, mais §10 l'inclut dans les 20 cartes) | Moyen | Traité dans #28 comme `spell` qui donne `heroDivineShield` — conforme à l'esprit du brief |
| Animations Framer Motion + `AnimatePresence` peuvent créer des glitches sur le state Zustand | Moyen | Cursor devra valider en partie complète avant QA |
| Q-004 non résolue bloque #31 | Faible | Default = Vercel si pas de réponse PO avant fin sprint |

---

## Définition of Done — Sprint 02

- [ ] #26 mergé sur `develop` (Sangoma fix + tests)
- [ ] #28 mergé sur `develop` (deathrattle + heroDivineShield + tests)
- [ ] #29 mergé sur `develop` (animations Framer Motion fonctionnelles)
- [ ] #30 mergé sur `develop` (README complet)
- [ ] #31 mergé sur `develop` (deploy live ou PR ready si Q-004 encore ouverte)
- [ ] Coverage statements ≥ 70 % sur `develop` après #26 + #28
- [ ] Aucun verdict `qa-escalate` en suspens
- [ ] `docs/CROSS_REVIEW_DASHBOARD.md` à jour (workflow automatique)
- [ ] M2 fermée sur GitHub (milestone) dès #26 mergé
- [ ] `docs/PM_RAPPORT_2026-04-27.md` publié (ce sprint)

---

*Document généré par l'agent PM Claude — 2026-04-27.*
