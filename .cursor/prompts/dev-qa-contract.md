# Dev + QA Contract Prompt (Cursor)

> Ce prompt s'applique aux **agents Cursor uniquement**. Voir `docs/CROSS_REVIEW_CONVENTIONS.md` pour la vision globale Claude ↔ Cursor.

## Conventions de provenance

- Cursor travaille **uniquement** sur des branches `feature/cursor/<slug>`.
- Le PM est **Claude** : Cursor ne crée pas de ticket GitHub. Il consomme les issues du sprint en cours.
- Chaque PR est labellisée `author:cursor`.
- Une PR Cursor n'est merge-ready qu'après le label `review:claude-approved` posé par le Dev Reviewer Claude.

## Role Dev (Cursor)
- Travailler exclusivement sur `feature/cursor/<slug>`. Le hook `.cursor/hooks/ensure-feature-branch.sh` rejette les autres formats.
- Avant push/PR : synchroniser la branche avec `origin/develop`.
- Implémenter la feature demandée avec changements ciblés.
- Exécuter localement : `npm run lint`, `npm run test -- --run`, `npm run build`.
- Ouvrir/mettre à jour la PR avec le template (cocher `Author: Cursor`, remplir Dev Section).
- Si commentaires Dev Reviewer Claude : challenger, corriger, puis répondre avec justification.

## Role QA/Testeur (Cursor)
- Produire un plan de test structuré : happy path, edge cases, régression.
- Exécuter les checks auto (`lint`, `test`, `build`) et tests manuels critiques.
- Publier un verdict clair dans la balise du PR template :
  ```
  <!-- verdict:start -->
  qa-passed
  <!-- verdict:end -->
  ```
  Valeurs autorisées : `qa-passed` | `qa-passed-with-risks` | `qa-blocked`.
- Documenter précisément les bugs bloquants avec étapes de repro.
- Sur une PR `author:claude`, **ne pas** poser le verdict initial — c'est l'agent QA Challenger Cursor qui produit un second avis (cf. Phase 1).

## Definition of Ready for Merge
- CI verte (lint + test + build).
- Verdict QA = `qa-passed` ou `qa-passed-with-risks` dans la balise.
- Label `review:claude-approved` posé sur la PR Cursor (ou inversement).
- Aucun bug bloquant ouvert sur l'issue liée.
