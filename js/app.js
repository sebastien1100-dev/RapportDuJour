/* Application : état, navigation, actions des boutons, impression. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});
  const $ = (sel) => document.querySelector(sel);

  let etat = RDJ.store.charger();
  let vue = 'accueil';
  try { vue = sessionStorage.getItem('rdj.vue') || 'accueil'; } catch (e) { /* sans importance */ }

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
    return {
      etat, cfg, raw, nuit, modifs, soldes, maintenance, ajouts, base, eff, chiffres, fdc, etatsFdc,
      chambresLibres: RDJ.chambresLibres(cfg.planFdc, base),
      dateManuelle: !!etat.dateRapportManuelle,
      grille: RDJ.grilleRapport(eff, nuit),
      compteursFdc: RDJ.compteursFdc(etatsFdc, fdc.nv),
      horsPlan: RDJ.chambresHorsPlan(cfg.planFdc, raw),
      mep: RDJ.dateMep(etat.import && etat.import.importeLe, nuit),
      pdjManuel,
      pdjNombre: pdjManuel ? etat.pdj.nombre : chiffres.pdj,
      pdjType: etat.pdj.type || 'business',
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
    reglages: RDJ.vues.ecranReglages,
    changelog: RDJ.vues.ecranChangelog,
  };

  function afficher() {
    if (!ECRANS[vue]) vue = 'accueil';
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
     ajuster : page paysage entière visible (largeur et hauteur), page portrait à la largeur (max 150 %)
     largeur : toute la largeur de la fenêtre · 100 : taille réelle */
  const MODES_AFFICHAGE = [['ajuster', 'Ajuster à la fenêtre'], ['largeur', 'Toute la largeur'], ['100', 'Taille réelle (100 %)']];
  function modeAffichage() {
    try { return localStorage.getItem('rdj.affichage') || 'ajuster'; } catch (e) { return 'ajuster'; }
  }

  function ajouterChoixAffichage() {
    const outils = document.querySelector('#vue .outils');
    if (!outils || !document.querySelector('#vue .papier')) return;
    const m = modeAffichage();
    const l = document.createElement('label');
    l.className = 'choix-affichage';
    l.innerHTML = `Affichage <select id="mode-affichage">${MODES_AFFICHAGE.map(([k, t]) => `<option value="${k}" ${k === m ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
    outils.appendChild(l);
  }

  function ajusterFeuilles() {
    const mode = modeAffichage();
    document.querySelectorAll('#vue .papier').forEach((p) => {
      const f = p.querySelector('.feuille');
      if (!f) return;
      f.style.zoom = 1;
      if (mode === '100') return;
      const cs = getComputedStyle(p);
      const largeur = (p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 4) / f.offsetWidth;
      const haut = p.getBoundingClientRect().top + window.scrollY;
      const hauteur = Math.max(300, window.innerHeight - haut - 24 - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / f.offsetHeight;
      const paysage = f.classList.contains('paysage');
      let z = mode === 'largeur' ? largeur : paysage ? Math.min(largeur, hauteur) : Math.min(largeur, 1.5);
      z = Math.max(0.5, Math.min(z, 3));
      f.style.zoom = z.toFixed(3);
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

  let minuterie = null;
  function notice(texte, type) {
    const n = $('#notice');
    n.className = 'notice ' + (type || 'info');
    n.innerHTML = RDJ.vues.esc(texte).replace(/\n/g, '<br>') + '<button class="fermer" aria-label="Fermer">×</button>';
    n.hidden = false;
    clearTimeout(minuterie);
    if (type !== 'erreur') minuterie = setTimeout(() => { n.hidden = true; }, 9000);
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
            <button value="non" class="btn">Annuler</button>
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

  async function importer(fichier) {
    let lignes;
    try {
      lignes = await RDJ.lireFichierTableur(fichier);
    } catch (err) {
      notice('Import impossible : ' + err.message, 'erreur');
      return false;
    }
    const lu = RDJ.lireExport(lignes);
    // pas le rapport clients présents mais un rapport des soldes ou de maintenance (glisser-déposer) : on l'importe comme tel
    if (lu.manquants.length && RDJ.lireSoldes(lignes).lignes) return enregistrerSoldes(fichier, RDJ.lireSoldes(lignes));
    if (lu.manquants.length && RDJ.lireMaintenance(lignes, contexte().nuit, true).lignes) {
      return enregistrerMaintenance(fichier, RDJ.lireMaintenance(lignes, contexte().nuit, true));
    }
    if (lu.manquants.length) {
      notice('Ce fichier ne ressemble pas au rapport du jour.\nColonnes introuvables : ' + lu.manquants.join(', '), 'erreur');
      return false;
    }

    etat.import = { fichier: fichier.name, importeLe: RDJ.maintenantLocal(), reservations: lu.reservations };
    etat.dateRapportManuelle = null;
    etat.pdj.nombre = null;
    const nuit = RDJ.dateRapportAuto(lu.reservations);

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
    aller('rapport');
    notice(bilan, ctx.horsPlan.length || lu.ignorees || ajoutsRetires.length ? 'alerte' : 'ok');
    return true;
  }
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

  function enregistrerSoldes(fichier, s) {
    const nuit = contexte().nuit;
    etat.soldes = { fichier: fichier.name, importeLe: RDJ.maintenantLocal(), nuit, chambres: s.chambres, resas: s.resas };
    enregistrer();
    const ctx = contexte();
    const avecMontant = ctx.chiffres.aEncaisser.filter((e) => e.montant !== null).length;
    aller('rapport');
    notice('Rapport des départs importé : ' + s.lignes + ' ligne(s) de montant dû (' + fichier.name + ').\n' +
      (ctx.raw.length
        ? avecMontant + ' / ' + ctx.chiffres.aEncaisser.length + ' départ(s) non payé(s) ont maintenant leur montant dû' +
          (ctx.chiffres.totalDu !== null ? ' · total dû ' + RDJ.formatMontant(ctx.chiffres.totalDu) : '') + '.'
        : "Importez aussi le rapport clients présents pour voir les montants sur le rapport."),
      ctx.raw.length && avecMontant < ctx.chiffres.aEncaisser.length ? 'alerte' : 'ok');
    return true;
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

  function enregistrerMaintenance(fichier, m) {
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
    aller('plan');
    notice(bilan, occupees.length || horsPlan.length ? 'alerte' : 'ok');
    return true;
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
    importer: () => { fermerMenuImport(); $('#fichier-import').click(); },
    'importer-soldes': () => { fermerMenuImport(); $('#fichier-soldes').click(); },
    'importer-maintenance': () => { fermerMenuImport(); $('#fichier-maintenance').click(); },
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

    sauvegarder: () => {
      etat.derniereSauvegarde = RDJ.maintenantLocal();
      RDJ.store.exporter(etat);
      enregistrer();
      afficher();
      notice('Sauvegarde téléchargée (dossier Téléchargements).', 'ok');
    },
    restaurer: () => $('#fichier-restaurer').click(),

    'tout-supprimer': async () => {
      const rep = await dialogue({
        titre: 'Supprimer toutes les données',
        message: 'Toutes les données vont être supprimées (import, historique des nuits, corrections).\nUne sauvegarde sera téléchargée avant.\n\nTapez SUPPRIMER pour confirmer :',
        saisie: '', ok: 'Supprimer', danger: true,
      });
      if (rep === null) return;
      if (rep.trim().toUpperCase() !== 'SUPPRIMER') return notice("Confirmation incorrecte : rien n'a été supprimé.", 'alerte');
      RDJ.store.exporter(etat, 'avant_suppression_' + RDJ.maintenantLocal().replace('T', '_').replace(':', 'h'));
      const reglages = etat.reglages;
      etat = RDJ.etatVide();
      etat.reglages = reglages;
      enregistrer();
      aller('accueil');
      notice('Toutes les données ont été supprimées (une sauvegarde a été téléchargée juste avant).', 'ok');
    },
  };

  function fermerMenuImport() {
    const m = $('#menu-import');
    if (m && !m.hidden) { m.hidden = true; document.querySelector('[data-action="menu-import"]').setAttribute('aria-expanded', 'false'); }
  }
  // clic ailleurs ou Échap : le menu se ferme
  document.addEventListener('click', (ev) => { if (!ev.target.closest('.menu-import')) fermerMenuImport(); }, true);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') fermerMenuImport(); });

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

  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.id === 'mode-affichage') {
      try { localStorage.setItem('rdj.affichage', t.value); } catch (e) { /* sans importance */ }
      ajusterFeuilles();
      return;
    }
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
      const f = t.files[0];
      t.value = '';
      if (f) importer(f);
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
    importer(ev.dataTransfer.files[0]);
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
  function sauvegardeHebdo() {
    if (!etat.reglages.sauvegardeHebdo || !RDJ.store.disponible) return;
    if (!etat.recap.length && !etat.import) return;
    const sauv = etat.derniereSauvegarde;
    if (sauv && RDJ.ecartJours(RDJ.aujourdhui(), sauv.slice(0, 10)) < 7) return;
    etat.derniereSauvegarde = RDJ.maintenantLocal();
    RDJ.store.exporter(etat);
    enregistrer();
    afficher();
    notice('Sauvegarde hebdomadaire téléchargée (dossier Téléchargements).', 'ok');
  }
  sauvegardeHebdo();
  if (!RDJ.store.disponible) notice('Le stockage du navigateur est désactivé : les données ne seront pas conservées.', 'erreur');
})();
