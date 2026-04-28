# Sprint 03 — Voyage de Sankofa (du 2026-04-28 au 2026-05-12)

> **Objectif :** Prouver que le POC est rejouable — IA correcte + run de 3 combats avec deck évolutif.

---

## Capacité

| Agent | Tickets prévus | Type |
|---|---|---|
| Claude (Dev) | 2 tickets engine + 1 ticket docs | Engine pur TS + PM |
| Cursor (Dev) | 2–3 tickets UI | React + UX |

---

## Tickets

| # | Titre | Auteur prévu | Size | Statut |
|---|---|---|---|---|
| #39 | `[engine] IA adversaire heuristique value-of-board` | claude | M | open |
| #40 | `[engine] State machine mode run (3 combats, HP persistant)` | claude | M | open |
| #41 | `[ux] Écran sélection de carte entre combats (3 propositions)` | cursor | S | open |
| #42 | `[ux] Écran carte du voyage + écrans victoire/défaite run` | cursor | M | open — dépend Q-009 (défaut: Option 2) |
| #43 | `[ux] Lore : proverbes Sankofa avant chaque combat` | libre | S | open |
| #44 | `[docs] Addendum M4 + Sprint 03 planning` | claude | S | open (cette PR) |

---

## Non-objectifs du sprint

- Pas de PvP (M6)
- Pas de nouvelle faction (M5)
- Pas de meta-progression, collection, packs
- Pas de matchmaking / backend / persistance entre sessions

---

## Questions PO ouvertes (Q-006 à Q-009)

| Question | Impact | Défaut appliqué si non tranché |
|---|---|---|
| Q-006 — Soin partiel entre combats | Faible (défaut ok) | +10 PV fixe |
| Q-007 — Doublons dans les propositions | Faible (défaut ok) | Doublons autorisés |
| Q-008 — Difficulté croissante : deck ou IA ? | Moyen — bloque la création des decks adverses | Decks prédéfinis par combat |
| Q-009 — Écran défaite run | Moyen — bloque le ticket `[ux] écran victoire/défaite` | Écran stats + bouton Rejouer |

Les tickets engine démarrent **sans attendre** l'arbitrage PO car leurs défauts sont acceptables.
Le ticket `[ux] Écran carte du voyage + victoire/défaite` attend idéalement Q-009 avant d'être pris par Cursor.

---

## Définition of Done — Sprint 03

- [ ] Ticket engine IA mergé sur `develop`, tests verts, coverage ≥ 70 %
- [ ] Ticket engine run-state mergé sur `develop`, tests verts
- [ ] Ticket ux sélection de carte mergé
- [ ] Ticket ux écran voyage/victoire/défaite mergé
- [ ] Ticket ux lore mergé
- [ ] Une run complète est jouable end-to-end dans le navigateur
- [ ] L'IA bat un joueur random ≥ 70 % (test automatisé dans `__tests__/ai.test.ts`)
- [ ] Coverage statements ≥ 70 % sur `develop`
- [ ] Aucun verdict `qa-escalate` en suspens
- [ ] PO peut jouer une run et donner le verdict de rejouabilité

---

## Métrique de succès du sprint

> Verdict subjectif du PO après une run complète : **« j'ai envie d'en relancer une »**.
>
> Si non → M5/M6 gelés, stratégie rouverte avec le PO.
> Si oui → M5 (largeur panthéon) ou M6 (PvP) selon priorité PO.

---

*Document généré par l'agent PM Claude — 2026-04-28.*
