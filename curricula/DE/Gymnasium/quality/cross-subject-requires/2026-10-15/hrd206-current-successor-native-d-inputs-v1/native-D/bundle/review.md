# AI review input: Physik – aktueller HRD206-Kontext

- Book ID: `physik-hrd206-current-successor-context-20261015-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:97ded962ef02ae8afb77757d19e856d4268caee5a65961e0afe490c4f96183dc`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Hertzsprung-Russell-Diagramm (HRD)

- Full learning-goal ID: `206fe51d-cc78-5422-b139-32cc97eb1c37`
- Goal fingerprint: `sha256:3bc6b685e1c98a91258200891411cc8711b259a090c3c21ab98ee9b96db294b2`
- Page fingerprint: `sha256:f38bd45236f426f0ed0e9768961e9914cde402e57ecc60fa82d39d5880a279ad`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Astrophysik > Sternentstehung und Sternentwicklung

### Canonical description

Die lernende Person kann Sterne anhand ihrer Leuchtkraft und Oberflächentemperatur im Hertzsprung-Russell-Diagramm einordnen und die Bereiche Hauptreihe, Rote Riesen und Weiße Zwerge im Zusammenhang mit der Sternentwicklung deuten.

### Visualization

/assets/goal-visualizations/physik/206fe51d-cc78-5422-b139-32cc97eb1c37/206fe51d-cc78-5422-b139-32cc97eb1c37.png

- original digest: `sha256:242f17adcdc7783fe4dab5927aa1a4b2c4e98e8285482a332bbec50e1bbcf6a4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Aufbau des Sonnensystems beschreiben — `af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93` (outside this book)

### Direct reverse prerequisites outside this book

- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Sterntypen und Entwicklung — `6f896466-e0ec-5f8d-82ad-2890433c82ba` (outside this book)
- Sternentfernungen mit dem HRD abschätzen — `3a4b2f86-5c59-5429-8fb4-75d9b2589cb5` (outside this book)
- Sternradien aus HRD-Daten abschätzen — `6a73cacc-e86d-5248-a180-fd3da8454b0f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:218c679bfe4366041c026b22204f2302a00ffd4388a2c2f61e090e6937410eec`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `hrd-coordinates`
  - Essential understanding (DE): Das HRD ordnet Leuchtkraft und Oberflächentemperatur auf logarithmischen Achsen, nicht räumliche Positionen; in der üblichen Darstellung nimmt die Temperatur nach rechts ab.
  - Essential understanding (EN): The HR diagram maps luminosity and surface temperature on logarithmic axes, not spatial positions; in the conventional representation temperature decreases to the right.
  - Observable performance (DE): Die lernende Person kennzeichnet in einem neuen Diagramm Achsen, Richtungen und Skalen, trägt neue Werte konsistent ein und ordnet sie begründet Hauptreihe, Roten Riesen oder Weißen Zwergen zu.
  - Observable performance (EN): In a new diagram, the learner identifies axes, directions, and scales, plots fresh values consistently, and justifiably assigns them to the main sequence, red giants, or white dwarfs.
- `regions-and-model-boundary`
  - Essential understanding (DE): Die beiden Größen bestimmen gemeinsam den HRD-Bereich; eine einzelne Position kennzeichnet einen physikalischen und evolutionären Zustand, legt aber ohne weitere Angaben keinen vollständigen Entwicklungsweg fest. Elementar bedeutet Hauptreihe Wasserstofffusion im Kern, Rote Riesen eine ausgedehnte entwickelte Sternphase nach der Hauptreihe und Weiße Zwerge kompakte Überreste, die im einfachen isolierten Modell ohne anhaltende Kernfusion abkühlen. Für einen sonnenähnlichen Stern lassen sich diese Bereiche als vereinfachter Entwicklungsausschnitt verbinden; die Abfolge gilt nicht universell für alle Anfangsmassen.
  - Essential understanding (EN): The two quantities jointly determine the HR-diagram region; a single position indicates a physical and evolutionary state but does not determine a complete evolutionary path without further information. At an elementary level, the main sequence means hydrogen fusion in the core, red giants an expanded evolved stellar phase after the main sequence, and white dwarfs compact remnants that cool without sustained nuclear fusion in the simple isolated model. For a Sun-like star these regions can be connected as a simplified part of its evolution; the sequence is not universal across all initial masses.
  - Observable performance (DE): Die lernende Person deutet Lagevergleiche fachlich, begründet unterschiedliche Zuordnungen trotz ähnlicher Einzelwerte und benennt die Grenze der aus einem Diagrammpunkt möglichen Aussage. Dabei erläutert sie diese elementare evolutionäre Bedeutung aller drei Bereiche an einem sonnenähnlichen Beispiel, statt nur Bereichsnamen zu nennen; sie begrenzt die beispielhafte Verbindung auf passende Anfangsmassen und leitet aus der Lage allein kein eindeutiges Alter ab.
  - Observable performance (EN): The learner interprets positional comparisons physically, justifies different classifications despite similar individual values, and states the limit of what can be inferred from one plotted point. In doing so, the learner explains this elementary evolutionary meaning of all three regions using a Sun-like example rather than merely naming regions; they restrict the example connection to suitable initial masses and do not infer a unique age from position alone.

**Coverage expectations**

- required expectations: `hrd-coordinates`, `regions-and-model-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `paired-observables`: Neue Wertepaarungen und ein Vergleich ähnlicher Temperatur bei stark unterschiedlicher Leuchtkraft. / Fresh pairs of values and a comparison at similar temperature but strongly different luminosity.
- `display-convention`: Unbeschriftete oder in ihrer Darstellungsrichtung veränderte Achsen. / Unlabeled axes or axes with an altered display direction.

**Application cases**

- `place-three-stars`
  - Task demand (DE): Beschrifte ein zunächst unbeschriftetes schematisches HRD korrekt. Trage A(6000 K, 1 L☉), B(3500 K, 1000 L☉) und C(12000 K, 0,01 L☉) ein und deute ihre Bereiche. Erläutere dabei die elementare evolutionäre Bedeutung der drei Bereiche an einem sonnenähnlichen Beispiel und begrenze diese Verbindung gegenüber anderen Anfangsmassen.
  - Task demand (EN): Correctly label an initially unlabeled schematic HR diagram. Plot A(6000 K, 1 L☉), B(3500 K, 1000 L☉), and C(12000 K, 0.01 L☉), and interpret their regions. In doing so, explain the elementary evolutionary meaning of the three regions using a Sun-like example and limit this connection in relation to other initial masses.
  - Expected performance (DE): A liegt ungefähr auf der Hauptreihe, B im Bereich Roter Riesen und C bei Weißen Zwergen. Die Einordnung nutzt beide logarithmischen Achsen und verwechselt die Positionen nicht mit Orten im Weltraum. Die lernende Person erklärt Hauptreihe als Wasserstofffusion im Kern, den Riesenbereich als ausgedehnte entwickelte Phase nach der Hauptreihe und Weiße Zwerge als kompakte, im einfachen isolierten Modell ohne anhaltende Kernfusion abkühlende Überreste. Sie verbindet diese Zustände beispielhaft für einen sonnenähnlichen Stern, behauptet aber weder diesen Weg für alle Anfangsmassen noch ein eindeutiges Alter der drei konkreten Sterne aus den Punkten. Eine pauschale Festlegung der Energiequelle aller Roten Riesen auf Heliumfusion ist dafür weder nötig noch zulässig.
  - Expected performance (EN): A lies approximately on the main sequence, B in the red-giant region, and C among white dwarfs. The classification uses both logarithmic axes and does not confuse positions with locations in space. The learner explains the main sequence as hydrogen fusion in the core, the giant region as an expanded evolved phase after the main sequence, and white dwarfs as compact remnants cooling without sustained nuclear fusion in the simple isolated model. They connect these states as an example for a Sun-like star, but assert neither that pathway for all initial masses nor a unique age for the three actual stars from their points. A blanket claim that every red giant is powered by helium fusion is neither needed nor justified.
  - Understanding focus (DE): Eigenständige Koordinatenübersetzung und physikalische Bedeutung der drei Bereiche.
  - Understanding focus (EN): Independent coordinate translation and physical meaning of the three regions.
- `altered-axis-transfer`
  - Task demand (DE): Ordne in einem frischen HRD mit ausdrücklich nach rechts zunehmender Temperatur die Sterne D(3500 K, 0,01 L☉) und E(3500 K, 1000 L☉) ein. Prüfe die Behauptung, beide müssten dieselbe Entwicklungsphase und dasselbe Alter haben.
  - Task demand (EN): In a fresh HR diagram with temperature explicitly increasing to the right, place stars D(3500 K, 0.01 L☉) and E(3500 K, 1000 L☉). Assess the claim that they must have the same evolutionary phase and age.
  - Expected performance (DE): Beide Sterne erhalten dieselbe Temperaturkoordinate. D liegt ungefähr im kühlen Hauptreihenbereich, E im Bereich Roter Riesen. Die geänderte Achsenrichtung spiegelt die horizontale Anordnung gegenüber der üblichen Darstellung. Gleiche Temperatur belegt weder dieselbe Phase noch ein eindeutiges Alter; dafür fehlen weitere physikalische Angaben. Für D erläutert sie die Hauptreihenbedeutung Wasserstofffusion im Kern, für E den ausgedehnten entwickelten Zustand nach der Hauptreihe; die unterschiedliche Bereichszuordnung wird damit evolutionär erklärt. Ohne weitere Angaben folgt daraus weder ein vollständiger Weg noch eine eindeutige Altersrangfolge dieser beiden Sterne.
  - Expected performance (EN): Both stars share a temperature coordinate. D lies approximately on the cool main sequence and E in the red-giant region. The changed axis direction mirrors the horizontal arrangement compared with the conventional representation. Equal temperature establishes neither the same phase nor a unique age; additional physical information is required. For D they explain the main-sequence meaning of hydrogen fusion in the core, and for E the expanded evolved state after the main sequence, thereby giving the different region classifications evolutionary meaning. Without further information this implies neither a complete pathway nor a unique age ordering of these two stars.
  - Understanding focus (DE): Transfer der Achsenkonvention und Grenze einer isolierten Temperaturinformation.
  - Understanding focus (EN): Transfer of the axis convention and the limit of temperature information alone.
