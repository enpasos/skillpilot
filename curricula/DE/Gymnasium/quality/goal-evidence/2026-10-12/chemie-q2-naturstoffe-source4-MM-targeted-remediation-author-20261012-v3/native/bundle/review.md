# AI review input: Chemie – gezieltes Prüfmaterial

- Book ID: `chemie-source4-MM-targeted6-v3`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:3e2da5482f16b9ca9e9432c70c6ae4c1919b8bac34cc7141655f54866d826858`
- Selected goals: 6

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Aminosäuren stereochemisch darstellen

- Full learning-goal ID: `d8eeed29-d1b7-5a48-94b5-343629f8e867`
- Goal fingerprint: `sha256:4722243fbf8738b81d2a00c969079585b413c3f3eed450734fe22b246082e662`
- Page fingerprint: `sha256:3096015b87cfdf1d71c0c7e39433f4e71d1759cbb93bd715a1c23c85bf44ebee`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe > Aminosäuren charakterisieren

### Canonical description

Die lernende Person kann an geeigneten Aminosäuren Chiralität und Enantiomerie erklären, aus hinreichend bestimmten systematischen Benennungen Fischer-Projektionsformeln ableiten und darin D-/L-Konfigurationen anhand der Projektionskonvention unterscheiden.

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
- Konfiguration und Konformation unterscheiden — `85342c52-9722-54b0-8fbb-513d9d648363` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Naturstoffe — `31148286-b8db-57a7-8da2-2e0479240a2c` (outside this book)
- Proteinshake und Denaturierung — `8872d828-a025-5e45-af74-3d84caedfb73` (outside this book)
- Biokunststoff aus Milchsäure — `e6cb2efa-0fd5-518d-9df2-c75aa71fa4c6` (outside this book)
- Optische Aktivität und Polarimetrie auswerten — `f4d5a02d-711b-5a6b-a41d-971359c1f64d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7e082a37884e9c127c79fd90673953f6c8d575ea183e314688620a7060070fa3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `systematic-name-to-fischer`
  - Essential understanding (DE): Systematischer Name und absolute Konfiguration bestimmen die Konstruktion; D/L folgt erst aus der geprüften Fischer-Konvention.
  - Essential understanding (EN): The systematic name and absolute configuration determine construction; D/L follows from the checked Fischer convention.
  - Observable performance (DE): Drei C-Atome; Carboxyl-C ist C1, Aminogruppe an C2: HOOC–CH(NH2)–CH3. C2 trägt vier verschiedene Gruppen. CIP: NH2 > COOH > CH3 > H. Bei COOH oben und CH3 unten stehen für (2S) NH2 links und H rechts: L-Konfiguration. Spiegelbild: NH2 rechts, H links, (2R), D. Die horizontalen Bindungen zeigen nach vorn; bei vorn liegendem H wird der abgelesene Drehsinn invertiert. Ohne Stereodeskriptor ist nur die Konnektivität gegeben; beide Enantiomere sind möglich, nicht automatisch ein Racemat.
  - Observable performance (EN): There are three carbon atoms; carboxyl carbon is C1 and amino group is at C2: HOOC–CH(NH2)–CH3. C2 has four different substituents. CIP: NH2 > COOH > CH3 > H. With COOH top and CH3 bottom, (2S) places NH2 left and H right: L. Its mirror image places NH2 right and H left: (2R), D. Horizontal bonds point towards the viewer, so the read rotation is inverted when H points forward. A name without a stereodescriptor only fixes connectivity; either enantiomer is possible and a racemate is not implied.
- `sulfur-priority-transfer`
  - Essential understanding (DE): Neue Seitenkette erzwingt eine echte Neukonstruktion und trennt absolute von relativer Konfigurationsbenennung.
  - Essential understanding (EN): A new side chain forces genuine reconstruction and distinguishes absolute from relative configurational naming.
  - Observable performance (DE): HOOC–CH(NH2)–CH2–SH. CIP am C2: NH2 zuerst; CH2SH hat an seinem C die Nachbarn S,H,H und rangiert vor dem Carboxyl-C mit O,O,O; H zuletzt. Somit NH2 > CH2SH > COOH > H. Für (2R) bei dieser Fischer-Anordnung steht NH2 links, H rechts: L, obwohl R. Das Enantiomer hat NH2 rechts: D und (2S). Seitenketten ändern CIP, nicht die D/L-Projektionskonvention. Es geht um Konfiguration, nicht Drehvorzeichen oder bloße Bewegung des Bildes.
  - Observable performance (EN): HOOC–CH(NH2)–CH2–SH. At C2, NH2 is first; the CH2SH carbon has S,H,H neighbours and outranks the carboxyl carbon with O,O,O; H is last. Thus NH2 > CH2SH > COOH > H. For (2R) in this Fischer arrangement, NH2 lies left and H right: L despite R. The mirror has NH2 right: D and (2S). Side chains change CIP priorities, not the D/L projection convention. This concerns configuration, not rotation sign or simply moving the drawing.

**Coverage expectations**

- required expectations: `systematic-name-to-fischer`, `sulfur-priority-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `actual-operator-transfer`: Die vollständig ausgearbeiteten Fälle wechseln die konkret genannten Struktur-, Phasen-, Proben-, Mess- oder Modellbedingungen. Methodenspezifische Quellenpflichten sind keine beliebigen Alternativen. Durchführungsaufgaben erfordern reale Eigenarbeit; synthetische Muster erfüllen sie nicht. / Complete worked cases vary the specified structure, phase, sample, measurement or model conditions. Source-specific method duties are not interchangeable alternatives. Execution requires actual own work; synthetic fixtures do not satisfy it.

**Application cases**

- `systematic-name-to-fischer`
  - Task demand (DE): Konstruiere allein aus dem Namen (2S)-2-Aminopropansäure eine vollständige Fischer-Projektion mit COOH oben und dem Kohlenwasserstoffrest unten. Leite zuerst Konnektivität und CIP-Reihenfolge ab, bestimme dann D/L. Zeichne das Enantiomer. Erkläre, warum der Name 2-Aminopropansäure ohne Stereodeskriptor keine eindeutige Fischer-Konfiguration festlegt.
  - Task demand (EN): Construct a complete Fischer projection solely from (2S)-2-aminopropanoic acid, with COOH at the top and the hydrocarbon residue below. First derive connectivity and CIP priorities, then determine D/L. Draw its enantiomer. Explain why 2-aminopropanoic acid without a stereodescriptor does not specify a unique Fischer configuration.
  - Expected performance (DE): Drei C-Atome; Carboxyl-C ist C1, Aminogruppe an C2: HOOC–CH(NH2)–CH3. C2 trägt vier verschiedene Gruppen. CIP: NH2 > COOH > CH3 > H. Bei COOH oben und CH3 unten stehen für (2S) NH2 links und H rechts: L-Konfiguration. Spiegelbild: NH2 rechts, H links, (2R), D. Die horizontalen Bindungen zeigen nach vorn; bei vorn liegendem H wird der abgelesene Drehsinn invertiert. Ohne Stereodeskriptor ist nur die Konnektivität gegeben; beide Enantiomere sind möglich, nicht automatisch ein Racemat.
  - Expected performance (EN): There are three carbon atoms; carboxyl carbon is C1 and amino group is at C2: HOOC–CH(NH2)–CH3. C2 has four different substituents. CIP: NH2 > COOH > CH3 > H. With COOH top and CH3 bottom, (2S) places NH2 left and H right: L. Its mirror image places NH2 right and H left: (2R), D. Horizontal bonds point towards the viewer, so the read rotation is inverted when H points forward. A name without a stereodescriptor only fixes connectivity; either enantiomer is possible and a racemate is not implied.
  - Understanding focus (DE): Systematischer Name und absolute Konfiguration bestimmen die Konstruktion; D/L folgt erst aus der geprüften Fischer-Konvention.
  - Understanding focus (EN): The systematic name and absolute configuration determine construction; D/L follows from the checked Fischer convention.
- `sulfur-priority-transfer`
  - Task demand (DE): Leite aus (2R)-2-Amino-3-sulfanylpropansäure Konnektivität und Fischer-Projektion ab (COOH oben, Seitenkette unten). Bestimme D/L und vergleiche die CIP-Reihenfolge mit dem ersten Fall. Zeichne das Enantiomer und begründe, weshalb die Regel R=D hier versagt.
  - Task demand (EN): Derive connectivity and a Fischer projection from (2R)-2-amino-3-sulfanylpropanoic acid (COOH top, side chain below). Determine D/L and compare CIP priorities with the first case. Draw the enantiomer and explain why R=D fails here.
  - Expected performance (DE): HOOC–CH(NH2)–CH2–SH. CIP am C2: NH2 zuerst; CH2SH hat an seinem C die Nachbarn S,H,H und rangiert vor dem Carboxyl-C mit O,O,O; H zuletzt. Somit NH2 > CH2SH > COOH > H. Für (2R) bei dieser Fischer-Anordnung steht NH2 links, H rechts: L, obwohl R. Das Enantiomer hat NH2 rechts: D und (2S). Seitenketten ändern CIP, nicht die D/L-Projektionskonvention. Es geht um Konfiguration, nicht Drehvorzeichen oder bloße Bewegung des Bildes.
  - Expected performance (EN): HOOC–CH(NH2)–CH2–SH. At C2, NH2 is first; the CH2SH carbon has S,H,H neighbours and outranks the carboxyl carbon with O,O,O; H is last. Thus NH2 > CH2SH > COOH > H. For (2R) in this Fischer arrangement, NH2 lies left and H right: L despite R. The mirror has NH2 right: D and (2S). Side chains change CIP priorities, not the D/L projection convention. This concerns configuration, not rotation sign or simply moving the drawing.
  - Understanding focus (DE): Neue Seitenkette erzwingt eine echte Neukonstruktion und trennt absolute von relativer Konfigurationsbenennung.
  - Understanding focus (EN): A new side chain forces genuine reconstruction and distinguishes absolute from relative configurational naming.
## Page 2: Zuckerkonfigurationen und Anomere darstellen

- Full learning-goal ID: `dfaef897-dcd4-55d4-a1fe-3dd90b818853`
- Goal fingerprint: `sha256:024d3b6b9c4b2e3bc51c257f6b210bd6efaa2a749b17654a09db6bc987eb00fe`
- Page fingerprint: `sha256:c8f2bbf1c21335356f2e67c32a2e599226042a989e97f932bb75f5794e01737b`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe > Kohlenhydrate analysieren

### Canonical description

Die lernende Person kann Glucose und Fructose in Fischer- und Haworth-Projektion darstellen, den Ringschluss durch den intramolekularen nucleophilen Angriff einer Hydroxygruppe auf die Carbonylgruppe erklären und D-/L-Konfiguration sowie Anomerie anhand der betreffenden Stereozentren unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/dfaef897-dcd4-55d4-a1fe-3dd90b818853/dfaef897-dcd4-55d4-a1fe-3dd90b818853.png

- original digest: `sha256:a55adbd400bcc21a77626cb47835c252529fc6925d4e9ff1efc68dd029758a4e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Kohlenhydratklassen strukturbezogen unterscheiden — `684ffe86-3a9f-5514-866a-47d16372f2d4` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Optische Aktivität und Polarimetrie auswerten — `f4d5a02d-711b-5a6b-a41d-971359c1f64d` (outside this book)
- Glykosidische Bindungen — `7b477c2b-0919-5d70-810b-188a88c55ffc` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6c583a461068c1698e66d5b83c8d0b468fc25928ba5d678fdaa0cbf2b7e5c24f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `unlabelled-d-l-and-glucose-closure`
  - Essential understanding (DE): D/L wird aus unbenannter Struktur bestimmt; Ringschluss erhält alte Stereozentren und schafft das anomere Zentrum.
  - Essential understanding (EN): D/L is determined from unnamed structures; closure preserves existing stereocentres and creates the anomeric centre.
  - Observable performance (DE): A ist D-Glucose, B L-Glucose; das höchstnummerierte Stereozentrum C5 entscheidet (OH rechts/links). Alle vier Zentren sind gespiegelt: Enantiomere. Bei A greift ein freies Elektronenpaar von O5 das Carbonyl-C1 an, das C=O-π-Elektronenpaar geht zu O1; nach Protonenübertragung entsteht ein Halbacetal, keine Wasserabspaltung. Ringfolge O5–C1–C2–C3–C4–C5: O+5C. In der üblichen Haworthlage (O oben rechts, C1 rechts) sind C2-OH unten, C3-OH oben, C4-OH unten, C5-CH2OH oben; C1-OH α unten und β oben. Das neue C1 ist anomer, C5 bleibt unverändert; α/β ist keine D/L-Umkehr.
  - Observable performance (EN): A is D-glucose and B L-glucose; the highest-numbered stereocentre C5 determines D/L (OH right/left). All four centres are mirrored: enantiomers. In A, an O5 lone pair attacks carbonyl C1 and the C=O π pair moves to O1; proton transfer gives a hemiacetal without water loss. The ring is O5–C1–C2–C3–C4–C5: O+5C. In the usual Haworth orientation (O upper right, C1 right), C2-OH is down, C3-OH up, C4-OH down and C5-CH2OH up; C1-OH is α down or β up. New C1 is anomeric while C5 remains unchanged; α/β does not reverse D/L.
- `fructose-furanose-pyranose-transfer`
  - Essential understanding (DE): Eine Ketose verschiebt das anomere Zentrum zu C2; beide Ringschlüsse prüfen Konfigurationserhalt und richtige Ringgröße.
  - Essential understanding (EN): A ketose moves the anomeric centre to C2; both closures test configuration preservation and correct ring size.
  - Observable performance (DE): F ist D-Fructose, F* L-Fructose, weil C5-OH rechts/links; keine Drehvorzeichenangabe folgt. Fructose ist Ketose (C2=O), Glucose Aldose (C1=O). O5 oder O6 greift C2 an; das π-Paar geht zu O2, Protonenübertragung ergibt ein Halbketal (unter dem curricularen Oberbegriff Halbacetalbildung), ohne Kondensation. Furanosering: O5–C2–C3–C4–C5, Pyranosering: O6–C2–C3–C4–C5–C6. C2 ist neu anomer. Übliche Haworthlage mit Ring-O oben/rechts und C2 rechts: D-Furanose C3-OH oben, C4-OH unten, C5-CH2OH(C6) oben; C2-OH α unten, β oben und C1-CH2OH jeweils entgegengesetzt. D-Pyranose C3-OH oben, C4-OH unten, C5-OH unten; C6 ist Ring-CH2. Auch dort C2-OH α unten, β oben, C1-CH2OH entgegengesetzt. D/L bleibt an der aus der Kette erhaltenen C5-Konfiguration definiert. Die vier zyklischen Formen sind zwei Ringgrößen mit jeweils einem Anomerenpaar, nicht vier gegenseitige Enantiomere. F/F* sind spiegelbildlich; eine α/β-Änderung allein ändert D nicht.
  - Observable performance (EN): F is D-fructose and F* L-fructose because C5-OH is right/left; this does not give rotation sign. Fructose is a ketose (C2=O), glucose an aldose (C1=O). O5 or O6 attacks C2; the π pair moves to O2 and proton transfer produces a hemiketal (within the curriculum's broader hemiacetal wording), without condensation. Furanose: O5–C2–C3–C4–C5; pyranose: O6–C2–C3–C4–C5–C6. New C2 is anomeric. In the usual Haworth orientation with ring O above/right and C2 on the right, D-furanose has C3-OH up, C4-OH down and C5-CH2OH(C6) up; C2-OH is α down or β up, with C1-CH2OH opposite. D-pyranose has C3-OH up, C4-OH down and C5-OH down; C6 is ring CH2. C2-OH is again α down or β up, with C1-CH2OH opposite. D/L uses retained C5 configuration. These are two ring sizes with an anomer pair each, not four mutual enantiomers. F/F* are mirrors; changing α/β alone does not change D.

**Coverage expectations**

- required expectations: `unlabelled-d-l-and-glucose-closure`, `fructose-furanose-pyranose-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `actual-operator-transfer`: Die vollständig ausgearbeiteten Fälle wechseln die konkret genannten Struktur-, Phasen-, Proben-, Mess- oder Modellbedingungen. Methodenspezifische Quellenpflichten sind keine beliebigen Alternativen. Durchführungsaufgaben erfordern reale Eigenarbeit; synthetische Muster erfüllen sie nicht. / Complete worked cases vary the specified structure, phase, sample, measurement or model conditions. Source-specific method duties are not interchangeable alternatives. Execution requires actual own work; synthetic fixtures do not satisfy it.

**Application cases**

- `unlabelled-d-l-and-glucose-closure`
  - Task demand (DE): Zwei unbenannte Aldohexosen A/B besitzen CHO oben und CH2OH unten. OH an C2–C5: A rechts-links-rechts-rechts; B links-rechts-links-links. Zeichne beide Fischer-Projektionen, ordne D/L selbst zu und begründe die Beziehung. Leite für A den C5→C1-Ringschluss einschließlich Elektronenpaarpfeilen ab und zeichne beide Glucopyranose-Anomere mit nummerierten C-Atomen.
  - Task demand (EN): Two unnamed aldohexoses A/B have CHO at the top and CH2OH below. OH at C2–C5: A right-left-right-right; B left-right-left-left. Draw both Fischer projections, independently assign D/L and justify their relationship. For A, derive C5→C1 ring closure including electron-pair arrows and draw both glucopyranose anomers with carbon numbering.
  - Expected performance (DE): A ist D-Glucose, B L-Glucose; das höchstnummerierte Stereozentrum C5 entscheidet (OH rechts/links). Alle vier Zentren sind gespiegelt: Enantiomere. Bei A greift ein freies Elektronenpaar von O5 das Carbonyl-C1 an, das C=O-π-Elektronenpaar geht zu O1; nach Protonenübertragung entsteht ein Halbacetal, keine Wasserabspaltung. Ringfolge O5–C1–C2–C3–C4–C5: O+5C. In der üblichen Haworthlage (O oben rechts, C1 rechts) sind C2-OH unten, C3-OH oben, C4-OH unten, C5-CH2OH oben; C1-OH α unten und β oben. Das neue C1 ist anomer, C5 bleibt unverändert; α/β ist keine D/L-Umkehr.
  - Expected performance (EN): A is D-glucose and B L-glucose; the highest-numbered stereocentre C5 determines D/L (OH right/left). All four centres are mirrored: enantiomers. In A, an O5 lone pair attacks carbonyl C1 and the C=O π pair moves to O1; proton transfer gives a hemiacetal without water loss. The ring is O5–C1–C2–C3–C4–C5: O+5C. In the usual Haworth orientation (O upper right, C1 right), C2-OH is down, C3-OH up, C4-OH down and C5-CH2OH up; C1-OH is α down or β up. New C1 is anomeric while C5 remains unchanged; α/β does not reverse D/L.
  - Understanding focus (DE): D/L wird aus unbenannter Struktur bestimmt; Ringschluss erhält alte Stereozentren und schafft das anomere Zentrum.
  - Understanding focus (EN): D/L is determined from unnamed structures; closure preserves existing stereocentres and creates the anomeric centre.
- `fructose-furanose-pyranose-transfer`
  - Task demand (DE): Ketose F besitzt CH2OH an C1 und C6, C=O an C2 und OH-Folge C3–C5 links-rechts-rechts; ihr Spiegel F* rechts-links-links. Zeichne Fischerbilder, ordne D/L unabhängig zu und vergleiche die Carbonylposition mit Glucose. Konstruiere für F α- und β-Fructofuranose durch O5→C2 und α- und β-Fructopyranose durch O6→C2, jeweils nummeriert. Erkläre Elektronenpaarbewegung und anomeres Zentrum. Begründe, warum die D/L-Entscheidung bei der Pyranose nicht an einem vermeintlichen C6-CH2OH außerhalb des Rings getroffen werden kann.
  - Task demand (EN): Ketose F has CH2OH at C1 and C6, C=O at C2, and C3–C5 OH left-right-right; its mirror F* has right-left-left. Draw Fischer projections, independently assign D/L and compare carbonyl position with glucose. Construct F α/β-fructofuranose via O5→C2 and α/β-fructopyranose via O6→C2, with numbering. Explain electron-pair movement and the anomeric centre. Explain why pyranose D/L cannot be assigned from a supposed external C6-CH2OH.
  - Expected performance (DE): F ist D-Fructose, F* L-Fructose, weil C5-OH rechts/links; keine Drehvorzeichenangabe folgt. Fructose ist Ketose (C2=O), Glucose Aldose (C1=O). O5 oder O6 greift C2 an; das π-Paar geht zu O2, Protonenübertragung ergibt ein Halbketal (unter dem curricularen Oberbegriff Halbacetalbildung), ohne Kondensation. Furanosering: O5–C2–C3–C4–C5, Pyranosering: O6–C2–C3–C4–C5–C6. C2 ist neu anomer. Übliche Haworthlage mit Ring-O oben/rechts und C2 rechts: D-Furanose C3-OH oben, C4-OH unten, C5-CH2OH(C6) oben; C2-OH α unten, β oben und C1-CH2OH jeweils entgegengesetzt. D-Pyranose C3-OH oben, C4-OH unten, C5-OH unten; C6 ist Ring-CH2. Auch dort C2-OH α unten, β oben, C1-CH2OH entgegengesetzt. D/L bleibt an der aus der Kette erhaltenen C5-Konfiguration definiert. Die vier zyklischen Formen sind zwei Ringgrößen mit jeweils einem Anomerenpaar, nicht vier gegenseitige Enantiomere. F/F* sind spiegelbildlich; eine α/β-Änderung allein ändert D nicht.
  - Expected performance (EN): F is D-fructose and F* L-fructose because C5-OH is right/left; this does not give rotation sign. Fructose is a ketose (C2=O), glucose an aldose (C1=O). O5 or O6 attacks C2; the π pair moves to O2 and proton transfer produces a hemiketal (within the curriculum's broader hemiacetal wording), without condensation. Furanose: O5–C2–C3–C4–C5; pyranose: O6–C2–C3–C4–C5–C6. New C2 is anomeric. In the usual Haworth orientation with ring O above/right and C2 on the right, D-furanose has C3-OH up, C4-OH down and C5-CH2OH(C6) up; C2-OH is α down or β up, with C1-CH2OH opposite. D-pyranose has C3-OH up, C4-OH down and C5-OH down; C6 is ring CH2. C2-OH is again α down or β up, with C1-CH2OH opposite. D/L uses retained C5 configuration. These are two ring sizes with an anomer pair each, not four mutual enantiomers. F/F* are mirrors; changing α/β alone does not change D.
  - Understanding focus (DE): Eine Ketose verschiebt das anomere Zentrum zu C2; beide Ringschlüsse prüfen Konfigurationserhalt und richtige Ringgröße.
  - Understanding focus (EN): A ketose moves the anomeric centre to C2; both closures test configuration preservation and correct ring size.
## Page 3: Fette über Struktur und Eigenschaften erklären

- Full learning-goal ID: `2f3cdec5-f845-5b0f-841e-8b1d47de0281`
- Goal fingerprint: `sha256:d461445003b11097f867ca49042832ed5e3f1b9def569704a37106dbef3d983e`
- Page fingerprint: `sha256:232ddcc953f7b30079c48a316e3c7acc69c52618f39a67d052b2868de2afa334`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe > Fette bewerten

### Canonical description

Die lernende Person kann Triacylglyceride über Estergruppen identifizieren und ausgewählte physikalische Eigenschaften durch Fettsäurereste, Sättigung und räumlichen Bau erklären.

### Visualization

/assets/goal-visualizations/chemie/2f3cdec5-f845-5b0f-841e-8b1d47de0281/2f3cdec5-f845-5b0f-841e-8b1d47de0281.png

- original digest: `sha256:0e15e39fbff32f0f95820e38289d60dee919f816499b31d3d312a52b42ced083`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Esterbildung und Estereigenschaften erklären — `70b34ae7-4481-590c-9a02-516464750832` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Fettverwendung kriteriengeleitet bewerten — `7371c82e-6668-5ddc-ba78-347113fcddf8` (outside this book)
- Pflanzenölkraftstoffe einordnen — `e64a79df-7f21-5651-9b5d-e7d17580569e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:edd2b186394ecc1c3d36bca22a7f2d12ee145c8528fcb6fe260a0bfad910f0c4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `fat-structure-and-melting`
  - Essential understanding (DE): Physikalische Eigenschaft aus Molekülstruktur erklären, mit kontrollierter Vergleichsbasis.
  - Essential understanding (EN): Explain a physical property from molecular structure with a controlled comparison basis.
  - Observable performance (DE): Glyceringerüst trägt an drei O-Atomen jeweils –C(=O)–R; drei Estergruppen verbinden genau drei Reste. Ein einzelnes Triacylglycerid ist kein Polyester mit wiederholten Ketteneinheiten. Gerade gesättigte Reste packen regelmäßiger, cis-Doppelbindungen erzeugen Knicke und stören geordnete Packung; entsprechend schmilzt B im Modell niedriger. Vergleich gilt bei ähnlicher Kettenlänge und vergleichbarer Zusammensetzung; natürliche Fette sind Gemische, deren Schmelzbereiche auch Verteilung der Reste und Kristallform beeinflussen.
  - Observable performance (EN): The glycerol backbone has –C(=O)–R attached through each of three O atoms; three ester groups connect exactly three residues. One triacylglycerol is not a polyester chain with repeated units. Straight saturated residues pack more regularly, while cis double bonds create bends and disrupt ordered packing; B therefore melts lower in this model. The comparison holds for similar chain length and comparable composition; natural fats are mixtures whose melting ranges also depend on residue distribution and crystal form.
- `cis-trans-and-solvent-property-transfer`
  - Essential understanding (DE): Geänderte räumliche Konfiguration bei gleicher Ungesättigtheit und geändertes Lösungsmittel liefern echte physikalische Transfers.
  - Essential understanding (EN): Changed spatial configuration at equal unsaturation and changed solvent provide genuine physical transfers.
  - Observable performance (DE): Bei 20 °C ist C flüssig, D fest. trans-Reste sind räumlich gestreckter und können regelmäßiger packen als die geknickten cis-Reste; gleich viele Doppelbindungen reichen zur Konsistenzprognose nicht. Die langen unpolaren Kohlenwasserstoffreste dominieren den Löslichkeitsvergleich: wenige Estergruppen liefern keine ausreichende Hydratation für gute Wasserlöslichkeit; mit einem unpolaren Medium sind günstige Dispersionskontakte möglich. Fette sind hydrophob und lipophil. Das ist ein kontrolliertes Modell, keine allgemeine Rangfolge für jedes Gemisch oder jede Temperatur und keine Ernährungsbewertung.
  - Observable performance (EN): At 20 °C, C is liquid and D solid. trans residues are more extended and can pack more regularly than bent cis residues; counting double bonds is insufficient to predict consistency. Long nonpolar hydrocarbon residues dominate solubility: a few ester groups do not provide enough hydration for good water solubility, whereas a nonpolar medium allows favourable dispersion contacts. Fats are hydrophobic and lipophilic. This is a controlled model, not a universal ranking for all mixtures or temperatures and not a nutritional assessment.

**Coverage expectations**

- required expectations: `fat-structure-and-melting`, `cis-trans-and-solvent-property-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `actual-operator-transfer`: Die vollständig ausgearbeiteten Fälle wechseln die konkret genannten Struktur-, Phasen-, Proben-, Mess- oder Modellbedingungen. Methodenspezifische Quellenpflichten sind keine beliebigen Alternativen. Durchführungsaufgaben erfordern reale Eigenarbeit; synthetische Muster erfüllen sie nicht. / Complete worked cases vary the specified structure, phase, sample, measurement or model conditions. Source-specific method duties are not interchangeable alternatives. Execution requires actual own work; synthetic fixtures do not satisfy it.

**Application cases**

- `fat-structure-and-melting`
  - Task demand (DE): Konstruiere ein Triacylglycerid aus Glycerin und drei Fettsäureresten, markiere die drei Estergruppen und erkläre, weshalb es kein Polymer ist. Vergleiche Modellfett A mit drei gesättigten C18-Resten und B mit drei cis-einfach ungesättigten C18-Resten. Erkläre die synthetischen Schmelzbereiche A 68–72 °C und B 3–7 °C aus räumlichem Bau und Packung; nenne die Reichweite des Vergleichs.
  - Task demand (EN): Construct a triacylglycerol from glycerol and three fatty acid residues, mark its three ester groups and explain why it is not a polymer. Compare model fat A with three saturated C18 residues and B with three cis-monounsaturated C18 residues. Explain synthetic melting ranges A 68–72 °C and B 3–7 °C using spatial structure and packing; state the scope of the comparison.
  - Expected performance (DE): Glyceringerüst trägt an drei O-Atomen jeweils –C(=O)–R; drei Estergruppen verbinden genau drei Reste. Ein einzelnes Triacylglycerid ist kein Polyester mit wiederholten Ketteneinheiten. Gerade gesättigte Reste packen regelmäßiger, cis-Doppelbindungen erzeugen Knicke und stören geordnete Packung; entsprechend schmilzt B im Modell niedriger. Vergleich gilt bei ähnlicher Kettenlänge und vergleichbarer Zusammensetzung; natürliche Fette sind Gemische, deren Schmelzbereiche auch Verteilung der Reste und Kristallform beeinflussen.
  - Expected performance (EN): The glycerol backbone has –C(=O)–R attached through each of three O atoms; three ester groups connect exactly three residues. One triacylglycerol is not a polyester chain with repeated units. Straight saturated residues pack more regularly, while cis double bonds create bends and disrupt ordered packing; B therefore melts lower in this model. The comparison holds for similar chain length and comparable composition; natural fats are mixtures whose melting ranges also depend on residue distribution and crystal form.
  - Understanding focus (DE): Physikalische Eigenschaft aus Molekülstruktur erklären, mit kontrollierter Vergleichsbasis.
  - Understanding focus (EN): Explain a physical property from molecular structure with a controlled comparison basis.
- `cis-trans-and-solvent-property-transfer`
  - Task demand (DE): Neue Modellfette C und D haben je drei C18-Reste mit genau einer C=C pro Rest; C besitzt nur cis-, D nur trans-Doppelbindungen. Die synthetischen Schmelzbereiche sind C 3–7 °C, D 38–42 °C. Je 0,10 g in 2,0 mL Lösungsmittel bei 20 °C: mit Wasser bleiben beide als separate Phase, in einem freigegebenen unpolaren Lösemittel lösen sie sich. Erkläre beide Eigenschaftsänderungen strukturbezogen. Beurteile die Behauptung: Gleiche Zahl von Doppelbindungen bedeutet gleiche Konsistenz; Estergruppen machen jedes Fett wasserlöslich.
  - Task demand (EN): New model fats C and D each have three C18 residues with one C=C per residue; C contains only cis and D only trans double bonds. Synthetic melting ranges are C 3–7 °C and D 38–42 °C. At 20 °C, 0.10 g in 2.0 mL solvent remains a separate phase in water but dissolves in an approved nonpolar solvent. Explain both property changes structurally. Assess: Equal double-bond counts imply equal consistency; ester groups make every fat water-soluble.
  - Expected performance (DE): Bei 20 °C ist C flüssig, D fest. trans-Reste sind räumlich gestreckter und können regelmäßiger packen als die geknickten cis-Reste; gleich viele Doppelbindungen reichen zur Konsistenzprognose nicht. Die langen unpolaren Kohlenwasserstoffreste dominieren den Löslichkeitsvergleich: wenige Estergruppen liefern keine ausreichende Hydratation für gute Wasserlöslichkeit; mit einem unpolaren Medium sind günstige Dispersionskontakte möglich. Fette sind hydrophob und lipophil. Das ist ein kontrolliertes Modell, keine allgemeine Rangfolge für jedes Gemisch oder jede Temperatur und keine Ernährungsbewertung.
  - Expected performance (EN): At 20 °C, C is liquid and D solid. trans residues are more extended and can pack more regularly than bent cis residues; counting double bonds is insufficient to predict consistency. Long nonpolar hydrocarbon residues dominate solubility: a few ester groups do not provide enough hydration for good water solubility, whereas a nonpolar medium allows favourable dispersion contacts. Fats are hydrophobic and lipophilic. This is a controlled model, not a universal ranking for all mixtures or temperatures and not a nutritional assessment.
  - Understanding focus (DE): Geänderte räumliche Konfiguration bei gleicher Ungesättigtheit und geändertes Lösungsmittel liefern echte physikalische Transfers.
  - Understanding focus (EN): Changed spatial configuration at equal unsaturation and changed solvent provide genuine physical transfers.
## Page 4: Chromatografie anwenden und auswerten

- Full learning-goal ID: `978a6f25-0601-5457-9211-aab206c95603`
- Goal fingerprint: `sha256:a10a29c2c5b921e47936aad7fe222d0e47a157145662396b697f3b73642b4691`
- Page fingerprint: `sha256:ad84e5e85ab055475d241b3485e399f801b31d45e198191f1f4c8b2a49013ab7`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann eine für den Untersuchungszweck geeignete chromatografische Trennung anwenden und aus den unterschiedlichen Wechselwirkungen mit mobiler und stationärer Phase erklären, das Laufmittel bei Flüssigkeitsverfahren begründet auswählen und Chromatogramme anhand von Rf-Werten oder Retentionszeiten mit geeigneten Referenzen begrenzt zur Identifikation von Gemischbestandteilen auswerten.

### Visualization

/assets/goal-visualizations/chemie/978a6f25-0601-5457-9211-aab206c95603/978a6f25-0601-5457-9211-aab206c95603.jpg

- original digest: `sha256:5c359891410519b1e91f5aaefb4006b86a3c27696c65545c4a63161eba2de179`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Stoffe und Eigenschaften beschreiben — `fcc73fb5-7413-557f-aea3-b9692a66ee75` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f9ff76853765cdc6e4efab618cfb29aae1c7c33741ac522d90a7a95c6bd44009`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `chosen-route-phase-reasoning`
  - Essential understanding (DE): Chromatografie trennt nach unterschiedlichen Wechselwirkungen mit zwei Phasen; das gewählte Verfahren und seine Anspruchstiefe werden aus dem tatsächlichen Quellenoperator bestimmt.
  - Essential understanding (EN): Chromatography separates through different interactions with two phases; the actual source operator determines the selected method and depth.
  - Observable performance (DE): Erklärt mobile/stationäre Phase und unterschiedliche Mitnahme/Rückhaltung am tatsächlich ausgewählten Papier-, DC- oder GC-Fall; für Papier werden weder Aminosäurewissen noch Gasgerätekenntnisse vorausgesetzt.
  - Observable performance (EN): Explains mobile/stationary phases and different transport/retention in the selected paper, TLC or GC case; paper assumes neither amino-acid knowledge nor gas-instrument knowledge.
- `chosen-route-evaluation-and-transfer`
  - Essential understanding (DE): Referenzvergleich und frische Variation gelten nur bei nachvollziehbaren gemeinsamen Bedingungen; Ausführung und Deutung sind getrennt belegt.
  - Essential understanding (EN): Reference comparison and fresh variation require documented matched conditions; execution and interpretation need separate evidence.
  - Observable performance (DE): Wertet eigene oder ausdrücklich zur Auswertung gegebene Daten mit der zum Verfahren passenden Bezugsgröße aus, prüft eine neue vorgegebene Variation und begrenzt Identifikation. Bei durchführen/anwenden legt die Person eigene Handlung und Originalprotokoll vor; reine Datenlektüre genügt nur für den ausdrücklich begrenzten NI-Auswertungsoperator.
  - Observable performance (EN): Evaluates own or explicitly supplied interpretation data using the method-appropriate quantity, examines a new prescribed variation and limits identification. Performing/applying requires personal action and an original record; reading data alone only fulfils the explicitly bounded NI interpretation operator.
- `seki-paper-own-execution`
  - Essential understanding (DE): Mobile und stationäre Phase sowie unterschiedliche Mitnahme/Rückhaltung werden am selbst ausgeführten, altersgerechten Trennfall geprüft.
  - Essential understanding (EN): Mobile and stationary phases and different transport/retention are assessed through a personally executed age-appropriate separation.
  - Observable performance (DE): Eigenes Protokoll zeigt Stoffe/Ansätze, Start oberhalb Flüssigkeit, kleine Flecke, zwei Frontmarken, Skizze oder Foto sowie gemessene Abstände. Synthetische Musterwerte: Wasserfront 6,0 cm, breite Flecke 2,0/2,3 cm; Mischung: Front 6,0 cm, schmale Flecke 1,2/3,0/4,8 cm (Rf 0,20/0,50/0,80). Im Muster ist die Mischung geeigneter. Farbstoffe werden vom Laufmittel unterschiedlich gut mitgenommen und durch Kontakte mit dem Papier unterschiedlich zurückgehalten; für Sek I genügt dieses Stoff-/Teilchenmodell. Bei Papier ist die wasserhaltige Cellulosematrix beteiligt; es wird keine reine Silica-Adsorption behauptet. Zweite Probe unter gleicher Bedingung vergleichen. Farbfleckgleichheit ist ein Hinweis, kein eindeutiger Identitätsbeweis. Fremde Musterwerte erfüllen den Durchführungsoperator nicht.
  - Observable performance (EN): The learner record includes materials/runs, origin above liquid, small spots, two front marks, drawing or photo and measured distances. Synthetic fixture: water front 6.0 cm, broad spots 2.0/2.3 cm; mixture front 6.0 cm, narrow spots 1.2/3.0/4.8 cm (Rf 0.20/0.50/0.80). The mixture works better in this fixture. Dyes are carried differently by the mobile phase and retained differently by contacts with paper; this material/particle model suffices for Sek I. Paper includes a water-containing cellulose matrix; pure silica adsorption is not claimed. Compare the second sample under the same conditions. Equal spots are a clue, not unique identity proof. Someone else's fixture does not satisfy execution.
- `amino-acid-tlc-own-execution`
  - Essential understanding (DE): Die echte Oberstufenroute enthält den Ninhydrinoperator und eine praktisch kontrollierte Variation.
  - Essential understanding (EN): The actual upper-secondary route includes ninhydrin detection and a practically controlled variation.
  - Observable performance (DE): Eigene Platte/Protokoll und beaufsichtigte Handlung belegen Durchführung einschließlich Detektion. Synthetischer Auswertungsfall: Front 6,0 cm; Glycin 1,5 cm, Valin 3,6 cm; Gemisch beide Lagen, Rf 0,25/0,60. Gleichzeitige Standards und kleine Flecke begrenzen Überladung; große Flecke verbreitern oder verschmieren die Banden. Die mobile Phase konkurriert mit Kontakten zur Silicaoberfläche, sodass relative Laufwege stoff- und bedingungsabhängig sind. Aminosäure- und Ninhydrinchemie gehört zu dieser Oberstufenroute, nicht zur Papierroute. Ninhydrinfarbe und gleiche Rf stützen Zuordnung, beweisen keine universelle Identität. Lokale Ninhydrinlösung/Erwärmung werden erst nach Stoff- und Gerätefreigabe angewandt; ohne Originalarbeit ist keine ausgeführte Kompetenz belegt.
  - Observable performance (EN): The original plate/record and supervised action demonstrate execution including detection. Synthetic interpretation fixture: front 6.0 cm, glycine 1.5 cm, valine 3.6 cm and mixture at both positions, Rf 0.25/0.60. Concurrent standards and small spots limit overloading; large spots broaden or streak. The mobile phase competes with silica-surface contacts, so relative distances depend on substances and conditions. Amino-acid/ninhydrin chemistry belongs to this upper-secondary route, not the paper route. Ninhydrin colour and matching Rf support assignment but do not prove universal identity. Local ninhydrin solution/heating is used only after material/equipment authorization; without original work no executed competence is evidenced.
- `universal-indicator-tlc-own-execution`
  - Essential understanding (DE): Der wortwörtliche BW-Operator wird am Universalindikator durchgeführt; Rf und Phasen werden nicht aus einem fremden Verfahren übernommen.
  - Essential understanding (EN): The literal BW operator is performed on universal indicator; Rf and phases are not borrowed from a different method.
  - Observable performance (DE): Originalchromatogramm, Bedingungen, Front und Referenzspuren sind erforderlich. Synthetischer Fall: Front 5,0 cm; Referenzen 1,0/2,5/4,0 cm, Universalindikator gleichliegende Flecke: Rf 0,20/0,50/0,80. Cellulose-/wasserhaltige stationäre Matrix und mobile Mischung erklären die unterschiedliche Retention; alkalische Bedingungen halten den Vergleich der Farbstoffformen kontrolliert. Wechsel des Methanolanteils ändert die relativen Wechselwirkungen und gegebenenfalls Rf: alte Tabelle darf nicht ungeprüft übernommen werden. Alle Referenzen müssen im neuen Lauf erneut mitlaufen. Universalindikatoren haben unterschiedliche Rezepturen; Farbgleichheit allein beweist weder dieselbe Stoffidentität noch vollständige Bestandteilsliste. Der ausgeführte Indikatorversuch ist nicht durch eine Aminosäure-DC ersetzt.
  - Observable performance (EN): The original chromatogram, conditions, front and reference lanes are required. Synthetic fixture: front 5.0 cm, references 1.0/2.5/4.0 cm and indicator spots at matching positions: Rf 0.20/0.50/0.80. The cellulose/water-containing stationary matrix and mobile mixture explain different retention; alkaline conditions control comparison of dye forms. Changing the methanol proportion changes relative interactions and possibly Rf, so the old table cannot be reused untested. References must run again. Universal indicators vary in formulation; matching colour alone proves neither identity nor a complete component list. An amino-acid TLC does not replace this executed indicator experiment.
- `gc-mixture-principle-and-analytical-value`
  - Essential understanding (DE): Gaschromatografie verwendet dieselbe Phasen-/Referenzlogik mit einer anderen Bezugsgröße und explizitem analytischem Nutzen.
  - Essential understanding (EN): GC uses the same phase/reference reasoning with a different reference quantity and explicit analytical value.
  - Observable performance (DE): Verdampfte Probe wird vom Trägergas transportiert; wiederholte Verteilung/Kontakte zur stationären Phase verzögern Komponenten unterschiedlich. Flüchtigkeit und stoff-/phasenabhängige Wechselwirkungen wirken zusammen; Retention lässt sich nicht immer nur nach Siedepunkt ordnen. P stützt A+B, Q B unter denselben Bedingungen; Toleranzen und Coelution begrenzen Identifikation. Rf ist ein Wegquotient bei planaren Flüssigkeitsverfahren, Retentionszeit die Zeit bis zum Detektorpeak, kein Rf. GC kann Gemische auflösen, Prozessverunreinigungen/Reaktionsprodukte feststellen und anhand geeigneter Standards zu Qualitätskontrolle beitragen. Peakflächen werden erst mit Detektorantwort-/Kalibrierprüfung zu Mengen; keine Prozente aus unkalibrierten Flächen. Das ist der NI-Auswertungs-/Erkläroperator, kein behaupteter GC-Bediennachweis.
  - Observable performance (EN): Vaporized sample is transported by carrier gas; repeated partitioning/contacts with the stationary phase delay components differently. Volatility and substance/phase-dependent interactions act together; retention cannot always be ordered by boiling point alone. P supports A+B and Q B under matched conditions; tolerances and coelution limit identification. Rf is a distance ratio in planar liquid methods, while retention time is time to the detector peak, not Rf. GC resolves mixtures and can reveal process impurities/reaction products for quality control with suitable standards. Peak areas become quantities only after detector-response/calibration checks; uncalibrated areas do not give percentages. This is the NI evaluation/explanation operator, not a claimed GC operation record.
- `gc-own-application-and-reaction-product-transfer`
  - Essential understanding (DE): Reaktionsprodukt als echter neuer GC-Kontext mit eigener Bedienung, Leerprobe und Co-Injektion; Datenlesen ersetzt Anwendung nicht.
  - Essential understanding (EN): Reaction products provide a genuinely new GC context with personal operation, blank and co-injection; reading data does not replace application.
  - Observable performance (DE): Originaldatei mit eigener Arbeit, Leerprobe und Standards sowie dokumentierte Säule, stationäre Phase, Trägergas, Fluss-/Temperaturprogramm, Detektor und Probe sind erforderlich. Synthetisches Beispiel: Eduktstandard 2,40 min, Produktstandard 4,80 min; vorher Peak 2,39, nachher 2,40 und 4,81 min; Leerprobe ohne passende Peaks. Co-Injektion vergrößert nur den 4,81-Peak ohne neue aufgelöste Bande und stützt Produktzuordnung. Die begründete Aussage ist ein neuer zu diesem Standard passender Bestandteil, nicht vollständiger Umsatz oder sichere Strukturidentität. Bei geändertem Programm werden Standards neu gemessen, alte Retentionszeiten nicht blind verwendet. Flüchtigkeit/Phasenwechselwirkungen erklären den neuen Retentionsweg. Der Ausdruck einer fremden Messreihe erfüllt persönliche Anwendung nicht.
  - Observable performance (EN): Own original work/file, blank, standards and recorded column, stationary phase, carrier gas, flow/temperature programme, detector and sample are required. Synthetic example: reactant reference 2.40 min, product reference 4.80 min; before peak 2.39, after 2.40 and 4.81 min; blank has no matching peaks. Co-injection enlarges only the 4.81 peak with no newly resolved peak, supporting product assignment. The bounded claim is a new component matching that standard, not complete conversion or certain structural identity. A changed programme requires renewed standards instead of blindly reusing retention times. Volatility/phase interactions explain the new retention path. Someone else's printed dataset does not satisfy personal application.

**Coverage expectations**

- required expectations: `chosen-route-phase-reasoning`, `chosen-route-evaluation-and-transfer`
- alternative expectation groups: `seki-paper-own-execution` or `amino-acid-tlc-own-execution` or `universal-indicator-tlc-own-execution` or `gc-mixture-principle-and-analytical-value`
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `actual-operator-transfer`: Die vollständig ausgearbeiteten Fälle wechseln die konkret genannten Struktur-, Phasen-, Proben-, Mess- oder Modellbedingungen. Methodenspezifische Quellenpflichten sind keine beliebigen Alternativen. Durchführungsaufgaben erfordern reale Eigenarbeit; synthetische Muster erfüllen sie nicht. / Complete worked cases vary the specified structure, phase, sample, measurement or model conditions. Source-specific method duties are not interchangeable alternatives. Execution requires actual own work; synthetic fixtures do not satisfy it.
- `literal-source-route-binding`: Die Alternativgruppe beschreibt Methodenvarianten derselben Kompetenz, keine austauschbare Erfüllung einer konkreten Lehrplanpflicht: BW3.4.3(15) verlangt Indikator-DC, HE/TH Aminosäure-DC, SN7 Papier/Kreide und NI die benannten GC-Operatoren. Die exakte Source-Case-Bindung bleibt zusätzliche verpflichtende Autorensemantik im Quellenaudit. Ein fremdes Verfahren darf diese Pflicht nicht erfüllen. / The alternative group describes method variants of one competence, not interchangeable fulfilment of a concrete curricular obligation: BW3.4.3(15) requires indicator TLC, HE/TH amino-acid TLC, SN7 paper/chalk and NI its stated GC operators. Exact source-to-case binding remains mandatory authoring semantics in the source audit. A different method cannot fulfil that obligation.

**Application cases**

- `seki-paper-own-execution`
  - Task demand (DE): Trenne einen schwarzen wasserlöslichen Filzstiftfarbstoff unter Aufsicht selbst durch Papierchromatografie. Plane zwei gleich große Papierstreifen für Wasser und Wasser/Ethanol 4:1. Markiere jeweils eine Startlinie 1,5 cm oberhalb des unteren Randes und kleine Probenflecken; die Flüssigkeit steht 0,5 cm hoch. Entwickle bis knapp unter den oberen Rand, markiere sofort die Front und dokumentiere dein Originalchromatogramm. Wähle das brauchbarere Laufmittel anhand getrennter Farbflecken und übertrage das Verfahren auf eine zweite Stiftprobe. Erkläre die Trennung ohne Aminosäure- oder pH-Vorkenntnisse.
  - Task demand (EN): Personally separate a black water-soluble felt-tip ink by supervised paper chromatography. Plan equal paper strips for water and water/ethanol 4:1. Mark a start line 1.5 cm above the bottom and small sample spots; liquid depth is 0.5 cm. Develop almost to the top, mark the front immediately and record your original chromatogram. Choose the better mobile phase from separated colour spots and transfer the method to a second ink sample. Explain separation without amino-acid or pH prerequisites.
  - Expected performance (DE): Eigenes Protokoll zeigt Stoffe/Ansätze, Start oberhalb Flüssigkeit, kleine Flecke, zwei Frontmarken, Skizze oder Foto sowie gemessene Abstände. Synthetische Musterwerte: Wasserfront 6,0 cm, breite Flecke 2,0/2,3 cm; Mischung: Front 6,0 cm, schmale Flecke 1,2/3,0/4,8 cm (Rf 0,20/0,50/0,80). Im Muster ist die Mischung geeigneter. Farbstoffe werden vom Laufmittel unterschiedlich gut mitgenommen und durch Kontakte mit dem Papier unterschiedlich zurückgehalten; für Sek I genügt dieses Stoff-/Teilchenmodell. Bei Papier ist die wasserhaltige Cellulosematrix beteiligt; es wird keine reine Silica-Adsorption behauptet. Zweite Probe unter gleicher Bedingung vergleichen. Farbfleckgleichheit ist ein Hinweis, kein eindeutiger Identitätsbeweis. Fremde Musterwerte erfüllen den Durchführungsoperator nicht.
  - Expected performance (EN): The learner record includes materials/runs, origin above liquid, small spots, two front marks, drawing or photo and measured distances. Synthetic fixture: water front 6.0 cm, broad spots 2.0/2.3 cm; mixture front 6.0 cm, narrow spots 1.2/3.0/4.8 cm (Rf 0.20/0.50/0.80). The mixture works better in this fixture. Dyes are carried differently by the mobile phase and retained differently by contacts with paper; this material/particle model suffices for Sek I. Paper includes a water-containing cellulose matrix; pure silica adsorption is not claimed. Compare the second sample under the same conditions. Equal spots are a clue, not unique identity proof. Someone else's fixture does not satisfy execution.
  - Understanding focus (DE): Mobile und stationäre Phase sowie unterschiedliche Mitnahme/Rückhaltung werden am selbst ausgeführten, altersgerechten Trennfall geprüft.
  - Understanding focus (EN): Mobile and stationary phases and different transport/retention are assessed through a personally executed age-appropriate separation.
- `amino-acid-tlc-own-execution`
  - Task demand (DE): Führe die freigegebene Aminosäure-DC selbst betreut durch: 5×10 cm Silicaplatte, Startlinie 1 cm; kleine getrocknete Flecke von 0,1% Glycin, 0,1% Valin und unbekanntem Gemisch. Verwende die bereitgestellte Mischung Butan-1-ol/Ethansäure/Wasser 4:1:1, Füllhöhe 0,5 cm, gesättigte Kammer. Markiere die Front sofort nach Entnahme, trockne und führe die freigegebene Ninhydrindetektion im Abzug nach der lokalen Anweisung durch. Dokumentiere dein Original, berechne Rf und begründe Referenzzuordnung. Prüfe eine Probe mit zusätzlich erhöhter Fleckmenge und erkläre den Einfluss auf Trennqualität.
  - Task demand (EN): Personally perform the approved supervised amino-acid TLC: 5×10 cm silica plate, origin at 1 cm; small dried spots of 0.1% glycine, 0.1% valine and an unknown mixture. Use supplied butan-1-ol/ethanoic acid/water 4:1:1 at 0.5 cm depth in a saturated chamber. Mark the front immediately on removal, dry, then carry out approved ninhydrin detection in a hood under the local instructions. Record your original, compute Rf and justify reference assignments. Test increased spot loading and explain its effect on resolution.
  - Expected performance (DE): Eigene Platte/Protokoll und beaufsichtigte Handlung belegen Durchführung einschließlich Detektion. Synthetischer Auswertungsfall: Front 6,0 cm; Glycin 1,5 cm, Valin 3,6 cm; Gemisch beide Lagen, Rf 0,25/0,60. Gleichzeitige Standards und kleine Flecke begrenzen Überladung; große Flecke verbreitern oder verschmieren die Banden. Die mobile Phase konkurriert mit Kontakten zur Silicaoberfläche, sodass relative Laufwege stoff- und bedingungsabhängig sind. Aminosäure- und Ninhydrinchemie gehört zu dieser Oberstufenroute, nicht zur Papierroute. Ninhydrinfarbe und gleiche Rf stützen Zuordnung, beweisen keine universelle Identität. Lokale Ninhydrinlösung/Erwärmung werden erst nach Stoff- und Gerätefreigabe angewandt; ohne Originalarbeit ist keine ausgeführte Kompetenz belegt.
  - Expected performance (EN): The original plate/record and supervised action demonstrate execution including detection. Synthetic interpretation fixture: front 6.0 cm, glycine 1.5 cm, valine 3.6 cm and mixture at both positions, Rf 0.25/0.60. Concurrent standards and small spots limit overloading; large spots broaden or streak. The mobile phase competes with silica-surface contacts, so relative distances depend on substances and conditions. Amino-acid/ninhydrin chemistry belongs to this upper-secondary route, not the paper route. Ninhydrin colour and matching Rf support assignment but do not prove universal identity. Local ninhydrin solution/heating is used only after material/equipment authorization; without original work no executed competence is evidenced.
  - Understanding focus (DE): Die echte Oberstufenroute enthält den Ninhydrinoperator und eine praktisch kontrollierte Variation.
  - Understanding focus (EN): The actual upper-secondary route includes ninhydrin detection and a practically controlled variation.
- `universal-indicator-tlc-own-execution`
  - Task demand (DE): Führe betreut eine Cellulose-DC des bereitgestellten Universalindikators und der Referenzen Methylorange, Methylrot und Bromthymolblau durch. Entwickle mit bereitgestellter 0,1 mol/L NaOH/Methanol-Mischung 10:1 (v/v); setze kleine Flecke oberhalb des Flüssigkeitsspiegels und markiere die Front sofort. Dokumentiere dein Original, bestimme Rf und begründe die Bestandteilszuordnung. Wiederhole mit einem von der Lehrkraft freigegebenen anderen Methanolanteil und beurteile, ob die erste Rf-Tabelle dafür weiter gilt.
  - Task demand (EN): Personally perform supervised cellulose TLC of the supplied universal indicator and methyl orange, methyl red and bromothymol blue references. Develop with supplied 0.1 mol/L NaOH/methanol 10:1 (v/v); keep small spots above liquid and mark the front immediately. Document your original, determine Rf and justify component assignments. Repeat using another teacher-approved methanol proportion and assess whether the first Rf table remains applicable.
  - Expected performance (DE): Originalchromatogramm, Bedingungen, Front und Referenzspuren sind erforderlich. Synthetischer Fall: Front 5,0 cm; Referenzen 1,0/2,5/4,0 cm, Universalindikator gleichliegende Flecke: Rf 0,20/0,50/0,80. Cellulose-/wasserhaltige stationäre Matrix und mobile Mischung erklären die unterschiedliche Retention; alkalische Bedingungen halten den Vergleich der Farbstoffformen kontrolliert. Wechsel des Methanolanteils ändert die relativen Wechselwirkungen und gegebenenfalls Rf: alte Tabelle darf nicht ungeprüft übernommen werden. Alle Referenzen müssen im neuen Lauf erneut mitlaufen. Universalindikatoren haben unterschiedliche Rezepturen; Farbgleichheit allein beweist weder dieselbe Stoffidentität noch vollständige Bestandteilsliste. Der ausgeführte Indikatorversuch ist nicht durch eine Aminosäure-DC ersetzt.
  - Expected performance (EN): The original chromatogram, conditions, front and reference lanes are required. Synthetic fixture: front 5.0 cm, references 1.0/2.5/4.0 cm and indicator spots at matching positions: Rf 0.20/0.50/0.80. The cellulose/water-containing stationary matrix and mobile mixture explain different retention; alkaline conditions control comparison of dye forms. Changing the methanol proportion changes relative interactions and possibly Rf, so the old table cannot be reused untested. References must run again. Universal indicators vary in formulation; matching colour alone proves neither identity nor a complete component list. An amino-acid TLC does not replace this executed indicator experiment.
  - Understanding focus (DE): Der wortwörtliche BW-Operator wird am Universalindikator durchgeführt; Rf und Phasen werden nicht aus einem fremden Verfahren übernommen.
  - Understanding focus (EN): The literal BW operator is performed on universal indicator; Rf and phases are not borrowed from a different method.
- `gc-mixture-principle-and-analytical-value`
  - Task demand (DE): Werte die synthetischen Gaschromatogramme eines flüchtigen Modellgemischs aus. Standards A/B/C haben im selben Temperatur-, Säulen- und Trägergasprogramm Retentionszeiten 1,20/2,40/4,80 min; Probe P Peaks bei 1,21/2,39 min, Probe Q nur 2,41 min. Erkläre den Aufbau (Injektor, Trägergas, stationäre Flüssigkeitsphase, Detektor) und die Trennung aus Flüchtigkeit und intermolekularen Wechselwirkungen. Begründe die Stoffzuordnung und beurteile den Nutzen für Qualitätskontrolle gegenüber einem bloßen Siedepunktvergleich.
  - Task demand (EN): Evaluate synthetic gas chromatograms of a volatile model mixture. Under the same temperature, column and carrier-gas programme, standards A/B/C have retention times 1.20/2.40/4.80 min; sample P peaks at 1.21/2.39 min and Q at 2.41 min. Explain injector, carrier gas, stationary liquid phase and detector, and separation through volatility and intermolecular interactions. Justify assignments and assess quality-control value compared with merely comparing boiling points.
  - Expected performance (DE): Verdampfte Probe wird vom Trägergas transportiert; wiederholte Verteilung/Kontakte zur stationären Phase verzögern Komponenten unterschiedlich. Flüchtigkeit und stoff-/phasenabhängige Wechselwirkungen wirken zusammen; Retention lässt sich nicht immer nur nach Siedepunkt ordnen. P stützt A+B, Q B unter denselben Bedingungen; Toleranzen und Coelution begrenzen Identifikation. Rf ist ein Wegquotient bei planaren Flüssigkeitsverfahren, Retentionszeit die Zeit bis zum Detektorpeak, kein Rf. GC kann Gemische auflösen, Prozessverunreinigungen/Reaktionsprodukte feststellen und anhand geeigneter Standards zu Qualitätskontrolle beitragen. Peakflächen werden erst mit Detektorantwort-/Kalibrierprüfung zu Mengen; keine Prozente aus unkalibrierten Flächen. Das ist der NI-Auswertungs-/Erkläroperator, kein behaupteter GC-Bediennachweis.
  - Expected performance (EN): Vaporized sample is transported by carrier gas; repeated partitioning/contacts with the stationary phase delay components differently. Volatility and substance/phase-dependent interactions act together; retention cannot always be ordered by boiling point alone. P supports A+B and Q B under matched conditions; tolerances and coelution limit identification. Rf is a distance ratio in planar liquid methods, while retention time is time to the detector peak, not Rf. GC resolves mixtures and can reveal process impurities/reaction products for quality control with suitable standards. Peak areas become quantities only after detector-response/calibration checks; uncalibrated areas do not give percentages. This is the NI evaluation/explanation operator, not a claimed GC operation record.
  - Understanding focus (DE): Gaschromatografie verwendet dieselbe Phasen-/Referenzlogik mit einer anderen Bezugsgröße und explizitem analytischem Nutzen.
  - Understanding focus (EN): GC uses the same phase/reference reasoning with a different reference quantity and explicit analytical value.
- `gc-own-application-and-reaction-product-transfer`
  - Task demand (DE): Wende das schulisch freigegebene GC-Verfahren unter fachkundiger Aufsicht selbst an: sichere die vom Gerät vorgegebenen Startprüfungen und das freigegebene Methodenprogramm, miss Leerprobe und Standards, gib danach das bereitgestellte flüchtige Modell-Reaktionsgemisch auf und dokumentiere deine eigene Messdatei samt Bedingungen. Beurteile mit Referenzen vor/nach der Modellreaktion, ob ein zusätzliches Produkt nachweisbar ist. Führe eine Co-Injektion mit dem möglichen Produktstandard durch und erkläre, weshalb sie die Zuordnung verbessert, aber bei Coelution keinen absoluten Strukturbeweis liefert.
  - Task demand (EN): Personally apply the school-approved GC method under expert supervision: complete prescribed start checks and the authorized programme, measure blank and standards, then introduce the supplied volatile model reaction mixture and preserve your own file with conditions. Use references before/after the model reaction to assess an additional detectable product. Perform a co-injection with the possible product standard and explain why this improves assignment but is not absolute structural proof under coelution.
  - Expected performance (DE): Originaldatei mit eigener Arbeit, Leerprobe und Standards sowie dokumentierte Säule, stationäre Phase, Trägergas, Fluss-/Temperaturprogramm, Detektor und Probe sind erforderlich. Synthetisches Beispiel: Eduktstandard 2,40 min, Produktstandard 4,80 min; vorher Peak 2,39, nachher 2,40 und 4,81 min; Leerprobe ohne passende Peaks. Co-Injektion vergrößert nur den 4,81-Peak ohne neue aufgelöste Bande und stützt Produktzuordnung. Die begründete Aussage ist ein neuer zu diesem Standard passender Bestandteil, nicht vollständiger Umsatz oder sichere Strukturidentität. Bei geändertem Programm werden Standards neu gemessen, alte Retentionszeiten nicht blind verwendet. Flüchtigkeit/Phasenwechselwirkungen erklären den neuen Retentionsweg. Der Ausdruck einer fremden Messreihe erfüllt persönliche Anwendung nicht.
  - Expected performance (EN): Own original work/file, blank, standards and recorded column, stationary phase, carrier gas, flow/temperature programme, detector and sample are required. Synthetic example: reactant reference 2.40 min, product reference 4.80 min; before peak 2.39, after 2.40 and 4.81 min; blank has no matching peaks. Co-injection enlarges only the 4.81 peak with no newly resolved peak, supporting product assignment. The bounded claim is a new component matching that standard, not complete conversion or certain structural identity. A changed programme requires renewed standards instead of blindly reusing retention times. Volatility/phase interactions explain the new retention path. Someone else's printed dataset does not satisfy personal application.
  - Understanding focus (DE): Reaktionsprodukt als echter neuer GC-Kontext mit eigener Bedienung, Leerprobe und Co-Injektion; Datenlesen ersetzt Anwendung nicht.
  - Understanding focus (EN): Reaction products provide a genuinely new GC context with personal operation, blank and co-injection; reading data does not replace application.
## Page 5: Michaelis–Menten-Modell als Vertiefung deuten

- Full learning-goal ID: `c245d5fd-ce46-5b45-ab2e-e610547b5f7c`
- Goal fingerprint: `sha256:27f69338d2a92dbb425ca8b6838b667f2b8c8833040b6c7037169600cb005b50`
- Page fingerprint: `sha256:94065751fe0d52ff6852453013b9df2e3ec39e659919c88ca4cfc8a327496b6d`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann im einfachen Michaelis–Menten-Modell Anfangsraten bei veränderter Substratkonzentration deuten, Sättigung und Km als Substratkonzentration bei halber Grenzrate erklären und die Gültigkeit der eigenen quantitativen Vertiefung auf konstante Untersuchungsbedingungen begrenzen.

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

- Enzymreaktionen und Hemmung modellieren — `f7f35d71-927a-511c-a49e-65a66794a9bc` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6bd5ab76c4ab17cae787fdd76740dfd9225f5ca7177e966ba18ceff3e215fb1b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `mm-saturation-data`
  - Essential understanding (DE): Modellparameter werden mit Einheiten, Sättigung und begrenzter Deutung verknüpft.
  - Essential understanding (EN): Model parameters are linked to units, saturation and bounded interpretation.
  - Observable performance (DE): v0=20; 50; 80 µmol L−1 min−1. Der Konzentrationsquotient ist dimensionslos; Km hat dieselbe Einheit wie [S]. Bei [S]=Km ergibt sich die halbe Grenzrate; hohe [S] nähert v0 der Grenzrate an, erreicht sie bei endlichem [S] im Modell nicht exakt. Sättigung ist die begrenzte katalytische Kapazität des einfachen Modells, nicht unbegrenztes Wachstum der Rate. Anfangsrate beschreibt Konzentrationsänderung pro Zeit, keine gesamte Produktmenge. Km ist hier der Modellparameter für halbe Grenzrate; ohne weitere mechanistische Bedingungen folgt keine Gleichsetzung mit Affinität oder Dissoziationskonstante.
  - Observable performance (EN): v0=20, 50 and 80 µmol L−1 min−1. The concentration ratio is dimensionless; Km has the same unit as [S]. At [S]=Km the rate is half the limiting rate; high [S] approaches the limit but does not reach it exactly at finite [S] in this model. Saturation represents bounded catalytic capacity of the simple model, not unlimited rate growth. Initial rate is concentration change per time, not total product amount. Km is the model parameter for half-limiting rate; affinity or dissociation-constant identity requires further mechanistic conditions.
- `mm-enzyme-amount-transfer`
  - Essential understanding (DE): Neue aktive Enzymmenge und ein verändertes Messzeitfenster prüfen Modelltransfer und Schlussgrenze.
  - Essential understanding (EN): Changed active enzyme amount and time window assess model transfer and inference limits.
  - Observable performance (DE): Vmax verdoppelt sich auf 200 µmol L−1 min−1, Km bleibt 2,0 mmol L−1; bei [S]=2,0 ergibt v0=100=Vmax/2. Im einfachen Modell skalieren alle Anfangsraten mit aktiver Enzymmenge, sofern übrige Bedingungen gleich sind. Eine spätere Zeitkurve hat veränderliche [S] und gegebenenfalls Produkt/Enzymaktivität; sie ist nicht die gemessene Anfangsratenreihe bei konstant vorgegebenen Startkonzentrationen. Starke Inaktivierung, kooperative Kinetik oder ein nicht festgehaltener zweiter Substratpartner können diesen einfachen Ein-Substrat-Ansatz verlassen. Kein Schluss, jede Rate müsse stets exakt doppelt sein.
  - Observable performance (EN): Vmax doubles to 200 µmol L−1 min−1 while Km stays 2.0 mmol L−1; at [S]=2.0, v0=100=Vmax/2. In the simple model all initial rates scale with active enzyme amount if other conditions stay fixed. A later time course changes [S] and potentially product/enzyme activity, so it is not the initial-rate series with fixed starting concentrations. Strong inactivation, cooperative kinetics or an unfixed second substrate can leave this simple one-substrate setting. It does not imply that every observed rate always doubles exactly.

**Coverage expectations**

- required expectations: `mm-saturation-data`, `mm-enzyme-amount-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `actual-operator-transfer`: Die vollständig ausgearbeiteten Fälle wechseln die konkret genannten Struktur-, Phasen-, Proben-, Mess- oder Modellbedingungen. Methodenspezifische Quellenpflichten sind keine beliebigen Alternativen. Durchführungsaufgaben erfordern reale Eigenarbeit; synthetische Muster erfüllen sie nicht. / Complete worked cases vary the specified structure, phase, sample, measurement or model conditions. Source-specific method duties are not interchangeable alternatives. Execution requires actual own work; synthetic fixtures do not satisfy it.

**Application cases**

- `mm-saturation-data`
  - Task demand (DE): Eigene quantitative Vertiefung: Für v0=Vmax[S]/(Km+[S]) gelten Vmax=100 µmol L−1 min−1 und Km=2,0 mmol L−1 bei gleicher aktiver Enzymmenge, pH und Temperatur. Berechne und erkläre Anfangsraten bei [S]=0,5; 2,0; 8,0 mmol L−1. Erkläre Sättigung und weshalb Km weder Produktmenge noch allgemein ein Bindungsgleichgewicht ist.
  - Task demand (EN): Own quantitative enrichment: For v0=Vmax[S]/(Km+[S]), Vmax=100 µmol L−1 min−1 and Km=2.0 mmol L−1 at fixed active enzyme amount, pH and temperature. Compute and explain initial rates at [S]=0.5, 2.0 and 8.0 mmol L−1. Explain saturation and why Km is neither product amount nor generally a binding equilibrium constant.
  - Expected performance (DE): v0=20; 50; 80 µmol L−1 min−1. Der Konzentrationsquotient ist dimensionslos; Km hat dieselbe Einheit wie [S]. Bei [S]=Km ergibt sich die halbe Grenzrate; hohe [S] nähert v0 der Grenzrate an, erreicht sie bei endlichem [S] im Modell nicht exakt. Sättigung ist die begrenzte katalytische Kapazität des einfachen Modells, nicht unbegrenztes Wachstum der Rate. Anfangsrate beschreibt Konzentrationsänderung pro Zeit, keine gesamte Produktmenge. Km ist hier der Modellparameter für halbe Grenzrate; ohne weitere mechanistische Bedingungen folgt keine Gleichsetzung mit Affinität oder Dissoziationskonstante.
  - Expected performance (EN): v0=20, 50 and 80 µmol L−1 min−1. The concentration ratio is dimensionless; Km has the same unit as [S]. At [S]=Km the rate is half the limiting rate; high [S] approaches the limit but does not reach it exactly at finite [S] in this model. Saturation represents bounded catalytic capacity of the simple model, not unlimited rate growth. Initial rate is concentration change per time, not total product amount. Km is the model parameter for half-limiting rate; affinity or dissociation-constant identity requires further mechanistic conditions.
  - Understanding focus (DE): Modellparameter werden mit Einheiten, Sättigung und begrenzter Deutung verknüpft.
  - Understanding focus (EN): Model parameters are linked to units, saturation and bounded interpretation.
- `mm-enzyme-amount-transfer`
  - Task demand (DE): Bei gleichbleibender Temperatur und gleichem pH wird allein die aktive Enzymmenge verdoppelt. Eine neue synthetische Reihe bei [S]=0,5; 2,0; 8,0 mmol L−1 hat Anfangsraten 40; 100; 160 µmol L−1 min−1. Leite das veränderte Vmax und das unveränderte Km aus dem einfachen Modell ab. Beurteile, ob eine später fallende Rate im selben Ansatz wegen Substratverbrauch ebenso mit diesen Anfangsdaten erklärt werden kann, und nenne eine weitere Modellgrenze.
  - Task demand (EN): At fixed temperature and pH, only active enzyme amount is doubled. A new synthetic series at [S]=0.5, 2.0 and 8.0 mmol L−1 has initial rates 40, 100 and 160 µmol L−1 min−1. Derive changed Vmax and unchanged Km in the simple model. Assess whether a later declining rate in the same assay due to substrate depletion can be interpreted as these initial data, and state another model limitation.
  - Expected performance (DE): Vmax verdoppelt sich auf 200 µmol L−1 min−1, Km bleibt 2,0 mmol L−1; bei [S]=2,0 ergibt v0=100=Vmax/2. Im einfachen Modell skalieren alle Anfangsraten mit aktiver Enzymmenge, sofern übrige Bedingungen gleich sind. Eine spätere Zeitkurve hat veränderliche [S] und gegebenenfalls Produkt/Enzymaktivität; sie ist nicht die gemessene Anfangsratenreihe bei konstant vorgegebenen Startkonzentrationen. Starke Inaktivierung, kooperative Kinetik oder ein nicht festgehaltener zweiter Substratpartner können diesen einfachen Ein-Substrat-Ansatz verlassen. Kein Schluss, jede Rate müsse stets exakt doppelt sein.
  - Expected performance (EN): Vmax doubles to 200 µmol L−1 min−1 while Km stays 2.0 mmol L−1; at [S]=2.0, v0=100=Vmax/2. In the simple model all initial rates scale with active enzyme amount if other conditions stay fixed. A later time course changes [S] and potentially product/enzyme activity, so it is not the initial-rate series with fixed starting concentrations. Strong inactivation, cooperative kinetics or an unfixed second substrate can leave this simple one-substrate setting. It does not imply that every observed rate always doubles exactly.
  - Understanding focus (DE): Neue aktive Enzymmenge und ein verändertes Messzeitfenster prüfen Modelltransfer und Schlussgrenze.
  - Understanding focus (EN): Changed active enzyme amount and time window assess model transfer and inference limits.
## Page 6: Angeleitete chemische Untersuchungen sicher durchführen

- Full learning-goal ID: `e81a4aed-9695-533e-8eb7-7a0c714346ea`
- Goal fingerprint: `sha256:92f51b1cba59a6815ef76e9e008073166aafab689c672f39c20e8791e7e6c17d`
- Page fingerprint: `sha256:3494ca080adfc317ad08d053efbb2f0328f86ad84ee50dea5a0d32693370504f`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemische Fragestellungen hypothesengeleitet untersuchen

### Canonical description

Die lernende Person kann eine angeleitete chemische Untersuchung zu einem Alltags- oder Technikphänomen sicher durchführen, vorgegebene Einflussgrößen und Arbeitsschritte beachten, Beobachtungen oder Messwerte nachvollziehbar protokollieren und erläutern, wie der Versuch die Ausgangshypothese prüft.

### Visualization

/assets/goal-visualizations/chemie/e81a4aed-9695-533e-8eb7-7a0c714346ea/e81a4aed-9695-533e-8eb7-7a0c714346ea.jpg

- original digest: `sha256:5d0bd0692667e0dbc912ca19adab557782501feb572936a4e44253e626416b45`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Allgemeine Sicherheitsregeln im Chemielabor anwenden — `13d4f336-ab16-54a7-9479-c920b458f385` (outside this book)

### Direct reverse prerequisites outside this book

- Fortgeschrittene Labor- und Praeparationstechniken sicher anwenden — `cf2631d9-da24-50e8-9e50-db625e6efaad` (outside this book)
- Chemische Untersuchungen selbst planen und durchführen — `42391b16-bbae-5c77-84e1-d488e714167b` (outside this book)
- Eigene chemische Untersuchungen reflektieren — `99d41b0f-e958-54cf-a077-9bed1704a303` (outside this book)
- Lebensmittelinhaltsstoffe experimentell nachweisen — `8fe39739-2938-5e2c-8db2-08572b44569a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8b247e5e0cd2ec021687a03444186fd66e1b63da6168aa782c81c10fb5a5956b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `guided-safe-action`
  - Essential understanding (DE): Ein vorgegebenes Untersuchungsverfahren liefert nur bei tatsächlich sicher ausgeführten, vergleichbaren Schritten einen prüfbaren Befund.
  - Essential understanding (EN): A prescribed procedure yields a testable finding only through actually safe, comparable execution.
  - Observable performance (DE): Führt nach konkreter Lehrkraftfreigabe die vorgegebenen Leitfähigkeits- oder Auflösungsschritte aus, kontrolliert Variablen und hält tatsächliche Handlung, Abweichung und Stopp fest.
  - Observable performance (EN): After specific teacher release executes the prescribed conductivity or dissolution steps, controls variables and records actual action, deviation and stop.
- `own-observation-record`
  - Essential understanding (DE): Eigene Beobachtungen und Messwerte sind von Referenzdaten, Geräteauflösung und vollständig bekannter Unsicherheit zu unterscheiden.
  - Essential understanding (EN): Own observations and readings differ from reference data, instrument resolution and fully known uncertainty.
  - Observable performance (DE): Protokolliert eigene Zeit-/Temperatur- oder Leitfähigkeitswerte mit Einheiten, Blank/Rinsung bzw. definiertem Endpunkt und Wiederholung; Musterwerte werden als Muster bezeichnet. Standardprüfung mit0–5000µS/cm im ganzen1970–2010-Bereich bei25°C, tatsächlichen Bereich/Modus/Gerätespezifikation protokollieren; Auflösung nicht als Genauigkeit.
  - Observable performance (EN): Records own time/temperature or conductivity readings with units, blank/rinsing or defined endpoint and repeat; labels reference values as references. Log the standard check on0–5000µS/cm over1970–2010 at25°C with actual range/mode/instrument specification; resolution is not accuracy.
- `hypothesis-and-confound`
  - Essential understanding (DE): Mobile Ionen erklären Leitfähigkeit; Auflösungsdauer hängt unter anderem von Temperatur, Körnung und Rühren ab.
  - Essential understanding (EN): Mobile ions explain conductivity; dissolution time depends on temperature, grain size and stirring among other factors.
  - Observable performance (DE): Bezieht eigene Ergebnisse auf die Hypothese, erklärt die passenden chemischen Zusammenhänge und entwirft zur frischen Störvariable einen sicheren Kontrollvergleich.
  - Observable performance (EN): Relates own results to the hypothesis, explains the appropriate chemical relations and designs a safe control comparison for the fresh confound.
- `bw-halogen-addition-own-guided-execution`
  - Essential understanding (DE): Praktischer Halogen-Operator und Mechanismus bleiben eigenständig erhalten und ersetzen nicht den physikalischen Transfer.
  - Essential understanding (EN): The practical halogen operator and mechanism remain independently preserved and do not replace physical transfer.
  - Observable performance (DE): Eigenes Protokoll enthält Stoffe, Konzentrationen/Mengen, Zeiten, Kontroll- und Leerbefunde. Im trockenen nichtnucleophilen, freigegebenen Modellmedium liefert R–CH=CH–R′ + Br2 → R–CHBr–CHBr–R′; das π-Paar polarisiert Br2, Br–Br wird heterolytisch gespalten, ein verbrücktes Bromoniumion entsteht und Br− greift von der Gegenseite an (anti-Addition). Synthetischer Musterbefund: Ungesättigte Probe entfärbt nach 10 s, gesättigte Kontrolle/Leerprobe bleiben unter gleichen Dunkelbedingungen nach 30 s gefärbt. Das stützt reaktive C=C im Modell; in Gemischen stören andere Brom-verbrauchende Stoffe und schlechte Durchmischung. Wasser als Medium kann Bromhydrinbildung ermöglichen, deshalb darf die Modellgleichung für trockenes Medium nicht ungeprüft auf Bromwasser übertragen werden. Baeyer-Reagenz oxidiert Doppelbindungen unter Permanganatreduktion und ist nicht dieser elektrophile Halogennachweis. Ohne standardisierte quantitative Bestimmung ist keine Iodzahl, Fettsäurezusammensetzung oder Ernährungsqualität belegt.
  - Observable performance (EN): The own record includes substances, concentrations/amounts, times, controls and blank observations. In the approved dry non-nucleophilic model medium, R–CH=CH–R′ + Br2 → R–CHBr–CHBr–R′; the π pair polarizes Br2, Br–Br cleaves heterolytically, a bridged bromonium ion forms and Br− attacks from the opposite side (anti addition). Synthetic fixture: unsaturated sample decolourizes after 10 s while saturated control/blank remain coloured after 30 s under matched dark conditions. This supports reactive C=C in the model; other bromine-consuming components and poor mixing interfere in mixtures. Water can permit bromohydrin formation, so the dry-medium equation cannot simply be transferred to bromine water. Baeyer reagent oxidizes double bonds while reducing permanganate and is not this electrophilic halogen test. No iodine value, fatty-acid composition or nutritional quality follows without a standardized quantitative determination.
- `bw-halogen-addition-cis-trans-guided-transfer`
  - Essential understanding (DE): Die sichere Ausführung folgt einer neuen vorgegebenen Hypothese und trennt Nachweisbefund von physikalischer Eigenschaft.
  - Essential understanding (EN): Safe execution follows a new prescribed hypothesis and separates a detection result from a physical property.
  - Observable performance (DE): Die neue Variable ist cis/trans, nicht Anzahl der C=C, Stoffmenge, Brommenge, Temperatur oder Schüttelzeit. Eigenes Protokoll prüft diese Gleichhaltung. Synthetischer Musterbefund: beide einfach ungesättigten Ester entfärben nach 10 s; Kontrolle und Leerprobe bleiben 30 s gefärbt. Das stützt die Hypothese über C=C-Reaktivität unter diesen Bedingungen. Es bestimmt keine genaue Kennzahl und beweist weder identische Geschwindigkeit noch gleiche Konsistenz. cis/trans verändert Packung und damit Schmelzen, obwohl der qualitative Halogennachweis ähnlich ausfallen kann. Die angeleitete Durchführung wird anhand eigener Handlung und Originaldaten bewertet; das Mechanismusurteil bleibt ein begrenzter Beitrag des vorhandenen 3fb7-Partners.
  - Observable performance (EN): The new variable is cis/trans, not C=C count, substance amount, bromine amount, temperature or mixing time. The own record checks these controls. Synthetic fixture: both monounsaturated esters decolourize after 10 s, while control/blank remain coloured for 30 s. This supports the C=C-reactivity hypothesis under these conditions. It gives no exact index and proves neither identical rate nor equal consistency. cis/trans changes packing and melting even when the qualitative halogen test behaves similarly. Guided execution is assessed from own action and original data; mechanistic assessment stays a bounded contribution from the existing 3fb7 partner.

**Coverage expectations**

- required expectations: `guided-safe-action`, `own-observation-record`, `hypothesis-and-confound`, `bw-halogen-addition-own-guided-execution`, `bw-halogen-addition-cis-trans-guided-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `probe-carryover`: Ungespülte Sonde wird nur als Fehlerhypothese beurteilt, nicht absichtlich unsicher benutzt. / An unrinsed probe is assessed as an error hypothesis, not deliberately used unsafely.
- `particle-size`: Unterschiedliche Körnung wird vom Temperatureffekt getrennt; vorgegebene Sicherheit bleibt verbindlich. / Different grain size is separated from temperature effects; prescribed safety remains mandatory.
- `adequate-standard-check-range`: Der Prüfbereich muss den gesamten Etikettbereich 1970–2010 µS/cm abdecken; 2010 ist kein Überlauf auf0–5000. Geräteanleitung und tatsächliche Genauigkeits-/Prüfspezifikation sowie Bereich, Modus, Auflösung, Rohanzeige, Standardcharge/Gültigkeit und tatsächlich gemessene25-°C-Referenztemperatur werden dokumentiert. Auflösung garantiert weder Genauigkeit noch bestandene Prüfung. Bei Überlauf, nicht einhaltbarer Prüfbedingung oder nicht bestätigter Standardprüfung stoppen und Lehrkraft klären lassen; keine fiktiven Erfolgswerte eintragen. / The check range must cover the whole label interval1970–2010 µS/cm;2010 is not over-range on0–5000. Record the instrument instructions and actual accuracy/check specification, range, mode, resolution, raw indication, standard batch/validity and actually measured25-°C reference temperature. Resolution guarantees neither accuracy nor a successful check. Stop and consult the teacher for over-range, unavailable check conditions or an unconfirmed check; enter no fictional successful readings.
- `actual-operator-transfer`: Die vollständig ausgearbeiteten Fälle wechseln die konkret genannten Struktur-, Phasen-, Proben-, Mess- oder Modellbedingungen. Methodenspezifische Quellenpflichten sind keine beliebigen Alternativen. Durchführungsaufgaben erfordern reale Eigenarbeit; synthetische Muster erfüllen sie nicht. / Complete worked cases vary the specified structure, phase, sample, measurement or model conditions. Source-specific method duties are not interchangeable alternatives. Execution requires actual own work; synthetic fixtures do not satisfy it.

**Application cases**

- `lower-guided-hypothesis-investigation-conductivity`
  - Task demand (DE): Führe die angeleiteten Schritte wirklich unter Betreuung aus und protokolliere deine eigenen Werte, einschließlich Blindprobe. Erkläre erst danach, ob deine Beobachtung die bereitgestellte Hypothese stützt.
Frische Variation: Spüle die Sonde absichtlich nicht: Führe dies nicht aus, sondern erkläre anhand deines echten Protokolls die mögliche Fehlerwirkung und welche sichere Kontrollmessung folgen sollte.
Der Prüfbereich muss den gesamten Etikettbereich 1970–2010 µS/cm abdecken; 2010 ist kein Überlauf auf0–5000. Geräteanleitung und tatsächliche Genauigkeits-/Prüfspezifikation sowie Bereich, Modus, Auflösung, Rohanzeige, Standardcharge/Gültigkeit und tatsächlich gemessene25-°C-Referenztemperatur werden dokumentiert. Auflösung garantiert weder Genauigkeit noch bestandene Prüfung. Bei Überlauf, nicht einhaltbarer Prüfbedingung oder nicht bestätigter Standardprüfung stoppen und Lehrkraft klären lassen; keine fiktiven Erfolgswerte eintragen.
  - Task demand (EN): Actually carry out the guided steps under supervision and record your own values, including the blank. Then explain whether your observation supports the supplied hypothesis.
Fresh variation: Consider an unrinsed probe without deliberately performing this error: explain the possible effect from your actual log and a suitable safe control measurement.
The check range must cover the whole label interval1970–2010 µS/cm;2010 is not over-range on0–5000. Record the instrument instructions and actual accuracy/check specification, range, mode, resolution, raw indication, standard batch/validity and actually measured25-°C reference temperature. Resolution guarantees neither accuracy nor a successful check. Stop and consult the teacher for over-range, unavailable check conditions or an unconfirmed check; enter no fictional successful readings.
  - Expected performance (DE): Ein vollständiger Nachweis besteht aus beobachteter sicherer Durchführung und echtem Protokoll, nicht aus dieser Musterantwort. Erwartbarer Trend: NaCl-Lösung leitet deutlich stärker als die Blindprobe; Saccharose-Lösung bleibt nahe deren Wert. Erklärung: gelöste bewegliche Ionen gegenüber ungeladenen Zuckermolekülen. Abweichende Werte werden dokumentiert und mögliche Verschleppung untersucht, nicht passend erfunden.
Frischer Transfer: Zunächst das eigene tatsächliche Reihenfolge-/Spül-/Blankprotokoll prüfen. Restliche Salzlösung an einer ungespülten Sonde kann zusätzliche Ionen in Wasser oder Saccharoselösung übertragen und deren Wert erhöhen. Das ist eine Fehlerhypothese, keine festgestellte eigene Beobachtung und kein Auftrag, den Fehler absichtlich auszuführen. Nach Lehrkraftfreigabe gemäß Originalprotokoll spülen, frische Blankprobe vor/nach den Proben messen und bei gleicher Temperatur die betroffene Probe wiederholen. Eigene neue Rohwerte und Abweichungen dokumentieren; Rückgang des Blankwerts nach Spülung unterstützt Verschleppung. Bei unverändert hohem Blank sind weitere Ursachen zu prüfen. Referenzdaten ersetzen diese tatsächlichen Schritte nicht.
  - Expected performance (EN): Complete evidence requires observed safe execution and an actual log, not this reference answer. Expected trend: NaCl solution conducts much more than the blank; sucrose solution stays near it. Explanation: mobile dissolved ions versus uncharged sugar molecules. Deviant values are documented and possible carryover investigated, not invented to fit.
Fresh transfer: First examine the actual own order/rinsing/blank record. Salt solution remaining on an unrinsed probe can transfer additional ions to water or sucrose solution and raise its reading. This is an error hypothesis, not an established own observation or an instruction to execute the error deliberately. After teacher release rinse according to the original protocol, measure a fresh blank before/after samples and repeat the affected sample at equal temperature. Record own new raw readings and deviations; a reduced blank after rinsing supports carry-over. A persistently high blank requires other causes to be checked. Reference data do not replace these actual steps.
  - Understanding focus (DE): Kontamination wird aus eigener Dokumentation geprüft und durch sichere Blank-/Spülkontrolle unterschieden.
  - Understanding focus (EN): Contamination is examined from own documentation and distinguished through safe blank/rinsing controls.
- `lower-guided-hypothesis-investigation-dissolution`
  - Task demand (DE): Führe beide Bedingungen und eine Wiederholung nach Anleitung aus; protokolliere echte Starttemperaturen und Auflösezeiten. Begründe den Vergleich und berichte eine Abweichung ehrlich.
Frische Variation: Begründe mit deinem Log, wie ein gröberer Zucker bei nur einer Temperatur den Vergleich verfälschen könnte.
  - Task demand (EN): Carry out both conditions and one repeat as instructed; record actual starting temperatures and dissolution times. Justify the comparison and honestly report a deviation.
Fresh variation: Use your log to explain how coarser sugar at only one temperature could distort the comparison.
  - Expected performance (DE): Gleiche Masse, Kornform, Volumen und Rührweise ermöglichen einen Temperaturvergleich. Eigene Zeiten und Temperaturen werden eingetragen; kürzere Zeiten bei 40 °C stützen die konkrete Auflösegeschwindigkeits-Hypothese. Gleiche Zeiten können auf kleine Temperaturdifferenz oder ungenauen Endpunkt hinweisen. Der Versuch misst nicht die maximal lösbare Zuckermasse.
Frischer Transfer: Wurde nur in einem Temperaturansatz gröberer Zucker benutzt, sind Temperatur und zugängliche Oberfläche gemeinsam verändert. Aus der beobachteten Dauer allein kann der Temperatureffekt nicht getrennt werden. Die betroffenen Einträge im eigenen Korn-/Temperatur-/Zeitprotokoll benennen; alte Werte bewahren. Einen neuen freigegebenen Vergleich mit gleicher Sorte, Körnung, Masse, Wassermenge, Rührweise und Endpunkt durchführen; nur Temperatur ändert sich. Wiederholungen und eigene tatsächliche Zeiten erlauben eine neue Bewertung. Schnellere Auflösung belegt weiterhin keine höhere maximale Löslichkeit. Ohne eigenes Protokoll bleiben Durchführung und Ergebnis offen.
  - Expected performance (EN): Equal mass, grain shape, volume and stirring allow a temperature comparison. Own times and temperatures are entered; shorter times at 40 °C support the specific dissolution-rate hypothesis. Equal times may indicate a small temperature difference or an imprecise endpoint. The experiment does not measure maximum dissolvable sugar mass.
Fresh transfer: If coarser sugar was used in only one temperature condition, both temperature and accessible surface area changed. The observed time alone cannot isolate the temperature effect. Identify the affected entries in the own grain/temperature/time record and retain the old values. Execute a newly released comparison with equal type, grain size, mass, water volume, stirring and endpoint; change temperature alone. Repeats and actual own times permit reassessment. Faster dissolution still does not demonstrate greater maximum solubility. Without an own record execution and result remain open.
  - Understanding focus (DE): Eigener angeleiteter Vergleich trennt Körnung und Temperatur statt Referenzwerte als Durchführung zu verwenden.
  - Understanding focus (EN): An own guided comparison separates grain size and temperature rather than treating reference readings as execution.
- `bw-halogen-addition-own-guided-execution`
  - Task demand (DE): Führe nach der vollständig freigegebenen lokalen Arbeitsanweisung selbst betreut den Bromnachweis an einem definierten ungesättigten Fettsäurerest-Modell und einer gesättigten Kontrolle durch. Verwende gleiche Stoff-/Lösungsmittelmengen, Leerprobe, gleiche Bromzugabe, gleiche Schüttel- und Beobachtungszeit ohne UV-Bestrahlung. Protokolliere dein Original und erkläre die entfärbende elektrophile Addition mit Elektronenpaarpfeilen über ein Bromoniumion und den Angriff von Bromid. Vergleiche ausdrücklich mit Baeyer-Oxidation und erkläre die Grenze der Aussage über ein natürliches Fettgemisch.
  - Task demand (EN): Personally perform the supervised bromine test on a defined unsaturated fatty-acid-residue model and saturated control under a fully authorized local method. Use matched substance/solvent amounts, a blank, equal bromine addition, mixing and observation times without UV. Preserve your original record and explain decolourizing electrophilic addition with electron-pair arrows through a bromonium ion and bromide attack. Explicitly compare with Baeyer oxidation and explain inference limits for a natural fat mixture.
  - Expected performance (DE): Eigenes Protokoll enthält Stoffe, Konzentrationen/Mengen, Zeiten, Kontroll- und Leerbefunde. Im trockenen nichtnucleophilen, freigegebenen Modellmedium liefert R–CH=CH–R′ + Br2 → R–CHBr–CHBr–R′; das π-Paar polarisiert Br2, Br–Br wird heterolytisch gespalten, ein verbrücktes Bromoniumion entsteht und Br− greift von der Gegenseite an (anti-Addition). Synthetischer Musterbefund: Ungesättigte Probe entfärbt nach 10 s, gesättigte Kontrolle/Leerprobe bleiben unter gleichen Dunkelbedingungen nach 30 s gefärbt. Das stützt reaktive C=C im Modell; in Gemischen stören andere Brom-verbrauchende Stoffe und schlechte Durchmischung. Wasser als Medium kann Bromhydrinbildung ermöglichen, deshalb darf die Modellgleichung für trockenes Medium nicht ungeprüft auf Bromwasser übertragen werden. Baeyer-Reagenz oxidiert Doppelbindungen unter Permanganatreduktion und ist nicht dieser elektrophile Halogennachweis. Ohne standardisierte quantitative Bestimmung ist keine Iodzahl, Fettsäurezusammensetzung oder Ernährungsqualität belegt.
  - Expected performance (EN): The own record includes substances, concentrations/amounts, times, controls and blank observations. In the approved dry non-nucleophilic model medium, R–CH=CH–R′ + Br2 → R–CHBr–CHBr–R′; the π pair polarizes Br2, Br–Br cleaves heterolytically, a bridged bromonium ion forms and Br− attacks from the opposite side (anti addition). Synthetic fixture: unsaturated sample decolourizes after 10 s while saturated control/blank remain coloured after 30 s under matched dark conditions. This supports reactive C=C in the model; other bromine-consuming components and poor mixing interfere in mixtures. Water can permit bromohydrin formation, so the dry-medium equation cannot simply be transferred to bromine water. Baeyer reagent oxidizes double bonds while reducing permanganate and is not this electrophilic halogen test. No iodine value, fatty-acid composition or nutritional quality follows without a standardized quantitative determination.
  - Understanding focus (DE): Praktischer Halogen-Operator und Mechanismus bleiben eigenständig erhalten und ersetzen nicht den physikalischen Transfer.
  - Understanding focus (EN): The practical halogen operator and mechanism remain independently preserved and do not replace physical transfer.
- `bw-halogen-addition-cis-trans-guided-transfer`
  - Task demand (DE): Prüfe in einer neuen angeleiteten Untersuchung die Hypothese: Gleiche Anzahl an C=C pro Molekül kann trotz unterschiedlicher räumlicher Konfiguration zum gleichen begrenzten Bromverbrauch führen. Führe den freigegebenen Mikrotest selbst mit gleich konzentrierten Methyloleat- und Methylelaidat-Lösungen, der Methylstearatkontrolle und Heptanleerprobe aus. Halte die vorgegebenen Mengen/Zeiten ein, sichere Originalbeobachtungen und begründe, was der Versuch über Ungesättigtheit und was er über die Konsistenz der zugehörigen Fettmodelle aussagt.
  - Task demand (EN): In a new guided investigation, test: Equal C=C counts per molecule can produce the same limited bromine consumption despite different spatial configuration. Personally perform the approved microscale test with equal-concentration methyl oleate and methyl elaidate, a methyl stearate control and heptane blank. Follow prescribed quantities/times, preserve original observations and explain what the test establishes about unsaturation and what it establishes about consistency of the corresponding fat models.
  - Expected performance (DE): Die neue Variable ist cis/trans, nicht Anzahl der C=C, Stoffmenge, Brommenge, Temperatur oder Schüttelzeit. Eigenes Protokoll prüft diese Gleichhaltung. Synthetischer Musterbefund: beide einfach ungesättigten Ester entfärben nach 10 s; Kontrolle und Leerprobe bleiben 30 s gefärbt. Das stützt die Hypothese über C=C-Reaktivität unter diesen Bedingungen. Es bestimmt keine genaue Kennzahl und beweist weder identische Geschwindigkeit noch gleiche Konsistenz. cis/trans verändert Packung und damit Schmelzen, obwohl der qualitative Halogennachweis ähnlich ausfallen kann. Die angeleitete Durchführung wird anhand eigener Handlung und Originaldaten bewertet; das Mechanismusurteil bleibt ein begrenzter Beitrag des vorhandenen 3fb7-Partners.
  - Expected performance (EN): The new variable is cis/trans, not C=C count, substance amount, bromine amount, temperature or mixing time. The own record checks these controls. Synthetic fixture: both monounsaturated esters decolourize after 10 s, while control/blank remain coloured for 30 s. This supports the C=C-reactivity hypothesis under these conditions. It gives no exact index and proves neither identical rate nor equal consistency. cis/trans changes packing and melting even when the qualitative halogen test behaves similarly. Guided execution is assessed from own action and original data; mechanistic assessment stays a bounded contribution from the existing 3fb7 partner.
  - Understanding focus (DE): Die sichere Ausführung folgt einer neuen vorgegebenen Hypothese und trennt Nachweisbefund von physikalischer Eigenschaft.
  - Understanding focus (EN): Safe execution follows a new prescribed hypothesis and separates a detection result from a physical property.
