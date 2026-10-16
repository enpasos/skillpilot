# AI review input: Bogenmass – aktueller vollständiger Requires-Kontext

- Book ID: `radian-requires-three-guard-current8d30`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:e930869539758119466b8d5a4c8d28d8d86623fb010960e450ef1f90c7f6862d`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Bogenmass am Einheitskreis veranschaulichen und sicher zwischen Grad- und Bogenmass wechseln

- Full learning-goal ID: `8d30d241-0247-48ac-83d3-4e0de61584d3`
- Goal fingerprint: `sha256:3a65671ee019d0667be0f3a6e6f78daeffd0255d76d0a1f4b78208220b07f3f9`
- Page fingerprint: `sha256:9dcc47dabd5ea689f7fb6fe166de20385beb59da03845a46cd010b7a58ec5d1a`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 10 > Trigonometrische Funktionen, Einheitskreis und Periodizität

### Canonical description

Die lernende Person kann das Bogenmass als alternative Beschreibung von Winkelgrößen am Einheitskreis veranschaulichen und sicher zwischen Gradmass und Bogenmass wechseln.

### Visualization

/assets/goal-visualizations/mathematik/8d30d241-0247-48ac-83d3-4e0de61584d3/8d30d241-0247-48ac-83d3-4e0de61584d3.png

- original digest: `sha256:cb2028a504e9d4138c220298cba50de2b2a6dd8fee3faa20a7fb7975e79930e6`
- QA status: `approved`
- approved for public publication: `true`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Rationale Zahlen multiplizieren und dividieren — `ee48e811-4c9c-5080-9836-8403fc9f0810` (outside this book)

### Direct reverse prerequisites outside this book

- Sinus- und Kosinuswerte am Einheitskreis im Bogenmass deuten und Winkel bestimmen — `c8818eae-0c4d-4fa1-9085-04a9c95a668b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4e129a13db52643f0f17ba8d614030e771f7110e3099181eac3d44b32c161142`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `radian-measure-is-directed-unit-circle-arc`
  - Essential understanding (DE): Am Einheitskreis ist das Bogenmass eines gerichteten Winkels gleich der vorzeichenbehafteten Länge des vom Startstrahl überstrichenen Kreisbogens; 2π beschreibt einen vollen Umlauf und π einen halben.
  - Essential understanding (EN): On the unit circle, the radian measure of a directed angle equals the signed length of the arc swept from the initial ray; 2π represents a full turn and π a half turn.
  - Observable performance (DE): Die lernende Person veranschaulicht einen neuen positiven oder negativen Winkel durch Drehrichtung, Endstrahl und zugehörigen Einheitskreisbogen und beschriftet dessen Bogenmass.
  - Observable performance (EN): The learner illustrates a fresh positive or negative angle using its direction, terminal ray, and associated unit-circle arc and labels its radian measure.
- `degree-radian-conversion-preserves-turn-fraction`
  - Essential understanding (DE): Grad- und Bogenmass beschreiben denselben Anteil einer Umdrehung mit 180°=π rad; deshalb erfolgt die Umrechnung proportional mit π/180 beziehungsweise 180/π.
  - Essential understanding (EN): Degrees and radians describe the same fraction of a turn with 180 degrees equal to π radians; conversion is therefore proportional using π/180 or 180/π.
  - Observable performance (DE): Die lernende Person rechnet frische Winkel in beide Richtungen exakt um, prüft das Ergebnis an bekannten Viertel- oder Halbumdrehungen und ordnet es demselben Endstrahl zu.
  - Observable performance (EN): The learner converts fresh angles exactly in both directions, checks the result against known quarter or half turns, and assigns it to the same terminal ray.

**Coverage expectations**

- required expectations: `radian-measure-is-directed-unit-circle-arc`, `degree-radian-conversion-preserves-turn-fraction`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `source-unit`: Gradmass oder Bogenmass gegeben / degrees or radians given
- `direction`: positive gegenläufige oder negative im Uhrzeigersinn verlaufende Drehung / positive counterclockwise or negative clockwise rotation
- `angle-range`: Winkel innerhalb einer Umdrehung oder koterminaler Winkel außerhalb / angle within one turn or coterminal angle outside it

**Application cases**

- `three-quarters-pi-unit-circle`
  - Task demand (DE): Veranschauliche 3π/4 am Einheitskreis mit Drehrichtung, Bogen und Endstrahl, rechne den Winkel in Grad um und erkläre die Lage im zweiten Quadranten.
  - Task demand (EN): Illustrate 3π/4 on the unit circle with direction, arc, and terminal ray, convert the angle to degrees, and explain its position in quadrant II.
  - Expected performance (DE): Der gegen den Uhrzeigersinn gemessene Bogen hat Länge 3π/4; Multiplikation mit 180°/π ergibt 135°. Das liegt zwischen 90° und 180° und endet deshalb im zweiten Quadranten.
  - Expected performance (EN): The counterclockwise arc has length 3π/4; multiplying by 180 degrees/π gives 135 degrees. This lies between 90 and 180 degrees and therefore ends in quadrant II.
  - Understanding focus (DE): Direkte Verbindung von Einheitskreisbogen, Bogenmass, Gradmass und räumlicher Lage.
  - Understanding focus (EN): Direct connection among unit-circle arc, radian measure, degree measure, and geometric position.
- `negative-degree-to-radian-transfer`
  - Task demand (DE): Wandle −210° exakt in Bogenmass um, zeichne die gerichtete Drehung am Einheitskreis und gib zusätzlich den koterminalen Winkel im Intervall [0,2π) an. Erkläre, warum beide denselben Endstrahl besitzen.
  - Task demand (EN): Convert −210 degrees exactly to radians, draw the directed turn on the unit circle, and also give the coterminal angle in [0,2π). Explain why both have the same terminal ray.
  - Expected performance (DE): −210°·π/180°=−7π/6. Durch Addition eines vollen Umlaufs 2π entsteht 5π/6 im verlangten Intervall; beide Winkel unterscheiden sich um 2π und haben daher denselben Endstrahl.
  - Expected performance (EN): −210 degrees times π/180 degrees equals −7π/6. Adding one full turn 2π gives 5π/6 in the required interval; the angles differ by 2π and therefore share a terminal ray.
  - Understanding focus (DE): Unabhängiger Rückwärtstransfer mit negativer Drehrichtung und expliziter Darstellungsgrenze.
  - Understanding focus (EN): Independent reverse transfer with negative rotation and an explicit representation boundary.
