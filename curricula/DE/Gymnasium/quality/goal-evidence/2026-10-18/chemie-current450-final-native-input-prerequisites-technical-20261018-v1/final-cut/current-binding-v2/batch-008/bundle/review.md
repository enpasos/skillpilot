# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-current450-bound-context-d-008`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:c106d3e8fb858fc30b90ec7d7af776035e5608c7de633a249843214c3ccb5e0d`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Absorbiertes und reflektiertes Licht verknüpfen

- Full learning-goal ID: `c8f51eac-c131-58a8-8d00-0fcbbe4bc18c`
- Goal fingerprint: `sha256:cd36686dced257a906e8d93983856a56dfa93fe2e4bf675dc1ce5f137a036980`
- Page fingerprint: `sha256:b41ce49ba9c3600827f20b8bdcb8351970e2af515f5cf0b282795fe2c5344d66`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Farbigkeit von Stoffen über den Zusammenhang zwischen absorbierten und reflektierten Lichtwellenlängen erklären.

### Visualization

/assets/goal-visualizations/chemie/c8f51eac-c131-58a8-8d00-0fcbbe4bc18c/c8f51eac-c131-58a8-8d00-0fcbbe4bc18c.jpg

- original digest: `sha256:5fb8e85e072484de3d635fb6e6e0c0a878f7496f1cf65de1f5f7148b7ec8a38a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Absorbiertes und reflektiertes Licht verknüpfen — `28bf3678-d807-5ddc-a792-b550e955ed45` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:27a384b546e122dec330854a411682e7f824eb2b4b8fed86a19eb2b61796fa4c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Die Oberfläche reflektiert die nicht absorbierten Anteile der Beleuchtung; Farben sind keine Stoffetiketten unabhängig vom Licht.
  - Essential understanding (EN): A surface reflects nonabsorbed illumination components; color is not independent of the light.
  - Observable performance (DE): Verknüpft Spektralanteile von Einfall, Absorption und Reflexion.
  - Observable performance (EN): Connects spectral components of incident, absorbed and reflected light.
- `e2`
  - Essential understanding (DE): Eine eingeschränkte Beleuchtung verändert die reflektierte Farbe.
  - Essential understanding (EN): Restricted illumination changes reflected color.
  - Observable performance (DE): Überträgt auf anders zusammengesetztes einfallendes Licht.
  - Observable performance (EN): Transfers to different incident spectra.

**Coverage expectations**

- required expectations: `e1`, `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Weißlicht und monochromatische Beleuchtung / White and monochromatic illumination
- `v2`: Reflexionsdaten und Farbvergleich / Reflectance data and color comparison

**Application cases**

- `c8f51eac-case-1`
  - Task demand (DE): Ideales undurchsichtiges Gewebe reflektiert 430–480 nm stark, absorbiert 550–650 nm fast vollständig. Weißlicht enthält beide Bereiche; die zweite Lampe liefert nur 590 nm. Emission und Transmission sind ausgeschlossen. Für alle übrigen sichtbaren Wellenlängen im Modellbereich380–780 nm außerhalb430–480 nm ist der Reflexionsanteil vernachlässigbar.
1. Erkläre die Farbe unter Weißlicht mit absorbierten und reflektierten Wellenlängen, ohne absorbiertes Licht als sichtbare Stofffarbe zu deuten.
2. Sage die Erscheinung unter 590-nm-Licht voraus und begründe sie mit dem verfügbaren Einfallsspektrum.
  - Task demand (EN): An ideal opaque fabric strongly reflects 430–480 nm and almost completely absorbs 550–650 nm. White light contains both ranges; a second lamp supplies only 590 nm. Emission and transmission are excluded. Reflectance is negligible at every other visible wavelength in the model range380–780 nm outside430–480 nm.
1. Explain the color under white light using absorbed and reflected wavelengths, without treating absorbed light as the visible fabric color.
2. Predict its appearance under 590 nm illumination and justify it using the available incident spectrum.
  - Expected performance (DE): 1. Das Gewebe reflektiert den Blauanteil 430–480 nm und absorbiert längere Anteile; das Auge erhält überwiegend blaues Licht. Die absorbierten gelb-roten Anteile gelangen nicht als Reflexionslicht zum Auge.
2. Es erscheint sehr dunkel. 590 nm wird fast vollständig absorbiert; die Lampe liefert keine blauen Photonen, die das Gewebe reflektieren könnte.
  - Expected performance (EN): 1. The fabric reflects the blue 430–480 nm component and absorbs longer wavelengths; the eye receives mainly blue light. Absorbed yellow-red components do not reach the eye as reflection.
2. It appears very dark. 590 nm is almost completely absorbed, and the lamp supplies no blue photons for the fabric to reflect.
  - Understanding focus (DE): Das Gewebe reflektiert den Blauanteil 430–480 nm und absorbiert längere Anteile; das Auge erhält überwiegend blaues Licht. Die absorbierten gelb-roten Anteile gelangen nicht als Reflexionslicht zum Auge. / Es erscheint sehr dunkel. 590 nm wird fast vollständig absorbiert; die Lampe liefert keine blauen Photonen, die das Gewebe reflektieren könnte.
  - Understanding focus (EN): The fabric reflects the blue 430–480 nm component and absorbs longer wavelengths; the eye receives mainly blue light. Absorbed yellow-red components do not reach the eye as reflection. / It appears very dark. 590 nm is almost completely absorbed, and the lamp supplies no blue photons for the fabric to reflect.
- `c8f51eac-case-2`
  - Task demand (DE): Erfundene Reflexionsanteile bei 450/550/650 nm: Muster A 5/5/80 %, Muster B 5/40/80 %. Weißlicht hat gleiche Intensität in den drei Modellbändern; die zweite Beleuchtung enthält nur 550 nm.
1. Vergleiche die reflektierten Weißlichtanteile beider Muster und erkläre, warum ihre Farben trotz gleicher Rotreflexion verschieden sein können.
2. Entscheide, welches Muster unter 550 nm heller wirkt, und begründe die Entscheidung; nenne die Grenze einer exakten Farbbezeichnung aus nur drei Bändern.
  - Task demand (EN): Invented reflectance at 450/550/650 nm: sample A 5/5/80%, sample B 5/40/80%. White light has equal intensity in the three model bands; a second light contains only 550 nm.
1. Compare both samples’ reflected white-light components and explain why colors may differ despite equal red reflection.
2. Decide which sample looks brighter at 550 nm and justify it; state the limit of assigning an exact color name from only three bands.
  - Expected performance (DE): 1. A reflektiert fast nur Rot und wirkt rot. B reflektiert zusätzlich deutlich Grün, daher kann es gelblicher wirken. Gleiche Rotanteile garantieren keine gleiche Farbe, weil auch die übrigen Anteile zählen.
2. B ist heller: 40 % statt 5 % des angebotenen Grünlichts werden reflektiert. Ein vollständiges Spektrum und die Wahrnehmungsbedingungen fehlen; eine exakte Farbkoordinate oder Farbbezeichnung ist damit nicht festgelegt.
  - Expected performance (EN): 1. A reflects mainly red and appears red. B additionally reflects much more green and may therefore look more yellowish. Equal red components do not guarantee equal color because the other components matter.
2. B is brighter because it reflects 40% rather than 5% of the offered green light. The full spectrum and perception conditions are missing, so an exact color coordinate or name is not fixed.
  - Understanding focus (DE): A reflektiert fast nur Rot und wirkt rot. B reflektiert zusätzlich deutlich Grün, daher kann es gelblicher wirken. Gleiche Rotanteile garantieren keine gleiche Farbe, weil auch die übrigen Anteile zählen. / B ist heller: 40 % statt 5 % des angebotenen Grünlichts werden reflektiert. Ein vollständiges Spektrum und die Wahrnehmungsbedingungen fehlen; eine exakte Farbkoordinate oder Farbbezeichnung ist damit nicht festgelegt.
  - Understanding focus (EN): A reflects mainly red and appears red. B additionally reflects much more green and may therefore look more yellowish. Equal red components do not guarantee equal color because the other components matter. / B is brighter because it reflects 40% rather than 5% of the offered green light. The full spectrum and perception conditions are missing, so an exact color coordinate or name is not fixed.
## Page 2: Organische Moleküle mit dem Hybridisierungsmodell darstellen

- Full learning-goal ID: `c98683ae-3309-581e-b02b-b10ad703d8a0`
- Goal fingerprint: `sha256:8360812ef8c05d90b3dc58d0c4746d785538020565040f165bbee4524898b01e`
- Page fingerprint: `sha256:4820b2471ac32ae16a942b0cd7e12035e4338a5777641e4399c5e301cca14475`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann einfache organische Moleküle mit dem Hybridisierungsmodell darstellen.

### Visualization

/assets/goal-visualizations/chemie/c98683ae-3309-581e-b02b-b10ad703d8a0/c98683ae-3309-581e-b02b-b10ad703d8a0.jpg

- original digest: `sha256:bd6791fc67f1ff793115a1a8aa98e5b0e443cd1169da664604f82e71be991da4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Hybridisierungsmodell und Molecular Modelling vergleichen — `321d801d-28e4-54a2-bd31-8c07bda2f392` (page 3)

### Prerequisites outside this book

- Hybridisierung zur Vorhersage organischer Bindungsverhältnisse nutzen — `37b4081a-244a-58d8-b448-88ed83344210` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d5fd5081300dde82717fbbacb352fc0dc7190ab5e68df44829dba7fa00f1101f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b003-c98683ae-core`
  - Essential understanding (DE): Im Hybridisierungsmodell bestimmt die Zahl und Art der Elektronendomänen am C die räumliche Anordnung von σ-Bindungen; nicht hybridisierte p-Orbitale tragen π-Bindungen.
  - Essential understanding (EN): In the hybridization model, the number and kind of electron domains at carbon determine sigma-bond geometry; unhybridized p orbitals contribute pi bonds.
  - Observable performance (DE): Die lernende Person stellt ein gegebenes kleines organisches Molekül mit passenden sp3-, sp2- oder sp-Zentren und korrekter Bindungsgeometrie dar.
  - Observable performance (EN): The learner represents a supplied small organic molecule with suitable sp3, sp2, or sp centers and correct bonding geometry.

**Coverage expectations**

- required expectations: `b003-c98683ae-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `bond-order`: Einfach-, Doppel- und Dreifachbindung werden in Darstellungen variiert. / Single, double, and triple bonds vary across representations.
- `geometry`: Tetraedrische, planare und lineare Zentren werden geprüft. / Tetrahedral, planar, and linear centers are checked.

**Application cases**

- `ethene-hybrid-drawing`
  - Task demand (DE): Stelle Ethen als Hybridisierungsmodell dar: markiere an jedem C σ-Bindungsrichtungen, das unveränderte p-Orbital und die π-Bindung. Vergleiche die Geometrie mit einer planaren Strukturformel.
  - Task demand (EN): Represent ethene with a hybridization model: mark sigma directions, the unhybridized p orbital, and the pi bond at each carbon. Compare geometry with a planar structure.
  - Expected performance (DE): Die lernende Person zeichnet beide C als sp2/trigonal-planar, eine C-C-σ- und eine π-Bindung sowie passende C-H-σ-Bindungen.
  - Expected performance (EN): The learner draws both carbons sp2/trigonal planar, one C-C sigma plus one pi bond, and suitable C-H sigma bonds.
  - Understanding focus (DE): Darstellung verbindet Bindungstyp und Geometrie.
  - Understanding focus (EN): Representation links bond type and geometry.
- `fresh-propyne-mixed-centers`
  - Task demand (DE): Ein neues Molekül ist Propin CH3-C≡CH. Markiere die Hybridisierung jedes C und zeige, warum das terminale C linear, das CH3-C aber annähernd tetraedrisch ist.
  - Task demand (EN): A fresh molecule is propyne CH3-C≡CH. Mark hybridization at each carbon and show why terminal C is linear while methyl C is approximately tetrahedral.
  - Expected performance (DE): Die lernende Person ordnet CH3-C sp3 und beiden Dreifachbindungs-C sp zu; sie zeigt eine σ- und zwei π-Bindungsanteile der C≡C-Bindung.
  - Expected performance (EN): The learner assigns sp3 to methyl carbon and sp to both triple-bond carbons and shows one sigma and two pi components of C≡C.
  - Understanding focus (DE): Gemischtes Molekül prüft lokale Modellauswahl.
  - Understanding focus (EN): A mixed molecule tests local model choice.
## Page 3: Hybridisierungsmodell und Molecular Modelling vergleichen

- Full learning-goal ID: `321d801d-28e4-54a2-bd31-8c07bda2f392`
- Goal fingerprint: `sha256:389a0a30d96916874c9aec75f657c191745ca11d3e2bc99f0712816805c6dbac`
- Page fingerprint: `sha256:908ba7092a408929b0f5d3fe780e954b019c02ae76a5cd6374b18ed6374a9f8d`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Darstellungen organischer Moleküle aus Hybridisierungsmodell und Molecular Modelling hinsichtlich Aussagekraft, Vor- und Nachteilen vergleichen.

### Visualization

/assets/goal-visualizations/chemie/321d801d-28e4-54a2-bd31-8c07bda2f392/321d801d-28e4-54a2-bd31-8c07bda2f392.jpg

- original digest: `sha256:ecaacc0123994b65501180f2e454175163592ed21424e97933e3572261c2591b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Organische Moleküle mit dem Hybridisierungsmodell darstellen — `c98683ae-3309-581e-b02b-b10ad703d8a0` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Organische Moleküle mit Molecular Modelling darstellen — `707998c1-872d-582d-a2d6-14e7d967cbdb` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f8c2a6e9c56c977dfc0f6542e1de31764d43267b45732e41b47488c943a6d489`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `b003-321d801d-core`
  - Essential understanding (DE): Hybridisierungsmodelle betonen lokale Orbitalrichtung und σ/π-Bindungen, Computer-Modelle räumliche Geometrie aus Annahmen; keines zeigt automatisch die vollständige Elektronendynamik.
  - Essential understanding (EN): Hybridization models emphasize local orbital direction and sigma/pi bonds, while computer models show spatial geometry based on assumptions; neither automatically shows full electron dynamics.
  - Observable performance (DE): Die lernende Person vergleicht für dasselbe Molekül zwei Darstellungen und begründet, welche Frage zu Bindungstyp oder Raumform jeweils besser beantwortet wird.
  - Observable performance (EN): The learner compares two representations of the same molecule and justifies which better answers a bonding or spatial-shape question.

**Coverage expectations**

- required expectations: `b003-321d801d-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `question`: Bindungsfrage und Raumformfrage erfordern andere Modelldetails. / Bonding and spatial-shape questions need different model details.
- `molecule`: Kleines Methan und konformationsreiches Cyclohexan werden verglichen. / Small methane and conformationally rich cyclohexane are compared.

**Application cases**

- `methane-two-models`
  - Task demand (DE): Zu Methan liegen ein sp3-Hybridorbitalbild und ein digitales Kugel-Stab-Modell vor. Welches zeigt lokale σ-Bindungsrichtungen, welches die räumliche Form? Nenne je eine Grenze.
  - Task demand (EN): For methane, an sp3 hybrid-orbital image and a digital ball-and-stick model are supplied. Which shows local sigma directions and which spatial shape? Name one limit of each.
  - Expected performance (DE): Die lernende Person ordnet σ-Erklärung dem Hybridbild und tetraedrische Anordnung der 3D-Ansicht zu; sie behauptet nicht, Kugeln seien echte Atomoberflächen oder Hybridorbitale direkt fotografiert.
  - Expected performance (EN): The learner assigns sigma explanation to the hybrid image and tetrahedral arrangement to the 3D view; they do not claim balls are real atom surfaces or hybrid orbitals photographed directly.
  - Understanding focus (DE): Modellauswahl folgt der fachlichen Frage.
  - Understanding focus (EN): Model choice follows the scientific question.
- `fresh-cyclohexane-question`
  - Task demand (DE): Eine neue Aufgabe fragt, welche Cyclohexan-Konformation räumlich plausibel ist und ob die einzelnen C-Zentren sp3 sind. Wähle für jede Teilfrage ein geeignetes Modell und erkläre die Grenzen.
  - Task demand (EN): A fresh task asks which cyclohexane conformation is spatially plausible and whether individual carbon centers are sp3. Choose a suitable model for each question and explain limits.
  - Expected performance (DE): Die lernende Person nutzt 3D-Modellierung für die Ringkonformation und Hybridisierung für lokale C-Bindungsgeometrie; sie kennzeichnet berechnete Modelle als modellabhängig.
  - Expected performance (EN): The learner uses 3D modelling for ring conformation and hybridization for local C bonding geometry, marking computed structures as model-dependent.
  - Understanding focus (DE): Neuer Modellbedarf prüft begründete Auswahl.
  - Understanding focus (EN): A new model need tests justified selection.
## Page 4: Konzentrationsbedingte Gleichgewichtsverschiebungen experimentell untersuchen

- Full learning-goal ID: `d2d735de-bede-5310-8aeb-8bb7562c7b75`
- Goal fingerprint: `sha256:ffeb03c916d5823528e30dccafd39d3420a87a15d68d0eaea076b3223e8234d3`
- Page fingerprint: `sha256:b304e96bc038a5cc1de0ae7da3e7120bc2644b6cfbc0f3835c6bf723cb1fd2d2`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann an einem vorgegebenen homogenen Gleichgewicht eine einzelne Konzentrationsänderung unter den vorgegebenen Sicherheitsbedingungen experimentell untersuchen, Vergleichsbeobachtungen mit einer Referenz protokollieren und die beobachtete Verschiebung mit dem Prinzip von Le Chatelier unter Angabe der Grenzen des verwendeten Modells erklären.

### Visualization

/assets/goal-visualizations/chemie/d2d735de-bede-5310-8aeb-8bb7562c7b75/d2d735de-bede-5310-8aeb-8bb7562c7b75.png

- original digest: `sha256:becd791c21d8aa1f2b84f72e941db639fca093a961c428d4e90b5f1a43b343c4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Le-Chatelier-Prinzip nutzen — `5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Konzentrationsvariation praktisch durchführen und auswerten — `3259bf7f-4af4-58ae-8190-9aec07ec476f` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d00ee2763a7c0c770ca69394becd095ccaccc20181427c5cd0ccb0b99a073056`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `practical-duty-1`
  - Essential understanding (DE): 2P: Ein-Faktor-Aufbau, gleiches Zugabevolumen, Referenz und passende Blindwerte.
  - Essential understanding (EN): 2 points: One-factor arrangement, matched addition volumes, reference, and matched blanks.
  - Observable performance (DE): 2P: Ein-Faktor-Aufbau, gleiches Zugabevolumen, Referenz und passende Blindwerte. Direkte Beobachtung der Durchführung und originale Protokollführung sind erforderlich; dieses Material ist nur synthetische Maschinen-QS.
  - Observable performance (EN): 2 points: One-factor arrangement, matched addition volumes, reference, and matched blanks. Direct observation of execution and genuine records are required; this material is synthetic machine QA only.
- `practical-duty-2`
  - Essential understanding (DE): 2P: Sichere korrekte Durchführung/Protokollierung als erforderliche Beobachtung beschreiben; keine Ausführungsbehauptung aus synthetischen Daten.
  - Essential understanding (EN): 2 points: Specify safe correct execution/recording as an observation requirement; do not infer execution from synthetic data.
  - Observable performance (DE): 2P: Sichere korrekte Durchführung/Protokollierung als erforderliche Beobachtung beschreiben; keine Ausführungsbehauptung aus synthetischen Daten. Direkte Beobachtung der Durchführung und originale Protokollführung sind erforderlich; dieses Material ist nur synthetische Maschinen-QS.
  - Observable performance (EN): 2 points: Specify safe correct execution/recording as an observation requirement; do not infer execution from synthetic data. Direct observation of execution and genuine records are required; this material is synthetic machine QA only.
- `practical-duty-3`
  - Essential understanding (DE): 2P: V/K/R vergleichen und verdünnungs-/farbbedingte Alternativerklärungen prüfen.
  - Essential understanding (EN): 2 points: Compare V/K/R and check dilution/colour alternatives.
  - Observable performance (DE): 2P: V/K/R vergleichen und verdünnungs-/farbbedingte Alternativerklärungen prüfen. Direkte Beobachtung der Durchführung und originale Protokollführung sind erforderlich; dieses Material ist nur synthetische Maschinen-QS.
  - Observable performance (EN): 2 points: Compare V/K/R and check dilution/colour alternatives. Direct observation of execution and genuine records are required; this material is synthetic machine QA only.
- `practical-duty-4`
  - Essential understanding (DE): 2P: Richtige Konzentrations-/Q-/Le-Chatelier-Deutung ohne K-Änderung oder vollständige Speziationsbehauptung.
  - Essential understanding (EN): 2 points: Correct concentration/Q/Le Chatelier interpretation without changing K or claiming full speciation.
  - Observable performance (DE): 2P: Richtige Konzentrations-/Q-/Le-Chatelier-Deutung ohne K-Änderung oder vollständige Speziationsbehauptung. Direkte Beobachtung der Durchführung und originale Protokollführung sind erforderlich; dieses Material ist nur synthetische Maschinen-QS.
  - Observable performance (EN): 2 points: Correct concentration/Q/Le Chatelier interpretation without changing K or claiming full speciation. Direct observation of execution and genuine records are required; this material is synthetic machine QA only.

**Coverage expectations**

- required expectations: `practical-duty-1`, `practical-duty-2`, `practical-duty-3`, `practical-duty-4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `whole-practical-context`: Eisen(III)-Zugabe mit Volumen- und Farbkontrolle / Thiocyanatzugabe als zweite einzelne Konzentrationsvariation / Iron(III) addition with volume and colour controls / Thiocyanate addition as a second single-concentration change
- `independent-fresh-error`: Eine neue Probe wird bei gleicher Temperatur mit dem gleichen Volumen Trägerlösung verdünnt, aber ohne Fe3+-Zugabe. Die rote Farbe wird schwächer. Beweist das allein eine chemische Linksverschiebung? / In einer frischen Wiederholung wird versehentlich auch die Temperatur erhöht. Kann der beobachtete Farbunterschied ausschließlich der SCN−-Zugabe zugeordnet werden? / A fresh sample is diluted at the same temperature with carrier only, without adding Fe3+. Its red colour weakens. Does this alone prove a chemical shift to the left? / In a fresh repeat the temperature is accidentally also raised. Can the observed colour difference be attributed solely to SCN− addition?

**Application cases**

- `bw-practical-equilibrium-a`
  - Task demand (DE): Arbeite das vollständige vorgegebene Untersuchungsprotokoll aus: kontrollierte Variation, Durchführung, Beobachtungen, Referenz-/Blindvergleich und begrenzte Erklärung. Werte die synthetische Reihe aus. Sage getrennt, was zur tatsächlichen Durchführungskompetenz im Unterricht beobachtet werden müsste. Frischer Transfer: Eine neue Probe wird bei gleicher Temperatur mit dem gleichen Volumen Trägerlösung verdünnt, aber ohne Fe3+-Zugabe. Die rote Farbe wird schwächer. Beweist das allein eine chemische Linksverschiebung? Vollständiges Material, Protokoll und Daten verpflichtend verwenden: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-context-bound-practical-companions-author-v1/science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json; Fall bw-practical-equilibrium-a. Die Kurzreferenz ersetzt keinen Protokollschritt.
  - Task demand (EN): Work through the complete specified investigation: controlled change, execution, observations, reference/blank comparison, and bounded explanation. Evaluate the synthetic series. Separately state what must be observed in class to demonstrate actual execution competence. Fresh transfer: A fresh sample is diluted at the same temperature with carrier only, without adding Fe3+. Its red colour weakens. Does this alone prove a chemical shift to the left? Use the complete material, procedure and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-context-bound-practical-companions-author-v1/science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json; case bw-practical-equilibrium-a. This brief reference replaces no procedure step.
  - Expected performance (DE): R bleibt bei0,30; K erklärt den kleinen Verdünnungseffekt. V steigt nach Fe3+-Zugabe deutlich gegenüber K. Das passt im angegebenen Modell zu mehr rotem Komplex: die erhöhte Fe3+-Konzentration senkt zunächst Q = [Komplex]/([Fe3+][SCN−]); die Nettoumsetzung verläuft nach rechts, bis das Gleichgewicht neu eingestellt ist. Bei gleicher Temperatur wird K nicht durch Konzentrationszugabe geändert. Die passende Blindkorrektur begrenzt die zusätzliche Fe(III)-Eigenfarbe. Andere Komplexe/Matrixeffekte sind Grenzen, kein Beweis eines isolierten einzigen realen Gleichgewichts. Beobachtbar sein müssten korrektes Dosieren, sicheres Mischen, kontrollierte Zeiten, echte Aufzeichnungen und Entsorgung; die synthetischen Werte belegen keine Durchführung. Frischer Transfer: Nein. Verdünnung senkt bereits die Konzentration des Farbstoffs. Im vereinfachten 1:1→1-Modell begünstigt Verdünnung zusätzlich die Seite mit mehr gelösten Teilchen; ein Farbsignal allein trennt beide Beiträge nicht. Es braucht geeigneten Volumenvergleich/quantitative Stoffdaten; K bleibt bei gleicher Temperatur unverändert. Bewertung/10: 2P: Ein-Faktor-Aufbau, gleiches Zugabevolumen, Referenz und passende Blindwerte.; 2P: Sichere korrekte Durchführung/Protokollierung als erforderliche Beobachtung beschreiben; keine Ausführungsbehauptung aus synthetischen Daten.; 2P: V/K/R vergleichen und verdünnungs-/farbbedingte Alternativerklärungen prüfen.; 2P: Richtige Konzentrations-/Q-/Le-Chatelier-Deutung ohne K-Änderung oder vollständige Speziationsbehauptung.; 2P: Unabhängige frische Störung korrekt begrenzen.
  - Expected performance (EN): R stays at0.30; K explains the small dilution effect. V rises clearly relative to K after Fe3+ addition. In the stated model this fits increased red complex: raising Fe3+ initially lowers Q = [complex]/([Fe3+][SCN−]); net conversion proceeds right until equilibrium is re-established. At fixed temperature a concentration addition does not change K. Matched blank correction limits extra iron(III) colour. Other complexes/matrix effects remain limitations, not proof of one isolated real equilibrium. Correct dosing, safe mixing, controlled times, genuine records, and disposal must be observed; synthetic readings establish no execution. Fresh transfer: No. Dilution already lowers the coloured-species concentration. In the simplified 1:1→1 model dilution additionally favours the side with more dissolved particles, but colour alone does not separate the contributions. Suitable volume comparison/quantitative species data are needed; K stays unchanged at fixed temperature. Scoring/10: 2 points: One-factor arrangement, matched addition volumes, reference, and matched blanks.; 2 points: Specify safe correct execution/recording as an observation requirement; do not infer execution from synthetic data.; 2 points: Compare V/K/R and check dilution/colour alternatives.; 2 points: Correct concentration/Q/Le Chatelier interpretation without changing K or claiming full speciation.; 2 points: Correctly bound the independent fresh disturbance.
  - Understanding focus (DE): Die vollständige praktische Kompetenz ist Ziel des Protokolls. Die synthetische Ausarbeitung ist E1/G1, keine ausgeführte Durchführung, keine Lernendenleistung und kein menschlicher Release.
  - Understanding focus (EN): The protocol targets the whole practical competence. Synthetic worked material is E1/G1, not executed practical work, learner performance, or human release.
- `bw-practical-equilibrium-b`
  - Task demand (DE): Führe denselben kontrollierten Ablauf als ausgearbeitetes QS-Protokoll für die SCN−-Variation aus. Vergleiche die Beobachtungsreihe mit R/K, deute den Konzentrationseffekt und nenne die direkt beobachtbare praktische Leistung. Setze verschiedene rote Intensitäten nicht ungeprüft mit verschiedenen K-Werten gleich. Frischer Transfer: In einer frischen Wiederholung wird versehentlich auch die Temperatur erhöht. Kann der beobachtete Farbunterschied ausschließlich der SCN−-Zugabe zugeordnet werden? Vollständiges Material, Protokoll und Daten verpflichtend verwenden: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-context-bound-practical-companions-author-v1/science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json; Fall bw-practical-equilibrium-b. Die Kurzreferenz ersetzt keinen Protokollschritt.
  - Task demand (EN): Work through the same controlled procedure as a complete QA protocol for the SCN− variation. Compare observations with R/K, explain the concentration effect, and identify directly observable practical performance. Do not equate different red intensities with different K values. Fresh transfer: In a fresh repeat the temperature is accidentally also raised. Can the observed colour difference be attributed solely to SCN− addition? Use the complete material, procedure and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-context-bound-practical-companions-author-v1/science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json; case bw-practical-equilibrium-b. This brief reference replaces no procedure step.
  - Expected performance (DE): K zeigt nur die kontrollierte geringe Verdünnung, V danach deutlich mehr rotes Signal. Erhöhtes SCN− senkt im angegebenen vereinfachten Modell zunächst Q und begünstigt Netto-Komplexbildung. Gleiche Temperatur und gleiche chemische Reaktion bedeuten nicht verschiedene K-Werte; auch die Gesamtstoffmengen sind verschieden. Tatsächliche Durchführung fordert beobachtetes sicheres Dosieren, Mischen, Messen und Protokollieren. Mehrfachkomplexe, Eigenfarbe, Schichtdicke und Säurematrix begrenzen die Deutung; kein vollständiger Speziationsnachweis. Frischer Transfer: Nein. Zwei Faktoren wurden geändert; Temperatur kann Gleichgewichtslage und optisches Signal beeinflussen. Versuch bei gleicher Temperatur wiederholen, Temperatur aufzeichnen und keine reine Konzentrationskausalität behaupten. Bewertung/10: 2P: Ein-Faktor-Aufbau, gleiches Zugabevolumen, Referenz und passende Blindwerte.; 2P: Sichere korrekte Durchführung/Protokollierung als erforderliche Beobachtung beschreiben; keine Ausführungsbehauptung aus synthetischen Daten.; 2P: V/K/R vergleichen und verdünnungs-/farbbedingte Alternativerklärungen prüfen.; 2P: Richtige Konzentrations-/Q-/Le-Chatelier-Deutung ohne K-Änderung oder vollständige Speziationsbehauptung.; 2P: Unabhängige frische Störung korrekt begrenzen.
  - Expected performance (EN): K shows the controlled small dilution, whereas V subsequently gives a clearly stronger red signal. Increased SCN− initially lowers Q in the stated simplified model and favours net complex formation. The same temperature and reaction do not imply different K values; total amounts also differ. Actual execution requires observed safe dosing, mixing, measurement, and recording. Multiple complexes, inherent colour, optical path, and acid matrix limit interpretation; no complete speciation is established. Fresh transfer: No. Two factors changed; temperature can affect the equilibrium position and optical signal. Repeat at matched temperature, record it, and do not claim concentration alone caused the difference. Scoring/10: 2 points: One-factor arrangement, matched addition volumes, reference, and matched blanks.; 2 points: Specify safe correct execution/recording as an observation requirement; do not infer execution from synthetic data.; 2 points: Compare V/K/R and check dilution/colour alternatives.; 2 points: Correct concentration/Q/Le Chatelier interpretation without changing K or claiming full speciation.; 2 points: Correctly bound the independent fresh disturbance.
  - Understanding focus (DE): Die vollständige praktische Kompetenz ist Ziel des Protokolls. Die synthetische Ausarbeitung ist E1/G1, keine ausgeführte Durchführung, keine Lernendenleistung und kein menschlicher Release.
  - Understanding focus (EN): The protocol targets the whole practical competence. Synthetic worked material is E1/G1, not executed practical work, learner performance, or human release.
## Page 5: Boltzmann/Statistik

- Full learning-goal ID: `d4720a9a-65e2-5661-aaaa-c393d144419a`
- Goal fingerprint: `sha256:0b5f166cd8e4c79d750f8633656d4dbdf5687f92d2a16af8a009236971fe6a21`
- Page fingerprint: `sha256:3da57f01c855089bef4a3888f803f4bb227ac53d6f1a3092baa7861aa531d9b7`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann einfache statistische Verteilungen zur Energetik einordnen.

### Visualization

/assets/goal-visualizations/chemie/d4720a9a-65e2-5661-aaaa-c393d144419a/d4720a9a-65e2-5661-aaaa-c393d144419a.jpg

- original digest: `sha256:e0ed68f4d7672aed364f205ba876c4c13a3c7c84c29b83fe40455b64bb210e6b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- RGT-Regel anwenden — `56115f9d-1d32-5454-94b1-00dbc4a7bc6f` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Boltzmann/Statistik — `479e4194-b5a8-56a1-b95a-829a3057cf25` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2042109a305fcc9c2ee30a89dacd58c29c6908df44624e5aa9b0039eed85ba4f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `expectation-actual-boltzmann-curves`
  - Essential understanding (DE): Echte Verteilungsfigur über Fläche, Energiegrenze und konstante Teilchenzahl auswerten.
  - Essential understanding (EN): Interpret an actual distribution plot using area, threshold and constant particle count.
  - Observable performance (DE): E_peak≈1,2471 bzw. 1,8707 kJ/mol; die wärmere Kurve ist breiter, ihr Maximum niedriger/weiter rechts, beide Gesamtflächen sind 1. Der normierte Flächenanteil über 15 kJ/mol ist bei 450 K größer, ohne dass alle Teilchen oberhalb liegen. Mehr energiereiche geeignete Kollisionen können höhere Reaktionsrate erklären. Fläche/Teilchenzahl darf nicht mit Kurvenhöhe verwechselt werden. Orientierung, Stoßhäufigkeit, Mechanismus und Reaktionspartner bleiben zusätzliche Bedingungen. Die CSV/Integrationsrechnung bindet die tatsächlichen Modellwerte. Konkrete Flächen: P300(E≥15)=0.00729; P450(E≥15)=0.04563.
  - Observable performance (EN): Peak energies are about 1.2471 and 1.8707 kJ/mol. The hotter curve is broader, with a lower/right-shifted peak; both total areas are 1. The fraction above 15 kJ/mol is greater at 450 K without putting every particle above it. More sufficiently energetic suitable collisions may explain a greater rate. Do not confuse area/particle fraction with curve height. Orientation, collision frequency, mechanism and partners remain additional conditions. The CSV/integration binds the actual model values. Concrete areas: P300(E≥15)=0.00729; P450(E≥15)=0.04563.
- `expectation-catalyst-threshold-transfer`
  - Essential understanding (DE): Verteilung unverändert halten und niedrigere Aktivierungsgrenze als anderen Weg deuten.
  - Essential understanding (EN): Keep the distribution unchanged and interpret a lower threshold as an alternative pathway.
  - Observable performance (DE): Bei gleicher T bleibt f(E) samt Peak/Normierung unverändert. Die niedrigere Grenze 10 kJ/mol schließt mehr Teilchenenergiezustände ein als 15 kJ/mol; das ist eine Schwellen-/Wegänderung, keine Erwärmung. Die konkreten Flächen aus dem Integrationsbeleg werden verglichen. Eine vollständige Rate hängt zusätzlich von Orientierung/Präfaktoren, Konzentrationen und Mechanismus ab. Ein Katalysator ändert weder Reaktions-Gibbs-Energie noch Gleichgewichtskonstante; er ersetzt keinen thermodynamischen Antrieb. Konkrete Flächen bei300 K: P(E≥15)=0.00729; P(E≥10)=0.04563; Verhältnis≈6.261.
  - Observable performance (EN): At equal T, f(E), its peak and normalisation remain unchanged. The lower 10 kJ/mol threshold includes more energy states than 15 kJ/mol: pathway/threshold change, not heating. Compare the actual integrated areas in the receipt. Full rate also depends on orientation/prefactors, concentration and mechanism. Catalysis changes neither reaction Gibbs energy nor equilibrium constant and supplies no thermodynamic driving force. Concrete areas at300 K: P(E≥15)=0.00729; P(E≥10)=0.04563; ratio≈6.261.

**Coverage expectations**

- required expectations: `expectation-actual-boltzmann-curves`, `expectation-catalyst-threshold-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-relevant-conditions`: Die vollständig gebundenen Fälle wechseln Reaktion, Systemgrenze, Temperatur, Aggregatzustand, Stoffmengen-/Energiebasis, Messverfahren oder Zusammensetzung. Tatsächliche Durchführung bleibt dort erforderlich, wo der konkrete Quellenoperator sie verlangt. / The bound cases vary reaction, system boundary, temperature, phase, amount/energy basis, method or composition. Actual execution remains required where the specific source operator demands it.

**Application cases**

- `actual-boltzmann-curves`
  - Task demand (DE): Gebundener Autorenplot und CSV: Maxwell-Boltzmann-Energieverteilung idealer Teilchen bei 300/450 K, gleiche Teilchenzahl, ∫f(E)dE=1; E in kJ/mol und f in (kJ/mol)^-1. Modell f(E)=2/sqrt(pi)·sqrt(E)/(RT)^(3/2)·exp(-E/(RT)), R=0,008314 kJ/(mol K). Aktivierungsgrenze E_a=15 kJ/mol. Die Verteilung ist eine berechnete Aufgabenfigur, keine Messung. Lies die tatsächlich beigefügten Kurven ab, vergleiche Maximum, Breite und Fläche oberhalb E_a. Berechne die Lage des Maximums mit E_peak=RT/2 und begründe den Temperatur-/Geschwindigkeitsbezug sowie die Grenzen einer Energiebereitschaftsprognose.
  - Task demand (EN): Bound author plot/CSV: ideal-particle Maxwell-Boltzmann energy distributions at 300/450 K, equal particle numbers and ∫f(E)dE=1; E in kJ/mol, f in (kJ/mol)^-1. Model f(E)=2/sqrt(pi)·sqrt(E)/(RT)^(3/2)·exp(-E/(RT)); R=0.008314 kJ/(mol K). Threshold E_a=15 kJ/mol. This computed task figure is not a measurement. Read the actual attached curves and compare peak, width and area above E_a. Calculate the peak energy with E_peak=RT/2 and explain temperature/rate relations plus limits of energy-readiness predictions.
  - Expected performance (DE): E_peak≈1,2471 bzw. 1,8707 kJ/mol; die wärmere Kurve ist breiter, ihr Maximum niedriger/weiter rechts, beide Gesamtflächen sind 1. Der normierte Flächenanteil über 15 kJ/mol ist bei 450 K größer, ohne dass alle Teilchen oberhalb liegen. Mehr energiereiche geeignete Kollisionen können höhere Reaktionsrate erklären. Fläche/Teilchenzahl darf nicht mit Kurvenhöhe verwechselt werden. Orientierung, Stoßhäufigkeit, Mechanismus und Reaktionspartner bleiben zusätzliche Bedingungen. Die CSV/Integrationsrechnung bindet die tatsächlichen Modellwerte. Konkrete Flächen: P300(E≥15)=0.00729; P450(E≥15)=0.04563.
  - Expected performance (EN): Peak energies are about 1.2471 and 1.8707 kJ/mol. The hotter curve is broader, with a lower/right-shifted peak; both total areas are 1. The fraction above 15 kJ/mol is greater at 450 K without putting every particle above it. More sufficiently energetic suitable collisions may explain a greater rate. Do not confuse area/particle fraction with curve height. Orientation, collision frequency, mechanism and partners remain additional conditions. The CSV/integration binds the actual model values. Concrete areas: P300(E≥15)=0.00729; P450(E≥15)=0.04563.
  - Understanding focus (DE): Echte Verteilungsfigur über Fläche, Energiegrenze und konstante Teilchenzahl auswerten.
  - Understanding focus (EN): Interpret an actual distribution plot using area, threshold and constant particle count.
- `catalyst-threshold-transfer`
  - Task demand (DE): Zweiter gebundener Plot nutzt dieselbe 300-K-Verteilung und zwei Grenzen: E_a=15 bzw. 10 kJ/mol. Die berechneten normierten Flächen werden im CSV/Integrationsbeleg angegeben. Ein Katalysator bietet im Modell einen alternativen Weg mit niedrigerem E_a; die Temperatur und Teilchenzahl bleiben gleich. Vergleiche die beiden tatsächlich markierten Integrationsflächen und widerlege ein Katalysator macht alle Teilchen heißer. Erläutere, welche Verteilungsgröße unverändert bleibt und warum der Flächenfaktor allein keine vollständige Rate oder Gleichgewichtslage liefert.
  - Task demand (EN): Second bound plot uses the same 300 K distribution with thresholds E_a=15 or 10 kJ/mol. Computed normalised areas are given in the CSV/integration receipt. A catalyst offers an alternative lower-E_a path in this model; temperature and particle count remain unchanged. Compare the actual marked integration areas and reject the claim that a catalyst heats every particle. Explain what remains unchanged and why the area ratio alone gives neither a complete rate nor equilibrium position.
  - Expected performance (DE): Bei gleicher T bleibt f(E) samt Peak/Normierung unverändert. Die niedrigere Grenze 10 kJ/mol schließt mehr Teilchenenergiezustände ein als 15 kJ/mol; das ist eine Schwellen-/Wegänderung, keine Erwärmung. Die konkreten Flächen aus dem Integrationsbeleg werden verglichen. Eine vollständige Rate hängt zusätzlich von Orientierung/Präfaktoren, Konzentrationen und Mechanismus ab. Ein Katalysator ändert weder Reaktions-Gibbs-Energie noch Gleichgewichtskonstante; er ersetzt keinen thermodynamischen Antrieb. Konkrete Flächen bei300 K: P(E≥15)=0.00729; P(E≥10)=0.04563; Verhältnis≈6.261.
  - Expected performance (EN): At equal T, f(E), its peak and normalisation remain unchanged. The lower 10 kJ/mol threshold includes more energy states than 15 kJ/mol: pathway/threshold change, not heating. Compare the actual integrated areas in the receipt. Full rate also depends on orientation/prefactors, concentration and mechanism. Catalysis changes neither reaction Gibbs energy nor equilibrium constant and supplies no thermodynamic driving force. Concrete areas at300 K: P(E≥15)=0.00729; P(E≥10)=0.04563; ratio≈6.261.
  - Understanding focus (DE): Verteilung unverändert halten und niedrigere Aktivierungsgrenze als anderen Weg deuten.
  - Understanding focus (EN): Keep the distribution unchanged and interpret a lower threshold as an alternative pathway.
## Page 6: Zweiatomigkeit gasfoermiger Elementmolekuele begruenden

- Full learning-goal ID: `d629220a-8c1e-58ee-a6e1-b5f4f10e2e7a`
- Goal fingerprint: `sha256:e6489ba2940cde97dc81c692c10bc97f4aaf62c5bf20ea007b8bd8429bf2a539`
- Page fingerprint: `sha256:ba7363815bba1229e84b05fb2d3cf3d5054b84f50af9222f00acec780682173e`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Zweiatomigkeit wichtiger gasförmiger Elemente im Teilchenmodell erläutern und daraus ihre Molekülformeln für einfache Reaktionsgleichungen begründen.

### Visualization

/assets/goal-visualizations/chemie/d629220a-8c1e-58ee-a6e1-b5f4f10e2e7a/d629220a-8c1e-58ee-a6e1-b5f4f10e2e7a.jpg

- original digest: `sha256:9cd77db2e2afbe3c3f5b6aec980a873061fea005fe76f26d0b30b5ec07553dc9`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Gasverhalten mit dem kinetischen Teilchenmodell deuten — `5c4788a7-6760-53dc-894e-e04bca6f8cd9` (outside this book)
- Chemische Symbole und Formeln sicher nutzen — `e7c363d4-e02d-4895-8750-ba62c2eb63fe` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2c32d2386ffd181dc656deafed2830bb969f1a33a81a167aec1a2afa91a3af95`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `selected-diatomic-elements-and-equation-notation`
  - Essential understanding (DE): Wichtige elementare Gase wie H2,O2,N2 und Cl2 können aus zwei gleichartigen gebundenen Atomen je Molekül bestehen; das bedeutet weder ein Gemisch noch eine Verbindung verschiedener Elemente. Nicht alle Gase sind zweiatomig. Formelindizes beschreiben ein Teilchen, Koeffizienten dessen Anzahl in einem Reaktionsverhältnis; beim Ausgleichen bleibt die vorgegebene Stoffformel erhalten.
  - Essential understanding (EN): Important elemental gases such as H2,O2,N2 and Cl2 can consist of two bonded atoms of the same element per molecule; this is neither a mixture nor a compound of different elements. Not all gases are diatomic. Formula subscripts describe one particle, whereas coefficients count particles in a reaction ratio; balancing retains the given substance formulas.
  - Observable performance (DE): Die lernende Person deutet gegebene Teilchenmodelle wichtiger elementarer Gase und nutzt die Zweizahl fachlich richtig in Formeln und atomar bilanzierten Reaktionsgleichungen.
  - Observable performance (EN): The learner interprets supplied particle models of important elemental gases and uses their two-atom composition correctly in formulas and atom-balanced reaction equations.

**Coverage expectations**

- required expectations: `selected-diatomic-elements-and-equation-notation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `elemental-gas`: Sauerstoff/Wasserstoff werden durch Chlor/Wasserstoff und eine einatomige Ausnahme ergänzt. / Oxygen/hydrogen are replaced by chlorine/hydrogen with a monatomic exception.
- `notation-layer`: Indizes innerhalb eines Moleküls werden von Koeffizienten vor Formeln unterschieden. / Subscripts within a molecule are distinguished from coefficients before formulas.

**Application cases**

- `oxygen-model-and-water`
  - Task demand (DE): Gegebene Gasmodelle: Sauerstoff zeigt O–O-Paare, Stickstoff N–N-Paare, Argon einzelne Ar-Atome. Formuliere die Stoffformeln und erkläre, warum Sauerstoff trotzdem ein Element ist. Für Wasserbildung sind die Stoffformeln H2,O2,H2O vorgegeben. Stelle die ausgeglichene Gleichung auf und erläutere die unterschiedliche Bedeutung von O2 und2H2O.
  - Task demand (EN): Supplied gas models show oxygen as O–O pairs, nitrogen as N–N pairs and argon as individual Ar atoms. Give the formulas and explain why oxygen is still an element. Water formation uses the specified substance formulas H2,O2,H2O. Write the balanced equation and explain the different meanings of O2 and2H2O.
  - Expected performance (DE): Formeln O2,N2,Ar; die Paare enthalten jeweils nur Atome einer Elementsorte. Wasserbildung:2H2+O2→2H2O. O2 benennt zwei O-Atome in einem Sauerstoffmolekül;2H2O benennt zwei Wassermoleküle mit zusammen vier H- und zwei O-Atomen. Argon widerlegt die Verallgemeinerung „jedes Gas ist zweiatomig“.
  - Expected performance (EN): Formulas are O2,N2,Ar; each pair contains only one type of element. Water formation is2H2+O2→2H2O. O2 specifies two O atoms in one oxygen molecule;2H2O specifies two water molecules, together containing four H and two O atoms. Argon refutes the generalisation that every gas is diatomic.
  - Understanding focus (DE): Teilchenzusammensetzung und Stoff-/Reaktionsnotation sind konsistent zu verknüpfen.
  - Understanding focus (EN): Particle composition, substance notation and reaction notation must be linked consistently.
- `chlorine-hydrogen-fresh`
  - Task demand (DE): Frischer Fall ohne vorgelegte Gleichung: Wasserstoffgas besteht aus H–H-Molekülen, Chlorgas aus Cl–Cl-Molekülen; das Produkt enthält H–Cl-Moleküle. Entwickle Formeln und Reaktionsverhältnis. Prüfe die Aussagen „Cl2 ist eine Verbindung aus zwei Elementen“ und „Beim Ausgleichen kann man HCl einfach in HCl2 ändern“.
  - Task demand (EN): Fresh case without a supplied equation: hydrogen gas consists of H–H molecules, chlorine gas of Cl–Cl molecules and the product of H–Cl molecules. Develop formulas and the reaction ratio. Evaluate “Cl2 is a compound of two elements” and “When balancing, one can simply change HCl to HCl2”.
  - Expected performance (DE): H2+Cl2→2HCl erhält jeweils zwei H- und Cl-Atome. Cl2 enthält zwei Atome desselben Elements, nicht zwei Elemente. HCl2 wäre eine andere Zusammensetzung; ausgeglichen wird hier mit dem Koeffizienten2 vor HCl. Die Begründung nutzt die gelieferten Molekülmodelle, keine unbelegte Regel für alle elementaren Gase.
  - Expected performance (EN): H2+Cl2→2HCl conserves two H and two Cl atoms. Cl2 has two atoms of one element, not two elements. HCl2 would have a different composition; balancing here uses the coefficient2 before HCl. The reasoning uses the supplied molecular models rather than an unsupported rule for all elemental gases.
  - Understanding focus (DE): Neues Gas-/Produktpaar erfordert selbstständige molekulare Bilanz und Indexkritik.
  - Understanding focus (EN): A new gas/product pair requires independent molecular balancing and critique of subscript changes.
## Page 7: Kalkkreislauf chemisch beschreiben

- Full learning-goal ID: `d726e00e-1f87-5ba5-8c79-76ad4022365e`
- Goal fingerprint: `sha256:fc47e3a48f79697f198f61d9c0e8a204257fe1a0438b590882838132f4ed483a`
- Page fingerprint: `sha256:84acad77811a044b84f36031638e72251cdbb13271ea94e16a5a21115a813ecc`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die wesentlichen Stoffumwandlungen im Kalkkreislauf chemisch beschreiben und mit Carbonaten verknuepfen.

### Visualization

/assets/goal-visualizations/chemie/d726e00e-1f87-5ba5-8c79-76ad4022365e/d726e00e-1f87-5ba5-8c79-76ad4022365e.png

- original digest: `sha256:51341eaf35f02e3bf70b9a65d9187895189c9d98daba97413c97b9eed992f6eb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)
- Halogenide, Sulfate, Nitrate und Carbonate einordnen — `b5086548-169e-5d63-a14a-dabf631fa013` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2014bccf5392c4b6f748795cec968290799cfb23f1fdfd8fd1012a19505a2a1a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `b010-d726-lime-cycle-transformations`
  - Essential understanding (DE): Beim Brennen zerfällt Calciumcarbonat zu Calciumoxid und CO₂; beim Löschen reagiert Calciumoxid mit Wasser zu Calciumhydroxid; beim Abbinden reagiert Calciumhydroxid mit CO₂ wieder zu Calciumcarbonat und Wasser. Der vereinfachte Kreislauf verbindet drei Stoffumwandlungen, kein unveränderter Stoff oder bloßer Phasenwechsel läuft im Kreis.
  - Essential understanding (EN): Calcination decomposes calcium carbonate to calcium oxide and CO₂; slaking reacts calcium oxide with water to form calcium hydroxide; setting reacts calcium hydroxide with CO₂ to form calcium carbonate and water again. The simplified cycle links three substance transformations; no unchanged substance or mere phase change circles around.
  - Observable performance (DE): Die lernende Person ordnet neue Stoff- oder Beobachtungsdaten den Schritten zu, benennt jeweils benötigte Reaktionspartner und Produkte, kann die passenden ausgeglichenen Gleichungen angeben und erklärt die Rückkehr zum Carbonat samt Rolle des CO₂.
  - Observable performance (EN): The learner assigns new substance or observation data to the steps, names the required reactants and products, can give the corresponding balanced equations, and explains the return to carbonate and the role of CO₂.

**Coverage expectations**

- required expectations: `b010-d726-lime-cycle-transformations`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `entry-point-and-material-state`: Ein Fall beginnt bei Branntkalk statt bei Kalkstein und verlangt die richtige Fortsetzung und Rückkehr zum Carbonat. / One case starts with quicklime instead of limestone and asks for the correct continuation and return to carbonate.
- `carbon-dioxide-control`: Ein zweiter Fall variiert bei gleichem gelöschtem Kalk den CO₂-Zutritt und prüft, ob Wasser allein das Abbinden zu Carbonat erklären kann. / A second case varies CO₂ access for the same slaked lime and tests whether water alone can explain setting to carbonate.

**Application cases**

- `quicklime-start-and-return`
  - Task demand (DE): Ohne Kreislaufbild ist eine Dose mit CaO als Ausgangspunkt angegeben. Nach Zugabe von Wasser entsteht Stoff A; nach längerem Kontakt von A mit Luft-CO₂ entsteht wieder ein Carbonat B. Benenne A und B, gib die beiden ausgeglichenen Stoffgleichungen an und erkläre, durch welchen vorausgehenden Schritt aus B erneut CaO gewonnen werden kann. Die Situation ist nur eine Papieraufgabe, kein Versuch.
  - Task demand (EN): Without a cycle diagram, a container of CaO is the starting point. Adding water gives substance A; after longer contact of A with atmospheric CO₂ a carbonate B forms again. Name A and B, give the two balanced substance equations, and explain which preceding step could produce CaO from B again. This is a written task, not an experiment.
  - Expected performance (DE): A ist Ca(OH)₂: CaO + H₂O → Ca(OH)₂. B ist CaCO₃: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O. Erhitzen von CaCO₃ beim Brennen liefert wieder CaO und CO₂: CaCO₃ → CaO + CO₂. Wasserzugabe und Abbinden sind unterschiedliche chemische Reaktionen; die reale Brennstufe erfordert hohe Temperatur.
  - Expected performance (EN): A is Ca(OH)₂: CaO + H₂O → Ca(OH)₂. B is CaCO₃: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O. Heating CaCO₃ during calcination gives CaO and CO₂ again: CaCO₃ → CaO + CO₂. Water addition and setting are different chemical reactions; actual calcination needs high temperature.
  - Understanding focus (DE): Transfer mit neuem Startpunkt und stofflicher Bilanz der drei Schritte, statt die Pfeile eines Bildes auswendig wiederzugeben.
  - Understanding focus (EN): Transfer from a new starting point with material balance across all three steps, rather than memorizing arrows in an image.
- `sealed-versus-air-exposed-mortar-data`
  - Task demand (DE): Zwei bereits gelöschte Kalkproben mit gleichem Ca(OH)₂- und Wasseranteil werden in einem gelieferten Datensatz verglichen: Probe I hat Zutritt zu normaler Luft, Probe II bleibt unter CO₂-armer Schutzatmosphäre; nur bei I weist ein Test später deutlich Carbonat nach. Erkläre den Unterschied chemisch, formuliere die Abbinde-Reaktion und begründe, warum bloßes Trocknen bei II nicht denselben Carbonatnachweis liefert. Keine praktische Durchführung.
  - Task demand (EN): A supplied data set compares two already slaked lime samples with the same Ca(OH)₂ and water content: sample I has access to ordinary air, whereas sample II is kept under a CO₂-poor atmosphere; only I later shows a clear carbonate test. Explain the chemical difference, write the setting reaction, and explain why mere drying in II does not yield the same carbonate evidence. No practical procedure is requested.
  - Expected performance (DE): Luft-CO₂ reagiert in I mit Ca(OH)₂ zu CaCO₃ und H₂O: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O. In II fehlt weitgehend der benötigte CO₂-Reaktionspartner; Wasserverdunstung kann die Probe trocknen, bildet aber für sich kein Carbonat. Das ist ein Stoffumwandlungs- und kein bloßes Phasenwechselargument.
  - Expected performance (EN): Atmospheric CO₂ reacts with Ca(OH)₂ in I to form CaCO₃ and H₂O: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O. In II the necessary CO₂ reactant is largely absent; water evaporation may dry the sample but does not by itself form carbonate. This is a substance-transformation argument, not merely a phase-change argument.
  - Understanding focus (DE): Unabhängiger Transfer auf einen Kontrollvergleich, der den CO₂-Bedarf und die Grenze des Trockenmodells offenlegt.
  - Understanding focus (EN): Independent transfer to a control comparison revealing the need for CO₂ and the limit of a drying-only model.
## Page 8: Organische Farbmittel nach Kriterien einteilen

- Full learning-goal ID: `d72cbb62-0b65-5b9a-aece-70c23d4e618a`
- Goal fingerprint: `sha256:edfb0b1b1399d86865d83fec9ce956437a985e7781ef20792da4187085172733`
- Page fingerprint: `sha256:58d625f8a8640474b3123d057040e2a087a46b61a2446192a93c4cef54ed54ce`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann ausgewählte organische Farbmittelklassen anhand ausdrücklich benannter Kriterien vorstellen und gegebene Vertreter nachvollziehbar einteilen. Sie berücksichtigt dabei Azofarbstoffe und mindestens zwei weitere ausgewählte Farbstoffklassen und erläutert, wie Einteilungen nach Molekülstruktur, Löslichkeit, Herkunft, Färbemethode oder Verwendung unterschiedliche Zuordnungskriterien nutzen.

### Visualization

/assets/goal-visualizations/chemie/d72cbb62-0b65-5b9a-aece-70c23d4e618a/d72cbb62-0b65-5b9a-aece-70c23d4e618a.png

- original digest: `sha256:ce447f0238d27b060ab7483bc92dab267a44fa846026f9e05d3ec1b742f41299`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Sauerstoffhaltige organische Stoffklassen einteilen — `7990387d-f254-5d3b-a589-a3e7ed9502a3` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Organische Farbmittel nach Kriterien einteilen — `000af080-6908-5c7b-b792-a91796968022` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:13fc22a72abfeabf71830a02ac5fd331dc4f368a7d91d1fea2d5739cefef1a4d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Azo und zwei weitere Klassen besitzen benennbare strukturelle Unterscheidungsmerkmale.
  - Essential understanding (EN): Azo and two further classes have identifiable structural differences.
  - Observable performance (DE): 1: Azo plus beide weiteren Klassen vollständig vorgestellt und A/B/C strukturell begründet zugeordnet. 2: Alle drei Strukturklassen mit Azo und zwei weiteren Klassen korrekt benannt und begründet.
  - Observable performance (EN): 1: Azo plus both further classes introduced fully and A/B/C assigned using structural reasons. 2: All three structural classes, including azo and two further classes, correctly named and justified.
- `e2`
  - Essential understanding (DE): Löslichkeit und Herkunft sind von der Strukturklassifikation getrennt.
  - Essential understanding (EN): Solubility and origin are separate from structural classification.
  - Observable performance (DE): 1: Löslichkeit im jeweiligen Medium und Herkunft getrennt ausgewiesen, nicht aus Farbe oder Familie erraten. 2: P als unlöslich eingesetztes Pigment und Q/R als gelöst eingeordnet; Herkunft unabhängig angegeben.
  - Observable performance (EN): 1: Solubility in each medium and origin listed separately, not inferred from colour or family. 2: P classified as an insolubly applied pigment and Q/R as dissolved; origin supplied independently.
- `e3`
  - Essential understanding (DE): Färbemethode und Verwendung sind weitere, nicht identische Kriterien.
  - Essential understanding (EN): Dyeing method and use are additional, non-identical criteria.
  - Observable performance (DE): 1: Textilmethode/Verwendung getrennt; fehlende B/C-Textilmethoden benannt; Indikator als Verwendung erklärt. 2: Verwendung von Struktur und nicht belegter Textilfärbemethode getrennt.
  - Observable performance (EN): 1: Textile method/use separated; missing B/C textile methods identified; indicator explained as a use. 2: Use separated from structure and from unestablished textile dyeing method.
- `e4`
  - Essential understanding (DE): Ein geänderter Vertreter oder Herstellungsweg wird kriterientreu neu zugeordnet.
  - Essential understanding (EN): A changed representative or production route is reassigned consistently with each criterion.
  - Observable performance (DE): 1: Identisches synthetisches C ändert Herkunft, nicht Strukturklasse; keine Natur=gesund-Ableitung. 2: P→P′: Strukturklasse/Herkunft bleiben; Löslichkeit, Methode und Verwendung ändern sich laut Material; universelle Azo-Regel verworfen.
  - Observable performance (EN): 1: Identical synthetic C changes origin, not structural class; no natural=healthy inference. 2: P→P′: class/origin remain; solubility, method and use change as supplied; universal azo rule rejected.
- `hb217-origin-polyene-classification-only`
  - Essential understanding (DE): Die Karten unterscheiden Anthocyaningemisch, Azo-Struktur und beta-Carotin/Polyen. Wasserextraktion/Filtration sind ein gegebener Isolierungsweg, die genannte Azokupplung ein Syntheseweg; beide sind als Herkunftskriterium vom Molekülstrukturkriterium zu trennen. Mehrere C=C erlauben die Polyen-Zuordnung, nicht automatisch Wasserlöslichkeit, eine bestimmte Anwendung, Sicherheit oder Nachhaltigkeit. Die gegebenen Verwendungen bleiben an ihre Bedingungen gebunden; keine Energieerklärung ist hierfür verlangt.
  - Essential understanding (EN): The cards distinguish an anthocyanin mixture, azo structure and beta-carotene/polyene. Water extraction/filtration is a supplied isolation route and azo coupling a supplied synthesis route; origin and molecular family are separate criteria. Multiple C=C bonds support polyene classification, not automatic water solubility, a specific use, safety or sustainability. Supplied uses retain their conditions; no energy explanation is demanded for this classification.
  - Observable performance (DE): Ordne die gegebenen Natur-/Synthesebeispiele getrennt nach Strukturklasse, Herkunft/Gewinnungsart und Verwendung. Erhalte Azo-, Triarylmethan- und Anthocyaninklassen aus den beiden bisherigen Fällen und ergänze Polyene anhand mehrerer C=C-Bindungen. Trenne die angegebene physikalische Isolierung von einer angegebenen Synthese, ohne einen Synthesemechanismus oder ein Experiment ausführen zu müssen. Welche zusätzlichen Qualitäts-/Verwendungsdaten fehlen? Energielücken, Übergangsschemata und die Erklärung des Absorptionswechsels sind hier keine Abschlussbedingungen.
  - Observable performance (EN): Classify the supplied natural/synthetic examples separately by structural family, origin/isolation route and use. Retain azo, triarylmethane and anthocyanin classes from the two original cases and add polyenes using multiple C=C bonds. Distinguish the stated physical isolation from the stated synthesis without performing a mechanism or experiment. Which quality/use information is missing? Energy gaps, energy-level diagrams and explanation of shifted absorption are not completion conditions here.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`, `hb217-origin-polyene-classification-only`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-condition`: Neue Vertreter und geänderte Löslichkeit erfordern eine echte mehrdimensionale Neueinteilung. / New representatives and changed solubility require genuine multidimensional reassignment.
- `independent-evidence-pieces`: Zwei vollständig bereitgestellte Angebotsfälle. Bewertet werden nachvollziehbare fachliche Leistungen einschließlich verändertem Fall. Zwei unabhängige Belegstücke können innerhalb eines reichen Falls liegen; keine zusätzliche Aufgabenquote. Modellantworten sind Autorenmaterial, keine Lernendenleistung. / Two complete offered cases. Assessment requires explained scientific performance including a changed case. Two independent evidence pieces may occur within one rich case; no extra task quota. Model answers are author material, not learner work.
- `hb217-natural-synthetic-and-polyene-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `case-1`
  - Task demand (DE): Stelle Azo-, Triarylmethan- und Anthocyaninfarbstoffe mit je einem Strukturmerkmal vor und ordne A/B/C zu. Ordne dieselben Karten außerdem getrennt nach Löslichkeit, Herkunft, Färbemethode und Verwendung; markiere fehlende Daten statt sie zu erfinden. Erkläre, weshalb pH-Indikator keine vierte Molekülstrukturklasse ist. Transfer: C wird mit identischer molekularer Struktur synthetisch hergestellt. Welche Zuordnungen ändern sich sicher, welche nicht?
  - Task demand (EN): Introduce azo, triarylmethane and anthocyanin dyes with one structural feature each and classify A/B/C. Also classify the same cards separately by solubility, origin, dyeing method and use; mark missing data rather than inventing them. Explain why pH indicator is not a fourth molecular-structure class. Transfer: C is synthesized with exactly the same molecular structure. Which assignments necessarily change and which do not?
  - Expected performance (DE): A ist Azo wegen –N=N–; B Triarylmethan wegen zentralem C mit drei Arylresten; C Anthocyanin wegen glycosyliertem Flavylium-System. Im jeweils angegebenen Medium werden alle gelöst angewandt; ihre Strukturklassen sind dennoch verschieden. Herkunft: A/B synthetisch, C Pflanzenextrakt. Nur A hat eine angegebene direkte Textilanwendung; für B/C ist keine Textilfärbemethode belegt. Verwendung: A Textilfärbung, B Tinte, C Indikator. Ein Indikator ist eine Funktions-/Verwendungsgruppe, die Strukturklassen überschneiden kann. Synthetisches identisches C ändert die Herkunft, nicht die Anthocyanin-Zuordnung; gleiche Löslichkeitsbedingungen und Funktion können gleich bleiben. Naturherkunft beweist keine Unbedenklichkeit.
  - Expected performance (EN): A is azo because of –N=N–; B is triarylmethane because its central C has three aryl groups; C is anthocyanin because of the glycosylated flavylium system. All are applied dissolved in their specified media, despite different structural classes. Origin: A/B synthetic, C plant extract. Only A has a stated direct textile application; no textile dyeing method is established for B/C. Uses: A textile dyeing, B ink, C indicator. An indicator is a functional/use grouping that can overlap structural classes. Identical synthetic C changes origin, not anthocyanin classification; solubility under identical conditions and function may remain unchanged. Natural origin does not prove harmlessness.
  - Understanding focus (DE): Identische Molekülstruktur bei geändertem Gewinnungsweg entkoppelt Herkunft und Strukturklasse.
  - Understanding focus (EN): Identical molecular structure with changed production route separates origin from structural class.
- `case-2`
  - Task demand (DE): Präsentiere die drei Strukturklassen und ordne P/Q/R anhand der Karten ein. Erstelle getrennte Zuordnungen nach allen fünf Kriterien einschließlich nachvollziehbarer Datenlücken. Vergleiche anschließend P mit P′: Begründe genau, welche Kriterien die Zuordnung ändern. Widerlege anhand der Karten die Aussage, jede Azo-Verbindung müsse ein wasserlöslicher Textilfarbstoff sein. Keine Synthesemechanismen sind gefordert.
  - Task demand (EN): Present the three structural classes and classify P/Q/R using the cards. Classify separately by all five criteria, identifying data gaps. Then compare P with P′ and justify exactly which assignments change. Use the cards to refute the claim that every azo compound must be a water-soluble textile dye. No synthesis mechanisms are required.
  - Expected performance (DE): P Azo, Q Triarylmethan und R Anthocyanin besitzen die jeweils genannten Strukturmerkmale. P wird als Pigmentteilchen, Q/R gelöst angewandt; Herkunft P/Q synthetisch, R pflanzlich; Verwendung Beschichtung/Druck/Indikator. Ohne Angaben sind Textilfärbemethoden nicht bestimmbar. P′ bleibt Azo und synthetisch, ändert aber unter den gegebenen Bedingungen Löslichkeit und Verwendungs-/Methodenzuordnung zu gelöstem Direkt-Textilfarbstoff. Die Strukturklasse allein determiniert weder Löslichkeit noch Einsatz. Die erhöhte Wasserverträglichkeit des sulfonierten Vertreters ist gegeben; ihre quantitative Größe wird nicht erfunden.
  - Expected performance (EN): P is azo, Q triarylmethane and R anthocyanin, with the stated defining structural features. P is applied as pigment particles; Q/R are dissolved. Origin: P/Q synthetic, R plant-derived; uses: coating/printing/indicator. Textile dyeing methods cannot be determined without data. P′ remains azo and synthetic but changes solubility and use/method assignment under the given conditions to a dissolved direct textile dye. Structural class alone determines neither solubility nor use. Improved water compatibility of the sulfonated representative is supplied; its quantitative magnitude is not invented.
  - Understanding focus (DE): Neue Vertreter und geänderte Löslichkeit erfordern eine echte mehrdimensionale Neueinteilung.
  - Understanding focus (EN): New representatives and changed solubility require genuine multidimensional reassignment.
- `hb217-origin-polyene-classification-only`
  - Task demand (DE): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/3. Ordne die gegebenen Natur-/Synthesebeispiele getrennt nach Strukturklasse, Herkunft/Gewinnungsart und Verwendung. Erhalte Azo-, Triarylmethan- und Anthocyaninklassen aus den beiden bisherigen Fällen und ergänze Polyene anhand mehrerer C=C-Bindungen. Trenne die angegebene physikalische Isolierung von einer angegebenen Synthese, ohne einen Synthesemechanismus oder ein Experiment ausführen zu müssen. Welche zusätzlichen Qualitäts-/Verwendungsdaten fehlen? Energielücken, Übergangsschemata und die Erklärung des Absorptionswechsels sind hier keine Abschlussbedingungen.
  - Task demand (EN): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/3. Classify the supplied natural/synthetic examples separately by structural family, origin/isolation route and use. Retain azo, triarylmethane and anthocyanin classes from the two original cases and add polyenes using multiple C=C bonds. Distinguish the stated physical isolation from the stated synthesis without performing a mechanism or experiment. Which quality/use information is missing? Energy gaps, energy-level diagrams and explanation of shifted absorption are not completion conditions here.
  - Expected performance (DE): Die Karten unterscheiden Anthocyaningemisch, Azo-Struktur und beta-Carotin/Polyen. Wasserextraktion/Filtration sind ein gegebener Isolierungsweg, die genannte Azokupplung ein Syntheseweg; beide sind als Herkunftskriterium vom Molekülstrukturkriterium zu trennen. Mehrere C=C erlauben die Polyen-Zuordnung, nicht automatisch Wasserlöslichkeit, eine bestimmte Anwendung, Sicherheit oder Nachhaltigkeit. Die gegebenen Verwendungen bleiben an ihre Bedingungen gebunden; keine Energieerklärung ist hierfür verlangt.
  - Expected performance (EN): The cards distinguish an anthocyanin mixture, azo structure and beta-carotene/polyene. Water extraction/filtration is a supplied isolation route and azo coupling a supplied synthesis route; origin and molecular family are separate criteria. Multiple C=C bonds support polyene classification, not automatic water solubility, a specific use, safety or sustainability. Supplied uses retain their conditions; no energy explanation is demanded for this classification.
  - Understanding focus (DE): Herkunft/Struktur/Verwendung getrennt; Energielückenleistung unter 87d8.
  - Understanding focus (EN): Separate origin/structure/use; energy-gap performance belongs to 87d8.
## Page 9: Tensid-Performance bewerten

- Full learning-goal ID: `d742ecb0-0795-5446-a95d-9503d4618475`
- Goal fingerprint: `sha256:e1793188fb12070e665f7caa922b0a16853a5c142b186663a6fbb79cedaee2d6`
- Page fingerprint: `sha256:36123687cf3b5949d9ba493df58dfa29f5f6df1dd1777ccb640c43a6656f1668`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann einen kontrollierten Vergleich von Tensidlösungen planen und durchführen, dabei die kritische Micellbildungskonzentration aus einer Oberflächenspannungs-Messreihe ermitteln sowie Schaumbildung und Schmutztragevermögen unter definierten Bedingungen quantifizieren und die Ergebnisse und Grenzen des Vergleichs begründen.

### Visualization

/assets/goal-visualizations/chemie/d742ecb0-0795-5446-a95d-9503d4618475/d742ecb0-0795-5446-a95d-9503d4618475.png

- original digest: `sha256:6f52bc4339f9fd3c4c343a797333afcefca10d07e5e799aff76c362f3068751c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Micellenbildung deuten — `6966df95-f125-5ecc-af8e-0442545d9f17` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Tenside – CMC, Schaum und Modellschmutz — `f0ef9592-da31-59de-86a4-d2d3d7025a8b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b022490f57edab913e3916bc7365ba16dfc129f28490de193406ed2d0eb1b03f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `controlled-plan-and-own-execution`
  - Essential understanding (DE): Ein aussagekräftiger Tensidvergleich braucht dokumentierte kontrollierte Bedingungen und tatsächlich durchgeführte Messungen. Auswertung vorgegebener Messdaten allein ersetzt weder Planung noch Durchführung.
  - Essential understanding (EN): An informative surfactant comparison requires documented controlled conditions and measurements actually carried out. Analysing supplied readings alone replaces neither planning nor execution.
  - Observable performance (DE): Geeignete sichere Schulversuche planen und durchführen; Konzentration, Temperatur, Wasserhärte, Schüttelbedingungen und Beobachtungszeit begründet festlegen und eigene Messprotokolle einschließlich Kontrollen führen.
  - Observable performance (EN): Plan and carry out suitable safe school investigations; justify concentration, temperature, water hardness, agitation conditions and observation time, and keep the learner’s own measurement records including controls.
- `cmc-and-foam-quantification`
  - Essential understanding (DE): Die CMC wird in einer geeigneten Oberflächenspannungs-Konzentrationsreihe aus der Änderung des Kurvenverlaufs ermittelt. Das Schaumvolumen ist die Differenz der oberen Schaum- und unteren Flüssigkeitsgrenze, nicht das gesamte abgelesene Volumen.
  - Essential understanding (EN): CMC is determined from the change in slope of a suitable surface-tension versus concentration series. Foam volume is the difference between upper foam and lower liquid boundaries, not the total reading.
  - Observable performance (DE): Eine Konzentrationsreihe messen, passend skalieren und den CMC-Bereich begründet schätzen; Schaumgrenzen nach derselben Zeit ablesen und Volumendifferenzen beziehungsweise Schaumstabilität vergleichen.
  - Observable performance (EN): Measure a concentration series, plot it with a suitable scale and justify an estimated CMC range; read foam boundaries after equal times and compare volume differences or foam stability.
- `dirt-carrying-and-limits`
  - Essential understanding (DE): Schmutztragevermögen ist ein weiterer Messaspekt; viel Schaum bedeutet nicht automatisch hohes Schmutztragevermögen. Trübungs- oder Sedimentdaten werden nur mit geeigneter Kontrolle und gegebenenfalls Kalibrierung quantitativ gedeutet.
  - Essential understanding (EN): Dirt carrying capacity is a separate measurement aspect; abundant foam does not automatically imply high dirt carrying capacity. Turbidity or sediment data are interpreted quantitatively only with appropriate controls and, where needed, calibration.
  - Observable performance (DE): Bei gleicher anfänglicher Schmutzmenge die in Suspension verbleibende Menge mit einer geeigneten Messung bestimmen, die Lösungen vergleichen und Störgrößen sowie Grenzen benennen.
  - Observable performance (EN): Determine the amount remaining suspended from equal initial soil amounts using a suitable measurement, compare solutions and identify confounders and limitations.

**Coverage expectations**

- required expectations: `controlled-plan-and-own-execution`, `cmc-and-foam-quantification`, `dirt-carrying-and-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-controlled-chemical-case`: Frische Tenside oder Wasserhärte; eigene Konzentrationsmessreihe; Schaumgrenzen statt Gesamtvolumen; unabhängiger quantitativer Schmutzvergleich bei unverändertem Ausgangsmaterial. / Fresh surfactants or water hardness; the learner’s own concentration series; foam boundaries rather than total volume; independent quantitative soil comparison with unchanged starting material.

**Application cases**

- `own-controlled-a-b-comparison`
  - Task demand (DE): Plane und führe unter freigegebenen Schulversuchsbedingungen einen Vergleich zweier Tensidlösungen A/B durch. Miss Oberflächenspannungen über eine begründete Verdünnungsreihe mit Blindprobe, Schaumvolumen nach gleichem Schütteln und gleicher Wartezeit sowie in Suspension verbleibenden geeigneten Modellschmutz. Eine geeignete quantitative Methode mit matrixangepasster Kontrolle oder bereitgestellter gültiger Kalibrierung ist vorzugeben. Lege eigene Protokolle und begründete Auswertung vor.
  - Task demand (EN): Plan and carry out a comparison of surfactant solutions A/B under authorised school-investigation conditions. Measure surface tensions over a justified dilution series with a blank, foam volume after identical agitation and waiting time, and suitable model soil remaining suspended. Specify an appropriate quantitative method with a matrix-matched control or supplied valid calibration. Submit the learner’s own records and justified analysis.
  - Expected performance (DE): Planung hält relevante Vergleichsbedingungen fest und Durchführung liefert eigene Messwerte für alle drei Aspekte. CMC liegt am begründet geschätzten Knick/Übergangsbereich; Konzentrationsachse ist eindeutig skaliert. Schaum bei oberer Grenze80mL und Flüssigkeitsgrenze30mL ergibt50mL, nicht80mL. Schmutzmenge wird aus kontrollierter Messung bestimmt; Endbewertung vermischt die Aspekte nicht.
  - Expected performance (EN): The plan fixes relevant comparison conditions and execution yields the learner’s own readings for all three aspects. CMC lies at a justified estimated break/transition region with an unambiguous concentration scale. Foam with upper boundary80mL and liquid boundary30mL is50mL, not80mL. Soil amount is obtained from controlled measurement; the final evaluation does not conflate the aspects.
  - Understanding focus (DE): Tatsächliche Planung/Durchführung und getrennte quantitative Messaspekte.
  - Understanding focus (EN): Actual planning/execution and separate quantitative measurement aspects.
- `fresh-hardness-control-repeat`
  - Task demand (DE): Untersuche durch einen neu geplanten und tatsächlich durchgeführten kontrollierten Vergleich, wie veränderte Wasserhärte die Leistungsdaten einer Tensidlösung beeinflusst. Begründe frische Konzentrationspunkte um den erwarteten CMC-Bereich und die angepassten Kontrollproben. Ein zusätzlich geliefertes fremdes Protokoll zeigt mehr Schaum, aber weniger suspendierten Modellschmutz; bewerte es getrennt von deinen eigenen Ergebnissen.
  - Task demand (EN): Use a newly planned and actually performed controlled comparison to investigate how changed water hardness affects a surfactant solution’s performance. Justify fresh concentration points around the expected CMC region and adapted controls. An additional supplied third-party record shows more foam but less suspended model soil; evaluate it separately from the learner’s own results.
  - Expected performance (DE): Eigene Durchführung, Vergleichsbedingungen und quantitative Auswertung werden wieder belegt. Der fremde Schaum-/Schmutzbefund widerspricht der pauschalen Regel mehrSchaum=mehrWaschleistung, beweist aber ohne gleiche Bedingungen keine generelle Überlegenheit. Nur der tatsächlich untersuchte Bereich und geeignete Modellschmutz werden beansprucht.
  - Expected performance (EN): The learner again demonstrates actual execution, comparison conditions and quantitative analysis. The supplied foam/soil observation contradicts a blanket more-foam-means-better-cleaning rule but does not establish general superiority without matched conditions. Claims cover only the actually investigated range and suitable model soil.
  - Understanding focus (DE): Frischer kontrollierter Experimentaltransfer mit Grenzen.
  - Understanding focus (EN): Fresh controlled experimental transfer with limitations.
## Page 10: Einsatz von Sorbinsäure bewerten

- Full learning-goal ID: `d76b80a2-5156-54f4-b3a1-546beddf0e14`
- Goal fingerprint: `sha256:730fd25605fc7c30db155b352cac430ed4b7b4d4d3f7446c7782da794b7bfefa`
- Page fingerprint: `sha256:bd8806f1396f07eef31c7bd577c8463c35df4417543846169a68ddd628735d77`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Wirkweise von Sorbinsäure als Konservierungsstoff anhand bereitgestellter Reaktions- und Wirkungsdaten erläutern, Dosierungen mithilfe datierter lebensmittelkategoriespezifischer rechtlicher Verwendungsbedingungen begründet beurteilen und die Aussagegrenzen dieser Materialien benennen.

### Visualization

/assets/goal-visualizations/chemie/d76b80a2-5156-54f4-b3a1-546beddf0e14/d76b80a2-5156-54f4-b3a1-546beddf0e14.png

- original digest: `sha256:d149499514da65e2885b6a54e9d2089e7e25963148d8e3f5bad36401e4001142`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Verwendung von Parabenen beurteilen (LK) — `0d59b62e-d3f9-5969-b961-0c5e26316c04` (page 11)

### Prerequisites outside this book

- Konservierungsmethoden vergleichen — `33e845cc-1a7b-50d5-99b3-8079575c4e6a` (outside this book)

### Direct reverse prerequisites outside this book

- Fruchtsaft zwischen Sorbinsäure und Ascorbinsäure bewerten — `00139854-e5a7-5c12-ab50-2268c80bf776` (outside this book)
- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c9bae1bb497cdb6ec9cbb2acd80e265e798ef11a4d86893b2cdae579a4c76f03`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `efficacy-and-dose-conditional`
  - Essential understanding (DE): Sorbinsäure steht mit Sorbat in einem pH-abhängigen Säure-Base-Gleichgewicht. Bereitgestellte Reaktions- und Wirkungsdaten begründen die mögliche Mikroorganismenhemmung unter passenden Bedingungen; der undissoziierte Anteil und die Lebensmittelmatrix sind zu beachten. Dies ist keine allgemeine Haltbarkeits- oder Sicherheitsgarantie.
  - Essential understanding (EN): Sorbic acid and sorbate form a pH-dependent acid-base equilibrium. Supplied reaction and efficacy data explain possible microorganism inhibition under suitable conditions; the undissociated fraction and food matrix matter. This is not a general shelf-life or safety guarantee.
  - Observable performance (DE): Die Wirkweise mit dem bereitgestellten Reaktionsmodell und den Wirkungsdaten erläutern, den pH-/Matrixbezug erklären und die konkrete Dosierung sowie Aussagegrenzen begründen.
  - Observable performance (EN): Explain the mode of action using the supplied reaction model and efficacy data, explain the pH/matrix context, and justify the specific dosage and limits.
- `dated-category-and-combined-limit`
  - Essential understanding (DE): Eine datierte Verwendungsbedingung gilt für die angegebene Lebensmittelkategorie, Zusatzstoffgruppe, Mengenbasis und Einschränkungen. Ein körpergewichtsbezogener ADI ist keine zulässige Lebensmittelkonzentration; ein allgemeines Saftbild belegt keine Zulassung.
  - Essential understanding (EN): A dated condition of use applies to its stated food category, additive group, quantity basis and restrictions. A body-weight-related ADI is not an authorised food concentration; a generic juice picture does not establish authorisation.
  - Observable performance (DE): Die bereitgestellte datierte Originalregel mit Kategorie und Fußnoten anwenden, gegebenenfalls freie-Säure-Äquivalente summieren und eine materiell begrenzte Entscheidung treffen.
  - Observable performance (EN): Apply the supplied dated original rule with its category and footnotes, where needed sum free-acid equivalents, and make a material-bounded decision.

**Coverage expectations**

- required expectations: `efficacy-and-dose-conditional`, `dated-category-and-combined-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-controlled-chemical-case`: Frische Kategorie mit anderer Grenze oder Ausnahme; mehrere zugelassene Sorbatkomponenten; pH-/Wirksamkeitsdaten; klare Trennung von dated teaching data und aktueller rechtlicher Freigabe. / Fresh category with another limit or exception; several authorised sorbate components; pH/efficacy data; clear separation of dated teaching data and current legal clearance.

**Application cases**

- `dated-plant-mousse-material`
  - Task demand (DE): Beurteile anhand eines bereitgestellten Originalauszugs der EU-Verordnung1333/2008, konsolidierte didaktische Materialfassung04.11.2025, ein nicht wärmebehandeltes pflanzliches Mousse (Kategorie16). E200–202:500mg/kg, Fußnoten1+2: allein oder kombiniert, Summe als freie Säure. Probe enthält300mg/kg Sorbinsäure(E200) und300mg/kg Kaliumsorbat(E202). Gegeben: M(Sorbinsäure)=112,13g/mol, M(Kaliumsorbat)=150,22g/mol sowie konkrete pH-/Wirkungsdaten. Erkläre und beurteile die Probe. Zusätzlich gegeben: HSorb ⇌ H⁺ + Sorbat⁻, pKa4,8 und beobachtete stärkere Hemmung bei pH3,8 als bei5,8 unter sonst gleichen Bedingungen. Erläutere mit dem Säure-Base-Modell die Wirkweise im bereitgestellten Fall, ohne einen universellen molekularen Wirkweg zu behaupten.
  - Task demand (EN): Using a supplied original extract of EU Regulation1333/2008, consolidated teaching-material edition04.11.2025, assess a non-heat-treated plant mousse (category16). E200–202:500mg/kg; footnotes1+2: individually or combined, sum as free acid. The sample contains300mg/kg sorbic acid(E200) and300mg/kg potassium sorbate(E202). Supplied molar masses are112.13g/mol and150.22g/mol with specific pH/efficacy data. Explain and assess the sample. Also supplied: HSorb ⇌ H⁺ + sorbate⁻, pKa4.8 and stronger observed inhibition at pH3.8 than5.8 with other conditions held constant. Use the acid-base model to explain the action in this supplied case without claiming a universal molecular pathway.
  - Expected performance (DE): 300+300×112,13/150,22≈523,94mg/kg freie Säure liegt über500mg/kg. Die passende Kategorie und Kombination sind entscheidend, nicht eine getrennte Prüfung jeZutat oder ein ADI. Wirkungsdaten werden dennoch separat mit pH und Matrix gedeutet. Die Entscheidung gilt nur für das datierte Material, nicht als gegenwärtige Rechts- oder Sicherheitsfreigabe. Bei niedrigerem pH liegt ein höherer undissoziierter Säureanteil vor; dies wird mit den gegebenen Wirksamkeitsdaten verknüpft. Das Reaktionsmodell ersetzt keine eigene Beobachtung und belegt nicht jeden Hemmungsmechanismus.
  - Expected performance (EN): 300+300×112.13/150.22≈523.94mg/kg free acid exceeds500mg/kg. The matching category and combination matter, rather than separate checks per ingredient or an ADI. Efficacy data are still interpreted separately with pH and matrix. The decision applies only to the dated material, not as present legal or safety clearance. At lower pH, the undissociated acid fraction is higher; connect this to the supplied efficacy data. The reaction model does not replace the learner’s own observation or establish every inhibition mechanism.
  - Understanding focus (DE): Freie-Säure-Summe, Kategorie und Wirkungsgrenze.
  - Understanding focus (EN): Free-acid sum, category and efficacy limits.
- `fresh-dairy-and-juice-exception`
  - Task demand (DE): Frisches Material aus derselben datierten Fassung gibt für eine konkrete nicht wärmebehandelte milchbasierte Nachspeise300mg/kg für die dort genannte Sorbinsäure/Benzoatgruppe an; ein passender Kontrollfall enthält350mg/kg E200. Ein zusätzlicher Kategorie14.1.2-Auszug erlaubt E200–202 nur für Sød…saft/sødet…saft. Beurteile die Nachspeise und erkläre, warum500mg/kg oder eine allgemeine Orangensaftzulassung daraus nicht folgen.
  - Task demand (EN): Fresh material from the same dated edition gives300mg/kg for the listed sorbic-acid/benzoate group in a specified non-heat-treated dairy dessert; a matching control contains350mg/kg E200. An additional category14.1.2extract permits E200–202 only for Sød…saft/sødet…saft. Assess the dessert and explain why neither500mg/kg nor generic orange-juice authorisation follows.
  - Expected performance (DE): 350>300 für die konkret passende Dessertregel; die pflanzliche-Mousse-Grenze wird nicht übertragen. Die Saftausnahme benennt eine bestimmte Kategorie/Einschränkung und erlaubt keine pauschale Sorbinsäurezugabe zu Orangensaft. Zusätzlich nötige Wirksamkeits- und aktuelle Quellenprüfung bleiben getrennt.
  - Expected performance (EN): 350>300 for the specifically matching dessert rule; the plant-mousse limit is not transferred. The juice exception specifies a category/restriction and does not permit blanket sorbic-acid addition to orange juice. Further efficacy and current-source checks remain separate.
  - Understanding focus (DE): Frische Kategorie und begrenzte Zulässigkeitsfolgerung.
  - Understanding focus (EN): Fresh category and bounded authorisation inference.
## Page 11: Verwendung von Parabenen beurteilen (LK)

- Full learning-goal ID: `0d59b62e-d3f9-5969-b961-0c5e26316c04`
- Goal fingerprint: `sha256:a5d98247414830af6d1889ef5df056963ca99998168a5cb7438f40dc92d1ee83`
- Page fingerprint: `sha256:a515794bde75a87f8153bec1c9562d40ad2a9883b3d3a0d7151ecf7c40f1225d`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Einsatz vorgegebener p-Hydroxybenzoesäureester als Konservierungsstoffe anhand ihrer Molekülstruktur, bereitgestellter Wirkungs- und Löslichkeitsdaten sowie datierter produktbezogener Verwendungsbedingungen beurteilen und die Grenzen des Materials benennen.

### Visualization

/assets/goal-visualizations/chemie/0d59b62e-d3f9-5969-b961-0c5e26316c04/0d59b62e-d3f9-5969-b961-0c5e26316c04.png

- original digest: `sha256:548d06ad5a4eadd1fbed115e86b4482bfdb453d396ed23d9e8f2edcf23a85adb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einsatz von Sorbinsäure bewerten — `d76b80a2-5156-54f4-b3a1-546beddf0e14` (page 10)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Esterbildung und Estereigenschaften erklären — `70b34ae7-4481-590c-9a02-516464750832` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Parabenrezeptur anhand eines datierten Fallblatts bewerten (LK) — `4cb74d76-99f1-5264-b1e3-448cda47b005` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d09a361756b1561f6262e28b9788b2c6be15eaf2f7106bd07930643b5e590e52`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `paraben-structure-efficacy-solubility`
  - Essential understanding (DE): Parabene sind vorgegebene p-Hydroxybenzoesäureester: phenolische OH-Gruppe und Carbonsäureester stehen am aromatischen Ring para zueinander. Der Esterrest beeinflusst Eigenschaften; Wirksamkeits- und Löslichkeitsdaten müssen gemeinsam statt als unbegrenzte Kettenlängenregel beurteilt werden.
  - Essential understanding (EN): The specified parabens are p-hydroxybenzoic-acid esters: phenolic OH and a carboxylic-acid ester occupy para positions on the aromatic ring. The ester substituent affects properties; efficacy and solubility data must be assessed together rather than as an unlimited chain-length rule.
  - Observable performance (DE): Die richtige para-Esterstruktur erkennen und bereitgestellte Wirkungs-/Löslichkeitsdaten für eine begründete Konservierungsstoffwahl verknüpfen.
  - Observable performance (EN): Identify the correct para-ester structure and connect supplied efficacy/solubility data to a justified preservative choice.
- `dated-product-use-limits`
  - Essential understanding (DE): Eine datierte produktbezogene Verwendungsregel einschließlich Kombinationen und Gruppenlimits begrenzt den Einsatz; höhere Modellwirksamkeit hebt diese Bedingungen nicht auf. Eine schematische Produktpackung ist keine Rechts- oder Sicherheitsfreigabe.
  - Essential understanding (EN): A dated product-specific use rule, including combinations and group limits, constrains use; higher model efficacy does not override those conditions. A schematic product package is not legal or safety clearance.
  - Observable performance (DE): Dosierungen und Grenzen für die konkrete Kategorie anwenden, Nutzen und Risiken materialbezogen abwägen und ungeprüfte andere Produkte oder Gegenwartsregeln ausdrücklich offenlassen.
  - Observable performance (EN): Apply dosages and limits to the specific category, weigh material-supported benefits and risks, and explicitly leave unverified other products or present rules open.

**Coverage expectations**

- required expectations: `paraben-structure-efficacy-solubility`, `dated-product-use-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-controlled-chemical-case`: Frischer vorgegebener Ester beziehungsweise Mischung; geänderte Löslichkeit/Wirkungsdaten; konkrete Lebensmittelkategorie mit datierter Mengenbasis und Fußnoten; keine GK-Pflichtbehauptung für diesen HE-LK-Komponentenfall. / Fresh specified ester or mixture; changed solubility/efficacy data; specific food category with dated quantity basis and footnotes; no GK obligation claimed for this HE-LK component.

**Application cases**

- `dated-confectionery-paraben-limits`
  - Task demand (DE): Für geeignete Zuckerwaren (keine kandierten/glasierten Früchte oder Gemüse) gibt ein bereitgestellter EU1333/2008-Auszug, konsolidierte didaktische Fassung04.11.2025, für die relevante E200–219-Gruppe1500mg/kg als freie Säure und für p-Hydroxybenzoate darin maximal300mg/kg an. Eine Probe enthält320mg/kg bereitgestellter PHB-freie-Säure-Äquivalente und400mg/kg anderer zur Gruppe gehörender zulässiger Konservierungsstoffe. Vergleiche vorgegebene Methyl-/Ethylparabenstrukturen mit Wirkungs-/Löslichkeitsdaten und beurteile die Probe.
  - Task demand (EN): For suitable sugar confectionery excluding candied/crystallised/glacé fruit or vegetables, a supplied EU1333/2008extract, consolidated teaching edition04.11.2025, gives1500mg/kg as free acid for the relevant E200–219group and within it at most300mg/kg p-hydroxybenzoates. A sample contains320mg/kg supplied PHB free-acid equivalents and400mg/kg other permitted group preservatives. Compare specified methyl/ethylparaben structures with efficacy/solubility data and assess the sample.
  - Expected performance (DE): Beide Strukturen besitzen para-OH und den richtigen Ester, Unterschiede des Alkylrests werden mit den bereitgestellten Daten begründet. Summe720mg/kg liegt unter1500, PHB-Anteil320aber über300mg/kg: Gruppenmaximum allein genügt nicht. Die datierte Materialentscheidung erlaubt keine gegenwärtige Produktfreigabe; Löslichkeit und konkrete Wirksamkeit bleiben weitere Kriterien.
  - Expected performance (EN): Both structures have para-OH and the correct ester, and alkyl differences are explained using supplied data. The720mg/kg sum is below1500, but320mg/kg PHB exceeds300: the group maximum alone does not suffice. This dated material decision is not present product clearance; solubility and specific efficacy remain additional criteria.
  - Understanding focus (DE): Struktur-/Wirkungsabwägung mit separatem Gruppen- und PHB-Limit.
  - Understanding focus (EN): Structure/efficacy reasoning with separate group and PHB limits.
- `fresh-solubility-and-unverified-product`
  - Task demand (DE): Frische Vergleichsdaten zeigen für einen vorgegebenen längeren Paraben-Ester unter bestimmten Bedingungen stärkere Modellhemmung, aber geringere Wasserlöslichkeit; das geprüfte Produkt hat eine begrenzte gelöste Konzentration. Ein anderes Produkt liegt außerhalb der bereitgestellten datierten Lebensmittelregel. Beurteile die beiden Einsatzvorschläge anhand der Strukturen und Daten.
  - Task demand (EN): Fresh comparison data show stronger model inhibition but lower water solubility for a specified longer paraben ester under stated conditions; the investigated product has a limited dissolved concentration. Another product lies outside the supplied dated food rule. Assess both use proposals from structures and data.
  - Expected performance (DE): Die strukturelle Änderung erklärt eine passende Eigenschaftstendenz, aber die schlechtere Löslichkeit kann die tatsächlich erreichbare Konzentration begrenzen. Höhere Modellwirkung wird nicht automatisch als bessere Verwendung bewertet. Für das andere Produkt wird eine passende datierte Regel beziehungsweise weitere Daten verlangt; eine Lebensmittelgrenze wird nicht auf Kosmetika übertragen.
  - Expected performance (EN): The structural change explains an appropriate property tendency, but lower solubility may limit the actually attainable concentration. Higher model efficacy is not automatically judged a better use. The other product requires an appropriate dated rule or further data; food limits are not transferred to cosmetics.
  - Understanding focus (DE): Frischer Struktur-/Produktfokus mit klarer Materialgrenze.
  - Understanding focus (EN): Fresh structure/product focus with a clear material boundary.
## Page 12: Industrielle Zuckergewinnung prozessbezogen bewerten

- Full learning-goal ID: `d786a03c-2378-5ff8-bac2-0c7b5091e412`
- Goal fingerprint: `sha256:2c572cfe20d2a0ff9850930caaabb014d840ccb56dc19f09a8bde21ada8e914b`
- Page fingerprint: `sha256:fe8c789fd5189dc1247ea93f3d8e7b945b5d6819603ba2be03f8751a9f2dff84`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine bereitgestellte industrielle Rübenzucker-Prozesskette anhand ihrer Stoffänderungen und Trennprinzipien erklären und ihre Auswirkungen aus ökologischer, ökonomischer und sozialer Perspektive kriteriengeleitet bewerten, indem sie Vergleichsgrenzen, Unsicherheiten und veränderte Produktionsbedingungen berücksichtigt.

### Visualization

/assets/goal-visualizations/chemie/d786a03c-2378-5ff8-bac2-0c7b5091e412/d786a03c-2378-5ff8-bac2-0c7b5091e412.png

- original digest: `sha256:ce7f6255748115e1dd4cfcf054243c515878a4b57f2c815c8ccf3f1336c04dca`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Zuckerproduktion mit Umwelt-, Kosten- und Sozialdaten bewerten — `37d2e2a5-736f-541d-a66f-0d467e8e9bc1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f90069e68518cc1dc0881e2e9de1d6581507501afe4c1205c1e3401c4dcde27f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `data`

**Positive understanding expectations**

- `hb-bio-beet-sugar-production-three-criteria`
  - Essential understanding (DE): Extraktion, Fällung/Filtration, Eindampfen und Kristallisation funktional richtig verknüpfen. CO2e, Wasser und Fläche getrennt; B billiger/emissionsärmer, aber wasserintensiver und mit sozialer Unsicherheit; A mehr verifizierte Beschäftigungs-/Schulungsdaten, keine globale Nachhaltigkeitsgarantie. 60 kg CO2e Abstand steht ±30 je Variante gegenüber: Unsicherheit nicht verschweigen. C stärkt A beim lokal gewichteten Wasser, kostet mehr. Die Bewertung muss Stoffwissen und alle drei Perspektiven integrieren; Preis oder Jobzahl allein reichen nicht.
  - Essential understanding (EN): Correctly connect extraction, precipitation/filtration, evaporation and crystallisation. Separate emissions, water and land criteria. B is cheaper/lower-emission but more water-intensive and socially uncertain; A offers more verified employment/training information, not guaranteed global sustainability. Discuss the 60 kg emission difference alongside ±30 per option. C improves A on locally important water use at extra cost. Integrate chemistry and all three perspectives; price or job count alone is insufficient.
  - Observable performance (DE): Beschreibe die Prozesskette mit Stoff- und Trennprinzipien. Beurteile und bewerte A/B für Zucker im Alltag nach je mindestens einem ökologischen, ökonomischen und sozialen Kriterium. Lege eine nachvollziehbare Gewichtung offen, entscheide bedingt und nenne gezielt benötigte Informationen. Prüfe mit C, ob deine Entscheidung stabil bleibt. Unterschiedliche begründete Gewichtungen sind zulässig; fehlende Sozialdaten sind keine bewiesenen Verstöße.
  - Observable performance (EN): Describe the process and its substance/separation principles. Judge and evaluate A/B as everyday sugar suppliers using environmental, economic and social criteria. Make a defensible weighting explicit, give a conditional decision and identify missing information. Reconsider with C. Different justified weightings are acceptable; absent labour documentation does not prove violations.

**Coverage expectations**

- required expectations: `hb-bio-beet-sugar-production-three-criteria`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `existing-whole-material-fresh-variation`: Die bereits vorhandene frische Variation bleibt vollständig verbindlich. Ausreichend unabhängige Belege können in einem reichhaltigen Fall entstehen; dieselbe Antwort zählt nicht zweimal. Keine zusätzliche Aufgabenquote. / The pre-existing fresh variation remains fully binding. Sufficient independent evidence may arise within a rich case; the same answer does not count twice. No additional task quota.

**Application cases**

- `beet-production-baseline-a-b`
  - Task demand (DE): Eigenes vereinfachtes Modell, keine realen Firmendaten: Rüben waschen und schneiden; heißes Wasser löst Saccharose aus Schnitzeln (Diffusion/Extraktion); Kalkzugabe bindet/entfernt Begleitstoffe, anschließende CO2-Zufuhr fällt CaCO3 aus; Filtration entfernt Feststoffe; Wasserverdampfung konzentriert, Kristallisation und Zentrifugieren trennen Zuckerkristalle von Mutterlauge. Nicht jede gelöste Verunreinigung wird durch Filtration entfernt. Funktionseinheit in beiden Varianten: 1 t verpackte Saccharose gleicher Lebensmitteleignung, Anbau bis Werkstor einschließlich Transport. Modell A: 240 kg CO2e/t, 12 m3 Frischwasser/t, 430 EUR/t, 120 ganzjährige Stellen; unabhängiger Modellbericht bestätigt vertraglich bezahlte Schutzschulung und gleiche Entlohnung; Neubau beansprucht 4 ha bereits versiegelte Fläche. B: 180 kg CO2e/t, 20 m3/t, 390 EUR/t, 75 saisonale Stellen; Lohn-/Schulungsnachweise fehlen; Neubau beansprucht 4 ha Acker. Lokale Wasserknappheit ist hoch. Unsicherheiten der CO2e-Werte jeweils ±30 kg/t; keine Daten zu Biodiversität oder Arbeit bei Zulieferern.
Beschreibe die Prozesskette mit Stoff- und Trennprinzipien. Beurteile und bewerte A/B für Zucker im Alltag nach je mindestens einem ökologischen, ökonomischen und sozialen Kriterium. Lege eine nachvollziehbare Gewichtung offen, entscheide bedingt und nenne gezielt benötigte Informationen. Unterschiedliche begründete Gewichtungen sind zulässig; fehlende Sozialdaten sind keine bewiesenen Verstöße.
Ganzes zugeordnetes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/0
  - Task demand (EN): Own simplified model, no real company data: wash/slice beet; hot water dissolves sucrose from slices (diffusion/extraction); lime removes/binds impurities; subsequent CO2 addition precipitates CaCO3; filtration removes solids; evaporation concentrates the juice; crystallisation and centrifugation separate crystals from mother liquor. Filtration does not remove every dissolved impurity. Common functional unit: 1 t packaged sucrose of equal food suitability, cultivation to factory gate including transport. Model A: 240 kg CO2e/t, 12 m3 fresh water/t, EUR430/t, 120 year-round jobs; an independent model report confirms paid protective training and equal pay; 4 ha already sealed land. B: 180 kg CO2e/t, 20 m3/t, EUR390/t, 75 seasonal jobs; pay/training documentation missing; 4 ha farmland. Local water scarcity is high. Emission uncertainties ±30 kg/t; no biodiversity or supplier labour data.
Describe the process and its substance/separation principles. Judge and evaluate A/B as everyday sugar suppliers using environmental, economic and social criteria. Make a defensible weighting explicit, give a conditional decision and identify missing information. Different justified weightings are acceptable; absent labour documentation does not prove violations.
Complete assigned material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/0
  - Expected performance (DE): Extraktion, Fällung/Filtration, Eindampfen und Kristallisation funktional richtig verknüpfen. CO2e, Wasser und Fläche getrennt; B billiger/emissionsärmer, aber wasserintensiver und mit sozialer Unsicherheit; A mehr verifizierte Beschäftigungs-/Schulungsdaten, keine globale Nachhaltigkeitsgarantie. 60 kg CO2e Abstand steht ±30 je Variante gegenüber: Unsicherheit nicht verschweigen. C stärkt A beim lokal gewichteten Wasser, kostet mehr. Die Bewertung muss Stoffwissen und alle drei Perspektiven integrieren; Preis oder Jobzahl allein reichen nicht.
  - Expected performance (EN): Correctly connect extraction, precipitation/filtration, evaporation and crystallisation. Separate emissions, water and land criteria. B is cheaper/lower-emission but more water-intensive and socially uncertain; A offers more verified employment/training information, not guaranteed global sustainability. Discuss the 60 kg emission difference alongside ±30 per option. C improves A on locally important water use at extra cost. Integrate chemistry and all three perspectives; price or job count alone is insufficient.
  - Understanding focus (DE): Zuckergewinnung und begründete Standortentscheidung; ursprüngliche vollständige Stoff-/Operatorpflichten im neuen eigenen Ziel erhalten.
  - Understanding focus (EN): Sugar production and a reasoned site decision; original complete substance/operator duties retained in their own goal.
- `beet-production-fresh-water-loop-c`
  - Task demand (DE): Erst nach der eigenen A/B-Entscheidung: C erhält für A einen geschlossenen Wasserkreislauf: 7 statt 12 m³/t, Mehrkosten 20 EUR/t, Emissionen unverändert; alle übrigen Vergleichsdaten bleiben gleich. Prüfe anhand deiner offengelegten Kriterien, ob und warum deine Entscheidung stabil bleibt. Fehlende Daten nicht erfinden.
curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/0
  - Task demand (EN): Only after the own A/B decision: C adds a closed water loop to A:7 rather than12 m³/t, EUR20/t extra, unchanged emissions; all other comparison data remain. Use your explicit criteria to check whether and why your decision remains stable. Do not invent missing data.
curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/0
  - Expected performance (DE): Extraktion, Fällung/Filtration, Eindampfen und Kristallisation funktional richtig verknüpfen. CO2e, Wasser und Fläche getrennt; B billiger/emissionsärmer, aber wasserintensiver und mit sozialer Unsicherheit; A mehr verifizierte Beschäftigungs-/Schulungsdaten, keine globale Nachhaltigkeitsgarantie. 60 kg CO2e Abstand steht ±30 je Variante gegenüber: Unsicherheit nicht verschweigen. C stärkt A beim lokal gewichteten Wasser, kostet mehr. Die Bewertung muss Stoffwissen und alle drei Perspektiven integrieren; Preis oder Jobzahl allein reichen nicht.
  - Expected performance (EN): Correctly connect extraction, precipitation/filtration, evaporation and crystallisation. Separate emissions, water and land criteria. B is cheaper/lower-emission but more water-intensive and socially uncertain; A offers more verified employment/training information, not guaranteed global sustainability. Discuss the 60 kg emission difference alongside ±30 per option. C improves A on locally important water use at extra cost. Integrate chemistry and all three perspectives; price or job count alone is insufficient.
  - Understanding focus (DE): Zuckergewinnung und begründete Standortentscheidung; ursprüngliche vollständige Stoff-/Operatorpflichten im neuen eigenen Ziel erhalten.
  - Understanding focus (EN): Sugar production and a reasoned site decision; original complete substance/operator duties retained in their own goal.
## Page 13: Beeinflussung von Säure-Base-Reaktionen erklären

- Full learning-goal ID: `9751b6d8-cde3-527b-b37c-babb6cee79d2`
- Goal fingerprint: `sha256:34e588a432bbf2565067f8b1582eff5090979ddaaca0cb2b8fa420b5b9201456`
- Page fingerprint: `sha256:5b53388a7180160ce0e37ad7b2e78005d381a847d0141df400e26287522cc91c`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Beeinflussung ausgewählter Säure-Base-Reaktionen mithilfe der Umkehrbarkeit von Protonenübergängen erklären.

### Visualization

/assets/goal-visualizations/chemie/9751b6d8-cde3-527b-b37c-babb6cee79d2/9751b6d8-cde3-527b-b37c-babb6cee79d2.png

- original digest: `sha256:c7b2901be218ef1c44479e3ed323f3d11ccc999568b5ac1ea874a6d1bdf762e7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Säure-Base-Eignung von Teilchenstrukturen erkennen — `597ac03c-d25f-5c34-a87c-52c059c87295` (outside this book)
- Reversibilität von Protonenübergängen ableiten — `d8bdf486-7295-5393-b6f7-54f6e485c848` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7dbe29473862bd8f7b6d52e183f215f0fb5f51803339b45c6f475266164c542d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Reversible Protonenübertragungen können durch Zugabe oder Entzug beteiligter Teilchen beeinflusst werden. Die Erklärung verbindet Beobachtung, Protonendonator/-akzeptor und Hin-/Rückreaktion; sie braucht hier keine quantitative MWG-Berechnung und behauptet keine beliebige Irreversibilität.
  - Essential understanding (EN): Reversible proton transfers can be influenced by adding or removing participating species. Explanation links observation, proton donor/acceptor and forward/reverse reaction; no numerical equilibrium-law calculation or arbitrary irreversibility claim is needed here.
  - Observable performance (DE): CO2-Entzug begünstigt im ersten Modell den Rückweg zu CO2, sodass H2CO3 nachgebildetes CO2 liefert. Damit wird auch der Rückweg der Protolyse begünstigt: HCO3− nimmt ein Proton von H3O+ auf und bildet H2CO3 sowie Wasser. H3O+ nimmt ab, pH steigt. Wieder erhöhte CO2-Verfügbarkeit kann die andere Richtung begünstigen; die Reaktionsmöglichkeit ist nicht unwiederbringlich zerstört. Aus den Angaben folgt eine qualitative Erklärung, kein genauer End-pH oder ein vollständiges reales Getränkemodell.
  - Observable performance (EN): CO2 removal favors the reverse route of the first model, with H2CO3 supplying replacement CO2. This also favors reverse proton transfer: HCO3− accepts a proton from H3O+ to form H2CO3 and water. H3O+ decreases and pH rises. Increased CO2 availability can favor the other direction again; the reaction capacity is not irretrievably destroyed. The data support a qualitative explanation, not an exact final pH or a complete real beverage model.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): CO2-Entzug aus einem Kohlensäuresystem gegenüber gezielter Protonierung und Deprotonierung von NH3/NH4+. Die Beeinflussung wird auf die ausdrücklich vorgegebenen Protonenreaktionen begrenzt; kein ungerechtfertigter Endpunkt-pH wird errechnet.
  - Essential understanding (EN): Removing CO2 from a carbonic-acid system versus targeted protonation and deprotonation of NH3/NH4+. Influence is bounded to the supplied proton reactions; no unjustified endpoint pH is calculated.
  - Observable performance (DE): Säurefall: NH3 + H3O+ → NH4+ + H2O; NH3 nimmt ein Proton auf. Basenfall: NH4+ + OH− → NH3 + H2O; NH4+ gibt ein Proton ab. Säure- bzw. Basezugabe macht jeweils den entgegengesetzten Protonenweg möglich und verändert den Anteil der beiden Formen. Das Paar NH4+/NH3 ist korrespondierend. Weder Elektronenverlust noch eine Umwandlung des N-Elements ist erforderlich; alle Atome und Gesamtladungen bleiben bilanziert. „Umkehrbar“ bedeutet nicht gleiche Anteile oder gleiche Geschwindigkeit.
  - Observable performance (EN): Acid case: NH3 + H3O+ → NH4+ + H2O; NH3 accepts a proton. Base case: NH4+ + OH− → NH3 + H2O; NH4+ donates a proton. Acid or base addition permits the opposite proton-transfer route and changes relative amounts of the forms. NH4+/NH3 is a conjugate pair. No electron loss or change of nitrogen element is needed; atoms and total charge remain balanced. “Reversible” does not mean equal amounts or identical rates.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: CO2-Entzug aus einem Kohlensäuresystem gegenüber gezielter Protonierung und Deprotonierung von NH3/NH4+. / Removing CO2 from a carbonic-acid system versus targeted protonation and deprotonation of NH3/NH4+.
- `model-boundary`: Die Beeinflussung wird auf die ausdrücklich vorgegebenen Protonenreaktionen begrenzt; kein ungerechtfertigter Endpunkt-pH wird errechnet. / Influence is bounded to the supplied proton reactions; no unjustified endpoint pH is calculated.

**Application cases**

- `chem-next20-9751b6d8-case-1`
  - Task demand (DE): Fiktives Modell bei gleicher Temperatur: CO2 + H2O ⇌ H2CO3; H2CO3 + H2O ⇌ HCO3− + H3O+. Eine frisch geöffnete Modelllösung gibt CO2 ab; nach dem Entgasen ist ihr gemessener pH höher. Andere Säuren sind im Modell ausgeschlossen. Mengen und Gleichgewichtskonstanten fehlen. Erkläre den pH-Anstieg über die gekoppelten reversiblen Vorgänge und die Protonenübertragung. Prüfe die Aussage „Die Säure wurde durch Entgasen für immer chemisch zerstört“.
  - Task demand (EN): Fictional model at constant temperature: CO2 + H2O ⇌ H2CO3; H2CO3 + H2O ⇌ HCO3− + H3O+. A freshly opened model solution releases CO2; measured pH is higher after degassing. Other acids are excluded and quantities and equilibrium constants are not supplied. Explain the pH rise using the coupled reversible processes and proton transfer. Evaluate “Degassing has chemically destroyed the acid forever.”
  - Expected performance (DE): CO2-Entzug begünstigt im ersten Modell den Rückweg zu CO2, sodass H2CO3 nachgebildetes CO2 liefert. Damit wird auch der Rückweg der Protolyse begünstigt: HCO3− nimmt ein Proton von H3O+ auf und bildet H2CO3 sowie Wasser. H3O+ nimmt ab, pH steigt. Wieder erhöhte CO2-Verfügbarkeit kann die andere Richtung begünstigen; die Reaktionsmöglichkeit ist nicht unwiederbringlich zerstört. Aus den Angaben folgt eine qualitative Erklärung, kein genauer End-pH oder ein vollständiges reales Getränkemodell.
  - Expected performance (EN): CO2 removal favors the reverse route of the first model, with H2CO3 supplying replacement CO2. This also favors reverse proton transfer: HCO3− accepts a proton from H3O+ to form H2CO3 and water. H3O+ decreases and pH rises. Increased CO2 availability can favor the other direction again; the reaction capacity is not irretrievably destroyed. The data support a qualitative explanation, not an exact final pH or a complete real beverage model.
  - Understanding focus (DE): CO2-Austausch allein ist physikalisch; der pH-Effekt benötigt zusätzlich die dargestellten chemischen Gleichgewichte.
  - Understanding focus (EN): CO2 exchange alone is physical; its pH effect also requires the represented chemical equilibria.
- `chem-next20-9751b6d8-case-2`
  - Task demand (DE): Frischer wässriger Modellfall: NH3 + H2O ⇌ NH4+ + OH−. Bei einer getrennten Zugabe einer geeigneten kleinen Säuremenge wird NH3 zu NH4+ protoniert; bei geeigneter Basezugabe zu einer NH4+-Lösung entsteht mehr NH3. Die Temperatur bleibt konstant; es ist eine schriftliche Auswertung und keine Mischanweisung. Formuliere beide gezielt beeinflussten Protonenübertragungen, kennzeichne die Rollen und erläutere, weshalb die Beobachtungen die Reversibilität der NH3/NH4+-Umsetzung zeigen.
  - Task demand (EN): Fresh aqueous model: NH3 + H2O ⇌ NH4+ + OH−. In a separate treatment with a suitable small acid amount, NH3 is protonated to NH4+; suitable base addition to an NH4+ solution produces more NH3. Temperature stays constant; this is written evaluation, not a mixing instruction. Write both deliberately influenced proton transfers, identify roles and explain how the observations show reversibility of the NH3/NH4+ conversion.
  - Expected performance (DE): Säurefall: NH3 + H3O+ → NH4+ + H2O; NH3 nimmt ein Proton auf. Basenfall: NH4+ + OH− → NH3 + H2O; NH4+ gibt ein Proton ab. Säure- bzw. Basezugabe macht jeweils den entgegengesetzten Protonenweg möglich und verändert den Anteil der beiden Formen. Das Paar NH4+/NH3 ist korrespondierend. Weder Elektronenverlust noch eine Umwandlung des N-Elements ist erforderlich; alle Atome und Gesamtladungen bleiben bilanziert. „Umkehrbar“ bedeutet nicht gleiche Anteile oder gleiche Geschwindigkeit.
  - Expected performance (EN): Acid case: NH3 + H3O+ → NH4+ + H2O; NH3 accepts a proton. Base case: NH4+ + OH− → NH3 + H2O; NH4+ donates a proton. Acid or base addition permits the opposite proton-transfer route and changes relative amounts of the forms. NH4+/NH3 is a conjugate pair. No electron loss or change of nitrogen element is needed; atoms and total charge remain balanced. “Reversible” does not mean equal amounts or identical rates.
  - Understanding focus (DE): Die Beeinflussung wird auf die ausdrücklich vorgegebenen Protonenreaktionen begrenzt; kein ungerechtfertigter Endpunkt-pH wird errechnet.
  - Understanding focus (EN): Influence is bounded to the supplied proton reactions; no unjustified endpoint pH is calculated.
## Page 14: Aminosäuren stereochemisch darstellen

- Full learning-goal ID: `d8eeed29-d1b7-5a48-94b5-343629f8e867`
- Goal fingerprint: `sha256:59c4ca1cb068998969b7b00efefee6a0f4580885ecb8e542a614b65acb21442e`
- Page fingerprint: `sha256:c487818bdcb648e023040fa2e91425c55dafdccdceca51de8a7929037462c978`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann an geeigneten Aminosäuren Chiralität und Enantiomerie erklären, eindeutig räumlich vorgegebene Strukturmodelle unter Beachtung der Projektionskonvention in Fischer-Projektionsformeln überführen und darin D-/L-Konfigurationen unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/d8eeed29-d1b7-5a48-94b5-343629f8e867/d8eeed29-d1b7-5a48-94b5-343629f8e867.png

- original digest: `sha256:6d767a5d159c2eebef45f2eeccb4169d9cc59c0d8be84286051051c901cb2f38`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Moleküldarstellungen situationsgerecht umwandeln — `92c99237-1c74-54fc-bf08-9191656afaa6` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:64a32065bcb3b7f4959c4c03ff64db1d178bf375d3c189710489159e22dab8d1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `representation`

**Positive understanding expectations**

- `chiral-achiral-enantiomer`
  - Essential understanding (DE): Vier verschiedene Gruppen am tetraedrischen C ermöglichen Chiralität und ein nicht deckungsgleiches Spiegelbild; Glycin besitzt zwei gleiche H.
  - Essential understanding (EN): Four distinct groups at tetrahedral C allow chirality and a nonsuperimposable mirror image; glycine has two identical H groups.
  - Observable performance (DE): Begründet Chiralität/Enantiomerie an Alanin oder Cystein, zeichnet das Spiegelbild und grenzt achirales Glycin ab.
  - Observable performance (EN): Justifies chirality/enantiomerism in alanine or cysteine, draws the mirror and distinguishes achiral glycine.
- `spatial-to-fischer`
  - Essential understanding (DE): Fischerprojektionen codieren räumliche Bindungsrichtungen: horizontal nach vorn, vertikal nach hinten.
  - Essential understanding (EN): Fischer projections encode spatial bond directions: horizontal forwards and vertical backwards.
  - Observable performance (DE): Überführt das eindeutig räumlich gegebene Modell mit allen vier Gruppen und richtiger Tiefenbedeutung in die Fischerprojektion.
  - Observable performance (EN): Converts an unambiguously specified spatial model into a complete Fischer projection with all four groups and correct bond depth.
- `standard-orientation-dl`
  - Essential understanding (DE): D/L wird bei den betrachteten einfachen 2-Aminosäuren in der COOH-oben-/Seitenkette-unten-Orientierung an der Position der Aminogruppe abgelesen.
  - Essential understanding (EN): For the simple 2-amino acids considered, D/L is read from amino-group position with COOH at the top and the side chain at the bottom.
  - Observable performance (DE): Normalisiert eine gedreht gegebene Darstellung ohne Konfigurationswechsel und ordnet D/L sowie das jeweilige Enantiomer begründet zu.
  - Observable performance (EN): Normalizes a rotated input without changing configuration and justifies D/L and its enantiomer.
- `representation-transfer-and-limits`
  - Essential understanding (DE): Erneute Fischerlesart nach 90° und ein einzelner Gruppentausch ändern Konfiguration; 180° erhält sie. Konnektivität allein und D/L allein tragen keine weitergehenden Raumaussagen bzw. Drehvorzeichen.
  - Essential understanding (EN): Renewed Fischer interpretation after 90° and one group exchange change configuration; 180° preserves it. Connectivity alone and D/L alone do not determine additional spatial information or rotation sign respectively.
  - Observable performance (DE): Erklärt Darstellungsfehler selbstständig am Tiefenmodell, überträgt auf einen neuen Seitenkettenrest und erkennt unzureichende Angaben ohne CIP-/R/S- oder Polarimetriebehauptung.
  - Observable performance (EN): Independently explains representation errors using bond depth, transfers to a new side chain and identifies insufficient information without a CIP/R/S or polarimetry claim.

**Coverage expectations**

- required expectations: `chiral-achiral-enantiomer`, `spatial-to-fischer`, `standard-orientation-dl`, `representation-transfer-and-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `alanine-cysteine-serine-glycine`: CH3-, CH2SH- und CH2OH-Seitenkette, dazu achirales Glycin mit zwei H. / CH3, CH2SH and CH2OH side chains plus achiral glycine with two H groups.
- `input-orientation-and-depth`: Standardorientiert oder um180° gedreht vorgegebenes Raummodell; zulässige und unzulässige neue Fischerlesarten. / Standard or180°-rotated supplied spatial models; permitted and invalid renewed Fischer interpretations.

**Application cases**

- `amino-spatial-fischer-alanine-glycine`
  - Task demand (DE): Eigenes synthetisches Raummodell, keine Messung. Neutrale Formeln sind Darstellungshilfen. Alanin HOOC–CH(NH2)–CH3: COOH oben/hinten, CH3 unten/hinten, NH2 links/vorn, H rechts/vorn am tetraedrischen C. Glycin: zentrale Gruppen NH2, COOH, H, H. Fischerkonvention: horizontal vorn, vertikal hinten; bei COOH oben/Seitenkette unten bedeutet NH2 links L, rechts D. D/L legt kein Drehvorzeichen fest; kein CIP/R/S. 1) Überführe das vollständige Raummodell in Fischer und ordne D/L begründet zu. 2) Begründe Chiralität, zeichne das vollständige Spiegelbild und erkläre Nichtdeckungsgleichheit. 3) Prüfe Glycin auf Stereozentrum/DL-Paar. 4) Frischer Transfer: Beurteile 90°-Drehung mit erneuter Fischerlesart gegenüber 180°; begründe, warum bloße Konnektivität ohne Tiefenangaben keine eindeutige Konfiguration festlegt. Ganze Ausführung/Einzelrubrik: two-complete-DE-EN-material-cases.author-draft.json, Fall amino-spatial-fischer-alanine-glycine.
  - Task demand (EN): Own synthetic spatial model, not a measurement. Neutral formulas are representation aids. Alanine HOOC–CH(NH2)–CH3 has COOH top/back, CH3 bottom/back, NH2 left/front, H right/front at tetrahedral C. Glycine: central groups NH2, COOH, H, H. Fischer convention: horizontal front, vertical back; with COOH top/side chain bottom, amino left means L and right D. D/L determines no rotation sign; no CIP/R/S. 1) Convert the complete spatial input to Fischer and justify D/L. 2) Explain chirality, draw the complete mirror and explain nonsuperimposability. 3) Examine glycine for a stereocentre/DL pair. 4) Fresh transfer: assess 90° rotation with renewed Fischer reading against 180°; explain why connectivity without depth does not fix unique configuration. Complete original/individual rubric: two-complete-DE-EN-material-cases.author-draft.json, amino-spatial-fischer-alanine-glycine.
  - Expected performance (DE): A: COOH oben, CH3 unten, NH2 links, H rechts; horizontal vorn und vertikal hinten, daher L. Vier verschiedene Gruppen am tetraedrischen C begründen Chiralität. Das Spiegelbild hat COOH oben, CH3 unten, H links und NH2 rechts: D, gleiche Konstitution und nicht deckungsgleich. Glycin trägt zwei H, ist achiral und hat kein D/L-Enantiomerenpaar. 90° plus erneute Fischerlesart tauscht die Tiefenkategorien und kehrt die Konfiguration um; 180° erhält sie. Zum D/L-Ablesen Standardorientierung wiederherstellen. Konnektivität ohne Raumangaben legt weder ein bestimmtes Enantiomer noch automatisch ein Racemat fest. Rubrik /12: Projektion 3 P (vier Gruppen 1, Tiefe 1, L begründen 1); Enantiomerie 3 P (vier verschiedene Gruppen 1, D-Spiegel 1, Nichtdeckungsgleichheit 1); Glycin 2 P (zwei H/kein Stereozentrum 1, achiral/kein D/L-Paar 1); Transfer 4 P (90° nicht identisch 1, Tiefenbezug 1, 180°/Standardorientierung 1, Unterbestimmtheit/kein unterstelltes Racemat 1).
  - Expected performance (EN): A: COOH top, CH3 bottom, NH2 left, H right; horizontal forwards and vertical backwards, therefore L. Four distinct groups at tetrahedral C justify chirality. Its mirror has COOH top, CH3 bottom, H left and NH2 right: D, identical connectivity and nonsuperimposable. Glycine has two H groups, is achiral and has no D/L enantiomer pair. 90° plus renewed Fischer reading changes depth categories and reverses configuration; 180° preserves it. Restore standard orientation before reading D/L. Connectivity without spatial information specifies neither one enantiomer nor an assumed racemate. Rubric /12: projection 3 points (all groups 1, depth 1, justified L 1); enantiomerism 3 (four distinct groups 1, D mirror 1, nonsuperimposability 1); glycine 2 (two H/no stereocentre 1, achiral/no D/L pair 1); transfer 4 (reject 90° identity 1, depth 1, 180°/standard orientation 1, underdetermination/no assumed racemate 1).
  - Understanding focus (DE): Die Begründung des 90°-Fehlers und die neue unbestimmte Konnektivitätsdarstellung müssen selbstständig erklärt werden. Produktnamen oder ein nachgezeichnetes Bild allein reichen nicht. Zwei unabhängige Nachweisschritte können innerhalb einer integrierten Leistung auftreten. Die zwei Fälle sind keine Pflichtaufgabenquote. Sobald alle Aspekte und eigenständiger Transfer hinreichend gezeigt sind, endet die Prüfung. Kein beobachteter Versuch oder Lernerfolg ist behauptet.
  - Understanding focus (EN): The 90° error and the new underdetermined connectivity representation require independent explanation. Names or a copied drawing alone are insufficient. Two independent demonstration steps may occur within one integrated performance. The two cases are not a mandatory task quota. Stop assessment when all aspects and independent transfer are sufficiently shown. No observed experiment or learner success is asserted.
- `amino-spatial-fischer-cysteine-serine-transfer`
  - Task demand (DE): Eigenes synthetisches Raummodell mit neutralen Darstellungsformeln, keine Messung. Cystein HOOC–CH(NH2)–CH2SH: CH2SH oben/hinten, COOH unten/hinten, H links/vorn, NH2 rechts/vorn. Fischer: horizontal vorn, vertikal hinten. D/L erst bei COOH oben/Seitenkette unten: NH2 links L, rechts D.180° in der Papierebene erhält Konfiguration; ein Gruppentausch kehrt sie um. Glycinvergleich: NH2, COOH, H, H. Frisches Serin C: COOH oben/hinten, CH2OH unten/hinten, H links/vorn, NH2 rechts/vorn. 1) Zeichne gegebenes B und normalisiere durch erlaubte Umformung; bestimme D/L und korrigiere „rechts also D“. 2) Begründe Chiralität, zeichne Spiegelbild, vergleiche Glycin und Seitenkettenwechsel. 3) Beurteile 180°,90° mit erneuter Fischerinterpretation und einmal NH2↔H mit Tiefenbegründung. 4) Zeichne frisches Serin und Spiegel, ordne D/L; beurteile „L heißt linksdrehend; Schwefel verlangt CIP zum DL-Lesen“. Kein R/S/CIP und keine Polarimetrie bestimmen. Ganze Ausführung: two-complete-DE-EN-material-cases.author-draft.json, amino-spatial-fischer-cysteine-serine-transfer.
  - Task demand (EN): Own synthetic spatial model using neutral representation formulas, not measured data. Cysteine HOOC–CH(NH2)–CH2SH: CH2SH top/back, COOH bottom/back, H left/front, NH2 right/front. Fischer horizontal means front, vertical back. Read D/L only with COOH top/side chain bottom: amino left L, right D.180° on paper preserves configuration; one group exchange reverses it. Glycine comparison: NH2, COOH, H, H. Fresh serine C: COOH top/back, CH2OH bottom/back, H left/front, NH2 right/front. 1) Draw supplied B and normalize using a permitted transformation; assign D/L and correct “right therefore D”. 2) Justify chirality, draw mirror, compare glycine and side-chain change. 3) Assess 180°,90° plus renewed Fischer interpretation and one NH2/H exchange using bond depth. 4) Draw fresh serine/mirror and assign D/L; assess “L means left-rotating; sulfur requires CIP to read DL”. Determine no R/S/CIP or polarimetry. Complete original: two-complete-DE-EN-material-cases.author-draft.json, amino-spatial-fischer-cysteine-serine-transfer.
  - Expected performance (DE): B anfangs: CH2SH oben, COOH unten, H links, NH2 rechts. Nach 180°: COOH oben, CH2SH unten, NH2 links, H rechts, daher L-Cystein; die Eingabe war nicht standardorientiert. Vier verschiedene Gruppen begründen Chiralität. Der standardisierte Spiegel hat NH2 rechts und H links: nicht deckungsgleiches D-Cystein. Glycin mit zwei H ist achiral. Die Seitenkette ändert die D/L-Konvention nicht. 180° erhält die Tiefenkategorien; 90° mit erneuter Fischerlesart oder ein einzelner Gruppentausch kehrt die Konfiguration um. Reale Moleküldrehung wandelt Enantiomere nicht ineinander um. Serin C: COOH oben, CH2OH unten, H links, NH2 rechts = D; Spiegel = L. D/L legt kein Drehvorzeichen fest; zum Ablesen standardisierten Cysteins wird kein CIP benötigt. Rubrik /12: B-Normalisierung 3 P (gegebenes Kreuz 1, 180° mit allen Endpositionen 1, L und Fehlerkorrektur 1); Chiralität/Spiegel 3 P (vier Gruppen 1, D-Spiegel 1, Glycin und Seitenkettenregel 1); Umformungen 3 P (180° mit Tiefe 1, 90°-Umkehr 1, Tausch versus Moleküldrehung 1); frischer Transfer 3 P (D-Serin/L-Spiegel 1, D/L versus Drehvorzeichen 1, ohne CIP oder Messbehauptung 1).
  - Expected performance (EN): Initial B: CH2SH top, COOH bottom, H left, NH2 right. After 180°: COOH top, CH2SH bottom, NH2 left, H right, hence L-cysteine; the input was nonstandard. Four distinct groups justify chirality. The standard mirror has NH2 right and H left: nonsuperimposable D-cysteine. Glycine with two H groups is achiral. A new side chain does not change the D/L convention. 180° preserves depth categories; 90° plus renewed Fischer reading or one exchange reverses configuration. Real molecular rotation does not interconvert enantiomers. Serine C: COOH top, CH2OH bottom, H left, NH2 right = D; mirror = L. D/L determines no rotation sign; reading standardized cysteine needs no CIP. Rubric /12: B normalization 3 points (input cross 1, 180° with all final positions 1, L and correction 1); chirality/mirror 3 (four groups 1, D mirror 1, glycine/side-chain rule 1); transformations 3 (180° with depth 1, reversal at 90° 1, exchange versus molecular rotation 1); fresh transfer 3 (D-serine/L mirror 1, D/L versus rotation sign 1, no CIP or measurement claim 1).
  - Understanding focus (DE): Das nicht standardorientierte Cystein und das frische Serin erzwingen eigene Darstellungsentscheidungen; die Position im ersten Bild darf nicht als bloßes Links-/Rechts-Schlagwort übernommen werden. Zwei unabhängige Nachweisschritte können innerhalb einer integrierten Leistung auftreten. Die zwei Fälle sind keine Pflichtaufgabenquote. Sobald alle Aspekte und eigenständiger Transfer hinreichend gezeigt sind, endet die Prüfung. Kein beobachteter Versuch oder Lernerfolg ist behauptet.
  - Understanding focus (EN): Nonstandard cysteine and fresh serine require independent representation choices; input position must not simply be repeated as a left/right label. Two independent demonstration steps may occur within one integrated performance. The two cases are not a mandatory task quota. Stop assessment when all aspects and independent transfer are sufficiently shown. No observed experiment or learner success is asserted.
## Page 15: Katalysatoren beurteilen

- Full learning-goal ID: `d9cce642-4f89-57f8-832a-abeb62586195`
- Goal fingerprint: `sha256:9c8c2cf563cb4db20a5ca128d0f250eb43091f66cdf9c203fedf86ff6fab09e5`
- Page fingerprint: `sha256:5ebe56bb2845105971651ef29440e5fa97046b8ef3bec49f620b258ac8170218`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann erläutern, wie Katalysatoren die Einstellung eines Gleichgewichts beeinflussen und Beispiele für homogene und heterogene Katalyse nennen.

### Visualization

/assets/goal-visualizations/chemie/d9cce642-4f89-57f8-832a-abeb62586195/d9cce642-4f89-57f8-832a-abeb62586195.png

- original digest: `sha256:4b4445b163514281a2acbc1f589d660bf7343156d695f9dc19efc4e2b60031d2`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Katalyseformen vergleichen — `16f0dc69-6da8-5751-a00e-abbc1c882dbc` (page 16)

### Prerequisites outside this book

- Le-Chatelier-Prinzip nutzen — `5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Ammoniaksynthese im Containerlabor — `35b76ced-abb8-558b-8e05-29aa3c587e75` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9a2d7d3506037bd36ef3bb6855cea1b3a325e84c36ca7a85e116a6ae6425ce32`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `whole-duty-1`
  - Essential understanding (DE): Alternativen Weg/Barrieren und beide Richtungen erklären.
  - Essential understanding (EN): Explain alternative pathway/barriers and both directions.
  - Observable performance (DE): Alternativen Weg/Barrieren und beide Richtungen erklären. Zweiter unabhängiger Kontext: Beide Barrierendifferenzen richtig bestimmen.
  - Observable performance (EN): Explain alternative pathway/barriers and both directions. Second independent context: Determine both barrier differences correctly.
- `whole-duty-2`
  - Essential understanding (DE): Zeit bis Gleichgewicht von Endausbeute/K trennen.
  - Essential understanding (EN): Distinguish time to equilibrium and final yield/K.
  - Observable performance (DE): Zeit bis Gleichgewicht von Endausbeute/K trennen. Zweiter unabhängiger Kontext: Unveränderte Zustandsdifferenz und K erklären.
  - Observable performance (EN): Distinguish time to equilibrium and final yield/K. Second independent context: Explain unchanged state difference and K.
- `whole-duty-3`
  - Essential understanding (DE): Homogenes Beispiel anhand Phase einordnen.
  - Essential understanding (EN): Classify homogeneous example by phase.
  - Observable performance (DE): Homogenes Beispiel anhand Phase einordnen. Zweiter unabhängiger Kontext: Einstellzeit mit beiden Reaktionsrichtungen verknüpfen.
  - Observable performance (EN): Classify homogeneous example by phase. Second independent context: Connect equilibration time with both directions.
- `whole-duty-4`
  - Essential understanding (DE): Heterogenes Beispiel anhand Phase einordnen.
  - Essential understanding (EN): Classify heterogeneous example by phase.
  - Observable performance (DE): Heterogenes Beispiel anhand Phase einordnen. Zweiter unabhängiger Kontext: Beide Phasenbeispiele fachlich einordnen.
  - Observable performance (EN): Classify heterogeneous example by phase. Second independent context: Classify both phase examples scientifically.

**Coverage expectations**

- required expectations: `whole-duty-1`, `whole-duty-2`, `whole-duty-3`, `whole-duty-4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `whole-case-material`: Schnelleres Estergleichgewicht / Gleichgewichtsmodell mit Energieprofil / Faster ester equilibrium / Equilibrium model with energy profile
- `independent-transfer`: Frisch: beide Proben sind schon im Gleichgewicht; nur einer wird Katalysator zugesetzt, T unverändert. / Frisch: Beim Katalysatorzusatz wird zugleich erwärmt. Kann ein geänderter Endumsatz allein dem Katalysator zugeschrieben werden? / Fresh: both samples are already at equilibrium; catalyst is added to one, T unchanged. / Fresh: catalyst addition also heats the mixture. Can a changed endpoint be attributed solely to catalyst?

**Application cases**

- `q3-06-a`
  - Task demand (DE): Synthetische homogene Estermischungen bei gleichem T und Start erreichen ohne Katalysator nach60min, mit gelöstem Säurekatalysator nach10min denselben Endumsatz70%. Vergleichsprozess: gasförmige N₂/H₂-Reaktion an festem Eisen. Keine Versuchsanleitung. Erkläre Teilchenmodell, Gleichgewichtseinstellung und unveränderten Endzustand. Ordne beide Beispiele homogener bzw. heterogener Katalyse zu und widerlege „mehr Produkt, weil K steigt“. Separat frischer Transfer: Frisch: beide Proben sind schon im Gleichgewicht; nur einer wird Katalysator zugesetzt, T unverändert.
  - Task demand (EN): Synthetic homogeneous ester mixtures at the same T and start reach the same70% final conversion after60min without catalyst and10min with dissolved acid catalyst. Comparison process: gaseous N₂/H₂ reaction on solid iron. No experiment instructions. Explain particle model, equilibration and unchanged endpoint. Classify both examples as homogeneous or heterogeneous catalysis and refute “more product because K rises”. Separate fresh transfer: Fresh: both samples are already at equilibrium; catalyst is added to one, T unchanged.
  - Expected performance (DE): Ein katalytischer Reaktionsweg besitzt geringere Aktivierungsbarrieren und beschleunigt Hin- und Rückreaktion. Das gleiche thermodynamische Gleichgewicht wird früher erreicht; K und70% Endumsatz bleiben bei T gleich. Gelöster Säurekatalysator und Reaktionsgemisch sind in einer Phase: homogen. Festes Eisen und Gasphase sind verschiedene Phasen: heterogen. In endlicher Zeit kann mehr Produkt vorliegen, ohne höhere Gleichgewichtsausbeute. Transferantwort: Keine Netto-Gleichgewichtsverschiebung; schnellere mikroskopische Hin-/Rückumsätze können dennoch auftreten. Scoring /10: 2P: Alternativen Weg/Barrieren und beide Richtungen erklären.; 2P: Zeit bis Gleichgewicht von Endausbeute/K trennen.; 2P: Homogenes Beispiel anhand Phase einordnen.; 2P: Heterogenes Beispiel anhand Phase einordnen.; 2P: Keine Netto-Gleichgewichtsverschiebung; schnellere mikroskopische Hin-/Rückumsätze können dennoch auftreten.
  - Expected performance (EN): A catalytic pathway has lower activation barriers and accelerates forward and reverse reactions. The same thermodynamic equilibrium is reached sooner; K and70% final conversion stay unchanged at T. Dissolved acid catalyst and reacting mixture share a phase: homogeneous. Solid iron and gas differ in phase: heterogeneous. More product may be present at a finite time without greater equilibrium yield. Transfer response: No net equilibrium shift; faster microscopic forward/reverse turnover may nevertheless occur. Scoring /10: 2P: Explain alternative pathway/barriers and both directions.; 2P: Distinguish time to equilibrium and final yield/K.; 2P: Classify homogeneous example by phase.; 2P: Classify heterogeneous example by phase.; 2P: No net equilibrium shift; faster microscopic forward/reverse turnover may nevertheless occur.
  - Understanding focus (DE): Ganzes aktuelles Ziel einschließlich aller Operatoren; keine Punktvergabe für nicht ausgeführte Experimente. Eine Katalysecharakterisierung im Gleichgewicht: alternative Barrieren, schnellere Einstellung und Phasenzuordnung der Beispiele gehören zur Erklärung; keine K-Änderung behauptet.
  - Understanding focus (EN): Whole current goal including all operators; explain the evidence, perform the specified calculation or judgment and apply the separate fresh transfer. Synthetic authored work is not actual learner performance.
- `q3-06-b`
  - Task demand (DE): A⇌B, Energien A0 und B−20kJ/mol. Unkatalysierter Übergangszustand80, katalysierter40kJ/mol relativ zu A. Beispiele: löslicher Katalysator im Flüssiggemisch und fester Platinkatalysator für Gasreaktion. Dieselbe Temperatur, keine Nebenreaktionen. Vergleiche Aktivierungsbarrieren in beiden Richtungen, Gleichgewichtskonstante und Einstellzeit. Erläutere die Katalyseformen an den Beispielen. Separat frischer Transfer: Frisch: Beim Katalysatorzusatz wird zugleich erwärmt. Kann ein geänderter Endumsatz allein dem Katalysator zugeschrieben werden?
  - Task demand (EN): A⇌B with energies A0 and B−20kJ/mol. Uncatalysed transition state80, catalysed40kJ/mol relative to A. Examples: soluble catalyst in a liquid mixture and solid platinum for a gas reaction. Same temperature, no side reactions. Compare activation barriers in both directions, equilibrium constant and equilibration time. Explain catalysis types using the examples. Separate fresh transfer: Fresh: catalyst addition also heats the mixture. Can a changed endpoint be attributed solely to catalyst?
  - Expected performance (DE): Hinbarriere sinkt80→40, Rückbarriere100→60kJ/mol; die Energiedifferenz der Zustände bleibt−20. Beide Richtungen werden schneller, Einstellung früher, K unverändert. Löslicher Katalysator in derselben Flüssigphase ist homogen; Gas an festem Pt heterogen. Aus den Barrieren allein folgt kein numerischer neuer K-Wert oder universell gleicher Beschleunigungsfaktor. Transferantwort: Nein; Temperatur kann K verändern. Die Variablen müssen getrennt werden, bevor die reine Katalysatorwirkung bewertet wird. Scoring /10: 2P: Beide Barrierendifferenzen richtig bestimmen.; 2P: Unveränderte Zustandsdifferenz und K erklären.; 2P: Einstellzeit mit beiden Reaktionsrichtungen verknüpfen.; 2P: Beide Phasenbeispiele fachlich einordnen.; 2P: Nein; Temperatur kann K verändern. Die Variablen müssen getrennt werden, bevor die reine Katalysatorwirkung bewertet wird.
  - Expected performance (EN): Forward barrier drops80→40 and reverse100→60kJ/mol; state energy difference stays−20. Both directions accelerate, equilibrium is reached sooner and K is unchanged. Soluble catalyst in the same liquid phase is homogeneous; gas on solid Pt heterogeneous. Barriers alone do not give a numerical new K or universally identical acceleration factors. Transfer response: No; temperature can change K. Variables must be separated before evaluating catalyst effect alone. Scoring /10: 2P: Determine both barrier differences correctly.; 2P: Explain unchanged state difference and K.; 2P: Connect equilibration time with both directions.; 2P: Classify both phase examples scientifically.; 2P: No; temperature can change K. Variables must be separated before evaluating catalyst effect alone.
  - Understanding focus (DE): Ganzes aktuelles Ziel einschließlich aller Operatoren; keine Punktvergabe für nicht ausgeführte Experimente. Eine Katalysecharakterisierung im Gleichgewicht: alternative Barrieren, schnellere Einstellung und Phasenzuordnung der Beispiele gehören zur Erklärung; keine K-Änderung behauptet.
  - Understanding focus (EN): Whole current goal including all operators; explain the evidence, perform the specified calculation or judgment and apply the separate fresh transfer. Synthetic authored work is not actual learner performance.
## Page 16: Katalyseformen vergleichen

- Full learning-goal ID: `16f0dc69-6da8-5751-a00e-abbc1c882dbc`
- Goal fingerprint: `sha256:24aaf9cfe407f86c37ad4256e1eb2b5dc3dba49d3b831ff73acf1596f3695f40`
- Page fingerprint: `sha256:4f10deb11cab96f74e0467820ddf90373896e7a40a47460b22641ce20f1ba073`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann homogene und heterogene Katalyse sowie Enzymkatalyse anhand ihrer Reaktionswege und der Absenkung von Aktivierungsbarrieren begründet vergleichen und dabei Phasenlage und Enzymspezifität unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/16f0dc69-6da8-5751-a00e-abbc1c882dbc/16f0dc69-6da8-5751-a00e-abbc1c882dbc.png

- original digest: `sha256:5428f3365f0c29fcb6e37434858c3d840858304f54605eff472637f88b522ed5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Katalysatoren beurteilen — `d9cce642-4f89-57f8-832a-abeb62586195` (page 15)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:83d2e7770b624f4af723ffafc6a19b8406b1015d7a314b9a371f95c3c9d24f5b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Homogene und heterogene Katalyse unterscheiden Phasenlage, nicht ein universelles Ausmaß der Barrierenabsenkung.
  - Essential understanding (EN): Homogeneous and heterogeneous catalysis differ in phase relationships, not by a fixed barrier reduction.
  - Observable performance (DE): eqrk16-13-a: Gleiche Endniveaus und Rückbarrieren von 120/85/75/65 kJ/mol konstruieren. eqrk16-13-b: Rückkühlung und frisches Enzym als Deaktivierungsevidenz nutzen.
  - Observable performance (EN): eqrk16-13-a: Construct equal end levels and reverse barriers of 120/85/75/65 kJ/mol. eqrk16-13-b: Use recooling and fresh enzyme as deactivation evidence.
- `e2`
  - Essential understanding (DE): Enzyme nutzen spezifische Bindung und Übergangszustandsstabilisierung, können in Lösung oder immobilisiert wirken.
  - Essential understanding (EN): Enzymes use binding and transition-state stabilisation and can work in solution or immobilised.
  - Observable performance (DE): eqrk16-13-a: Phasen, Enzymmechanismus und Regeneration vergleichen. eqrk16-13-b: Rührabhängigkeit von chemischer Barrierenänderung trennen.
  - Observable performance (EN): eqrk16-13-a: Compare phases, enzyme mechanism and regeneration. eqrk16-13-b: Separate stirring dependence from chemical barrier changes.
- `e3`
  - Essential understanding (DE): Aktivierung, Transport, Deaktivierung und Gleichgewicht sind bei einem Vergleich getrennt zu beurteilen.
  - Essential understanding (EN): Activation, transport, deactivation and equilibrium require distinct judgments in a comparison.
  - Observable performance (DE): eqrk16-13-a: Grenzen einer Rangfolge aus Ea allein einschließlich Transport erklären. eqrk16-13-b: Arrheniusfit und pH-Alternative kritisch prüfen.
  - Observable performance (EN): eqrk16-13-a: Explain limits of ranking by Ea alone, including transport. eqrk16-13-b: Critically assess the Arrhenius fit and pH alternative.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-13-a-transfer`: Immobilisiere das Enzym auf einem porösen Träger. Erkläre die geänderte Phasenzuordnung und warum eine Transportbegrenzung keine höhere chemische Barriere beweist. / Immobilise the enzyme on a porous support. Explain the changed phase relationship and why transport limitation does not prove a higher chemical barrier.
- `eqrk16-13-b-transfer`: Ein fein verteilter Feststoff wird rührunabhängig. Begründe die geringere mögliche Transportbegrenzung bei weiterhin heterogener Katalyse. / A finely divided solid becomes stirring-independent. Explain reduced possible transport limitation while catalysis remains heterogeneous.

**Application cases**

- `eqrk16-13-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-13-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Zeichne vergleichbare Profile und berechne im Einmaximum-Modell die Rückbarrieren. Vergleiche Phasenlage, Enzymspezifität und Transportgrenzen. Ist das Enzym zwingend am schnellsten oder nachhaltigsten?
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-13-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Draw comparable profiles and calculate reverse barriers in the single-maximum model. Compare phases, enzyme specificity and transport limits. Must the enzyme be fastest or most sustainable?
  - Expected performance (DE): Edukte bei 0 und Produkte bei −30 kJ/mol mit Maxima bei 90/55/45/35 ergeben Rückbarrieren von 120/85/75/65 kJ/mol. Endzustandsdifferenz und K bleiben gleich. Homogen bedeutet gleiche Phase der aktiven Spezies; heterogen bedeutet Grenzflächenplätze mit möglicher Transportbegrenzung. Enzymkatalyse ist keine dritte ausschließliche Phasenkategorie: hier in Lösung, immobilisiert gegebenenfalls heterogen. Spezifische Bindung unterstützt einen passenden Übergangszustand; das Enzym wird regeneriert. Denaturierung verändert seine Struktur. Ohne Vorfaktoren, Zentrenzahl, Substratzugang und Lebensdauer folgt aus den Barrieren allein keine allgemeine Raten- oder Nachhaltigkeitsrangfolge.
  - Expected performance (EN): With reactants at 0 and products at −30 kJ/mol, maxima at 90/55/45/35 give reverse barriers of 120/85/75/65 kJ/mol. End-state differences and K are unchanged. Homogeneous catalysis uses active species in one phase; heterogeneous catalysis uses interfaces and may be transport-limited. Enzyme catalysis is not a third mutually exclusive phase category: here it is in solution, but immobilisation may make it heterogeneous. Specific binding supports a suitable transition state; the enzyme is regenerated and denaturation changes its structure. Missing prefactors, site counts, access and lifetime prevent a universal rate or sustainability ranking.
  - Understanding focus (DE): Immobilisiere das Enzym auf einem porösen Träger. Erkläre die geänderte Phasenzuordnung und warum eine Transportbegrenzung keine höhere chemische Barriere beweist.
  - Understanding focus (EN): Immobilise the enzyme on a porous support. Explain the changed phase relationship and why transport limitation does not prove a higher chemical barrier.
- `eqrk16-13-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-13-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Welche Daten stützen Deaktivierung beziehungsweise Transportbegrenzung? Beurteile einen Arrheniusfit über alle Enzympunkte. Plane eine Kontrolle für einen alternativen pH-Effekt.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-13-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Which data support deactivation or transport limitation? Assess an Arrhenius fit across all enzyme points. Design a control for an alternative pH effect.
  - Expected performance (DE): Der bleibende Verlust nach Rückkühlung unter gleichen Testbedingungen stützt irreversible Deaktivierung beziehungsweise Denaturierung. Frisches Enzym kontrolliert die Messung. Ein einziger Arrheniusfit bei wechselnder aktiver Enzymmenge isoliert keine chemische Barriere. Der Rühreffekt stützt einen Transportanteil, beweist aber keinen eindeutigen Porenmechanismus. pH bei der jeweiligen Temperatur messen, gepufferte Kontrollen und frische Enzymzugabe prüfen Alternativen. Vergleiche müssen aktive Menge und Zustand berücksichtigen; das kausale Detail bleibt offen.
  - Expected performance (EN): Persistent loss after cooling under the same test conditions supports irreversible deactivation or denaturation; fresh enzyme controls the measurement. A single Arrhenius fit across changing active-enzyme amounts does not isolate a chemical barrier. Stirring dependence supports transport involvement but proves no unique pore mechanism. Measure pH at each temperature and use buffer controls and fresh enzyme addition to test alternatives. Comparisons must account for active amount and state; causal details remain open.
  - Understanding focus (DE): Ein fein verteilter Feststoff wird rührunabhängig. Begründe die geringere mögliche Transportbegrenzung bei weiterhin heterogener Katalyse.
  - Understanding focus (EN): A finely divided solid becomes stirring-independent. Explain reduced possible transport limitation while catalysis remains heterogeneous.
## Page 17: Ascorbinsäure nachweisen

- Full learning-goal ID: `db66635f-f1d1-5f70-bcc0-fed1ae424e52`
- Goal fingerprint: `sha256:8a3d98faf2d6ccafe1575200b87a4ecd222f89bbe7f045d2a27299f1599e5899`
- Page fingerprint: `sha256:3616a7b1d03a5f801c67701046d795937212b398164bccbb3a09653efd5c9b4d`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann einen qualitativen Nachweis von Ascorbinsäure durchführen und die beobachtete Reduktion des Nachweisreagenzes mit der antioxidativen Wirkung der Ascorbinsäure erklären.

### Visualization

/assets/goal-visualizations/chemie/db66635f-f1d1-5f70-bcc0-fed1ae424e52/db66635f-f1d1-5f70-bcc0-fed1ae424e52.png

- original digest: `sha256:066b8c3e3c79f0b1d81abb317c1d04b25ed411bdadfc3c4e779d17e41005f561`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Redoxbasierte Konservierung — `10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5` (page 18)
- Ascorbinsäure quantitativ bestimmen (LK) — `3d6699ae-ebbd-5a55-8798-b809a9d74f0a` (page 19)

### Prerequisites outside this book

- Konservierungsmethoden vergleichen — `33e845cc-1a7b-50d5-99b3-8079575c4e6a` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Ascorbinsäure in zwei kontrollierten Nachweisen praktisch untersuchen — `e195b2b3-339c-563c-8b01-ce6d313c41af` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:77fef83826d941d7b6bd0c553f961ead00294d68b46c2b021de8b5b979c02de2`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `perform-qualitative-controlled-test`
  - Essential understanding (DE): Ein qualitativer Nachweis verlangt geeignete Durchführung, Blind-/Vergleichskontrollen und Beobachtung. Die Farbe des DCPIP-Reagenzes hängt auch vom pH ab; ein positiver Reduktionsbefund ist nicht automatisch substanzspezifisch.
  - Essential understanding (EN): A qualitative test requires appropriate execution, blanks/comparators and observation. DCPIP reagent color also depends on pH; a positive reduction finding is not automatically substance-specific.
  - Observable performance (DE): Eine freigegebene betreute Nachweisvorschrift mit Kontrollen tatsächlich durchführen, eigene Beobachtungen dokumentieren und den erlaubten qualitativen Schluss ziehen.
  - Observable performance (EN): Actually perform an approved supervised detection protocol with controls, document observations and draw the permitted qualitative conclusion.
- `redox-antioxidant-model`
  - Essential understanding (DE): Ascorbinsäure kann Elektronen abgeben, wird dabei oxidiert und reduziert das Nachweisreagenz. Das erklärt eine antioxidative Wirkung in diesem chemischen Modell, nicht jeden biologischen oder gesundheitlichen Effekt.
  - Essential understanding (EN): Ascorbic acid can donate electrons, becoming oxidized while reducing the detection reagent. This explains antioxidant action in this chemical model rather than every biological or health effect.
  - Observable performance (DE): Elektronendonator/-akzeptor im konkreten Versuch bestimmen, Reduktion des Reagenzes mit Oxidation der Ascorbinsäure verbinden und Störungen bzw. Nachweisgrenzen erklären.
  - Observable performance (EN): Identify electron donor/acceptor in the experiment, connect reagent reduction to ascorbic-acid oxidation and explain interference or detection limits.

**Coverage expectations**

- required expectations: `perform-qualitative-controlled-test`, `redox-antioxidant-model`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-chemical-case`: Frisches freigegebenes Reagenz-/Probenmodell mit eigenen betreuten Handgriffen, pH-kontrollierten Vergleichen und möglichen anderen Reduktionsmitteln. / Use a fresh approved reagent/sample model with actual supervised actions, pH-controlled comparisons and possible other reducing agents.

**Application cases**

- `controlled-dcpip-detection`
  - Task demand (DE): Führe unter Aufsicht die freigegebene qualitative DCPIP-Vorschrift mit Reagenzblindprobe, bekannter Ascorbinsäure und vorgegebener unbekannter Probe durch. Alle Vergleiche sind pH-kontrolliert; das oxidierte Reagenz ist im vorgegebenen neutralen Modell blau. Dokumentiere Durchführung und Farbverlauf und erkläre den chemischen Schluss.
  - Task demand (EN): Under supervision carry out the approved qualitative DCPIP protocol with a reagent blank, known ascorbic acid and supplied unknown. Comparisons control pH; oxidized reagent is blue in the given neutral model. Record actions and color changes and explain the chemical inference.
  - Expected performance (DE): Zukünftiger Leistungsbeleg enthält eigene sachgerechte Durchführung/Beobachtung. Entfärbung gegenüber Kontrollen zeigt Reduktion; Ascorbinsäure gibt Elektronen ab und wird oxidiert. Andere Reduktionsmittel oder ungleicher pH können die Zuordnung stören; ohne zusätzliche Selektivitätsdaten ist die unbekannte Probe nicht eindeutig identifiziert, und ohne Kalibrierung ist keine Konzentration bestimmt.
  - Expected performance (EN): Future evidence includes actual appropriate execution/observation. Decolorization against controls shows reduction; ascorbic acid donates electrons and is oxidized. Other reducers or unequal pH can interfere; absent selectivity data the unknown is not uniquely identified, and without calibration no concentration is established.
  - Understanding focus (DE): Praktischer qualitativer Nachweis mit Redoxdeutung.
  - Understanding focus (EN): Practical qualitative detection with redox interpretation.
- `fresh-iodine-comparison`
  - Task demand (DE): Eine frische freigegebene betreute Aufgabe verwendet ein vorgegebenes Iod/Stärke-Reagenzmodell mit passenden Blind-/Ascorbinsäurekontrollen und einer möglichen anderen reduzierenden Substanz. Führe die zulässigen Prüfschritte aus, dokumentiere den Farbverlauf und verbinde I₂/2I⁻ mit C₆H₈O₆/C₆H₆O₆ in einer ladungsrichtigen Redoxbilanz.
  - Task demand (EN): A fresh approved supervised task uses a supplied iodine/starch model with blanks/ascorbic-acid controls and a possible other reducing substance. Perform permitted steps, record color changes and connect I₂/2I⁻ with C₆H₈O₆/C₆H₆O₆ in a charge-balanced redox equation.
  - Expected performance (DE): I₂ +2e⁻ →2I⁻ und C₆H₈O₆ →C₆H₆O₆ +2H⁺ +2e⁻ ergeben C₆H₈O₆ +I₂ →C₆H₆O₆ +2H⁺ +2I⁻. Verlust der Iod/Stärke-Färbung passt zur Reagenzreduktion; die andere reduzierende Substanz begrenzt Selektivität. Eigene Durchführung bleibt erforderlich, die Daten ersetzen sie nicht; keine allgemeine Gesundheits- oder Unbedenklichkeitsbehauptung.
  - Expected performance (EN): I₂ +2e⁻ →2I⁻ and C₆H₈O₆ →C₆H₆O₆ +2H⁺ +2e⁻ yield C₆H₈O₆ +I₂ →C₆H₆O₆ +2H⁺ +2I⁻. Loss of iodine/starch color fits reagent reduction; another reducing substance limits selectivity. Actual execution remains necessary and is not replaced by data; no general health or harmlessness claim.
  - Understanding focus (DE): Frischer Reagenz-/Interferenztransfer.
  - Understanding focus (EN): Fresh reagent and interference transfer.
## Page 18: Redoxbasierte Konservierung

- Full learning-goal ID: `10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5`
- Goal fingerprint: `sha256:c6921c797655a676319e47fb5354c48b76a8ff5d15a3472067fbfedec341277c`
- Page fingerprint: `sha256:6e5dbe6abbe86df292b84791625dbdd813a5b2cca8cf68f93142e7b5d179018c`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann redoxaktive Konservierungsstrategien am Beispiel von Ascorbinsäure anhand bereitgestellter Reaktions- und Vergleichsdaten bewerten und dabei antioxidative Wirkung von antimikrobieller Konservierung unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5/10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5.png

- original digest: `sha256:d3b2e952ab58738a564eb336031fa13d26cd98d8b093182eff0dd5e99b7b8b4b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Ascorbinsäure nachweisen — `db66635f-f1d1-5f70-bcc0-fed1ae424e52` (page 17)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:04b0f0fd2dee6cdeb6b07f2ae8d9d04fbdbb58d750a44f3fabfc3ec2c9d09b6e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `redox-antioxidant-role`
  - Essential understanding (DE): Ascorbinsäure gibt in einer passenden Redoxreaktion Elektronen ab und wird oxidiert; das Oxidationsmittel wird reduziert. Eine antioxidative Wirkung kann Oxidationsprozesse beeinflussen, ist aber nicht gleichbedeutend mit antimikrobieller Konservierung.
  - Essential understanding (EN): In an appropriate redox reaction ascorbic acid donates electrons and is oxidised, while the oxidising agent is reduced. Antioxidant action can affect oxidation processes but is not identical to antimicrobial preservation.
  - Observable performance (DE): An bereitgestellten Reaktions- und Vergleichsdaten die Rollen von Reduktionsmittel und Oxidationsmittel begründen und oxidative Veränderung von mikrobiellen Befunden trennen.
  - Observable performance (EN): Use supplied reaction and comparison data to justify reducing/oxidising-agent roles and distinguish oxidative change from microbial observations.
- `material-bounded-preservation-decision`
  - Essential understanding (DE): Eine Bewertung braucht die konkrete Matrix, Bedingungen und getrennte Kriterien wie Oxidationsmarker, mikrobielle Belastung und Produktqualität. Weniger Bräunung oder ein Elektronenpfeil garantieren weder Sterilität noch eine allgemeine Haltbarkeit.
  - Essential understanding (EN): Evaluation requires the specific matrix, conditions and separate criteria such as oxidation markers, microbial load and product quality. Reduced browning or an electron arrow guarantees neither sterility nor general shelf life.
  - Observable performance (DE): Eine redoxaktive Strategie mit passenden Kriterien beurteilen, Gegenbefunde berücksichtigen und die Aussage ausdrücklich auf die vorgegebenen Daten begrenzen.
  - Observable performance (EN): Assess a redox-active strategy using suitable criteria, account for contrary observations and explicitly limit the conclusion to the supplied data.

**Coverage expectations**

- required expectations: `redox-antioxidant-role`, `material-bounded-preservation-decision`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-controlled-chemical-case`: Andere Oxidations- und mikrobielle Messgrößen; frische Lebensmittelmatrix und Vergleichsbedingungen; getrennte Reaktions-/Wirksamkeitsdaten; Nutzen und Grenze statt einseitigem Sicherheitsurteil. / Different oxidation and microbial measures; fresh food matrix and comparison conditions; separate reaction/efficacy data; benefits and limits rather than one-sided safety verdict.

**Application cases**

- `ascorbic-oxidation-versus-microbes`
  - Task demand (DE): Eine ausdrücklich didaktische Tabelle vergleicht gleich behandelte geeignete Lebensmittelproben: Ohne Ascorbinsäure ist ein Oxidationsmarker100relativeEinheiten, mit Ascorbinsäure40; mikrobielle Keimzahlen bleiben in beiden Fällen bei1000progegebenemVolumen. Ein passendes Reaktionsmaterial gibt Ascorbinsäure→Dehydroascorbinsäure+2H⁺+2e⁻ an. Bewerte die Konservierungsstrategie anhand beider Messaspekte.
  - Task demand (EN): An explicitly didactic table compares equally treated suitable food samples: without ascorbic acid an oxidation marker is100relativeunits and with it40; microbial counts remain1000pergivenvolume in both. Matching reaction material gives ascorbic acid→dehydroascorbic acid+2H⁺+2e⁻. Evaluate the preservation strategy using both measurements.
  - Expected performance (DE): Ascorbinsäure ist Elektronendonator/Reduktionsmittel und wird oxidiert; passende Oxidantreduktion wird begründet. Der niedrigere Oxidationsmarker trägt eine antioxidative Verbesserung unter den angegebenen Bedingungen. Unveränderte Keimzahl trägt keine antimikrobielle Verbesserung und keine Sterilitäts-/Haltbarkeitsgarantie. Die Zahlen sind bereitgestellte Modellwerte, keine durch KI beobachteten Versuche.
  - Expected performance (EN): Ascorbic acid is an electron donor/reducing agent and is oxidised; explain the corresponding oxidant reduction. The lower oxidation marker supports antioxidant improvement under the given conditions. Unchanged microbial counts support no antimicrobial improvement or sterility/shelf-life guarantee. The numbers are supplied model values, not experiments observed by AI.
  - Understanding focus (DE): Getrennte Redox- und mikrobielle Evidenz.
  - Understanding focus (EN): Separate redox and microbial evidence.
- `fresh-combined-strategy-and-counterexample`
  - Task demand (DE): Frisches Material vergleicht Ascorbinsäure, eine antimikrobielle Maßnahme und deren Kombination in einer anderen geeigneten Lebensmittelmatrix. Die Daten zeigen getrennte Effekte auf Oxidationsmarker, Keimzahl und Geschmack bei gleicher Beobachtungszeit. Bewerte Nutzen und Grenzen jeder Strategie; ein Zusatzdatensatz bei anderen Lagerbedingungen zeigt keinen verbesserten Oxidationsmarker trotz Ascorbinsäure.
  - Task demand (EN): Fresh material compares ascorbic acid, an antimicrobial intervention and their combination in another suitable food matrix. Data show separate effects on oxidation markers, microbial counts and taste after equal observation times. Evaluate benefits and limitations of each strategy; an extra dataset under different storage conditions shows no improved oxidation marker despite ascorbic acid.
  - Expected performance (DE): Die Bewertung ordnet jede Wirkung den tatsächlich passenden Daten und Kriterien zu. Eine Kombination kann unterschiedliche Aspekte verbessern, wird aber nicht pauschal als sicher oder dauerhaft wirksam bezeichnet. Der geänderte Lagerfall begrenzt die Aussage; das vorgegebene positive Redoxmodell darf gegenteilige Wirksamkeitsdaten nicht ersetzen.
  - Expected performance (EN): The evaluation assigns each effect to the actually relevant data and criteria. A combination may improve different aspects but is not labelled universally safe or permanently effective. The changed storage case limits the conclusion; a supplied favourable redox model cannot replace contrary efficacy data.
  - Understanding focus (DE): Frischer kriteriengebundener Bewertungsfall.
  - Understanding focus (EN): Fresh criterion-based evaluation.
## Page 19: Ascorbinsäure quantitativ bestimmen (LK)

- Full learning-goal ID: `3d6699ae-ebbd-5a55-8798-b809a9d74f0a`
- Goal fingerprint: `sha256:d9ea2c8bad68545ab7624908deb24c417cdbd0d8b442e24e9cf53f47ecee59c0`
- Page fingerprint: `sha256:9adf2bd5245d9bf53659f1f550512c521d40b320f1c4e1bb2dc44e1d8d2bdfbe`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine geeignete quantitative Bestimmung von Ascorbinsäure anhand ihrer Molekülstruktur auswählen, mit Kontrollproben planen und durchführen und den Gehalt unter Berücksichtigung von Kalibrierung oder Reaktionsstöchiometrie, Verdünnung und Verfahrensgrenzen bestimmen.

### Visualization

/assets/goal-visualizations/chemie/3d6699ae-ebbd-5a55-8798-b809a9d74f0a/3d6699ae-ebbd-5a55-8798-b809a9d74f0a.png

- original digest: `sha256:c5d3e29fee9161b1d8a35e7775749851cbaa468856597985162add875e84c0a7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Ascorbinsäure nachweisen — `db66635f-f1d1-5f70-bcc0-fed1ae424e52` (page 17)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Zwei Analyten in einer Modellprobe quantitativ bestimmen (LK) — `171b47e2-2c53-50f2-a145-a26b896fd73f` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:eea93de0efdbe796401ff4918bc44832f754b0fcbd3b1839c6f14bb65a3c6224`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `ascorbic-structure-and-suitable-method`
  - Essential understanding (DE): Die reduzierende Molekülstruktur der Ascorbinsäure kann eine geeignete redoxstöchiometrische Bestimmung begründen. Bei einer geeigneten Iodbestimmung reagieren Ascorbinsäure und I₂ im Stoffmengenverhältnis1:1. Das macht einen Iodverbrauch in einer unbekannten Matrix nicht automatisch ascorbinspezifisch.
  - Essential understanding (EN): The reducing molecular structure of ascorbic acid can justify an appropriate redox-stoichiometric assay. In a suitable iodine assay, ascorbic acid and I₂ react in a1:1 molar ratio. This does not automatically make iodine consumption in an unknown matrix specific to ascorbic acid.
  - Observable performance (DE): Aus der bereitgestellten Molekülstruktur und den Matrixbedingungen eine geeignete quantitative Ascorbinbestimmung auswählen und die relevante Kalibrierung oder Reaktionsstöchiometrie begründen.
  - Observable performance (EN): Select an appropriate quantitative ascorbic assay from the supplied molecular structure and matrix conditions, and justify the relevant calibration or reaction stoichiometry.
- `actual-controlled-ascorbic-planning-and-execution`
  - Essential understanding (DE): Das Ziel verlangt eigene Planung UND tatsächliche Durchführung mit passenden Blind-/Referenz- beziehungsweise Matrixkontrollen, bekannter Probenvorbereitung und Rohwerten. Eine Rechnung an bereitgestellten Beispielwerten oder ein simulierter Versuch belegt keine praktische Durchführung.
  - Essential understanding (EN): The goal requires the learner’s own planning AND actual execution with appropriate blank/reference or matrix controls, known sample preparation and raw measurements. Calculation using supplied example data or a simulated experiment does not demonstrate practical execution.
  - Observable performance (DE): Einen geeigneten autorisierten Schulversuch planen und tatsächlich durchführen; eigene Vorbereitung, Kontrollen und Messwerte nachvollziehbar protokollieren.
  - Observable performance (EN): Plan and actually perform an appropriate authorised school experiment; record the learner’s own preparation, controls and readings traceably.
- `ascorbic-content-dilution-and-interference`
  - Essential understanding (DE): Ein tragfähiger Gehalt braucht korrekte Blindwertkorrektur, Stöchiometrie oder gültige Kalibrierung, Einheiten und Verdünnung. Oxidationsverluste und weitere reduzierende Matrixbestandteile können die Bestimmung verfälschen; zusätzliche Messungen oder eine geeignetere Methode können nötig sein.
  - Essential understanding (EN): A supported content requires correct blank correction, stoichiometry or valid calibration, units and dilution. Oxidative losses and other reducing matrix components can distort the assay; additional measurements or a more appropriate method may be needed.
  - Observable performance (DE): Den Ascorbingehalt mit vollständigem Probenbezug bestimmen und bei einer frischen veränderten Matrix die Kontrolle tatsächlich prüfen, das Verfahren begründet anpassen und Grenzen des Ergebnisses benennen.
  - Observable performance (EN): Determine ascorbic content with a complete sample basis, and for a fresh changed matrix actually examine controls, justify method adaptation and state the limits of the result.

**Coverage expectations**

- required expectations: `ascorbic-structure-and-suitable-method`, `actual-controlled-ascorbic-planning-and-execution`, `ascorbic-content-dilution-and-interference`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-analyte-specific-controlled-assay`: Frische geeignete Ascorbinprobe, veränderte Verdünnung/Blindwert, Referenzkontrolle, weitere Reduktionsmittel, tatsächliche eigene Planung/Durchführung. / Fresh suitable ascorbic sample, changed dilution/blank, reference control, other reducing agents, the learner’s actual planning/execution.

**Application cases**

- `fresh-ascorbic-school-assay-own-records`
  - Task demand (DE): Plane und führe eine geeignete quantitative Ascorbinsäurebestimmung an einer frischen geeigneten Schulprobe tatsächlich durch. Nutze die bereitgestellte Ascorbinstruktur zur Methodenwahl; dokumentiere eigene Probenvorbereitung, passenden Blindwert, Referenzkontrolle und Rohwerte. Zusätzliche Rechenkontrolle, nicht Durchführungsevidenz: I₂0,0045mol/L; Verbrauch10,60mL minus Blindwert0,60mL für20,00mL einer fünffach verdünnten Probe; M(Ascorbinsäure)=176,12g/mol; Stoffmengenverhältnis1:1.
  - Task demand (EN): Plan and actually perform an appropriate quantitative ascorbic-acid assay on a fresh suitable school sample. Use the supplied ascorbic structure to select the method; document the learner’s own preparation, appropriate blank, reference control and raw readings. Additional calculation check, not execution evidence: I₂0.0045mol/L; consumption10.60mL minus blank0.60mL for20.00mL of a fivefold-diluted sample; M(ascorbic acid)=176.12g/mol;1:1 molar ratio.
  - Expected performance (DE): Eigene Planung und tatsächliche Durchführung sind belegt und von den Zusatzdaten getrennt. Kontrollrechnung: korrigierter Verbrauch10,00mL, n=0,000045mol, m=7,9254mg in20,00mL Messlösung;396,27mg/L Messlösung und1981,35mg/L Original. Kontrollen begründen die Gültigkeit für diese Matrix; nicht bloß allen Iodverbrauch ohne Störstoffprüfung Ascorbinsäure zuordnen.
  - Expected performance (EN): The learner’s own planning and actual execution are evidenced separately from the extra data. Check: corrected consumption10.00mL, n=0.000045mol, m=7.9254mg in20.00mL measured solution;396.27mg/L measured solution and1981.35mg/L original. Controls establish validity for this matrix; do not simply attribute all iodine consumption to ascorbic acid without interference checks.
  - Understanding focus (DE): Strukturbegründete tatsächlich kontrollierte Bestimmung und vollständiger Probenbezug.
  - Understanding focus (EN): Structure-based actual controlled assay and complete sample basis.
- `fresh-ascorbic-matrix-interference-and-new-measurement`
  - Task demand (DE): Untersuche eine andere frische geeignete Probe mit veränderter Verdünnung. Ein bereitgestellter Matrixzusatz enthält zusätzlich einen reduzierenden Stoff. Plane UND führe Kontroll- und Bestimmungsschritte tatsächlich durch, um zu prüfen, ob ein erhöhter Iodverbrauch der Ascorbinsäure zugeordnet werden darf oder eine geeignetere Methode nötig ist. Rechenkontrolle nur unter nachgewiesen geeigneten Bedingungen: I₂0,0040mol/L;7,80mL minus0,30mL Blindwert in10,00mL einer dreifach verdünnten Probe.
  - Task demand (EN): Investigate a different fresh suitable sample with changed dilution. A supplied matrix addition includes another reducing substance. Plan AND actually perform control and assay steps to examine whether increased iodine consumption can be assigned to ascorbic acid or a more appropriate method is needed. Calculation check only under demonstrated suitable conditions: I₂0.0040mol/L;7.80mL minus0.30mL blank in10.00mL of a threefold-diluted sample.
  - Expected performance (DE): Eigene frische Mess-/Kontrollprotokolle zeigen die Überprüfung. Mehrverbrauch durch weitere Reduktionsmittel wird nicht automatisch als Ascorbin gezählt; ein einfacher Lösemittelblindwert beseitigt nicht jede Matrixstörung. Geeignete zusätzliche Kontrollen beziehungsweise ein geeignetes spezifischeres Verfahren und neue Messungen sind erforderlich. Nur bei belegter Eignung gilt die Kontrollrechnung n=0,000030mol, m=5,2836mg,528,36mg/L Messlösung und1585,08mg/L Original. Andernfalls kein scheinpräziser Ascorbingehalt.
  - Expected performance (EN): The learner’s fresh measurement/control records show the examination. Consumption by other reducing agents is not automatically counted as ascorbic acid; a simple solvent blank does not remove every matrix interference. Appropriate additional controls or a suitable more-selective procedure and new measurements are required. Only when suitability is evidenced does the check yield n=0.000030mol, m=5.2836mg,528.36mg/L measured solution and1585.08mg/L original. Otherwise do not report a falsely precise ascorbic content.
  - Understanding focus (DE): Eigenständiger frischer Experimentaltransfer, Matrixselektivität und ehrliche Verfahrensgrenzen.
  - Understanding focus (EN): Independent fresh experimental transfer, matrix selectivity and honest method limits.
## Page 20: Grenzen der Umwandlung von Wärme in Arbeit erklären

- Full learning-goal ID: `dc5173e8-6e63-58d3-a79b-bd74ef3cb98b`
- Goal fingerprint: `sha256:59faaef06c5474fde92ecfe28351d2d0b9c61c28d197c765c55a18bd4fdf7120`
- Page fingerprint: `sha256:dddaa29b0170745c9b64a6ee12e075986bd390236eb4332a289cd1e40c6819e9`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Grenzen der Umwandlung von Wärme in Arbeit bei zyklisch arbeitenden Wärmekraftmaschinen erklären und Alltagsbegriffe wie Energieverbrauch und Energieverlust fachlich deuten.

### Visualization

/assets/goal-visualizations/chemie/dc5173e8-6e63-58d3-a79b-bd74ef3cb98b/dc5173e8-6e63-58d3-a79b-bd74ef3cb98b.png

- original digest: `sha256:b951f9d66dd08a8179d877778113b17f040da3f1429b12b19e25a2e4dcf7a6b7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Innere Energie und Enthalpie in Reaktionssystemen abgrenzen — `4928d5d1-e790-5883-9349-3b03a1c63b99` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Entropieänderungen aus Energie- und Teilchenverteilung abschätzen — `0a5a49f2-8e8a-5edb-b6ca-3f8636957a17` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1c3162b8f3b90c1f3214d79b1dc2f22de2b2e5fb35dc3724e805fd9dd9503ca1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `expectation-cyclic-engine-balance`
  - Essential understanding (DE): Zyklische Wärme-Arbeit-Grenze von Energieerhaltung unterscheiden.
  - Essential understanding (EN): Distinguish cyclic heat/work limits from energy conservation.
  - Observable performance (DE): Zyklus: ΔU_Maschine=0, Q_out=1000-300=700 J; Energie bleibt erhalten. Reservoirsumme -1000/500+700/300=+0,333 J/K, mit dem 2. Hauptsatz vereinbar. Nutzarbeit ist 300 J, die anderen 700 J werden abgegeben, nicht vernichtet. Die behauptete Ein-Reservoir-Maschine wäre energetisch bilanziert, aber ihre einzige Umweltänderung hätte ΔS=-2 J/K; sie verletzt die Kelvin-Planck-Aussage. Die Einschränkung gilt für zyklische Wärmekraftmaschinen und vollständige Gesamtbilanz, nicht pauschal für jede einmalige Wärme-Arbeit-Umwandlung.
  - Observable performance (EN): Cycle: ΔU_engine=0 and Q_out=1000-300=700 J; energy is conserved. Reservoir sum -1000/500+700/300=+0.333 J/K is consistent with the second law. Useful work is 300 J; 700 J is transferred out, not destroyed. The claimed single-reservoir engine balances energy but its only environmental change has ΔS=-2 J/K, violating Kelvin-Planck. The restriction concerns cyclic heat engines and the full balance, not every one-time heat-to-work conversion.
- `expectation-finite-expansion-vs-cycle`
  - Essential understanding (DE): Eine einmalige reversible Expansion gegen den vollständigen Zyklus abgrenzen.
  - Essential understanding (EN): Distinguish a single reversible expansion from a complete cycle.
  - Observable performance (DE): W_out≈1728,85 J und Q_in gleicher Betrag; ΔS_Gas=nR ln2≈5,763 J/K, ΔS_Reservoir=-5,763 J/K, Gesamt=0 im reversiblen Modell. Das Gasvolumen und seine Entropie haben sich verändert: kein Zyklus. Reversible Rückkompression bei derselben T benötigt entsprechende Arbeit und gibt Wärme ab; die vollständige Bilanz gewinnt keine Nettoarbeit aus einem einzigen Reservoir. Ein Kühlschrank braucht Arbeit zum Wärmetransport vom kalten zum warmen Reservoir. Energie bleibt erhalten, Bedingungen und Systemzustand bestimmen die Umwandlungsgrenze.
  - Observable performance (EN): W_out≈1728.85 J and Q_in has the same magnitude; ΔS_gas=nR ln2≈5.763 J/K, ΔS_reservoir=-5.763 J/K, total zero in the reversible model. Gas volume/entropy changed, so this is not a cycle. Reversible recompression at the same T needs corresponding work and rejects heat; the full cycle obtains no net work from one reservoir. A refrigerator needs work to move heat from cold to hot. Energy is conserved; conditions and system state define conversion limits.

**Coverage expectations**

- required expectations: `expectation-cyclic-engine-balance`, `expectation-finite-expansion-vs-cycle`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-relevant-conditions`: Die vollständig gebundenen Fälle wechseln Reaktion, Systemgrenze, Temperatur, Aggregatzustand, Stoffmengen-/Energiebasis, Messverfahren oder Zusammensetzung. Tatsächliche Durchführung bleibt dort erforderlich, wo der konkrete Quellenoperator sie verlangt. / The bound cases vary reaction, system boundary, temperature, phase, amount/energy basis, method or composition. Actual execution remains required where the specific source operator demands it.

**Application cases**

- `cyclic-engine-balance`
  - Task demand (DE): Synthetische zyklische Wärmekraftmaschine: heißes Reservoir 500 K, kaltes Reservoir 300 K. Je Zyklus Q_in=1000 J, W_out=300 J. Die Maschine kehrt in denselben Zustand zurück. Zweite Behauptung: 1000 J aus nur einem Reservoir vollständig in Arbeit, keinerlei weitere Änderung. Bilanziere Abwärme, erkläre Energieverbrauch/-verlust und prüfe beide Aussagen mit 1. und 2. Hauptsatz. Berechne ergänzend die Reservoir-Entropieänderung; erläutere die Rolle des vollständigen Zyklus.
  - Task demand (EN): Synthetic cyclic heat engine: hot reservoir 500 K, cold reservoir 300 K. Per cycle Q_in=1000 J and W_out=300 J; the machine returns to its initial state. Another claim: convert 1000 J from one reservoir entirely to work with no other change. Balance rejected heat, interpret energy consumption/loss and assess both claims with the first/second laws. Additionally calculate reservoir entropy change and explain why a complete cycle matters.
  - Expected performance (DE): Zyklus: ΔU_Maschine=0, Q_out=1000-300=700 J; Energie bleibt erhalten. Reservoirsumme -1000/500+700/300=+0,333 J/K, mit dem 2. Hauptsatz vereinbar. Nutzarbeit ist 300 J, die anderen 700 J werden abgegeben, nicht vernichtet. Die behauptete Ein-Reservoir-Maschine wäre energetisch bilanziert, aber ihre einzige Umweltänderung hätte ΔS=-2 J/K; sie verletzt die Kelvin-Planck-Aussage. Die Einschränkung gilt für zyklische Wärmekraftmaschinen und vollständige Gesamtbilanz, nicht pauschal für jede einmalige Wärme-Arbeit-Umwandlung.
  - Expected performance (EN): Cycle: ΔU_engine=0 and Q_out=1000-300=700 J; energy is conserved. Reservoir sum -1000/500+700/300=+0.333 J/K is consistent with the second law. Useful work is 300 J; 700 J is transferred out, not destroyed. The claimed single-reservoir engine balances energy but its only environmental change has ΔS=-2 J/K, violating Kelvin-Planck. The restriction concerns cyclic heat engines and the full balance, not every one-time heat-to-work conversion.
  - Understanding focus (DE): Zyklische Wärme-Arbeit-Grenze von Energieerhaltung unterscheiden.
  - Understanding focus (EN): Distinguish cyclic heat/work limits from energy conservation.
- `finite-expansion-vs-cycle`
  - Task demand (DE): Ideales Gas expandiert einmalig isotherm und reversibel bei 300 K von V auf 2V, n=1,00 mol, R=8,314 J/(mol K). Zugeführte Wärme wird bei ΔU=0 vollständig als Arbeit abgegeben; der Gaszustand ändert sich. Vergleich: Ein Zyklus muss anschließend denselben Anfangszustand wiederherstellen. Prüfe die vermeintliche Widerlegung des 2. Hauptsatzes, berechne W_out=nRT ln2 und die Entropieänderungen, und erkläre warum das Zurücksetzen nicht kostenlos ist. Ordne das Alltagsbild eines Kühlschranks/Wärmemotors fachlich ein.
  - Task demand (EN): An ideal gas undergoes one reversible isothermal expansion at 300 K from V to 2V; n=1.00 mol, R=8.314 J/(mol K). With ΔU=0, supplied heat is all released as work, but gas state changes. Contrast: a cycle must subsequently restore its initial state. Assess the alleged violation of the second law, calculate W_out=nRT ln2 and entropy changes and explain why resetting is not free. Give a scientific interpretation of a refrigerator/heat-engine everyday model.
  - Expected performance (DE): W_out≈1728,85 J und Q_in gleicher Betrag; ΔS_Gas=nR ln2≈5,763 J/K, ΔS_Reservoir=-5,763 J/K, Gesamt=0 im reversiblen Modell. Das Gasvolumen und seine Entropie haben sich verändert: kein Zyklus. Reversible Rückkompression bei derselben T benötigt entsprechende Arbeit und gibt Wärme ab; die vollständige Bilanz gewinnt keine Nettoarbeit aus einem einzigen Reservoir. Ein Kühlschrank braucht Arbeit zum Wärmetransport vom kalten zum warmen Reservoir. Energie bleibt erhalten, Bedingungen und Systemzustand bestimmen die Umwandlungsgrenze.
  - Expected performance (EN): W_out≈1728.85 J and Q_in has the same magnitude; ΔS_gas=nR ln2≈5.763 J/K, ΔS_reservoir=-5.763 J/K, total zero in the reversible model. Gas volume/entropy changed, so this is not a cycle. Reversible recompression at the same T needs corresponding work and rejects heat; the full cycle obtains no net work from one reservoir. A refrigerator needs work to move heat from cold to hot. Energy is conserved; conditions and system state define conversion limits.
  - Understanding focus (DE): Eine einmalige reversible Expansion gegen den vollständigen Zyklus abgrenzen.
  - Understanding focus (EN): Distinguish a single reversible expansion from a complete cycle.
