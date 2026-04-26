# DEV + QA Agent Workflow

Ce document standardise le fonctionnement hybride local + GitHub.

## 0) Flow global PM → Dev → QA

```
PM crée ticket (GitHub Issue)
  └▶ Dev prend le ticket, ouvre feature/*
       └▶ Dev ouvre PR (CI verte)
            └▶ QA vérifie (plan de test + verdict)
                 ├▶ qa-passed  → PM ferme issue, merge develop
                 └▶ qa-blocked → PM rouvre issue, Dev corrige
```

**Dev ne commence pas sans issue GitHub ouverte et assignée au sprint courant.**
Voir `docs/PM_AGENT_WORKFLOW.md` pour le cycle de vie complet des tickets.

## Conventions de cross-review

Voir `docs/CROSS_REVIEW_CONVENTIONS.md` pour la matrice complète. Résumé :

| Agent | Branche | Label PR | Reviewer adverse |
|---|---|---|---|
| Claude Dev | `feature/claude/<slug>` | `author:claude` | Cursor Dev Reviewer |
| Cursor Dev | `feature/cursor/<slug>` | `author:cursor` | Claude `dev-reviewer` |

Le PM est **toujours** Claude (`.claude/agents/pm-agent.md`).

## 1) Role Dev

1. Créer une branche namespacée selon l'agent :
   - Claude → `feature/claude/<slug>`
   - Cursor → `feature/cursor/<slug>`
2. Se synchroniser avec la base (`develop` par défaut, sinon `main`).
3. Implémenter de façon ciblée et garder les commits lisibles.
4. Exécuter localement:
   - `npm run lint`
   - `npm run test -- --run`
   - `npm run build`
5. Ouvrir/mettre à jour la PR avec le template standard.
6. Challenger les commentaires PR et corriger rapidement les points bloquants.

## 2) Role QA/Testeur

1. Produire un plan de test (happy path, edge cases, régression).
2. Lancer les checks automatiques et suivre la CI PR.
3. Exécuter les tests manuels critiques selon le scope.
4. Publier un verdict explicite dans la balise parsable du PR template :
   ```
   <!-- verdict:start -->
   qa-passed
   <!-- verdict:end -->
   ```
   Valeurs : `qa-passed` | `qa-passed-with-risks` | `qa-blocked`.
5. En cas de bug, fournir:
   - étapes de reproduction
   - résultat observé vs attendu
   - gravité / impact

## 3) Hooks projet Cursor

Les hooks se trouvent dans `.cursor/hooks.json`:

- `ensure-feature-branch.sh`: bloque les opérations Git risquées sur `main/master/develop`.
- `ensure-branch-up-to-date.sh`: alerte si la branche est en retard avant push/PR.
- `route-to-qa.sh`: rappelle la boucle QA lors des push/création PR.

## 4) GitHub CI / PR

- Workflow `PR Checks`: `lint` + `test` + `build`.
- Workflow `PR QA Summary`: commentaire automatique de synthèse CI sur chaque PR.
- Template PR obligatoire: sections Dev + QA.

## 5) Boucle de triage PR (babysitting)

1. Lire tous les commentaires/reviews.
2. Corriger les points valides en priorité.
3. Relancer checks/tests.
4. Répondre aux commentaires avec contexte.
5. Répéter jusqu’à état merge-ready.

## 6) Règles d’escalade

- Conflit ambigu de logique métier: stop et validation humaine.
- Bug bloquant: correction prioritaire, nouveau commit, retest complet.
- Point non bloquant: fixer si faible coût, sinon ticket/backlog documenté.
