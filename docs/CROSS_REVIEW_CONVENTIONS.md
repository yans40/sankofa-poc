# Cross-review Conventions — Claude ↔ Cursor

Document de référence unique pour la coordination des agents Claude et Cursor sur ce projet. Source de vérité pour les règles de provenance, de review croisée et de verdict QA.

---

## 1. Principe directeur

Le projet est piloté par **deux IA en collaboration** :

| Camp | Rôles | Outillage |
|---|---|---|
| **Claude** | PM (exclusif) + Dev + QA + Dev Reviewer + QA Challenger | `.claude/agents/*.md` |
| **Cursor** | Dev + QA + (à venir) Dev Reviewer + QA Challenger | `.cursor/prompts/*.md` + `.cursor/hooks/*` |

L'objectif est qu'elles **se challengent mutuellement** : la PR d'un camp est reviewée par l'autre, et chaque verdict QA reçoit un second avis du camp adverse.

---

## 2. Provenance — qui a produit quoi

### Branches

| Auteur | Format imposé |
|---|---|
| Claude | `feature/claude/<slug>` |
| Cursor | `feature/cursor/<slug>` |

Toute autre forme est rejetée par les hooks (`.cursor/hooks/ensure-feature-branch.sh` côté Cursor ; équivalent Claude prévu en Phase 5).

### Labels GitHub

Définis dans `.github/labels.yml` et synchronisés automatiquement par `.github/workflows/labels-sync.yml`. Trois familles obligatoires sur chaque PR :

| Famille | Valeurs | Posé par |
|---|---|---|
| Provenance | `author:claude` \| `author:cursor` | Auteur (ou auto via cross-review-router en Phase 2) |
| Review | `review:claude-approved` \| `review:cursor-approved` \| `review:changes-requested` | Reviewer adverse |
| Verdict | `verdict:qa-passed` \| `verdict:qa-passed-with-risks` \| `verdict:qa-blocked` \| `verdict:qa-confirmed` \| `verdict:qa-escalate` | Parser (Phase 3) à partir des balises QA |

---

## 3. Matrice de routage des reviews

```
┌───────────────────┬──────────────────────┬──────────────────────┐
│   PR auteur       │   Dev Reviewer       │   QA Challenger      │
├───────────────────┼──────────────────────┼──────────────────────┤
│   author:claude   │   Cursor (Phase 1)   │   Cursor (Phase 1)   │
│   author:cursor   │   Claude dev-reviewer│   Claude qa-challenger│
└───────────────────┴──────────────────────┴──────────────────────┘
```

Une PR `author:claude` n'est merge-ready que si :
- CI verte (lint + test + build)
- Verdict QA Cursor = `qa-passed` ou `qa-passed-with-risks` (balise parsée)
- Label `review:cursor-approved` posé par le Dev Reviewer Cursor
- Le QA Challenger Cursor a posé `verdict:qa-confirmed` (ou pas de désaccord)

Inversement pour une PR `author:cursor`.

---

## 4. Verdicts QA — balises parsables

Chaque QA pose son verdict dans le PR template via une balise HTML :

```html
<!-- verdict:start -->
qa-passed
<!-- verdict:end -->
```

Valeurs autorisées :

| Verdict | Sens | Conséquence |
|---|---|---|
| `qa-pending` | Pas encore testé (valeur par défaut du template) | Bloque le merge |
| `qa-passed` | Validé sans risque | Merge possible si label adverse OK |
| `qa-passed-with-risks` | Validé avec risques documentés | Merge possible, ticket de suivi à créer |
| `qa-blocked` | Bug bloquant constaté | Merge bloqué, retour Dev |

Le QA Challenger adverse poste son second avis dans un commentaire séparé avec :

```html
<!-- challenger-verdict:start -->
qa-confirmed
<!-- challenger-verdict:end -->
```

Valeurs : `qa-confirmed` | `qa-escalate` | `qa-reopen`.

Le parsing automatique des balises est implémenté en Phase 3 via
`.github/workflows/qa-verdict-parser.yml`.

Les verdicts parsés alimentent aussi un historique append-only dans `docs/qa-history.md`
au format :

`| Date (UTC) | PR | Agent | Verdict |`

---

## 5. PM = Claude exclusivement

Le PM (`.claude/agents/pm-agent.md`) :

- est le **seul** agent autorisé à créer des issues GitHub ;
- audite le backlog Cursor en lecture (suggestions en commentaire d'issue) ;
- arbitre les conflits entre verdict QA Cursor et verdict QA Challenger Claude ;
- met à jour `docs/SPRINT_XX.md`.

Côté Cursor, le prompt `.cursor/prompts/pm-readonly.md` (créé en Phase 1) n'a que le droit de :
- lister les issues du sprint courant (`gh issue list`)
- commenter une issue avec une remarque de triage
- **jamais** `gh issue create`.

---

## 6. Cycle de vie d'une PR (vue end-to-end)

```
1. Claude PM crée l'issue GitHub (label: M1/M2/M3, size:*, type)
2. Dev (Claude ou Cursor) prend l'issue
   └─ Crée feature/claude/<slug> ou feature/cursor/<slug>
   └─ Implémente, push
3. PR ouverte
   └─ Auto-label author:* via `cross-review-router.yml` (branch name → label)
   └─ Commentaire de routing posé automatiquement avec les reviewers attendus
   └─ Status check `cross-review-approved` activé (bloquant si branch protection activée — voir `docs/BRANCH_PROTECTION.md`)
4. Reviewer adverse audite le diff
   └─ Pose review:<reviewer>-approved ou review:changes-requested
5. QA initial (Claude ou Cursor selon convention de l'équipe)
   └─ Pose verdict:qa-* via balise
6. QA Challenger adverse
   └─ Pose challenger-verdict:* via balise
7. Conflit ? → escalade au PM Claude (verdict:qa-escalate)
   Sinon → merge dans develop
8. PM ferme l'issue, met à jour docs/SPRINT_XX.md
```

---

## 7. Phases d'implémentation

| Phase | Contenu | Statut |
|---|---|---|
| 0 — Conventions | Labels, branches, CLAUDE.md, PR template, ce doc | ✅ Implémentée |
| 1 — Symétrie Cursor | `.cursor/prompts/dev-reviewer-cursor.md`, `qa-challenger-cursor.md`, `pm-readonly.md` (remplace l'ancien `pm-agent.md` Cursor) | ✅ Implémentée |
| 2 — Routage auto | Workflow `cross-review-router.yml` + branch protection | ✅ Implémentée |
| 3 — Verdicts parsés | Workflow `qa-verdict-parser.yml` + `docs/qa-history.md` | ✅ Implémentée |
| 4 — Tests adversariaux | Dossier `__tests__/adversarial/{claude,cursor}/` + coverage gate | ✅ Implémentée |
| 5 — Hooks Claude + dashboard | `.claude/hooks/` symétrique + `docs/CROSS_REVIEW_DASHBOARD.md` | ⏳ À faire |

---

## 8. Règles d'arbitrage

| Situation | Décision |
|---|---|
| Verdict QA initial = `qa-passed`, Challenger = `qa-escalate` | Le PM tranche dans les 24h, sinon défaut = `qa-blocked` |
| 3 boucles `qa-blocked` consécutives | Escalade au PO (Yans) |
| Reviewer adverse silencieux > 48h | Le PM peut forcer le merge en signant manuellement le label adverse, avec note dans `docs/SPRINT_XX.md` |
| PR sans label `author:*` | CI bloque le merge (Phase 2) |
| Branche hors namespace | Hook bloque les ops Git (Phase 0 ✅ pour Cursor) |
| `qa-confirmed` posé sans test adversarial ni justification | PM Claude rouvre le verdict, demande au Challenger de compléter |
| Coverage statements < 70 % | CI bloque le merge automatiquement |

---

## 10. Tests adversariaux

### Convention de nommage

Les tests adversariaux vivent dans `src/engine/__tests__/adversarial/` et sont organisés par camp :

```
adversarial/
├── claude/    ← écrits par Claude (QA Challenger sur une PR Cursor)
│   └── <numéro-PR>-<slug>.test.ts
└── cursor/    ← écrits par Cursor (QA Challenger sur une PR Claude)
    └── <numéro-PR>-<slug>.test.ts
```

### Règle du test obligatoire avant `qa-confirmed`

Avant de poser le verdict `qa-confirmed`, le QA Challenger **doit** pousser au moins un test
Vitest dans son sous-dossier, couvrant un cas non couvert par le QA initial adverse.

Si aucun cas manqué n'est trouvé, un test de non-régression sur la zone touchée est acceptable,
avec un commentaire JSDoc qui justifie ce choix.

**Exception** : PR `docs` ou `chore` sans surface fonctionnelle testable → justification
explicite dans le commentaire de verdict, aucun test adversarial exigé.

### Coverage gate

Seuils imposés par CI (job `lint-test-build` dans `pr-checks.yml`) :

| Métrique   | Seuil minimum |
|------------|---------------|
| Statements | 70 %          |
| Functions  | 70 %          |
| Branches   | 65 %          |
| Lines      | 70 %          |

Vérification locale :
```bash
npm run test:coverage
node scripts/check-coverage.mjs
```

---

## 11. Glossaire rapide

- **Dev Reviewer** : agent qui audite le code de l'autre camp avant QA. Verdict en commentaire structuré.
- **QA Challenger** : agent qui produit un second avis indépendant après le QA initial.
- **Cross-review** : la review entre camps adverses (Claude ↔ Cursor).
- **Verdict** : décision finale d'un agent sur une PR, exprimée via balise parsable.
