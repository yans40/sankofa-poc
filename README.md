# Sankofa: Rites of War — POC

> Jeu de cartes à collectionner (CCG) inspiré de Hearthstone, ancré dans les mythologies africaines.

## Prérequis

- **Node.js** 20 ou supérieur
- **npm** 10 ou supérieur
- **Navigateur** : Chrome desktop (recommandé)

## Installation

```bash
git clone https://github.com/yans40/sankofa-poc.git
cd sankofa-poc
npm install
```

## Lancement

```bash
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans Chrome desktop.

Le projet se lance en moins de 30 secondes sur une machine standard.

## Comment jouer

1. **Sélection de faction** — choisir Orishas ou Zoulou pour chaque joueur (écran d'accueil)
2. **Mulligan** — remplacer jusqu'à 3 cartes de la main de départ
3. **Tour de jeu** :
   - Les cartes disponibles s'affichent dans la main (bas de l'écran)
   - **Jouer une unité** : glisser-déposer la carte sur le plateau (zone de combat)
   - **Jouer un sort / rituel** : cliquer sur la carte, puis cliquer sur la cible si demandé
   - **Attaquer** : cliquer sur une unité alliée, puis cliquer sur une unité ennemie ou le héros adverse
   - **Fin de tour** : cliquer sur le bouton "Fin de tour"
4. **Victoire** — réduire les 30 points de vie du héros adverse à 0

## Lancer les tests

```bash
npm test                          # suite complète (Vitest)
npm run test:coverage             # avec rapport de couverture
node scripts/check-coverage.mjs  # vérifie le seuil de couverture (>= 70 %)
```

## Architecture

La structure complète est détaillée dans [`docs/POC_BRIEF.md`](docs/POC_BRIEF.md) §7.

```
sankofa-poc/
├─ src/
│  ├─ engine/        # moteur de règles pur TypeScript (sans React)
│  ├─ data/          # cards.json, heroes.json
│  ├─ store/         # état global Zustand
│  ├─ components/    # composants React
│  └─ hooks/
├─ docs/
│  ├─ POC_BRIEF.md   # brief produit — source de vérité
│  └─ SPRINT_*.md    # plans de sprint
└─ scripts/          # utilitaires CI (coverage, dashboard)
```

## Périmètre du POC

✅ **Inclus :** mode 2 joueurs hot-seat, 2 factions (Orishas + Zoulou), 20 cartes, mécaniques signature (Autel, Rituels, Griot, Cycle du Monde), drag & drop, animations.

❌ **Exclus :** backend, multijoueur en ligne, comptes utilisateurs, deck builder, IA, monétisation, mobile.

## Documentation

| Fichier | Description |
|---|---|
| `CLAUDE.md` | Instructions pour Claude Code (agents, conventions) |
| `docs/POC_BRIEF.md` | Brief produit complet — source de vérité |
| `docs/DEV_QA_AGENT_WORKFLOW.md` | Workflow PM → Dev → QA |

## Licence

À définir.

## Auteurs

- Yans — Product Owner
- Claude Code — Lead Engineer / PM
- Cursor — Dev collaborateur
