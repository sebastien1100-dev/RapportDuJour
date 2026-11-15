/* Stockage : tout l'état de l'application est gardé dans le navigateur (localStorage)
   et peut être exporté / restauré sous forme de fichier .json (sauvegarde). */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});
  const CLE = 'rapportDuJour.v1';
  const VERSION = 1;

  RDJ.etatVide = () => ({
    version: VERSION,
    reglages: {},                     // surcharge de CONFIG_DEFAUT : hotel, nbChambres, nbExemplairesFdc
    import: null,                     // rapport clients présents : { fichier, importeLe, reservations[] }
    soldes: null,                     // rapport des soldes : { fichier, importeLe, nuit, chambres: {no: montant}, resas: {n°: montant} }
    maintenance: null,                // rapport de maintenance : { fichier, importeLe, nuit, chambres: {no: { motif, fin }} }
    arrivees: null,                   // rapport des arrivées : { fichier, importeLe, date, total, parType: {code: n}, autres: {desc: n} }
    dateRapportManuelle: null,        // "AAAA-MM-JJ" ou null (automatique)
    modifs: { nuit: null, liste: [], ajouts: [] },  // modifications du rapport et chambres ajoutées (nuit en cours)
    fdc: { nuit: null, corrections: {}, nv: {} },   // feuille femme de chambre (nuit en cours)
    pdj: { nombre: null, type: 'business', nuit: null, complements: {} },
    recap: [],
    derniereSauvegarde: null,
  });

  function completer(e) {
    const v = RDJ.etatVide();
    if (!e || typeof e !== 'object') return v;
    return {
      ...v, ...e,
      modifs: { ...v.modifs, ...(e.modifs || {}) },
      fdc: { ...v.fdc, ...(e.fdc || {}) },
      pdj: { ...v.pdj, ...(e.pdj || {}) },
      reglages: { ...(e.reglages || {}) },
      recap: Array.isArray(e.recap) ? e.recap : [],
    };
  }

  RDJ.store = {
    disponible: true,

    charger() {
      try {
        const brut = window.localStorage.getItem(CLE);
        return completer(brut ? JSON.parse(brut) : null);
      } catch (err) {
        this.disponible = false;
        return RDJ.etatVide();
      }
    },

    enregistrer(etat) {
      try {
        window.localStorage.setItem(CLE, JSON.stringify(etat));
        this.disponible = true;
        return true;
      } catch (err) {
        this.disponible = false;
        return false;
      }
    },

    /** Nom du fichier de sauvegarde : RapportDuJour_sauvegarde_2026-11-15_23h20.json (triable par date). */
    nomSauvegarde(suffixe) {
      return 'RapportDuJour_sauvegarde_' + (suffixe || RDJ.maintenantLocal().replace('T', '_').replace(':', 'h')) + '.json';
    },

    /** Télécharge l'état complet dans un fichier .json. */
    exporter(etat, suffixe) {
      const nom = this.nomSauvegarde(suffixe);
      const blob = new Blob([JSON.stringify(etat, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nom;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      return nom;
    },

    /** Lit un fichier de sauvegarde .json et renvoie l'état (exception si invalide). */
    async lireSauvegarde(fichier) {
      let e;
      try { e = JSON.parse(await fichier.text()); } catch (err) { e = null; }
      if (!e || typeof e !== 'object' || e.version !== VERSION || !Array.isArray(e.recap)) {
        throw new Error("Ce fichier n'est pas une sauvegarde du Rapport du jour.");
      }
      return completer(e);
    },
  };

  /* ---------- Dossier de sauvegarde ----------
     Le navigateur ne peut pas écrire seul à côté d'index.html : on choisit une fois le dossier de l'appli
     (Chrome / Edge : showDirectoryPicker), son accès est retenu dans IndexedDB, et les sauvegardes vont
     dans son sous-dossier « save ». Seules les GARDER dernières sauvegardes datées sont gardées.
     Sans cette possibilité (Safari, Firefox), la sauvegarde est téléchargée comme avant. */
  const GARDER = 10;
  const MOTIF_SAUV = /^RapportDuJour_sauvegarde_\d{4}-\d{2}-\d{2}_\d{2}h\d{2}\.json$/;

  function base(mode, action) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('rapportDuJour.fichiers', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('poignees');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('poignees', mode);
        const r = action(tx.objectStore('poignees'));
        tx.oncomplete = () => { db.close(); resolve(r && r.result); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      };
    });
  }

  RDJ.dossierSauv = {
    GARDER,
    possible: typeof window.showDirectoryPicker === 'function',
    nom: null,  // nom du dossier choisi (affiché dans Réglages), chargé par init()

    async poignee() {
      if (!this.possible) return null;
      try { return (await base('readonly', (st) => st.get('dossier'))) || null; } catch (e) { return null; }
    },

    async init() {
      const h = await this.poignee();
      this.nom = h ? h.name : null;
      return this.nom;
    },

    /** Demande le dossier de l'appli (celui d'index.html). Lève AbortError si l'utilisateur annule. */
    async choisir() {
      const h = await window.showDirectoryPicker({ id: 'rapportDuJour', mode: 'readwrite' });
      await base('readwrite', (st) => st.put(h, 'dossier'));
      this.nom = h.name;
      return h;
    },

    async oublier() {
      try { await base('readwrite', (st) => st.delete('dossier')); } catch (e) { /* sans importance */ }
      this.nom = null;
    },

    /** Écrit la sauvegarde dans <dossier>/save et ne garde que les GARDER dernières.
        demander : true pendant un clic (le navigateur peut redemander l'accès). Renvoie le chemin, ou null. */
    async ecrire(etat, suffixe, demander) {
      const h = await this.poignee();
      if (!h) return null;
      const opts = { mode: 'readwrite' };
      let perm = await h.queryPermission(opts);
      if (perm !== 'granted' && demander) perm = await h.requestPermission(opts);
      if (perm !== 'granted') return null;
      const save = h.name.toLowerCase() === 'save' ? h : await h.getDirectoryHandle('save', { create: true });
      const nom = RDJ.store.nomSauvegarde(suffixe);
      const f = await save.getFileHandle(nom, { create: true });
      const w = await f.createWritable();
      await w.write(JSON.stringify(etat, null, 1));
      await w.close();
      const datees = [];
      for await (const [n, e] of save.entries()) if (e.kind === 'file' && MOTIF_SAUV.test(n)) datees.push(n);
      datees.sort().reverse();
      for (const n of datees.slice(GARDER)) { try { await save.removeEntry(n); } catch (e) { /* fichier verrouillé : tant pis */ } }
      return (save === h ? h.name : h.name + '/save') + '/' + nom;
    },
  };
})();
