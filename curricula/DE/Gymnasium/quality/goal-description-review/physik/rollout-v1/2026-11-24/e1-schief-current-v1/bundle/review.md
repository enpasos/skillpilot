# AI review input: Physik: Schiefer Wurf mit aktueller Vorbereitung

- Book ID: `de-gym-physik-e1-schief-current-v1-20261124`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:2f5602e6fdb550bbb90c5189251ef70622f3b5db19a935efef08db8d096a7e13`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Schiefen Wurf beschreiben

- Full learning-goal ID: `fbecbd60-5db3-51e8-94be-d66b066ffa06`
- Goal fingerprint: `sha256:eb057cbd36e2324347f60f0c31df17a80b6163948aab8cefb6f0a86b59ca9778`
- Page fingerprint: `sha256:e06e9b0550040b6eddef6e9e6dd6d90ee3573c1836e5312de3cc8f2a9e20273b`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Weitere Bewegungen

### Canonical description

Die lernende Person kann den schiefen Wurf ohne Luftwiderstand als Überlagerung einer gleichförmigen horizontalen und einer durch die Schwerkraft gleichmäßig beschleunigten vertikalen Bewegung beschreiben und typische Flugbahnen qualitativ skizzieren.

### Visualization

/assets/goal-visualizations/physik/fbecbd60-5db3-51e8-94be-d66b066ffa06/fbecbd60-5db3-51e8-94be-d66b066ffa06.jpg

- original digest: `sha256:44fdf8a6f0482ba45bf86eff4b8179b7dd71bc384fa367920d138f06c16890e8`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Geschwindigkeit beim waagerechten Wurf als Vektor bestimmen — `0fee53f2-1c02-5b12-9b6c-aa9fa462d921` (outside this book)

### Direct reverse prerequisites outside this book

- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Mehrschrittige Bewegungsmodelle mit Reibung und Chaos analysieren — `dd99528a-bae5-5b78-89e6-c6092c927f8d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:084c984a81c405c617ae91bf5e662816ed9c674a2ea0ed1a56a79fdca02291b4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `components`
  - Essential understanding (DE): Der schiefe Wurf lässt sich aus gleichförmiger Horizontalbewegung und vertikaler Bewegung mit Anfangsanteil und genau einer Fallbeschleunigung zusammensetzen; alle Komponenten verwenden dieselbe Zeit.
  - Essential understanding (EN): Oblique projection can be composed from uniform horizontal motion and vertical motion with an initial component and exactly one gravitational acceleration; all components use the same time.
  - Observable performance (DE): Die lernende Person übersetzt vorgegebene Komponenten- oder Zeitdaten in eine qualitative Flugbahnskizze und erklärt am Scheitel den Unterschied zwischen vertikaler und gesamter Geschwindigkeit.
  - Observable performance (EN): The learner translates supplied component or time data into a qualitative trajectory sketch and explains the difference between vertical and total velocity at the highest point.
- `changed-launch`
  - Essential understanding (DE): Ein vertikaler Startanteil nach oben oder unten verändert den vertikalen Bewegungsbeginn, nicht die konstante horizontale Bewegung oder die einmal wirkende Fallbeschleunigung im idealisierten Modell.
  - Essential understanding (EN): An upward or downward initial vertical component changes the initial vertical motion, not the constant horizontal motion or the single gravitational acceleration in the idealised model.
  - Observable performance (DE): Die lernende Person konstruiert für einen geänderten Startanteil eine konsistente qualitative Bahn und begründet, welche bekannten Scheitel-/Symmetrieaussagen für die neue Start- und Endhöhe gelten.
  - Observable performance (EN): The learner constructs a consistent qualitative trajectory for a changed initial component and explains which familiar highest-point/symmetry statements apply to the new initial and final heights.

**Coverage expectations**

- required expectations: `components`, `changed-launch`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `vertical-sign`: Positiver gegenüber negativem vertikalem Startanteil bei gleichem horizontalem Anteil. / Positive versus negative initial vertical component at equal horizontal component.
- `height-context`: Gleiche Start-/Endhöhe gegenüber Abwurf oberhalb des Bodens; typische Symmetrie nicht auf den abgeschnittenen gesamten Flug übertragen. / Equal launch/landing height versus launch above the ground; do not transfer typical symmetry to the entire height-truncated flight.

**Application cases**

- `upward-components`
  - Task demand (DE): Ein ideales Wurfmodell ohne Luftwiderstand gibt für t=0/0,2/0,4/0,6/0,8 s die Positionen (x,y)=(0,0)/(0,6;0,6)/(1,2;0,8)/(1,8;0,6)/(2,4;0) m. Dabei bleibt v_x=3 m/s und v_y durchläuft +4/+2/0/−2/−4 m/s. Skizziere die typische Bahn und erkläre Komponenten und Bewegung am höchsten Punkt; keine trigonometrische Zerlegung ist gefordert.
  - Task demand (EN): An ideal projectile model without air resistance gives positions (x,y)=(0,0)/(0.6,0.6)/(1.2,0.8)/(1.8,0.6)/(2.4,0) m at t=0/0.2/0.4/0.6/0.8 s. Here v_x remains 3 m/s while v_y takes +4/+2/0/−2/−4 m/s. Sketch the typical trajectory and explain components and motion at the highest point; no trigonometric decomposition is required.
  - Expected performance (DE): Konstruiert eine nach unten gekrümmte, zur gleichen Start-/Endhöhe passende Bahn mit gleich großen horizontalen Zeitschritten; erklärt, dass am Scheitel nur v_y=0, aber v_x und die abwärts gerichtete Beschleunigung nicht null sind. Verwendet für beide Komponenten dieselben Zeiten.
  - Expected performance (EN): Construct a downward-curving trajectory consistent with equal start/landing heights and equal horizontal steps in equal times; explain that only v_y=0 at the highest point, while v_x and downward acceleration are nonzero. Use the same times for both components.
  - Understanding focus (DE): Eigenständige Koordination von Tabelle, Geschwindigkeitskomponenten und typischer Bahn statt auswendig gelernter Scheitelbehauptung.
  - Understanding focus (EN): Independent coordination of a table, velocity components and typical trajectory rather than a memorised claim about the highest point.
- `downward-launch`
  - Task demand (DE): Ein frischer idealer Wurf startet 2 m über dem Boden mit unverändert nach rechts gerichtetem v_x, aber einem von Anfang an nach unten gerichteten vertikalen Startanteil. Die vertikale Beschleunigung bleibt konstant nach unten. Skizziere qualitativ und vergleiche mit dem zuvor nach oben gestarteten Wurf; eine Flugzeitrechnung ist nicht verlangt.
  - Task demand (EN): A fresh ideal projectile starts 2 m above the ground with unchanged rightward v_x but an initially downward vertical component. Vertical acceleration remains constant downward. Sketch qualitatively and compare with the previous upward launch; no flight-time calculation is required.
  - Expected performance (DE): Zeichnet eine unmittelbar sinkende, zunehmend steile Bahn bei gleichen horizontalen Zeitabständen und erklärt, warum nach dem Abwurf kein oberhalb des Startpunkts liegender Scheitel auftritt. Beschreibt den schiefen Wurf als waagerechten Wurf plus gleichförmigen vertikalen Startanteil oder als zwei getrennte Komponenten mit nur einmal berücksichtigter Erdbeschleunigung.
  - Expected performance (EN): Draw an immediately descending, increasingly steep trajectory with equal horizontal displacements in equal times and explain why no highest point above the launch position occurs after release. Describe oblique projection as horizontal projection plus a uniform initial vertical contribution, or as two components with gravity included only once.
  - Understanding focus (DE): Echter Vorzeichen-/Höhenwechsel bleibt qualitative Wurfkompetenz; mathematisch zulässige Überlagerung ohne doppelte Fallbeschleunigung.
  - Understanding focus (EN): A genuine sign/height change remains a qualitative projectile competence; mathematically valid superposition without double gravitational acceleration.
