# Sankofa: Rites of War — POC

> A Hearthstone-inspired collectible card game rooted in African mythologies and cultures.

## Status

**Phase :** POC (Proof of Concept)
**Milestone en cours :** M1 — Engine Core
**Stack :** Vite + React 18 + TypeScript strict + Zustand + Tailwind + Vitest

## Quick start

```bash
npm install
npm run dev          # lance Vite en mode dev
npm test             # lance les tests Vitest
npm run play-cli     # lance une partie en CLI (M1)
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans Chrome desktop.

## Documentation

| Fichier | Description |
|---|---|
| `CLAUDE.md` | Instructions pour Claude Code (lecture obligatoire au démarrage) |
| `docs/POC_BRIEF.md` | **Brief produit complet** — source de vérité du périmètre |
| `docs/RULEBOOK_v0.1.docx` | Règles complètes du jeu |
| `docs/visual_references.html` | Mockups visuels des cartes |

## Structure du projet

```
sankofa-poc/
├─ CLAUDE.md              # Instructions pour Claude Code
├─ README.md              # Ce fichier
├─ docs/
│  ├─ POC_BRIEF.md        # Le brief PM (16 sections, source de vérité)
│  ├─ RULEBOOK_v0.1.docx  # Règles officielles
│  └─ visual_references.html
├─ src/
│  ├─ engine/             # Moteur de règles pur (à implémenter en M1)
│  ├─ data/               # cards.json, heroes.json
│  ├─ store/              # Zustand
│  ├─ components/         # React UI (à implémenter en M2)
│  ├─ hooks/
│  └─ utils/
├─ public/
│  └─ assets/             # Illustrations (placeholders en M3)
└─ package.json           # à générer en M1
```

## Comment lancer Claude Code dans ce projet

```bash
cd sankofa-poc
claude
```

Puis dans la session Claude Code :

```
Lis CLAUDE.md et docs/POC_BRIEF.md, puis exécute la Milestone 1
(Engine Core) en suivant strictement le périmètre défini.
```

## Règles de contribution

- TypeScript strict, pas de `any` non justifié
- Tests Vitest obligatoires sur le moteur (coverage ≥ 70%)
- Conventional Commits
- Pas de scope creep : tout ce qui sort de `docs/POC_BRIEF.md` §4.1 va dans le backlog v0.2

## Périmètre du POC en 30 secondes

✅ **Inclus :** mode 2 joueurs hot-seat, 2 factions (Orishas + Zoulou), 20 cartes, mécaniques signature (Autel, Rituels, Griot, Cycle du Monde), drag & drop, animations basiques.

❌ **Exclus :** backend, multijoueur en ligne, comptes utilisateurs, deck builder, IA, monétisation, mobile.

## Licence

À définir.

## Auteurs

- Yans — Product Owner
- Claude Code — Lead Engineer
