# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-current450-bound-context-d-007`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:e07aa8a01baf430c8ebd5d97c6440e5c993e050838afbee92dca80d396a08e8f`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Herstellung und Struktur von Silikonen für Polymervergleiche erklären

- Full learning-goal ID: `a96e9b3d-a02d-54f8-a3d3-318e0ea5180c`
- Goal fingerprint: `sha256:c4467c26af2efc5dccc3c11ecb7372bdb0995598807842fd1bc0be91d2db974f`
- Page fingerprint: `sha256:cf08f9e0dda6cdfe5508fd5b93e3ccacc242831492fe22103bd6e8f5a53a7dcd`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Herstellung und Bau von Silikonmolekülen beschreiben und daraus ihre Eigenschaften im Vergleich mit ausgewählten kohlenstoffbasierten Polymeren erklären.

### Visualization

/assets/goal-visualizations/chemie/a96e9b3d-a02d-54f8-a3d3-318e0ea5180c/a96e9b3d-a02d-54f8-a3d3-318e0ea5180c.png

- original digest: `sha256:f5f699a9e679ab9437dcdfbb09f6c3ee93932ce1f051e44004f11d0be68860dd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Eigenschaftsprofile von Polymeren — `2652caef-b557-58b9-9b28-70db62625ce5` (outside this book)

### Direct reverse prerequisites outside this book

- Siloxanketten und rückstellende Dichtungen erklären — `8c4bd771-13df-57ee-92bf-9f8d101edaa0` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ad7ff3c57b2a8253e6b2be1c3f209ac7cec4ac1140b52107e592219f1c2a1400`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Silanol-Kondensation erklärt das Siloxanrückgrat; endliche Ketten haben passende Endgruppen und eine bilanzierte Wasserabgabe.
  - Essential understanding (EN): Silanol condensation accounts for the siloxane backbone; finite chains retain correct end groups and a balanced water release.
  - Observable performance (DE): Beschreibt und bilanziert eine vorgegebene endliche Kette, prüft Si/O-Valenzen.
  - Observable performance (EN): Describes and balances a supplied finite chain and checks Si/O valences.
- `e2`
  - Essential understanding (DE): Silikonrückgrat, organische Seitengruppen und kohlenstoffbasiertes Vergleichsrückgrat sind unterscheidbare Bauprinzipien.
  - Essential understanding (EN): Silicone backbone, organic side groups and a carbon-based comparison backbone are distinct building principles.
  - Observable performance (DE): Vergleicht PDMS-Si–O/Methyl mit einem gegebenen PE-C–C-Modell, ohne Silikon mit Silicium gleichzusetzen. Vergleicht zusätzlich die bereitgestellten Eigenschaftsbeobachtungen von rückstellendem vernetztem PDMS und bleibend verformtem PE bei gleichen Bedingungen; leitet keine universelle Eigenschaft allein aus der Rückgratbezeichnung ab.
  - Observable performance (EN): Compares PDMS Si–O/methyl against supplied PE C–C without equating silicone and silicon. Also compares supplied property observations of recovering crosslinked PDMS and permanently deformed PE under equal conditions; infers no universal property solely from the backbone label.
- `e3`
  - Essential understanding (DE): Lineare Ketten und kovalente Netzwerke erklären unterschiedliche Eigenschaftsprofile; der Werkstoffvergleich bleibt an Struktur und Bedingung gebunden.
  - Essential understanding (EN): Linear chains and covalent networks explain different property profiles; material comparison remains structure/condition-bound.
  - Observable performance (DE): Erklärt Öl/Rückstellung und begründet die Werkstoffwahl bei geänderter Vernetzung statt eine universelle Polymer-Rangfolge zu behaupten.
  - Observable performance (EN): Explains oil/recovery and justifies material choice after changed crosslinking instead of asserting a universal polymer ranking.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Endliche Kettenlänge und Wasserbilanz / Finite chain length and water balance
- `v2`: Lineares gegenüber vernetztem Material / Linear versus crosslinked material
- `v3`: Werkstoffanforderung und Datengrenze / Material requirement and data limit

**Application cases**

- `e560-formation-case-1`
  - Task demand (DE): 1. Beschreibe die Silanol-Kondensation durch eine vollständige Formel des Trimers samt Wasser und prüfe die Si/O-Valenzen. 2. Vergleiche Siloxanrückgrat und organische Seitengruppen mit dem PE-Modell. 3. Erkläre Öl gegenüber Elastomer anhand der Vernetzung und begründe unter den gegebenen Bedingungen eine Dichtungsauswahl. Was ändert sich, wenn dieselbe PDMS-Kette zunächst nicht vernetzt ist?
  - Task demand (EN): 1. Describe silanol condensation using a complete trimer formula including water and check Si/O valences. 2. Compare the siloxane backbone and organic side groups with the PE model. 3. Explain oil versus elastomer through crosslinking and justify a seal choice under the supplied conditions. What changes if the same PDMS chain is initially uncrosslinked?
  - Expected performance (DE): 3 HO–Si(CH₃)₂–OH → HO–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–OH + 2 H₂O. Jedes Si trägt vier Einfachbindungen; Brücken-O zwei, terminaler OH-Sauerstoff Si und H. Das Si–O-Rückgrat mit Methylgruppen unterscheidet sich vom C–C-Rückgrat des PE-Modells. Gleiche Methylgruppen beweisen kein gleiches Rückgrat. Nicht vernetzte Ketten können gegeneinander gleiten; kovalente Netzpunkte begrenzen das Gleiten und ermöglichen im gegebenen Elastomer Rückstellung. Daher ist für die geforderte Formstabilität das gegebene vernetzte PDMS geeignet, das Öl nicht. Vernetzung verändert Verhalten bei derselben Polymerchemie; daraus folgt keine pauschale Überlegenheit aller Silikone gegenüber allen kohlenstoffbasierten Polymeren.
  - Expected performance (EN): 3 HO–Si(CH₃)₂–OH → HO–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–OH + 2 H₂O. Each Si has four single bonds; bridge O has two, terminal OH oxygen bonds to Si and H. The Si–O backbone with methyl groups differs from the C–C backbone of supplied PE. Identical methyl groups would not establish an identical backbone. Uncrosslinked chains can slide relative to each other; covalent network points restrict sliding and allow recovery in the supplied elastomer. Thus the given crosslinked PDMS suits the required shape stability, whereas the oil does not. Crosslinking changes behaviour at the same polymer chemistry; this does not prove universal superiority of all silicones over all carbon-based polymers.
  - Understanding focus (DE): Formuliert endgruppenrichtiges Trimer und zwei H₂O; erklärt Si-Vierbindigkeit und O-Zweibindigkeit. / Vergleicht PDMS-Si–O mit Methylgruppen ausdrücklich mit PE-C–C und trennt Rückgrat von Seitengruppen. / Erklärt gleitende Ölketten gegenüber kovalenten Netzpunkten und begründet Dichtung/Rückstellung auch beim Wechsel zur unvernetzten Variante.
  - Understanding focus (EN): Gives correctly terminated trimer and two H₂O; explains four bonds at Si and two at O. / Explicitly compares PDMS Si–O with methyl groups against PE C–C and distinguishes backbone from side groups. / Explains sliding oil chains versus covalent network points and justifies seal/recovery including the change to an uncrosslinked variant.
- `e560-formation-case-2`
  - Task demand (DE): 1. Stelle die vollständige endliche Tetramer-Kondensation samt Wasser auf und erkläre den Unterschied zwischen Rückgratverknüpfung und zusätzlichen Netzpunkten. 2. Vergleiche die Molekülbauprinzipien mit PE und ausdrücklich die beobachteten Eigenschaften unter denselben Prüfbedingungen: rückstellendes vernetztes PDMS gegenüber bleibend verformtem PE. Erkläre, was dieser Fallvergleich zeigt und was die Rückgratbezeichnung allein nicht beweist. 3. Erkläre die geänderte Rückstellung anhand der Netzstruktur. Beurteile: „Das Silikon stellt hier zurück, also ist jedes Silikon für jede Beanspruchung besser als PE.“
  - Task demand (EN): 1. Write the complete finite tetramer condensation including water and explain backbone linkage versus additional network points. 2. Compare molecular building principles with PE and explicitly compare observed properties under the same testing conditions: recovering crosslinked PDMS versus permanently deformed PE. Explain what this case comparison shows and what the backbone label alone does not establish. 3. Explain changed recovery through network structure. Assess: “This silicone recovers here, so every silicone is better than PE under every type of loading.”
  - Expected performance (DE): 4 HO–Si(CH₃)₂–OH → HO–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–OH + 3 H₂O. Drei neue Si–O–Si-Brücken entstehen in der offenen Kette; End-OH bleiben. Si–O mit organischen Methylgruppen ist nicht das C–C-Rückgrat von PE. Im gegebenen direkten Eigenschaftsvergleich stellt das vernetzte PDMS nach Dehnung zurück, während die PE-Probe unter denselben Prüfbedingungen bleibende Formänderung zeigt. Die Daten belegen diesen Unterschied der beiden konkreten Proben; das C–C-Rückgrat allein wird nicht als Ursache jeder PE-Verformung oder als Beweis eines allgemeinen Eigenschaftsurteils ausgegeben. Zusätzliche kovalente Verbindungen zwischen Ketten sind ein anderes Strukturmerkmal als bloß mehr Kettenlänge. Sie begrenzen im Fall das gegenseitige Gleiten und erklären die Rückstellung. Für diese Beanspruchung kann die vernetzte Probe geeigneter sein; der unvernetzte Ölzustand und fehlende Wärme-/Langzeitdaten verhindern eine allgemeine Rangfolge sämtlicher Silikone und kohlenstoffbasierter Polymere.
  - Expected performance (EN): 4 HO–Si(CH₃)₂–OH → HO–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–OH + 3 H₂O. Three new Si–O–Si bridges form in the open chain; terminal OH groups remain. Si–O with organic methyl groups is not the PE C–C backbone. In the supplied direct property comparison, crosslinked PDMS recovers after extension while the PE specimen shows permanent deformation under the same testing conditions. The data establish this difference between the two particular specimens; the C–C backbone alone is not treated as the cause of every PE deformation or as proof of a general property conclusion. Additional covalent links between chains are distinct from merely greater chain length. They restrict relative sliding in this case and explain recovery. For this loading the crosslinked specimen may be more suitable; uncrosslinked oil and missing heat/long-term data prevent a universal ranking of all silicones and carbon-based polymers.
  - Understanding focus (DE): Gibt vollständiges Tetramer mit drei H₂O und korrekten Endgruppen/Si–O-Brücken an. / Vergleicht Siloxan-Si–O/Methyl mit PE-C–C und trennt Kettenbildung von zusätzlichen Netzverknüpfungen. Vergleicht außerdem die beobachtete PDMS-Rückstellung ausdrücklich mit bleibender PE-Verformung unter gleichen Prüfbedingungen und begrenzt den Befund auf diese Proben; das Rückgrat allein erklärt nicht jede PE-Eigenschaft. / Erklärt Rückstellung und begrenzt die Werkstoffwahl auf gegebene Struktur, Beanspruchung und tatsächlich vorhandene Daten.
  - Understanding focus (EN): Gives complete tetramer with three H₂O and correct end groups/Si–O bridges. / Compares siloxane Si–O/methyl with PE C–C and separates chain formation from additional network links. Also explicitly compares observed PDMS recovery with permanent PE deformation under equal testing conditions and bounds the observation to these specimens; the backbone alone does not explain every PE property. / Explains recovery and limits material choice to given structure, loading and available data.
## Page 2: BTL-Kraftstoffe über Fischer–Tropsch erklären

- Full learning-goal ID: `abfa609d-9764-5bd8-999c-1d10a7eeac78`
- Goal fingerprint: `sha256:4c4f7ca46ccfafc5ec2dba1b0f74640fa005760a4207342a9009033fd1d57d49`
- Page fingerprint: `sha256:395bca568aa8a6194827b26355e4595918bc91c44f431ea053c5bc8c03817c68`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Herstellung von BTL-Treibstoff aus Biomasse über Vergasung, Synthesegasreinigung/-einstellung, Fischer–Tropsch-Synthese und Gemischaufarbeitung erklären, eine angegebene ideale Synthesebilanz prüfen und den Weg von Pflanzenöl, Biodiesel und anderen Rohstoff-/Generationskontexten sowie pauschalen CO2-Neutralitätsbehauptungen abgrenzen.

### Visualization

/assets/goal-visualizations/chemie/abfa609d-9764-5bd8-999c-1d10a7eeac78/abfa609d-9764-5bd8-999c-1d10a7eeac78.png

- original digest: `sha256:08dbd30ef2329f83a0371e3e301799a4489634e1ea5ae859e7d7832e246296af`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: BTL-Kraftstoffe über Fischer–Tropsch erklären — `13e856ab-f7be-53df-a32a-6d6e8242e26c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8a849e82bae220f34acd7cc1485f017baa74b16e8aa1bd46459ae9cf9ccb5e60`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `hb-btl-fischer-tropsch`
  - Essential understanding (DE): BTL verbindet Biomassevergasung, gereinigtes Synthesegas, FT-Synthese und Gemischaufarbeitung; ideale Alkanbilanz ist kein realer Selektivitäts-/LCA-Nachweis.
  - Essential understanding (EN): BTL connects biomass gasification, cleaned syngas, FT synthesis and mixture upgrading; ideal alkane balance is no actual selectivity/LCA evidence.
  - Observable performance (DE): Die lernende Person erklärt die Kette, bilanziert das ideale C8-Modell mit limitierendem Stoff und unterscheidet im neuen Kohle-/H2-Fall Benennung, Stoffbilanz und Klimagrenze.
  - Observable performance (EN): The learner explains the chain, balances ideal C8 with limiting reactant and distinguishes naming, balance and climate limits in the new coal/H2 case.

**Coverage expectations**

- required expectations: `hb-btl-fischer-tropsch`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `hb-btl-fischer-tropsch-changed`: Neue Bedingungen im gebundenen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the bound transfer.

**Application cases**

- `hb201-btl-fischer-tropsch-main`
  - Task demand (DE): Bearbeite den vollständigen Hauptfall im gebundenen Material hb201-btl-fischer-tropsch.
  - Task demand (EN): Handle the complete main case in bound material hb201-btl-fischer-tropsch.
  - Expected performance (DE): Die lernende Person erklärt die Kette, bilanziert das ideale C8-Modell mit limitierendem Stoff und unterscheidet im neuen Kohle-/H2-Fall Benennung, Stoffbilanz und Klimagrenze.
  - Expected performance (EN): The learner explains the chain, balances ideal C8 with limiting reactant and distinguishes naming, balance and climate limits in the new coal/H2 case.
  - Understanding focus (DE): BTL verbindet Biomassevergasung, gereinigtes Synthesegas, FT-Synthese und Gemischaufarbeitung; ideale Alkanbilanz ist kein realer Selektivitäts-/LCA-Nachweis.
  - Understanding focus (EN): BTL connects biomass gasification, cleaned syngas, FT synthesis and mixture upgrading; ideal alkane balance is no actual selectivity/LCA evidence.
- `hb201-btl-fischer-tropsch-fresh`
  - Task demand (DE): Bearbeite den vollständigen frischen Transfer im gebundenen Material hb201-btl-fischer-tropsch.
  - Task demand (EN): Handle the complete fresh transfer in bound material hb201-btl-fischer-tropsch.
  - Expected performance (DE): Die lernende Person erklärt die Kette, bilanziert das ideale C8-Modell mit limitierendem Stoff und unterscheidet im neuen Kohle-/H2-Fall Benennung, Stoffbilanz und Klimagrenze.
  - Expected performance (EN): The learner explains the chain, balances ideal C8 with limiting reactant and distinguishes naming, balance and climate limits in the new coal/H2 case.
  - Understanding focus (DE): BTL verbindet Biomassevergasung, gereinigtes Synthesegas, FT-Synthese und Gemischaufarbeitung; ideale Alkanbilanz ist kein realer Selektivitäts-/LCA-Nachweis.
  - Understanding focus (EN): BTL connects biomass gasification, cleaned syngas, FT synthesis and mixture upgrading; ideal alkane balance is no actual selectivity/LCA evidence.
## Page 3: pH-Werte starker und schwacher einprotoniger Säuren berechnen

- Full learning-goal ID: `acdfc7d7-6d6b-5a1f-837c-79449c29a305`
- Goal fingerprint: `sha256:6f7d31c5c10816bdeb791f213ea3c7bc1851f1acef636d0e0a5c83b89916f17c`
- Page fingerprint: `sha256:a650e92ed2301cfaee66d79dea22e9378e2aa55cd7ca8f6c59780cd02b0922ba`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann für wässrige Lösungen starker und schwacher einprotoniger Säuren die Säurestärke von der formalen Konzentration unterscheiden, die Oxoniumionenkonzentration mithilfe des passenden vollständigen oder unvollständigen Protolysemodells bestimmen und den Anfangs-pH mit selbst aus dem MWG abgeleiteten, begründet geprüften Näherungen berechnen.

### Visualization

/assets/goal-visualizations/chemie/acdfc7d7-6d6b-5a1f-837c-79449c29a305/acdfc7d7-6d6b-5a1f-837c-79449c29a305.png

- original digest: `sha256:b35bf727641f4b8d5483fb1c30e69e66d6ced1a9523750f6fe4591956aaefb4f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- pK-Werte nutzen — `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Charakteristische pH-Werte von Titrationskurven berechnen — `29742d91-732f-5da5-bc46-e963885f9a4a` (outside this book)
- Polyprotische Systeme — `dc0470f1-0676-5949-a5cc-02783d478406` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e1c5146fc490440743d1e98e284c26ee63f5eec44c03f1c01bb0c87cda0bfa01`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `acid-model`
  - Essential understanding (DE): Vollständige starke Protolyse und endliches schwaches Säuregleichgewicht sind verschiedene Anfangsmodelle.
  - Essential understanding (EN): Complete strong-acid transfer and finite weak-acid equilibrium are distinct initial models.
  - Observable performance (DE): Unterscheide Stärke und formale Konzentration, begründe die Reaktion und berechne die Oxoniumkonzentration und den Anfangs-pH des passenden Modells.
  - Observable performance (EN): Distinguish strength/formal concentration, justify the reaction and calculate hydronium and initial pH using the appropriate model.
- `acid-derivation`
  - Essential understanding (DE): Die schwache Säure erfordert MWG und Stoffbilanz; die Wurzelnäherung setzt kleine Umsetzung und vernachlässigbaren Wasserbeitrag voraus.
  - Essential understanding (EN): Weak-acid calculation requires mass action/balance; the square-root approximation assumes small conversion and negligible water contribution.
  - Observable performance (DE): Leite die positive quadratische Lösung und Wurzelnäherung für HA selbst her, prüfe Umsetzungsanteil/Fehler und verwerfe die wasserfreie Rechnung bei extremer Verdünnung.
  - Observable performance (EN): Independently derive the positive quadratic and square-root approximations for HA, check conversion/error and reject a water-free calculation at extreme dilution.

**Coverage expectations**

- required expectations: `acid-model`, `acid-derivation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `strong-weak-acid`: Starke und schwache Säure bei gleichem formalem Gehalt vergleichen. / Compare strong/weak acids at equal formal content.
- `water-boundary`: Von0,0100 M HA zu10−8 M wechseln und die Näherungsgrenze begründen. / Change from0.0100 M HA to10−8 M and explain the approximation limit.

**Application cases**

- `weak-acid-derivation`
  - Task demand (DE): Bearbeite ausschließlich den HA-Zweig von WEAK-MODEL-C1 mitc0=0,0100 M,pKa4,76: leite aus MWG/Bilanz x²/(c0−x)=Ka und die positive Lösung her; vergleiche Wurzel und quadratische Rechnung.
  - Task demand (EN): Work only the HA branch of WEAK-MODEL-C1 withc0=0.0100 M,pKa4.76: derive x²/(c0−x)=Ka and its positive solution, comparing square-root and quadratic calculation.
  - Expected performance (DE): x=(−Ka+√(Ka²+4Kac0))/2≈4,0827·10−4 M,pH≈3,389; Wurzelnäherung≈3,380. Etwa4,08% Umsetzung begründen die bewertete Näherung; keine universelle Prozentregel.
  - Expected performance (EN): x=(−Ka+√(Ka²+4Kac0))/2≈4.0827·10−4 M,pH≈3.389; square-rootpH≈3.380. About4.08% conversion supports evaluation of the approximation without a universal percentage rule.
  - Understanding focus (DE): Eigenständige Herleitung und Fehlerbewertung im Säurezweig.
  - Understanding focus (EN): Independent derivation/error assessment in the acid branch.
- `acid-strength-and-extreme-dilution`
  - Task demand (DE): Vergleiche den starken Säureanfang in T05-C1 mit dem schwachen Modell und prüfe die10−8-M-HA-Variation in WEAK-MODEL-C1.
  - Task demand (EN): Compare the strong-acid start in T05-C1 with the weak model and assess the10−8-M HA variation in WEAK-MODEL-C1.
  - Expected performance (DE): Für0,100 M starke einprotonige Säure gilt im ModellpH1; die schwache Säure liefert bei gleichem Gehalt weniger Oxonium. Bei10−8 M verletzt√(Kac0) die Stoffbilanzannahme; Wasser/Ladungsbilanz sind nötig und bloßes Verdünnen macht die Säure nicht alkalisch.
  - Expected performance (EN): A0.100 M strong monoprotic acid gives modelpH1; a weak acid gives less hydronium at equal content. At10−8 M,√(Kac0) violates the assumed balance regime; water/charge balance are required and dilution alone does not make the acid alkaline.
  - Understanding focus (DE): Stärke/Konzentration und Wassergrenze statt bloßer Formeleinsetzung; keine Titrationsrechnungspflicht.
  - Understanding focus (EN): Strength/concentration and water limits rather than substitution alone; no added titration-calculation requirement.
## Page 4: Gegebene Aldosen im formalen Zuckerstammbaum ordnen

- Full learning-goal ID: `ad135d28-2682-5b52-a9e2-ddae3e03bb05`
- Goal fingerprint: `sha256:a140e4846ce878a2937a5330a96214bd3dab5c2326715d7d6c7a39158e962316`
- Page fingerprint: `sha256:b56d98a35dbd5a8631e9e208035bdf6dee6210edae3f6d44f0c1ff600438dacb`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann gegebene Aldosen anhand ihrer Fischer-Projektionen in einem formalen Zuckerstammbaum ordnen, den dabei erhaltenen unteren Konfigurationsrest erläutern und D-/L-Zuordnung sowie C2-Epimerie an den betreffenden Stereozentren begründen, ohne daraus eine Biosynthesekette oder ein optisches Drehvorzeichen abzuleiten.

### Visualization

/assets/goal-visualizations/chemie/ad135d28-2682-5b52-a9e2-ddae3e03bb05/ad135d28-2682-5b52-a9e2-ddae3e03bb05.png

- original digest: `sha256:4da1b9df5b4dd4feddedcce5e1245a6c07f1f71b3a1d82a468be5d00f12ec516`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Kohlenhydratklassen strukturbezogen unterscheiden — `684ffe86-3a9f-5514-866a-47d16372f2d4` (outside this book)

### Direct reverse prerequisites outside this book

- Aldosen im formalen Strukturstammbaum ordnen — `987cebe4-9157-51f2-9939-f12bbb512c6e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3c73c463ee878a0cb51eff166ec9eb789d7fdd79f21e75cbabcf2ee69934d808`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `representation`

**Positive understanding expectations**

- `formal-pattern-and-configuration`
  - Essential understanding (DE): Glucose RLRR und Mannose LLRR haben den gemeinsamen unteren Rest LRR, also formal Arabinose als Pentose-Elternmuster. Sie unterscheiden sich nur am neu eingefügten C2 und sind C2-Epimere, keine Enantiomere und kein alpha/beta-Anomerenpaar. Beide bleiben D, weil das unterste OH rechts steht. R/L bezeichnet hier nur rechts/links, nicht CIP. Der Baum ordnet Strukturen; er beschreibt keinen tatsächlichen Syntheseweg.
  - Essential understanding (EN): Glucose RLRR and mannose LLRR share lower pattern LRR, formally arabinose as pentose parent. They differ only at newly inserted C2 and are C2 epimers, neither enantiomers nor an alpha/beta anomer pair. Both are D because their lowest OH is right. R/L here means right/left, not CIP. The tree organises structures, not an actual biosynthetic route.
  - Observable performance (DE): Nutze die vollständig gegebenen OH-Muster und die erklärte formale Erweiterungsregel, um einen beschrifteten Aldosenstammbaum zu konstruieren. Verbinde D-Glucose und D-Mannose mit dem gemeinsamen Pentosemuster. Nummeriere die betreffenden C-Atome, bestimme ihren einzigen Konfigurationsunterschied und ordne D/L anhand des untersten Stereozentrums zu. Erläutere, weshalb der formale Elternpfeil weder eine organismische Biosynthese noch eine Drehungsrichtung behauptet.
  - Observable performance (EN): Use the complete supplied OH patterns and formal-extension rule to construct a labelled aldose family tree. Link D-glucose and D-mannose to their common pentose pattern. Number the relevant carbons, identify their sole configurational difference and assign D/L from the lowest stereocentre. Explain why a formal parent arrow establishes neither organismic biosynthesis nor optical-rotation sign.
- `new-pattern-transfer-and-limit`
  - Essential understanding (DE): Galactose passt formal unter Lyxose LLR, Xylose unter Threose LR. In beiden entscheidet das unterste OH über D. Der obere neue Rest darf nicht mit dem erhaltenen unteren Muster verwechselt werden; keine Biosynthese- oder Drehvorzeichenfolgerung.
  - Essential understanding (EN): Galactose formally branches from lyxose LLR and xylose from threose LR. Their lowest OH determines D. Distinguish the new upper centre from the retained lower pattern; no biosynthesis or optical-sign inference.
  - Observable performance (DE): Ordne jetzt D-Galactose RLLR und D-Xylose RLR unabhängig ein. Widersprich „D bedeutet jedes OH rechts“ und „Stammbaum bedeutet Fotosynthesekette“. Kein neuer Ringschluss wird verlangt.
  - Observable performance (EN): Now independently place D-galactose RLLR and D-xylose RLR. Refute “D means every OH is right” and “the tree is a photosynthesis sequence”. No additional ring closure is required.

**Coverage expectations**

- required expectations: `formal-pattern-and-configuration`, `new-pattern-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `new-aldose-pattern`: Neue OH-Folge bei erhaltener formaler Regel; D/L, Epimerie und Biosynthese unterscheiden. / New OH pattern under the same formal rule; distinguish D/L, epimerism and biosynthesis.

**Application cases**

- `given-aldose-tree-initial`
  - Task demand (DE): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/1. Nutze die vollständig gegebenen OH-Muster und die erklärte formale Erweiterungsregel, um einen beschrifteten Aldosenstammbaum zu konstruieren. Verbinde D-Glucose und D-Mannose mit dem gemeinsamen Pentosemuster. Nummeriere die betreffenden C-Atome, bestimme ihren einzigen Konfigurationsunterschied und ordne D/L anhand des untersten Stereozentrums zu. Erläutere, weshalb der formale Elternpfeil weder eine organismische Biosynthese noch eine Drehungsrichtung behauptet.
  - Task demand (EN): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/1. Use the complete supplied OH patterns and formal-extension rule to construct a labelled aldose family tree. Link D-glucose and D-mannose to their common pentose pattern. Number the relevant carbons, identify their sole configurational difference and assign D/L from the lowest stereocentre. Explain why a formal parent arrow establishes neither organismic biosynthesis nor optical-rotation sign.
  - Expected performance (DE): Glucose RLRR und Mannose LLRR haben den gemeinsamen unteren Rest LRR, also formal Arabinose als Pentose-Elternmuster. Sie unterscheiden sich nur am neu eingefügten C2 und sind C2-Epimere, keine Enantiomere und kein alpha/beta-Anomerenpaar. Beide bleiben D, weil das unterste OH rechts steht. R/L bezeichnet hier nur rechts/links, nicht CIP. Der Baum ordnet Strukturen; er beschreibt keinen tatsächlichen Syntheseweg.
  - Expected performance (EN): Glucose RLRR and mannose LLRR share lower pattern LRR, formally arabinose as pentose parent. They differ only at newly inserted C2 and are C2 epimers, neither enantiomers nor an alpha/beta anomer pair. Both are D because their lowest OH is right. R/L here means right/left, not CIP. The tree organises structures, not an actual biosynthetic route.
  - Understanding focus (DE): Ein zusammenhängendes formales Konfigurationsmodell.
  - Understanding focus (EN): One connected formal configurational model.
- `given-aldose-tree-fresh-transfer`
  - Task demand (DE): Ordne jetzt D-Galactose RLLR und D-Xylose RLR unabhängig ein. Widersprich „D bedeutet jedes OH rechts“ und „Stammbaum bedeutet Fotosynthesekette“. Kein neuer Ringschluss wird verlangt.
  - Task demand (EN): Now independently place D-galactose RLLR and D-xylose RLR. Refute “D means every OH is right” and “the tree is a photosynthesis sequence”. No additional ring closure is required.
  - Expected performance (DE): Galactose passt formal unter Lyxose LLR, Xylose unter Threose LR. In beiden entscheidet das unterste OH über D. Der obere neue Rest darf nicht mit dem erhaltenen unteren Muster verwechselt werden; keine Biosynthese- oder Drehvorzeichenfolgerung.
  - Expected performance (EN): Galactose formally branches from lyxose LLR and xylose from threose LR. Their lowest OH determines D. Distinguish the new upper centre from the retained lower pattern; no biosynthesis or optical-sign inference.
  - Understanding focus (DE): Neue Muster unabhängig aus der Erweiterungsregel zuordnen.
  - Understanding focus (EN): Independently assign new patterns using the extension rule.
## Page 5: Mesomere Grenzstrukturen aromatischer Systeme bewerten

- Full learning-goal ID: `b44f460b-3399-5c3c-94b2-fa5fc6c027f2`
- Goal fingerprint: `sha256:dccb26db9e52b97f399a54fef20e379dc4ae8c910f2ce9fd87f9a52d48c1992f`
- Page fingerprint: `sha256:9524af0fb5f97020f55597b969467178887260babce5959bc09e61c0c658764a`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann mesomere Grenzstrukturen nutzen, um Elektronenverteilungen in aromatischen Kohlenwasserstoff-Molekülen darzustellen, die Modellhaftigkeit dieser Darstellung beurteilen und wahrscheinliche Grenzstrukturformeln anhand ihres energetischen Zustands identifizieren.

### Visualization

/assets/goal-visualizations/chemie/b44f460b-3399-5c3c-94b2-fa5fc6c027f2/b44f460b-3399-5c3c-94b2-fa5fc6c027f2.jpg

- original digest: `sha256:1b48fc39a6c84b272f708e65e99dd00fb11aa34ce10cb5870e1de1748d8a9025`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Benzolstruktur deuten — `4bdbdf32-3021-5a0a-b412-b611166b2d21` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e28831ba6c8dca404e693ed84eabd71eb30dec0be4c02d03a6cce6c2302353c7`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Gültige Grenzformeln behalten Atome, σ-Gerüst, Elektronenzahl und Gesamtladung bei.
  - Essential understanding (EN): Valid resonance contributors preserve atoms, sigma framework, electron count and total charge.
  - Observable performance (DE): Prüft und zeichnet chemisch zulässige Elektronenverteilungen.
  - Observable performance (EN): Checks and draws chemically valid electron distributions.
- `e2`
  - Essential understanding (DE): Energetisch günstige Grenzformeln haben angemessene Valenzen und geringe unnötige Ladungstrennung; der Hybrid ist kein einzelner Beitrag.
  - Essential understanding (EN): Energetically favorable contributors have valid valences and little unnecessary charge separation; the hybrid is not one contributor.
  - Observable performance (DE): Bewertet Beiträge und begrenzt ihre Interpretation.
  - Observable performance (EN): Evaluates contributors and limits their interpretation.

**Coverage expectations**

- required expectations: `e1`, `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Gültigkeit versus energetisches Gewicht / Validity versus energetic weight
- `v2`: Neutrale Form und Ladungstrennung / Neutral form and charge separation

**Application cases**

- `b44f460b-case-1`
  - Task demand (DE): Sechsring C1–C6, je ein H. A: C1=C2, C3=C4, C5=C6, sonst Einfachbindungen. B: C2=C3, C4=C5, C6=C1. C: C1⁺–C2⁻, C3=C4, C5=C6, sonst Einfachbindungen; C2 trägt ein freies Elektronenpaar. Alle σ-Bindungen bleiben gleich.
1. Prüfe für A, B und C Gesamtladung, Elektronenzahl und Valenzen; zeige den Elektronenpaarpfeil von A nach C.
2. Bewerte das relative energetische Gewicht von A/B gegenüber C und erkläre, warum die Grenzformeln keine getrennten Moleküle sind.
  - Task demand (EN): Six-membered C1–C6 ring, one H each. A: C1=C2, C3=C4, C5=C6, otherwise single bonds. B: C2=C3, C4=C5, C6=C1. C: C1⁺–C2⁻, C3=C4, C5=C6, otherwise single bonds; C2 has a lone pair. All sigma bonds remain unchanged.
1. Check net charge, electron count and valences in A, B and C; show the electron-pair arrow from A to C.
2. Assess relative energetic weight of A/B versus C and explain why contributors are not separate molecules.
  - Expected performance (DE): 1. A/B sind neutrale Kekulé-Beiträge mit sechs π-Elektronen und erfüllten C-Oktetten. C hat netto 0; das C1=C2-π-Paar liegt nun als freies Paar an C2, C1 besitzt ein Elektronensextett. Pfeil vom π-Paar C1=C2 zu C2, nicht Bewegung von H oder C.
2. A und B sind gleichwertig und energetisch günstiger als C mit Ladungstrennung und C1-Oktettlücke. C ist ein zulässiger schwächerer Beitrag, kein zusätzliches Molekül im Gleichgewicht. Die reale Elektronendichte gehört zum Hybrid und ist nicht mit einer einzigen Formel identisch.
  - Expected performance (EN): 1. A/B are neutral Kekulé contributors with six pi electrons and carbon octets. C has net zero charge; the C1=C2 pi pair is now a lone pair at C2 and C1 has an electron sextet. Arrow from the C1=C2 pi pair to C2, not movement of H or C.
2. A and B are equivalent and energetically more favorable than C, which has charge separation and an octet deficiency at C1. C is a valid weaker contributor, not another equilibrium molecule. Real electron density belongs to the hybrid and is not identical to a single formula.
  - Understanding focus (DE): A/B sind neutrale Kekulé-Beiträge mit sechs π-Elektronen und erfüllten C-Oktetten. C hat netto 0; das C1=C2-π-Paar liegt nun als freies Paar an C2, C1 besitzt ein Elektronensextett. Pfeil vom π-Paar C1=C2 zu C2, nicht Bewegung von H oder C. / A und B sind gleichwertig und energetisch günstiger als C mit Ladungstrennung und C1-Oktettlücke. C ist ein zulässiger schwächerer Beitrag, kein zusätzliches Molekül im Gleichgewicht. Die reale Elektronendichte gehört zum Hybrid und ist nicht mit einer einzigen Formel identisch.
  - Understanding focus (EN): A/B are neutral Kekulé contributors with six pi electrons and carbon octets. C has net zero charge; the C1=C2 pi pair is now a lone pair at C2 and C1 has an electron sextet. Arrow from the C1=C2 pi pair to C2, not movement of H or C. / A and B are equivalent and energetically more favorable than C, which has charge separation and an octet deficiency at C1. C is a valid weaker contributor, not another equilibrium molecule. Real electron density belongs to the hybrid and is not identical to a single formula.
- `b44f460b-case-2`
  - Task demand (DE): Benzol A besitzt C1=C2, C3=C4, C5=C6 und je ein H an C1–C6. Behaupteter Beitrag D verschiebt H von C1 nach C2, verändert damit zwei C–H-Bindungen und zeichnet eine andere Doppelbindungsverteilung. Beitrag E erhält alle H-Positionen und verschiebt nur die drei π-Paare zyklisch.
1. Entscheide, ob D und E Grenzformeln desselben Benzolmoleküls sein können; begründe mit Atomgerüst und Elektronenpaarbewegung.
2. Zeichne den zulässigen zweiten neutralen Kekulé-Beitrag mit Elektronenpaarpfeilen und erkläre seine energetische Gleichwertigkeit sowie die Grenze der Zeichnung.
  - Task demand (EN): Benzene A has C1=C2, C3=C4, C5=C6 and one H on each C1–C6. Alleged contributor D moves H from C1 to C2, changing two C–H bonds and drawing another double-bond pattern. E retains all H positions and shifts only the three pi pairs cyclically.
1. Decide whether D and E can be contributors of the same benzene molecule; justify using the atomic framework and electron-pair movement.
2. Draw the valid second neutral Kekulé contributor with electron-pair arrows and explain energetic equivalence and the limit of the drawing.
  - Expected performance (DE): 1. D ist keine Mesomerie, weil eine H-Atomposition und das σ-Gerüst geändert werden. E kann ein gültiger Beitrag sein: drei π-Paare verschieben sich ohne Änderung von Atomen, Gesamtladung oder σ-Bindungen.
2. Die zweite Formel hat C2=C3, C4=C5, C6=C1; drei gebogene Paarpfeile verbinden benachbarte π-Bindungspositionen. Beide neutralen Formeln sind bei Benzolsymmetrie gleichwertig. Die Zeichnung zeigt mögliche Elektronenbuchhaltung, keine laufende Bindungswanderung oder exakte Elektronendichte.
  - Expected performance (EN): 1. D is not resonance because a hydrogen position and sigma framework change. E can be valid: three pi pairs shift without changing atoms, total charge or sigma bonds.
2. The second formula has C2=C3, C4=C5, C6=C1; three curved pair arrows connect adjacent pi-bond positions. Both neutral formulas are equivalent by benzene symmetry. The drawing shows electron bookkeeping, not moving bonds or an exact electron-density map.
  - Understanding focus (DE): D ist keine Mesomerie, weil eine H-Atomposition und das σ-Gerüst geändert werden. E kann ein gültiger Beitrag sein: drei π-Paare verschieben sich ohne Änderung von Atomen, Gesamtladung oder σ-Bindungen. / Die zweite Formel hat C2=C3, C4=C5, C6=C1; drei gebogene Paarpfeile verbinden benachbarte π-Bindungspositionen. Beide neutralen Formeln sind bei Benzolsymmetrie gleichwertig. Die Zeichnung zeigt mögliche Elektronenbuchhaltung, keine laufende Bindungswanderung oder exakte Elektronendichte.
  - Understanding focus (EN): D is not resonance because a hydrogen position and sigma framework change. E can be valid: three pi pairs shift without changing atoms, total charge or sigma bonds. / The second formula has C2=C3, C4=C5, C6=C1; three curved pair arrows connect adjacent pi-bond positions. Both neutral formulas are equivalent by benzene symmetry. The drawing shows electron bookkeeping, not moving bonds or an exact electron-density map.
## Page 6: Halogenide, Sulfate, Nitrate und Carbonate einordnen

- Full learning-goal ID: `b5086548-169e-5d63-a14a-dabf631fa013`
- Goal fingerprint: `sha256:ce2e0341e7253b66b4c7fd8623e291a9876d9d6a07bc38ff1a457d188b8856e9`
- Page fingerprint: `sha256:cdb7fc2f41ce71579cca9118984ae7fef143e38a0edcef153bd8d46e19712df3`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann ausgewaehlte Salzklassen wie Halogenide, Sulfate, Nitrate und Carbonate anhand ihrer Ionen fachlich einordnen.

### Visualization

/assets/goal-visualizations/chemie/b5086548-169e-5d63-a14a-dabf631fa013/b5086548-169e-5d63-a14a-dabf631fa013.jpg

- original digest: `sha256:9e9987acbd4199480770fd2f3e48d8d61fca14cc1c49998cf4f8ca85fa68708f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Düngemittel chemisch einordnen — `1f5ee84f-245a-5a1e-a260-f960f26523e9` (page 7)
- Gipsbildung bei Rauchgaswäsche deuten — `414489cb-453e-5de4-ab0f-0fc01175e522` (page 8)

### Prerequisites outside this book

- Saure, alkalische und neutrale Lösungen unterscheiden — `d2ccd1d5-56f7-583f-9724-e97441367f91` (outside this book)
- Einfache Ionengitter modellieren und Stoffeigenschaften erklären — `950c73c6-4ed1-488a-9267-1142e95e0055` (outside this book)

### Direct reverse prerequisites outside this book

- Kalkkreislauf chemisch beschreiben — `d726e00e-1f87-5ba5-8c79-76ad4022365e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d8b08e4c9e385f09fcf74ac665aa6b53c732ddfa4246b686dcef7ee00f6b7d63`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `b010-b508-anion-classification`
  - Essential understanding (DE): Die Klasse eines ausgewählten Salzes wird am charakteristischen Anion erkannt: Halogenid mit Cl⁻, Br⁻ oder I⁻, Sulfat mit SO₄²⁻, Nitrat mit NO₃⁻ und Carbonat mit CO₃²⁻. Unterschiedliche Kationen und Indizes in einer ladungsneutralen Formel ändern das namensgebende Anion nicht.
  - Essential understanding (EN): The class of a selected salt is identified by its characteristic anion: a halide with Cl⁻, Br⁻ or I⁻, a sulfate with SO₄²⁻, a nitrate with NO₃⁻, and a carbonate with CO₃²⁻. Different cations and subscripts in a charge-neutral formula do not change the class-defining anion.
  - Observable performance (DE): Die lernende Person erkennt in neuen vorgegebenen Salzformeln oder Ionenkombinationen das charakteristische Anion und begründet damit die Klassenzuordnung trotz anderer Kationen und Zahlenverhältnisse, ohne Stoffeigenschaften bloß aus dem Klassennamen abzuleiten.
  - Observable performance (EN): The learner identifies the characteristic anion in unfamiliar supplied salt formulas or ion combinations and uses it to justify the class despite different cations and ion ratios, without inferring material properties merely from the class label.

**Coverage expectations**

- required expectations: `b010-b508-anion-classification`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `different-cations-and-ratios`: Vorgegebene neue Formeln verwenden andere Kationen und Zahlenverhältnisse als die vier Beispiele des Bildes. / New supplied formulas use different cations and ion ratios from the four examples in the image.
- `given-ion-combinations`: Ein zweiter Fall stellt die Ionen bereits als Gruppen mit unterschiedlichen Zahlenverhältnissen bereit; allein das charakteristische Anion bestimmt die Klasse. / A second case supplies ions as groups with different ratios; the characteristic anion alone determines the class.

**Application cases**

- `unseen-salt-formulas`
  - Task demand (DE): Ohne Abbildung liegen die Salzformeln MgCl₂, Al₂(SO₄)₃, Na₂CO₃ und Ca(NO₃)₂ vor. Benenne für jede das charakteristische Anion und die Salzklasse. Erkläre am Vergleich von MgCl₂ mit Na₂CO₃, warum ein Index 2 allein keine Salzklasse bestimmt.
  - Task demand (EN): Without a diagram, the salt formulas MgCl₂, Al₂(SO₄)₃, Na₂CO₃ and Ca(NO₃)₂ are supplied. Name the characteristic anion and salt class for each. Compare MgCl₂ with Na₂CO₃ to explain why a subscript 2 alone does not determine the salt class.
  - Expected performance (DE): MgCl₂ enthält Cl⁻ und ist ein Halogenid; Al₂(SO₄)₃ enthält SO₄²⁻ und ist ein Sulfat; Na₂CO₃ enthält CO₃²⁻ und ist ein Carbonat; Ca(NO₃)₂ enthält NO₃⁻ und ist ein Nitrat. Der Index gleicht Ionenladungen aus und bezeichnet nicht die Klasse; entscheidend ist jeweils die Anionenart.
  - Expected performance (EN): MgCl₂ contains Cl⁻ and is a halide; Al₂(SO₄)₃ contains SO₄²⁻ and is a sulfate; Na₂CO₃ contains CO₃²⁻ and is a carbonate; Ca(NO₃)₂ contains NO₃⁻ and is a nitrate. The subscript balances ionic charges and does not designate a class; the anion type does.
  - Understanding focus (DE): Frische Klassifikation nach Anion statt Wiedererkennen der vier Bildbeispiele oder eines bloßen Zahlenmusters.
  - Understanding focus (EN): Fresh classification by anion rather than recognition of the four image examples or a bare number pattern.
- `given-ion-groups`
  - Task demand (DE): Eine zweite, bildfreie Aufgabe gibt zwei bereits zusammengestellte Ionenlisten vor: Salz A enthält 2 K⁺ und CO₃²⁻, Salz B enthält Ca²⁺ und 2 NO₃⁻. Nenne für A und B das namensgebende Anion und die Salzklasse. Begründe, weshalb die unterschiedlichen Kationen und Zahlenverhältnisse nicht selbst den Klassennamen festlegen. Es sind keine Formeln zu bilden oder Stoffeigenschaften zu erraten.
  - Task demand (EN): A second diagram-free task supplies two already assembled ion lists: salt A contains 2 K⁺ and CO₃²⁻, and salt B contains Ca²⁺ and 2 NO₃⁻. For A and B, name the class-defining anion and salt class. Explain why the different cations and ion ratios do not themselves determine the class name. No formula construction or material-property guess is requested.
  - Expected performance (DE): A enthält Carbonat-Ionen CO₃²⁻ und gehört zur Klasse der Carbonate; B enthält Nitrat-Ionen NO₃⁻ und gehört zur Klasse der Nitrate. Die Anzahl der K⁺ beziehungsweise NO₃⁻ und das jeweilige Gegenion ändern das charakteristische Anion nicht. Eine Eigenschaft des konkreten Salzes folgt daraus allein nicht.
  - Expected performance (EN): A contains carbonate ions CO₃²⁻ and belongs to the carbonates; B contains nitrate ions NO₃⁻ and belongs to the nitrates. The number of K⁺ or NO₃⁻ ions and the respective counterion do not change the characteristic anion. This classification alone establishes no property of the particular salt.
  - Understanding focus (DE): Transfer von vorgegebenen Ionengruppen auf die Klassifikation; prüft das charakteristische Anion unabhängig von der Bildtabelle, ohne Formelbau als zusätzliche Kompetenz zu fordern.
  - Understanding focus (EN): Transfer from supplied ion groups to classification, testing the characteristic anion independently of the image table without requiring formula construction as an additional skill.
## Page 7: Düngemittel chemisch einordnen

- Full learning-goal ID: `1f5ee84f-245a-5a1e-a260-f960f26523e9`
- Goal fingerprint: `sha256:a0a222539be74e6452023ce4598a54238ca21fdd649fe196d0df040109ca6a15`
- Page fingerprint: `sha256:e586819e718a5880891b574531019d190431bb92faacc7eccec914688b5200a4`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann ausgewählte mineralische Düngemittel als Quellen von Nährstoffionen einordnen und anhand vorgegebener Angaben zu Pflanzenbedarf, Düngermenge und Stofftransport einen einfachen Nutzen-Risiko-Bezug begründen.

### Visualization

/assets/goal-visualizations/chemie/1f5ee84f-245a-5a1e-a260-f960f26523e9/1f5ee84f-245a-5a1e-a260-f960f26523e9.png

- original digest: `sha256:29204d030d780a41fc3f9b0dc35a75dc94c5094f6e23710b2ce98b0e851b67fb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Halogenide, Sulfate, Nitrate und Carbonate einordnen — `b5086548-169e-5d63-a14a-dabf631fa013` (page 6)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9e3e1f16558ca0da0bbb6419e871c243819373f25af71202eeff291bb606ab6d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `nutrient-ion-source`
  - Essential understanding (DE): Ausgewählte mineralische Dünger liefern konkrete Nährstoffionen, zum Beispiel NH₄⁺/NO₃⁻ oder K⁺. Düngerstoffmasse, Masse eines Nährstoffelements und tatsächlich gelöste Ionen sind verschiedene Größen. Phosphat ist eine Nährstoffkategorie; das Bild beweist keine Dominanz freien PO₄³⁻ im Boden.
  - Essential understanding (EN): Selected mineral fertilizers supply specific nutrient ions, such as NH₄⁺/NO₃⁻ or K⁺. Fertilizer mass, nutrient-element mass and dissolved ions are different quantities. Phosphate names a nutrient category; the image does not prove dominance of free PO₄³⁻ in soil.
  - Observable performance (DE): Die lernende Person ordnet vorgegebene Düngerverbindungen ihren Nährstoffionen zu und verwendet bereitgestellte Elementgehalte korrekt, statt jedes Salz als dieselbe Nährstoffquelle zu behandeln.
  - Observable performance (EN): The learner assigns supplied fertilizer compounds to their nutrient ions and uses given elemental contents correctly rather than treating every salt as the same nutrient source.
- `conditional-benefit-risk`
  - Essential understanding (DE): Nutzen und Risiko hängen von bereitgestelltem Pflanzenbedarf, Düngermenge und Stofftransport ab. Eine passende Nährstoffquelle kann Mangel begrenzen; Überschuss und Transport in Gewässer können Risiken erhöhen. Aussagen müssen die gegebenen Bedingungen und die jeweilige Ionensorte berücksichtigen.
  - Essential understanding (EN): Benefits and risks depend on supplied plant demand, dose and substance transport. A suitable nutrient source can limit deficiency; surplus and transport into waters can raise risks. Conclusions must use the given conditions and ion species.
  - Observable performance (DE): Die lernende Person verbindet konkreten Nährstoffbedarf, Dosis und bereitgestellte Transportdaten zu einer begründeten bedingten Bewertung und erklärt, weshalb mehr Dünger oder dasselbe Vorgehen auf anderem Boden nicht automatisch besser ist.
  - Observable performance (EN): The learner links specific nutrient demand, dose and supplied transport data into a reasoned conditional judgment and explains why more fertilizer or the same practice on another soil is not automatically better.

**Coverage expectations**

- required expectations: `nutrient-ion-source`, `conditional-benefit-risk`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `nutrient-demand-dose-transport`: Andere bereitgestellte mineralische Nährstoffionen, Elementgehalte, Bedarfsmengen und Boden-/Regen-/Transportdaten; lesbare Angaben ersetzen keine reale Labor-/Feldleistung. / Other supplied mineral nutrient ions, elemental contents, demands and soil/rain/transport data; legible data do not constitute actual laboratory or field performance.

**Application cases**

- `ammonium-nitrate-dose-demand`
  - Task demand (DE): Eine Modellpflanzung benötigt laut Aufgabenblatt 2,0 g Stickstoff. Der ausgewählte mineralische Dünger NH₄NO₃ liefert NH₄⁺/NO₃⁻ und enthält gegeben 35 % Stickstoff nach Masse. Vergleiche 5,0 g und 8,0 g Dünger. Es wird angegeben, dass nicht aufgenommener gelöster Stickstoff bei starkem Regen in Gewässer gelangen kann. Begründe Nutzen und Risiko ohne eine reale Düngeempfehlung oder beobachtete Pflanzenleistung zu behaupten.
  - Task demand (EN): A model planting has a supplied demand of 2.0 g nitrogen. The selected NH₄NO₃ fertilizer provides NH₄⁺/NO₃⁻ and is given as 35% nitrogen by mass. Compare 5.0 g and 8.0 g fertilizer. The task states that unabsorbed dissolved nitrogen can reach waters during heavy rain. Explain benefits and risks without claiming a real fertilization recommendation or observed plant performance.
  - Expected performance (DE): 5,0 g liefern 1,75 g N, also weniger als der vorgegebene Bedarf; 8,0 g liefern 2,80 g N, also 0,80 g über dem Bedarf. Die passende Stickstoffquelle kann den angegebenen Mangel begrenzen. Die höhere Dosis erzeugt unter den bereitgestellten Aufnahme-/Regenannahmen potenziell transportierbaren Überschuss. Eine exakte reale Verlustmenge wird ohne entsprechende Daten nicht erfunden.
  - Expected performance (EN): 5.0 g provides 1.75 g N, below the supplied demand; 8.0 g provides 2.80 g N, 0.80 g above demand. The suitable nitrogen source can limit the stated deficiency. Under the supplied uptake/rain assumptions the larger dose creates potentially transported surplus. An exact real loss is not invented without corresponding data.
  - Understanding focus (DE): Nährstoffionenquelle und mengen-/transportabhängige Bewertung.
  - Understanding focus (EN): Nutrient-ion source and a dose/transport-dependent judgment.
- `potassium-and-nitrate-transport-transfer`
  - Task demand (DE): Frisch vorgegeben: Eine Pflanzung benötigt 4,5 g K; K₂SO₄ enthält im Aufgabenmodell 45 % K und liefert K⁺/SO₄²⁻. Ein zweites Beet erhält einen Nitratdünger; die Tabelle weist für Boden A starken Nitrattransport bei Regen, für B geringeren Transport aus. Ordne die Nährstoffquellen zu, prüfe 10,0 g K₂SO₄ für den K-Bedarf und erkläre, warum dieselbe Nitratdosis auf A/B unterschiedliche Risiken haben kann. Alle Transportangaben stehen lesbar im Aufgabenblatt.
  - Task demand (EN): Fresh data state a demand of 4.5 g K; the task model gives K₂SO₄ as 45% K supplying K⁺/SO₄²⁻. Another plot receives nitrate fertilizer; a table shows strong nitrate transport in rain on soil A and less on B. Assign nutrient sources, evaluate 10.0 g K₂SO₄ for K demand and explain why the same nitrate dose can have different risks on A/B. All transport data are legible on the task sheet.
  - Expected performance (DE): 10,0 g des vorgegebenen Düngers liefern 4,5 g K und entsprechen dem Modellbedarf; K₂SO₄ ist keine Stickstoffquelle. Der Nitratfall betrifft eine andere Nährstoffionenquelle. Gleiche Dosis und Bedarf bestimmen nicht allein das Gewässerrisiko: nach Tabelle ist auf A mehr Nitrattransport möglich. Aus dem Bild oder Gruppennamen wird keine allgemeine Transport- oder Risikogleichheit aller Ionen abgeleitet.
  - Expected performance (EN): 10.0 g of the supplied fertilizer provides 4.5 g K and matches the model demand; K₂SO₄ is not a nitrogen source. The nitrate case involves another nutrient-ion source. Equal dose and demand do not alone determine aquatic risk: the table permits greater nitrate transport on A. Neither the image nor category names imply equal transport or risk for all ions.
  - Understanding focus (DE): Frische Verbindung, andere Nährstoffgröße und bedingter Transporttransfer.
  - Understanding focus (EN): Fresh compound, another nutrient quantity and conditional transport transfer.
## Page 8: Gipsbildung bei Rauchgaswäsche deuten

- Full learning-goal ID: `414489cb-453e-5de4-ab0f-0fc01175e522`
- Goal fingerprint: `sha256:09b0403cc7266fc45af14b88192eaf53fc50c5de6d78b915f789874cccd66973`
- Page fingerprint: `sha256:4363fb5de664d89093ca8feeb869b80e2e7b413daf8406281f8f55c973d1c41f`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann an einem vereinfachten Schema der kalkhaltigen Rauchgaswäsche erklären, wie Schwefeldioxid unter Beteiligung von Oxidation als Sulfat im Gips gebunden wird.

### Visualization

/assets/goal-visualizations/chemie/414489cb-453e-5de4-ab0f-0fc01175e522/414489cb-453e-5de4-ab0f-0fc01175e522.jpg

- original digest: `sha256:82054f2a141d0e0c18058bfccc8548a49a0ff811d9ba8667afc428820005b7a1`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Halogenide, Sulfate, Nitrate und Carbonate einordnen — `b5086548-169e-5d63-a14a-dabf631fa013` (page 6)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d7aa40a328baffd39651fcbab3cf6007b04e6fe6f579ab7fa69c2b9fe2ba53a9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `capture-oxidation-gypsum`
  - Essential understanding (DE): Kalkhaltige Rauchgaswäsche bindet SO₂ aus dem Gasstrom in einer kalkhaltigen Suspension. Das vereinfachte Schema unterscheidet Aufnahme/Neutralisation, Oxidation des aufgenommenen Schwefel(IV)-Anteils zu Sulfat und Bindung mit Calcium als Gips CaSO₄·2H₂O. Oxidation gehört zum chemischen Weg.
  - Essential understanding (EN): Lime-based flue-gas scrubbing captures SO₂ from the gas stream in a lime-containing suspension. The simplified scheme distinguishes uptake/neutralization, oxidation of the captured sulfur(IV) component to sulfate and binding with calcium as gypsum CaSO₄·2H₂O. Oxidation is part of the chemical pathway.
  - Observable performance (DE): Die lernende Person verfolgt im bereitgestellten Schema den Schwefel vom SO₂ bis zum Sulfat/Gips, erklärt die Rollen von Kalk und Oxidationsmittel und unterscheidet Zwischenprodukt und Endprodukt.
  - Observable performance (EN): The learner tracks sulfur through the supplied scheme from SO₂ to sulfate/gypsum, explains the roles of lime and oxidant, and distinguishes intermediate and final products.
- `simplified-scheme-limits`
  - Essential understanding (DE): Ein SO₂-Absorber allein beweist weder vollständige Sulfatbildung noch einen Oxidationsschritt. Das Lernbild ist ein qualitatives vereinfachtes Schema; genaue Prozessausbeuten und selbst durchgeführte Anlagen-/Laborleistung sind daraus nicht ableitbar.
  - Essential understanding (EN): An SO₂ absorber alone proves neither complete sulfate formation nor an oxidation step. The learning image is a qualitative simplified scheme; precise process yields and personally performed plant/laboratory work cannot be inferred from it.
  - Observable performance (DE): Die lernende Person erklärt anhand neuer gegebener Prozessinformationen, weshalb die Oxidationsstufe und geeignete Calcium-/Wasserbedingungen für den angegebenen Gipsweg benötigt werden und korrigiert eine rein physikalische Filterdeutung.
  - Observable performance (EN): Using fresh supplied process information, the learner explains why the oxidation stage and suitable calcium/water conditions are needed for the given gypsum pathway and corrects a purely physical filtration account.

**Coverage expectations**

- required expectations: `capture-oxidation-gypsum`, `simplified-scheme-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `reagent-and-oxidation-stage`: Ca(OH)₂ oder ausdrücklich vorgegebenes CaCO₃, mit/ohne dokumentierte Sauerstoffstufe; Teil- und Gesamtschemata. / Ca(OH)₂ or explicitly supplied CaCO₃, with or without a documented oxygen stage; partial and overall schemes.

**Application cases**

- `hydroxide-two-stage-scheme`
  - Task demand (DE): Das Aufgabenblatt liefert Ca(OH)₂ + SO₂ → CaSO₃ + H₂O und 2 CaSO₃ + O₂ + 4 H₂O → 2 CaSO₄·2H₂O als vereinfachtes Schema. Schwefel liegt im Sulfit als IV, im Sulfat als VI vor. Erkläre den Weg vom Abgas zum Gips und die Rolle des zugeführten Sauerstoffs. Die Gleichungen werden bereitgestellt; selbstständige Gesamtbilanzierung ist keine zusätzliche Pflicht dieses Ziels.
  - Task demand (EN): The task supplies Ca(OH)₂ + SO₂ → CaSO₃ + H₂O and 2 CaSO₃ + O₂ + 4 H₂O → 2 CaSO₄·2H₂O as a simplified scheme. Sulfur is IV in sulfite and VI in sulfate. Explain the pathway from flue gas to gypsum and the role of added oxygen. The equations are supplied; independent overall balancing is not an additional requirement.
  - Expected performance (DE): SO₂ wird durch die kalkhaltige Suspension aufgenommen und zunächst als Sulfit erfasst. Sauerstoff ermöglicht die vorgegebene Oxidation zum Sulfat; Calcium und Kristallwasser gehören zum Gips. Sulfit und Gips werden nicht als derselbe Stoff behandelt; SO₂ wird chemisch gebunden statt nur mechanisch zurückgehalten.
  - Expected performance (EN): The lime suspension captures SO₂ initially as sulfite. Oxygen enables the specified oxidation to sulfate; calcium and crystal water are part of gypsum. Sulfite and gypsum are not treated as the same substance; SO₂ is chemically bound rather than merely mechanically retained.
  - Understanding focus (DE): Chemischer Stoffpfad mit sichtbarer Oxidation.
  - Understanding focus (EN): Chemical material pathway with explicit oxidation.
- `carbonate-oxidation-transfer`
  - Task demand (DE): Eine neue Anlage verwendet ausdrücklich CaCO₃ und führt Sauerstoff zu. Gegeben ist CaCO₃ + SO₂ + ½ O₂ + 2 H₂O → CaSO₄·2H₂O + CO₂ sowie eine unvollständige Darstellung, die nur Aufnahme zeigt. Erkläre Sulfat-/Gipsbildung, die Herkunft des CO₂ und was ohne Oxidationsinformation noch nicht gezeigt ist.
  - Task demand (EN): A new plant explicitly uses CaCO₃ and adds oxygen. Given CaCO₃ + SO₂ + ½ O₂ + 2 H₂O → CaSO₄·2H₂O + CO₂ and an incomplete drawing showing uptake only, explain sulfate/gypsum formation, the origin of CO₂, and what remains unshown without oxidation information.
  - Expected performance (DE): Calcium stammt aus dem vorgegebenen Carbonat, der Schwefel aus SO₂; Sauerstoff trägt den oxidierenden Übergang zu Sulfat. Das Carbonat liefert den Kohlenstoff des CO₂; SO₂ wird nicht in CO₂ umgewandelt. Der Pfeil Aufnahme allein zeigt die Sulfatbildung nicht. Die bereitgestellte neue Stoffroute wird übertragen, ohne den technischen Gesamtprozess vollständig zu behaupten.
  - Expected performance (EN): Calcium comes from the supplied carbonate and sulfur from SO₂; oxygen supports oxidation to sulfate. Carbonate supplies the carbon in CO₂; SO₂ is not converted into CO₂. Uptake alone does not demonstrate sulfate formation. The fresh material route is interpreted without claiming a complete technical-process model.
  - Understanding focus (DE): Transfer auf anderen Kalkträger und Prüfung einer Darstellungsgrenze.
  - Understanding focus (EN): Transfer to another calcium reagent and checking a representation limit.
## Page 9: Nernst-Gleichung auf galvanische Zellen anwenden (LK)

- Full learning-goal ID: `b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b`
- Goal fingerprint: `sha256:7ffc7d03af4a4c0989b9977d60958de3e25ab890387934a4836b5141e5a902d9`
- Page fingerprint: `sha256:96f83c69325e161c7d1e91d3bff6320c90d7d7dc363343048d76c34e8105f45c`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Nernst-Gleichung auf galvanische Zellen, insbesondere Konzentrationszellen, anwenden, Zellspannungen unter Nichtstandardbedingungen berechnen und Aussagen zur Zellspannung begründen.

### Visualization

/assets/goal-visualizations/chemie/b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b/b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b.jpg

- original digest: `sha256:ded9575cf60295f88cf0955533f44a041a499dc3c697eed0744e7132f8844b6f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Spannungsreihen nutzen — `8be14f15-2258-58e6-ae4e-38953f5d0570` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Standardpotenziale und Nernst-Beziehung abrufen — `d9bd6482-ef18-51d2-860b-facc6095793b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:737b71657cc4b4a01d7762763df70ff066470183c2d4f814159036a96e3d401a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Die reversible Zellspannung folgt aus stöchiometrischem Q und Elektronenzahl n.
  - Essential understanding (EN): Reversible cell voltage follows stoichiometric Q and electron number n.
  - Observable performance (DE): eqrk16-04-a: Polung und Nettoionentransfer mit Halbgleichungen herleiten. eqrk16-04-b: Stöchiometrisches Q und 1,04084 V erklären.
  - Observable performance (EN): eqrk16-04-a: Derive polarity and net ionic transfer from half-reactions. eqrk16-04-b: Explain stoichiometric Q and 1.04084 V.
- `e2`
  - Essential understanding (DE): Konzentrationszellen gewinnen Arbeit beim Ausgleich chemischer Potenziale; gleiche Metalle bedeuten nicht immer E=0.
  - Essential understanding (EN): Concentration cells deliver work while chemical potentials equalise; identical metals do not always give E=0.
  - Observable performance (DE): eqrk16-04-a: Q=0,0100 und 59,16 mV konsistent berechnen. eqrk16-04-b: Skalierungsinvarianz mit Q²/n′ zeigen.
  - Observable performance (EN): eqrk16-04-a: Calculate Q=0.0100 and 59.16 mV consistently. eqrk16-04-b: Show scaling invariance using Q²/n′.
- `e3`
  - Essential understanding (DE): Aktivitätsnäherung, Flüssigkeitsgrenzpotenzial und Lastverluste begrenzen eine Konzentrationsrechnung.
  - Essential understanding (EN): Activity approximations, liquid-junction potential and load losses limit a concentration calculation.
  - Observable performance (DE): eqrk16-04-a: Ratioänderung von gemeinsamer Skalierung und Lastverlusten trennen. eqrk16-04-b: Reversible Spannung von unbekannten Lastverlusten abgrenzen und die Cu2+-Konzentration im frischen Metall/Metallion-Fall aus dem Leerlaufmesswert mit der gegebenen Idealnäherung bestimmen.
  - Observable performance (EN): eqrk16-04-a: Separate ratio changes, common scaling, and load loss. eqrk16-04-b: Distinguish reversible voltage from unknown load losses and determine Cu2+ concentration in the fresh metal/metal-ion case from the open-circuit reading using the stated ideal approximation.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-04-a-transfer`: Ein ligandhaltiges rechtes Gefäß besitzt gleiche Gesamtkupferkonzentration wie links, aber zehnfach kleinere freie Cu2+-Aktivität. Bestimme ohne Bild die neue Anode und begründe, warum Gesamtgehalt nicht in Q eingesetzt werden darf. / The right vessel contains a ligand and the same total copper as the left, but tenfold lower free Cu2+ activity. Locate the new anode without a diagram and explain why total copper cannot replace free activity in Q.
- `eqrk16-04-b-transfer`: Eine neue Daniell-Modellzelle bei 25 °C liefert den fiktiven, korrigierten hochohmigen Leerlaufmesswert U(Cu minus Zn) = +1,07042 V. Es gelten E° = 1,100 V, n = 2, c(Zn2+) = 0,100 mol/L und c° = 1 mol/L. Für alle gelösten Ionen wird a_i = c_i/c° angenähert; reine Metalle haben Aktivität 1, Grenzpotenziale werden vernachlässigt. Bestimme die unbekannte Cu2+-Konzentration aus dem Spannungswert und begründe, warum der Lastwert 1,000 V aus der Hauptaufgabe dafür nicht ohne weitere Daten geeignet wäre. Die Daten sind ein Lehrmodell, keine tatsächlich ausgeführte Messung. / A new Daniell model cell at 25 °C gives the fictional, corrected high-impedance open-circuit reading U(Cu minus Zn) = +1.07042 V. Use E° = 1.100 V, n = 2, c(Zn2+) = 0.100 mol/L and c° = 1 mol/L. Approximate every dissolved-ion activity as a_i = c_i/c°; pure metals have unit activity and junction potentials are neglected. Determine the unknown Cu2+ concentration from the voltage and explain why the main task’s loaded reading of 1.000 V cannot be used for that purpose without further data. These are teaching-model data, not an actually performed measurement.

**Application cases**

- `eqrk16-04-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-04-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Leite Polung, Teilreaktionen, Q und positive Leerlaufspannung her. Erkläre auf Teilchenebene, wie sich beide Aktivitäten bei Stromabgabe verändern. Untersuche das Vertauschen der Lösungen und die Verdopplung beider Aktivitäten.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-04-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Derive polarity, half-reactions, Q and positive open-circuit voltage. Explain how both activities change during discharge. Investigate swapping solutions and doubling both activities.
  - Expected performance (DE): Links Anode: Cu→Cu2++2e−; rechts Kathode: Cu2++2e−→Cu. Gesamt wird Cu2+ rechts nach links übertragen; Q=a(links)/a(rechts)=0,0100, E°(Zelle)=0. E=−0,05916/2·logQ=+0,05916V. Links steigt gelöstes Cu2+, rechts sinkt es; der Aktivitätsunterschied nimmt ab. Lösungstausch kehrt die Polung relativ zu festen Kabeln um; gemeinsames Verdoppeln lässt das Verhältnis und ideal E unverändert. Elektronen fließen außen von links nach rechts; die Salzbrücke trägt Ionen. E ist keine Stromstärke oder Dauerlastspannung.
  - Expected performance (EN): Left anode: Cu→Cu2++2e−; right cathode: Cu2++2e−→Cu. Net transfer moves Cu2+ from right to left; Q=aLeft/aRight=0.0100 and cell E°=0. E=−0.05916/2·logQ=+0.05916V. Dissolved Cu2+ increases on the left and decreases on the right, reducing the activity difference. Swapping solutions reverses polarity at fixed leads; doubling both activities preserves the ratio and ideal E. Electrons flow externally left to right; the bridge carries ions. E is neither current nor loaded voltage.
  - Understanding focus (DE): Ein ligandhaltiges rechtes Gefäß besitzt gleiche Gesamtkupferkonzentration wie links, aber zehnfach kleinere freie Cu2+-Aktivität. Bestimme ohne Bild die neue Anode und begründe, warum Gesamtgehalt nicht in Q eingesetzt werden darf.
  - Understanding focus (EN): The right vessel contains a ligand and the same total copper as the left, but tenfold lower free Cu2+ activity. Locate the new anode without a diagram and explain why total copper cannot replace free activity in Q.
- `eqrk16-04-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json #eqrk16-04-b; sha256:c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e. Berechne reversible Spannung und erkläre den Konzentrationseinfluss. Beweise, dass Verdopplung der Reaktionsgleichung E nicht verdoppelt. Prüfe, ob die Abweichung des Lastmesswerts die Nernst-Gleichung widerlegt und welche zusätzliche Messung sinnvoll wäre.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json #eqrk16-04-b; sha256:c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e. Calculate reversible voltage and explain the concentration effect. Show that doubling the chemical equation does not double E. Assess whether the loaded value disproves Nernst and identify a useful additional measurement.
  - Expected performance (DE): Q=100; E=1,100−(0,05916/2)·2=1,04084V. Produkt-Zn2+ relativ hoch und Akzeptor-Cu2+ niedrig vermindern den thermodynamischen Antrieb gegenüber Standardzuständen. Doppelte Gleichung hat Q′=Q² und n′=4; logQ′/n′=logQ/2, E bleibt gleich. Die fehlenden 40,84 mV unter Last können aus ohmschen und kinetischen/Transportverlusten stammen; aus nur diesem Wert folgt keine eindeutige Ursache. Hochohmige Leerlaufmessung bei kontrollierter Temperatur und Aktivitäten sowie Strom/Spannungs-Kennlinie trennen Modell- und Lastfragen. Keine universelle Fehlerfreiheit realer Grenzflächen unterstellen. Frischer inverser Transfer: log Q = (1,100 − 1,07042)/(0,05916/2) = 1, also Q = 10. Mit Q = a(Zn2+)/a(Cu2+) und der gegebenen Idealnäherung folgt c(Cu2+) = 0,100/10 = 0,0100 mol/L. Die bekannte metallische Paarung und Reaktionsrichtung bleiben erhalten; nun wird die unbekannte Ionenkonzentration aus einem vorgegebenen Leerlaufmesswert bestimmt. Der unbekannte Lastverlust der Hauptaufgabe verhindert dieselbe Inversion ihres Lastwerts. Ein realer Messnachweis müsste Temperatur, Polung, Kalibrierung und Grenzpotenziale kontrollieren; der fiktive Zahlenwert belegt keine Durchführung.
  - Expected performance (EN): Q=100; E=1.100−(0.05916/2)·2=1.04084V. High relative product Zn2+ and low acceptor Cu2+ reduce the thermodynamic driving force. Doubling gives Q′=Q² and n′=4, preserving logQ′/n′ and hence E. The 40.84 mV loaded deficit may reflect ohmic, kinetic or transport losses; one value does not identify the cause. A high-impedance open-circuit measurement at controlled temperature/activities and a current-voltage curve separate equilibrium and load questions. Fresh inverse transfer: log Q = (1.100 − 1.07042)/(0.05916/2) = 1, hence Q = 10. With Q = a(Zn2+)/a(Cu2+) and the stated ideal approximation, c(Cu2+) = 0.100/10 = 0.0100 mol/L. The metal/metal-ion pairing and reaction direction are retained; the unknown ion concentration is now inferred from a supplied open-circuit reading. The main task’s unknown load losses prevent the same inversion of its loaded value. An actual measurement would need controlled temperature, polarity, calibration and junction potentials; the fictional number proves no experimental conduct.
  - Understanding focus (DE): Eine neue Daniell-Modellzelle bei 25 °C liefert den fiktiven, korrigierten hochohmigen Leerlaufmesswert U(Cu minus Zn) = +1,07042 V. Es gelten E° = 1,100 V, n = 2, c(Zn2+) = 0,100 mol/L und c° = 1 mol/L. Für alle gelösten Ionen wird a_i = c_i/c° angenähert; reine Metalle haben Aktivität 1, Grenzpotenziale werden vernachlässigt. Bestimme die unbekannte Cu2+-Konzentration aus dem Spannungswert und begründe, warum der Lastwert 1,000 V aus der Hauptaufgabe dafür nicht ohne weitere Daten geeignet wäre. Die Daten sind ein Lehrmodell, keine tatsächlich ausgeführte Messung.
  - Understanding focus (EN): A new Daniell model cell at 25 °C gives the fictional, corrected high-impedance open-circuit reading U(Cu minus Zn) = +1.07042 V. Use E° = 1.100 V, n = 2, c(Zn2+) = 0.100 mol/L and c° = 1 mol/L. Approximate every dissolved-ion activity as a_i = c_i/c°; pure metals have unit activity and junction potentials are neglected. Determine the unknown Cu2+ concentration from the voltage and explain why the main task’s loaded reading of 1.000 V cannot be used for that purpose without further data. These are teaching-model data, not an actually performed measurement.
## Page 10: Friedel-Crafts-Reaktionen

- Full learning-goal ID: `b7b5df21-78f3-5408-89f1-36deed450695`
- Goal fingerprint: `sha256:a96265aa87dbfebf1a25bbcb90c9e771d0795c27079491567a800638d59bc8b7`
- Page fingerprint: `sha256:bbb287e8f81107a5a0172069ed65f0c19b782aa1b905f8631a52a010ed87a153`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Friedel-Crafts-Alkylierungen und -Acylierungen mechanistisch begründet planen und Einflüsse von Substrat und Reaktionsbedingungen auf Umlagerungen, Mehrfachsubstitution und Produktselektivität beurteilen.

### Visualization

/assets/goal-visualizations/chemie/b7b5df21-78f3-5408-89f1-36deed450695/b7b5df21-78f3-5408-89f1-36deed450695.jpg

- original digest: `sha256:3b01df98f2b4450b6dac3d5e334ab6a193a73b81c1036eef4966f0cbe0410587`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- σ-Komplex-Mechanismus — `3dbd84de-51cb-5ff7-801b-077a54520fed` (outside this book)

### Direct reverse prerequisites outside this book

- Aromatische Seitenketten durch Routenvergleich planen — `b0ebce3a-eeed-5bf6-ae5e-e0cba5628e43` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c3c9d48c649323c4a7cfe427846589c0474f3a2eb59b75e2d1a044466ef9f767`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `b7b5df21-whole-1`
  - Essential understanding (DE): Alkylierung und Acylierung sind EAS-Routen mit unterschiedlichen Folgen für Umlagerung, Aktivierung und Mehrfachsubstitution.
  - Essential understanding (EN): Alkylation and acylation are EAS routes with different consequences for rearrangement, activation and multiple substitution.
  - Observable performance (DE): 1. Vergleiche beide Routen hinsichtlich Kohlenstoffgerüst und Umlagerung; plane die passende Route mit Zwischenprodukt und Elektronenpaarwegen der elektrophilen Ringstufe.
2. Erkläre die Gefahr der Mehrfachalkylierung in A sowie die geringere Zweitacylierung in B; begründe Lewis-Säure-Bedarf und die Rolle der Nachbehandlung. Erwartet: 1. B ist kontrollierbarer: CH₃CH₂CO⁺ (Acylium, R–C≡O⁺↔R–C⁺=O) wird ohne Alkylumlagerung am Ring angegriffen; Ring-π→Acyl-C, ein C≡O-π-Paar→O, positiver σ-Komplex, dann Protonenabgabe. Ph–COCH₂CH₃ wird anschließend zu Ph–CH₂CH₂CH₃ reduziert. A kann durch Umlagerung Isopropylbenzol ergeben.
2. Ein Alkylrest aktiviert den Ring, sodass weitere Alkylierung möglich ist. Der Acylrest desaktiviert und vermindert weitere elektrophile Substitution. AlCl₃ aktiviert das Chlorid und komplexiert das Ketonprodukt; deshalb ist Acylierung nicht pauschal nur katalytisch im AlCl₃-Bedarf. Die Nachbehandlung löst den Produktkomplex; Reduktion ist ein getrennter Schritt.
  - Observable performance (EN): 1. Compare both routes in carbon framework and rearrangement; plan the suitable route with intermediate product and electron-pair movement in the electrophilic ring step.
2. Explain multiple-alkylation risk in A and reduced second acylation in B; justify Lewis-acid demand and the role of workup. Expected: 1. B is more controllable: CH₃CH₂CO⁺ (acylium, R–C≡O⁺↔R–C⁺=O) undergoes ring attack without alkyl rearrangement; ring pi→acyl C, one C≡O pi pair→O, positive sigma complex, then proton loss. Ph–COCH₂CH₃ is subsequently reduced to Ph–CH₂CH₂CH₃. A may rearrange to give isopropylbenzene.
2. An alkyl group activates the ring, allowing further alkylation. An acyl group deactivates and reduces further electrophilic substitution. AlCl₃ activates the chloride and complexes the ketone product, so acylation must not be assumed universally catalytic in AlCl₃ demand. Workup releases the product complex; reduction is a separate step.
- `b7b5df21-whole-2`
  - Essential understanding (DE): Die Routenplanung verbindet Gerüst, Elektrophil, Regioselektivität, Komplexierung und gegebenenfalls eine getrennte Carbonylreduktion.
  - Essential understanding (EN): Route planning connects skeleton, electrophile, regioselectivity, complexation and, where appropriate, a separate carbonyl reduction.
  - Observable performance (DE): 1. Entscheide, welches Substrat eine plausible klassische Friedel-Crafts-Acylierung erlaubt; plane Elektrophilbildung, σ-Komplex und Rearomatisierung sowie plausible Positionsisomere.
2. Begründe das Hindernis bei Nitrobenzol und erläutere, wie Acylierung gegenüber Alkylierung Umlagerung und Mehrfachsubstitution begrenzt; nenne eine Grenze exakter Selektivitätsplanung. Erwartet: 1. Anisol ist der plausible Kandidat. CH₃COCl+AlCl₃ liefert formal CH₃CO⁺+AlCl₄⁻; Ring-π greift Acyl-C an, bei Dreifachbindungsdarstellung geht ein C≡O-Paar zu O. Positiver σ-Komplex wird deprotoniert, AlCl₄⁻ liefert HCl/AlCl₃. ortho-/para-Methoxyacetophenon sind plausible Produkte; exakte Anteile sind offen.
2. Nitrobenzol ist für klassische Friedel-Crafts stark zu wenig reaktiv. Acylium besitzt keine gewöhnliche Alkylkation-Umlagerung; das gebildete Acylprodukt deaktiviert gegenüber weiteren Substitutionen. Ohne konkrete Temperatur, Komplexierungs- und Produktdaten ist keine exakte ortho/para-Ausbeute festgelegt.
  - Observable performance (EN): 1. Decide which substrate permits plausible classical Friedel-Crafts acylation; plan electrophile generation, sigma complex and rearomatization with plausible positional isomers.
2. Explain the obstacle for nitrobenzene and how acylation limits rearrangement and multiple substitution compared with alkylation; state one limit to exact selectivity planning. Expected: 1. Anisole is plausible. CH₃COCl+AlCl₃ formally gives CH₃CO⁺+AlCl₄⁻; ring pi attacks acyl C and, in the triple-bond contributor, one C≡O pair moves to O. The positive sigma complex deprotonates; AlCl₄⁻ gives HCl/AlCl₃. ortho-/para-methoxyacetophenone are plausible products; exact proportions remain open.
2. Nitrobenzene is too strongly deactivated for classical Friedel-Crafts. Acylium does not undergo ordinary alkyl-cation rearrangement; the acyl product deactivates further substitution. Without specific temperature, complexation and product data no exact ortho/para yield is fixed.

**Coverage expectations**

- required expectations: `b7b5df21-whole-1`, `b7b5df21-whole-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-material-or-source`: Stoff, Methodenbedingung oder Quelle unabhängig variieren. / Independently vary substance, method condition or source.
- `genuine-transfer-and-limit`: Frischen Transfer und tatsächliche Aussagegrenzen erklären; Modellwerte sind keine Eigenleistung. / Explain fresh transfer and actual inference limits; model values are not own performance.

**Application cases**

- `b7b5df21-case-1-current-whole`
  - Task demand (DE): Papier-Syntheseplanung; keine Ausführung. Ziel Ph–CH₂CH₂CH₃ aus Benzol. Optionen: A 1-Chlorpropan/AlCl₃; B Propanoylchlorid CH₃CH₂COCl/AlCl₃ mit anschließender geeigneter Carbonylreduktion zum CH₂. Im Modell kann primäres Alkyl-Elektrophil zu sekundärem umlagern; Arylketone deaktivieren den Ring. 1. Vergleiche beide Routen hinsichtlich Kohlenstoffgerüst und Umlagerung; plane die passende Route mit Zwischenprodukt und Elektronenpaarwegen der elektrophilen Ringstufe.
2. Erkläre die Gefahr der Mehrfachalkylierung in A sowie die geringere Zweitacylierung in B; begründe Lewis-Säure-Bedarf und die Rolle der Nachbehandlung. Transfer: Frisches Ziel ist n-Butylbenzol. Gegeben sind 1-Chlorbutan oder Butanoylchlorid mit nachfolgender geeigneter Carbonylreduktion. Plane den kontrollierbareren Gerüstaufbau.
  - Task demand (EN): Paper synthesis planning; no execution. Target Ph–CH₂CH₂CH₃ from benzene. Options: A 1-chloropropane/AlCl₃; B propanoyl chloride CH₃CH₂COCl/AlCl₃ followed by suitable carbonyl reduction to CH₂. In the model a primary alkyl electrophile can rearrange to secondary; aryl ketones deactivate the ring. 1. Compare both routes in carbon framework and rearrangement; plan the suitable route with intermediate product and electron-pair movement in the electrophilic ring step.
2. Explain multiple-alkylation risk in A and reduced second acylation in B; justify Lewis-acid demand and the role of workup. Transfer: The fresh target is n-butylbenzene. Given 1-chlorobutane or butanoyl chloride followed by suitable carbonyl reduction, plan the more controllable skeleton construction.
  - Expected performance (DE): 1. B ist kontrollierbarer: CH₃CH₂CO⁺ (Acylium, R–C≡O⁺↔R–C⁺=O) wird ohne Alkylumlagerung am Ring angegriffen; Ring-π→Acyl-C, ein C≡O-π-Paar→O, positiver σ-Komplex, dann Protonenabgabe. Ph–COCH₂CH₃ wird anschließend zu Ph–CH₂CH₂CH₃ reduziert. A kann durch Umlagerung Isopropylbenzol ergeben.
2. Ein Alkylrest aktiviert den Ring, sodass weitere Alkylierung möglich ist. Der Acylrest desaktiviert und vermindert weitere elektrophile Substitution. AlCl₃ aktiviert das Chlorid und komplexiert das Ketonprodukt; deshalb ist Acylierung nicht pauschal nur katalytisch im AlCl₃-Bedarf. Die Nachbehandlung löst den Produktkomplex; Reduktion ist ein getrennter Schritt. Transfer: Butanoylchlorid liefert Ph–CO–CH₂CH₂CH₃ und nach der gegebenen Reduktion Ph–CH₂CH₂CH₂CH₃. Vier Seitenketten-C bleiben erhalten. Direkte primäre Alkylierung kann umlagern und mehrfach substituieren. Es wird keine reine Produktbildung oder Laborausbeute garantiert.
  - Expected performance (EN): 1. B is more controllable: CH₃CH₂CO⁺ (acylium, R–C≡O⁺↔R–C⁺=O) undergoes ring attack without alkyl rearrangement; ring pi→acyl C, one C≡O pi pair→O, positive sigma complex, then proton loss. Ph–COCH₂CH₃ is subsequently reduced to Ph–CH₂CH₂CH₃. A may rearrange to give isopropylbenzene.
2. An alkyl group activates the ring, allowing further alkylation. An acyl group deactivates and reduces further electrophilic substitution. AlCl₃ activates the chloride and complexes the ketone product, so acylation must not be assumed universally catalytic in AlCl₃ demand. Workup releases the product complex; reduction is a separate step. Transfer: Butanoyl chloride gives Ph–CO–CH₂CH₂CH₃ and, under the stipulated reduction, Ph–CH₂CH₂CH₂CH₃. All four side-chain carbons remain. Direct primary alkylation may rearrange and multiply substitute. No pure product or laboratory yield is guaranteed.
  - Understanding focus (DE): Ganzes aktuelles oder gezielt korrigiertes Ziel; prospektiver Entwurf ohne beobachtete Leistung oder Quellen-/Kurs-/Humanfreigabe.
  - Understanding focus (EN): Whole current or specifically corrected goal; prospective design without observed performance or source, course or human approval.
- `b7b5df21-case-2-current-whole`
  - Task demand (DE): Papiervergleich: Anisol und Nitrobenzol sollen mit CH₃COCl/AlCl₃ zu Ring-Acetylprodukten umgesetzt werden. Anisol ist ortho/para-aktiviert; Nitrobenzol ist stark desaktiviert. Lewis-Säure-Komplexierung kann die Selektivität beeinflussen; konkrete Ausbeuten sind nicht gegeben. 1. Entscheide, welches Substrat eine plausible klassische Friedel-Crafts-Acylierung erlaubt; plane Elektrophilbildung, σ-Komplex und Rearomatisierung sowie plausible Positionsisomere.
2. Begründe das Hindernis bei Nitrobenzol und erläutere, wie Acylierung gegenüber Alkylierung Umlagerung und Mehrfachsubstitution begrenzt; nenne eine Grenze exakter Selektivitätsplanung. Transfer: Für Anisol ist ein fiktives ortho/para-Verhältnis 65:35 unter Bedingung A gegeben. Unter veränderter Lewis-Säure-Menge B fehlen Daten. Begründe die Grenze einer exakten Selektivitätsvorhersage.
  - Task demand (EN): Paper comparison: anisole and nitrobenzene are proposed for ring acetylation with CH₃COCl/AlCl₃. Anisole is ortho/para-activated; nitrobenzene is strongly deactivated. Lewis-acid complexation can affect selectivity; actual yields are not given. 1. Decide which substrate permits plausible classical Friedel-Crafts acylation; plan electrophile generation, sigma complex and rearomatization with plausible positional isomers.
2. Explain the obstacle for nitrobenzene and how acylation limits rearrangement and multiple substitution compared with alkylation; state one limit to exact selectivity planning. Transfer: For anisole, a fictional ortho/para ratio of 65:35 is given under condition A. Data are absent at changed Lewis-acid amount B. Explain the limit of an exact selectivity prediction.
  - Expected performance (DE): 1. Anisol ist der plausible Kandidat. CH₃COCl+AlCl₃ liefert formal CH₃CO⁺+AlCl₄⁻; Ring-π greift Acyl-C an, bei Dreifachbindungsdarstellung geht ein C≡O-Paar zu O. Positiver σ-Komplex wird deprotoniert, AlCl₄⁻ liefert HCl/AlCl₃. ortho-/para-Methoxyacetophenon sind plausible Produkte; exakte Anteile sind offen.
2. Nitrobenzol ist für klassische Friedel-Crafts stark zu wenig reaktiv. Acylium besitzt keine gewöhnliche Alkylkation-Umlagerung; das gebildete Acylprodukt deaktiviert gegenüber weiteren Substitutionen. Ohne konkrete Temperatur, Komplexierungs- und Produktdaten ist keine exakte ortho/para-Ausbeute festgelegt. Transfer: Methoxyaktivierung und mögliche Komplexierung bleiben relevant; die Änderung kann Selektivität beeinflussen. 65:35 ist kein unveränderlicher Stoffwert. B benötigt geeignete neue Produkt- und Bedingungsdaten. Eine begründete Routenwahl bestimmt nicht automatisch ein exaktes Isomerenverhältnis.
  - Expected performance (EN): 1. Anisole is plausible. CH₃COCl+AlCl₃ formally gives CH₃CO⁺+AlCl₄⁻; ring pi attacks acyl C and, in the triple-bond contributor, one C≡O pair moves to O. The positive sigma complex deprotonates; AlCl₄⁻ gives HCl/AlCl₃. ortho-/para-methoxyacetophenone are plausible products; exact proportions remain open.
2. Nitrobenzene is too strongly deactivated for classical Friedel-Crafts. Acylium does not undergo ordinary alkyl-cation rearrangement; the acyl product deactivates further substitution. Without specific temperature, complexation and product data no exact ortho/para yield is fixed. Transfer: Methoxy activation and possible complexation remain relevant; the change may affect selectivity. 65:35 is not an invariant substance value. B needs suitable new product and condition data. A reasoned route choice does not automatically determine an exact isomer ratio.
  - Understanding focus (DE): Ganzes aktuelles oder gezielt korrigiertes Ziel; prospektiver Entwurf ohne beobachtete Leistung oder Quellen-/Kurs-/Humanfreigabe.
  - Understanding focus (EN): Whole current or specifically corrected goal; prospective design without observed performance or source, course or human approval.
## Page 11: Halogenierung und Nitrierung am Aromaten beschreiben

- Full learning-goal ID: `b98f89e2-39f3-595b-9653-83e9412eecd1`
- Goal fingerprint: `sha256:ebaf8e7982d77b1ae7d04e11d5af1694beda62adbfcf24c42dfaa7104fbddc88`
- Page fingerprint: `sha256:5306efa5a27361c36cb38ef2e2660c138bf523c8e7e5758da79539b59ab5f164`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann elektrophile Substitutionen am Aromaten am Beispiel von Halogenierung und Nitrierung mechanistisch erläutern und Reaktionsbedingungen diskutieren.

### Visualization

/assets/goal-visualizations/chemie/b98f89e2-39f3-595b-9653-83e9412eecd1/b98f89e2-39f3-595b-9653-83e9412eecd1.jpg

- original digest: `sha256:007ba7a5453764fd4920c447b20694b788f69814c7c1d1b9b71e5937e4626b3e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Benzolstruktur deuten — `4bdbdf32-3021-5a0a-b412-b611166b2d21` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- σ-Komplex-Mechanismus — `3dbd84de-51cb-5ff7-801b-077a54520fed` (outside this book)
- Dirigierende Effekte analysieren (LK) — `d61ce84f-1d0d-555f-be05-aedb589225ce` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1a21ea3e0e8e694c299c9c94f920e8ce27f5611f97586f71291cf2a1fef92838`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Halogenierung und Nitrierung am Benzol verlaufen über Elektrophilbildung, σ-Komplex und rearomatisierende Deprotonierung.
  - Essential understanding (EN): Benzene halogenation and nitration proceed via electrophile generation, sigma complex and rearomatizing deprotonation.
  - Observable performance (DE): Stellt Elektronenpaarwege und Ladungsbilanz beider Beispiele dar.
  - Observable performance (EN): Represents electron-pair movement and charge balance in both examples.
- `e2`
  - Essential understanding (DE): Reaktionsbedingungen erzeugen unterschiedliche Elektrophile; Ring- und Seitenkettenreaktionen sind zu unterscheiden.
  - Essential understanding (EN): Conditions generate different electrophiles; ring and side-chain reactions must be distinguished.
  - Observable performance (DE): Begründet Bedingungen und grenzt alternative Reaktionswege ab.
  - Observable performance (EN): Justifies conditions and distinguishes alternative routes.

**Coverage expectations**

- required expectations: `e1`, `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Lewis-Säure-Halogenierung und Säure-Nitrierung / Lewis-acid halogenation and acid nitration
- `v2`: Ringreaktion versus radikalische Seitenkette / Ring reaction versus radical side chain

**Application cases**

- `b98f89e2-case-1`
  - Task demand (DE): Papierplanung, keine Ausführung. Modell Bromierung: Br₂/FeBr₃ ohne UV-Licht; Br₂ wird polarisiert, formale Br⁺/FeBr₄⁻-Schreibweise dient nur der Bilanz. Nitrierung: HNO₃/H₂SO₄ erzeugt NO₂⁺. Benzol ist krebserzeugend; alle Schritte bleiben Strukturanalyse.
1. Stelle den Bromierungsmechanismus mit π-Paar→Br, Br–Br-Spaltung im Lewis-Säure-Komplex, positivem σ-Komplex und Deprotonierung durch FeBr₄⁻ dar; bilanziere Produkt und Katalysatorregeneration.
2. Formuliere die ladungsbilanzierte Nitroniumbildung und den Nitrierungsmechanismus mit Elektronenpaarpfeilen; begründe die Funktion der starken Säurebedingungen.
  - Task demand (EN): Paper planning, no execution. Bromination model: Br₂/FeBr₃ without UV; Br₂ is polarized and formal Br⁺/FeBr₄⁻ notation is only bookkeeping. Nitration: HNO₃/H₂SO₄ generates NO₂⁺. Benzene is carcinogenic; all steps remain structural analysis.
1. Show bromination with pi pair→Br, Br–Br cleavage in the Lewis-acid complex, positive sigma complex and deprotonation by FeBr₄⁻; balance product and catalyst regeneration.
2. Write charge-balanced nitronium generation and nitration with electron-pair arrows; explain the role of strongly acidic conditions.
  - Expected performance (DE): 1. Ring-π greift das elektrophile Br im polarisierten Br₂·FeBr₃ an; Br–Br-Paar geht zum anderen Br im FeBr₄⁻-Rest. [C₆H₆Br]⁺ verliert am angegriffenen C H⁺; C–H-Paar→Ring-π. FeBr₄⁻ nimmt das Proton auf und liefert HBr+FeBr₃. Gesamt C₆H₆+Br₂→C₆H₅Br+HBr; FeBr₃ wird regeneriert. Freies Br⁺ in Lösung wird nicht behauptet.
2. HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O (Gesamtladung 0). Ring-π→N von NO₂⁺; ein N=O-π-Paar→O verhindert N-Oktettüberschreitung. [C₆H₆NO₂]⁺ entsteht; Base entfernt Ring-H⁺, C–H-Paar→Ring-π. C₆H₆+HNO₃→C₆H₅NO₂+H₂O. H₂SO₄ protoniert HNO₃ und fördert Wasserabspaltung zur Elektrophilbildung.
  - Expected performance (EN): 1. Ring pi attacks electrophilic Br in polarized Br₂·FeBr₃; the Br–Br pair moves to the other Br in the FeBr₄⁻ residue. [C₆H₆Br]⁺ loses H⁺ at the attacked carbon; C–H pair→ring pi. FeBr₄⁻ accepts the proton, yielding HBr+FeBr₃. Overall C₆H₆+Br₂→C₆H₅Br+HBr; FeBr₃ is regenerated. Free Br⁺ in solution is not asserted.
2. HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O has net zero charge. Ring pi→N of NO₂⁺ while an N=O pi pair→O avoids exceeding nitrogen’s octet. [C₆H₆NO₂]⁺ forms; a base removes ring H⁺, C–H pair→ring pi. C₆H₆+HNO₃→C₆H₅NO₂+H₂O. H₂SO₄ protonates HNO₃ and promotes water loss to generate the electrophile.
  - Understanding focus (DE): Ring-π greift das elektrophile Br im polarisierten Br₂·FeBr₃ an; Br–Br-Paar geht zum anderen Br im FeBr₄⁻-Rest. [C₆H₆Br]⁺ verliert am angegriffenen C H⁺; C–H-Paar→Ring-π. FeBr₄⁻ nimmt das Proton auf und liefert HBr+FeBr₃. Gesamt C₆H₆+Br₂→C₆H₅Br+HBr; FeBr₃ wird regeneriert. Freies Br⁺ in Lösung wird nicht behauptet. / HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O (Gesamtladung 0). Ring-π→N von NO₂⁺; ein N=O-π-Paar→O verhindert N-Oktettüberschreitung. [C₆H₆NO₂]⁺ entsteht; Base entfernt Ring-H⁺, C–H-Paar→Ring-π. C₆H₆+HNO₃→C₆H₅NO₂+H₂O. H₂SO₄ protoniert HNO₃ und fördert Wasserabspaltung zur Elektrophilbildung.
  - Understanding focus (EN): Ring pi attacks electrophilic Br in polarized Br₂·FeBr₃; the Br–Br pair moves to the other Br in the FeBr₄⁻ residue. [C₆H₆Br]⁺ loses H⁺ at the attacked carbon; C–H pair→ring pi. FeBr₄⁻ accepts the proton, yielding HBr+FeBr₃. Overall C₆H₆+Br₂→C₆H₅Br+HBr; FeBr₃ is regenerated. Free Br⁺ in solution is not asserted. / HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O has net zero charge. Ring pi→N of NO₂⁺ while an N=O pi pair→O avoids exceeding nitrogen’s octet. [C₆H₆NO₂]⁺ forms; a base removes ring H⁺, C–H pair→ring pi. C₆H₆+HNO₃→C₆H₅NO₂+H₂O. H₂SO₄ protonates HNO₃ and promotes water loss to generate the electrophile.
- `b98f89e2-case-2`
  - Task demand (DE): Toluol-Papiervergleich: Route A Br₂/FeBr₃ ohne UV; Route B Br₂ mit Licht und radikalischer Initiierung. Eine dritte Ringreaktion ist Nitrierung mit HNO₃/H₂SO₄. Die Aufgaben vergleichen Mechanismen; Produktanteile sind nicht vorgegeben.
1. Zeige für Route A die elektrophile Ringreaktion über σ-Komplex und Deprotonierung mit Elektronenpaarpfeilen; erkläre, warum Route B nicht derselbe Ringmechanismus ist.
2. Zeige den Nitrierungsmechanismus am Ring einschließlich NO₂⁺-Bildung und Ladungen; nenne je eine entscheidende Bedingung für Ringbromierung und Nitrierung.
  - Task demand (EN): Toluene paper comparison: route A Br₂/FeBr₃ without UV; route B Br₂ with light and radical initiation. A third ring reaction is nitration with HNO₃/H₂SO₄. Mechanisms are compared; product proportions are not specified.
1. Show route A’s electrophilic ring reaction through sigma complex and deprotonation using electron-pair arrows; explain why route B is not the same ring mechanism.
2. Show ring nitration including NO₂⁺ generation and charges; name one decisive condition each for ring bromination and nitration.
  - Expected performance (DE): 1. A: Ring-π→polarisiertes Br, Br–Br-Spaltung zum FeBr₄⁻-Rest; Ring-σ-Komplex mit +1; FeBr₄⁻ entfernt H⁺, C–H-Paar rearomatisiert. B erzeugt Radikale und kann benzyliche H-Abstraktion/Substitution an der CH₃-Seitenkette bewirken; dies ist kein Arenium-Ionenmechanismus.
2. HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O. Ring-π→Nitronium-N, N=O-π→O; positiver σ-Komplex→H⁺-Abgabe mit C–H-Paar→Ring. Für A ist Lewis-Säure-Aktivierung des Br₂ entscheidend; für Nitrierung die starke Säure zur NO₂⁺-Bildung. Kein exakter Isomerenanteil folgt daraus.
  - Expected performance (EN): 1. A: ring pi→polarized Br, Br–Br cleavage to the FeBr₄⁻ residue; ring sigma complex has +1; FeBr₄⁻ removes H⁺ and the C–H pair rearomatizes. B generates radicals and can cause benzylic H abstraction/substitution at the methyl side chain; it is not an arenium-ion mechanism.
2. HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O. Ring pi→nitronium N, N=O pi→O; positive sigma complex→H⁺ loss with C–H pair→ring. Lewis-acid activation of Br₂ is decisive for A; strong acid generating NO₂⁺ is decisive for nitration. Exact isomer proportions do not follow.
  - Understanding focus (DE): A: Ring-π→polarisiertes Br, Br–Br-Spaltung zum FeBr₄⁻-Rest; Ring-σ-Komplex mit +1; FeBr₄⁻ entfernt H⁺, C–H-Paar rearomatisiert. B erzeugt Radikale und kann benzyliche H-Abstraktion/Substitution an der CH₃-Seitenkette bewirken; dies ist kein Arenium-Ionenmechanismus. / HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O. Ring-π→Nitronium-N, N=O-π→O; positiver σ-Komplex→H⁺-Abgabe mit C–H-Paar→Ring. Für A ist Lewis-Säure-Aktivierung des Br₂ entscheidend; für Nitrierung die starke Säure zur NO₂⁺-Bildung.
  - Understanding focus (EN): A: ring pi→polarized Br, Br–Br cleavage to the FeBr₄⁻ residue; ring sigma complex has +1; FeBr₄⁻ removes H⁺ and the C–H pair rearomatizes. B generates radicals and can cause benzylic H abstraction/substitution at the methyl side chain; it is not an arenium-ion mechanism. / HNO₃+H₂SO₄⇌NO₂⁺+HSO₄⁻+H₂O. Ring pi→nitronium N, N=O pi→O; positive sigma complex→H⁺ loss with C–H pair→ring. Lewis-acid activation of Br₂ is decisive for A; strong acid generating NO₂⁺ is decisive for nitration.
## Page 12: Fotometrische Konzentrationsbestimmungen auswerten

- Full learning-goal ID: `ba621c67-b750-5e45-ab37-a51ea45e3ccf`
- Goal fingerprint: `sha256:a00506996e3e1a840ca41ba3ee5fbe118e5e870e029d7843368a9864841b0e5e`
- Page fingerprint: `sha256:d3d1376d50ed84198f636493463082da0997bb005f4937a5e1c907bdd8774897`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Absorptionsmaxima geeigneter Lösungen bestimmen, fotometrisch eine Kalibriergerade erstellen, daraus die Konzentration eines Reinstoffes in einer Lösung bestimmen und die Exaktheit einer quantitativen Gehaltsbestimmung beurteilen.

### Visualization

/assets/goal-visualizations/chemie/ba621c67-b750-5e45-ab37-a51ea45e3ccf/ba621c67-b750-5e45-ab37-a51ea45e3ccf.jpg

- original digest: `sha256:51d0a2541d0b9f12abdc309fa0e01035dfa1a8a5c8f879112bcecfb6fbe24717`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Die Aussagekraft chemischer Daten beurteilen — `4aa3a130-b517-5ac5-87b2-147fe432cadd` (outside this book)
- Lösungen berechnen und pH bestimmen — `f1ed86f0-534d-57d7-8952-a004a331cc54` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Fotometrische Konzentrationsbestimmungen auswerten — `d2d706b8-3ebf-55ed-8793-1cef6997cbc2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:af3dff643b5981fbb7a518ee2690950b1737282bfd06a72493440640ab574a95`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Ein Absorptionsmaximum wird unter kontrollierten Messbedingungen aus einem Spektrum ermittelt; Leerprobe und gleiche Schichtdicke ermöglichen den Vergleich.
  - Essential understanding (EN): An absorption maximum is determined from a spectrum under controlled conditions; a blank and equal optical path length enable comparison.
  - Observable performance (DE): Die lernende Person misst nach örtlicher Freigabe den vorgesehenen Scan und die Leerprobe, protokolliert die Bedienung und benennt das Maximum unter den gemessenen Wellenlängen samt Auflösungsgrenze.
  - Observable performance (EN): After local authorization, the learner measures the specified scan and blank, records instrument use and identifies the maximum among measured wavelengths with its resolution limit.
- `e2`
  - Essential understanding (DE): Eine Kalibriergerade ist ein empirisch geprüfter Zusammenhang in einem begrenzten Bereich; ein abweichender Standard darf nicht unbemerkt als linear behandelt werden.
  - Essential understanding (EN): A calibration line is an empirically checked relationship over a limited range; a deviating standard cannot silently be treated as linear.
  - Observable performance (DE): Sie stellt Standards her und misst sie unter tatsächlich beobachteter Bedienung; sie bestimmt Steigung, Achsenabschnitt und gültigen Bereich und begründet die Behandlung des nichtlinearen oberen Standards.
  - Observable performance (EN): The learner prepares and measures standards under actual observation, determines slope, intercept and valid range, and justifies treatment of the nonlinear upper standard.
- `e3`
  - Essential understanding (DE): Der Probengehalt folgt aus der gültigen Kalibrierung und dem Verdünnungsfaktor; eine rechnerisch mögliche Interpolation ist noch keine bestätigte Richtigkeit.
  - Essential understanding (EN): Sample concentration follows from valid calibration and dilution; mathematically valid interpolation is not yet confirmed trueness.
  - Observable performance (DE): Sie berechnet aus dem mittleren Absorptionswert den verdünnten und ursprünglichen Gehalt und kennzeichnet ein Ergebnis bei fehlgeschlagener Kontrolle als vorläufig.
  - Observable performance (EN): The learner calculates diluted and original concentrations from mean absorbance and labels a result provisional when its control fails.
- `e4`
  - Essential understanding (DE): Enge Wiederholstreuung belegt Wiederholbarkeit; eine unabhängige Kontrolle prüft die Richtigkeit unter den angegebenen Bedingungen.
  - Essential understanding (EN): Narrow replicate scatter indicates repeatability; an independent control checks trueness under stated conditions.
  - Observable performance (DE): Sie berechnet die relative Referenzabweichung, trennt sie von der Streuung und entscheidet begründet zwischen Freigabe im Modell und Zurückhalten des Ergebnisses.
  - Observable performance (EN): The learner calculates relative reference deviation, distinguishes it from scatter and justifies accepting the model result or withholding it.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `calibration-validity`: Eine lineare Standardreihe mit einer Reihe mit oberer Abweichung vergleichen; den gültigen Bereich begründen. / Compare a linear standard series with one showing upper-range deviation and justify the valid range.
- `precision-versus-trueness`: Ähnlich kleine Wiederholstreuung bei bestandener und fehlgeschlagener Referenzkontrolle beurteilen. / Judge similarly small replicate scatter with passing and failing reference controls.
- `measurement-versus-data`: Eigenen Scan und Standardherstellung beobachten; synthetische Daten ausschließlich als Auswertungsmaterial nutzen. / Observe the learner's scan and standard preparation; use synthetic data solely as evaluation material.

**Application cases**

- `t02-c1`
  - Task demand (DE): Scan, lineare Standards und eine fünffach verdünnte Probe mit unabhängiger Kontrolle auswerten; eigene Messung getrennt beobachten. Vollständiges Material, Auftrag, Lösung und vier Kriterien: materials/twenty-complete-DEEN-cases.author.json, Fall T02-C1.
  - Task demand (EN): Evaluate a scan, linear standards and a fivefold diluted sample with an independent control; observe actual measurement separately. Complete material, task, solution and four criteria: materials/twenty-complete-DEEN-cases.author.json, case T02-C1.
  - Expected performance (DE): 1. Unter den gemessenen Wellenlängen hat 450 nm die höchste Absorption. Ein genaueres kontinuierliches Maximum benötigt einen feineren Scan. Leerwert 0.020 und gleiche 1.00-cm-Küvetten sichern den Vergleich. 2. Die fünf Standards ergeben A=0.050 (L/mg)·c+0.020 im geprüften Bereich 0–8 mg/L. Der Leerwert ist im Achsenabschnitt bereits berücksichtigt. 3. Der Mittelwert A=0.275 ergibt (0.275−0.020)/0.050=5.10 mg/L; mit Faktor 5 ursprünglich 25.5 mg/L. 4. Die Referenz ergibt 6.04 mg/L, also +0.67 % und damit innerhalb ±2 %. Die kleine Absorptionsspannweite 0.004 zeigt allein keine Richtigkeit. Standardherstellung, Volumengeräte und Matrixkonstanz benötigen eigene Kontroll-/Unsicherheitsnachweise. Scan, Standardherstellung und Bedienung sind hier nicht ausgeführt; praktische Leistung verlangt spätere tatsächliche Beobachtung.
  - Expected performance (EN): 1. 450 nm has highest absorption among supplied wavelengths; finer scanning is needed for an exact continuous maximum. Blank.020 and equal 1.00 cm cells keep comparisons valid. 2. A=.050(L/mg)c+.020 over the supplied 0–8 mg/L standard range. 3. Mean A=.275 gives c=5.10 mg/L and original concentration 25.5 mg/L after fivefold correction. 4. Reference recovery 6.04 mg/L differs by+.67%, within the supplied±2% tolerance. Replicate range.004 in A is small but alone cannot establish trueness. Standard preparation, volumetric equipment and matrix consistency need separate uncertainty/control evidence. No instrument was actually operated here. Practical full performance requires actually observed standard preparation, matched cells/blank, recorded scan and own calibration measurements. No observations are present here.
  - Understanding focus (DE): Das gemessene Maximum, die lineare Interpolation und die Referenzprüfung müssen zusammenpassen.
  - Understanding focus (EN): The sampled maximum, linear interpolation and reference check must agree.
- `t02-c2`
  - Task demand (DE): Eine obere Kalibrierabweichung und eine trotz kleiner Streuung um 10 % abweichende Kontrolle beurteilen. Vollständiges Material, Auftrag, Lösung und vier Kriterien: materials/twenty-complete-DEEN-cases.author.json, Fall T02-C2.
  - Task demand (EN): Judge upper-range calibration deviation and a control biased by 10% despite narrow scatter. Complete material, task, solution and four criteria: materials/twenty-complete-DEEN-cases.author.json, case T02-C2.
  - Expected performance (DE): 1. Das größte gemessene Signal liegt bei 540 nm; A=0.010 bei c=0 ist der Leerwertbeitrag. 2. Die ersten vier Standards ergeben A=0.400·c+0.010. Für 2.0 mg/L wären 0.810 erwartet, gegeben sind 0.650. Eine gemeinsame lineare Ausgleichung aller Punkte ist deshalb nicht begründet. 3. Der Mittelwert 0.510 ergibt verdünnt 1.25 mg/L und mit Faktor 4 ursprünglich 5.00 mg/L. 4. Die Referenz ergibt 1.10 mg/L, also +10 % statt erlaubter ±2 %. Kleine Wiederholstreuung (Spannweite 0.002) schließt einen systematischen Fehler nicht aus. Dessen Ursache ist nicht eindeutig: unabhängige Standard-/Referenzherstellung sowie Geräte-/Leerwertprüfung sind nötig. 5.00 mg/L bleibt ein vorläufiger Rechenwert. Praktische Herstellung, Scan und Kalibrierung wurden hier nicht beobachtet.
  - Expected performance (EN): 1. 540 nm is the largest sampled absorption; A=.010 at c=0 is the intercept. 2. The first four standards give A=.400 c+.010;2.0 mg/L should give.810 but gives.650, so fitting every point to one line is unjustified. 3. (.510−.010)/.400=1.25 mg/L; fourfold correction gives 5.00 mg/L. 4. Reference recovery 1.10 mg/L is+10%, outside±2%. Precise replicates (A range.002) do not exclude systematic error. These data do not uniquely identify its cause; independent standard/reference preparation and instrument/blank checks are needed.5.00 mg/L is thus a method-derived content, not a fully verified result. Practical full performance requires actually observed standard preparation, matched cells/blank, recorded scan and own calibration measurements. No observations are present here.
  - Understanding focus (DE): Ein plausibler Rechenwert darf bei fehlgeschlagener Richtigkeitskontrolle nicht als bestätigter Gehalt ausgegeben werden.
  - Understanding focus (EN): A plausible calculation must not be reported as confirmed concentration after a failed trueness check.
## Page 13: Oxidation und Reduktion bei einfachen Reaktionen erkennen

- Full learning-goal ID: `bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a`
- Goal fingerprint: `sha256:7b4373dc5dbaa2e1cd9d76ad97132d9480e5840380787c6eacee50a6455ef07f`
- Page fingerprint: `sha256:727768be7e2f3c192a2e7daf3eb748cc08b4fc371c39d455dedcc911f00cc818`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Oxidations- und Reduktionsvorgänge bei einfachen Reaktionen von Metallen und Nichtmetallen fachlich deuten.

### Visualization

/assets/goal-visualizations/chemie/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a.jpg

- original digest: `sha256:c57fd42b49a79574ce7f616d36907f918cb22deec2e2d3dde87f5e18ae6e3519`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Einfache Redoxgleichungen mit Oxidationszahlen erstellen — `22133f29-ef02-4408-8f8d-2bbea3275d91` (page 14)

### Prerequisites outside this book

- Chemische Reaktionen von physikalischen Vorgängen unterscheiden — `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d5db2a693ff5d5ee045086b450626535830a4bbd7cfa1cebeabcc4328d529993`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `interpret-redox-in-introduced-model`
  - Essential understanding (DE): Oxidation und Reduktion deuten Veränderungen an Stoffen oder Teilchen im jeweils eingeführten Modell. Im frühen Sauerstoffmodell bedeuten Oxidbildung bzw. Sauerstoffaufnahme Oxidation und Sauerstoffentzug aus einem Oxid Reduktion; bei Sauerstoffübertragung werden die Veränderungen an den jeweiligen Partnern verfolgt. In einem bereits eingeführten Elektronenmodell stehen Elektronenabgabe und -aufnahme für Oxidation und Reduktion. Beobachtung, Stoffumsatz und Modelldeutung sind zu unterscheiden; ein helles Leuchten oder eine neue Farbe allein begründet keine Redoxzuordnung.
  - Essential understanding (EN): Oxidation and reduction interpret changes in substances or particles using the model already introduced. In the introductory oxygen model, oxide formation or oxygen uptake represents oxidation and oxygen removal from an oxide represents reduction; in oxygen transfer, the changes are traced at the respective partners. In an already introduced electron model, electron loss and gain represent oxidation and reduction. Observation, substance change and model interpretation are distinct; bright light or a new colour alone does not justify a redox assignment.
  - Observable performance (DE): Die lernende Person deutet selbstständig vorgelegte einfache Metall-/Nichtmetallfälle aus den tatsächlichen Stoff- oder Teilchenänderungen, verwendet den passenden eingeführten Modellzugang und begründet die Bezeichnungen. In einem geeigneten Sauerstoffübertragungsfall ordnet sie beide Veränderungen den jeweiligen Partnern zu. Ein elektronenbezogener Zugang darf genutzt werden, wenn er bereits eingeführt und durch geeignete Teilcheninformationen gestützt ist; er ist keine zusätzliche universelle Einstiegsanforderung. Abschreiben einer Bildgleichung oder bloßes Benennen genügt nicht.
  - Observable performance (EN): The learner independently interprets supplied simple cases involving metals and non-metals from the actual substance or particle changes, uses an appropriate introduced model and justifies the terms. In a suitable oxygen-transfer case, the learner assigns both changes to the respective partners. An electron account may be used if already introduced and supported by suitable particle information; it is not an additional universal entry requirement. Copying an illustrated equation or merely naming terms is insufficient.

**Coverage expectations**

- required expectations: `interpret-redox-in-introduced-model`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemical-change-and-partner`: Oxidbildung und Oxidzerlegung werden durch eine neue Sauerstoffübertragung zwischen Metalloxid und einem Nichtmetall kontrastiert. Reaktionspartner und tatsächlicher Sauerstoffweg ändern sich. / Oxide formation and decomposition are contrasted with fresh oxygen transfer between a metal oxide and a non-metal. The reaction partners and actual oxygen pathway change.
- `observation-versus-model`: Makroskopische Beobachtungen werden mit vorgelegten Stoffbefunden verknüpft; Leuchten oder Farbe gelten nicht als ausreichender Modellnachweis. Eine bereits eingeführte Teilchendarstellung kann dieselbe Änderung ergänzend erklären. / Macroscopic observations are connected to supplied substance findings; light or colour is not sufficient model evidence. An already introduced particle representation can additionally explain the same change.

**Application cases**

- `oxide-formation-and-decomposition-data`
  - Task demand (DE): Es liegen ausschließlich Daten aus beaufsichtigten Versuchen vor: A: Magnesium reagiert mit Sauerstoff zu Magnesiumoxid und leuchtet hell. B: Silberoxid wird zerlegt; Silber und Sauerstoff entstehen. Deute im eingeführten Sauerstoffmodell die Veränderung des jeweiligen Metalls bei A und B. Begründe Oxidation bzw. Reduktion anhand der Stoffänderung und erkläre, weshalb das helle Leuchten allein die Zuordnung nicht beweist. Keine Versuchsdurchführung und keine Gleichungsaufstellung werden verlangt.
  - Task demand (EN): Use only data from supervised experiments: A: magnesium reacts with oxygen to form magnesium oxide and emits bright light. B: silver oxide decomposes, producing silver and oxygen. In the introduced oxygen model, interpret the change of the respective metal in A and B. Justify oxidation or reduction from the substance change and explain why bright light alone does not prove the assignment. No experiment execution or equation construction is required.
  - Expected performance (DE): Bei A wird Magnesium durch Sauerstoffaufnahme bzw. Oxidbildung oxidiert. Bei B wird dem Silberoxid Sauerstoff entzogen und Silber entsteht; dies wird im eingeführten Sauerstoffmodell als Reduktion gedeutet. Die Begründung verfolgt Stoff- und Sauerstoffänderungen, nicht die Helligkeit. Eine universelle Pflicht, schon für beide frühen Fälle alle Partner im späteren Elektronenmodell zu beschreiben, wird nicht abgeleitet.
  - Expected performance (EN): In A, magnesium is oxidized through oxygen uptake or oxide formation. In B, oxygen is removed from silver oxide and silver forms; this is interpreted as reduction in the introduced oxygen model. The explanation traces substance and oxygen changes rather than brightness. It does not infer a universal requirement to describe all partners in both introductory cases through the later electron model.
  - Understanding focus (DE): Ein fachlicher Deutungsgrund wird von der auffälligen Beobachtung getrennt; Oxidbildung und Sauerstoffentzug werden am jeweiligen Metall erklärt.
  - Understanding focus (EN): A scientific interpretation is distinguished from a conspicuous observation; oxide formation and oxygen removal are explained for the respective metal.
- `fresh-metal-oxide-carbon-oxygen-transfer`
  - Task demand (DE): Neuer Fall ohne Bildlösung: Vorgelegt sind ein korrektes Reaktionsschema 2 CuO + C → 2 Cu + CO₂ und die Information, dass unter den angegebenen Bedingungen kein Sauerstoff aus der Umgebung in die Reaktion gelangt. CuO ist ein Kupferoxid, C ist Kohlenstoff. Verfolge den Sauerstoff zwischen den Stoffen und begründe, welcher Vorgang als Reduktion und welcher als Oxidation gedeutet wird. Prüfe die Aussage: „Das Kupferoxid wird oxidiert, weil es am Anfang schon Sauerstoff enthält.“ Das Schema ist gegeben; es muss weder hergeleitet noch experimentell ausgeführt werden.
  - Task demand (EN): Fresh case without an illustrated solution: a correct reaction scheme 2 CuO + C → 2 Cu + CO₂ is supplied, together with the information that no oxygen from the surroundings enters the reaction under the stated conditions. CuO is a copper oxide and C is carbon. Trace oxygen between the substances and justify which change is interpreted as reduction and which as oxidation. Evaluate the claim: “Copper oxide is oxidized because it already contains oxygen at the start.” The scheme is supplied; it need not be derived or carried out experimentally.
  - Expected performance (DE): Der Sauerstoff stammt aus dem Kupferoxid und wird auf Kohlenstoff übertragen. Sauerstoffentzug aus CuO zu Cu wird als Reduktion gedeutet; Kohlenstoff nimmt Sauerstoff auf und wird zu CO₂ oxidiert. Entscheidend ist die Änderung, nicht der Sauerstoffgehalt des Ausgangsstoffs. Beide Zuordnungen werden durch denselben Sauerstoffweg verbunden. Die Atomzahlen des vorgelegten Schemas stimmen; kein Aufstellen über Oxidationszahlen, keine quantitative Elektronenbilanz und keine Reaktionsmengenrechnung werden verlangt.
  - Expected performance (EN): Oxygen originates from the copper oxide and is transferred to carbon. Oxygen removal from CuO to Cu is interpreted as reduction; carbon takes up oxygen and is oxidized to CO₂. The change, rather than the initial substance’s oxygen content, is decisive. Both assignments are connected by the same oxygen pathway. The supplied scheme conserves atoms; no oxidation-number construction, quantitative electron balancing or stoichiometric calculation is required.
  - Understanding focus (DE): Unabhängiger Transfer von Oxidbildung/-zerlegung zur gekoppelten Sauerstoffübertragung; der neue Nichtmetallpartner und ein plausibler Fehlschluss verlangen eigenes Begründen.
  - Understanding focus (EN): Independent transfer from oxide formation/decomposition to coupled oxygen transfer; the new non-metal partner and a plausible misconception require the learner’s own reasoning.
## Page 14: Einfache Redoxgleichungen mit Oxidationszahlen erstellen

- Full learning-goal ID: `22133f29-ef02-4408-8f8d-2bbea3275d91`
- Goal fingerprint: `sha256:3292643efddf22f29dc9979178d1b573a0b59c9c67228d32d317f3baa99b1af3`
- Page fingerprint: `sha256:d954b44111dbda9aaebe8b203772440cd6e9105d7db148893a9e21344df421e6`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Oxidationszahlen nutzen, einfache Redoxteilgleichungen in wässrigen Lösungen formulieren und Redoxgleichungen fachlich korrekt erstellen.

### Visualization

/assets/goal-visualizations/chemie/22133f29-ef02-4408-8f8d-2bbea3275d91/22133f29-ef02-4408-8f8d-2bbea3275d91.jpg

- original digest: `sha256:cfe32853bddb72e823c5e2eac8d307dc288a4d0f44328d71de70c86348cbfb9c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Oxidation und Reduktion bei einfachen Reaktionen erkennen — `bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a` (page 13)

### Direct reverse prerequisites

- Photosynthese als Redoxprinzip beschreiben — `1051c091-a044-5a09-8946-60a4b5e5d185` (page 15)
- Elektrolyse einfacher Salze deuten — `70b12d1c-abaf-45c6-ae9e-b571e9cbc126` (page 16)

### Prerequisites outside this book

- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:880e9b2efd91efbb6c88aebdcd832e71c340758e3bd8f3ca1ff9e428f7e7f848`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Redoxgleichungen entstehen aus korrekt bestimmten Oxidationszahlen, getrennten Elektronenbilanzen und Erhaltung von Atomen und Gesamtladung. Elektronen heben sich in der Gesamtgleichung auf; Koeffizienten dürfen Stoffformeln nicht verändern.
  - Essential understanding (EN): Redox equations follow from correct oxidation numbers, separate electron balances and conservation of atoms and total charge. Electrons cancel from the overall equation; coefficients must not alter species formulas.
  - Observable performance (DE): Zn: 0 → +II, Oxidation mit Abgabe von zwei Elektronen: Zn → Zn2+ + 2 e−. Cu: +II → 0, Reduktion: Cu2+ + 2 e− → Cu. Addiert ergibt sich Zn + Cu2+ → Zn2+ + Cu. Atome und Gesamtladung +2 bleiben erhalten. Der Entwurf hat links +4 und rechts +2 und liefert eine falsche Elektronenbilanz: Ein Zn-Atom kann in dieser Reaktion nur ein Cu2+-Ion reduzieren.
  - Observable performance (EN): Zn changes 0 → +II and is oxidized by losing two electrons: Zn → Zn2+ + 2 e−. Cu changes +II → 0 and is reduced: Cu2+ + 2 e− → Cu. Summing gives Zn + Cu2+ → Zn2+ + Cu. Atoms and total charge +2 are conserved. The draft has charge +4 on the left and +2 on the right and the wrong electron balance: one Zn atom reduces only one Cu2+ ion in this reaction.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): Metallabscheidung Zn/Cu gegenüber MnO4−/Fe2+ mit vorgegebenem saurem Milieu; Elektronenfaktor und H/O-Ladungsbilanz. Die Gesamtgleichung enthält keine freien Elektronen; die Produktannahme wird nicht auf basisches Milieu übertragen.
  - Essential understanding (EN): Zn/Cu metal displacement versus MnO4−/Fe2+ in an explicitly acidic medium; electron factors and H/O charge balance. The overall equation contains no free electrons; the product assumption is not transferred to basic media.
  - Observable performance (DE): Mn hat zunächst +VII und nimmt fünf Elektronen auf: MnO4− + 8 H+ + 5 e− → Mn2+ + 4 H2O. Fe2+ → Fe3+ + e− wird mit fünf multipliziert. Gesamt: MnO4− + 8 H+ + 5 Fe2+ → Mn2+ + 4 H2O + 5 Fe3+. O: vier, H: acht, Mn: eins, Fe: fünf auf jeder Seite. Gesamtladung links −1 + 8 + 10 = +17, rechts 2 + 15 = +17. Die saure Bedingung ist nötig für diese festgelegten Produkte; andere Milieus können andere Mn-Produkte liefern.
  - Observable performance (EN): Mn starts at +VII and accepts five electrons: MnO4− + 8 H+ + 5 e− → Mn2+ + 4 H2O. Multiply Fe2+ → Fe3+ + e− by five. Overall: MnO4− + 8 H+ + 5 Fe2+ → Mn2+ + 4 H2O + 5 Fe3+. Each side has four O, eight H, one Mn and five Fe atoms. Charge is −1 + 8 + 10 = +17 on the left and 2 + 15 = +17 on the right. The specified acidic medium is needed for these products; other media may yield different Mn species.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: Metallabscheidung Zn/Cu gegenüber MnO4−/Fe2+ mit vorgegebenem saurem Milieu; Elektronenfaktor und H/O-Ladungsbilanz. / Zn/Cu metal displacement versus MnO4−/Fe2+ in an explicitly acidic medium; electron factors and H/O charge balance.
- `model-boundary`: Die Gesamtgleichung enthält keine freien Elektronen; die Produktannahme wird nicht auf basisches Milieu übertragen. / The overall equation contains no free electrons; the product assumption is not transferred to basic media.

**Application cases**

- `chem-next20-22133f29-case-1`
  - Task demand (DE): Fiktiver wässriger Modellfall: Zn-Metall reagiert mit Cu2+-Ionen zu Zn2+ und Cu-Metall. Sauerstoff- oder Wasserstoffatome müssen hier nicht ergänzt werden; Begleit-Ionen sind Zuschauer. Ein Entwurf lautet Zn + 2 Cu2+ → Zn2+ + 2 Cu. Bestimme die Oxidationszahländerungen, schreibe beide Teilgleichungen, bilde die richtige Gesamtgleichung und zeige den Fehler im Entwurf anhand der Ladung.
  - Task demand (EN): Fictional aqueous model: Zn metal reacts with Cu2+ ions to give Zn2+ and Cu metal. No oxygen or hydrogen atoms require balancing here; spectator ions are excluded. A draft reads Zn + 2 Cu2+ → Zn2+ + 2 Cu. Determine oxidation-number changes, write both half-equations, form the correct overall equation and show the draft’s charge error.
  - Expected performance (DE): Zn: 0 → +II, Oxidation mit Abgabe von zwei Elektronen: Zn → Zn2+ + 2 e−. Cu: +II → 0, Reduktion: Cu2+ + 2 e− → Cu. Addiert ergibt sich Zn + Cu2+ → Zn2+ + Cu. Atome und Gesamtladung +2 bleiben erhalten. Der Entwurf hat links +4 und rechts +2 und liefert eine falsche Elektronenbilanz: Ein Zn-Atom kann in dieser Reaktion nur ein Cu2+-Ion reduzieren.
  - Expected performance (EN): Zn changes 0 → +II and is oxidized by losing two electrons: Zn → Zn2+ + 2 e−. Cu changes +II → 0 and is reduced: Cu2+ + 2 e− → Cu. Summing gives Zn + Cu2+ → Zn2+ + Cu. Atoms and total charge +2 are conserved. The draft has charge +4 on the left and +2 on the right and the wrong electron balance: one Zn atom reduces only one Cu2+ ion in this reaction.
  - Understanding focus (DE): Formeln und Ionenladungen werden nicht zum Ausgleich verändert; Begleit-Ionen werden nur bei Bedarf ergänzt.
  - Understanding focus (EN): Species formulas and ion charges are not changed to balance; spectator ions are included only where needed.
- `chem-next20-22133f29-case-2`
  - Task demand (DE): Frischer schriftlicher Modellfall, keine Versuchsanweisung: MnO4− wird in ausdrücklich saurer wässriger Lösung zu Mn2+ reduziert, Fe2+ wird zu Fe3+ oxidiert. Gegeben: O hat −II, H hat +I. H2O, H+ und Elektronen dürfen zur Bilanzierung der Teilgleichungen verwendet werden. Leite die Teilgleichungen her, bestimme den Elektronenfaktor und prüfe Atome sowie Gesamtladung der vollständigen Gesamtgleichung.
  - Task demand (EN): Fresh written model, not an experiment instruction: MnO4− is reduced to Mn2+ in explicitly acidic aqueous solution while Fe2+ is oxidized to Fe3+. Given: O is −II and H is +I. H2O, H+ and electrons may balance the half-equations. Derive both half-equations, determine the electron factor and verify atoms and total charge of the complete overall equation.
  - Expected performance (DE): Mn hat zunächst +VII und nimmt fünf Elektronen auf: MnO4− + 8 H+ + 5 e− → Mn2+ + 4 H2O. Fe2+ → Fe3+ + e− wird mit fünf multipliziert. Gesamt: MnO4− + 8 H+ + 5 Fe2+ → Mn2+ + 4 H2O + 5 Fe3+. O: vier, H: acht, Mn: eins, Fe: fünf auf jeder Seite. Gesamtladung links −1 + 8 + 10 = +17, rechts 2 + 15 = +17. Die saure Bedingung ist nötig für diese festgelegten Produkte; andere Milieus können andere Mn-Produkte liefern.
  - Expected performance (EN): Mn starts at +VII and accepts five electrons: MnO4− + 8 H+ + 5 e− → Mn2+ + 4 H2O. Multiply Fe2+ → Fe3+ + e− by five. Overall: MnO4− + 8 H+ + 5 Fe2+ → Mn2+ + 4 H2O + 5 Fe3+. Each side has four O, eight H, one Mn and five Fe atoms. Charge is −1 + 8 + 10 = +17 on the left and 2 + 15 = +17 on the right. The specified acidic medium is needed for these products; other media may yield different Mn species.
  - Understanding focus (DE): Die Gesamtgleichung enthält keine freien Elektronen; die Produktannahme wird nicht auf basisches Milieu übertragen.
  - Understanding focus (EN): The overall equation contains no free electrons; the product assumption is not transferred to basic media.
## Page 15: Photosynthese als Redoxprinzip beschreiben

- Full learning-goal ID: `1051c091-a044-5a09-8946-60a4b5e5d185`
- Goal fingerprint: `sha256:fbd6ec7fb7bcf3be73429ddd207662a4356cfc183d580bd76f5224bac1219876`
- Page fingerprint: `sha256:5904eac984edf5280c2eb674f401cfc4168e4f856e3add10f8ef67a53e34c031`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das Grundprinzip der Photosynthese als lichtabhängige Spaltung von Wasser und anschließende Reduktion von Kohlenstoffdioxid beschreiben.

### Visualization

/assets/goal-visualizations/chemie/1051c091-a044-5a09-8946-60a4b5e5d185/1051c091-a044-5a09-8946-60a4b5e5d185.jpg

- original digest: `sha256:9f3d7673c4d5465c007d4b34e8d034c16d17bb810f4a82c76a3c8710ff8dda4f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einfache Redoxgleichungen mit Oxidationszahlen erstellen — `22133f29-ef02-4408-8f8d-2bbea3275d91` (page 14)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Redoxbegriffe sicher anwenden — `04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Künstliche Photosynthese und Wasserstoffspeicherung bewerten — `7dc80ee2-64e3-50c1-8aaa-0fef0ed0919d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8158ab79bd67b5d48c8453d81c6c5605543da2461abb3a752fea46d4f1a7fb01`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Photosynthetischer Sauerstoff entsteht aus Wasseroxidation,CO2 wird reduziert.
  - Essential understanding (EN): Photosynthetic oxygen arises from water oxidation whileCO2 is reduced.
  - Observable performance (DE): energy20-07-a: Wasser als Donator undCO2 als Akzeptor durch Tracer und Bilanz verbinden. energy20-07-b: Lichtreaktion undCO2-Reduktion kausal verbinden, ohne sie gleichzusetzen.
  - Observable performance (EN): energy20-07-a: Identify water as donor andCO2 as acceptor from balance/tracer evidence. energy20-07-b: Causally connect light reaction andCO2 reduction without conflating them.
- `e2`
  - Essential understanding (DE): Nettoformel und Tracerexperiment liefern unterschiedliche Information.
  - Essential understanding (EN): Net equations and tracer experiments provide different information.
  - Observable performance (DE): energy20-07-a: Vier Elektronen und erhaltene Ladung korrekt bilanzieren. energy20-07-b: Glucose-Nettoformel und expliziten Wasserumsatz deuten.
  - Observable performance (EN): energy20-07-a: Connect half-reactions with4electrons and conserved charge. energy20-07-b: Interpret glucose balance and explicit water turnover correctly.
- `e3`
  - Essential understanding (DE): Lichtenergie und gekoppelte Träger ermöglichen chemische Speicherung ohne Atomerzeugung.
  - Essential understanding (EN): Light energy/coupled carriers enable chemical storage without creating atoms.
  - Observable performance (DE): energy20-07-a: Netto-, Mechanismus- und Lichtenergieaussage unterscheiden. energy20-07-b: C-Fixierung nicht ausO2 allein ableiten.
  - Observable performance (EN): energy20-07-a: Distinguish net equation,mechanism and light-energy claims. energy20-07-b: Do not infer carbon fixation fromO2 alone.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `energy20-07-a-transfer`: Im Dunkeln setzt sichCO2-Fixierung mit vorhandenenATP/NADPH kurz fort. Warum beweist das keine unbegrenzte Wasseroxidation ohne Licht? / CO2 fixation briefly continues in darkness ifATP/NADPH are available. Explain why this does not show unlimited dark water oxidation.
- `energy20-07-b-transfer`: ErsetzeCO2 durchN2. Welche Produktbehauptung ist trotzO2-Freisetzung unbelegt, und welche Messung prüftC-Speicherung? / A new experiment releasesO2 afterCO2 is replaced byN2. Without a diagram,predict the unsupported product claim and a measurement of carbon storage.

**Application cases**

- `energy20-07-a`
  - Task demand (DE): Ganzes eigenes Material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-07-a,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Leite dieO2-Herkunft ab. Stelle Wasseroxidation undCO2-Reduktion auf derCH2O-Modellstufe dar. Erkläre die Grenze einer Nettogleichung sowie Lichtabhängigkeit und Energiespeicherung.
  - Task demand (EN): Whole own material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-07-a,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Infer the releasedO2 source and represent water oxidation andCO2 reduction at theCH2O model level. Explain why the net equation alone does not prove atom origins. Assign light dependence and stored chemical energy.
  - Expected performance (DE): 2H2O→O2+4H++4e−; CO2+4H++4e−→CH2O+H2O; nettoCO2+H2O→CH2O+O2. Tracer verknüpftO2 mit Wasseroxidation, CO2 wird reduziert. CH2O bezeichnet ein Kohlenhydratäquivalent, kein isoliertes Pflanzenprodukt Formaldehyd. Die Nettogleichung verbirgt Wasserumsatz und Zwischenreaktionen. Licht treibt Speicherung chemischer Energie; Enzyme erzeugen diese Energie nicht.
  - Expected performance (EN): 2H2O→O2+4H++4e−;CO2+4H++4e−→CH2O+H2O;netCO2+H2O→CH2O+O2. Tracer evidence linksO2 to water oxidation;CO2 is reduced,not split toO2. The shortened net equation hides intermediates/water turnover;CH2O is a carbohydrate equivalent,not isolated plant formaldehyde. Light drives coupled energy storage;enzymes do not create energy.
  - Understanding focus (DE): Im Dunkeln setzt sichCO2-Fixierung mit vorhandenenATP/NADPH kurz fort. Warum beweist das keine unbegrenzte Wasseroxidation ohne Licht?
  - Understanding focus (EN): CO2 fixation briefly continues in darkness ifATP/NADPH are available. Explain why this does not show unlimited dark water oxidation.
- `energy20-07-b`
  - Task demand (DE): Ganzes eigenes Material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-07-b,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Erkläre die Daten durch gekoppelte, aber verschiedene Teilprozesse. Formuliere die Glucose-Nettoformel und ihre Grenze. Widerlege „CO2 ist der Brennstoff der Lichtreaktion, Wasser nur Lösemittel“.
  - Task demand (EN): Whole own material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-07-b,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Explain the data as coupled but distinct partial processes. Formulate the glucose net equation and its limitation. Refute“CO2 fuels the light reaction while water is merely solvent”.
  - Expected performance (DE): 6CO2+6H2O→C6H12O6+6O2 ist die Nettobilanz mit Lichtzufuhr. Expliziter Wasserumsatz:6CO2+12H2O→C6H12O6+6O2+6H2O. Wasseroxidation liefert Elektronen undO2, CO2-Reduktion bindetC. Die Daten zeigen Trägerkopplung, keine unbegrenzte Dunkelreaktion. Atome und Energie haben unterschiedliche Quellen. AnfangsO2 ohneCO2 ist kein Nachweis neuer Kohlenhydratsynthese.
  - Expected performance (EN): 6CO2+6H2O→C6H12O6+6O2 is the net material balance with light input;explicit turnover can be written6CO2+12H2O→C6H12O6+6O2+6H2O. Water oxidation supplies electrons/O2;CO2 reduction builds carbon compounds. Data indicate separate carrier dependence,not unlimited dark processes. Atoms and energy have distinct sources;O2 can initially form withoutCO2,but carbon fixation cannot continue without its carbon source.
  - Understanding focus (DE): ErsetzeCO2 durchN2. Welche Produktbehauptung ist trotzO2-Freisetzung unbelegt, und welche Messung prüftC-Speicherung?
  - Understanding focus (EN): A new experiment releasesO2 afterCO2 is replaced byN2. Without a diagram,predict the unsupported product claim and a measurement of carbon storage.
## Page 16: Elektrolyse einfacher Salze deuten

- Full learning-goal ID: `70b12d1c-abaf-45c6-ae9e-b571e9cbc126`
- Goal fingerprint: `sha256:e190224f70f5948a36b5d5015f19afeb252fb926b606671037f3257e8e941612`
- Page fingerprint: `sha256:7c5770be8f114e87893f4cf05c4c42a291115ad12f0f8b1c772277edab065320`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Elektrolyse einfacher Salzlösungen oder Salzschmelzen mit Ionenwanderung, Elektrodenprozessen und Abscheidung beziehungsweise Herstellung von Metallen oder Nichtmetallen fachlich deuten.

### Visualization

/assets/goal-visualizations/chemie/70b12d1c-abaf-45c6-ae9e-b571e9cbc126/70b12d1c-abaf-45c6-ae9e-b571e9cbc126.jpg

- original digest: `sha256:078941cb41d9c07cb876a2b0795d690efaef2635c9e5c3ddcb8c769669eacc0b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einfache Redoxgleichungen mit Oxidationszahlen erstellen — `22133f29-ef02-4408-8f8d-2bbea3275d91` (page 14)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Ionen als Ladungsträger erklären — `4285d84a-2c9a-4d51-8250-8bed4daf2d2e` (outside this book)

### Direct reverse prerequisites outside this book

- Elektrolyse beschreiben — `fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6e48228e6cddb107caf5474ada5eca416ce256372474ecd870804aa61f313561`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `content-specific-understanding`
  - Essential understanding (DE): Elektrolyse erzwingt mit elektrischer Energie Elektronenaufnahme an der Kathode und Elektronenabgabe an der Anode; die mobilen Ionen wandern zu entgegengesetzten Polen.
  - Essential understanding (EN): Electrolysis uses electrical energy to force electron gain at the cathode and loss at the anode; mobile ions migrate towards opposite poles.
  - Observable performance (DE): Na+ zur Kathode:Na++e−→Na. Cl− zur Anode:2Cl−→Cl2+2e−. Summe2NaCl→2Na+Cl2; elektrische Energie erzwingt den Umsatz. Ladungen und Elektronen sind bilanziert; Natrium und Chlor bleiben räumlich getrennt.
  - Observable performance (EN): Na+ to cathode:Na++e−→Na. Cl− to anode:2Cl−→Cl2+2e−. Sum2NaCl→2Na+Cl2; electrical energy forces the process. Charges/electrons balance; sodium and chlorine are kept spatially separated.
- `fresh-transfer-and-model-boundary`
  - Essential understanding (DE): Die Materialdeutung belegt keine selbst ausgeführte Elektrolyse und ist keine private Durchführungsempfehlung.
  - Essential understanding (EN): Interpreting the material establishes no personally executed electrolysis and is no recommendation for private execution.
  - Observable performance (DE): Cu2++2e−→Cu;2Cl−→Cl2+2e−; CuCl2→Cu+Cl2 im gegebenen Fall. Kationen/Anionen wandern zu negativer/positiver Elektrode. In wässrigen anderen Fällen können Wasser, Konzentration und Elektroden die Produkte beeinflussen; Na-Metall wird daraus nicht gefolgert.
  - Observable performance (EN): Cu2++2e−→Cu;2Cl−→Cl2+2e−; CuCl2→Cu+Cl2 in the supplied case. Cations/anions migrate to negative/positive electrodes. Water, concentration and electrode material can affect other aqueous products; sodium metal is not inferred.

**Coverage expectations**

- required expectations: `content-specific-understanding`, `fresh-transfer-and-model-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-material-variation`: NaCl-Schmelze gegenüber ausdrücklich festgelegter Kupfer(II)-chlorid-Lösung; Teilgleichungen und Wasser-Grenze. / NaCl melt versus explicitly specified copper(II) chloride solution; half-equations and water limitation.
- `specific-model-limit`: Die Materialdeutung belegt keine selbst ausgeführte Elektrolyse und ist keine private Durchführungsempfehlung. / Interpreting the material establishes no personally executed electrolysis and is no recommendation for private execution.

**Application cases**

- `chem-next25-70b12d1c-case-1`
  - Task demand (DE): Reiner Papiermodellfall: wasserfreie NaCl-Schmelze; getrennte Kathoden-/Anodenräume. Keine Versuchsanweisung. Vorgegeben sind Na+ und Cl−, negative Kathode, positive Anode und Chlorbildung. Erkläre Ionenwanderung und metallisches/nichtmetallisches Produkt; formuliere ausgeglichene Teil- und Gesamtgleichung.
  - Task demand (EN): Paper model only: anhydrous NaCl melt with separated cathode/anode regions. No experimental procedure. Na+, Cl−, negative cathode, positive anode and chlorine formation are specified. Explain ion migration and metal/nonmetal products; write balanced half- and overall equations.
  - Expected performance (DE): Na+ zur Kathode:Na++e−→Na. Cl− zur Anode:2Cl−→Cl2+2e−. Summe2NaCl→2Na+Cl2; elektrische Energie erzwingt den Umsatz. Ladungen und Elektronen sind bilanziert; Natrium und Chlor bleiben räumlich getrennt.
  - Expected performance (EN): Na+ to cathode:Na++e−→Na. Cl− to anode:2Cl−→Cl2+2e−. Sum2NaCl→2Na+Cl2; electrical energy forces the process. Charges/electrons balance; sodium and chlorine are kept spatially separated.
  - Understanding focus (DE): Das Beispiel ist eine Schmelze; Natriumabscheidung darf nicht ungeprüft auf wässrige NaCl-Lösung übertragen werden.
  - Understanding focus (EN): This example is a melt; sodium deposition must not be transferred uncritically to aqueous NaCl.
- `chem-next25-70b12d1c-case-2`
  - Task demand (DE): Frischer Interpretationsfall: ein beaufsichtigtes Referenzprotokoll für CuCl2-Lösung nennt an der Kathode Kupfer, an der Anode Chlor. Chloridoxidation ist für diese vorgegebenen Bedingungen ausdrücklich festgelegt; alternative Wasserreaktionen werden nicht ausgeschlossen. Erkläre die Beobachtungen mit Cu2+/Cl− und bilanziere. Begründe, warum das Protokoll keine universelle Produktregel für jede Salzlösung ist.
  - Task demand (EN): Fresh interpretation: a supervised reference protocol for CuCl2 solution reports copper at the cathode and chlorine at the anode. Chloride oxidation is specified for these conditions; alternative water reactions are not ruled out generally. Explain the observations using Cu2+/Cl− and balance them. Explain why the protocol is not a universal product rule for every salt solution.
  - Expected performance (DE): Cu2++2e−→Cu;2Cl−→Cl2+2e−; CuCl2→Cu+Cl2 im gegebenen Fall. Kationen/Anionen wandern zu negativer/positiver Elektrode. In wässrigen anderen Fällen können Wasser, Konzentration und Elektroden die Produkte beeinflussen; Na-Metall wird daraus nicht gefolgert.
  - Expected performance (EN): Cu2++2e−→Cu;2Cl−→Cl2+2e−; CuCl2→Cu+Cl2 in the supplied case. Cations/anions migrate to negative/positive electrodes. Water, concentration and electrode material can affect other aqueous products; sodium metal is not inferred.
  - Understanding focus (DE): Die Materialdeutung belegt keine selbst ausgeführte Elektrolyse und ist keine private Durchführungsempfehlung.
  - Understanding focus (EN): Interpreting the material establishes no personally executed electrolysis and is no recommendation for private execution.
## Page 17: Stoffkreisläufe mit Reaktionen und physikalischen Vorgängen beschreiben

- Full learning-goal ID: `c0f1bf09-5a70-5006-b1e9-e91f786a63bf`
- Goal fingerprint: `sha256:5f87b6ab5f6421d137d2ae244f112a6a01179b3387a0fa962b0bfd56bf0ee65e`
- Page fingerprint: `sha256:ad08f096f84c29d188e58342caf783a8a538374ccdaf9c9ed4d2c8ec8714d3e2`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann verschiedene Typen chemischer Reaktionen und physikalischer Vorgänge nutzen, um Stoffkreisläufe in Natur und Technik fachlich zu beschreiben.

### Visualization

/assets/goal-visualizations/chemie/c0f1bf09-5a70-5006-b1e9-e91f786a63bf/c0f1bf09-5a70-5006-b1e9-e91f786a63bf.png

- original digest: `sha256:65cdc6d849de53b37ee2c47909455f876844c4f48fc425c70a15194e40790e7c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Redoxbegriffe sicher anwenden — `04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162` (outside this book)
- Chemische Reaktionen von physikalischen Vorgängen unterscheiden — `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` (outside this book)

### Direct reverse prerequisites outside this book

- Kohlenstoff- und Kalkkreislauf mit Systemgrenzen erklären — `954e0574-c05b-5029-90e9-25f412c8c79a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:520df43e047315ea7bc4609547e404182c6e116d982cdeb3a14cd46e5e302616`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Ein Stoffkreislauf verbindet chemische Umwandlungen mit physikalischer Speicherung und Transport. Elemente bleiben in Reaktionsgleichungen erhalten; ein Materialkreislauf ist kein geschlossener Energiekreislauf und keine Behauptung identischer Stoffformen.
  - Essential understanding (EN): A matter cycle links chemical conversion with physical storage and transport. Elements are conserved in equations; a material cycle is neither a closed energy cycle nor a claim of identical substance forms.
  - Observable performance (DE): Ein C-Atom kann aus Luft-CO2 in gelöstes CO2 übergehen: physikalischer Stofftransport bei Erhalt der Molekülart. Photosynthese bindet dieses C in organischem Material; Atmung oxidiert es zurück zu CO2. Beide sind chemische Redoxumwandlungen und ihre Summengleichungen erhalten die C-Atomzahl. Lichtenergie wird in chemische Energie überführt; Atmung setzt Energie frei, ein Teil wird schließlich als Wärme verteilt. Die Stoffformen wechseln, während das Element erhalten bleibt. Die beiden Summenprozesse sind keine identischen Mechanismen rückwärts.
  - Observable performance (EN): A carbon atom may move from atmospheric CO2 into dissolved CO2: physical transport preserves the molecular species. Photosynthesis incorporates the carbon into organic material; respiration oxidizes it back to CO2. Both are chemical redox conversions and their overall equations conserve carbon atoms. Light energy is converted into chemical energy; respiration releases energy, part of which ultimately disperses as heat. Substance forms change while the element is conserved. The two overall processes are not identical mechanisms run backward.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): Kohlenstoffkreislauf durch Photosynthese, Atmung und CO2-Austausch gegenüber technischem Kalkkreislauf mit Kalzinierung, Hydratation und Carbonatisierung. Eine ausgeglichene Summenbilanz ersetzt keine reale Energie-, Emissions- oder Rückbindungsbilanz.
  - Essential understanding (EN): Carbon cycling through photosynthesis, respiration and CO2 exchange versus a technical lime cycle with calcination, hydration and carbonation. A balanced overall equation does not replace an actual energy, emissions or recapture assessment.
  - Observable performance (DE): Brennen, Hydratation und Carbonatisierung ändern die chemischen Stoffformen; Transport und bloße Verteilung ändern sie nicht. Calcium kehrt zu CaCO3 zurück, und die idealen Gleichungen erhalten alle Atome. Kalzinierung benötigt dennoch Wärme und setzt zunächst CO2 frei. Spätere Carbonatisierung kann CO2 binden, ist aber ohne Mengen-, Zeit- und Prozessdaten kein Nachweis vollständiger Rückbindung oder klimaneutraler Energieversorgung. Auch bei idealer Stoffbilanz bleibt Energie von außen nötig; real gehen Stoffmengen verloren oder verlassen das betrachtete System.
  - Observable performance (EN): Calcination, hydration and carbonation change chemical species; transport and mere dispersion do not. Calcium returns to CaCO3 and the ideal equations conserve all atoms. Calcination nevertheless needs heat and initially releases CO2. Later carbonation may bind CO2, but without amount, time and process data this does not prove complete recapture or climate-neutral energy supply. Even an ideal material balance requires external energy; real material may be lost or leave the chosen system.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: Kohlenstoffkreislauf durch Photosynthese, Atmung und CO2-Austausch gegenüber technischem Kalkkreislauf mit Kalzinierung, Hydratation und Carbonatisierung. / Carbon cycling through photosynthesis, respiration and CO2 exchange versus a technical lime cycle with calcination, hydration and carbonation.
- `model-boundary`: Eine ausgeglichene Summenbilanz ersetzt keine reale Energie-, Emissions- oder Rückbindungsbilanz. / A balanced overall equation does not replace an actual energy, emissions or recapture assessment.

**Application cases**

- `chem-next20-c0f1bf09-case-1`
  - Task demand (DE): Vorgegebenes idealisiertes Kohlenstoffmodell: 6 CO2 + 6 H2O → C6H12O6 + 6 O2 unter Licht; die umgekehrte Summenbilanz gilt für aerobe Zellatmung. Zusätzlich kann CO2 ohne chemische Reaktion zwischen Luft und gelöster CO2-Form im Wasser wechseln. Andere biochemische Zwischenprodukte und der Hydrogencarbonatpool sind hier nicht dargestellt. Beschreibe einen Weg eines Kohlenstoffatoms durch alle dargestellten Stationen, unterscheide chemische von physikalischen Schritten und erkläre, warum dabei Energie nicht im Kreis erhalten als Nutzenergie zurückkommt.
  - Task demand (EN): Supplied idealized carbon model: 6 CO2 + 6 H2O → C6H12O6 + 6 O2 under light; aerobic respiration has the reverse overall balance. CO2 can additionally move between air and dissolved molecular CO2 in water without a chemical reaction. Other biochemical intermediates and the bicarbonate pool are not represented here. Describe a carbon atom’s path through every represented stage, distinguish chemical and physical steps and explain why usable energy does not simply return cyclically.
  - Expected performance (DE): Ein C-Atom kann aus Luft-CO2 in gelöstes CO2 übergehen: physikalischer Stofftransport bei Erhalt der Molekülart. Photosynthese bindet dieses C in organischem Material; Atmung oxidiert es zurück zu CO2. Beide sind chemische Redoxumwandlungen und ihre Summengleichungen erhalten die C-Atomzahl. Lichtenergie wird in chemische Energie überführt; Atmung setzt Energie frei, ein Teil wird schließlich als Wärme verteilt. Die Stoffformen wechseln, während das Element erhalten bleibt. Die beiden Summenprozesse sind keine identischen Mechanismen rückwärts.
  - Expected performance (EN): A carbon atom may move from atmospheric CO2 into dissolved CO2: physical transport preserves the molecular species. Photosynthesis incorporates the carbon into organic material; respiration oxidizes it back to CO2. Both are chemical redox conversions and their overall equations conserve carbon atoms. Light energy is converted into chemical energy; respiration releases energy, part of which ultimately disperses as heat. Substance forms change while the element is conserved. The two overall processes are not identical mechanisms run backward.
  - Understanding focus (DE): Physikalisch ist hier nur der ausdrücklich eingegrenzte Austausch molekularen CO2; CO2-Reaktionen mit Wasser sind zusätzlich chemisch.
  - Understanding focus (EN): Only the explicitly bounded exchange of molecular CO2 is physical here; CO2 reactions with water are additional chemical processes.
- `chem-next20-c0f1bf09-case-2`
  - Task demand (DE): Frischer technischer Modellfall: CaCO3 → CaO + CO2 benötigt Wärmezufuhr; CaO + H2O → Ca(OH)2; Ca(OH)2 + CO2 → CaCO3 + H2O. Dazwischen wird Kalkpulver transportiert und mit Wasser verteilt. Für den Energiebedarf liegen keine Zahlen vor. Erkläre den Kalkkreislauf anhand der gegebenen Gleichungen und der physikalischen Zwischenschritte. Prüfe die Behauptung „Ein geschlossener Kalkkreislauf verursacht weder Energiebedarf noch CO2-Emissionen“.
  - Task demand (EN): Fresh technical model: CaCO3 → CaO + CO2 requires heat input; CaO + H2O → Ca(OH)2; Ca(OH)2 + CO2 → CaCO3 + H2O. Between stages lime powder is transported and dispersed in water. No numerical energy-demand data are supplied. Explain the lime cycle using the supplied equations and physical intermediate stages. Evaluate “A closed lime cycle entails neither energy use nor CO2 emissions.”
  - Expected performance (DE): Brennen, Hydratation und Carbonatisierung ändern die chemischen Stoffformen; Transport und bloße Verteilung ändern sie nicht. Calcium kehrt zu CaCO3 zurück, und die idealen Gleichungen erhalten alle Atome. Kalzinierung benötigt dennoch Wärme und setzt zunächst CO2 frei. Spätere Carbonatisierung kann CO2 binden, ist aber ohne Mengen-, Zeit- und Prozessdaten kein Nachweis vollständiger Rückbindung oder klimaneutraler Energieversorgung. Auch bei idealer Stoffbilanz bleibt Energie von außen nötig; real gehen Stoffmengen verloren oder verlassen das betrachtete System.
  - Expected performance (EN): Calcination, hydration and carbonation change chemical species; transport and mere dispersion do not. Calcium returns to CaCO3 and the ideal equations conserve all atoms. Calcination nevertheless needs heat and initially releases CO2. Later carbonation may bind CO2, but without amount, time and process data this does not prove complete recapture or climate-neutral energy supply. Even an ideal material balance requires external energy; real material may be lost or leave the chosen system.
  - Understanding focus (DE): Eine ausgeglichene Summenbilanz ersetzt keine reale Energie-, Emissions- oder Rückbindungsbilanz.
  - Understanding focus (EN): A balanced overall equation does not replace an actual energy, emissions or recapture assessment.
## Page 18: Enzymkinetik vertiefen

- Full learning-goal ID: `c245d5fd-ce46-5b45-ab2e-e610547b5f7c`
- Goal fingerprint: `sha256:0303b506eced889b657e909a37df554bb34223dab5a83e0b0cabc74515e5f1f2`
- Page fingerprint: `sha256:d6359c84f0e632d847aa5b05f1602bcff6a6f7b115c9362a1ab1aba4d547184e`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Zusammenhang zwischen Substratkonzentration und Anfangsgeschwindigkeit im einfachen Michaelis-Menten-Modell anhand von Sättigung, maximaler Geschwindigkeit Vmax und Michaelis-Konstante Km deuten.

### Visualization

/assets/goal-visualizations/chemie/c245d5fd-ce46-5b45-ab2e-e610547b5f7c/c245d5fd-ce46-5b45-ab2e-e610547b5f7c.jpg

- original digest: `sha256:0e23a47770648af1aefb6e7633a592af004cef900e993595649dd37cce097d1e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Proteinstruktur und Faltung — `065d764c-daec-5d35-95da-3e922d2029c7` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Enzymkinetik vertiefen — `967fcb02-09cf-51b4-9840-37b0fc8345a6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b50fcc84a19ce3a3284c9d492cf57bbd49b81e448049b8636e39f2f8693f4bc4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `data`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Im einfachen Ein-Substrat-Modell gilt v=Vmax[S]/(Km+[S]) für Anfangsraten unter festgehaltenen Bedingungen. Bei [S]=Km ist v=Vmax/2; für große [S] nähert sich v dem Vmax, ohne eine Produktmenge zu beschreiben.
  - Essential understanding (EN): In the simple single-substrate model v=Vmax[S]/(Km+[S]) describes initial rates under fixed conditions. At [S]=Km, v=Vmax/2; at large [S], v approaches Vmax and does not describe an amount of product.
  - Observable performance (DE): Deutet den niedrigen Substratbereich, Halbsättigung und Sättigung an Kurve oder Daten und berechnet gegebenenfalls Modellraten mit konsistenten Konzentrations- und Rateneinheiten.
  - Observable performance (EN): Interprets the low-substrate region, half-saturation and saturation in a curve or data and, where requested, calculates model rates using consistent concentration and rate units.
- `fresh-transfer`
  - Essential understanding (DE): Bei gleicher Substratkonzentration und unveränderten übrigen Bedingungen skaliert die aktive Enzymmenge Vmax und v, während Km im einfachen Modell gleich bleibt. Dieser Schluss setzt vergleichbare Anfangsbedingungen voraus.
  - Essential understanding (EN): At equal substrate concentration and otherwise unchanged conditions, active enzyme amount scales Vmax and v while Km remains unchanged in the simple model. This inference requires comparable initial conditions.
  - Observable performance (DE): Erklärt an einer neuen Enzymmengenvariation die geänderte Maximalrate und den gleichen Halbsättigungspunkt und begrenzt die Aussage bei Inaktivierung, Mehrsubstratsystemen oder längeren Zeitverläufen.
  - Observable performance (EN): For a fresh enzyme-amount variation, explains the changed maximum rate and unchanged half-saturation point and limits the claim for inactivation, multisubstrate systems or longer time courses.

**Coverage expectations**

- required expectations: `structure-and-evidence`, `fresh-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `substrate-regime`: Niedrige, halbmaximale und hohe Substratkonzentration innerhalb desselben einfachen Anfangsratenmodells unterscheiden. / Distinguish low, half-maximal and high substrate concentrations within the same simple initial-rate model.
- `active-enzyme-amount`: Aktive Enzymmenge bei gleicher Substratkonzentration, Temperatur und gleichem pH verändern; Modellgrenzen prüfen. / Change active enzyme amount at equal substrate concentration, temperature and pH; examine model limits.

**Application cases**

- `case-a`
  - Task demand (DE): Synthetisches Ein-Substrat-Anfangsratenmodell; keine Messung oder Durchführung. [S] und Km in mmol/L, v und Vmax in µmol/(L·s); konstante Temperatur, konstanter pH und innerhalb einer Reihe gleiche aktive Enzymmenge. Für v=Vmax[S]/(Km+[S]) mit Vmax=100 und Km=2 berechne/deute Raten bei [S]=0.5,2,8 in konsistenten Einheiten.
  - Task demand (EN): Synthetic single-substrate initial-rate model; no measurement or execution. [S] and Km in mmol/L, v and Vmax in µmol/(L·s); constant temperature and pH and equal active enzyme amount within a series. For v=Vmax[S]/(Km+[S]), Vmax=100 and Km=2, compute/interpret rates at [S]=0.5,2,8 using consistent units.
  - Expected performance (DE): 20,50,80; bei Km ist v=Vmax/2, bei hoher Konzentration nähert sich die Rate Vmax. Dies sind Anfangsraten, keine Produktmengen.
  - Expected performance (EN): 20,50,80; at Km rate is half Vmax and high concentration approaches Vmax. These are initial rates, not product amounts.
  - Understanding focus (DE): Michaelis-Menten beschreibt Anfangsraten im einfachen Ein-Substrat-Modell mit konstanten Bedingungen.
  - Understanding focus (EN): Michaelis-Menten describes initial rates in a simple single-substrate model under fixed conditions.
- `case-b-transfer`
  - Task demand (DE): Synthetisches Ein-Substrat-Anfangsratenmodell; keine Messung oder Durchführung. [S] und Km in mmol/L, v und Vmax in µmol/(L·s); konstante Temperatur, konstanter pH und innerhalb einer Reihe gleiche aktive Enzymmenge. Zwei Messreihen haben gleiche Km, aber die zweite doppelte Vmax. Deute dies für ein einfaches Modell mit doppelter aktiver Enzymmenge und nenne eine Gültigkeitsgrenze.
  - Task demand (EN): Synthetic single-substrate initial-rate model; no measurement or execution. [S] and Km in mmol/L, v and Vmax in µmol/(L·s); constant temperature and pH and equal active enzyme amount within a series. Two datasets share Km but the second has twice Vmax. Interpret using doubled active enzyme amount and state a validity limit.
  - Expected performance (DE): Bei gleichen übrigen Bedingungen verdoppelt sich Rate; Km bleibt modellhaft gleich. Mehrsubstratsysteme, starke Inaktivierung oder Zeitkurven sind nicht automatisch durch diesen einfachen Ansatz beschrieben.
  - Expected performance (EN): At equal other conditions rate doubles while model Km stays unchanged. Multi-substrate systems, strong inactivation or time courses are not automatically described.
  - Understanding focus (DE): Michaelis-Menten beschreibt Anfangsraten im einfachen Ein-Substrat-Modell mit konstanten Bedingungen.
  - Understanding focus (EN): Michaelis-Menten describes initial rates in a simple single-substrate model under fixed conditions.
## Page 19: Alkoholmonomere durch nukleophile Substitution erklären

- Full learning-goal ID: `c3077d95-f3fe-5579-8493-cb92992809c4`
- Goal fingerprint: `sha256:907bcf637516f4b057c9125dc6b0cf078b8f58e6754dc159e1af9f347237864d`
- Page fingerprint: `sha256:952b92e668099c6f0bb92a382772585ed5caf2fc0acc2675e357c1bcc590a3d5`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Bildung eines für Polyester geeigneten Alkoholmonomers aus einem vorgegebenen einfachen Halogenalkan mechanistisch als nukleophile Substitution mit Strukturformeln und Elektronenpaarpfeilen darstellen und dabei den Angriff des Nukleophils, die Abgangsgruppe und die entstehenden Hydroxygruppen erläutern.

### Visualization

/assets/goal-visualizations/chemie/c3077d95-f3fe-5579-8493-cb92992809c4/c3077d95-f3fe-5579-8493-cb92992809c4.png

- original digest: `sha256:08daed17a8c6e80b364afc83ed1b14e773136726b63efd217e09bebf372d7da3`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Halogenalkan-Hydroxid-Reaktionsgleichungen formulieren — `d4928773-3be8-5cf1-907c-ef07c96751e8` (outside this book)

### Direct reverse prerequisites outside this book

- Diolbausteine durch zwei Substitutionsschritte erschließen — `71ebedcf-e1ef-52cc-957c-0a81bf479a78` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3a931cd1af9774254c3b1eb833cbf4fc3b7a1b58d9e9bc242edd88f3a0191c18`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Beide Angriffe korrekt vom O-Paar zum jeweils elektrophilen C; keine H→C-Pfeile.
  - Essential understanding (EN): Both attacks correctly start at an O pair and end at the appropriate electrophilic C; no H→C arrows.
  - Observable performance (DE): Beide Angriffe korrekt vom O-Paar zum jeweils elektrophilen C; keine H→C-Pfeile. Zwei korrekte Angriff-/Abgangs-Pfeilpaare am neuen Strukturfall.
  - Observable performance (EN): Both attacks correctly start at an O pair and end at the appropriate electrophilic C; no H→C arrows. Two correct attack/departure arrow pairs for the new structure.
- `e2`
  - Essential understanding (DE): Beide C–Br-Paare gehen zum Br; Zwischenprodukt, Atome und Ladung−2 beidseitig stimmen.
  - Essential understanding (EN): Both C–Br pairs move to Br; intermediate, atoms and−2 charge on both sides are correct.
  - Observable performance (DE): Beide C–Br-Paare gehen zum Br; Zwischenprodukt, Atome und Ladung−2 beidseitig stimmen. Struktur-/Gesamtgleichung, Zwischenprodukt und Ladungs-/Atombilanz korrekt.
  - Observable performance (EN): Both C–Br pairs move to Br; intermediate, atoms and−2 charge on both sides are correct. Correct structural/overall equation, intermediate and charge/atom balance.
- `e3`
  - Essential understanding (DE): Zwei C–O-Bindungen, zwei OH-Enden und deren Polyester-Monomerfunktion begründet.
  - Essential understanding (EN): Two C–O bonds, two OH ends and their polyester-monomer function explained.
  - Observable performance (DE): Zwei C–O-Bindungen, zwei OH-Enden und deren Polyester-Monomerfunktion begründet. X mit einer OH-Gruppe vom fertigen Diol unterschieden; zweiter Schritt und Monomerfunktion erklärt.
  - Observable performance (EN): Two C–O bonds, two OH ends and their polyester-monomer function explained. X with one OH distinguished from the complete diol; second step and monomer function explained.
- `e4`
  - Essential understanding (DE): Bromethan→Ethanol mechanistisch übertragen; monofunktionelle Endbegrenzung statt gleicher Diolbrücke erläutert.
  - Essential understanding (EN): Bromoethane→ethanol transferred mechanistically; monofunctional end capping rather than the same diol bridge explained.
  - Observable performance (DE): Bromethan→Ethanol mechanistisch übertragen; monofunktionelle Endbegrenzung statt gleicher Diolbrücke erläutert. H-Pfeil, bloße Gesamtgleichung und Mengenverteilungsbehauptung begründet korrigiert; Restwechsel übertragen.
  - Observable performance (EN): Bromoethane→ethanol transferred mechanistically; monofunctional end capping rather than the same diol bridge explained. H arrow, bare overall equation and molecular-distribution claim corrected with reasons; changed chain transferred.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-substrate-or-information`: Gestoppte Struktur und geänderte Kettenlänge verlangen eine neue Funktionalitäts-/Mechanismusbegründung. / Stopped structure and changed chain length require a new functionality/mechanism explanation.

**Application cases**

- `case-1`
  - Task demand (DE): Zeige beide Substitutionsschritte mit Strukturformeln und je zwei Elektronenpaarpfeilen. Erkläre Nukleophil, angegriffenes C und Abgangsgruppe. Formuliere Zwischenprodukt, Gesamtgleichung und Ladungsbilanz. Begründe die Diol-Monomereignung. Übertrage den Mechanismus auf Bromethan und erkläre, weshalb dessen Alkoholprodukt nicht dieselbe zweifunktionelle Brücke bildet. Eine Gesamtgleichung allein reicht nicht als Mechanismus.
  - Task demand (EN): Show both substitutions with structural formulae and two electron-pair arrows for each. Explain the nucleophile, attacked C and leaving group. Write the intermediate, overall equation and charge balance. Justify suitability as a diol monomer. Transfer the mechanism to bromoethane and explain why its alcohol product does not provide the same bifunctional bridge. An overall equation alone is not a mechanism.
  - Expected performance (DE): Ein freies Paar des OH−-O geht zum endständigen C; gleichzeitig geht das C–Br-Paar zum Br. Zuerst entstehen HO–(CH2)6–Br und Br−, nach demselben Vorgang am anderen Ende HO–(CH2)6–OH und Br−. Gesamt: Br–(CH2)6–Br+2 OH− → HO–(CH2)6–OH+2 Br−. Atome erhalten, Gesamtladung jeweils−2. Die O–H-Bindung bleibt erhalten; das OH−-Modell braucht keinen zusätzlichen Protonentransfer. Zwei neue C–O-Bindungen schaffen zwei OH-Enden für zwei mögliche Esterverknüpfungen. Bromethan liefert mit derselben lokalen Pfeilfolge Ethanol+Br−. Ethanol besitzt nur eine OH-Gruppe und begrenzt in der vorgegebenen Route ein Kettenende statt dieselbe Diolbrücke zu bilden. Daraus folgt keine reale Ausbeute oder vollständig untersuchte Reaktionsführung.
  - Expected performance (EN): An OH− oxygen lone pair goes to the terminal C while the C–Br pair goes to Br. First HO–(CH2)6–Br and Br− form, then the same process at the other end gives HO–(CH2)6–OH and Br−. Overall: Br–(CH2)6–Br+2 OH− → HO–(CH2)6–OH+2 Br−. Atoms are conserved and total charge is−2 on each side. The O–H bond remains; this OH− model requires no additional proton transfer. Two new C–O bonds create two OH ends for two potential ester links. The same local arrow sequence converts bromoethane into ethanol+Br−. Ethanol has only one OH and caps a chain end in the specified route instead of making the same diol bridge. No real yield or complete reaction-control knowledge follows.
  - Understanding focus (DE): Gleiche lokale Reaktion bei anderer Ausgangsfunktionalität verändert die Monomereignung.
  - Understanding focus (EN): The same local reaction with changed starting functionality changes monomer suitability.
- `case-2`
  - Task demand (DE): Entwickle beide lokalen Elektronenpaar-Pfeilfolgen und die ausgeglichene Gesamtgleichung. Erkläre X und den noch nötigen Schritt zum vollständigen Diol. Beurteile die Monomereignung von X, korrigiere beide Skizzen und übertrage die Erklärung auf die gegenüber Fall1 geänderte Kettenlänge. Prüfe zusätzlich die Behauptung: Ein OH−-Äquivalent je Dihalogenalkan beweist, dass jedes Molekül genau als X vorliegt.
  - Task demand (EN): Develop both local electron-pair arrow sequences and the balanced overall equation. Explain X and the remaining step to the complete diol. Judge X’s monomer suitability, correct both sketches and transfer the explanation to the changed chain length from case1. Also evaluate the claim that one OH− equivalent per dihaloalkane proves every molecule is exactly X.
  - Expected performance (DE): Je O-Paar→primärer C und C–Br-Paar→Br ergibt Br–(CH2)3–Br+2 OH− → HO–(CH2)3–OH+2 Br−, Gesamtladung−2 auf beiden Seiten. X besitzt erst eine OH-Gruppe und noch eine C–Br-Gruppe; die zweite Substitution erzeugt das zweite OH-Ende. X ist daher im angegebenen Verfahren noch nicht derselbe Diolbaustein. Der Pfeil beginnt am O-Paar, nicht am H. Die Gesamtgleichung zeigt die Bilanz, aber nicht beide lokalen Elektronenpaarbewegungen. Der kürzere Rest ändert in diesem Modell nicht die Anzahl der erforderlichen Endsubstitutionen. Ein Äquivalent liefert allein keine Information über die Molekülverteilung: un-, einfach und zweifach umgesetzte Teilchen können vorliegen. Die hier gegebene Identität von X wird nicht aus dieser Mengenbehauptung abgeleitet.
  - Expected performance (EN): Each O-pair→primary C and C–Br-pair→Br gives Br–(CH2)3–Br+2 OH− → HO–(CH2)3–OH+2 Br−, total charge−2 on both sides. X has only one OH and still one C–Br; the second substitution creates the second OH end. In the specified process X is therefore not yet the same diol component. The arrow starts at an O pair, not H. The overall equation balances matter but does not show both local electron-pair movements. The shorter chain does not change the number of terminal substitutions required in this model. One equivalent alone cannot establish molecular distribution: unreacted, singly and doubly converted species may occur. X’s supplied identity is not inferred from that amount claim.
  - Understanding focus (DE): Gestoppte Struktur und geänderte Kettenlänge verlangen eine neue Funktionalitäts-/Mechanismusbegründung.
  - Understanding focus (EN): Stopped structure and changed chain length require a new functionality/mechanism explanation.
## Page 20: Pufferwirkung experimentell untersuchen

- Full learning-goal ID: `c61b2a7a-fb0f-5a76-92e9-771c789fa816`
- Goal fingerprint: `sha256:e91463bdecca10760ab77ad507be0745552caa295b2e7fb158193190004301c8`
- Page fingerprint: `sha256:b29cef7bf4c76177c75699246e5f5ce353f93d3e0ade4c5835fab12e03e34014`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann unter fachlicher Aufsicht eine vergleichende Untersuchung der Reaktion eines Puffers und einer ungepufferten Lösung auf begrenzte Säure- und Basenzugaben planen und durchführen, eigene pH-Messwerte dokumentieren und die beobachteten Änderungen mithilfe korrespondierender Säure-Base-Paare und endlicher Pufferreserven erklären.

### Visualization

/assets/goal-visualizations/chemie/c61b2a7a-fb0f-5a76-92e9-771c789fa816/c61b2a7a-fb0f-5a76-92e9-771c789fa816.png

- original digest: `sha256:1224035b1fced589ce3dc98b33d6a86a260a5f70eaa8319df00c5974db6b1c06`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Säure-Base-Puffer erklären, auswählen und bewerten — `25729c34-33d5-553a-a723-046113a7da47` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Pufferwirkung experimentell untersuchen — `b82c892b-36e2-5d8c-a96a-6ba5e77cd755` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f09b210a860ae0e509e20f043d446541a86aee938ba25677225ca0780f20f6bf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `practical-buffer-p1-r1`
  - Essential understanding (DE): Ein fairer Vergleich isoliert Pufferwirkung durch kontrollierte Proben, Dosen und Messbedingungen.
  - Essential understanding (EN): A fair comparison isolates buffering through controlled samples, doses and measurement conditions.
  - Observable performance (DE): Vergleichsfrage, Kontrollbedingungen und Herstellung sind fachlich begründet.
  - Observable performance (EN): Justify the question, controls and preparation.
- `practical-buffer-p1-r2`
  - Essential understanding (DE): Experimentelle Pufferwirkung verlangt persönlich erhobene Rohdaten und beobachtete Handlungen.
  - Essential understanding (EN): Experimental buffering requires personally acquired raw data and observed actions.
  - Observable performance (DE): Eigene Messreihen und Handlungen liegen als Rohprotokoll mit Aufsichtsbeobachtung vor.
  - Observable performance (EN): Provide personal raw series and supervisor observation of actions.
- `practical-buffer-p1-r3`
  - Essential understanding (DE): Beide konjugierten Partner fangen unterschiedliche Lasten ab; die Deutung muss zu den eigenen Daten passen.
  - Essential understanding (EN): The two conjugate partners consume different loads; interpretation must fit personal data.
  - Observable performance (DE): Graphischer Vergleich und beide Reaktionen erklären echte Daten ohne Sollwertersatz.
  - Observable performance (EN): Plots and both reactions explain actual data without target substitution.
- `practical-buffer-p1-r4`
  - Essential understanding (DE): Beobachtete Wirkung bleibt an endliche Dosen und Bedingungen gebunden.
  - Essential understanding (EN): Observed action remains bounded by finite doses and conditions.
  - Observable performance (DE): Schlussfolgerungen bleiben auf endliche Dosen begrenzt und trennen Beobachtung von Kapazitätsdesign.
  - Observable performance (EN): Limit conclusions to finite doses and distinguish observations from capacity design.

**Coverage expectations**

- required expectations: `practical-buffer-p1-r1`, `practical-buffer-p1-r2`, `practical-buffer-p1-r3`, `practical-buffer-p1-r4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `load-direction-control`: Säure- und Basenzugaben an getrennten Puffer- und Wasserportionen vergleichen. / Compare acid/base additions in separate buffer and water portions.
- `dose-and-evidence`: Endliche Dosen und tatsächliche Beobachtungen statt unbegrenzter Pufferbehauptung prüfen. / Assess finite doses and actual observations rather than claiming unlimited buffering.

**Application cases**

- `practical-buffer-acid-control`
  - Task demand (DE): Plane und führe im freigegebenen PRACTICAL-BUFFER-P1 die Säurelast an20,00-mL-Puffer und Wasser getrennt aus; protokolliere eigene stabile pH-Werte und Kontrollen.
  - Task demand (EN): Plan and carry out the authorised PRACTICAL-BUFFER-P1 acid-loading comparison of separate20.00-mL buffer/water portions, recording own stable pH values and controls.
  - Expected performance (DE): Vergleichbare Volumina, Titrantstärke, Dosen, Temperatur und Methode erlauben einen begrenzten Vergleich. Acetat fängtH3O+ ab; die gezeichnetenΔpH beruhen auf eigenen Rohwerten, nicht Erwartungen. Aufsicht bestätigt tatsächliche Handlungen.
  - Expected performance (EN): Comparable volumes, titrant strength, doses, temperature and method support a bounded comparison. Acetate consumesH3O+; plottedΔpH must use own raw readings, not targets. Supervision confirms actual actions.
  - Understanding focus (DE): Faire Kontrolle und eigene Daten zur Säureabfangreaktion.
  - Understanding focus (EN): Fair controls and personal data for acid buffering.
- `practical-buffer-base-control`
  - Task demand (DE): Übertrage den Messplan auf getrennte Basenlast an Puffer/Wasser, erkläre beide Reaktionen und begrenze die Folgerungen aus den tatsächlichen Dosen.
  - Task demand (EN): Transfer the plan to separate base loading of buffer/water, explain both reactions and bound conclusions to actual doses.
  - Expected performance (DE): Essigsäure bindetOH− und bildet Acetat/Wasser. Je Portion sind formal0,500 mmol Partner vorhanden, die größte vorgegebene Last0,100 mmol. Eigene Daten entscheiden über Beobachtungen; sie beweisen weder unbegrenzte Reserve noch ein vollständiges Kapazitätsdesign.
  - Expected performance (EN): Acetic acid consumesOH− to form acetate/water. Each portion has0.500 mmol of each partner and a largest specified dose of0.100 mmol. Own data decide observations; these show neither infinite reserve nor a complete capacity design.
  - Understanding focus (DE): Geänderte Reaktionsrichtung mit eigenem Versuch; keine zusätzliche Erschöpfungs- oder Differentialrechnungspflicht.
  - Understanding focus (EN): Changed reaction direction through personal experiment; no added compulsory depletion/differential calculation.
