# Ashanti — Extension v0.3 « L'Empire de l'Or »

> Extension narrative et mécanique de la faction Ashanti, ajoutant **10 cartes** (4 Communes / 3 Rares / 2 Épiques / 1 Légendaire) tirées directement de la chronologie historique 1689-1948.
>
> **Statut :** proposition de design, à valider par le PO avant intégration en v0.3
> **Pré-requis :** Milestone 3 du POC validée + faction Ashanti v0.2 livrée et testée
> **Sources :** `Ashanti_Faction_Design.md` v0.2 + `Ashanti_Lore.md` v0.1
> **Auteur :** Yans (Product Owner) avec recherche assistée
> **Numérotation :** A13 → A22, plus A98 (lieu sacré secondaire)

---

## 1. Vision de l'extension

### 1.1 Objectif narratif

Couvrir les **5 ères** de l'histoire Ashanti que l'extension v0.2 ne touchait pas :

| Ère | Couverture v0.2 | Apport v0.3 |
|---|---|---|
| I — Origines (avant 1689) | aucune | **Obiri Yeboah** |
| II — Fondation (1701) | A11 Anokye, A12 Opoku Ware | **Abla Pokou** (schisme) |
| III — Apogée (1718-1760) | A04, A05, A06, A08, A12 | **Owusu Sekyere** (kontihene) |
| IV — Résistance (1824-1901) | A10 Yaa Asantewaa | **Osei Bonsu Panin**, **Katamanso**, **Adinkra**, **Yaa Légendaire** |
| V — Renaissance (1901-1948) | aucune | **Agyeman Prempeh** + **Sika Dwa Kofi (Forme Cachée)** |

### 1.2 Objectif mécanique

L'extension introduit **3 nouvelles dynamiques** sans casser la pool de mots-clés existante :

1. **Sacrifice / Vengeance** — pour modéliser les morts tragiques (Obiri Yeboah, Yaa Asantewaa)
2. **Schisme / Émigration** — exiler ses propres unités pour invoquer des jetons puissants (Abla Pokou)
3. **Trophée colonial** — convertir les morts adverses en bonus (Charles McCarthy, Bataille de Katamanso)

Ces trois dynamiques **n'ajoutent qu'un seul nouveau mot-clé** : `EXIL` (déjà utilisé pour les jetons en règle générale, désormais activable).

---

## 2. Nouveau mot-clé

### `EXIL [X]` — Exiler une unité de votre champ
**Définition :** Retirez X unité(s) Ashanti de votre champ de bataille (au choix du joueur, sauf unités `Sacré`). Ces unités vont **directement à l'Autel des Ancêtres** sans passer par la défausse, et leur effet « à la mort » ne se déclenche pas (l'exil n'est pas une mort).

**Pourquoi c'est élégant :** crée un coût stratégique réel (perdre des unités vivantes) sans déclencher les Kotoko en boucle. L'exil est différent de la mort.

---

## 3. Liste des 10 cartes — Extension « L'Empire de l'Or »

| ID | Nom | Coût | Att/PV | Mots-clés | Effet | Rareté |
|---|---|---|---|---|---|---|
| **A13** | Obiri Yeboah, l'Oncle Décapité | 3 | 3/2 | — | Râle : votre héros gagne le pouvoir alternatif « Vengeance d'Obiri » (3 énergie : 2 dégâts + 1 Pépite d'Or) jusqu'à la fin de la partie. | Rare |
| **A14** | Boa Amponsem, Roi du Denkyira | 4 | 4/4 | — | Cri de Guerre : l'adversaire pioche 1 carte. Râle : récupérez 2 Pépites d'Or et invoquez 1 Combattant Ashanti 1/1. *(L'humiliation devient or.)* | Commune |
| **A15** | Abla Pokou, Reine du Schisme | 5 | 3/4 | — | Cri de Guerre : `Exil [1]` — exilez 1 unité Ashanti de votre champ. Invoquez 3 jetons « Émigré Baoulé » 2/2 sur des slots libres. | Épique |
| **A16** | Owusu Sekyere, le Kontihene | 4 | 3/4 | — | Cri de Guerre : vos unités Ashanti gagnent **Charge** ce tour. Si vous contrôlez les 5 corps de l'armée (Akwanfo, Adonten, Nifa, Benkum, Kyidom), gagnez aussi `Frénésie` ce tour. | Épique |
| **A17** | Osei Bonsu Panin, l'Asantehene-Baleine | 7 | 6/6 | Charge | Cri de Guerre : si l'adversaire contrôle un héros allié européen (faction *Coloniale* en v0.4+), infligez 5 dégâts au héros adverse. Sinon, infligez 3. | Légendaire |
| **A18** | Bataille de Katamanso | 5 | sort | — | Sort : infligez 3 dégâts à toutes les unités adverses. Pour chaque unité tuée, gagnez 1 Pépite d'Or (max 5). | Rare |
| **A19** | Adinkra du Gyaaman, le Rival Doré | 5 | 4/5 | — | Cri de Guerre : si vous contrôlez **Sika Dwa Kofi (A99)**, détruisez-le. Une unité Ashanti gagne +5/+5 et `Charge` ce tour. *(Le rival qui défie le Trône.)* | Rare |
| **A20** | Agyeman Prempeh, l'Exilé qui Revient | 6 | 4/5 | — | Cri de Guerre : si votre Autel contient 5+ unités Ashanti, ramenez-les toutes en main avec leur coût réduit de 1. *(« Sankofa : retourne et prends. »)* | Épique |
| **A21** | Yaa Asantewaa, le Dernier Cri (Légendaire) | 6 | 4/5 | — | Râle : si votre héros est à 5 PV ou moins au moment de sa mort, vos unités Ashanti **vivantes et à venir** gagnent +3/+3 jusqu'à la fin de la partie. **Ne peut être ramenée par A10.** | Légendaire |
| **A22** | Akwanfo Akyere, l'Éclaireur Sacrifié | 1 | 2/1 | Furtivité, **Kotoko** | À la mort, en plus du Kotoko standard, gagnez 1 Pépite d'Or. | Commune |

### 3.1 Lieu sacré secondaire

| ID | Nom | Type | Effet | Source |
|---|---|---|---|---|
| **A98** | **Sika Dwa Kofi (Forme Cachée)** | Lieu Sacré | Si **A99 (Trône d'Or)** est détruit, A98 entre en jeu automatiquement à votre prochain tour à votre place de Lieu (1 PV, sans bonus +1/+1 mais maintient les effets passifs de **Ntam**). Représente le Trône caché aux Britanniques pendant la Sagrenti War (1873-1874). | Effet déclenché par destruction d'A99. |

### 3.2 Tokens nouveaux invoqués

| Token | Stats | Mots-clés | Source |
|---|---|---|---|
| Émigré Baoulé | 2/2 | — | Invoqué par A15 (Abla Pokou) |
| Combattant Ashanti | 1/1 | — | Invoqué par Kotoko (déjà existant) |

---

## 4. Justifications de design carte par carte

### A13 — Obiri Yeboah, l'Oncle Décapité
**Référence historique :** Oncle maternel d'Osei Tutu, prédécesseur à Kwaman, décapité lors d'un affrontement avec les futurs Gyamans (avant 1689). Sa mort est le déclencheur de la quête confédérale d'Osei Tutu.

**Design :** 3 mana 3/2 = stats vanilla légèrement faibles (5 vs 7), compensées par un effet Râle puissant qui modifie le pouvoir héroïque pour le reste de la partie. Crée une décision stratégique — le joueur doit *vouloir* sacrifier Obiri pour activer la Vengeance.

**Power level :** -2 sur les stats, +5 sur l'effet (changement permanent de pouvoir héroïque). Acceptable pour Rare.

### A14 — Boa Amponsem, Roi du Denkyira
**Référence historique :** Roi du Denkyira sous lequel Osei Tutu fut otage. Symbole de l'humiliation initiale.

**Design :** 4 mana 4/4 = vanilla parfait (Coût × 2 = 8). Effets en miroir : un *coût* (l'adversaire pioche) et une *récompense différée* (à la mort, +2 Or + 1 jeton). Modélise « l'humiliation devient or ». Carte d'identité narrative qui parle aux joueurs ashanti expérimentés.

**Power level :** stats neutres, effets équilibrés (-1 carte adverse vs +2 Or + 1 jeton). OK pour Commune.

### A15 — Abla Pokou, Reine du Schisme
**Référence historique :** Princesse Ashanti, refusa Opoku Ware en 1718, fonda le peuple Baoulé après le sacrifice de son fils dans le Comoé. *« Ba ouli »* — *« l'enfant est mort »*.

**Design :** 5 mana 3/4 + effet d'**Exil** : transforme 1 unité en 3 jetons 2/2. Échange net positif (1 → 3) mais perte d'une unité potentiellement clé. Crée des combos avec A02 (perdu = pas de Kotoko déclenché, mais 3 Émigrés à la place) ou A22 (échange un éclaireur 2/1 contre 3 fantassins 2/2).

**Power level :** stats 7 vs 11 attendus = -4, mais l'effet vaut largement +6 (3 unités 2/2 = 12 stats). OK pour Épique.

### A16 — Owusu Sekyere, le Kontihene
**Référence historique :** *Kontihene* (chef d'état-major) d'Asante-Mampong sous Opoku Ware. Mena la conquête du Gyaaman en 1724.

**Design :** 4 mana 3/4 + Charge à toute la faction = un Bloodlust ciblé. Le bonus conditionnel (« 5 corps de l'armée ») est une condition Hearthstone-like difficile à remplir, qui récompense un deck mono-ashanti structuré, et débloque `Frénésie` pour finir un héros à 10-15 PV. **Carte signature de l'archétype « formation à 5 corps ».**

**Power level :** stats 7 vs 9 = -2, effet base = +3 (Charge faction), conditionnel = +5 (Frénésie). Dans la zone Épique acceptable.

### A17 — Osei Bonsu Panin, l'Asantehene-Baleine
**Référence historique :** *« Bonsu »* = la baleine. Asantehene de la victoire de Katamanso (1824), considéré comme le 3e plus vénéré après Osei Tutu et Opoku Ware.

**Design :** 7 mana 6/6 Charge = finisher de courbe haute. L'effet conditionnel (« faction Coloniale ») est un **hook narratif** pour l'extension v0.4 (la faction des envahisseurs européens). En attendant v0.4, l'effet par défaut (3 dégâts au héros) reste solide. **Légendaire qui anticipe l'arc narratif futur.**

**Power level :** stats 12 vs 15 = -3, effet base = +3, effet conditionnel = +5. Légendaire bien budgétée.

### A18 — Bataille de Katamanso
**Référence historique :** 1824. Décapitation de Sir Charles McCarthy. La tête accrochée au tambour royal.

**Design :** Sort 5 mana = 3 dégâts à tout l'adverse + génération d'or. C'est un **Consecration combiné à un Coin shaman**. Le double avantage (board clear + économie) le justifie à 5 mana. Synergie évidente avec A12 Opoku Ware (qui a besoin d'or pour son coût réduit).

**Power level :** dégâts 3-en-AoE = 4 mana habituel + génération d'or = 1 mana. Total 5 mana. OK pour Rare.

### A19 — Adinkra du Gyaaman, le Rival Doré
**Référence historique :** Roi du Gyaaman qui osa fabriquer un siège d'apparat en or massif rivalisant avec le Sika Dwa Kofi (1818). Provocation absolue.

**Design :** 5 mana 4/5 (vanilla 11 OK) avec un effet auto-destructeur conditionnel : sacrifier le Trône (notre Lieu Sacré clé) pour donner +5/+5 + Charge à une unité = 14 stats burst sur 1 cible. **Carte de finition désespérée**, à jouer quand l'adversaire est à portée de la mort. Crée des décisions agonisantes.

**Power level :** stats neutres, effet conditionnel très puissant mais auto-destructeur (perdre le Trône = perdre tous les bonus +1/+1 et la régénération 2 PV/tour). Équilibré.

### A20 — Agyeman Prempeh, l'Exilé qui Revient
**Référence historique :** Asantehene exilé aux Seychelles en 1896, revenu en 1924, restauration de la Confédération en 1935. Mort en 1948. Le Sankofa en personne.

**Design :** 6 mana 4/5 (vanilla 13 → 9, -4) avec un effet de récupération massive : ramener tout son Autel en main avec coût -1. Si l'Autel est plein (5+), c'est un game-winning effect de fin de partie. **Récompense ultime du joueur de contrôle** qui a su perdre pour gagner.

**Power level :** stats déficitaires (-4) compensées par un effet à très haute valeur (5+ unités ramenées en main avec -1 coût = +20 stats potentielles + tempo). Épique justifiée.

### A21 — Yaa Asantewaa, le Dernier Cri (Légendaire)
**Référence historique :** Variante Légendaire de A10 (Rare). Représente le moment où Yaa, à 60 ans passés, défia les hommes hésitants et lança la guerre de 1900-1901.

**Design :** 6 mana 4/5 avec un effet Râle conditionnel **massif** : si le joueur est à 5 PV ou moins au moment de la mort de Yaa, toutes les unités Ashanti (champ + main + futur) gagnent +3/+3 permanent. C'est le **come-back ultime** : récompense le joueur dos au mur.

**Restriction importante :** *Ne peut être ramenée par A10.* Empêche la boucle Yaa Asantewaa Rare ramène Yaa Asantewaa Légendaire ramène Yaa Asantewaa Rare etc.

**Power level :** stats 9 vs 13 = -4, effet conditionnel devastateur (+3/+3 permanent à toute la faction). Légendaire.

### A22 — Akwanfo Akyere, l'Éclaireur Sacrifié
**Référence historique :** *Akyere* = sacrifice rituel. Référence aux éclaireurs qui ouvraient la voie en sachant qu'ils seraient les premiers à mourir.

**Design :** 1 mana 2/1 Furtivité Kotoko + 1 Pépite d'Or à la mort = compagnon idéal du Combattant Ashanti A02. Crée la **carte 1-coût optimale** pour les ouvertures économie pure.

**Power level :** stats 3 vs 3 = neutre, Furtivité (+1) + Kotoko (+2) + Sika [1] à la mort (+1) = +4. C'est légèrement fort à 1 mana, mais l'effet économique est délayé (il faut qu'il meure pour activer). OK pour Commune. **À surveiller en playtest.**

---

## 5. Synergies internes nouvelles (extension)

### Combo 5 — La Vengeance d'Obiri
**A13 (Obiri Yeboah)** + **A18 (Katamanso)** : poser Obiri à 3 mana, le faire tuer, déclencher Vengeance d'Obiri (pouvoir héroïque 3 énergie = 2 dégâts + 1 Pépite). Combiné avec Katamanso à 5 mana qui génère 1-3 Pépites supplémentaires, le joueur active les 5 Pépites max en 2-3 tours et débloque A12 Opoku Ware à coût réduit.

### Combo 6 — Le Schisme Bénéfique
**A15 (Abla Pokou)** + **A02 (Combattant Ashanti)** : Pokou exile le Combattant (qui ne déclenche PAS son Kotoko car exil ≠ mort), invoque 3 Émigrés Baoulé 2/2. Le Combattant est mis à l'Autel pour réinvocation future via A10 ou A20.

### Combo 7 — Le Comeback Yaa
**A21 (Yaa Légendaire)** + **A19 (Adinkra)** : à 5 PV, le joueur sacrifie son Trône via Adinkra pour donner +5/+5 + Charge à Yaa, qui frappe le héros adverse, meurt, et déclenche son Râle qui transforme toutes les unités vivantes et à venir en monstres +3/+3. **Comeback ultime.**

### Combo 8 — Le Sankofa Total
**A20 (Prempeh)** dans un deck construit pour mourir : 8-10 unités Ashanti ont rejoint l'Autel au tour 8. Prempeh ramène 5 d'entre elles en main avec coût -1, ce qui les fait toutes tomber dans la zone 1-3 mana → les rejouer en 1-2 tours = 10-15 stats sur le board d'un coup.

### Combo 9 — La Bataille à 5 Corps
**A04 + A05 + A06 + A08 + (A01 ou A22)** sur le board → A16 (Sekyere) débloque Charge + Frénésie. Burst potentiel de 15-20 dégâts en 1 tour.

---

## 6. Faiblesses & contre-jeu (intentionnel)

L'extension renforce la faction sans la rendre cassée :

- **Beaucoup de cartes conditionnelles** (A17, A19, A20, A21) qui demandent un setup. Vulnérable au rush qui ne laisse pas le temps de l'orchestrer.
- **A19 (Adinkra) auto-détruit le Trône** : trade-off réel entre burst et résilience.
- **A21 (Yaa Légendaire) demande d'être à 5 PV** : carte morte si le joueur reste en bonne santé.
- **A18 (Katamanso) est un AoE faible (3 dégâts)** : ne nettoie pas les unités à 4+ PV.
- **A15 (Pokou) sacrifie une unité vivante** : coût réel, pas de free value.

---

## 7. Mapping technique vers le moteur

### 7.1 Modifications à apporter à `cards.json`

Ajouter 11 entrées (A13-A22 + A98) suivant le schéma `Card`. Nouveaux flags requis :

```typescript
// Ajouts à src/engine/types.ts
type Keyword =
  | 'taunt' | 'charge' | 'rush' | 'stealth' | 'divineShield'
  | 'spectral' | 'sacred' | 'kotoko' | 'sika'
  | 'exile';  // NOUVEAU en v0.3

type EffectTrigger =
  | 'battleCry' | 'deathRattle' | 'onTurnStart' | 'passive'
  | 'onAltarReturn'  // déjà existant
  | 'onTreasuryFull';  // NOUVEAU pour combos économiques v0.3+
```

### 7.2 Nouvelles actions du moteur

```typescript
type GameAction =
  | // ... actions existantes
  | { type: 'EXILE_UNIT'; unitId: string; ownerId: PlayerId }
  | { type: 'SUMMON_ALT_HERO_POWER'; heroId: PlayerId; newPower: HeroPower }
```

### 7.3 Modifications du DSL d'effets

```typescript
// Ajouter au EffectResolver
exile: (count: number, faction: Faction) => GameStateMutation
swapHeroPower: (newPowerId: string) => GameStateMutation
returnAltarToHand: (count: number, costReduction: number) => GameStateMutation
```

### 7.4 Modifications de l'UI

- **Animation Exil** : unité qui s'efface en spirale dorée (différente de la mort)
- **Indicateur Pouvoir Héroïque modifié** : icône surimprimée quand A13 a déclenché Vengeance d'Obiri
- **Compteur 5 corps** : visible dans le HUD quand un Ashanti contrôle 1+ unité de chaque corps
- **Animation Yaa Légendaire** : effet d'aura permanente dorée sur toute la faction si Râle activé

---

## 8. Power Level — vérification d'équilibre extension

| Carte | Stats | Coût × 2 + 1 | Écart | Effets | Vérification |
|---|---|---|---|---|---|
| A13 | 5 | 7 | -2 | Modif PH permanent (+5) | OK Rare |
| A14 | 8 | 9 | -1 | Pioche adv (-1) + 2 Or + 1 jeton (+4) | OK Commune |
| A15 | 7 | 11 | -4 | Exil (-2) + 3 jetons 2/2 (+12) | OK Épique, +6 net |
| A16 | 7 | 9 | -2 | Charge faction (+3) + condi Frénésie (+5) | OK Épique |
| A17 | 12 | 15 | -3 | Charge (+2) + 3 dégâts héros (+3) + condi 5 dégâts | OK Légendaire |
| A18 | sort | — | — | AoE 3 (+4 mana) + 1-3 Or | OK Rare |
| A19 | 9 | 11 | -2 | Auto-destruction Trône (-3) + condi +5/+5 Charge (+8) | OK Rare |
| A20 | 9 | 13 | -4 | Récupération Autel x5 -1 coût (+15-20) | OK Épique |
| A21 | 9 | 13 | -4 | Râle conditionnel +3/+3 perm faction (+15) | OK Légendaire |
| A22 | 3 | 3 | 0 | Furtivité (+1) + Kotoko (+2) + Sika [1] (+1) | À surveiller, frontière |

**Bilan :** la faction reste cohérente avec la formule, les Légendaires sont correctement budgétisées, les conditionnels sont assez restrictifs pour ne pas devenir des automatismes.

---

## 9. Itinéraire d'intégration

### Phase A — Validation design (cette proposition)
- ☐ Validation du PO sur les 10 cartes
- ☐ Validation du nouveau mot-clé `EXIL`
- ☐ Validation de l'introduction du Lieu Sacré secondaire A98

### Phase B — Implémentation v0.3
- Ajout des cartes dans `cards.json`
- Implémentation du mot-clé `exile` dans `keywords.ts`
- Implémentation des nouveaux triggers d'effets dans le DSL
- Tests unitaires sur les nouvelles mécaniques (couverture ≥ 70%)

### Phase C — Playtest dédié
- 10 parties Ashanti v0.3 vs Orishas
- 10 parties Ashanti v0.3 vs Zoulou
- 5 parties Ashanti v0.3 mirror
- Métriques cibles : taux de victoire 45-55% par matchup, durée moyenne 10-13 min

### Phase D — Préparation v0.4
- L'effet conditionnel d'A17 (Osei Bonsu Panin) anticipe l'introduction de la **faction Coloniale** en v0.4
- A20 (Prempeh) anticipe une mécanique d'Autel étendu
- A98 (Trône caché) ouvre la voie à des Lieux Sacrés multiples

---

## 10. Questions ouvertes pour le PO

1. **Pouvoir héroïque alternatif d'A13 (Vengeance d'Obiri)** : doit-il *remplacer* le pouvoir de base « Frappe d'Or », ou *coexister* (le joueur choisit chaque tour) ? Recommandation : remplacement, pour clarté UI.
2. **A15 (Abla Pokou)** : les 3 jetons Émigré Baoulé sont-ils de faction Ashanti ou Baoulé ? **Recommandation** : faction Baoulé (pas de bonus Ntam), pour rester fidèle au lore du schisme. Cela ouvre une potentielle **mini-faction Baoulé en v0.5**.
3. **A21 (Yaa Légendaire) et A10 (Yaa Rare)** dans le même deck : autorisé ? **Recommandation** : non, la règle Légendaire-unique standard s'applique → si A10 est dans le deck, A21 ne peut pas y être, et inversement. Choix de build.
4. **A98 (Trône Caché) dans la zone de Lieu** : doit-il prendre 1 slot de Lieu (s'il y en a plusieurs en v0.4+) ou apparaître en superposition ? Recommandation : remplace A99 dans le slot actif.
5. **Faction Coloniale v0.4** : faut-il commencer à designer la faction adverse maintenant pour cohérence narrative, ou attendre la stabilisation de v0.3 ?

---

## 11. Ouverture vers v0.4 — La Faction Coloniale

Avec A17 (Osei Bonsu Panin), A18 (Katamanso) et A19 (Adinkra), l'extension v0.3 plante les graines d'une **4e faction** pour v0.4 :

> **Faction Coloniale** — *« Empire and Iron »*
> - Identité : artillerie + traités + corruption économique
> - Personnages : Sir Charles McCarthy (déjà mort dans le lore !), Hodgson, Wolseley
> - Mécanique signature : les **« Traités »** (sorts qui obligent l'adversaire à choisir entre deux maux), la **« Roquette »** (dégâts à zone fixe ignorant Provocation)
> - Faiblesse : aucune synergie native avec les Ancêtres (les colons ne respectent pas les morts du joueur ashanti, mécaniquement)

À approfondir séparément si validé.

---

## 12. Citations à utiliser dans les flavor texts (extension)

Tirées directement de la timeline historique :

> « De l'humiliation à Denkyira naquit la plus grande nation. » — *sur A14, Boa Amponsem*
> « Ba ouli — l'enfant est mort. » — *sur A15, Abla Pokou*
> « Cinq corps, une seule colère. » — *sur A16, Owusu Sekyere*
> « La baleine dévore les océans. » — *sur A17, Osei Bonsu Panin*
> « Sa tête sur le tambour, et le tambour battit pendant cent ans. » — *sur A18, Katamanso*
> « Mon trône vaut plus que le tien. » — *sur A19, Adinkra du Gyaaman*
> « Sankofa : retourne et prends. » — *sur A20, Agyeman Prempeh*
> « Si vous, hommes, ne voulez pas avancer, alors nous, les femmes, le ferons. » — *sur A21, Yaa Asantewaa*
> « Caché du roi blanc, gardé par le sunsum. » — *sur A98, Sika Dwa Kofi (Forme Cachée)*

---

**Fin du document.**

*Pour discussion entre PO et Lead Engineer avant intégration en v0.3. À implémenter après stabilisation de la faction Ashanti v0.2 et clôture de la Milestone 3 du POC.*
