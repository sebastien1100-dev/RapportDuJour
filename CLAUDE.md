# Rapport du jour — consignes pour Claude Code

Application web **hors ligne** de la réception de nuit du Campanile Nîmes Mas Carbonnel (81 chambres),
qui remplace le classeur Excel `Rapport_du_jour.xlsm` (v7.1). Utilisée sur PC Windows et sur MacBook Air,
dans le navigateur (double-clic sur `index.html`). Toute la conversation avec l'utilisateur se fait **en français**.

## Contraintes techniques (ne pas changer)
- JavaScript pur, scripts `<script>` classiques (pas de modules ES, pas de build, pas de CDN) : l'appli doit
  marcher en `file://`, sans Internet.
- Pas de Python ni de Node sur le poste Windows. Outils disponibles : PowerShell, le navigateur.
- Données dans le `localStorage` du navigateur (clé `rapportDuJour.v1`) + sauvegarde/restauration `.json`.
- `confirm()` / `prompt()` / `alert()` interdits (bloqués dans certains navigateurs) : utiliser `dialogue()` de `js/app.js`.

## Organisation
- `js/config.js` : hôtel, plan des chambres (`planFdc`), disposition des étages, sources, types, produits PDJ.
- `js/calculs.js` : règles métier, fonctions pures, testées. `js/vues.js` : HTML des écrans et des feuilles.
- `js/app.js` : état, événements, impression, aperçu. `js/store.js` : stockage. `js/xlsx-reader.js` : lecture .xlsx/.csv.
- `js/changelog.js` : historique affiché dans Réglages → sous-onglet Change log. `css/app.css` : écrans + impression (A4 en mm).
- `js/maj.js` : mise à jour de l'appli depuis GitHub (dépôt public), bouton « Mettre à jour » de l'accueil.
- `js/buffet.js` : croquis SVG du buffet du petit déjeuner (sous-onglet Buffet PDJ).
- Onglets : Accueil, Rapport, Femme de chambre, Plan de chambre, PDJ (sous-onglets Cuisson PDJ, Buffet PDJ et Commande, code : `pdj`),
  Historique (code : `recap`, sous-onglets Vue d'ensemble, Calendrier, Comparer et Toutes les nuits), Réglages (sous-onglets Paramètres et Change log).

## Règles de l'utilisateur
- **Change log** : ajouter les modifications visibles en haut de `js/changelog.js` (pas de date affichée).
  Regrouper dans une même version les retouches d'une même fonctionnalité ; ne pas y noter les retouches du
  Change log lui-même. Le numéro de version de Réglages vient de cette liste.
- **Écran en couleurs Campanile** (vert `--accent: #157f77`, marine `--marine: #1c2a48`), **impressions toujours
  en noir et blanc** (conteneur `.nb`) et sur **une seule page A4** : vérifier dans l'aperçu.
- Le bouton « Imprimer … » de chaque onglet ouvre l'aperçu avant impression.
- Style commun : en-tête d'onglet `teteEcran()` avec liseré de couleur, cartes arrondies (14 px).
- Affichage testé en 1440 × 900 (MacBook Air), 1920 × 1080 et 3440 × 1440.
- Vocabulaire : un départ a lieu **le jour du rapport** (colonne « Statut », « Départ du jour »).

## Données personnelles
Les exports du logiciel hôtelier contiennent les noms des clients : **jamais sur GitHub** (voir `.gitignore`).
`tests/fixtures/export_25-11-2025.xlsx` n'existe que sur le PC ; sans lui, une partie des tests échoue.

## Vérifier une modification
1. Serveur local : `powershell -ExecutionPolicy Bypass -File outils\serveur.ps1` (port 8765).
2. Tests : http://localhost:8765/tests/tests.html (tout doit passer quand l'export de test est présent).
3. Appli : http://localhost:8765/index.html, puis recharger sans cache (Ctrl + F5 / Cmd + Maj + R).

## Modifier les fichiers
Toujours des modifications ciblées (outil Edit). **Jamais** de remplacement de texte en masse par script
PowerShell sur plusieurs fichiers : un tel script a déjà corrompu `calculs.js` et le README.

## Git
Dépôt privé `sebastien1100-dev/RapportDuJour` (branche `main`), envoyé avec GitHub Desktop.
Sur le PC, le disque F: ne garde pas le propriétaire des fichiers : passer `-c safe.directory=...` à git.
Faire un commit par série de modifications ; « Pull origin » avant de travailler, « Push origin » après.
