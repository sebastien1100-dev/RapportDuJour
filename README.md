# Rapport du jour — version web

Reprise du classeur Excel `Rapport_du_jour.xlsm` (v7.1) en **application web hors ligne**.
Rien à installer, aucune connexion Internet ni macro nécessaire. Fonctionne sur PC et Mac
(Chrome, Edge, Firefox ou Safari récents).

## Utilisation

1. Double-cliquer sur **`index.html`** (ou faire un raccourci vers ce fichier sur le bureau).
2. **Importer le rapport du jour** : choisir l'export du logiciel hôtelier (.xlsx ou .csv), ou le glisser dans la fenêtre.
3. Le rapport, la feuille de chambre, la cuisson PDJ et l'historique se mettent à jour et sont enregistrés automatiquement.
4. Imprimer depuis chaque onglet, ou toutes les feuilles de la nuit d'un clic sur le bandeau **Impressions de la nuit** de l'accueil
   (par défaut rapport ×1, feuille de chambre ×5, cuisson PDJ ×1 ; feuilles et exemplaires au choix dans Réglages).
   Pour un PDF, choisir l'imprimante « Enregistrer au format PDF ».

Corrections à la main, comme dans Excel :
- **Rapport** : double-clic sur *Statut* (départ ↔ recouche), *PDJ* (ajout) ou *Payé*.
- **Feuille de chambre** : double-clic sur la case d'une chambre : vide → B → R → BR (blanc recouche) → HS → vide ; double-clic sur *NV*.
- **Plan de chambre** : double-clic sur une chambre libre : libre → sale (B) → hors service (HS) → libre, reporté sur la feuille de chambre.
- **Ajouter une chambre** (onglet Rapport) : pour une chambre absente de l'import (arrivée après l'export).
  Elle compte partout ; double-clic sur sa ligne pour la modifier ou la retirer. Si elle apparaît dans
  un nouvel import, c'est l'import qui l'emporte.
- Les corrections valent pour la nuit en cours, restent si l'on réimporte le même fichier et sont oubliées la nuit suivante.

Affichage : les feuilles s'adaptent à la fenêtre (choix « Affichage » dans la barre d'outils :
ajuster, toute la largeur ou 100 %). Testé en 1440 × 900 (MacBook Air), 1920 × 1080 et 3440 × 1440.

## Où sont les données ?

Dans le navigateur, sur ce poste (stockage local). Conséquences :
- toujours ouvrir l'application **sur le même poste, avec le même navigateur** ;
- vider les données de navigation du navigateur efface l'historique ;
- **Réglages → Télécharger une sauvegarde** crée un fichier `.json` à garder (clé USB, dossier partagé).
  **Restaurer une sauvegarde** permet de reprendre sur un autre poste. L'accueil rappelle de le faire
  si la dernière sauvegarde date de plus de 7 jours.
- **Sauvegarde hebdomadaire automatique** (case à cocher dans Réglages, décochée par défaut) : à l'ouverture,
  une sauvegarde est téléchargée si la dernière date de 7 jours ou plus.

## Différences avec le classeur Excel

| Excel | Web |
|---|---|
| Macros à activer, différences PC/Mac | Aucune macro ; même comportement partout |
| Grille du rapport limitée à 81 chambres | Pas de limite (lignes réduites pour tenir sur 1 page) |
| Copie `.xlsm` dans *Sauvegardes* à chaque import | Sauvegarde `.json` téléchargée à la demande |
| Mot de passe `1234` pour tout supprimer | Confirmation en tapant SUPPRIMER + sauvegarde automatique avant |
| Codes NV conservés d'un jour à l'autre | NV propres à chaque nuit |
| Export PDF par bouton | Impression → « Enregistrer au format PDF » |
| — | Export de l'historique en .csv pour Excel |
| — | Alerte si une chambre de l'export n'est pas sur la feuille de chambre |

**Source de la réservation** : la colonne *Client* de l'export (DIRECT GUEST, BOOKING.COM, EXPEDIA…) est
reconnue dans `js/config.js` (`sourcesReservation`). Une nouvelle source s'y ajoute en une ligne ;
en attendant, elle apparaît dans « Autre » avec son nom d'origine.

**Rapport des soldes** (menu *Importer ▾*) : second export avec une colonne de montant (*Solde*, *Montant dû*,
*Reste à payer*, *Balance*…) et une colonne *Chambre* ou *Réservation*. Les montants sont reportés sur les
départs non payés de la nuit en cours.

**Montant dû** : si l'export contient une colonne *Solde* (ou *Montant dû*, *Reste à payer*, *Balance*),
le montant s'affiche à côté de chaque chambre individuelle non payée **qui part le jour du rapport**, dans l'encadré
« À encaisser ». Les autres non payées sont listées dessous, sans montant.
Sans cette colonne, une case est laissée pour l'écrire à la main. Les groupes n'ont pas de montant par chambre.

Les fichiers `.xls` (ancien format) ne sont pas lus : exporter en `.xlsx` ou `.csv`.

## Organisation du code

```
index.html            page unique
css/app.css           écrans + mise en page d'impression (A4, en mm)
img/logo-campanile.png  logo de l'en-tête (remplacer ce fichier pour changer le logo)
js/config.js          hôtel : plan de la feuille de chambre (sert aussi au Plan de chambre), produits PDJ  ← à modifier ici
js/changelog.js       historique des versions (onglet Change log) ← ajouter une entrée à chaque modification
js/xlsx-reader.js     lecture .xlsx / .csv sans bibliothèque (zip + XML natifs du navigateur)
js/calculs.js         règles métier (fonctions pures, testées)
js/store.js           stockage local + sauvegarde/restauration .json
js/vues.js            HTML des écrans et des feuilles imprimables
js/app.js             état, événements, impression
tests/tests.html      90 tests, dont l'export réel du 25/11/2025
outils/serveur.ps1    petit serveur local (développement et tests uniquement)
ANALYSE.md            analyse du classeur d'origine et règles métier
```

## Tests

```bash
powershell -ExecutionPolicy Bypass -File outils\serveur.ps1
```

Puis ouvrir http://localhost:8765/tests/tests.html. Les chiffres de l'export du 25/11/2025 doivent
correspondre au récap Excel : 69 chambres, 83 clients, 40 départs, 29 recouches, 55 PDJ, 85 %.

L'export de test (`tests/fixtures/export_25-11-2025.xlsx`) contient les noms des clients : il n'est **pas**
dans le dépôt GitHub (voir `.gitignore`). Sans lui, seuls les tests qui n'en ont pas besoin passent ; pour
tout lancer, copier un export réel sous ce nom dans `tests/fixtures/`.
