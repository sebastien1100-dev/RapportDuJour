/* Historique des modifications (onglet « Change log »).
   Ajouter une entrée EN HAUT de la liste à chaque modification de l'application.
   type : 'nouveau' | 'amelioration' | 'correction' */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  RDJ.CHANGELOG = [
    {
      version: '3.27', date: '2026-11-18', titre: 'Arrivées : départs à préparer par type de chambre',
      changements: [
        ['amelioration', "Feuille de chambre, tableau « Arrivées du … » : la première ligne donne les arrivées par type, une nouvelle ligne « À PRÉPARER » le nombre de départs du jour à préparer pour les loger. Les arrivées prennent d'abord les chambres libres (déjà prêtes), puis les départs ; la ligne MANQUE n'apparaît que si les chambres libres et les départs du type ne suffisent pas."],
        ['amelioration', "Accueil, carte Arrivées : la colonne « Dispo » devient « À préparer » (départs du jour à faire pour chaque type) ; le détail des chambres libres et des départs s'affiche au survol. « Manque » suit le même calcul que la feuille de chambre."],
      ],
    },
    {
      version: '3.26', date: '2026-11-17', titre: 'Rapport du jour en application (raccourci Windows, appli Mac)',
      changements: [
        ['nouveau', "Raccourci « Rapport du jour » sur le Bureau et dans le menu Démarrer (script outils\\creer-raccourci.ps1) : l'appli s'ouvre dans sa propre fenêtre Edge ou Chrome, sans onglets ni barre d'adresse, toujours hors ligne."],
        ['nouveau', "Mac : le script outils/creer-app-mac.command crée « Rapport du jour.app » dans Applications (fenêtre Chrome, Edge ou Brave en mode application), à glisser dans le Dock."],
        ['amelioration', "Nouvelle icône « RJ » aux couleurs Campanile, aussi affichée dans l'onglet du navigateur."],
      ],
    },
    {
      version: '3.25', date: '2026-11-17', titre: 'Accueil : zone d\'import vidée à 23 h ; Historique : courbes des sources sur toute la largeur',
      changements: [
        ['correction', "Historique, graphique « Sources des chambres » : les courbes partaient du milieu de la première nuit et s'arrêtaient au milieu de la dernière. Elles vont maintenant d'un bord à l'autre du graphique (prolongées à plat avant la première nuit et après la dernière)."],
        ['amelioration', "Accueil : à partir de 23 h, la zone où l'on dépose les 4 rapports n'affiche plus les fichiers importés avant 23 h. Les pastilles reviennent à « à importer » / « facultatif » pour la nouvelle nuit ; les données importées restent dans l'application. L'accueil se met à jour tout seul à 23 h."],
      ],
    },
    {
      version: '3.24', date: '2026-11-17', titre: 'À encaisser : sans les départs à 0 €',
      changements: [
        ['amelioration', "Rapport du jour, encadré « À encaisser » : une chambre en départ dont le montant dû est de 0 € n'y figure plus, puisqu'il n'y a rien à encaisser. Elle ne compte pas non plus dans le nombre de départs non payés ni dans le total dû."],
      ],
    },
    {
      version: '3.23', date: '2026-11-16', titre: 'Buffet PDJ : serviettes et couverts ; accueil : chiffres alignés, arrivées en tableau',
      changements: [
        ['correction', "Buffet PDJ : sur la table des plateaux, les deux cases à droite des plateaux sont les couteaux et fourchettes (39), la petite case en bas à gauche les serviettes en papier (38), et les cuillères (37) ont maintenant deux cases côte à côte. La légende ajoute 38 et 39."],
        ['amelioration', "Accueil : dans les cartes Occupation, Mouvements, Petits déjeuners et Paiements, chaque chiffre a une colonne de même largeur et les chiffres sont alignés en bas de carte. Libellés raccourcis sur une ligne (« Occupées », « Groupes ») ; le libellé complet s'affiche au survol."],
        ['amelioration', "Accueil : la carte Arrivées devient un petit tableau, une ligne par type de chambre avec le nombre d'arrivées et de chambres disponibles. Le total est dans le titre (« Arrivées du 17/11 · 12 chambres ») ; un type qui manque de chambres reste en rouge (« 3 · manque 2 »)."],
        ['nouveau', "PDJ : troisième sous-onglet « Commande », à côté de Cuisson PDJ et Buffet PDJ. Son contenu reste à définir."],
        ['nouveau', "Feuille de chambre : s'il manque des chambres d'un type pour les arrivées, le tableau « Arrivées du … » ajoute une ligne MANQUE (hachurée, visible en noir et blanc) avec le nombre de chambres manquantes sous chaque type concerné."],
      ],
    },
    {
      version: '3.22', date: '2026-11-15', titre: 'Historique : sources des chambres en graphique ; sauvegarde dans le dossier « save »',
      changements: [
        ['nouveau', "Historique : graphique « Sources des chambres », une courbe lissée par source de réservation (Direct, Booking, Expedia, Agoda, Groupe, Autre) sur les 31 dernières nuits, avec une légende qui donne la part et le nombre de chambres de chaque source. Le détail de la nuit s'affiche au survol."],
        ['nouveau', "Sauvegarde : le bouton s'appelle « Sauvegarder (.json) ». À la première sauvegarde, on choisit une fois le dossier de l'application (celui d'index.html) : les sauvegardes vont dans son sous-dossier « save », et seules les 10 dernières sont gardées. Réglages indique le dossier et permet d'en changer."],
        ['amelioration', "Dans Safari et Firefox, qui ne permettent pas de choisir un dossier, la sauvegarde reste téléchargée (Réglages le signale) : utiliser Chrome ou Edge pour le dossier « save »."],
        ['amelioration', "Le bandeau du résultat de l'import (et les autres messages) s'efface au bout de 5 secondes. Les messages d'erreur restent affichés jusqu'au clic sur ×."],
      ],
    },
    {
      version: '3.21', date: '2026-11-15', titre: 'Cuisson PDJ : viennoiseries au besoin réel',
      changements: [
        ['correction', "Cuisson PDJ : croissants et pains au chocolat ne sont plus arrondis à la plaque entière. Avec peu de couverts, la feuille demandait une plaque complète coupée en trois fournées (6 couverts business : 19 croissants, 12 / 6 / 1). Elle donne maintenant le besoin calculé, réparti en fournées : 5 croissants, 3 à 6h30 et 2 à 7h30."],
        ['amelioration', "La colonne Total n'indique plus de plaques : seulement le nombre de pièces. Les plaques restent indiquées sous chaque fournée."],
      ],
    },
    {
      version: '3.20', date: '2026-11-11', titre: 'Réglages réservés par un code, Change log rangé dans les Réglages',
      changements: [
        ['nouveau', "Réglages → carte « Code d'accès » : un code de 4 à 8 chiffres réserve les Réglages et le Change log sur ce poste. Sans le code, l'onglet Réglages affiche un écran de verrouillage ; le reste de l'appli reste accessible à tous."],
        ['nouveau', "Une fois ouverts, les Réglages se reverrouillent tout seuls après 10 minutes sans action, ou à la fermeture de l'appli ; bouton « Verrouiller maintenant ». Après 5 codes faux, il faut attendre 30 secondes."],
        ['nouveau', "Code oublié : un code de secours (8 caractères) est donné une seule fois quand on choisit le code ; il permet d'en choisir un nouveau. Le code n'est jamais enregistré en clair (empreinte chiffrée seulement), ni dans les sauvegardes .json : il est propre à chaque navigateur."],
        ['amelioration', "Le Change log n'a plus d'onglet à lui : il se trouve dans Réglages, qui a maintenant deux sous-onglets, « Paramètres » et « Change log » (comme Cuisson / Buffet dans l'onglet PDJ). La barre du haut compte un onglet de moins."],
      ],
    },
    {
      version: '3.19', date: '2026-11-11', titre: 'Rapport des arrivées : arrivées par type de chambre',
      changements: [
        ['nouveau', "Quatrième import, facultatif : « Rapport des arrivées » (menu Importer ▾, ou déposé dans la zone de l'accueil avec les autres rapports : il est reconnu tout seul). On y lit la date d'arrivée et le type de chambre de chaque réservation (colonne « Description », par exemple « Chambre Standard-1 Lit Queen » → 1Q)."],
        ['nouveau', "Accueil : carte « Arrivées » avec le nombre de chambres qui arrivent et le détail par type (PMR, 1K, 1Q, 2S), chacun comparé aux chambres disponibles de ce type (départs, libres et sales ; ni recouches ni hors service). Si un type n'a pas assez de chambres, sa pastille passe en rouge (« manque 2 »)."],
        ['nouveau', "Feuille de chambre : en bas à droite, tableau « Arrivées du … » présenté comme celui des totaux en haut de la feuille : case « À PRÉPARER » en noir avec le nombre de chambres, puis une colonne par type (PMR, 1K, 1Q, 2S), 0 en grisé. Affiché quand le rapport des arrivées est importé ; les corrections restent à gauche."],
        ['amelioration', "Accueil : la carte « Arrivées du … » rejoint la rangée des chiffres (Occupation, Mouvements, Petits déjeuners, Paiements) : les cinq cartes tiennent sur une seule ligne, plus compactes sur les écrans moyens."],
        ['amelioration', "La carte reste affichée jusqu'au jour d'arrivée ; un type de chambre non reconnu est montré à part avec sa description."],
      ],
    },
    {
      version: '3.18', date: '2026-11-11', titre: 'Rapport imprimé : départs en gris plus clair',
      changements: [
        ['amelioration', "Rapport du jour imprimé : le fond gris des lignes « Départ du jour » (et de sa case dans la légende) est nettement plus clair, pour que les noms restent bien lisibles sur papier."],
      ],
    },
    {
      version: '3.17', date: '2026-11-11', titre: 'Onglet PDJ : cuisson et buffet',
      changements: [
        ['amelioration', "Buffet PDJ : légende plus claire, un élément par ligne sur deux colonnes, rangée par zone (titre avec la couleur de la zone). Chaque numéro est dans une pastille de la couleur de sa famille de produits, comme sur le croquis."],
        ['amelioration', "Buffet PDJ : croquis redessiné sur une grille régulière : même écart (4 cm) entre tous les éléments, éléments d'une même rangée alignés en haut et en bas, colonnes des deux bouts de même largeur, rectangles aux mêmes coins arrondis (corbeilles un peu plus arrondies), cercles réservés aux objets ronds (bols, assiettes, fruits, bocaux). Numéros centrés sur leur élément ; emplacements inchangés."],
        ['amelioration', "L'onglet « Cuisson PDJ » s'appelle maintenant « PDJ » et contient deux sous-onglets : « Cuisson PDJ » (inchangé : quantités et feuille de cuisson) et « Buffet PDJ ». Le sous-onglet choisi est retenu pendant la session."],
        ['nouveau', "Buffet PDJ : croquis du buffet du petit déjeuner vu de dessus (îlot et trois tables), chaque élément numéroté avec une légende par zone : boissons, viennoiseries et pains, fruits, produits frais, tables (céréales, œufs, assiettes, couverts). Proportions estimées d'après des photos, avec une échelle."],
        ['nouveau', "« Imprimer le buffet » ouvre l'aperçu : une page A4 paysage, en noir et blanc. La barre « Taille » permet d'agrandir le croquis à l'écran."],
        ['amelioration', "Buffet PDJ précisé : boîte à thé, oranges à jus, presse-jus (une seule station), oranges pressées à jeter, coupelles à confiture, confiture / Nutella / miel, compote de pommes, ardoise de fromages, beurre doux et demi-sel, jambon et charcuterie, emmental en tranches. Numéros de la légende remis à la suite."],
        ['amelioration', "Buffet PDJ corrigé : les trois tables sont collées au buffet, cake à part, jus de fruits (2 pomme, 2 orange) avec lait et eau minérale, plateaux PDJ, bols seulement sur la troisième table ; ardoise et bols noirs du côté viennoiseries retirés. Feuille allégée : sans nom de l'hôtel ni échelle. Légende de 1 à 37."],
        ['amelioration', "Buffet PDJ : une couleur par famille de produits (viennoiseries et pains, sucré à tartiner, fruits et jus, laitiers et fromages, salé et œufs, céréales), vaisselle et matériel en gris ; fonds des zones éclaircis et ligne « Familles » sous le croquis. Coins de l'îlot à peine arrondis : plus de vide noir dans les coins."],
        ['amelioration', "Buffet PDJ : bols tout le long de la structure centrale noire, brioche jusqu'à la structure, corbeilles de pain plus larges, pain de mie et cake de même taille, présentoir confiture / Nutella / miel plus grand, céréales plus courtes avec les bols dans leur prolongement et le sucre le long du bord, lait et eau minérale derrière les jus, petites et grandes cuillères sur la première table."],
      ],
    },
    {
      version: '3.16', date: '2026-11-11', titre: 'Rapport : total dû lisible',
      changements: [
        ['correction', "Rapport du jour, encadré « À encaisser » : le « Total dû » s'affichait dans un carré rouge à l'écran et dans un carré noir à l'impression, où il était illisible. Il est maintenant écrit en noir, sans fond, à droite du titre ; seul le badge « À ENCAISSER » garde son fond."],
      ],
    },
    {
      version: '3.15', date: '2026-11-11', titre: 'Taille des feuilles au curseur',
      changements: [
        ['amelioration', "Rapport, Femme de chambre, Plan de chambre et Cuisson PDJ : la liste « Affichage » est remplacée par une barre « Taille » : « Ajuster » (la feuille s'adapte à l'écran), « Largeur » (toute la largeur de la fenêtre) et un curseur de 50 % à 250 %, avec des boutons − et + (10 % par clic). La feuille suit le curseur en direct et le pourcentage s'affiche à côté."],
        ['amelioration', "Le choix est retenu sur ce poste et vaut pour toutes les feuilles. En mode « Ajuster » ou « Largeur », le curseur indique la taille calculée ; le bouger passe en taille choisie. L'impression n'est pas concernée."],
      ],
    },
    {
      version: '3.14', date: '2026-11-11', titre: 'Accueil : une seule zone pour importer',
      changements: [
        ['amelioration', "Accueil : les trois cartes d'import sont remplacées par une seule zone de dépôt. On y glisse les rapports de la nuit (un seul ou les trois), ou on clique dessus pour les choisir ; ils sont reconnus et importés dans le bon ordre. La zone, le mode d'emploi, le menu « Importer ▾ » et le voile du glisser-déposer précisent que les exports peuvent être en français ou en anglais."],
        ['amelioration', "Sous la zone, une pastille par rapport : menthe quand il est importé (nombre de chambres, total dû des départs, chambres bloquées), jaune quand le rapport clients présents manque, en pointillé pour un rapport facultatif absent. Une fois le rapport clients importé, la zone se fait plus compacte."],
        ['amelioration', "Mode d'emploi de l'accueil mis à jour. Le menu « Importer ▾ » de la barre du haut reste disponible pour réimporter un seul rapport précis."],
      ],
    },
    {
      version: '3.13', date: '2026-11-10', titre: 'Accueil : chambres bloquées',
      changements: [
        ['amelioration', "Accueil : la carte « Occupation » affiche aussi le nombre de chambres bloquées par le rapport de maintenance (hors service), à côté des chambres occupées et des clients. Une chambre remise en service à la main n'est plus comptée."],
      ],
    },
    {
      version: '3.12', date: '2026-11-10', titre: 'Rapport : bas de la dernière colonne régulier',
      changements: [
        ['correction', "Rapport du jour : quand la dernière colonne a moins de chambres que les autres, elle est complétée par des lignes vides de la même hauteur que les autres, au lieu de deux ou trois grandes cases étirées."],
      ],
    },
    {
      version: '3.11', date: '2026-11-10', titre: 'Les trois rapports importés en une fois',
      changements: [
        ['nouveau', "Import : on peut glisser les trois fichiers d'un coup dans la fenêtre (ou les choisir ensemble avec « Importer »). Chacun est reconnu tout seul, puis importé dans le bon ordre (rapport clients présents, départs, maintenance), avec un seul message récapitulatif."],
        ['correction', "Import : un rapport des départs ou de maintenance importé avant le rapport clients présents (moins de 12 h avant) est rattaché à la bonne nuit, au lieu de disparaître du rapport et de la feuille de chambre."],
        ['correction', "Glisser-déposer de plusieurs fichiers : seul le premier était importé, les autres étaient ignorés sans message."],
      ],
    },
    {
      version: '3.10', date: '2026-11-10', titre: 'Chambres bloquées regroupées par motif',
      changements: [
        ['amelioration', "Feuille de chambre : l'encadré « Chambres bloquées (maintenance) » donne le nombre total et regroupe les chambres par motif, le plus fréquent d'abord, avec les numéros qui se suivent réunis (par exemple « Menage (10) : 330, 333 à 335, 380 à 385 »). Le rapport de maintenance est lu en français comme en anglais."],
      ],
    },
    {
      version: '3.9', date: '2026-11-10', titre: 'Rapport des départs en français ou en anglais',
      changements: [
        ['amelioration', "Rapport des départs : l'export du logiciel est reconnu dans les deux langues (« Montant dû » / « Amount Due », « Chambre » / « Room », « Réservation » / « Reservation ») ; le montant dû est rattaché à chaque départ par la chambre et le numéro de réservation."],
        ['correction', "Montants : « 73.300000 », « 1,234.50 », « 1.234,50 » ou « 1 234,50 € » sont tous bien lus (un montant à partir de 1 000 € pouvait être mal lu)."],
      ],
    },
    {
      version: '3.8', date: '2026-11-09', titre: 'Feuilles plus grandes à l\'écran',
      changements: [
        ['amelioration', "Rapport, Femme de chambre et Plan de chambre : en « Ajuster à la fenêtre », la feuille prend au moins les deux tiers de la largeur de l'écran (sur un écran Full HD, elle était à peine plus large que la moitié). Si elle dépasse en hauteur, on fait défiler la page."],
      ],
    },
    {
      version: '3.7', date: '2026-11-09', titre: 'Rapport de maintenance : chambres bloquées',
      changements: [
        ['nouveau', "Menu « Importer ▾ » : troisième choix « Rapport de maintenance », facultatif. Les chambres bloquées qu'il contient passent hors service (HS) sur la feuille de chambre et le plan de chambre (hachuré rouge), pour la nuit en cours."],
        ['nouveau', "Le motif du blocage s'affiche au survol de la chambre sur le plan, et en bas de la feuille de chambre imprimée (« Chambres bloquées (maintenance) »). Les chambres bloquées comptent dans le total HS."],
        ['amelioration', "Le fichier est reconnu tout seul s'il est déposé dans la fenêtre (colonne Chambre avec un motif ou des dates). Une chambre dont le blocage est déjà terminé est ignorée ; une chambre bloquée mais occupée d'après le rapport clients présents garde son client et est signalée."],
        ['amelioration', "Accueil : troisième carte d'import « Rapport de maintenance » ; le mode d'emploi mentionne les deux rapports facultatifs. Un double-clic sur la chambre (plan ou feuille) permet toujours de la remettre en service."],
        ['amelioration', "Réglages : la carte « Hôtel » s'appelle « En-tête » (nom de l'hôtel affiché en haut de l'accueil et des feuilles) et « Horaires clés » s'appelle « Pied de page »."],
        ['amelioration', "Réglages : « Types de chambre » devient « Chambres » et accueille le nombre de chambres de l'hôtel (pour le taux d'occupation), toujours visible même liste fermée ; le lien d'ouverture s'appelle « Modifier les types »."],
        ['amelioration', "Réglages : l'en-tête indique simplement « Version 3.7 » (mention « reprise du classeur Excel v7.1 » retirée)."],
        ['amelioration', "Plan de chambre : couleurs du taux de remplissage de chaque étage inversées : étage plein en corail, à moitié en ambre, peu rempli en menthe."],
        ['amelioration', "Accueil : le bandeau « Impressions de la nuit » est remplacé par une ligne de pastilles. « Tout imprimer » (vert Campanile) imprime les feuilles choisies dans Réglages ; puis une pastille par feuille, dans la couleur de son onglet (Rapport du jour, Feuille de chambre ×5, Cuisson PDJ, Plan de chambre, Historique), qui ouvre l'aperçu de cette seule feuille."],
        ['amelioration', "« Rapport des soldes » devient « Rapport des départs » partout : menu Importer, carte de l'accueil, mode d'emploi, messages et en-tête du rapport imprimé (« Départs : nom du fichier »)."],
        ['amelioration', "Feuille de chambre : les cases HS sont en rouge pastel à l'écran (au lieu du gris) ; sur la feuille imprimée, en noir et blanc, elles sont hachurées."],
      ],
    },
    {
      version: '3.6', date: '2026-11-09', titre: 'Impression en recto verso',
      changements: [
        ['nouveau', "Réglages → Impressions de la nuit : case « L'imprimante imprime en recto verso ». Cochée, chaque feuille de chambre reste seule sur sa feuille (une page blanche est ajoutée derrière), tandis que le rapport, la cuisson PDJ, le plan et l'historique sont imprimés d'abord et partagent les feuilles (rapport au recto, cuisson au verso)."],
        ['amelioration', "Le choix vaut pour « Tout imprimer » de l'accueil comme pour la feuille de chambre imprimée depuis son onglet (et la feuille vierge). Le bandeau de l'accueil et l'aperçu le rappellent."],
      ],
    },
    {
      version: '3.5', date: '2026-11-09', titre: 'Cuisson PDJ : plaques et fournées',
      changements: [
        ['nouveau', "Cuisson PDJ : croissants et pains au chocolat arrondis à la plaque entière (12 pièces au départ). La feuille indique le total en pièces et en plaques."],
        ['nouveau', "Cuisson PDJ : les pièces de viennoiseries sont réparties en fournées : 60 % à 6h30, 30 % à 7h30 et une réserve de 10 % à cuire seulement si le buffet baisse (par exemple 38 croissants : 23, 12 et 3). Sous chaque fournée, le nombre de plaques (« 1 plaque + 4 »). Les pains sont cuits en une seule fois, à 6h30."],
        ['nouveau', "Réglages → Cuisson PDJ : pièces par plaque, part des fournées de 6h30 et de 7h30 (la réserve est le reste)."],
      ],
    },
    {
      version: '3.4', date: '2026-11-09', titre: 'Accueil : mode d\'emploi repliable et pied de page, retouches',
      changements: [
        ['amelioration', "Cuisson PDJ : les cartes « Petits déjeuners » et « Type de clientèle » occupent toute la largeur de la page, alignées sur l'en-tête et la feuille."],
        ['amelioration', "Rapport : le tableau des chambres occupe toute la hauteur de la feuille A4, quel que soit le nombre de chambres. Les lignes s'agrandissent quand il y a peu de chambres ; les colonnes plus courtes sont complétées par des lignes vides (au moins 12 par colonne) pour rester alignées."],
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
