# AI review input: Physik: acht aktuelle Mess-, Fall-, Diagramm- und Wurfkompetenzen

- Book ID: `de-gym-physik-e1-current-eight-v1-20261124`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:4c369132bf268bac4b8c405c310c6794eceb3675fd15d99134d9f7f88bb14167`
- Selected goals: 8

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Bewegungen messen und im t-s-Diagramm darstellen

- Full learning-goal ID: `ce431132-dfc4-42c2-aff6-bd72035190f8`
- Goal fingerprint: `sha256:d56c577fcd14b108d7c96168875be2bb8ea6364769693e15553bb19741cc370d`
- Page fingerprint: `sha256:69430b250946c97a8e2901675615c9ad03e025a7ac8c0f5af6465873c3b87a79`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.1 Bewegungen und ihre Beschreibung

### Canonical description

Die lernende Person kann eine einfache eindimensionale Bewegung experimentell erfassen, die Orts-Zeit-Daten im t-s-Diagramm darstellen und daraus Ruhe, Bewegungsrichtung und schnellere oder langsamere Abschnitte ablesen. Sie berücksichtigt die Messauflösung.

### Visualization

/assets/goal-visualizations/physik/ce431132-dfc4-42c2-aff6-bd72035190f8/ce431132-dfc4-42c2-aff6-bd72035190f8.jpeg

- original digest: `sha256:3fc1905a49eedd824a145481c7426aafa93e5adfd68007771ffa29cc73d008d0`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Punktlagen und daraus bestimmte lineare Objekte im Koordinatensystem darstellen — `25593605-5e13-55cc-9a05-8f3d737e15e9` (outside this book)
- Bewegungen mit Weg-Zeit-Diagrammen beschreiben — `ae67bcf1-f3ee-50d6-9a12-25a159dff659` (outside this book)

### Direct reverse prerequisites outside this book

- Eigene Bewegungsmessung und unabhängiges Geschwindigkeitsprotokoll — `cd182a3c-be23-5f5a-87f6-0898ea16cb74` (outside this book)
- Gleichförmige Bewegung und Geschwindigkeit — `971beafa-6ba5-4c82-ac8b-7ebf66eec3dd` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4dc9c45ebf91356d50ba43eb7d86ea4b736314829498cb849064f58cb75695ff`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `measure-position-time`
  - Essential understanding (DE): Orts-Zeit-Daten beziehen sich auf einen festgelegten Körperpunkt, Nullpunkt, eine positive Richtung und eine gemeinsame Zeitbasis. Messauflösung und Abtastrate begrenzen erkennbare Änderungen.
  - Essential understanding (EN): Position-time data refer to a specified point on the object, origin, positive direction and common time base. Measurement resolution and sampling rate limit detectable changes.
  - Observable performance (DE): Plant und erhebt selbst Daten zu einer prüfbaren Frage nach Ruhe, Richtung oder Tempo. Legt Messprinzip, Koordinaten, zeitliche Abstände und Auflösung fest, hält die Bewegung eindimensional und sichert den langsamen Aufbau. Dokumentiert Rohdaten, eigene Tätigkeiten und Hilfe.
  - Observable performance (EN): Plans and personally collects data for a testable question about rest, direction or speed. Specifies the measurement principle, coordinates, sampling intervals and resolution, keeps motion one-dimensional and secures the slow setup. Documents raw data, personal work and assistance.
- `construct-interpret-position-graph`
  - Essential understanding (DE): Im t-s-Diagramm steht Zeit waagerecht und Ort senkrecht. Waagerechte Abschnitte zeigen innerhalb der Auflösung Ruhe; steigende oder fallende Abschnitte zeigen die Richtung. Größere Ortsänderungen in gleichen Zeitspannen bedeuten schnellere Bewegung.
  - Essential understanding (EN): In a t-s graph, time is horizontal and position vertical. Horizontal sections indicate rest within resolution; rising or falling sections indicate direction. Larger position changes over equal time spans mean faster motion.
  - Observable performance (DE): Erstellt aus eigenen Daten einen beschrifteten, skalierten Graphen und begründet Ruhe, Richtung sowie schnellere und langsamere Abschnitte mit Messintervallen. Unterscheidet die Graphenform vom räumlichen Weg.
  - Observable performance (EN): Constructs a labeled, scaled graph from personal data and supports judgments about rest, direction and faster or slower sections using measurement intervals. Distinguishes graph shape from the spatial path.
- `qualify-motion-claims`
  - Essential understanding (DE): Kleine Schwankungen können Messstreuung sein; zwischen diskreten Messpunkten ist der genaue Bewegungsverlauf nicht vollständig bekannt.
  - Essential understanding (EN): Small fluctuations may be measurement scatter; the exact motion between discrete measurements is not fully known.
  - Observable performance (DE): Prüft Deutungen an Auflösung und Streuung, bezeichnet nicht auflösbare Unterschiede als unentschieden und begründet eine Messverbesserung, wenn Ruhe oder eine kurze Umkehr nicht sicher erkennbar sind.
  - Observable performance (EN): Checks interpretations against resolution and scatter, reports unresolved differences as undecided and justifies a measurement improvement when rest or a brief reversal cannot be established.

**Coverage expectations**

- required expectations: `measure-position-time`, `construct-interpret-position-graph`, `qualify-motion-claims`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `measurement-principle`: Elektronische Abstandsmessung gegenüber kalibrierter Bildmessung mit anderer räumlicher und zeitlicher Auflösung. / Electronic distance measurement versus calibrated image measurement with different spatial and temporal resolution.
- `direction-and-pause`: Bewegung in positiver Richtung mit Pause gegenüber einer Bewegung mit Umkehr. / Motion in the positive direction with a pause versus motion with a reversal.

**Application cases**

- `sensor-cart`
  - Task demand (DE): Erfasse selbst mit einem Abstandssensor einen langsam bewegten Wagen auf einer gesicherten geraden Strecke: eine Pause und zwei verschieden schnelle Abschnitte. Formuliere die Untersuchungsfrage und wähle eine passende Abtastung.
  - Task demand (EN): Personally record a slowly moving cart with a distance sensor on a secured straight track: include a pause and two sections at different speeds. Formulate the investigation question and choose suitable sampling.
  - Expected performance (DE): Legt eigene Rohdaten und einen t-s-Graphen mit Einheiten vor. Ordnet die Pause einem innerhalb der Messunsicherheit konstanten Ort zu und belegt den schnelleren Abschnitt durch größere Ortsänderungen in gleichen Zeitspannen. Nennt Auflösung und Streuung.
  - Expected performance (EN): Provides personal raw data and a t-s graph with units. Identifies the pause as position constant within measurement uncertainty and supports the faster section using larger position changes over equal time spans. States resolution and scatter.
  - Understanding focus (DE): Orts-Zeit-Daten tragen Bewegungsaussagen zusammen mit Koordinatenkonvention und Messauflösung.
  - Understanding focus (EN): Position-time data support motion claims together with coordinate conventions and measurement resolution.
- `own-video-reversal`
  - Task demand (DE): Nimm selbst einen entlang eines Maßstabs bewegten Marker mit langsamer Umkehr auf. Gewinne daraus eigenständig Orts-Zeit-Daten, wähle eine positive Richtung und prüfe, ob ein kurzer Halt an der Umkehr auflösbar ist.
  - Task demand (EN): Personally record a marker moving along a scale with a slow reversal. Independently extract position-time data, choose a positive direction and determine whether a brief stop at reversal is resolvable.
  - Expected performance (DE): Dokumentiert eigene Aufnahme, Maßstab, Bildzeit und Positionsauflösung. Konstruiert einen neuen Graphen mit steigendem und fallendem Abschnitt und begründet Richtung und Tempovergleich. Unterscheidet eine nachgewiesene Pause von einer wegen grober Abtastung unentschiedenen Aussage.
  - Expected performance (EN): Documents the personal recording, scale, frame timing and position resolution. Constructs a new graph with rising and falling sections and justifies direction and speed comparisons. Distinguishes an established pause from an undecided claim caused by coarse sampling.
  - Understanding focus (DE): Ein Vorzeichenwechsel der Ortsänderung zeigt eine Umkehr; einzelne Messpunkte beweisen keinen zeitlich ausgedehnten Stillstand.
  - Understanding focus (EN): A sign change in position change indicates reversal; individual measurements do not establish rest over an extended interval.
## Page 2: t-v-Diagramm und Ortsänderung als Fläche

- Full learning-goal ID: `1e459a1b-4159-5049-84eb-9928129c1610`
- Goal fingerprint: `sha256:c1541135369d178288883a22e4ec46c8f921a59a89dd758a2c6eea47553a354a`
- Page fingerprint: `sha256:39dde4ad095430ae76184cae94f54a86681ace46bbd3d9ba28d7f35b607f4063`
- Topic path: Physik

### Canonical description

Die lernende Person kann aus Orts-Zeit-Daten mittlere Intervallgeschwindigkeiten bestimmen, im t-v-Diagramm darstellen und die Ortsänderung als vorzeichenbehaftete Fläche unter dem Graphen deuten.

### Visualization

/assets/goal-visualizations/physik/1e459a1b-4159-5049-84eb-9928129c1610/1e459a1b-4159-5049-84eb-9928129c1610.jpeg

- original digest: `sha256:bcb8ddfe22cc927e59b4d5af7f3e98c81f3dd4fc4749dd5ccdb5878091402fdf`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umfang und Flächeninhalt unterscheiden und anwenden — `d6c3fb37-ece6-5b56-9221-1eeb21845877` (outside this book)
- Gleichförmige Bewegung und Geschwindigkeit — `971beafa-6ba5-4c82-ac8b-7ebf66eec3dd` (outside this book)
- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- Gleichmäßig beschleunigte Bewegung und Beschleunigung — `e4b38061-1f28-43ad-8371-a3e7c0e81856` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:93bc4ac8445fd148f37dcdb5e420e433209115e21e507babad0646cf0da46844`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `interval-velocity`
  - Essential understanding (DE): Die mittlere Intervallgeschwindigkeit ist Δs/Δt mit positiver Zeitspanne; ihr Vorzeichen bezieht sich auf die gewählte Ortsachse.
  - Essential understanding (EN): Average interval velocity is Δs/Δt with a positive elapsed time; its sign refers to the chosen position axis.
  - Observable performance (DE): Bestimmt aus neuen Orts-Zeit-Daten die Geschwindigkeiten für die tatsächlichen, auch ungleichen Intervalle und erläutert Vorzeichen und Einheit m/s.
  - Observable performance (EN): Determines velocities from fresh position-time data using the actual, possibly unequal intervals and explains their signs and unit m/s.
- `construct-interval-graph`
  - Essential understanding (DE): Ein t-v-Intervallgraph ordnet jedem Zeitintervall seinen Mittelwert zu; seine Stufen behaupten keinen gemessenen momentanen Verlauf innerhalb der Intervalle.
  - Essential understanding (EN): An interval t-v graph assigns its mean velocity to each time interval; its steps do not claim a measured instantaneous history within the intervals.
  - Observable performance (DE): Erstellt einen beschrifteten Stufengraphen mit korrekten Zeitgrenzen und unterscheidet Intervallmittelwerte von unbekannten Momentangeschwindigkeiten.
  - Observable performance (EN): Constructs a labeled step graph with correct time boundaries and distinguishes interval means from unknown instantaneous velocities.
- `signed-area`
  - Essential understanding (DE): Die vorzeichenbehaftete Fläche v̄·Δt hat die Einheit Meter und entspricht der Ortsänderung des Intervalls; gegenläufige Änderungen können sich aufheben.
  - Essential understanding (EN): The signed area v̄·Δt has unit metres and equals the interval displacement; changes in opposite directions can cancel.
  - Observable performance (DE): Ermittelt die Netto-Ortsänderung aus positiven und negativen Rechtecksflächen, rekonstruiert mit dem Anfangsort den Endort und prüft ihn an den Ortsdaten.
  - Observable performance (EN): Finds net displacement from positive and negative rectangle areas, reconstructs the final position using the initial position, and checks it against the position data.

**Coverage expectations**

- required expectations: `interval-velocity`, `construct-interval-graph`, `signed-area`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `direction-and-rest`: Nur positive Ortsänderungen gegenüber Richtungswechsel und Ruheintervall. / Only positive displacements versus reversal and a rest interval.
- `time-partition`: Gleiche oder ungleiche Messintervalle; die tatsächliche Rechteckbreite entscheidet über den Flächenbeitrag. / Equal or unequal sampling intervals; actual rectangle width determines the area contribution.

**Application cases**

- `unequal-forward-intervals`
  - Task demand (DE): Für t = 0; 1; 3; 4 s liegen Orte s = 1; 3; 9; 10 m vor. Bestimme Intervallgeschwindigkeiten, erstelle den t-v-Intervallgraphen und gewinne daraus die Ortsänderung.
  - Task demand (EN): At t = 0, 1, 3, 4 s, positions are s = 1, 3, 9, 10 m. Determine interval velocities, construct the interval t-v graph, and recover displacement from it.
  - Expected performance (DE): Erzeugt Stufen von 2; 3; 1 m/s auf den Breiten 1; 2; 1 s. Begründet Δs = 2 + 6 + 1 = 9 m und sEnde = 10 m; die Stufen legen den inneren Bewegungsverlauf nicht fest.
  - Expected performance (EN): Produces steps of 2, 3, 1 m/s over widths 1, 2, 1 s. Justifies Δs = 2 + 6 + 1 = 9 m and final position 10 m; the steps do not determine motion within each interval.
  - Understanding focus (DE): Ungleiche Zeitbreiten und Ortsnullpunkt bleiben bei der Flächendeutung erhalten.
  - Understanding focus (EN): Area interpretation retains unequal interval widths and the position origin.
- `return-with-pause`
  - Task demand (DE): Bearbeite unabhängig neue Daten: t = 0; 2; 3; 5 s und s = 4; 8; 8; 2 m. Stelle die Intervallgeschwindigkeiten dar und erkläre den Endort durch vorzeichenbehaftete Flächen.
  - Task demand (EN): Independently process fresh data: t = 0, 2, 3, 5 s and s = 4, 8, 8, 2 m. Represent the interval velocities and explain the final position through signed areas.
  - Expected performance (DE): Erhält +2; 0; −3 m/s und Flächen +4; 0; −6 m. Folgert Δs = −2 m und sEnde = 2 m; begründet Ruhe, Rückbewegung und teilweise Aufhebung der Flächen.
  - Expected performance (EN): Obtains +2, 0, −3 m/s and areas +4, 0, −6 m. Concludes Δs = −2 m and final position 2 m; explains rest, return motion, and partial area cancellation.
  - Understanding focus (DE): Negative Fläche bedeutet Ortsänderung entgegen der positiven Achse; ein Ruheintervall trägt keine Fläche bei.
  - Understanding focus (EN): Negative area means displacement opposite the positive axis; a rest interval contributes no area.
## Page 3: Bewegungen mit Zeit-Ort- und Zeit-Geschwindigkeits-Gesetzen beschreiben

- Full learning-goal ID: `262f807a-30d0-503e-986f-856cbd048e8e`
- Goal fingerprint: `sha256:9729fe9b2fca11940d48bfb8dfeece1f8f2f90af28740f5bee994cd61fe17818`
- Page fingerprint: `sha256:c1af1770913fa6a2850e8e6d576a5f0a9a59c1f34494f0e2d53d5f6e2b9b8ddb`
- Topic path: Physik

### Canonical description

Die lernende Person kann für gleichförmige und gleichmäßig beschleunigte Bewegungen das Zeit-Ort- und das Zeit-Geschwindigkeits-Gesetz aus den Diagrammen ermitteln, ihren Zusammenhang erläutern und damit Ort und Geschwindigkeit zu einem Zeitpunkt vorhersagen.

### Visualization

/assets/goal-visualizations/physik/262f807a-30d0-503e-986f-856cbd048e8e/262f807a-30d0-503e-986f-856cbd048e8e.png

- original digest: `sha256:04f93d8140ab7e15306bdfb15f1039e390ae32930a29e9d5b66b0a9989e99cc1`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Freier Fall experimentell untersuchen — `09029573-864f-40ca-bf8a-cee7bf6dcb73` (page 4)

### Prerequisites outside this book

- Terme mit Variablen lesen und deuten — `f08d06dc-139d-5fd2-892c-8cc919b1e4fc` (outside this book)
- Gleichmäßig beschleunigte Bewegung und Beschleunigung — `e4b38061-1f28-43ad-8371-a3e7c0e81856` (outside this book)

### Direct reverse prerequisites outside this book

- Beschleunigungsprotokoll: Geschwindigkeit, Ort und Modellgrenzen — `a8dc0290-9f80-5763-8943-e16b8d2aa860` (outside this book)
- Beschleunigungsprotokoll: Geschwindigkeit, Ort und Modellgrenzen — `f13ca187-b680-5f47-b4ad-76bd474bd8a2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:cff1f73d68a15c3e816877261729f2ff8db99190587bd3df9882b6a3b80841e4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `infer-laws-from-graphs`
  - Essential understanding (DE): Für gleichförmige Bewegung gilt v(t) = v0 und s(t) = s0 + v0t; bei konstantem a gilt v(t) = v0 + at und s(t) = s0 + v0t + ½at². t wird ab dem angegebenen Anfangszeitpunkt gemessen.
  - Essential understanding (EN): For uniform motion, v(t) = v0 and s(t) = s0 + v0t; for constant a, v(t) = v0 + at and s(t) = s0 + v0t + ½at². Time t is measured from the stated initial instant.
  - Observable performance (DE): Wählt anhand neuer Zeitdiagramme das passende der beiden Modelle und ermittelt s0, v0 und gegebenenfalls a aus Achsenabschnitten, Steigungen oder Flächen; formuliert beide Gesetze mit Einheiten und konsistenten Vorzeichen.
  - Observable performance (EN): Selects the appropriate model from fresh time graphs and obtains s0, v0, and, where needed, a from intercepts, slopes, or areas; formulates both laws with units and consistent signs.
- `explain-law-connection`
  - Essential understanding (DE): Die Geschwindigkeit beschreibt die Steigung des Ortsgraphen; die vorzeichenbehaftete t-v-Fläche ergibt s(t) − s0. Bei linear veränderlichem v liefert die Trapezfläche den Faktor ½.
  - Essential understanding (EN): Velocity describes the position graph's slope; signed t-v area gives s(t) − s0. For linearly changing v, the trapezoid area supplies the factor ½.
  - Observable performance (DE): Begründet den Zusammenhang der selbst bestimmten Gesetze durch Steigung und Rechteck- oder Trapezflächen ohne Differentialrechnung und prüft mindestens einen gemeinsamen Zeitpunkt am Ausgangsdiagramm.
  - Observable performance (EN): Explains the connection between the self-determined laws using slope and rectangle or trapezoid areas without calculus and checks at least one common instant against the source graph.
- `predict-and-check`
  - Essential understanding (DE): Eine Vorhersage für Ort und Geschwindigkeit gilt für das gewählte Modellintervall; Anfangsort, Bewegungsrichtung und Einheiten bleiben dabei erhalten.
  - Essential understanding (EN): A position and velocity prediction applies within the selected model interval; it retains initial position, direction of motion, and units.
  - Observable performance (DE): Sagt mit den erschlossenen Gesetzen Ort und Geschwindigkeit zu einem neuen Zeitpunkt voraus und prüft Anfangswerte, Vorzeichen und Plausibilität am beschriebenen Bewegungsverlauf.
  - Observable performance (EN): Uses the inferred laws to predict position and velocity at a new instant and checks initial values, signs, and plausibility against the described motion.

**Coverage expectations**

- required expectations: `infer-laws-from-graphs`, `explain-law-connection`, `predict-and-check`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `motion-model`: Gleichförmige Bewegung gegenüber Bewegung mit konstanter, von null verschiedener Beschleunigung. / Uniform motion versus motion with constant nonzero acceleration.
- `graph-and-sign`: Zeit-Ort-Graph gegenüber Zeit-Geschwindigkeits-Graph; negativer Bewegungsbeginn mit oder ohne späteren Richtungswechsel. / Time-position versus time-velocity source graph; initially negative velocity with or without a later reversal.

**Application cases**

- `uniform-negative-velocity`
  - Task demand (DE): Ein t-s-Graph ist im Modellintervall 0 bis 6 s die Gerade durch (0 s; 5 m), (2 s; 3 m) und (4 s; 1 m). Erschließe beide Zeitgesetze, erläutere ihren Zusammenhang und sage s und v bei 6 s voraus.
  - Task demand (EN): Within the model interval 0 to 6 s, a t-s graph is the straight line through (0 s, 5 m), (2 s, 3 m), and (4 s, 1 m). Infer both time laws, explain their connection, and predict s and v at 6 s.
  - Expected performance (DE): Leitet v0 = −1 m/s und s(t) = 5 m − (1 m/s)t, v(t) = −1 m/s her. Begründet die negative Steigung und Δs = −6 m als t-v-Rechteckfläche; erhält s(6 s) = −1 m und v(6 s) = −1 m/s.
  - Expected performance (EN): Derives v0 = −1 m/s and s(t) = 5 m − (1 m/s)t, v(t) = −1 m/s. Explains the negative slope and Δs = −6 m as a t-v rectangle area; obtains s(6 s) = −1 m and v(6 s) = −1 m/s.
  - Understanding focus (DE): Ein negativer Endort und eine negative Geschwindigkeit haben unterschiedliche Bedeutungen; der Anfangsort geht nur in das Ortsgesetz ein.
  - Understanding focus (EN): Negative final position and negative velocity have distinct meanings; initial position enters only the position law.
- `accelerated-velocity-source`
  - Task demand (DE): Ein t-v-Graph ist für 0 bis 5 s eine Gerade durch (0 s; −2 m/s), (2 s; 0) und (4 s; +2 m/s); s(0) = 3 m. Bestimme beide Gesetze, prüfe sie bei 2 s und sage s und v bei 5 s voraus.
  - Task demand (EN): For 0 to 5 s, a t-v graph is a straight line through (0 s, −2 m/s), (2 s, 0), and (4 s, +2 m/s); s(0) = 3 m. Determine both laws, check them at 2 s, and predict s and v at 5 s.
  - Expected performance (DE): Erschließt a = +1 m/s², v(t) = −2 m/s + (1 m/s²)t und s(t) = 3 m − (2 m/s)t + (0,5 m/s²)t². Prüft bei 2 s: v = 0 und s = 1 m über die negative Dreiecksfläche; erhält bei 5 s s = 5,5 m und v = +3 m/s.
  - Expected performance (EN): Infers a = +1 m/s², v(t) = −2 m/s + (1 m/s²)t and s(t) = 3 m − (2 m/s)t + (0.5 m/s²)t². Checks at 2 s: v = 0 and s = 1 m using the negative triangle area; obtains s = 5.5 m and v = +3 m/s at 5 s.
  - Understanding focus (DE): Anfangsgeschwindigkeit und konstante Beschleunigung bestimmen gemeinsam das Ortsgesetz; vorzeichenbehaftete Flächen erhalten den Zusammenhang auch bei Richtungswechsel.
  - Understanding focus (EN): Initial velocity and constant acceleration jointly determine the position law; signed areas preserve the connection through a reversal.
## Page 4: Freier Fall experimentell untersuchen

- Full learning-goal ID: `09029573-864f-40ca-bf8a-cee7bf6dcb73`
- Goal fingerprint: `sha256:130790489acb03f5ba26be963eb06339ad5f38783763c65e16a1646eb7acd6ab`
- Page fingerprint: `sha256:3fa28cde531514716fbe26ec8881a7c901c15f2704679074d6a566ae2de1cdb6`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.1 Bewegungen und ihre Beschreibung

### Canonical description

Die lernende Person kann den freien Fall nahe der Erdoberfläche experimentell untersuchen, Messdaten grafisch auswerten, daraus im Modell ohne Luftwiderstand die Gravitationsbeschleunigung bestimmen und unter Angabe der Anfangsbedingungen ein Zeit-Ort-Gesetz formulieren.

### Visualization

/assets/goal-visualizations/physik/09029573-864f-40ca-bf8a-cee7bf6dcb73/09029573-864f-40ca-bf8a-cee7bf6dcb73.jpg

- original digest: `sha256:814704c3c964ed3d7a1a78a9b8b7af66eda5741107a71e7d4f27f8385b15bace`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Bewegungen mit Zeit-Ort- und Zeit-Geschwindigkeits-Gesetzen beschreiben — `262f807a-30d0-503e-986f-856cbd048e8e` (page 3)

### Direct reverse prerequisites

- Waagerechter Wurf analysieren — `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2` (page 7)
- Fall leichter und schwerer Körper vergleichen — `d9a6ea85-f7e8-5cbd-afe9-62596e22040d` (page 5)

### Prerequisites outside this book

- Messunsicherheiten angeben — `f6b1d812-ce8b-5852-b417-e6c29b533c7a` (outside this book)

### Direct reverse prerequisites outside this book

- Bewegungsanalyse und freier Fall — `a9562b05-c54d-5635-9244-3f7dd24a8642` (outside this book)
- Prüfungsaufgabe: Freien Fall in zwei eigenen Messreihen untersuchen — `f41e4e30-794e-5ce4-ba5e-cc72712cd691` (outside this book)
- Fallbewegung mit Luftwiderstand und Grenzgeschwindigkeit — `12260012-cf04-5409-b57d-f5b3a46d9126` (outside this book)
- Massenanziehung qualitativ beschreiben — `92d8f398-0c9f-523c-88d7-44165b6b4768` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9e53405a00b76e4a09a1f27eda9afe97a13c7e531381d5573b16e0c24bc28f1b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `collect-free-fall-data`
  - Essential understanding (DE): Beim freien Fall nahe der Erdoberfläche gilt näherungsweise konstante Beschleunigung, wenn Luftwiderstand vernachlässigbar ist. Gemessene Orte und Zeiten sind von daraus erschlossenem g zu unterscheiden.
  - Essential understanding (EN): Free fall near Earth's surface has approximately constant acceleration when air resistance is negligible. Measured positions and times must be distinguished from the inferred g.
  - Observable performance (DE): Formuliert eine prüfbare Frage zur Zeit-Ort-Beziehung und erhebt selbst mehrere Messpunkte mit Wiederholungen. Begründet Messprinzip, kontrollierte Freigabe und Kalibrierung; dokumentiert Rohdaten, eigene Beiträge sowie Zeit- und Ortsunsicherheiten. Nutzt geringe Fallhöhe, freien Fallbereich und Auffangbehälter.
  - Observable performance (EN): Formulates a testable question about the time-position relationship and personally collects several measurements with repeats. Justifies the measurement principle, controlled release and calibration; documents raw data, personal contributions and time and position uncertainties. Uses a low drop height, clear falling area and catch container.
- `graphical-g-inference`
  - Essential understanding (DE): Bei Start aus Ruhe gilt für die Fallstrecke h = g·t²/2; allgemeiner entspricht der quadratische Koeffizient im Zeit-Ort-Graphen der halben vorzeichenbehafteten Beschleunigung.
  - Essential understanding (EN): For release from rest, falling distance obeys h = g·t²/2; more generally the quadratic coefficient in the position-time graph equals half the signed acceleration.
  - Observable performance (DE): Wählt eine zu den eigenen Anfangsbedingungen passende grafische Auswertung, bestimmt g aus einer begründeten Steigung oder quadratischen Anpassung mit Einheit und gibt eine durch Auflösung und Streuung gestützte Unsicherheit an. Prüft Modellabweichungen, ohne Messwerte auf einen Sollwert zu zwingen.
  - Observable performance (EN): Selects graphical analysis suited to the personal initial conditions, determines g from a justified slope or quadratic fit with units and states uncertainty supported by resolution and scatter. Checks model departures without forcing measurements to a target value.
- `initial-conditions-law`
  - Essential understanding (DE): Für konstante Beschleunigung gilt s(t) = s0 + v0·t + a·t²/2. Der Betrag g ist positiv; das Vorzeichen von a hängt von der Achsenrichtung ab. v0 = 0 gilt nur bei geeigneter Freigabe und Zeitwahl.
  - Essential understanding (EN): For constant acceleration, s(t) = s0 + v0·t + a·t²/2. The magnitude g is positive; the sign of a depends on axis direction. v0 = 0 applies only with suitable release and choice of time origin.
  - Observable performance (DE): Formuliert für jede eigene Messreihe das vollständige Gesetz mit gemessenem oder begründetem s0, v0 und erschlossenem a. Benennt Nullzeit und Achsenrichtung und vergleicht eine vorhergesagte Position mit der Messung unter Berücksichtigung der Unsicherheit.
  - Observable performance (EN): Formulates the complete law for each personal series using measured or justified s0 and v0 and inferred a. States the time origin and axis direction and compares a predicted position with measurement while accounting for uncertainty.

**Coverage expectations**

- required expectations: `collect-free-fall-data`, `graphical-g-inference`, `initial-conditions-law`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `measurement-principle`: Fallzeitmessung für mehrere Freigabehöhen gegenüber kalibrierter Bildmessung einer neuen eigenen Fallreihe. / Fall-time measurement for several release heights versus calibrated image measurement of a new personal drop series.
- `initial-time-and-sign`: Nullzeit bei Freigabe mit abwärts positiver Achse gegenüber Nullzeit während des Falls mit aufwärts positiver Achse und v0 ungleich null. / Time origin at release with downward positive versus time origin during the fall with upward positive and nonzero v0.

**Application cases**

- `release-height-series`
  - Task demand (DE): Untersuche selbst den Fall einer kompakten Kugel aus Ruhe aus mehreren niedrigen Höhen, etwa 0,20–0,65 m. Wähle eine hinreichend genaue Fallzeitmessung, wiederhole die Messungen und bestimme g grafisch mit abwärts positiver Fallstrecke.
  - Task demand (EN): Personally investigate a compact ball released from rest at several low heights, for example 0.20–0.65 m. Choose sufficiently accurate fall-time measurement, repeat measurements and determine g graphically using downward-positive falling distance.
  - Expected performance (DE): Liefert eigene Höhen und Zeiten mit Unsicherheiten, einen h-gegen-t²-Graphen und g als doppelte Steigung. Modellreferenz, keine Soll-Rohdaten: Bei g = 9,81 m/s² ergeben 0,20 und 0,50 m etwa 0,202 und 0,319 s. Formuliert h(t) = gMess·t²/2 mit h0 = 0 und v0 = 0 und prüft die Messverträglichkeit.
  - Expected performance (EN): Provides personal heights and times with uncertainties, an h-versus-t² graph and g as twice the slope. Model reference, not target raw data: with g = 9.81 m/s², 0.20 and 0.50 m correspond to about 0.202 and 0.319 s. Formulates h(t) = gMeasured·t²/2 with h0 = 0 and v0 = 0 and checks agreement with measurement.
  - Understanding focus (DE): Die grafische Steigung erschließt g aus eigenen Messungen; Freigabe und Nullzeit rechtfertigen den fehlenden linearen Term.
  - Understanding focus (EN): The graph's slope infers g from personal measurements; release and time origin justify the absent linear term.
- `in-flight-time-origin`
  - Task demand (DE): Nimm selbst eine neue sichere Fallmessreihe mit Wiederholungen, kalibriertem Maßstab und bekannter Bildzeit auf. Wähle aufwärts als positive Richtung und t = 0 erst während des Falls. Bestimme grafisch g und ein Gesetz mit passender Anfangsgeschwindigkeit.
  - Task demand (EN): Personally record a new safe drop series with repeats, a calibrated scale and known frame timing. Choose upward positive and t = 0 during the fall. Determine g graphically and obtain a law with the appropriate initial velocity.
  - Expected performance (DE): Zeigt eigene Messpunkte und eine grafische quadratische Anpassung mit negativem quadratischem Koeffizienten und v0 < 0. Modellreferenz: Freigabe bei y = 0,80 m, Nullzeit bei y0 = 0,60 m und g = 9,8 m/s² ergibt v0 ≈ −1,98 m/s sowie y(0,10 s) ≈ 0,353 m. Berichtet die eigenen Werte und Unsicherheiten und prüft das Gesetz am eigenen Graphen.
  - Expected performance (EN): Shows personal measurements and a graphical quadratic fit with a negative quadratic coefficient and v0 < 0. Model reference: release at y = 0.80 m, time origin at y0 = 0.60 m and g = 9.8 m/s² give v0 ≈ −1.98 m/s and y(0.10 s) ≈ 0.353 m. Reports personal values and uncertainties and checks the law against the personal graph.
  - Understanding focus (DE): Koordinaten und Nullzeit ändern Koeffizienten und Anfangswerte, aber nicht den erschlossenen Betrag der Fallbeschleunigung.
  - Understanding focus (EN): Coordinates and time origin change coefficients and initial values but not the inferred magnitude of gravitational acceleration.
## Page 5: Fall leichter und schwerer Körper vergleichen

- Full learning-goal ID: `d9a6ea85-f7e8-5cbd-afe9-62596e22040d`
- Goal fingerprint: `sha256:38f7104741c6aecbeb92a40dd6d8f5c2c50fa2c6a1d3a2c8e36c5941774af7d9`
- Page fingerprint: `sha256:5f4d118c3627bd5bbce88316a121aa05f0f0298a038421b3344b69174a30cc41`
- Topic path: Physik

### Canonical description

Die lernende Person kann den Fall leichter und schwerer Körper in Luft und im Vakuum vergleichen und mit dem Luftwiderstand erklären, warum eine Feder in Luft langsamer fällt als eine Kugel, im Vakuum aber gleich schnell.

### Visualization

/assets/goal-visualizations/physik/d9a6ea85-f7e8-5cbd-afe9-62596e22040d/d9a6ea85-f7e8-5cbd-afe9-62596e22040d.jpg

- original digest: `sha256:9d711525f938cda221ce2c4c63d0d73c516bc781fe27d61cac9857fd8374d355`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Freier Fall experimentell untersuchen — `09029573-864f-40ca-bf8a-cee7bf6dcb73` (page 4)

### Direct reverse prerequisites

- Idealisierungen und Grenzen von Bewegungsmodellen — `d6dc0e02-831d-4894-a61a-852bcc74f147` (page 6)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d66a377c1074034959991476bcd2304b2a388e4d5d7fa6b1f510baa721aab2bc`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `matched-fall-conditions`
  - Essential understanding (DE): Nahe der Erdoberfläche fallen leichte und schwere Körper im Vakuum bei gleicher Anfangshöhe, Anfangsgeschwindigkeit und Startzeit gleich: Zu gleichen Zeiten stimmen Fallstrecke und Geschwindigkeit überein.
  - Essential understanding (EN): Near Earth's surface, light and heavy bodies fall alike in a vacuum when initial height, initial velocity and release time match: their fall distances and velocities agree at equal times.
  - Observable performance (DE): Vergleicht unabhängig neue Fallbeobachtungen, benennt die nötigen Anfangsbedingungen und begründet eine Vorhersage für den Wechsel von Luft zu Vakuum. Unterscheidet beobachtete Ankunftszeiten von der Erklärung durch das Fallmodell.
  - Observable performance (EN): Independently compares fresh falling observations, identifies the necessary initial conditions and justifies a prediction for changing from air to a vacuum. Distinguishes observed arrival times from explanation using the falling model.
- `air-resistance-comparison`
  - Essential understanding (DE): Luftwiderstand wirkt der Bewegung relativ zur Luft entgegen. Seine Bedeutung für den Fall hängt auch von Form und Fläche ab; größere Masse allein legt die Ankunftsreihenfolge in Luft nicht fest.
  - Essential understanding (EN): Air resistance opposes motion relative to the air. Its importance during falling also depends on shape and area; greater mass alone does not determine arrival order in air.
  - Observable performance (DE): Erklärt die beobachtete Verzögerung einer Feder gegenüber einer Kugel und beurteilt einen veränderten Form-Masse-Vergleich. Begründet, welche Unterschiede beim Entfernen der Luft verschwinden, ohne einen Widerstandsverlauf zu erfinden.
  - Observable performance (EN): Explains the observed delay of a feather relative to a ball and evaluates a changed comparison of shape and mass. Justifies which differences disappear when air is removed without inventing a drag history.

**Coverage expectations**

- required expectations: `matched-fall-conditions`, `air-resistance-comparison`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `medium`: Luft gegenüber Vakuum bei kontrollierten Anfangsbedingungen. / Air versus a vacuum with controlled initial conditions.
- `shape-and-mass`: Vergleich verschiedener Massen bei zugleich veränderter Form und wirksamer Fläche. / Comparison of different masses with changed shape and effective area.

**Application cases**

- `feather-and-ball`
  - Task demand (DE): Ein neues, als Fremdaufnahme gekennzeichnetes Protokoll zeigt Feder und Kugel, gleichzeitig aus gleicher Höhe aus Ruhe freigegeben: In Luft trifft die Kugel zuerst ein. Entwickle eine begründete Vorhersage für dieselben Startbedingungen im evakuierten Vorführgerät und vergleiche sie anschließend mit dessen Aufnahme.
  - Task demand (EN): A fresh record, identified as someone else's recording, shows a feather and a ball released simultaneously from rest at the same height: in air, the ball arrives first. Develop a justified prediction for the same initial conditions in an evacuated demonstration apparatus, then compare it with its recording.
  - Expected performance (DE): Erwartet im Vakuum innerhalb der Zeitauflösung gleichzeitiges Eintreffen und gleiche Fallstrecken zu gleichen Zeiten. Erklärt die Luftbeobachtung mit unterschiedlich bedeutsamem Luftwiderstand und prüft Freigabe und Zeitauflösung vor der Deutung kleiner Zeitdifferenzen.
  - Expected performance (EN): Expects simultaneous arrival within time resolution and equal fall distances at equal times in a vacuum. Explains the air observation through the differing importance of air resistance and checks release conditions and time resolution before interpreting small timing differences.
  - Understanding focus (DE): Massenunabhängige Fallbewegung gilt bei übereinstimmenden Anfangsbedingungen ohne Luftwiderstand.
  - Understanding focus (EN): Mass-independent falling applies to matching initial conditions without air resistance.
- `lighter-body-first`
  - Task demand (DE): Neue Fremdmessungen in Luft ergeben beim Fall aus 1,20 m aus Ruhe: kompakte Folienkugel, 0,5 g, 0,55 ± 0,02 s; breites Papierstück, 5 g, 0,90 ± 0,02 s. Erkläre die Reihenfolge und sage den Vergleich im Vakuum bei denselben Anfangsbedingungen voraus; g = 9,81 m/s² darf genutzt werden.
  - Task demand (EN): Fresh measurements collected by others in air give, for release from rest at 1.20 m: compact foil ball, 0.5 g, 0.55 ± 0.02 s; broad piece of paper, 5 g, 0.90 ± 0.02 s. Explain the order and predict the comparison in a vacuum with the same initial conditions; g = 9.81 m/s² may be used.
  - Expected performance (DE): Begründet, warum das schwerere Papier in Luft später eintreffen kann, und verwirft eine reine Massenregel. Erwartet im Vakuum für beide etwa 0,495 s und gleiche Bewegung; die unterschiedlichen Luftzeiten belegen keine verschiedenen Vakuum-Fallbeschleunigungen.
  - Expected performance (EN): Explains why the heavier paper can arrive later in air and rejects a rule based only on mass. Expects about 0.495 s and identical motion for both in a vacuum; the differing air times do not demonstrate different vacuum gravitational accelerations.
  - Understanding focus (DE): Der Wechsel von Form und Medium prüft, ob Luftwiderstand statt Masse allein den beobachteten Unterschied erklärt.
  - Understanding focus (EN): Changing shape and medium tests whether air resistance, rather than mass alone, explains the observed difference.
## Page 6: Idealisierungen und Grenzen von Bewegungsmodellen

- Full learning-goal ID: `d6dc0e02-831d-4894-a61a-852bcc74f147`
- Goal fingerprint: `sha256:934c9ba98fb3526e472a0a477166c06e2c43b1e2ea9e704660c0d9279262650e`
- Page fingerprint: `sha256:bdc47543b84a79f93bc6e164f55b0efcf41a47f24e7140d0e1d05b5dcba02e5e`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.1 Bewegungen und ihre Beschreibung

### Canonical description

Die lernende Person kann die Idealisierungen eines Bewegungsmodells wie Massepunkt und Reibungsfreiheit begründen und angeben, wo die Modellvorhersagen an Grenzen stoßen.

### Visualization

/assets/goal-visualizations/physik/d6dc0e02-831d-4894-a61a-852bcc74f147/d6dc0e02-831d-4894-a61a-852bcc74f147.jpg

- original digest: `sha256:22f9efc606eee4c29ecb214c9ccc2fbbe24b7462bce64a4d02a89bbc61c86c4e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Fall leichter und schwerer Körper vergleichen — `d9a6ea85-f7e8-5cbd-afe9-62596e22040d` (page 5)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Mehrphasenbewegung und Modellprüfung — `2b9e565f-d9b4-5e23-b5b7-b7977cecff06` (outside this book)
- Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit — `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` (outside this book)
- Senkrechten Wurf mit konstanter Beschleunigung modellieren — `c5807a37-129e-5df6-8989-482bc7f5683e` (outside this book)
- Senkrechten Wurf mit konstanter Beschleunigung modellieren — `c933b7d2-edcb-5747-9378-9762659f260a` (outside this book)
- Prüfungsaufgabe: Wurf- und Bremsbewegungen modellieren — `dfd2628f-b44e-51b3-86e8-99158861be8c` (outside this book)
- Bewegungsabläufe im Sport qualitativ analysieren — `7ead007f-e85a-5cb5-b52d-76aae626119a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:dfc5fa948ff81bb968ddf630b1fc321b0e4dad97539271523da10ebd47ca5f45`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `purpose-and-boundary`
  - Essential understanding (DE): Ein Bewegungsmodell beschreibt einen festgelegten Körper und eine bestimmte Vorhersagegröße. Der Massepunkt behält die Bewegung eines Bezugspunkts, lässt aber Ausdehnung und Orientierung weg; Reibungsfreiheit vernachlässigt bremsende Wechselwirkungen mit der Umgebung.
  - Essential understanding (EN): A motion model describes a specified body and a particular predicted quantity. A point particle retains the motion of a reference point but omits size and orientation; a frictionless model neglects retarding interactions with the surroundings.
  - Observable performance (DE): Benennt Körper, Umgebung, verfolgten Bezugspunkt und Vorhersagefrage. Begründet unabhängig, welche geometrischen Eigenschaften und Wechselwirkungen für diese Frage berücksichtigt oder vernachlässigt werden dürfen.
  - Observable performance (EN): Identifies the body, surroundings, tracked reference point and prediction question. Independently justifies which geometric properties and interactions may be retained or neglected for that question.
- `prediction-against-observation`
  - Essential understanding (DE): Die Brauchbarkeit eines Modells zeigt sich am Vergleich seiner Vorhersage mit Beobachtungen und deren Unsicherheit für die gewählte Frage.
  - Essential understanding (EN): A model's usefulness is shown by comparing its prediction with observations and their uncertainty for the chosen question.
  - Observable performance (DE): Entwickelt eine konkrete Vorhersage, vergleicht sie mit neuen Beobachtungen und entscheidet anhand von Abweichung, Messauflösung und verlangter Genauigkeit über die Verwendbarkeit.
  - Observable performance (EN): Develops a concrete prediction, compares it with fresh observations and decides its usability from discrepancy, measurement resolution and required accuracy.
- `changed-condition-limit`
  - Essential understanding (DE): Eine veränderte Oberfläche oder eine Frage nach Rand, Kontakt oder Orientierung kann eine zuvor brauchbare Idealisierung unzureichend machen.
  - Essential understanding (EN): A changed surface or a question about an edge, contact or orientation can make a previously useful idealization inadequate.
  - Observable performance (DE): Begründet in einem unabhängig bearbeiteten veränderten Fall, welche vernachlässigte Eigenschaft nun benötigt wird und für welche Aussage das bisherige Modell weiterhin ausreicht.
  - Observable performance (EN): In an independently completed changed case, justifies which neglected property is now needed and which statement the existing model can still support.

**Coverage expectations**

- required expectations: `purpose-and-boundary`, `prediction-against-observation`, `changed-condition-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `prediction-and-size`: Ankunft des Körpermittelpunkts gegenüber Ankunft der Vorderkante bei endlicher Körperlänge. / Arrival of the body's center versus arrival of its front edge for a body of finite length.
- `surface-interaction`: Glatte gegenüber rauer Bahn bei gleicher anfänglicher Bewegung und gleicher Messauflösung. / Smooth versus rough track with the same initial motion and measurement resolution.

**Application cases**

- `center-or-front`
  - Task demand (DE): Ein 0,20 m langer Wagen fährt ohne Drehung gleichförmig mit 0,50 m/s; bei t = 0 liegt sein Mittelpunkt bei x = 0. Ein Massepunktmodell verfolgt diesen Mittelpunkt. Prüfe Vorhersagen für Mittelpunkt und Vorderkante an x = 1,00 m bei geforderter Zeitgenauigkeit 0,03 s. Neue Beobachtungen: Mittelpunkt 2,00 ± 0,02 s, Vorderkante 1,80 ± 0,02 s.
  - Task demand (EN): A cart of length 0.20 m moves uniformly without rotation at 0.50 m/s; its center is at x = 0 at t = 0. A point-particle model tracks this center. Assess predictions for the center and front edge at x = 1.00 m with required timing accuracy 0.03 s. Fresh observations: center 2.00 ± 0.02 s, front edge 1.80 ± 0.02 s.
  - Expected performance (DE): Sagt für den Mittelpunkt 2,00 s voraus und bestätigt diese Anwendung. Berücksichtigt für die Vorderkante deren Abstand 0,10 m zum Mittelpunkt und erhält 1,80 s. Begründet, warum die Mittelpunktankunft ohne geometrische Ergänzung die Vorderkantenankunft nicht mit 0,03 s Genauigkeit vorhersagt.
  - Expected performance (EN): Predicts 2.00 s for the center and supports this use. Retains the front edge's 0.10 m separation from the center and obtains 1.80 s. Explains why center arrival without a geometric addition does not predict front-edge arrival to 0.03 s accuracy.
  - Understanding focus (DE): Die nötige geometrische Information hängt von der Vorhersagefrage ab; ein Massepunkt behauptet keine wirkliche Körpergröße.
  - Understanding focus (EN): The geometric information needed depends on the prediction question; a point particle makes no claim about actual body size.
- `smooth-and-rough`
  - Task demand (DE): Für einen Wagen auf waagerechter Bahn gilt anfangs x = 0 und v = 0,50 m/s. Erstelle die reibungsfreie Vorhersage für t = 2,0 s und prüfe sie an neuen Ortsdaten für t = 0; 1; 2 s: glatte Bahn 0; 0,50; 0,99 m, raue Bahn 0; 0,45; 0,80 m. Jede Ortsablesung hat ±0,02 m Unsicherheit.
  - Task demand (EN): A cart on a horizontal track initially has x = 0 and v = 0.50 m/s. Make the frictionless prediction for t = 2.0 s and assess it against fresh position data at t = 0, 1, 2 s: smooth track 0, 0.50, 0.99 m; rough track 0, 0.45, 0.80 m. Each position reading has ±0.02 m uncertainty.
  - Expected performance (DE): Sagt 1,00 m voraus. Die glatte Bahn ist innerhalb der Unsicherheit vereinbar; die Abweichung 0,20 m auf der rauen Bahn bleibt auch unter Berücksichtigung beider Ortsablesungen zu groß. Benennt Wagen und Umgebung und begründet die nötige Berücksichtigung bremsender Bahnwechselwirkungen, ohne aus drei Ortswerten ein bestimmtes Reibungsgesetz abzuleiten.
  - Expected performance (EN): Predicts 1.00 m. The smooth-track result is compatible within uncertainty; the 0.20 m discrepancy on the rough track remains too large even when both position readings are considered. Identifies cart and surroundings and justifies retaining retarding track interactions without inferring a particular friction law from three positions.
  - Understanding focus (DE): Reibungsfreiheit wird anhand einer konkreten Bewegungsvorhersage und einer veränderten Wechselwirkung beurteilt.
  - Understanding focus (EN): Neglecting friction is judged through a concrete motion prediction and a changed interaction.
## Page 7: Waagerechter Wurf analysieren

- Full learning-goal ID: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2`
- Goal fingerprint: `sha256:d589a725624dabbd81123d28bee9c6dd653735297c2a93a044d9165583e7616c`
- Page fingerprint: `sha256:d0a7807f5543d69538b9876f7cc900728c6f993bfd479cd46499689dbc0a9376`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Waagerechter Wurf und Kreisbewegung > Waagerechter Wurf und Superposition

### Canonical description

Die lernende Person kann den waagerechten Wurf experimentell untersuchen, bei vernachlässigbarem Luftwiderstand und konstanter Fallbeschleunigung als Überlagerung gleichförmiger horizontaler und gleichmäßig beschleunigter vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

### Visualization

/assets/goal-visualizations/physik/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.png

- original digest: `sha256:63ff949fccec93b2fd3da1463ad62acd9d9ee6adbd4f775bc25bc1197b140342`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Freier Fall experimentell untersuchen — `09029573-864f-40ca-bf8a-cee7bf6dcb73` (page 4)

### Direct reverse prerequisites

- Geschwindigkeit beim waagerechten Wurf als Vektor bestimmen — `0fee53f2-1c02-5b12-9b6c-aa9fa462d921` (page 8)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Mehrphasenbewegung und Modellprüfung — `2b9e565f-d9b4-5e23-b5b7-b7977cecff06` (outside this book)
- Wo trifft die waagerecht gestartete Kugel auf? — `39f52dcb-ff1d-5cad-9ccb-30da803cfa85` (outside this book)
- Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit — `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` (outside this book)
- Prüfungsaufgabe: Wurf- und Bremsbewegungen modellieren — `dfd2628f-b44e-51b3-86e8-99158861be8c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e3eba275f65522cab0041d8ce7fc36ccc149ca919cf6262c2d43ced67f794538`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `record-horizontal-launch`
  - Essential understanding (DE): Ein waagerechter Start bedeutet vy0 = 0; beide Ortskomponenten müssen zu denselben Zeitpunkten erfasst werden. Eine geneigte Freigabe oder perspektivisch verzerrte Aufnahme kann die Deutung verfälschen.
  - Essential understanding (EN): A horizontal launch means vy0 = 0; both position components must be recorded at the same times. An inclined release or perspective-distorted recording can bias interpretation.
  - Observable performance (DE): Plant und führt selbst einen niedrigen waagerechten Wurf zur Untersuchung der Teilbewegungen aus. Kontrolliert Startausrichtung und Höhe, kalibriert Orts- und Zeitmessung und erhebt eigene zeitgleiche x-y-Daten. Dokumentiert Rohdaten, eigene Beiträge und Unsicherheiten; sichert Flugbereich und Auffangen.
  - Observable performance (EN): Plans and personally performs a low horizontal launch to investigate component motions. Controls launch alignment and height, calibrates position and time measurement and collects personal simultaneous x-y data. Documents raw data, personal contributions and uncertainties; secures the flight area and catch.
- `test-component-superposition`
  - Essential understanding (DE): Bei vernachlässigbarem Luftwiderstand und konstantem g bleibt die horizontale Geschwindigkeit konstant; die vertikale Bewegung ist bei vy0 = 0 gleichmäßig beschleunigt. Die Komponenten teilen die Zeit und beeinflussen einander in diesem Modell nicht.
  - Essential understanding (EN): With negligible air resistance and constant g, horizontal velocity remains constant; vertical motion with vy0 = 0 is uniformly accelerated. The components share time and do not influence one another in this model.
  - Observable performance (DE): Prüft eigene Daten auf gleiche horizontale und wachsende vertikale Ortsänderungen in gleichen Zeitspannen. Vergleicht eine begründete Modellvorhersage mit Messpunkten und benennt unter Berücksichtigung der Unsicherheit mögliche Start-, Perspektiv- oder Luftwiderstandseinflüsse.
  - Observable performance (EN): Checks personal data for equal horizontal and growing vertical position changes over equal time spans. Compares a justified model prediction with measurements and identifies possible launch, perspective or air-resistance effects while accounting for uncertainty.
- `construct-trajectory`
  - Essential understanding (DE): Das x-y-Diagramm verknüpft zeitgleiche Ortskomponenten und zeigt unter diesen Bedingungen eine Parabel. Es stellt eine räumliche Flugbahn dar.
  - Essential understanding (EN): The x-y graph combines simultaneous position components and shows a parabola under these conditions. It represents a spatial trajectory.
  - Observable performance (DE): Konstruiert aus eigenen Messpunkten ein skaliertes x-y-Diagramm mit Ursprung, Achsenrichtungen und Einheiten. Erklärt die Krümmung durch gleichförmige horizontale und beschleunigte vertikale Bewegung; unterscheidet Messpunkte, Modellkurve und Zeit-Ort-Diagramm.
  - Observable performance (EN): Constructs a scaled x-y graph from personal measurements with origin, axis directions and units. Explains curvature through uniform horizontal and accelerated vertical motion; distinguishes measured points, model curve and position-time graph.

**Coverage expectations**

- required expectations: `record-horizontal-launch`, `test-component-superposition`, `construct-trajectory`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `launch-direction-and-speed`: Start nach rechts gegenüber einem neuen Start nach links mit anderer Geschwindigkeit bei gleicher Höhe. / Launch to the right versus a new launch to the left at a different speed from the same height.
- `vertical-coordinate`: Abwärts positive Achse ab Startpunkt gegenüber aufwärts positiver Achse ab Auffanghöhe. / Downward-positive axis from the launch point versus upward-positive axis from the catch height.

**Application cases**

- `rightward-own-launch`
  - Task demand (DE): Untersuche selbst einen langsamen waagerechten Kugelstart nach rechts aus etwa 0,45 m Höhe über einem Auffangbehälter. Gewinne eigene zeitgleiche x-y-Messungen, wähle den Startpunkt als Ursprung und y abwärts positiv und prüfe die Überlagerung anhand der Daten.
  - Task demand (EN): Personally investigate a slow horizontal ball launch to the right from about 0.45 m above a catch container. Obtain personal simultaneous x-y measurements, choose the launch point as origin and y downward positive and test superposition using the data.
  - Expected performance (DE): Legt eigene Rohdaten, Auflösungen und eine x-y-Flugbahn vor; vergleicht horizontale und vertikale Änderungen in gleichen Zeitspannen. Modellreferenz bei vx = 1,0 m/s und g = 9,8 m/s²: (x,y) = (0,100; 0,049) m bei 0,10 s und (0,200; 0,196) m bei 0,20 s. Bewertet eigene Abweichungen anhand der Unsicherheit.
  - Expected performance (EN): Provides personal raw data, resolutions and an x-y trajectory; compares horizontal and vertical changes over equal time spans. Model reference with vx = 1.0 m/s and g = 9.8 m/s²: (x,y) = (0.100, 0.049) m at 0.10 s and (0.200, 0.196) m at 0.20 s. Evaluates personal deviations using uncertainty.
  - Understanding focus (DE): Gleiche horizontale Schritte bei zunehmendem vertikalem Fall erzeugen gemeinsam die gekrümmte räumliche Bahn.
  - Understanding focus (EN): Equal horizontal steps together with increasing vertical fall generate the curved spatial trajectory.
- `leftward-own-launch`
  - Task demand (DE): Führe selbst eine neue Messreihe mit waagerechtem Start nach links und anderer Startgeschwindigkeit aus gleicher Höhe durch. Wähle x nach rechts, x = 0 am Start und y ab Auffanghöhe nach oben positiv. Konstruiere die Flugbahn und prüfe den Einfluss der horizontalen Änderung auf den vertikalen Verlauf.
  - Task demand (EN): Personally perform a new measurement series with horizontal launch to the left at a different speed from the same height. Choose x positive rightward, x = 0 at launch and y positive upward from the catch height. Construct the trajectory and test the effect of the horizontal change on vertical evolution.
  - Expected performance (DE): Erhebt neue eigene Daten und zeigt abnehmendes x sowie fallendes y mit wachsenden vertikalen Ortsänderungsbeträgen. Modellreferenz bei y0 = 0,45 m, vx = −1,5 m/s und g = 9,8 m/s²: (x,y) = (−0,150; 0,401) m bei 0,10 s und (−0,300; 0,254) m bei 0,20 s. Vergleicht die Fallstrecken beider Reihen zu gleichen Zeiten mit Unsicherheiten.
  - Expected performance (EN): Collects new personal data and shows decreasing x and falling y with growing magnitudes of vertical position changes. Model reference with y0 = 0.45 m, vx = −1.5 m/s and g = 9.8 m/s²: (x,y) = (−0.150, 0.401) m at 0.10 s and (−0.300, 0.254) m at 0.20 s. Compares falling distances in both series at equal times with uncertainties.
  - Understanding focus (DE): Horizontale Startrichtung und Geschwindigkeit ändern die räumliche Bahn, im Modell aber nicht die vertikale Bewegung bei gleichen vertikalen Anfangsbedingungen.
  - Understanding focus (EN): Horizontal launch direction and speed change the spatial trajectory but, in the model, do not change vertical motion with matching vertical initial conditions.
## Page 8: Geschwindigkeit beim waagerechten Wurf als Vektor bestimmen

- Full learning-goal ID: `0fee53f2-1c02-5b12-9b6c-aa9fa462d921`
- Goal fingerprint: `sha256:66699dfd044926734a00687ffe0994949e43b0142d6bcf447e08c94452ebd872`
- Page fingerprint: `sha256:24272780577bde4c7b36c037b6dba0f54af8ffe4545226b73849b942d358e8c6`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Waagerechter Wurf und Kreisbewegung > Waagerechter Wurf und Superposition

### Canonical description

Die lernende Person kann die Geschwindigkeit beim waagerechten Wurf aus waagerechter und senkrechter Komponente zusammensetzen und Betrag und Richtung bestimmen, etwa den Auftreffwinkel.

### Visualization

/assets/goal-visualizations/physik/0fee53f2-1c02-5b12-9b6c-aa9fa462d921/0fee53f2-1c02-5b12-9b6c-aa9fa462d921.png

- original digest: `sha256:a3774aafdfe4e727d8fe84a750eedb33598e1dd02c0dfe3f8042934107d1b1a8`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Waagerechter Wurf analysieren — `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2` (page 7)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Bezugssysteme und Geschwindigkeitsüberlagerung — `68c90ba6-c438-463c-9a53-cf61062d416a` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Geschwindigkeit beim waagerechten Wurf als Pfeil bestimmen — `4ea1b93f-2dba-59ac-87ab-29af6c55cc37` (outside this book)
- Schiefen Wurf beschreiben — `fbecbd60-5db3-51e8-94be-d66b066ffa06` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:66fee8d311784e12027d6bff1c8d9bf79ba9a896304992151f2104ada5c960e3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `simultaneous-components`
  - Essential understanding (DE): Beim waagerechten Wurf ohne Luftwiderstand und mit konstantem g bleibt die horizontale Geschwindigkeitskomponente konstant, während die anfangs verschwindende vertikale Komponente nach unten wächst. Beide gehören zum selben Zeitpunkt und ergeben gemeinsam die Geschwindigkeit.
  - Essential understanding (EN): In horizontal projection without air resistance and with constant g, the horizontal velocity component remains constant while the initially zero vertical component grows downward. Both refer to the same instant and together give the velocity.
  - Observable performance (DE): Legt Achsen und Vorzeichen fest, gewinnt gleichzeitige Komponenten aus Bewegungsangaben oder Komponentendarstellungen und konstruiert daraus eigenständig einen konsistenten Geschwindigkeitspfeil.
  - Observable performance (EN): Defines axes and signs, obtains simultaneous components from motion information or component representations and independently constructs a consistent velocity arrow.
- `magnitude-and-direction`
  - Essential understanding (DE): Der Betrag folgt aus den rechtwinkligen Komponenten, die Richtung aus ihrem Verhältnis und ihren Vorzeichen. Der Geschwindigkeitspfeil zeigt die momentane Bewegungsrichtung und stellt weder Ort noch Beschleunigung dar.
  - Essential understanding (EN): Magnitude follows from the perpendicular components, and direction from their ratio and signs. The velocity arrow shows the instantaneous direction of motion and represents neither position nor acceleration.
  - Observable performance (DE): Bestimmt Betrag und Winkel zu einer benannten Bezugsrichtung, begründet den Quadranten und prüft Einheiten und Plausibilität gegenüber den Komponenten. Übersetzt bei geänderter Wurfrichtung die Vorzeichen eigenständig in die passende Pfeilrichtung.
  - Observable performance (EN): Determines magnitude and angle relative to a named direction, justifies the quadrant and checks units and plausibility against the components. Independently translates signs into the appropriate arrow direction when launch direction changes.

**Coverage expectations**

- required expectations: `simultaneous-components`, `magnitude-and-direction`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `horizontal-direction`: Waagerechter Start nach rechts gegenüber nach links bei unveränderter Schwerkraftrichtung. / Horizontal launch to the right versus to the left with unchanged gravitational direction.
- `component-source`: Komponenten aus Startgeschwindigkeit und Zeit gegenüber Komponenten aus beschriebenen Zeit-Geschwindigkeits-Graphen. / Components obtained from launch speed and time versus components obtained from descriptions of time-velocity graphs.

**Application cases**

- `rightward-flight`
  - Task demand (DE): Ein Körper wird mit 3,00 m/s waagerecht nach rechts gestartet. Ohne Luftwiderstand gilt g = 9,81 m/s². Bestimme und erläutere seinen Geschwindigkeitspfeil nach 0,400 s; wähle x nach rechts und y nach oben. Konstruiere die Zusammensetzung ohne vorgegebenes Pfeilbild.
  - Task demand (EN): A body is launched horizontally to the right at 3.00 m/s. With no air resistance, g = 9.81 m/s². Determine and explain its velocity arrow after 0.400 s, choosing x rightward and y upward. Construct the composition without a supplied arrow diagram.
  - Expected performance (DE): Erhält v = (3,00; −3,924) m/s, etwa 4,94 m/s und 52,6° unter der Horizontalen nach rechts. Begründet die rechtwinklige Zusammensetzung, den größeren Betrag gegenüber jeder Einzelkomponente und die waagerechte Geschwindigkeit beim Start.
  - Expected performance (EN): Obtains v = (3.00, −3.924) m/s, about 4.94 m/s and 52.6° below the rightward horizontal. Justifies perpendicular composition, a magnitude exceeding either individual component, and horizontal velocity at launch.
  - Understanding focus (DE): Die gleichförmige horizontale und beschleunigte vertikale Komponente bilden eine momentane Geschwindigkeit.
  - Understanding focus (EN): The uniform horizontal and accelerated vertical components form one instantaneous velocity.
- `leftward-impact`
  - Task demand (DE): Neue Komponentenaufzeichnungen eines waagerechten Wurfs verwenden x nach rechts und y nach oben: Der vx-Graph ist konstant bei −2,00 m/s; der vy-Graph fällt geradlinig von 0 auf −1,50 m/s beim Auftreffen. Bestimme den Auftreffgeschwindigkeitspfeil, seinen Betrag und seine Richtung.
  - Task demand (EN): Fresh component records of horizontal projection use x rightward and y upward: the vx graph stays at −2.00 m/s; the vy graph falls linearly from 0 to −1.50 m/s at impact. Determine the impact velocity arrow, its magnitude and direction.
  - Expected performance (DE): Konstruiert v = (−2,00; −1,50) m/s mit Betrag 2,50 m/s und Richtung 36,9° unter der Horizontalen nach links, entsprechend 216,9° gegen den Uhrzeigersinn ab +x. Begründet den Quadranten durch beide negativen Komponenten und unterscheidet Komponentenvorzeichen vom positiven Betrag.
  - Expected performance (EN): Constructs v = (−2.00, −1.50) m/s with magnitude 2.50 m/s and direction 36.9° below the leftward horizontal, equivalent to 216.9° counterclockwise from +x. Justifies the quadrant from both negative components and distinguishes component signs from positive magnitude.
  - Understanding focus (DE): Die geänderte Startrichtung verändert Komponenten und Winkelbezug; die rechtwinklige Vektoraddition bleibt anwendbar.
  - Understanding focus (EN): Changed launch direction changes components and angle references; perpendicular vector addition remains applicable.
