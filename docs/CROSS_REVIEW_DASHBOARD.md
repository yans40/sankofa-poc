# Cross-review Dashboard — Sankofa POC

> Généré par `scripts/generate-dashboard.mjs`. Source : GitHub API + `docs/qa-history.md`.
> Dernière mise à jour : 2026-04-28T19:05:44.722Z

---

## 1. Activité par camp (30 derniers jours)

| Camp | PR ouvertes | PR mergées | Verdicts QA posés | Tests adversariaux ajoutés |
|---|---|---|---|---|
| Claude | 0 | 10 | 12 | 2 |
| Cursor | 0 | 7 | 0 | 1 |

---

## 2. PR en cours (état temps réel)

| # | Titre | Auteur | CI | Reviewer adverse | Verdict QA | Bloqueurs |
|---|---|---|---|---|---|---|
| — | Aucune PR ouverte | — | — | — | — | — |

---

## 3. Verdicts récents (10 derniers)

| Date (UTC) | PR | Agent | Verdict |
|---|---|---|---|
| 2026-04-28T19:04:39.055Z | #48 | challenger | qa-confirmed |
| 2026-04-28T13:42:25.942Z | #47 | challenger | qa-confirmed |
| 2026-04-28T07:30:38.793Z | #45 | challenger | qa-confirmed |
| 2026-04-28T07:29:39.933Z | #45 | claude | qa-passed |
| 2026-04-27T23:18:48.649Z | #37 | challenger | qa-confirmed |
| 2026-04-27T23:12:10.164Z | #36 | challenger | qa-confirmed |
| 2026-04-27T20:00:40.016Z | #35 | challenger | qa-confirmed |
| 2026-04-27T19:45:27.166Z | #34 | challenger | qa-confirmed |
| 2026-04-27T19:24:20.761Z | #33 | challenger | qa-confirmed |
| 2026-04-27T18:39:16.307Z | #32 | challenger | qa-confirmed |

---

## 4. Coverage actuel

| Métrique | Valeur | Seuil | Statut |
|---|---|---|---|
| — | N/A | — | Lancer `npm run test:coverage` |

---

## 5. Désaccords ouverts (verdict:qa-escalate sans résolution)

| PR | Date escalade | Raison | Action attendue |
|---|---|---|---|
| — | — | — | Aucun désaccord ouvert |

---

## 6. Santé du dispositif

- ✅ Aucun verdict pending > 48h 
- ✅ Workflow `cross-review-router` actif
- ✅ Workflow `qa-verdict-parser` actif
- ✅ Coverage gate actif (seuil statements ≥ 70 %)
- ⏳ Branch protection `develop` — activer manuellement (voir `docs/BRANCH_PROTECTION.md`)
