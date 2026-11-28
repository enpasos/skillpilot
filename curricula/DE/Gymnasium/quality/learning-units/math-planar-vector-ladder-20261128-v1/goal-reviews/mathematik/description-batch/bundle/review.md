# AI review input: Mathematik: neue Vektorrouten

- Book ID: `v1-planar-vector-mathematik-20261128-selected`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:02e3159b0a0aec9fb6ba773312a3bd8f8d75f1da918edea75b34bb71a2fb33f0`
- Selected goals: 6

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Verschiebungen zeichnen und verketten

- Full learning-goal ID: `06194412-59dc-5768-96e0-71ca206b473c`
- Goal fingerprint: `sha256:1cd62e3de9c5687c663d35943f360f3c33b8d04c819dcd2a1b533d1eefcf7cc5`
- Page fingerprint: `sha256:0f5a7be476a4dabe5ee3b13ca06ab914e8edd4f3b52d6123f9085f79d3ae1fc2`
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

- Vektoren komponentenweise addieren und subtrahieren — `c63bbffd-8d1c-5fe2-a428-db194e6fe592` (page 5)
- Mit Vektoren in der Ebene rechnen — `bffb05f4-9887-54d8-99f0-5ec670e8e04c` (page 2)

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Eine Verschiebung versetzen und zwei verketten — `f9e8fbc1-7a1a-5492-a74e-8147ebfa1cf8` (outside this book)

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
- Page fingerprint: `sha256:f5bd7ad95f0257ec4851ea165fc47b283f7f4f848483b130b39a6a8aa6d6fbfb`
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

- Den Betrag eines ebenen Vektors bestimmen — `3b6fa042-af1e-5c48-a9d0-798a2ab876d0` (page 3)

### Prerequisites outside this book

- Punktlagen und daraus bestimmte lineare Objekte im Koordinatensystem darstellen — `25593605-5e13-55cc-9a05-8f3d737e15e9` (outside this book)
- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Rationale Zahlen multiplizieren und dividieren — `ee48e811-4c9c-5080-9836-8403fc9f0810` (outside this book)

### Direct reverse prerequisites outside this book

- None

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
## Page 3: Den Betrag eines ebenen Vektors bestimmen

- Full learning-goal ID: `3b6fa042-af1e-5c48-a9d0-798a2ab876d0`
- Goal fingerprint: `sha256:03a47b3f833bbb229df42dfe9c62bb495329840ab68466dc9ff895354f07a02d`
- Page fingerprint: `sha256:ae27d1cbb68b22200e7b2297beea84ef97fdbd515f9f2a011ade4659b3bfe1a0`
- Topic path: Mathematik

### Canonical description

Die lernende Person kann den Betrag aus orthogonalen Komponenten mit dem Satz des Pythagoras bestimmen und an zwei Vektorsummen begründen, wann die Summe der Einzelbeträge den Betrag der Summe ergibt.

### Visualization

/assets/goal-visualizations/mathematik/3b6fa042-af1e-5c48-a9d0-798a2ab876d0/3b6fa042-af1e-5c48-a9d0-798a2ab876d0.png

- original digest: `sha256:45f22c83be498691e44fc6f3289c271438f8a8a8ab7bbbfe5dd5a50d1157e2e2`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Mit Vektoren in der Ebene rechnen — `bffb05f4-9887-54d8-99f0-5ec670e8e04c` (page 2)

### Direct reverse prerequisites

- Betrag eines Vektors im Raum bestimmen — `fb7a4fa0-03b5-53b4-bd86-608480b748a1` (page 6)
- Zwischen Komponenten und Richtungswinkel umrechnen — `b954088f-edef-5009-b82e-02a2f05d3bc8` (page 4)

### Prerequisites outside this book

- Satz des Pythagoras anwenden — `4d78bbcc-89b8-47f0-aa45-516199e4da5d` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Beträge zweier Vektorsummen vergleichen — `9f165f6e-e31b-5f72-a810-a8259983d200` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:13fd20b479c368df900ced9a85ca5c2ff43fc6304155bf8c26b02534c43bf1ac`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `orthogonal-components`
  - Essential understanding (DE): Senkrechte Komponenten sind Katheten. Der Vektorbetrag ist die Hypotenusenlänge und unabhängig von den Vorzeichen der Kathetenrichtung.
  - Essential understanding (EN): Perpendicular components are the triangle legs. The magnitude is the hypotenuse length and is independent of the leg directions.
  - Observable performance (DE): Die Person begründet den rechtwinkligen Bezug und berechnet mindestens einen Betrag aus unterschiedlich vorzeichenbehafteten Komponenten.
  - Observable performance (EN): The learner identifies the right triangle and calculates a magnitude from components with different signs.
- `sum-equality`
  - Essential understanding (DE): Die direkte Verbindung ist höchstens so lang wie der verkettete Weg. Gleichheit gilt bei gleicher Richtung oder mindestens einem Nullvektor.
  - Essential understanding (EN): The direct connection is at most as long as the chained route. Equality holds for the same direction or if at least one vector is zero.
  - Observable performance (DE): Die Person berechnet zwei Summenbeträge und begründet den Unterschied zwischen geradliniger Verkettung ohne Umkehr und Knick oder Umkehr; den Nullfall erklärt sie eigens.
  - Observable performance (EN): The learner calculates two magnitudes of sums and explains a straight chain without reversal, a bend or reversal, and the zero case separately.

**Coverage expectations**

- required expectations: `orthogonal-components`, `sum-equality`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `leg-direction`: Komponenten mit verschiedenen Vorzeichen, gegebenenfalls eine Null. / Components with different signs, including a possible zero.
- `comparison`: Vergleiche gleichgerichtete, verschieden gerichtete, entgegengesetzte und Nullverschiebungen. / Compare same-direction, different-direction, opposite and zero displacements.

**Application cases**

- `course-offset`
  - Task demand (DE): Vergleiche |a+b| und |a|+|b| für a = (5, −12) und b = (5, 12) sowie für a und 2a. Begründe geometrisch und nenne den Nullfall.
  - Task demand (EN): Compare |a+b| with |a|+|b| for a=(5,−12) and b=(5,12), then for a and 2a. Explain geometrically and include the zero case.
  - Expected performance (DE): |a|=|b|=13, |a+b|=10<26. Bei a+2a gilt |3a|=39=13+26. Gleichrichtung verlängert die Gerade; ein Nullvektor fügt nichts hinzu.
  - Expected performance (EN): |a|=|b|=13 and |a+b|=10<26. For a+2a, |3a|=39=13+26. Same-direction chaining extends the line; zero adds nothing.
  - Understanding focus (DE): Die gerichteten Anteile bestimmen den Unterschied trotz gleicher Einzelbeträge.
  - Understanding focus (EN): Direction determines the outcome even with equal individual magnitudes.
- `return-movement`
  - Task demand (DE): Vergleiche (8,6) verkettet mit (−4,−3) einerseits und (4,3) andererseits. Berechne beide Summenbeträge und erkläre das Verhältnis zu den Einzelbeträgen.
  - Task demand (EN): Compare chaining (8,6) with (−4,−3) and with (4,3). Calculate both magnitudes of the sum and relate each to the individual magnitudes.
  - Expected performance (DE): Einzelbeträge 10 und 5. Bei der Umkehr beträgt die direkte Verschiebung 5 statt 15, bei gleicher Richtung 15. Der Nullfall bleibt ohne Beitrag.
  - Expected performance (EN): Individual magnitudes are 10 and 5. Reversal gives a direct displacement of 5 rather than 15; the same direction gives 15. Zero contributes nothing.
  - Understanding focus (DE): Kollinearität allein reicht nicht: dieselbe Gerade braucht auch dieselbe Richtung.
  - Understanding focus (EN): Collinearity alone is insufficient; equal direction is needed as well.
## Page 4: Zwischen Komponenten und Richtungswinkel umrechnen

- Full learning-goal ID: `b954088f-edef-5009-b82e-02a2f05d3bc8`
- Goal fingerprint: `sha256:5268dfe2a1fb3cb88f36853d9e7638d9cf26de83333438cd2ab00198fbc28aa1`
- Page fingerprint: `sha256:ac474ed0740a96d5a0d1823c47baa6a2fa203f5587ba453cbfd338acc180f5ed`
- Topic path: Mathematik

### Canonical description

Die lernende Person kann bei gegebenen Achsen und Winkelbezug aus Betrag und Richtung die vorzeichenbehafteten Komponenten bestimmen und umgekehrt den Betrag und den Richtungswinkel mit begründeter Quadrantenwahl ermitteln. Sie erklärt den Fall des Nullvektors.

### Visualization

/assets/goal-visualizations/mathematik/b954088f-edef-5009-b82e-02a2f05d3bc8/b954088f-edef-5009-b82e-02a2f05d3bc8.png

- original digest: `sha256:49cb3c39e688f7fcf6142af2e516f198986081388bea4827518ecebb76144697`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Den Betrag eines ebenen Vektors bestimmen — `3b6fa042-af1e-5c48-a9d0-798a2ab876d0` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Trigonometrie am rechtwinkligen Dreieck anwenden — `71a483ba-9680-4654-bb5e-5ab5427f0919` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Komponenten und Richtungswinkel bestimmen — `eb357fda-5119-5d6a-8e4f-572d8eb07903` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a8829ab5940e3d04c41c75573f531afd18d10b0d0aeeb4cd6b161bcddc50d888`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `forward-components`
  - Essential understanding (DE): Achsen und Winkelbezug legen Vorzeichen und Bezugswinkel fest; Komponenten sind Projektionen entlang der Achsen.
  - Essential understanding (EN): Axes and the angle convention determine signs and the reference angle; components are the projections along the axes.
  - Observable performance (DE): Die Person berechnet beide Komponenten aus Betrag und Winkel und begründet deren Vorzeichen.
  - Observable performance (EN): The learner calculates both components from magnitude and angle and justifies their signs.
- `inverse-angle-and-zero`
  - Essential understanding (DE): Aus Komponenten bestimmen die Vorzeichen den Quadranten, der Bezugswinkel allein bestimmt ihn nicht. Der Nullvektor hat Betrag null und keinen ausgezeichneten Richtungswinkel.
  - Essential understanding (EN): Component signs determine the quadrant, which a reference angle alone cannot select. The zero vector has magnitude zero and no distinguished direction.
  - Observable performance (DE): Die Person berechnet Betrag und Richtung mit nachvollziehbarer Quadrantenwahl und erklärt, warum beim Nullvektor kein Winkel definiert ist.
  - Observable performance (EN): The learner calculates magnitude and direction with justified quadrant selection and explains why the zero vector has no defined angle.

**Coverage expectations**

- required expectations: `forward-components`, `inverse-angle-and-zero`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `quadrant`: Beide oder nur eine Komponente negativ; verschiedene Bezugswinkel. / Both or one component negative; different reference angles.
- `convention`: Richtung der Achsen und Orientierung der Winkelmessung ausdrücklich festlegen. / Specify axes and sense of angle measurement explicitly.

**Application cases**

- `survey-west`
  - Task demand (DE): Winkel werden gegen den Uhrzeigersinn ab +x gemessen. Berechne die Komponenten bei Betrag 6 und 210°, dann Betrag und Winkel für (−4,3).
  - Task demand (EN): Angles are measured counterclockwise from +x. Find components for magnitude 6 at 210°, then magnitude and angle for (−4,3).
  - Expected performance (DE): Komponenten (−3√3,−3) im III. Quadranten. Umgekehrt Betrag 5 und Winkel 180°−atan(3/4) ≈143,1° im II. Quadranten.
  - Expected performance (EN): Components (−3√3,−3) in quadrant III. Conversely, magnitude 5 and angle 180°−atan(3/4)≈143.1° in quadrant II.
  - Understanding focus (DE): Der Bezug bestimmt trotz gleichartigem rechtwinkligem Dreieck verschiedene Vorzeichen und Winkelfortsetzungen.
  - Understanding focus (EN): Like-shaped reference triangles can require different signs and corrections under a fixed angle convention.
- `map-offset-zero`
  - Task demand (DE): Winkel gegen den Uhrzeigersinn ab +x: Berechne Komponenten für Betrag 10 und 300°. Ermittle Betrag und Winkel für (8,−6) und erkläre nach dessen Ausgleich den Fall (0,0).
  - Task demand (EN): Angles are counterclockwise from +x. Find components for magnitude 10 at 300°. Recover magnitude and angle for (8,−6), and explain (0,0) when that offset is cancelled.
  - Expected performance (DE): Erhält (5,−5√3), danach Betrag 10 und 360°−atan(6/8)≈323,1°. Nach dem Ausgleich ist der Betrag null; aus dem zusammengefallenen Pfeil ergibt sich kein Winkel.
  - Expected performance (EN): Gets (5,−5√3), then magnitude 10 and 360°−atan(6/8)≈323.1°. After cancellation the magnitude is zero and the collapsed arrow gives no angle.
  - Understanding focus (DE): Der negative y-Anteil erfordert den IV. Quadranten; beim Nullvektor fehlt eine ausgezeichnete Richtung.
  - Understanding focus (EN): A negative y component selects quadrant IV here; a zero vector has no distinguished direction.
## Page 5: Vektoren komponentenweise addieren und subtrahieren

- Full learning-goal ID: `c63bbffd-8d1c-5fe2-a428-db194e6fe592`
- Goal fingerprint: `sha256:eb448c8bb5149d4793213aa424bec064ad324d0ff2840e8b2871153ec9c5ffe5`
- Page fingerprint: `sha256:e99d8217a72c824fa6a794677a5a7aca9bbba8c350b828d5b053f213cad3c870`
- Topic path: Mathematik

### Canonical description

Die lernende Person kann Vektoren in Ebene und Raum komponentenweise addieren und subtrahieren und geometrisch erklären, dass Addition Verschiebungen verknüpft und Subtraktion die Addition des Gegenvektors ist.

### Visualization

/assets/goal-visualizations/mathematik/c63bbffd-8d1c-5fe2-a428-db194e6fe592/c63bbffd-8d1c-5fe2-a428-db194e6fe592.png

- original digest: `sha256:faa0b30c7d896ea59413c3fcff773e0c405e7b301e0c3718bbbf79c3860d91cc`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Verschiebungen zeichnen und verketten — `06194412-59dc-5768-96e0-71ca206b473c` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Vektoren im räumlichen Koordinatensystem als Tupel angeben und deuten — `19f170e4-b88f-4c06-b72a-ce6923748bb4` (outside this book)
- Vektoren als Orts- und Verschiebungsvektoren deuten — `94b48b93-473f-4bc5-8c93-8c1a5e2cd1a6` (outside this book)

### Direct reverse prerequisites outside this book

- Aufgabe 6 (Jahrgangsstufe 9, 13 BE) — `853905c5-e82b-592f-a485-1ff84c8bb22e` (outside this book)
- Geraden und Strecken im Raum parametrisch beschreiben — `235ae698-369f-4dbe-b46f-87e8b65bb03d` (outside this book)
- Linearkombinationen von Vektoren bilden und deuten — `72dfc164-455d-4b63-85f0-96e803c9a1d5` (outside this book)
- Lineare Gleichungssysteme in der Analytischen Geometrie systematisch lösen — `27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6` (outside this book)
- Eine Raumgerade an einem Punkt spiegeln (LK) — `976def9e-c81c-5875-9d87-a1024318ce48` (outside this book)
- Mittelpunkte von Raumstrecken aus Koordinaten bestimmen — `bea0e5a0-4833-5337-b6f1-7251b8cf8089` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f232b824a27cb7194d6eab15f6a28e4ce2274f5fdaa8f0019d01f5fc72e044b4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `component-addition-subtraction`
  - Essential understanding (DE): Vektoren gleicher Dimension werden komponentenweise addiert; a-b=a+(-b) ist die Addition der zu b entgegengesetzten Verschiebung.
  - Essential understanding (EN): Vectors of the same dimension are added component-wise; a-b=a+(-b) adds the displacement opposite to b.
  - Observable performance (DE): Berechnet Summen und Differenzen in Ebene und Raum korrekt und zeigt bei der Differenz den Gegenvektor oder eine gleichwertige Rückwärtsverschiebung.
  - Observable performance (EN): Correctly computes sums and differences in the plane and space and shows the opposite vector or an equivalent reverse displacement for subtraction.
- `geometric-displacement`
  - Essential understanding (DE): Die Summe verkettet Verschiebungen Kopf-an-Schwanz; eine Differenz macht eine angegebene Verschiebung rückgängig oder ermittelt die fehlende Teilverschiebung.
  - Essential understanding (EN): The sum chains displacements head-to-tail; a difference undoes a stated displacement or recovers a missing part of a route.
  - Observable performance (DE): Deutet die errechneten Komponenten als resultierende oder rückgängig gemachte Bewegung und überprüft sie an Endpunkten oder einer Vektorgleichung.
  - Observable performance (EN): Interprets the calculated components as the resultant or reversed movement and checks them against endpoints or a vector equation.

**Coverage expectations**

- required expectations: `component-addition-subtraction`, `geometric-displacement`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `plane-opposite-vector`: In der Ebene Addition und Subtraktion derselben zwei Verschiebungen mit verschiedener geometrischer Wirkung vergleichen. / In the plane, compare addition and subtraction of the same two displacements with different geometric effects.
- `space-waypoint-reconstruction`: Im Raum eine unbekannte Teilverschiebung aus Gesamt- und erster Teilverschiebung zurückgewinnen. / In space, recover an unknown partial displacement from the total and first partial displacements.

**Application cases**

- `planar-map-routes`
  - Task demand (DE): Auf einer Karte gelten die Verschiebungen a=(3,-1) und b=(-2,4). Bestimme a+b und a-b. Erkläre mit einer Kopf-an-Schwanz-Bewegung, warum sich die beiden Endpunkte unterscheiden, wenn jeweils bei O=(0,0) begonnen wird.
  - Task demand (EN): On a map, displacements a=(3,-1) and b=(-2,4) are given. Find a+b and a-b. Use head-to-tail movements to explain why the two endpoints differ when each starts at O=(0,0).
  - Expected performance (DE): a+b=(1,3) endet bei (1,3). Der Gegenvektor ist -b=(2,-4), also a-b=a+(-b)=(5,-5) und Endpunkt (5,-5). Im zweiten Weg folgt auf a die zu b entgegengesetzte Bewegung.
  - Expected performance (EN): a+b=(1,3) ends at (1,3). The opposite vector is -b=(2,-4), so a-b=a+(-b)=(5,-5), ending at (5,-5). In the second route, the movement opposite to b follows a.
  - Understanding focus (DE): Gleiche Vektoren, aber Addition gegenüber Subtraktion als andere zweite Bewegung.
  - Understanding focus (EN): Same vectors, but addition versus subtraction as a different second movement.
- `spatial-waypoint`
  - Task demand (DE): Ein 3D-Weg führt von A=(1,2,0) über B=(4,-1,2) nach C=(2,2,5). Bestimme AB, BC und AC als Verschiebungsvektoren. Prüfe AB+BC=AC und gewinne BC zusätzlich als AC-AB zurück.
  - Task demand (EN): A 3D route goes from A=(1,2,0) via B=(4,-1,2) to C=(2,2,5). Find displacement vectors AB, BC, and AC. Check AB+BC=AC and also recover BC as AC-AB.
  - Expected performance (DE): AB=(3,-3,2), BC=(-2,3,3), AC=(1,0,5). Die komponentenweise Summe (3,-3,2)+(-2,3,3)=(1,0,5) ist die Gesamtverschiebung. AC-AB=(-2,3,3) liefert die fehlende zweite Etappe.
  - Expected performance (EN): AB=(3,-3,2), BC=(-2,3,3), AC=(1,0,5). The component-wise sum (3,-3,2)+(-2,3,3)=(1,0,5) is the total displacement. AC-AB=(-2,3,3) recovers the missing second leg.
  - Understanding focus (DE): Transfer von zwei freien 2D-Vektoren zu einer 3D-Punktkette und rekonstruiertem Teilweg.
  - Understanding focus (EN): Transfer from two free 2D vectors to a 3D point chain and a reconstructed route segment.
## Page 6: Betrag eines Vektors im Raum bestimmen

- Full learning-goal ID: `fb7a4fa0-03b5-53b4-bd86-608480b748a1`
- Goal fingerprint: `sha256:03183807da5f6519fbec04cd75bf1b4e627c78ec6e6c0978a82682cdde951c34`
- Page fingerprint: `sha256:4d88086e1b8c492477ad464c451ecc7f39b756c5240903f057324884de59309a`
- Topic path: Mathematik

### Canonical description

Die lernende Person kann den Betrag eines Vektors im Raum aus seinen Komponenten berechnen und als Länge der zugehörigen Verschiebung deuten.

### Visualization

/assets/goal-visualizations/mathematik/fb7a4fa0-03b5-53b4-bd86-608480b748a1/fb7a4fa0-03b5-53b4-bd86-608480b748a1.jpg

- original digest: `sha256:6051d71316742e7083d6328eaac7f043329733b0a0c6705835283b3f25f49436`
- QA status: `approved`
- approved for public publication: `true`

### Direct prerequisites

- Den Betrag eines ebenen Vektors bestimmen — `3b6fa042-af1e-5c48-a9d0-798a2ab876d0` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Vektoren als Orts-, Richtungs- und Verschiebungsvektoren im Raum beschreiben — `be0e8715-3c3a-5ffb-937a-0b6bce4f01d8` (outside this book)

### Direct reverse prerequisites outside this book

- Abstand zweier Punkte im Raum berechnen — `68d4faef-1a56-5898-9c31-80b7d5d2e430` (outside this book)
- Skalarprodukt von Vektoren definieren — `2ac2e902-a6ad-53c9-b139-d1c63d823023` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:312173296aca861f58935d677a259e5c135e2f365de377be5aa622d090b39525`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `coherent-understanding`
  - Essential understanding (DE): Der euklidische Betrag ist die nichtnegative Länge einer Verschiebung; in orthonormalen Koordinaten ergibt er sich durch räumlichen Pythagoras aus den Komponenten.
  - Essential understanding (EN): The Euclidean magnitude is the nonnegative length of a displacement; in orthonormal coordinates it follows from the spatial Pythagorean relationship between components.
  - Observable performance (DE): Die Person berechnet den Betrag eines Raumvektors und erklärt die Quadratsumme über rechtwinklige Teilstrecken statt Vektorkomponenten bloß zu addieren.
  - Observable performance (EN): The learner calculates a spatial vector magnitude and explains the sum of squares using perpendicular component segments instead of merely adding components.

**Coverage expectations**

- required expectations: `coherent-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `signs-and-norm`: Vorzeichen von Komponenten bei nichtnegativer euklidischer Länge deuten. / Interpret component signs with a nonnegative Euclidean length.
- `components-from-endpoints`: Von direkt gegebenen Komponenten zum Verschiebungsvektor aus zwei Raumkoordinaten wechseln und seine Länge beim Verschieben der Strecke wiedererkennen. / Switch from directly given components to a displacement vector derived from two spatial points and recognize its unchanged length after translating the segment.

**Application cases**

- `negative-component-magnitude`
  - Task demand (DE): Bestimme den Betrag von v=(-2,3,6) in einem orthonormalen Koordinatensystem. Erläutere mit rechtwinkligen Teilstrecken, wie die Komponenten zur Verschiebungslänge beitragen.
  - Task demand (EN): Determine the magnitude of v=(-2,3,6) in an orthonormal coordinate system. Explain using perpendicular component segments how the components contribute to displacement length.
  - Expected performance (DE): Erhält sqrt(4+9+36)=7; erklärt zunächst die Länge sqrt(13) der xy-Projektion und dann den räumlichen Pythagoras. Das negative Vorzeichen der x-Komponente gibt Richtung und keine negative Länge an.
  - Expected performance (EN): Obtains sqrt(4+9+36)=7; first explains the xy-projection length sqrt(13) and then the spatial Pythagorean relation. The negative x component indicates direction rather than a negative length.
  - Understanding focus (DE): Die Norm wird aus orthogonalen Komponenten geometrisch erklärt.
  - Understanding focus (EN): The norm is geometrically explained through orthogonal components.
- `endpoint-displacement-and-translation`
  - Task demand (DE): Zwei Punkte in einem orthonormalen Raumkoordinatensystem sind A=(-2,1,4) und B=(4,4,6). Bestimme den Betrag von AB als räumliche Verschiebungslänge. Wird die ganze Strecke um (3,-4,1) verschoben, wie lang ist die neue Strecke? Begründe mit den Komponenten.
  - Task demand (EN): Two points in an orthonormal spatial coordinate system are A=(-2,1,4) and B=(4,4,6). Find the magnitude of AB as a spatial displacement length. If the whole segment is translated by (3,-4,1), how long is the new segment? Justify using components.
  - Expected performance (DE): AB=B-A=(6,3,2), also |AB|=√(36+9+4)=7 Längeneinheiten. Nach der Verschiebung sind A’=(1,-3,5), B’=(7,0,7) und B’-A’=(6,3,2). Die Länge bleibt 7, weil die Verschiebung beider Endpunkte die Differenz und ihre euklidische Norm nicht verändert.
  - Expected performance (EN): AB=B-A=(6,3,2), so |AB|=√(36+9+4)=7 length units. After translation, A’=(1,-3,5), B’=(7,0,7), and B’-A’=(6,3,2). The length remains 7 because translating both endpoints leaves their difference and its Euclidean norm unchanged.
  - Understanding focus (DE): Transfer von direkt gegebenem Raumvektor zur aus Endpunkten gewonnenen Verschiebung und ihrer invariant bleibenden Länge.
  - Understanding focus (EN): Transfer from a directly supplied spatial vector to an endpoint-derived displacement and its invariant length.
