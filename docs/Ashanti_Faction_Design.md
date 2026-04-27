# Faction Ashanti — Design Document v0.2

> **Source d'inspiration historique :** *La Confédération Ashanti — L'Empire de l'Or et de la Guerre* (NotebookLM, chronologie 5e siècle → 1948)
> **Statut :** proposition de design pour intégration à Sankofa: Rites of War
> **À ajouter en :** v0.2 du rulebook (après stabilisation des Orishas + Zoulou en MVP)
> **Auteur :** Yans (Product Owner) avec recherche assistée
> **Changelog v0.2 :** corrections de dates historiques (Opoku Ware I 1718-1760), enrichissement des flavor texts, intégration de la timeline complète, lien vers `Ashanti_Lore.md` (bible narrative) et `Ashanti_Expansion_v0.3.md` (10 cartes additionnelles)

---

## 1. Identité narrative

### 1.1 Pitch en une phrase
> *Une nation forgée par la guerre, unifiée par un trône divin, et capable de renaître éternellement de ses cendres.*

### 1.2 Trois piliers narratifs (issus du PDF)

1. **L'union par le serment.** La Confédération Ashanti n'est pas une tyrannie : c'est un pacte (*Ntam*) entre cinq villes-mères — Kumasi, Mampon, Juaben, Bekwai, Kokofu — toutes liées par allégeance au Trône d'Or.
2. **L'or comme âme et puissance.** *Sika Dwa Kofi* (le Trône d'Or), descendu du ciel un vendredi, contient le *Sunsum* — l'esprit — de la nation. L'or n'est pas une ressource matérielle pour les Ashanti : c'est leur lien spirituel.
3. **Asante Kotoko — le porc-épic.** *« Tuez-en mille, mille autres surgiront. »* Doctrine militaire d'Opoku Ware : une armée organisée en cinq corps (éclaireurs, avant-garde, deux ailes, arrière-garde) capable de se régénérer indéfiniment.

### 1.3 Étymologie
**Asante** = littéralement « pour la guerre ». Cette faction porte la guerre dans son nom.

---

## 2. Identité mécanique

### 2.1 Positionnement dans le triangle stratégique

| Faction | Style | Vitesse | Boucle dominante |
|---|---|---|---|
| **Orishas** | Contrôle / magie | Lent | Sorts puissants, Rituels massifs |
| **Zoulou** | Agression / militaire | Rapide | Pression, finishers, bonus de groupe |
| **Ashanti** *(nouveau)* | **Économie / résilience** | **Mid-Late** | **Accumulation d'or, jetons régénérants, scaling tardif** |

Les Ashanti ne meurent jamais vraiment, et plus la partie dure, plus ils deviennent dangereux.

### 2.2 Boucle de jeu signature

```
                         ┌────────────────────────┐
                         │   Mes unités meurent    │
                         └───────────┬─────────────┘
                                     ↓
                         ┌────────────────────────┐
                         │   Kotoko : jetons 1/1   │
                         │   surgissent en retour  │
                         └───────────┬─────────────┘
                                     ↓
                         ┌────────────────────────┐
                         │   Sika : je gagne de   │
                         │   l'Or à chaque action │
                         └───────────┬─────────────┘
                                     ↓
                         ┌────────────────────────┐
                         │   Trône d'Or invoqué   │
                         │   → +1/+1 perpétuel    │
                         └───────────┬─────────────┘
                                     ↓
                         ┌────────────────────────┐
                         │   Mes ailes (Nifa &     │
                         │   Benkum) déferlent     │
                         └────────────────────────┘
```

---

## 3. Trois nouveaux mots-clés signature (à ajouter au rulebook §13)

### 3.1 `SIKA [X]` — L'Or
**Définition :** Quand cette carte est jouée, ajoutez `X` Pépite(s) d'Or à votre Trésor (max 5).

**Règle annexe — La Pépite d'Or :**
- Une Pépite d'Or est un **jeton spécial**, stocké dans une Trésorerie visible à côté du joueur.
- Au maximum **5 Pépites simultanées** dans la Trésorerie ; toute Pépite excédentaire est perdue.
- À votre Phase Principale, **une fois par tour**, vous pouvez dépenser une Pépite d'Or pour gagner **+1 Énergie temporaire ce tour-ci** (n'augmente pas votre maximum).
- Certaines cartes consomment plusieurs Pépites d'Or pour des effets puissants (cf. cartes A11, A12).

**Pourquoi c'est élégant :** crée une économie parallèle sans casser le système d'énergie standard ; limité à 1 conversion/tour pour empêcher les explosions de tempo.

### 3.2 `KOTOKO` — Le Porc-épic
**Définition :** À la mort de cette unité, invoquez un jeton **Combattant Ashanti 1/1** sur un slot libre de votre champ de bataille (si disponible).

**Règle annexe :**
- Le jeton Combattant Ashanti n'a aucun mot-clé et **ne va PAS à l'Autel** à sa mort (rappel règle §10.1.3 : les jetons sont exilés).
- Si tous les slots de votre champ sont pleins (7), le jeton n'est pas invoqué.
- Plusieurs Kotoko qui se déclenchent simultanément génèrent autant de jetons (jusqu'à la limite de slots).

**Pourquoi c'est élégant :** crée une faction qui « repousse » comme un porc-épic ; combine bien avec l'Autel (l'unité d'origine y va, **plus** un jeton arrive en remplacement).

### 3.3 `NTAM` — Le Serment (passif unique du héros)
**Définition :** Tant que le **Trône d'Or** est en jeu sous votre contrôle, vos unités Ashanti gagnent **+1/+1**.

**Règle annexe :**
- Le Trône d'Or est un **Lieu Sacré** (cf. §13.2 du rulebook : `Sacré` = ne peut être perturbé, silencé ni ciblé par effets adverses).
- Si le Trône est détruit (très difficile, demande des effets de zone qui ignorent `Sacré`), tous les bonus +1/+1 sont retirés instantanément.
- Une seule instance du Trône en jeu par joueur.

---

## 4. Le Héros — Osei Tutu, Roi-Fondateur

> *Né d'une mère stérile, libérée de sa stérilité par l'esprit du rocher Tutu Abor. Otage à la cour du roi Denkyira Boa Amponsem, Osei Tutu eut une liaison avec une princesse Denkyira et s'enfuit à Akwamu, où il rencontra le devin Okomfo Anokye. À la mort de son oncle maternel **Obiri Yeboah** — décapité lors d'un affrontement avec les futurs Gyamans — il hérita de la chefferie de Kwaman. De 1689 à 1701, il forgea une confédération par le mariage et la guerre, vainquit le Denkyira de Ntim Gyakari, et fonda la Confédération Ashanti en 1701. Il mourut au combat en 1717, son corps emporté par le fleuve Pra.*


```
╔══════════════════════════════════════════════╗
║  OSEI TUTU                                   ║
║  Roi-Fondateur des Ashanti                   ║
║  Faction : Ashanti                           ║
║  PV : 30                                     ║
║                                              ║
║  POUVOIR HÉROÏQUE — « Frappe d'Or »          ║
║  Coût : 2 énergie. Une fois par tour.        ║
║  Effet : Ajoutez 1 Pépite d'Or à votre       ║
║  Trésor.                                     ║
║                                              ║
║  GRIOT PASSIF — « Asante Kotoko »            ║
║  Au début de votre tour, pour chaque unité   ║
║  Ashanti morte le tour précédent (max 2),    ║
║  invoquez un jeton Combattant Ashanti 1/1    ║
║  sur votre champ de bataille.                ║
║                                              ║
║  CITATION                                    ║
║  « De l'humiliation à Denkyira naquit la    ║
║   plus grande nation de l'or. »              ║
╚══════════════════════════════════════════════╝
```

### Pourquoi ce design fonctionne

- **Pouvoir héroïque générateur** : le joueur Ashanti accumule lentement de l'Or chaque tour, ce qui valorise les parties longues. C'est le polar opposé du pouvoir héroïque agressif de Shaka.
- **Griot Kotoko** : le héros lui-même incarne la doctrine du porc-épic — la mort d'une unité est une opportunité. Crée des décisions intéressantes : sacrifier une unité faible pour déclencher Kotoko le tour suivant.
- **Synergie native avec le late game** : plus la partie dure, plus le joueur Ashanti accumule d'avantages (or + jetons + Trône d'Or installé).

---

## 5. Liste des 12 cartes — Faction Ashanti

> Construite selon la formule de Power Level §17 du rulebook. Toutes équilibrées pour un Coût × 2 + 1 stats vanilla, avec les effets compensés.

| ID | Nom | Coût | Att/PV | Mots-clés | Effet | Rareté |
|---|---|---|---|---|---|---|
| **A01** | Akwanfo, Éclaireur | 1 | 2/1 | Furtivité | — | Commune |
| **A02** | Combattant Ashanti | 1 | 1/2 | **Kotoko** | — | Commune |
| **A03** | Pacte d'Elmina | 2 | sort | — | Piochez 2 cartes. Sika [1]. | Commune |
| **A04** | Lancier Adonten | 2 | 2/3 | Provocation | — | Commune |
| **A05** | Aile Nifa | 3 | 3/3 | Charge, **Kotoko** | — | Commune |
| **A06** | Aile Benkum | 3 | 3/3 | Charge, **Kotoko** | — | Commune |
| **A07** | Tisserand de Kente | 2 | 2/2 | — | Râle : Sika [2]. | Rare |
| **A08** | Kyidom, Arrière-Garde | 4 | 2/6 | Provocation, Régénération [2] | **Kotoko** | Rare |
| **A09** | Forgeron de Kumasi | 3 | 2/3 | — | Cri de Guerre : Sika [2]. Équipe une arme 2/2 à votre héros. | Rare |
| **A10** | Yaa Asantewaa, la Reine-Mère | 4 | 3/4 | — | Cri de Guerre : ramenez à la vie l'unité Ashanti la moins chère de votre Autel avec 1 PV (sans `Spectral`). | Épique |
| **A11** | Okomfo Anokye, le Devin | 5 | 2/4 | Sacré | Cri de Guerre : invoquez **Sika Dwa Kofi (le Trône d'Or)** dans votre Zone de Lieu. | Épique |
| **A12** | Opoku Ware, le Conquérant | 6 | 5/6 | Charge | Cri de Guerre : si vous contrôlez 3+ unités Ashanti, gagnez `Frénésie` ce tour. Coûte 2 Pépites d'Or de moins. | Légendaire |

### 5.1 Carte spéciale invoquée — pas dans le deck

| ID | Nom | Type | Effet | Source |
|---|---|---|---|---|
| **A99** | **Sika Dwa Kofi (Trône d'Or)** | Lieu Sacré | Tant qu'il est en jeu sous votre contrôle, vos unités Ashanti gagnent **+1/+1** (active **Ntam**). Au début de votre tour, vous gagnez 2 PV. Ne peut être détruit ni silencié. | Invoqué uniquement par A11 (Okomfo Anokye). |

### 5.2 Hero card

| ID | Nom | Type | PV | Pouvoir Héroïque | Griot Passif |
|---|---|---|---|---|---|
| **A00** | Osei Tutu | Héros | 30 | « Frappe d'Or » — 2 énergie : +1 Pépite d'Or | « Asante Kotoko » — au début de votre tour, pour chaque unité Ashanti morte le tour précédent (**plafond : 2 jetons par tour**), invoquez un jeton Combattant Ashanti 1/1. |

---

## 6. Justifications de design carte par carte

### A01 — Akwanfo, Éclaireur
*Les éclaireurs (akwanfo) ouvrent la voie de l'armée porc-épic.* 1 mana 2/1 Furtivité = curve d'ouverture standard, identique à un Worgen Patrol-light.

### A02 — Combattant Ashanti
*« Tuez-en un, mille surgiront. »* — doctrine du porc-épic codifiée par Opoku Ware I lors de sa réforme militaire de 1724 (création des unités Akyedan et Abobonkyere). Vanilla 1 mana 1/2, mais à sa mort un jeton 1/1 le remplace. Compense le déficit de stats. **Carte signature de la faction.**

### A03 — Pacte d'Elmina
Allusion à l'alliance commerciale Ashanti-Hollandais à Elmina. Sort 2 mana = pioche 2 + Sika [1]. Power level standard pour une pioche.

### A04 — Lancier Adonten
*Adonten = avant-garde dans la formation porc-épic à cinq corps* (éclaireurs / avant-garde / ailes Nifa-Benkum / arrière-garde Kyidom). Codifiée par la doctrine d'Opoku Ware I. Provocation 2 mana 2/3 = courbe défensive classique.

### A05/A06 — Ailes Nifa & Benkum
*Aile droite et aile gauche, l'enveloppement.* Charge 3 mana 3/3 + Kotoko. Coûteuse mais double valeur (Charge + jeton à la mort). Power level légèrement au-dessus, équilibré par fragilité 3 PV.

### A07 — Tisserand de Kente
*Le kente est un textile sacré ashanti.* 2/2 pour 2 mana avec Sika [2] à la mort = boost économique délayé.

### A08 — Kyidom, Arrière-Garde
*Kyidom = corps d'arrière-garde, créé par Opoku Ware I lors de la réforme militaire de 1724* (avec l'Akyedan et l'Abobonkyere — unité de défense de la capitale Kumasi). Tank par excellence : 2/6 Provocation Régénération [2] + Kotoko. **Cœur défensif de la faction.**

### A09 — Forgeron de Kumasi
Évoque l'industrie d'armement de Kumasi. Combine : Sika [2] (économie) + arme 2/2 (pression) à 3 mana = curve solide.

### A10 — Yaa Asantewaa, la Reine-Mère
*Reine mère d'Ejisu, leader de la dernière grande révolte Ashanti contre les Britanniques — la « Guerre du Siège d'Or » (1900-1901), qui marqua la fin de l'indépendance de la Confédération.* Effet : Râle de l'Autel — ramène une unité **sans Spectral** (donc permanente), mais à 1 PV = vulnérable. Récompense le sacrifice tactique. La citation historique : *« Si vous, hommes d'Ashanti, ne voulez pas avancer, alors nous, les femmes, le ferons. »*

### A11 — Okomfo Anokye, le Devin
*Prêtre traditionnel rencontré par Osei Tutu pendant son exil à Akwamu, devenu son grand conseiller. Il invoqua le **Sika Dwa Kofi** descendu du ciel un vendredi en 1701, fusionnant les sièges rectangulaires et circulaires Akans, et le revêtit de feuilles d'or pour qu'il « boive » le sang des sacrifices fondateurs.* Effet narratif fort : invoquer le Trône. Sacré pour qu'il ne soit pas trivialement remové. **Pivot stratégique de la faction.**

### A12 — Opoku Ware, le Conquérant
*Deuxième Asantehene (règne 1718-1760), grand stratège militaire qui réalisa le projet d'« État fondé sur la guerre ». En 42 ans de règne, il soumit sept royaumes : Bono-Manso (1722), Gyaaman (1724), Dagomba (1725), Aowin (1728), Wassa, Akyem-Abuakwa et Akim-Kotoku (1721), et Banda (intégré via l'Aboasa, 1740). Il créa la doctrine du porc-épic et les unités Akyedan/Abobonkyere/Kyidom.* Finisher 6 mana avec coût réductible par Or accumulé. Si tu as 2+ Pépites, il coûte 4 — ce qui le sort tour 5-6 plutôt que 7-8. **Récompense ultime du joueur d'économie.**

---

## 7. Synergies internes (combos signature)

### Combo 1 — La Renaissance perpétuelle
**A02 (Combattant Ashanti)** + **Griot Kotoko du héros** = à la mort du Combattant, le Kotoko de carte invoque un jeton, puis au début du tour suivant le Griot invoque un autre jeton car « une unité est morte le tour précédent ». **Double régénération.**

### Combo 2 — L'Avalanche d'Or
**A07 (Tisserand)** + **A09 (Forgeron)** + **Pouvoir héroïque** sur 3 tours = 5 Pépites d'Or accumulées (max). Permet de jouer **A12 (Opoku Ware)** à coût réduit + 1 énergie bonus par tour pendant 5 tours.

### Combo 3 — Le Trône Inviolable
**A11 (Anokye)** invoque le Trône d'Or → +1/+1 à toutes les unités → relance toutes les **Kotoko** au pouvoir doublé (jetons 2/2 au lieu de 1/1). Devient injouable face à un deck qui ne peut pas le détruire.

### Combo 4 — Le Cri du Porc-épic
**A05 + A06 (deux Ailes Charge + Kotoko)** au même tour = 6 dégâts immédiats + 2 jetons 1/1 quand elles meurent (via Kotoko de carte). **Tour suivant**, le Griot d'Osei Tutu déclenche son cap de **2 jetons supplémentaires** (les deux Ailes mortes = 2 morts comptées, plafond atteint). Bilan : **4 jetons Combattant 1/1 sur le champ** en 2 tours. Si le Trône est en jeu : Ailes 4/4 + 4/4, jetons 2/2 chacun. **C'est le sweet spot du design : sacrifier ses Ailes devient un investissement à rendement explicite.**

---

## 8. Faiblesses & contre-jeu (intentionnel)

Pour rester équilibrée, la faction Ashanti a des faiblesses identifiables :

- **Vulnérable au burn rapide** — la stratégie économique demande du temps. Un deck Zoulou agressif peut conclure avant que le Trône soit en jeu.
- **Aucun removal direct dans la pool de 12** — pas de sort « inflige 5 dégâts ». L'Ashanti contrôle par attrition, pas par retrait.
- **Le Trône est une cible prioritaire** — même Sacré, des effets de zone à hauts dégâts (rituel de Shango par exemple) peuvent le tuer si pas protégé.
- **Trésorerie plafonnée à 5** — empêche l'accumulation indéfinie ; oblige à dépenser ou à perdre.
- **Pas de pioche massive** — un seul A03 dans la pool, et il a déjà coûté 2 mana.

---

## 9. Mapping vers la fiche technique du POC

### 9.1 Modifications à apporter à `cards.json`

Ajouter 12 entrées suivant le schéma `Card` du brief §8.1, avec :

```typescript
faction: 'ashanti'  // nouvelle valeur d'union literal à ajouter
keywords: [...] // ajouter 'kotoko', 'sika', 'sacred' aux Keyword existants
```

### 9.2 Modifications du moteur

Ajouter dans `src/engine/`:

- **`treasury.ts`** — gestion des Pépites d'Or (max 5, conversion 1/tour en énergie)
- Nouvelle action `SPEND_GOLD_NUGGET` dans `GameAction`
- Mise à jour de `keywords.ts` pour gérer `kotoko` (déclenchement à la mort)
- Mise à jour de `keywords.ts` pour gérer `sacred` (immunité au targeting et au silence)
- Mise à jour de `griot.ts` avec le passif d'Osei Tutu
- Mise à jour de `cycle.ts` ou `cards.ts` pour gérer le Lieu Sacré « Trône d'Or »

### 9.3 Modifications de l'UI

- **Trésorerie visible** : afficher 0 à 5 jetons d'or dorés près du compteur d'énergie du joueur Ashanti.
- **Bouton « Convertir en énergie »** : un clic sur la Trésorerie convertit 1 Pépite (limité à 1/tour).
- **Animation Kotoko** : à la mort d'une unité Kotoko, faire surgir un jeton 1/1 avec une animation de jaillissement (épines).

---

## 10. Power Level — vérification d'équilibre

D'après la formule §17 du rulebook (Coût × 2 + 1 = stats vanilla) :

| Carte | Stats | Coût × 2 + 1 | Écart | Effets | Vérification |
|---|---|---|---|---|---|
| A01 | 3 | 3 | 0 | Furtivité (+2) | Léger surplus, OK pour 1 mana |
| A02 | 3 | 3 | 0 | Kotoko (+2) | Légèrement fort, accepté car identité |
| A03 | sort | — | — | +2 cartes + 1 Or | Standard |
| A04 | 5 | 5 | 0 | Provocation (+1) | OK |
| A05/A06 | 6 | 7 | -1 | Charge (+2) + Kotoko (+2) | Légèrement fort, OK pour 3 mana |
| A07 | 4 | 5 | -1 | Sika [2] à la mort (+2) | OK |
| A08 | 8 | 9 | -1 | Provocation + Régé [2] + Kotoko | Très fort mais à 4 mana acceptable |
| A09 | 5 | 7 | -2 | Sika [2] (+2) + arme 2/2 (+3) | OK |
| A10 | 7 | 9 | -2 | Resurrection puissante | OK pour Épique |
| A11 | 6 | 11 | -5 | Sacré (+3) + Trône d'Or (+5) | Légendaire, déficit assumé pour effet de jeu fort |
| A12 | 11 | 13 | -2 | Charge + Frénésie conditionnelle + réduction Or | OK pour Légendaire |

**Bilan :** la faction respecte la formule, avec un léger surplus sur les commons (justifié par l'identité Kotoko) et des Légendaires correctement budgétisés.

---

## 11. Itinéraire d'intégration au projet

### Phase A — Validation design (cette proposition)
- Validation du PO sur l'identité mécanique
- Validation des 3 nouveaux mots-clés
- Validation du roster de 12 cartes

### Phase B — Stabilisation des 2 factions du MVP
**ATTENTION :** la faction Ashanti **N'EST PAS** dans le périmètre du POC actuel (cf. brief §4.1). Elle doit attendre la fin de la Milestone 3 et l'acceptation du POC avant d'être intégrée.

### Phase C — Extension v0.2
- Ajout de la faction Ashanti dans le rulebook (§16.3)
- Ajout des 12 cartes dans `cards.json`
- Implémentation des mécaniques : Trésorerie, Kotoko, Sacré
- Tests unitaires sur les nouveaux comportements
- Playtest 5 parties Ashanti vs Orishas et Ashanti vs Zoulou

---

## 12. Citations à utiliser dans les flavor texts

Tirées directement de la chronologie historique :

> « Asante signifie littéralement *pour la guerre*. »
> « Tuez-en mille, mille autres surgiront. » *— Doctrine du porc-épic, Opoku Ware I, c. 1724*
> « L'Ashanti est l'aiguille, Elmina est le fil. » *— Pacte commercial de 1701*
> « Du ciel descendit le siège, un vendredi. » *— Invocation du Sika Dwa Kofi, Okomfo Anokye, 1701*
> « Un empire bâti sur la guerre, survécu par sa culture. »
> « Si vous, hommes d'Ashanti, ne voulez pas avancer, alors nous, les femmes, le ferons. » *— Yaa Asantewaa, 1900*
> « De l'humiliation à Denkyira naquit la plus grande nation de l'or. » *— sur Osei Tutu, qui fut otage à la cour de Boa Amponsem avant de fonder la Confédération*
> « La tête du gouverneur fut accrochée au grand tambour. » *— sur la victoire de Katamanso (1824) et Sir Charles McCarthy*
> « Ils prirent Kumasi mais le Trône resta caché. » *— sur la Sagrenti War (1873-1874)*
> « Mille surgiront. Et mille encore. Tant qu'un Ashanti respire, l'Asante respire. »

---

## 13. Décisions à valider avec le PO

1. **Conserver le nom « Trône d'Or » en français ou utiliser « Sika Dwa Kofi » en akan ?** Recommandation : double, le nom akan en sous-titre, le français en titre principal.
2. ~~**Le Griot Passif d'Osei Tutu se déclenche-t-il une fois par tour, ou autant de fois qu'il y a eu de morts ?**~~ ✅ **TRANCHÉ par PO :** **plafond de 2 jetons par tour**. Si 1 unité Ashanti est morte → 1 jeton. Si 2+ unités sont mortes → 2 jetons (cap dur). Évite les boucles infernales tout en récompensant les sacrifices multiples (combo Ailes Nifa + Benkum, Cri du Porc-épic).
3. **Le Combattant Ashanti jeton (créé par Kotoko) peut-il avoir lui-même Kotoko ?** **Non**, sinon boucle infinie. Confirmer la règle « les jetons n'ont aucun mot-clé sauf mention explicite ».
4. **La Trésorerie de Pépites d'Or est-elle conservée entre tours ?** **Oui**, c'est le principe de l'accumulation économique.
5. **Quel symbole visuel pour la faction ?** Recommandation : **un porc-épic stylisé** sur fond or-noir-rouge, alignant les patterns kente et adinkra.

---

**Fin du document.**

*Pour discussion entre PO et Lead Engineer avant intégration en v0.2.*
