# AI review input: Impuls und Newton II – sechs Ziele im aktuellen Kontext

- Book ID: `physics-e2-corrected-four-description-review-20261125-v2`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:fee031bfa5d5b5d4743f38384cd00dac6e6dcf0f3bb9d086d2547700e53cd496`
- Selected goals: 4

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Mittlere resultierende Kraft aus der Impulsänderung bestimmen

- Full learning-goal ID: `ecbaa101-cb10-5da3-9368-ae40ff587d74`
- Goal fingerprint: `sha256:ec3d3ce6e0bbe3c7bba8659244ab7935fba73fc37f972ce073e70bcd725cb286`
- Page fingerprint: `sha256:7198bc161f71c70c8100d2db9db8e4f6349bff6ff301f19537bb90406a298162`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann für einen Körper fester Masse auf einer Geraden in einem Inertialsystem aus zwei gegebenen vorzeichenbehafteten Impulswerten und ihren Zeitpunkten die mittlere resultierende äußere Kraft im Intervall als $\Delta p/\Delta t$ berechnen. Sie gibt das Ergebnis in Newton an und deutet sein Vorzeichen bezogen auf die gewählte positive Richtung.

### Visualization

/assets/goal-visualizations/physik/ecbaa101-cb10-5da3-9368-ae40ff587d74/ecbaa101-cb10-5da3-9368-ae40ff587d74.jpg

- original digest: `sha256:724f0d28904e8b8054b8042a7385a62c211ce9ae67be4c13312500bb1cc03c9b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen — `059c1adc-e4d2-5222-a923-15abc417d59f` (page 2)

### Prerequisites outside this book

- Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen — `53afbda1-5776-502b-8867-471975d7b766` (outside this book)
- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:03693b101664ecc0f3894b9503ceebd4310258db66666179f3700c222342b352`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `interval-force`
  - Essential understanding (DE): Die Impulsänderung ist Endimpuls minus Anfangsimpuls. Ihr Quotient durch die positive Zeitspanne ist in einem Inertialsystem die mittlere resultierende äußere Kraft auf den Körper. Der Mittelwert legt bei veränderlicher Kraft keinen einzelnen momentanen Kraftwert fest.
  - Essential understanding (EN): Momentum change is final minus initial momentum. In an inertial frame its quotient by the positive elapsed time is the average net external force on the object. For a variable force this average does not determine any particular instantaneous force.
  - Observable performance (DE): Die Person ordnet zwei vorzeichenbehaftete Impulswerte zeitlich, bestimmt Δp und Δt, berechnet den Quotienten in N und erklärt das Vorzeichen als Richtung der mittleren resultierenden Kraft. Sie trennt diesen Mittelwert von der Bewegungsrichtung und von unbekannten Kraftwerten im Intervall.
  - Observable performance (EN): The learner orders two signed momenta in time, finds Δp and Δt, calculates their quotient in N and explains its sign as the direction of average net force. They distinguish this average from the direction of motion and from unknown forces within the interval.

**Coverage expectations**

- required expectations: `interval-force`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `momentum-and-change`: Anfangs- und Endimpuls mit gleichem oder verschiedenem Vorzeichen; Impuls und Änderung können unterschiedliche Vorzeichen haben. / Initial and final momentum with the same or opposite signs; momentum and its change can have different signs.
- `time-and-interpretation`: Zeitpunkte außerhalb eines Nullstarts und veränderlicher unbekannter Kraftverlauf. / Times not beginning at zero and an unknown variable force history.

**Application cases**

- `reversal`
  - Task demand (DE): Ein Körper fester Masse bewegt sich auf einer Geraden in einem Inertialsystem. Rechts ist positiv. Eine frische Messreihe gibt p(2 s)=+5 kg m/s und p(6 s)=−1 kg m/s an. Die Kraft darf variieren. Bestimme die mittlere resultierende äußere Kraft und beurteile, ob damit ihre Kraft bei t=4 s bekannt ist.
  - Task demand (EN): A fixed-mass object moves along a line in an inertial frame. Right is positive. A fresh set of readings gives p(2 s)=+5 kg m/s and p(6 s)=−1 kg m/s. The force may vary. Find the average net external force and assess whether this determines the force at t=4 s.
  - Expected performance (DE): Δp=−6 kg m/s, Δt=4 s und mittlere Kraft −1,5 N nach links. Der momentane Wert bei 4 s ist ohne weiteren Kraft- oder Graphenverlauf nicht bestimmt. Die eigene Differenz- und Quotientenrechnung wird gezeigt; die Werte stammen nicht aus der Lernillustration.
  - Expected performance (EN): Δp=−6 kg m/s, Δt=4 s and average force −1.5 N to the left. Without further force or graph information the instantaneous value at 4 s is undetermined. The learner shows their own difference and quotient calculation; these readings are different from the teaching illustration.
  - Understanding focus (DE): Gerichtete Änderung über ein Intervall und Grenze des Mittelwerts.
  - Understanding focus (EN): Directed interval change and the limitation of an average.
- `negative-but-increasing`
  - Task demand (DE): Für einen anderen Körper fester Masse auf einer Geraden im Inertialsystem sind p(4 s)=−6 kg m/s und p(7 s)=−3 kg m/s gegeben. Rechts ist positiv. Bestimme die mittlere resultierende äußere Kraft und vergleiche ihre Richtung mit der Bewegungsrichtung an den beiden Messzeitpunkten. Beurteile, ob die Daten einen zwischenzeitlichen Richtungswechsel ausschließen.
  - Task demand (EN): For another fixed-mass object moving along a line in an inertial frame, p(4 s)=−6 kg m/s and p(7 s)=−3 kg m/s. Right is positive. Find the average net external force and compare its direction with the motion at the two measurement times. Assess whether the readings rule out an intermediate reversal.
  - Expected performance (DE): Δp=+3 kg m/s, Δt=3 s und mittlere Kraft +1 N nach rechts. Der Körper bewegt sich an beiden Messzeitpunkten nach links; der Endimpuls hat einen kleineren Betrag. Daraus folgen weder eine monotone Änderung noch eine durchgehend linke Bewegungsrichtung. Zwischenzeitliche Richtungswechsel bleiben ohne weitere Daten möglich.
  - Expected performance (EN): Δp=+3 kg m/s, Δt=3 s and average force +1 N to the right. The object moves left at both measurement times, and the final momentum magnitude is smaller. Neither monotonic change nor uninterrupted leftward motion follows. Intermediate reversals remain possible without further data.
  - Understanding focus (DE): Vorzeichen der Impulsänderung von dem des vorhandenen Impulses unterscheiden.
  - Understanding focus (EN): Distinguish the sign of momentum change from that of existing momentum.
## Page 2: Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen

- Full learning-goal ID: `059c1adc-e4d2-5222-a923-15abc417d59f`
- Goal fingerprint: `sha256:e61ea1dc37a11fbf944f6a70c2e7995df9d5144ba7c89889f99196f2776f9da8`
- Page fingerprint: `sha256:40b40cbe4159142e1b3a08e58b4f425821c6f018f982c1fd884dbf21293bdd49`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann für eine geradlinige Bewegung eines Körpers fester Masse in einem Inertialsystem die Tangentensteigung am Impuls-Zeit-Graphen als momentane resultierende äußere Kraft $F_{\mathrm{res}}(t)=\mathrm{d}p/\mathrm{d}t$ deuten und ihren Wert am markierten Zeitpunkt aus einer eingezeichneten Tangente mit Vorzeichen und Einheit näherungsweise bestimmen.

### Visualization

/assets/goal-visualizations/physik/059c1adc-e4d2-5222-a923-15abc417d59f/059c1adc-e4d2-5222-a923-15abc417d59f.jpg

- original digest: `sha256:851b2f3779e77c7ad879d20578530a0abac10318e83642bfc13057429aaf0eab`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Mittlere resultierende Kraft aus der Impulsänderung bestimmen — `ecbaa101-cb10-5da3-9368-ae40ff587d74` (page 1)

### Direct reverse prerequisites

- Impulserhaltung aus Newtonschen Axiomen (LK) — `f524f05c-4456-4fc3-a1f7-f40741fc1f16` (page 4)

### Prerequisites outside this book

- Ableitung als Steigung im Punkt deuten — `b1dcc191-d046-50de-984a-ee5c17157628` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a31142393abad5977c759dd690acc297f9235e2a60415d7a56c02adb0cba707a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `tangent-to-force`
  - Essential understanding (DE): Die Tangentensteigung im Impuls-Zeit-Diagramm beschreibt den momentanen Änderungswert des Impulses und damit die momentane resultierende äußere Kraft. Der Ordinatenwert p und die mittlere Sekantensteigung sind andere Größen. Die Steigungseinheit ist (kg m/s)/s = N.
  - Essential understanding (EN): The tangent slope in a momentum–time graph describes the instantaneous rate of momentum change and hence the instantaneous net external force. The ordinate p and an average secant slope are different quantities. The slope unit is (kg m/s)/s = N.
  - Observable performance (DE): Die Person liest an einer eingezeichneten Tangente zwei geeignete Punkte ab, bildet das vorzeichenbehaftete Steigungsdreieck und übersetzt den Wert samt Einheit in eine Kraftaussage am markierten Zeitpunkt. Sie erklärt die Richtung auch bei negativem p und grenzt den Tangentenwert vom Intervallmittel ab.
  - Observable performance (EN): The learner reads two suitable points on a drawn tangent, forms a signed slope triangle and translates the value and unit into a force statement at the marked instant. They explain the direction even for negative p and distinguish the tangent value from an interval average.

**Coverage expectations**

- required expectations: `tangent-to-force`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `height-and-slope`: Positive und negative Graphenhöhen bei steigender, fallender oder waagerechter Tangente. / Positive and negative graph heights with a rising, falling or horizontal tangent.
- `curve-and-scale`: Gekrümmte Graphen mit von der Tangente verschiedener Sekante und geänderten Achsenskalierungen. / Curved graphs with a secant different from the tangent and changed axis scales.

**Application cases**

- `negative-height-rising`
  - Task demand (DE): Die lernende Person erhält ein frisch vorbereitetes skaliertes p(t)-Diagramm eines Körpers fester Masse auf einer Geraden im Inertialsystem. Rechts ist positiv. Der Zeitpunkt t=2 s und die dort eingezeichnete Tangente sind markiert. Wähle selbst zwei gut ablesbare Tangentenpunkte, bestimme daraus näherungsweise die momentane resultierende Kraft und erkläre Bewegungs- und Kraftrichtung. Die Tangentenkoordinaten werden nicht im Aufgabentext genannt.
  - Task demand (EN): The learner receives a freshly prepared scaled p(t) graph for a fixed-mass object moving along a line in an inertial frame. Right is positive. The instant t=2 s and its drawn tangent are marked. Choose two readable tangent points, use them to estimate the instantaneous net force, and explain motion and force directions. The task text does not supply tangent-point coordinates.
  - Expected performance (DE): Nur für die Aufgabenvorbereitung und Prüfung: Zeichne für 0≤t≤4 s den gekrümmten Graphen p(t)=(t−2)²+3(t−2)−4 in kg m/s und die Tangente p=3t−10 bei t=2 s; nutze gut lesbare Achsen. Gib der Person weder Funktionsgleichungen noch Tangentenkoordinaten. Sie liest ihre zwei Punkte selbst ab, etwa (0 s,−10 kg m/s) und (4 s,+2 kg m/s). Erwartet werden ungefähr +3 N, mit begründeter Ablesetoleranz etwa ±0,3 N. Bei t=2 s ist p≈−4 kg m/s: Bewegung nach links, Kraft nach rechts. Tangentenpunkte müssen keine Graphenpunkte sein.
  - Expected performance (EN): For task preparation and review only: draw the curved graph p(t)=(t−2)²+3(t−2)−4 in kg m/s for 0≤t≤4 s and its tangent p=3t−10 at t=2 s, using readable axes. Give the learner neither equations nor tangent coordinates. They read their own two points, for example (0 s,−10 kg m/s) and (4 s,+2 kg m/s). Expect about +3 N with a justified reading tolerance of roughly ±0.3 N. At t=2 s, p≈−4 kg m/s: motion is leftward and force rightward. Tangent points need not lie on the curve.
  - Understanding focus (DE): Eine Steigung in eine lokale Kraftaussage übersetzen; Graphenhöhe und Steigung trennen.
  - Understanding focus (EN): Translate a slope into a local force statement; distinguish graph height from slope.
- `tangent-versus-secant`
  - Task demand (DE): In einem anderen frisch gezeichneten, skalierten p(t)-Diagramm für einen Körper fester Masse im Inertialsystem sind t=2 s und die dortige Tangente markiert. Lies selbst am Diagramm ab und bestimme die momentane resultierende Kraft dort. Vergleiche mit der mittleren Kraft von 0 bis 2 s und begründe einen möglichen Unterschied. Der Aufgabentext nennt weder die Tangentenrichtung noch die Koordinaten.
  - Task demand (EN): In a different freshly drawn scaled p(t) graph for a fixed-mass object in an inertial frame, t=2 s and its tangent are marked. Read the diagram yourself to find the instantaneous net force there. Compare with the average force from 0 to 2 s and explain a possible difference. The task text gives neither tangent direction nor coordinates.
  - Expected performance (DE): Nur für Vorbereitung und Prüfung: Zeichne p(t)=4−(t−2)² in kg m/s für 0≤t≤3 s mit gut lesbaren Achsen, der Tangente bei t=2 s und dem markierten Zeitpunkt; Gleichung und Ergebnis bleiben im Prüferhinweis. Die Person erkennt aus eigenen Ablesungen die waagerechte Tangente und bestimmt etwa 0 N (z. B. ±0,2 N Ablesetoleranz). Die selbst abgelesenen Endpunkte (0 s,0 kg m/s) und (2 s,4 kg m/s) liefern die mittlere Kraft +2 N. Ein von null verschiedener Impuls verlangt keine momentane Kraft.
  - Expected performance (EN): For preparation and review only: draw p(t)=4−(t−2)² in kg m/s for 0≤t≤3 s with readable axes, the tangent at t=2 s and the marked instant; keep the equation and result in the reviewer guidance. From their own readings the learner identifies the horizontal tangent and obtains about 0 N (for example ±0.2 N reading tolerance). Independently read endpoints (0 s,0 kg m/s) and (2 s,4 kg m/s) give average force +2 N. Nonzero momentum does not require instantaneous force.
  - Understanding focus (DE): Momentane Kraft, mittlere Kraft und Impuls sind drei unterscheidbare Größen.
  - Understanding focus (EN): Instantaneous force, average force and momentum are three distinct quantities.
## Page 3: Newtons 2. Axiom (Grundgleichung der Mechanik)

- Full learning-goal ID: `a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20`
- Goal fingerprint: `sha256:a2d4281e86aaa23eafd1374d1fe2fdec66e04e0aab3c66742b70fe2c17ddd445`
- Page fingerprint: `sha256:9a8792b6afa50d4b147a87ea8592807b53aec4bd61c923ddb32e9bb956fdfaac`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Newtons Axiome und Inertialsysteme

### Canonical description

Die lernende Person kann Newtons zweites Axiom für einen Körper konstanter Masse in einem Inertialsystem formulieren und erklären, dass der Betrag der Beschleunigung dem Betrag der resultierenden äußeren Kraft geteilt durch die Masse entspricht und eine von null verschiedene Beschleunigung in Richtung dieser Kraft zeigt.

### Visualization

/assets/goal-visualizations/physik/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20.jpg

- original digest: `sha256:94f1d4f56e115e7d8339029a611ea9dc7975aaaa23c95150942897897647630a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Newtons 1. Axiom (Trägheitsprinzip) — `31a2ef52-114b-4d2c-a720-6ef5a390b6dc` (outside this book)

### Direct reverse prerequisites outside this book

- Grundgleichung der Mechanik anwenden — `5f289cdc-fda1-4058-b44f-041ba1398e79` (outside this book)
- Newtons 3. Axiom (Wechselwirkungsprinzip) — `ad984bb6-e225-432a-952d-d83cda40b7f8` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:cb6d39ac585cd4f805754ce9daf16b226ae153dbc4efeb5af5826d3fb97eaf99`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `net-force-mass-acceleration`
  - Essential understanding (DE): Für einen Körper konstanter Masse in einem Inertialsystem gilt: Die Beschleunigung hat den Betrag F_res/m und bei von null verschiedenem Wert die Richtung der resultierenden äußeren Kraft. Die Richtung der vorhandenen Geschwindigkeit ist davon zu unterscheiden. Resultierende null bedeutet Beschleunigung null, auch bei Bewegung.
  - Essential understanding (EN): For a constant-mass object in an inertial frame, acceleration has magnitude F_net/m and, when nonzero, the direction of the net external force. The acceleration direction need not coincide with the current velocity direction. Zero net force means zero acceleration even during motion.
  - Observable performance (DE): Die Person formuliert das zweite Axiom und erklärt für neue Fälle, was eine Änderung der resultierenden äußeren Kraft oder der Masse für Betrag und Richtung der Beschleunigung bedeutet. Sie begründet einen Fall mit entgegengesetzter Geschwindigkeit und Beschleunigung sowie einen Fall ohne Beschleunigung.
  - Observable performance (EN): The learner states the second law and explains in fresh cases how changing net external force or mass affects the magnitude and direction of acceleration. They justify a case with opposite velocity and acceleration and a case with zero acceleration.

**Coverage expectations**

- required expectations: `net-force-mass-acceleration`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `relative-direction`: Resultierende in, entgegen oder quer zur momentanen Bewegungsrichtung, jeweils als bereits bestimmte Kraft gegeben. / Net force along, opposite to or transverse to the current motion, supplied as an already determined force.
- `mass-force-and-zero`: Gleiche Masse bei geänderter Kraft; gleiche Kraft bei anderer konstanter Masse; verschwindende Resultierende. / Same mass with changed force; same force with a different constant mass; zero resultant.

**Application cases**

- `moving-right-force-left`
  - Task demand (DE): Ein Wagen konstanter Masse bewegt sich in einem Inertialsystem nach rechts. Die bereits bestimmte resultierende äußere Kraft zeigt nach links. Erkläre mit Newtons zweitem Axiom die Richtung der Beschleunigung und ob die Geschwindigkeit deshalb sofort nach links zeigen muss. Was ändert eine Verdoppelung der Kraft bei derselben Masse?
  - Task demand (EN): A constant-mass cart moves right in an inertial frame. The already determined net external force points left. Use Newton’s second law to explain the acceleration direction and whether velocity must therefore immediately point left. What does doubling the force at the same mass change?
  - Expected performance (DE): Die Beschleunigung zeigt nach links; der Wagen kann zunächst weiter nach rechts fahren und langsamer werden. Doppelte Kraft ergibt doppelte Beschleunigung im Betrag. Kraft- und Beschleunigungsrichtung stimmen überein, Geschwindigkeits- und Beschleunigungsrichtung nicht notwendig.
  - Expected performance (EN): Acceleration points left; the cart can initially continue right while slowing. Doubling force doubles acceleration magnitude. Force and acceleration agree in direction, while velocity and acceleration need not.
  - Understanding focus (DE): Beschleunigung als Bewegungsänderung und Verhältnis zur Kraft erklären.
  - Understanding focus (EN): Explain acceleration as change in motion and its relation to force.
- `different-masses-and-zero-force`
  - Task demand (DE): Zwei Körper mit konstanten Massen m und 2m unterliegen im selben Inertialsystem je derselben von null verschiedenen resultierenden äußeren Kraft. Vergleiche ihre Beschleunigungen. Anschließend ist die Resultierende bei einem bereits bewegten Körper null: Erkläre mit dem zweiten Axiom, was daraus für seine Beschleunigung folgt.
  - Task demand (EN): Two objects with constant masses m and 2m experience the same nonzero net external force in one inertial frame. Compare their accelerations. Next the net force on an already moving object is zero: explain what the second law implies for its acceleration.
  - Expected performance (DE): Der Körper mit 2m hat den halben Beschleunigungsbetrag bei gleicher Richtung. Bei Resultierender null ist die Beschleunigung null; daraus folgt keine Geschwindigkeit null. Das Gesetz wird als Beziehung zwischen resultierender äußerer Kraft, Masse und Beschleunigung formuliert.
  - Expected performance (EN): The object with 2m has half the acceleration magnitude in the same direction. With zero net force acceleration is zero; zero velocity does not follow. The law is stated as a relationship between net external force, mass and acceleration.
  - Understanding focus (DE): Abhängigkeit von der Masse und Nullfall des zweiten Axioms.
  - Understanding focus (EN): Mass dependence and the zero case of the second law.
## Page 4: Impulserhaltung aus Newtonschen Axiomen (LK)

- Full learning-goal ID: `f524f05c-4456-4fc3-a1f7-f40741fc1f16`
- Goal fingerprint: `sha256:a037c48de3259664d4079a953bb464ade1b34c1c51d049034c61ca23c41bc17d`
- Page fingerprint: `sha256:52c10b0ed0f795eb4978d5f90d6e3c30f2641ed90ce36afe5c084e9a4e360479`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann in einem Inertialsystem für ein materiell abgeschlossenes System aus Newtons zweitem und drittem Axiom herleiten, dass der Gesamtimpuls bei verschwindendem resultierendem äußerem Kraftstoß an den Intervallgrenzen gleich ist, und die Voraussetzungen für seine fortlaufende Erhaltung diskutieren.

### Visualization

/assets/goal-visualizations/physik/f524f05c-4456-4fc3-a1f7-f40741fc1f16/f524f05c-4456-4fc3-a1f7-f40741fc1f16.jpg

- original digest: `sha256:13b13ebf327ce3545960b7f979bc46c5608b66c0d31958740008328e78ef35c9`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen — `059c1adc-e4d2-5222-a923-15abc417d59f` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Integralterme interpretieren und begründen — `34604a97-0c64-5b06-81e2-6ac818732d60` (outside this book)
- Vektoren komponentenweise addieren und subtrahieren — `c63bbffd-8d1c-5fe2-a428-db194e6fe592` (outside this book)
- Grundgleichung der Mechanik anwenden — `5f289cdc-fda1-4058-b44f-041ba1398e79` (outside this book)
- Newtons 3. Axiom anwenden — `a0aaedcb-41f8-4891-af77-a69a76b8c10d` (outside this book)

### Direct reverse prerequisites outside this book

- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Gravitation und Weltbilder vertieft herleiten (LK) — `8a1d4093-9832-5010-b1ca-9d32d8c05afa` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:280c825eaa27f58fbf53c575828b7169c3831dddea356d9ca090c5f7d0a6f467`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `proof`

**Positive understanding expectations**

- `selected-round-a-core`
  - Essential understanding (DE): Für ein materiell abgeschlossenes System im Inertialsystem ergibt das Summieren von Newtons zweitem Axiom über alle Körper die Änderung des vektoriellen Gesamtimpulses. Nach Newtons drittem Axiom heben sich die inneren Wechselwirkungskräfte paarweise auf, sodass nur der resultierende äußere Kraftstoß die Gesamtimpulsänderung bestimmt: $\Delta\vec P=\vec J_\mathrm{ext}$. Ein verschwindender äußerer Kraftstoß liefert gleichen Gesamtimpuls an den Intervallgrenzen; konstante Impulserhaltung zu jedem Zeitpunkt verlangt eine verschwindende resultierende äußere Kraft während des gesamten betrachteten Ablaufs. Alle Impulse und Kräfte einer Bilanz werden in einem gemeinsamen Inertialsystem beschrieben.
  - Essential understanding (EN): For a materially closed system in an inertial frame, summing Newton's second law over all bodies gives the change in vector total momentum. By Newton's third law, the internal interaction forces cancel pairwise, so only the net external impulse determines the change in total momentum: $\Delta\vec P=\vec J_\mathrm{ext}$. Zero external impulse gives equal total momentum at the endpoints of the interval; constant momentum at every instant requires zero net external force throughout the process considered. Every momentum and force in a balance is expressed in one common inertial frame.
  - Observable performance (DE): Die lernende Person legt für ein Mehrkörpersystem Systemgrenze und Zeitintervall fest, klassifiziert Kräfte als innerlich oder äußerlich, summiert die Impulsgleichungen und zeigt nachvollziehbar die paarweise Aufhebung der inneren Kräfte. Sie leitet daraus $\Delta\vec P=\vec J_\mathrm{ext}$ her, prüft Vektorrichtungen und Einheiten und formuliert präzise, unter welchen Voraussetzungen der Gesamtimpuls zwischen zwei Zuständen beziehungsweise fortlaufend erhalten ist. Sie benutzt für alle Körper dieselbe Bezugssystemwahl.
  - Observable performance (EN): For a multi-body system, the learner defines the system boundary and time interval, classifies forces as internal or external, sums the momentum equations, and explicitly shows the pairwise cancellation of internal forces. The learner derives $\Delta\vec P=\vec J_\mathrm{ext}$, checks vector directions and units, and states precisely the conditions under which total momentum is conserved between two states or continuously. They use the same reference frame for every body.
- `zero-net-impulse-is-an-endpoint-condition`
  - Essential understanding (DE): Ein verschwindender resultierender äußerer Kraftstoß über ein Intervall garantiert gleichen Gesamtimpuls an dessen Anfang und Ende, aber nicht notwendig einen zu jedem Zwischenzeitpunkt konstanten Gesamtimpuls. Fortlaufende Impulserhaltung folgt erst, wenn die resultierende äußere Kraft zu jedem Zeitpunkt verschwindet.
  - Essential understanding (EN): Zero net external impulse over an interval guarantees equal total momentum at its beginning and end, but not necessarily constant total momentum at every intermediate instant. Continuous momentum conservation follows only when the net external force vanishes at every instant.
  - Observable performance (DE): Die lernende Person konstruiert oder analysiert einen äußeren Kraftverlauf mit positiver und negativer Teilphase, integriert ihn vektoriell und unterscheidet eine Endpunktgleichheit des Gesamtimpulses von seiner zeitlich durchgehenden Konstanz.
  - Observable performance (EN): The learner constructs or analyzes an external force history with positive and negative phases, integrates it vectorially, and distinguishes equality of endpoint total momentum from continuous constancy in time.

**Coverage expectations**

- required expectations: `selected-round-a-core`, `zero-net-impulse-is-an-endpoint-condition`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `system-boundary-choice`: Gesamtes wechselwirkendes System oder nur ein ausgewählter Teilkörper / Complete interacting system or only one selected body
- `external-impulse-history`: Resultierende äußere Kraft während des ganzen Intervalls null; oder zeitlich veränderliche Kraft mit über das Gesamtintervall verschwindendem oder nicht verschwindendem äußeren Kraftstoß. / Net external force zero throughout the interval; or a time-varying force whose integrated external impulse over the full interval is zero or nonzero.
- `interaction-topology-and-frame`: Zwei oder mehrere Körper; alle Größen einer Bilanz in einem gemeinsamen Inertialsystem. Eine frische vollständige Analyse kann anschließend insgesamt in einem anderen Inertialsystem wiederholt werden. / Two or more bodies, with every quantity of a balance in one common inertial frame. A fresh complete analysis may then be repeated as a whole in another inertial frame.

**Application cases**

- `two-cart-collision-and-narrower-system`
  - Task demand (DE): Leite für den Stoß zweier Wagen auf einer horizontalen Bahn die Impulsbilanz aus Newtons zweitem und drittem Axiom in einem gemeinsamen Inertialsystem her. Betrachte für die erste Bilanz dieselben beiden Wagen vor und nach dem Stoß. Wiederhole die Bilanz danach nur für einen Wagen und erkläre die veränderte Rolle der Stoßkraft.
  - Task demand (EN): For a collision of two carts on a horizontal track, derive the momentum balance from Newton’s second and third laws in one common inertial frame. For the first balance consider the same two carts before and after the collision. Then repeat the balance for only one cart and explain the changed role of the collision force.
  - Expected performance (DE): Im Zweier-System heben sich die gleichzeitigen inneren Stoßkräfte paarweise auf. Bei exakt null äußerem Kraftstoß sind die Gesamtimpulse an den Intervallgrenzen exakt gleich; bei nur vernachlässigbarem äußerem Kraftstoß gilt dies näherungsweise. Für einen Wagen ist die Stoßkraft äußerlich und sein Einzelimpuls im Allgemeinen nicht erhalten. Eine verschwindende resultierende äußere Kraft während des gesamten Intervalls begründet zusätzlich fortlaufende Konstanz.
  - Expected performance (EN): In the two-cart system simultaneous internal collision forces cancel pairwise. Exactly zero external impulse gives exact equality of total momentum at the endpoints; merely negligible external impulse gives approximate equality. For one cart the collision force is external and individual momentum is generally not conserved. Zero net external force throughout the interval additionally establishes continuous constancy.
  - Understanding focus (DE): Die Herleitung und ihre Gültigkeit hängen ausdrücklich von der Systemgrenze ab.
  - Understanding focus (EN): The derivation and its validity depend explicitly on the system boundary.
- `opposite-external-pulses-at-different-times`
  - Task demand (DE): Ein fester Satz von Wagen wird in einem gemeinsamen Inertialsystem betrachtet. Äußere Kräfte erzeugen nacheinander zwei gleich große entgegengesetzte Kraftstöße. Leite die Gesamtimpulsänderung über das ganze Intervall und über beide Teilintervalle her und beurteile die Aussage, der Impuls sei durchgehend konstant.
  - Task demand (EN): Consider a fixed set of carts in one common inertial frame. External forces produce two equal and opposite impulses at different times. Derive total momentum change over the full interval and each subinterval, then assess the claim that momentum is constant throughout.
  - Expected performance (DE): Über das Gesamtintervall ist der äußere Kraftstoß null und Anfangs- sowie Endimpuls sind gleich; zwischen den Pulsen ist der Gesamtimpuls verändert. Vektoren und Einheiten N s = kg m/s werden konsistent geführt.
  - Expected performance (EN): Over the full interval the external impulse is zero and initial and final momentum are equal; between the pulses total momentum is different. Vectors and units N s = kg m/s are handled consistently.
  - Understanding focus (DE): Endpunktgleichheit ist schwächer als fortlaufende Erhaltung.
  - Understanding focus (EN): Endpoint equality is weaker than continuous conservation.
