# AI review input: Physik: Schiefer Wurf mit aktueller Vorbereitung

- Book ID: `de-gym-physik-e1-schief-current-v2-20261124`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:ecad58e4979abc8ca4243f22f3934b2b6649855f3614e0f17fa2b0ab4f827d97`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Schiefen Wurf beschreiben

- Full learning-goal ID: `fbecbd60-5db3-51e8-94be-d66b066ffa06`
- Goal fingerprint: `sha256:eb057cbd36e2324347f60f0c31df17a80b6163948aab8cefb6f0a86b59ca9778`
- Page fingerprint: `sha256:5c7bd7db8ffdd463678423276f8fd77c31891dcc88b9b5cad203ac9f3c883ac7`
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

Status: `needs_human_review`; profile fingerprint: `sha256:db051f341887b1503914f88ba253c1f978c706c4c65bc119962f7992644623ab`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `components`
  - Essential understanding (DE): Der schiefe Wurf lässt sich aus gleichförmiger Horizontalbewegung und vertikaler Bewegung mit Anfangsanteil und genau einer Fallbeschleunigung zusammensetzen; alle Komponenten verwenden dieselbe Zeit.
  - Essential understanding (EN): Oblique projection can be composed from uniform horizontal motion and vertical motion with an initial component and exactly one gravitational acceleration; all components use the same time.
  - Observable performance (DE): Die lernende Person übersetzt vorgegebene Komponenten- oder Zeitdaten in eine qualitative Flugbahnskizze und erklärt am Scheitel den Unterschied zwischen vertikaler und gesamter Geschwindigkeit.
  - Observable performance (EN): The learner translates supplied component or time data into a qualitative trajectory sketch and explains the difference between vertical and total velocity at the highest point.
- `changed-launch`
  - Essential understanding (DE): Ein vertikaler Startanteil nach oben oder unten verändert den vertikalen Bewegungsbeginn, nicht die konstante horizontale Bewegung. Die Fallbeschleunigung wirkt im idealisierten Modell während des gesamten Flugs konstant nach unten; bei der zulässigen Überlagerung aus waagerechtem Wurf und gleichförmigem vertikalem Zusatzanteil wird sie genau einmal berücksichtigt.
  - Essential understanding (EN): An upward or downward initial vertical component changes the initial vertical motion, not the constant horizontal motion. In the idealised model, gravitational acceleration acts constantly downward throughout the flight; in the permitted superposition of horizontal projection and a uniform additional vertical contribution, it is included exactly once.
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
  - Task demand (DE): Ein ideales Wurfmodell ohne Luftwiderstand gibt für die Zeitpunkte t=0/0,2/0,4/0,6/0,8 s die zugehörigen Positionen (x;y)=(0;0)/(0,6;0,6)/(1,2;0,8)/(1,8;0,6)/(2,4;0) m. Skizziere die typische Bahn mit x und y als Ortskoordinaten und den Zeitpunkten als Beschriftungen an den Bahnpunkten. Erkläre die Bewegungskomponenten, erschließe aus Punktabständen und Bahnform die Richtung der Geschwindigkeit am höchsten Punkt und begründe die dort weiterhin wirkende Fallbeschleunigung; keine trigonometrische Zerlegung ist gefordert.
  - Task demand (EN): An ideal projectile model without air resistance gives the corresponding positions (x,y)=(0,0)/(0.6,0.6)/(1.2,0.8)/(1.8,0.6)/(2.4,0) m at times t=0/0.2/0.4/0.6/0.8 s. Sketch the typical trajectory with x and y as position coordinates and the times as labels at the trajectory points. Explain the motion components, infer the direction of velocity at the highest point from the point spacings and trajectory shape, and explain why gravitational acceleration continues to act there; no trigonometric decomposition is required.
  - Expected performance (DE): Konstruiert eine nach unten gekrümmte, zur gleichen Start-/Endhöhe passende Bahn mit gleich großen horizontalen Wegstrecken in gleichen Zeitintervallen. Kennzeichnet x und y als Ortskoordinaten und die Zeiten an den Bahnpunkten. Erschließt aus Punktabständen und Bahnform die nach rechts gerichtete Geschwindigkeit am Scheitel: Dort ist nur v_y=0, während v_x ungleich null bleibt. Begründet mit der fortdauernden Schwerkraftwirkung, dass die Beschleunigung auch am Scheitel unverändert nach unten gerichtet ist. Verwendet für beide Komponenten dieselben Zeiten.
  - Expected performance (EN): Construct a downward-curving trajectory consistent with equal launch/landing heights and equal horizontal distances over equal time intervals. Identify x and y as position coordinates and label times at the trajectory points. Infer from point spacings and trajectory shape that velocity at the highest point is directed to the right: only v_y=0, while v_x remains nonzero. Explain, using the continuing action of gravity, why acceleration remains unchanged and directed downward at the highest point. Use the same times for both components.
  - Understanding focus (DE): Eigenständige Koordination von Tabelle, Geschwindigkeitskomponenten und typischer Bahn statt auswendig gelernter Scheitelbehauptung.
  - Understanding focus (EN): Independent coordination of a table, velocity components and typical trajectory rather than a memorised claim about the highest point.
- `downward-launch`
  - Task demand (DE): Ein frischer idealer Wurf startet 2 m über dem Boden mit unverändert nach rechts gerichtetem v_x, aber einem von Anfang an nach unten gerichteten vertikalen Startanteil. Die vertikale Beschleunigung bleibt während des gesamten Flugs konstant nach unten gerichtet. Skizziere qualitativ mit x und y als Ortskoordinaten und Zeitmarkierungen an den Bahnpunkten in gleichen Zeitintervallen. Vergleiche mit dem zuvor nach oben gestarteten Wurf und begründe, welche Scheitel- und Symmetrieaussagen für den tatsächlich durchflogenen Abschnitt gelten; eine Flugzeitrechnung ist nicht verlangt.
  - Task demand (EN): A fresh ideal projectile starts 2 m above the ground with unchanged rightward v_x but an initially downward vertical component. Vertical acceleration remains constant and downward throughout the flight. Sketch qualitatively with x and y as position coordinates and time labels at trajectory points separated by equal time intervals. Compare with the previous upward launch and explain which highest-point and symmetry statements apply to the segment actually traversed; no flight-time calculation is required.
  - Expected performance (DE): Zeichnet eine unmittelbar sinkende, zunehmend steile Bahn mit gleich großen horizontalen Wegstrecken in gleichen Zeitintervallen; x und y sind Ortskoordinaten, die Zeit wird an den Bahnpunkten markiert. Begründet, dass der tatsächlich durchflogene Abschnitt am höchsten Punkt dieses Flugs beginnt und nur den absteigenden Ast enthält. Erklärt damit, warum nach dem Abwurf kein oberhalb des Startpunkts liegender Scheitel auftritt und die Symmetrie eines vollständigen Auf- und Abstiegs zwischen gleicher Start- und Endhöhe für diesen Abschnitt nicht gilt. Beschreibt den schiefen Wurf als waagerechten Wurf plus gleichförmigen vertikalen Zusatzanteil oder als zwei getrennte Komponenten; die während des gesamten Flugs konstant nach unten wirkende Fallbeschleunigung wird in der Überlagerung genau einmal berücksichtigt.
  - Expected performance (EN): Draw an immediately descending, increasingly steep trajectory with equal horizontal distances over equal time intervals; x and y are position coordinates, and time is marked at the trajectory points. Explain that the segment actually traversed begins at the highest point of this flight and contains only the descending branch. Use this to explain why no highest point above the launch position occurs after release and why the symmetry of a complete ascent and descent between equal launch and landing heights does not apply to this segment. Describe oblique projection as horizontal projection plus a uniform additional vertical contribution, or as two separate components; gravitational acceleration acts constantly downward throughout the flight and is included exactly once in the superposition.
  - Understanding focus (DE): Echter Vorzeichen-/Höhenwechsel bleibt qualitative Wurfkompetenz; mathematisch zulässige Überlagerung ohne doppelte Fallbeschleunigung.
  - Understanding focus (EN): A genuine sign/height change remains a qualitative projectile competence; mathematically valid superposition without double gravitational acceleration.
