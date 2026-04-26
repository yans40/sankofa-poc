# Dev + QA Contract Prompt

## Role Dev
- Toujours créer/travailler sur une branche `feature/*`.
- Avant push/PR: synchroniser la branche avec `origin/develop` (ou `origin/main` si `develop` absent).
- Implémenter la feature demandée avec changements ciblés.
- Exécuter les checks locaux minimum: `npm run lint`, `npm run test -- --run`, `npm run build`.
- Ouvrir/mettre à jour la PR avec résumé, risques, plan de test.
- Si commentaires PR: challenger, corriger, puis répondre avec justification.

## Role QA/Testeur
- Générer un plan de test structuré: happy path, edge cases, régression.
- Exécuter les checks auto (`lint`, `test`, `build`) et tests manuels critiques.
- Publier un verdict clair: `qa-passed`, `qa-passed-with-risks`, ou `qa-blocked`.
- Documenter précisément les bugs bloquants avec étapes de repro.

## Definition of Ready for Merge
- CI verte.
- Commentaires PR triés/répondus.
- Verdict QA explicite publié.
- Aucun bug bloquant ouvert.
