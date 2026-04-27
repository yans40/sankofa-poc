# Branch Protection — `develop`

> Guide d'activation pour le PO. La branch protection rend le workflow `cross-review-router` **bloquant**.
> Tant qu'elle n'est pas activée, les status checks sont purement déclaratifs.

---

## Pourquoi l'activer

Sans branch protection, n'importe qui peut merger une PR sans cross-review ni CI verte.
Avec, GitHub bloque automatiquement le bouton "Merge" jusqu'à ce que les checks requis passent.

---

## Étapes (UI GitHub)

1. Aller sur **Settings** → **Branches** → **Add branch protection rule**

2. **Branch name pattern** : `develop`

3. Cocher les options suivantes :

   ### Require a pull request before merging
   - ☑ Require a pull request before merging
   - "Required number of approvals" : laisser à `0` pour l'instant (les labels remplacent l'approval)

   ### Require status checks to pass before merging
   - ☑ Require status checks to pass before merging
   - ☑ Require branches to be up to date before merging
   - **Required checks** (chercher dans la liste après un premier run du workflow) :
     - `lint-test-build` (workflow `PR Checks`)
     - `cross-review-approved` (workflow `Cross-review Router`)

   ### Require conversation resolution before merging
   - ☑ Require conversation resolution before merging

   ### Require linear history
   - ☑ Require linear history *(évite les merge commits parasites)*

   ### Restrictions
   - ☑ Do not allow bypassing the above settings *(s'applique à tout le monde, y compris admins)*

4. Cliquer **Create** (ou **Save changes** si la règle existe déjà).

---

## Note sur les required checks

Les checks n'apparaissent dans la liste GitHub qu'**après au moins un run** du workflow concerné.
Si `cross-review-approved` n'est pas dans la liste, ouvrir une PR test sur `feature/claude/test-*`,
attendre que le workflow tourne, puis revenir ici pour l'ajouter.

---

## Ce que ça bloque concrètement

| Situation | Résultat avec protection active |
|---|---|
| PR sans `author:*` | `cross-review-approved` rouge → merge bloqué |
| PR sans `review:<adverse>-approved` | `cross-review-approved` rouge → merge bloqué |
| PR sans verdict QA | `cross-review-approved` rouge → merge bloqué |
| CI rouge (`lint-test-build`) | `lint-test-build` rouge → merge bloqué |
| Tous les checks verts | Merge autorisé |

---

*Activer dès que le premier cycle complet Claude↔Cursor est terminé (fin Sprint 01 ou avant).*
