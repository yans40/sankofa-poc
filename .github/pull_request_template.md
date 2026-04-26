Closes #

## Provenance

<!-- Cocher l'agent auteur. La review croisée sera assignée à l'autre. -->

- [ ] Author: Claude
- [ ] Author: Cursor

## Dev Section

### Objectif
- 

### Changement principal
- 

### Impact / Risques
- 

### Rollback plan
- 

## QA Section

### Test plan
- [ ] Happy path
- [ ] Edge cases
- [ ] Régression

### Exécution automatique
- [ ] `npm run lint`
- [ ] `npm run test -- --run`
- [ ] `npm run build`

### Résultats manuels
- 

### Verdict QA

<!--
  Renseigner le verdict en remplaçant le contenu entre les balises.
  Valeurs autorisées : qa-passed | qa-passed-with-risks | qa-blocked
  Le workflow .github/workflows/qa-verdict-parser.yml (Phase 3) lira ces balises.
-->

<!-- verdict:start -->
qa-pending
<!-- verdict:end -->

## Cross-review

- [ ] Reviewer adverse assigné (Claude review Cursor / Cursor review Claude)
- [ ] Label `review:<adversaire>-approved` posé avant merge
- [ ] Test adversarial ajouté dans `src/engine/__tests__/adversarial/<reviewer>/` (Phase 4, optionnel)
