/* Mise à jour de l'application depuis GitHub (dépôt public), sans rien installer.
   La version en ligne est lue dans js/changelog.js ; la liste des fichiers vient de l'API GitHub.
   L'appli réécrit ses propres fichiers dans le dossier choisi pour les sauvegardes (celui d'index.html,
   Chrome / Edge : showDirectoryPicker). Le dossier « save » n'est jamais touché ; l'ancienne version
   est d'abord copiée dans « anciennes-versions/<version> » (les GARDER dernières sont gardées). */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  const DEPOT = 'sebastien1100-dev/RapportDuJour';
  const BRANCHE = 'main';
  const ANCIENNES = 'anciennes-versions';
  const GARDER = 3;

  /* ---------- Fonctions pures (testées) ---------- */

  /** Compare deux numéros de version « 3.27 » : < 0 si a est plus ancienne que b, 0 si égales. */
  function comparerVersions(a, b) {
    const pa = String(a || '').split('.').map((n) => parseInt(n, 10) || 0);
    const pb = String(b || '').split('.').map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  /** Fichiers du dépôt qui font partie de l'appli. Jamais : save, exports de test, réglages de Claude, git. */
  function fichierAppli(chemin) {
    const c = String(chemin || '');
    if (c === 'index.html' || c === 'README.md' || c === 'tests/tests.html') return true;
    return /^(js|css|img|outils)\/[^/]+$/.test(c);
  }

  /** Texte de js/changelog.js -> [{ version, titre }] dans l'ordre du fichier (la plus récente d'abord). */
  function versionsDuChangelog(texte) {
    const res = [];
    // titre entre apostrophes ('…l\'heure…') ou entre guillemets ("…l'heure…")
    const re = /version:\s*'([\d.]+)'[^\n]*?titre:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
    let m;
    while ((m = re.exec(String(texte || '')))) res.push({ version: m[1], titre: (m[2] !== undefined ? m[2] : m[3]).replace(/\\(.)/g, '$1') });
    return res;
  }

  /* ---------- Accès à GitHub ---------- */

  const urlBrute = (chemin) => `https://raw.githubusercontent.com/${DEPOT}/${BRANCHE}/${chemin.split('/').map(encodeURIComponent).join('/')}`;

  async function telecharger(chemin, type) {
    // paramètre « t » : évite une ancienne copie gardée en cache
    const rep = await fetch(urlBrute(chemin) + '?t=' + Date.now(), { cache: 'no-store' });
    if (!rep.ok) throw new Error(chemin + ' : HTTP ' + rep.status);
    return type === 'texte' ? rep.text() : new Uint8Array(await rep.arrayBuffer());
  }

  /** Version publiée : { version, nouveautes: [{ version, titre }] plus récentes que la version installée }. */
  async function verifier() {
    let texte;
    try { texte = await telecharger('js/changelog.js', 'texte'); } catch (e) {
      throw new Error(/HTTP 404/.test(e.message)
        ? "Dépôt GitHub introuvable : il doit être public (" + DEPOT + ')'
        : 'Pas de connexion à GitHub. Vérifiez Internet, puis réessayez.');
    }
    const versions = versionsDuChangelog(texte);
    if (!versions.length) throw new Error('Version en ligne illisible.');
    return {
      version: versions[0].version,
      nouveautes: versions.filter((v) => comparerVersions(v.version, RDJ.VERSION) > 0),
    };
  }

  async function listeFichiers() {
    const rep = await fetch(`https://api.github.com/repos/${DEPOT}/git/trees/${BRANCHE}?recursive=1`, { cache: 'no-store' });
    if (!rep.ok) throw new Error('Liste des fichiers indisponible (GitHub : HTTP ' + rep.status + ').');
    const arbre = await rep.json();
    if (arbre.truncated) throw new Error('Liste des fichiers incomplète.');
    return arbre.tree.filter((f) => f.type === 'blob' && fichierAppli(f.path)).map((f) => f.path);
  }

  /* ---------- Fichiers du dossier de l'appli ---------- */

  async function dossierDe(racine, chemin, creer) {
    const parties = chemin.split('/');
    let d = racine;
    for (const p of parties.slice(0, -1)) d = await d.getDirectoryHandle(p, { create: creer });
    return { d, nom: parties[parties.length - 1] };
  }

  async function lireLocal(racine, chemin) {
    try {
      const { d, nom } = await dossierDe(racine, chemin, false);
      return new Uint8Array(await (await (await d.getFileHandle(nom)).getFile()).arrayBuffer());
    } catch (e) { return null; }
  }

  async function ecrireLocal(racine, chemin, octets) {
    const { d, nom } = await dossierDe(racine, chemin, true);
    const w = await (await d.getFileHandle(nom, { create: true })).createWritable();
    await w.write(octets);
    await w.close();
  }

  /** Dossier de l'appli avec droit d'écriture, ou null (pas choisi, pas celui d'index.html, accès refusé).
      À appeler pendant un clic : le navigateur peut redemander l'accès. */
  async function racineAppli() {
    const h = await RDJ.dossierSauv.poignee();
    if (!h) return null;
    const opts = { mode: 'readwrite' };
    let perm = await h.queryPermission(opts);
    if (perm !== 'granted') perm = await h.requestPermission(opts);
    if (perm !== 'granted') return null;
    try { await h.getFileHandle('index.html'); } catch (e) { return null; }
    return h;
  }

  async function ancienneVersions(racine) {
    let d;
    try { d = await racine.getDirectoryHandle(ANCIENNES); } catch (e) { return []; }
    const noms = [];
    for await (const [n, e] of d.entries()) if (e.kind === 'directory') noms.push(n);
    // « 3.27 », « 3.27_2026-11-22_23h10 » : de la plus récente à la plus ancienne
    return noms.sort((a, b) => comparerVersions(b.split('_')[0], a.split('_')[0]) || (a < b ? 1 : -1));
  }

  /** Télécharge tous les fichiers, copie l'ancienne version, puis écrit la nouvelle.
      etape(texte) : progression affichée. Renvoie { fichiers, copie }. */
  async function installer(racine, etape) {
    etape('Liste des fichiers…');
    const chemins = await listeFichiers();
    if (!chemins.includes('index.html') || !chemins.includes('js/app.js')) throw new Error('Version en ligne incomplète.');
    // 1. tout télécharger avant d'écrire quoi que ce soit : une coupure ne laisse pas l'appli à moitié à jour
    const nouveaux = {};
    for (let i = 0; i < chemins.length; i++) {
      etape(`Téléchargement ${i + 1} / ${chemins.length}…`);
      nouveaux[chemins[i]] = await telecharger(chemins[i]);
    }
    // 2. copie de la version installée (fichiers remplacés seulement)
    const copie = ANCIENNES + '/' + RDJ.VERSION + '_' + RDJ.maintenantLocal().replace('T', '_').replace(':', 'h');
    const copieDir = await racine.getDirectoryHandle(ANCIENNES, { create: true });
    const ici = await copieDir.getDirectoryHandle(copie.split('/')[1], { create: true });
    for (const c of chemins) {
      const actuel = await lireLocal(racine, c);
      if (actuel) { etape('Copie de la version ' + RDJ.VERSION + '…'); await ecrireLocal(ici, c, actuel); }
    }
    // 3. nouvelle version
    for (let i = 0; i < chemins.length; i++) {
      etape(`Installation ${i + 1} / ${chemins.length}…`);
      await ecrireLocal(racine, chemins[i], nouveaux[chemins[i]]);
    }
    // seules les GARDER dernières copies sont gardées
    for (const n of (await ancienneVersions(racine)).slice(GARDER)) {
      try { await copieDir.removeEntry(n, { recursive: true }); } catch (e) { /* fichier verrouillé : tant pis */ }
    }
    return { fichiers: chemins.length, copie };
  }

  /** Remet la dernière copie de « anciennes-versions » (puis la supprime). Renvoie son nom, ou null s'il n'y en a pas. */
  async function revenir(racine) {
    const noms = await ancienneVersions(racine);
    if (!noms.length) return null;
    const copieDir = await racine.getDirectoryHandle(ANCIENNES);
    const src = await copieDir.getDirectoryHandle(noms[0]);
    const recopier = async (d, prefixe) => {
      for await (const [n, e] of d.entries()) {
        if (e.kind === 'directory') await recopier(e, prefixe + n + '/');
        else await ecrireLocal(racine, prefixe + n, new Uint8Array(await (await e.getFile()).arrayBuffer()));
      }
    };
    await recopier(src, '');
    try { await copieDir.removeEntry(noms[0], { recursive: true }); } catch (e) { /* tant pis */ }
    return noms[0];
  }

  RDJ.maj = {
    DEPOT, ANCIENNES,
    possible: () => typeof window.showDirectoryPicker === 'function',
    comparerVersions, fichierAppli, versionsDuChangelog,
    verifier, racineAppli, installer, revenir,
  };
})();
