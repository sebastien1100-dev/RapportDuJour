/* Rapport du jour — © 2026, tous droits réservés. Reproduction interdite sans autorisation (voir LICENSE). */
/* Croquis du buffet du petit déjeuner, vue de dessus (onglet PDJ → Buffet PDJ).
   Dessiné d'après des photos du buffet et les corrections de l'équipe : proportions estimées
   (îlot ≈ 3,0 × 2,0 m, trois tables ≈ 70 × 70 cm collées au bout fruits). 1 unité du dessin = 1 cm.
   Le croquis est une liste d'éléments (RDJ.buffetParDefaut) dessinée par RDJ.svgBuffet ; l'onglet
   Buffet PDJ permet de la modifier (mode « Modifier le buffet », etat.buffet) et de revenir à l'origine. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  /* Légende d'origine, par zone du buffet, en deux colonnes ; reprise par la feuille Commande
     et par la liste d'éléments d'origine (noms, familles, zones).
     Familles : v viennoiseries et pains · s sucré à tartiner · f fruits et jus · l laitiers et fromages
                o salé et œufs · c céréales · m vaisselle et matériel */
  RDJ.BUFFET_LEGENDE = [
    [
      { titre: 'Bout boissons', fond: '#f4faf7', items: [[1, 'm', 'Boîte à thé'], [2, 'm', 'Verres'], [3, 'f', 'Oranges à jus'], [4, 'm', 'Presse-jus'], [5, 'm', 'Oranges pressées (à jeter)']] },
      { titre: 'Côté viennoiseries et pains', fond: '#fdf9ee', items: [[6, 'v', 'Pain de mie'], [7, 'v', 'Cake'], [8, 'v', 'Brioche'], [9, 'v', 'Pains au chocolat'],
        [10, 'v', 'Croissants'], [11, 'm', 'Planche à pain'], [12, 'm', 'Coupelles à confiture'], [13, 's', 'Confiture, Nutella, miel'],
        [14, 'v', 'Baguettes'], [15, 'v', 'Corbeilles de pain'], [16, 'm', 'Grille-pain']] },
      { titre: 'Bout fruits', fond: '#fdf4ef', items: [[17, 'f', 'Présentoir à fruits (3 étages)']] },
      { titre: 'Structure centrale noire', fond: '#14171c', items: [[31, 'm', 'Bols, tout le long']] },
    ],
    [
      { titre: 'Côté produits frais', fond: '#f3f7fc', items: [[18, 'f', 'Compote de pommes'], [19, 'f', 'Salade de fruits'], [20, 'l', 'Fromage blanc'],
        [21, 'l', 'Ardoise de fromages'], [22, 'l', 'Beurre doux et demi-sel'], [23, 'o', 'Jambon et charcuterie'], [24, 'l', 'Emmental en tranches'],
        [25, 'l', 'Yaourts'], [26, 'f', 'Lait, eau, jus (2 pomme, 2 orange)'], [27, 'v', 'Crêpes']] },
      { titre: 'Trois tables collées au buffet', fond: '#e8d3b6', bord: '#9c7a52', items: [[28, 'c', 'Distributeurs de céréales'],
        [29, 'c', 'Bocaux (granola, fruits secs)'], [30, 'c', 'Sucre'], [31, 'm', 'Bols'], [32, 'm', 'Cuiseur à œufs'], [33, 'o', 'Œufs et coquetiers'],
        [34, 'm', 'Sel et poivre'], [35, 'm', 'Assiettes'], [36, 'm', 'Plateaux PDJ'], [37, 'm', 'Petites et grandes cuillères'],
        [38, 'm', 'Serviettes en papier'], [39, 'm', 'Couteaux et fourchettes']] },
    ],
  ];
  RDJ.BUFFET_FAMILLES = { v: '#ebcb8b', s: '#dcd2f6', f: '#bfe8d6', l: '#c8dcf4', o: '#f4c7c7', c: '#f7e7b0', m: '#e3e6ea' };
  RDJ.BUFFET_NOMS_FAMILLES = { v: 'Viennoiseries et pains', s: 'Sucré à tartiner', f: 'Fruits et jus', l: 'Laitiers et fromages', o: 'Salé et œufs', c: 'Céréales', m: 'Vaisselle et matériel' };
  /** Zones du buffet (légende), dans l'ordre : { titre, fond, bord }. */
  RDJ.BUFFET_ZONES = RDJ.BUFFET_LEGENDE.flat().map(({ titre, fond, bord }) => ({ titre, fond, bord }));

  /** Feuille Commande, liste de départ : les produits du buffet (sans la vaisselle ni le matériel, sauf le thé
      et les serviettes en papier), chacun avec son numéro du croquis. -> [{ n, f, nom }] */
  RDJ.commandeParDefaut = function () {
    const CONSO = { 1: 'Thé (boîte à thé)', 38: 'Serviettes en papier' };
    const vus = new Set();
    const res = [];
    for (const z of RDJ.BUFFET_LEGENDE.flat()) {
      for (const [n, f, nom] of z.items) {
        if ((f === 'm' && !CONSO[n]) || vus.has(n)) continue;
        vus.add(n);
        res.push({ n, f, nom: CONSO[n] || nom });
      }
    }
    return res;
  };

  /* ---------- Éléments du croquis ----------
     Un élément : { id, t, x, y, w, h, n, nom, z, f, c, rx, v, txt, rot, fs }
     t : ilot (plateau noir) · fond (fond de zone) · struct (structure centrale) · bols (rangée de bols)
         table · rect · rond · num (numéro seul, sous un groupe) · texte (titre de zone)
     x, y, w, h : boîte en cm · n : numéro de légende · nom, z : nom et zone dans la légende
     f : famille (couleur) · c : couleur imposée · rx : arrondi · v : figé (ne se déplace pas tant qu'il est figé)
     txt, rot : texte et rotation (titres de zone) · fs : taille du numéro imposée */
  const T = 4; // décalage des trois tables : 4 cm de jour avec l'îlot

  /** Le croquis d'origine (celui que « Remettre le buffet d'origine » remet). */
  RDJ.buffetParDefaut = function () {
    // nom, famille et zone de chaque numéro, d'après la légende d'origine (premier trouvé)
    const leg = {};
    for (const z of RDJ.BUFFET_LEGENDE.flat()) for (const [n, f, nom] of z.items) if (!leg[n]) leg[n] = { f, nom, z: z.titre };
    const legTables = {};
    RDJ.BUFFET_LEGENDE[1][1].items.forEach(([n, f, nom]) => { legTables[n] = { f, nom, z: RDJ.BUFFET_LEGENDE[1][1].titre }; });
    let id = 0;
    const el = (o) => ({ id: 'e' + (++id), rx: 2, v: false, ...o });
    const prod = (t, x, y, w, h, n, extra) => {
      const L = (extra && extra.tables ? legTables[n] : null) || leg[n] || {};
      const { tables, ...reste } = extra || {};
      return el({ t, x, y, w, h, n, nom: L.nom || '', z: L.z || '', f: L.f || 'm', ...reste });
    };
    const rond = (cx, cy, r, n, extra) => prod('rond', cx - r, cy - r, 2 * r, 2 * r, n, extra);
    const deco = (t, x, y, w, h, extra) => el({ t, x, y, w, h, n: null, nom: '', z: '', f: null, ...extra });
    return [
      // structure (figée au départ)
      deco('ilot', 40, 60, 300, 200, { rx: 8, v: true, nom: 'Îlot (plateau noir)' }),
      deco('fond', 44, 64, 56, 192, { c: '#f4faf7', rx: 0, v: true, nom: 'Fond · bout boissons' }),
      deco('fond', 100, 64, 200, 79, { c: '#fdf9ee', rx: 0, v: true, nom: 'Fond · côté viennoiseries' }),
      deco('fond', 100, 177, 200, 79, { c: '#f3f7fc', rx: 0, v: true, nom: 'Fond · côté produits frais' }),
      deco('fond', 300, 64, 36, 192, { c: '#fdf4ef', rx: 0, v: true, nom: 'Fond · bout fruits' }),
      el({ t: 'struct', x: 100, y: 145, w: 200, h: 30, n: 31, nom: 'Bols, tout le long', z: 'Structure centrale noire', f: 'm', rx: 0, v: true }),
      deco('bols', 112, 154.5, 177, 11, { v: true, nom: 'Bols (rangée)' }),
      deco('table', 340 + T, 55, 70, 70, { rx: 3, v: true, nom: 'Table 1' }),
      deco('table', 340 + T, 125, 70, 70, { rx: 3, v: true, nom: 'Table 2' }),
      deco('table', 340 + T, 195, 70, 70, { rx: 3, v: true, nom: 'Table 3' }),
      deco('texte', 120, 46, 140, 8, { txt: 'Côté viennoiseries et pains', nom: 'Titre · côté viennoiseries' }),
      deco('texte', 120, 268, 140, 8, { txt: 'Côté produits frais', nom: 'Titre · côté produits frais' }),
      deco('texte', 30, 90, 8, 140, { txt: 'Bout boissons', rot: -90, nom: 'Titre · bout boissons' }),
      deco('texte', 309, 268, 140, 8, { txt: 'Trois tables collées au buffet', nom: 'Titre · trois tables' }),
      // bout boissons
      prod('rect', 50, 68, 44, 28, 1), prod('rect', 50, 100, 44, 36, 2), rond(72, 154, 14, 3),
      prod('rect', 50, 172, 44, 54, 4), prod('rect', 50, 230, 44, 20, 5),
      // côté viennoiseries et pains
      prod('rect', 104, 68, 30, 30, 6), prod('rect', 138, 68, 30, 30, 7), prod('rect', 172, 68, 36, 70, 8),
      prod('rect', 212, 68, 40, 30, 9, { rx: 4 }), prod('rect', 256, 68, 40, 30, 10, { rx: 4 }),
      prod('rect', 104, 102, 30, 36, 12), rond(153, 120, 15, 13), rond(225, 120, 13, 14),
      prod('rect', 242, 102, 54, 36, 15, { rx: 4 }),
      // bout fruits
      prod('rect', 303, 68, 30, 28, 11), prod('rect', 303, 100, 30, 24, 16),
      deco('rond', 301, 143, 34, 34, { c: '#ffffff', nom: 'Plateau du présentoir' }), rond(318, 160, 12, 17),
      rond(318, 235, 15, 27),
      // côté produits frais
      rond(119, 197, 14, 18), rond(151, 197, 14, 19), prod('rect', 170, 181, 60, 32, 23),
      prod('rect', 234, 181, 28, 69, 25), rond(119, 235, 14, 20), prod('rect', 137, 220, 26, 30, 21),
      prod('rect', 167, 220, 18, 30, 22), prod('rect', 189, 220, 41, 30, 24),
      deco('rond', 267, 183, 12, 12, { f: 'l', nom: 'Lait' }), deco('rond', 282, 183, 12, 12, { f: 'm', nom: 'Eau' }),
      deco('rond', 267, 197, 12, 12, { f: 'f', nom: 'Jus' }), deco('rond', 282, 197, 12, 12, { f: 'f', nom: 'Jus' }),
      deco('rond', 267, 211, 12, 12, { f: 'f', nom: 'Jus' }), deco('rond', 282, 211, 12, 12, { f: 'f', nom: 'Jus' }),
      prod('num', 275.5, 232, 10, 8, 26),
      // table 1 : plateaux, couteaux et fourchettes, serviettes, cuillères
      prod('rect', 344 + T, 59, 34, 34, 36, { tables: true }), prod('rect', 382 + T, 59, 24, 15, 39, { tables: true }),
      prod('rect', 382 + T, 78, 24, 15, 39, { tables: true }), prod('rect', 344 + T, 99, 16, 16, 38, { tables: true }),
      prod('rect', 364 + T, 99, 16, 16, 37, { tables: true }), prod('rect', 384 + T, 99, 16, 16, 37, { tables: true }),
      // table 2 : assiettes, œufs, sel et poivre, cuiseur
      rond(356 + T, 144, 12, 35, { tables: true }), rond(356 + T, 174, 12, 35, { tables: true }),
      prod('rect', 374 + T, 131, 32, 14, 33, { tables: true }), prod('rect', 374 + T, 149, 18, 11, 33, { tables: true, fs: 5 }),
      prod('rect', 396 + T, 149, 10, 11, 34, { tables: true, fs: 4.5 }), prod('rect', 374 + T, 164, 32, 24, 32, { tables: true }),
      // table 3 : bols, céréales, sucre, bocaux
      rond(352 + T, 207, 7, 31, { tables: true }), prod('rect', 344 + T, 218, 16, 42, 28, { tables: true }),
      deco('rond', 366 + T, 201, 8, 8, { f: 'c', nom: 'Sucre' }), deco('rond', 376 + T, 201, 8, 8, { f: 'c', nom: 'Sucre' }),
      prod('num', 370 + T, 210, 10, 7, 30, { tables: true, fs: 5 }),
      deco('rond', 390 + T, 205, 14, 14, { f: 'c', nom: 'Bocal' }), rond(397 + T, 230, 7, 29, { tables: true }),
      deco('rond', 390 + T, 241, 14, 14, { f: 'c', nom: 'Bocal' }),
    ];
  };

  /* ---------- Dessin ---------- */

  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const r1 = (v) => Math.round(v * 10) / 10;
  const couleur = (e) => e.c || (e.f ? RDJ.BUFFET_FAMILLES[e.f] : null) || '#e3e6ea';
  const sombre = (hex) => {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
    return m ? (0.299 * parseInt(m[1], 16) + 0.587 * parseInt(m[2], 16) + 0.114 * parseInt(m[3], 16)) < 90 : false;
  };
  const tailleNumero = (e) => e.fs || (e.t === 'num' ? 6 : r1(Math.max(4, Math.min(6, e.w * 0.42, e.h * 0.65))));
  /** Éléments qu'on peut agrandir (pas les numéros seuls ni les titres). */
  RDJ.buffetRedimensionnable = (e) => !['num', 'texte'].includes(e.t);

  function dessinElement(e) {
    const { x, y, w, h } = e;
    const fill = couleur(e);
    const numero = (cx, cy, blanc) => (e.n !== null && e.n !== undefined && e.n !== ''
      ? `<text x="${r1(cx)}" y="${r1(cy + tailleNumero(e) * 0.35)}" font-size="${tailleNumero(e)}" font-weight="bold" text-anchor="middle" fill="${blanc ? '#ffffff' : '#1c2a48'}">${esc(e.n)}</text>` : '');
    switch (e.t) {
      case 'ilot': return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${e.rx ?? 8}" fill="${e.c || '#2b2f36'}"/>`;
      case 'fond': return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${e.rx || 0}" fill="${e.c || '#f6f6f2'}"/>`;
      case 'struct': return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#14171c"/>`
        + `<rect x="${x}" y="${y}" width="9" height="${h}" fill="#000"/><rect x="${r1(x + w - 9)}" y="${y}" width="9" height="${h}" fill="#000"/>`
        + numero(x + w / 2, y + h / 2, true);
      case 'bols': {
        // un bol tous les 14 cm environ, sans celui du milieu (place du numéro de la structure centrale)
        const nb = Math.max(1, Math.floor(w / 14) + 1);
        const pas = nb > 1 ? (w - 11) / (nb - 1) : 0;
        const centres = Array.from({ length: nb }, (_, i) => x + 5.5 + i * pas).filter((cx) => nb < 3 || Math.abs(cx - (x + w / 2)) >= 7);
        return `<g fill="#e3e6ea" stroke="#9aa3ad" stroke-width="0.6">${centres.map((cx) => `<circle cx="${r1(cx)}" cy="${r1(y + h / 2)}" r="${r1(Math.min(5.5, h / 2))}"/>`).join('')}</g>`;
      }
      case 'table': return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${e.rx ?? 3}" fill="${e.c || '#e8d3b6'}" stroke="#9c7a52" stroke-width="0.8"/>`;
      case 'rond': return `<circle cx="${r1(x + w / 2)}" cy="${r1(y + h / 2)}" r="${r1(Math.min(w, h) / 2)}" fill="${fill}" stroke="#1c2a48" stroke-width="0.6"/>` + numero(x + w / 2, y + h / 2, sombre(fill));
      case 'num': return numero(x + w / 2, y + h / 2, false);
      case 'texte': {
        const cx = r1(x + w / 2), cy = r1(y + h / 2 + 2);
        return `<text x="${cx}" y="${cy}" font-size="6" font-weight="bold" text-anchor="middle" fill="#5f6b7a"${e.rot ? ` transform="rotate(${e.rot} ${cx} ${r1(y + h / 2)})"` : ''}>${esc(e.txt)}</text>`;
      }
      default: return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${e.rx ?? 2}" fill="${fill}" stroke="#1c2a48" stroke-width="0.6"/>` + numero(x + w / 2, y + h / 2, sombre(fill));
    }
  }

  /** Légende calculée depuis les éléments : zones dans l'ordre de la légende d'origine (puis les autres),
      un numéro par zone (le premier élément qui le porte), triés par numéro. -> [{ titre, fond, bord, items: [[n, f, nom]] }] */
  RDJ.legendeBuffet = function (elements) {
    const zones = new Map(RDJ.BUFFET_ZONES.map((z) => [z.titre, { ...z, items: [] }]));
    const vus = new Set();
    for (const e of elements || []) {
      if (e.n === null || e.n === undefined || e.n === '' || !e.nom) continue;
      const titre = e.z || 'Autres éléments';
      const cle = titre + '|' + e.n;
      if (vus.has(cle)) continue;
      vus.add(cle);
      if (!zones.has(titre)) zones.set(titre, { titre, fond: '#ffffff', items: [] });
      zones.get(titre).items.push([e.n, e.f || 'm', e.nom]);
    }
    const res = [...zones.values()].filter((z) => z.items.length);
    res.forEach((z) => z.items.sort((a, b) => (+a[0] || 0) - (+b[0] || 0)));
    return res;
  };

  function legende(elements) {
    const FAM = RDJ.BUFFET_FAMILLES;
    const zones = RDJ.legendeBuffet(elements);
    // deux colonnes : on remplit la première jusqu'à la moitié des lignes
    const lignes = (z) => z.items.length + 1;
    const total = zones.reduce((s, z) => s + lignes(z), 0);
    const cols = [[], []];
    let cumul = 0;
    // une zone va dans la 1re colonne si son milieu tombe dans la 1re moitié des lignes
    for (const z of zones) { cols[cumul + lignes(z) / 2 <= total / 2 ? 0 : 1].push(z); cumul += lignes(z); }
    const LIGNE = Math.min(8.6, 215 / Math.max(cols[0].reduce((s, z) => s + lignes(z), 0), cols[1].reduce((s, z) => s + lignes(z), 0), 1));
    let svg = '<g fill="#1c2a48"><text x="430" y="58" font-size="7.5" font-weight="bold">Légende</text></g>';
    cols.forEach((zs, c) => {
      const x = 430 + c * 128;
      let y = 70;
      for (const z of zs) {
        svg += `<rect x="${x}" y="${r1(y - 5.2)}" width="9" height="6" rx="1" fill="${z.fond}" stroke="${z.bord || '#9aa3ad'}" stroke-width="0.4"/>` +
          `<text x="${x + 12}" y="${r1(y)}" font-size="6" font-weight="bold" fill="#1c2a48">${esc(z.titre)}</text>`;
        y += LIGNE;
        for (const [n, f, nom] of z.items) {
          svg += `<rect x="${x}" y="${r1(y - 5.4)}" width="10" height="7" rx="1.5" fill="${FAM[f] || '#e3e6ea'}" stroke="#1c2a48" stroke-width="0.4"/>` +
            `<text x="${x + 5}" y="${r1(y - 0.3)}" font-size="5" font-weight="bold" text-anchor="middle" fill="#1c2a48">${esc(n)}</text>` +
            `<text x="${x + 13}" y="${r1(y)}" font-size="5.8" fill="#1c2a48">${esc(nom)}</text>`;
          y += LIGNE;
        }
        y += 3.5; // espace entre deux zones
      }
    });
    return svg;
  }

  const FAMILLES_PIED = [['v', 72, 'Viennoiseries et pains'], ['s', 148, 'Sucré à tartiner'], ['f', 207, 'Fruits et jus'], ['l', 257, 'Laitiers et fromages'],
    ['o', 331, 'Salé et œufs'], ['c', 384, 'Céréales'], ['m', 426, 'Vaisselle et matériel']];

  /** Croquis complet (SVG). opts.edition : chaque élément porte data-el ; opts.sel : id de l'élément sélectionné
      (cadre pointillé, et poignée d'agrandissement s'il n'est pas figé). */
  RDJ.svgBuffet = function (elements, opts) {
    const o = opts || {};
    const els = elements || RDJ.buffetParDefaut();
    const corps = els.map((e) => (o.edition
      ? `<g data-el="${esc(e.id)}" class="b-el${e.v ? ' fige' : ''}">${dessinElement(e)}<rect class="b-zone" x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="transparent"/></g>`
      : dessinElement(e))).join('\n  ');
    const sel = o.sel && els.find((e) => e.id === o.sel);
    const cadre = sel ? `<g class="b-sel" pointer-events="none"><rect x="${r1(sel.x - 1.5)}" y="${r1(sel.y - 1.5)}" width="${r1(sel.w + 3)}" height="${r1(sel.h + 3)}" fill="none" stroke="#157f77" stroke-width="1.2" stroke-dasharray="4 2"/></g>`
      + (!sel.v && RDJ.buffetRedimensionnable(sel) ? `<rect class="b-poignee" data-poignee="${esc(sel.id)}" x="${r1(sel.x + sel.w - 2)}" y="${r1(sel.y + sel.h - 2)}" width="5" height="5" fill="#157f77" stroke="#fff" stroke-width="0.6"/>` : '') : '';
    return `<svg class="buffet-svg" xmlns="http://www.w3.org/2000/svg" viewBox="26 42 642 262" font-family="Arial, Helvetica, sans-serif" role="img" aria-label="Plan du buffet du petit déjeuner, vue de dessus">
  ${corps}
  ${cadre}
  <!-- familles de produits : une couleur par famille -->
  <g font-size="5.6" fill="#1c2a48" stroke-width="0.5">
    <text x="40" y="294" font-weight="bold">Familles</text>
    ${FAMILLES_PIED.map(([f, x, nom]) => `<rect x="${x}" y="289" width="8" height="6" rx="1" fill="${RDJ.BUFFET_FAMILLES[f]}" stroke="#1c2a48"/><text x="${x + 11}" y="294">${nom}</text>`).join('')}
  </g>
  ${legende(els)}
</svg>`;
  };

  /** Ce qui a changé par rapport au croquis d'origine (pour la confirmation de « Remettre le buffet d'origine »). */
  RDJ.ecartBuffet = function (elements, origine) {
    const ref = new Map((origine || RDJ.buffetParDefaut()).map((e) => [e.id, JSON.stringify(e)]));
    const ids = new Set((elements || []).map((e) => e.id));
    let modifies = 0, ajoutes = 0;
    for (const e of elements || []) {
      if (!ref.has(e.id)) ajoutes++;
      else if (ref.get(e.id) !== JSON.stringify(e)) modifies++;
    }
    const supprimes = [...ref.keys()].filter((id) => !ids.has(id)).length;
    return { modifies, ajoutes, supprimes };
  };

  // croquis d'origine (compatibilité)
  RDJ.SVG_BUFFET = RDJ.svgBuffet(RDJ.buffetParDefaut());
})();
