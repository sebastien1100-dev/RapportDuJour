/* Règles métier : fonctions pures, sans accès à l'écran ni au stockage (testées dans tests/).
   Les dates sont des chaînes "AAAA-MM-JJ" ; N = nuit du rapport. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  /* ---------- Dates ---------- */
  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const pad = (n) => String(n).padStart(2, '0');

  RDJ.jours = function (iso, n) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  RDJ.ecartJours = (a, b) => Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000);
  RDJ.jourSemaine = (iso) => JOURS[new Date(iso + 'T00:00:00Z').getUTCDay()];
  RDJ.dateFr = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '');
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  /** "mardi 25 novembre 2025" */
  RDJ.dateLongue = (iso) => (iso ? RDJ.jourSemaine(iso) + ' ' + parseInt(iso.slice(8, 10), 10) + ' ' + MOIS[parseInt(iso.slice(5, 7), 10) - 1] + ' ' + iso.slice(0, 4) : '');
  RDJ.dateCourte =(iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');
  RDJ.aujourdhui = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  /** Date + heure locales "AAAA-MM-JJTHH:MM". */
  RDJ.maintenantLocal = function (d) {
    d = d || new Date();
    return RDJ.aujourdhui(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };

  /** Valeur de l'export -> "AAAA-MM-JJ" (numéro de série Excel, texte JJ/MM/AAAA ou AAAA-MM-JJ). */
  RDJ.versISO = function (v) {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number' && isFinite(v)) {
      return new Date(Math.round((Math.floor(v) - 25569) * 86400000)).toISOString().slice(0, 10);
    }
    const s = String(v).trim();
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
    if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
    m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s);
    if (m) {
      const an = m[3].length === 2 ? '20' + m[3] : m[3];
      return an + '-' + pad(m[2]) + '-' + pad(m[1]);
    }
    if (/^\d+(\.\d+)?$/.test(s)) return RDJ.versISO(parseFloat(s));
    return null;
  };

  /* ---------- Lecture de l'export ---------- */

  /** Titre de colonne comparable : minuscules, sans accents, espaces ni ponctuation. */
  RDJ.normTitre = (s) =>
    String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

  RDJ.COLONNES = [
    { cle: 'reservation', libelle: 'Réservation', titres: ['reservation'] },
    { cle: 'arrivee', libelle: 'Arrivée', titres: ['arrivee', 'arrival'], obligatoire: true },
    { cle: 'depart', libelle: 'Départ', titres: ['depart', 'departure'], obligatoire: true },
    { cle: 'nomClient', libelle: 'Nom client', titres: ['nomclient', 'guestname'] },
    { cle: 'nbClients', libelle: 'Total clients', titres: ['totalclients', 'totalguests'], obligatoire: true },
    { cle: 'categorie', libelle: 'Catégorie de chambre', titres: ['categoriedechambre', 'roomtype'] },
    { cle: 'chambre', libelle: 'Chambre', titres: ['chambre', 'room'], obligatoire: true },
    { cle: 'mealPlan', libelle: 'Meal plan', titres: ['mealplan', 'forfait'], obligatoire: true },
    { cle: 'statut', libelle: "Statut d'enrg.", titres: ['statutdenrg', 'cistatus'], obligatoire: true },
    { cle: 'rateCode', libelle: 'Date code', titres: ['ratecode', 'codetarifaire'] },
    { cle: 'canal', libelle: 'Client', titres: ['client'] },
    { cle: 'groupeId', libelle: 'ID Groupe', titres: ['idgroupe', 'groupid'] },
    // facultatif : pas encore dans l'export actuel ; utilisé dès qu'une de ces colonnes apparaît
    { cle: 'montantDu', libelle: 'Montant dû', titres: ['montantdu', 'solde', 'soldedu', 'resteapayer', 'resteadu', 'balance', 'balancedue', 'amountdue'] },
  ];

  /** "123,45 €", "1 234.5", "73.300000", 80 -> nombre ; vide ou illisible -> null. */
  RDJ.lireMontant = function (v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    const s = String(v ?? '').replace(/[\s € ]/g, '');
    if (s === '') return null;
    // le dernier « , » ou « . » est la virgule décimale, les autres séparent les milliers :
    // « 73.300000 », « 1,234.50 », « 1.234,50 », « 1 234,50 € »
    const dec = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'));
    const n = parseFloat(dec < 0 ? s : s.slice(0, dec).replace(/[.,]/g, '') + '.' + s.slice(dec + 1));
    return isFinite(n) ? n : null;
  };
  RDJ.formatMontant = (n) =>
    n === null || n === undefined ? '' : n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  const texte = (v) => (v === null || v === undefined ? '' : String(v).trim());

  /** Numéro de chambre au format de l'export : "OO1" (lettre O) -> "001", 44 -> "044". */
  RDJ.normChambre = function (t) {
    let s = texte(t).toUpperCase().replace(/O/g, '0');
    if (/^\d+$/.test(s) && s.length < 3) s = s.padStart(3, '0');
    return s;
  };

  const compareChambres = (a, b) => a.chambre.localeCompare(b.chambre, 'fr', { numeric: true });

  /**
   * Lignes du tableur -> { reservations, manquants, ignorees }.
   * La ligne 1 contient les titres ; une ligne sans numéro de chambre est ignorée.
   */
  RDJ.lireExport = function (lignes, maxLignes) {
    maxLignes = maxLignes || 300;
    const titres = (lignes[0] || []).map(RDJ.normTitre);
    const colonnes = {};
    for (const c of RDJ.COLONNES) colonnes[c.cle] = titres.findIndex((t) => t && c.titres.includes(t));
    const manquants = RDJ.COLONNES.filter((c) => c.obligatoire && colonnes[c.cle] < 0).map((c) => c.libelle);
    if (manquants.length) return { reservations: [], manquants, ignorees: 0 };

    const lire = (ligne, cle) => (colonnes[cle] < 0 ? null : ligne[colonnes[cle]] ?? null);
    const reservations = [];
    let ignorees = 0;
    for (let i = 1; i < lignes.length; i++) {
      const l = lignes[i] || [];
      const chRaw = lire(l, 'chambre');
      if (texte(chRaw) === '') continue;
      if (reservations.length >= maxLignes) { ignorees++; continue; }
      const nb = parseFloat(String(lire(l, 'nbClients') ?? '').replace(',', '.'));
      reservations.push({
        reservation: texte(lire(l, 'reservation')),
        arrivee: RDJ.versISO(lire(l, 'arrivee')),
        depart: RDJ.versISO(lire(l, 'depart')),
        nomClient: texte(lire(l, 'nomClient')),
        nbClients: isFinite(nb) ? nb : 0,
        categorie: texte(lire(l, 'categorie')),
        chambre: typeof chRaw === 'number' ? String(chRaw).padStart(3, '0') : texte(chRaw),
        mealPlan: texte(lire(l, 'mealPlan')),
        statut: texte(lire(l, 'statut')),
        rateCode: texte(lire(l, 'rateCode')),
        canal: texte(lire(l, 'canal')),
        groupeId: texte(lire(l, 'groupeId')),
        montantDu: RDJ.lireMontant(lire(l, 'montantDu')),
      });
    }
    reservations.sort(compareChambres);
    return { reservations, manquants: [], ignorees };
  };

  /* ---------- Rapport des soldes (montant dû) ----------
     Second export, au format encore inconnu : on cherche, dans les 15 premières lignes, une ligne de
     titres avec une colonne de montant et une colonne chambre et/ou réservation. */
  RDJ.COLONNES_SOLDES = {
    chambre: ['chambre', 'room', 'roomnumber', 'numerochambre', 'nchambre', 'ch'],
    reservation: ['reservation', 'numeroreservation', 'nreservation', 'resa', 'confirmation', 'bookingnumber', 'identifiantdudossierdereservation'],
    montant: ['montantdu', 'solde', 'soldedu', 'resteapayer', 'resteadu', 'balance', 'balancedue', 'amountdue', 'du', 'montant', 'totaldu', 'aencaisser', 'restedu'],
  };

  /** Lignes du tableur -> { chambres: {no: montant}, resas: {n°: montant}, lignes, manquants }. */
  RDJ.lireSoldes = function (lignes) {
    const C = RDJ.COLONNES_SOLDES;
    for (let h = 0; h < Math.min(15, lignes.length); h++) {
      const titres = (lignes[h] || []).map(RDJ.normTitre);
      const col = (noms) => titres.findIndex((t) => t && noms.includes(t));
      const iM = col(C.montant), iC = col(C.chambre), iR = col(C.reservation);
      if (iM < 0 || (iC < 0 && iR < 0)) continue;
      const chambres = {}, resas = {};
      let n = 0;
      for (let i = h + 1; i < lignes.length; i++) {
        const l = lignes[i] || [];
        const m = RDJ.lireMontant(l[iM]);
        if (m === null) continue;
        const ch = iC >= 0 ? RDJ.normChambre(typeof l[iC] === 'number' ? String(l[iC]).padStart(3, '0') : l[iC]) : '';
        const re = iR >= 0 ? texte(l[iR]) : '';
        if (!ch && !re) continue;
        // plusieurs lignes pour une même chambre (extras, taxe de séjour…) : on additionne
        if (ch) chambres[ch] = Math.round(((chambres[ch] || 0) + m) * 100) / 100;
        if (re) resas[re] = Math.round(((resas[re] || 0) + m) * 100) / 100;
        n++;
      }
      return { chambres, resas, lignes: n, manquants: [] };
    }
    return { chambres: {}, resas: {}, lignes: 0, manquants: ['Montant dû (ou Solde)', 'Chambre ou Réservation'] };
  };

  /* ---------- Plusieurs rapports importés ensemble ---------- */

  /** Nature d'un fichier : 'clients' (rapport clients présents), 'departs', 'maintenance' ou null.
      L'ordre de RDJ.ORDRE_RAPPORTS est celui de l'import : la nuit vient du rapport clients. */
  RDJ.ORDRE_RAPPORTS = ['clients', 'departs', 'maintenance'];
  RDJ.typeRapport = function (lignes) {
    if (!RDJ.lireExport(lignes).manquants.length) return 'clients';
    if (RDJ.lireSoldes(lignes).lignes) return 'departs';
    if (RDJ.lireMaintenance(lignes, null, true).lignes) return 'maintenance';
    return null;
  };

  /** Rapport des départs ou de maintenance importé il y a moins de `heures` heures pour une autre nuit :
      rattaché à la nuit du nouveau rapport clients (importé dans le désordre). Sinon inchangé. */
  RDJ.rattacherNuit = function (rapport, nuit, maintenant, heures) {
    if (!rapport || !rapport.importeLe || rapport.nuit === nuit) return rapport;
    const ecart = (new Date(maintenant) - new Date(rapport.importeLe)) / 3600000;
    return ecart >= 0 && ecart <= (heures || 12) ? { ...rapport, nuit } : rapport;
  };

  /* ---------- Rapport de maintenance (chambres bloquées) ----------
     Troisième export, facultatif et au format encore inconnu : on cherche, dans les 15 premières lignes,
     une ligne de titres avec une colonne chambre ; motif et dates de blocage sont lus s'ils existent.
     strict : il faut aussi un motif ou une date (sert à reconnaître le fichier déposé dans la fenêtre). */
  RDJ.COLONNES_MAINTENANCE = {
    chambre: ['chambre', 'room', 'roomnumber', 'numerochambre', 'nchambre', 'ch', 'nchambres'],
    motif: ['motif', 'raison', 'cause', 'commentaire', 'commentaires', 'description', 'probleme', 'panne', 'travaux',
      'intervention', 'remarque', 'remarques', 'observation', 'observations', 'note', 'notes', 'reason', 'comment', 'libelle'],
    // « Du » / « Au » ne sont pas reconnus : « Du » est aussi un titre de montant du rapport des soldes
    debut: ['debut', 'datedebut', 'depuis', 'bloquele', 'datedeblocage', 'from', 'startdate', 'debutdublocage'],
    fin: ['fin', 'datefin', 'jusquau', 'jusqua', 'retour', 'finprevue', 'to', 'enddate', 'findublocage', 'remiseenservice'],
  };

  /** Lignes du tableur -> { chambres: {no: { motif, fin }}, lignes, terminees: [no], manquants }.
      Une chambre dont le blocage finit avant la nuit (fin < nuit) n'est pas retenue. */
  RDJ.lireMaintenance = function (lignes, nuit, strict) {
    const C = RDJ.COLONNES_MAINTENANCE;
    for (let h = 0; h < Math.min(15, lignes.length); h++) {
      const titres = (lignes[h] || []).map(RDJ.normTitre);
      const col = (noms) => titres.findIndex((t) => t && noms.includes(t));
      const iC = col(C.chambre), iM = col(C.motif), iD = col(C.debut), iF = col(C.fin);
      if (iC < 0 || (strict && iM < 0 && iD < 0 && iF < 0)) continue;
      const chambres = {};
      const terminees = [];
      let n = 0;
      for (let i = h + 1; i < lignes.length; i++) {
        const l = lignes[i] || [];
        const ch = RDJ.normChambre(typeof l[iC] === 'number' ? String(l[iC]).padStart(3, '0') : l[iC]);
        if (!ch) continue;
        n++;
        const fin = iF >= 0 ? RDJ.versISO(l[iF]) : null;
        if (fin && nuit && fin < nuit) { terminees.push(ch); continue; }
        const motif = iM >= 0 ? texte(l[iM]) : '';
        // plusieurs lignes pour une même chambre : les motifs sont réunis
        const avant = chambres[ch];
        chambres[ch] = {
          motif: avant && avant.motif && motif && avant.motif !== motif ? avant.motif + ' ; ' + motif : (avant && avant.motif) || motif,
          fin: fin || (avant ? avant.fin : null),
        };
      }
      return { chambres, lignes: n, terminees, manquants: [] };
    }
    return { chambres: {}, lignes: 0, terminees: [], manquants: ['Chambre'] };
  };

  /** Ajoute le montant dû des soldes aux réservations (sans écraser un montant déjà présent dans l'export). */
  RDJ.appliquerSoldes = function (reservations, soldes) {
    if (!soldes) return reservations;
    return reservations.map((r) => {
      if (r.montantDu !== null && r.montantDu !== undefined) return r;
      const parResa = r.reservation && soldes.resas ? soldes.resas[r.reservation] : undefined;
      const parCh = soldes.chambres ? soldes.chambres[RDJ.normChambre(r.chambre)] : undefined;
      const m = parResa !== undefined ? parResa : parCh;
      return m === undefined ? r : { ...r, montantDu: m };
    });
  };

  /* ---------- Source de la réservation ---------- */

  RDJ.SOURCE_AUTRE = { code: 'AUT', nom: 'Autre' };
  const sourcesParDefaut = () => (RDJ.CONFIG_DEFAUT && RDJ.CONFIG_DEFAUT.sourcesReservation) || [];

  /** Texte de la colonne « Client » -> { code, nom, brut }. Inconnu -> Autre (nom = texte d'origine). */
  RDJ.sourceReservation = function (canal, sources) {
    const brut = texte(canal);
    const n = RDJ.normTitre(brut);
    const s = (sources || sourcesParDefaut()).find((x) => x.motifs.some((m) => n.startsWith(RDJ.normTitre(m))));
    if (s) return { code: s.code, nom: s.nom, brut };
    return { code: RDJ.SOURCE_AUTRE.code, nom: brut || RDJ.SOURCE_AUTRE.nom, brut };
  };

  /** Comptage par source, dans l'ordre de la configuration, « Autre » en dernier. */
  RDJ.repartitionSources = function (reservations, sources) {
    const liste = sources || sourcesParDefaut();
    const m = new Map(liste.map((s) => [s.code, { code: s.code, nom: s.nom, chambres: 0, clients: 0 }]));
    m.set(RDJ.SOURCE_AUTRE.code, { code: RDJ.SOURCE_AUTRE.code, nom: RDJ.SOURCE_AUTRE.nom, chambres: 0, clients: 0, detail: [] });
    for (const r of reservations) {
      const s = RDJ.sourceReservation(r.canal, liste);
      const e = m.get(s.code);
      e.chambres++;
      e.clients += r.nbClients || 0;
      if (s.code === RDJ.SOURCE_AUTRE.code && s.brut && !e.detail.includes(s.brut)) e.detail.push(s.brut);
    }
    return [...m.values()];
  };

  /* ---------- Règles ---------- */

  RDJ.avecPdj = (mp) => ['BB', 'HB', 'FB'].includes(texte(mp).slice(0, 2).toUpperCase());
  RDJ.estPaye = (r) => texte(r.statut).toUpperCase() === 'P';

  /** Nuit du rapport automatique = arrivée la plus récente (aujourd'hui si aucune donnée). */
  RDJ.dateRapportAuto = function (reservations, aujourdhui) {
    let max = null;
    for (const r of reservations) if (r.arrivee && (!max || r.arrivee > max)) max = r.arrivee;
    return max || aujourdhui || RDJ.aujourdhui();
  };

  /** Date de la cuisson PDJ : import entre 20h et 23h59 -> lendemain ; après minuit -> jour même. */
  RDJ.dateMep = function (importeLe, nuit) {
    if (!importeLe) return RDJ.jours(nuit, 1);
    const jour = importeLe.slice(0, 10);
    const heure = parseInt(importeLe.slice(11, 13), 10) || 0;
    return heure >= 20 ? RDJ.jours(jour, 1) : jour;
  };

  /* ---------- Modifications manuelles du rapport ---------- */
  // Une modification : { chambre, type: 'PAYE' | 'RECOUCHE' | 'DEPART' | 'PDJ' }
  // Elle s'applique à la première réservation de la chambre (comme RECHERCHEV dans Excel).

  function premiereParChambre(reservations) {
    const m = new Map();
    reservations.forEach((r, i) => { if (!m.has(r.chambre)) m.set(r.chambre, i); });
    return m;
  }

  /** La modification change-t-elle quelque chose par rapport à l'import ? */
  RDJ.modifUtile = function (r, type, nuit) {
    const demain = RDJ.jours(nuit, 1);
    switch (type) {
      case 'PAYE': return !RDJ.estPaye(r);
      case 'PDJ': return !RDJ.avecPdj(r.mealPlan);
      case 'RECOUCHE': return !!r.depart && r.depart <= demain;
      case 'DEPART': return !!r.depart && r.depart > demain;
      default: return false;
    }
  };

  /** Garde les modifications encore valables pour ces données (après un réimport). */
  RDJ.nettoyerModifs = function (reservations, modifs, nuit) {
    const idx = premiereParChambre(reservations);
    return (modifs || []).filter((m) => idx.has(m.chambre) && RDJ.modifUtile(reservations[idx.get(m.chambre)], m.type, nuit));
  };

  /** Réservations de l'import avec les modifications appliquées (copie). */
  RDJ.appliquerModifs = function (reservations, modifs, nuit) {
    const res = reservations.map((r) => ({ ...r, modifs: [] }));
    const idx = premiereParChambre(res);
    for (const m of RDJ.nettoyerModifs(reservations, modifs, nuit)) {
      const r = res[idx.get(m.chambre)];
      if (m.type === 'PAYE') r.statut = 'P';
      else if (m.type === 'PDJ') r.mealPlan = 'BB';
      else if (m.type === 'RECOUCHE') r.depart = RDJ.jours(nuit, 2);
      else if (m.type === 'DEPART') r.depart = RDJ.jours(nuit, 1);
      r.modifs.push(m.type);
    }
    return res;
  };

  /* ---------- Chambres ajoutées à la main (après l'import) ---------- */
  // Saisie : { chambre, nom, nbClients, depart, pdj, paye, montantDu }, valable pour la nuit en cours.

  /** Saisie -> réservation au même format que l'import (arrivée = nuit du rapport). */
  RDJ.reservationManuelle = function (a, nuit) {
    return {
      reservation: '', arrivee: nuit, depart: a.depart || RDJ.jours(nuit, 1),
      nomClient: texte(a.nom), nbClients: a.nbClients > 0 ? a.nbClients : 1, categorie: '',
      chambre: RDJ.normChambre(a.chambre), mealPlan: a.pdj ? 'BB' : 'RO', statut: a.paye ? 'P' : '',
      rateCode: '', canal: a.canal || 'DIRECT', groupeId: '', montantDu: a.montantDu ?? null, manuel: true,
    };
  };

  /** Sépare les ajouts encore valables de ceux dont la chambre est arrivée dans l'import. */
  RDJ.nettoyerAjouts = function (reservations, ajouts) {
    const occupees = new Set(reservations.map((r) => RDJ.normChambre(r.chambre)));
    const gardes = [], retires = [];
    for (const a of ajouts || []) (occupees.has(RDJ.normChambre(a.chambre)) ? retires : gardes).push(a);
    return { gardes, retires };
  };

  /** Réservations de l'import + chambres ajoutées (une chambre importée l'emporte toujours). */
  RDJ.avecAjouts = function (reservations, ajouts, nuit) {
    const { gardes } = RDJ.nettoyerAjouts(reservations, ajouts);
    if (!gardes.length) return reservations;
    return [...reservations, ...gardes.map((a) => RDJ.reservationManuelle(a, nuit))].sort(compareChambres);
  };

  /** Chambres du plan (hors cases noires) sans réservation, dans l'ordre du plan. */
  RDJ.chambresLibres = function (plan, reservations) {
    const occupees = new Set(reservations.map((r) => RDJ.normChambre(r.chambre)));
    const libres = [];
    for (const col of plan) for (const c of col) {
      if (typeof c !== 'string') continue;
      const k = RDJ.normChambre(c);
      if (!occupees.has(k)) libres.push(k);
    }
    return libres.sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  };

  /* ---------- Chiffres clés et grille du rapport ---------- */

  RDJ.chiffres = function (reservations, nuit, nbChambres) {
    const demain = RDJ.jours(nuit, 1);
    const c = {
      chambres: reservations.length, clients: 0, departs: 0, recouches: 0, pdj: 0, nonPayees: [], groupeNonPayees: [],
      // détail pour le rapport : individuels qui partent demain avec montant dû (à encaisser),
      // autres individuels en simple liste, groupes réglés en une fois, sans montant
      aEncaisser: [], nonPayeesRestent: [], groupes: [], totalDu: null,
    };
    const parGroupe = new Map();
    for (const r of reservations) {
      c.clients += r.nbClients || 0;
      if (r.depart) { if (r.depart <= demain) c.departs++; else c.recouches++; }
      if (RDJ.avecPdj(r.mealPlan)) c.pdj += r.nbClients || 0;
      if (RDJ.estPaye(r)) continue;
      if (r.groupeId) {
        c.groupeNonPayees.push(r.chambre);
        if (!parGroupe.has(r.groupeId)) parGroupe.set(r.groupeId, []);
        parGroupe.get(r.groupeId).push(r.chambre);
      } else {
        c.nonPayees.push(r.chambre);
        if (!(r.depart && r.depart <= demain)) { c.nonPayeesRestent.push(r.chambre); continue; }
        const montant = r.montantDu ?? null;
        c.aEncaisser.push({ chambre: r.chambre, nom: r.nomClient || '', montant, source: RDJ.sourceReservation(r.canal) });
        if (montant !== null) c.totalDu = (c.totalDu || 0) + montant;
      }
    }
    c.groupes = [...parGroupe].map(([id, chambres]) => ({ id, chambres }));
    c.parSource = RDJ.repartitionSources(reservations);
    c.taux = nbChambres > 0 ? c.chambres / nbChambres : 0;
    return c;
  };

  RDJ.ligneGrille = function (r, nuit) {
    const demain = RDJ.jours(nuit, 1);
    return {
      chambre: r.chambre,
      nom: r.nomClient,
      pers: r.nbClients,
      nuitNo: r.arrivee ? RDJ.ecartJours(nuit, r.arrivee) + 1 : '',
      depart: r.depart,
      partDemain: !!r.depart && r.depart <= demain,
      pdj: RDJ.avecPdj(r.mealPlan),
      paye: RDJ.estPaye(r),
      groupe: !!r.groupeId,
      montantDu: r.montantDu ?? null,
      source: RDJ.sourceReservation(r.canal),
      manuel: !!r.manuel,
      modifs: r.modifs || [],
    };
  };

  /** Grille répartie à parts égales sur 3 blocs. */
  RDJ.grilleRapport = function (reservations, nuit) {
    const lignes = reservations.map((r) => RDJ.ligneGrille(r, nuit));
    const parBloc = Math.max(1, Math.ceil(lignes.length / 3));
    return { parBloc, blocs: [0, 1, 2].map((b) => lignes.slice(b * parBloc, (b + 1) * parBloc)) };
  };

  /** Colonnes « source » du récap : celles de la config, plus « Autre » si une nuit en a. */
  RDJ.colonnesSourcesRecap = function (sources, lignes) {
    const cols = (sources || sourcesParDefaut()).map((s) => ({ code: s.code, nom: s.nom }));
    if ((lignes || []).some((l) => l.sources && l.sources[RDJ.SOURCE_AUTRE.code])) cols.push({ ...RDJ.SOURCE_AUTRE });
    return cols;
  };

  RDJ.ligneRecap = (nuit, c) => ({
    date: nuit, jour: RDJ.jourSemaine(nuit), chambres: c.chambres, clients: c.clients,
    departs: c.departs, recouches: c.recouches, pdj: c.pdj, taux: c.taux,
    // chambres par source { DIR: 25, BKG: 21, … } (absent des nuits enregistrées avant la v2.2)
    sources: Object.fromEntries((c.parSource || []).map((s) => [s.code, s.chambres])),
  });

  /** Ajoute ou remplace la journée dans l'historique (jamais de doublon), trié par date. */
  RDJ.majRecap = function (recap, ligne) {
    const res = (recap || []).filter((l) => l.date !== ligne.date);
    res.push(ligne);
    res.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return res;
  };

  /* ---------- Cuisson PDJ ---------- */

  RDJ.quantitePdj = function (p, nombre, type, coefLoisir) {
    const coef = type === 'loisir' ? (coefLoisir || 1.25) : type === 'business' ? p.coefBusiness : 1;
    const q = (nombre / 100) * p.base * coef * p.facteur;
    return Math.max(0, Math.ceil(q - 1e-9));
  };

  /** Plaques entières nécessaires pour une quantité. */
  RDJ.plaques = (quantite, parPlaque) => (parPlaque > 0 ? Math.ceil(quantite / parPlaque - 1e-9) : 0);

  /** Répartit des pièces entre les fournées (parts en %). Arrondi au supérieur sur le cumul :
      les premières fournées sont servies d'abord, la dernière reçoit le reste. */
  RDJ.fournees = function (plaques, parts) {
    const total = parts.reduce((s, p) => s + p, 0) || 1;
    const res = [];
    let cumul = 0, donne = 0;
    parts.forEach((p, i) => {
      cumul += p;
      const jusque = i === parts.length - 1 ? plaques : Math.min(plaques, Math.ceil((plaques * cumul) / total - 1e-9));
      res.push(jusque - donne);
      donne = jusque;
    });
    return res;
  };

  /* ---------- Feuille femme de chambre ---------- */
  // Corrections du jour : { chambre: 'B' | 'R' | 'BR' | 'HS' | 'X' }  (BR = blanc recouche, X = chambre de l'import retirée)

  RDJ.CYCLE_FDC = { '': 'B', B: 'R', R: 'BR', BR: 'HS', HS: '' };
  RDJ.etatSuivant = (actuel) => (actuel in RDJ.CYCLE_FDC ? RDJ.CYCLE_FDC[actuel] : 'B');

  /** État de chaque chambre du plan : { base (import), etat (affiché), corrige, bloquee, motif }.
      bloquees (rapport de maintenance) : { no: { motif } } ; une chambre bloquée sans client part en HS. */
  RDJ.etatsFdc = function (plan, reservations, nuit, corrections, bloquees) {
    const demain = RDJ.jours(nuit, 1);
    const parCh = new Map();
    for (const r of reservations) {
      const k = RDJ.normChambre(r.chambre);
      if (!parCh.has(k)) parCh.set(k, r);
    }
    const etats = {};
    for (const colonne of plan) {
      for (const cell of colonne) {
        const no = typeof cell === 'string' ? cell : cell.no;
        if (typeof cell !== 'string' && cell.noir) continue;
        const k = RDJ.normChambre(no);
        const r = parCh.get(k);
        const bloc = (bloquees || {})[k];
        // une chambre bloquée mais occupée garde l'état de son client (signalé à l'import)
        const base = r && r.depart ? (r.depart <= demain ? 'B' : 'R') : bloc ? 'HS' : '';
        const corr = (corrections || {})[k];
        etats[k] = { base, etat: corr ? (corr === 'X' ? '' : corr) : base, corrige: !!corr, bloquee: !!bloc, motif: bloc ? bloc.motif || '' : '' };
      }
    }
    return etats;
  };

  /** Nouvelle valeur de correction après un clic : null = plus de correction. */
  RDJ.correctionApres = function (nouveau, base) {
    if (nouveau === base) return null;
    return nouveau === '' ? 'X' : nouveau;
  };

  /** Chambres de l'export absentes du plan (ou sur une case noire). */
  RDJ.chambresHorsPlan = function (plan, reservations) {
    const ok = new Set();
    for (const col of plan) for (const c of col) if (typeof c === 'string') ok.add(RDJ.normChambre(c));
    return [...new Set(reservations.map((r) => r.chambre))].filter((ch) => !ok.has(RDJ.normChambre(ch)));
  };

  /* ---------- Plan des chambres par étage ---------- */

  const NOMS_ETAGES = { 0: 'Rez-de-chaussée', 1: '1er étage' };
  RDJ.nomEtage = (n) => NOMS_ETAGES[n] || n + 'e étage';

  /**
   * Étages et ailes déduits du plan : étage = 1er chiffre du numéro (005 -> RDC, 216 -> 2e),
   * nouvelle aile quand la numérotation saute de plus de 10 (216-229 puis 258-271).
   * Les cases noires (chambres inexistantes) sont ignorées.
   */
  RDJ.planEtages = function (plan, dispositions) {
    const auto = RDJ.planEtagesAuto(plan);
    const dispo = dispositions || {};
    // un numéro -> chambre ; un objet { local } -> local qui n'est pas une chambre (bureau, lingerie…)
    const norm = (l) => (l || []).map((c) => (c && typeof c === 'object'
      ? (c.cage ? { cage: true } : { local: c.local, detail: c.detail || '', largeur: c.largeur || 1, petit: !!c.petit })
      : RDJ.normChambre(c)));
    return auto.map((e) => {
      const d = dispo[e.etage];
      if (!d || !d.length) return e;
      // droite : locaux sur toute la hauteur de l'aile, après la cage (accueil, combles…)
      const ailes = d.map((a) => ({ haut: norm(a.haut), bas: norm(a.bas), hautLib: a.hautLib || '', basLib: a.basLib || '',
        droite: norm(a.droite).filter((c) => typeof c === 'object' && !c.cage) }));
      // chambres du plan oubliées dans la disposition : ajoutées dans une aile à part, pour n'en perdre aucune
      const vues = new Set(ailes.flatMap((a) => [...a.haut, ...a.bas]));
      const oubliees = e.ailes.flatMap((a) => [...a.haut, ...a.bas]).filter((n) => !vues.has(n));
      if (oubliees.length) ailes.push(aileAuto(oubliees));
      return { ...e, ailes };
    });
  };

  const aileAuto = (nos) => ({
    haut: nos.filter((n) => parseInt(n, 10) % 2 === 1), bas: nos.filter((n) => parseInt(n, 10) % 2 === 0), hautLib: '', basLib: '',
  });
  /* ---------- Types de chambre ---------- */

  /** Types : valeurs par défaut de la config, remplacées par les réglages ('' = pas de type). */
  RDJ.typesChambres = function (defaut, reglages) {
    const res = {};
    for (const [k, v] of Object.entries(defaut || {})) res[RDJ.normChambre(k)] = v;
    for (const [k, v] of Object.entries(reglages || {})) res[RDJ.normChambre(k)] = v;
    for (const k of Object.keys(res)) if (!res[k]) delete res[k];
    return res;
  };

  /** Type déduit de la catégorie de l'export : "BSTD----1Q" -> '1Q' (si ce code existe). */
  RDJ.typeDepuisCategorie = function (categorie, types) {
    const fin = texte(categorie).toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean).pop() || '';
    return (types || []).some((t) => t.code === fin) ? fin : '';
  };

  /** Chambres sans type -> type déduit de l'import. Renvoie { chambre: type } des seuls ajouts. */
  RDJ.completerTypes = function (actuels, reservations, types) {
    const ajouts = {};
    for (const r of reservations) {
      const k = RDJ.normChambre(r.chambre);
      if (actuels[k] || ajouts[k]) continue;
      const t = RDJ.typeDepuisCategorie(r.categorie, types);
      if (t) ajouts[k] = t;
    }
    return ajouts;
  };

  /** { chambre: chambre communicante } dans les deux sens. */
  RDJ.communicantes = function (paires) {
    const m = {};
    for (const [a, b] of paires || []) {
      const x = RDJ.normChambre(a), y = RDJ.normChambre(b);
      m[x] = y; m[y] = x;
    }
    return m;
  };

  /** ['330', '333', '334', '335'] -> '330, 333 à 335' (numéros qui se suivent réunis). */
  RDJ.plagesChambres = function (nos) {
    const tri = [...nos].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    const plages = [];
    for (const no of tri) {
      const der = plages[plages.length - 1];
      if (der && /^\d+$/.test(no) && /^\d+$/.test(der.fin) && parseInt(no, 10) === parseInt(der.fin, 10) + 1) der.fin = no;
      else plages.push({ debut: no, fin: no });
    }
    return plages.map((p) => (p.debut === p.fin ? p.debut : p.debut + (parseInt(p.fin, 10) - parseInt(p.debut, 10) > 1 ? ' à ' : ', ') + p.fin)).join(', ');
  };

  /** Chambres bloquées par la maintenance, regroupées par motif (casse et accents ignorés) :
      [{ motif, chambres: [no…] }], le motif le plus fréquent d'abord. */
  RDJ.grouperBloquees = function (bloquees) {
    const groupes = new Map();
    for (const [no, motif] of bloquees) {
      let lib = texte(motif) || 'Sans motif';
      if (lib === lib.toUpperCase()) lib = lib.toLowerCase(); // « CHAMBRE MISE SOUS SCELÉ » -> « Chambre mise sous scellé »
      const cle = RDJ.normTitre(lib);
      if (!groupes.has(cle)) groupes.set(cle, { motif: lib.charAt(0).toUpperCase() + lib.slice(1), chambres: [] });
      groupes.get(cle).chambres.push(no);
    }
    return [...groupes.values()].sort((a, b) => b.chambres.length - a.chambres.length || a.motif.localeCompare(b.motif, 'fr'));
  };

  RDJ.chambresEtage = (e) => e.ailes.flatMap((a) => [...a.haut, ...a.bas]).filter((c) => typeof c === 'string');
  RDJ.largeurRang = (rang) => rang.reduce((s, c) => s + (typeof c === 'string' ? 1 : c.cage ? 0 : c.largeur), 0);
  /** Rangée coupée à la cage d'escalier : [avant, après] (après = [] s'il n'y a rien). */
  RDJ.couperCage = (rang) => {
    const i = rang.findIndex((c) => c && c.cage);
    return i < 0 ? [rang, null] : [rang.slice(0, i), rang.slice(i + 1)];
  };

  RDJ.planEtagesAuto = function (plan) {
    const nos = [];
    for (const col of plan) for (const c of col) if (typeof c === 'string') nos.push(RDJ.normChambre(c));
    const tri = [...new Set(nos)].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    const etages = new Map();
    for (const no of tri) {
      const n = /^\d{3}$/.test(no) ? Number(no[0]) : 0;
      if (!etages.has(n)) etages.set(n, []);
      const ailes = etages.get(n);
      const der = ailes.length ? ailes[ailes.length - 1] : null;
      const prec = der ? parseInt(der[der.length - 1], 10) : NaN;
      if (!der || !(parseInt(no, 10) - prec <= 10)) ailes.push([no]);
      else der.push(no);
    }
    return [...etages].sort((a, b) => b[0] - a[0]).map(([n, ailes]) => ({ etage: n, nom: RDJ.nomEtage(n), ailes: ailes.map(aileAuto) }));
  };

  /**
   * Statut de chaque chambre pour le plan : celui de la feuille de chambre (corrections comprises)
   * — 'depart' (B), 'recouche' (R), 'hs', 'libre' — plus les infos de la réservation.
   */
  RDJ.statutsChambres = function (reservations, etatsFdc, nuit) {
    const demain = RDJ.jours(nuit, 1);
    const parCh = new Map();
    for (const r of reservations) { const k = RDJ.normChambre(r.chambre); if (!parCh.has(k)) parCh.set(k, r); }
    const res = {};
    for (const k in etatsFdc) {
      const e = etatsFdc[k].etat;
      const resa = parCh.get(k) || null;
      // chambre sans client mise en B sur la feuille de chambre = chambre sale, à faire
      // BR (blanc recouche) : le client reste, la chambre est refaite à blanc -> recouche sur le plan
      const statut = e === 'B' ? (resa ? 'depart' : 'sale') : e === 'R' || e === 'BR' ? (resa ? 'recouche' : 'sale') : e === 'HS' ? 'hs' : 'libre';
      const r = statut === 'depart' || statut === 'recouche' ? resa : null;
      res[k] = {
        statut, corrige: etatsFdc[k].corrige, sansClient: !resa,
        bloquee: !!etatsFdc[k].bloquee, motif: etatsFdc[k].motif || '',
        nom: r ? r.nomClient : '', pers: r ? r.nbClients : 0,
        arrivee: !!r && r.arrivee === nuit, depart: r ? r.depart : null,
        pdj: !!r && RDJ.avecPdj(r.mealPlan), nonPaye: !!r && !RDJ.estPaye(r), groupe: !!r && !!r.groupeId,
        source: r ? RDJ.sourceReservation(r.canal) : null,
        manuel: !!r && !!r.manuel, partDemain: !!r && !!r.depart && r.depart <= demain,
      };
    }
    return res;
  };

  /** Double-clic sur une chambre libre du plan : libre -> sale (B) -> hors service -> libre. */
  RDJ.CYCLE_PLAN = { '': 'B', B: 'HS', HS: '' };
  RDJ.etatSuivantPlan = (actuel) => (actuel in RDJ.CYCLE_PLAN ? RDJ.CYCLE_PLAN[actuel] : '');

  RDJ.compteursFdc = function (etats, nv) {
    const c = { B: 0, R: 0, BR: 0, HS: 0, NV: 0 };
    for (const k in etats) if (etats[k].etat in c) c[etats[k].etat]++;
    for (const k in nv || {}) if (nv[k]) c.NV++;
    c.total = c.B + c.R + c.BR;
    return c;
  };
})();
