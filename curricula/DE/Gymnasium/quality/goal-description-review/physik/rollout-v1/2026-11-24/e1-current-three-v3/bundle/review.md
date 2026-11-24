# AI review input: Physik: drei präzisierte aktuelle Bewegungsprofile

- Book ID: `de-gym-physik-e1-current-three-v3-20261124`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:a32f6caf564ece78a65d6fec3f12047041d3816d96f05a9deb0667a4853dcc02`
- Selected goals: 3

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Bewegungen mit Zeit-Ort- und Zeit-Geschwindigkeits-Gesetzen beschreiben

- Full learning-goal ID: `262f807a-30d0-503e-986f-856cbd048e8e`
- Goal fingerprint: `sha256:9729fe9b2fca11940d48bfb8dfeece1f8f2f90af28740f5bee994cd61fe17818`
- Page fingerprint: `sha256:375f21276fccd12f9bee9125d5a916304004eae51019571e0bbfc3af3304eee5`
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

- Freier Fall experimentell untersuchen — `09029573-864f-40ca-bf8a-cee7bf6dcb73` (page 2)

### Prerequisites outside this book

- Terme mit Variablen lesen und deuten — `f08d06dc-139d-5fd2-892c-8cc919b1e4fc` (outside this book)
- Gleichmäßig beschleunigte Bewegung und Beschleunigung — `e4b38061-1f28-43ad-8371-a3e7c0e81856` (outside this book)

### Direct reverse prerequisites outside this book

- Beschleunigungsprotokoll: Geschwindigkeit, Ort und Modellgrenzen — `a8dc0290-9f80-5763-8943-e16b8d2aa860` (outside this book)
- Beschleunigungsprotokoll: Geschwindigkeit, Ort und Modellgrenzen — `f13ca187-b680-5f47-b4ad-76bd474bd8a2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2ed3ccd8ba835601e0e7c8982fd9f0dd3cae54a3ae55db53010a402438fa62b7`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `infer-laws-from-graphs`
  - Essential understanding (DE): Für gleichförmige Bewegung gilt v(t) = v0 und s(t) = s0 + v0t; bei konstantem a gilt v(t) = v0 + at und s(t) = s0 + v0t + ½at². t wird ab dem angegebenen Anfangszeitpunkt gemessen.
  - Essential understanding (EN): For uniform motion, v(t) = v0 and s(t) = s0 + v0t; for constant a, v(t) = v0 + at and s(t) = s0 + v0t + ½at². Time t is measured from the stated initial instant.
  - Observable performance (DE): Wählt anhand neuer Zeitdiagramme das passende der beiden Modelle und ermittelt s0, v0 und gegebenenfalls a, soweit aus dem gegebenen Graphen bestimmbar, aus Achsenabschnitten, Steigungen oder Flächen; ergänzt separat gegebene Anfangsdaten. Bei einem t-v-Graphen liefern die Flächen nur Ortsänderungen; zur Rekonstruktion von s(t) ist zusätzlich ein separat bekannter Anfangsort s0 erforderlich. Formuliert beide Gesetze mit Einheiten und konsistenten Vorzeichen.
  - Observable performance (EN): Selects the appropriate model from fresh time graphs and obtains s0, v0, and, where needed, a from intercepts, slopes, or areas where determinable from the given graph; supplements these with separately supplied initial data. For a t-v graph, areas give only changes in position; reconstructing s(t) additionally requires a separately known initial position s0. Formulates both laws with units and consistent signs.
- `explain-law-connection`
  - Essential understanding (DE): Die Geschwindigkeit beschreibt die Steigung des Ortsgraphen; die vorzeichenbehaftete t-v-Fläche ergibt s(t) − s0. Bei linear veränderlichem v liefert die Trapezfläche den Faktor ½.
  - Essential understanding (EN): Velocity describes the position graph's slope; signed t-v area gives s(t) − s0. For linearly changing v, the trapezoid area supplies the factor ½.
  - Observable performance (DE): Begründet den Zusammenhang der selbst bestimmten Gesetze anhand der Diagramme und ihrer physikalischen Bedeutung, etwa über Steigungen, vorzeichenbehaftete Rechteck- oder Trapezflächen oder mittlere Geschwindigkeit mal Zeitspanne, und prüft mindestens einen gemeinsamen Zeitpunkt am Ausgangsdiagramm. Differentialrechnung wird nicht vorausgesetzt, darf aber für eine gleichwertige fachlich richtige Begründung genutzt werden.
  - Observable performance (EN): Explains the connection between the self-determined laws through the graphs and their physical meaning, for example using slopes, signed rectangle or trapezoid areas, or mean velocity times elapsed time, and checks at least one common instant against the source graph. Calculus is not required but may be used for an equivalent physically sound justification.
- `predict-and-check`
  - Essential understanding (DE): Eine Vorhersage für Ort und Geschwindigkeit gilt für das gewählte Modellintervall; sie verwendet den Anfangsort und behält die gewählte Achsenkonvention sowie konsistente Einheiten bei. Das Vorzeichen von v(t) ungleich null gibt die momentane Bewegungsrichtung an; ein Vorzeichenwechsel zeigt einen Richtungswechsel an.
  - Essential understanding (EN): A position and velocity prediction applies within the selected model interval; it uses the initial position and maintains the chosen axis convention and consistent units. The sign of nonzero v(t) gives the direction of motion at that instant; a sign change indicates reversal.
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
  - Expected performance (DE): Leitet v0 = −1 m/s und s(t) = 5 m − (1 m/s)t, v(t) = −1 m/s her. Begründet den Zusammenhang etwa über die negative Steigung oder Δs = −6 m als t-v-Rechteckfläche; gleichwertige graphenbezogene physikalische Begründungen sind zulässig. Erhält s(6 s) = −1 m und v(6 s) = −1 m/s.
  - Expected performance (EN): Derives v0 = −1 m/s and s(t) = 5 m − (1 m/s)t, v(t) = −1 m/s. Explains the connection, for example through the negative slope or Δs = −6 m as a t-v rectangle area; equivalent graph-based physical justifications are acceptable. Obtains s(6 s) = −1 m and v(6 s) = −1 m/s.
  - Understanding focus (DE): Ein negativer Endort und eine negative Geschwindigkeit haben unterschiedliche Bedeutungen; der Anfangsort geht nur in das Ortsgesetz ein.
  - Understanding focus (EN): Negative final position and negative velocity have distinct meanings; initial position enters only the position law.
- `accelerated-velocity-source`
  - Task demand (DE): Ein t-v-Graph ist für 0 bis 5 s eine Gerade durch (0 s; −2 m/s), (2 s; 0) und (4 s; +2 m/s); s(0) = 3 m. Bestimme beide Gesetze, prüfe sie bei 2 s und sage s und v bei 5 s voraus.
  - Task demand (EN): For 0 to 5 s, a t-v graph is a straight line through (0 s, −2 m/s), (2 s, 0), and (4 s, +2 m/s); s(0) = 3 m. Determine both laws, check them at 2 s, and predict s and v at 5 s.
  - Expected performance (DE): Erschließt a = +1 m/s², v(t) = −2 m/s + (1 m/s²)t und s(t) = 3 m − (2 m/s)t + (0,5 m/s²)t². Prüft bei 2 s: v = 0 und s = 1 m, etwa über die negative Dreiecksfläche oder mittlere Geschwindigkeit mal Zeitspanne; gleichwertige graphenbezogene physikalische Begründungen sind zulässig. Erhält bei 5 s s = 5,5 m und v = +3 m/s.
  - Expected performance (EN): Infers a = +1 m/s², v(t) = −2 m/s + (1 m/s²)t and s(t) = 3 m − (2 m/s)t + (0.5 m/s²)t². Checks at 2 s: v = 0 and s = 1 m, for example using the negative triangle area or mean velocity times elapsed time; equivalent graph-based physical justifications are acceptable. Obtains s = 5.5 m and v = +3 m/s at 5 s.
  - Understanding focus (DE): Anfangsgeschwindigkeit und konstante Beschleunigung bestimmen gemeinsam das Ortsgesetz; vorzeichenbehaftete Flächen erhalten den Zusammenhang auch bei Richtungswechsel.
  - Understanding focus (EN): Initial velocity and constant acceleration jointly determine the position law; signed areas preserve the connection through a reversal.
## Page 2: Freier Fall experimentell untersuchen

- Full learning-goal ID: `09029573-864f-40ca-bf8a-cee7bf6dcb73`
- Goal fingerprint: `sha256:130790489acb03f5ba26be963eb06339ad5f38783763c65e16a1646eb7acd6ab`
- Page fingerprint: `sha256:46487f9ae3c3683d0135bb40464a02cf726f987576952e085e0ea48e948adc32`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.1 Bewegungen und ihre Beschreibung

### Canonical description

Die lernende Person kann den freien Fall nahe der Erdoberfläche experimentell untersuchen, Messdaten grafisch auswerten, daraus im Modell ohne Luftwiderstand die Gravitationsbeschleunigung bestimmen und unter Angabe der Anfangsbedingungen ein Zeit-Ort-Gesetz formulieren.

### Visualization

/assets/goal-visualizations/physik/09029573-864f-40ca-bf8a-cee7bf6dcb73/09029573-864f-40ca-bf8a-cee7bf6dcb73.jpg

- original digest: `sha256:814704c3c964ed3d7a1a78a9b8b7af66eda5741107a71e7d4f27f8385b15bace`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Bewegungen mit Zeit-Ort- und Zeit-Geschwindigkeits-Gesetzen beschreiben — `262f807a-30d0-503e-986f-856cbd048e8e` (page 1)

### Direct reverse prerequisites

- Waagerechter Wurf analysieren — `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2` (page 3)

### Prerequisites outside this book

- Messunsicherheiten angeben — `f6b1d812-ce8b-5852-b417-e6c29b533c7a` (outside this book)

### Direct reverse prerequisites outside this book

- Bewegungsanalyse und freier Fall — `a9562b05-c54d-5635-9244-3f7dd24a8642` (outside this book)
- Prüfungsaufgabe: Freien Fall in zwei eigenen Messreihen untersuchen — `f41e4e30-794e-5ce4-ba5e-cc72712cd691` (outside this book)
- Fallbewegung mit Luftwiderstand und Grenzgeschwindigkeit — `12260012-cf04-5409-b57d-f5b3a46d9126` (outside this book)
- Massenanziehung qualitativ beschreiben — `92d8f398-0c9f-523c-88d7-44165b6b4768` (outside this book)
- Fall leichter und schwerer Körper vergleichen — `d9a6ea85-f7e8-5cbd-afe9-62596e22040d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:abd8bd694a195191bed643305f0b953e3c884efb4fce7b4df48be2b720c5f921`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `collect-free-fall-data`
  - Essential understanding (DE): Beim freien Fall nahe der Erdoberfläche gilt näherungsweise konstante Beschleunigung, wenn Luftwiderstand vernachlässigbar ist. Gemessene Orte und Zeiten sind von daraus erschlossenem g zu unterscheiden.
  - Essential understanding (EN): Free fall near Earth's surface has approximately constant acceleration when air resistance is negligible. Measured positions and times must be distinguished from the inferred g.
  - Observable performance (DE): Formuliert eine prüfbare Frage zur Zeit-Ort-Beziehung und erhebt selbst mehrere Messpunkte mit Wiederholungen. Begründet Messprinzip, kontrollierte Freigabe und Kalibrierung; dokumentiert Rohdaten, eigene Beiträge sowie Zeit- und Ortsunsicherheiten. Nutzt geringe Fallhöhe, freien Fallbereich und Auffangbehälter. Für die frische unabhängige Transferdemonstration ist auch eine gesondert bereitgestellte, klar zugeordnete Aufnahme oder Messreihe zulässig; deren Herkunft und eigene Auswertung werden getrennt dokumentiert.
  - Observable performance (EN): Formulates a testable question about the time-position relationship and personally collects several measurements with repeats. Justifies the measurement principle, controlled release and calibration; documents raw data, personal contributions and time and position uncertainties. Uses a low drop height, clear falling area and catch container. The fresh independent transfer demonstration may also use a separately supplied, clearly attributed recording or measurement series; its provenance and the learner's analysis are documented separately.
- `graphical-g-inference`
  - Essential understanding (DE): Bei Start aus Ruhe gilt für die Fallstrecke h = g·t²/2; allgemeiner entspricht der quadratische Koeffizient im Zeit-Ort-Graphen der halben vorzeichenbehafteten Beschleunigung.
  - Essential understanding (EN): For release from rest, falling distance obeys h = g·t²/2; more generally the quadratic coefficient in the position-time graph equals half the signed acceleration.
  - Observable performance (DE): Wählt eine zu den Anfangsbedingungen der ausgewerteten Messreihe passende grafische Auswertung, bestimmt g etwa aus einer begründeten Steigung oder quadratischen Anpassung mit Einheit und gibt eine durch Auflösung und Streuung gestützte Unsicherheit an. Prüft Modellabweichungen, ohne Messwerte auf einen Sollwert zu zwingen.
  - Observable performance (EN): Selects graphical analysis suited to the initial conditions of the analyzed series, determines g, for example from a justified slope or quadratic fit, with units and states uncertainty supported by resolution and scatter. Checks model departures without forcing measurements to a target value.
- `initial-conditions-law`
  - Essential understanding (DE): Für konstante Beschleunigung gilt s(t) = s0 + v0·t + a·t²/2. Der Betrag g ist positiv; das Vorzeichen von a hängt von der Achsenrichtung ab. v0 = 0 gilt nur bei geeigneter Freigabe und Zeitwahl.
  - Essential understanding (EN): For constant acceleration, s(t) = s0 + v0·t + a·t²/2. The magnitude g is positive; the sign of a depends on axis direction. v0 = 0 applies only with suitable release and choice of time origin.
  - Observable performance (DE): Formuliert für jede ausgewertete Messreihe das vollständige Gesetz mit gemessenem oder begründetem s0, v0 und erschlossenem a. Benennt Nullzeit und Achsenrichtung und vergleicht eine vorhergesagte Position mit der Messung unter Berücksichtigung der Unsicherheit.
  - Observable performance (EN): Formulates the complete law for each analyzed series using measured or justified s0 and v0 and inferred a. States the time origin and axis direction and compares a predicted position with measurement while accounting for uncertainty.

**Coverage expectations**

- required expectations: `collect-free-fall-data`, `graphical-g-inference`, `initial-conditions-law`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `measurement-principle`: Fallzeitmessung für mehrere Freigabehöhen gegenüber kalibrierter Bildmessung einer neuen eigenen oder gesondert bereitgestellten, klar zugeordneten Fallreihe. / Fall-time measurement for several release heights versus calibrated image measurement of a new personal or separately supplied, clearly attributed drop series.
- `initial-time-and-sign`: Abwärts positive Fallstrecke ab Freigabe gegenüber verändertem Ortsnullpunkt und aufwärts positiver Achse bei Freigabe aus Ruhe oder, als weitere Möglichkeit, bei Nullzeit während des Falls mit v0 ungleich null. / Downward-positive falling distance from release versus a changed position origin and upward-positive axis at release from rest or, as a further option, a time origin during the fall with nonzero v0.

**Application cases**

- `release-height-series`
  - Task demand (DE): Untersuche selbst den Fall einer kompakten Kugel aus Ruhe aus mehreren niedrigen Höhen, etwa 0,20–0,65 m. Wähle eine hinreichend genaue Fallzeitmessung, wiederhole die Messungen und bestimme g grafisch mit abwärts positiver Fallstrecke.
  - Task demand (EN): Personally investigate a compact ball released from rest at several low heights, for example 0.20–0.65 m. Choose sufficiently accurate fall-time measurement, repeat measurements and determine g graphically using downward-positive falling distance.
  - Expected performance (DE): Liefert eigene Höhen und Zeiten mit Unsicherheiten und bestimmt g etwa aus einem h-gegen-t²-Graphen als doppelte Steigung; gleichwertige, begründete grafische Bestimmungen mit Einheiten und Unsicherheit sind zulässig. Modellreferenz, keine Soll-Rohdaten: Bei g = 9,81 m/s² ergeben 0,20 und 0,50 m etwa 0,202 und 0,319 s. Formuliert h(t) = gMess·t²/2 mit h0 = 0 und v0 = 0 und prüft die Messverträglichkeit.
  - Expected performance (EN): Provides personal heights and times with uncertainties and determines g, for example from an h-versus-t² graph as twice the slope; equivalent, justified graphical determinations with units and uncertainty are acceptable. Model reference, not target raw data: with g = 9.81 m/s², 0.20 and 0.50 m correspond to about 0.202 and 0.319 s. Formulates h(t) = gMeasured·t²/2 with h0 = 0 and v0 = 0 and checks agreement with measurement.
  - Understanding focus (DE): Die grafische Steigung erschließt g aus eigenen Messungen; Freigabe und Nullzeit rechtfertigen den fehlenden linearen Term.
  - Understanding focus (EN): The graph's slope infers g from personal measurements; release and time origin justify the absent linear term.
- `in-flight-time-origin`
  - Task demand (DE): Nutze für eine unabhängige neue grafische Auswertung eine eigene sichere Fallaufnahme mit Wiederholungen, kalibriertem Maßstab und bekannter Bildzeit oder eine gesondert bereitgestellte, klar zugeordnete Aufnahme/Messreihe mit dokumentierter Kalibrierung und Zeitbasis. Wähle aufwärts als positive Richtung und t = 0 erst während des Falls; alternativ ändere Ortsnullpunkt und Achsenrichtung bei Freigabe aus Ruhe. Bestimme grafisch g und ein Gesetz mit passenden Anfangswerten.
  - Task demand (EN): For a fresh independent graphical analysis, use a personal safe drop recording with repeats, a calibrated scale and known frame timing, or a separately supplied, clearly attributed recording/measurement series with documented calibration and time base. Choose upward positive and t = 0 during the fall; alternatively change the position origin and axis direction at release from rest. Determine g graphically and obtain a law with appropriate initial values.
  - Expected performance (DE): Kennzeichnet eigene oder fremde Messdaten samt Herkunft und zeigt eine eigenständige grafische Bestimmung von g passend zu den Anfangsbedingungen. Eine grafische quadratische Anpassung mit negativem quadratischem Koeffizienten und v0 < 0 bei aufwärts positiver Achse und Nullzeit während des Falls ist eine Möglichkeit; bei Freigabe aus Ruhe sind andere passende grafische Bestimmungen zulässig. Optionale Modellreferenz: Freigabe aus Ruhe bei y = 0,80 m, aufwärts positiv, Nullzeit bei y0 = 0,60 m und g = 9,8 m/s² ergibt v0 ≈ −1,98 m/s sowie y(0,10 s) ≈ 0,353 m. Berichtet die selbst erschlossenen Werte mit ihren Unsicherheiten und prüft das Gesetz am eigenständig erstellten Graphen; maßgeblich ist die Messverträglichkeit, nicht die Übereinstimmung mit den Referenzwerten.
  - Expected performance (EN): Identifies personal or supplied measurements and their provenance and independently determines g graphically in a way suited to the initial conditions. A graphical quadratic fit with a negative quadratic coefficient and v0 < 0 for upward positive and an in-flight time origin is one option; other appropriate graphical determinations are acceptable for release from rest. Optional model reference: release from rest at y = 0.80 m, upward positive, time origin at y0 = 0.60 m and g = 9.8 m/s² give v0 ≈ −1.98 m/s and y(0.10 s) ≈ 0.353 m. Reports independently inferred values with their uncertainties and checks the law against the independently constructed graph; agreement with the measurements within uncertainty, rather than with the reference values, is decisive.
  - Understanding focus (DE): Koordinaten und Nullzeit ändern Koeffizienten und Anfangswerte, aber nicht den erschlossenen Betrag der Fallbeschleunigung.
  - Understanding focus (EN): Coordinates and time origin change coefficients and initial values but not the inferred magnitude of gravitational acceleration.
## Page 3: Waagerechter Wurf analysieren

- Full learning-goal ID: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2`
- Goal fingerprint: `sha256:d589a725624dabbd81123d28bee9c6dd653735297c2a93a044d9165583e7616c`
- Page fingerprint: `sha256:1716ca6d3c887d868583e363b7ac3cba0dfbe49662f45ac3af5b1450894603a8`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Waagerechter Wurf und Kreisbewegung > Waagerechter Wurf und Superposition

### Canonical description

Die lernende Person kann den waagerechten Wurf experimentell untersuchen, bei vernachlässigbarem Luftwiderstand und konstanter Fallbeschleunigung als Überlagerung gleichförmiger horizontaler und gleichmäßig beschleunigter vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

### Visualization

/assets/goal-visualizations/physik/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.png

- original digest: `sha256:63ff949fccec93b2fd3da1463ad62acd9d9ee6adbd4f775bc25bc1197b140342`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Freier Fall experimentell untersuchen — `09029573-864f-40ca-bf8a-cee7bf6dcb73` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Mehrphasenbewegung und Modellprüfung — `2b9e565f-d9b4-5e23-b5b7-b7977cecff06` (outside this book)
- Wo trifft die waagerecht gestartete Kugel auf? — `39f52dcb-ff1d-5cad-9ccb-30da803cfa85` (outside this book)
- Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit — `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` (outside this book)
- Prüfungsaufgabe: Wurf- und Bremsbewegungen modellieren — `dfd2628f-b44e-51b3-86e8-99158861be8c` (outside this book)
- Geschwindigkeit beim waagerechten Wurf als Vektor bestimmen — `0fee53f2-1c02-5b12-9b6c-aa9fa462d921` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b02a5d34baa85ea045e75fe4eb2798631b6afb34d6ab3713f1de093f24806907`
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
  - Observable performance (DE): Prüft eigene Daten auf gleiche vorzeichenbehaftete horizontale Ortsänderungen und während des Abstiegs wachsende Beträge |Δy| der vertikalen Ortsänderungen in gleichen Zeitspannen. Vergleicht eine begründete Modellvorhersage mit Messpunkten und benennt unter Berücksichtigung der Unsicherheit mögliche Start-, Perspektiv- oder Luftwiderstandseinflüsse.
  - Observable performance (EN): Checks personal data for equal signed horizontal displacements and, during descent, growing magnitudes |Δy| of vertical displacements over equal time spans. Compares a justified model prediction with measurements and identifies possible launch, perspective or air-resistance effects while accounting for uncertainty.
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
