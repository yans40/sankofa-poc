# PM Agent Workflow

Ce document décrit le processus complet du Chef de Projet (PM) dans le flow Dev → QA.

---

## 1. Cycle de vie d'un ticket

```
backlog → in progress → in review → qa → done
```

| Statut | Déclencheur | Responsable |
|---|---|---|
| `backlog` | Ticket créé par PM, non démarré | PM |
| `in progress` | Dev commence la branche `feature/*` | Dev |
| `in review` | PR ouverte, CI verte, Dev en attente de retour | Dev / QA |
| `qa` | QA exécute le plan de test | QA |
| `done` | Verdict `qa-passed` ou `qa-passed-with-risks`, PR mergée | PM |

**Règle** : un ticket ne passe jamais directement de `backlog` à `qa`. Il doit traverser toutes les étapes.

Si verdict `qa-blocked` : l'issue repasse en `in progress`, la PR reste ouverte, Dev corrige.

---

## 2. Processus de sprint planning

Avant chaque milestone, le PM suit cet ordre :

```
1. Lire docs/POC_BRIEF.md (milestone à planifier)
2. Identifier toutes les tâches livrables séparément
3. Pour chaque tâche :
   a. Choisir le bon template (feature / bug / chore)
   b. Rédiger le ticket complet (user story, critères, taille, dépendances)
   c. Créer l'issue GitHub via le template adapté
4. Ordonner les issues par dépendances (topological sort)
5. Écrire docs/SPRINT_XX.md avec la liste ordonnée
```

**Règle de découpage** : si une tâche est estimée `XL` (> 8h), la découper en sous-tâches `L` ou `M`.

**Règle de scope** : ne jamais créer un ticket pour quelque chose absent de `POC_BRIEF.md`. Toute idée hors périmètre → note dans `docs/QUESTIONS.md`.

---

## 3. Format d'un fichier `docs/SPRINT_XX.md`

```markdown
# Sprint XX — [Nom de la Milestone]

## Objectif
[Copié verbatim du brief §11]

## Critère d'acceptation global
[Copié verbatim du brief]

## Issues du sprint (ordre de traitement)

| # | Titre | Label | Taille | Dépend de | Statut |
|---|---|---|---|---|---|
| #1 | feat(engine): types TypeScript | engine | S | — | done |
| #2 | feat(engine): initialGameState | engine | M | #1 | in progress |
| ... | | | | | |

## Notes de fin de sprint
[Remplir après la milestone : dérives, risques, retours QA]
```

---

## 4. Labels et leur signification

| Label | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité issue du brief |
| `fix` | Correction de bug constaté |
| `chore` | Config, infra, refactor sans valeur fonctionnelle directe |
| `test` | Ajout ou correction de tests Vitest |
| `engine` | Logique pure TypeScript dans `src/engine/` |
| `ux` | Composant React ou interaction utilisateur |
| `size:S` | < 2h |
| `size:M` | 2–4h |
| `size:L` | 4–8h |
| `size:XL` | > 8h — **à re-découper avant de démarrer** |

---

## 5. Interaction PM ↔ Dev ↔ QA

```
PM                    Dev                    QA
 │                     │                      │
 ├─ crée issue ──────▶ │                      │
 │  (backlog)          │                      │
 │                     ├─ feature/* ─────────▶│
 │                     │  (in progress)       │
 │                     ├─ PR ouverte ────────▶│
 │                     │  (in review)         │
 │                     │                      ├─ plan de test
 │                     │                      ├─ checks auto
 │                     │                      ├─ tests manuels
 │                     │                      ├─ verdict
 │◀─── qa-blocked ─────┤◀─────────────────────┤
 ├─ rouvre issue        │  (in progress)       │
 │                     ├─ corrige ────────────▶│
 │                     │                      │
 │◀─── qa-passed ──────┤◀─────────────────────┤
 ├─ ferme issue         ├─ merge develop       │
 │  (done)             │                      │
```

**Règle Dev** : ne pas commencer sans issue GitHub ouverte et assignée au sprint courant.

**Règle PM** : ne pas créer les tickets de M(n+1) avant que M(n) soit intégralement `done`.

---

## 6. Règles d'escalade

| Situation | Action PM |
|---|---|
| Tâche hors périmètre du brief | Refuser, documenter dans `docs/QUESTIONS.md` comme suggestion v0.2 |
| Ambiguïté sur une règle métier | Ajouter question dans `docs/QUESTIONS.md`, attendre réponse PO |
| Dépendance circulaire détectée | Stop, valider l'ordre avec le PO avant création des tickets |
| Milestone précédente non acceptée | Ne pas créer les tickets de la suivante |
| `qa-blocked` répété (≥ 3 fois même bug) | Escalade PO : décision de scope ou revert |

---

## 7. Handoff ticket → Dev

Quand un ticket passe en `in progress`, le PM s'assure que :
- L'issue est assignée au dev qui la prend
- Les dépendances sont résolues (les issues parentes sont `done`)
- Le milestone GitHub est bien positionné sur l'issue
- Le dev a accès à tous les critères d'acceptation dans le body de l'issue

Il n'y a pas d'étape de briefing oral — le ticket doit se suffire à lui-même.
