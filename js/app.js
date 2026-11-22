/* Rapport du jour — © 2026, tous droits réservés. Reproduction interdite sans autorisation (voir LICENSE). */
/* Application : état, navigation, actions des boutons, impression. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});
  const $ = (sel) => document.querySelector(sel);

  let etat = RDJ.store.charger();
  let vue = 'accueil';
  try { vue = sessionStorage.getItem('rdj.vue') || 'accueil'; } catch (e) { /* sans importance */ }
  // sous-onglet de l'onglet PDJ : 'cuisson', 'buffet' ou 'commande' (retenu pendant la session)
  let pdjSous = 'cuisson';
  try { pdjSous = sessionStorage.getItem('rdj.pdjSous') || 'cuisson'; } catch (e) { /* sans importance */ }
  function choisirPdj(s) {
    pdjSous = s;
    try { sessionStorage.setItem('rdj.pdjSous', s); } catch (e) { /* sans importance */ }
    afficher();
  }
  /* ---------- Code d'accès aux Réglages ----------
     Protection dissuasive (l'appli n'a pas de serveur) : le code n'est jamais gardé, seulement son empreinte
     SHA-256 salée, dans ce navigateur (clé à part : pas dans les sauvegardes .json). Une fois déverrouillés,
     les Réglages restent ouverts 10 minutes après la dernière action, et se referment avec l'onglet du navigateur. */
  const PIN_CLE = 'rdj.pin', OUVERT_CLE = 'rdj.reglagesOuverts', DUREE_OUVERT = 10 * 60 * 1000;
  let essaisRates = 0, bloqueJusqua = 0;
  function pinInfo() {
    try { return JSON.parse(localStorage.getItem(PIN_CLE) || 'null'); } catch (e) { return null; }
  }
  const empreinte = (sel, code) => RDJ.sha256(sel + ':' + code);
  function reglagesOuverts() {
    if (!pinInfo()) return true;
    try { return Date.now() - (+sessionStorage.getItem(OUVERT_CLE) || 0) < DUREE_OUVERT; } catch (e) { return false; }
  }
  function prolongerReglages() {
    try { sessionStorage.setItem(OUVERT_CLE, String(Date.now())); } catch (e) { /* sans importance */ }
  }
  function verrouillerReglages() {
    try { sessionStorage.removeItem(OUVERT_CLE); } catch (e) { /* sans importance */ }
  }
  function aleatoire(n, alphabet) {
    const t = new Uint32Array(n);
    crypto.getRandomValues(t);
    return Array.from(t, (x) => alphabet[x % alphabet.length]).join('');
  }

  // sous-onglet de l'onglet Réglages : 'parametres' ou 'changelog' (le Change log n'a plus d'onglet à lui)
  let reglagesSous = 'parametres';
  try { reglagesSous = sessionStorage.getItem('rdj.reglagesSous') || 'parametres'; } catch (e) { /* sans importance */ }
  if (vue === 'changelog') { vue = 'reglages'; reglagesSous = 'changelog'; }
  function choisirReglages(s) {
    reglagesSous = s;
    try { sessionStorage.setItem('rdj.reglagesSous', s); } catch (e) { /* sans importance */ }
    afficher();
  }

  /* ---------- Contexte calculé ---------- */

  function config() {
    const cfg = { ...RDJ.CONFIG_DEFAUT };
    const r = etat.reglages || {};
    if (r.hotel) cfg.hotel = r.hotel;
    if (r.nbChambres > 0) cfg.nbChambres = r.nbChambres;
    if (r.nbExemplairesFdc > 0) cfg.nbExemplairesFdc = r.nbExemplairesFdc;
    cfg.types = RDJ.typesChambres(cfg.typesChambresDefaut, r.typesChambres);
    // cuisson PDJ : pièces par plaque, parts des deux premières fournées (réserve = reste)
    if (r.piecesParPlaque > 0) cfg.piecesParPlaque = r.piecesParPlaque;
    const parts = cfg.fournees.map((f) => f.part);
    if (Number.isFinite(r.fournee1)) parts[0] = r.fournee1;
    if (Number.isFinite(r.fournee2)) parts[1] = r.fournee2;
    parts[2] = Math.max(0, 100 - parts[0] - parts[1]);
    cfg.fournees = cfg.fournees.map((f, i) => ({ ...f, part: parts[i] }));
    // feuilles de « Imprimer tout » (Réglages) : rapport, feuille de chambre et cuisson PDJ par défaut
    cfg.rectoVerso = !!r.rectoVerso;
    cfg.impressionNuit = { rapport: true, fdc: true, pdj: true, plan: false, recap: false, ...(r.impressionNuit || {}) };
    // horaires clés (pied de page de l'accueil) : valeur saisie dans Réglages, sinon valeur de départ ; '' = masqué
    cfg.horairesValeurs = Object.fromEntries(cfg.horaires.map((h) => [h.id, (r.horaires && h.id in r.horaires) ? r.horaires[h.id] : h.defaut]));
    return cfg;
  }

  function contexte() {
    const cfg = config();
    const brut = etat.import ? etat.import.reservations : [];
    const nuit = etat.dateRapportManuelle || RDJ.dateRapportAuto(brut);
    // montants dus du rapport des soldes, s'il a été importé pour cette nuit
    const soldes = etat.soldes && etat.soldes.nuit === nuit ? etat.soldes : null;
    const raw = RDJ.appliquerSoldes(brut, soldes);
    const memeNuit = etat.modifs.nuit === nuit;
    const modifs = memeNuit ? etat.modifs.liste : [];
    const ajouts = memeNuit ? RDJ.nettoyerAjouts(raw, etat.modifs.ajouts).gardes : [];
    const base = RDJ.avecAjouts(raw, ajouts, nuit);
    const eff = RDJ.appliquerModifs(base, modifs, nuit);
    const chiffres = RDJ.chiffres(eff, nuit, cfg.nbChambres);
    const fdc = etat.fdc.nuit === nuit ? etat.fdc : { corrections: {}, nv: {} };
    // chambres bloquées du rapport de maintenance, s'il a été importé pour cette nuit
    const maintenance = etat.maintenance && etat.maintenance.nuit === nuit ? etat.maintenance : null;
    const etatsFdc = RDJ.etatsFdc(cfg.planFdc, eff, nuit, fdc.corrections, maintenance && maintenance.chambres);
    const pdjManuel = etat.pdj.nombre !== null && etat.pdj.nombre !== undefined;
    // rapport des arrivées : montré tant que son jour d'arrivée n'est pas passé (le lendemain de la nuit, en général)
    const arrivees = etat.arrivees && etat.arrivees.date && etat.arrivees.date >= nuit ? etat.arrivees : null;
    return {
      etat, cfg, raw, nuit, modifs, soldes, maintenance, arrivees, ajouts, base, eff, chiffres, fdc, etatsFdc,
      disponibles: RDJ.disponiblesParType(etatsFdc, cfg.types),
      aPreparer: arrivees ? RDJ.aPreparerParType(etatsFdc, cfg.types, arrivees.parType) : {},
      chambresLibres: RDJ.chambresLibres(cfg.planFdc, base),
      dateManuelle: !!etat.dateRapportManuelle,
      grille: RDJ.grilleRapport(eff, nuit),
      compteursFdc: RDJ.compteursFdc(etatsFdc, fdc.nv),
      horsPlan: RDJ.chambresHorsPlan(cfg.planFdc, raw),
      mep: RDJ.dateMep(etat.import && etat.import.importeLe, nuit),
      pdjManuel,
      pdjNombre: pdjManuel ? etat.pdj.nombre : chiffres.pdj,
      pdjType: etat.pdj.type || 'business',
      pdjSous,
      reglagesSous,
      pinDefini: !!pinInfo(),
      reglagesOuverts: reglagesOuverts(),
      maj,
    };
  }

  function enregistrer() {
    if (!RDJ.store.enregistrer(etat)) {
      notice("Impossible d'enregistrer dans ce navigateur (stockage plein ou désactivé). Téléchargez une sauvegarde.", 'erreur');
    }
  }

  /* ---------- Affichage ---------- */

  const ECRANS = {
    accueil: RDJ.vues.ecranAccueil,
    rapport: RDJ.vues.ecranRapport,
    fdc: RDJ.vues.ecranFdc,
    plan: RDJ.vues.ecranPlan,
    pdj: RDJ.vues.ecranPdj,
    recap: RDJ.vues.ecranRecap,
    reglages: (ctx) => (!ctx.reglagesOuverts ? RDJ.vues.ecranVerrou(ctx)
      : ctx.reglagesSous === 'changelog' ? RDJ.vues.ecranChangelog(ctx) : RDJ.vues.ecranReglages(ctx)),
  };

  function afficher() {
    if (!ECRANS[vue]) vue = 'accueil';
    // Réglages ouverts : chaque affichage (clic, saisie) repousse le reverrouillage de 10 minutes
    if (vue === 'reglages' && pinInfo() && reglagesOuverts()) prolongerReglages();
    const ctx = contexte();
    $('#vue').innerHTML = ECRANS[vue](ctx);
    document.querySelectorAll('#onglets button').forEach((b) => b.classList.toggle('actif', b.dataset.vue === vue));
    document.title = 'Rapport du jour · ' + RDJ.dateFr(ctx.nuit);
    ajouterChoixAffichage();
    ajusterFeuilles();
  }

  /* ---------- Taille des feuilles à l'écran ----------
     Les feuilles ont la taille d'un A4 (en mm). À l'écran on les agrandit ou réduit selon la fenêtre
     (portable, Full HD, ultra-large) ; l'impression n'est pas concernée.
     ajuster : page paysage entière visible (largeur et hauteur) mais au moins 2/3 de la largeur de la fenêtre,
               page portrait à la largeur (max 150 %)
     largeur : toute la largeur de la fenêtre · un nombre (50 à 250) : zoom choisi au curseur, en % */
  const ZOOM_MIN = 50, ZOOM_MAX = 250, ZOOM_PAS = 5;
  function modeAffichage() {
    try { return localStorage.getItem('rdj.affichage') || 'ajuster'; } catch (e) { return 'ajuster'; }
  }
  function choisirAffichage(m) {
    try { localStorage.setItem('rdj.affichage', String(m)); } catch (e) { /* sans importance */ }
    ajusterFeuilles();
  }

  /** Barre de taille des feuilles : « Ajuster » (à l'écran), « Largeur », curseur de zoom avec − / +. */
  function ajouterChoixAffichage() {
    const outils = document.querySelector('#vue .outils');
    if (!outils || !document.querySelector('#vue .papier')) return;
    const d = document.createElement('div');
    d.className = 'choix-affichage';
    d.innerHTML = `<span class="ca-lib">Taille</span>
      <button type="button" class="ca-mode" data-action="zoom-ajuster" title="Feuille adaptée à l'écran">Ajuster</button>
      <button type="button" class="ca-mode" data-action="zoom-largeur" title="Toute la largeur de la fenêtre">Largeur</button>
      <button type="button" class="ca-pas" data-action="zoom-moins" aria-label="Réduire la feuille">−</button>
      <input type="range" id="zoom-feuille" min="${ZOOM_MIN}" max="${ZOOM_MAX}" step="${ZOOM_PAS}" aria-label="Taille de la feuille à l'écran">
      <button type="button" class="ca-pas" data-action="zoom-plus" aria-label="Agrandir la feuille">+</button>
      <output class="ca-valeur" for="zoom-feuille"></output>`;
    outils.appendChild(d);
  }

  /** Zoom de la feuille affichée (en %), pour partir de la taille actuelle avec − / + ou le curseur. */
  const zoomActuel = () => {
    const f = document.querySelector('#vue .papier .feuille');
    return f ? Math.round((parseFloat(f.style.zoom) || 1) * 100) : 100;
  };
  const pasZoom = (sens) => {
    const z = Math.round(zoomActuel() / ZOOM_PAS) * ZOOM_PAS + sens * ZOOM_PAS * 2;
    choisirAffichage(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)));
  };

  function ajusterFeuilles() {
    const mode = modeAffichage();
    document.querySelectorAll('#vue .papier').forEach((p) => {
      const f = p.querySelector('.feuille');
      if (!f) return;
      f.style.zoom = 1;
      if (/^\d+$/.test(mode)) { f.style.zoom = (Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, +mode)) / 100).toFixed(3); return; }
      const cs = getComputedStyle(p);
      const largeur = (p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 4) / f.offsetWidth;
      const haut = p.getBoundingClientRect().top + window.scrollY;
      const hauteur = Math.max(300, window.innerHeight - haut - 24 - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / f.offsetHeight;
      const paysage = f.classList.contains('paysage');
      // page paysage : au moins les deux tiers de la fenêtre en largeur, quitte à défiler un peu
      const deuxTiers = (window.innerWidth * 2 / 3) / f.offsetWidth;
      let z = mode === 'largeur' ? largeur : paysage ? Math.min(largeur, Math.max(hauteur, deuxTiers)) : Math.min(largeur, 1.5);
      z = Math.max(0.5, Math.min(z, 3));
      f.style.zoom = z.toFixed(3);
    });
    // la barre suit la taille réelle, même en mode automatique
    const z = zoomActuel();
    const curseur = document.getElementById('zoom-feuille');
    if (curseur) curseur.value = z;
    const val = document.querySelector('.choix-affichage .ca-valeur');
    if (val) val.textContent = z + ' %';
    document.querySelectorAll('.choix-affichage .ca-mode').forEach((b) => {
      const actif = b.dataset.action === 'zoom-' + mode;
      b.classList.toggle('actif', actif);
      b.setAttribute('aria-pressed', actif ? 'true' : 'false');
    });
  }

  let minuterieTaille = null;
  window.addEventListener('resize', () => {
    clearTimeout(minuterieTaille);
    minuterieTaille = setTimeout(ajusterFeuilles, 120);
  });

  function aller(v) {
    vue = v;
    try { sessionStorage.setItem('rdj.vue', v); } catch (e) { /* sans importance */ }
    afficher();
    window.scrollTo(0, 0);
  }

  /* ---------- Sauvegarde .json ----------
     Dans le sous-dossier « save » du dossier de l'appli quand il a été choisi (Chrome / Edge, 10 dernières gardées),
     sinon téléchargée. demander : true pendant un clic (le navigateur peut redemander l'accès au dossier). */
  async function sauverEtat(suffixe, demander) {
    let ou = null;
    try { ou = await RDJ.dossierSauv.ecrire(etat, suffixe, demander); } catch (e) { ou = null; }
    if (ou) return ou;
    RDJ.store.exporter(etat, suffixe);
    return 'dossier Téléchargements';
  }

  async function choisirDossierSauv() {
    const ok = await dialogue({
      titre: 'Dossier des sauvegardes',
      message: "Choisissez le dossier de l'application, celui qui contient index.html.\nLes sauvegardes iront dans son sous-dossier « save » (créé s'il n'existe pas) ; seules les " + RDJ.dossierSauv.GARDER + ' dernières sont gardées.',
      ok: 'Choisir le dossier',
    });
    if (!ok) return false;
    try { await RDJ.dossierSauv.choisir(); return true; } catch (e) {
      notice("Aucun dossier choisi : rien n'a été sauvegardé.", 'alerte');
      return false;
    }
  }

  /* ---------- Mise à jour depuis GitHub (Réglages) ----------
     maj : null (pas encore vérifié) ou { etat: 'verif' | 'ajour' | 'dispo' | 'install' | 'erreur', version, nouveautes, message } */
  let maj = null;

  async function majVerifier(silencieux) {
    if (!silencieux) { maj = { etat: 'verif' }; if (vue === 'accueil') afficher(); }
    try {
      const r = await RDJ.maj.verifier();
      try { localStorage.setItem('rapportDuJour.majVerifiee', RDJ.aujourdhui()); } catch (e) { /* sans importance */ }
      // vérification automatique : on ne dit rien si l'appli est à jour
      if (silencieux && !r.nouveautes.length) return;
      maj = { etat: r.nouveautes.length ? 'dispo' : 'ajour', version: r.version, nouveautes: r.nouveautes };
      if (silencieux && vue !== 'accueil') notice('Nouvelle version ' + r.version + ' disponible : voir l\'accueil.', 'info');
    } catch (e) {
      if (silencieux) return;
      maj = { etat: 'erreur', message: e.message };
    }
    if (vue === 'accueil') afficher();
  }

  /** Dossier de l'appli pour la mise à jour : celui des sauvegardes, s'il contient index.html ; sinon on le redemande. */
  async function majRacine() {
    let h = await RDJ.maj.racineAppli();
    if (h) return h;
    const ok = await dialogue({
      titre: "Dossier de l'application",
      message: "Pour se mettre à jour, l'application doit pouvoir écrire dans son dossier.\nChoisissez le dossier qui contient index.html (les sauvegardes iront dans son sous-dossier « save »).",
      ok: 'Choisir le dossier',
    });
    if (!ok) return null;
    try { await RDJ.dossierSauv.choisir(); } catch (e) { return null; }
    h = await RDJ.maj.racineAppli();
    if (!h) notice("Ce dossier ne contient pas index.html : choisissez le dossier de l'application.", 'erreur');
    return h;
  }

  /** Vérification automatique à l'ouverture, au plus une fois par jour ; sans Internet, rien n'est signalé. */
  function majAuto() {
    if (!RDJ.maj.possible() || !navigator.onLine) return;
    let deja = null;
    try { deja = localStorage.getItem('rapportDuJour.majVerifiee'); } catch (e) { /* sans importance */ }
    if (deja !== RDJ.aujourdhui()) majVerifier(true);
  }

  let minuterie = null;
  function notice(texte, type) {
    const n = $('#notice');
    n.className = 'notice ' + (type || 'info');
    n.innerHTML = RDJ.vues.esc(texte).replace(/\n/g, '<br>') + '<button class="fermer" aria-label="Fermer">×</button>';
    n.hidden = false;
    clearTimeout(minuterie);
    // les messages (dont le bilan d'import) s'effacent après 5 s ; les erreurs restent jusqu'au clic sur ×
    if (type !== 'erreur') minuterie = setTimeout(() => { n.hidden = true; }, 5000);
  }

  /* ---------- Boîte de dialogue ----------
     Remplace confirm() / prompt(), bloqués dans certains navigateurs (ils répondent « non »
     sans rien afficher). Renvoie true/false, ou le texte saisi / null si opts.saisie. */
  function dialogue(opts) {
    return new Promise((resolve) => {
      const d = $('#dialogue');
      const esc = RDJ.vues.esc;
      d.innerHTML = `
        <form method="dialog">
          <h2>${esc(opts.titre)}</h2>
          <p>${esc(opts.message || '').replace(/\n/g, '<br>')}</p>
          ${opts.saisie !== undefined ? `<input type="${opts.type || 'text'}" value="${esc(opts.saisie)}" ${opts.type === 'number' ? 'min="1" max="50"' : ''} autocomplete="off">` : ''}
          <div class="boutons">
            ${opts.info ? '' : '<button value="non" class="btn">Annuler</button>'}
            <button value="oui" class="btn ${opts.danger ? 'danger-plein' : 'primaire'}">${esc(opts.ok || 'Confirmer')}</button>
          </div>
        </form>`;
      const champ = d.querySelector('input');
      if (champ) {
        champ.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); d.close('oui'); }
        });
      }
      d.returnValue = '';
      d.addEventListener('close', () => {
        const oui = d.returnValue === 'oui';
        resolve(champ ? (oui ? champ.value : null) : oui);
      }, { once: true });
      d.showModal();
      (champ || d.querySelector('button[value=oui]')).focus();
      if (champ) champ.select();
    });
  }

  /* ---------- Import ---------- */

  /** Fin d'un import : message et onglet, ou bilan seul quand plusieurs fichiers sont importés ensemble. */
  function finImport(bilan, niveau, vue, silencieux) {
    if (silencieux) return { bilan, niveau };
    aller(vue);
    notice(bilan, niveau);
    return true;
  }

  /** opts.lignes : fichier déjà lu ; opts.silencieux : renvoie { bilan, niveau } sans message (import groupé). */
  async function importer(fichier, opts) {
    const silencieux = !!(opts && opts.silencieux);
    let lignes = opts && opts.lignes;
    if (!lignes) {
      try {
        lignes = await RDJ.lireFichierTableur(fichier);
      } catch (err) {
        notice('Import impossible : ' + err.message, 'erreur');
        return false;
      }
    }
    const lu = RDJ.lireExport(lignes);
    // pas le rapport clients présents mais un rapport des soldes ou de maintenance (glisser-déposer) : on l'importe comme tel
    if (lu.manquants.length && RDJ.lireSoldes(lignes).lignes) return enregistrerSoldes(fichier, RDJ.lireSoldes(lignes), silencieux);
    if (lu.manquants.length && RDJ.lireArrivees(lignes).lignes) return enregistrerArrivees(fichier, RDJ.lireArrivees(lignes, config().typesChambre), silencieux);
    if (lu.manquants.length && RDJ.lireMaintenance(lignes, contexte().nuit, true).lignes) {
      return enregistrerMaintenance(fichier, RDJ.lireMaintenance(lignes, contexte().nuit, true), silencieux);
    }
    if (lu.manquants.length) {
      notice('Ce fichier ne ressemble pas au rapport du jour.\nColonnes introuvables : ' + lu.manquants.join(', '), 'erreur');
      return false;
    }

    etat.import = { fichier: fichier.name, importeLe: RDJ.maintenantLocal(), reservations: lu.reservations };
    etat.dateRapportManuelle = null;
    etat.pdj.nombre = null;
    const nuit = RDJ.dateRapportAuto(lu.reservations);

    // départs / maintenance importés juste avant (dans le désordre) : rattachés à cette nuit
    const maintenant = RDJ.maintenantLocal();
    const rattaches = [];
    for (const [cle, nom] of [['soldes', 'rapport des départs'], ['maintenance', 'rapport de maintenance']]) {
      const r = RDJ.rattacherNuit(etat[cle], nuit, maintenant);
      if (r !== etat[cle]) { etat[cle] = r; rattaches.push(nom); }
    }

    // modifications, ajouts et corrections : gardés si l'on réimporte la même nuit, oubliés sinon ;
    // une chambre ajoutée à la main qui arrive dans l'import est remplacée par celle de l'import
    let ajoutsRetires = [];
    if (etat.modifs.nuit === nuit) {
      const aj = RDJ.nettoyerAjouts(lu.reservations, etat.modifs.ajouts);
      ajoutsRetires = aj.retires.map((a) => a.chambre);
      etat.modifs.ajouts = aj.gardes;
      const base = RDJ.avecAjouts(lu.reservations, aj.gardes, nuit);
      etat.modifs.liste = RDJ.nettoyerModifs(base, etat.modifs.liste, nuit);
    } else etat.modifs = { nuit, liste: [], ajouts: [] };
    if (etat.fdc.nuit !== nuit) etat.fdc = { nuit, corrections: {}, nv: {} };
    if (etat.pdj.nuit !== nuit) { etat.pdj.nuit = nuit; etat.pdj.complements = {}; }

    const ctx = contexte();
    etat.recap = RDJ.majRecap(etat.recap, RDJ.ligneRecap(nuit, ctx.chiffres));
    enregistrer();

    let bilan = lu.reservations.length + ' chambres importées (nuit du ' + RDJ.dateFr(nuit) + ').\n' +
      'Feuille de chambre : ' + ctx.compteursFdc.B + ' B et ' + ctx.compteursFdc.R + ' R.  Nuit enregistrée dans l\'historique.';
    if (lu.ignorees) bilan += '\nAttention : ' + lu.ignorees + ' lignes au-delà de 300 ont été ignorées.';
    if (ctx.horsPlan.length) bilan += '\nChambres absentes de la feuille de chambre : ' + ctx.horsPlan.join(', ');
    if (ajoutsRetires.length) bilan += '\nChambres ajoutées à la main désormais dans l\'import (ajout retiré) : ' + ajoutsRetires.join(', ');
    if (ctx.ajouts.length) bilan += '\nChambres ajoutées à la main conservées : ' + ctx.ajouts.map((a) => a.chambre).join(', ');
    if (rattaches.length) {
      const s = rattaches.length > 1 ? 's' : '';
      bilan += '\n' + maj1(rattaches.join(' et ')) + ' importé' + s + ' juste avant : rattaché' + s + ' à cette nuit.';
    }
    return finImport(bilan, ctx.horsPlan.length || lu.ignorees || ajoutsRetires.length ? 'alerte' : 'ok', 'rapport', silencieux);
  }
  const maj1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /** Plusieurs fichiers d'un coup (glisser-déposer ou bouton Importer) : chacun est reconnu puis importé
      dans l'ordre rapport clients -> départs -> maintenance (la nuit vient du rapport clients), avec un seul message. */
  const NOMS_RAPPORTS = { clients: 'rapport clients présents', departs: 'rapport des départs', maintenance: 'rapport de maintenance', arrivees: 'rapport des arrivées' };
  async function importerPlusieurs(fichiers) {
    fichiers = Array.from(fichiers || []);
    if (fichiers.length <= 1) return fichiers.length ? importer(fichiers[0]) : false;
    const lus = [], refuses = [];
    for (const f of fichiers) {
      try {
        const lignes = await RDJ.lireFichierTableur(f);
        const type = RDJ.typeRapport(lignes);
        if (!type) refuses.push(f.name + ' (pas un rapport reconnu)');
        else if (lus.some((l) => l.type === type)) refuses.push(f.name + ' (deuxième ' + NOMS_RAPPORTS[type] + ')');
        else lus.push({ f, lignes, type });
      } catch (err) {
        refuses.push(f.name + ' (' + err.message + ')');
      }
    }
    lus.sort((a, b) => RDJ.ORDRE_RAPPORTS.indexOf(a.type) - RDJ.ORDRE_RAPPORTS.indexOf(b.type));
    const bilans = [];
    let niveau = refuses.length ? 'alerte' : 'ok';
    for (const l of lus) {
      const r = l.type === 'clients' ? await importer(l.f, { lignes: l.lignes, silencieux: true })
        : l.type === 'departs' ? enregistrerSoldes(l.f, RDJ.lireSoldes(l.lignes), true)
          : l.type === 'arrivees' ? enregistrerArrivees(l.f, RDJ.lireArrivees(l.lignes, config().typesChambre), true)
            : enregistrerMaintenance(l.f, RDJ.lireMaintenance(l.lignes, contexte().nuit, true), true);
      bilans.push(r.bilan);
      if (r.niveau !== 'ok' && niveau !== 'erreur') niveau = r.niveau;
    }
    if (refuses.length) bilans.push('Non importé : ' + refuses.join(', ') + '.');
    aller('rapport');
    notice(lus.length + ' fichier(s) importé(s) sur ' + fichiers.length + ', dans l\'ordre : ' +
      lus.map((l) => NOMS_RAPPORTS[l.type]).join(', ') + '.\n\n' + bilans.join('\n\n'), lus.length ? niveau : 'erreur');
    return lus.length > 0;
  }
  RDJ.importerFichiers = importerPlusieurs; // utilisé par les tests
  RDJ.importerFichier = importer; // utilisé par les tests

  /* ---------- Import du rapport des soldes (montant dû des départs) ---------- */

  async function importerSoldes(fichier) {
    let lignes;
    try {
      lignes = await RDJ.lireFichierTableur(fichier);
    } catch (err) {
      notice('Import impossible : ' + err.message, 'erreur');
      return false;
    }
    const s = RDJ.lireSoldes(lignes);
    if (!s.lignes) {
      notice("Ce fichier ne ressemble pas au rapport des départs.\nIl faut une colonne de montant (Solde, Montant dû, Reste à payer, Balance…) et une colonne Chambre ou Réservation.", 'erreur');
      return false;
    }
    return enregistrerSoldes(fichier, s);
  }
  RDJ.importerSoldes = importerSoldes; // utilisé par les tests

  function enregistrerSoldes(fichier, s, silencieux) {
    const nuit = contexte().nuit;
    etat.soldes = { fichier: fichier.name, importeLe: RDJ.maintenantLocal(), nuit, chambres: s.chambres, resas: s.resas };
    enregistrer();
    const ctx = contexte();
    const avecMontant = ctx.chiffres.aEncaisser.filter((e) => e.montant !== null).length;
    return finImport('Rapport des départs importé : ' + s.lignes + ' ligne(s) de montant dû (' + fichier.name + ').\n' +
      (ctx.raw.length
        ? avecMontant + ' / ' + ctx.chiffres.aEncaisser.length + ' départ(s) non payé(s) ont maintenant leur montant dû' +
          (ctx.chiffres.totalDu !== null ? ' · total dû ' + RDJ.formatMontant(ctx.chiffres.totalDu) : '') + '.'
        : "Importez aussi le rapport clients présents pour voir les montants sur le rapport."),
      ctx.raw.length && avecMontant < ctx.chiffres.aEncaisser.length ? 'alerte' : 'ok', 'rapport', silencieux);
  }

  /* ---------- Import du rapport de maintenance (chambres bloquées, facultatif) ----------
     Les chambres bloquées passent en HS sur la feuille de chambre et le plan, pour la nuit en cours. */

  async function importerMaintenance(fichier) {
    let lignes;
    try {
      lignes = await RDJ.lireFichierTableur(fichier);
    } catch (err) {
      notice('Import impossible : ' + err.message, 'erreur');
      return false;
    }
    const m = RDJ.lireMaintenance(lignes, contexte().nuit, false);
    if (!m.lignes) {
      notice("Ce fichier ne ressemble pas au rapport de maintenance.\nIl faut une colonne Chambre (avec, si possible, le motif et les dates du blocage).", 'erreur');
      return false;
    }
    return enregistrerMaintenance(fichier, m);
  }
  RDJ.importerMaintenance = importerMaintenance; // utilisé par les tests

  function enregistrerMaintenance(fichier, m, silencieux) {
    const nuit = contexte().nuit;
    etat.maintenance = { fichier: fichier.name, importeLe: RDJ.maintenantLocal(), nuit, chambres: m.chambres };
    enregistrer();
    const ctx = contexte();
    const nos = Object.keys(m.chambres).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    const horsPlan = nos.filter((k) => !(k in ctx.etatsFdc));
    const occupees = nos.filter((k) => ctx.etatsFdc[k] && ctx.etatsFdc[k].base !== 'HS');
    const hs = nos.filter((k) => ctx.etatsFdc[k] && ctx.etatsFdc[k].base === 'HS');
    let bilan = 'Rapport de maintenance importé (' + fichier.name + ').\n' +
      (hs.length ? hs.length + ' chambre(s) bloquée(s), hors service sur la feuille de chambre et le plan : ' + hs.join(', ') + '.' : 'Aucune chambre bloquée pour cette nuit.');
    if (occupees.length) bilan += '\nBloquées mais occupées d\'après le rapport clients présents (laissées telles quelles) : ' + occupees.join(', ');
    if (horsPlan.length) bilan += '\nChambres inconnues du plan : ' + horsPlan.join(', ');
    if (m.terminees.length) bilan += '\nBlocage déjà terminé (ignorées) : ' + m.terminees.join(', ');
    return finImport(bilan, occupees.length || horsPlan.length ? 'alerte' : 'ok', 'plan', silencieux);
  }

  /* ---------- Import du rapport des arrivées (facultatif) ----------
     Nombre d'arrivées par type de chambre, affiché sur l'accueil avec les chambres disponibles de chaque type. */

  async function importerArrivees(fichier) {
    let lignes;
    try {
      lignes = await RDJ.lireFichierTableur(fichier);
    } catch (err) {
      notice('Import impossible : ' + err.message, 'erreur');
      return false;
    }
    const a = RDJ.lireArrivees(lignes, config().typesChambre);
    if (!a.lignes) {
      notice("Ce fichier ne ressemble pas au rapport des arrivées.\nIl faut une colonne Arrivée (date) et une colonne Description ou Type de chambre.", 'erreur');
      return false;
    }
    return enregistrerArrivees(fichier, a);
  }
  RDJ.importerArrivees = importerArrivees; // utilisé par les tests

  function enregistrerArrivees(fichier, a, silencieux) {
    etat.arrivees = { fichier: fichier.name, importeLe: RDJ.maintenantLocal(), date: a.date, total: a.total, parType: a.parType, autres: a.autres };
    enregistrer();
    const types = config().typesChambre;
    const detail = [...types.filter((t) => a.parType[t.code]).map((t) => t.code + ' ' + a.parType[t.code]),
      ...Object.keys(a.autres).map((d) => d + ' ' + a.autres[d])].join(' · ');
    const inconnus = Object.keys(a.autres).length;
    return finImport('Rapport des arrivées importé (' + fichier.name + ') : ' + a.total + ' arrivée(s) le ' + RDJ.dateFr(a.date) +
      (detail ? ' — ' + detail : '') + '.' + (inconnus ? '\nType non reconnu pour : ' + Object.keys(a.autres).join(', ') : ''),
      inconnus ? 'alerte' : 'ok', 'accueil', silencieux);
  }

  /* ---------- Modifications du rapport (double-clic) ---------- */

  function modifierRapport(col, chambre) {
    const ctx = contexte();
    const nuit = ctx.nuit;
    // chambre ajoutée à la main : on rouvre sa fiche (les cases se changent dans la fiche)
    if (ctx.ajouts.some((a) => a.chambre === chambre)) return editerAjout(chambre);
    const raw = ctx.raw.find((r) => r.chambre === chambre);
    const eff = ctx.eff.find((r) => r.chambre === chambre);
    if (!raw) return;
    if (etat.modifs.nuit !== nuit) etat.modifs = { nuit, liste: [], ajouts: [] };
    const liste = etat.modifs.liste;
    const trouver = (types) => liste.findIndex((m) => m.chambre === chambre && types.includes(m.type));

    if (col === 'paye') {
      const i = trouver(['PAYE']);
      if (i >= 0) liste.splice(i, 1);
      else if (RDJ.modifUtile(raw, 'PAYE', nuit)) liste.push({ chambre, type: 'PAYE' });
      else return notice('La chambre ' + chambre + " est déjà payée dans l'import.");
    } else if (col === 'pdj') {
      if (RDJ.avecPdj(eff.mealPlan)) {
        return notice(trouver(['PDJ']) >= 0
          ? 'Le petit déjeuner de la chambre ' + chambre + " a été ajouté à la main : utilisez « Annuler les modifications du jour » pour le retirer."
          : 'Le petit déjeuner est déjà inclus pour la chambre ' + chambre + ' : il ne peut pas être retiré.');
      }
      liste.push({ chambre, type: 'PDJ' });
    } else if (col === 'demain') {
      const i = trouver(['RECOUCHE', 'DEPART']);
      if (i >= 0) liste.splice(i, 1);
      else if (raw.depart) liste.push({ chambre, type: RDJ.modifUtile(raw, 'RECOUCHE', nuit) ? 'RECOUCHE' : 'DEPART' });
    }
    apresModifRapport();
  }

  /* ---------- Chambres ajoutées à la main ---------- */

  /** Fiche d'ajout / modification. Renvoie la saisie, 'retirer', ou null (annulé). */
  function ficheAjout(ctx, ajout) {
    return new Promise((resolve) => {
      const esc = RDJ.vues.esc;
      const d = $('#dialogue');
      const a = ajout || { chambre: '', nom: '', nbClients: 1, depart: RDJ.jours(ctx.nuit, 1), pdj: false, paye: false, montantDu: null };
      const choix = ajout ? [ajout.chambre, ...ctx.chambresLibres].sort((x, y) => x.localeCompare(y, 'fr', { numeric: true })) : ctx.chambresLibres;
      d.innerHTML = `
        <form method="dialog" class="fiche-ajout">
          <h2>${ajout ? 'Chambre ajoutée ' + esc(ajout.chambre) : 'Ajouter une chambre'}</h2>
          <p>Nuit du ${esc(RDJ.dateFr(ctx.nuit))} au ${esc(RDJ.dateFr(RDJ.jours(ctx.nuit, 1)))}. Comptée partout (rapport, feuille de chambre, PDJ, historique) jusqu'au prochain import qui la contient.</p>
          <div class="champs">
            <label>Chambre
              <select name="chambre" required>
                ${ajout ? '' : '<option value="">— choisir —</option>'}
                ${choix.map((c) => `<option ${c === a.chambre ? 'selected' : ''}>${esc(c)}</option>`).join('')}
              </select>
            </label>
            <label>Personnes <input name="nbClients" type="number" min="1" max="20" value="${esc(a.nbClients)}" required></label>
            <label>Nom du client <input name="nom" type="text" value="${esc(a.nom)}" autocomplete="off"></label>
            <label>Source
              <select name="canal">
                ${ctx.cfg.sourcesReservation.map((s) => `<option value="${esc(s.motifs[0])}" ${RDJ.sourceReservation(a.canal || 'DIRECT').code === s.code ? 'selected' : ''}>${esc(s.nom)}</option>`).join('')}
              </select>
            </label>
            <label>Départ <input name="depart" type="date" min="${esc(RDJ.jours(ctx.nuit, 1))}" value="${esc(a.depart)}" required></label>
            <label>Montant dû <input name="montantDu" type="text" inputmode="decimal" placeholder="facultatif" value="${a.montantDu !== null && a.montantDu !== undefined ? esc(String(a.montantDu).replace('.', ',')) : ''}" autocomplete="off"></label>
            <label class="case"><input name="pdj" type="checkbox" ${a.pdj ? 'checked' : ''}> Petit déjeuner</label>
            <label class="case"><input name="paye" type="checkbox" ${a.paye ? 'checked' : ''}> Payée</label>
          </div>
          <p class="erreur-fiche" hidden></p>
          <div class="boutons">
            ${ajout ? '<button value="retirer" class="btn danger" formnovalidate style="margin-right:auto">Retirer la chambre</button>' : ''}
            <button value="non" class="btn" formnovalidate>Annuler</button>
            <button value="oui" class="btn primaire">${ajout ? 'Enregistrer' : 'Ajouter'}</button>
          </div>
        </form>`;
      const f = d.querySelector('form');
      if (!choix.length && !ajout) {
        f.querySelector('.erreur-fiche').textContent = 'Toutes les chambres du plan sont déjà occupées.';
        f.querySelector('.erreur-fiche').hidden = false;
        f.querySelector('button[value=oui]').disabled = true;
      }
      d.returnValue = '';
      d.addEventListener('close', () => {
        const rep = d.returnValue;
        if (rep === 'retirer') return resolve('retirer');
        if (rep !== 'oui') return resolve(null);
        const v = (n) => f.elements[n].value;
        resolve({
          chambre: v('chambre'),
          nom: v('nom').trim(),
          canal: v('canal'),
          nbClients: Math.max(1, parseInt(v('nbClients'), 10) || 1),
          depart: /^\d{4}-\d{2}-\d{2}$/.test(v('depart')) && v('depart') > ctx.nuit ? v('depart') : RDJ.jours(ctx.nuit, 1),
          pdj: f.elements.pdj.checked,
          paye: f.elements.paye.checked,
          montantDu: RDJ.lireMontant(v('montantDu')),
        });
      }, { once: true });
      d.showModal();
      (ajout ? f.elements.nom : f.elements.chambre).focus();
    });
  }

  async function ajouterChambre() {
    const ctx = contexte();
    if (!ctx.raw.length) return notice("Importez d'abord le rapport du jour : les chambres s'ajoutent à l'import.", 'alerte');
    const saisie = await ficheAjout(ctx, null);
    if (!saisie || saisie === 'retirer' || !saisie.chambre) return;
    if (etat.modifs.nuit !== ctx.nuit) etat.modifs = { nuit: ctx.nuit, liste: [], ajouts: [] };
    etat.modifs.ajouts = [...(etat.modifs.ajouts || []).filter((a) => a.chambre !== saisie.chambre), saisie];
    apresModifRapport();
    notice('Chambre ' + saisie.chambre + ' ajoutée. Double-clic sur sa ligne pour la modifier ou la retirer.', 'ok');
  }

  async function editerAjout(chambre) {
    const ctx = contexte();
    const ajout = ctx.ajouts.find((a) => a.chambre === chambre);
    if (!ajout) return;
    const saisie = await ficheAjout(ctx, ajout);
    if (!saisie) return;
    const autres = (etat.modifs.ajouts || []).filter((a) => a.chambre !== chambre);
    if (saisie === 'retirer') {
      etat.modifs.ajouts = autres;
      notice('Chambre ' + chambre + ' retirée du rapport.', 'ok');
    } else {
      etat.modifs.ajouts = [...autres.filter((a) => a.chambre !== saisie.chambre), saisie];
    }
    apresModifRapport();
  }

  function apresModifRapport() {
    const ctx = contexte();
    if (ctx.raw.length) etat.recap = RDJ.majRecap(etat.recap, RDJ.ligneRecap(ctx.nuit, ctx.chiffres));
    enregistrer();
    afficher();
  }

  /* ---------- Feuille femme de chambre (double-clic) ---------- */

  function modifierFdc(type, chambre) {
    const ctx = contexte();
    if (etat.fdc.nuit !== ctx.nuit) etat.fdc = { nuit: ctx.nuit, corrections: {}, nv: {} };
    if (type === 'nv') {
      if (etat.fdc.nv[chambre]) delete etat.fdc.nv[chambre];
      else etat.fdc.nv[chambre] = true;
    } else {
      const e = ctx.etatsFdc[chambre];
      if (!e) return;
      const corr = RDJ.correctionApres(RDJ.etatSuivant(e.etat), e.base);
      if (corr === null) delete etat.fdc.corrections[chambre];
      else etat.fdc.corrections[chambre] = corr;
    }
    enregistrer();
    afficher();
  }

  /* ---------- Plan de chambre (double-clic sur une chambre sans client) ----------
     libre -> sale -> hors service -> libre ; enregistré comme correction de la feuille de chambre
     (sale = B, hors service = HS), donc visible aussitôt sur la feuille. */
  function modifierPlan(chambre) {
    const ctx = contexte();
    const e = ctx.etatsFdc[chambre];
    if (!e) return;
    if (ctx.eff.some((r) => RDJ.normChambre(r.chambre) === chambre)) {
      return notice('La chambre ' + chambre + " est occupée : son statut suit l'import. Pour la corriger, double-cliquez sa case sur la feuille de chambre.");
    }
    if (etat.fdc.nuit !== ctx.nuit) etat.fdc = { nuit: ctx.nuit, corrections: {}, nv: {} };
    const corr = RDJ.correctionApres(RDJ.etatSuivantPlan(e.etat), e.base);
    if (corr === null) delete etat.fdc.corrections[chambre];
    else etat.fdc.corrections[chambre] = corr;
    enregistrer();
    afficher();
    const b = document.getElementById('infobulle');
    if (b) b.hidden = true;
  }

  /* ---------- Impression ---------- */

  function imprimer(feuilles) {
    $('#impression').innerHTML = feuilles.join('');
    window.print();
  }
  window.addEventListener('afterprint', () => { $('#impression').innerHTML = ''; });
  const repeter = (html, n) => Array.from({ length: n }, () => html);

  /* Recto verso (Réglages) : le navigateur ne choisit pas le recto verso, c'est l'imprimante.
     Quand elle imprime des deux côtés, chaque feuille de chambre doit rester seule sur sa feuille :
     elle commence sur un recto et son verso est une page blanche. Les autres feuilles se suivent. */
  const PAGE_BLANCHE = '<div class="feuille portrait page-blanche"></div>';
  function rectoSeul(feuilles, dejaImprimees) {
    const res = [];
    if ((dejaImprimees || 0) % 2 === 1) res.push(PAGE_BLANCHE); // commencer sur un recto
    feuilles.forEach((f, i) => { res.push(f); if (i < feuilles.length - 1) res.push(PAGE_BLANCHE); }); // pas de page blanche tout à la fin
    return res;
  }
  const rectoVerso = () => !!(etat.reglages && etat.reglages.rectoVerso);
  /** Exemplaires de la feuille de chambre, avec un verso blanc si l'imprimante est en recto verso. */
  const copiesFdc = (html, n) => (rectoVerso() ? rectoSeul(repeter(html, n)) : repeter(html, n));

  /* ---------- Aperçu avant impression ----------
     Montre la feuille telle qu'elle sortira (noir et blanc, A4), réduite pour tenir dans la fenêtre. */
  let apercuImprimer = null;

  function apercu(titre, feuille, copies, rectoSeulFdc) {
    const esc = RDJ.vues.esc;
    const paysage = feuille.includes('feuille paysage');
    const a = $('#apercu');
    a.innerHTML = `
      <div class="apercu-barre">
        <div class="apercu-titre">
          <b>Aperçu avant impression · ${esc(titre)}</b>
          <span>A4 ${paysage ? 'paysage' : 'portrait'} · noir et blanc · ${copies} exemplaire${copies > 1 ? 's' : ''}${rectoSeulFdc && rectoVerso() ? ' · recto seul (verso blanc)' : ''}</span>
        </div>
        <div class="apercu-boutons">
          <button class="btn" data-action="apercu-fermer">Fermer</button>
          <button class="btn primaire" data-action="apercu-imprimer">Imprimer${copies > 1 ? ' (' + copies + ' ex.)' : ''}</button>
        </div>
      </div>
      <div class="apercu-zone"><div class="apercu-page nb">${feuille}</div></div>`;
    apercuImprimer = () => imprimer(rectoSeulFdc ? copiesFdc(feuille, copies) : repeter(feuille, copies));
    a.hidden = false;
    document.body.classList.add('apercu-ouvert');
    ajusterApercu();
    a.querySelector('[data-action=apercu-imprimer]').focus();
  }

  function ajusterApercu() {
    const a = $('#apercu');
    if (a.hidden) return;
    const zone = a.querySelector('.apercu-zone');
    const page = a.querySelector('.apercu-page');
    const f = page.querySelector('.feuille');
    page.style.zoom = 1;
    const echelle = Math.min((zone.clientWidth - 48) / f.offsetWidth, (zone.clientHeight - 48) / f.offsetHeight, 1);
    page.style.zoom = Math.max(0.2, echelle).toFixed(3);
  }

  function fermerApercu() {
    $('#apercu').hidden = true;
    $('#apercu').innerHTML = '';
    apercuImprimer = null;
    document.body.classList.remove('apercu-ouvert');
  }

  window.addEventListener('resize', ajusterApercu);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !$('#apercu').hidden) fermerApercu(); });

  /* ---------- Actions des boutons ---------- */

  const ACTIONS = {
    'zoom-ajuster': () => choisirAffichage('ajuster'),
    'zoom-largeur': () => choisirAffichage('largeur'),
    'zoom-moins': () => pasZoom(-1),
    'zoom-plus': () => pasZoom(1),
    importer: () => { fermerMenuImport(); $('#fichier-import').click(); },
    'importer-soldes': () => { fermerMenuImport(); $('#fichier-soldes').click(); },
    'importer-maintenance': () => { fermerMenuImport(); $('#fichier-maintenance').click(); },
    'importer-arrivees': () => { fermerMenuImport(); $('#fichier-arrivees').click(); },
    'menu-import': () => {
      const m = $('#menu-import');
      m.hidden = !m.hidden;
      document.querySelector('[data-action="menu-import"]').setAttribute('aria-expanded', String(!m.hidden));
    },
    'ajouter-chambre': ajouterChambre,
    'types-depuis-import': () => {
      const ctx = contexte();
      const ajouts = RDJ.completerTypes(ctx.cfg.types, ctx.raw, ctx.cfg.typesChambre);
      const n = Object.keys(ajouts).length;
      if (!n) return notice("Aucune chambre à compléter : elles ont déjà un type, ou la catégorie de l'export ne l'indique pas.");
      etat.reglages.typesChambres = { ...(etat.reglages.typesChambres || {}), ...ajouts };
      enregistrer();
      afficher();
      notice(n + ' chambre(s) complétée(s) depuis l\'import. Vérifiez et corrigez si besoin.', 'ok');
    },
    'date-auto': () => { etat.dateRapportManuelle = null; enregistrer(); afficher(); },
    'pdj-auto': () => { etat.pdj.nombre = null; enregistrer(); afficher(); },

    'imprimer-tout': () => {
      const ctx = contexte();
      const choix = ctx.cfg.impressionNuit;
      const fdc = choix.fdc ? repeter(RDJ.vues.feuilleFdc(ctx), ctx.cfg.nbExemplairesFdc) : [];
      const autres = [
        ...(choix.rapport ? [RDJ.vues.feuilleRapport(ctx)] : []),
        ...(choix.pdj ? [RDJ.vues.feuillePdj(ctx)] : []),
        ...(choix.plan ? [RDJ.vues.feuillePlan(ctx)] : []),
        ...(choix.recap ? [RDJ.vues.feuilleRecap(ctx)] : []),
      ];
      // recto verso : rapport, cuisson, plan et historique d'abord (ils partagent les feuilles),
      // puis chaque feuille de chambre seule sur sa feuille
      const feuilles = rectoVerso()
        ? [...autres, ...rectoSeul(fdc, autres.length)]
        : [...autres.slice(0, choix.rapport ? 1 : 0), ...fdc, ...autres.slice(choix.rapport ? 1 : 0)];
      if (!feuilles.length) return notice('Aucune feuille cochée pour les impressions de la nuit (onglet Réglages).', 'alerte');
      imprimer(feuilles);
    },
    'apercu-rapport': () => apercu('Rapport du jour', RDJ.vues.feuilleRapport(contexte()), 1),
    'apercu-fdc': () => { const ctx = contexte(); apercu('Feuille de chambre', RDJ.vues.feuilleFdc(ctx), ctx.cfg.nbExemplairesFdc, true); },
    'apercu-pdj': () => apercu('Cuisson PDJ', RDJ.vues.feuillePdj(contexte()), 1),
    'apercu-buffet': () => apercu('Buffet PDJ', RDJ.vues.feuilleBuffet(contexte()), 1),
    'pdj-cuisson': () => choisirPdj('cuisson'),
    'pdj-buffet': () => choisirPdj('buffet'),
    'pdj-commande': () => choisirPdj('commande'),
    'reglages-parametres': () => choisirReglages('parametres'),
    'reglages-changelog': () => choisirReglages('changelog'),

    // code d'accès aux Réglages
    deverrouiller: () => {
      const p = pinInfo();
      const champ = $('#pin-saisie');
      if (!p || !champ) return;
      if (Date.now() < bloqueJusqua) {
        return notice('Trop d\'essais : réessayez dans ' + Math.ceil((bloqueJusqua - Date.now()) / 1000) + ' secondes.', 'alerte');
      }
      if (empreinte(p.sel, champ.value.trim()) === p.empreinte) {
        essaisRates = 0;
        prolongerReglages();
        afficher();
        return;
      }
      essaisRates++;
      champ.value = '';
      champ.focus();
      if (essaisRates >= 5) { bloqueJusqua = Date.now() + 30000; essaisRates = 0; }
      notice(Date.now() < bloqueJusqua ? 'Code incorrect. Trop d\'essais : attendez 30 secondes.' : 'Code incorrect.', 'erreur');
    },
    'verrouiller-reglages': () => { verrouillerReglages(); afficher(); notice('Réglages verrouillés.', 'ok'); },
    'pin-definir': async () => {
      const n = $('#pin-nouveau'), c = $('#pin-confirme');
      const code = n ? n.value.trim() : '', conf = c ? c.value.trim() : '';
      if (!RDJ.codeValide(code)) return notice('Le code doit faire de 4 à 8 chiffres.', 'erreur');
      if (code !== conf) return notice('Les deux codes ne sont pas identiques.', 'erreur');
      const secours = aleatoire(4, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789') + '-' + aleatoire(4, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789');
      const sel = aleatoire(16, '0123456789abcdef');
      const avait = !!pinInfo();
      try {
        localStorage.setItem(PIN_CLE, JSON.stringify({ sel, empreinte: empreinte(sel, code), secours: empreinte(sel, secours) }));
      } catch (e) {
        return notice("Impossible d'enregistrer le code dans ce navigateur.", 'erreur');
      }
      prolongerReglages();
      afficher();
      await dialogue({
        titre: avait ? 'Code changé' : 'Réglages protégés',
        message: 'Les Réglages demandent maintenant ce code.\n\nNotez ce code de secours et gardez-le à part : il permet de choisir un nouveau code si vous oubliez le vôtre.\n\n' +
          secours + '\n\nIl ne sera plus affiché.',
        ok: 'C\'est noté', info: true,
      });
    },
    'pin-supprimer': async () => {
      if (!await dialogue({ titre: 'Supprimer le code', message: 'Les Réglages ne seront plus protégés : tout le monde pourra les ouvrir sur ce poste.', ok: 'Supprimer le code', danger: true })) return;
      try { localStorage.removeItem(PIN_CLE); } catch (e) { /* sans importance */ }
      verrouillerReglages();
      afficher();
      notice('Code supprimé : les Réglages ne sont plus protégés.', 'ok');
    },
    'pin-oublie': async () => {
      const p = pinInfo();
      if (!p) return;
      const rep = await dialogue({ titre: 'Code oublié', message: 'Entrez le code de secours donné quand le code a été choisi (8 caractères, par exemple ABCD-2345) :', saisie: '', ok: 'Valider' });
      if (rep === null) return;
      const s = rep.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (s.length === 8 && empreinte(p.sel, s.slice(0, 4) + '-' + s.slice(4)) === p.secours) {
        try { localStorage.removeItem(PIN_CLE); } catch (e) { /* sans importance */ }
        afficher();
        notice('Code de secours accepté : choisissez un nouveau code dans la carte « Code d\'accès ».', 'ok');
      } else notice('Code de secours incorrect.', 'erreur');
    },
    'apercu-recap': () => apercu('Historique', RDJ.vues.feuilleRecap(contexte()), 1),
    'apercu-fdc-vierge': async () => {
      const rep = await dialogue({ titre: 'Feuille vierge', message: "Nombre d'exemplaires de la feuille vierge :", saisie: '1', type: 'number', ok: 'Voir l\'aperçu' });
      const n = parseInt(rep, 10);
      if (!(n >= 1 && n <= 50)) return;
      apercu('Feuille de chambre vierge', RDJ.vues.feuilleFdc(contexte(), { vierge: true }), n, true);
    },
    'apercu-plan': () => apercu('Plan de chambre', RDJ.vues.feuillePlan(contexte()), 1),
    'imprimer-plan': () => imprimer([RDJ.vues.feuillePlan(contexte())]),
    'apercu-plan-vierge': () => apercu('Plan de chambre vierge', RDJ.vues.feuillePlan(contexte(), { vierge: true }), 1),
    'imprimer-plan-vierge': async () => {
      const rep = await dialogue({ titre: 'Plan vierge', message: "Nombre d'exemplaires du plan vierge à imprimer :", saisie: '1', type: 'number', ok: 'Imprimer' });
      const n = parseInt(rep, 10);
      if (!(n >= 1 && n <= 50)) return;
      imprimer(repeter(RDJ.vues.feuillePlan(contexte(), { vierge: true }), n));
    },
    'apercu-fermer': fermerApercu,
    'apercu-imprimer': () => { const f = apercuImprimer; fermerApercu(); if (f) f(); },

    'imprimer-rapport': () => imprimer([RDJ.vues.feuilleRapport(contexte())]),
    'imprimer-fdc': () => { const ctx = contexte(); imprimer(copiesFdc(RDJ.vues.feuilleFdc(ctx), ctx.cfg.nbExemplairesFdc)); },
    'imprimer-fdc-vierge': async () => {
      const rep = await dialogue({ titre: 'Feuille vierge', message: "Nombre d'exemplaires de la feuille vierge à imprimer :", saisie: '1', type: 'number', ok: 'Imprimer' });
      const n = parseInt(rep, 10);
      if (!(n >= 1 && n <= 50)) return;
      imprimer(copiesFdc(RDJ.vues.feuilleFdc(contexte(), { vierge: true }), n));
    },
    'imprimer-pdj': () => imprimer([RDJ.vues.feuillePdj(contexte())]),
    'imprimer-recap': () => imprimer([RDJ.vues.feuilleRecap(contexte())]),

    'annuler-modifs': async () => {
      const nbAj = contexte().ajouts.length;
      if (!await dialogue({ titre: 'Rapport', message: 'Annuler toutes les modifications faites à la main sur le rapport pour ce jour ?' + (nbAj ? '\nLes ' + nbAj + ' chambre(s) ajoutée(s) à la main seront retirées.' : ''), ok: 'Annuler les modifications' })) return;
      etat.modifs.liste = [];
      etat.modifs.ajouts = [];
      apresModifRapport();
      notice("Modifications annulées : le rapport reprend les données de l'import.", 'ok');
    },
    'annuler-corrections': async () => {
      if (!await dialogue({ titre: 'Feuille de chambre', message: "Annuler toutes les corrections de la feuille de chambre pour ce jour ?\nLa feuille reprend les données de l'import.", ok: 'Annuler les corrections' })) return;
      etat.fdc.corrections = {};
      enregistrer();
      afficher();
      notice("Corrections annulées : la feuille reprend les données de l'import.", 'ok');
    },

    'recap-csv': () => {
      const sources = RDJ.colonnesSourcesRecap(config().sourcesReservation, etat.recap);
      const lignes = [['Nuit du', 'Jour', 'Chambres occupées', 'Clients', 'Départ', 'Recouches', 'Petits déj. (couverts)', "Taux d'occupation", ...sources.map((s) => s.nom)]];
      for (const l of etat.recap) {
        lignes.push([RDJ.dateFr(l.date), l.jour, l.chambres, l.clients, l.departs, l.recouches, l.pdj, String(Math.round(l.taux * 1000) / 10).replace('.', ',') + ' %',
          ...sources.map((s) => (l.sources ? l.sources[s.code] || 0 : ''))]);
      }
      const csv = '﻿' + lignes.map((l) => l.join(';')).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'Historique_rapport_du_jour.csv';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    },

    sauvegarder: async () => {
      if (RDJ.dossierSauv.possible && !RDJ.dossierSauv.nom && !await choisirDossierSauv()) return;
      etat.derniereSauvegarde = RDJ.maintenantLocal();
      const ou = await sauverEtat(null, true);
      enregistrer();
      afficher();
      notice('Sauvegarde enregistrée (' + ou + ').', 'ok');
    },
    'dossier-sauv': async () => {
      if (await choisirDossierSauv()) { afficher(); notice('Dossier des sauvegardes : ' + RDJ.dossierSauv.nom + '/save', 'ok'); }
    },
    restaurer: () => $('#fichier-restaurer').click(),

    'maj-verifier': () => majVerifier(false),
    'maj-fermer': () => { maj = null; afficher(); },
    'maj-installer': async () => {
      if (!maj || maj.etat !== 'dispo') return;
      const ok = await dialogue({
        titre: 'Installer la version ' + maj.version,
        message: "Les fichiers de l'application vont être remplacés par la version " + maj.version + ".\nVos données et le dossier « save » ne sont pas touchés ; la version " + RDJ.VERSION + " est d'abord copiée dans « " + RDJ.maj.ANCIENNES + " ».\nL'application se recharge ensuite.",
        ok: 'Installer',
      });
      if (!ok) return;
      const racine = await majRacine();
      if (!racine) return notice("Mise à jour annulée : pas d'accès au dossier de l'application.", 'alerte');
      const version = maj.version;
      try {
        // sauvegarde des données juste avant, par prudence
        etat.derniereSauvegarde = RDJ.maintenantLocal();
        await sauverEtat(null, true);
        enregistrer();
        await RDJ.maj.installer(racine, (texte) => { maj = { ...maj, etat: 'install', message: texte }; if (vue === 'accueil') afficher(); });
      } catch (e) {
        maj = { etat: 'erreur', message: 'Mise à jour interrompue : ' + e.message };
        afficher();
        return;
      }
      try { sessionStorage.setItem('rdj.majFaite', version); } catch (e) { /* sans importance */ }
      location.reload();
    },
    'maj-revenir': async () => {
      const ok = await dialogue({
        titre: 'Revenir à la version précédente',
        message: "Les fichiers de l'application vont être remplacés par la dernière copie gardée dans « " + RDJ.maj.ANCIENNES + " ».\nVos données ne sont pas touchées. L'application se recharge ensuite.",
        ok: 'Revenir', danger: true,
      });
      if (!ok) return;
      const racine = await majRacine();
      if (!racine) return notice("Pas d'accès au dossier de l'application : rien n'a été changé.", 'alerte');
      let nom;
      try { nom = await RDJ.maj.revenir(racine); } catch (e) { return notice('Retour impossible : ' + e.message, 'erreur'); }
      if (!nom) return notice("Aucune version précédente gardée dans « " + RDJ.maj.ANCIENNES + " ».", 'alerte');
      try { sessionStorage.setItem('rdj.majFaite', 'retour'); } catch (e) { /* sans importance */ }
      location.reload();
    },

    'tout-supprimer': async () => {
      const rep = await dialogue({
        titre: 'Supprimer toutes les données',
        message: 'Toutes les données vont être supprimées (import, historique des nuits, corrections).\nUne sauvegarde sera faite juste avant.\n\nTapez SUPPRIMER pour confirmer :',
        saisie: '', ok: 'Supprimer', danger: true,
      });
      if (rep === null) return;
      if (rep.trim().toUpperCase() !== 'SUPPRIMER') return notice("Confirmation incorrecte : rien n'a été supprimé.", 'alerte');
      const ou = await sauverEtat('avant_suppression_' + RDJ.maintenantLocal().replace('T', '_').replace(':', 'h'), true);
      const reglages = etat.reglages;
      etat = RDJ.etatVide();
      etat.reglages = reglages;
      enregistrer();
      aller('accueil');
      notice('Toutes les données ont été supprimées (sauvegarde faite juste avant : ' + ou + ').', 'ok');
    },
  };

  function fermerMenuImport() {
    const m = $('#menu-import');
    if (m && !m.hidden) { m.hidden = true; document.querySelector('[data-action="menu-import"]').setAttribute('aria-expanded', 'false'); }
  }
  // clic ailleurs ou Échap : le menu se ferme
  document.addEventListener('click', (ev) => { if (!ev.target.closest('.menu-import')) fermerMenuImport(); }, true);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') fermerMenuImport(); });
  // code d'accès : Entrée valide le code ; Réglages ouverts mais inactifs depuis 10 minutes -> écran de verrouillage
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || !ev.target) return;
    if (ev.target.id === 'pin-saisie') { ev.preventDefault(); ACTIONS.deverrouiller(); }
    else if (ev.target.id === 'pin-confirme') { ev.preventDefault(); ACTIONS['pin-definir'](); }
  });
  setInterval(() => { if (vue === 'reglages' && pinInfo() && !reglagesOuverts() && !$('#pin-saisie')) afficher(); }, 30000);
  // à 23 h, la zone d'import de l'accueil se vide : on réaffiche l'accueil quand le service de nuit change
  let serviceAffiche = RDJ.debutService();
  setInterval(() => {
    const s = RDJ.debutService();
    if (s === serviceAffiche) return;
    serviceAffiche = s;
    if (vue === 'accueil') afficher();
  }, 30000);

  /* ---------- Événements ---------- */

  document.addEventListener('click', (ev) => {
    const onglet = ev.target.closest('#onglets button');
    if (onglet) return aller(onglet.dataset.vue);
    const raccourci = ev.target.closest('[data-vue-aller]');
    if (raccourci) return aller(raccourci.dataset.vueAller);
    if (ev.target.closest('#notice .fermer')) { $('#notice').hidden = true; return; }
    // boutons − / + des compteurs (cuisson PDJ)
    const pas = ev.target.closest('[data-pas]');
    if (pas) {
      const champ = document.querySelector('#vue ' + pas.dataset.pour);
      if (!champ) return;
      champ.value = Math.max(0, (parseInt(champ.value, 10) || 0) + parseInt(pas.dataset.pas, 10));
      champ.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    const el = ev.target.closest('[data-action]');
    if (el && !el.disabled && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action]();
  });

  document.addEventListener('keydown', (ev) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.id === 'zone-import') { ev.preventDefault(); ACTIONS.importer(); }
  });

  document.addEventListener('dblclick', (ev) => {
    if (!ev.target.closest('#vue')) return;
    const m = ev.target.closest('[data-modif]');
    if (m) { ev.preventDefault(); window.getSelection().removeAllRanges(); return modifierRapport(m.dataset.modif, m.dataset.ch); }
    const f = ev.target.closest('[data-fdc]');
    if (f) { ev.preventDefault(); window.getSelection().removeAllRanges(); return modifierFdc(f.dataset.fdc, f.dataset.ch); }
    const p = ev.target.closest('[data-plan]');
    if (p) { ev.preventDefault(); window.getSelection().removeAllRanges(); return modifierPlan(p.dataset.plan); }
  });

  // curseur de taille des feuilles : la feuille suit le glissement en direct
  document.addEventListener('input', (ev) => {
    if (ev.target.id === 'zoom-feuille') choisirAffichage(ev.target.value);
  });

  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.id === 'zoom-feuille') return; // déjà appliqué pendant le glissement (événement input)
    if (t.id === 'date-rapport') {
      etat.dateRapportManuelle = /^\d{4}-\d{2}-\d{2}$/.test(t.value) ? t.value : null;
    } else if (t.id === 'pdj-nombre') {
      const n = parseInt(t.value, 10);
      etat.pdj.nombre = n >= 0 ? n : null;
    } else if (t.id === 'pdj-type' || t.name === 'pdj-type') {
      etat.pdj.type = t.value;
    } else if (t.dataset.typeChambre) {
      etat.reglages.typesChambres = { ...(etat.reglages.typesChambres || {}), [t.dataset.typeChambre]: t.value };
    } else if (t.dataset.reglage) {
      const k = t.dataset.reglage;
      if (k === 'hotel') etat.reglages.hotel = t.value.trim() || undefined;
      else if (k === 'sauvegardeHebdo') etat.reglages.sauvegardeHebdo = t.checked || undefined;
      else if (k === 'rectoVerso') etat.reglages.rectoVerso = t.checked || undefined;
      else if (k.startsWith('horaire-')) etat.reglages.horaires = { ...(etat.reglages.horaires || {}), [k.slice(8)]: t.value.trim() };
      else if (k.startsWith('impression-')) etat.reglages.impressionNuit = { ...(etat.reglages.impressionNuit || {}), [k.slice(11)]: t.checked };
      else if (k === 'fournee1' || k === 'fournee2') {
        // pourcentages : 0 permis ; les deux fournées ensemble ne dépassent pas 100 %
        const n = parseInt(t.value, 10);
        let v = n >= 0 ? Math.min(n, 100) : undefined;
        if (v !== undefined) {
          const autre = k === 'fournee1' ? 'fournee2' : 'fournee1';
          const pAutre = Number.isFinite(etat.reglages[autre]) ? etat.reglages[autre] : RDJ.CONFIG_DEFAUT.fournees[autre === 'fournee1' ? 0 : 1].part;
          v = Math.min(v, 100 - pAutre);
        }
        etat.reglages[k] = v;
      }
      else { const n = parseInt(t.value, 10); etat.reglages[k] = n > 0 ? n : undefined; }
    } else if (t.id === 'fichier-import') {
      const fs = Array.from(t.files);
      t.value = '';
      if (fs.length) importerPlusieurs(fs);
      return;
    } else if (t.id === 'fichier-soldes') {
      const f = t.files[0];
      t.value = '';
      if (f) importerSoldes(f);
      return;
    } else if (t.id === 'fichier-maintenance') {
      const f = t.files[0];
      t.value = '';
      if (f) importerMaintenance(f);
      return;
    } else if (t.id === 'fichier-arrivees') {
      const f = t.files[0];
      t.value = '';
      if (f) importerArrivees(f);
      return;
    } else if (t.id === 'fichier-restaurer') {
      const f = t.files[0];
      t.value = '';
      if (f) restaurer(f);
      return;
    } else return;
    enregistrer();
    afficher();
  });

  async function restaurer(fichier) {
    try {
      const nouvel = await RDJ.store.lireSauvegarde(fichier);
      if (!await dialogue({ titre: 'Restaurer une sauvegarde', message: 'Remplacer toutes les données actuelles par cette sauvegarde ?\n(' + nouvel.recap.length + ' nuits dans l\'historique)', ok: 'Restaurer', danger: true })) return;
      etat = nouvel;
      enregistrer();
      aller('accueil');
      notice('Sauvegarde restaurée.', 'ok');
    } catch (err) {
      notice(err.message, 'erreur');
    }
  }

  // Glisser-déposer d'un fichier n'importe où dans la fenêtre
  ['dragenter', 'dragover'].forEach((t) => document.addEventListener(t, (ev) => {
    if (!ev.dataTransfer || !Array.from(ev.dataTransfer.types).includes('Files')) return;
    ev.preventDefault();
    document.body.classList.add('depot');
  }));
  ['dragleave', 'drop'].forEach((t) => document.addEventListener(t, (ev) => {
    if (t === 'dragleave' && ev.relatedTarget) return;
    document.body.classList.remove('depot');
  }));
  document.addEventListener('drop', (ev) => {
    if (!ev.dataTransfer || !ev.dataTransfer.files.length) return;
    ev.preventDefault();
    importerPlusieurs(ev.dataTransfer.files);
  });

  // Infobulle du plan de chambre (survol d'une case [data-bulle])
  const bulle = document.createElement('div');
  bulle.id = 'infobulle';
  bulle.hidden = true;
  document.body.appendChild(bulle);
  let caseSurvolee = null;
  document.addEventListener('mouseover', (ev) => {
    const c = ev.target.closest && ev.target.closest('[data-bulle]');
    if (c === caseSurvolee) return;
    caseSurvolee = c;
    if (!c) { bulle.hidden = true; return; }
    bulle.innerHTML = c.dataset.bulle;
    bulle.hidden = false;
    const r = c.getBoundingClientRect();
    const b = bulle.getBoundingClientRect();
    let x = r.left + r.width / 2 - b.width / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - b.width - 8));
    let y = r.top - b.height - 8;
    if (y < 8) y = r.bottom + 8;
    bulle.style.left = x + 'px';
    bulle.style.top = y + 'px';
  });
  document.addEventListener('scroll', () => { bulle.hidden = true; caseSurvolee = null; }, true);

  // Réglages : la carte « Types de chambre » reste ouverte après une modification (on la referme à la main)
  document.addEventListener('toggle', (ev) => {
    if (ev.target.classList && ev.target.classList.contains('types-ch')) RDJ.vues.typesOuvert = ev.target.open;
    // accueil : mode d'emploi replié / déplié, retenu sur ce poste
    if (ev.target.classList && ev.target.classList.contains('me-bloc')) {
      RDJ.vues.modeEmploiReduit = !ev.target.open;
      try { localStorage.setItem('rdj.modeEmploi', ev.target.open ? 'ouvert' : 'reduit'); } catch (e) { /* sans importance */ }
    }
  }, true);

  // Synchronisation si l'application est ouverte dans deux onglets
  window.addEventListener('storage', () => { etat = RDJ.store.charger(); afficher(); });

  afficher();

  // Sauvegarde hebdomadaire (Réglages, désactivée par défaut) : à l'ouverture, si la dernière date de 7 jours ou plus
  async function sauvegardeHebdo() {
    if (!etat.reglages.sauvegardeHebdo || !RDJ.store.disponible) return;
    if (!etat.recap.length && !etat.import) return;
    const sauv = etat.derniereSauvegarde;
    if (sauv && RDJ.ecartJours(RDJ.aujourdhui(), sauv.slice(0, 10)) < 7) return;
    etat.derniereSauvegarde = RDJ.maintenantLocal();
    const ou = await sauverEtat(null, false);
    enregistrer();
    afficher();
    notice('Sauvegarde hebdomadaire enregistrée (' + ou + ').', 'ok');
  }
  // le nom du dossier des sauvegardes (Réglages) est lu dans IndexedDB, puis la sauvegarde hebdomadaire
  RDJ.dossierSauv.init().then(() => { if (vue === 'reglages') afficher(); }).finally(sauvegardeHebdo);
  if (!RDJ.store.disponible) notice('Le stockage du navigateur est désactivé : les données ne seront pas conservées.', 'erreur');

  // après une mise à jour (ou un retour en arrière), l'appli vient d'être rechargée
  let majFaite = null;
  try { majFaite = sessionStorage.getItem('rdj.majFaite'); sessionStorage.removeItem('rdj.majFaite'); } catch (e) { /* sans importance */ }
  if (majFaite) notice(majFaite === 'retour' ? 'Version précédente remise : version ' + RDJ.VERSION + '.' : 'Mise à jour installée : version ' + RDJ.VERSION + '.', 'ok');
  else setTimeout(majAuto, 3000);
})();
