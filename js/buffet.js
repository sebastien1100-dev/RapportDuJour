/* Croquis du buffet du petit déjeuner, vue de dessus (onglet PDJ → Buffet PDJ).
   Dessiné d'après des photos du buffet et les corrections de l'équipe : proportions estimées
   (îlot ≈ 3,0 × 2,0 m, trois tables ≈ 70 × 70 cm collées au bout fruits).
   Pour déplacer un élément : changer ses coordonnées (en cm) et celles de son numéro, plus bas. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  RDJ.SVG_BUFFET = `<svg class="buffet-svg" xmlns="http://www.w3.org/2000/svg" viewBox="26 42 642 262" font-family="Arial, Helvetica, sans-serif" role="img" aria-label="Plan du buffet du petit déjeuner, vue de dessus">
  <g fill="#5f6b7a" font-size="6" font-weight="bold" text-anchor="middle">
    <text x="190" y="52">Côté viennoiseries et pains</text>
    <text x="190" y="274">Côté produits frais</text>
    <text x="34" y="160" transform="rotate(-90 34 160)">Bout boissons</text>
    <text x="379" y="274">Trois tables collées au buffet</text>
  </g>

  <!-- îlot : plateau noir à bouts arrondis, zones, structure centrale -->
  <rect x="40" y="60" width="300" height="200" rx="8" fill="#2b2f36"/>
  <!-- fonds de zone très clairs : les produits ressortent par leur couleur de famille ;
       seuls les coins extérieurs des deux bouts sont légèrement arrondis (pas de vide noir dans les coins) -->
  <path d="M100 64 H50 A6 6 0 0 0 44 70 V250 A6 6 0 0 0 50 256 H100 Z" fill="#f4faf7"/>
  <rect x="100" y="64" width="200" height="79" fill="#fdf9ee"/>
  <rect x="100" y="177" width="200" height="79" fill="#f3f7fc"/>
  <path d="M300 64 H330 A6 6 0 0 1 336 70 V250 A6 6 0 0 1 330 256 H300 Z" fill="#fdf4ef"/>
  <rect x="100" y="145" width="200" height="30" fill="#14171c"/>
  <rect x="100" y="145" width="9" height="30" fill="#000"/>
  <rect x="291" y="145" width="9" height="30" fill="#000"/>
  <!-- bols posés tout le long de la structure centrale -->
  <g fill="#e3e6ea" stroke="#9aa3ad" stroke-width="0.6">
    <circle cx="118" cy="160" r="5.5"/><circle cx="132" cy="160" r="5.5"/><circle cx="146" cy="160" r="5.5"/>
    <circle cx="160" cy="160" r="5.5"/><circle cx="174" cy="160" r="5.5"/><circle cx="188" cy="160" r="5.5"/>
    <circle cx="212" cy="160" r="5.5"/><circle cx="226" cy="160" r="5.5"/><circle cx="240" cy="160" r="5.5"/>
    <circle cx="254" cy="160" r="5.5"/><circle cx="268" cy="160" r="5.5"/><circle cx="282" cy="160" r="5.5"/>
  </g>
  <text x="200" y="162" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">31</text>

  <!-- trois tables contre le bout fruits ; DECALAGE_TABLES : translate(4 0) = 4 cm de jour avec l'îlot -->
  <g fill="#e8d3b6" stroke="#9c7a52" stroke-width="0.8" transform="translate(4 0)">
    <rect x="340" y="55" width="70" height="70" rx="3"/>
    <rect x="340" y="125" width="70" height="70" rx="3"/>
    <rect x="340" y="195" width="70" height="70" rx="3"/>
  </g>

  <!-- couleur par famille de produits (voir « Familles » dans la légende) :
       viennoiseries et pains #ebcb8b · sucré à tartiner #dcd2f6 · fruits et jus #bfe8d6
       laitiers et fromages #c8dcf4 · salé et œufs #f4c7c7 · céréales #f7e7b0 · vaisselle et matériel #e3e6ea -->
  <!-- éléments posés sur une grille régulière : 4 cm de jour partout, bords alignés par rangée,
       rectangles aux mêmes coins arrondis (rx 2, corbeilles rx 4), cercles pour ce qui est rond (bols, assiettes, fruits) -->
  <g stroke="#1c2a48" stroke-width="0.6" fill="#e3e6ea">
    <!-- bout boissons : une colonne de 44 cm de large -->
    <rect x="50" y="68" width="44" height="28" rx="2"/>
    <rect x="50" y="100" width="44" height="36" rx="2"/>
    <circle cx="72" cy="154" r="14" fill="#bfe8d6"/>
    <rect x="50" y="172" width="44" height="54" rx="2"/>
    <rect x="50" y="230" width="44" height="20" rx="2"/>
    <!-- côté viennoiseries et pains : rangée haute y 68 (h 30), rangée basse y 102 (h 36) -->
    <rect x="104" y="68" width="30" height="30" rx="2" fill="#ebcb8b"/>
    <rect x="138" y="68" width="30" height="30" rx="2" fill="#ebcb8b"/>
    <rect x="172" y="68" width="36" height="70" rx="2" fill="#ebcb8b"/>
    <rect x="212" y="68" width="40" height="30" rx="4" fill="#ebcb8b"/>
    <rect x="256" y="68" width="40" height="30" rx="4" fill="#ebcb8b"/>
    <rect x="104" y="102" width="30" height="36" rx="2"/>
    <circle cx="153" cy="120" r="15" fill="#dcd2f6"/>
    <circle cx="225" cy="120" r="13" fill="#ebcb8b"/>
    <rect x="242" y="102" width="54" height="36" rx="4" fill="#ebcb8b"/>
    <!-- bout fruits : une colonne de 30 cm de large -->
    <rect x="303" y="68" width="30" height="28" rx="2"/>
    <rect x="303" y="100" width="30" height="24" rx="2"/>
    <circle cx="318" cy="160" r="17" fill="#ffffff"/>
    <circle cx="318" cy="160" r="12" fill="#bfe8d6"/>
    <circle cx="318" cy="235" r="15" fill="#ebcb8b"/>
    <!-- côté produits frais : rangée haute y 181 (h 32), rangée basse y 220 (h 30) -->
    <circle cx="119" cy="197" r="14" fill="#bfe8d6"/>
    <circle cx="151" cy="197" r="14" fill="#bfe8d6"/>
    <rect x="170" y="181" width="60" height="32" rx="2" fill="#f4c7c7"/>
    <rect x="234" y="181" width="28" height="69" rx="2" fill="#c8dcf4"/>
    <circle cx="119" cy="235" r="14" fill="#c8dcf4"/>
    <rect x="137" y="220" width="26" height="30" rx="2" fill="#c8dcf4"/>
    <rect x="167" y="220" width="18" height="30" rx="2" fill="#c8dcf4"/>
    <rect x="189" y="220" width="41" height="30" rx="2" fill="#c8dcf4"/>
    <circle cx="273" cy="189" r="6" fill="#c8dcf4"/>
    <circle cx="288" cy="189" r="6"/>
    <circle cx="273" cy="203" r="6" fill="#bfe8d6"/>
    <circle cx="288" cy="203" r="6" fill="#bfe8d6"/>
    <circle cx="273" cy="217" r="6" fill="#bfe8d6"/>
    <circle cx="288" cy="217" r="6" fill="#bfe8d6"/>
  </g>
  <g stroke="#1c2a48" stroke-width="0.6" fill="#e3e6ea" transform="translate(4 0)">
    <!-- table 1 (côté viennoiseries) : plateaux PDJ, couverts (couteaux et fourchettes), serviettes, cuillères -->
    <rect x="344" y="59" width="34" height="34" rx="2"/>
    <rect x="382" y="59" width="24" height="15" rx="2"/>
    <rect x="382" y="78" width="24" height="15" rx="2"/>
    <rect x="344" y="99" width="16" height="16" rx="2"/>
    <rect x="364" y="99" width="16" height="16" rx="2"/>
    <rect x="384" y="99" width="16" height="16" rx="2"/>
    <!-- table 2 (milieu) : assiettes, œufs -->
    <circle cx="356" cy="144" r="12"/>
    <circle cx="356" cy="174" r="12"/>
    <rect x="374" y="131" width="32" height="14" rx="2" fill="#f4c7c7"/>
    <rect x="374" y="149" width="18" height="11" rx="2" fill="#f4c7c7"/>
    <rect x="396" y="149" width="10" height="11" rx="2"/>
    <rect x="374" y="164" width="32" height="24" rx="2"/>
    <!-- table 3 (côté produits frais) : bols, céréales, sucre -->
    <circle cx="352" cy="207" r="7"/>
    <rect x="344" y="218" width="16" height="42" rx="2" fill="#f7e7b0"/>
    <circle cx="370" cy="205" r="4" fill="#f7e7b0"/>
    <circle cx="380" cy="205" r="4" fill="#f7e7b0"/>
    <circle cx="397" cy="212" r="7" fill="#f7e7b0"/>
    <circle cx="397" cy="230" r="7" fill="#f7e7b0"/>
    <circle cx="397" cy="248" r="7" fill="#f7e7b0"/>
  </g>

  <!-- numéros (repris dans la légende), centrés sur leur élément -->
  <g font-size="6" font-weight="bold" text-anchor="middle" fill="#1c2a48">
    <text x="72" y="84">1</text><text x="72" y="120">2</text><text x="72" y="156">3</text>
    <text x="72" y="201">4</text><text x="72" y="242">5</text>
    <text x="119" y="85">6</text><text x="153" y="85">7</text><text x="190" y="105">8</text>
    <text x="232" y="85">9</text><text x="276" y="85">10</text><text x="318" y="84">11</text>
    <text x="119" y="122">12</text><text x="153" y="122">13</text>
    <text x="225" y="122">14</text><text x="269" y="122">15</text><text x="318" y="114">16</text>
    <text x="318" y="162">17</text>
    <text x="119" y="199">18</text><text x="151" y="199">19</text><text x="200" y="199">23</text><text x="248" y="217">25</text>
    <text x="119" y="237">20</text><text x="150" y="237">21</text><text x="176" y="237">22</text><text x="209.5" y="237">24</text>
    <text x="280.5" y="238">26</text><text x="318" y="237">27</text>
  </g>
  <g font-size="6" font-weight="bold" text-anchor="middle" fill="#1c2a48" transform="translate(4 0)">
    <text x="361" y="78">36</text><text x="394" y="68.5">39</text><text x="394" y="87.5">39</text><text x="352" y="109">38</text><text x="372" y="109">37</text><text x="392" y="109">37</text>
    <text x="356" y="146">35</text><text x="356" y="176">35</text>
    <text x="390" y="140">33</text><text x="383" y="156.5" font-size="5">33</text><text x="401" y="156.5" font-size="4.5">34</text><text x="390" y="178">32</text>
    <text x="352" y="241">28</text><text x="352" y="209">31</text><text x="397" y="232">29</text><text x="375" y="215" font-size="5">30</text>
  </g>

  <!-- familles de produits : une couleur par famille -->
  <g font-size="5.6" fill="#1c2a48" stroke-width="0.5">
    <text x="40" y="294" font-weight="bold">Familles</text>
    <rect x="72" y="289" width="8" height="6" rx="1" fill="#ebcb8b" stroke="#1c2a48"/><text x="83" y="294">Viennoiseries et pains</text>
    <rect x="148" y="289" width="8" height="6" rx="1" fill="#dcd2f6" stroke="#1c2a48"/><text x="159" y="294">Sucré à tartiner</text>
    <rect x="207" y="289" width="8" height="6" rx="1" fill="#bfe8d6" stroke="#1c2a48"/><text x="218" y="294">Fruits et jus</text>
    <rect x="257" y="289" width="8" height="6" rx="1" fill="#c8dcf4" stroke="#1c2a48"/><text x="268" y="294">Laitiers et fromages</text>
    <rect x="331" y="289" width="8" height="6" rx="1" fill="#f4c7c7" stroke="#1c2a48"/><text x="342" y="294">Salé et œufs</text>
    <rect x="384" y="289" width="8" height="6" rx="1" fill="#f7e7b0" stroke="#1c2a48"/><text x="395" y="294">Céréales</text>
    <rect x="426" y="289" width="8" height="6" rx="1" fill="#e3e6ea" stroke="#1c2a48"/><text x="437" y="294">Vaisselle et matériel</text>
  </g>

  <!-- légende : un élément par ligne, numéro dans une pastille de la couleur de sa famille (construite plus bas) -->
  ${legende()}
</svg>`;

  /* Légende du croquis, en deux colonnes. Pour ajouter un élément : une ligne [numéro, famille, nom].
     Familles : v viennoiseries et pains · s sucré à tartiner · f fruits et jus · l laitiers et fromages
                o salé et œufs · c céréales · m vaisselle et matériel */
  function legende() {
    const FAM = { v: '#ebcb8b', s: '#dcd2f6', f: '#bfe8d6', l: '#c8dcf4', o: '#f4c7c7', c: '#f7e7b0', m: '#e3e6ea' };
    const COLONNES = [
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
    const LIGNE = 8.6;
    let svg = '<g fill="#1c2a48"><text x="430" y="58" font-size="7.5" font-weight="bold">Légende</text></g>';
    COLONNES.forEach((zones, c) => {
      const x = 430 + c * 128;
      let y = 70;
      for (const z of zones) {
        svg += `<rect x="${x}" y="${y - 5.2}" width="9" height="6" rx="1" fill="${z.fond}" stroke="${z.bord || '#9aa3ad'}" stroke-width="0.4"/>` +
          `<text x="${x + 12}" y="${y}" font-size="6" font-weight="bold" fill="#1c2a48">${z.titre}</text>`;
        y += LIGNE;
        for (const [n, f, nom] of z.items) {
          svg += `<rect x="${x}" y="${y - 5.4}" width="10" height="7" rx="1.5" fill="${FAM[f]}" stroke="#1c2a48" stroke-width="0.4"/>` +
            `<text x="${x + 5}" y="${y - 0.3}" font-size="5" font-weight="bold" text-anchor="middle" fill="#1c2a48">${n}</text>` +
            `<text x="${x + 13}" y="${y}" font-size="5.8" fill="#1c2a48">${nom}</text>`;
          y += LIGNE;
        }
        y += 3.5; // espace entre deux zones
      }
    });
    return svg;
  }
})();
