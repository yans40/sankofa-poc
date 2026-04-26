# CLAUDE.md — Instructions pour Claude Code

> Ce fichier est lu automatiquement par Claude Code au démarrage. Il contient le contexte du projet, les règles de travail, et les attentes du Product Owner.

## Identité du projet

**Nom :** Sankofa: Rites of War
**Type :** Prototype navigateur d'un jeu de cartes stratégique (CCG) inspiré de Hearthstone, sur thématique culturelle africaine.
**Phase actuelle :** POC technique (Proof of Concept)
**Product Owner :** Yans

## Documents de référence (à lire avant tout code)

1. **`docs/POC_BRIEF.md`** — Le brief produit complet. **Source de vérité absolue** pour le périmètre, les choix techniques, les types TypeScript, la liste des cartes, les milestones, les critères d'acceptation. À lire en intégralité avant la première ligne de code.
2. **`docs/RULEBOOK_v0.1.docx`** — Les règles complètes du jeu, version 0.1. Source de vérité pour toute règle non explicitement contredite par le brief.
3. **`docs/visual_references.html`** — Mockups HTML des cartes pour comprendre la direction artistique.

## Règles de travail

### Périmètre

- **Ne pas dépasser le périmètre** défini dans `POC_BRIEF.md` §4. Toute idée hors périmètre = backlog v0.2, pas du code POC.
- Si une ambiguïté apparaît dans les specs, **poser la question au PO** avant d'inventer une réponse.
- Procéder **milestone par milestone** : ne pas commencer M2 avant que M1 soit complète et acceptée.

### Conventions de code

- **TypeScript strict mode obligatoire.** Pas de `any` non justifié.
- **Engine pur sans React.** Le moteur de règles vit dans `src/engine/` et n'importe rien de React, du DOM, ou de Zustand.
- **Immutabilité.** Toute fonction `applyAction` est pure et retourne un nouvel état.
- **Tests unitaires Vitest** obligatoires sur le moteur. Coverage cible ≥ 70%.
- **Conventional Commits** : `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.
- **Pas de `console.log`** dans le code committé sauf dans le mode CLI explicite.

### Conventions de cross-review (Claude ↔ Cursor)

Le projet est piloté par deux IA en collaboration : **Claude** (PM + Dev + QA) et **Cursor** (Dev + QA). Le but est qu'elles se challengent mutuellement. Voir `docs/CROSS_REVIEW_CONVENTIONS.md` pour le détail.

- **Branches Claude** : `feature/claude/<slug>` (jamais `feature/cursor/*` ni `feature/*` non namespacé).
- **PR Claude** : labellisée `author:claude` automatiquement (ou manuellement sinon).
- **Review croisée** : une PR `author:claude` doit recevoir le label `review:cursor-approved` avant merge. Inverse pour les PR Cursor.
- **Verdict QA** : balises `<!-- verdict:start -->qa-passed<!-- verdict:end -->` parsables dans le commentaire QA.
- **PM** : exclusivement Claude (`.claude/agents/pm-agent.md`). Le prompt Cursor `pm-readonly.md` ne crée pas de tickets.

### Architecture

Voir `POC_BRIEF.md` §7 pour la structure de dossier complète. En résumé :

```
src/
├── engine/      # moteur pur, testé, sans React
├── data/        # cards.json, heroes.json
├── store/       # Zustand
├── components/  # React
├── hooks/
└── utils/
```

### Stack technique imposée

| Couche | Technologie |
|---|---|
| Langage | TypeScript 5.x strict |
| Framework | React 18 |
| Bundler | Vite 5 |
| State | Zustand |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion (usage léger) |
| Drag & Drop | dnd-kit |
| Tests | Vitest |

**Ne pas introduire** d'autres dépendances majeures sans validation du PO.

### Définition de "Done"

Une milestone est terminée quand :
- ☐ Tout le code des tâches listées est écrit et committé
- ☐ Les tests unitaires passent (`npm test`)
- ☐ Le linter passe (`npm run lint`)
- ☐ Le projet build (`npm run build`)
- ☐ Le `README.md` est à jour avec les nouvelles instructions
- ☐ Le critère d'acceptation de la milestone (cf. brief §11) est vérifié

## Plan d'exécution

### Milestone 1 — Engine Core (commencer ici)

**Objectif :** moteur de règles testé en pure TypeScript, jouable via CLI.

Tâches dans l'ordre :
1. Setup : `npm create vite@latest . -- --template react-ts`, ajouter Vitest, ESLint, Prettier, Tailwind
2. Définir tous les types de `POC_BRIEF.md` §8 dans `src/engine/types.ts`
3. Implémenter `initialGameState()` dans `src/engine/gameState.ts`
4. Implémenter `applyAction()` pour les 9 actions dans `src/engine/actions.ts` + `reducers.ts`
5. Implémenter les sous-systèmes : `combat.ts`, `ancestors.ts`, `rituals.ts`, `keywords.ts`, `griot.ts`, `cycle.ts`
6. Tests unitaires Vitest pour chaque sous-système (`__tests__/`)
7. CLI rudimentaire : `npm run play-cli` qui simule une partie en console
8. Critère d'acceptation : une partie complète jouable en CLI, tous tests verts, coverage ≥ 70%

### Milestone 2 — UI minimale (après acceptation M1)

Cf. `POC_BRIEF.md` §11. Composants React, drag & drop, click-to-target, écran de victoire.

### Milestone 3 — Polish + 20 cartes

Cf. `POC_BRIEF.md` §11. Implémentation des 20 cartes via le DSL d'effets, animations Framer Motion, écran d'accueil.

## Sub-agents Claude disponibles

Trois agents spécialisés vivent dans `.claude/agents/`. Les invoquer via la commande `Task` quand le contexte le demande :

| Agent | Quand l'invoquer |
|---|---|
| `pm-agent` | Découper le brief en tickets GitHub, écrire un `docs/SPRINT_XX.md`, auditer les tickets Cursor |
| `dev-reviewer` | Reviewer une PR `author:cursor` avant qu'elle ne passe en QA |
| `qa-challenger` | Second avis indépendant après un verdict QA Cursor |

**Règle d'or** : ne pas confondre les rôles. Le `pm-agent` ne fait pas de review de code ; le `dev-reviewer` n'écrit pas de code ; le `qa-challenger` ne donne pas le verdict initial.

## Communication avec le PO

- Pour toute question bloquante : créer une note dans `docs/QUESTIONS.md` avec le numéro de la question et la décision attendue.
- À la fin de chaque milestone : produire un court rapport de livraison (`docs/M1_DELIVERY.md`, etc.) listant ce qui a été fait, ce qui reste, et les éventuelles dérives au brief.
- Ne pas modifier `POC_BRIEF.md` ni `RULEBOOK_v0.1.docx` sans accord explicite du PO.

## Hors-périmètre explicite (NE PAS développer dans ce POC)

Cf. `POC_BRIEF.md` §4.2. En particulier :
- ❌ Aucun backend, aucune base de données
- ❌ Aucune authentification
- ❌ Aucun multijoueur en ligne
- ❌ Aucun deck builder
- ❌ Aucune monétisation
- ❌ Aucun mode IA / solo
- ❌ Aucune internationalisation (FR uniquement)

## Premier réflexe à chaque démarrage

1. Lire `docs/POC_BRIEF.md` (intégral)
2. Vérifier l'état d'avancement dans `docs/QUESTIONS.md` et les `M*_DELIVERY.md` éventuels
3. Identifier la prochaine tâche dans la milestone en cours
4. Si une question reste ouverte, la résoudre avec le PO avant de coder

**Bon développement.**
