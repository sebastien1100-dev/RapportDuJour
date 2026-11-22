/* Rapport du jour — © 2026, tous droits réservés. Reproduction interdite sans autorisation (voir LICENSE). */
/* Construction du HTML des écrans et des feuilles imprimables.
   Les feuilles (.feuille) servent à la fois à l'affichage et à l'impression. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});
  const V = (RDJ.vues = {});

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = (x) => Math.round(x * 100) + ' %';
  const maj = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  V.esc = esc;

  function titreJour(iso) {
    return RDJ.jourSemaine(iso) + ' ' + RDJ.dateFr(iso);
  }
  function niveauTaux(t) {
    return t < 0.5 ? 'bas' : t < 0.8 ? 'moyen' : 'haut';
  }

  /* ================= FEUILLE : RAPPORT ================= */

  const TYPES_MODIF = [
    ['PAYE', 'PAYÉES'],
    ['RECOUCHE', 'RECOUCHES (au lieu de départ)'],
    ['DEPART', 'DÉPARTS (au lieu de recouche)'],
    ['PDJ', 'PETITS DÉJ. AJOUTÉS'],
  ];

  function texteModifs(modifs, ajouts) {
    const parties = [];
    if (ajouts && ajouts.length) parties.push('CHAMBRES AJOUTÉES : ' + ajouts.map((a) => a.chambre).join(', '));
    for (const [type, lib] of TYPES_MODIF) {
      const ch = modifs.filter((m) => m.type === type).map((m) => m.chambre);
      if (ch.length) parties.push(lib + ' : ' + ch.join(', '));
    }
    return parties.length ? 'MODIFIÉ À LA MAIN : ' + parties.join('  ·  ') : '';
  }

  V.feuilleRapport = function (ctx) {
    const { nuit, chiffres: c, grille } = ctx;
    const demain = RDJ.jours(nuit, 1);
    // hauteur minimale des lignes de la grille : la page doit tenir sur une feuille A4 paysage,
    // l'encadré « À encaisser » (3 chambres par ligne) et la liste des autres prennent sur la grille.
    // Avec peu de chambres, la grille s'étire ensuite pour occuper toute la hauteur restante (CSS .r-grille).
    const rangsEnc = Math.max(1, Math.ceil(c.aEncaisser.length / 3), c.groupes.length);
    const hEnc = 8 + rangsEnc * 5.4 + (c.nonPayeesRestent.length ? 5 : 0);
    const hLigne = Math.min(6.4, (108 - Math.max(0, hEnc - 16)) / Math.max(grille.parBloc, 1)); // 4 mm pris par la ligne « Sources »
    const petite = hLigne < 4.6;

    const tuiles = [
      ['Chambres occupées  (' + pct(c.taux) + ')', c.chambres],
      ['Clients', c.clients],
      ['Départ', c.departs],
      ['Recouches', c.recouches],
      ['Petits déj. (couverts)', c.pdj],
      ['Non payées', c.nonPayees.length],
      ['Groupe non payées', c.groupeNonPayees.length],
    ].map(([l, v]) => `<div class="r-tuile${l === 'Non payées' && v > 0 ? ' alerte' : ''}"><span>${esc(l)}</span><b>${v}</b></div>`).join('');

    const bloc = (lignes) => `
      <table class="r-table${petite ? ' petite' : ''}">
        <thead><tr><th>Ch.</th><th>Client</th><th>Src</th><th>Pers.</th><th>Nuit</th><th>Départ</th><th>Statut</th><th>PDJ</th><th>Payé</th></tr></thead>
        <tbody>${lignes.map((l) => {
          // une seule information par signal : fond de ligne = départ à l'écran, petit déjeuner (hachures) sur papier ;
          // case « Payé » inversée = non payée
          const cls = [l.partDemain ? 'dep' : '', l.pdj ? 'pdj' : '', l.manuel ? 'ajout' : ''].join(' ').trim();
          const mod = (t) => (l.modifs.includes(t) ? ' modifie' : '');
          return `<tr class="${cls}" style="height:${hLigne}mm"${l.manuel ? ` data-modif="fiche" data-ch="${esc(l.chambre)}" title="Chambre ajoutée à la main : double-clic pour la modifier"` : ''}>
            <td class="ch">${esc(l.chambre)}</td>
            <td class="nom">${esc(l.nom)}</td>
            <td class="c src" title="${esc(l.source.brut)}">${esc(l.source.code)}</td>
            <td class="c">${esc(l.pers)}</td>
            <td class="c">${esc(l.nuitNo)}</td>
            <td class="c">${esc(RDJ.dateCourte(l.depart))}</td>
            <td class="c statut clic${mod('RECOUCHE')}${mod('DEPART')}" data-modif="demain" data-ch="${esc(l.chambre)}">${l.depart ? (l.partDemain ? 'DÉPART' : 'Recouche') : ''}</td>
            <td class="c clic${mod('PDJ')}" data-modif="pdj" data-ch="${esc(l.chambre)}">${l.pdj ? 'Oui' : ''}</td>
            <td class="c clic${l.paye ? '' : l.groupe ? ' npg' : ' np'}${mod('PAYE')}" data-modif="paye" data-ch="${esc(l.chambre)}">${l.paye ? 'Oui' : l.groupe ? 'GRP' : 'NON'}</td>
          </tr>`;
        }).join('')}${
          // colonnes plus courtes complétées par des lignes vides : les lignes restent alignées d'une colonne à l'autre
          // et au moins 12 lignes par colonne, pour que les lignes ne deviennent pas immenses avec très peu de chambres
          // même hauteur que les autres lignes : sinon elles absorbent tout l'étirement de la colonne
          `<tr class="vide" style="height:${hLigne}mm"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`.repeat(Math.max(0, Math.max(grille.parBloc, 12) - lignes.length))}</tbody>
      </table>`;

    const modifs = texteModifs(ctx.modifs, ctx.ajouts);

    // Encadré « À encaisser » : chambres individuelles non payées qui partent demain, avec leur
    // montant dû (case à remplir à la main tant que l'export ne donne pas le solde).
    // Les autres non payées (elles restent) : simple liste, sans montant. Groupes à part.
    const encaisser = c.aEncaisser.length
      ? `<ul>${c.aEncaisser.map((e) => `<li>
          <b class="no">${esc(e.chambre)}</b>
          <span class="nom">${esc(e.nom)}</span>
          <i class="src" title="${esc(e.source.brut)}">${esc(e.source.nom)}</i>
          <span class="du">${e.montant !== null ? esc(RDJ.formatMontant(e.montant)) : '<i class="a-remplir"></i>€'}</span>
        </li>`).join('')}</ul>`
      : '<p class="aucune">Aucun départ non payé</p>';
    const restent = c.nonPayeesRestent.length
      ? `<p class="r-restent"><b>Autres non payées :</b> ${esc(c.nonPayeesRestent.join(', '))}</p>`
      : '';
    const totalDu = c.totalDu !== null ? `<span class="total">Total dû : ${esc(RDJ.formatMontant(c.totalDu))}</span>` : '';
    const groupes = c.groupes.length
      ? c.groupes.map((g) => `<div class="grp"><b>Groupe ${esc(g.id)}</b> (${g.chambres.length} ch.) : ${esc(g.chambres.join(', '))}</div>`).join('')
      : '<p class="aucune">Aucune chambre</p>';

    return `
    <div class="feuille paysage rapport">
      <header class="r-tete">
        <div>
          <h1>RAPPORT DU ${esc(titreJour(demain).toUpperCase())}</h1>
          <div class="sous">Nuit du ${esc(RDJ.dateFr(nuit))} au ${esc(RDJ.dateFr(demain))}  ·  ${esc(ctx.cfg.hotel)}</div>
        </div>
        <div class="r-import">${ctx.etat.import ? 'Import : ' + esc(ctx.etat.import.fichier) + '<br>le ' + esc(RDJ.dateFr(ctx.etat.import.importeLe.slice(0, 10)) + ' à ' + ctx.etat.import.importeLe.slice(11, 16)) : 'Aucune donnée importée'}${ctx.soldes ? '<br>Départs : ' + esc(ctx.soldes.fichier) : ''}</div>
      </header>
      <div class="r-tuiles">${tuiles}</div>
      <div class="r-sources"><b>Sources :</b>${c.parSource.filter((s) => s.chambres).map((s) =>
        `<span title="${esc(s.detail && s.detail.length ? s.detail.join(', ') : s.nom)}"><i>${esc(s.code)}</i> ${esc(s.nom)} <b>${s.chambres}</b> <small>(${pct(c.chambres ? s.chambres / c.chambres : 0)})</small></span>`).join('') || ' —'}</div>
      <div class="r-encaisser">
        <div>
          <section class="r-enc-ind">
            <h3><span>À ENCAISSER</span> Départs non payés (${c.aEncaisser.length})${totalDu}</h3>
            ${encaisser}
          </section>
          ${restent}
        </div>
        <section class="r-enc-grp">
          <h3>Groupes non payés</h3>
          ${groupes}
        </section>
      </div>
      <div class="r-grille">${grille.blocs.map(bloc).join('')}</div>
      <div class="r-modifs">${esc(modifs)}</div>
      <footer class="r-legende">
        <b>Légende :</b>
        <span class="leg-ecran"><i class="ech"></i>Recouche</span>
        <span class="leg-ecran"><i class="ech dep"></i>Départ du jour</span>
        <span class="leg-papier"><i class="ech pdj"></i>Petit déjeuner</span>
        <span class="leg-papier"><b class="leg-dep">DÉPART</b>Départ du jour</span>
        <span><i class="ech np">NON</i>Non payée, à encaisser</span>
        <span><i class="ech npg">GRP</i>Groupe non payé, réglé en une fois</span>
        <span><i class="ech mod">Oui</i>Modifié à la main</span>
        <span><i class="ech aj">005</i>Chambre ajoutée à la main</span>
      </footer>
    </div>`;
  };

  /* ================= FEUILLE : PLAN DES CHAMBRES ================= */

  const STATUTS_PLAN = [
    ['depart', 'Départ du jour'],
    ['recouche', 'Recouche'],
    ['libre', 'Libre'],
    ['sale', 'Sale (à faire)'],
    ['hs', 'Hors service'],
  ];

  // symbole d'architecte : mur interrompu, battant ouvert et arc d'ouverture
  const PORTE_SVG = `<svg viewBox="0 0 20 24" preserveAspectRatio="none" aria-hidden="true"><rect x=".6" y=".6" width="18.8" height="22.8" rx="2.5" class="fond"/>
    <path d="M10 1.5V6M10 18V22.5" class="mur"/><path d="M10 18L18 11" class="battant"/><path d="M18 11A10.6 10.6 0 0 0 10 7.4" class="arc"/></svg>`;

  /** comm : { avec: chambre communicante, cote: 'g' | 'd' (côté de la porte, si voisine dans la rangée) } */
  function caseChambre(no, s, comm, type) {
    const badgeType = type ? `<i class="pl-type t-${esc(type.code)}">${esc(type.code)}</i>` : '';
    // plan vierge : numéro (et type) seulement, case blanche à remplir à la main
    if (s.statut === 'vierge') {
      return `<div class="pl-ch s-vierge${comm && comm.cote ? ' comm-' + comm.cote : ''}"><div class="pl-haut"><b>${esc(no)}</b>${badgeType}</div></div>`;
    }
    const lib = STATUTS_PLAN.find(([k]) => k === s.statut)[1];
    const infos = [];
    if (s.pers) infos.push(s.pers + ' p.');
    if (s.pdj) infos.push('PDJ');
    // détail affiché au survol par une infobulle maison (app.js) : l'attribut title ne s'affiche pas partout
    const ligne = (l, v, cls) => (v ? `<div><span>${esc(l)}</span><b${cls ? ` class="${cls}"` : ''}>${esc(v)}</b></div>` : '');
    const bulle = `<header><b>Chambre ${esc(no)}</b><em class="s-${s.statut}">${esc(lib)}</em></header>
      ${ligne('Type', type ? type.nom : '')}${ligne('Client', s.nom)}${ligne('Source', s.source ? s.source.nom : '')}${ligne('Personnes', s.pers ? String(s.pers) : '')}
      ${ligne('Départ', s.depart ? RDJ.dateFr(s.depart) : '')}${ligne('Petit déj.', s.statut === 'depart' || s.statut === 'recouche' ? (s.pdj ? 'Oui' : 'Non') : '')}
      ${ligne('Groupe', s.groupe ? 'Oui' : '')}
      ${ligne('Paiement', (s.statut === 'depart' || s.statut === 'recouche') && !s.groupe ? (s.nonPaye ? 'NON PAYÉE' : 'Payée') : '', s.nonPaye ? 'non-paye' : '')}
      ${s.bloquee ? `<p class="non-paye">Bloquée (rapport de maintenance)${s.motif ? ' : ' + esc(s.motif) : ''}</p>` : ''}
      ${comm ? `<p>Communicante avec la ${esc(comm.avec)}</p>` : ''}
      ${s.manuel ? '<p>Ajoutée à la main</p>' : ''}${s.corrige && !s.sansClient ? '<p>Corrigée sur la feuille de chambre</p>' : ''}
      ${s.sansClient ? '<p class="astuce">Double-clic : libre → sale → hors service</p>' : ''}`;
    const cls = [s.manuel ? 'aj' : '', comm && comm.cote ? 'comm-' + comm.cote : '', s.sansClient ? 'clic' : ''].filter(Boolean).join(' ');
    return `<div class="pl-ch s-${s.statut}${cls ? ' ' + cls : ''}" data-bulle="${esc(bulle)}"${s.sansClient ? ` data-plan="${esc(no)}"` : ''}>
      <div class="pl-haut"><b>${esc(no)}</b>${comm && !comm.cote ? `<i class="pl-comm">⇄ ${esc(comm.avec)}</i>` : ''}${badgeType}</div>
      <span class="pl-nom">${s.statut === 'hs' ? 'HS' : s.statut === 'sale' ? 'SALE · à faire' : s.statut === 'libre' ? 'libre' : esc(s.nom)}</span>
      <span class="pl-info"><span>${esc(infos.join(' · '))}</span>${s.groupe ? '<i class="pl-grp">GRP</i>' : s.nonPaye ? '<i class="pl-np">€</i>' : ''}</span>
    </div>`;
  }

  /** opts.vierge : plan sans date ni statut, à remplir à la main. */
  V.feuillePlan = function (ctx, opts) {
    const vierge = !!(opts && opts.vierge);
    const { nuit } = ctx;
    const demain = RDJ.jours(nuit, 1);
    const etages = RDJ.planEtages(ctx.cfg.planFdc, ctx.cfg.dispositionEtages);
    const st = vierge ? {} : RDJ.statutsChambres(ctx.eff, ctx.etatsFdc, nuit);
    const tous = Object.values(st);
    const compte = (k) => tous.filter((s) => s.statut === k).length;
    const vide = vierge ? { statut: 'vierge' } : { statut: 'libre', pers: 0 };
    const comm = RDJ.communicantes(ctx.cfg.chambresCommunicantes);
    const typeDe = (n) => (ctx.cfg.types[n] ? ctx.cfg.typesChambre.find((t) => t.code === ctx.cfg.types[n]) || null : null);

    const aile = (a) => {
      const caseLocal = (l) => `<div class="pl-ch pl-local${l.petit ? ' petit' : ''}" style="grid-column: span ${l.largeur}"><b>${esc(l.local)}</b>${l.detail ? `<span>${esc(l.detail)}</span>` : ''}</div>`;
      const caseComm = (n, i, liste) => {
        const avec = comm[n];
        if (!avec) return null;
        return { avec, cote: liste[i + 1] === avec ? 'd' : liste[i - 1] === avec ? 'g' : '' };
      };
      // porte dessinée à cheval sur la séparation de deux chambres communicantes voisines
      const rang = (liste) => {
        let col = 1;
        const portes = [];
        const cases = liste.map((n, i) => {
          const debut = col;
          col += typeof n === 'string' ? 1 : n.largeur || 1;
          if (typeof n !== 'string') return caseLocal(n);
          const c = caseComm(n, i, liste);
          if (c && c.cote === 'd') portes.push(`<i class="pl-porte" style="grid-column:${debut} / span 2" title="Porte communicante ${esc(n)} ⇄ ${esc(c.avec)}">${PORTE_SVG}</i>`);
          return caseChambre(n, st[n] || vide, c, typeDe(n));
        });
        return `<div class="pl-rang">${cases.join('')}${portes.join('')}</div>`;
      };
      const cote = (lib) => (lib ? `<div class="pl-cote">${esc(lib)}</div>` : '');
      const cols = Math.max(RDJ.largeurRang(a.haut), RDJ.largeurRang(a.bas), 1);
      // coursives extérieures : chambres dos à dos (mur au milieu), une coursive de chaque côté
      if (ctx.cfg.couloirsExterieurs) {
        const coursive = (lib) => `<div class="pl-coursive"><span>Coursive extérieure${lib ? ' · <b>' + esc(lib) + '</b>' : ''}</span></div>`;
        const section = (haut, bas, libs, n) => `<div class="pl-aile ext" style="--cols:${n}">
            ${coursive(libs && a.hautLib)}${rang(haut)}<div class="pl-mur"></div>${rang(bas)}${coursive(libs && a.basLib)}
          </div>`;
        const [hautG, hautD] = RDJ.couperCage(a.haut);
        const [basG, basD] = RDJ.couperCage(a.bas);
        if (!hautD && !basD) return `<div class="pl-bloc">${section(a.haut, a.bas, true, cols)}</div>`;
        // cage d'escalier : même colonne sur tous les étages (colonnesAvantCage cases à gauche)
        const colsG = Math.max(ctx.cfg.colonnesAvantCage || 0, RDJ.largeurRang(hautG), RDJ.largeurRang(basG), 1);
        // locaux sur toute la hauteur (accueil, combles…) ou aile de chambres
        const zone = a.droite && a.droite.length
          ? `<div class="pl-zone" style="--cols:${RDJ.largeurRang(a.droite)}">${a.droite.map(caseLocal).join('')}</div>` : '';
        const droite = zone || ([...(hautD || []), ...(basD || [])].length
          ? section(hautD || [], basD || [], true, Math.max(RDJ.largeurRang(hautD || []), RDJ.largeurRang(basD || []), 1)) : '');
        return `<div class="pl-bloc pl-avec-cage">
          ${section(hautG, basG, true, colsG)}
          <div class="pl-cage" title="Cage d'escalier et ascenseur"><span>Escalier<br>Ascenseur</span></div>
          ${droite}
        </div>`;
      }
      return `<div class="pl-bloc">
        ${cote(a.hautLib)}
        <div class="pl-aile" style="--cols:${cols}">
          ${rang(a.haut)}
          <div class="pl-couloir"><span>Couloir</span></div>
          ${rang(a.bas)}
        </div>
        ${cote(a.basLib)}
      </div>`;
    };

    const etage = (e) => {
      const nos = RDJ.chambresEtage(e);
      const occ = nos.filter((n) => st[n] && (st[n].statut === 'depart' || st[n].statut === 'recouche')).length;
      return `<section class="pl-etage">
        <header><b>${esc(e.nom)}</b>${vierge ? `<span>${nos.length} chambres</span>` : `
          <span class="pl-taux ${niveauTaux(nos.length ? occ / nos.length : 0)}"><b>${pct(nos.length ? occ / nos.length : 0)}</b><i><i style="width:${nos.length ? Math.round((occ / nos.length) * 100) : 0}%"></i></i></span>
          <span>${occ} / ${nos.length} occupées</span>`}</header>
        <div class="pl-ailes">${e.ailes.map(aile).join('')}</div>
      </section>`;
    };

    const tuiles = [['Départs du jour', compte('depart'), 'depart'], ['Recouches', compte('recouche'), 'recouche'],
      ['Libres', compte('libre'), 'libre'], ['Sales', compte('sale'), 'sale'], ['Hors service', compte('hs'), 'hs']]
      .map(([l, v, k]) => `<div class="pl-tuile"><i class="pl-ech s-${k}"></i><span>${esc(l)}</span><b>${v}</b></div>`).join('');
    const legendeTypes = ctx.cfg.typesChambre
      .map((t) => `<span><i class="pl-type t-${esc(t.code)}">${esc(t.code)}</i>${esc(t.code === 'PMR' ? 'Adaptée PMR' : t.nom)}</span>`).join('');

    if (vierge) {
      return `
    <div class="feuille paysage plan vierge">
      <header class="r-tete">
        <div>
          <h1>PLAN DES CHAMBRES</h1>
          <div class="sous">${esc(ctx.cfg.hotel)}</div>
        </div>
        <div class="pl-date-vierge">Date : <i></i></div>
      </header>
      <div class="pl-etages">${etages.map(etage).join('')}</div>
      <footer class="r-legende">
        <b>Types de chambre :</b>
        <span class="leg-types">${legendeTypes}</span>
      </footer>
    </div>`;
    }

    return `
    <div class="feuille paysage plan">
      <header class="r-tete">
        <div>
          <h1>PLAN DES CHAMBRES</h1>
          <div class="sous">Nuit du ${esc(RDJ.dateFr(nuit))} au ${esc(RDJ.dateFr(demain))}  ·  ${esc(ctx.cfg.hotel)}  ·  statut de la feuille de chambre, corrections comprises</div>
        </div>
        <div class="pl-tuiles">${tuiles}</div>
      </header>
      <div class="pl-etages">${etages.map(etage).join('')}</div>
      <footer class="r-legende">
        <b>Légende :</b>
        ${STATUTS_PLAN.map(([k, l]) => `<span><i class="pl-ech s-${k}"></i>${esc(l)}</span>`).join('')}
        <span><i class="pl-np">€</i>Non payée</span>
        <span><i class="pl-grp">GRP</i>Client d'un groupe</span>
        <span><i class="pl-porte leg">${PORTE_SVG}</i>Porte communicante</span>
        <span class="leg-types">${legendeTypes}</span>
        <span><i class="pl-ech s-recouche aj"></i>Ajoutée à la main</span>
      </footer>
    </div>`;
  };

  /* ================= FEUILLE : FEMME DE CHAMBRE ================= */

  function texteCorrections(corrections) {
    const libelles = [['B', 'À BLANC'], ['R', 'RECOUCHE'], ['BR', 'BLANC RECOUCHE'], ['HS', 'HORS SERVICE'], ['X', 'NO SHOW']];
    const lignes = [];
    for (const [code, lib] of libelles) {
      const ch = Object.keys(corrections).filter((k) => corrections[k] === code).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
      if (ch.length) lignes.push(`<div><b>${lib} :</b> ${esc(ch.join(', '))}</div>`);
    }
    return lignes.length ? '<div class="f-corr-titre">CORRECTIONS DU JOUR</div>' + lignes.join('') : '';
  }

  /** Chambres bloquées par le rapport de maintenance, en HS sur la feuille (sans correction à la main),
      regroupées par motif : « Ménage (10) : 330, 333 à 335, 380 à 385 ». */
  /** Chambres bloquées par la maintenance et toujours hors service (non remises en service à la main). */
  const chambresBloquees = (ctx) =>
    Object.keys(ctx.etatsFdc).filter((k) => ctx.etatsFdc[k].bloquee && ctx.etatsFdc[k].etat === 'HS' && !ctx.etatsFdc[k].corrige);

  function texteBloquees(ctx) {
    const nos = chambresBloquees(ctx);
    if (!nos.length) return '';
    const groupes = RDJ.grouperBloquees(nos.map((k) => [k, ctx.etatsFdc[k].motif]));
    return `<div class="f-corr-titre">CHAMBRES BLOQUÉES (MAINTENANCE) · ${nos.length}</div>` +
      groupes.map((g) => `<div class="f-bloq"><b>${esc(g.motif)} (${g.chambres.length}) :</b> ${esc(RDJ.plagesChambres(g.chambres))}</div>`).join('');
  }

  /** opts.vierge : feuille sans date ni saisie, à remplir à la main. */
  V.feuilleFdc = function (ctx, opts) {
    const vierge = !!(opts && opts.vierge);
    const plan = ctx.cfg.planFdc;
    const nbLignes = Math.max(...plan.map((c) => c.length));
    const cpt = ctx.compteursFdc;
    const val = (n) => (vierge ? '' : n);
    const hLigne = Math.min(8.6, 132 / nbLignes);

    let corps = '';
    for (let i = 0; i < nbLignes; i++) {
      corps += `<tr style="height:${hLigne}mm">`;
      plan.forEach((col, ci) => {
        const cell = col[i];
        const sep = ci > 0 ? ' sep' : '';
        if (cell === undefined) { corps += `<td class="no${sep}"></td><td></td><td></td>`; return; }
        const no = typeof cell === 'string' ? cell : cell.no;
        const noire = typeof cell !== 'string' && cell.noir;
        const k = RDJ.normChambre(no);
        if (noire) { corps += `<td class="no${sep}">${esc(no)}</td><td class="noire"></td><td class="noire"></td>`; return; }
        const e = ctx.etatsFdc[k] || { etat: '', corrige: false };
        const nv = !vierge && ctx.fdc.nv[k];
        corps += `<td class="no${sep}">${esc(no)}</td>` +
          `<td class="etat clic${!vierge && e.corrige ? ' corrige' : ''}${!vierge && e.etat === 'HS' ? ' hs' : ''}" data-fdc="etat" data-ch="${esc(k)}">${vierge ? '' : esc(e.etat)}</td>` +
          `<td class="nv clic" data-fdc="nv" data-ch="${esc(k)}">${nv ? 'NV' : ''}</td>`;
      });
      corps += '</tr>';
    }
    const entetes = plan.map((_, ci) => `<th class="${ci > 0 ? 'sep' : ''}">N°</th><th></th><th>NV</th>`).join('');

    return `
    <div class="feuille paysage fdc">
      <header class="f-tete">
        <div class="f-date">${vierge ? '' : esc(maj(titreJour(RDJ.jours(ctx.nuit, 1))))}</div>
        <div class="f-titre"><h1>FEUILLE DE CHAMBRE</h1><div>${esc(ctx.cfg.hotel)}</div></div>
        ${vierge ? '<div></div>' : `<table class="f-cpt">
          <tr><th>TOTAL</th><th>B</th><th>R</th><th>BR</th><th>HS</th></tr>
          <tr><td>${val(cpt.total)}</td><td>${val(cpt.B)}</td><td>${val(cpt.R)}</td><td>${val(cpt.BR)}</td><td>${val(cpt.HS)}</td></tr>
        </table>`}
      </header>
      <table class="f-grille"><thead><tr>${entetes}</tr></thead><tbody>${corps}</tbody></table>
      <div class="f-corr">
        <div class="f-corr-texte">${vierge ? '' : texteCorrections(ctx.fdc.corrections) + texteBloquees(ctx)}</div>
        ${vierge ? '' : besoinsArrivees(ctx)}
      </div>
    </div>`;
  };

  /** Feuille de chambre, en bas à droite : chambres à préparer pour les arrivées du jour, par type
      (rapport des arrivées). Rien si le rapport n'est pas importé. */
  function besoinsArrivees(ctx) {
    const a = ctx.arrivees;
    if (!a) return '';
    // même présentation que le tableau des totaux en haut de la feuille ; les quatre types toujours présents (0 en grisé)
    const types = ctx.cfg.typesChambre;
    const nbAutres = Object.values(a.autres).reduce((s, n) => s + n, 0);
    // à préparer : départs du jour à faire pour loger les arrivées, une fois les chambres libres attribuées ;
    // manque : arrivées au-delà des libres et des départs (même calcul que la carte de l'accueil)
    const prep = ctx.aPreparer || {};
    const val = (code, cle) => (prep[code] ? prep[code][cle] : 0);
    const cols = [...types.map((t) => [t.code, a.parType[t.code] || 0]), ...(nbAutres ? [['Autre', nbAutres]] : [])];
    const totalPrep = cols.reduce((s, [c]) => s + val(c, 'aPreparer'), 0);
    const totalManque = cols.reduce((s, [c]) => s + val(c, 'manque'), 0);
    return `<div class="f-besoins">
        <div class="f-besoins-titre">Arrivées du ${esc(RDJ.dateFr(a.date).slice(0, 5))}</div>
        <table class="f-cpt f-arr">
          <tr><th>ARRIVÉES</th>${cols.map(([c]) => `<th>${esc(c)}</th>`).join('')}</tr>
          <tr><td>${a.total}</td>${cols.map(([, n]) => `<td${n ? '' : ' class="zero"'}>${n}</td>`).join('')}</tr>
          <tr class="prep" title="Départs du jour à préparer, une fois les chambres libres attribuées"><td>À PRÉPARER ${totalPrep}</td>${cols.map(([c]) => { const n = val(c, 'aPreparer'); return `<td${n ? '' : ' class="zero"'}>${c === 'Autre' ? '' : n}</td>`; }).join('')}</tr>
          ${totalManque ? `<tr class="manque"><td>MANQUE</td>${cols.map(([c]) => (val(c, 'manque') ? `<td class="oui">${val(c, 'manque')}</td>` : '<td></td>')).join('')}</tr>` : ''}
        </table>
      </div>`;
  }

  /* ================= FEUILLE : CUISSON PDJ ================= */

  V.feuillePdj = function (ctx) {
    const cfg = ctx.cfg;
    const q = (p) => RDJ.quantitePdj(p, ctx.pdjNombre, ctx.pdjType, cfg.coefLoisir);
    const cuisson = cfg.produitsPdj.filter((p) => p.groupe === 'cuisson');
    const autres = cfg.produitsPdj.filter((p) => p.groupe !== 'cuisson');
    // cuisson « 12 min » + « 180 °C » réunis dans une pastille
    const fourneau = (p) => [p.cuisson, p.temp].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('') || '<em>—</em>';
    const parPlaque = cfg.piecesParPlaque;
    const pl = (n) => n + (n > 1 ? ' plaques' : ' plaque');
    const cellule = (n, detail) => (n > 0 ? `<b>${n}</b>${detail ? `<small>${detail}</small>` : ''}` : '<em>—</em>');
    // pièces d'une fournée en plaques : « 1 plaque + 4 », ou « 1 plaque » si elle n'est pas pleine
    const enPlaques = (n) => {
      const pleines = Math.floor(n / parPlaque), reste = n % parPlaque;
      return pleines === 0 ? pl(1) : pl(pleines) + (reste ? ' + ' + reste : '');
    };
    // viennoiseries : besoin réel réparti en fournées (chaque fournée a ses plaques) ; autres produits : tout pour la 1re fournée
    const lignesCuisson = cuisson.map((p) => {
      if (!p.viennoiserie) return { p, total: cellule(q(p)), parts: cfg.fournees.map((f, i) => (i === 0 ? cellule(q(p)) : '<em>—</em>')) };
      const parts = RDJ.fournees(q(p), cfg.fournees.map((f) => f.part));
      return { p, total: cellule(q(p)), parts: parts.map((n) => cellule(n, enPlaques(n))) };
    });
    return `
    <div class="feuille portrait pdj">
      <header class="p-tete">
        <div>
          <h1>CUISSON PDJ</h1>
          <div class="sous">${esc(cfg.hotel)}</div>
        </div>
      </header>

      <div class="p-entree">
        <div class="p-chiffre"><span>Petits déjeuners</span><b>${ctx.pdjNombre}</b><small>couverts</small></div>
        <div><span>Type de clientèle</span><b>${esc(maj(ctx.pdjType))}</b></div>
        <div><span>Pour la journée du</span><b>${esc(RDJ.dateFr(ctx.mep))}</b></div>
      </div>

      <h2 class="p-section"><i>1</i>Produits en cuisson</h2>
      <table class="p-table p-cuisson">
        <thead><tr><th class="g">Produit</th><th>Cuisson · T°C</th><th class="tot">Total</th>
          ${cfg.fournees.map((f, i) => `<th class="${i === cfg.fournees.length - 1 ? 'res' : ''}">${esc(f.heure)}</th>`).join('')}</tr></thead>
        <tbody>${lignesCuisson.map((l) => `<tr>
          <td class="g">${esc(l.p.nom)}</td>
          <td class="four">${fourneau(l.p)}</td>
          <td class="q tot">${l.total}</td>
          ${l.parts.map((c, i) => `<td class="q fo${i === l.parts.length - 1 ? ' res' : ''}">${c}</td>`).join('')}
        </tr>`).join('')}</tbody>
      </table>
      <p class="p-fournees">Viennoiseries (plaque de ${parPlaque}) : ${cfg.fournees.slice(0, -1).map((f) => `${f.part} % à ${esc(f.heure)}`).join(', ')} ;
        <b>réserve (${cfg.fournees[cfg.fournees.length - 1].part} %) à cuire seulement si le buffet baisse.</b></p>

      <h2 class="p-section"><i>2</i>Autres produits</h2>
      <table class="p-table p-autres">
        <thead><tr><th class="g">Produit</th><th>Pour ${esc(cfg.fournees[0].heure)}</th><th class="g">Mise en place</th></tr></thead>
        <tbody>${autres.map((p) => `<tr>
          <td class="g">${esc(p.nom)}</td>
          <td class="q"><b>${q(p)}</b></td>
          <td class="mep">${esc(p.miseEnPlace || '')}${p.reco ? `<small>${esc(p.reco)}</small>` : ''}</td>
        </tr>`).join('')}</tbody>
      </table>

      <div class="p-note"><h3>Mise en place de la brioche</h3><p>${esc(cfg.noteBrioche)}</p></div>
      <p class="p-pied">Quantités = base pour 100 PDJ × nombre de PDJ, ajustées selon le type de clientèle (loisir +25 %, business réduit), arrondies au supérieur ; viennoiseries arrondies à la plaque entière.</p>
    </div>`;
  };

  /* ================= FEUILLE : RÉCAP ================= */

  /** Même présentation que la Cuisson PDJ : en-tête, chiffres encadrés, section numérotée, tableau arrondi.
      Une seule page A4 : les 31 dernières nuits, la plus récente en haut (tout l'historique : export .csv). */
  V.feuilleRecap = function (ctx) {
    const MAX = 31;
    const toutes = ctx.etat.recap;
    const n = toutes.length;
    const lignes = toutes.slice(-MAX).reverse();
    const sources = RDJ.colonnesSourcesRecap(ctx.cfg.sourcesReservation, lignes);
    const moy = (f) => (lignes.length ? lignes.reduce((s, l) => s + (f(l) || 0), 0) / lignes.length : 0);
    const arrondi = (x) => Math.round(x).toLocaleString('fr-FR');
    const periode = lignes.length
      ? (lignes.length > 1 ? 'du ' + RDJ.dateFr(lignes[lignes.length - 1].date) + ' au ' + RDJ.dateFr(lignes[0].date) : 'le ' + RDJ.dateFr(lignes[0].date))
      : '—';
    const nbCol = 7 + sources.length;
    const cellSrc = (l) => sources.map((s) => `<td class="src">${l.sources ? (l.sources[s.code] || 0) : '—'}</td>`).join('');
    return `
    <div class="feuille portrait recap">
      <header class="p-tete">
        <div>
          <h1>HISTORIQUE DES NUITS</h1>
          <div class="sous">${esc(ctx.cfg.hotel)}</div>
        </div>
      </header>

      <div class="p-entree">
        <div class="p-chiffre"><span>Nuits sur cette feuille</span><b>${lignes.length}</b><small>${n > MAX ? 'sur ' + n + ' enregistrées' : 'nuits'}</small></div>
        <div><span>Taux d'occupation moyen</span><b>${pct(moy((l) => l.taux))}</b></div>
        <div><span>Période</span><b class="petit">${esc(periode)}</b></div>
      </div>

      <h2 class="p-section"><i>1</i>Nuit par nuit <small>la plus récente en haut</small></h2>
      <table class="p-table h-nuits">
        <thead><tr><th class="g">Nuit du</th><th>Chambres</th><th>Clients</th><th>Départs</th><th>Recouches</th><th>PDJ</th><th>Occupation</th>
          ${sources.map((s) => `<th class="src">${esc(s.code.slice(0, 5))}</th>`).join('')}</tr></thead>
        <tbody>${lignes.length ? lignes.map((l) => `<tr>
          <td class="g">${esc(maj(l.jour.slice(0, 3)))}. ${esc(RDJ.dateFr(l.date))}</td>
          <td>${l.chambres}</td><td>${l.clients}</td><td>${l.departs}</td><td>${l.recouches}</td><td>${l.pdj}</td>
          <td class="taux"><b>${pct(l.taux)}</b></td>${cellSrc(l)}
        </tr>`).join('') : `<tr><td colspan="${nbCol}" class="vide">Aucune nuit enregistrée.</td></tr>`}</tbody>
        ${lignes.length > 1 ? `<tfoot><tr><td class="g">Moyenne</td><td>${arrondi(moy((l) => l.chambres))}</td><td>${arrondi(moy((l) => l.clients))}</td>
          <td>${arrondi(moy((l) => l.departs))}</td><td>${arrondi(moy((l) => l.recouches))}</td><td>${arrondi(moy((l) => l.pdj))}</td>
          <td class="taux"><b>${pct(moy((l) => l.taux))}</b></td>${sources.map(() => '<td></td>').join('')}</tr></tfoot>` : ''}
      </table>
      <p class="p-pied">Une ligne par nuit importée. Chambres par source de réservation : ${sources.map((s) => esc(s.code.slice(0, 5)) + ' = ' + esc(s.nom)).join(', ')} (« — » : non enregistrée cette nuit-là).
        ${n > MAX ? 'Les nuits plus anciennes sont dans l\'export pour Excel (.csv).' : ''}</p>
    </div>`;
  };

  /* ================= DESSIN DE L'HÔTEL (en-tête de l'accueil) =================
     Illustration originale : hôtel de nuit à deux ailes autour d'un campanile. */
  function dessinHotel() {
    const TOIT = '#1c2a48';
    const fenetres = (x0, n, lignes) => lignes.map((motif, li) =>
      Array.from({ length: n }, (_, i) => {
        const allumee = motif[i % motif.length] === '1';
        return `<rect x="${x0 + i * 20}" y="${96 + li * 24}" width="12" height="14" rx="1.5" fill="${allumee ? '#ffd36b' : '#ead8c6'}" stroke="${TOIT}" stroke-opacity=".35" stroke-width=".8"/>` +
          `<line x1="${x0 + i * 20 + 6}" y1="${96 + li * 24}" x2="${x0 + i * 20 + 6}" y2="${110 + li * 24}" stroke="${TOIT}" stroke-opacity=".25" stroke-width=".8"/>`;
      }).join('')).join('');
    return `
    <svg viewBox="0 0 300 172" aria-hidden="true">
      <defs>
        <mask id="croissant"><circle cx="262" cy="30" r="13" fill="#fff"/><circle cx="269" cy="25" r="11" fill="#000"/></mask>
        <linearGradient id="mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf1e4"/><stop offset="1" stop-color="#fbf1e4"/></linearGradient>
      </defs>
      <circle cx="262" cy="30" r="13" fill="#fff4dc" mask="url(#croissant)"/>
      <g fill="#fff">
        <circle cx="210" cy="18" r="1.3" opacity=".85"/><circle cx="236" cy="52" r="1" opacity=".7"/>
        <circle cx="286" cy="58" r="1.2" opacity=".8"/><circle cx="188" cy="40" r=".9" opacity=".6"/>
        <circle cx="40" cy="30" r="1.1" opacity=".7"/><circle cx="84" cy="14" r=".9" opacity=".6"/>
      </g>
      <ellipse cx="150" cy="158" rx="146" ry="12" fill="#5e0b14" opacity=".28"/>

      <!-- aile gauche -->
      <rect x="18" y="86" width="96" height="66" fill="url(#mur)"/>
      <polygon points="10,88 66,60 122,88" fill="${TOIT}"/>
      ${fenetres(28, 4, ['1011', '0110'])}

      <!-- aile droite -->
      <rect x="170" y="86" width="112" height="66" fill="url(#mur)"/>
      <polygon points="162,88 226,60 290,88" fill="${TOIT}"/>
      ${fenetres(180, 5, ['10110', '01101'])}

      <!-- campanile central -->
      <rect x="116" y="44" width="52" height="108" fill="url(#mur)"/>
      <polygon points="108,46 142,8 176,46" fill="${TOIT}"/>
      <path d="M131 70 v-9 a11 11 0 0 1 22 0 v9 z" fill="${TOIT}"/>
      <circle cx="142" cy="64" r="3.4" fill="#ffd36b"/>
      <rect x="125" y="86" width="34" height="12" rx="2" fill="#157f77"/>
      <text x="142" y="94.6" text-anchor="middle" font-family="Arial, sans-serif" font-size="7.5" font-weight="700" fill="#fff" letter-spacing=".8">HÔTEL</text>
      <rect x="124" y="112" width="36" height="6" rx="2" fill="#157f77"/>
      <path d="M131 152 v-20 a11 11 0 0 1 22 0 v20 z" fill="#ffd36b" stroke="${TOIT}" stroke-width="1.6"/>
      <line x1="142" y1="122" x2="142" y2="152" stroke="${TOIT}" stroke-width="1" opacity=".5"/>

      <!-- arbustes -->
      <g fill="${TOIT}" opacity=".55">
        <ellipse cx="22" cy="150" rx="14" ry="9"/><ellipse cx="112" cy="151" rx="9" ry="6"/>
        <ellipse cx="172" cy="151" rx="9" ry="6"/><ellipse cx="284" cy="150" rx="15" ry="9"/>
      </g>
    </svg>`;
  }

  /* ================= ÉCRANS ================= */

  const ICONE_IMPRIMANTE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></svg>';
  // feuilles possibles pour « Imprimer tout » (Réglages → Impressions de la nuit)
  const FEUILLES_NUIT = [
    ['rapport', 'Rapport du jour'],
    ['fdc', 'Feuille de chambre'],
    ['pdj', 'Cuisson PDJ'],
    ['plan', 'Plan de chambre'],
    ['recap', 'Historique'],
  ];
  /** « Rapport ×1 · feuille de chambre ×5 · … » selon les feuilles cochées ('' si aucune). */
  function texteImpressionNuit(cfg, sansQuantites) {
    const nb = { rapport: 1, fdc: cfg.nbExemplairesFdc, pdj: 1, plan: 1, recap: 1 };
    const noms = { rapport: 'Rapport', fdc: 'feuille de chambre', pdj: 'cuisson PDJ', plan: 'plan de chambre', recap: 'historique' };
    // recto verso : les feuilles de chambre passent en dernier, chacune seule sur sa feuille (voir app.js)
    const ordre = cfg.rectoVerso ? [...FEUILLES_NUIT.filter(([k]) => k !== 'fdc'), ...FEUILLES_NUIT.filter(([k]) => k === 'fdc')] : FEUILLES_NUIT;
    const texte = ordre.filter(([k]) => cfg.impressionNuit[k]).map(([k]) => noms[k] + (sansQuantites ? '' : ' ×' + nb[k])).join(' · ');
    return texte && cfg.rectoVerso ? texte + ' · recto verso' : texte;
  }

  /** Accueil, sous l'en-tête : carte « Nouvelle version disponible » (js/maj.js), ouverte par la pastille de la
      barre du haut ou par « Mettre à jour ». Une ligne par version, avec le type de ses changements ;
      le détail du Change log se déplie. */
  const TYPES_MAJ = { correction: 'Correction', nouveau: 'Nouveau', amelioration: 'Amélioration' };
  function carteMaj(ctx) {
    const m = ctx.maj;
    if (!m || m.etat !== 'dispo' || !m.ouvert) return '';
    const etiquette = (t) => `<span class="mc-tag mc-${esc(t)}">${esc(TYPES_MAJ[t] || t)}</span>`;
    const lignes = m.nouveautes.map((v) => {
      const types = Object.keys(TYPES_MAJ).filter((t) => (v.changements || []).some(([x]) => x === t));
      return `<li>
          <div class="mc-ligne"><b class="mc-version">${esc(v.version)}</b>${types.map(etiquette).join('')}<span>${esc(v.titre)}</span></div>
          ${(v.changements || []).length ? `<details><summary>Détail</summary><ul>${v.changements.map(([t, x]) => `<li>${etiquette(t)}${esc(x)}</li>`).join('')}</ul></details>` : ''}
        </li>`;
    }).join('');
    return `
      <section class="maj-carte" aria-label="Nouvelle version disponible">
        <header class="mc-tete">
          <span class="mc-etoile" aria-hidden="true">✦</span>
          <h2>Nouvelle version disponible</h2>
          <span class="mc-versions">${esc(RDJ.VERSION || '')} → ${esc(m.version)}</span>
        </header>
        <ol class="mc-liste">${lignes}</ol>
        <footer class="mc-pied">
          <span class="mc-rassure">Vos données et le dossier « save » ne sont pas touchés · retour en arrière possible</span>
          <button class="btn" data-action="maj-plus-tard">Plus tard</button>
          <button class="btn primaire" data-action="maj-installer">Installer la ${esc(m.version)}</button>
        </footer>
      </section>`;
  }

  /* ---------- Accueil : les six cartes des chiffres (deux rangées de trois) ----------
     Même squelette partout : bandeau de couleur (titre + repère), grand chiffre et contexte, barre de
     répartition, petit tableau de quatre lignes aligné en bas. Rangée du haut : les chambres (Occupation,
     Disponibles après départ, Arrivées) ; rangée du bas : Mouvements, Petits déjeuners, Paiements.
     Un clic sur une carte ouvre l'onglet correspondant. */
  const plur = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
  const pctBarre = (n, total) => (total > 0 ? Math.max(0, Math.min(100, (n / total) * 100)).toFixed(1) : 0);

  /** Une carte. o : { cle, vue, titre, repere, info, nombre, nombreCls, texte, barre, legende, entetes, lignes }
      lignes : [{ cellules: [html…], cls, titre }] ; barre : [[pourcentage, n° de teinte 1 à 4]]. */
  function carteAccueil(o) {
    const lien = o.vue ? ` role="link" tabindex="0" data-vue-aller="${o.vue}"` : '';
    return `
      <section class="ac ac-${o.cle}"${lien} title="${esc(o.info || '')}">
        <header class="ac-tete"><span>${esc(o.titre)}</span>${o.repere ? `<em>${o.repere}</em>` : ''}</header>
        <div class="ac-corps">
          <div class="ac-hero"><b class="${o.nombreCls || ''}">${o.nombre}</b><span>${o.texte || ''}</span></div>
          ${o.legende ? `<div class="ac-legende">${o.legende}</div>` : ''}
          <div class="ac-barre">${(o.barre || []).map(([p, t]) => `<i class="t${t}" style="width:${p}%"></i>`).join('')}</div>
          <table class="ac-tab">
            ${o.entetes ? `<thead><tr>${o.entetes.map((e) => `<th>${e}</th>`).join('')}</tr></thead>` : ''}
            <tbody>${o.lignes.map((l) => `<tr${l.cls ? ` class="${l.cls}"` : ''}${l.titre ? ` title="${esc(l.titre)}"` : ''}>${l.cellules.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      </section>`;
  }

  function cartesAccueil(ctx) {
    const c = ctx.chiffres;
    const imp = !!ctx.etat.import;
    const types = ctx.cfg.typesChambre;
    const pt = ctx.parType || {};
    const T = (code) => pt[code] || { total: 0, occupees: 0, departs: 0, recouches: 0, libres: 0, aFaire: 0, dispo: 0 };
    const somme = (cle) => types.reduce((s, t) => s + T(t.code)[cle], 0) + (pt[''] ? pt[''][cle] : 0);
    const d = (n) => `<span class="d">${n}</span>`;
    const nb = (n) => (imp ? n : '—');
    const totalPlan = ctx.cfg.nbChambres;

    // 1. Occupation
    const occupation = carteAccueil({
      cle: 'occ', vue: 'plan', titre: 'Occupation', repere: imp ? Math.round(c.taux * 100) + ' %' : 'en attente',
      info: 'Chambres occupées cette nuit, par type — ouvrir le plan de chambre',
      nombre: nb(c.chambres),
      texte: `/ ${totalPlan} chambres${imp ? ` · ${plur(c.clients, 'client')} · ${plur(chambresBloquees(ctx).length, 'bloquée')}` : ''}`,
      barre: types.map((t, i) => [pctBarre(T(t.code).occupees, totalPlan), i + 1]),
      entetes: ['Type', 'Occupées', 'Libres'],
      lignes: types.map((t) => ({ titre: t.nom, cellules: [esc(t.code), imp ? `${T(t.code).occupees} ${d('/ ' + T(t.code).total)}` : d('— / ' + T(t.code).total), d(nb(T(t.code).libres))] })),
    });

    // 2. Disponibles après départ : chambres libres + départs (et chambres sales), par type
    const dispo = somme('dispo'), libres = somme('libres'), aFaire = somme('aFaire');
    const disponibles = carteAccueil({
      cle: 'dispo', vue: 'fdc', titre: 'Disponibles après départ', repere: imp ? dispo + ' ch.' : '',
      info: 'Chambres disponibles une fois les départs faits : libres + départs du jour (et chambres sales), sans recouches ni hors service — ouvrir la feuille de chambre',
      nombre: nb(dispo), texte: 'chambres libres une fois les départs faits',
      legende: '<span><i class="t4"></i>déjà libres</span><span><i class="t1"></i>départs</span>',
      barre: [[pctBarre(libres, dispo), 4], [pctBarre(aFaire, dispo), 1]],
      entetes: ['Type', 'Libres', 'Départs', 'Dispo'],
      lignes: types.map((t) => ({ titre: t.nom, cellules: [esc(t.code), d(nb(T(t.code).libres)), d(nb(T(t.code).aFaire)), nb(T(t.code).dispo)] })),
    });

    // 3. Arrivées (rapport des arrivées) : arrivées, disponibles et départs à préparer par type
    const a = ctx.arrivees, prep = ctx.aPreparer || {};
    const manqueTotal = a ? types.reduce((s, t) => s + (prep[t.code] ? prep[t.code].manque : 0), 0) : 0;
    const prepTotal = a ? types.reduce((s, t) => s + (prep[t.code] ? prep[t.code].aPreparer : 0), 0) : 0;
    const typesManque = a ? types.filter((t) => prep[t.code] && prep[t.code].manque).map((t) => `${prep[t.code].manque} en ${t.code}`) : [];
    const nbAutres = a ? Object.values(a.autres).reduce((s, n) => s + n, 0) : 0;
    const arrivees = carteAccueil({
      cle: 'arr', vue: 'fdc', titre: a ? `Arrivées du ${RDJ.dateFr(a.date).slice(0, 5)}` : 'Arrivées',
      repere: a ? `${prepTotal} à préparer` : 'à importer',
      info: a ? `Arrivées du ${titreJour(a.date)} : les chambres libres d'abord, puis les départs à préparer — ouvrir la feuille de chambre` : 'Importer le rapport des arrivées pour voir les chambres à préparer',
      nombre: a ? a.total : '—', texte: a
        ? `${a.total > 1 ? 'chambres' : 'chambre'}${typesManque.length ? ` · <b class="rouge">manque ${esc(typesManque.join(', '))}</b>` : ''}${nbAutres ? ` · ${nbAutres} de type inconnu` : ''}`
        : 'rapport des arrivées non importé',
      barre: a ? [[pctBarre(a.total - nbAutres - manqueTotal, dispo || 1), 2], [pctBarre(manqueTotal, dispo || 1), 'r']] : [],
      entetes: ['Type', 'Arrivées', 'Dispo', 'À préparer'],
      lignes: types.map((t) => {
        const p = prep[t.code];
        if (!a) return { titre: t.nom, cellules: [esc(t.code), d('—'), d(nb(T(t.code).dispo)), d('—')] };
        const n = a.parType[t.code] || 0;
        return {
          cls: p && p.manque ? 'manque' : '',
          titre: `${t.nom} : ${plur(n, 'arrivée')}, ${plur(T(t.code).dispo, 'chambre')} disponible${T(t.code).dispo > 1 ? 's' : ''}${p ? `, ${p.aPreparer} départ${p.aPreparer > 1 ? 's' : ''} à préparer${p.manque ? ', manque ' + p.manque : ''}` : ''}`,
          cellules: [esc(t.code), String(n), d(T(t.code).dispo), p ? (p.manque ? `${p.aPreparer} · manque ${p.manque}` : String(p.aPreparer)) : '0'],
        };
      }),
    });

    // 4. Mouvements : départs du jour et recouches par type
    const mouvements = carteAccueil({
      cle: 'mvt', vue: 'fdc', titre: 'Mouvements', repere: imp ? plur(c.recouches, 'recouche') : '',
      info: 'Départs du jour et recouches, par type — ouvrir la feuille de chambre',
      nombre: nb(c.departs), texte: imp ? `départ${c.departs > 1 ? 's' : ''} · ${plur(c.recouches, 'recouche')}` : 'départs',
      barre: [[pctBarre(c.departs, c.chambres), 1], [pctBarre(c.recouches, c.chambres), 4]],
      entetes: ['Type', 'Départs', 'Recouches'],
      lignes: types.map((t) => ({ titre: t.nom, cellules: [esc(t.code), nb(T(t.code).departs), d(nb(T(t.code).recouches))] })),
    });

    // 5. Petits déjeuners : couverts, viennoiseries et pains à cuire
    const cfg = ctx.cfg;
    const q = (id) => { const p = cfg.produitsPdj.find((x) => x.id === id); return p ? RDJ.quantitePdj(p, ctx.pdjNombre, ctx.pdjType, cfg.coefLoisir) : 0; };
    const plaques = cfg.produitsPdj.filter((p) => p.viennoiserie).reduce((s, p) => s + RDJ.plaques(RDJ.quantitePdj(p, ctx.pdjNombre, ctx.pdjType, cfg.coefLoisir), cfg.piecesParPlaque), 0);
    const nomType = { business: 'Business', loisir: 'Loisir', mixte: 'Mixte' }[ctx.pdjType] || '';
    const pdj = carteAccueil({
      cle: 'pdj', vue: 'pdj', titre: 'Petits déjeuners', repere: esc(nomType),
      info: 'Couverts du petit déjeuner et quantités à cuire — ouvrir la cuisson PDJ',
      nombre: nb(ctx.pdjNombre), texte: `couvert${ctx.pdjNombre > 1 ? 's' : ''}${ctx.pdjManuel ? ' (saisis à la main)' : ''} · ${plur(plaques, 'plaque')} de viennoiseries`,
      barre: cfg.fournees.map((f, i) => [f.part, i + 1]),
      lignes: [['Croissants', q('croissant')], ['Pains au chocolat', q('painchoc')], ['Baguettes signature', q('baguette')], ['Mini-crêpes', q('crepes')]]
        .map(([lib, n]) => ({ cellules: [esc(lib), nb(n)] })),
    });

    // 6. Paiements : chambres non payées et montants à encaisser
    const nonPayees = c.nonPayees.length + c.groupeNonPayees.length;
    const paiements = carteAccueil({
      cle: 'pay', vue: 'rapport', titre: 'Paiements', repere: c.totalDu !== null ? esc(RDJ.formatMontant(c.totalDu)) + ' dus' : '',
      info: 'Chambres non payées et départs à encaisser — ouvrir le rapport du jour',
      nombre: nb(nonPayees), nombreCls: imp ? (nonPayees ? 'rouge' : 'vert') : '',
      texte: `chambre${nonPayees > 1 ? 's' : ''} non payée${nonPayees > 1 ? 's' : ''}`,
      barre: [[pctBarre(nonPayees, c.chambres), 'r']],
      lignes: [
        ['Départs à encaisser', c.aEncaisser.length],
        ['Restent (recouches)', c.nonPayeesRestent.length],
        [`Groupes (${plur(c.groupeNonPayees.length, 'chambre')})`, c.groupes.length],
        ['Total dû', c.totalDu !== null ? esc(RDJ.formatMontant(c.totalDu)) : (imp ? '<span class="d">rapport des départs</span>' : '—')],
      ].map(([lib, n]) => ({ cellules: [esc(lib), imp ? n : '—'] })),
    });

    return `<div class="acc-cartes">${occupation}${disponibles}${arrivees}${mouvements}${pdj}${paiements}</div>`;
  }

  V.ecranAccueil = function (ctx) {
    const c = ctx.chiffres;
    const imp = ctx.etat.import;
    const tuile = (lib, v, mod) => `<div class="tuile${mod ? ' ' + mod : ''}"><span>${esc(lib)}</span><b>${v}</b></div>`;
    const sauv = ctx.etat.derniereSauvegarde;
    const joursSansSauv = sauv ? RDJ.ecartJours(RDJ.aujourdhui(), sauv.slice(0, 10)) : null;
    const alerteSauv = ctx.etat.recap.length > 0 && (sauv === null || joursSansSauv >= 7);

    const demain = RDJ.jours(ctx.nuit, 1);
    const taux = Math.min(1, c.taux);
    const CIRC = 2 * Math.PI * 52;

    // zone de dépôt unique : les trois rapports d'un coup (ou un seul), reconnus tout seuls ;
    // une pastille par rapport : importé (menthe), à importer (beurre), facultatif absent (pointillé)
    const heure = (r) => `${esc(RDJ.dateFr(r.importeLe.slice(0, 10)))} à ${esc(r.importeLe.slice(11, 16))}`;
    const nbBloquees = chambresBloquees(ctx).length;
    const pastilleImport = (fait, nom, detail, titre, obligatoire) => `<span class="dz-pastille ${fait ? 'fait' : obligatoire ? 'manque' : 'option'}"${titre ? ` title="${titre}"` : ''}>${fait ? '✓ ' : ''}${esc(nom)} · ${detail}</span>`;
    // à partir de 23 h, les rapports importés avant ne s'affichent plus dans la zone (nouveau service de nuit)
    const duService = (r) => (RDJ.importDuService(r) ? r : null);
    const zImp = duService(imp), zSoldes = duService(ctx.soldes), zMaint = duService(ctx.maintenance), zArr = duService(ctx.arrivees);
    const zoneImport = `
      <button type="button" class="acc-depot-zone${zImp ? ' rempli' : ''}" data-action="importer">
        <span class="dz-icone" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg></span>
        <b class="dz-titre">${zImp ? 'Déposez de nouveaux rapports ici pour mettre à jour, ou cliquez pour les choisir' : 'Déposez les rapports de la nuit ici, ou cliquez pour les choisir'}</b>
        <span class="dz-aide">Rapport clients présents, des départs, de maintenance et des arrivées, exportés en français ou en anglais : un seul ou plusieurs à la fois, ils sont reconnus tout seuls.</span>
        <span class="dz-pastilles">
          ${pastilleImport(zImp, 'Clients présents', zImp ? `${zImp.reservations.length} ch. · ${heure(zImp)}` : 'à importer', zImp ? esc(zImp.fichier) : '', true)}
          ${pastilleImport(zSoldes, 'Départs', zSoldes ? (c.totalDu !== null ? esc(RDJ.formatMontant(c.totalDu)) + ' dus' : 'importé ' + heure(zSoldes)) : 'facultatif', zSoldes ? esc(zSoldes.fichier) : '')}
          ${pastilleImport(zMaint, 'Maintenance', zMaint ? `${nbBloquees} bloquée${nbBloquees > 1 ? 's' : ''}` : 'facultatif', zMaint ? esc(zMaint.fichier) : '')}
          ${pastilleImport(zArr, 'Arrivées', zArr ? `${zArr.total} le ${esc(RDJ.dateFr(zArr.date))}` : 'facultatif', zArr ? esc(zArr.fichier) : '')}
        </span>
      </button>`;
    return `
    <section class="ecran accueil">
      <header class="hero ${imp ? niveauTaux(c.taux) : 'attente'}">
        <div class="hero-texte">
          <div class="hero-hotel">${esc(ctx.cfg.hotel)}</div>
          <h1 class="hero-date">${esc(maj(RDJ.dateLongue(demain)))}</h1>
          <div class="hero-sous">Nuit du ${esc(RDJ.dateFr(ctx.nuit))} au ${esc(RDJ.dateFr(demain))}</div>
          <div class="hero-pastilles">
            <span class="pastille">${imp
              ? `<i class="point ok"></i>Import du ${esc(RDJ.dateFr(imp.importeLe.slice(0, 10)))} à ${esc(imp.importeLe.slice(11, 16))}<em>${esc(imp.fichier)}</em>`
              : '<i class="point"></i>Aucune donnée importée'}</span>
            ${ctx.dateManuelle ? '<button class="pastille bouton" data-action="date-auto">↺ Date automatique</button>' : ''}
          </div>
        </div>
        <div class="hero-dessin">${dessinHotel()}</div>
        <div class="hero-anneau" role="img" aria-label="Taux d'occupation ${pct(c.taux)}">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" class="anneau-fond"></circle>
            <circle cx="60" cy="60" r="52" class="anneau-val" stroke-dasharray="${(taux * CIRC).toFixed(1)} ${CIRC.toFixed(1)}" transform="rotate(-90 60 60)"></circle>
          </svg>
          <div class="anneau-texte"><b>${pct(c.taux)}</b><span>${c.chambres} / ${ctx.cfg.nbChambres} ch.</span></div>
          <div class="anneau-lib">${imp ? 'Occupation ' + { haut: 'forte', moyen: 'moyenne', bas: 'faible' }[niveauTaux(c.taux)] : 'En attente'}</div>
        </div>
      </header>

      ${carteMaj(ctx)}

      ${zoneImport}

      ${cartesAccueil(ctx)}

      <section class="acc-impr" aria-label="Impressions de la nuit">
        <div class="acc-impr-pastilles">
          <button type="button" class="impr-tout" data-action="imprimer-tout" title="${esc(texteImpressionNuit(ctx.cfg, true) || 'Aucune feuille choisie : voir Réglages')}">
            ${ICONE_IMPRIMANTE}<b>Tout imprimer</b><small>${esc(texteImpressionNuit(ctx.cfg, true) || 'aucune feuille choisie')}</small>
          </button>
          ${FEUILLES_NUIT.map(([k, lib]) => `<button type="button" class="impr-feuille f-${k}" data-action="apercu-${k}" title="Aperçu puis impression : ${esc(lib)}">${esc(lib)}${k === 'fdc' ? ' ×' + ctx.cfg.nbExemplairesFdc : ''}</button>`).join('')}
        </div>
      </section>

      ${alerteSauv ? `<div class="bandeau-sauv">Les données sont gardées dans ce navigateur. ${sauv ? 'Dernière sauvegarde il y a ' + joursSansSauv + ' jours.' : 'Aucune sauvegarde faite pour l\'instant.'}
        <button class="btn" data-action="sauvegarder">Sauvegarder (.json)</button></div>` : ''}

      <details class="me-bloc"${V.modeEmploiReduit ? '' : ' open'}>
        <summary><h3>Mode d'emploi</h3><span class="me-bascule"></span></summary>
        <div class="me-grille">
          <div class="me-colonne">
            <h4>Chaque nuit</h4>
            <ol class="me-etapes">
              <li><i>1</i><div><b>Importer les rapports de la nuit</b><span>Déposez-les dans la zone de l'accueil (ou n'importe où dans la fenêtre), ou cliquez sur la zone pour les choisir : un seul ou les trois à la fois, dans n'importe quel ordre. Les exports en français comme en anglais sont reconnus.</span></div></li>
              <li><i>2</i><div><b>Rapports facultatifs</b><span>Rapport des départs : le montant dû s'affiche dans l'encadré « À encaisser » du rapport. Rapport de maintenance : les chambres bloquées passent hors service sur le plan et la feuille de chambre. Rapport des arrivées : le nombre d'arrivées par type de chambre s'affiche sur l'accueil.</span></div></li>
              <li><i>3</i><div><b>Vérifier et corriger</b><span>Rapport, feuille de chambre, plan, cuisson PDJ et historique se mettent à jour et sont enregistrés tout seuls.</span></div></li>
              <li><i>4</i><div><b>Imprimer</b><span>Depuis chaque onglet, ou avec les pastilles d'impression de l'accueil : « Tout imprimer » ou une seule feuille. Pour un PDF : imprimante « Enregistrer au format PDF ».</span></div></li>
            </ol>
          </div>
          <div class="me-colonne">
            <h4>Corrections au double-clic</h4>
            <ul class="me-astuces">
              <li><b>Rapport</b><span>sur « Statut », « PDJ » ou « Payé » d'une chambre ; « + Ajouter une chambre » pour une arrivée après l'export.</span></li>
              <li><b>Feuille de chambre</b><span>sur la case d'une chambre : vide → B → R → BR → HS → vide ; sur NV pour cocher.</span></li>
              <li><b>Plan de chambre</b><span>sur une chambre libre : libre → sale → hors service → libre.</span></li>
            </ul>
            <p class="me-sauv"><b>Sauvegarde</b> Les données restent dans ce navigateur, sur ce poste : faites régulièrement une sauvegarde (Réglages → « Sauvegarder (.json) », rangée dans le dossier « save » de l'appli).</p>
          </div>
        </div>
      </details>

      <footer class="acc-pied">
        <span class="acc-pied-logo"><img src="img/logo-campanile.png" alt="Campanile"></span>
        <ul class="acc-horaires" aria-label="Horaires clés">
          ${ctx.cfg.horaires.filter((h) => ctx.cfg.horairesValeurs[h.id]).map((h) => `
            <li><span>${esc(h.nom)}</span><b>${esc(ctx.cfg.horairesValeurs[h.id])}</b></li>`).join('')}
        </ul>
        <span class="acc-pied-version"><span title="Reproduction, modification ou diffusion interdites sans autorisation (fichier LICENSE)">© 2026 · tous droits réservés</span> · version ${esc(RDJ.VERSION || '')}${RDJ.maj && RDJ.maj.possible()
          ? ` <button class="acc-pied-maj" data-action="maj-verifier"${ctx.maj && ctx.maj.etat === 'verif' ? ' disabled' : ''} title="Chercher sur GitHub si une nouvelle version existe (Internet nécessaire)">${ctx.maj && ctx.maj.etat === 'verif' ? 'Recherche…' : 'Mettre à jour'}</button>
             <button class="acc-pied-retour" data-action="maj-revenir" title="Remettre la version gardée avant la dernière mise à jour">Version précédente</button>` : ''}</span>
      </footer>
    </section>`;
  };
  // mode d'emploi de l'accueil replié ou non (retenu sur ce poste, voir app.js)
  try { V.modeEmploiReduit = localStorage.getItem('rdj.modeEmploi') === 'reduit'; } catch (e) { V.modeEmploiReduit = false; }

  const papier = (html) => `<div class="papier">${html}</div>`;

  /** En-tête commun des onglets : titre, sous-titre (nuit / aide) et boutons. */
  const teteEcran = (couleur, titre, sous, aide, boutons) => `
      <header class="ecran-tete et-${couleur}">
        <div class="et-texte">
          <h2>${esc(titre)}</h2>
          ${sous ? `<p class="et-sous">${sous}</p>` : ''}
          ${aide ? `<p class="et-aide">${aide}</p>` : ''}
        </div>
        <div class="outils">${boutons || ''}</div>
      </header>`;
  const nuitTexte = (ctx) => `Nuit du ${esc(RDJ.dateFr(ctx.nuit))} au ${esc(RDJ.dateFr(RDJ.jours(ctx.nuit, 1)))}`;

  V.ecranRapport = (ctx) => `
    <section class="ecran">
      ${teteEcran('rapport', 'Rapport du jour', nuitTexte(ctx),
        'Double-clic sur <b>Statut</b>, <b>PDJ</b> ou <b>Payé</b> d\'une chambre pour la modifier, ou sur une chambre ajoutée pour rouvrir sa fiche.', `
        <button class="btn primaire" data-action="apercu-rapport">Imprimer le rapport</button>
        <button class="btn" data-action="ajouter-chambre" ${ctx.raw.length ? '' : 'disabled'}>+ Ajouter une chambre</button>
        <button class="btn" data-action="annuler-modifs" ${ctx.modifs.length || ctx.ajouts.length ? '' : 'disabled'}>Annuler les modifications</button>`)}
      ${papier(V.feuilleRapport(ctx))}
    </section>`;

  V.ecranPlan = (ctx) => `
    <section class="ecran">
      ${teteEcran('plan', 'Plan de chambre', nuitTexte(ctx),
        'Double-clic sur une chambre libre : libre → <b>sale</b> → <b>hors service</b> → libre, reporté aussitôt sur la feuille de chambre. Survol d\'une chambre : détail.', `
        <button class="btn primaire" data-action="apercu-plan">Imprimer le plan</button>
        <button class="btn" data-action="apercu-plan-vierge">Plan vierge</button>`)}
      ${ctx.raw.length ? '' : '<div class="bandeau-sauv">Aucune donnée importée : toutes les chambres apparaissent libres.</div>'}
      ${papier(V.feuillePlan(ctx))}
    </section>`;

  V.ecranFdc = (ctx) => `
    <section class="ecran">
      ${teteEcran('fdc', 'Feuille de chambre', nuitTexte(ctx),
        'Double-clic sur la case d\'une chambre : vide → B → R → BR → HS → vide.', `
        <button class="btn primaire" data-action="apercu-fdc">Imprimer la feuille (${ctx.cfg.nbExemplairesFdc} ex.)</button>
        <button class="btn" data-action="apercu-fdc-vierge">Feuille vierge</button>
        <button class="btn" data-action="annuler-corrections" ${Object.keys(ctx.fdc.corrections).length ? '' : 'disabled'}>Annuler les corrections</button>`)}
      ${ctx.horsPlan.length ? `<div class="bandeau-sauv">Chambres de l'import absentes de la feuille : ${esc(ctx.horsPlan.join(', '))}</div>` : ''}
      ${papier(V.feuilleFdc(ctx))}
    </section>`;

  /** Feuille « Buffet PDJ » : croquis du buffet vu de dessus (js/buffet.js), A4 paysage. */
  V.feuilleBuffet = (ctx) => `
    <div class="feuille paysage buffet">
      <header class="b-tete">
        <div><h1>BUFFET PDJ</h1><div class="sous">Disposition du buffet du petit déjeuner, vue de dessus</div></div>
      </header>
      <div class="b-plan">${RDJ.SVG_BUFFET || ''}</div>
    </div>`;

  /** Onglet PDJ : trois sous-onglets, Cuisson PDJ (quantités), Buffet PDJ (croquis) et Commande (à définir). */
  V.ecranPdj = (ctx) => {
    const sous = ['buffet', 'commande'].includes(ctx.pdjSous) ? ctx.pdjSous : 'cuisson';
    const sousOnglets = `
      <nav class="sous-onglets" role="tablist" aria-label="PDJ">
        <button type="button" role="tab" class="${sous === 'cuisson' ? 'actif' : ''}" aria-selected="${sous === 'cuisson'}" data-action="pdj-cuisson">Cuisson PDJ</button>
        <button type="button" role="tab" class="${sous === 'buffet' ? 'actif' : ''}" aria-selected="${sous === 'buffet'}" data-action="pdj-buffet">Buffet PDJ</button>
        <button type="button" role="tab" class="${sous === 'commande' ? 'actif' : ''}" aria-selected="${sous === 'commande'}" data-action="pdj-commande">Commande</button>
      </nav>`;
    if (sous === 'commande') {
      return `
    <section class="ecran">
      ${sousOnglets}
      ${teteEcran('pdj', 'Commande', 'Commande des produits du petit déjeuner',
        'Le contenu de cet onglet reste à définir.', '')}
      <div class="hi-vide"><b>Commande PDJ : à venir.</b><span>Cet onglet accueillera la commande des produits du petit déjeuner.</span></div>
    </section>`;
    }
    if (sous === 'buffet') {
      return `
    <section class="ecran">
      ${sousOnglets}
      ${teteEcran('pdj', 'Buffet PDJ', 'Disposition du buffet, vue de dessus',
        'Chaque élément porte un numéro, repris dans la légende.', `
        <button class="btn primaire" data-action="apercu-buffet">Imprimer le buffet</button>`)}
      ${papier(V.feuilleBuffet(ctx))}
    </section>`;
    }
    return `
    <section class="ecran">
      ${sousOnglets}
      ${teteEcran('pdj', 'Cuisson PDJ', 'Matin du ' + esc(titreJour(ctx.mep)),
        'Les quantités se recalculent dès qu\'un chiffre change.', `
        <button class="btn primaire" data-action="apercu-pdj">Imprimer la cuisson PDJ</button>`)}
      <div class="cuisson-saisie">
        <section class="cs-carte cs-couverts">
          <h3>Petits déjeuners</h3>
          <div class="cs-compteur">
            <button class="cs-pas" data-pas="-1" data-pour="#pdj-nombre" aria-label="Un de moins">−</button>
            <input type="number" min="0" step="1" id="pdj-nombre" value="${ctx.pdjNombre}" aria-label="Nombre de couverts">
            <button class="cs-pas" data-pas="1" data-pour="#pdj-nombre" aria-label="Un de plus">+</button>
          </div>
          <p class="cs-note">couverts ${ctx.pdjManuel
            ? `· <b class="cs-modifie">modifié</b> <button class="btn lien" data-action="pdj-auto">reprendre le rapport (${ctx.chiffres.pdj})</button>`
            : '· <span class="cs-auto">repris du rapport</span>'}</p>
        </section>

        <section class="cs-carte cs-clientele">
          <h3>Type de clientèle</h3>
          <div class="cs-segments" role="radiogroup" aria-label="Type de clientèle">
            ${[['business', 'Business', 'semaine, travail'], ['loisir', 'Loisir', 'week-end, vacances'], ['mixte', 'Mixte', 'entre les deux']].map(([v, l, d]) => `
              <label class="${v === ctx.pdjType ? 'actif' : ''}"><input type="radio" name="pdj-type" value="${v}" ${v === ctx.pdjType ? 'checked' : ''}><b>${l}</b><small>${d}</small></label>`).join('')}
          </div>
        </section>
      </div>
      ${papier(V.feuillePdj(ctx))}
    </section>`;
  };

  /* Écran Historique : moyennes, graphique du taux d'occupation, tableau des nuits (le plus récent en haut).
     La feuille imprimable (feuilleRecap) reste celle de l'aperçu. */
  /** Chemin SVG lissé passant par les points [[x, y], …] (cubique monotone : pas de cassure,
      et la courbe ne dépasse jamais les valeurs réelles entre deux nuits). */
  function courbeLisse(p) {
    const n = p.length;
    if (!n) return '';
    if (n === 1) return `M0 ${p[0][1]}H1000`;
    const f = (v) => Math.round(v * 10) / 10;
    const pente = [];
    for (let i = 0; i < n - 1; i++) pente.push((p[i + 1][1] - p[i][1]) / (p[i + 1][0] - p[i][0]));
    const t = p.map((_, i) => {
      if (i === 0) return pente[0];
      if (i === n - 1) return pente[n - 2];
      const a = pente[i - 1], b = pente[i];
      return a * b <= 0 ? 0 : (2 * a * b) / (a + b);  // moyenne harmonique : pas de bosse entre deux points
    });
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < n - 1; i++) {
      const h = (p[i + 1][0] - p[i][0]) / 3;
      d += `C${f(p[i][0] + h)} ${f(p[i][1] + h * t[i])} ${f(p[i + 1][0] - h)} ${f(p[i + 1][1] - h * t[i + 1])} ${f(p[i + 1][0])} ${f(p[i + 1][1])}`;
    }
    return d;
  }

  V.ecranRecap = (ctx) => {
    const lignes = ctx.etat.recap;
    const n = lignes.length;
    const moy = (f) => (n ? lignes.reduce((s, l) => s + (f(l) || 0), 0) / n : 0);
    const arrondi = (x) => Math.round(x).toLocaleString('fr-FR');
    const sources = RDJ.colonnesSourcesRecap(ctx.cfg.sourcesReservation, lignes);
    const avecSources = lignes.filter((l) => l.sources);
    const partSource = (code) => {
      const tot = avecSources.reduce((s, l) => s + l.chambres, 0);
      return tot ? avecSources.reduce((s, l) => s + (l.sources[code] || 0), 0) / tot : null;
    };
    const meilleure = n ? lignes.reduce((a, b) => (b.taux > a.taux ? b : a)) : null;

    const carte = (titre, valeur, detail, cls) => `
      <div class="hi-carte ${cls || ''}"><span>${esc(titre)}</span><b>${valeur}</b><small>${detail}</small></div>`;

    // graphique : une barre par nuit (31 dernières), couleur selon le niveau d'occupation
    const recentes = lignes.slice(-31);
    const graphe = recentes.length ? `
      <div class="hi-graphe" role="img" aria-label="Taux d'occupation des ${recentes.length} dernières nuits">
        <div class="hi-axe"><span>100 %</span><span>50 %</span><span>0 %</span></div>
        <div class="hi-barres" style="--n:${recentes.length}">
          ${recentes.map((l) => `<div class="hi-barre ${niveauTaux(l.taux)}" title="${esc(maj(l.jour))} ${esc(RDJ.dateFr(l.date))} : ${pct(l.taux)} · ${l.chambres} ch. · ${l.clients} clients">
            <i style="height:${Math.round(Math.min(1, l.taux) * 100)}%"><em>${Math.round(l.taux * 100)}</em></i>
            <span>${esc(l.date.slice(8, 10))}<small>${esc(l.jour.slice(0, 3))}</small></span>
          </div>`).join('')}
        </div>
      </div>` : '';

    // graphique des sources : une courbe lissée par source (chambres par nuit, mêmes nuits), couleur fixe par source
    const COULEURS_SOURCES = { DIR: '#119a8d', BKG: '#4a5fd0', EXP: '#e0a43a', AGO: '#d9604f', GRP: '#a35bc4' };
    const couleurSource = (code) => COULEURS_SOURCES[code] || '#9aa5b1';
    const recentesSrc = recentes.filter((l) => l.sources);
    const totSrc = (code) => recentesSrc.reduce((s, l) => s + (l.sources[code] || 0), 0);
    const totChSrc = recentesSrc.reduce((s, l) => s + sources.reduce((t, so) => t + (l.sources[so.code] || 0), 0), 0);
    const sourcesVues = sources.filter((s) => totSrc(s.code));
    const maxSrc = Math.max(10, Math.ceil(Math.max(0, ...recentesSrc.flatMap((l) => sourcesVues.map((s) => l.sources[s.code] || 0))) / 10) * 10);
    const LG = 1000, HT = 160;  // repère du SVG (étiré en largeur, traits d'épaisseur constante)
    // un point au milieu de chaque nuit, et la courbe prolongée à plat jusqu'aux deux bords du graphique
    const ptsSource = (code) => {
      const p = recentesSrc.map((l, i) => [((i + 0.5) / recentesSrc.length) * LG, HT - 4 - ((l.sources[code] || 0) / maxSrc) * (HT - 8)]);
      return p.length > 1 ? [[0, p[0][1]], ...p, [LG, p[p.length - 1][1]]] : p;
    };
    const grapheSources = recentesSrc.length && totChSrc ? `
      <ul class="hi-legende">
        ${sourcesVues.map((s) => `<li><i style="background:${couleurSource(s.code)}"></i>${esc(s.nom)}<b>${pct(totSrc(s.code) / totChSrc)}</b><small>${totSrc(s.code)} ch.</small></li>`).join('')}
      </ul>
      <div class="hi-graphe hi-graphe-src" role="img" aria-label="Chambres par source de réservation, ${recentesSrc.length} dernières nuits">
        <div class="hi-axe"><span>${maxSrc}</span><span>${maxSrc / 2}</span><span>0</span></div>
        <div class="hi-courbes">
          <svg viewBox="0 0 ${LG} ${HT}" preserveAspectRatio="none" aria-hidden="true">
            ${[0.5, 1].map((f) => `<line x1="0" x2="${LG}" y1="${HT - 4 - f * (HT - 8)}" y2="${HT - 4 - f * (HT - 8)}" class="grille"/>`).join('')}
            <line x1="0" x2="${LG}" y1="${HT - 4}" y2="${HT - 4}" class="base"/>
            ${sourcesVues.slice().reverse().map((s) => `<path d="${courbeLisse(ptsSource(s.code))}" stroke="${couleurSource(s.code)}"/>`).join('')}
          </svg>
          <div class="hi-colonnes" style="--n:${recentesSrc.length}">
            ${recentesSrc.map((l) => {
              const tot = sources.reduce((t, so) => t + (l.sources[so.code] || 0), 0);
              const detail = sourcesVues.map((s) => s.nom + ' ' + (l.sources[s.code] || 0)).join(' · ');
              return `<div title="${esc(maj(l.jour))} ${esc(RDJ.dateFr(l.date))} : ${tot} ch.\n${esc(detail)}"><span>${esc(l.date.slice(8, 10))}<small>${esc(l.jour.slice(0, 3))}</small></span></div>`;
            }).join('')}
          </div>
        </div>
      </div>` : '';

    const total = (cle) => lignes.reduce((s, l) => s + (l[cle] || 0), 0);
    return `
    <section class="ecran historique">
      ${teteEcran('historique', 'Historique', n ? n + ' nuit' + (n > 1 ? 's' : '') + ' enregistrée' + (n > 1 ? 's' : '') : 'Aucune nuit enregistrée',
        'Une ligne par nuit, ajoutée ou mise à jour à chaque import.', `
        <button class="btn primaire" data-action="apercu-recap" ${n ? '' : 'disabled'}>Imprimer l'historique</button>
        <button class="btn" data-action="recap-csv" ${n ? '' : 'disabled'}>Exporter pour Excel (.csv)</button>`)}

      ${n ? `
      <div class="hi-cartes">
        ${carte('Nuits enregistrées', n, n > 1 ? 'du ' + esc(RDJ.dateFr(lignes[0].date)) + ' au ' + esc(RDJ.dateFr(lignes[n - 1].date)) : esc(RDJ.dateFr(lignes[0].date)))}
        ${carte("Taux d'occupation moyen", pct(moy((l) => l.taux)), meilleure ? 'meilleure nuit : ' + pct(meilleure.taux) + ' le ' + esc(RDJ.dateFr(meilleure.date)) : '', 'taux ' + niveauTaux(moy((l) => l.taux)))}
        ${carte('Clients par nuit', arrondi(moy((l) => l.clients)), arrondi(total('clients')) + ' au total')}
        ${carte('Petits déjeuners par nuit', arrondi(moy((l) => l.pdj)), arrondi(total('pdj')) + ' couverts au total')}
        ${partSource('DIR') !== null ? carte('Part du direct', pct(partSource('DIR')), sources.filter((s) => s.code !== 'DIR' && partSource(s.code)).map((s) => esc(s.nom) + ' ' + pct(partSource(s.code))).join(' · ')) : ''}
      </div>

      <section class="hi-bloc">
        <h3>Taux d'occupation ${recentes.length < n ? `<small>${recentes.length} dernières nuits</small>` : ''}</h3>
        ${graphe}
      </section>

      ${grapheSources ? `<section class="hi-bloc">
        <h3>Sources des chambres ${recentesSrc.length < avecSources.length ? `<small>${recentesSrc.length} dernières nuits</small>` : ''}</h3>
        ${grapheSources}
      </section>` : ''}

      <section class="hi-bloc">
        <h3>Détail des nuits <small>la plus récente en haut</small></h3>
        <div class="hi-table-conteneur">
          <table class="hi-table">
            <thead><tr><th>Nuit du</th><th>Chambres</th><th>Clients</th><th>Départs</th><th>Recouches</th><th>PDJ</th><th>Occupation</th>
              ${sources.map((s) => `<th class="src">${esc(s.nom)}</th>`).join('')}</tr></thead>
            <tbody>${lignes.slice().reverse().map((l) => `<tr>
              <td class="date"><b>${esc(RDJ.dateFr(l.date))}</b><small>${esc(l.jour)}</small></td>
              <td>${l.chambres}</td><td>${l.clients}</td><td>${l.departs}</td><td>${l.recouches}</td><td>${l.pdj}</td>
              <td class="occ"><span class="hi-jauge ${niveauTaux(l.taux)}"><i style="width:${Math.round(Math.min(1, l.taux) * 100)}%"></i></span><b>${pct(l.taux)}</b></td>
              ${sources.map((s) => `<td class="src">${l.sources ? l.sources[s.code] || 0 : '—'}</td>`).join('')}
            </tr>`).join('')}</tbody>
          </table>
        </div>
      </section>` : `
      <div class="hi-vide"><b>Aucune nuit enregistrée pour l'instant.</b><span>Chaque import du rapport clients présents ajoute sa nuit à l'historique.</span></div>`}
    </section>`;
  };

  /** Réglages verrouillés : le code est demandé avant d'ouvrir Paramètres et Change log. */
  V.ecranVerrou = () => `
    <section class="ecran reglages">
      ${teteEcran('reglages', 'Réglages', 'Accès réservé', 'Les Réglages et le Change log sont protégés par un code sur ce poste.', '')}
      <section class="carte rg-carte rg-verrou">
        <div class="rg-verrou-icone" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
        <label for="pin-saisie">Code d'accès</label>
        <input type="password" id="pin-saisie" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="••••" autofocus>
        <button class="btn primaire" data-action="deverrouiller">Ouvrir les Réglages</button>
        <button class="btn lien" data-action="pin-oublie">Code oublié ?</button>
      </section>
    </section>`;

  /** Onglet Réglages : deux sous-onglets, Paramètres et Change log (même présentation que l'onglet PDJ). */
  const sousReglages = (ctx) => {
    const s = ctx && ctx.reglagesSous === 'changelog' ? 'changelog' : 'parametres';
    return `
      <nav class="sous-onglets" role="tablist" aria-label="Réglages">
        <button type="button" role="tab" class="${s === 'parametres' ? 'actif' : ''}" aria-selected="${s === 'parametres'}" data-action="reglages-parametres">Paramètres</button>
        <button type="button" role="tab" class="${s === 'changelog' ? 'actif' : ''}" aria-selected="${s === 'changelog'}" data-action="reglages-changelog">Change log</button>
      </nav>`;
  };

  V.ecranChangelog = (ctx) => {
    const TYPES = { nouveau: 'Nouveau', amelioration: 'Amélioration', correction: 'Correction' };
    const versions = RDJ.CHANGELOG || [];
    return `
    <section class="ecran changelog">
      ${sousReglages(ctx)}
      ${teteEcran('changelog', 'Change log', 'Version actuelle : ' + esc(RDJ.VERSION || ''), 'Toutes les modifications de l\'application, de la plus récente à la plus ancienne.', '')}
      <ol class="cl-liste">
        ${versions.map((v, i) => `
          <li class="cl-version${i === 0 ? ' actuelle' : ''}">
            <div class="cl-repere"><span>${esc(v.version)}</span></div>
            <div class="cl-carte">
              <div class="cl-tete">
                <h3>Version ${esc(v.version)} · ${esc(v.titre)}</h3>
                ${i === 0 ? '<span class="cl-date"><em>version actuelle</em></span>' : ''}
              </div>
              <ul>
                ${v.changements.map(([type, texte]) => `<li><span class="cl-type ${esc(type)}">${TYPES[type] || esc(type)}</span>${esc(texte)}</li>`).join('')}
              </ul>
            </div>
          </li>`).join('')}
      </ol>
    </section>`;
  };

  /** Carte « Types de chambre » des réglages : un choix par chambre, rangé par étage. */
  function typesChambresReglages(ctx) {
    const types = ctx.cfg.typesChambre;
    const t = ctx.cfg.types;
    const etages = RDJ.planEtages(ctx.cfg.planFdc, ctx.cfg.dispositionEtages);
    const compte = types.map((x) => `<span title="${esc(x.nom)}"><b>${esc(x.code)}</b> ${Object.values(t).filter((v) => v === x.code).length}</span>`).join('');
    const sans = etages.flatMap((e) => RDJ.chambresEtage(e)).filter((n) => !t[n]).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    // repliée par défaut : on modifie rarement les types ; ouverte, une ligne par étage
    return `
      <details class="carte types-ch"${V.typesOuvert ? ' open' : ''}>
        <summary>
          <b>Chambres</b>
          <label class="tc-nombre" title="Sert au calcul du taux d'occupation"><input type="number" min="1" data-reglage="nbChambres" value="${ctx.cfg.nbChambres}" aria-label="Nombre de chambres de l'hôtel"> chambres <small>(taux d'occupation)</small></label>
          <span class="tc-compte">${compte}${sans.length ? `<span class="tc-sans" title="${esc(sans.join(', '))}">${sans.length} chambre${sans.length > 1 ? 's' : ''} sans type</span>` : ''}</span>
          <span class="tc-ouvrir">Modifier les types</span>
        </summary>
        <div class="tc-etages">
          ${etages.map((e) => `
            <div class="tc-etage">
              <h3>${esc(e.nom.replace(' étage', '').replace('Rez-de-chaussée', 'RDC'))}</h3>
              <div class="tc-grille">${RDJ.chambresEtage(e).slice().sort((a, b) => a.localeCompare(b, 'fr', { numeric: true })).map((n) => `
                <label class="tc${t[n] ? ' tc-' + esc(t[n]) : ' tc-vide'}"><span>${esc(n)}</span><select data-type-chambre="${esc(n)}">
                    <option value="">—</option>${types.map((x) => `<option value="${esc(x.code)}" ${t[n] === x.code ? 'selected' : ''}>${esc(x.code)}</option>`).join('')}
                  </select></label>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </details>`;
  }

  V.ecranReglages = (ctx) => {
    const r = ctx.cfg;
    const sauv = ctx.etat.derniereSauvegarde;
    return `
    <section class="ecran reglages">
      ${sousReglages(ctx)}
      ${teteEcran('reglages', 'Réglages', 'Version ' + esc(RDJ.VERSION || ''),
        'Les changements sont enregistrés tout de suite.', '')}

      <div class="rg-grille">
        <section class="carte rg-carte">
          <h3>En-tête</h3>
          <label>Nom de l'hôtel <input type="text" data-reglage="hotel" value="${esc(r.hotel)}"></label>
        </section>

        <section class="carte rg-carte">
          <h3>Sauvegarde</h3>
          <p>Les données sont enregistrées dans ce navigateur, sur ce poste${RDJ.store.disponible ? '' : ' — <b class="rouge">stockage indisponible : les données seront perdues à la fermeture</b>'}.</p>
          <p class="rg-etat">Dernière sauvegarde : <b>${sauv ? esc(RDJ.dateFr(sauv.slice(0, 10)) + ' à ' + sauv.slice(11, 16)) : 'jamais'}</b></p>
          <p class="rg-etat">Dossier : ${!RDJ.dossierSauv.possible
            ? '<b>Téléchargements</b><small class="rg-note">Ce navigateur ne permet pas de choisir un dossier : pour enregistrer dans le dossier « save » de l\'appli, ouvrez-la avec Chrome ou Edge.</small>'
            : RDJ.dossierSauv.nom
              ? `<b>${esc(RDJ.dossierSauv.nom.toLowerCase() === 'save' ? RDJ.dossierSauv.nom : RDJ.dossierSauv.nom + '/save')}</b> <small>(${RDJ.dossierSauv.GARDER} dernières gardées)</small>`
              : '<b>pas encore choisi</b> <small>(demandé à la première sauvegarde)</small>'}</p>
          <div class="boutons">
            <button class="btn primaire" data-action="sauvegarder">Sauvegarder (.json)</button>
            <button class="btn" data-action="restaurer">Restaurer une sauvegarde…</button>
            ${RDJ.dossierSauv.possible ? '<button class="btn" data-action="dossier-sauv">Changer de dossier…</button>' : ''}
          </div>
          <label class="rg-case"><input type="checkbox" data-reglage="sauvegardeHebdo"${ctx.etat.reglages.sauvegardeHebdo ? ' checked' : ''}>
            <span><b>Sauvegarde hebdomadaire automatique</b><small>À l'ouverture de l'application, une sauvegarde est faite si la dernière date de 7 jours ou plus.</small></span></label>
        </section>
      </div>

      <section class="carte rg-carte rg-code">
        <h3>Code d'accès</h3>
        ${ctx.pinDefini ? `
        <p>Les Réglages et le Change log sont protégés par un code sur ce poste. Ils se reverrouillent tout seuls après 10 minutes sans action, ou à la fermeture de l'appli.</p>
        <div class="rg-code-ligne">
          <button class="btn primaire" data-action="verrouiller-reglages">Verrouiller maintenant</button>
          <label>Nouveau code<input type="password" id="pin-nouveau" inputmode="numeric" autocomplete="new-password" maxlength="8" placeholder="4 à 8 chiffres"></label>
          <label>Confirmer<input type="password" id="pin-confirme" inputmode="numeric" autocomplete="new-password" maxlength="8"></label>
          <button class="btn" data-action="pin-definir">Changer le code</button>
          <button class="btn danger" data-action="pin-supprimer">Supprimer le code</button>
        </div>` : `
        <p>Réservez les Réglages et le Change log : choisissez un code de 4 à 8 chiffres. Il sera demandé à chaque ouverture des Réglages, sur ce poste.</p>
        <div class="rg-code-ligne">
          <label>Code<input type="password" id="pin-nouveau" inputmode="numeric" autocomplete="new-password" maxlength="8" placeholder="4 à 8 chiffres"></label>
          <label>Confirmer<input type="password" id="pin-confirme" inputmode="numeric" autocomplete="new-password" maxlength="8"></label>
          <button class="btn primaire" data-action="pin-definir">Protéger les Réglages</button>
        </div>`}
      </section>

      <section class="carte rg-carte rg-horaires">
        <h3>Pied de page</h3>
        <p class="aide">Horaires clés affichés en bas de l'accueil. Laisser une case vide pour ne pas l'afficher.</p>
        <div class="rg-horaires-grille">
          ${r.horaires.map((h) => `<label>${esc(h.nom)}<input type="text" data-reglage="horaire-${h.id}" value="${esc(r.horairesValeurs[h.id])}" placeholder="non affiché"></label>`).join('')}
        </div>
      </section>

      <section class="carte rg-carte rg-horaires rg-cuisson">
        <h3>Cuisson PDJ</h3>
        <p class="aide">Croissants et pains au chocolat : quantité arrondie à la plaque entière, puis répartie en fournées. La réserve (le reste) n'est cuite que si le buffet baisse.</p>
        <div class="rg-horaires-grille">
          <label>Pièces par plaque<input type="number" min="1" max="60" data-reglage="piecesParPlaque" value="${r.piecesParPlaque}"></label>
          <label>Fournée de ${esc(r.fournees[0].heure)} (%)<input type="number" min="0" max="100" data-reglage="fournee1" value="${r.fournees[0].part}"></label>
          <label>Fournée de ${esc(r.fournees[1].heure)} (%)<input type="number" min="0" max="100" data-reglage="fournee2" value="${r.fournees[1].part}"><small>réserve : ${r.fournees[2].part} %</small></label>
        </div>
      </section>

      <section class="carte rg-carte rg-impressions">
        <h3>Impressions de la nuit</h3>
        <p class="aide">Feuilles imprimées par le bandeau « Impressions de la nuit » de l'accueil, dans cet ordre.</p>
        <div class="rg-feuilles">
          ${FEUILLES_NUIT.map(([k, lib]) => `
            <div class="rg-feuille f-${k}${r.impressionNuit[k] ? ' coche' : ''}">
              <label><input type="checkbox" data-reglage="impression-${k}"${r.impressionNuit[k] ? ' checked' : ''}>${esc(lib)}</label>
              ${k === 'fdc' ? `<label class="rg-ex">× <input type="number" min="1" max="50" data-reglage="nbExemplairesFdc" value="${r.nbExemplairesFdc}" aria-label="Exemplaires de la feuille de chambre"></label>` : ''}
            </div>`).join('')}
        </div>
        <label class="rg-case"><input type="checkbox" data-reglage="rectoVerso"${r.rectoVerso ? ' checked' : ''}>
          <span><b>L'imprimante imprime en recto verso</b><small>Chaque feuille de chambre reste seule sur sa feuille (une page blanche est ajoutée derrière). Le rapport, la cuisson PDJ, le plan et l'historique sont imprimés d'abord et peuvent partager une feuille (rapport au recto, cuisson au verso).</small></span></label>
      </section>

      ${typesChambresReglages(ctx)}

      <section class="carte rg-carte danger">
        <h3>Supprimer toutes les données</h3>
        <p>Efface les données importées, tout l'historique des nuits, les corrections et les saisies. Une sauvegarde est faite juste avant.</p>
        <button class="btn danger" data-action="tout-supprimer">Supprimer toutes les données…</button>
      </section>
    </section>`;
  };
})();
