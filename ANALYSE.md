# Rapport du jour — analyse du classeur Excel

Source : `F:\Rapport du jour\Rapport_du_jour.xlsm` (v7.1), module VBA `ModRapport` (~1 600 lignes, commenté),
exemple d'export `export_25-11-2025.xlsx` (69 réservations).
Contexte : Campanile Nîmes Mas Carbonnel, 81 chambres. Outil utilisé par la réception de nuit.

## 1. Ce que fait l'outil

Chaque nuit, la réception exporte du PMS la liste des chambres occupées. Un import met à jour :

| Sortie | Contenu | Imprimé |
|---|---|---|
| **Rapport** | 7 chiffres clés, listes des impayés, grille de toutes les chambres (3 blocs) | 1 ex., A4 paysage |
| **Femme de chambre** | Plan de l'hôtel, case B (départ) / R (recouche) / HS par chambre + encadré des corrections | 5 ex., A4 paysage |
| **Prépa PDJ** | Quantités de viennoiseries / produits pour le petit déjeuner | 1 ex., A4 portrait |
| **Récap** | Historique, 1 ligne par nuit (valeurs figées) | à la demande |
| **Accueil** | Tableau de bord + boutons | — |

## 2. Données d'entrée (export PMS)

Colonnes repérées **par leur titre** (FR ou EN, ordre libre, comparaison sans accents/espaces/ponctuation) :

| Champ | Titres acceptés | Obligatoire | Traitement |
|---|---|---|---|
| reservation | Réservation | | texte |
| arrivee | Arrivée / Arrival | ✔ | date |
| depart | Départ / Departure | ✔ | date |
| nomClient | Nom client / Guest Name | | |
| nbClients | Total clients / Total Guests | ✔ | nombre |
| categorie | Catégorie de chambre / Room Type | | |
| chambre | Chambre / Room | ✔ | texte 3 chiffres (`"002"`) ; ligne ignorée si vide |
| mealPlan | Meal Plan / Forfait | ✔ | BB, RO, HB2… |
| statut | Statut d'enrg. / CI Status | ✔ | `P` = payé |
| rateCode | Rate Code / Code tarifaire | | |
| canal | Client | | BOOKING.COM, DIRECT GUEST… |
| groupeId | ID Groupe / Group Id | | non vide ⇒ groupe |

Max 300 lignes. Données triées par numéro de chambre.

## 3. Règles métier

**Date du rapport (nuit du)** = arrivée la plus récente (ou aujourd'hui si aucune donnée) ; modifiable à la main.
Le rapport est titré au *lendemain* (« RAPPORT DU MERCREDI 26/11/2025 »).

**Chiffres clés** (N = nuit du rapport) :
- Chambres occupées = nb de lignes avec chambre
- Clients = Σ nbClients
- Départ = chambres avec `depart ≤ N+1` ; Recouches = `depart > N+1`
- Petits déj. (couverts) = Σ nbClients où mealPlan commence par BB, HB ou FB
- Non payées = statut ≠ P et sans groupe ; Groupe non payées = statut ≠ P et avec groupe
- Taux d'occupation = chambres occupées / 81 (couleur : < 50 % rouge, 50–79 % orange, ≥ 80 % vert)

**Grille du rapport** (par chambre) : Ch., Client, Pers., Nuit n° (`N − arrivée + 1`), Départ,
Demain (DÉPART / Recouche), PDJ (Oui), Payé (Oui / NON). Gris foncé = non payée, gris clair = départ.

**Prépa PDJ** — date : import entre 20 h et 23 h 59 ⇒ lendemain ; après minuit ⇒ jour même.
`quantité = ARRONDI.SUP(PDJ/100 × base × coefType × facteur)` ; coefType : loisir 1,25 · mixte 1 · business propre au produit.

| Produit | Base/100 | coef business | facteur | Infos |
|---|---|---|---|---|
| Croissants | 75 | 0,9 | 1 | 12 min, 180 °C |
| Pains au chocolat | 75 | 0,9 | 0,75 | |
| Baguette signature | 30 | 0,4 | 0,75 | 10 min, 220 °C |
| Pain muesli | 4 | 0,75 | 0,75 | 17 min, 180 °C |
| Pavé rustique | 4 | 0,75 | 0,75 | |
| Cake | 4 | 0,75 | 0,75 | décongeler 24 h avant |
| Brioche pur beurre | 4 | 0,75 | 0,75 | |
| Jambon (plats de 10 demi-tranches) | 1 | 0,75 | 1 | |
| Fromage (plats de 10 tranches) | 1 | 0,75 | 1 | |
| Jus d'orange (carafe Evento) | 1 | 0,75 | 1 | |
| Jus de pomme | 1 | 0,75 | 1 | |
| Mini-crêpes | 75 | 0,6 | 0,7 | sous cloche |
| Pain de mie | 1 | 1,5 | 2 | sur ardoise |

Nombre de PDJ et type de clientèle modifiables ; colonne « complément pour 8 h » saisie à la main.

**Feuille femme de chambre** — plan fixe (6 colonnes × 17 chambres, cases noires = à ignorer).
Chambre présente dans l'export : `depart ≤ N+1` ⇒ **B**, sinon **R**. Absente : on efface un ancien B/R
mais on garde les codes manuels (BR, HS, NV). Double-clic : vide → B → R → HS → vide.
Corrections mémorisées par nuit (B / R / HS / X = retirée), réappliquées si on réimporte la même nuit,
oubliées la nuit suivante, listées dans l'encadré « CORRECTIONS DU JOUR » (À BLANC / RECOUCHE / HORS SERVICE / NO SHOW).

**Modifications manuelles du rapport** (par nuit, réversibles, réappliquées au réimport) :
- Payé : non payée → payée (statut ← P)
- Demain : départ ↔ recouche (départ ← N+2 ou N+1)
- PDJ : ajout uniquement (mealPlan ← BB)
- Une modif devenue inutile au réimport (déjà payée…) est supprimée. Listées sous la grille.

**Récap** : 1 ligne par nuit (date, jour FR, chambres, clients, départs, recouches, PDJ, taux) ;
upsert par date, tri chronologique.

**Divers** : sauvegarde datée après chaque import, remise à zéro protégée par mot de passe,
impression groupée (rapport ×1, femme de chambre ×5, PDJ ×1), feuille femme de chambre vierge, export PDF
`Rapport_AAAA-MM-JJ.pdf`.

## 4. Limites actuelles (raisons de migrer)

- Logique répartie entre formules de cellules et VBA, état stocké dans des colonnes masquées (U:W, AA:AD).
- Capacité codée en dur (81 chambres, 3 × 27 lignes, 300 réservations, 200 corrections).
- Historique dans le fichier lui-même : une copie sur un autre poste = journées perdues.
- Dépend des macros activées, différences PC/Mac (aperçu, sélection de fichier).
- Mot de passe en clair dans le code (`1234`).
- Pas de tests automatisés.

## 5. Modèle de données cible

```
Reservation  { id, arrivee, depart, nomClient, nbClients, categorie, chambre, mealPlan, statut, rateCode, canal, groupeId }
Nuit         { date, importeLe, fichier, reservations[], modifsRapport[], correctionsFdc[], pdj{nombre, type, complements} }
ModifRapport { chambre, type: PAYE|RECOUCHE|DEPART|PDJ, valeurOrigine }
CorrectionFdc{ chambre, action: B|R|HS|X }
RecapJour    { date, chambres, clients, departs, recouches, pdj, taux }
Config       { hotel, nbChambres, planFemmeDeChambre (grille + cases noires), produitsPdj[], nbExemplaires }
```

Calculs = fonctions pures `(reservations, nuit, config) → chiffres / grille / quantités`,
testables avec l'export d'exemple (attendu au 25/11/2025 : 69 chambres, 83 clients, 40 départs, 29 recouches, 55 PDJ, 85 %).
