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

---

## Questions M4 — Voyage de Sankofa

### Q-006 — Soin partiel entre combats : montant fixe ou pourcentage ?
**Statut :** 🔴 OUVERTE
**Posée par :** Claude Code (PM)
**Date :** 2026-04-28
**Contexte :** Entre deux combats d'une run, le héros récupère des PV. Quel montant ?
**Options envisagées :**
  1. +10 PV fixe (plafonné à `heroMaxHealth`) — simple, prévisible
  2. +20 % des PV max arrondi — proportionnel mais moins lisible
**Recommandation tech :** Option 1 (+10 fixe).
**Décision PO :** (à remplir)
**Impact :** Ne bloque pas le ticket engine ; défaut appliqué : +10 fixe.

---

### Q-007 — Carte ajoutée entre combats : doublons autorisés ?
**Statut :** 🔴 OUVERTE
**Posée par :** Claude Code (PM)
**Date :** 2026-04-28
**Contexte :** Les 3 propositions de cartes entre combats peuvent-elles inclure une carte déjà présente dans le deck ?
**Options envisagées :**
  1. Oui (pas de filtre) — simplicité maximale
  2. Non (exclure les cartes déjà à 3 copies)
  3. Non (exclure strictement tout doublon)
**Recommandation tech :** Option 1 pour M4.
**Décision PO :** (à remplir)
**Impact :** Ne bloque pas ; défaut : Option 1.

---

### Q-008 — Difficulté croissante : deck ou score IA ?
**Statut :** 🔴 OUVERTE
**Posée par :** Claude Code (PM)
**Date :** 2026-04-28
**Contexte :** Comment rendre les 3 combats de difficulté croissante ?
**Options envisagées :**
  1. Decks adverses prédéfinis de plus en plus solides — IA identique
  2. Score heuristique IA augmenté (multiplicateur) — même deck
  3. Les deux
**Recommandation tech :** Option 1 — ne pas tweaker l'heuristique à ce stade.
**Décision PO :** (à remplir)
**Impact :** Bloque la création des 3 decks adverses. Défaut : Option 1.

---

### Q-009 — Écran après défaite lors d'une run ?
**Statut :** 🔴 OUVERTE
**Posée par :** Claude Code (PM)
**Date :** 2026-04-28
**Contexte :** Quand le héros tombe à 0 PV avant la fin des 3 combats, que voit le joueur ?
**Options envisagées :**
  1. Retour direct à FactionSelect
  2. Écran « Défaite » avec stats + bouton Rejouer
**Recommandation tech :** Option 2 — favorise le replay.
**Décision PO :** (à remplir)
**Impact :** Bloque le ticket `[ux] Écran carte du voyage + victoire/défaite`. Défaut : Option 2.

---

*Q-001 à Q-003 : tranchées. Q-004 : différée. Q-005 : tranchée. Q-006 à Q-009 : ouvertes M4 — défauts proposés consignés ci-dessus, démarrage engine possible sans arbitrage PO.*
