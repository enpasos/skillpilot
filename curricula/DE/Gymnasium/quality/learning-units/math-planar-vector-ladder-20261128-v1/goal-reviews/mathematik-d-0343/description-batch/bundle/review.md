# AI review input: Mathematik: neue Vektorrouten

- Book ID: `v1-planar-vector-mathematik-20261128-d-0343-selected`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:b8ed3541037e4341db153c4f3a9059b19d8ae5ec8bda664d50cdfd7886c3cea2`
- Selected goals: 2

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Verschiebungen zeichnen und verketten

- Full learning-goal ID: `06194412-59dc-5768-96e0-71ca206b473c`
- Goal fingerprint: `sha256:1cd62e3de9c5687c663d35943f360f3c33b8d04c819dcd2a1b533d1eefcf7cc5`
- Page fingerprint: `sha256:ea1a2f0ed5d1bbb4ad2feb7ad0a3df4a594b5c6c9404277b4d76e1a3908c8c61`
- Topic path: Mathematik

### Canonical description

Die lernende Person kann dieselbe Verschiebung in der Ebene von einem neuen Ausgangspunkt aus zeichnen und zwei Verschiebungen verketten. Sie begründet den Ergebnispfeil vom ersten Startpunkt zum letzten Endpunkt im Maßstab der Ortszeichnung.

### Visualization

/assets/goal-visualizations/mathematik/06194412-59dc-5768-96e0-71ca206b473c/06194412-59dc-5768-96e0-71ca206b473c.png

- original digest: `sha256:ac26c265f29b46d5b4cbe8b5a658c5338da27d9398e1e5f5d1b54b25e58f6054`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Mit Vektoren in der Ebene rechnen — `bffb05f4-9887-54d8-99f0-5ec670e8e04c` (page 2)

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Eine Verschiebung versetzen und zwei verketten — `f9e8fbc1-7a1a-5492-a74e-8147ebfa1cf8` (outside this book)
- Vektoren komponentenweise addieren und subtrahieren — `c63bbffd-8d1c-5fe2-a428-db194e6fe592` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:862fec19ef2ad13e60e756e7c85a329552b7daef7f616ced07436e1aab7d8937`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `translation`
  - Essential understanding (DE): Eine Verschiebung wird im Ortsraster durch ihre gerichteten Schritte bestimmt, unabhängig vom Startpunkt.
  - Essential understanding (EN): A displacement is specified by its directed steps on the position grid independently of its starting point.
  - Observable performance (DE): Die Person zeichnet dieselbe Verschiebung ab einem anderen Punkt und belegt gleiche Richtung und Länge mit den Rasterschritten.
  - Observable performance (EN): The learner redraws a displacement from another point and uses grid steps to justify the same direction and length.
- `composition-scale`
  - Essential understanding (DE): Die Verkettung schließt an der erreichten Stelle an. Der Ergebnispfeil verbindet die beiden äußeren Orte im Maßstab der Ortszeichnung.
  - Essential understanding (EN): The next displacement starts at the position reached. The resultant connects the two outer positions at the scale of the position diagram.
  - Observable performance (DE): Die Person zeichnet beide Pfeile hintereinander und begründet die Lage der Spitze und den resultierenden Ortsabstand mit dem Rastermaßstab.
  - Observable performance (EN): The learner draws a head-to-tail chain and justifies the endpoint and the resultant offset using the grid scale.

**Coverage expectations**

- required expectations: `translation`, `composition-scale`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `starting-position`: Neuer Ort und Gegenrichtung der horizontalen Schritte. / New position and opposing horizontal steps.
- `grid-scale`: Unterschiedliche ausdrücklich beschriftete Ortsmaßstäbe. / Different explicitly labelled position scales.

**Application cases**

- `parkland-walk`
  - Task demand (DE): In einem Parkplan entspricht ein Kästchen 2 m. Versetze einen Pfeil mit zwei Kästchen nach links und drei nach oben zu einem neuen Start. Hänge dort an seiner Spitze drei Kästchen nach rechts und eins nach unten an.
  - Task demand (EN): On a park map, one square represents 2 m. Move an arrow two squares left and three up to a new starting point. At its tip add another three squares right and one down.
  - Expected performance (DE): Zeichnet beide Pfeile mit richtigen Schritten. Der Ergebnispfeil liegt bei einem Kästchen nach rechts und zwei nach oben, also 2 m rechts und 4 m oben, und verbindet ersten Start und letztes Ende.
  - Expected performance (EN): Draws the arrows with correct steps. The resultant is one square right and two up, or 2 m right and 4 m up, from first start to final end.
  - Understanding focus (DE): Die Verschiebungen lassen sich am Raster vergleichen; die Skala übersetzt gezeichnete Abstände in Meter.
  - Understanding focus (EN): Grid steps allow displacements to be compared; the scale converts drawn offsets to metres.
- `warehouse-route`
  - Task demand (DE): Ein Hallenplan nutzt 0,5 m je Kästchen. Versetze eine Verschiebung zwei nach rechts und eine nach unten an einen neuen Start. Verknüpfe sie mit zwei nach links und drei nach oben. Begründe, ob die Endposition waagerecht verschoben ist.
  - Task demand (EN): A warehouse plan uses 0.5 m per square. Redraw a displacement two squares right and one down from a new start. Compose it with two squares left and three up. Explain whether the final position has shifted horizontally.
  - Expected performance (DE): Zeichnet eine passende Kette. Die waagerechten Schritte heben sich auf, der Ergebnispfeil zeigt zwei Kästchen (1 m) nach oben.
  - Expected performance (EN): Draws the chain. The horizontal steps cancel, leaving a resultant two squares (1 m) up.
  - Understanding focus (DE): Auch bei unterschiedlichem Weg darf der Ergebnispfeil nur die tatsächliche Ortsänderung anzeigen.
  - Understanding focus (EN): The resultant represents the actual change in position even when the path differs.
## Page 2: Mit Vektoren in der Ebene rechnen

- Full learning-goal ID: `bffb05f4-9887-54d8-99f0-5ec670e8e04c`
- Goal fingerprint: `sha256:e705ad876caf122b8545629666fdf6d4abb2472c8126ced21abbd8c61423c8dc`
- Page fingerprint: `sha256:ac714db1a6ee95bb4cf929061b19d6f8166c94f872077b77436f6df62a774da7`
- Topic path: Mathematik

### Canonical description

Die lernende Person kann Komponentenpaare addieren, subtrahieren und mit einem Skalar multiplizieren. Sie erklärt die komponentenweise Addition durch Verkettung der Verschiebungspfeile und erklärt am Pfeil die Wirkung eines negativen oder gebrochenen Faktors und des Faktors null.

### Visualization

/assets/goal-visualizations/mathematik/bffb05f4-9887-54d8-99f0-5ec670e8e04c/bffb05f4-9887-54d8-99f0-5ec670e8e04c.png

- original digest: `sha256:e72a1504daec18fc1fa6b27efc52a4d2fe9495a383ed1f51ba63bec1ba9a446c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Verschiebungen zeichnen und verketten — `06194412-59dc-5768-96e0-71ca206b473c` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Punktlagen und daraus bestimmte lineare Objekte im Koordinatensystem darstellen — `25593605-5e13-55cc-9a05-8f3d737e15e9` (outside this book)
- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Rationale Zahlen multiplizieren und dividieren — `ee48e811-4c9c-5080-9836-8403fc9f0810` (outside this book)

### Direct reverse prerequisites outside this book

- Den Betrag eines ebenen Vektors bestimmen — `3b6fa042-af1e-5c48-a9d0-798a2ab876d0` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:49e97dd3d2595e8c40342d79fe8acec86008752bff484888c417c082e367cecf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `operations`
  - Essential understanding (DE): Ein Komponentenpaar fasst die Schritte entlang zweier Achsen zusammen. Beim Verketten addieren sich die Komponenten; Subtraktion hängt die Gegenverschiebung an.
  - Essential understanding (EN): A component pair records displacements along the axes. Composing arrows adds the component steps; subtraction appends the opposite displacement.
  - Observable performance (DE): Die Person berechnet Summe und Differenz und erklärt die Komponentenaddition durch Pfeilverkettung.
  - Observable performance (EN): The learner computes the sum and difference and explains component addition by composing the arrows.
- `scaling`
  - Essential understanding (DE): Ein Faktor wirkt auf beide Komponenten. Ein negatives Vorzeichen kehrt die Richtung um, ein gebrochener Betrag ändert die Länge, und Faktor null lässt keine Verschiebung übrig.
  - Essential understanding (EN): A scalar acts on both components. A negative sign reverses direction, a fractional magnitude changes length, and a zero factor leaves no displacement.
  - Observable performance (DE): Die Person berechnet die Skalierung und erklärt Richtung und Länge für einen negativen Bruch, für einen positiven Bruch und für null.
  - Observable performance (EN): The learner computes scalar products and explains direction and length for a negative fraction, a positive fraction and zero.

**Coverage expectations**

- required expectations: `operations`, `scaling`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `components`: Gemischte Vorzeichen, Brüche oder eine verschwindende Komponente. / Mixed signs, fractions or a zero component.
- `factor`: Vorzeichen und Betrag der Skalare verändern sich. / Scalar signs and magnitudes vary.

**Application cases**

- `fraction-components`
  - Task demand (DE): Mit u = (4, −2) und v = (−1, 3) berechne u+v, u−v, −½u und 0u. Erkläre die Summe mit Pfeilen.
  - Task demand (EN): For u=(4,−2) and v=(−1,3), calculate u+v, u−v, −½u and 0u. Explain the sum using arrows.
  - Expected performance (DE): Erhält (3, 1), (5, −5), (−2, 1) und (0, 0). Komponenten der zwei aufeinander folgenden Schritte addieren sich. −½ halbiert die Länge und kehrt die Richtung um; 0 lässt keine Verschiebung.
  - Expected performance (EN): Obtains (3,1), (5,−5), (−2,1) and (0,0). Component moves add when consecutive arrows are drawn head to tail. −½ halves length and reverses direction; 0 leaves no displacement.
  - Understanding focus (DE): Addition durch Verkettung erklären und Skalare als Streckung und mögliche Umkehr deuten.
  - Understanding focus (EN): Interpret addition as composition and scaling as length change with a possible reversal.
- `grid-robot`
  - Task demand (DE): Ein Roboter kann die ebenen Schritte p = (−6, 3) und q = (3, 0) fahren. Gib p+q, q−p, ⅓p und −q an und erkläre die Wirkung der beiden Faktoren sowie die Addition.
  - Task demand (EN): A robot can make the planar moves p=(−6,3) and q=(3,0). Find p+q, q−p, ⅓p and −q and explain how both scale factors and addition work.
  - Expected performance (DE): Erhält (−3, 3), (9, −3), (−2, 1), (−3, 0). Zeichnet oder beschreibt Kopf-Schweif-Verkettung und erklärt Drittelung ohne Umkehr und reine Richtungsumkehr.
  - Expected performance (EN): Obtains (−3,3), (9,−3), (−2,1), (−3,0). Draws or describes head-to-tail composition and explains one-third scaling without reversal and reversal alone.
  - Understanding focus (DE): Vorzeichen und Länge getrennt begründen und die Summe räumlich deuten.
  - Understanding focus (EN): Distinguish the sign from length scaling and interpret the sum spatially.
