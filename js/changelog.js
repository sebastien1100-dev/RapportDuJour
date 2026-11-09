/* Historique des modifications (onglet « Change log »).
   Ajouter une entrée EN HAUT de la liste à chaque modification de l'application.
   type : 'nouveau' | 'amelioration' | 'correction' */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  RDJ.CHANGELOG = [
    {
      version: '3.4', date: '2026-11-09', titre: 'Accueil : mode d\'emploi repliable et pied de page, retouches',
      changements: [
        ['amelioration', "Plan de chambre : « HS » au lieu de « HORS SERVICE » dans la case d'une chambre bloquée, qui était coupé faute de place."],
        ['amelioration', "Feuille de chambre : les cases changées à la main sont en gris léger, à l'écran comme sur la feuille imprimée (avant : jaune à l'écran, rien à l'impression)."],
        ['amelioration', "Accueil : le mode d'emploi se réduit ou s'affiche d'un clic sur son titre (« Réduire ▴ » / « Afficher ▾ »). Le choix est retenu sur ce poste."],
        ['nouveau', "Accueil : grand pied de page vert Campanile qui rappelle l'en-tête, avec le logo, les horaires clés (petit déjeuner, arrivées, départs, restaurant) et la version de l'application à droite."],
        ['nouveau', "Réglages → Horaires clés : les horaires du pied de page se modifient ici ; une case vide n'est pas affichée."],
      ],
    },
    {
      version: '3.3', date: '2026-11-08', titre: 'Plan de chambre fidèle au plan de la réception',
      changements: [
        ['correction', "Plan de chambre : chambres placées comme sur le plan affiché à la réception. 2e étage : 258 à 265 puis 266 à 271 côté rue, 216 à 223 puis 224 à 229 côté parking. 1er étage : 107 à 115 de gauche à droite côté parking. RDC : 006 côté rue avant l'appartement, 005 côté parking, appartement de fonction sur les deux rangées, TGBT après la 049 et local RDC à côté de la 001."],
        ['nouveau', "Plan de chambre : à droite de l'escalier, « Accueil / Restaurant » au RDC et, au 1er étage, « Local technique » puis « Combles », dessinés sur toute la hauteur de l'étage."],
        ['nouveau', "Types de chambre remplis pour les 81 chambres, d'après l'écran « Statut chambre » : 1K (258 à 265, 378 à 385), 2S (14 chambres), 1Q pour les autres, PMR pour 001 à 003. Un type changé dans Réglages reste prioritaire."],
        ['amelioration', "Plan de chambre : côté parking renommé « Côté McDonald's / parking »."],
        ['correction', "Plan de chambre : le plan occupe toute la largeur de la feuille (plus de marge vide à droite) ; les cases s'élargissent et l'escalier reste aligné d'un étage à l'autre. Même chose pour le plan vierge."],
        ['amelioration', "Plan de chambre : les chambres hors service (bloquées) sont en hachuré rouge à l'écran, dans le plan comme dans la légende et le compteur. À l'impression, elles restent hachurées en gris (noir et blanc)."],
      ],
    },
    {
      version: '3.2', date: '2026-11-08', titre: 'Retouches du design : couleurs plus claires à lire, boutons plus vivants',
      changements: [
        ['amelioration', "Le rose est réservé aux alertes : l'onglet Rapport (et la carte Paiements de l'accueil) passe en pêche, le Change log en bleu perle, les Réglages en sauge plus marqué."],
        ['amelioration', "Accueil : tant que rien n'est importé, l'anneau reste neutre et affiche « En attente » au lieu de « Occupation faible »."],
        ['amelioration', "Accueil : le bandeau « Impressions de la nuit » passe en pastel avec un bouton « Tout imprimer » bien visible ; « Petits déjeuners » tient sur une ligne."],
        ['amelioration', "Réglages : les chambres sans type sont résumées dans une pastille (« 78 chambres sans type », liste au survol)."],
        ['amelioration', "Rapport, Femme de chambre, Plan et Cuisson PDJ : l'en-tête a la même largeur que dans les autres onglets ; seule la feuille s'élargit."],
        ['amelioration', "Boutons : ils s'enfoncent légèrement au clic, un anneau vert clair montre le bouton choisi au clavier, les boutons indisponibles ont un contour pointillé lisible. « Imprimer l'historique » est indisponible tant qu'aucune nuit n'est enregistrée."],
        ['amelioration', "Barre du haut translucide : la page défile dessous. Les animations s'arrêtent si l'ordinateur demande de réduire les animations."],
      ],
    },
    {
      version: '3.1', date: '2026-11-07', titre: 'Cuisson PDJ allégée, impressions de la nuit au choix',
      changements: [
        ['nouveau', "Réglages → Impressions de la nuit : on coche les feuilles à imprimer d'un clic depuis l'accueil (Rapport du jour, Feuille de chambre, Cuisson PDJ, Plan de chambre, Historique), en petites pastilles. Le nombre d'exemplaires de la feuille de chambre se règle à côté de sa pastille."],
        ['amelioration', "Historique (feuille imprimée) : même présentation que la Cuisson PDJ (en-tête, trois chiffres encadrés : nuits, taux d'occupation moyen, période ; section numérotée ; tableau arrondi). La nuit la plus récente en haut, ligne « Moyenne » en bas, sources en abrégé avec leur légende. Tient sur une page A4 : les 31 dernières nuits (tout l'historique reste dans l'export .csv)."],
        ['amelioration', "Accueil : le bandeau « Impressions de la nuit » indique les feuilles choisies (par exemple « Rapport ×1 · feuille de chambre ×5 · cuisson PDJ ×1 »)."],
        ['amelioration', "Cuisson PDJ : le « Complément pour 8h » est retiré, de l'écran de saisie comme de la feuille imprimée. Il reste le nombre de petits déjeuners et le type de clientèle."],
        ['amelioration', "Cuisson PDJ (feuille) : l'encadré « Matin du » en haut à droite est retiré ; la date reste dans « Pour la journée du »."],
        ['amelioration', "Cuisson PDJ : temps et température ajoutés pour les pains au chocolat (12 min, 180 °C) et le pavé rustique (17 min, 180 °C)."],
      ],
    },
    {
      version: '3.0', date: '2026-11-07', titre: 'Nouveau design : flat et pastel',
      changements: [
        ['amelioration', "Tout l'écran passe en design « flat » : couleurs à plat, sans dégradé, sans ombre ni liseré, coins plus arrondis, fond crème clair."],
        ['amelioration', "Une couleur pastel par onglet (Rapport rose, Femme de chambre bleu ciel, Plan de chambre menthe, Cuisson PDJ jaune beurre, Historique lilas, Réglages sauge, Change log pêche), reprise dans l'en-tête de l'onglet et sur les cartes de l'accueil."],
        ['amelioration', "Barre du haut blanche avec le logo Campanile posé directement et des onglets en pastilles ; vert Campanile pour l'onglet actif et les boutons principaux, bleu nuit pour les textes forts et le bandeau « Impressions de la nuit »."],
        ['amelioration', "Cartes blanches avec un titre en pastille pastel (Réglages, Historique, Mode d'emploi, Cuisson PDJ) ; types de chambre, compteurs et choix en pastilles de couleur."],
        ['amelioration', "Les feuilles imprimées ne changent pas : toujours en noir et blanc sur une page A4."],
      ],
    },
    {
      version: '2.9', date: '2026-11-06', titre: 'Sauvegarde hebdomadaire et retouches',
      changements: [
        ['amelioration', "Accueil : tout le bandeau « Impressions de la nuit » est un bouton qui lance « Imprimer tout » (clic n'importe où dessus) ; l'ancien bouton « Imprimer tout » est retiré."],
        ['amelioration', "Réglages → Types de chambre : la liste reste ouverte après chaque modification ; on la referme soi-même avec « Modifier »."],
        ['amelioration', "Réglages → Hôtel : champs alignés, petite précision sous chaque nombre, et rappel « js/config.js » retiré."],
        ['nouveau', "Réglages → Sauvegarde : case « Sauvegarde hebdomadaire automatique » (décochée par défaut). Cochée, l'application télécharge une sauvegarde à l'ouverture si la dernière date de 7 jours ou plus."],
      ],
    },
    {
      version: '2.8', date: '2026-11-06', titre: 'Plan de chambre vierge',
      changements: [
        ['amelioration', "Plan de chambre vierge : le type de chambre (PMR, 1K, 1Q, 2S) apparaît dans les cases dont le type est renseigné dans les Réglages, avec une légende des types en bas de la feuille."],
        ['amelioration', "Plan de chambre : l'appartement de fonction et le bureau de direction sont grisés (à l'écran et à l'impression)."],
      ],
    },
    {
      version: '2.7', date: '2026-11-05', titre: 'Deux rapports à importer',
      changements: [
        ['nouveau', "Le bouton d'import devient un menu « Importer ▾ » avec deux choix : « Rapport clients présents » (l'export habituel) et « Rapport des soldes » (montant dû des chambres)."],
        ['nouveau', "Rapport des soldes : les montants sont reportés sur les chambres en départ non payées, dans l'encadré « À encaisser » du rapport, avec le total dû. Le rapprochement se fait par n° de réservation, ou à défaut par n° de chambre ; plusieurs lignes pour une même chambre sont additionnées."],
        ['nouveau', "Le rapport des soldes est reconnu tout seul s'il est déposé dans la fenêtre. Son nom apparaît en haut à droite du rapport, et un message indique combien de départs ont reçu leur montant."],
        ['amelioration', "Les soldes valent pour la nuit en cours et restent si l'on réimporte le rapport clients présents de la même nuit."],
        ['amelioration', "Tous les onglets au même style : en-tête commun (titre, nuit ou date, aide, boutons à droite) avec un liseré de couleur propre à chaque onglet, feuilles posées sur un fond doux, cartes arrondies. Réglages réorganisés en cartes (Hôtel, Sauvegarde, Types de chambre, Supprimer)."],
        ['amelioration', "L'onglet « Récap » devient « Historique » (feuille imprimée « Historique des nuits », export Historique_rapport_du_jour.csv)."],
        ['nouveau', "Historique : cartes de synthèse (nuits enregistrées, taux d'occupation moyen et meilleure nuit, clients et petits déjeuners par nuit, part du direct et des autres sources), graphique du taux d'occupation des 31 dernières nuits aux couleurs de l'anneau de l'accueil, et tableau des nuits, la plus récente en haut, avec une jauge d'occupation."],
        ['amelioration', "Accueil : le mode d'emploi est toujours visible, en deux colonnes : « Chaque nuit » (4 étapes numérotées) et « Corrections au double-clic » (Rapport, Feuille de chambre, Plan de chambre), avec le rappel de sauvegarde."],
        ['amelioration', "Accueil retravaillé sous le bandeau : deux cartes d'import (1 · Rapport clients présents, 2 · Rapport des soldes) avec leur état, chiffres regroupés en quatre cartes (Occupation, Mouvements, Petits déjeuners, Paiements) qui ouvrent l'onglet correspondant, et bandeau « Impressions de la nuit » aux couleurs de l'en-tête."],
      ],
    },
    {
      version: '2.6', date: '2026-11-05', titre: "Affichage adapté à l'écran",
      changements: [
        ['nouveau', "Rapport, Femme de chambre, Prépa PDJ, Plan de chambre et Récap : la feuille s'adapte à la taille de la fenêtre (MacBook Air, Full HD 1920, ultra-large 3440). Une page paysage est affichée en entier, sans défilement."],
        ['nouveau', "Choix « Affichage » dans la barre d'outils : Ajuster à la fenêtre (par défaut), Toute la largeur, ou Taille réelle (100 %). Le choix est retenu sur ce poste."],
        ['amelioration', "Grands écrans : l'accueil et les réglages s'élargissent. Écrans plus étroits : la barre du haut reste sur une ligne et le bouton d'import devient « Importer »."],
        ['amelioration', "L'impression n'est pas concernée : toujours un A4 exact en noir et blanc."],
        ['correction', "Rapport : la colonne « Demain » s'appelle maintenant « Statut » (DÉPART / Recouche). Un départ a lieu le jour du rapport, pas le lendemain. « Départ demain » devient « Départ du jour » dans la légende du rapport et sur le plan de chambre."],
        ['nouveau', "Plan de chambre : l'appartement de fonction est dessiné au rez-de-chaussée, côté Mac Donald, entre la 006 et la 005."],
        ['nouveau', "Feuille de chambre : nouvel état BR (blanc recouche) au double-clic : vide → B → R → BR → HS → vide. Il apparaît dans « Corrections du jour » (BLANC RECOUCHE) et compte dans le total. Sur le plan de chambre, une chambre en BR reste en recouche."],
        ['amelioration', "Feuille de chambre : la colonne NV est retirée du tableau des totaux (TOTAL · B · R · BR · HS), qui est aussi plus visible : gros chiffres, cadre épais et TOTAL en blanc sur noir. Il n'apparaît pas sur la feuille vierge. Les cases NV de la grille restent."],
        ['amelioration', "L'onglet « Prépa PDJ » s'appelle maintenant « Cuisson PDJ » (onglet, titre de la feuille, boutons)."],
        ['amelioration', "Cuisson PDJ : feuille retravaillée, même contenu. Date en encadré, nombre de petits déjeuners mis en avant, deux sections numérotées (1 · Produits en cuisson, 2 · Autres produits), quantités en grand, cuisson et température en pastilles, case à remplir pour le complément de 8h, recommandations sous la mise en place, note brioche encadrée. Tient sur une page A4."],
        ['amelioration', "Cuisson PDJ : nouveau panneau de saisie en trois cartes : nombre de petits déjeuners en grand avec boutons − / +, type de clientèle en trois boutons (Business, Loisir, Mixte), et compléments pour 8h avec − / + pour chaque produit."],
        ['amelioration', "Plus de boutons « Aperçu avant impression » : sur chaque onglet, le bouton « Imprimer … » ouvre directement l'aperçu, d'où l'on imprime (Rapport, Feuille de chambre et feuille vierge, Prépa PDJ, Plan, Récap)."],
      ],
    },
    {
      version: '2.5', date: '2026-11-05', titre: "Anneau du taux d'occupation en couleur",
      changements: [
        ['amelioration', "Logo Campanile Prime en haut à gauche, à la place du « R », sur une pastille blanche (fichier img/logo-campanile.png). Le texte « Rapport du jour / nom de l'hôtel » à côté est retiré."],
        ['amelioration', "Plan de chambre : le repère « GRP » indique maintenant toute chambre occupée par un client d'un groupe, payée ou non (légende « Client d'un groupe »), en violet plein pour mieux le voir, à la même taille (double cadre en noir et blanc). Le paiement des groupes n'est plus affiché, puisqu'il se fait en une fois."],
        ['nouveau', "Plan de chambre : taux d'occupation de chaque étage (pourcentage et petite jauge) à côté du nom de l'étage, en plus du nombre de chambres occupées. La jauge reprend les couleurs de l'anneau de l'accueil (menthe, ambre, corail)."],
        ['amelioration', "Accueil : le bandeau affiche la date du rapport en grand, et la nuit en dessous (« Nuit du … au … »)."],
        ['amelioration', "Accueil : l'anneau du taux d'occupation prend une couleur douce accordée au bandeau : menthe pour une occupation forte (80 % et plus), ambre pour moyenne, corail pour faible (moins de 50 %), avec un léger halo. La pastille « Occupation … » reprend la même couleur."],
      ],
    },
    {
      version: '2.4', date: '2026-11-05', titre: 'Plan de chambre : chambres sales et hors service',
      changements: [
        ['nouveau', "Plan de chambre : double-clic sur une chambre libre pour la passer en « sale » puis en « hors service », puis de nouveau libre."],
        ['nouveau', "C'est reporté aussitôt sur la feuille de chambre : sale = B (à blanc), hors service = HS. « Annuler les corrections du jour » de la feuille de chambre l'efface aussi."],
        ['nouveau', "Nouveau statut « Sale (à faire) » : case pointillée, compteur « Sales » en haut du plan et ligne dans la légende. Les chambres occupées ne changent pas au double-clic : leur statut suit l'import."],
      ],
    },
    {
      version: '2.3', date: '2026-11-05', titre: 'Types de chambre',
      changements: [
        ['nouveau', "Réglages : bloc « Types de chambre » pour choisir le type de chacune des 81 chambres : PMR (adaptée), 1K (1 lit king size), 1Q (1 lit queen size), 2S (2 lits simples). Replié, il tient sur une ligne (compteurs et chambres sans type) ; « Modifier » l'ouvre, avec une ligne compacte par étage."],
        ['nouveau', "Types de départ : 001, 002 et 003 en PMR, les autres repris des catégories des exports (…1K, …1Q, …2S)."],
        ['nouveau', "Plan de chambre : le type s'affiche dans chaque case (PMR sur fond foncé), avec sa légende en pied de page et en toutes lettres dans la fiche au survol. Il apparaît aussi sur le plan vierge."],
      ],
    },
    {
      version: '2.2', date: '2026-11-05', titre: 'Source des réservations',
      changements: [
        ['nouveau', "La colonne « Client » de l'export est lue comme la source de la réservation : Direct, Booking, Expedia, Agoda ou Groupe. Une source inconnue est classée « Autre » avec son nom d'origine."],
        ['nouveau', "Rapport : colonne « Src » dans la grille (DIR, BKG, EXP, AGO, GRP) et ligne « Sources » sous les chiffres, avec le nombre de chambres et le pourcentage de chaque source."],
        ['nouveau', "Rapport : la source est indiquée à côté du nom dans l'encadré « À encaisser »."],
        ['nouveau', "Plan de chambre : la source apparaît dans la fiche au survol."],
        ['nouveau', "Récap : nombre de chambres par source pour chaque nuit, à l'écran, à l'impression et dans l'export .csv. Les nuits enregistrées avant cette version affichent « — »."],
        ['nouveau', "Ajout d'une chambre à la main : choix de la source (Direct par défaut)."],
        ['amelioration', "Rapport : la ligne « Autres non payées (restent demain) » devient « Autres non payées »."],
        ['amelioration', "Plan de chambre : la mention « Arrivée ce soir » est retirée de la fiche au survol, et « NON PAYÉE » y est écrit en rouge."],
      ],
    },
    {
      version: '2.1', date: '2026-11-05', titre: 'Onglet Plan de chambre',
      changements: [
        ['nouveau', "Onglet « Plan de chambre » : dessin des 81 chambres par étage, du 3e au rez-de-chaussée, selon la disposition réelle de l'hôtel."],
        ['nouveau', "Chaque étage d'un seul tenant : chambres dos à dos (mur au milieu), une coursive extérieure de chaque côté, côté rue en haut et côté Mac Donald en bas."],
        ['nouveau', "Ordre des chambres de gauche à droite — RDC : 045 → 049 / 006 → 001 · 1er : 157 → 150 / 115 → 107 · 2e : 271 → 258 / 229 → 216 · 3e : 385 → 372 / 343 → 330."],
        ['nouveau', "Cage d'escalier et ascenseur dessinés à la même place sur tous les étages : au milieu aux 2e et 3e (entre 264 / 263, 222 / 221, 378 / 377 et 336 / 335), à droite des chambres au 1er et au rez-de-chaussée."],
        ['nouveau', "Chambres communicantes 003 et 004 : une porte est dessinée entre les deux cases (mur interrompu, battant et arc d'ouverture), et la fiche au survol l'indique."],
        ['nouveau', "Bureau de direction (331 · 332) dessiné au 3e étage, côté Mac Donald, entre 333 et 330."],
        ['nouveau', "Statut de chaque chambre : départ demain, recouche, libre ou hors service, repris de la feuille de chambre (corrections comprises). Compteurs en haut et chambres occupées par étage."],
        ['nouveau', "Sur chaque chambre : nom du client, personnes, PDJ, repères « € » (non payée), « GRP » (groupe non payé) et chambre ajoutée à la main."],
        ['nouveau', "Survol d'une chambre : fiche de détail (client, personnes, départ, petit déjeuner, paiement, arrivée ce soir)."],
        ['nouveau', "Aperçu et impression du plan sur une page A4 paysage, en noir et blanc, avec légende."],
        ['nouveau', "Plan vierge : même dessin avec seulement les numéros, et une ligne « Date », à remplir à la main (sans légende)."],
        ['nouveau', "Deux boutons seulement : « Imprimer le plan » et « Plan vierge ». Chacun ouvre l'aperçu, d'où l'on imprime."],
      ],
    },
    {
      version: '2.0', date: '2026-11-05', titre: 'Ajout de chambres à la main',
      changements: [
        ['nouveau', "Rapport : bouton « + Ajouter une chambre » pour ajouter une chambre après l'import (client arrivé après l'export, par exemple). La liste ne propose que les chambres libres du plan."],
        ['nouveau', "Fiche de la chambre : nom, personnes, date de départ (demain par défaut), petit déjeuner, payée, montant dû."],
        ['nouveau', "La chambre ajoutée compte partout : chiffres du rapport, taux, « À encaisser », feuille de chambre (B ou R), prépa PDJ et récap."],
        ['nouveau', "Double-clic sur une chambre ajoutée pour la modifier ou la retirer. Elle est repérée par une barre à gauche du numéro, en italique, et citée dans « Modifié à la main »."],
        ['amelioration', "L'ajout vaut pour la nuit en cours et reste si l'on réimporte le même fichier. Si la chambre arrive dans un nouvel import, l'import l'emporte et un message le signale."],
        ['amelioration', "« Annuler les modifications du jour » retire aussi les chambres ajoutées."],
      ],
    },
    {
      version: '1.9', date: '2026-11-05', titre: 'À encaisser : départs seulement',
      changements: [
        ['amelioration', "L'encadré « À encaisser » ne garde que les chambres non payées qui partent demain, avec leur montant dû et le total."],
        ['amelioration', "Les autres chambres non payées (qui restent) sont données en simple liste sous l'encadré, sans montant."],
      ],
    },
    {
      version: '1.8', date: '2026-11-05', titre: 'Chambres non payées mises en valeur',
      changements: [
        ['nouveau', "Rapport : encadré « À encaisser » avec chaque chambre non payée, le nom du client, un repère « part demain » et le montant dû."],
        ['nouveau', "Montant dû : lu automatiquement si l'export contient une colonne « Solde » (ou « Montant dû », « Reste à payer », « Balance ») ; sinon une case est laissée pour l'écrire à la main. Le total s'affiche quand les montants sont connus."],
        ['nouveau', "Groupes non payés : affichés à part, par groupe, sans montant par chambre (règlement global)."],
        ['amelioration', "Grille : « NON » pour les individuels à encaisser, « GRP » pour les chambres de groupe. La tuile « Non payées » est encadrée en rouge (en noir sur papier)."],
      ],
    },
    {
      version: '1.7', date: '2026-11-05', titre: 'Grille du rapport plus lisible',
      changements: [
        ['amelioration', "Rapport : un seul gris, pour les départs de demain. Les recouches restent sur fond blanc."],
        ['amelioration', "Rapport : une chambre non payée se voit à sa case « Payé » (rouge à l'écran, noire sur papier), même si elle part demain."],
        ['amelioration', "Rapport : en-têtes de colonnes blancs à l'impression pour ne plus les confondre avec les lignes grisées."],
        ['nouveau', "Rapport : légende en pied de page qui explique chaque code."],
      ],
    },
    {
      version: '1.6', date: '2026-11-05', titre: 'Onglet Change log',
      changements: [
        ['nouveau', "Onglet « Change log » : liste de toutes les modifications de l'application, version par version."],
        ['amelioration', "Le numéro de version affiché dans Réglages vient maintenant de cet historique."],
      ],
    },
    {
      version: '1.5', date: '2026-11-05', titre: 'Aperçu avant impression',
      changements: [
        ['nouveau', 'Bouton « Aperçu avant impression » sur le Rapport, la Feuille de chambre et la Prépa PDJ.'],
        ['nouveau', "L'aperçu montre la page entière en noir et blanc au format A4 (paysage ou portrait), avec le nombre d'exemplaires."],
        ['nouveau', "Depuis l'aperçu : Imprimer (avec le bon nombre d'exemplaires) ou Fermer (touche Échap)."],
      ],
    },
    {
      version: '1.4', date: '2026-11-04', titre: 'Couleurs Campanile et impression noir et blanc',
      changements: [
        ['amelioration', "Affichage aux couleurs Campanile : vert canard et bleu nuit (barre du haut, boutons, en-tête, dessin de l'hôtel)."],
        ['amelioration', 'Le rouge est réservé aux alertes (chambres non payées, erreurs).'],
        ['nouveau', 'Toutes les impressions sortent en noir et blanc : titres noirs, en-têtes de tableaux gris clair, tuiles bordées de noir.'],
        ['amelioration', 'Les gris utiles restent à l\'impression : chambre non payée en gris foncé, départ en gris clair.'],
      ],
    },
    {
      version: '1.3', date: '2026-11-04', titre: "Dessin de l'hôtel",
      changements: [
        ['nouveau', "Illustration d'un hôtel de nuit dans l'en-tête de l'accueil (deux ailes, campanile, fenêtres allumées, lune et étoiles)."],
        ['amelioration', 'Pastille sous le taux d\'occupation : occupation forte, moyenne ou faible.'],
        ['amelioration', 'Couleurs générales retravaillées (fond, tuiles, cadre d\'import, titres des feuilles).'],
      ],
    },
    {
      version: '1.2', date: '2026-11-04', titre: "Nouvel en-tête de l'accueil",
      changements: [
        ['nouveau', 'Bandeau en dégradé avec la nuit en toutes lettres (« Mardi 25 novembre 2025 ») et la date du rapport.'],
        ['nouveau', "Taux d'occupation affiché dans un anneau (pourcentage et chambres occupées / chambres de l'hôtel)."],
        ['nouveau', 'Pastilles : dernier import (date, heure, fichier) et date du rapport modifiable, avec retour à la date automatique.'],
        ['amelioration', 'La barre de taux d\'occupation sous les chiffres est remplacée par l\'anneau.'],
      ],
    },
    {
      version: '1.1', date: '2026-11-04', titre: 'Correction des boutons « Annuler »',
      changements: [
        ['correction', '« Annuler les modifications du jour » (Rapport) et « Annuler les corrections du jour » (Feuille de chambre) ne faisaient rien : la fenêtre de confirmation du navigateur était bloquée.'],
        ['correction', 'Même problème corrigé pour « Imprimer une feuille vierge », « Supprimer toutes les données » et « Restaurer une sauvegarde ».'],
        ['amelioration', "Nouvelle fenêtre de confirmation intégrée à l'application, qui fonctionne dans tous les navigateurs."],
        ['amelioration', "Message de confirmation après l'annulation."],
      ],
    },
    {
      version: '1.0', date: '2026-11-04', titre: 'Première version web (reprise du classeur Excel v7.1)',
      changements: [
        ['nouveau', "Application web hors ligne : un double-clic sur index.html, sans installation, sans macros, sur PC et Mac."],
        ['nouveau', "Import de l'export du logiciel hôtelier (.xlsx ou .csv) par bouton ou glisser-déposer ; colonnes reconnues par leur titre, en français ou en anglais."],
        ['nouveau', 'Rapport du jour : 7 chiffres clés, chambres non payées (individuelles et groupes), grille de toutes les chambres sur 1 page A4 paysage.'],
        ['nouveau', 'Corrections du rapport par double-clic : Payé, Demain (départ ↔ recouche), PDJ (ajout), avec bouton pour tout annuler.'],
        ['nouveau', 'Feuille de chambre : B / R remplis depuis l\'import, double-clic vide → B → R → HS → vide, case NV, encadré « Corrections du jour », feuille vierge.'],
        ['nouveau', 'Prépa PDJ : quantités calculées selon le nombre de petits déjeuners et le type de clientèle, compléments pour 8h.'],
        ['nouveau', "Récap : une ligne par nuit, mise à jour à chaque import, export .csv pour Excel."],
        ['nouveau', 'Impression : chaque feuille, ou « Imprimer tout » (rapport ×1, feuille de chambre ×5, prépa PDJ ×1).'],
        ['nouveau', 'Données gardées dans le navigateur, sauvegarde et restauration en fichier .json, rappel de sauvegarde après 7 jours.'],
        ['nouveau', 'Réglages : nom de l\'hôtel, nombre de chambres, exemplaires de la feuille de chambre ; suppression de toutes les données avec confirmation.'],
        ['amelioration', 'Alerte si une chambre de l\'export n\'est pas sur la feuille de chambre.'],
        ['correction', 'Colonne « Demain » du rapport élargie (« DÉPART » était tronqué).'],
        ['correction', "Hauteur des feuilles ajustée pour éviter une page blanche en fin d'impression."],
      ],
    },
  ];

  RDJ.VERSION = RDJ.CHANGELOG[0].version;
})();
