/* Croquis du buffet du petit déjeuner, vue de dessus (onglet PDJ → Buffet PDJ).
   Dessiné d'après des photos du buffet et les corrections de l'équipe : proportions estimées
   (îlot ≈ 3,0 × 2,0 m, trois tables ≈ 70 × 70 cm collées au bout fruits).
   Pour déplacer un élément : changer ses coordonnées (en cm) et celles de son numéro, plus bas. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  RDJ.SVG_BUFFET = `<svg class="buffet-svg" xmlns="http://www.w3.org/2000/svg" viewBox="26 42 614 262" font-family="Arial, Helvetica, sans-serif" role="img" aria-label="Plan du buffet du petit déjeuner, vue de dessus">
  <g fill="#5f6b7a" font-size="6" font-weight="bold" text-anchor="middle">
    <text x="190" y="52">Côté viennoiseries et pains</text>
    <text x="190" y="274">Côté produits frais</text>
    <text x="34" y="160" transform="rotate(-90 34 160)">Bout boissons</text>
    <text x="375" y="274">Trois tables collées au buffet</text>
  </g>

  <!-- îlot : plateau noir à bouts arrondis, zones, structure centrale -->
  <rect x="40" y="60" width="300" height="200" rx="22" fill="#2b2f36"/>
  <!-- fonds de zone très clairs : les produits ressortent par leur couleur de famille -->
  <rect x="44" y="64" width="56" height="192" rx="18" fill="#f4faf7"/>
  <rect x="100" y="64" width="200" height="79" fill="#fdf9ee"/>
  <rect x="100" y="177" width="200" height="79" fill="#f3f7fc"/>
  <rect x="300" y="64" width="36" height="192" rx="18" fill="#fdf4ef"/>
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

  <!-- trois tables collées au bout fruits -->
  <g fill="#e8d3b6" stroke="#9c7a52" stroke-width="0.8">
    <rect x="340" y="55" width="70" height="70" rx="3"/>
    <rect x="340" y="125" width="70" height="70" rx="3"/>
    <rect x="340" y="195" width="70" height="70" rx="3"/>
  </g>

  <!-- couleur par famille de produits (voir « Familles » dans la légende) :
       viennoiseries et pains #ebcb8b · sucré à tartiner #dcd2f6 · fruits et jus #bfe8d6
       laitiers et fromages #c8dcf4 · salé et œufs #f4c7c7 · céréales #f7e7b0 · vaisselle et matériel #e3e6ea -->
  <g stroke="#1c2a48" stroke-width="0.6" fill="#e3e6ea">
    <!-- bout boissons -->
    <rect x="50" y="68" width="42" height="28" rx="2"/>
    <rect x="50" y="100" width="42" height="38" rx="3"/>
    <circle cx="71" cy="157" r="15" fill="#bfe8d6"/>
    <rect x="51" y="176" width="40" height="54" rx="3"/>
    <rect x="54" y="234" width="34" height="16" rx="3" fill="#bfe8d6"/>
    <!-- côté viennoiseries et pains -->
    <rect x="103" y="67" width="32" height="26" rx="2" fill="#ebcb8b"/>
    <rect x="139" y="67" width="32" height="26" rx="2" fill="#ebcb8b"/>
    <rect x="173" y="67" width="38" height="75" rx="2" fill="#ebcb8b"/>
    <ellipse cx="234" cy="80" rx="20" ry="14" fill="#ebcb8b"/>
    <ellipse cx="280" cy="80" rx="20" ry="14" fill="#ebcb8b"/>
    <rect x="304" y="67" width="30" height="24" rx="2"/>
    <rect x="104" y="104" width="26" height="20" rx="2" fill="#dcd2f6"/>
    <circle cx="152" cy="120" r="16" fill="#dcd2f6"/>
    <circle cx="229" cy="121" r="11" fill="#ebcb8b"/>
    <rect x="246" y="102" width="52" height="38" rx="3" fill="#ebcb8b"/>
    <rect x="304" y="99" width="30" height="22" rx="3"/>
    <!-- bout fruits -->
    <circle cx="318" cy="160" r="17" fill="#ffffff"/>
    <circle cx="318" cy="160" r="12" fill="#bfe8d6"/>
    <!-- côté produits frais -->
    <circle cx="115" cy="194" r="12" fill="#bfe8d6"/>
    <circle cx="145" cy="194" r="15" fill="#bfe8d6"/>
    <rect x="178" y="181" width="54" height="32" rx="7" fill="#f4c7c7"/>
    <rect x="238" y="183" width="30" height="58" rx="2" fill="#c8dcf4"/>
    <circle cx="115" cy="236" r="11" fill="#c8dcf4"/>
    <rect x="130" y="226" width="23" height="20" rx="1" fill="#c8dcf4"/>
    <rect x="158" y="220" width="15" height="30" rx="1" fill="#dcd2f6"/>
    <rect x="180" y="219" width="50" height="23" rx="1" fill="#c8dcf4"/>
    <circle cx="278" cy="192" r="6" fill="#c8dcf4"/>
    <circle cx="291" cy="192" r="6"/>
    <circle cx="278" cy="206" r="6" fill="#bfe8d6"/>
    <circle cx="291" cy="206" r="6" fill="#bfe8d6"/>
    <circle cx="278" cy="220" r="6" fill="#bfe8d6"/>
    <circle cx="291" cy="220" r="6" fill="#bfe8d6"/>
    <circle cx="318" cy="234" r="16" fill="#ebcb8b"/>
    <!-- table 1 (côté viennoiseries) : plateaux PDJ, cuillères -->
    <rect x="344" y="59" width="34" height="34" rx="3"/>
    <rect x="382" y="61" width="24" height="16" rx="2"/>
    <rect x="382" y="81" width="24" height="16" rx="2"/>
    <rect x="345" y="100" width="14" height="14" rx="1"/>
    <rect x="362" y="100" width="14" height="14" rx="1"/>
    <!-- table 2 (milieu) : assiettes, œufs -->
    <circle cx="357" cy="141" r="11"/>
    <circle cx="357" cy="166" r="11"/>
    <rect x="376" y="130" width="28" height="14" rx="2" fill="#f4c7c7"/>
    <rect x="376" y="147" width="18" height="11" rx="1" fill="#f4c7c7"/>
    <rect x="396" y="146" width="11" height="13" rx="1"/>
    <rect x="376" y="163" width="28" height="22" rx="2"/>
    <!-- table 3 (côté produits frais) : bols, céréales, sucre -->
    <circle cx="352" cy="209" r="8"/>
    <rect x="344" y="221" width="16" height="40" rx="2" fill="#f7e7b0"/>
    <circle cx="395" cy="212" r="7" fill="#f7e7b0"/>
    <circle cx="395" cy="230" r="7" fill="#f7e7b0"/>
    <circle cx="395" cy="248" r="7" fill="#f7e7b0"/>
    <circle cx="368" cy="202" r="4" fill="#f7e7b0"/>
    <circle cx="378" cy="202" r="4" fill="#f7e7b0"/>
  </g>

  <!-- numéros (repris dans la légende) -->
  <g font-size="6" font-weight="bold" text-anchor="middle" fill="#1c2a48">
    <text x="71" y="84">1</text><text x="71" y="121">2</text><text x="71" y="159">3</text>
    <text x="71" y="205">4</text><text x="71" y="244">5</text>
    <text x="119" y="82">6</text><text x="155" y="82">7</text><text x="192" y="107">8</text>
    <text x="234" y="82">9</text><text x="280" y="82">10</text><text x="319" y="81">11</text>
    <text x="117" y="116">12</text><text x="152" y="122">13</text>
    <text x="229" y="123">14</text><text x="272" y="123">15</text><text x="319" y="112">16</text>
    <text x="318" y="162">17</text>
    <text x="115" y="196">18</text><text x="145" y="196">19</text><text x="205" y="199">23</text><text x="253" y="214">25</text>
    <text x="115" y="238">20</text><text x="141.5" y="238">21</text><text x="165" y="237">22</text><text x="205" y="233">24</text>
    <text x="284.5" y="237">26</text><text x="318" y="236">27</text>
    <text x="361" y="78">36</text><text x="394" y="72">37</text><text x="394" y="92">37</text><text x="360" y="122">37</text>
    <text x="357" y="143">35</text><text x="357" y="168">35</text>
    <text x="390" y="140">33</text><text x="385" y="155" font-size="5">33</text><text x="401.5" y="154.5" font-size="4.5">34</text><text x="390" y="177">32</text>
    <text x="352" y="243">28</text><text x="352" y="211">31</text><text x="395" y="232">29</text><text x="373" y="214" font-size="5">30</text>
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

  <!-- légende -->
  <g font-size="5.6" fill="#1c2a48">
    <text x="430" y="62" font-size="7" font-weight="bold">Légende</text>
    <rect x="430" y="68" width="7" height="5" fill="#f4faf7" stroke="#9aa3ad" stroke-width="0.4"/>
    <text x="440" y="73" font-weight="bold">Bout boissons</text>
    <text x="434" y="81">1 Boîte à thé   2 Verres   3 Oranges à jus</text>
    <text x="434" y="88">4 Presse-jus   5 Oranges pressées (à jeter)</text>
    <rect x="430" y="95" width="7" height="5" fill="#fdf9ee" stroke="#9aa3ad" stroke-width="0.4"/>
    <text x="440" y="100" font-weight="bold">Côté viennoiseries et pains</text>
    <text x="434" y="108">6 Pain de mie   7 Cake   8 Brioche</text>
    <text x="434" y="115">9 Pains au chocolat   10 Croissants   11 Planche à pain</text>
    <text x="434" y="122">12 Coupelles à confiture   13 Confiture, Nutella, miel</text>
    <text x="434" y="129">14 Baguettes   15 Corbeilles de pain   16 Grille-pain</text>
    <rect x="430" y="136" width="7" height="5" fill="#fdf4ef" stroke="#9aa3ad" stroke-width="0.4"/>
    <text x="440" y="141" font-weight="bold">Bout fruits</text>
    <text x="434" y="149">17 Présentoir à fruits (3 étages, plateau tournant)</text>
    <rect x="430" y="156" width="7" height="5" fill="#14171c"/>
    <text x="440" y="161" font-weight="bold">Structure centrale noire</text>
    <text x="434" y="169">31 Bols, tout le long de la structure</text>
    <rect x="430" y="176" width="7" height="5" fill="#f3f7fc" stroke="#9aa3ad" stroke-width="0.4"/>
    <text x="440" y="181" font-weight="bold">Côté produits frais</text>
    <text x="434" y="189">18 Compote de pommes   19 Salade de fruits</text>
    <text x="434" y="196">20 Fromage blanc   21 Ardoise de fromages</text>
    <text x="434" y="203">22 Beurre doux et demi-sel   23 Jambon et charcuterie</text>
    <text x="434" y="210">24 Emmental en tranches   25 Yaourts</text>
    <text x="434" y="217">26 Lait et eau minérale au fond, jus de fruits devant</text>
    <text x="440" y="224">(2 pomme, 2 orange)   27 Crêpes</text>
    <rect x="430" y="231" width="7" height="5" fill="#e8d3b6" stroke="#9c7a52" stroke-width="0.4"/>
    <text x="440" y="236" font-weight="bold">Trois tables collées au buffet</text>
    <text x="434" y="244">28 Distributeurs de céréales   29 Bocaux (granola,</text>
    <text x="440" y="251">fruits secs)   30 Sucre   31 Bols</text>
    <text x="434" y="258">32 Cuiseur à œufs   33 Œufs et coquetiers</text>
    <text x="434" y="265">34 Sel et poivre   35 Assiettes   36 Plateaux PDJ</text>
    <text x="434" y="272">37 Petites et grandes cuillères</text>
  </g>
</svg>`;
})();
