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
    // hauteur des lignes de la grille : la page doit tenir sur une feuille A4 paysage,
    // l'encadré « À encaisser » (3 chambres par ligne) et la liste des autres prennent sur la grille
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
          // une seule information par signal : fond de ligne = départ, case « Payé » inversée = non payée
          const cls = [l.partDemain ? 'dep' : '', l.manuel ? 'ajout' : ''].join(' ').trim();
          const mod = (t) => (l.modifs.includes(t) ? ' modifie' : '');
          return `<tr class="${cls}" style="height:${hLigne}mm"${l.manuel ? ` data-modif="fiche" data-ch="${esc(l.chambre)}" title="Chambre ajoutée à la main : double-clic pour la modifier"` : ''}>
            <td class="ch">${esc(l.chambre)}</td>
            <td class="nom">${esc(l.nom)}</td>
            <td class="c src" title="${esc(l.source.brut)}">${esc(l.source.code)}</td>
            <td class="c">${esc(l.pers)}</td>
            <td class="c">${esc(l.nuitNo)}</td>
            <td class="c">${esc(RDJ.dateCourte(l.depart))}</td>
            <td class="c clic${mod('RECOUCHE')}${mod('DEPART')}" data-modif="demain" data-ch="${esc(l.chambre)}">${l.depart ? (l.partDemain ? 'DÉPART' : 'Recouche') : ''}</td>
            <td class="c clic${mod('PDJ')}" data-modif="pdj" data-ch="${esc(l.chambre)}">${l.pdj ? 'Oui' : ''}</td>
            <td class="c clic${l.paye ? '' : l.groupe ? ' npg' : ' np'}${mod('PAYE')}" data-modif="paye" data-ch="${esc(l.chambre)}">${l.paye ? 'Oui' : l.groupe ? 'GRP' : 'NON'}</td>
          </tr>`;
        }).join('')}</tbody>
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
        <div class="r-import">${ctx.etat.import ? 'Import : ' + esc(ctx.etat.import.fichier) + '<br>le ' + esc(RDJ.dateFr(ctx.etat.import.importeLe.slice(0, 10)) + ' à ' + ctx.etat.import.importeLe.slice(11, 16)) : 'Aucune donnée importée'}${ctx.soldes ? '<br>Soldes : ' + esc(ctx.soldes.fichier) : ''}</div>
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
        <span><i class="ech"></i>Recouche</span>
        <span><i class="ech dep"></i>Départ du jour</span>
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
      ${comm ? `<p>Communicante avec la ${esc(comm.avec)}</p>` : ''}
      ${s.manuel ? '<p>Ajoutée à la main</p>' : ''}${s.corrige && !s.sansClient ? '<p>Corrigée sur la feuille de chambre</p>' : ''}
      ${s.sansClient ? '<p class="astuce">Double-clic : libre → sale → hors service</p>' : ''}`;
    const cls = [s.manuel ? 'aj' : '', comm && comm.cote ? 'comm-' + comm.cote : '', s.sansClient ? 'clic' : ''].filter(Boolean).join(' ');
    return `<div class="pl-ch s-${s.statut}${cls ? ' ' + cls : ''}" data-bulle="${esc(bulle)}"${s.sansClient ? ` data-plan="${esc(no)}"` : ''}>
      <div class="pl-haut"><b>${esc(no)}</b>${comm && !comm.cote ? `<i class="pl-comm">⇄ ${esc(comm.avec)}</i>` : ''}${badgeType}</div>
      <span class="pl-nom">${s.statut === 'hs' ? 'HORS SERVICE' : s.statut === 'sale' ? 'SALE · à faire' : s.statut === 'libre' ? 'libre' : esc(s.nom)}</span>
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
        const droite = [...(hautD || []), ...(basD || [])].length
          ? section(hautD || [], basD || [], true, Math.max(RDJ.largeurRang(hautD || []), RDJ.largeurRang(basD || []), 1)) : '';
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
          `<td class="etat clic${!vierge && e.corrige ? ' corrige' : ''}" data-fdc="etat" data-ch="${esc(k)}">${vierge ? '' : esc(e.etat)}</td>` +
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
      <div class="f-corr">${vierge ? '' : texteCorrections(ctx.fdc.corrections)}</div>
    </div>`;
  };

  /* ================= FEUILLE : CUISSON PDJ ================= */

  V.feuillePdj = function (ctx) {
    const cfg = ctx.cfg;
    const q = (p) => RDJ.quantitePdj(p, ctx.pdjNombre, ctx.pdjType, cfg.coefLoisir);
    const cuisson = cfg.produitsPdj.filter((p) => p.groupe === 'cuisson');
    const autres = cfg.produitsPdj.filter((p) => p.groupe !== 'cuisson');
    const comp = (p) => {
      const v = ctx.pdjComplements[p.id];
      return v === undefined || v === null || v === '' ? '' : esc(v);
    };
    // cuisson « 12 min » + « 180 °C » réunis dans une pastille ; case vide à remplir si pas de complément
    const fourneau = (p) => [p.cuisson, p.temp].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('') || '<em>—</em>';
    return `
    <div class="feuille portrait pdj">
      <header class="p-tete">
        <div>
          <h1>CUISSON PDJ</h1>
          <div class="sous">${esc(cfg.hotel)}</div>
        </div>
        <div class="p-date"><span>Matin du</span><b>${esc(maj(titreJour(ctx.mep)))}</b></div>
      </header>

      <div class="p-entree">
        <div class="p-chiffre"><span>Petits déjeuners</span><b>${ctx.pdjNombre}</b><small>couverts</small></div>
        <div><span>Type de clientèle</span><b>${esc(maj(ctx.pdjType))}</b></div>
        <div><span>Pour la journée du</span><b>${esc(RDJ.dateFr(ctx.mep))}</b></div>
      </div>

      <h2 class="p-section"><i>1</i>Produits en cuisson</h2>
      <table class="p-table p-cuisson">
        <thead><tr><th class="g">Produit</th><th>Cuisson · T°C</th><th>Pour 6h30</th><th>Complément pour 8h</th></tr></thead>
        <tbody>${cuisson.map((p) => `<tr>
          <td class="g">${esc(p.nom)}</td>
          <td class="four">${fourneau(p)}</td>
          <td class="q"><b>${q(p)}</b></td>
          <td class="q comp">${comp(p) ? `<b>${comp(p)}</b>` : '<i class="a-ecrire"></i>'}</td>
        </tr>`).join('')}</tbody>
      </table>

      <h2 class="p-section"><i>2</i>Autres produits</h2>
      <table class="p-table p-autres">
        <thead><tr><th class="g">Produit</th><th>Pour 6h30</th><th class="g">Mise en place</th></tr></thead>
        <tbody>${autres.map((p) => `<tr>
          <td class="g">${esc(p.nom)}</td>
          <td class="q"><b>${q(p)}</b></td>
          <td class="mep">${esc(p.miseEnPlace || '')}${p.reco ? `<small>${esc(p.reco)}</small>` : ''}</td>
        </tr>`).join('')}</tbody>
      </table>

      <div class="p-note"><h3>Mise en place de la brioche</h3><p>${esc(cfg.noteBrioche)}</p></div>
      <p class="p-pied">Quantités = base pour 100 PDJ × nombre de PDJ, ajustées selon le type de clientèle (loisir +25 %, business réduit), arrondies au supérieur.</p>
    </div>`;
  };

  /* ================= FEUILLE : RÉCAP ================= */

  V.feuilleRecap = function (ctx) {
    const lignes = ctx.etat.recap;
    const sources = RDJ.colonnesSourcesRecap(ctx.cfg.sourcesReservation, lignes);
    const nbCol = 8 + sources.length;
    const cellSrc = (l) => sources.map((s) => `<td class="srcv">${l.sources ? (l.sources[s.code] || 0) : '—'}</td>`).join('');
    return `
    <div class="feuille portrait recap">
      <h1>HISTORIQUE DES NUITS</h1>
      <div class="sous">${esc(ctx.cfg.hotel)}  ·  une ligne par nuit importée  ·  « — » : source non enregistrée pour cette nuit</div>
      <table class="t-recap">
        <thead>
          <tr><th rowspan="2">Nuit du</th><th rowspan="2">Jour</th><th rowspan="2">Chambres occupées</th><th rowspan="2">Clients</th><th rowspan="2">Départ</th><th rowspan="2">Recouches</th><th rowspan="2">Petits déj. (couverts)</th><th rowspan="2">Taux d'occupation</th>
            <th colspan="${sources.length}" class="grp-src">Chambres par source</th></tr>
          <tr>${sources.map((s) => `<th class="srch">${esc(s.nom)}</th>`).join('')}</tr>
        </thead>
        <tbody>${lignes.length ? lignes.map((l) => `<tr><td>${esc(RDJ.dateFr(l.date))}</td><td>${esc(l.jour)}</td><td>${l.chambres}</td><td>${l.clients}</td><td>${l.departs}</td><td>${l.recouches}</td><td>${l.pdj}</td><td>${pct(l.taux)}</td>${cellSrc(l)}</tr>`).join('')
          : `<tr><td colspan="${nbCol}" class="vide">Aucune journée enregistrée.</td></tr>`}</tbody>
      </table>
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
        <linearGradient id="mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8ef"/><stop offset="1" stop-color="#f3e2cf"/></linearGradient>
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

    const carteImport = (o) => `
      <section class="acc-import${o.fait ? ' fait' : ''}${o.obligatoire ? '' : ' option'}">
        <i class="acc-pastille" aria-hidden="true">${o.fait ? '✓' : o.obligatoire ? '1' : '2'}</i>
        <div class="acc-import-texte">
          <b>${esc(o.titre)}${o.obligatoire ? '' : ' <small>facultatif</small>'}</b>
          <span>${o.fait ? 'Importé : ' + o.fait : esc(o.aide)}</span>
        </div>
        <button class="btn ${o.fait ? '' : 'primaire'}" data-action="${o.action}">${o.fait ? 'Réimporter' : 'Importer'}</button>
      </section>`;
    // groupe de chiffres ; clic -> onglet correspondant
    const groupe = (titre, vue, valeurs) => `
      <button class="acc-groupe g-${vue}" data-vue-aller="${vue}" title="Ouvrir l'onglet">
        <span class="acc-groupe-titre">${esc(titre)}</span>
        <span class="acc-valeurs">${valeurs.map(([l, v, cls]) => `<span class="acc-valeur ${cls || ''}"><b>${v}</b><small>${esc(l)}</small></span>`).join('')}</span>
      </button>`;

    return `
    <section class="ecran accueil">
      <header class="hero ${niveauTaux(c.taux)}">
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
          <div class="anneau-lib">Occupation ${{ haut: 'forte', moyen: 'moyenne', bas: 'faible' }[niveauTaux(c.taux)]}</div>
        </div>
      </header>

      <div class="acc-imports">
        ${carteImport({
          action: 'importer', titre: 'Rapport clients présents', obligatoire: true,
          fait: imp ? `${esc(imp.fichier)} · ${esc(RDJ.dateFr(imp.importeLe.slice(0, 10)))} à ${esc(imp.importeLe.slice(11, 16))}` : '',
          aide: 'Chambres, clients, départs, PDJ, paiement',
        })}
        ${carteImport({
          action: 'importer-soldes', titre: 'Rapport des soldes', obligatoire: false,
          fait: ctx.soldes ? `${esc(ctx.soldes.fichier)} · ${esc(RDJ.dateFr(ctx.soldes.importeLe.slice(0, 10)))} à ${esc(ctx.soldes.importeLe.slice(11, 16))}` : '',
          aide: 'Montant dû des chambres en départ',
        })}
        <p class="acc-depot">Vous pouvez aussi déposer les fichiers n'importe où dans la fenêtre : ils sont reconnus tout seuls.</p>
      </div>

      <div class="acc-chiffres">
        ${groupe('Occupation', 'plan', [['Chambres occupées', c.chambres], ['Clients', c.clients]])}
        ${groupe('Mouvements', 'fdc', [['Départs', c.departs], ['Recouches', c.recouches]])}
        ${groupe('Petits déjeuners', 'pdj', [['Couverts', c.pdj]])}
        ${groupe('Paiements', 'rapport', [['Non payées', c.nonPayees.length, c.nonPayees.length ? 'alerte' : 'ok'], ['Groupes non payés', c.groupeNonPayees.length]])}
      </div>

      <button type="button" class="acc-imprimer" data-action="imprimer-tout">
        <span class="ai-texte">
          <b>Impressions de la nuit</b>
          <span>Rapport ×1 · feuille de chambre ×${ctx.cfg.nbExemplairesFdc} · cuisson PDJ ×1</span>
        </span>
        <span class="btn primaire">Imprimer tout</span>
      </button>

      ${alerteSauv ? `<div class="bandeau-sauv">Les données sont gardées dans ce navigateur. ${sauv ? 'Dernière sauvegarde il y a ' + joursSansSauv + ' jours.' : 'Aucune sauvegarde faite pour l\'instant.'}
        <button class="btn" data-action="sauvegarder">Télécharger une sauvegarde</button></div>` : ''}

      <section class="me-bloc">
        <h3>Mode d'emploi</h3>
        <div class="me-grille">
          <div class="me-colonne">
            <h4>Chaque nuit</h4>
            <ol class="me-etapes">
              <li><i>1</i><div><b>Importer le rapport clients présents</b><span>« Importer ▾ » puis « Rapport clients présents », ou déposez le fichier n'importe où dans la fenêtre.</span></div></li>
              <li><i>2</i><div><b>Importer le rapport des soldes</b><span>Facultatif : le montant dû s'affiche alors dans l'encadré « À encaisser » du rapport.</span></div></li>
              <li><i>3</i><div><b>Vérifier et corriger</b><span>Rapport, feuille de chambre, plan, cuisson PDJ et historique se mettent à jour et sont enregistrés tout seuls.</span></div></li>
              <li><i>4</i><div><b>Imprimer</b><span>Depuis chaque onglet, ou « Imprimer tout ». Pour un PDF : imprimante « Enregistrer au format PDF ».</span></div></li>
            </ol>
          </div>
          <div class="me-colonne">
            <h4>Corrections au double-clic</h4>
            <ul class="me-astuces">
              <li><b>Rapport</b><span>sur « Statut », « PDJ » ou « Payé » d'une chambre ; « + Ajouter une chambre » pour une arrivée après l'export.</span></li>
              <li><b>Feuille de chambre</b><span>sur la case d'une chambre : vide → B → R → BR → HS → vide ; sur NV pour cocher.</span></li>
              <li><b>Plan de chambre</b><span>sur une chambre libre : libre → sale → hors service → libre.</span></li>
            </ul>
            <p class="me-sauv"><b>Sauvegarde</b> Les données restent dans ce navigateur, sur ce poste : téléchargez régulièrement une sauvegarde (onglet Réglages).</p>
          </div>
        </div>
      </section>
    </section>`;
  };

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

  V.ecranPdj = (ctx) => {
    const cuisson = ctx.cfg.produitsPdj.filter((p) => p.groupe === 'cuisson');
    return `
    <section class="ecran">
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

        <section class="cs-carte cs-complements">
          <h3>Complément pour 8h <small>à cuire en plus pour la deuxième fournée</small></h3>
          <div class="cs-produits">
            ${cuisson.map((p) => `
              <div class="cs-produit">
                <span>${esc(p.nom)}</span>
                <div class="cs-compteur petit">
                  <button class="cs-pas" data-pas="-1" data-pour='[data-complement="${p.id}"]' aria-label="Un de moins">−</button>
                  <input type="number" min="0" step="1" placeholder="0" data-complement="${p.id}" value="${esc(ctx.pdjComplements[p.id] ?? '')}" aria-label="${esc(p.nom)}">
                  <button class="cs-pas" data-pas="1" data-pour='[data-complement="${p.id}"]' aria-label="Un de plus">+</button>
                </div>
              </div>`).join('')}
          </div>
        </section>
      </div>
      ${papier(V.feuillePdj(ctx))}
    </section>`;
  };

  /* Écran Historique : moyennes, graphique du taux d'occupation, tableau des nuits (le plus récent en haut).
     La feuille imprimable (feuilleRecap) reste celle de l'aperçu. */
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

    const total = (cle) => lignes.reduce((s, l) => s + (l[cle] || 0), 0);
    return `
    <section class="ecran historique">
      ${teteEcran('historique', 'Historique', n ? n + ' nuit' + (n > 1 ? 's' : '') + ' enregistrée' + (n > 1 ? 's' : '') : 'Aucune nuit enregistrée',
        'Une ligne par nuit, ajoutée ou mise à jour à chaque import.', `
        <button class="btn primaire" data-action="apercu-recap">Imprimer l'historique</button>
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

  V.ecranChangelog = () => {
    const TYPES = { nouveau: 'Nouveau', amelioration: 'Amélioration', correction: 'Correction' };
    const versions = RDJ.CHANGELOG || [];
    return `
    <section class="ecran changelog">
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
      <details class="carte types-ch"${sans.length ? '' : ''}>
        <summary>
          <b>Types de chambre</b>
          <span class="tc-compte">${compte}${sans.length ? `<span class="tc-sans">sans type ${sans.length} : ${esc(sans.join(', '))}</span>` : ''}</span>
          <span class="tc-ouvrir">Modifier</span>
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
      ${teteEcran('reglages', 'Réglages', 'Version web ' + esc(RDJ.VERSION || '') + ' · reprise du classeur Excel v7.1',
        'Les changements sont enregistrés tout de suite.', '')}

      <div class="rg-grille">
        <section class="carte rg-carte">
          <h3>Hôtel</h3>
          <label>Nom de l'hôtel <input type="text" data-reglage="hotel" value="${esc(r.hotel)}"></label>
          <div class="rg-ligne">
            <label>Chambres de l'hôtel<input type="number" min="1" data-reglage="nbChambres" value="${r.nbChambres}"><small>pour le taux d'occupation</small></label>
            <label>Exemplaires de la feuille de chambre<input type="number" min="1" max="50" data-reglage="nbExemplairesFdc" value="${r.nbExemplairesFdc}"><small>à chaque impression</small></label>
          </div>
        </section>

        <section class="carte rg-carte">
          <h3>Sauvegarde</h3>
          <p>Les données sont enregistrées dans ce navigateur, sur ce poste${RDJ.store.disponible ? '' : ' — <b class="rouge">stockage indisponible : les données seront perdues à la fermeture</b>'}.</p>
          <p class="rg-etat">Dernière sauvegarde : <b>${sauv ? esc(RDJ.dateFr(sauv.slice(0, 10)) + ' à ' + sauv.slice(11, 16)) : 'jamais'}</b></p>
          <div class="boutons">
            <button class="btn primaire" data-action="sauvegarder">Télécharger une sauvegarde (.json)</button>
            <button class="btn" data-action="restaurer">Restaurer une sauvegarde…</button>
          </div>
          <label class="rg-case"><input type="checkbox" data-reglage="sauvegardeHebdo"${ctx.etat.reglages.sauvegardeHebdo ? ' checked' : ''}>
            <span><b>Sauvegarde hebdomadaire automatique</b><small>À l'ouverture de l'application, une sauvegarde est téléchargée si la dernière date de 7 jours ou plus.</small></span></label>
        </section>
      </div>

      ${typesChambresReglages(ctx)}

      <section class="carte rg-carte danger">
        <h3>Supprimer toutes les données</h3>
        <p>Efface les données importées, tout l'historique des nuits, les corrections et les saisies. Une sauvegarde est téléchargée juste avant.</p>
        <button class="btn danger" data-action="tout-supprimer">Supprimer toutes les données…</button>
      </section>
    </section>`;
  };
})();
