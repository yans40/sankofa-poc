# Rapport PM — Cadrage M4 « Voyage de Sankofa »
**Date :** 2026-04-28
**Agent :** Claude Code (PM)

---

## 1. Synthèse du cadrage M4

Le PO a arbitré la direction post-POC : **profondeur avant largeur** — IA adversaire + mode run-based 3 combats. M4 ne vise pas à ajouter du contenu mais à prouver que le POC est *rejouable*. Si M4 fonctionne (verdict PO : « j'ai envie d'en relancer une »), on enclenche M5 ou M6. Sinon, on suspend et on recadre.

**Philosophie imposée :** IA heuristique simple qui joue *correctement* (pas minmax). Une run de 3 combats (pas un roguelike). Minimum viable pour la question.

---

## 2. Livrables créés

### Documents
| Fichier | Contenu |
|---|---|
| `docs/POC_BRIEF.md` §M4 | Addendum fonctionnel : IA, run, lore, hors-périmètre, critère d'acceptation subjectif |
| `docs/QUESTIONS.md` | Q-006 à Q-009 avec défauts proposés |
| `docs/SPRINT_03.md` | Capacité, tickets, DoD, métrique de succès |
| `.github/labels.yml` | Label `M4 — Voyage de Sankofa` |

### GitHub
| Artefact | URL |
|---|---|
| Milestone M4 | https://github.com/yans40/sankofa-poc/milestone/4 |
| PR planning | https://github.com/yans40/sankofa-poc/pull/45 |

---

## 3. Issues créées (Sprint 03)

| # | Titre | Auteur prévu | Size | Bloqué par |
|---|---|---|---|---|
| [#39](https://github.com/yans40/sankofa-poc/issues/39) | `[engine] IA adversaire heuristique value-of-board` | Claude | M | — démarrage immédiat |
| [#40](https://github.com/yans40/sankofa-poc/issues/40) | `[engine] State machine mode run (3 combats, HP persistant)` | Claude | M | — démarrage immédiat (défauts Q-006/Q-007/Q-008 appliqués) |
| [#41](https://github.com/yans40/sankofa-poc/issues/41) | `[ux] Écran sélection de carte entre combats` | Cursor | S | Dépend #40 |
| [#42](https://github.com/yans40/sankofa-poc/issues/42) | `[ux] Écran carte du voyage + victoire/défaite run` | Cursor | M | Dépend #40 + idéalement Q-009 arbitrée |
| [#43](https://github.com/yans40/sankofa-poc/issues/43) | `[ux] Lore : proverbes Sankofa avant chaque combat` | libre | S | — démarrage immédiat |
| [#44](https://github.com/yans40/sankofa-poc/issues/44) | `[docs] Addendum M4 + Sprint 03 planning` | Claude | S | — cette PR |

---

## 4. Questions ouvertes Q-006 à Q-009

| Q | Question | Défaut appliqué | Impact si non tranché |
|---|---|---|---|
| Q-006 | Soin partiel entre combats : +10 fixe ou % PV max ? | +10 fixe | Faible — défaut acceptable |
| Q-007 | Doublons dans les propositions de cartes ? | Doublons autorisés | Faible — défaut acceptable |
| Q-008 | Difficulté croissante : decks ou IA ? | Decks adverses prédéfinis | Moyen — bloque la création des 3 decks adverses |
| Q-009 | Écran défaite : stats ou retour direct ? | Écran stats + bouton Rejouer | Moyen — bloque ticket #42 |

**Recommandation** : trancher Q-008 et Q-009 en priorité pour débloquer les tickets Cursor.

---

## 5. Sprint 03 — État au lancement

**Tickets démarrables immédiatement (sans arbitrage PO) :**
- #39 — Claude (engine IA)
- #40 — Claude (engine run state, défauts Q-006/Q-007/Q-008 appliqués)
- #43 — libre (lore)
- #41 — Cursor (après merge #40)

**Tickets en attente PO :**
- #42 — attend idéalement Q-009 (défaut applicable mais UX moins claire)

---

## 6. Recommandations

1. **Arbitrer Q-008 et Q-009 dès que possible** pour libérer Cursor sur #42.
2. **Démarrer #39 en priorité** (IA engine) — c'est le coeur de M4, sans dépendance.
3. **Ne pas démarrer M5 ou M6** avant le verdict PO post-run M4.
4. Si le test à 70% de victoires IA vs random s'avère difficile à calibrer, le seuil est documenté dans le ticket #39 — le dev (Claude) peut proposer un ajustement avant de fermer.

---

*Rapport généré par l'agent PM Claude — 2026-04-28.*
