/* Rapport du jour — © 2026, tous droits réservés. Reproduction interdite sans autorisation (voir LICENSE). */
/* Lecture d'un export .xlsx / .xlsm / .csv sans bibliothèque externe.
   Un .xlsx est une archive zip de fichiers XML : on lit l'archive (DecompressionStream,
   intégré aux navigateurs récents), puis la première feuille du classeur.
   Résultat : tableau de lignes, chaque ligne = tableau de valeurs (texte, nombre, booléen ou null). */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  async function inflateRaw(octets) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('Ce navigateur est trop ancien pour lire les fichiers Excel. Utilisez Chrome, Edge, Firefox ou Safari à jour.');
    }
    const flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(flux).arrayBuffer());
  }

  // Lecture du répertoire central de l'archive zip.
  function ouvrirZip(buffer) {
    const dv = new DataView(buffer);
    const u8 = new Uint8Array(buffer);
    let fin = -1;
    for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break; }
    }
    if (fin < 0) throw new Error("Ce fichier n'est pas un classeur Excel .xlsx valide.");
    const nb = dv.getUint16(fin + 10, true);
    let p = dv.getUint32(fin + 16, true);
    const entrees = {};
    const dec = new TextDecoder('utf-8');
    for (let k = 0; k < nb; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const methode = dv.getUint16(p + 10, true);
      const taille = dv.getUint32(p + 20, true);
      const ln = dv.getUint16(p + 28, true);
      const le = dv.getUint16(p + 30, true);
      const lc = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      entrees[dec.decode(u8.subarray(p + 46, p + 46 + ln))] = { methode, taille, off };
      p += 46 + ln + le + lc;
    }
    return {
      async lire(nom) {
        const e = entrees[nom];
        if (!e) return null;
        const n = dv.getUint16(e.off + 26, true);
        const m = dv.getUint16(e.off + 28, true);
        const debut = e.off + 30 + n + m;
        const data = u8.subarray(debut, debut + e.taille);
        let brut;
        if (e.methode === 0) brut = data;
        else if (e.methode === 8) brut = await inflateRaw(data);
        else throw new Error('Format de compression non pris en charge dans ce fichier.');
        return dec.decode(brut);
      },
    };
  }

  function xml(texte) {
    const doc = new DOMParser().parseFromString(texte, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('Fichier Excel illisible (XML invalide).');
    return doc;
  }
  const tous = (noeud, nom) => Array.from(noeud.getElementsByTagNameNS('*', nom));

  function texteRiche(si) {
    // concatène les <t>, sauf ceux des indications phonétiques (<rPh>)
    return tous(si, 't')
      .filter((t) => !t.parentNode || t.parentNode.localName !== 'rPh')
      .map((t) => t.textContent)
      .join('');
  }

  function indexColonne(ref) {
    let n = 0;
    for (const ch of ref) {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) n = n * 26 + (c - 64);
      else break;
    }
    return n - 1;
  }

  function cheminCible(cible) {
    if (cible.startsWith('/')) return cible.slice(1);
    return 'xl/' + cible.replace(/^\.\//, '');
  }

  async function lireXlsx(buffer) {
    const zip = ouvrirZip(buffer);
    const wb = await zip.lire('xl/workbook.xml');
    if (!wb) throw new Error("Ce fichier n'est pas un classeur Excel .xlsx valide.");
    const feuille = tous(xml(wb), 'sheet')[0];
    if (!feuille) throw new Error('Le classeur ne contient aucune feuille.');
    const rid = feuille.getAttribute('r:id') ||
      feuille.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    let chemin = 'xl/worksheets/sheet1.xml';
    const rels = await zip.lire('xl/_rels/workbook.xml.rels');
    if (rels) {
      const rel = tous(xml(rels), 'Relationship').find((r) => r.getAttribute('Id') === rid);
      if (rel) chemin = cheminCible(rel.getAttribute('Target'));
    }

    const ssTexte = await zip.lire('xl/sharedStrings.xml');
    const partages = ssTexte ? tous(xml(ssTexte), 'si').map(texteRiche) : [];

    const fTexte = await zip.lire(chemin);
    if (!fTexte) throw new Error('Première feuille introuvable dans le classeur.');
    const lignes = [];
    let numLigne = -1;
    for (const row of tous(xml(fTexte), 'row')) {
      const r = parseInt(row.getAttribute('r'), 10);
      numLigne = Number.isFinite(r) ? r - 1 : numLigne + 1;
      const ligne = [];
      let col = -1;
      for (const c of tous(row, 'c')) {
        const ref = c.getAttribute('r');
        col = ref ? indexColonne(ref) : col + 1;
        const t = c.getAttribute('t');
        const vNoeud = tous(c, 'v')[0];
        const v = vNoeud ? vNoeud.textContent : null;
        let val = null;
        if (t === 's') val = v === null || v === '' ? null : partages[parseInt(v, 10)] ?? null;
        else if (t === 'inlineStr') val = tous(c, 'is').map(texteRiche).join('');
        else if (t === 'str' || t === 'd') val = v;
        else if (t === 'b') val = v === '1';
        else if (t === 'e') val = null;
        else val = v === null || v === '' ? null : parseFloat(v);
        ligne[col] = val;
      }
      for (let i = 0; i < ligne.length; i++) if (ligne[i] === undefined) ligne[i] = null;
      lignes[numLigne] = ligne;
    }
    for (let i = 0; i < lignes.length; i++) if (!lignes[i]) lignes[i] = [];
    return lignes;
  }

  function lireCsv(texte) {
    texte = texte.replace(/^﻿/, '');
    const premiere = texte.split(/\r?\n/, 1)[0] || '';
    const compter = (c) => premiere.split(c).length;
    const sep = [';', '\t', ','].sort((a, b) => compter(b) - compter(a))[0];
    const lignes = [];
    let ligne = [], champ = '', guillemets = false;
    for (let i = 0; i < texte.length; i++) {
      const ch = texte[i];
      if (guillemets) {
        if (ch === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
        else if (ch === '"') guillemets = false;
        else champ += ch;
      } else if (ch === '"') guillemets = true;
      else if (ch === sep) { ligne.push(champ); champ = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && texte[i + 1] === '\n') i++;
        ligne.push(champ); lignes.push(ligne); ligne = []; champ = '';
      } else champ += ch;
    }
    if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
    return lignes.map((l) => l.map((v) => (v === '' ? null : v)));
  }

  /** Lit un fichier (File ou {name, arrayBuffer()}) et renvoie ses lignes. */
  RDJ.lireFichierTableur = async function (fichier) {
    const nom = (fichier.name || '').toLowerCase();
    const buffer = await fichier.arrayBuffer();
    if (nom.endsWith('.csv') || nom.endsWith('.txt')) return lireCsv(new TextDecoder('utf-8').decode(buffer));
    if (nom.endsWith('.xls')) {
      throw new Error("Les fichiers .xls (ancien format Excel) ne sont pas pris en charge : exportez le rapport en .xlsx ou en .csv.");
    }
    return lireXlsx(buffer);
  };
  RDJ._lireCsv = lireCsv;
})();
