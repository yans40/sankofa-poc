# Tests adversariaux — Convention

Ce dossier accueille les tests écrits par le **QA Challenger** lors de la cross-review.
Chaque camp écrit ses tests dans son sous-dossier.

```
adversarial/
├── claude/    ← tests adversariaux écrits par Claude (QA Challenger sur une PR Cursor)
│   └── <numéro-PR>-<slug>.test.ts
└── cursor/    ← tests adversariaux écrits par Cursor (QA Challenger sur une PR Claude)
    └── <numéro-PR>-<slug>.test.ts
```

## Règle de nommage

```
<numéro-PR>-<slug>.test.ts
```

Exemples :
- `15-combat-dead-unit.test.ts` — PR #15, teste un cas mort sur le combat
- `22-griot-empty-deck.test.ts` — PR #22, teste le griot sur deck vide

## Obligation avant `qa-confirmed`

Avant de poser le verdict `qa-confirmed`, le QA Challenger **doit** pousser au moins un test
dans ce dossier, couvrant un cas non couvert par le QA initial adverse.

**Exception docs/chore** : si la PR est `docs` ou `chore` sans impact fonctionnel testable,
le QA Challenger peut poser `qa-confirmed` sans test adversarial, en justifiant explicitement
dans son commentaire de verdict.

## Contenu attendu

- Couvrir un **edge case ou chemin non testé** dans les tests `__tests__/` standards.
- Si aucun cas manqué n'est trouvé après analyse honnête : écrire un test de non-régression
  sur la zone touchée par la PR, avec un commentaire JSDoc expliquant la justification.
- Les tests adversariaux sont des **tests Vitest normaux** — ils sont inclus dans `npm run test`.

## Coverage gate

Seuils minimaux appliqués par CI (`pr-checks.yml`) et vérifiables en local :

```bash
npm run test:coverage        # génère coverage/coverage-summary.json
node scripts/check-coverage.mjs  # affiche le tableau et valide les seuils
```

| Métrique   | Seuil minimum |
|------------|---------------|
| Statements | 70 %          |
| Functions  | 70 %          |
| Branches   | 65 %          |
| Lines      | 70 %          |
