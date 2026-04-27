# Cross-review Dashboard — Sankofa POC

> Généré par `scripts/generate-dashboard.mjs`. Source : GitHub API + `docs/qa-history.md`.
> Dernière mise à jour : 2026-04-27T18:08:51.633Z

---

## 1. Activité par camp (30 derniers jours)

| Camp | PR ouvertes | PR mergées | Verdicts QA posés | Tests adversariaux ajoutés |
|---|---|---|---|---|
| Claude | 0 | 0 | 2 | 0 |
| Cursor | 0 | 0 | 0 | 0 |

---

## 2. PR en cours (état temps réel)

| # | Titre | Auteur | CI | Reviewer adverse | Verdict QA | Bloqueurs |
|---|---|---|---|---|---|---|
| — | Aucune PR ouverte | — | — | — | — | — |

---

## 3. Verdicts récents (10 derniers)

| Date (UTC) | PR | Agent | Verdict |
|---|---|---|---|
| 2026-04-27T12:56:47.975Z | #16 | challenger | qa-confirmed |
| 2026-04-27T12:51:03.087Z | #16 | claude | qa-pending |

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
