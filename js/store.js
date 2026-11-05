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

    /** Télécharge l'état complet dans un fichier .json. */
    exporter(etat, suffixe) {
      const nom = 'RapportDuJour_sauvegarde_' + (suffixe || RDJ.maintenantLocal().replace('T', '_').replace(':', 'h')) + '.json';
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
})();
