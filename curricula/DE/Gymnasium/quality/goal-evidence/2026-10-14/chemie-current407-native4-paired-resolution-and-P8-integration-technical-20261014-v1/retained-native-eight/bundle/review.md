# AI review input: Chemie – acht aktuelle Ziele und ihr vollständiger Kontext

- Book ID: `chemie-current406-final-native8-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:1bd460fc74c44976283b0a78f428e9a8d52d00b95a891288e8bce413bd93e534`
- Selected goals: 8

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Silikone herstellen und strukturbezogen vergleichen

- Full learning-goal ID: `e56040b5-1da8-5080-b358-086d04922339`
- Goal fingerprint: `sha256:2af925c39358674f62e8e797567ba87336a9eca8197fddadc8e9862fd4f5ec8b`
- Page fingerprint: `sha256:f79fa7c0620801a4d47c64b889b9d09209a5aebcfa91587399eabe8b60f94d42`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.2 Grundlagen der Kunststoffchemie

### Canonical description

Die lernende Person kann Herstellung und Bau von Silikonmolekülen beschreiben, ihre Eigenschaften mit ausgewählten kohlenstoffbasierten Polymeren vergleichen und ihre Bedeutung für Nanotechnologie erläutern.

### Visualization

/assets/goal-visualizations/chemie/e56040b5-1da8-5080-b358-086d04922339/e56040b5-1da8-5080-b358-086d04922339.png

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

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e3e393de38cd595e0a6d2d901678320451018331ba8532fb485accfdb769e503`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Silikonmoleküle besitzen ein Siloxanrückgrat mit organischen Seitengruppen; Silikon ist nicht elementares Silicium.
  - Essential understanding (EN): Silicone molecules have a siloxane backbone with organic side groups; silicone is not elemental silicon.
  - Observable performance (DE): Zeichnet ein valenzrichtiges PDMS-Kettenfragment und unterscheidet es von PE.
  - Observable performance (EN): Draws a valence-correct PDMS fragment and distinguishes it from PE.
- `e2`
  - Essential understanding (DE): Silanolkondensation bildet Si–O–Si und Wasser; lineare Ketten und kovalente Netzwerke besitzen unterschiedliche Eigenschaften.
  - Essential understanding (EN): Silanol condensation forms Si–O–Si and water; linear chains and covalent networks have different properties.
  - Observable performance (DE): Bilanziert eine endliche Kondensation und erklärt Öl/Elastomer anhand der Vernetzung.
  - Observable performance (EN): Balances finite condensation and explains oil/elastomer behaviour through crosslinking.
- `e3`
  - Essential understanding (DE): Silikonchemie kann nanoskalige Beschichtungen und Benetzung beeinflussen, macht aber nicht jedes Silikon zum Nanopartikel.
  - Essential understanding (EN): Silicone chemistry can affect nanoscale coatings and wetting but does not make every silicone a nanoparticle.
  - Observable performance (DE): Vergleicht mit einem ausgewählten kohlenstoffbasierten Polymer und beurteilt eine neue Beschichtung anhand von Chemie und Struktur.
  - Observable performance (EN): Compares with a selected carbon-based polymer and evaluates a new coating using chemistry and structure.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Linear oder vernetzt / Linear or crosslinked
- `v2`: Rückgrat und Seitengruppen / Backbone and side groups
- `v3`: Dicke und Oberflächenstruktur / Thickness and surface structure

**Application cases**

- `e56040b5-case-1`
  - Task demand (DE): Formuliere vollständiges Trimer samt Wasser und prüfe Si/O-Valenzen. Vergleiche Rückgrat/Verhalten mit PE; wähle eine Dichtung. Erkläre, warum Silikonöl kein Nachweis eines Nanomaterials ist.
  - Task demand (EN): Write the complete trimer with water and check Si/O valence. Compare backbone/behaviour with PE; select a seal. Explain why silicone oil does not demonstrate a nanomaterial.
  - Expected performance (DE): 3 HO–Si(CH₃)₂–OH→HO–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–OH+2 H₂O. Jedes Si vier Einfachbindungen, Brücken-O zwei. PDMS Si–O-Rückgrat mit Methylgruppen, PE C–C-Rückgrat. Vernetztes PDMS für Rückstellung; lineares Öl kein formstabiler Dichtungswerkstoff. Eigenschaften nicht allein aus „Silikon“ ableiten; nanoskalige Abmessung/Struktur muss separat gezeigt sein.
  - Expected performance (EN): 3 HO–Si(CH₃)₂–OH→HO–Si(CH₃)₂–O–Si(CH₃)₂–O–Si(CH₃)₂–OH+2 H₂O. Each Si has four single bonds; bridge O two. PDMS has a Si–O backbone and methyl groups, PE a C–C backbone. Crosslinked PDMS is preferable for recovery; linear oil is not a shape-stable seal. Properties cannot follow from “silicone” alone; nanoscale dimension/structure needs separate evidence.
  - Understanding focus (DE): Fallbezogene Aspekte: PDMS-Si–O mit Methylgruppen versus PE-C–C; Si vier und Brücken-O zwei Bindungen. / Endgruppenrichtiges Trimer+2 H₂O; lineares Öl gleitet, vernetztes PDMS stellt zurück. / Vernetzte Dichtung vorläufig; Öl/Silikonname beweist kein Nanoobjekt, Größe/Struktur separat nötig. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: PDMS Si–O with methyl groups versus PE C–C; Si has four and bridge O two bonds. / Correct-ended trimer+2 H₂O; linear oil slides, crosslinked PDMS recovers. / Crosslinked seal provisionally; oil/silicone name proves no nano-object, size/structure separately required. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `e56040b5-case-2`
  - Task demand (DE): Erkläre Herkunft der Si–O-Verknüpfung und beide Polymerzustände. Bewerte Benetzungsdaten für eine selbstreinigende Oberfläche. Prüfe „40 nm dick heißt 40 nm-Silikonpartikel“ und vergleiche die Chemie mit einer PE-Oberfläche.
  - Task demand (EN): Explain the origin of Si–O links and both polymer states. Assess wetting data for self-cleaning. Evaluate “40 nm thickness means 40 nm silicone particles” and compare chemistry with a PE surface.
  - Expected performance (DE): Silanolkondensation kann Si–O–Si+Wasser bilden; zusätzliche Netzpunkte begrenzen Gleiten und ermöglichen Rückstellung. Gleiche Chemie kontrolliert Strukturwirkung; niedriger Abrollwinkel unterstützt mobile Tropfen, tatsächlicher Schmutzabtrag/Abrieb fehlt.40 nm ist Schichtdicke, kein Partikeldurchmesser. Methylgruppen können Wasserabweisung tragen; PE ebenfalls unpolar, aber C–C statt Si–O-Rückgrat. Hydrophile Kontrolle zeigt Dicke allein nicht hinreichend.
  - Expected performance (EN): Silanol condensation can form Si–O–Si plus water; added network points limit sliding and allow recovery. Constant chemistry controls the structural effect; low roll-off angle supports mobile droplets, while dirt-removal/abrasion evidence is missing.40 nm is thickness, not particle diameter. Methyl groups can support water repellency; PE is also nonpolar but has a C–C rather than Si–O backbone. The hydrophilic control shows thickness alone is insufficient.
  - Understanding focus (DE): Fallbezogene Aspekte: Silanol→Si–O–Si+Wasser als Modell; Netzpunkte begrenzen Gleiten, nicht aus Dicke abgeleitet. / Gleiche Chemie 105°/35°→155°/5° zeigt Strukturwirkung; Schmutzabtrag/Abrieb trotz Abrollbefund offen. / 40 nm ist Schichtdicke, keine Partikelgröße; PDMS-Methyl/Si–O gegenüber unpolarem PE/C–C unterscheiden. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Silanol→Si–O–Si+water as model; network points restrict sliding, not inferred from thickness. / Constant chemistry 105°/35°→155°/5° shows structure effect; dirt removal/abrasion remain open despite roll-off finding. / 40 nm is film thickness, not particle size; distinguish PDMS methyl/Si–O from nonpolar PE/C–C. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
## Page 2: Textilfarbstoffe über Farbstoff-Faser-Wechselwirkungen beurteilen

- Full learning-goal ID: `b208b1a5-c609-53a1-8add-979417a93b7d`
- Goal fingerprint: `sha256:32f3fba0a5a8c6613330c6b7d7f33dc4cddb89782ad50947d68e72c66c1041ca`
- Page fingerprint: `sha256:9a243ce65f6ee68df6fe14c5d951d5eee72685ce8f53324be0f5a76391002af3`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Farbstoffchemie

### Canonical description

Die lernende Person kann ausgewählte Bindungs- und Wechselwirkungstypen zwischen Farbstoff-Molekülen und Faser-Molekülen beschreiben und die Eignung von Farbstoffen als Textilfarbstoff beurteilen.

### Visualization

/assets/goal-visualizations/chemie/b208b1a5-c609-53a1-8add-979417a93b7d/b208b1a5-c609-53a1-8add-979417a93b7d.png

- original digest: `sha256:2b0140d86abd555d96950e4e1b77debd39f50427ee1dc794bb74f0176ab55645`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Stoffklasseneigenschaften bindungsbezogen vergleichen — `0b6a6a15-b355-5be8-abc9-4ef8df11bcb6` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3516c1fbac4f7e2027be121b9c84c4e228942c1a9ac26d3dd1815099c66008ef`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Färbereignung entsteht aus konkreten Farbstoff-Faser-Wechselwirkungen und Bedingungen.
  - Essential understanding (EN): Dye suitability arises from specific dye-fiber interactions and conditions.
  - Observable performance (DE): Ordnet Ladungen, Wasserstoffbrücken, Dispersion oder kovalente Fixierung zu.
  - Observable performance (EN): Assigns charges, hydrogen bonding, dispersion or covalent fixation.
- `e2`
  - Essential understanding (DE): Löslichkeit, Bindungsstärke und Waschbeständigkeit müssen zusammen beurteilt werden.
  - Essential understanding (EN): Solubility, interaction strength and wash resistance must be judged together.
  - Observable performance (DE): Begründet eine materialbezogene Auswahl mit Grenzen.
  - Observable performance (EN): Justifies a material-specific choice with limits.

**Coverage expectations**

- required expectations: `e1`, `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Proteinfasern versus Cellulose / Protein fibers versus cellulose
- `v2`: Kovalente Fixierung versus Einlagerung / Covalent fixation versus entrapment

**Application cases**

- `b208b1a5-case-1`
  - Task demand (DE): Modell im sauren Färbebad: Wollprotein trägt –NH₃⁺-Gruppen; Baumwollcellulose überwiegend ungeladene –OH-Gruppen. Farbstoff D besitzt zwei –SO₃⁻-Gruppen und H-Brücken-Akzeptoren. Beide Proben werden gleich gespült; keine kovalente Reaktion.
1. Beschreibe die elektrostatischen und möglichen Wasserstoffbrücken-Wechselwirkungen von D mit beiden Fasern; unterscheide sie von kovalenter Bindung.
2. Beurteile die bevorzugte Eignung für Wolle gegenüber Baumwolle unter den angegebenen Bedingungen und nenne eine Grenze der Waschbeständigkeitsvorhersage.
  - Task demand (EN): Model in an acidic dye bath: wool protein carries –NH₃⁺ groups; cotton cellulose has mostly uncharged –OH groups. Dye D has two –SO₃⁻ groups and hydrogen-bond acceptors. Both samples are rinsed equally; no covalent reaction.
1. Describe electrostatic and possible hydrogen-bond interactions of D with both fibers; distinguish them from covalent bonding.
2. Assess preferred suitability for wool rather than cotton under these conditions and state one limit of predicting wash resistance.
  - Expected performance (DE): 1. D⁻-Gruppen werden von Woll–NH₃⁺ elektrostatisch angezogen. Zusätzlich sind H-Brücken zwischen geeigneten Faser-Donoren und D-Akzeptoren möglich. Cellulose bietet –OH für H-Brücken, aber hier keine positiven Fixierstellen. Keine der Wechselwirkungen ist eine neu gebildete kovalente Farbstoff-Faser-Bindung.
2. Wolle besitzt hier zusätzliche ionische Anziehung und ist daher günstiger für D. Dies ist keine Garantie: konkrete Bindungsstärke, Farbstoffgröße, pH des Waschbads oder Konkurrenz durch Wasser fehlen. Die bloße Anzahl von –OH-Gruppen belegt keine stärkere Fixierung an Baumwolle.
  - Expected performance (EN): 1. D anionic groups are electrostatically attracted to wool –NH₃⁺. Hydrogen bonds may also form between suitable fiber donors and dye acceptors. Cellulose offers –OH groups for hydrogen bonding but no positive fixation sites here. Neither interaction is a newly formed covalent dye-fiber bond.
2. Wool provides additional ionic attraction and is favored for D here. This is not a guarantee: actual interaction strength, dye size, wash-bath pH or competition from water are unknown. Merely counting –OH groups does not establish stronger cotton fixation.
  - Understanding focus (DE): D⁻-Gruppen werden von Woll–NH₃⁺ elektrostatisch angezogen. Zusätzlich sind H-Brücken zwischen geeigneten Faser-Donoren und D-Akzeptoren möglich. Cellulose bietet –OH für H-Brücken, aber hier keine positiven Fixierstellen. Keine der Wechselwirkungen ist eine neu gebildete kovalente Farbstoff-Faser-Bindung. / Wolle besitzt hier zusätzliche ionische Anziehung und ist daher günstiger für D. Dies ist keine Garantie: konkrete Bindungsstärke, Farbstoffgröße, pH des Waschbads oder Konkurrenz durch Wasser fehlen.
  - Understanding focus (EN): D anionic groups are electrostatically attracted to wool –NH₃⁺. Hydrogen bonds may also form between suitable fiber donors and dye acceptors. Cellulose offers –OH groups for hydrogen bonding but no positive fixation sites here. Neither interaction is a newly formed covalent dye-fiber bond. / Wool provides additional ionic attraction and is favored for D here. This is not a guarantee: actual interaction strength, dye size, wash-bath pH or competition from water are unknown.
- `b208b1a5-case-2`
  - Task demand (DE): Idealisiert: Cellulose–O⁻ kann am elektrophilen Triazin-C eines Reaktivfarbstoffs mit Cl-Abgang substituieren: Cell–O–Triazin–D. Polyester besitzt unter den angegebenen Bedingungen keine entsprechenden reaktiven Gruppen; ein neutraler wenig wasserlöslicher Dispersionsfarbstoff lagert sich durch Dispersion und hydrophobe Affinität ein.
1. Ordne beide Fixierungsmodelle den Fasern zu und erkläre den Unterschied zwischen kovalenter Reaktion und intermolekularer Einlagerung.
2. Beurteile, warum ein stark wasserlöslicher ionischer Farbstoff ohne reaktive Gruppe für diesen Polyester ungünstig ist, und begrenze die Behauptung „kovalent bedeutet immer unveränderliche Farbe“.
  - Task demand (EN): Idealized: cellulose–O⁻ can substitute at electrophilic triazine C of a reactive dye with chloride leaving, giving Cell–O–Triazine–D. Polyester has no corresponding reactive groups under the stated conditions; a neutral poorly water-soluble disperse dye is taken up through dispersion and hydrophobic affinity.
1. Assign both fixation models to the fibers and explain covalent reaction versus intermolecular uptake.
2. Assess why a highly water-soluble ionic dye without a reactive group is unfavorable for this polyester and limit the claim “covalent always means unchangeable color”.
  - Expected performance (DE): 1. Reaktivfarbstoff passt zum angegebenen Cellulose-Nukleophil: neue Cell–O–C-Bindung mit Cl⁻-Abgang. Der Dispersionsfarbstoff wird ohne neue kovalente Bindung im Polyester aufgenommen. Beide Modelle beruhen auf verschiedenen Stoffeigenschaften.
2. Der ionische Farbstoff bevorzugt Wasser und hat in diesem Modell keine günstige Fixierroute am Polyester. Kovalente Fixierung erschwert Auswaschen, verhindert aber nicht photochemischen Abbau, Faserabbau oder andere chemische Veränderungen.
  - Expected performance (EN): 1. The reactive dye fits the given cellulose nucleophile: a new Cell–O–C bond forms with Cl⁻ departure. The disperse dye enters polyester without a new covalent bond. The models rely on different material properties.
2. The ionic dye favors water and has no suitable polyester fixation route in this model. Covalent fixation impedes washing out but does not prevent photochemical degradation, fiber breakdown or other chemical changes.
  - Understanding focus (DE): Reaktivfarbstoff passt zum angegebenen Cellulose-Nukleophil: neue Cell–O–C-Bindung mit Cl⁻-Abgang. Der Dispersionsfarbstoff wird ohne neue kovalente Bindung im Polyester aufgenommen. Beide Modelle beruhen auf verschiedenen Stoffeigenschaften. / Der ionische Farbstoff bevorzugt Wasser und hat in diesem Modell keine günstige Fixierroute am Polyester. Kovalente Fixierung erschwert Auswaschen, verhindert aber nicht photochemischen Abbau, Faserabbau oder andere chemische Veränderungen.
  - Understanding focus (EN): The reactive dye fits the given cellulose nucleophile: a new Cell–O–C bond forms with Cl⁻ departure. The disperse dye enters polyester without a new covalent bond. The models rely on different material properties. / The ionic dye favors water and has no suitable polyester fixation route in this model. Covalent fixation impedes washing out but does not prevent photochemical degradation, fiber breakdown or other chemical changes.
## Page 3: Elektrophile Substitution am Aromaten modellieren

- Full learning-goal ID: `17ab1148-7383-5cab-8b91-73aff795f1e4`
- Goal fingerprint: `sha256:baf88eceefd026bec0d0048c44e425277a9e5f8bf38b0e445e4b3d2320abdc63`
- Page fingerprint: `sha256:6a97e0114cee37fec409d09f27cf51c87aa456c1cf27f03e9a54fc2e90ee8f2b`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Stoffgruppen > Q1.1 Chemische Bindung & Strukturen > Aromaten vertieft analysieren (LK)

### Canonical description

Die lernende Person kann elektrophile Substitutionen am aromatischen Ring modellieren.

### Visualization

/assets/goal-visualizations/chemie/17ab1148-7383-5cab-8b91-73aff795f1e4/17ab1148-7383-5cab-8b91-73aff795f1e4.jpg

- original digest: `sha256:0f5ccca4ba6e7089e21c9228e7f97925d147d1689023fe98bbbc8250848af4e7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Azofarbstoff-Synthese mechanistisch darstellen — `981242bb-a729-5701-b02d-c2f7f489e5af` (page 4)
- Triphenylmethanfarbstoff-Synthese mechanistisch darstellen — `53db04a0-ea76-5810-9526-c8639100e497` (page 5)

### Prerequisites outside this book

- Bindungsverhältnisse aromatischer Systeme modellieren — `f0f67a7a-b06a-50b9-8edc-1f2a0d97520d` (outside this book)

### Direct reverse prerequisites outside this book

- Fruchtsaft zwischen Sorbinsäure und Ascorbinsäure bewerten — `00139854-e5a7-5c12-ab50-2268c80bf776` (outside this book)
- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Campingseife in hartem Wasser — `bf6c39f0-1e44-53b2-8ff6-025f2e36e125` (outside this book)
- Propanon aus Reinigungsalkohol — `c91350bc-7d2e-523c-bd50-0324bccfcf98` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:280c30d3a8bf87533754d8a4c1d4d4203434bdcd2ac108bbe3cb92536da05d23`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b003-17ab1148-core`
  - Essential understanding (DE): Elektrophile aromatische Substitution umfasst Angriff eines Elektrophils, ein nichtaromatisches Sigma-Zwischenstadium und Deprotonierung zur Wiederherstellung der Aromatizität.
  - Essential understanding (EN): Electrophilic aromatic substitution involves electrophile attack, a nonaromatic sigma intermediate, and deprotonation restoring aromaticity.
  - Observable performance (DE): Die lernende Person ergänzt in einem vorgegebenen Benzol-Substitutionsschema plausible Elektronenpfeile und erklärt, weshalb am Ende ein Ring-H ersetzt wurde.
  - Observable performance (EN): The learner completes plausible electron arrows in a supplied benzene substitution and explains why a ring H is replaced in the end.

**Coverage expectations**

- required expectations: `b003-17ab1148-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `electrophile`: Bromierung und Nitrierung werden als unterschiedliche Elektrophil-Fälle verglichen. / Bromination and nitration are compared as different electrophile cases.
- `aromaticity`: Sigma-Zwischenstufe und aromatisches Produkt werden getrennt. / The sigma intermediate and aromatic product are distinguished.

**Application cases**

- `benzene-bromination-paper`
  - Task demand (DE): Ein vorgegebenes Papier-Schema zur Bromierung von Benzol zeigt Br+ als vereinfachtes Elektrophil. Ergänze Angriff, Sigma-Zwischenstufe und Deprotonierung; keine Durchführung.
  - Task demand (EN): A supplied paper scheme of benzene bromination gives Br+ as a simplified electrophile. Add attack, sigma intermediate, and deprotonation; no experiment is requested.
  - Expected performance (DE): Die lernende Person zeigt eine vorübergehend aufgehobene Aromatizität und bildet Brombenzol, wobei ein Ring-H ersetzt wird und die Aromatizität zurückkehrt.
  - Expected performance (EN): The learner shows temporary loss of aromaticity and forms bromobenzene, replacing a ring H and restoring aromaticity.
  - Understanding focus (DE): Substitution verlangt Rückgewinnung des aromatischen Systems.
  - Understanding focus (EN): Substitution requires restoration of the aromatic system.
- `fresh-nitration-mechanism`
  - Task demand (DE): Ein neuer vorgegebener Mechanismus lässt NO2+ an Benzol angreifen, endet aber als dauerhafte Additionsstruktur mit zusätzlichem H am Ring. Finde und korrigiere den letzten Schritt.
  - Task demand (EN): A fresh supplied mechanism has NO2+ attack benzene but ends as a permanent addition structure retaining the ring H. Find and correct the final step.
  - Expected performance (DE): Die lernende Person ergänzt Deprotonierung zum Nitrobenzol und begründet, dass die delokalisierte Ringstruktur wiederhergestellt wird.
  - Expected performance (EN): The learner adds deprotonation to nitrobenzene and explains restoration of the delocalized ring.
  - Understanding focus (DE): Neues Elektrophil prüft Mechanismus statt Bildkopie.
  - Understanding focus (EN): A fresh electrophile tests mechanism rather than picture copying.
## Page 4: Azofarbstoff-Synthese mechanistisch darstellen

- Full learning-goal ID: `981242bb-a729-5701-b02d-c2f7f489e5af`
- Goal fingerprint: `sha256:0be58bf33fa05f1b9682c236c8120bed257db35e3ea4b8d6333364670b55d5e4`
- Page fingerprint: `sha256:fbd47970a5b417018545fc708fe9235905cf3d25c1599ea8af21e235e87baf89`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Farbstoffchemie > Azo- und Triphenylmethanfarbstoffe mechanistisch darstellen

### Canonical description

Die lernende Person kann die vollständige Syntheseroute eines Azofarbstoffs aus einem aromatischen primären Amin über Diazotierung und anschließende Azokupplung auf Teilchenebene mechanistisch darstellen und den Bindungsaufbau sowie die Atom- und Ladungsbilanz erklären.

### Visualization

/assets/goal-visualizations/chemie/981242bb-a729-5701-b02d-c2f7f489e5af/981242bb-a729-5701-b02d-c2f7f489e5af.png

- original digest: `sha256:a004f7bd97c3589e14c4585847b6451a9913eab1a6b71b3a9187c31f7b75c8bd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Elektrophile Substitution am Aromaten modellieren — `17ab1148-7383-5cab-8b91-73aff795f1e4` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b32e5f8cffd0b2d68e62922f40d6f4209780f2d4996b8d1994003cc617e0437b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Azosynthese umfasst Diazotierung und Kupplung; N-N-Bindungsaufbau, Ladungen und Rearomatisierung werden auf Teilchenebene erklärt.
  - Essential understanding (EN): Azo synthesis includes diazotization and coupling; N-N formation, charges and rearomatization are explained at particle level.
  - Observable performance (DE): Stellt den begrenzten Diazotierungsweg mit Bilanz sowie den Kupplungsmechanismus aus den ausdrücklich gegebenen Zwischenstufen dar.
  - Observable performance (EN): Represents the bounded diazotization route and balance, then coupling, using the explicitly supplied intermediates.

**Coverage expectations**

- required expectations: `e1`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Aromatisches primäres Amin und Kupplungspartner / Aromatic primary amine and coupling partner
- `v2`: Elektronenpaarfluss, Ladungsbilanz und verfügbarer Donor / Electron-pair flow, charge balance and available donor

**Application cases**

- `981242bb-case-1`
  - Task demand (DE): Nur Papiermechanismen, keine Ausführung. Azo: [Ph–N≡N]⁺ und C₆H₅OH unter Bedingungen mit aktivem Phenol; das Produkt ist para-HO–C₆H₄–N=N–Ph. Vorgeschaltete Diazotierung im Papiermodell: Ar_D=Ph; Ar_D–NH₂ + HNO₂ in wässriger Säure bei0–5 °C. NO⁺ bezeichnet das nitrosierende Elektrophil. Die Zwischenstufen Ar_D–NH–N=O und Ar_D–N=N–OH sind als Strukturhilfen gegeben; einzelne Protonenübertragungen dürfen zu Sammelschritten zusammengefasst werden. Ar_D steht für den unveränderten Arylrest. Keine dirigierenden Effekte oder praktischen Ausführungsschritte werden zusätzlich geprüft.
1. Ergänze vor der Kupplung die Diazotierung auf Teilchenebene: beschreibe den Elektronenpaarfluss beim Angriff des Aminostickstoffs auf NO⁺, ordne die gegebenen N-N-Zwischenstufen bis zum Diazoniumion und erkläre die Rolle der Säure und der Wasserabspaltung. Formuliere die Gesamtgleichung mit Ar_D–NH₂, HNO₂ und H⁺ und prüfe Atom- und Gesamtladungsbilanz. Vollständige Einzelpfeile für jede Protonenübertragung sind nicht gefordert.
2. Stelle für die Azokupplung Elektronenpaarpfeile vom Ring zum terminalen Diazoniumnitrogen, die Verringerung von N≡N zu N=N, den σ-Komplex und die rearomatisierende Protonenabgabe dar; bilanziere die Gesamtladung.
  - Task demand (EN): Paper mechanisms only, no execution. Azo: Ph–N≡N⁺ and C₆H₅OH under conditions with reactive phenol; the product is para-HO–C₆H₄–N=N–Ph. Preceding diazotization in the paper model: Ar_D=Ph; Ar_D–NH₂ + HNO₂ in aqueous acid at0–5 °C. NO⁺ denotes the nitrosating electrophile. Ar_D–NH–N=O and Ar_D–N=N–OH are supplied structural guides; individual proton transfers may be grouped. Ar_D is the unchanged aryl group. No extra directing-effect or practical-execution requirement is assessed.
1. Complete diazotization before coupling at particle level: describe electron-pair flow when amino nitrogen attacks NO⁺, order the supplied N-N intermediates up to the diazonium ion, and explain acid and water-loss roles. Write the overall equation using Ar_D–NH₂, HNO₂ and H⁺ and check atom and net-charge balance. Separate arrows for every proton transfer are not required.
2. Show electron-pair arrows from the ring to terminal diazonium nitrogen, reduction of N≡N to N=N, the sigma complex and rearomatizing proton loss; balance overall charge.
  - Expected performance (DE): 1. Ein verfügbares N-Elektronenpaar des neutralen Aminanteils greift das N des nitrosierenden NO⁺ an und bildet die N-N-Bindung. Nach Protonenübertragung/Deprotonierung liegt Ar_D–NH–N=O vor; Protonenumlagerung ergibt Ar_D–N=N–OH. Säure ermöglicht die Bildung des Nitrosierungsreagenzes und protoniert die OH-Gruppe zu einer Wasserabgangsgruppe. Wasserabspaltung und Bildung der N≡N-Bindung ergeben [Ar_D–N≡N]⁺. Gesamt: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Außer dem unveränderten Ar_D stehen links wie rechts2 N,2 O und4 H; Gesamtladung jeweils+1. Diese verkürzte Teilchenfolge genügt hier; sie ist kein vollständiges Protonenübertragungsnetz und keine Versuchsaufzeichnung.
2. Ein Ring-π-Paar greift das terminale N von Ph–N≡N⁺ an; ein N≡N-π-Paar wird auf das an Ph gebundene N verschoben. Es entsteht ein positiv geladener Ring-σ-Komplex mit Ph–N=N–C-Bindung. Eine Base nimmt H⁺ am angegriffenen C ab; das C–H-Paar stellt die Ring-π-Bindung wieder her. PhN₂⁺ + C₆H₅OH → Ph–N=N–C₆H₄–OH + H⁺: +1 auf beiden Seiten.
  - Expected performance (EN): 1. An available N lone pair of the neutral amine fraction attacks nitrogen of nitrosating NO⁺ and forms the N-N bond. Proton transfer/deprotonation gives Ar_D–NH–N=O; proton rearrangement gives Ar_D–N=N–OH. Acid enables formation of the nitrosating reagent and protonates OH into a water leaving group. Water loss and formation of N≡N give [Ar_D–N≡N]⁺. Overall: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Apart from unchanged Ar_D, both sides contain2 N,2 O and4 H; net charge is+1 on both sides. This abbreviated particle sequence is sufficient here; it is neither a complete proton-transfer network nor an experiment record.
2. A ring pi pair attacks the terminal N of Ph–N≡N⁺; one N≡N pi pair moves onto the N bound to Ph. This gives a positively charged ring sigma complex with a Ph–N=N–C bond. A base removes H⁺ at the attacked carbon; its C–H pair restores the ring pi bond. PhN₂⁺ + C₆H₅OH → Ph–N=N–C₆H₄–OH + H⁺ has +1 on both sides.
  - Understanding focus (DE): Azosynthese umfasst Diazotierung und Kupplung; N-N-Bindungsaufbau, Ladungen und Rearomatisierung werden auf Teilchenebene erklärt.
  - Understanding focus (EN): Azo synthesis includes diazotization and coupling; N-N formation, charges and rearomatization are explained at particle level.
- `981242bb-case-2`
  - Task demand (DE): Papiermodell: p-NO₂–C₆H₄–N₂⁺ koppelt an N,N-Dimethylanilin para zum Aminodonor. Gegenionen sind Zuschauer; keine Stoffe werden hergestellt. Vorgeschaltete Diazotierung im Papiermodell: Ar_D=p-NO₂–C₆H₄; Ar_D–NH₂ + HNO₂ in wässriger Säure bei0–5 °C. NO⁺ bezeichnet das nitrosierende Elektrophil. Die Zwischenstufen Ar_D–NH–N=O und Ar_D–N=N–OH sind als Strukturhilfen gegeben; einzelne Protonenübertragungen dürfen zu Sammelschritten zusammengefasst werden. Ar_D steht für den unveränderten Arylrest. Keine dirigierenden Effekte oder praktischen Ausführungsschritte werden zusätzlich geprüft.
1. Ergänze vor der Kupplung die Diazotierung auf Teilchenebene: beschreibe den Elektronenpaarfluss beim Angriff des Aminostickstoffs auf NO⁺, ordne die gegebenen N-N-Zwischenstufen bis zum Diazoniumion und erkläre die Rolle der Säure und der Wasserabspaltung. Formuliere die Gesamtgleichung mit Ar_D–NH₂, HNO₂ und H⁺ und prüfe Atom- und Gesamtladungsbilanz. Vollständige Einzelpfeile für jede Protonenübertragung sind nicht gefordert.
2. Zeichne den Azokupplungsmechanismus mit Elektronenpaarpfeilen, N=N-Verknüpfung, σ-Komplex-Ladung und Deprotonierung; erkläre, warum vollständige Protonierung des Aminodonors die Kupplung erschwert.
  - Task demand (EN): Paper model: p-NO₂–C₆H₄–N₂⁺ couples to N,N-dimethylaniline para to its amino donor. Counterions are spectators; no substances are made. Preceding diazotization in the paper model: Ar_D=p-NO₂–C₆H₄; Ar_D–NH₂ + HNO₂ in aqueous acid at0–5 °C. NO⁺ denotes the nitrosating electrophile. Ar_D–NH–N=O and Ar_D–N=N–OH are supplied structural guides; individual proton transfers may be grouped. Ar_D is the unchanged aryl group. No extra directing-effect or practical-execution requirement is assessed.
1. Complete diazotization before coupling at particle level: describe electron-pair flow when amino nitrogen attacks NO⁺, order the supplied N-N intermediates up to the diazonium ion, and explain acid and water-loss roles. Write the overall equation using Ar_D–NH₂, HNO₂ and H⁺ and check atom and net-charge balance. Separate arrows for every proton transfer are not required.
2. Draw azo coupling with electron-pair arrows, N=N linkage, sigma-complex charge and deprotonation; explain why complete protonation of the amino donor hinders coupling.
  - Expected performance (DE): 1. Ein verfügbares N-Elektronenpaar des neutralen Aminanteils greift das N des nitrosierenden NO⁺ an und bildet die N-N-Bindung. Nach Protonenübertragung/Deprotonierung liegt Ar_D–NH–N=O vor; Protonenumlagerung ergibt Ar_D–N=N–OH. Säure ermöglicht die Bildung des Nitrosierungsreagenzes und protoniert die OH-Gruppe zu einer Wasserabgangsgruppe. Wasserabspaltung und Bildung der N≡N-Bindung ergeben [Ar_D–N≡N]⁺. Gesamt: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Außer dem unveränderten Ar_D stehen links wie rechts2 N,2 O und4 H; Gesamtladung jeweils+1. Diese verkürzte Teilchenfolge genügt hier; sie ist kein vollständiges Protonenübertragungsnetz und keine Versuchsaufzeichnung.
2. π-Paar des Dimethylanilinrings→terminales Diazonium-N; N≡N-π-Paar→inneres N. Positiver σ-Komplex→H⁺-Abgabe mit C–H-Paar→Ring-π. Produkt p-NO₂–C₆H₄–N=N–C₆H₄–N(CH₃)₂, insgesamt Diazoniumpartner+ArH→Azofarbstoff+H⁺. Protoniertes –N⁺H(CH₃)₂ hat kein verfügbares freies Paar für den +M-Effekt, daher weniger aktivierter Ring.
  - Expected performance (EN): 1. An available N lone pair of the neutral amine fraction attacks nitrogen of nitrosating NO⁺ and forms the N-N bond. Proton transfer/deprotonation gives Ar_D–NH–N=O; proton rearrangement gives Ar_D–N=N–OH. Acid enables formation of the nitrosating reagent and protonates OH into a water leaving group. Water loss and formation of N≡N give [Ar_D–N≡N]⁺. Overall: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Apart from unchanged Ar_D, both sides contain2 N,2 O and4 H; net charge is+1 on both sides. This abbreviated particle sequence is sufficient here; it is neither a complete proton-transfer network nor an experiment record.
2. Dimethylaniline ring pi pair→terminal diazonium N; N≡N pi pair→inner N. Positive sigma complex→H⁺ loss with C–H pair→ring pi. Product: p-NO₂–C₆H₄–N=N–C₆H₄–N(CH₃)₂; overall diazonium partner+ArH→azo dye+H⁺. Protonated –N⁺H(CH₃)₂ lacks an available lone pair for +M donation, so the ring is less activated.
  - Understanding focus (DE): Azosynthese umfasst Diazotierung und Kupplung; N-N-Bindungsaufbau, Ladungen und Rearomatisierung werden auf Teilchenebene erklärt.
  - Understanding focus (EN): Azo synthesis includes diazotization and coupling; N-N formation, charges and rearomatization are explained at particle level.
## Page 5: Triphenylmethanfarbstoff-Synthese mechanistisch darstellen

- Full learning-goal ID: `53db04a0-ea76-5810-9526-c8639100e497`
- Goal fingerprint: `sha256:22652fd19fca2ba96da08b964a2880b43ce14a034fbedbdaa0af66a7fb1306ae`
- Page fingerprint: `sha256:0784b63fe09cf848bd8308dc634b6da759c30132541ce75549cc99e2d16bef74`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Farbstoffchemie > Azo- und Triphenylmethanfarbstoffe mechanistisch darstellen

### Canonical description

Die lernende Person kann die vollständige Syntheseroute eines Triphenylmethanfarbstoffs aus einem aromatischen Aldehyd und aktivierten aromatischen Kupplungspartnern über säurekatalysierte Kondensation zur Leukoverbindung und anschließende Oxidation zum Farbstoffkation auf Teilchenebene mechanistisch darstellen und die Reaktions- und Ladungsbilanz erklären.

### Visualization

/assets/goal-visualizations/chemie/53db04a0-ea76-5810-9526-c8639100e497/53db04a0-ea76-5810-9526-c8639100e497.png

- original digest: `sha256:333611b58af74d954a489cb85f697d07fec80afbfdfce0f7d9b2ca7429eef496`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Elektrophile Substitution am Aromaten modellieren — `17ab1148-7383-5cab-8b91-73aff795f1e4` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Oxidationszahlen bestimmen und bilanzieren — `4961130b-1ee8-58f2-a319-dff0a864db6a` (outside this book)
- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:714fc56b8500c2c333264769cd29578d6debce56095ef0199ce1c5f153206bec`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e2`
  - Essential understanding (DE): Eine Triphenylmethanroute koppelt zweimal einen aktivierten Aromaten an ein Carbonylkohlenstoffzentrum und erzeugt den Farbstoff erst durch Oxidation der Leukoverbindung.
  - Essential understanding (EN): A triphenylmethane route attaches two activated arenes to a carbonyl carbon and produces the dye only after oxidizing the leuco compound.
  - Observable performance (DE): Stellt die Kondensationsschritte und ladungsbilanzierte Oxidation dar.
  - Observable performance (EN): Represents condensation steps and charge-balanced oxidation.

**Coverage expectations**

- required expectations: `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Aromatischer Aldehydrest / Aromatic aldehyde residue
- `v2`: Leukoverbindung, Farbstoffkation und Oxidationsbilanz / Leuco compound, dye cation and oxidation balance

**Application cases**

- `53db04a0-case-1`
  - Task demand (DE): Nur Papiermechanismen, keine Ausführung. Triarylmethan: Ph–CHO + 2 Ar–H, Ar–H=N,N-Dimethylanilin, Angriff jeweils para zum –N(CH₃)₂. Säurekatalyse liefert Ph–CH(Ar)₂; anschließende Oxidation liefert [Ph–C(Ar)₂]⁺.
1. Stelle für Ph–CHO die Carbonylprotonierung, zwei para-Angriffe von Ar–H mit Wasserabspaltung zwischen ihnen und die jeweilige Rearomatisierung dar; schreibe Kondensationsgleichung und Oxidationshalbreaktion.
  - Task demand (EN): Paper mechanisms only, no execution. Triarylmethane: Ph–CHO + 2 Ar–H, with Ar–H=N,N-dimethylaniline and each attack para to –N(CH₃)₂. Acid catalysis gives Ph–CH(Ar)₂; oxidation then gives [Ph–C(Ar)₂]⁺.
1. Show carbonyl protonation, two para attacks by Ar–H with water loss between them and each rearomatization; write the condensation equation and oxidation half-equation.
  - Expected performance (DE): 1. O-Protonierung ergibt Ph–CH=OH⁺. Ring-π→Carbonyl-C und C=O-π→O erzeugen den ersten Ring-σ-Komplex; Deprotonierung liefert Ph–CH(OH)–Ar. OH-Protonierung und C–O→O lassen H₂O abgehen: Ph–CH(Ar)⁺. Zweiter Ring-π-Angriff und Ring-H⁺-Abgabe liefern Ph–CH(Ar)₂. Gesamt: PhCHO+2 ArH→PhCH(Ar)₂+H₂O. Oxidation: PhCH(Ar)₂→[PhC(Ar)₂]⁺+H⁺+2e⁻ (Ladung 0=+1+1−2).
  - Expected performance (EN): 1. O protonation gives Ph–CH=OH⁺. Ring pi→carbonyl C and C=O pi→O produce the first ring sigma complex; deprotonation gives Ph–CH(OH)–Ar. OH protonation and C–O→O release H₂O, giving Ph–CH(Ar)⁺. A second ring pi attack and ring H⁺ loss give Ph–CH(Ar)₂. Overall: PhCHO+2 ArH→PhCH(Ar)₂+H₂O. Oxidation: PhCH(Ar)₂→[PhC(Ar)₂]⁺+H⁺+2e⁻, with 0=+1+1−2 charge.
  - Understanding focus (DE): Eine Triphenylmethanroute koppelt zweimal einen aktivierten Aromaten an ein Carbonylkohlenstoffzentrum und erzeugt den Farbstoff erst durch Oxidation der Leukoverbindung.
  - Understanding focus (EN): A triphenylmethane route attaches two activated arenes to a carbonyl carbon and produces the dye only after oxidizing the leuco compound.
- `53db04a0-case-2`
  - Task demand (DE): Papiermodell: Die Route verwendet p-CH₃–C₆H₄–CHO + 2 N,N-Dimethylanilin. Bezeichne p-CH₃–C₆H₄ als R und den para-gekoppelten Dimethylaminophenylrest als Ar. Gegenionen sind Zuschauer; keine Stoffe werden hergestellt.
1. Übertrage die säurekatalysierte Carbonylroute auf R–CHO: zeige beide Ringangriffe, Protonierungs- und Wasserabspaltungsschritte sowie die Oxidation von R–CH(Ar)₂; unterscheide Leukoverbindung und Farbstoffkation.
  - Task demand (EN): Paper model: The route uses p-CH₃–C₆H₄–CHO + 2 N,N-dimethylaniline. Write R for p-CH₃–C₆H₄ and Ar for the para-attached dimethylaminophenyl residue. Counterions are spectators; no substances are made.
1. Transfer the acid-catalyzed carbonyl route to R–CHO: show both ring attacks, protonation and water-loss steps and oxidation of R–CH(Ar)₂; distinguish the leuco compound from the dye cation.
  - Expected performance (DE): 1. R–CH=OH⁺ wird vom Ring-π-Paar angegriffen, C=O-π→O; nach Ringdeprotonierung entsteht R–CH(OH)–Ar. OH-Protonierung, H₂O-Abgabe und zweiter Ringangriff ergeben nach erneuter Ringdeprotonierung R–CH(Ar)₂. RCHO+2ArH→RCH(Ar)₂+H₂O. RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ ist ladungsbilanziert. Der sp³-Leukokohlenstoff unterbricht die ausgedehnte Kopplung; das sp²-Kation ermöglicht donorstabilisierte delokalisierte Formen.
  - Expected performance (EN): 1. Ring pi attacks R–CH=OH⁺ while C=O pi moves to O; ring deprotonation gives R–CH(OH)–Ar. OH protonation, water loss and second ring attack give R–CH(Ar)₂ after another ring deprotonation. RCHO+2ArH→RCH(Ar)₂+H₂O. RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ balances charge. The sp³ leuco carbon interrupts extended coupling; the sp² cation supports donor-stabilized delocalized contributors.
  - Understanding focus (DE): Eine Triphenylmethanroute koppelt zweimal einen aktivierten Aromaten an ein Carbonylkohlenstoffzentrum und erzeugt den Farbstoff erst durch Oxidation der Leukoverbindung.
  - Understanding focus (EN): A triphenylmethane route attaches two activated arenes to a carbonyl carbon and produces the dye only after oxidizing the leuco compound.
## Page 6: Entsorgung und Recycling von Batterien und Akkumulatoren bewerten

- Full learning-goal ID: `f9e6d689-6e59-59a4-9f21-8c2d44413244`
- Goal fingerprint: `sha256:47b1e60d5879e1c31e6408f3a1749ab12495408d8e4cbf8d8fe4973fa0edd4b0`
- Page fingerprint: `sha256:ede020273801aa342d74cd5f9799335e480f323b74564d6d93c2a5014dd99f76`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie

### Canonical description

Die lernende Person kann Entsorgung und Recycling von Batterien und Akkumulatoren an geeigneten Beispielen fachlich diskutieren und anhand der Umweltfolgen begründet bewerten.

### Visualization

/assets/goal-visualizations/chemie/f9e6d689-6e59-59a4-9f21-8c2d44413244/f9e6d689-6e59-59a4-9f21-8c2d44413244.png

- original digest: `sha256:4a596cd0ec9e62c3b8911cc1cf876e2c5ecba34e1b2ecbe596191a4080b3e514`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Entsorgung und Recycling von Batterien und Akkumulatoren bewerten — `c5394fb8-9411-5533-b2af-831c4c67b4be` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b6bc6ce16b91fbf66f69c7955dc5f0972218abd20bebf6a75d1f1f4e00f08ce6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Umweltfolgen von Entsorgung hängen von den enthaltenen Stoffen und davon ab, ob sie kontrolliert erfasst oder in die Umwelt freigesetzt werden. Nicht wiederaufladbare Batterien und Akkumulatoren gehören beide zum betrachteten Umfang; das Betriebsprinzip allein bestimmt nicht das Entsorgungsurteil.
  - Essential understanding (EN): Environmental consequences of disposal depend on contained substances and whether they are controlled or released into the environment. Both non-rechargeable batteries and accumulators are in scope; the operating principle alone does not determine a disposal judgment.
  - Observable performance (DE): Verknüpft in einem Fall zu einer Primärbatterie und einem Akkumulator die gegebenen Stoff- und Freisetzungsangaben mit konkreten Umweltfolgen und unterscheidet Daten von nicht belegten Verallgemeinerungen.
  - Observable performance (EN): Links supplied substance and release information to concrete environmental consequences for a primary battery and an accumulator, distinguishing data from unsupported generalizations.
- `e2`
  - Essential understanding (DE): Kontrollierte Sammlung kann Freisetzung vermeiden; Recycling kann Stoffe zurückgewinnen und neuen Rohstoffbedarf vermindern. Sammlung ist noch keine vollständige Rückgewinnung. Aufbereitung benötigt Ressourcen und Energie und kann Reststoffe hinterlassen.
  - Essential understanding (EN): Controlled collection can avoid releases; recycling can recover substances and reduce demand for new raw materials. Collection is not yet complete recovery. Treatment uses resources and energy and may leave residues.
  - Observable performance (DE): Erklärt anhand der Fallinformationen den Nutzen kontrollierter Erfassung und tatsächlicher Rückgewinnung und benennt zugleich verbleibende Aufbereitungsfolgen; erklärt keine unaufgeforderten industriellen Mechanismen.
  - Observable performance (EN): Explains benefits of controlled collection and actual recovery using the case information while identifying remaining treatment impacts; does not add unrequested industrial mechanisms.
- `e3`
  - Essential understanding (DE): Eine begründete Umweltbewertung verbindet Stofffolgen, Rückgewinnung und die angegebenen Randbedingungen. Unterschiedliche Batteriezusammensetzungen oder Behandlungswege können andere Abwägungen verlangen; ein einzelnes Merkmal beweist keine universelle Rangfolge.
  - Essential understanding (EN): A reasoned environmental assessment connects substance consequences, recovery and supplied conditions. Different battery compositions or treatment routes may require different judgments; one feature does not establish a universal ranking.
  - Observable performance (DE): Diskutiert begründete Handlungsoptionen für beide Spannungsquellen, verteidigt ein bedingtes Urteil gegen eine Fehlbehauptung und überträgt die Begründung auf eine geänderte Zusammensetzung oder Behandlungssituation.
  - Observable performance (EN): Discusses reasoned options for both electrochemical sources, defends a conditional judgment against a misconception and transfers the reasoning to a changed composition or treatment situation.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Primärbatterie und unterschiedliche Akkumulatorzusammensetzung / Primary battery and different accumulator composition
- `v2`: Freisetzungsfolge, kontrollierte Sammlung und Rückgewinnungsumfang / Release impacts, controlled collection and recovery extent
- `v3`: Energie-/Reststoffgrenzen und neue kritische Stofffolge / Energy/residue boundaries and a new critical substance impact

**Application cases**

- `f9e6d689-case-1`
  - Task demand (DE): 1. Diskutiere die Folgen von U und K für P UND Q und verknüpfe Stoffangaben mit Umweltfolgen. 2. Erkläre, was Erfassung und was tatsächliche Rückgewinnung leisten; benenne je einen Nutzen und eine verbleibende Folge der Aufbereitung. 3. Beurteile K gegenüber U unter diesen Angaben. Widerlege oder begrenze: „Bei Q werden viele Metalle zurückgewonnen, also ist Q-Recycling umweltneutral.“ Übertrage deine Begründung auf K*. Keine praktische Behandlung und keine Elektrodenreaktionen sind verlangt.
  - Task demand (EN): 1. Discuss U and K for BOTH P and Q, linking substance information to environmental consequences. 2. Explain what collection and actual recovery achieve; state one benefit and one remaining treatment impact. 3. Assess K against U under these data. Refute or limit: “Much of Q's metal is recovered, so Q recycling is environmentally neutral.” Transfer your reasoning to K*. No practical treatment or electrode reactions are required.
  - Expected performance (DE): U ermöglicht bei P Elektrolytfreisetzung und bei Q zusätzlich Freisetzung umweltkritischer Bleiverbindungen; die gleiche Sammelbezeichnung bedeutet keine gleiche Zusammensetzung. K vermindert diese unkontrollierte Freisetzung. Erfassung hält Abfallstoffe kontrolliert zurück; erst Aufbereitung gewinnt Metallrohstoff zurück. 60 % beziehungsweise 90 % Rückgewinnung können neuen Metallbedarf vermindern, bedeuten aber weder vollständige Stoffrückführung noch Nullfolgen. Energiebedarf und kontrolliert zu behandelnde Reststoffe verbleiben. K ist unter den gegebenen Freisetzungs- und Rückgewinnungsbedingungen gegenüber U begründet vorzuziehen. K* kann den metallischen Reststrom für Q weiter vermindern; positiver Energiebedarf und Folgen der Elektrolyt-/Reststoffbehandlung verschwinden dadurch nicht. Weder K noch K* ist damit pauschal umweltneutral; ein Vergleich aller realen Anlagen ist nicht belegt.
  - Expected performance (EN): U permits electrolyte releases from P and additionally releases of environmentally concerning lead compounds from Q; one collection label does not imply identical composition. K reduces these uncontrolled releases. Collection retains wastes under control; only treatment recovers metal raw material. Recovery of 60% or 90% can reduce new metal demand but means neither complete material return nor zero impacts. Energy use and residues requiring controlled treatment remain. Under the supplied release/recovery conditions, K is a reasoned preference over U. K* may reduce Q's metallic residue further, but positive energy demand and electrolyte/residue-treatment impacts do not disappear. Neither K nor K* is therefore automatically environmentally neutral; a ranking of all real plants is unsupported.
  - Understanding focus (DE): Erklärt für P und Q unterschiedliche enthaltene Stoffe und daraus die in U möglichen Freisetzungsfolgen; K begrenzt diese. / Trennt Erfassung von Rückgewinnung; erklärt Rohstoffnutzen aus 60/90 % und verbleibende Energie-/Reststofffolgen. / Begründet K gegenüber U und überträgt auf K*: vollständige Metallrückgewinnung entfernt nicht Energie-/Elektrolytfolgen.
  - Understanding focus (EN): Explains different contents and resulting possible releases under U for P and Q; K limits them. / Distinguishes collection from recovery; explains raw-material benefits from 60/90% and remaining energy/residue impacts. / Justifies K over U and transfers to K*: full metal recovery does not remove energy/electrolyte impacts.
- `f9e6d689-case-2`
  - Task demand (DE): 1. Erläutere für P und R den Zielkonflikt zwischen Rückgewinnung und Energieaufwand; erkläre, weshalb kontrollierte Erfassung dennoch wichtig bleibt. 2. Diskutiere zwei vertretbare Gewichtungen und gib ein bedingtes Urteil, ohne aus einer Kennzahl eine Gesamtumweltzahl zu machen. 3. Prüfe dein Urteil anhand der neuen R-Information und begründe, ob du es bestätigst oder anpasst. Erkläre, weshalb diese Information nicht automatisch auch P oder alle Akkumulatortypen betrifft. Welche zusätzliche Angabe wäre für ein abschließendes Gesamturteil wichtig?
  - Task demand (EN): 1. Explain the recovery/energy trade-off for P and R and why controlled collection still matters. 2. Discuss two defensible weightings and give a conditional judgment without turning one indicator into an overall environmental score. 3. Review your judgment using the new R information and justify whether you confirm or adjust it. Explain why this information does not automatically apply to P or all accumulator types. What further information would matter for a final overall judgment?
  - Expected performance (DE): Bei beiden Arten kann Erfassung kritische Freisetzungen begrenzen. A gewinnt jeweils mehr Metall zurück, benötigt aber innerhalb der angegebenen Grenze mehr Energie als B. Wer Metallrückführung besonders gewichtet, kann A vorläufig begründet wählen; wer diesen Aufbereitungsenergiebedarf gewichtet, kann B wählen. Keine Gewichtung beweist eine Gesamtumweltrangfolge, weil unter anderem ersetzte Primärrohstoffbereitstellung und weitere Folgen fehlen. Die neue R-Information verändert die stoffliche Umweltfolge: Für R spricht nun die kontrollierte Rückhaltung des kritischen Restes für B, auch bei geringerer Metallrückgewinnung. Für P ist kein entsprechender Befund gegeben; das R-Urteil darf nicht pauschal übertragen werden. Angaben zur Art/Menge und Umweltrelevanz des freigesetzten Restes und zu den sonstigen Folgen würden die Abwägung verbessern. Konstruktions- oder Ladegleichungen sind dafür nicht erforderlich.
  - Expected performance (EN): For both types, collection can limit critical releases. A recovers more metal but uses more energy than B within the stated boundary. Prioritizing metal return can justify a provisional A choice; prioritizing this treatment energy can justify B. Neither weighting proves an overall environmental ranking because displaced primary raw-material supply and other impacts are missing. The new R information changes the material-related environmental consequence: for R, B's control of the critical residue now supports B despite lower metal recovery. No such observation is given for P, so R's judgment must not be generalized. Information about the residue's type/amount and environmental relevance and other impacts would improve the judgment. Construction or charging equations are not required for this reasoning.
  - Understanding focus (DE): Unterscheidet P von Nickel-Metallhydrid-R und erklärt die geänderte kritische Reststofffreisetzung nur für R. / Erklärt mehr Metallrückführung bei A, mehr Energie bei A und Nutzen kontrollierter Erfassung ohne Nullfolgenbehauptung. / Diskutiert zwei Gewichtungen, gibt ein bedingtes Urteil und revidiert R angesichts des Freisetzungsbefunds; nennt relevante fehlende Angaben.
  - Understanding focus (EN): Distinguishes P from nickel-metal-hydride R and explains the changed critical-residue release only for R. / Explains greater metal return and energy use for A and benefits of controlled collection without claiming zero impacts. / Discusses two weightings, gives a conditional judgment and revises R for the release observation; identifies relevant missing information.
## Page 7: Gewinnung seltener Metalle für Spannungsquellen diskutieren

- Full learning-goal ID: `f54b2c33-11f1-571f-aa1c-cf969cc141c4`
- Goal fingerprint: `sha256:72c9883a55c92b850b91603847495ca49c49a082420075a306870e3ec602b332`
- Page fingerprint: `sha256:37286867cc70c05dadc02c05d751e6973436184e304325268572543ecead28b8`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie

### Canonical description

Die lernende Person kann die Rohstoffgewinnung seltener Metalle für elektrochemische Spannungsquellen an geeigneten Beispielen fachlich diskutieren.

### Visualization

/assets/goal-visualizations/chemie/f54b2c33-11f1-571f-aa1c-cf969cc141c4/f54b2c33-11f1-571f-aa1c-cf969cc141c4.png

- original digest: `sha256:38706e48f8c636d57f4981684e6c5189937f74ec87543dcefd40c01e1f789727`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Gewinnung seltener Metalle für Spannungsquellen diskutieren — `4238e88b-7d6c-5eef-b94f-d6d87659649e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:60cb72731d7b3da79da7b3166d97ee907a8abf8b281ad7b012284b90c752eb82`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Die ausgewählten seltenen Metallrohstoffe werden für einen angegebenen Bestandteil elektrochemischer Spannungsquellen gewonnen. Seltene Metalle sind kein Synonym für die Elementgruppe der Seltenerdmetalle; eine einzelne Materialangabe klassifiziert nicht alle Batteriemetalle.
  - Essential understanding (EN): The selected rare-metal raw materials are extracted for a specified component of electrochemical sources. Rare metals are not synonymous with the rare-earth element group; one material statement does not classify all battery metals.
  - Observable performance (DE): Stellt den gegebenen Rohstoffbedarf und den Einsatz des ausgewählten Metalls in der Spannungsquelle in einen verständlichen Zusammenhang und begrenzt Aussagen zur Seltenheit auf die bereitgestellten Informationen.
  - Observable performance (EN): Connects the supplied raw-material demand with the selected metal's use in an electrochemical source and limits rarity claims to the provided information.
- `e2`
  - Essential understanding (DE): Erzgehalt, Gewinnungskontext, Begleitstoffe, Wasserführung und Reststoffbehandlung beeinflussen die Folgen der Rohstoffgewinnung. Bei gleichem Produktertrag kann ein geringerer Erzgehalt mehr Materialbewegung erfordern; eine bessere Wasserführung beseitigt nicht automatisch alle übrigen Folgen.
  - Essential understanding (EN): Ore grade, extraction context, associated substances, water management and residue treatment affect raw-material extraction impacts. At equal product yield, lower ore grade may require more material movement; better water management does not automatically remove other impacts.
  - Observable performance (DE): Leitet aus den gegebenen stofflichen und räumlichen Bedingungen nachvollziehbare Folgen der Gewinnungsoptionen ab, einschließlich einer geänderten Bedingung, ohne einen nicht geforderten Abbau- oder metallurgischen Reaktionsmechanismus zu erfinden.
  - Observable performance (EN): Derives defensible consequences of extraction options from supplied material and site conditions, including a changed condition, without inventing an unrequested mining or metallurgical reaction mechanism.
- `e3`
  - Essential understanding (DE): Fachliche Diskussion verbindet Rohstoffbereitstellung und Folgen mit Argumenten, Gegenargumenten und passenden Einschränkungen. Daten mit verschiedenen Bilanzgrenzen oder gemeinsamen Haupt- und Nebenprodukten erlauben keine unbedingte Gesamtumweltrangfolge.
  - Essential understanding (EN): Scientific discussion links raw-material supply and impacts through arguments, counterarguments and suitable limits. Data with different boundaries or shared main and by-products do not establish an unconditional overall environmental ranking.
  - Observable performance (DE): Diskutiert die Auswahl einer Gewinnungsoption mit konkreten Fallargumenten, benennt eine entscheidende Daten- oder Randbedingungsgrenze und formuliert ein bedingtes Fazit statt einer pauschalen Metall- oder Herkunftsrangfolge.
  - Observable performance (EN): Discusses an extraction choice using concrete case arguments, identifies a decisive data or boundary limit and gives a conditional conclusion rather than a blanket ranking of metals or origins.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Ausgewähltes Metall, Quellenbestandteil und Haupt-/Nebenproduktkontext / Selected metal, source constituent and main/by-product context
- `v2`: Erzgehalt, lösliche Begleitstoffe und Wasser-/Reststoffführung / Ore grade, soluble associated substances and water/residue management
- `v3`: Bilanzgrenze, gemeinsame Gewinnung und neue Freisetzung / Boundary, joint extraction and a new release

**Application cases**

- `f54b2c33-case-1`
  - Task demand (DE): 1. Erkläre den Zusammenhang zwischen Bedarf in der Spannungsquelle und Gewinnung von M. Was lässt sich zur Einordnung als Seltenerdmetall sagen? 2. Diskutiere A und B anhand gleichen Produktertrags, Erzgehalts und stofflicher Wasser-/Reststofffolgen. Eine qualitative Begründung genügt; keine Reaktionsgleichung oder Anlagenbeschreibung wird verlangt. 3. Übertrage die Diskussion auf das verbesserte B. Widerlege: „Nach Wasserbehandlung hat B genau dieselben Gewinnungsfolgen wie A.“ Formuliere ein bedingtes Fazit und eine wichtige verbleibende Informationsgrenze.
  - Task demand (EN): 1. Explain the connection between demand in the electrochemical source and extraction of M. What can be said about classification as a rare-earth metal? 2. Discuss A and B using equal product output, ore grade and material-related water/residue consequences. Qualitative reasoning is sufficient; no reaction equation or plant description is required. 3. Transfer the discussion to improved B. Refute: “After water treatment B has exactly the same extraction impacts as A.” Give a conditional conclusion and an important remaining information limit.
  - Expected performance (DE): M wird als Rohstoff benötigt, um den angegebenen Elektrodenbestandteil bereitzustellen. Selten bedeutet nicht automatisch Seltenerdmetall; die Elementgruppe ist nicht angegeben. Bei gleichem Produktertrag und Ertrag aus dem Erz muss B wegen geringeren M-Anteils mehr Erzmaterial bewegen/verarbeiten; daraus können mehr Reststoffmengen entstehen. A begrenzt die vorgegebenen stofflichen Wasser-/Reststofffolgen, während B zunächst eine belastende Freisetzung zeigt. Damit sprechen diese Fallaspekte für A, ohne eine vollständige Umweltbilanz zu beweisen. Beim verbesserten B fällt der angegebene Unterschied der Wasser-/Reststoffkontrolle weg. Der geringere Erzgehalt und damit der höhere Materialbedarf verschwinden nicht; auch Energie und Transport sind nicht verglichen. Deshalb ist die Gleichheit aller Folgen nicht begründet. Ein Fazit muss an diese Bedingungen und fehlende Daten gebunden sein, statt alle Herkunftsorte oder seltenen Metalle zu ranken.
  - Expected performance (EN): M is required as raw material to supply the specified electrode constituent. Rare does not automatically mean rare-earth metal; the element group is not specified. At equal usable output and ore extraction yield, B must move/process more ore because its M fraction is lower; this can produce larger residue amounts. A limits the supplied material-related water/residue impacts, while initial B shows a harmful release. These aspects favor A in this case without proving a full environmental balance. Improved B removes the stated difference in water/residue control. Lower ore grade and greater material requirements remain, while energy and transport are still unassessed. Equality of all impacts is therefore unsupported. A conclusion must be bound to these conditions and missing data rather than ranking every origin or rare metal.
  - Understanding focus (DE): Verbindet Gewinnung von M mit dem Elektrodenrohstoffbedarf und unterscheidet seltenes Metall von unbelegter Seltenerdklassifikation. / Erklärt qualitativ den höheren Erzmaterialbedarf von B und die unterschiedlichen M-haltigen Wasser-/Reststofffolgen. / Überträgt auf verbessertem B: Wasserfolge geändert, Erzbedarf bleibt; Fazit begrenzt durch fehlende Energie-/Transportangaben.
  - Understanding focus (EN): Connects M extraction with electrode raw-material demand and separates rare-metal status from unsupported rare-earth classification. / Explains qualitatively B's greater ore-material demand and different M-bearing water/residue impacts. / Transfers to improved B: water impacts change, ore requirement remains; conclusion is limited by missing energy/transport information.
- `f54b2c33-case-2`
  - Task demand (DE): 1. Ordne die Gewinnung von N dem gegebenen Spannungsquellenbedarf zu; erkläre den Unterschied zwischen einem Nebenproduktkontext und einer Behauptung „ohne Gewinnungsfolgen“. 2. Diskutiere die Kennzahlen 10 und 40. Darf daraus „A benötigt insgesamt viermal weniger Energie“ folgen? Benenne, welche Vergleichsangaben fehlen. 3. Diskutiere A nach der Änderung: Welche stoffliche und räumliche Folge kommt hinzu, und warum trägt das alte Werbeurteil nicht mehr? Gib ein begründetes, begrenztes Fazit zu A/B; keine vollständige Ökobilanz oder Gewinnungsreaktionen sind verlangt.
  - Task demand (EN): 1. Relate N extraction to the supplied electrochemical-source demand and distinguish a by-product context from “no extraction impacts.” 2. Discuss figures 10 and 40. Do they imply “A uses four times less energy overall”? Identify missing comparison information. 3. Discuss changed A: which material-related and site consequence is added, and why is the old advertising judgment unsupported? Give a reasoned, limited A/B conclusion; no full life-cycle assessment or extraction reactions are required.
  - Expected performance (DE): N wird für den angegebenen Quellenbestandteil benötigt. Als Nebenprodukt wird es im gemeinsamen Gewinnungskontext bereitgestellt; das beseitigt weder Gewinnung noch alle Folgen und begründet keine Seltenerdklassifikation. 10 und 40 vergleichen verschiedene Grenzen: N-Abtrennung im vorhandenen Werk gegenüber Abbau einschließlich Behandlung/Aufbereitung. Gleiches nutzbares N-Produkt genügt daher nicht für einen vierfachen Gesamtenergievorteil. Für A fehlen vergleichbar abgegrenzte Energie-/Stoffdaten der gemeinsamen Gewinnung und eine begründete Zurechnung zu H/N. Nach der Änderung kommen zusätzlicher Abbau und die gegebene Freisetzung löslicher N-Stoffe hinzu; beide müssen fachlich diskutiert werden. Die alte Zahl 10 deckt diese Änderungen nicht ab. A kann in einzelnen Teilaspekten günstig erscheinen, aber eine vollständige Überlegenheit gegenüber B ist mit den Angaben nicht belegt. B enthält Wasserbehandlung im angegebenen Umfang; auch daraus folgt ohne vollständige Vergleichsdaten keine pauschale Gesamtumweltrangfolge.
  - Expected performance (EN): N is needed for the specified electrochemical-source constituent. By-product production provides it through a joint extraction context; this removes neither extraction nor all impacts and establishes no rare-earth classification. Figures 10 and 40 use different boundaries: N separation in an existing plant versus mining including treatment/processing. Equal usable N product is insufficient to prove a fourfold overall energy advantage. A needs comparable energy/material data for joint extraction and a defensible allocation to H/N. Changed A adds mining and the supplied release of soluble N-bearing substances, both of which need discussion. The old figure 10 does not cover those changes. A may appear favorable in individual aspects, but complete superiority over B is unsupported. B includes water treatment within its boundary; this also gives no blanket overall environmental ranking without comparable data.
  - Understanding focus (DE): Verbindet N mit dem anderen Quellenbestandteil und erklärt, weshalb Nebenproduktgewinnung keine folgenlose Bereitstellung bedeutet. / Erklärt unterschiedliche Grenzen von 10/40 und die neue Abbau-/wasserlösliche N-Freisetzungsfolge bei A. / Diskutiert fehlende gemeinsame Vergleichsdaten/Zurechnung und begrenzt A/B-Fazit; altes Werbeurteil ist nach der Änderung nicht gedeckt.
  - Understanding focus (EN): Connects N with the different source constituent and explains why by-product extraction is not impact-free supply. / Explains the different 10/40 boundaries and new mining/soluble N-release impacts for A. / Discusses missing comparable data/allocation and limits the A/B conclusion; the old advertising judgment is unsupported after change.
## Page 8: Metallrecycling für Konsum- und Entsorgungsentscheidungen nutzen

- Full learning-goal ID: `b7ae47da-6afa-5651-977a-3139af7d6eab`
- Goal fingerprint: `sha256:06d14ad626d5f1c25a50d3c237e0aafb9dd24efd3f75a0c9bb2411112b7c9132`
- Page fingerprint: `sha256:7b3f84476a1129e0fc2b4650b762f9fd8349cec4af122e2e7a9032a10a818c39`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie

### Canonical description

Die lernende Person kann die Bedeutung des Metallrecyclings für Ressourcenschonung und Energieeinsparung beschreiben und auf dieser Grundlage das eigene Konsum- und Entsorgungsverhalten begründet bewerten.

### Visualization

/assets/goal-visualizations/chemie/b7ae47da-6afa-5651-977a-3139af7d6eab/b7ae47da-6afa-5651-977a-3139af7d6eab.png

- original digest: `sha256:a9d04554c78ec01900a15363f0ca70f33ba17ceef1a6b4dfac35396e24fae306`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Metallrecycling für Konsum- und Entsorgungsentscheidungen nutzen — `ee494d08-9514-54f2-ac5e-eebc20ca8725` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c4d034d5be0e064e13873d6a0a0ba72f0540bc21fc49bbcda9ab6d1de04d3531`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Metallrecycling führt bereits genutztes Metall als nutzbaren Rohstoff zurück und kann dadurch die Gewinnung neuen Metallrohstoffs vermindern. Verluste und notwendige Ergänzungen können verbleiben; Rückgewinnung macht zusätzlichen Konsum nicht automatisch ressourcenneutral.
  - Essential understanding (EN): Metal recycling returns previously used metal as a usable raw material and can reduce extraction of new metal resources. Losses and required new-material additions may remain; recovery does not automatically make extra consumption resource-neutral.
  - Observable performance (DE): Beschreibt anhand einer vorgegebenen Vergleichsbasis, wie Rückgewinnung den Bedarf an neu gewonnenem Metall beeinflusst, und erläutert die Bedeutung für eine eigene oder selbst gewählte hypothetische Konsumentscheidung.
  - Observable performance (EN): Describes how recovery changes demand for newly extracted metal on a supplied comparison basis and explains the significance for a personal or self-chosen hypothetical consumption decision.
- `e2`
  - Essential understanding (DE): Die erneute Bereitstellung von Metall kann gegenüber der Gewinnung aus Erzen Energie einsparen. Eine belastbare Vergleichsaussage benötigt dieselbe nutzbare Metallmenge und eine benannte Grenze; Recycling benötigt selbst Energie und ein anderer Weg kann den Energievergleich ändern.
  - Essential understanding (EN): Supplying metal again can save energy compared with extraction from ores. A defensible comparison needs the same usable metal quantity and a stated boundary; recycling itself uses energy and another route can change the energy comparison.
  - Observable performance (DE): Erklärt aus gegebenen Daten die Bedeutung möglicher Energieeinsparung, trennt Einsparung von Nullverbrauch und begrenzt das Urteil bei einer geänderten Vergleichssituation. Eine quantitative Ökobilanz oder Beschreibung von Recyclingmaschinen ist nicht erforderlich.
  - Observable performance (EN): Explains the significance of potential energy saving from supplied data, distinguishes saving from zero use and limits the judgment under a changed comparison situation. Quantitative life-cycle assessment or descriptions of recycling machinery are not required.
- `e3`
  - Essential understanding (DE): Die Bewertung von Konsum und Entsorgung muss auf dem Ressourcen- und Energiebezug beruhen. Metallrückgabe und Vermeidung unnötiger Neubeschaffung können zusammenwirken; eine bloße Recycling-Parole ersetzt diese Begründung nicht.
  - Essential understanding (EN): Assessment of consumption and disposal must be based on resource and energy reasoning. Returning metal and avoiding unnecessary new purchases may work together; a recycling slogan does not replace this justification.
  - Observable performance (DE): Wählt und begründet eine hypothetische Konsum- und Entsorgungsoption mit beiden fachlichen Bezügen und überträgt die Entscheidung auf neue Angaben, ohne private Haushaltsdaten anzugeben oder eine universelle Rangfolge zu behaupten.
  - Observable performance (EN): Chooses and justifies a hypothetical consumption and disposal option using both scientific links and transfers the decision to new information without disclosing private household data or claiming a universal ranking.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Metall X/Y und nutzbare gemeinsame Vergleichsmenge / Metal X/Y and a common usable comparison amount
- `v2`: Rohstoffergänzung, Rückgewinnung und geänderter Energieaufwand / New-material addition, recovery and changed energy effort
- `v3`: Notwendiger Konsum, zusätzliche Nachfrage und Entsorgungswahl / Necessary consumption, extra demand and disposal choice

**Application cases**

- `b7ae47da-case-1`
  - Task demand (DE): 1. Beschreibe die Bedeutung des Recyclingwegs für Ressourcenschonung und Energieeinsparung gegenüber dem Primärweg. Vergleiche qualitativ; eine Rechnung oder Anlagenbeschreibung ist nicht nötig. 2. Wähle eine eigene, aber frei erfundene Konsum-/Entsorgungsentscheidung C oder D und begründe beide Teile mit den Daten. 3. Übertrage deine Begründung auf die zusätzliche Anschaffung: Widerlege oder begrenze die Behauptung. Keine Angaben zu deinem wirklichen Haushalt sind verlangt.
  - Task demand (EN): 1. Describe the recycling route's significance for resource conservation and energy saving compared with the primary route. A qualitative comparison suffices; no calculation or plant description is needed. 2. Choose C or D for a personal but freely invented consumption/disposal situation and justify both parts from the data. 3. Transfer your reasoning to an additional purchase: refute or limit the claim. No information about your actual household is requested.
  - Expected performance (DE): Rückgewonnenes X ersetzt im Modell einen Teil neuen Rohstoffs: statt 1 kg werden 0,2 kg neu benötigt. Auf derselben nutzbaren Mengenbasis ist 35 kleiner als 100; erneute Metallbereitstellung spart hier Energie, benötigt aber weiterhin Energie. Nicht vollständig nutzbare Rückgewinnung und Ergänzung bleiben. C vermeidet eine unnötige neue Metallnachfrage während der Nutzungszeit und hält am Ende den Stoff für Rückgewinnung verfügbar. D schafft zusätzliche Nachfrage und verliert laut Material die spätere Rückgewinnungsmöglichkeit. Für die frei gewählte Situation ist C mit beiden Bezügen begründet. Ein zusätzliches Produkt benötigt trotz Recycling mindestens die angegebenen Ergänzungsrohstoffe und Energie für Bereitstellung; Recycling macht überflüssige Käufe nicht ressourcen- oder energieneutral. Diese Schlussfolgerung erklärt die Bedeutung des gegebenen Metallrecyclings, nicht jede reale Anlage oder jedes Produkt.
  - Expected performance (EN): Recovered X replaces part of the new raw material in this model: only 0.2 kg rather than 1 kg is newly required. On the same usable-quantity basis, 35 is lower than 100; supplying metal again saves energy here but still uses energy. Incomplete useful recovery and new-material additions remain. C avoids unnecessary new metal demand during use and keeps the material available for recovery at end of use. D creates extra demand and loses the later recovery opportunity according to the material. C is justified through both links for the freely chosen situation. An extra product still requires the stated new-material additions and supply energy; recycling does not make unnecessary purchases resource- or energy-neutral. This explains the significance of the supplied metal-recycling case, not every actual plant or product.
  - Understanding focus (DE): Erklärt Ersatz neuen Metallrohstoffs durch 0,8 kg Rückgewinnung sowie verbleibende 0,2 kg Ergänzung. / Verbindet 35 gegenüber 100 mit gleicher nutzbarer Menge und positiv verbleibendem Energieverbrauch. / Begründet C für Konsum UND Entsorgung mit Ressourcen/Energie und widerlegt die Neutralitätsbehauptung zur Zusatzanschaffung.
  - Understanding focus (EN): Explains replacement of new metal raw material by 0.8 kg recovery and remaining 0.2 kg addition. / Links 35 versus 100 to the same usable quantity and remaining positive energy use. / Justifies C for BOTH consumption and disposal through resources/energy and refutes neutrality of an extra purchase.
- `b7ae47da-case-2`
  - Task demand (DE): 1. Beschreibe für R1 die Bedeutung des Metallrecyclings für Ressourcenschonung und Energieeinsparung. 2. Übertrage auf R2: Was bleibt gleich, was ändert sich gegenüber P? Darf „Recycling spart immer Energie“ gelten? 3. Begründe für deine frei erfundene Entscheidung sowohl den Konsumteil (benötigter Ersatz oder zusätzliche Anschaffung) als auch den Entsorgungsteil (Erfassung oder gemischter Reststrom), zunächst mit R1 und dann mit R2. Formuliere eine begrenzte Entscheidung; eine Ökobilanz oder Maschinenbeschreibung ist nicht gefordert.
  - Task demand (EN): 1. Describe R1 metal recycling's significance for conserving resources and saving energy. 2. Transfer to R2: what stays the same and what changes compared with P? Is “recycling always saves energy” justified? 3. For your freely invented decision, justify both consumption (needed replacement or extra purchase) and disposal (collection or mixed residue), initially for R1 and then R2. Give a limited decision; no life-cycle calculation or machinery description is required.
  - Expected performance (DE): R1 liefert 0,8 kg aus vorher genutztem Metall zurück und benötigt nur 0,2 kg neuen Rohstoff statt 1 kg bei P. Auf gleicher Nutzbasis spart Index 30 gegenüber 55 Energie, ohne Energieverbrauch auf null zu setzen. R2 hat denselben Ressourcenschonungsbezug, spart innerhalb dieser Grenze aber keine Energie gegenüber P: 60 liegt über 55. Der zusätzliche Aufwand kann den ursprünglichen Energievorteil ändern; ein universelles „immer“ ist widerlegt. Für die hypothetische Entscheidung ist der benötigte Ersatz anders zu beurteilen als ein überflüssiger Zusatzkauf. Verzicht auf den Zusatzkauf vermeidet weitere Metallnachfrage. Erfassung eröffnet in beiden Recyclingvarianten Rückgewinnung; im Reststrom geht sie laut Daten verloren. Mit R1 sprechen Ressourcen und Energie gemeinsam für die gegebene Rückführung. Mit R2 muss der Ressourcennutzen gegen den höheren angegebenen Energieaufwand abgewogen werden; Sammlung bleibt keine Behauptung eines Gesamtenergievorteils. Weitere Umweltfolgen sind nicht angegeben, deshalb ist keine universelle Gesamtumweltrangfolge belegt.
  - Expected performance (EN): R1 returns 0.8 kg of previously used metal and requires only 0.2 kg new raw material rather than P's 1 kg. On the same usable basis, index 30 saves energy against 55 without making energy use zero. R2 has the same resource-conservation link but saves no energy against P within this boundary: 60 exceeds 55. Extra effort can change the original energy advantage, disproving a universal “always.” For the hypothetical choice, a needed replacement differs from an unnecessary extra purchase. Avoiding the extra purchase prevents further metal demand. Collection permits recovery for both recycling variants; the residue stream loses it according to the data. With R1, resource and energy links jointly favor the supplied return route. With R2, resource benefit must be weighed against the higher stated energy effort; collection does not establish an overall energy advantage. Other impacts are unspecified, so no universal overall environmental ranking is proven.
  - Understanding focus (DE): Erklärt für R1/R2 gleichermaßen Rückgewinnung und geringeren neuen Rohstoffbedarf; Zusatzkauf erzeugt weitere Nachfrage. / Begrenzt R1-Energieeinsparung auf gleiche Nutzbasis und erklärt, weshalb R2 gegenüber P keine Einsparung zeigt. / Begründet Konsum UND Entsorgung für beide Kontexte und benennt den R2-Ressourcen-/Energiekonflikt sowie die Urteilsgrenze.
  - Understanding focus (EN): Explains recovery and lower new raw-material demand for both R1/R2; an extra purchase creates further demand. / Bounds R1 energy saving to the same usable basis and explains why R2 shows no saving against P. / Justifies BOTH consumption and disposal for both contexts and identifies the R2 resource/energy trade-off and conclusion limit.
