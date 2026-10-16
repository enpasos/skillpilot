# AI review input: Private aktuelle physik-Lernziele

- Book ID: `private-actual-P-physik-20261015`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:83ce7ff9616770434213f742a96c6e76c80d901112ffabaea8df0652d275fb4f`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Volumen regelmäßiger Körper geometrisch bestimmen

- Full learning-goal ID: `f827b00f-af7f-52de-84aa-2a2bbaa035bd`
- Goal fingerprint: `sha256:abb79783347c78419a43e8b4b012a57f470e3bd6d4afe508ca9eec2f0151610e`
- Page fingerprint: `sha256:ee468947802adc94454ecbdc815fbb629b386f457017959e95cb2a37c116b3fc`
- Topic path: physik

### Canonical description

Die lernende Person kann die benötigten Abmessungen eines einfachen regelmäßigen Körpers messen, daraus sein Volumen mit einer passenden geometrischen Beziehung bestimmen und Ergebnis sowie Volumeneinheit auf Plausibilität prüfen.

### Visualization

/assets/goal-visualizations/physik/f827b00f-af7f-52de-84aa-2a2bbaa035bd/f827b00f-af7f-52de-84aa-2a2bbaa035bd.jpg

- original digest: `sha256:d2973dc053ac5798b0a75e225ee841e24f90817b863a962a68f3d0e3f36187a5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Physik? – Weltverständnis & Zukunft — `5c44b9ba-9b05-4774-95d5-073230d3fc4f` (outside this book)
- Volumina von Quadern und Würfeln bestimmen — `7c978529-ce62-5adc-897f-24ea80babbc8` (outside this book)

### Direct reverse prerequisites outside this book

- Dichte aus Masse und Volumen bestimmen und deuten — `c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0` (outside this book)
- Prüfungsaufgabe: Masse, Volumen und Dichte experimentell bestimmen — `d304cfd0-f87c-51f7-8dee-f5f405da4b3d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2a38dd63438f6d88356b0c303c03f538b73f9334eed5b28635304972197066d1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `measure-required-dimensions`
  - Essential understanding (DE): Bei einem regelmäßigen Körper werden genau die Abmessungen benötigt, die seine geometrische Form eindeutig für die Volumenbeziehung festlegen; alle Längen müssen in kompatiblen Einheiten und ohne verdeckte Skalenfehler vorliegen.
  - Essential understanding (EN): For a regular object, exactly those dimensions are needed that determine its geometric shape for the volume relation; all lengths must use compatible units without hidden scale errors.
  - Observable performance (DE): Die lernende Person erkennt die regelmäßige Körperform, wählt und misst die benötigten Längen und begründet, warum diese Angaben für die Volumenbestimmung ausreichen. Die selbstständige Auswahl und Messung muss in einer unverratenen realen oder geeigneten skalenbasierten Messsituation sichtbar werden; vorgegebene Längen und eine bloße Selbstauskunft belegen sie nicht.
  - Observable performance (EN): The learner recognizes the regular solid shape, selects and measures the required lengths, and explains why these data are sufficient to determine volume. Independent selection and measurement must be visible in an unsolved real or appropriate scale-based measurement situation; supplied lengths and self-report alone do not establish them.
- `geometric-volume-unit-check`
  - Essential understanding (DE): Die passende Volumenbeziehung bildet die dreidimensionale Ausdehnung des Körpers ab; daher entsteht eine Kubikeinheit, und Ergebnis, Einheit und Größenordnung müssen zu den gemessenen Abmessungen passen.
  - Essential understanding (EN): The appropriate volume relation represents the object’s three-dimensional extent; therefore a cubic unit results, and value, unit, and magnitude must fit the measured dimensions.
  - Observable performance (DE): Die lernende Person setzt die Messwerte in eine passende geometrische Beziehung ein, führt die Kubikeinheit korrekt und prüft ein Ergebnis durch Abschätzung oder Vergleich mit einem umschließenden Körper.
  - Observable performance (EN): The learner uses the measured values in an appropriate geometric relation, carries the cubic unit correctly, and checks a result by estimation or comparison with an enclosing solid.

**Coverage expectations**

- required expectations: `measure-required-dimensions`, `geometric-volume-unit-check`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `regular-shape`: Quader beziehungsweise Würfel oder ein anderer einfacher regelmäßiger Körper mit vorgegebener Volumenbeziehung / Cuboid or cube, or another simple regular solid with a supplied volume relation
- `measurement-state`: Abmessungen direkt in gleicher Einheit oder mit notwendiger Längenumrechnung / Dimensions directly in the same unit or requiring a length-unit conversion
- `unsolved-measurement-stimulus`: Verbindlicher unabhängiger Messfall an geeignetem sicherem starrem Körper mit Lineal oder an der gebundenen unverratenen Skalenabbildung; Auswahl dreier unabhängiger Kanten beim Quader, wiederholte Ansichtskante zählt nicht doppelt. Kein Zusatzkontingent nach ausreichender Evidenz. / Required independent measurement case using a suitable safe rigid object and ruler or the bound unsolved scale image; select three independent cuboid edges, without counting a repeated view edge twice. No extra quota once sufficient evidence exists.

**Application cases**

- `cuboid-measurement`
  - Task demand (DE): Ein quaderförmiger Holzklotz wird mit 8,0 cm, 3,0 cm und 2,5 cm gemessen. Volumen, Einheit und Plausibilität sind zu bestimmen.
  - Task demand (EN): A cuboid wooden block is measured as 8.0 cm, 3.0 cm, and 2.5 cm. Determine volume, unit, and plausibility.
  - Expected performance (DE): Die lernende Person ordnet Länge, Breite und Höhe zu, berechnet 60 cm³ und prüft, dass das Ergebnis unter dem Volumen eines 8 cm × 3 cm × 3 cm großen Vergleichsquaders liegt.
  - Expected performance (EN): The learner assigns length, width, and height, calculates 60 cm³, and checks that the result is below the volume of a comparison cuboid measuring 8 cm × 3 cm × 3 cm.
  - Understanding focus (DE): Messauswahl, geometrische Beziehung und unabhängige Größenprüfung werden verbunden.
  - Understanding focus (EN): Measurement selection, geometric relation, and an independent magnitude check are connected.
- `mixed-unit-cube-transfer`
  - Task demand (DE): Ein würfelförmiger Körper hat eine Kantenlänge von 25 mm. Eine Rechnung verwendet 25³ cm³. Die Volumenangabe ist fachlich zu korrigieren und zu prüfen.
  - Task demand (EN): A cube has edge length 25 mm. A calculation uses 25³ cm³. Correct and check the volume statement scientifically.
  - Expected performance (DE): Die lernende Person berechnet 15 625 mm³ oder wandelt 25 mm=2,5 cm um und erhält 15,625 cm³; sie verwirft die gemischte Zahlenwert-Einheit-Kombination.
  - Expected performance (EN): The learner calculates 15,625 mm³ or converts 25 mm=2.5 cm and obtains 15.625 cm³; the learner rejects the mixed numerical-value and unit combination.
  - Understanding focus (DE): Der Einheitenwechsel prüft, ob Volumeneinheit und gemessene Länge strukturell zusammenpassen.
  - Understanding focus (EN): The unit change tests whether volume unit and measured length fit structurally.
- `independent-ruler-measurement`
  - Task demand (DE): Präsentiere den erforderlichen SVG-Messstimulus /assets/task-material/physik/cuboid-rulers-1ffdd7f06dd21af0222d3ce1bd6b1f6408bd04ae05b1651e4a703a980ab5e289.svg ohne Messwerte, Lösungen oder beschriftete Antwortskizze vorab. Die lernende Person wählt die für das Volumen nötigen unabhängigen Abmessungen des dargestellten starren Quaders, liest sie mit zugehöriger Einheit an den Linealen ab und erklärt ihre Auswahl; Bildschirmabmessungen sind keine Messwerte. Sie berechnet das Volumen und prüft Einheit und Größenordnung unabhängig. Gleichwertig ist ein frischer, sicherer realer starrer Quader mit geeignetem Lineal, wenn die Auswahl, Skalenablesung und Messzuordnung für die beurteilende Person tatsächlich sichtbar sind; eine bloße Mitteilung eigener Messzahlen genügt nicht. Die beiden bisherigen Rechenfälle bleiben erhalten; keine zusätzliche Aufgabenquote nach ausreichender Evidenz.
  - Task demand (EN): Present the required SVG measurement stimulus /assets/task-material/physik/cuboid-rulers-1ffdd7f06dd21af0222d3ce1bd6b1f6408bd04ae05b1651e4a703a980ab5e289.svg without revealing measurements, solutions, or a labeled answer drawing beforehand. The learner selects the independent dimensions needed for the volume of the depicted rigid cuboid, reads their values and unit from the rulers, and explains the selection; screen dimensions are not measurements. The learner calculates volume and independently checks unit and magnitude. An equivalent fresh, safe real rigid cuboid and suitable ruler may be used when selection, scale reading, and assignment of measurements are actually visible to the assessor; reporting measurement numbers alone is insufficient. Retain both existing calculation cases; no extra task quota once sufficient evidence exists.
  - Expected performance (DE): In der gebundenen Abbildung liefern die Differenzen der Skalenstände 6,5−1,0=5,5 cm, 3,5−0,5=3,0 cm und 3,0−1,0=2,0 cm. Die lange Kante in beiden Ansichten ist dieselbe, keine vierte unabhängige Abmessung. V=5,5·3,0·2,0 cm³=33 cm³; beispielsweise 5·3·2 < 33 < 6·3·2, also 30 < 33 < 36 cm³, prüft unabhängig die Größenordnung. Eine gleichwertige saubere Darstellung in mm und mm³ ist zulässig; Umrechnung ist kein universeller Pflichtschritt. Bei realem Ersatzfall werden dessen beobachtete Messwerte und eine passende unabhängige Abschätzung beurteilt, nicht die SVG-Zahlen erwartet.
  - Expected performance (EN): In the bound image, differences between ruler readings give 6.5−1.0=5.5 cm, 3.5−0.5=3.0 cm, and 3.0−1.0=2.0 cm. The long edge in both views is the same edge, not a fourth independent dimension. V=5.5×3.0×2.0 cm³=33 cm³; for example, 5×3×2 < 33 < 6×3×2, hence 30 < 33 < 36 cm³, independently checks magnitude. A consistent solution in mm and mm³ is equally admissible; conversion is not universally required. A real replacement case is judged using its observed measurements and a suitable independent estimate, without expecting the SVG numbers.
  - Understanding focus (DE): Die nötigen unabhängigen Kanten selbst wählen und unverratene Skalen einschließlich nichtnulligem Startpunkt lesen; erst daraus Volumen und Kubikeinheit ableiten. Die abgebildeten Ansichten gehören zu genau einem Quader.
  - Understanding focus (EN): Independently select the needed edges and read unsolved scales, including nonzero starting positions; then derive volume and cubic unit. Both pictured views belong to one cuboid.
