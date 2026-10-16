# AI review input: Chemie – gezielte Nachprüfung dreizehn tatsächlich betroffener Buchkontexte

- Book ID: `chemie-memory-selection-current422-native13-context-20261015-v2`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:91320f9618e29480743b703a59842e51ed8033beffda07b71fbe8f34e2bfff4b`
- Selected goals: 13

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Chemische Symbole und Formeln sicher nutzen

- Full learning-goal ID: `e7c363d4-e02d-4895-8750-ba62c2eb63fe`
- Goal fingerprint: `sha256:0e8bfe30c9724c2e806c68df8a187185fbcf22afaddfda50281beeb8c26a36e9`
- Page fingerprint: `sha256:60731fbb3d45f24cfe3f52fb128d8dee63a7f763ddb46f3bcf40f480009ba215`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemische Symbolsprache und Anwendung (Sek I)

### Canonical description

Die lernende Person kann chemische Symbole deuten und Molekülformeln einfacher Verbindungen fachlich korrekt bilden.

### Visualization

/assets/goal-visualizations/chemie/e7c363d4-e02d-4895-8750-ba62c2eb63fe/e7c363d4-e02d-4895-8750-ba62c2eb63fe.jpg

- original digest: `sha256:249ef9c54f1f62e65e1bab38cef98dc2d6bdef76bd5e294085a833004bc1ab90`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Stoffmenge und Einheit Mol nutzen — `1dc15fa2-fca4-56b0-b5c1-4d215613dde0` (page 2)

### Prerequisites outside this book

- Dalton-Modell und Modellcharakter erläutern — `9b5d6326-d27c-4ece-8c72-debda705464a` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Chemische Grundlagen — `1e372b97-6f1c-596c-8a8b-fc03193d784a` (outside this book)
- Lernkarten - Chemische Grundlagen – Kursauswahl — `cf423d0f-682f-588b-8c24-688c67d28f7a` (outside this book)
- Chemische Fach- und Symbolsprache ebenengerecht verwenden — `95dc0ee5-a0af-5682-af32-d66e36fbeb50` (outside this book)
- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)
- Molare Masse bestimmen und verwenden — `8a2ad724-df5e-5986-8de9-560ba43caac2` (outside this book)
- Zweiatomigkeit gasfoermiger Elementmolekuele begruenden — `d629220a-8c1e-58ee-a6e1-b5f4f10e2e7a` (outside this book)
- Relative Atommassen und Molekülformeln aus Daten bestimmen — `e675fa94-6e23-59c0-b376-4340bf44c00e` (outside this book)
- Ionen als Ladungsträger erklären — `4285d84a-2c9a-4d51-8250-8bed4daf2d2e` (outside this book)
- Molekulare und ionogene Verbindungen unterscheiden — `79db6d68-b402-5563-a348-f2784fed8867` (outside this book)
- Qualitative Elementaranalyse von Kohlenwasserstoffen auswerten — `ddb76915-4d63-5375-901d-4e659f5e9b09` (outside this book)
- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6b1392e002721be0b16d11c24b4bb2cd146d58dff9c05fdab017b5eef341b630`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b005-e7c363d4-core`
  - Essential understanding (DE): Elementsymbole bezeichnen Atomsorten; eine Molekülformel legt Art und Anzahl der Atome in einem Molekül fest. Indizes zählen Atome pro Molekül, Koeffizienten vervielfachen ganze Teilchen; Groß- und Kleinschreibung ändern Symbole.
  - Essential understanding (EN): Element symbols identify atom types; a molecular formula fixes the types and numbers of atoms in one molecule. Subscripts count atoms per molecule, coefficients multiply whole particles; capitalization changes symbols.
  - Observable performance (DE): Die lernende Person liest neue Symbol-/Formelpaare, bildet aus einem Teilchenbild die Formel und korrigiert eine Verwechslung von Index und Koeffizient.
  - Observable performance (EN): The learner reads fresh symbol/formula pairs, forms a formula from a particle diagram and corrects a subscript/coefficient mix-up.

**Coverage expectations**

- required expectations: `b005-e7c363d4-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `direction`: Formel→Teilchenzahl und Teilchenbild→Formel werden gewechselt. / Formula-to-particle count and particle-diagram-to-formula directions alternate.
- `notation`: Elementschreibweise, Index und Koeffizient werden variiert. / Element case, subscript and coefficient are varied.

**Application cases**

- `ammonia-particle-cards`
  - Task demand (DE): Neue Karten zeigen einzelne N- und H-Atome sowie ein Teilchen mit einem N- und drei H-Atomen. Schreibe die einfache Molekülformel und erkläre den Unterschied zwischen N, H und NH3.
  - Task demand (EN): Fresh cards show separate N and H atoms and a particle with one N and three H atoms. Write its simple molecular formula and explain N, H and NH3.
  - Expected performance (DE): Die lernende Person schreibt NH3, zählt ein N und drei H pro Molekül und liest N/H als Elementsymbole; sie schreibt nicht N3H wegen drei H-Atomen.
  - Expected performance (EN): The learner writes NH3, counts one N and three H per molecule and reads N/H as element symbols; they do not write N3H because of the three H atoms.
  - Understanding focus (DE): Neues Molekül prüft Formeln aus Teilchenbildern.
  - Understanding focus (EN): A fresh molecule tests deriving formulas from particles.
- `fresh-carbon-monoxide-vs-two`
  - Task demand (DE): Eine neue Zeichnung zeigt zwei getrennte CO-Moleküle, eine andere ein einzelnes CO2-Molekül. Schreibe zu beiden die passende Notation und begründe die unterschiedlichen Atomzahlen.
  - Task demand (EN): A fresh drawing shows two separate CO molecules and another shows one CO2 molecule. Write the correct notation for each and explain the different atom counts.
  - Expected performance (DE): Die lernende Person schreibt 2 CO gegenüber CO2, zählt im ersten Fall zwei C und zwei O insgesamt, im zweiten ein C und zwei O in einem Molekül und ändert keine Elementsymbol-Großschreibung.
  - Expected performance (EN): The learner writes 2 CO versus CO2, counts two C and two O in total for the first, one C and two O in one molecule for the second, and preserves element-symbol capitalization.
  - Understanding focus (DE): Index und Koeffizient liefern verschiedene Teilchenstrukturen.
  - Understanding focus (EN): Subscript and coefficient specify different particle structures.
## Page 2: Stoffmenge und Einheit Mol nutzen

- Full learning-goal ID: `1dc15fa2-fca4-56b0-b5c1-4d215613dde0`
- Goal fingerprint: `sha256:95794950e14a7e57d69408df3334a5085b41f2eebcea9f847132be28ea839ed3`
- Page fingerprint: `sha256:1e5f2009d84ed2136973b4193c864c3d9336f8340549f82c0ec5360a5c9a1042`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Stoffmenge, molare Groessen und Gase (Sek I)

### Canonical description

Die lernende Person kann die Stoffmenge als Maß für die Anzahl festgelegter Teilchen deuten und Stoffmengen eindeutig mit der Einheit Mol angeben.

### Visualization

/assets/goal-visualizations/chemie/1dc15fa2-fca4-56b0-b5c1-4d215613dde0/1dc15fa2-fca4-56b0-b5c1-4d215613dde0.png

- original digest: `sha256:1ca6842fdafa63d7c6edab1eceb18a151fef5eccfb7c07a0b8b4e8898c34c9e7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Chemische Symbole und Formeln sicher nutzen — `e7c363d4-e02d-4895-8750-ba62c2eb63fe` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Lernkarten - Chemische Grundlagen — `1e372b97-6f1c-596c-8a8b-fc03193d784a` (outside this book)
- Lernkarten - Chemische Grundlagen – Kursauswahl — `cf423d0f-682f-588b-8c24-688c67d28f7a` (outside this book)
- Molare Masse bestimmen und verwenden — `8a2ad724-df5e-5986-8de9-560ba43caac2` (outside this book)
- Atomare Masseneinheit und Grammbezug einordnen — `dd3fc8fe-2316-5fbc-b569-00651c83bc81` (outside this book)
- Avogadro-Konstante als Teilchenzahlbezug nutzen — `e45c0022-ac0d-5c83-b433-5f68655e382f` (outside this book)
- Avogadro-These fuer Gasvolumina erlaeutern — `1e5a4b89-69f1-5379-811e-c8ec76faad2a` (outside this book)
- Stoffumsätze einfacher Molekülreaktionen berechnen — `9f355f63-4fb7-5638-9538-6e8a246ec4b2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d86d8f6bb59682871865f576403c8fe948e3edc07ff4d9fbbc7b528c7eb602b8`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `specified-entities-and-mole`
  - Essential understanding (DE): Stoffmenge ist eine zählbezogene Größe mit Einheit mol für ausdrücklich benannte Elementarteilchen. Dieselbe Stoffmenge verschiedener Moleküle oder Atome bedeutet dieselbe Zahl dieser Einheiten, nicht gleiche Masse. Moleküle, Atome, Ionen und Formeleinheiten dürfen nicht stillschweigend ineinander umbenannt werden.
  - Essential understanding (EN): Amount of substance is a counting-related quantity measured in mol for explicitly specified elementary entities. Equal amounts of different molecules or atoms mean equal numbers of those entities, not equal masses. Molecules, atoms, ions and formula units must not be silently substituted for each other.
  - Observable performance (DE): Die lernende Person benennt die gezählte Einheit, übersetzt zwischen Molekülen/Formeleinheiten und enthaltenen Atomen/Ionen und erklärt, weshalb eine gleiche Zahl von Teilchenpaketen keine Aussage über gleiche Masse liefert.
  - Observable performance (EN): The learner specifies the counted entity, translates between molecules/formula units and constituent atoms/ions and explains why equal numbers of particle packages do not imply equal mass.

**Coverage expectations**

- required expectations: `specified-entities-and-mole`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `entity-kind`: Moleküle und einzelne Atome werden mit Ionen und Formeleinheiten kontrastiert. / Molecules and single atoms are contrasted with ions and formula units.
- `reference-count`: Gleiche Stoffmenge der Verbindungen wird mit unterschiedlicher Stoffmenge enthaltener Teilchen verglichen. / Equal compound amounts are compared with unequal amounts of constituent particles.

**Application cases**

- `oxygen-and-helium-packages`
  - Task demand (DE): Zwei Proben sind beschriftet: A enthält 0,20 mol O2-Moleküle, B enthält 0,20 mol He-Atome. Begründe, welche Teilchenzahlen gleich sind, wie viel mol O-Atome A enthält und ob die Beschriftung gleiche Massen beweist. Die genaue Zahl für ein mol brauchst du hier nicht auszurechnen.
  - Task demand (EN): Two samples are labelled: A contains 0.20 mol O2 molecules and B contains 0.20 mol He atoms. Explain which particle counts are equal, how many mol of O atoms A contains and whether the labels prove equal masses. You need not calculate the numerical count in one mol.
  - Expected performance (DE): A und B besitzen gleich viele jeweils benannte Elementarteilchen: O2-Moleküle bzw. He-Atome. A enthält 0,40 mol O-Atome. Die doppelte Atomzahl in A macht die Molekülstoffmenge nicht zu 0,40 mol O2; gleiche Stoffmenge beweist keine gleiche Masse.
  - Expected performance (EN): A and B contain equal numbers of their specified entities: O2 molecules and He atoms. A contains 0.40 mol of O atoms. Its doubled atom count does not make the molecular amount 0.40 mol O2; equal amount does not establish equal mass.
  - Understanding focus (DE): Gezählte Einheit, enthaltene Atome und Probenmasse werden begründet auseinandergehalten.
  - Understanding focus (EN): The counted entity, constituent atoms and sample mass are distinguished with reasons.
- `salt-formula-units-fresh`
  - Task demand (DE): Frischer Fall ohne Rechenweg: Ein NaCl-Kristall besteht aus Na+- und Cl−-Ionen im Verhältnis 1:1. Er enthält 0,30 mol NaCl-Formeleinheiten. Ein Mitschüler schreibt: „Das sind 0,60 mol NaCl-Moleküle.“ Beurteile die Aussage und formuliere korrekte Stoffmengenangaben für die Formeleinheiten, Na+-Ionen, Cl−-Ionen und alle Ionen zusammen.
  - Task demand (EN): Fresh case without a worked method: a NaCl crystal consists of Na+ and Cl− ions in a 1:1 ratio and contains 0.30 mol NaCl formula units. A classmate writes: “That is 0.60 mol NaCl molecules.” Evaluate the statement and give correct amounts for formula units, Na+ ions, Cl− ions and all ions together.
  - Expected performance (DE): 0,30 mol Formeleinheiten, 0,30 mol Na+-Ionen und 0,30 mol Cl−-Ionen; insgesamt 0,60 mol Ionen, mit ausdrücklich gemeinsamer gezählter Einheit „Ionen“. NaCl im Kristall besteht nicht aus isolierten NaCl-Molekülen; Anzahl der Bestandteile und Anzahl der Verhältnisformeleinheiten sind unterschiedliche Bezüge.
  - Expected performance (EN): There are 0.30 mol formula units, 0.30 mol Na+ ions and 0.30 mol Cl− ions, totalling 0.60 mol ions with the common counted entity explicitly stated. Crystalline NaCl is not composed of isolated NaCl molecules; constituent-ion count and formula-unit count use different reference entities.
  - Understanding focus (DE): Selbstständiger Wechsel zur Ionengitter-Darstellung, ohne eine molekulare Zählregel unbesehen zu übertragen.
  - Understanding focus (EN): Independent transfer to an ionic-lattice representation without blindly applying a molecular counting rule.
## Page 3: Periodensystem zur Strukturdeutung nutzen

- Full learning-goal ID: `e9d74940-1e0e-4511-9718-4851f49ad7a5`
- Goal fingerprint: `sha256:7dbc505266696e9687e2ff526b1afd2bdedd67bb9a817074ce5ff7ae560f6a48`
- Page fingerprint: `sha256:005d3f0f616f2932df8db597c5aeb8f308159f2d6b684b1a055ebb8c13974f2f`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Atombau, Bindungsmodelle, Molekülgeometrie und Polarität

### Canonical description

Die lernende Person kann Ordnungsprinzipien des Periodensystems anwenden, Ordnungszahl, Protonenzahl, Hauptgruppen und Valenzelektronenzahl entnehmen und daraus einfache Aussagen über Atome ableiten.

### Visualization

/assets/goal-visualizations/chemie/e9d74940-1e0e-4511-9718-4851f49ad7a5/e9d74940-1e0e-4511-9718-4851f49ad7a5.jpg

- original digest: `sha256:2c36e518cfe1c229b97fafba32ebb8c0d7528f4aecd8b0b79c0918d682e4a3a1`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Energiestufenmodell und Elektronenverteilung anwenden — `f5efab9d-2c61-44ea-b36a-87f873b51fd8` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Atombau und Bindung — `1e519951-9850-5a07-ac82-d9f0075e3d05` (outside this book)
- Lernkarten - Atombau und Bindung – Kursauswahl — `9321ef8b-e1d8-549e-83f4-1484e72d35f6` (outside this book)
- Ionenbildung mit der Edelgasregel deuten — `a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca` (outside this book)
- Orbitalmodell und Valenzstrichschreibweise anwenden — `e74f5301-70d3-5869-bd3d-79a5763a1718` (outside this book)
- Unterenergiestufen aus Spektren und Ionisierungsenergien ableiten — `49235cbe-6658-5e7e-8bd4-398416bcebdc` (outside this book)
- Bindungs- und Molekülpolarität ableiten — `747c5777-07d7-51a9-9be3-7d0d6f51d4e2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:877969531882c48eee6b6e83cb2ad18cbd54a7870c63b51d7a002631149cb571`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b006-e9d74940-core`
  - Essential understanding (DE): Die Ordnungszahl ist die Protonenzahl eines Atoms; im neutralen Atom entspricht sie auch der Elektronenzahl. Bei einfachen Hauptgruppenatomen deuten Hauptgruppe und Periode auf die Zahl der Außenelektronen und besetzten Schalen.
  - Essential understanding (EN): Atomic number is an atom’s proton count; in a neutral atom it also equals electron count. For simple main-group atoms, group and period indicate outer-electron and occupied-shell counts.
  - Observable performance (DE): Die lernende Person liest an zwei neuen neutralen Hauptgruppenatomen Ordnungszahl, Protonenzahl, Hauptgruppe, Außenelektronenzahl und Periode aus PSE-Daten und erklärt den Zusammenhang.
  - Observable performance (EN): The learner reads atomic number, proton count, main group, outer-electron count and period for two fresh neutral main-group atoms from periodic-table data and explains their relation.

**Coverage expectations**

- required expectations: `b006-e9d74940-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `element`: Hauptgruppe 15 und 2 unterscheiden Valenzelektronen und Perioden. / Main groups 15 and 2 vary valence electrons and periods.
- `period`: Dritte und vierte Periode erfordern unterschiedliche Zahlen besetzter Schalen bei neutralen Atomen. / Periods three and four require different occupied-shell counts in neutral atoms.

**Application cases**

- `phosphorus-periodic-table`
  - Task demand (DE): Ein PSE-Ausschnitt zeigt neutrales Phosphor-Atom P, Z=15, Hauptgruppe 15, Periode 3. Gib Protonen- und Elektronenzahl, Außenelektronen und einfache Schalenzahl an und begründe aus der Tabellenstellung.
  - Task demand (EN): A periodic-table excerpt shows neutral phosphorus P, Z=15, main group 15, period 3. State proton and electron counts, outer electrons and simple shell count, explaining each from its table position.
  - Expected performance (DE): P hat 15 Protonen und im neutralen Atom 15 Elektronen, fünf Außenelektronen und drei besetzte Schalen im einfachen Modell; die Ordnungszahl ist keine Neutronenzahl.
  - Expected performance (EN): Neutral P has 15 protons and 15 electrons, five outer electrons and three occupied shells in the simple model; atomic number is not neutron count.
  - Understanding focus (DE): PSE-Merkmale werden am neutralen Hauptgruppenatom verknüpft.
  - Understanding focus (EN): Periodic-table features are linked for a neutral main-group atom.
- `calcium-atom-transfer`
  - Task demand (DE): Ein neuer PSE-Ausschnitt zeigt neutrales Calcium Ca, Z=20, Hauptgruppe 2, Periode 4. Nenne Protonen- und Elektronenzahl sowie Außenelektronen und Schalen. Warum unterscheidet sich Ca von P?
  - Task demand (EN): A fresh excerpt shows neutral calcium Ca, Z=20, main group 2, period 4. State proton and electron counts plus outer electrons and shells. Why does Ca differ from P?
  - Expected performance (DE): Ca hat 20 Protonen und im neutralen Atom 20 Elektronen, zwei Außenelektronen und vier besetzte Schalen. Hauptgruppe und Periode erklären den Unterschied zu P; keine Ionenladung wird verlangt.
  - Expected performance (EN): Neutral Ca has 20 protons and 20 electrons, two outer electrons and four occupied shells. Group and period explain the difference from P; no ion charge is required.
  - Understanding focus (DE): Neue Hauptgruppe und Periode prüfen eigenständigen Tabellen-Transfer.
  - Understanding focus (EN): A new group and period test independent table transfer.
## Page 4: Molekülgeometrien mit dem EPA-Modell erklären

- Full learning-goal ID: `67cd332f-9db7-50e1-87f6-172ef3714300`
- Goal fingerprint: `sha256:5c261ab5f972606410b910dc51a1474146745b34de13192b6ec14d3c26e51002`
- Page fingerprint: `sha256:eff385cd08f776b9c85ad51e2280f50854f01a23c6fbc7e05a686ca2f6f09a59`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Atombau, Bindungsmodelle, Molekülgeometrie und Polarität

### Canonical description

Die lernende Person kann den räumlichen Bau einfacher Moleküle mithilfe des Elektronenpaarabstoßungsmodells erklären und mit Lewis- beziehungsweise Valenzstrichdarstellungen verknüpfen.

### Visualization

/assets/goal-visualizations/chemie/67cd332f-9db7-50e1-87f6-172ef3714300/67cd332f-9db7-50e1-87f6-172ef3714300.jpg

- original digest: `sha256:0f01bbbd432f46d431eeb2c07353521958af981ffc1c6397decd41d93175bd4d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Elektronenpaarbindung mit Orbitalüberlappung erklären — `bbe038e9-86ed-5ec6-ab33-316758ddb16d` (outside this book)
- Valenzstrichformeln und Mesomerie aufstellen — `23533087-89ea-5f29-8ec1-9f2e01197bb6` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Atombau und Bindung — `1e519951-9850-5a07-ac82-d9f0075e3d05` (outside this book)
- Lernkarten - Atombau und Bindung – Kursauswahl — `9321ef8b-e1d8-549e-83f4-1484e72d35f6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ccc3f2b99f62141486b6b1f51093748be7c22000b5b9f12f5dac5a6e33b2e4b0`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `b006-67cd332f-core`
  - Essential understanding (DE): Bindende und freie Elektronenbereiche um ein Zentralatom ordnen sich im EPA-Modell mit möglichst geringer Abstoßung. Elektronenbereichsgeometrie und sichtbare Atomgestalt sind verschieden; ein freies Paar wird nicht als Atom eingezeichnet.
  - Essential understanding (EN): Bonding and lone electron domains around a central atom arrange to reduce repulsion in VSEPR. Electron-domain geometry differs from the visible atomic shape; a lone pair is not drawn as an atom.
  - Observable performance (DE): Die lernende Person zählt an gegebenen Lewis-Strukturen Elektronenbereiche und freie Paare, leitet einfache Molekülgestalten ab und nennt Modellgrenzen statt aus exakten Winkeln zu raten.
  - Observable performance (EN): The learner counts electron domains and lone pairs in supplied Lewis structures, derives simple molecular shapes and names limits rather than guessing exact angles.

**Coverage expectations**

- required expectations: `b006-67cd332f-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `lone-pairs`: Null, ein und zwei freie Paare am Zentralatom verändern die Atomgestalt. / Zero, one and two central-atom lone pairs change molecular shape.
- `domain-number`: Zwei und vier Elektronenbereiche erzeugen unterschiedliche Grundanordnungen. / Two and four electron domains produce different base arrangements.

**Application cases**

- `water-carbon-dioxide`
  - Task demand (DE): Gegebene Lewis-Bilder zeigen H–O–H mit zwei freien O-Paaren und O=C=O ohne freie C-Paare. Begründe mit EPA die Molekülgestalten.
  - Task demand (EN): Supplied Lewis sketches show H–O–H with two O lone pairs and O=C=O with no C lone pairs. Explain molecular shapes using VSEPR.
  - Expected performance (DE): H2O hat vier O-Bereiche, aber nur zwei sichtbare Bindungspartner und ist gewinkelt; CO2 hat zwei C-Bereiche und ist linear. Doppelbindungen zählen je als ein Bereich.
  - Expected performance (EN): H2O has four O domains but only two bonded atoms and is bent; CO2 has two C domains and is linear. Each double bond counts as one domain.
  - Understanding focus (DE): Lewis→EPA mit zwei verschiedenen Domänenzahlen.
  - Understanding focus (EN): Lewis-to-VSEPR with two domain counts.
- `ammonia-methane-transfer`
  - Task demand (DE): Neue gegebene Lewis-Bilder: NH3 hat drei N–H-Bindungen und ein freies N-Paar; CH4 vier C–H-Bindungen ohne freies C-Paar. Vergleiche Atomgestalt, ohne exakte Winkel zu behaupten.
  - Task demand (EN): Fresh supplied Lewis sketches: NH3 has three N–H bonds and one N lone pair; CH4 has four C–H bonds and no C lone pair. Compare atomic shape without claiming exact angles.
  - Expected performance (DE): Beide haben vier Elektronenbereiche; NH3 ist trigonal-pyramidal, CH4 tetraedrisch. Das freie N-Paar ist kein vierter Bindungspartner; die Atomgestalt von NH3 bleibt trigonal-pyramidal.
  - Expected performance (EN): Both have four electron domains; NH3 is trigonal pyramidal while CH4 is tetrahedral. The N lone pair is not a fourth bonded atom; NH3 molecular shape remains trigonal pyramidal.
  - Understanding focus (DE): Gleiche Domänenzahl bei verschiedener Molekülgestalt testet freie Paare.
  - Understanding focus (EN): Same domain count with different molecular shapes tests lone-pair reasoning.
## Page 5: Alkane, Alkene und Alkine beschreiben

- Full learning-goal ID: `dd58c029-176f-5d99-923e-1c1fda6cf58e`
- Goal fingerprint: `sha256:d34d999eba9b81efc34e5c5847dafd12942cbb8fde255b9393478fb101a3703b`
- Page fingerprint: `sha256:a75880478af98c1b1a1ca3caa59357cf2a331f8abe7a52991fb48afbfe827fc0`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Einführungsphase Reaktionsgrundlagen > Einführung organische Verbindungen

### Canonical description

Die lernende Person kann Alkane, Alkene und Alkine nomenklatorisch korrekt benennen, Strukturformeln einschließlich Skelettformeln skizzieren, homologe Reihen bilden und einfache Isomerien unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/dd58c029-176f-5d99-923e-1c1fda6cf58e/dd58c029-176f-5d99-923e-1c1fda6cf58e.jpg

- original digest: `sha256:d11094c1dd8a6724fceef8c3a8dabb34d8e3c00e8bce1ed3956e6d5c33bc8480`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Sauerstoffhaltige organische Stoffklassen einteilen — `7990387d-f254-5d3b-a589-a3e7ed9502a3` (page 6)

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Einfache Ionengitter modellieren und Stoffeigenschaften erklären — `950c73c6-4ed1-488a-9267-1142e95e0055` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Organische Stoffklassen — `e3e8582a-976b-5f0f-b31b-3cf59a4fff24` (outside this book)
- Lernkarten - Organische Stoffklassen – Kursauswahl — `f6d7386c-dda4-501d-84da-0c881362e724` (outside this book)
- Radikalische Substitution nachvollziehen — `3be2d0b7-c22f-57d4-886a-10fc04a629f5` (outside this book)
- Rohstoffvorkommen reflektieren — `2be9e61a-88ea-56fe-8294-ee46e3c9a8ef` (outside this book)
- Funktionelle Gruppen qualitativ nachweisen — `3de28598-672f-5753-8a45-8f559c2f9dc2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c0ffc163b0b59385d46016f78e3373b05718d288ae1013033245c82a55298124`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `structure-model-reasoning`
  - Essential understanding (DE): Eine eindeutige Benennung und die Strukturformel legen die Kohlenstoffverknüpfung fest; die Summenformel gibt nur Atomarten und Atomzahlen an, nicht die Konnektivität. Homologe einer Reihe unterscheiden sich um CH2; Konstitutionsisomere haben dieselbe Summenformel bei verschiedener Verknüpfung.
  - Essential understanding (EN): An unambiguous name and the structural formula specify carbon connectivity; the molecular formula gives only atom types and atom counts, not connectivity. Homologues within a series differ by CH2; constitutional isomers have the same molecular formula with different connectivity.
  - Observable performance (DE): Benennung und eigene Struktur-/Skelettdarstellung stimmen in Valenzen und Mehrfachbindungen überein; die Person begründet Reihe und Isomerie aus der Struktur.
  - Observable performance (EN): Naming and independently drawn structural/skeletal representations agree in valence and multiple bonds; the learner justifies the series and isomerism using connectivity.
- `fresh-application-and-boundary`
  - Essential understanding (DE): Gleiche Summenformel genügt nicht für identische Konnektivität; Einfach-, Doppel- und Dreifachbindung dürfen nicht aus einer bloßen Zickzackform geraten werden.
  - Essential understanding (EN): The same molecular formula does not establish identical connectivity; single, double and triple bonds cannot be guessed from a zigzag alone.
  - Observable performance (DE): Pentan und 2-Methylbutan sind C5H12-Konstitutionsisomere. Pentan ist das nächste Homologe von Butan; Pent-1-en das nächste Homologe von But-1-en. Eigene Zeichnungen müssen die zusätzliche CH2-Einheit und erhaltene Bindungsordnung zeigen. Eine bloße andere Zeichenrichtung derselben Kette erzeugt kein weiteres Konstitutionsisomer.
  - Observable performance (EN): Pentane and 2-methylbutane are C5H12 constitutional isomers. Pentane is the next homologue of butane; pent-1-ene the next homologue of but-1-ene. Independent drawings show the extra CH2 unit and retained bond order. Merely drawing the same chain in another direction does not create another constitutional isomer.

**Coverage expectations**

- required expectations: `structure-model-reasoning`, `fresh-application-and-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-variation`: Unverzweigte und verzweigte C4/C5-Strukturen, Lage und Ordnung der Mehrfachbindung. / Linear and branched C4/C5 structures, position and order of multiple bonds.
- `counterexample`: Gleiche Summenformel genügt nicht für identische Konnektivität; Einfach-, Doppel- und Dreifachbindung dürfen nicht aus einer bloßen Zickzackform geraten werden. / The same molecular formula does not establish identical connectivity; single, double and triple bonds cannot be guessed from a zigzag alone.

**Application cases**

- `chem-current15-dd58c029-case-1`
  - Task demand (DE): Vier vollständige Strukturangaben: CH3-CH2-CH2-CH3; CH3-CH(CH3)-CH3; CH2=CH-CH2-CH3; HC≡C-CH2-CH3. Benenne, leite die Summenformeln her und stelle jedes Molekül als Skelettformel dar. Begründe, welche zwei Konstitutionsisomere sind.
  - Task demand (EN): Four complete structures: CH3-CH2-CH2-CH3; CH3-CH(CH3)-CH3; CH2=CH-CH2-CH3; HC≡C-CH2-CH3. Name the molecules, derive their formulas and draw each as a skeletal formula. Explain which two are constitutional isomers.
  - Expected performance (DE): Butan und 2-Methylpropan haben C4H10 bei verschiedener Verknüpfung; But-1-en hat C4H8 und But-1-in C4H6. Skelettenden/-ecken stehen für C, Mehrfachbindungen bleiben sichtbar.
  - Expected performance (EN): Butane and 2-methylpropane have C4H10 with different connectivity; but-1-ene has C4H8 and but-1-yne C4H6. Skeletal ends/vertices denote C and multiple bonds remain visible.
  - Understanding focus (DE): Die Formeln werden durch Valenzzählung begründet, nicht nur anhand auswendig gelernter Stoffklassenformeln geraten.
  - Understanding focus (EN): Formulas are justified by valence counting, not guessed solely from memorised class formulas.
- `chem-current15-dd58c029-case-2`
  - Task demand (DE): Frischer Fall: CH3-CH2-CH2-CH2-CH3 und CH3-CH(CH3)-CH2-CH3; außerdem CH2=CH-CH2-CH2-CH3. Ordne die homologen Beziehungen zu Fall 1 zu und erkläre, warum die ersten beiden Moleküle Isomere, nicht aufeinanderfolgende Homologe sind.
  - Task demand (EN): Fresh case: CH3-CH2-CH2-CH2-CH3 and CH3-CH(CH3)-CH2-CH3; also CH2=CH-CH2-CH2-CH3. Assign the homologous relationships to case 1 and explain why the first two molecules are isomers rather than consecutive homologues.
  - Expected performance (DE): Pentan und 2-Methylbutan sind C5H12-Konstitutionsisomere. Pentan ist das nächste Homologe von Butan; Pent-1-en das nächste Homologe von But-1-en. Eigene Zeichnungen müssen die zusätzliche CH2-Einheit und erhaltene Bindungsordnung zeigen.
  - Expected performance (EN): Pentane and 2-methylbutane are C5H12 constitutional isomers. Pentane is the next homologue of butane; pent-1-ene the next homologue of but-1-ene. Independent drawings show the extra CH2 unit and retained bond order.
  - Understanding focus (DE): Eine bloße andere Zeichenrichtung derselben Kette erzeugt kein weiteres Konstitutionsisomer.
  - Understanding focus (EN): Merely drawing the same chain in another direction does not create another constitutional isomer.
## Page 6: Sauerstoffhaltige organische Stoffklassen einteilen

- Full learning-goal ID: `7990387d-f254-5d3b-a589-a3e7ed9502a3`
- Goal fingerprint: `sha256:349da4fe6411645c8215be25716314458e0bf905833b0c3f6d18e0bf46b52c81`
- Page fingerprint: `sha256:7db0999c0822827b985bf84eb191895b6b9e17de181625bde4b81bff5c8d8711`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Einführungsphase Reaktionsgrundlagen > Einführung organische Verbindungen

### Canonical description

Die lernende Person kann Alkohole, Aldehyde, Ketone und Carbonsäuren anhand ihrer funktionellen Gruppen einteilen und alltags- oder techniknahe Vertreter dieser Stoffklassen zuordnen.

### Visualization

/assets/goal-visualizations/chemie/7990387d-f254-5d3b-a589-a3e7ed9502a3/7990387d-f254-5d3b-a589-a3e7ed9502a3.jpg

- original digest: `sha256:41659a15745a79c38287a4be6056eb004ded81971b3447889692784f23fdaf4c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Alkane, Alkene und Alkine beschreiben — `dd58c029-176f-5d99-923e-1c1fda6cf58e` (page 5)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Moleküldarstellungen situationsgerecht umwandeln — `92c99237-1c74-54fc-bf08-9191656afaa6` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Organische Stoffklassen — `e3e8582a-976b-5f0f-b31b-3cf59a4fff24` (outside this book)
- Lernkarten - Organische Stoffklassen – Kursauswahl — `f6d7386c-dda4-501d-84da-0c881362e724` (outside this book)
- Sauerstoffhaltige organische Verbindungen nach IUPAC benennen — `e14abd24-a0e5-5ab5-ade3-a8ae4f49e935` (outside this book)
- Funktionelle Gruppen qualitativ nachweisen — `3de28598-672f-5753-8a45-8f559c2f9dc2` (outside this book)
- Schmerzmittelwirkstoffe chemisch einordnen — `f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528` (outside this book)
- Polyaddition am Urethanbildungsmechanismus erklären — `03e12e4f-83eb-56a7-85ac-e0d628412dcc` (outside this book)
- Organische Farbmittel nach Kriterien einteilen — `d72cbb62-0b65-5b9a-aece-70c23d4e618a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:87c24bbf4af718c316ca0f530faa6107f8060cc790a2bf8dd3d987fe19ba3469`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Alkohole, Aldehyde, Ketone und Carbonsäuren werden an der funktionellen Gruppe und deren Bindungsumgebung erkannt. Eine OH-Gruppe innerhalb COOH macht den Stoff nicht zusätzlich automatisch zum Alkohol; reale Moleküle können mehrere Gruppen enthalten.
  - Essential understanding (EN): Alcohols, aldehydes, ketones and carboxylic acids are recognized by functional groups and connectivity. OH within COOH does not automatically add an alcohol class; real molecules may contain several functional groups.
  - Observable performance (DE): Ethanol ist ein Alkohol mit Hydroxygruppe an einem gesättigten C. Ethanal ist ein Aldehyd: das Carbonyl-C besitzt ein H und ist hier endständig, −CHO. Propanon ist ein Keton: am Carbonyl-C sind zwei C-Reste gebunden. Ethansäure ist eine Carbonsäure mit zusammengehöriger −COOH-Gruppe. Die OH-Komponente der Carboxygruppe wird nicht als selbständige Alkoholgruppe gezählt. Der Verwendungszweck allein liefert diese Zuordnung nicht; die Molekülstruktur tut es.
  - Observable performance (EN): Ethanol is an alcohol with a hydroxy group on a saturated carbon. Ethanal is an aldehyde: the carbonyl carbon bears H and is terminal here, −CHO. Propanone is a ketone whose carbonyl carbon binds two carbon residues. Ethanoic acid is a carboxylic acid with an integrated −COOH group. The OH portion of the carboxyl group is not counted as a separate alcohol group. Use alone does not establish these classes; molecular structure does.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): Vier gegebene Alltags-/Technikvertreter gegenüber einem Molekül mit zwei unterschiedlichen Gruppen und einem Ether als Gegenbeispiel. Mehrfunktionalität wird nicht durch Weglassen einer Gruppe künstlich atomisiert; Aufgabe bleibt die Gruppenzuordnung.
  - Essential understanding (EN): Four supplied everyday/technical examples versus a molecule with two different groups and an ether counterexample. Multiple functions are not artificially removed; the assessed routine remains functional-group classification.
  - Observable performance (DE): HOCH2CH2COOH enthält eine alkoholische Hydroxygruppe und eine Carboxygruppe; es ist eine Hydroxycarbonsäure und vereint zwei funktionelle Merkmale. CH3OCH3 ist ein Ether und kein Alkohol, Aldehyd, Keton oder Carbonsäure. Keine O−H-Bindung bedeutet hier keine alkoholische Hydroxygruppe. Beide Gegenbeispiele zeigen, dass eine nützliche Vierklassen-Einteilung keine vollständige, disjunkte Klassifikation aller organischen Verbindungen ist.
  - Observable performance (EN): HOCH2CH2COOH has an alcoholic hydroxy group and a carboxyl group; it is a hydroxycarboxylic acid combining two functional features. CH3OCH3 is an ether, not an alcohol, aldehyde, ketone or carboxylic acid. With no O−H bond it has no alcoholic hydroxy group. These examples show that the useful four-class scheme is not a complete, mutually exclusive classification of every organic compound.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: Vier gegebene Alltags-/Technikvertreter gegenüber einem Molekül mit zwei unterschiedlichen Gruppen und einem Ether als Gegenbeispiel. / Four supplied everyday/technical examples versus a molecule with two different groups and an ether counterexample.
- `model-boundary`: Mehrfunktionalität wird nicht durch Weglassen einer Gruppe künstlich atomisiert; Aufgabe bleibt die Gruppenzuordnung. / Multiple functions are not artificially removed; the assessed routine remains functional-group classification.

**Application cases**

- `chem-next20-7990387d-case-1`
  - Task demand (DE): Gegebene reine Strukturbeispiele: Ethanol CH3CH2OH als Lösemittelbestandteil; Ethanal CH3CHO als Synthesezwischenprodukt; Propanon CH3COCH3 als Lösemittel; Ethansäure CH3COOH als Säurebestandteil von Essig. Die Verwendung ist nur Kontext, keine Verträglichkeits- oder Sicherheitsbehauptung. Ordne die vier Beispiele Stoffklassen zu und begründe jede Zuordnung über die funktionelle Gruppe; unterscheide endständige und zwischen zwei C-Resten liegende Carbonylgruppe.
  - Task demand (EN): Supplied pure structural examples: ethanol CH3CH2OH as a solvent component; ethanal CH3CHO as a synthesis intermediate; propanone CH3COCH3 as a solvent; ethanoic acid CH3COOH as the acidic component of vinegar. Uses provide context, not compatibility or safety claims. Assign the four examples to compound classes and justify each using its functional group; distinguish a terminal carbonyl from one between two carbon residues.
  - Expected performance (DE): Ethanol ist ein Alkohol mit Hydroxygruppe an einem gesättigten C. Ethanal ist ein Aldehyd: das Carbonyl-C besitzt ein H und ist hier endständig, −CHO. Propanon ist ein Keton: am Carbonyl-C sind zwei C-Reste gebunden. Ethansäure ist eine Carbonsäure mit zusammengehöriger −COOH-Gruppe. Die OH-Komponente der Carboxygruppe wird nicht als selbständige Alkoholgruppe gezählt. Der Verwendungszweck allein liefert diese Zuordnung nicht; die Molekülstruktur tut es.
  - Expected performance (EN): Ethanol is an alcohol with a hydroxy group on a saturated carbon. Ethanal is an aldehyde: the carbonyl carbon bears H and is terminal here, −CHO. Propanone is a ketone whose carbonyl carbon binds two carbon residues. Ethanoic acid is a carboxylic acid with an integrated −COOH group. The OH portion of the carboxyl group is not counted as a separate alcohol group. Use alone does not establish these classes; molecular structure does.
  - Understanding focus (DE): Nicht jedes O-haltige Molekül gehört zu einer dieser vier Stoffklassen.
  - Understanding focus (EN): Not every oxygen-containing molecule belongs to one of these four classes.
- `chem-next20-7990387d-case-2`
  - Task demand (DE): Frische Strukturen: HOCH2CH2COOH und CH3OCH3. Die erste besitzt eine OH-Gruppe am gesättigten endständigen C sowie eine getrennte COOH-Gruppe. Die zweite hat O zwischen zwei C-Atomen und keine O−H- oder C=O-Bindung. Kennzeichne alle charakteristischen Gruppen und prüfe „Jeder Stoff muss genau einer der vier Klassen angehören“ sowie „Dimethylether ist ein Alkohol, weil er Sauerstoff enthält“.
  - Task demand (EN): Fresh structures: HOCH2CH2COOH and CH3OCH3. The first has OH on a saturated terminal carbon and a separate COOH group. The second has O between two carbons with neither an O−H nor a C=O bond. Identify all characteristic groups and evaluate “Every compound must belong to exactly one of the four classes” and “Dimethyl ether is an alcohol because it contains oxygen.”
  - Expected performance (DE): HOCH2CH2COOH enthält eine alkoholische Hydroxygruppe und eine Carboxygruppe; es ist eine Hydroxycarbonsäure und vereint zwei funktionelle Merkmale. CH3OCH3 ist ein Ether und kein Alkohol, Aldehyd, Keton oder Carbonsäure. Keine O−H-Bindung bedeutet hier keine alkoholische Hydroxygruppe. Beide Gegenbeispiele zeigen, dass eine nützliche Vierklassen-Einteilung keine vollständige, disjunkte Klassifikation aller organischen Verbindungen ist.
  - Expected performance (EN): HOCH2CH2COOH has an alcoholic hydroxy group and a carboxyl group; it is a hydroxycarboxylic acid combining two functional features. CH3OCH3 is an ether, not an alcohol, aldehyde, ketone or carboxylic acid. With no O−H bond it has no alcoholic hydroxy group. These examples show that the useful four-class scheme is not a complete, mutually exclusive classification of every organic compound.
  - Understanding focus (DE): Mehrfunktionalität wird nicht durch Weglassen einer Gruppe künstlich atomisiert; Aufgabe bleibt die Gruppenzuordnung.
  - Understanding focus (EN): Multiple functions are not artificially removed; the assessed routine remains functional-group classification.
## Page 7: Aminosäuren über Säure-Base-Verhalten erklären

- Full learning-goal ID: `e9d34f34-2a43-5cc7-bcca-1d08e057531d`
- Goal fingerprint: `sha256:b39715f891c5b75cd450e1e4628b4dcf3aa983381746d982305e360cb3ef5d51`
- Page fingerprint: `sha256:bad6ca7da908199883fa43476ada04b486458804dffaa021aa70cbc56b73f9f2`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe > Aminosäuren charakterisieren

### Canonical description

Die lernende Person kann pH-abhängige Ladungszustände einfacher Aminosäuren und ihr amphoteres Verhalten im Donator-Akzeptor-Konzept anhand von Strukturformeln erklären.

### Visualization

/assets/goal-visualizations/chemie/e9d34f34-2a43-5cc7-bcca-1d08e057531d/e9d34f34-2a43-5cc7-bcca-1d08e057531d.png

- original digest: `sha256:f66decb87ff06ec3052c80d2f6c2670213fb63f9fa2466f89fcd11bce3c3f122`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Acidität begründen — `ca216bc6-5205-5b46-abbd-fd5628e4ca5b` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Naturstoffe – Kursauswahl — `0f0c6c98-13dc-5347-ac95-5b50c9c17bb6` (outside this book)
- Ammonium als Proteinabbauprodukt nachweisen — `ee359c2e-e339-5b56-bceb-cc7517b36bf2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d7b46d03e4e35179e2afb6031337c1942e2452a4125306196a2f644a81bed1d3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Protonierung steuert Nettoladung.
  - Essential understanding (EN): Protonation controls net charge.
  - Observable performance (DE): H3N+-CH2-COOH: +1; H3N+-CH2-COO−: 0; H2N-CH2-COO−: −1. Abgabe an COOH und Aufnahme an NH2 erklären Säure-/Baseverhalten; Zwitterion ist intern geladen.
  - Observable performance (EN): The dominant forms have charges+1, 0, −1. COOH proton donation and NH2 proton acceptance explain acid/base behaviour; zwitterions remain internally charged.
- `aspect-2`
  - Essential understanding (DE): Mehrere protonierbare Gruppen gemeinsam bilanzieren.
  - Essential understanding (EN): Balance all ionisable groups.
  - Observable performance (DE): Carboxylgruppe−1, beide Aminogruppen je+1: gesamt+1. Glycin näherungsweise0. Positive Nettoladung führt zur Kathode; ungleiche Seitenketten sind mitzuzählen.
  - Observable performance (EN): Carboxyl−1 and two amino groups+1 each give net+1, versus glycine approximately0. Positive net charge migrates to cathode; ionisable side chains matter.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Glycin besitzt pKa-Werte 2, 3 und 9, 6. Zeichne die dominierenden Formen bei pH1, pH6 und pH12, berechne jeweils die Nettoladung und begründe den Ampholytcharakter.
  - Task demand (EN): Glycine has pKa values2.3 and9.6. Draw dominant forms at pH1, 6, 12, give net charges and justify amphoteric behaviour.
  - Expected performance (DE): H3N+-CH2-COOH: +1; H3N+-CH2-COO−: 0; H2N-CH2-COO−: −1. Abgabe an COOH und Aufnahme an NH2 erklären Säure-/Baseverhalten; Zwitterion ist intern geladen.
  - Expected performance (EN): The dominant forms have charges+1, 0, −1. COOH proton donation and NH2 proton acceptance explain acid/base behaviour; zwitterions remain internally charged.
  - Understanding focus (DE): Protonierung steuert Nettoladung.
  - Understanding focus (EN): Protonation controls net charge.
- `case-2`
  - Task demand (DE): Lysin wird vereinfacht mit pKa2, 2; 9, 0; 10, 5 modelliert. Bestimme bei pH7 die dominierende Form und vergleiche ihre Ladung mit Glycin; erkläre Wanderung zur negativen Elektrode.
  - Task demand (EN): Model lysine with pKa2.2, 9.0, 10.5. Give dominant form at pH7, compare charge with glycine and explain migration to the negative electrode.
  - Expected performance (DE): Carboxylgruppe−1, beide Aminogruppen je+1: gesamt+1. Glycin näherungsweise0. Positive Nettoladung führt zur Kathode; ungleiche Seitenketten sind mitzuzählen.
  - Expected performance (EN): Carboxyl−1 and two amino groups+1 each give net+1, versus glycine approximately0. Positive net charge migrates to cathode; ionisable side chains matter.
  - Understanding focus (DE): Mehrere protonierbare Gruppen gemeinsam bilanzieren.
  - Understanding focus (EN): Balance all ionisable groups.
## Page 8: pK-Werte nutzen

- Full learning-goal ID: `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef`
- Goal fingerprint: `sha256:1aa0edcc590ee24a93b88b0001ddafa68ccbc04d18be76c8bf2691b9a3c3dcf9`
- Page fingerprint: `sha256:4726a1edf69c906f04ddf785a7a199e5428bf8f877fa6c54d9ececc6fcb4897e`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann das Donator-Akzeptor- und Gleichgewichtskonzept auf Protolysereaktionen anwenden, Säure- und Basenstärken über das Massenwirkungsgesetz sowie pKS- und pKB-Werte vergleichen.

### Visualization

/assets/goal-visualizations/chemie/48115ff7-7aca-5d0b-a9e7-7fc6c78434ef/48115ff7-7aca-5d0b-a9e7-7fc6c78434ef.png

- original digest: `sha256:3c3eac20b0e373c7ef4c1b74f82d6d7921db0540158e24b59d1197a5936c8213`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Brønsted-Konzept vertiefen — `2a8a13b8-f96a-5ff1-92fa-fe6c19973a0e` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Gleichgewichte und Elektrochemie – Kursauswahl — `045efaa4-a91a-5a91-add9-bff49cbed324` (outside this book)
- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Gleichgewichte und Elektrochemie — `1f2021c0-c633-5240-ae97-e58ecc9d48ca` (outside this book)
- Milchsäure in einer Sportgetränkprobe titrieren — `bacf2568-03bc-5655-8798-cda078c897e3` (outside this book)
- pH-Werte starker Lösungen berechnen — `c224281a-f8a3-58cd-8ca3-2c2e134d61ff` (outside this book)
- Polyprotische Systeme — `dc0470f1-0676-5949-a5cc-02783d478406` (outside this book)
- pH-Werte starker und schwacher einprotoniger Säuren und Basen berechnen — `33034876-8da5-5619-ad86-e1272e0304b0` (outside this book)
- Säure-Base-Puffer erklären, auswählen und bewerten — `25729c34-33d5-553a-a723-046113a7da47` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5c2f83f7a2b11dbbf362a19bea49d00facc84de63a9b20e7f876145af749f33a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `mass-action-protolysis`
  - Essential understanding (DE): Ka und Kb beziehen sich auf die konkrete Protonenübertragung; die Lösungsmittelaktivität ist in der Konstante enthalten.
  - Essential understanding (EN): Ka and Kb refer to the actual proton transfer; solvent activity is included in the constant.
  - Observable performance (DE): Die lernende Person stellt HA + H2O ⇌ H3O+ + A− bzw. B + H2O ⇌ BH+ + OH− und die zugehörigen normierten MWG-Ausdrücke auf.
  - Observable performance (EN): The learner writes HA + H2O ⇌ H3O+ + A− or B + H2O ⇌ BH+ + OH− with the corresponding normalized mass-action expressions.
- `negative-log-strength`
  - Essential understanding (DE): Ein kleinerer pK bedeutet wegen des negativen Logarithmus eine größere Gleichgewichtskonstante und größere jeweilige Säure- oder Basenstärke.
  - Essential understanding (EN): A smaller pK means a larger equilibrium constant and greater corresponding acid or base strength because the logarithm is negative.
  - Observable performance (DE): Sie begründet die HX/HY- und B1/B2-Reihenfolgen über die K-Werte und korrigiert die Behauptung, ein größeres pKB bedeute eine stärkere Base.
  - Observable performance (EN): The learner justifies the HX/HY and B1/B2 orders through K values and corrects the claim that a larger pKb means a stronger base.
- `conjugate-strength-relation`
  - Essential understanding (DE): Für ein korrespondierendes Paar bei derselben Temperatur gilt KaKb=Kw; die stärkere Säure hat die schwächere konjugierte Base.
  - Essential understanding (EN): For a conjugate pair at the same temperature, KaKb=Kw; a stronger acid has a weaker conjugate base.
  - Observable performance (DE): Sie leitet pKB(X−)=10, pKB(Y−)=5 sowie pKS(B1H+)=11 und pKS(B2H+)=9 aus pKw=14 ab und erklärt die umgekehrten Paarreihenfolgen.
  - Observable performance (EN): The learner derives pKb(X−)=10, pKb(Y−)=5, pKa(B1H+)=11 and pKa(B2H+)=9 from pKw=14 and explains the reversed conjugate orders.
- `equilibrium-direction-limits`
  - Essential understanding (DE): Das Verhältnis passender Säurekonstanten bestimmt die Bevorzugung einer Protonenübertragung; Stärke ist von Anfangskonzentration und vollständigem Umsatz zu unterscheiden.
  - Essential understanding (EN): The ratio of appropriate acid constants determines a proton transfer’s favoured side; strength is distinct from initial concentration and complete conversion.
  - Observable performance (DE): Sie kombiniert Gleichgewichte zu K=10^5, 10 bzw. 0.1, deutet jeweils die bevorzugte Seite und widerlegt die Konzentrationsbegründung, ohne vollständigen Umsatz zu behaupten.
  - Observable performance (EN): The learner combines equilibria to obtain K=10^5, 10 or 0.1, interprets the favoured side and refutes the concentration argument without claiming complete conversion.

**Coverage expectations**

- required expectations: `mass-action-protolysis`, `negative-log-strength`, `conjugate-strength-relation`, `equilibrium-direction-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-to-base-data`: Von pKS-Daten zu pKB-Daten wechseln und die jeweils passende logarithmische Richtung begründen. / Change from pKa data to pKb data and justify the corresponding logarithmic order.
- `conjugates-and-cross-transfer`: Vom Einzelgleichgewicht zum korrespondierenden Partner und dann zu einer anderen Säure/Base-Kombination übergehen. / Move from a single equilibrium to its conjugate partner and then to a different acid/base combination.
- `constant-versus-concentration`: Die intrinsische Stärkereihenfolge bei ungleichen Anfangskonzentrationen und bei K oberhalb bzw. unterhalb 1 beurteilen. / Judge intrinsic strength with unequal initial concentrations and reaction constants above or below 1.

**Application cases**

- `g2-c1`
  - Task demand (DE): Vergleiche HX/HY mit pKS 4/9, bestimme die konjugierten pKB und begründe HX + Y− ⇌ X− + HY trotz ungleicher Konzentrationen. Vollständiges Material, Auftrag, Lösung und vier Kriterien: inputs/fourteen-full-cases.bound.exact.json, Fall G2-C1.
  - Task demand (EN): Compare HX/HY with pKa 4/9, determine conjugate pKb and justify HX + Y− ⇌ X− + HY despite unequal concentrations. Complete material, task, solution and four criteria: inputs/fourteen-full-cases.bound.exact.json, case G2-C1.
  - Expected performance (DE): HX ist stärker; Y− ist die stärkere Base. KaKb=Kw liefert 10/5; K=Ka(X)/Ka(Y)=10^5 begünstigt Produkte. 0.001 M bzw. 0.1 M ändern diese Stärkeordnung nicht.
  - Expected performance (EN): HX is stronger; Y− is the stronger base. KaKb=Kw gives 10/5; K=Ka(X)/Ka(Y)=10^5 favours products. 0.001 M versus 0.1 M does not change the strength order.
  - Understanding focus (DE): Konstante, negative Logarithmen, korrespondierende Paare und Anfangskonzentration logisch auseinanderhalten.
  - Understanding focus (EN): Keep constants, negative logarithms, conjugate pairs and initial concentration logically distinct.
- `g2-c2`
  - Task demand (DE): Nutze pKB(B1/B2)=3/5 und pKS(HA)=10 für beide Kreuzgleichgewichte und korrigiere die falsche pKB-Regel. Vollständiges Material, Auftrag, Lösung und vier Kriterien: inputs/fourteen-full-cases.bound.exact.json, Fall G2-C2.
  - Task demand (EN): Use pKb(B1/B2)=3/5 and pKa(HA)=10 for both cross-equilibria and repair the false pKb rule. Complete material, task, solution and four criteria: inputs/fourteen-full-cases.bound.exact.json, case G2-C2.
  - Expected performance (DE): B1 ist stärker, konjugierte pKS sind 11/9. Die Kreuzkonstanten 10 und 0.1 begünstigen entgegengesetzte Seiten; keine davon beweist vollständige Umsetzung.
  - Expected performance (EN): B1 is stronger; conjugate pKa values are 11/9. Cross-reaction constants 10 and 0.1 favour opposite sides; neither proves complete conversion.
  - Understanding focus (DE): Der Wechsel zu Basendaten verlangt eine neue Begründung der Richtung statt zweimaliges mechanisches Umkehren.
  - Understanding focus (EN): Switching to base data requires a fresh justification of direction rather than reversing a rule mechanically twice.
## Page 9: Spannungsreihen nutzen

- Full learning-goal ID: `8be14f15-2258-58e6-ae4e-38953f5d0570`
- Goal fingerprint: `sha256:b05745c7f8d0e4795f55736820b47ef5d49976ac876795d0b83e1c973e2b3cad`
- Page fingerprint: `sha256:76a6eb86ed5f568de212c7faae20992480d9a3a83dc81a97ef6caae22142f68d`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.3 Redoxgleichgewichte

### Canonical description

Die lernende Person kann Standard-Reduktionspotenziale als relative Potenziale gegenüber der Standard-Wasserstoffelektrode erklären, elektrochemische Spannungsreihen zur Vorhersage der Redoxrichtung nutzen und Standard-Leerlaufspannungen galvanischer Zellen als Potenzialdifferenzen berechnen.

### Visualization

/assets/goal-visualizations/chemie/8be14f15-2258-58e6-ae4e-38953f5d0570/8be14f15-2258-58e6-ae4e-38953f5d0570.png

- original digest: `sha256:42238208258aa8a372c48547e2005880439c64de769a099a0e02b212abaf562f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Einfache Redoxreihen aufstellen — `16da6a4d-8e9c-5f5d-b69d-338d67a2d362` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Gleichgewichte und Elektrochemie – Kursauswahl — `045efaa4-a91a-5a91-add9-bff49cbed324` (outside this book)
- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Gleichgewichte und Elektrochemie — `1f2021c0-c633-5240-ae97-e58ecc9d48ca` (outside this book)
- Korrosionsschutz an einer Schiffsschraube — `c31fa777-89c0-52f5-a6d9-d054027aabf5` (outside this book)
- Wasserstoff als Energieträger beurteilen — `93b914d4-747d-5b22-90ff-ac6320514b44` (outside this book)
- Korrosion verstehen — `642d5ea5-b62f-50c8-b0bd-cf132619725f` (outside this book)
- Nernst-Gleichung auf galvanische Zellen anwenden (LK) — `b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b` (outside this book)
- pE/pH- und Pourbaix-Diagramme — `f0f2c5f8-06f1-5774-a176-d96505727acf` (outside this book)
- Ionenentladung und Überspannung deuten — `3eada74b-25b8-55dc-811a-acb473196f53` (outside this book)
- Kontaktkorrosion erklären — `9f0d6d4c-f918-5a44-a9a2-7732c4e338f3` (outside this book)
- Standard-Wasserstoff-Halbzelle erklären — `b781745a-256e-52b2-8d86-c1072845ccdd` (outside this book)
- Leerlaufspannungen galvanischer Zellen experimentell ermitteln — `7b39fa19-fec3-575e-9324-a3226b703358` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ff15596b0e9c00f0ece25da26924b776ed004e229a5492b5ff5b1b9a2635c714`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `duty-reference-definition`
  - Essential understanding (DE): Relative Referenzdefinition mit SHE = 0 V, Reduktionskonvention, angegebenen Standardzuständen/Temperatur erklären; 0 V nicht als fehlende Grenzfläche oder absolute Ein-Elektrodenmessung deuten. Ein Begriff oder Tabellenwert allein reicht nicht. / Relative Referenzdefinition mit SHE = 0 V, Reduktionskonvention, angegebenen Standardzuständen/Temperatur erklären; 0 V nicht als fehlende Grenzfläche oder absolute Ein-Elektrodenmessung deuten. Ein Begriff oder Tabellenwert allein reicht nicht.
  - Essential understanding (EN): Explain the relative SHE = 0 V reference, reduction convention and stated standard states/temperature; do not equate 0 V with no interface or an absolute one-electrode measurement. A term or table entry alone is insufficient. / Explain the relative SHE = 0 V reference, reduction convention and stated standard states/temperature; do not equate 0 V with no interface or an absolute one-electrode measurement. A term or table entry alone is insufficient.
  - Observable performance (DE): q3-10-a: Relative Referenzdefinition mit SHE = 0 V, Reduktionskonvention, angegebenen Standardzuständen/Temperatur erklären; 0 V nicht als fehlende Grenzfläche oder absolute Ein-Elektrodenmessung deuten. Ein Begriff oder Tabellenwert allein reicht nicht. q3-10-b: Relative Referenzdefinition mit SHE = 0 V, Reduktionskonvention, angegebenen Standardzuständen/Temperatur erklären; 0 V nicht als fehlende Grenzfläche oder absolute Ein-Elektrodenmessung deuten. Ein Begriff oder Tabellenwert allein reicht nicht.
  - Observable performance (EN): q3-10-a: Explain the relative SHE = 0 V reference, reduction convention and stated standard states/temperature; do not equate 0 V with no interface or an absolute one-electrode measurement. A term or table entry alone is insufficient. q3-10-b: Explain the relative SHE = 0 V reference, reduction convention and stated standard states/temperature; do not equate 0 V with no interface or an absolute one-electrode measurement. A term or table entry alone is insufficient.
- `duty-c1`
  - Essential understanding (DE): Reduktionspotenziale und freiwillige Richtung richtig interpretieren. / Negative Vorschlagsrichtung korrekt beurteilen.
  - Essential understanding (EN): Interpret reduction potentials and spontaneous direction correctly. / Evaluate negative proposed direction correctly.
  - Observable performance (DE): q3-10-a: Reduktionspotenziale und freiwillige Richtung richtig interpretieren. q3-10-b: Negative Vorschlagsrichtung korrekt beurteilen.
  - Observable performance (EN): q3-10-a: Interpret reduction potentials and spontaneous direction correctly. q3-10-b: Evaluate negative proposed direction correctly.
- `duty-c2`
  - Essential understanding (DE): Halb-/Gesamtgleichungen und Zellspannung korrekt. / Freiwillige Reaktion und1,93V berechnen.
  - Essential understanding (EN): Give correct half/total equations and cell voltage. / Calculate spontaneous reaction and1.93V.
  - Observable performance (DE): q3-10-a: Halb-/Gesamtgleichungen und Zellspannung korrekt. q3-10-b: Freiwillige Reaktion und1,93V berechnen.
  - Observable performance (EN): q3-10-a: Give correct half/total equations and cell voltage. q3-10-b: Calculate spontaneous reaction and1.93V.
- `duty-c3`
  - Essential understanding (DE): Elektroden und äußeren Elektronenfluss erklären. / Elektroden/Elektronen und Ionentransport getrennt erklären.
  - Essential understanding (EN): Explain electrodes and external electron flow. / Explain electrodes/electrons and ion transport separately.
  - Observable performance (DE): q3-10-a: Elektroden und äußeren Elektronenfluss erklären. q3-10-b: Elektroden/Elektronen und Ionentransport getrennt erklären.
  - Observable performance (EN): q3-10-a: Explain electrodes and external electron flow. q3-10-b: Explain electrodes/electrons and ion transport separately.
- `duty-c4`
  - Essential understanding (DE): Ionenrichtung und Standard-/Realgrenze unterscheiden. / Gemessene Spannung an Bedingungen binden.
  - Essential understanding (EN): Distinguish ion directions and standard/actual limit. / Bind measured voltage to conditions.
  - Observable performance (DE): q3-10-a: Ionenrichtung und Standard-/Realgrenze unterscheiden. q3-10-b: Gemessene Spannung an Bedingungen binden.
  - Observable performance (EN): q3-10-a: Distinguish ion directions and standard/actual limit. q3-10-b: Bind measured voltage to conditions.

**Coverage expectations**

- required expectations: `duty-reference-definition`, `duty-c1`, `duty-c2`, `duty-c3`, `duty-c4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `full-case-material`: Daniell-Zelle unter Standardbedingungen / Metallaustausch und negative Vorschlagsrichtung / Daniell cell under standard conditions / Metal displacement and negative proposed direction
- `independent-transfer`: Frisch: Cu²⁺/Cu+0,34V und Ag⁺/Ag+0,80V. Reaktion und E°? Ein Protokoll nennt Ag gegenüber einer anders gewählten Referenz R mit E°(R vs. SHE) = +0,20 V. Welcher Wert steht für Ag vs. R im Protokoll? Berechne die Cu/Ag-Zellspannung zusätzlich mit beiden auf R bezogenen Elektrodenwerten und begründe ihre Referenzunabhängigkeit. / Frisch: gleiche Potenzialdifferenz, Reaktion wird formal verdreifacht. Wie ändern sich E° und Elektronenanzahl? Eine zweite Aufgabe liefert nur E°(M vs. R) = +0,60 V bei einer anderen Referenz R mit E°(R vs. SHE) = +0,20 V unter denselben Standardbedingungen. Rekonstruiere E°(M vs. SHE) und prüfe die Aussage „M hat das absolute Potenzial 0,60 V“. Wie ändert sich dabei eine Zellspannung zwischen M und einer zweiten Elektrode, wenn beide dieselbe Referenz R verwenden? / Fresh: Cu²⁺/Cu+0.34V and Ag⁺/Ag+0.80V. Reaction and E°? A report instead uses reference R with E°(R vs. SHE) = +0.20 V. What value does it report for Ag vs. R? Also calculate the Cu/Ag cell voltage from both electrode values relative to R and explain why the cell voltage is reference independent. / Fresh: same potential difference, reaction is formally tripled. How do E° and electron count change? A second task supplies only E°(M vs. R) = +0.60 V for a different reference R with E°(R vs. SHE) = +0.20 V under the same standard conditions. Recover E°(M vs. SHE) and assess the claim that M has an absolute potential of 0.60 V. How does this affect the cell voltage between M and another electrode if both use the same reference R?

**Application cases**

- `q3-10-a`
  - Task demand (DE): Standard-Reduktionspotenziale bei298K: Zn²⁺/Zn−0,76V,Cu²⁺/Cu+0,34V. Reine Metalle, Aktivitäten gelöster Ionen1; getrennte Halbzellen mit inertem Salzsteg. Die Werte beziehen sich auf die Standard-Wasserstoffelektrode (SHE), deren Standardpotenzial per Vereinbarung 0 V ist. Für dieses Modell gelten 298 K, reine feste Stoffe und gelöste Ionen mit Aktivität 1; bei gasförmigen Standardzuständen gilt 1 bar. Aktivität 1 ist nicht allgemein gleichbedeutend mit einer Konzentration von 1 mol/L. Definiere das Standard-Reduktionspotenzial als relative Potenzialdifferenz gegenüber der SHE unter festgelegten Standardzuständen und bei angegebener Temperatur. Erkläre, warum die vereinbarte 0 V weder eine isoliert gemessene absolute Elektrodenspannung noch das Fehlen einer elektrochemischen Grenzfläche bedeutet. Interpretiere Spannungsreihe, sage freiwilligen Verlauf voraus, bilanziere Gesamtreaktion und berechne E°. Benenne Anode/Kathode, Elektronenfluss und Salzsteg-Ionenbewegung. Begrenze Aussagen für andere Konzentrationen. Separat frischer Transfer: Frisch: Cu²⁺/Cu+0,34V und Ag⁺/Ag+0,80V. Reaktion und E°? Ein Protokoll nennt Ag gegenüber einer anders gewählten Referenz R mit E°(R vs. SHE) = +0,20 V. Welcher Wert steht für Ag vs. R im Protokoll? Berechne die Cu/Ag-Zellspannung zusätzlich mit beiden auf R bezogenen Elektrodenwerten und begründe ihre Referenzunabhängigkeit.
  - Task demand (EN): Standard reduction potentials at298K: Zn²⁺/Zn−0.76V,Cu²⁺/Cu+0.34V. Pure metals, dissolved-ion activities1; separated half-cells with inert salt bridge. The values use the standard hydrogen electrode (SHE) as reference; its standard potential is assigned 0 V. This model specifies 298 K, pure solids and dissolved ions of activity 1; gaseous standard states use 1 bar. Unit activity does not generally mean a concentration of 1 mol/L. Define a standard reduction potential as a relative potential difference against SHE for specified standard states and at a stated temperature. Explain why the assigned 0 V is neither an isolated absolute electrode-voltage measurement nor the absence of an electrochemical interface. Interpret the series, predict spontaneous direction, balance total reaction and calculate E°. State anode/cathode, electron flow and salt-bridge ion movement. Bound claims for other concentrations. Separately administered fresh transfer: Fresh: Cu²⁺/Cu+0.34V and Ag⁺/Ag+0.80V. Reaction and E°? A report instead uses reference R with E°(R vs. SHE) = +0.20 V. What value does it report for Ag vs. R? Also calculate the Cu/Ag cell voltage from both electrode values relative to R and explain why the cell voltage is reference independent.
  - Expected performance (DE): E° ist das Reduktionspotenzial relativ zur SHE, also die vorzeichenbehaftete Standard-Zellspannung in der Referenzkonvention E°(untersuchte Elektrode) − E°(SHE). Das Standardpotenzial der SHE ist vereinbart 0 V; Tabellenwerte sind relative Vergleichswerte und keine direkt mit nur einer Elektrode gemessenen absoluten Spannungen. Die Temperatur wird angegeben; Aktivitäten und gegebenenfalls Gasdruck beziehen sich auf die festgelegten Standardzustände. Der Bezug auf 0 V lässt die elektrochemische Grenzfläche bestehen. Zn oxidiert:Zn→Zn²⁺+2e⁻ an der negativen Anode;Cu²⁺+2e⁻→Cu an positiver Kathode. Gesamt Zn+Cu²⁺→Zn²⁺+Cu;E°=0,34−(−0,76)=1,10V. Elektronen fließen außen Zn→Cu; Anionen des Salzstegs zur Zn-Halbzelle, Kationen zur Cu-Halbzelle. Ionen transportieren Ladung in Lösung, keine Elektronenleitung dort. Reale Konzentrationen/Belastung können Spannung verändern. Transferantwort: Cu+2Ag⁺→Cu²⁺+2Ag;E°=0,46V. Potenziale werden nicht mit dem Faktor2 multipliziert. Ag vs. R: 0,80 − 0,20 = +0,60 V; Cu vs. R: 0,34 − 0,20 = +0,14 V. Die Zellspannung bleibt 0,60 − 0,14 = 0,46 V, weil dieselbe Referenzverschiebung beim Bilden der Differenz wegfällt. Rubrik /12: reference-definition 2P; c1 2P; c2 2P; c3 2P; c4 2P; fresh-transfer 2P. Pflicht: alle bezeichneten Aspekte begründet zeigen; nur tatsächliche Leistung bewerten. Die ganzen Kriterien stehen im zugehörigen vollständigen Fall.
  - Expected performance (EN): E° is the reduction potential relative to SHE: the signed standard-cell emf in the reference convention E°(electrode of interest) − E°(SHE). Assigning SHE a standard potential of 0 V makes table entries relative comparison values, not absolute voltages directly measured with one isolated electrode. Temperature is stated; activities and any gas pressure refer to the specified standard states. The 0 V reference does not eliminate the electrochemical interface. Zn oxidizes:Zn→Zn²⁺+2e⁻ at negative anode;Cu²⁺+2e⁻→Cu at positive cathode. Overall Zn+Cu²⁺→Zn²⁺+Cu;E°=0.34−(−0.76)=1.10V. Electrons flow externally Zn→Cu; salt-bridge anions toward Zn and cations toward Cu half-cell. Ions carry charge in solution, not electrons. Actual concentrations/load can change voltage. Transfer response: Cu+2Ag⁺→Cu²⁺+2Ag;E°=0.46V. Potentials are not multiplied by coefficient2. Ag vs. R: 0.80 − 0.20 = +0.60 V; Cu vs. R: 0.34 − 0.20 = +0.14 V. The cell voltage remains 0.60 − 0.14 = 0.46 V because the same reference shift cancels in the difference. Rubrik /12: reference-definition 2P; c1 2P; c2 2P; c3 2P; c4 2P; fresh-transfer 2P. Mandatory: justify all named aspects; score only demonstrated work. The full criteria remain in the bound complete case.
  - Understanding focus (DE): Alle Pflichtkriterien ausdrücklich begründen, Darstellung und frische Variation tatsächlich zeigen. Modellmaterial bleibt synthetisch; keine nicht ausgeführte Untersuchung und keine Lernendenleistung behaupten.
  - Understanding focus (EN): Explicitly justify all mandatory criteria and demonstrate the representation and fresh variation. Model material remains synthetic; do not claim an unperformed investigation or actual learner work.
- `q3-10-b`
  - Task demand (DE): Standardwerte Mg²⁺/Mg−2,37V,Fe²⁺/Fe−0,44V. Vorgeschlagene Reaktion Fe+Mg²⁺→Fe²⁺+Mg; galvanische Halbzellen werden bei Standardbedingungen gekoppelt. Die Werte beziehen sich auf die Standard-Wasserstoffelektrode (SHE), deren Standardpotenzial per Vereinbarung 0 V ist. Für dieses Modell gelten 298 K, reine feste Stoffe und gelöste Ionen mit Aktivität 1; bei gasförmigen Standardzuständen gilt 1 bar. Aktivität 1 ist nicht allgemein gleichbedeutend mit einer Konzentration von 1 mol/L. Definiere das Standard-Reduktionspotenzial als relative Potenzialdifferenz gegenüber der SHE unter festgelegten Standardzuständen und bei angegebener Temperatur. Erkläre, warum die vereinbarte 0 V weder eine isoliert gemessene absolute Elektrodenspannung noch das Fehlen einer elektrochemischen Grenzfläche bedeutet. Prüfe Vorschlag, bestimme freiwillige Richtung und E°. Deute Anode, Kathode und beide Ladungstransportwege. Erkläre, warum eine gemessene1,80V den Standardwert nicht automatisch widerlegt. Separat frischer Transfer: Frisch: gleiche Potenzialdifferenz, Reaktion wird formal verdreifacht. Wie ändern sich E° und Elektronenanzahl? Eine zweite Aufgabe liefert nur E°(M vs. R) = +0,60 V bei einer anderen Referenz R mit E°(R vs. SHE) = +0,20 V unter denselben Standardbedingungen. Rekonstruiere E°(M vs. SHE) und prüfe die Aussage „M hat das absolute Potenzial 0,60 V“. Wie ändert sich dabei eine Zellspannung zwischen M und einer zweiten Elektrode, wenn beide dieselbe Referenz R verwenden?
  - Task demand (EN): Standard values Mg²⁺/Mg−2.37V,Fe²⁺/Fe−0.44V. Proposed reaction Fe+Mg²⁺→Fe²⁺+Mg; galvanic half-cells are connected at standard conditions. The values use the standard hydrogen electrode (SHE) as reference; its standard potential is assigned 0 V. This model specifies 298 K, pure solids and dissolved ions of activity 1; gaseous standard states use 1 bar. Unit activity does not generally mean a concentration of 1 mol/L. Define a standard reduction potential as a relative potential difference against SHE for specified standard states and at a stated temperature. Explain why the assigned 0 V is neither an isolated absolute electrode-voltage measurement nor the absence of an electrochemical interface. Check the proposal, determine spontaneous direction and E°. Interpret anode, cathode and both charge-transport paths. Explain why measured1.80V does not automatically refute the standard value. Separately administered fresh transfer: Fresh: same potential difference, reaction is formally tripled. How do E° and electron count change? A second task supplies only E°(M vs. R) = +0.60 V for a different reference R with E°(R vs. SHE) = +0.20 V under the same standard conditions. Recover E°(M vs. SHE) and assess the claim that M has an absolute potential of 0.60 V. How does this affect the cell voltage between M and another electrode if both use the same reference R?
  - Expected performance (DE): E° ist das Reduktionspotenzial relativ zur SHE, also die vorzeichenbehaftete Standard-Zellspannung in der Referenzkonvention E°(untersuchte Elektrode) − E°(SHE). Das Standardpotenzial der SHE ist vereinbart 0 V; Tabellenwerte sind relative Vergleichswerte und keine direkt mit nur einer Elektrode gemessenen absoluten Spannungen. Die Temperatur wird angegeben; Aktivitäten und gegebenenfalls Gasdruck beziehen sich auf die festgelegten Standardzustände. Der Bezug auf 0 V lässt die elektrochemische Grenzfläche bestehen. Vorschlags-E°=−2,37−(−0,44)=−1,93V, daher nicht freiwillig in dieser Richtung. Freiwillig Mg+Fe²⁺→Mg²⁺+Fe mit+1,93V. Mg negative Anode, Fe positive Kathode; Elektronen außen Mg→Fe, Gegenionen ermöglichen Ladungsausgleich innen.1,80V kann anderen Aktivitäten, Innenwiderstand oder Last entsprechen; Messbedingungen müssen geprüft werden. Transferantwort: E° bleibt1,93V; bilanzierte Elektronenzahl steigt2→6. Intensives Potenzial wird nicht skaliert. M vs. SHE ist +0,60 + 0,20 = +0,80 V. 0,60 V ist ein relativer Wert gegen R und kein absolutes Potenzial. Eine Differenz zweier Elektrodenpotenziale bleibt bei gemeinsamer Referenzverschiebung gleich; der Referenzwert fällt heraus. Rubrik /12: reference-definition 2P; c1 2P; c2 2P; c3 2P; c4 2P; fresh-transfer 2P. Pflicht: alle bezeichneten Aspekte begründet zeigen; nur tatsächliche Leistung bewerten. Die ganzen Kriterien stehen im zugehörigen vollständigen Fall.
  - Expected performance (EN): E° is the reduction potential relative to SHE: the signed standard-cell emf in the reference convention E°(electrode of interest) − E°(SHE). Assigning SHE a standard potential of 0 V makes table entries relative comparison values, not absolute voltages directly measured with one isolated electrode. Temperature is stated; activities and any gas pressure refer to the specified standard states. The 0 V reference does not eliminate the electrochemical interface. Proposed E°=−2.37−(−0.44)=−1.93V, so this direction is not spontaneous. Spontaneous Mg+Fe²⁺→Mg²⁺+Fe gives+1.93V. Mg is negative anode, Fe positive cathode; electrons flow externally Mg→Fe and counterions balance charge internally.1.80V can reflect different activities, internal resistance or load; check measurement conditions. Transfer response: E° stays1.93V; balanced electron count increases2→6. Intensive potential is not scaled. M vs. SHE is +0.60 + 0.20 = +0.80 V. The 0.60 V value is relative to R, not an absolute potential. The difference between two electrode potentials stays unchanged under a common reference shift because the reference value cancels. Rubrik /12: reference-definition 2P; c1 2P; c2 2P; c3 2P; c4 2P; fresh-transfer 2P. Mandatory: justify all named aspects; score only demonstrated work. The full criteria remain in the bound complete case.
  - Understanding focus (DE): Alle Pflichtkriterien ausdrücklich begründen, Darstellung und frische Variation tatsächlich zeigen. Modellmaterial bleibt synthetisch; keine nicht ausgeführte Untersuchung und keine Lernendenleistung behaupten.
  - Understanding focus (EN): Explicitly justify all mandatory criteria and demonstrate the representation and fresh variation. Model material remains synthetic; do not claim an unperformed investigation or actual learner work.
## Page 10: 1. Hauptsatz anwenden

- Full learning-goal ID: `801790f9-be3a-51fe-9b0f-3452c1bba887`
- Goal fingerprint: `sha256:36442159d56fb7f6e5c9a2173ed418f06450c9d0a6d9f976294e561aa615edbb`
- Page fingerprint: `sha256:d8fb02bc84d27af8fa6262b386e335dba449a24ea40dff8f1a63b69d9d6caad6`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Energie und Nachhaltigkeit > Q4.1 Energetische und kinetische Aspekte

### Canonical description

Die lernende Person kann offene, geschlossene und isolierte Systeme unterscheiden und Energieerhaltung qualitativ erklären.

### Visualization

/assets/goal-visualizations/chemie/801790f9-be3a-51fe-9b0f-3452c1bba887/801790f9-be3a-51fe-9b0f-3452c1bba887.png

- original digest: `sha256:9016b6cade8030ca2b70ebb4b8d7fd9dab36d8369cd4861ec8b4bf7b64cad486`
- QA status: `approved`
- approved for public publication: `true`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Enthalpien berechnen — `4a08f31f-204c-5339-9d9f-5d2af28d5d5c` (page 11)

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Brennstoffe vergleichen — `8ece9beb-9458-5ea1-8e45-9be04670f464` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Energie und Nachhaltigkeit – Kursauswahl — `453a3489-ab98-5594-aeda-621438d43c8e` (outside this book)
- Lernkarten - Energie und Nachhaltigkeit — `6122faf0-6718-52b3-b40d-b206a2e963ae` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:cc0b57781fec46377430ecf1d47d65b09e83a6144f05a667040c2151b6d0bc95`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `expectation-system-and-energy-boundaries`
  - Essential understanding (DE): Systemgrenze, Energieerhaltung und Vorzeichen zusammen erklären.
  - Essential understanding (EN): Explain system boundaries, energy conservation and signs together.
  - Observable performance (DE): A ist offen, B geschlossen (kein Stoffaustausch, Energieaustausch möglich), C ideal isoliert. Für das geschlossene B gilt ΔU=Q+W_on=850 J. Wärme/Arbeit sind Übertragungsgrößen, U eine Zustandsgröße. Bei A trägt entweichender Dampf Energie über die Systemgrenze; Q+W allein ist keine vollständige Bilanz des offenen Kontrollvolumens. Bei C gilt ΔU=0 für das Gesamtsystem, obwohl chemische Energie in thermische Energie übergehen und die Temperatur steigen kann. Energie wird umgewandelt/übertragen, nicht vernichtet; nur Energieänderungen werden bestimmt.
  - Observable performance (EN): A is open, B closed (no matter transfer; energy transfer possible), C ideally isolated. For closed B, ΔU=Q+W_on=850 J. Heat/work are transfer quantities; U is a state quantity. Escaping steam in A carries energy across the boundary, so Q+W alone is not the complete open-control-volume balance. Total ΔU=0 in C, although chemical energy can become thermal energy and temperature can rise. Energy is transformed/transferred, not destroyed; measurements determine changes.
- `expectation-isobaric-isochoric-work`
  - Essential understanding (DE): Isochore und isobare Bilanz sowie Wärme/Volumenarbeit unterscheiden.
  - Essential understanding (EN): Distinguish constant-volume/pressure balances and heat/pV work.
  - Observable performance (DE): 100000 Pa×0,00200 m³=200 J. Expansion: W_on=-200 J; ΔU=+300 J. Bei gleichem konstantem System-/Außendruck und nur pV-Arbeit gilt ΔH=ΔU+pΔV=500 J=Q_p. Im starren Gefäß ist ΔV=0, W_on=0 und ΔU=500 J=Q_v. Der Unterschied folgt aus Arbeitsübertragung, nicht aus Energieverlust. Die Skizze zeigt 500 J hinein, 200 J Arbeit hinaus und 300 J U-Zunahme. Die beiden Prozesse müssen nicht denselben Endzustand haben; U/H-Zuordnung gilt unter den jeweils angegebenen Bedingungen.
  - Observable performance (EN): 100000 Pa×0.00200 m³=200 J. Expansion gives W_on=-200 J and ΔU=+300 J. With equal constant system/external pressure and only pV work, ΔH=ΔU+pΔV=500 J=Q_p. The rigid vessel has ΔV=0, W_on=0 and ΔU=500 J=Q_v. Work transfer, not destroyed energy, explains the difference. The sketch shows 500 J in, 200 J work out and a 300 J U increase. The processes need not have identical final states; the U/H relations depend on the stated conditions.

**Coverage expectations**

- required expectations: `expectation-system-and-energy-boundaries`, `expectation-isobaric-isochoric-work`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-relevant-conditions`: Die vollständig gebundenen Fälle wechseln Reaktion, Systemgrenze, Temperatur, Aggregatzustand, Stoffmengen-/Energiebasis, Messverfahren oder Zusammensetzung. Tatsächliche Durchführung bleibt dort erforderlich, wo der konkrete Quellenoperator sie verlangt. / The bound cases vary reaction, system boundary, temperature, phase, amount/energy basis, method or composition. Actual execution remains required where the specific source operator demands it.

**Application cases**

- `system-and-energy-boundaries`
  - Task demand (DE): Synthetische Systemkarten: A = offenes kochendes Wasser mit austretendem Dampf; B = dichtes Reaktionsgefäß mit beweglichem Kolben; C = ideales vollständig abgeschirmtes Gefäß. Für B: zugeführte Wärme Q=+1200 J, an der Umgebung geleistete Arbeit W_on=-350 J. Vorzeichen: Übertragung ins System positiv. Ordne offen/geschlossen/isoliert zu, berechne für B die Änderung der inneren Energie und erkläre Energieverbrauch. Begründe, warum bei A zusätzlich der Energieinhalt transportierter Materie und bei C eine mögliche Temperaturänderung trotz konstantem Gesamt-U zu beachten sind.
  - Task demand (EN): Synthetic system cards: A = open boiling water with escaping steam; B = sealed reaction vessel with a movable piston; C = an ideal fully insulated vessel. For B: heat supplied Q=+1200 J; work done on surroundings W_on=-350 J. Transfers into the system are positive. Classify open/closed/isolated, calculate B's internal-energy change and interpret energy consumption. Explain why A additionally needs energy transported by matter and why C may change temperature while total U stays constant.
  - Expected performance (DE): A ist offen, B geschlossen (kein Stoffaustausch, Energieaustausch möglich), C ideal isoliert. Für das geschlossene B gilt ΔU=Q+W_on=850 J. Wärme/Arbeit sind Übertragungsgrößen, U eine Zustandsgröße. Bei A trägt entweichender Dampf Energie über die Systemgrenze; Q+W allein ist keine vollständige Bilanz des offenen Kontrollvolumens. Bei C gilt ΔU=0 für das Gesamtsystem, obwohl chemische Energie in thermische Energie übergehen und die Temperatur steigen kann. Energie wird umgewandelt/übertragen, nicht vernichtet; nur Energieänderungen werden bestimmt.
  - Expected performance (EN): A is open, B closed (no matter transfer; energy transfer possible), C ideally isolated. For closed B, ΔU=Q+W_on=850 J. Heat/work are transfer quantities; U is a state quantity. Escaping steam in A carries energy across the boundary, so Q+W alone is not the complete open-control-volume balance. Total ΔU=0 in C, although chemical energy can become thermal energy and temperature can rise. Energy is transformed/transferred, not destroyed; measurements determine changes.
  - Understanding focus (DE): Systemgrenze, Energieerhaltung und Vorzeichen zusammen erklären.
  - Understanding focus (EN): Explain system boundaries, energy conservation and signs together.
- `isobaric-isochoric-work`
  - Task demand (DE): Synthetischer geschlossener Gasprozess: Q=+500 J, konstanter äußerer Druck p_ext=100 kPa, Volumenzunahme ΔV=2,00 L, ausschließlich Volumenarbeit. Gegenfall: starres Gefäß mit ebenfalls Q=+500 J. Für die jeweilige Bilanz gelten W_on=-p_ext ΔV und H=U+pV. Berechne W_on und ΔU, erläutere unter den genannten isobaren Bedingungen ΔH=Q_p und vergleiche mit isochorer Prozessführung. Zeichne eine beschriftete Energiebilanz; erkläre, warum gleiche zugeführte Wärme hier nicht gleiche ΔU bedeutet.
  - Task demand (EN): Synthetic closed-gas process: Q=+500 J, constant external pressure p_ext=100 kPa, volume increase ΔV=2.00 L, only pressure-volume work. Contrast: a rigid vessel also receives Q=+500 J. Use W_on=-p_ext ΔV and H=U+pV. Calculate W_on and ΔU, explain ΔH=Q_p under the stated constant-pressure conditions and compare a constant-volume process. Draw a labelled energy balance and explain why equal supplied heat does not give equal ΔU here.
  - Expected performance (DE): 100000 Pa×0,00200 m³=200 J. Expansion: W_on=-200 J; ΔU=+300 J. Bei gleichem konstantem System-/Außendruck und nur pV-Arbeit gilt ΔH=ΔU+pΔV=500 J=Q_p. Im starren Gefäß ist ΔV=0, W_on=0 und ΔU=500 J=Q_v. Der Unterschied folgt aus Arbeitsübertragung, nicht aus Energieverlust. Die Skizze zeigt 500 J hinein, 200 J Arbeit hinaus und 300 J U-Zunahme. Die beiden Prozesse müssen nicht denselben Endzustand haben; U/H-Zuordnung gilt unter den jeweils angegebenen Bedingungen.
  - Expected performance (EN): 100000 Pa×0.00200 m³=200 J. Expansion gives W_on=-200 J and ΔU=+300 J. With equal constant system/external pressure and only pV work, ΔH=ΔU+pΔV=500 J=Q_p. The rigid vessel has ΔV=0, W_on=0 and ΔU=500 J=Q_v. Work transfer, not destroyed energy, explains the difference. The sketch shows 500 J in, 200 J work out and a 300 J U increase. The processes need not have identical final states; the U/H relations depend on the stated conditions.
  - Understanding focus (DE): Isochore und isobare Bilanz sowie Wärme/Volumenarbeit unterscheiden.
  - Understanding focus (EN): Distinguish constant-volume/pressure balances and heat/pV work.
## Page 11: Enthalpien berechnen

- Full learning-goal ID: `4a08f31f-204c-5339-9d9f-5d2af28d5d5c`
- Goal fingerprint: `sha256:41f00f0e50b3b55633025395d778c9b437d30da35fe6f65a7959f9aa47aa7cc5`
- Page fingerprint: `sha256:477a9d7694c60aa753eaa3a55c09f41c299cc71566012733186bd62668ebcf55`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Energie und Nachhaltigkeit > Q4.1 Energetische und kinetische Aspekte

### Canonical description

Die lernende Person kann Reaktionsenthalpien mit dem Satz von Hess und einfachen Kalorimetrieansätzen bestimmen.

### Visualization

/assets/goal-visualizations/chemie/4a08f31f-204c-5339-9d9f-5d2af28d5d5c/4a08f31f-204c-5339-9d9f-5d2af28d5d5c.jpg

- original digest: `sha256:6672d2948084af389c4cf1cbe66e689d5597e07e73f51d90a0bf58d90c339c3b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- 1. Hauptsatz anwenden — `801790f9-be3a-51fe-9b0f-3452c1bba887` (page 10)

### Direct reverse prerequisites

- Gibbs-Helmholtz-Gleichung quantitativ anwenden (LK) — `dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5` (page 12)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Brennstoffzellenbus im Winterbetrieb — `31a630bc-ee86-5316-8ce5-e522b14fd607` (outside this book)
- Lernkarten - Energie und Nachhaltigkeit – Kursauswahl — `453a3489-ab98-5594-aeda-621438d43c8e` (outside this book)
- Waschmittelkonzentrat und Temperaturwahl — `4a2477e3-3bae-5452-8058-58e6ed9cc3e3` (outside this book)
- Lernkarten - Energie und Nachhaltigkeit — `6122faf0-6718-52b3-b40d-b206a2e963ae` (outside this book)
- Standard-Reaktionsenthalpien aus Bildungsenthalpien berechnen — `4663fd80-1618-5211-8020-18f4b80979fc` (outside this book)
- Entropie und freie Enthalpie (LK) — `5169bb6b-f065-5798-8164-9b4521e44ae8` (outside this book)
- Gibbs-Helmholtz-Gleichung qualitativ anwenden — `f7a335a7-265e-5d22-b2ba-08ee9a0326c6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2e72b5a40638363cf9cc149ea6fd90ae459642d49b9b987b100a5d65c58ddd75`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `expectation-hess-carbon-monoxide`
  - Essential understanding (DE): Hess-Zyklus, Standardbildungsenthalpie und Stoffmengenbasis verbinden.
  - Essential understanding (EN): Connect a Hess cycle, standard formation enthalpy and amount basis.
  - Observable performance (DE): Die zweite Reaktion wird umgekehrt: CO2->CO+1/2 O2, +283,0 kJ/mol. Addition ergibt C+1/2 O2->CO, ΔfH°=-110,5 kJ/mol CO. Für 0,50 mol: -55,25 kJ. Der Zyklus verwendet identische Anfangs-/Endzustände mit Phasenangaben; eine konsistente Skala zeigt -110,5 und -283,0 als Teilstrecken von -393,5. Enthalpie ist eine Zustandsgröße; Wegunabhängigkeit setzt gleiche Bezugszustände voraus. Aktivierungsbarriere und spontane Herstellbarkeit werden daraus nicht bestimmt.
  - Observable performance (EN): Reverse the second reaction: CO2->CO+1/2 O2, +283.0 kJ/mol. Addition gives C+1/2 O2->CO with ΔfH°=-110.5 kJ/mol CO. For 0.50 mol the change is -55.25 kJ. The cycle uses identical initial/final states with phases; a consistent scale shows -110.5 and -283.0 as parts of -393.5. Enthalpy is a state quantity; path independence requires identical reference states. This does not determine activation barriers or practical spontaneous production.
- `expectation-salt-calorimetry-execution`
  - Essential understanding (DE): Kalorimetrie tatsächlich planen/durchführen/auswerten und Unsicherheit begründen.
  - Essential understanding (EN): Actually plan/execute/evaluate calorimetry and justify uncertainty.
  - Observable performance (DE): Vollpunkte erfordern eigene Planung, reale Rohdaten beider ausgeführten Messungen, Leerprobe/Wiederholung und Fehlerbetrachtung. Im synthetischen Modell: m=40,555 bzw. 41,095 g, c_p=4,18 J g^-1 K^-1, C_cal=25,0 J K^-1, ΔT bei 60 s=+1,70 bzw. -0,50 K: ΔH_m≈-66,14 bzw. +19,68 kJ/mol. Exothermes Lösen erwärmt die Umgebung, endothermes entzieht ihr Wärme; Gitterauftrennung und Hydratation wirken gegeneinander. Wärmeverlust, Sensorverzug, Salzform/Reinheit und angenähertes c_p begrenzen den Messwert. Unerwartete Befunde werden untersucht statt durch Modellwerte ersetzt. Die offene Messung approximiert ΔH nur bei konstantem Druck und berücksichtigtem Energieaustausch.
  - Observable performance (EN): Full credit requires an independent plan, actual raw data from both executed measurements, blank/repeats and uncertainty analysis. Synthetic model: m=40.555 or 41.095 g, c_p=4.18 J g^-1 K^-1, C_cal=25.0 J K^-1, ΔT at 60 s=+1.70 or -0.50 K: ΔH_m≈-66.14 or +19.68 kJ/mol. Exothermic dissolution warms surroundings, endothermic dissolution absorbs heat; lattice separation and hydration oppose each other. Heat loss, sensor lag, salt form/purity and approximate c_p bound the result. Investigate deviations rather than replace them with model values. The open assay approximates ΔH only at constant pressure with energy transfers accounted for.
- `expectation-st-named-calorimetry-execution`
  - Essential understanding (DE): Genau die verlangten ST-Schülerversuche ausführen und Stoff-/Energiebilanz getrennt deuten.
  - Essential understanding (EN): Execute the specifically required ST experiments and distinguish matter/energy balances.
  - Observable performance (DE): Mg(s)+2 HCl(aq)->MgCl2(aq)+H2(g); NH4HCO3(s)+HCl(aq)->NH4Cl(aq)+CO2(g)+H2O(l). Bei jeweils 0,00100 mol im synthetischen Modell, m≈20,0243 bzw. 20,0791 g, c_p=4,18 und C_cal=25,0 J/K, ΔT=+4,20 bzw. -0,350 K: etwa -456,55 bzw. +38,13 kJ/mol. Eine Gleichung wird pro Mol des begrenzenden Feststoffs bilanziert. Eigene Ausführung/T(t)/Kontrolle ist verpflichtend; kleine ΔT macht den endothermen Wert besonders unsicher. Gas entführt Stoff/Energie; bei offenen Kalorimetern muss der Einfluss diskutiert werden. Gasbildung allein ist kein Enthalpie- oder Spontanitätsbeweis.
  - Observable performance (EN): Mg(s)+2 HCl(aq)->MgCl2(aq)+H2(g); NH4HCO3(s)+HCl(aq)->NH4Cl(aq)+CO2(g)+H2O(l). Synthetic model with 0.00100 mol each, m≈20.0243 or 20.0791 g, c_p=4.18 and C_cal=25.0 J/K, ΔT=+4.20 or -0.350 K gives about -456.55 or +38.13 kJ/mol. Use one mole of limiting solid as the reaction basis. Actual execution/T(t)/controls are required; small ΔT makes the endothermic result especially uncertain. Escaping gas transports matter/energy, whose effect in open calorimetry must be discussed. Gas formation alone proves neither enthalpy sign nor spontaneity.
- `expectation-neutralisation-calorimetry`
  - Essential understanding (DE): Neutralisationsenthalpie aus realer kontrollierter Messung und klarer Bezugsreaktion ableiten.
  - Essential understanding (EN): Infer neutralisation enthalpy from an actual controlled assay and a clear reference reaction.
  - Observable performance (DE): H3O+(aq)+OH-(aq)->2 H2O(l), netto 0,00400 mol Neutralisationsumsatz/Wasserbildung relativ zu H+(aq)+OH-(aq)->H2O(l). Q_Lösung+Kal=224,64 J, ΔH_m≈-56,16 kJ/mol, etwa 1,47% geringerer Betrag als -57,0. Wärmeverlust, Sensor-/Mischverzug, Verdünnungswärme und angenähertes c_p begrenzen den Vergleich. Blindversuch/Datenpunkte sind tatsächlich abzugeben; vorgegebene Werte reichen nur für Modellrechnung. Reagenzien, Konzentration und Zeitpunkt müssen dokumentiert werden; keine Behauptung eines eigenen gemessenen Standardwerts.
  - Observable performance (EN): H3O+(aq)+OH-(aq)->2 H2O(l); net 0.00400 mol neutralisation/water formation relative to H+(aq)+OH-(aq)->H2O(l). Q_solution+cal=224.64 J, ΔH_m≈-56.16 kJ/mol, about 1.47% smaller in magnitude than -57.0. Heat loss, sensor/mixing lag, dilution heat and approximate c_p bound the comparison. Actual blank/raw observations are required; supplied values support only model calculation. Record reagents, concentration and timing; do not claim a personally measured standard value.
- `expectation-formation-and-bond-enthalpies`
  - Essential understanding (DE): Standarddaten, Bindungsmodell und Phasenbezug sachgerecht unterscheiden.
  - Essential understanding (EN): Distinguish standard data, bond model and phase reference.
  - Observable performance (DE): Bildungswerte: [-393,5+2(-241,8)]-[-74,8+2·0]=-802,3 kJ/mol CH4. Bindungsansatz: Bruch 4·413+2·498=2648; Bildung 2·799+4·463=3450; Differenz -802 kJ/mol. Die nahe Übereinstimmung der gerundeten Aufgabenwerte ist keine allgemeine Exaktheitsgarantie: mittlere Bindungswerte und Gasphase sind Näherungen. ΔfH°(O2)=0 ist eine Referenzdefinition und bedeutet nicht Energieinhalt null. Flüssiges H2O gibt zusätzlich Kondensationsenthalpie ab, also einen größeren Betrag der freigesetzten Wärme.
  - Observable performance (EN): Formation values: [-393.5+2(-241.8)]-[-74.8+2·0]=-802.3 kJ/mol CH4. Bond estimate: break 4·413+2·498=2648; form 2·799+4·463=3450; difference -802 kJ/mol. Close agreement of rounded task data is not a general guarantee: mean bond values/gas-phase assumptions are approximations. ΔfH°(O2)=0 is a reference definition, not zero energy content. Liquid H2O additionally releases condensation enthalpy, increasing the released-heat magnitude.

**Coverage expectations**

- required expectations: `expectation-hess-carbon-monoxide`, `expectation-salt-calorimetry-execution`, `expectation-st-named-calorimetry-execution`, `expectation-neutralisation-calorimetry`, `expectation-formation-and-bond-enthalpies`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-relevant-conditions`: Die vollständig gebundenen Fälle wechseln Reaktion, Systemgrenze, Temperatur, Aggregatzustand, Stoffmengen-/Energiebasis, Messverfahren oder Zusammensetzung. Tatsächliche Durchführung bleibt dort erforderlich, wo der konkrete Quellenoperator sie verlangt. / The bound cases vary reaction, system boundary, temperature, phase, amount/energy basis, method or composition. Actual execution remains required where the specific source operator demands it.

**Application cases**

- `hess-carbon-monoxide`
  - Task demand (DE): Gerundete thermochemische Aufgabenwerte bei gleichen Standardbedingungen: C(Graphit,s)+O2(g)->CO2(g), ΔH°=-393,5 kJ/mol; CO(g)+1/2 O2(g)->CO2(g), ΔH°=-283,0 kJ/mol. Ziel: Bildung von 1 mol CO(g) aus den Elementen. Kein Versuch zur CO-Herstellung. Konstruiere die Zielgleichung durch Umkehrung/Addition, berechne ΔfH°(CO), zeichne einen maßstabsgerechten Enthalpiezyklus und begründe den Satz von Hess als Folge der Energieerhaltung. Gib für 0,50 mol CO die nichtmolare Änderung an.
  - Task demand (EN): Rounded thermochemical task values at identical standard conditions: C(graphite,s)+O2(g)->CO2(g), ΔH°=-393.5 kJ/mol; CO(g)+1/2 O2(g)->CO2(g), ΔH°=-283.0 kJ/mol. Target: form 1 mol CO(g) from the elements. No CO-production experiment. Construct the target by reversing/adding equations, calculate ΔfH°(CO), draw a scaled enthalpy cycle and explain Hess's law from energy conservation. Give the nonmolar change for 0.50 mol CO.
  - Expected performance (DE): Die zweite Reaktion wird umgekehrt: CO2->CO+1/2 O2, +283,0 kJ/mol. Addition ergibt C+1/2 O2->CO, ΔfH°=-110,5 kJ/mol CO. Für 0,50 mol: -55,25 kJ. Der Zyklus verwendet identische Anfangs-/Endzustände mit Phasenangaben; eine konsistente Skala zeigt -110,5 und -283,0 als Teilstrecken von -393,5. Enthalpie ist eine Zustandsgröße; Wegunabhängigkeit setzt gleiche Bezugszustände voraus. Aktivierungsbarriere und spontane Herstellbarkeit werden daraus nicht bestimmt.
  - Expected performance (EN): Reverse the second reaction: CO2->CO+1/2 O2, +283.0 kJ/mol. Addition gives C+1/2 O2->CO with ΔfH°=-110.5 kJ/mol CO. For 0.50 mol the change is -55.25 kJ. The cycle uses identical initial/final states with phases; a consistent scale shows -110.5 and -283.0 as parts of -393.5. Enthalpy is a state quantity; path independence requires identical reference states. This does not determine activation barriers or practical spontaneous production.
  - Understanding focus (DE): Hess-Zyklus, Standardbildungsenthalpie und Stoffmengenbasis verbinden.
  - Understanding focus (EN): Connect a Hess cycle, standard formation enthalpy and amount basis.
- `salt-calorimetry-execution`
  - Task demand (DE): Betreuter, von der Lehrkraft freigegebener Styroporkalorimeter-Versuch, methodisch nach Uni Göttingen „Lösungswärme von Salzen“ (2159) angepasst: je 40,00 g Wasser, 0,00500 mol wasserfreies CaCl2 (0,555 g) bzw. CaCl2·6H2O (1,095 g), getrennte saubere Ansätze. Bereitgestelltes/kalibriertes C_cal, Waage, Digitaltemperatursensor, Rührer; Schutzbrille, Staubkontakt vermeiden, Entsorgung nach Lehrkraft. Gefäße nicht gasdicht verschließen. Plane eine exotherme und eine endotherme Messung mit gleicher Wassermasse/Temperatur, Wasser-Leerprobe und Wiederholung. Führe beide aus; logge Masse sowie T alle 15 s vor/nach Zugabe, zeichne T(t), begründe den Auswertezeitpunkt und berechne ΔH_m≈-[(m_Lösung c_p)+C_cal]ΔT/n. Dokumentiere deine echten Befunde. Zusätzlich werte das gebundene synthetische Übungsprotokoll aus; es ersetzt keine Durchführung.
  - Task demand (EN): Teacher-authorised supervised polystyrene-calorimeter experiment adapted from Göttingen's “Lösungswärme von Salzen” (2159): 40.00 g water per run, 0.00500 mol anhydrous CaCl2 (0.555 g) or CaCl2·6H2O (1.095 g), separate clean runs. Supplied/calibrated C_cal, balance, digital thermometer and stirrer; goggles, avoid dust exposure and follow teacher disposal. Do not seal vessels gas-tight. Plan one exothermic and one endothermic measurement using equal water mass/temperature, a water blank and repeat runs. Execute both; record mass and T every 15 s before/after addition, plot T(t), justify the evaluation point and calculate ΔH_m≈-[(m_solution c_p)+C_cal]ΔT/n. Submit actual observations. Also analyse the bound synthetic practice log; it does not replace execution.
  - Expected performance (DE): Vollpunkte erfordern eigene Planung, reale Rohdaten beider ausgeführten Messungen, Leerprobe/Wiederholung und Fehlerbetrachtung. Im synthetischen Modell: m=40,555 bzw. 41,095 g, c_p=4,18 J g^-1 K^-1, C_cal=25,0 J K^-1, ΔT bei 60 s=+1,70 bzw. -0,50 K: ΔH_m≈-66,14 bzw. +19,68 kJ/mol. Exothermes Lösen erwärmt die Umgebung, endothermes entzieht ihr Wärme; Gitterauftrennung und Hydratation wirken gegeneinander. Wärmeverlust, Sensorverzug, Salzform/Reinheit und angenähertes c_p begrenzen den Messwert. Unerwartete Befunde werden untersucht statt durch Modellwerte ersetzt. Die offene Messung approximiert ΔH nur bei konstantem Druck und berücksichtigtem Energieaustausch.
  - Expected performance (EN): Full credit requires an independent plan, actual raw data from both executed measurements, blank/repeats and uncertainty analysis. Synthetic model: m=40.555 or 41.095 g, c_p=4.18 J g^-1 K^-1, C_cal=25.0 J K^-1, ΔT at 60 s=+1.70 or -0.50 K: ΔH_m≈-66.14 or +19.68 kJ/mol. Exothermic dissolution warms surroundings, endothermic dissolution absorbs heat; lattice separation and hydration oppose each other. Heat loss, sensor lag, salt form/purity and approximate c_p bound the result. Investigate deviations rather than replace them with model values. The open assay approximates ΔH only at constant pressure with energy transfers accounted for.
  - Understanding focus (DE): Kalorimetrie tatsächlich planen/durchführen/auswerten und Unsicherheit begründen.
  - Understanding focus (EN): Actually plan/execute/evaluate calorimetry and justify uncertainty.
- `st-named-calorimetry-execution`
  - Task demand (DE): Verbindliche ST-Verfahren als betreuter, lehrkraftfreigegebener Auftrag: Magnesium und Ammoniumhydrogencarbonat jeweils mit verdünnter Salzsäure. Autoren-Mikromaßstab: getrennt je 20,0 mL HCl 0,20 mol/L im offenen Kalorimeter, einmal 0,0243 g Mg, einmal 0,0791 g NH4HCO3. Säure ist überschüssig; bereitetes C_cal/Temperatursensor. Schutzbrille; keine Zündquelle, kein direkter Gasnachweis, nie gasdicht schließen (H2 bzw. CO2); Lehrkraft regelt Rückstände. Plane, führe beide Reaktionen aus und protokolliere eigene Temperatur-Zeit-Kurven, Massen und Kontroll-/Wiederholungswerte. Formuliere die Stoffgleichungen mit Phasen, berechne die jeweiligen molaren Enthalpien und erkläre, warum Gasbildung allein weder Vorzeichen noch Spontanität bestimmt. Synthetische Vergleichsdaten stehen im vollständigen Fall und sind keine eigenen Beobachtungen.
  - Task demand (EN): ST-required methods as a supervised teacher-authorised task: magnesium and ammonium hydrogen carbonate each with dilute hydrochloric acid. Author microscale: separate runs of 20.0 mL HCl 0.20 mol/L in open calorimeters, one with 0.0243 g Mg and one with 0.0791 g NH4HCO3. Acid is in excess; supplied C_cal/temperature sensor. Goggles; no ignition source/direct gas test, never seal gas-tight (H2 or CO2); follow teacher disposal. Plan and execute both reactions, recording actual temperature/time traces, masses, controls and repeats. Give equations with phases, calculate molar enthalpies and explain why gas formation alone establishes neither sign nor spontaneity. Synthetic comparison data are supplied in the whole case and are not your observations.
  - Expected performance (DE): Mg(s)+2 HCl(aq)->MgCl2(aq)+H2(g); NH4HCO3(s)+HCl(aq)->NH4Cl(aq)+CO2(g)+H2O(l). Bei jeweils 0,00100 mol im synthetischen Modell, m≈20,0243 bzw. 20,0791 g, c_p=4,18 und C_cal=25,0 J/K, ΔT=+4,20 bzw. -0,350 K: etwa -456,55 bzw. +38,13 kJ/mol. Eine Gleichung wird pro Mol des begrenzenden Feststoffs bilanziert. Eigene Ausführung/T(t)/Kontrolle ist verpflichtend; kleine ΔT macht den endothermen Wert besonders unsicher. Gas entführt Stoff/Energie; bei offenen Kalorimetern muss der Einfluss diskutiert werden. Gasbildung allein ist kein Enthalpie- oder Spontanitätsbeweis.
  - Expected performance (EN): Mg(s)+2 HCl(aq)->MgCl2(aq)+H2(g); NH4HCO3(s)+HCl(aq)->NH4Cl(aq)+CO2(g)+H2O(l). Synthetic model with 0.00100 mol each, m≈20.0243 or 20.0791 g, c_p=4.18 and C_cal=25.0 J/K, ΔT=+4.20 or -0.350 K gives about -456.55 or +38.13 kJ/mol. Use one mole of limiting solid as the reaction basis. Actual execution/T(t)/controls are required; small ΔT makes the endothermic result especially uncertain. Escaping gas transports matter/energy, whose effect in open calorimetry must be discussed. Gas formation alone proves neither enthalpy sign nor spontaneity.
  - Understanding focus (DE): Genau die verlangten ST-Schülerversuche ausführen und Stoff-/Energiebilanz getrennt deuten.
  - Understanding focus (EN): Execute the specifically required ST experiments and distinguish matter/energy balances.
- `neutralisation-calorimetry`
  - Task demand (DE): Betreuter Neutralisations-Kalorimetrieauftrag, als eigene kontrollierte Anpassung an Göttingen „Thermometrische Titration“ (1333): je 20,00 mL bereitgestellte 0,200 mol/L HCl und NaOH, gleiche Anfangstemperatur; offenes isolierendes Gefäß, Thermometer, Rühren, Schutzbrille. C_cal ist bereitgestellt oder durch separate Wassermischung kalibriert. Blindversuch Säure+Wasser bei gleichem Volumen. Synthetischer Rechenvergleich: m_Lösung=40,0 g, c_p=4,18 J/(g K), C_cal=20,0 J/K, ΔT=+1,20 K; Aufgaben-Vergleichswert -57,0 kJ/mol H2O. Plane und führe die freigegebene Messung samt Blindversuch aus, lege echte Rohdaten vor und berechne pro Mol gebildeten Wassers. Vergleiche den synthetischen Rechenwert mit dem Aufgaben-Vergleichswert und begründe mindestens zwei Abweichungsursachen. Die Quellenmethode ist thermometrische Titration; dieses feste Mischungsverfahren ist eine ausdrücklich benannte Autorenanpassung.
  - Task demand (EN): Supervised neutralisation calorimetry, an author-controlled adaptation of Göttingen's “Thermometrische Titration” (1333): 20.00 mL each supplied 0.200 mol/L HCl/NaOH, equal initial temperature, open insulated vessel, thermometer, stirring and goggles. C_cal is supplied or separately calibrated by water mixing. Blank: acid+water at equal volume. Synthetic calculation: m_solution=40.0 g, c_p=4.18 J/(g K), C_cal=20.0 J/K, ΔT=+1.20 K; task comparison value -57.0 kJ/mol H2O. Plan/execute the authorised assay with blank, submit actual raw data and calculate per mole of water formed. Compare the synthetic calculation with the task benchmark and justify at least two causes of deviation. The source method is thermometric titration; this fixed-volume mixing method is an explicitly declared author adaptation.
  - Expected performance (DE): H3O+(aq)+OH-(aq)->2 H2O(l), netto 0,00400 mol Neutralisationsumsatz/Wasserbildung relativ zu H+(aq)+OH-(aq)->H2O(l). Q_Lösung+Kal=224,64 J, ΔH_m≈-56,16 kJ/mol, etwa 1,47% geringerer Betrag als -57,0. Wärmeverlust, Sensor-/Mischverzug, Verdünnungswärme und angenähertes c_p begrenzen den Vergleich. Blindversuch/Datenpunkte sind tatsächlich abzugeben; vorgegebene Werte reichen nur für Modellrechnung. Reagenzien, Konzentration und Zeitpunkt müssen dokumentiert werden; keine Behauptung eines eigenen gemessenen Standardwerts.
  - Expected performance (EN): H3O+(aq)+OH-(aq)->2 H2O(l); net 0.00400 mol neutralisation/water formation relative to H+(aq)+OH-(aq)->H2O(l). Q_solution+cal=224.64 J, ΔH_m≈-56.16 kJ/mol, about 1.47% smaller in magnitude than -57.0. Heat loss, sensor/mixing lag, dilution heat and approximate c_p bound the comparison. Actual blank/raw observations are required; supplied values support only model calculation. Record reagents, concentration and timing; do not claim a personally measured standard value.
  - Understanding focus (DE): Neutralisationsenthalpie aus realer kontrollierter Messung und klarer Bezugsreaktion ableiten.
  - Understanding focus (EN): Infer neutralisation enthalpy from an actual controlled assay and a clear reference reaction.
- `formation-and-bond-enthalpies`
  - Task demand (DE): Gerundete Aufgabenwerte: ΔfH°[CH4(g)]=-74,8; CO2(g)=-393,5; H2O(g)=-241,8; O2(g)=0 kJ/mol. Mittlere Gasphasen-Bindungsenthalpien: C-H 413, O=O 498, C=O in CO2 799, O-H 463 kJ/mol Bindungen. Ziel CH4(g)+2 O2(g)->CO2(g)+2 H2O(g), jeweils 1 mol CH4. Berechne aus Bildungsenthalpien und unabhängig aus gebrochenen/gebildeten Bindungen. Vergleiche, erkläre den Nullwert des Elements im Standardzustand und warum flüssiges Produktwasser eine andere Reaktionsenthalpie ergäbe.
  - Task demand (EN): Rounded task values: ΔfH°[CH4(g)]=-74.8; CO2(g)=-393.5; H2O(g)=-241.8; O2(g)=0 kJ/mol. Mean gas-phase bond enthalpies: C-H 413, O=O 498, C=O in CO2 799, O-H 463 kJ/mol bonds. Target CH4(g)+2 O2(g)->CO2(g)+2 H2O(g), per 1 mol CH4. Calculate using formation enthalpies and independently broken/formed bonds. Compare, explain the zero value for an element in its reference state and why liquid product water gives another reaction enthalpy.
  - Expected performance (DE): Bildungswerte: [-393,5+2(-241,8)]-[-74,8+2·0]=-802,3 kJ/mol CH4. Bindungsansatz: Bruch 4·413+2·498=2648; Bildung 2·799+4·463=3450; Differenz -802 kJ/mol. Die nahe Übereinstimmung der gerundeten Aufgabenwerte ist keine allgemeine Exaktheitsgarantie: mittlere Bindungswerte und Gasphase sind Näherungen. ΔfH°(O2)=0 ist eine Referenzdefinition und bedeutet nicht Energieinhalt null. Flüssiges H2O gibt zusätzlich Kondensationsenthalpie ab, also einen größeren Betrag der freigesetzten Wärme.
  - Expected performance (EN): Formation values: [-393.5+2(-241.8)]-[-74.8+2·0]=-802.3 kJ/mol CH4. Bond estimate: break 4·413+2·498=2648; form 2·799+4·463=3450; difference -802 kJ/mol. Close agreement of rounded task data is not a general guarantee: mean bond values/gas-phase assumptions are approximations. ΔfH°(O2)=0 is a reference definition, not zero energy content. Liquid H2O additionally releases condensation enthalpy, increasing the released-heat magnitude.
  - Understanding focus (DE): Standarddaten, Bindungsmodell und Phasenbezug sachgerecht unterscheiden.
  - Understanding focus (EN): Distinguish standard data, bond model and phase reference.
## Page 12: Gibbs-Helmholtz-Gleichung quantitativ anwenden (LK)

- Full learning-goal ID: `dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5`
- Goal fingerprint: `sha256:92bf183ac9b36b9cb19917fe363837c06bd45b517ae34566c7296f79204c0b99`
- Page fingerprint: `sha256:7d128485dc98a29a3fe30381480d7ca3c25c46c63fb093c6be7a8bf95322df37`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Energie und Nachhaltigkeit > Q4.1 Energetische und kinetische Aspekte

### Canonical description

Die lernende Person kann mithilfe der Gibbs-Helmholtz-Gleichung die freie Reaktionsenthalpie berechnen, den Einfluss von Enthalpie- und Entropieänderungen auf die Richtung chemischer Reaktionen bestimmen und Vorhersagen zur Freiwilligkeit sowie zur Möglichkeit einer Gleichgewichtseinstellung treffen.

### Visualization

/assets/goal-visualizations/chemie/dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5/dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5.jpg

- original digest: `sha256:54f1e555c97a569c3fb30b748baa5a862dc92cdef832b3a82f594bdb7ea72342`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Enthalpien berechnen — `4a08f31f-204c-5339-9d9f-5d2af28d5d5c` (page 11)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Energie und Nachhaltigkeit – Kursauswahl — `453a3489-ab98-5594-aeda-621438d43c8e` (outside this book)
- Lernkarten - Energie und Nachhaltigkeit — `6122faf0-6718-52b3-b40d-b206a2e963ae` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e99e9697f7d8ee592808317b983e784bb5abf28a3089d30b3cedb4df6739745a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `expectation-temperature-and-threshold`
  - Essential understanding (DE): Einheiten, Grenztemperatur und Standard-/Aktualzustand quantitativ trennen.
  - Essential understanding (EN): Quantitatively distinguish units, threshold temperature and standard/current states.
  - Observable performance (DE): 160,7 J/(mol K)=0,1607 kJ/(mol K). Bei 298 K ΔG°=+130,4114 kJ/mol, bei 1200 K -14,54 kJ/mol. T*=178,3/0,1607≈1109,52 K. Im Standardzustandsmodell wechselt das Vorzeichen; andere CO2-Aktivität/Zusammensetzung verlangt ΔrG=ΔrG°+RT lnQ. ΔrG=0 ist das chemische Gleichgewichtskriterium bei konstantem T,p, nicht generell ΔrG°=0. Kinetische Hemmung und temperaturabhängige Daten begrenzen Aussagen über tatsächlichen Ablauf.
  - Observable performance (EN): 160.7 J/(mol K)=0.1607 kJ/(mol K). ΔG° at 298 K is +130.4114 kJ/mol and at 1200 K -14.54 kJ/mol. T*=178.3/0.1607≈1109.52 K. The reference-state model changes sign; different CO2 activity/composition requires ΔrG=ΔrG°+RT lnQ. At constant T,p, ΔrG=0 is the equilibrium criterion, not generally ΔrG°=0. Kinetic barriers and temperature-dependent data limit predictions of actual progress.
- `expectation-composition-quotient-equilibrium`
  - Essential understanding (DE): Reaktionsquotient, freie Standardenthalpie und tatsächliche Reaktionsrichtung verbinden.
  - Essential understanding (EN): Connect reaction quotient, standard Gibbs energy and actual reaction direction.
  - Observable performance (DE): Q=1: ΔG=-4,30 kJ/mol. Q=100: RT ln100≈11,4096 kJ/mol, daher ΔG≈+7,1096 kJ/mol; die Rückrichtung ist begünstigt. K=exp(4300/(8,314·298))≈5,67; bei Q=K ΔG=0, Hin-/Rückreaktion im Gleichgewicht. Die Zusammensetzung ist entscheidend, Standardwerte allein reichen nicht. Ein erreichbarer Reaktionsweg und Zeit sind zusätzliche kinetische Voraussetzungen; ΔG=0 bedeutet keine Einstellungsgeschwindigkeit und keine Abwesenheit mikroskopischer Reaktionen.
  - Observable performance (EN): Q=1 gives ΔG=-4.30 kJ/mol. At Q=100, RT ln100≈11.4096 kJ/mol, so ΔG≈+7.1096 kJ/mol and reverse direction is favoured. K=exp(4300/(8.314·298))≈5.67; Q=K gives ΔG=0 with forward/reverse reactions in equilibrium. Composition matters; standard values alone are insufficient. An accessible pathway/time are additional kinetic requirements; ΔG=0 specifies neither equilibration rate nor absence of microscopic reactions.
- `expectation-standard-formation-g-and-extent`
  - Essential understanding (DE): Freie Bildungsgrößen stöchiometrisch und mit richtiger Umsatzbasis auswerten.
  - Essential understanding (EN): Evaluate Gibbs formation values stoichiometrically on the correct extent basis.
  - Observable performance (DE): ΔrG°m=[-394,4+2(-237,1)]-[-50,8+2·0]=-817,8 kJ/mol Formelumsatz. Bei ξ=0,250 mol folgt im angegebenen Standarddatenmodell ΔG°=-204,45 kJ. Phasen/Stöchiometrie und molar/nichtmolar sind ausdrücklich zu unterscheiden; ein anderer Wasserzustand ändert die Daten. Für tatsächliches ΔrG fehlen Q/Aktivitäten und Zustandsbedingungen. Der große negative Standardwert belegt weder augenblickliche Verbrennung noch einen Versuch ohne Aktivierungsenergie.
  - Observable performance (EN): ΔrG°m=[-394.4+2(-237.1)]-[-50.8+2·0]=-817.8 kJ/mol reaction extent. For ξ=0.250 mol the stated reference-data model gives ΔG°=-204.45 kJ. Distinguish phases/stoichiometry and molar/nonmolar quantities; another water phase changes data. Actual ΔrG additionally needs Q/activities and state conditions. A strongly negative standard value proves neither instantaneous combustion nor absence of an activation barrier.
- `expectation-redox-data-thermodynamic-check`
  - Essential understanding (DE): Freie Reaktionsenthalpie aus elektrischen Daten und H/S unabhängig prüfen.
  - Essential understanding (EN): Check reaction Gibbs energy independently from electrical and H/S data.
  - Observable performance (DE): Pro mol: q=n_eF=192970 C; reversible Arbeit qE=212267 J, daher ΔrG=-212,267 kJ/mol. H-T S=-200,347-298·0,0400=-212,267 kJ/mol bestätigt die Bilanz. ξ=0,0100: W_max=2122,67 J, W_Last=1640,245 J, Differenz=482,425 J. Bei gleicher T,p und entsprechend vollständiger Bilanz mindert Irreversibilität nutzbare Arbeit; Energie verschwindet nicht. Messdaten-/Ableitungsinterpretation ersetzt keine eigene galvanische Durchführung. Diese Leistung deckt den Gibbs-Teil der breiten Quellenklausel; Faraday-/Nernst-Partnerpflichten bleiben separat erhalten.
  - Observable performance (EN): Per mole q=n_eF=192970 C; reversible work qE=212267 J, hence ΔrG=-212.267 kJ/mol. H-T S=-200.347-298·0.0400=-212.267 kJ/mol confirms it. At ξ=0.0100: W_max=2122.67 J, W_loaded=1640.245 J, difference=482.425 J. At equal T,p with the complete balance, irreversibility reduces useful work; energy is not destroyed. Data interpretation/derivation does not replace actual galvanic execution. This addresses the Gibbs component of a broad source clause; separate Faraday/Nernst partner obligations are retained.

**Coverage expectations**

- required expectations: `expectation-temperature-and-threshold`, `expectation-composition-quotient-equilibrium`, `expectation-standard-formation-g-and-extent`, `expectation-redox-data-thermodynamic-check`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-relevant-conditions`: Die vollständig gebundenen Fälle wechseln Reaktion, Systemgrenze, Temperatur, Aggregatzustand, Stoffmengen-/Energiebasis, Messverfahren oder Zusammensetzung. Tatsächliche Durchführung bleibt dort erforderlich, wo der konkrete Quellenoperator sie verlangt. / The bound cases vary reaction, system boundary, temperature, phase, amount/energy basis, method or composition. Actual execution remains required where the specific source operator demands it.

**Application cases**

- `temperature-and-threshold`
  - Task demand (DE): Aufgabenmodell CaCO3(s)->CaO(s)+CO2(g): ΔrH°m=178,3 kJ/mol und ΔrS°m=160,7 J/(mol K), als temperaturunabhängig angenähert, Phasen und CO2-Standardzustand fest. T=298 bzw. 1200 K. Berechne ΔrG°m und die Modell-Grenztemperatur. Erkläre die Vorwärts-/Rückwärtsrichtung und prüfe, ob T_Grenz allein für ein beliebiges Reaktionsgemisch Gleichgewicht beweist.
  - Task demand (EN): Task model CaCO3(s)->CaO(s)+CO2(g): ΔrH°m=178.3 kJ/mol and ΔrS°m=160.7 J/(mol K), approximated temperature-independent with fixed phases/CO2 reference state. T=298 or 1200 K. Calculate ΔrG°m and the model threshold temperature. Explain forward/reverse direction and assess whether threshold T alone establishes equilibrium for any mixture.
  - Expected performance (DE): 160,7 J/(mol K)=0,1607 kJ/(mol K). Bei 298 K ΔG°=+130,4114 kJ/mol, bei 1200 K -14,54 kJ/mol. T*=178,3/0,1607≈1109,52 K. Im Standardzustandsmodell wechselt das Vorzeichen; andere CO2-Aktivität/Zusammensetzung verlangt ΔrG=ΔrG°+RT lnQ. ΔrG=0 ist das chemische Gleichgewichtskriterium bei konstantem T,p, nicht generell ΔrG°=0. Kinetische Hemmung und temperaturabhängige Daten begrenzen Aussagen über tatsächlichen Ablauf.
  - Expected performance (EN): 160.7 J/(mol K)=0.1607 kJ/(mol K). ΔG° at 298 K is +130.4114 kJ/mol and at 1200 K -14.54 kJ/mol. T*=178.3/0.1607≈1109.52 K. The reference-state model changes sign; different CO2 activity/composition requires ΔrG=ΔrG°+RT lnQ. At constant T,p, ΔrG=0 is the equilibrium criterion, not generally ΔrG°=0. Kinetic barriers and temperature-dependent data limit predictions of actual progress.
  - Understanding focus (DE): Einheiten, Grenztemperatur und Standard-/Aktualzustand quantitativ trennen.
  - Understanding focus (EN): Quantitatively distinguish units, threshold temperature and standard/current states.
- `composition-quotient-equilibrium`
  - Task demand (DE): Synthetische ideale Reaktion A<->B bei 298 K: ΔrG°m=-4,30 kJ/mol; R=8,314 J/(mol K); dimensionsloses Q=a_B/a_A. Drei Zustände: Q=1, Q=100 und Q=K. Es gilt ΔrG=ΔrG°+RT lnQ, ΔrG°=-RT lnK. Berechne die tatsächlichen ΔrG-Werte und K, entscheide über die Richtung und erläutere die Möglichkeit der Gleichgewichtseinstellung. Begründe, warum negatives ΔrG° nicht jede Anfangsmischung vorwärts treibt und keine Reaktionsgeschwindigkeit liefert.
  - Task demand (EN): Synthetic ideal A<->B reaction at 298 K: ΔrG°m=-4.30 kJ/mol; R=8.314 J/(mol K); dimensionless Q=a_B/a_A. States Q=1, Q=100 and Q=K. Use ΔrG=ΔrG°+RT lnQ and ΔrG°=-RT lnK. Calculate actual ΔrG values and K, determine direction and discuss whether equilibrium can be reached. Explain why negative ΔrG° does not drive every initial mixture forward or specify a rate.
  - Expected performance (DE): Q=1: ΔG=-4,30 kJ/mol. Q=100: RT ln100≈11,4096 kJ/mol, daher ΔG≈+7,1096 kJ/mol; die Rückrichtung ist begünstigt. K=exp(4300/(8,314·298))≈5,67; bei Q=K ΔG=0, Hin-/Rückreaktion im Gleichgewicht. Die Zusammensetzung ist entscheidend, Standardwerte allein reichen nicht. Ein erreichbarer Reaktionsweg und Zeit sind zusätzliche kinetische Voraussetzungen; ΔG=0 bedeutet keine Einstellungsgeschwindigkeit und keine Abwesenheit mikroskopischer Reaktionen.
  - Expected performance (EN): Q=1 gives ΔG=-4.30 kJ/mol. At Q=100, RT ln100≈11.4096 kJ/mol, so ΔG≈+7.1096 kJ/mol and reverse direction is favoured. K=exp(4300/(8.314·298))≈5.67; Q=K gives ΔG=0 with forward/reverse reactions in equilibrium. Composition matters; standard values alone are insufficient. An accessible pathway/time are additional kinetic requirements; ΔG=0 specifies neither equilibration rate nor absence of microscopic reactions.
  - Understanding focus (DE): Reaktionsquotient, freie Standardenthalpie und tatsächliche Reaktionsrichtung verbinden.
  - Understanding focus (EN): Connect reaction quotient, standard Gibbs energy and actual reaction direction.
- `standard-formation-g-and-extent`
  - Task demand (DE): Gerundete Aufgabenwerte ΔfG°m in kJ/mol: CH4(g)=-50,8; O2(g)=0; CO2(g)=-394,4; H2O(l)=-237,1. Reaktion CH4+2O2->CO2+2H2O(l), Temperatur/Standardzustände identisch, Formelumsatz ξ=0,250 mol. Berechne die molare freie Standardreaktionsenthalpie aus Bildungsgrößen und die nichtmolare Änderung für den angegebenen Umsatz. Zeichne die Reaktionsbilanz und begründe, welche zusätzliche Information für eine tatsächliche Gemischrichtung fehlt.
  - Task demand (EN): Rounded task ΔfG°m values in kJ/mol: CH4(g)=-50.8; O2(g)=0; CO2(g)=-394.4; H2O(l)=-237.1. Reaction CH4+2O2->CO2+2H2O(l), identical temperature/reference states and reaction extent ξ=0.250 mol. Calculate molar standard reaction Gibbs energy from formation values and the nonmolar change for the stated extent. Show the reaction balance and identify missing information for an actual mixture direction.
  - Expected performance (DE): ΔrG°m=[-394,4+2(-237,1)]-[-50,8+2·0]=-817,8 kJ/mol Formelumsatz. Bei ξ=0,250 mol folgt im angegebenen Standarddatenmodell ΔG°=-204,45 kJ. Phasen/Stöchiometrie und molar/nichtmolar sind ausdrücklich zu unterscheiden; ein anderer Wasserzustand ändert die Daten. Für tatsächliches ΔrG fehlen Q/Aktivitäten und Zustandsbedingungen. Der große negative Standardwert belegt weder augenblickliche Verbrennung noch einen Versuch ohne Aktivierungsenergie.
  - Expected performance (EN): ΔrG°m=[-394.4+2(-237.1)]-[-50.8+2·0]=-817.8 kJ/mol reaction extent. For ξ=0.250 mol the stated reference-data model gives ΔG°=-204.45 kJ. Distinguish phases/stoichiometry and molar/nonmolar quantities; another water phase changes data. Actual ΔrG additionally needs Q/activities and state conditions. A strongly negative standard value proves neither instantaneous combustion nor absence of an activation barrier.
  - Understanding focus (DE): Freie Bildungsgrößen stöchiometrisch und mit richtiger Umsatzbasis auswerten.
  - Understanding focus (EN): Evaluate Gibbs formation values stoichiometrically on the correct extent basis.
- `redox-data-thermodynamic-check`
  - Task demand (DE): Synthetisches galvanisches Datenmodell bei 298 K: pro mol Formelumsatz n_e=2, F=96485 C/mol, reversible Leerlaufspannung E=1,10 V. Thermochemische Vergleichsdaten ΔrH_m=-200,347 kJ/mol und ΔrS_m=+40,0 J/(mol K). Für ξ=0,0100 mol beträgt die Lastspannung 0,85 V. Bedingungen/Zusammensetzung sind fest, alle Werte ausdrücklich synthetisch. Leite aus Ladung und reversibler elektrischer Arbeit ΔrG=-n_eFE ab und vergleiche die Gibbs-Helmholtz-Rechnung. Berechne für den Umsatz maximale und tatsächliche elektrische Arbeit; begründe die Differenz als Dissipation unter den Modellbedingungen.
  - Task demand (EN): Synthetic galvanic data model at 298 K: n_e=2 per mole reaction, F=96485 C/mol and reversible open-circuit E=1.10 V. Thermochemical comparison: ΔrH_m=-200.347 kJ/mol and ΔrS_m=+40.0 J/(mol K). At ξ=0.0100 mol, loaded voltage is 0.85 V. Conditions/composition are fixed; all values are explicitly synthetic. Derive ΔrG=-n_eFE from charge/reversible electrical work and compare Gibbs-Helmholtz. Calculate maximum/actual electrical work for the extent and explain the difference as dissipation under the model conditions.
  - Expected performance (DE): Pro mol: q=n_eF=192970 C; reversible Arbeit qE=212267 J, daher ΔrG=-212,267 kJ/mol. H-T S=-200,347-298·0,0400=-212,267 kJ/mol bestätigt die Bilanz. ξ=0,0100: W_max=2122,67 J, W_Last=1640,245 J, Differenz=482,425 J. Bei gleicher T,p und entsprechend vollständiger Bilanz mindert Irreversibilität nutzbare Arbeit; Energie verschwindet nicht. Messdaten-/Ableitungsinterpretation ersetzt keine eigene galvanische Durchführung. Diese Leistung deckt den Gibbs-Teil der breiten Quellenklausel; Faraday-/Nernst-Partnerpflichten bleiben separat erhalten.
  - Expected performance (EN): Per mole q=n_eF=192970 C; reversible work qE=212267 J, hence ΔrG=-212.267 kJ/mol. H-T S=-200.347-298·0.0400=-212.267 kJ/mol confirms it. At ξ=0.0100: W_max=2122.67 J, W_loaded=1640.245 J, difference=482.425 J. At equal T,p with the complete balance, irreversibility reduces useful work; energy is not destroyed. Data interpretation/derivation does not replace actual galvanic execution. This addresses the Gibbs component of a broad source clause; separate Faraday/Nernst partner obligations are retained.
  - Understanding focus (DE): Freie Reaktionsenthalpie aus elektrischen Daten und H/S unabhängig prüfen.
  - Understanding focus (EN): Check reaction Gibbs energy independently from electrical and H/S data.
## Page 13: Aminocarbonsäuren und Peptide nachweisen

- Full learning-goal ID: `5c8f0bbb-103a-579f-87fc-c997afe4fd18`
- Goal fingerprint: `sha256:e083b6eae8abc5d5cbb34b6c9ad3c89024417f321db63204e5d8a3dab1439492`
- Page fingerprint: `sha256:94dd1fa2403d72c06bba8b693ec2a687a9112400b753de364830790a7d5a33be`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann geeignete Nachweisreaktionen für Aminocarbonsäuren und Peptide durchführen und ihre Aussagekraft etwa bei Lebensmitteln auswerten.

### Visualization

/assets/goal-visualizations/chemie/5c8f0bbb-103a-579f-87fc-c997afe4fd18/5c8f0bbb-103a-579f-87fc-c997afe4fd18.jpg

- original digest: `sha256:3f86aca94888d3e305450dabffa3cca5e8ef183d4c306f189a7255a4841032d4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Peptidbindungen erklären — `197bc2c5-835e-59e7-9263-5684e89799cc` (outside this book)
- Lebensmittelinhaltsstoffe experimentell nachweisen — `8fe39739-2938-5e2c-8db2-08572b44569a` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Naturstoffe – Kursauswahl — `0f0c6c98-13dc-5347-ac95-5b50c9c17bb6` (outside this book)
- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Naturstoffe — `31148286-b8db-57a7-8da2-2e0479240a2c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0515a1dfea6fc4c3428b070c530ca5463d40c0bb91cb4e3a60388332b727d736`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Nachweise reagieren auf chemische Merkmale und erfordern Kontrollen sowie reale Durchführungsevidenz.
  - Essential understanding (EN): Assays respond to chemical features and require controls plus evidence of actual execution.
  - Observable performance (DE): Ninhydrin zeigt bei vielen freien Aminogruppen eine Färbung; Biuret verlangt mehrere geeignete Peptidbindungen, Glycin bleibt negativ. Reagenzien/Probeninterferenzen werden kontrolliert.
  - Observable performance (EN): Ninhydrin responds to many free amino groups; biuret requires multiple suitable peptide bonds and glycine is negative. Reagent/sample interferences are controlled.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Befunde stützen die jeweilige Stoffklasse, nicht die eindeutige Verbindung. Ein analysiertes fremdes Protokoll belegt keine eigene Versuchsdurchführung; hierfür sind beobachtetes Arbeiten und eigenes Protokoll nötig.
  - Observable performance (EN): Results support classes, not unique compounds. Analysing a supplied record does not demonstrate personally executing the experiment; observed practice and personal records are required.
- `execution`
  - Essential understanding (DE): Durchführen undchemische Selektivitätvergleichen.
  - Essential understanding (EN): Execute and compare chemical selectivity.
  - Observable performance (DE): Glycinmit Ninhydrinviolett, mit Biuretkein Proteinnachweis; Eiklar Biuretviolett. Richtige Proben/Kontrollen und Dokumentationder Reihenfolge zählen. Ninhydrin reagiertmitgeeigneten Aminogruppen, nichtproteinexklusiv; Prolin kannabweichen.
  - Observable performance (EN): Glycine ninhydrin violet, but not positive protein biuret; eggwhite biuret positive. Correct samples/controls and execution order count. Ninhydrin reacts with suitable amino groups, not exclusively proteins; proline can differ.

**Coverage expectations**

- required expectations: `structure-and-evidence`, `fresh-transfer`, `execution`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-a`
  - Task demand (DE): Plane in einem schulisch freigegebenen Verfahren Ninhydrin- und Biuret-Vergleich an Glycin und einem Protein samt Blindproben; begründe erwartete Befunde.
  - Task demand (EN): Plan school-authorised ninhydrin and biuret comparison of glycine and a protein with blanks; justify expected results.
  - Expected performance (DE): Ninhydrin zeigt bei vielen freien Aminogruppen eine Färbung; Biuret verlangt mehrere geeignete Peptidbindungen, Glycin bleibt negativ. Reagenzien/Probeninterferenzen werden kontrolliert.
  - Expected performance (EN): Ninhydrin responds to many free amino groups; biuret requires multiple suitable peptide bonds and glycine is negative. Reagent/sample interferences are controlled.
  - Understanding focus (DE): Nachweise reagieren auf chemische Merkmale und erfordern Kontrollen sowie reale Durchführungsevidenz.
  - Understanding focus (EN): Assays respond to chemical features and require controls plus evidence of actual execution.
- `case-b-transfer`
  - Task demand (DE): Werte ein bereitgestelltes Protokoll aus: Blindprobe ungefärbt, Glycin Ninhydrin positiv/Biuret negativ, Protein Biuret positiv. Welche Aussagen und welche Durchführungsevidenz fehlen?
  - Task demand (EN): Evaluate a supplied record: blank colourless, glycine ninhydrin positive/biuret negative, protein biuret positive. What conclusions and execution evidence remain absent?
  - Expected performance (DE): Befunde stützen die jeweilige Stoffklasse, nicht die eindeutige Verbindung. Ein analysiertes fremdes Protokoll belegt keine eigene Versuchsdurchführung; hierfür sind beobachtetes Arbeiten und eigenes Protokoll nötig.
  - Expected performance (EN): Results support classes, not unique compounds. Analysing a supplied record does not demonstrate personally executing the experiment; observed practice and personal records are required.
  - Understanding focus (DE): Nachweise reagieren auf chemische Merkmale und erfordern Kontrollen sowie reale Durchführungsevidenz.
  - Understanding focus (EN): Assays respond to chemical features and require controls plus evidence of actual execution.
- `execution-1`
  - Task demand (DE): Führe betreut zwei Nachweise aus. Ninhydrin: jeein Tropfen1%Glycin und Wasser aufgetrennte Filterpapierfelder; mitbereitgestellterethanolischer Ninhydrinlösung im Abzug nach Freigabe benetzen, trocknen undimwarmluftfreien80°C-Trockenschrank2min erwärmen. Biuret: je2mLverdünntes Eiklar, Glycin, Wasser +1mLNaOH1M +10Tropfen CuSO4 0, 1M, mischen. Protokolliere Ausführung, Kontrollen undtatsächliche Befunde.
  - Task demand (EN): Execute supervised two assays. Ninhydrin: one drop each1%glycine/water on separate paper fields; wet using provided ethanolic ninhydrin in hood, leave dry then warm2min80°C drying cabinet. Biuret: 2ml diluted eggwhite, glycine, water+1mL1M NaOH+10drops0.1M CuSO4, mix. Log execution, controls and actual findings.
  - Expected performance (DE): Glycinmit Ninhydrinviolett, mit Biuretkein Proteinnachweis; Eiklar Biuretviolett. Richtige Proben/Kontrollen und Dokumentationder Reihenfolge zählen. Ninhydrin reagiertmitgeeigneten Aminogruppen, nichtproteinexklusiv; Prolin kannabweichen.
  - Expected performance (EN): Glycine ninhydrin violet, but not positive protein biuret; eggwhite biuret positive. Correct samples/controls and execution order count. Ninhydrin reacts with suitable amino groups, not exclusively proteins; proline can differ.
  - Understanding focus (DE): Durchführen undchemische Selektivitätvergleichen.
  - Understanding focus (EN): Execute and compare chemical selectivity.
