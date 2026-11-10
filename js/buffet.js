/* Croquis du buffet du petit déjeuner, vue de dessus (onglet PDJ → Buffet PDJ).
   Dessiné d'après des photos du buffet : proportions estimées (îlot ≈ 3,0 × 2,0 m, tables ≈ 70 × 70 cm).
   Pour déplacer un élément : changer ses coordonnées (en cm) et celles de son numéro, plus bas. */
(function () {
  'use strict';
  const RDJ = (window.RDJ = window.RDJ || {});

  RDJ.SVG_BUFFET = `<svg class="buffet-svg" xmlns="http://www.w3.org/2000/svg" viewBox="30 40 685 297" font-family="Arial, Helvetica, sans-serif" role="img" aria-label="Plan du buffet du petit déjeuner, vue de dessus">
  <g fill="#5f6b7a" font-size="6" font-weight="bold" text-anchor="middle">
    <text x="190" y="52">Côté viennoiseries et pains</text>
    <text x="190" y="274">Côté produits frais</text>
    <text x="36" y="160" transform="rotate(-90 36 160)">Bout boissons</text>
    <text x="362" y="160" transform="rotate(90 362 160)">Bout fruits</text>
  </g>

  <rect x="40" y="60" width="300" height="200" rx="22" fill="#2b2f36"/>
  <rect x="44" y="64" width="56" height="192" rx="18" fill="#d5f2ea"/>
  <rect x="100" y="64" width="200" height="79" fill="#fbefc6"/>
  <rect x="100" y="177" width="200" height="79" fill="#dde9f8"/>
  <rect x="300" y="64" width="36" height="192" rx="18" fill="#fde3d4"/>
  <rect x="100" y="145" width="200" height="30" fill="#14171c"/>
  <rect x="100" y="145" width="9" height="30" fill="#000"/>
  <rect x="291" y="145" width="9" height="30" fill="#000"/>
  <text x="200" y="162" font-size="5.5" fill="#ffffff" text-anchor="middle">Structure centrale noire (poteaux, suspension)</text>

  <g fill="#e8d3b6" stroke="#9c7a52" stroke-width="0.8">
    <rect x="385" y="55" width="70" height="70" rx="3"/>
    <rect x="385" y="125" width="70" height="70" rx="3"/>
    <rect x="385" y="195" width="70" height="70" rx="3"/>
  </g>
  <text x="420" y="274" font-size="6" font-weight="bold" fill="#5f6b7a" text-anchor="middle">Trois tables</text>

  <g stroke="#1c2a48" stroke-width="0.6" fill="#ffffff">
    <rect x="50" y="68" width="42" height="28" rx="2" fill="#fff4cc"/>
    <rect x="50" y="100" width="42" height="38" rx="3" fill="#e9ecf0"/>
    <circle cx="71" cy="157" r="15" fill="#ffe08a"/>
    <rect x="53" y="176" width="36" height="28" rx="3" fill="#cfd6df"/>
    <rect x="51" y="208" width="40" height="22" rx="2" fill="#e8cfa6"/>
    <rect x="54" y="234" width="34" height="16" rx="3"/>
    <rect x="103" y="67" width="40" height="26" rx="2" fill="#f3dfb8"/>
    <circle cx="157" cy="80" r="12" fill="#e8cfa6"/>
    <rect x="173" y="67" width="38" height="26" rx="2" fill="#e8cfa6"/>
    <ellipse cx="234" cy="80" rx="20" ry="14" fill="#f0d9a8"/>
    <ellipse cx="280" cy="80" rx="20" ry="14" fill="#f0d9a8"/>
    <rect x="304" y="67" width="30" height="24" rx="2" fill="#e8cfa6"/>
    <rect x="104" y="104" width="26" height="20" rx="2" fill="#e2a77f"/>
    <circle cx="146" cy="116" r="10" fill="#e8cfa6"/>
    <rect x="163" y="106" width="22" height="13" rx="1" fill="#3a3a3a"/>
    <circle cx="204" cy="122" r="9" fill="#3a3f4a"/>
    <circle cx="226" cy="122" r="9" fill="#3a3f4a"/>
    <circle cx="251" cy="121" r="11" fill="#f0d9a8"/>
    <rect x="268" y="102" width="30" height="38" rx="3" fill="#f0d9a8"/>
    <rect x="304" y="99" width="30" height="22" rx="3" fill="#cfd6df"/>
    <circle cx="318" cy="160" r="17" fill="#ffffff"/>
    <circle cx="318" cy="160" r="12" fill="#b9e3a0"/>
    <circle cx="115" cy="194" r="12" fill="#f3e3c7"/>
    <circle cx="145" cy="194" r="15" fill="#f6d6a8"/>
    <rect x="178" y="181" width="54" height="32" rx="7" fill="#f6d2cf"/>
    <rect x="238" y="183" width="30" height="58" rx="2" fill="#ffffff"/>
    <circle cx="115" cy="236" r="11" fill="#ffffff"/>
    <path d="M132 244 L150 244 L141 228 Z" fill="#f7f2e3"/>
    <rect x="158" y="220" width="15" height="30" rx="1" fill="#e8cfa6"/>
    <rect x="180" y="219" width="50" height="23" rx="1" fill="#fbefc6"/>
    <circle cx="279" cy="194" r="6"/>
    <circle cx="277" cy="214" r="7" fill="#ffd27a"/>
    <circle cx="291" cy="214" r="7" fill="#ffd27a"/>
    <circle cx="284" cy="231" r="7" fill="#ffd27a"/>
    <circle cx="318" cy="234" r="16" fill="#f3dfb8"/>
    <rect x="389" y="59" width="34" height="34" rx="3"/>
    <rect x="427" y="61" width="24" height="16" rx="2"/>
    <rect x="427" y="81" width="24" height="16" rx="2"/>
    <rect x="390" y="100" width="14" height="14" rx="1" fill="#e8cfa6"/>
    <rect x="407" y="100" width="14" height="14" rx="1" fill="#e8cfa6"/>
    <circle cx="402" cy="141" r="11"/>
    <circle cx="402" cy="166" r="11"/>
    <circle cx="402" cy="187" r="7"/>
    <rect x="421" y="130" width="28" height="14" rx="2" fill="#f6d6a8"/>
    <rect x="421" y="147" width="18" height="11" rx="1" fill="#cfd6df"/>
    <rect x="441" y="146" width="11" height="13" rx="1" fill="#e9ecf0"/>
    <rect x="421" y="163" width="28" height="22" rx="2" fill="#cfd6df"/>
    <rect x="389" y="203" width="16" height="54" rx="2" fill="#e8cfa6"/>
    <circle cx="419" cy="208" r="8"/>
    <circle cx="440" cy="212" r="7" fill="#f3e3c7"/>
    <circle cx="440" cy="230" r="7" fill="#f3e3c7"/>
    <circle cx="440" cy="248" r="7" fill="#f3e3c7"/>
    <circle cx="418" cy="240" r="4" fill="#f3e3c7"/>
    <circle cx="418" cy="253" r="4" fill="#f3e3c7"/>
  </g>

  <g font-size="6" font-weight="bold" text-anchor="middle" fill="#1c2a48">
    <text x="71" y="84">1</text><text x="71" y="121">2</text><text x="71" y="159">3</text>
    <text x="71" y="192">4</text><text x="71" y="221">5</text><text x="71" y="244">6</text>
    <text x="123" y="82">7</text><text x="157" y="82">8</text><text x="192" y="82">9</text>
    <text x="234" y="82">10</text><text x="280" y="82">11</text><text x="319" y="81">12</text>
    <text x="117" y="116">13</text><text x="146" y="118">14</text>
    <text x="204" y="124" fill="#ffffff">15</text><text x="226" y="124" fill="#ffffff">15</text>
    <text x="251" y="123">16</text><text x="283" y="123">17</text><text x="319" y="112">18</text>
    <text x="318" y="162">19</text>
    <text x="115" y="196">20</text><text x="145" y="196">21</text><text x="205" y="199">25</text><text x="253" y="214">27</text>
    <text x="115" y="238">22</text><text x="141" y="241">23</text><text x="165" y="237">24</text><text x="205" y="233">26</text>
    <text x="298" y="200">28</text><text x="318" y="236">29</text>
    <text x="406" y="78">38</text><text x="439" y="72">39</text><text x="439" y="92">39</text><text x="405" y="122">39</text>
    <text x="402" y="143">37</text><text x="402" y="168">37</text><text x="402" y="189" font-size="5">33</text>
    <text x="435" y="140">35</text><text x="430" y="155" font-size="5">35</text><text x="446.5" y="154.5" font-size="4.5">36</text><text x="435" y="177">34</text>
    <text x="397" y="232">30</text><text x="419" y="210">33</text><text x="440" y="232">31</text><text x="426" y="248">32</text>
  </g>
  <g font-size="4.2" fill="#ffffff" text-anchor="middle"><text x="174" y="114.5">ardoise</text></g>

  <g stroke="#1c2a48" stroke-width="0.8">
    <line x1="40" y1="306" x2="140" y2="306"/><line x1="40" y1="302" x2="40" y2="310"/>
    <line x1="90" y1="303" x2="90" y2="309"/><line x1="140" y1="302" x2="140" y2="310"/>
  </g>
  <g font-size="5.5" fill="#1c2a48"><text x="40" y="318">0</text><text x="86" y="318">50 cm</text><text x="136" y="318">1 m</text></g>
  <text x="160" y="309" font-size="5" fill="#5f6b7a">Proportions estimées · îlot ≈ 3,0 × 2,0 m · tables ≈ 70 × 70 cm</text>

  <g font-size="5.6" fill="#1c2a48">
    <text x="480" y="60" font-size="7" font-weight="bold">Légende</text>
    <rect x="480" y="66" width="7" height="5" fill="#d5f2ea"/>
    <text x="490" y="71" font-weight="bold">Bout boissons</text>
    <text x="484" y="79">1 Thés (coffret)   2 Verres   3 Citrons</text>
    <text x="484" y="86">4 Presse-agrumes   5 Planche et couteau   6 Plat</text>
    <rect x="480" y="93" width="7" height="5" fill="#fbefc6"/>
    <text x="490" y="98" font-weight="bold">Côté viennoiseries et pains</text>
    <text x="484" y="106">7 Pain de mie, cake   8 Confitures   9 Brioche</text>
    <text x="484" y="113">10 Pains au chocolat   11 Croissants</text>
    <text x="484" y="120">12 Planche à pain   13 Ramequins   14 Miel</text>
    <text x="484" y="127">15 Bols noirs   16 Baguettes   17 Corbeilles de pain</text>
    <text x="484" y="134">18 Grille-pain</text>
    <rect x="480" y="141" width="7" height="5" fill="#fde3d4"/>
    <text x="490" y="146" font-weight="bold">Bout fruits</text>
    <text x="484" y="154">19 Présentoir à fruits (3 étages, plateau tournant)</text>
    <rect x="480" y="161" width="7" height="5" fill="#dde9f8"/>
    <text x="490" y="166" font-weight="bold">Côté produits frais</text>
    <text x="484" y="174">20 Compote   21 Salade de fruits   22 Fromage blanc</text>
    <text x="484" y="181">23 Fromage   24 Beurre   25 Charcuterie (cloche)</text>
    <text x="484" y="188">26 Fromage en tranches   27 Yaourts</text>
    <text x="484" y="195">28 Lait et jus de fruits   29 Crêpes</text>
    <rect x="480" y="202" width="7" height="5" fill="#e8d3b6" stroke="#9c7a52" stroke-width="0.4"/>
    <text x="490" y="207" font-weight="bold">Trois tables accolées</text>
    <text x="484" y="215">30 Distributeurs de céréales   31 Bocaux (granola,</text>
    <text x="490" y="222">fruits secs)   32 Sucre   33 Bols</text>
    <text x="484" y="229">34 Cuiseur à œufs   35 Œufs et coquetiers</text>
    <text x="484" y="236">36 Sel et poivre   37 Assiettes   38 Assiettes carrées</text>
    <text x="484" y="243">39 Couverts</text>
  </g>
</svg>`;
})();
