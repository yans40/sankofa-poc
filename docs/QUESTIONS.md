# Questions ouvertes

Ce fichier contient les questions remontées par l'équipe technique au Product Owner pendant le développement. Chaque question doit avoir un statut explicite.

## Légende des statuts

- 🔴 **OUVERTE** — bloque le développement, attend une décision
- 🟡 **EN DISCUSSION / DIFFÉRÉE** — réponse partielle ou délibérément reportée
- 🟢 **TRANCHÉE** — décision prise, archivée pour traçabilité
- ⚪ **OBSOLÈTE** — la question n'est plus pertinente

## Format

Chaque question suit ce gabarit :

```
### Q-XXX — Titre court
**Statut :** 🔴 OUVERTE
**Posée par :** Claude Code
**Date :** 2026-MM-JJ
**Contexte :** Pourquoi la question se pose, où elle bloque.
**Options envisagées :**
  1. Option A — implications
  2. Option B — implications
**Recommandation tech :** ...
**Décision PO :** (à remplir)
```

---

## Questions héritées du brief (à trancher avant Milestone 1)

### Q-001 — Hot-seat : protection visuelle entre joueurs ?
**Statut :** 🟢 TRANCHÉE
**Posée par :** PO (dans POC_BRIEF.md §14.1)
**Contexte :** Quand le tour passe du Joueur 1 au Joueur 2, l'adversaire doit-il jamais voir ma main ?
**Options envisagées :**
  1. Aucune protection : la main reste toujours affichée
  2. Écran "Joueur 2 — clique pour révéler ta main" entre chaque transition
**Recommandation tech :** Option 2 (recommandée par le PO)
**Décision PO :** ✅ Option 2 appliquée en M2 — `HotSeatScreen.tsx` implémenté, écran "Joueur X, clique pour révéler ta main" actif.

### Q-002 — Illustrations placeholders
**Statut :** 🟢 TRANCHÉE
**Contexte :** Comment afficher visuellement les 20 cartes sans illustrations finales ?
**Options envisagées :**
  1. SVG simples : aplat de couleur faction + nom de la carte
  2. Génération IA (Midjourney, Flux) — mais coût + droits
  3. Banque d'images libres de droits (Unsplash, etc.) — risque thématique
**Recommandation tech :** Option 1 — SVG paramétrés, propres et neutres
**Décision PO :** ✅ Option 1 appliquée en M2 — SVG paramétrés couleur faction

### Q-003 — Résolution automatique des Rituels prêts ?
**Statut :** 🟢 TRANCHÉE
**Contexte :** Au début du tour, si un Rituel a 0 charges, il se résout. Avec ou sans interaction ?
**Options envisagées :**
  1. Automatique avec animation 1s
  2. Le joueur clique pour valider
**Recommandation tech :** Option 1 (automatique) — fluidité de la partie
**Décision PO :** Option 1 appliquée (recommandation PO dans brief §14.3). Implémenté en M1 dans `resolveReadyRituals()` appelé à chaque aurore.

### Q-004 — URL et hébergement de la démo
**Statut :** 🟡 DIFFÉRÉE
**Posée par :** Tech
**Date :** 2026-04-27
**Contexte :** Où déployer le POC pour démonstrations externes ? Bloquait l'issue #31 (déploiement Vercel).
**Options envisagées :**
  1. Vercel (gratuit, déploiement Git)
  2. Netlify (gratuit, équivalent)
  3. Local uniquement
**Recommandation tech :** Vercel
**Décision PO :** Décision délibérément différée. La partie polish FactionSelect (#31) peut avancer sans attendre ; seule la mise en ligne effective est bloquée. Le PO tranchera avant la phase de déploiement. _(Source : session PM 2026-04-27)_

### Q-005 — Visibilité du repo
**Statut :** 🟢 TRANCHÉE
**Posée par :** Tech
**Date :** 2026-04-27
**Contexte :** Le repo Git est-il public ou privé ? Bloquait tout déploiement public.
**Recommandation tech :** Privé jusqu'au pitch officiel
**Décision PO :** ✅ Repo **privé**. À reconsidérer si une démo publique devient nécessaire pour le pitch. _(Source : session PM 2026-04-27)_

---

*Q-001, Q-002, Q-003 : tranchées et implémentées. Q-004 : différée (décision PO attendue avant déploiement). Q-005 : tranchée (repo privé).*
