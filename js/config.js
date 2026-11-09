/* Configuration de l'hôtel. Les réglages simples (nom, nombre de chambres, exemplaires)
   sont modifiables dans l'onglet Réglages ; le plan et les produits se modifient ici. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  // Chambres de debut à fin (numéros sur 3 chiffres), sauf celles de "sauf".
  function serie(debut, fin, sauf) {
    const res = [];
    for (let n = debut; n <= fin; n++) {
      const no = String(n).padStart(3, '0');
      if (!sauf || !sauf.includes(no)) res.push(no);
    }
    return res;
  }
  const noir = (no) => ({ no, noir: true });
  const CAGE = { cage: true }; // cage d'escalier + ascenseur (plan de chambre)

  RDJ.CONFIG_DEFAUT = {
    hotel: 'Campanile Nîmes Mas Carbonnel',
    nbChambres: 81,
    nbExemplairesFdc: 5,

    /* Horaires clés, affichés en pied de page de l'accueil et modifiables dans Réglages.
       Valeurs de départ à vérifier ; un horaire vide n'est pas affiché. */
    horaires: [
      { id: 'pdj', nom: 'Petit déjeuner', defaut: '6h30 – 10h00' },
      { id: 'arrivees', nom: 'Arrivées', defaut: 'à partir de 15h00' },
      { id: 'departs', nom: 'Départs', defaut: 'avant 12h00' },
      { id: 'restaurant', nom: 'Restaurant', defaut: '19h00 – 22h00' },
    ],

    /* Feuille femme de chambre : 6 colonnes, chambres de haut en bas.
       noir = case grisée en noir (chambre inexistante ou à ne pas remplir). */
    planFdc: [
      ['001', '002', '003', '004', '005', noir('5bis'), '006', noir('044'), noir('000'), '045', '046', '047', '048', '049'],
      [...serie(107, 112), '114', '115', ...serie(150, 157)],
      serie(216, 229),
      serie(258, 271),
      ['330', noir('331'), noir('332'), ...serie(333, 343)],
      serie(372, 385),
    ],

    /* Source de la réservation (colonne « Client » de l'export).
       motifs : début du texte de l'export (sans tenir compte des majuscules ni de la ponctuation).
       Une source inconnue s'affiche telle quelle dans « Autre ». */
    sourcesReservation: [
      { code: 'DIR', nom: 'Direct', motifs: ['DIRECT'] },
      { code: 'BKG', nom: 'Booking', motifs: ['BOOKING'] },
      { code: 'EXP', nom: 'Expedia', motifs: ['EXPEDIA'] },
      { code: 'AGO', nom: 'Agoda', motifs: ['AGODA'] },
      { code: 'GRP', nom: 'Groupe', motifs: ['GROUP'] },
    ],

    /* Types de chambre (affichés sur le plan de chambre, modifiables dans Réglages).
       typesChambresDefaut : valeurs de départ, remplacées par ce qui est saisi dans Réglages. */
    typesChambre: [
      { code: 'PMR', nom: 'Chambre adaptée PMR (personne à mobilité réduite)' },
      { code: '1K', nom: '1 lit king size' },
      { code: '1Q', nom: '1 lit queen size' },
      { code: '2S', nom: '2 lits simples' },
    ],
    // relevé sur l'écran « Statut chambre » (catégories BSTD-1Q, BSTD-2S, PSUP-1K) ; 001 à 003 adaptées PMR
    typesChambresDefaut: Object.fromEntries(Object.entries({
      PMR: '001 002 003',
      '1K': '258 259 260 261 262 263 264 265 378 379 380 381 382 383 384 385',
      '2S': '005 006 045 047 049 111 153 217 229 267 334 340 342 376',
      '1Q': '004 046 048 107 108 109 110 112 114 115 150 151 152 154 155 156 157 '
        + '216 218 219 220 221 222 223 224 225 226 227 228 266 268 269 270 271 '
        + '330 333 335 336 337 338 339 341 343 372 373 374 375 377',
    }).flatMap(([type, nos]) => nos.split(' ').map((no) => [no, type]))),

    /* Plan de chambre : disposition réelle des étages, de gauche à droite.
       Une aile = un couloir avec une rangée en haut et une en bas (+ libellé de chaque côté).
       Un étage absent d'ici est dessiné automatiquement (impaires en haut, paires en bas).
       Un local qui n'est pas une chambre : { local: 'Nom', detail: 'texte', largeur: nb de cases }.
       couloirsExterieurs : chambres dos à dos, chaque rangée ouvre sur une coursive extérieure.
       CAGE : emplacement de la cage d'escalier et de l'ascenseur, à la même place sur tous les
       étages (après colonnesAvantCage cases depuis la gauche).
       droite : locaux dessinés sur toute la hauteur de l'étage, à droite de la cage. */
    couloirsExterieurs: true,
    colonnesAvantCage: 8,
    // paires de chambres reliées par une porte intérieure
    chambresCommunicantes: [['003', '004']],
    // relevé sur le plan affiché à la réception : escalier de secours à gauche, 8 cases, cage,
    // local technique (non dessiné ici), puis l'aile droite
    dispositionEtages: {
      0: [
        { hautLib: 'Côté rue', haut: ['006', { local: 'Appart. de fonction', largeur: 1, petit: true }, '045', '046', '047', '048', '049', { local: 'TGBT', largeur: 1, petit: true }, CAGE],
          basLib: "Côté McDonald's / parking", bas: ['005', { local: 'Appart. de fonction', largeur: 2, petit: true }, '004', '003', '002', '001', { local: 'Local RDC', largeur: 1, petit: true }, CAGE],
          droite: [{ local: 'Accueil / Restaurant', largeur: 6 }] },
      ],
      1: [
        { hautLib: 'Côté rue', haut: [...serie(150, 157).reverse(), CAGE],
          basLib: "Côté McDonald's / parking", bas: [...serie(107, 112), '114', '115', CAGE],
          droite: [{ local: 'Local technique', largeur: 2 }, { local: 'Combles', largeur: 4 }] },
      ],
      2: [
        { hautLib: 'Côté rue', haut: [...serie(258, 265), CAGE, ...serie(266, 271)],
          basLib: "Côté McDonald's / parking", bas: [...serie(216, 223), CAGE, ...serie(224, 229)] },
      ],
      3: [
        { hautLib: 'Côté rue', haut: [...serie(378, 385).reverse(), CAGE, ...serie(372, 377).reverse()],
          basLib: "Côté McDonald's / parking", bas: [...serie(336, 343).reverse(), CAGE, '335', '334', '333', { local: 'Bureau de direction', detail: '331 · 332', largeur: 2 }, '330'] },
      ],
    },

    /* Cuisson PDJ. quantité = arrondi supérieur(PDJ / 100 × base × coef × facteur)
       coef : loisir 1,25 · mixte 1 · business = coefBusiness du produit. */
    coefLoisir: 1.25,
    produitsPdj: [
      { id: 'croissant', nom: 'Croissants', groupe: 'cuisson', cuisson: '12 min', temp: '180 °C', base: 75, coefBusiness: 0.9, facteur: 1 },
      { id: 'painchoc', nom: 'Pains au chocolat', groupe: 'cuisson', cuisson: '12 min', temp: '180 °C', base: 75, coefBusiness: 0.9, facteur: 0.75 },
      { id: 'baguette', nom: 'Baguette signature', groupe: 'cuisson', cuisson: '10 min', temp: '220 °C', base: 30, coefBusiness: 0.4, facteur: 0.75 },
      { id: 'muesli', nom: 'Pain muesli', groupe: 'cuisson', cuisson: '17 min', temp: '180 °C', base: 4, coefBusiness: 0.75, facteur: 0.75 },
      { id: 'rustique', nom: 'Pavé rustique', groupe: 'cuisson', cuisson: '17 min', temp: '180 °C', base: 4, coefBusiness: 0.75, facteur: 0.75 },
      { id: 'cake', nom: 'Cake', groupe: 'autre', miseEnPlace: "À décongeler 24h à l'avance", reco: 'Ajuster avec les mises en place de la veille', base: 4, coefBusiness: 0.75, facteur: 0.75 },
      { id: 'brioche', nom: 'Brioche pur beurre', groupe: 'autre', miseEnPlace: '', base: 4, coefBusiness: 0.75, facteur: 0.75 },
      { id: 'jambon', nom: 'Jambon', groupe: 'autre', miseEnPlace: 'En nombre de plats (1 plat = 10 demi-tranches)', base: 1, coefBusiness: 0.75, facteur: 1 },
      { id: 'fromage', nom: 'Fromage', groupe: 'autre', miseEnPlace: 'En nombre de plats (1 plat = 10 tranches)', base: 1, coefBusiness: 0.75, facteur: 1 },
      { id: 'jusorange', nom: "Jus d'orange", groupe: 'autre', miseEnPlace: 'En carafe Evento', base: 1, coefBusiness: 0.75, facteur: 1 },
      { id: 'juspomme', nom: 'Jus de pomme', groupe: 'autre', miseEnPlace: '', base: 1, coefBusiness: 0.75, facteur: 1 },
      { id: 'crepes', nom: 'Mini-crêpes', groupe: 'autre', miseEnPlace: 'À dresser sous cloche', base: 75, coefBusiness: 0.6, facteur: 0.7 },
      { id: 'painmie', nom: 'Pain de mie', groupe: 'autre', miseEnPlace: 'Sur ardoise', base: 1, coefBusiness: 1.5, facteur: 2 },
    ],
    noteBrioche: 'Sortir la brioche du congélateur et la laisser décongeler 2h00 à 2h30 à température ambiante. Cuire le produit à four chaud pendant 5 à 8 minutes à 130 - 150 °C.',
  };
})();
