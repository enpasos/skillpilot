# AI review input: Impuls und Newton II – sechs Ziele im aktuellen Kontext

- Book ID: `physics-e2-impuls-newton2-review-20261125-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:b1ead7bf393c12a3d13331cd7bce21f8bca1035e1c8e71711a61159bda8f146c`
- Selected goals: 6

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen

- Full learning-goal ID: `53afbda1-5776-502b-8867-471975d7b766`
- Goal fingerprint: `sha256:f1ea6445c3afa02fe3b46532f677e62543eede49f28c3b4cd837b4253f2e78e6`
- Page fingerprint: `sha256:87052afc4edea667bfbd87f954d48d79a0c147a25d12cb04ac52988224e555bf`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann für zwei Körper, die sich auf derselben Geraden bewegen oder ruhen, eine positive Richtung wählen, aus ihren gegebenen Massen und Geschwindigkeiten zu einem gemeinsamen Zeitpunkt die vorzeichenbehafteten Einzelimpulse bestimmen und diese zum Gesamtimpuls addieren.

### Visualization

/assets/goal-visualizations/physik/53afbda1-5776-502b-8867-471975d7b766/53afbda1-5776-502b-8867-471975d7b766.jpg

- original digest: `sha256:fce0ee0e0774e6a3441820cda52392fe0b385353a32024997428a5eee0fc48b0`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Mittlere resultierende Kraft aus der Impulsänderung bestimmen — `ecbaa101-cb10-5da3-9368-ae40ff587d74` (page 2)
- Impulserhaltung — `839ecc8f-3a60-418b-bc92-64bfeef33824` (page 5)

### Prerequisites outside this book

- Warum Physik? – Weltverständnis & Zukunft — `5c44b9ba-9b05-4774-95d5-073230d3fc4f` (outside this book)
- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Rationale Zahlen multiplizieren und dividieren — `ee48e811-4c9c-5080-9836-8403fc9f0810` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:dce2082597f592d90062dbf8c6777225f5e0683923300e11144f13ce698dd44f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `momentum-sum`
  - Essential understanding (DE): Der Impuls eines Körpers ist seine Masse mal seine gerichtete Geschwindigkeit. Für einen gemeinsamen Zeitpunkt addiert sich der Gesamtimpuls aus den vorzeichenbehafteten Einzelimpulsen. Die positive Richtung ist eine Konvention; eine Achsenumkehr ändert alle Vorzeichen, nicht die physikalische Situation.
  - Essential understanding (EN): An object’s momentum is its mass times its directed velocity. At a common instant, total momentum is the sum of the signed individual momenta. The positive direction is a convention; reversing the axis reverses every sign without changing the physical situation.
  - Observable performance (DE): Die Person wählt und benennt eine Achse, begründet die Vorzeichen aus den Bewegungsrichtungen, berechnet beide Einzelimpulse samt Einheit und addiert sie. Sie deutet auch eine verschwindende Summe bei zwei bewegten Körpern und prüft die Wirkung einer Achsenumkehr.
  - Observable performance (EN): The learner chooses and identifies an axis, justifies signs from the motion directions, calculates both momenta with units and adds them. They also interpret a zero sum for two moving objects and check what happens when the axis is reversed.

**Coverage expectations**

- required expectations: `momentum-sum`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `directions-and-rest`: Gleichgerichtete oder entgegengesetzte Bewegung; ein ruhender Körper. / Motion in the same or opposite directions; one object at rest.
- `coordinate-reversal`: Positive Achse entlang oder entgegen der Bewegung eines Körpers. / Positive axis along or opposite to one object’s motion.

**Application cases**

- `opposite-and-zero`
  - Task demand (DE): Zwei Wagen haben zum selben Zeitpunkt die Massen 0,40 kg und 0,60 kg. Der erste fährt mit 3,0 m/s nach rechts, der zweite mit 2,0 m/s nach links. Wähle eine positive Richtung, bestimme Einzel- und Gesamtimpuls und erkläre, ob Gesamtimpuls null bedeutet, dass beide ruhen. Wiederhole die Vorzeichen bei umgekehrter Achse.
  - Task demand (EN): At one instant two carts have masses 0.40 kg and 0.60 kg. The first moves right at 3.0 m/s and the second left at 2.0 m/s. Choose a positive direction, find individual and total momenta and explain whether zero total momentum means both are at rest. Repeat the signs with the axis reversed.
  - Expected performance (DE): Bei rechtspositiver Achse: +1,20 und −1,20 kg m/s, Summe 0. Die Wagen bewegen sich trotzdem. Bei Achsenumkehr sind die Einzelvorzeichen vertauscht; die Summe bleibt null.
  - Expected performance (EN): With right positive: +1.20 and −1.20 kg m/s, total 0. Both carts are nevertheless moving. Axis reversal reverses the individual signs while the total remains zero.
  - Understanding focus (DE): Vorzeichenbehaftete Summe und gemeinsamer Zeitpunkt; kein Erhaltungssatz nötig.
  - Understanding focus (EN): Signed sum and common instant; no conservation law is needed.
- `moving-and-resting`
  - Task demand (DE): Eine 2,0-kg-Kiste bewegt sich mit 1,5 m/s nach links; eine zweite Kiste mit 5,0 kg ruht daneben. Beide Angaben gelten für denselben Zeitpunkt. Bestimme die Einzelimpulse und den Gesamtimpuls bei positiver Richtung nach rechts und erkläre die Rolle der ruhenden Masse.
  - Task demand (EN): A 2.0-kg box moves left at 1.5 m/s; a second 5.0-kg box is at rest beside it. Both data refer to the same instant. Find both momenta and the total with right positive and explain the role of the stationary mass.
  - Expected performance (DE): −3,0 und 0 kg m/s ergeben −3,0 kg m/s. Eine Masse ohne Geschwindigkeit trägt keinen Impuls bei; Massen werden nicht zuerst addiert und mit nur einer der Geschwindigkeiten multipliziert.
  - Expected performance (EN): −3.0 and 0 kg m/s give −3.0 kg m/s. Mass with zero velocity contributes no momentum; one must not first add masses and multiply by just one of the velocities.
  - Understanding focus (DE): Einzelimpulse aus jeweils zusammengehöriger Masse und Geschwindigkeit bilden.
  - Understanding focus (EN): Pair each mass with its own velocity to form the individual momenta.
## Page 2: Mittlere resultierende Kraft aus der Impulsänderung bestimmen

- Full learning-goal ID: `ecbaa101-cb10-5da3-9368-ae40ff587d74`
- Goal fingerprint: `sha256:ec3d3ce6e0bbe3c7bba8659244ab7935fba73fc37f972ce073e70bcd725cb286`
- Page fingerprint: `sha256:6bb6cee78dab1f84cafdc3ec98904c9aee370074c4f2c3d7d45e6bf325f52827`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann für einen Körper fester Masse auf einer Geraden in einem Inertialsystem aus zwei gegebenen vorzeichenbehafteten Impulswerten und ihren Zeitpunkten die mittlere resultierende äußere Kraft im Intervall als $\Delta p/\Delta t$ berechnen. Sie gibt das Ergebnis in Newton an und deutet sein Vorzeichen bezogen auf die gewählte positive Richtung.

### Visualization

/assets/goal-visualizations/physik/ecbaa101-cb10-5da3-9368-ae40ff587d74/ecbaa101-cb10-5da3-9368-ae40ff587d74.jpg

- original digest: `sha256:724f0d28904e8b8054b8042a7385a62c211ce9ae67be4c13312500bb1cc03c9b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen — `53afbda1-5776-502b-8867-471975d7b766` (page 1)

### Direct reverse prerequisites

- Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen — `059c1adc-e4d2-5222-a923-15abc417d59f` (page 3)

### Prerequisites outside this book

- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4cbdf916f7cabc84c94366d036637d533e1716367244338b7323a16285f3d1c0`
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
  - Task demand (DE): Ein Körper fester Masse bewegt sich auf einer Geraden in einem Inertialsystem. Bei positiver Richtung nach rechts ist p(1 s)=+3 kg m/s und p(3 s)=−1 kg m/s. Die Kraft darf variieren. Bestimme die mittlere resultierende äußere Kraft und beurteile, ob damit ihre Kraft bei t=2 s bekannt ist.
  - Task demand (EN): A fixed-mass object moves along a line in an inertial frame. With right positive, p(1 s)=+3 kg m/s and p(3 s)=−1 kg m/s. The force may vary. Find the average net external force and assess whether this determines the force at t=2 s.
  - Expected performance (DE): Δp=−4 kg m/s, Δt=2 s und mittlere Kraft −2 N nach links. Der momentane Wert bei 2 s ist ohne weiteren Kraft- oder Graphenverlauf nicht bestimmt.
  - Expected performance (EN): Δp=−4 kg m/s, Δt=2 s and average force −2 N to the left. Without further force or graph information the instantaneous value at 2 s is undetermined.
  - Understanding focus (DE): Gerichtete Änderung über ein Intervall und Grenze des Mittelwerts.
  - Understanding focus (EN): Directed interval change and the limitation of an average.
- `negative-but-increasing`
  - Task demand (DE): Für einen anderen Körper fester Masse auf derselben Geraden im Inertialsystem sind p(4 s)=−6 kg m/s und p(7 s)=−3 kg m/s gegeben. Rechts ist positiv. Bestimme die mittlere resultierende äußere Kraft und erkläre, wie ihre Richtung mit der weiterhin nach links gerichteten Bewegung zusammenpasst.
  - Task demand (EN): For another fixed-mass object moving along the same line in an inertial frame, p(4 s)=−6 kg m/s and p(7 s)=−3 kg m/s. Right is positive. Find the average net external force and explain how its direction is compatible with continued leftward motion.
  - Expected performance (DE): Δp=+3 kg m/s, Δt=3 s und mittlere Kraft +1 N nach rechts. Negativer Impuls nimmt im Betrag ab; die Kraftrichtung muss nicht der Bewegungsrichtung entsprechen.
  - Expected performance (EN): Δp=+3 kg m/s, Δt=3 s and average force +1 N to the right. Negative momentum decreases in magnitude; force need not point along the motion.
  - Understanding focus (DE): Vorzeichen der Impulsänderung von dem des vorhandenen Impulses unterscheiden.
  - Understanding focus (EN): Distinguish the sign of momentum change from that of existing momentum.
## Page 3: Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen

- Full learning-goal ID: `059c1adc-e4d2-5222-a923-15abc417d59f`
- Goal fingerprint: `sha256:e61ea1dc37a11fbf944f6a70c2e7995df9d5144ba7c89889f99196f2776f9da8`
- Page fingerprint: `sha256:6e84fb3312e8ee0ed7baf53adc24ace6969743b1994b77ac263a5b34165ae386`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann für eine geradlinige Bewegung eines Körpers fester Masse in einem Inertialsystem die Tangentensteigung am Impuls-Zeit-Graphen als momentane resultierende äußere Kraft $F_{\mathrm{res}}(t)=\mathrm{d}p/\mathrm{d}t$ deuten und ihren Wert am markierten Zeitpunkt aus einer eingezeichneten Tangente mit Vorzeichen und Einheit näherungsweise bestimmen.

### Visualization

/assets/goal-visualizations/physik/059c1adc-e4d2-5222-a923-15abc417d59f/059c1adc-e4d2-5222-a923-15abc417d59f.jpg

- original digest: `sha256:851b2f3779e77c7ad879d20578530a0abac10318e83642bfc13057429aaf0eab`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Mittlere resultierende Kraft aus der Impulsänderung bestimmen — `ecbaa101-cb10-5da3-9368-ae40ff587d74` (page 2)

### Direct reverse prerequisites

- Impulserhaltung aus Newtonschen Axiomen (LK) — `f524f05c-4456-4fc3-a1f7-f40741fc1f16` (page 6)

### Prerequisites outside this book

- Ableitung als Steigung im Punkt deuten — `b1dcc191-d046-50de-984a-ee5c17157628` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a647348e293d5e670ea2022dde0b0970ab7a4669d26f37936de5a25fd0e06547`
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
  - Task demand (DE): Ein gezeichnetes p(t)-Diagramm beschreibt einen Körper fester Masse auf einer Geraden im Inertialsystem; rechts ist positiv. Am markierten Zeitpunkt t=2 s ist p=−4 kg m/s. Die eingezeichnete Tangente geht durch die ablesbaren Punkte (1 s,−7 kg m/s) und (3 s,−1 kg m/s). Bestimme näherungsweise die momentane resultierende Kraft und erkläre die Bewegungs- und Kraftrichtung.
  - Task demand (EN): A drawn p(t) graph describes a fixed-mass object moving along a line in an inertial frame; right is positive. At the marked instant t=2 s, p=−4 kg m/s. The drawn tangent passes through the readable points (1 s,−7 kg m/s) and (3 s,−1 kg m/s). Estimate the instantaneous net force and explain the motion and force directions.
  - Expected performance (DE): Die Tangentensteigung ist (+6 kg m/s)/(2 s)=+3 N. Die Bewegung ist momentan nach links, die resultierende Kraft nach rechts. Die beiden gewählten Punkte gehören zur Tangente und müssen nicht Punkte des gekrümmten Graphen sein.
  - Expected performance (EN): The tangent slope is (+6 kg m/s)/(2 s)=+3 N. Motion is currently leftward while net force points right. The selected points lie on the tangent and need not lie on the curved graph.
  - Understanding focus (DE): Eine Steigung in eine lokale Kraftaussage übersetzen; Graphenhöhe und Steigung trennen.
  - Understanding focus (EN): Translate a slope into a local force statement; distinguish graph height from slope.
- `tangent-versus-secant`
  - Task demand (DE): In einem zweiten gezeichneten p(t)-Diagramm für einen Körper fester Masse im Inertialsystem sind die Graphenpunkte (0 s,0 kg m/s), (1 s,3 kg m/s), (2 s,4 kg m/s) und eine waagerechte Tangente bei t=2 s eingezeichnet. Bestimme dort die momentane resultierende Kraft. Vergleiche mit der mittleren Kraft im Intervall von 0 bis 2 s und begründe, warum die Werte verschieden sind.
  - Task demand (EN): A second drawn p(t) graph for a fixed-mass object in an inertial frame shows graph points (0 s,0 kg m/s), (1 s,3 kg m/s), (2 s,4 kg m/s) and a horizontal tangent at t=2 s. Find the instantaneous net force there. Compare with the average force from 0 to 2 s and explain why the values differ.
  - Expected performance (DE): Waagerechte Tangente: momentane Kraft näherungsweise 0 N bei 2 s; Sekante: mittlere Kraft +2 N. Der von null verschiedene Impuls von 4 kg m/s verlangt keine momentane Kraft. Lokale und über das Intervall gemittelte Änderung sind verschieden.
  - Expected performance (EN): Horizontal tangent: instantaneous force approximately 0 N at 2 s; secant: average force +2 N. Nonzero momentum of 4 kg m/s does not require instantaneous force. Local change differs from interval-average change.
  - Understanding focus (DE): Momentane Kraft, mittlere Kraft und Impuls sind drei unterscheidbare Größen.
  - Understanding focus (EN): Instantaneous force, average force and momentum are three distinct quantities.
## Page 4: Newtons 2. Axiom (Grundgleichung der Mechanik)

- Full learning-goal ID: `a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20`
- Goal fingerprint: `sha256:a2d4281e86aaa23eafd1374d1fe2fdec66e04e0aab3c66742b70fe2c17ddd445`
- Page fingerprint: `sha256:b34b15836ac43821ba592e88965a5d17c0c8a0098a5458a88f8ca93d6290ca9e`
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

Status: `needs_human_review`; profile fingerprint: `sha256:827b16c706c356cfe8451247dc4707646e584d0fb70148f266bddb5dee0f5a08`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `net-force-mass-acceleration`
  - Essential understanding (DE): Für einen Körper konstanter Masse in einem Inertialsystem gilt: Die Beschleunigung hat den Betrag F_res/m und bei von null verschiedenem Wert die Richtung der resultierenden äußeren Kraft. Die Richtung der vorhandenen Geschwindigkeit ist davon zu unterscheiden. Resultierende null bedeutet Beschleunigung null, auch bei Bewegung.
  - Essential understanding (EN): For a constant-mass object in an inertial frame, acceleration has magnitude F_net/m and, when nonzero, the direction of the net external force. This differs from the direction of existing velocity. Zero net force means zero acceleration even during motion.
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
## Page 5: Impulserhaltung

- Full learning-goal ID: `839ecc8f-3a60-418b-bc92-64bfeef33824`
- Goal fingerprint: `sha256:3b201c5d47c8de0521c67d3f3c0935441c5cbdd1a406ba637bec59461701a812`
- Page fingerprint: `sha256:6b213f038db1b0f0c76380626557639d48e4e1566652a2757133e22e4865f39f`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann in einem abgegrenzten System ohne resultierenden äußeren Kraftstoß den Gesamtimpuls als vektorielle Erhaltungsgröße nutzen und einfache Rückstoßsituationen damit qualitativ begründen.

### Visualization

/assets/goal-visualizations/physik/839ecc8f-3a60-418b-bc92-64bfeef33824/839ecc8f-3a60-418b-bc92-64bfeef33824.jpg

- original digest: `sha256:868e3c4ae01e72b7d8bcbf82d54f3785279c7d769f1948c9f8e43d11508e3ee1`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen — `53afbda1-5776-502b-8867-471975d7b766` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Grundgleichung der Mechanik anwenden — `5f289cdc-fda1-4058-b44f-041ba1398e79` (outside this book)
- Newtons 3. Axiom anwenden — `a0aaedcb-41f8-4891-af77-a69a76b8c10d` (outside this book)

### Direct reverse prerequisites outside this book

- Kraftstoß — `e790de73-f8e5-4027-bc05-9f12a0e8c9cb` (outside this book)
- Inelastische Stöße — `0da13365-02c2-44f1-8a81-d524ca0ac3ae` (outside this book)
- Einfache Stossvorgaenge mit Impuls- und Energieerhaltung analysieren — `2eecd0e2-a7ca-4568-9b12-3d47706c65fb` (outside this book)
- Elastische Stöße — `d168ae5d-f36f-4ad4-b070-d5931f8d70d1` (outside this book)
- Drehimpuls als Erhaltungsgröße — `37f17e7e-9fcf-5dca-ac10-e94cb8420be5` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:cb7cafb1a173dc8eee6ba40fcabc1b12e8b58a73c4884c44c403f6c73a65e129`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `selected-blind-review-core`
  - Essential understanding (DE): Der vektorielle Gesamtimpuls eines abgegrenzten Systems bleibt erhalten, wenn der resultierende äußere Kraftstoß null ist; innere Wechselwirkungen verteilen Impuls zwischen den Systemteilen um, ändern aber nicht die Vektorsumme, sodass Rückstoßrichtungen zusammenpassen müssen.
  - Essential understanding (EN): The vector total momentum of a defined system is conserved when the net external impulse is zero; internal interactions redistribute momentum among the system's parts but do not change the vector sum, so recoil directions must be mutually consistent.
  - Observable performance (DE): Die lernende Person legt in einer einfachen Rückstoßsituation das System und eine positive Richtung fest, ordnet den Teilimpulsen Vorzeichen oder Vektoren zu, vergleicht die Gesamtimpulse vor und nach der Wechselwirkung und begründet daraus selbstständig Rückstoßrichtung und den qualitativen Einfluss unterschiedlicher Massen.
  - Observable performance (EN): In a simple recoil situation, the learner defines the system and a positive direction, assigns signs or vectors to the component momenta, compares total momentum before and after the interaction, and independently justifies the recoil direction and the qualitative effect of unequal masses.
- `equal-opposite-momenta-do-not-imply-equal-speeds`
  - Essential understanding (DE): Bei einem eindimensionalen Zweikörper-Rückstoß aus der Ruhe sind die beiden Teilimpulse gleich groß und entgegengesetzt gerichtet. Bei ungleichen Massen sind daher die Geschwindigkeitsbeträge verschieden; der leichtere Körper erhält den größeren Betrag.
  - Essential understanding (EN): In a one-dimensional two-body recoil from rest, the two component momenta have equal magnitudes and opposite directions. Unequal masses therefore produce different speed magnitudes, with the lighter body receiving the greater magnitude.
  - Observable performance (DE): Die lernende Person prognostiziert für zwei gegebene Massen die Rückstoßrichtungen und das Verhältnis der Geschwindigkeitsbeträge, prüft vorgeschlagene oder gemessene Werte mit einer vorzeichenbehafteten Impulsbilanz samt Einheit und beurteilt ihre Plausibilität.
  - Observable performance (EN): For two given masses, the learner predicts recoil directions and the ratio of speed magnitudes, checks proposed or measured values using a signed momentum balance with units, and judges their plausibility.

**Coverage expectations**

- required expectations: `selected-blind-review-core`, `equal-opposite-momenta-do-not-imply-equal-speeds`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `initial-total-momentum`: Eindimensionales System anfangs in Ruhe oder mit von null verschiedenem Gesamtimpuls / One-dimensional system initially at rest or with nonzero total momentum
- `mass-ratio`: Gleiche oder ungleiche Massen der beiden Rückstoßkörper / Equal or unequal masses of the two recoiling bodies
- `system-and-external-impulse`: Vollständiges System, ausgelassener Teil oder kleiner messbarer äußerer Kraftstoß / Complete system, omitted component, or a small measurable external impulse

**Application cases**

- `astronaut-tool-recoil`
  - Task demand (DE): Eine Astronautin und ein Werkzeugpaket driften gemeinsam mit von null verschiedenem Impuls. Nach dem Abstoßen ist die Geschwindigkeit des Pakets gegeben. Lege das System und die positive Richtung fest und bestimme Richtung und Geschwindigkeit der Astronautin.
  - Task demand (EN): An astronaut and a tool package drift together with nonzero momentum. After the package is pushed away, its velocity is given. Define the system and positive direction and determine the astronaut's direction and velocity.
  - Expected performance (DE): Anfangsimpuls, Teilimpulse und Einheiten kg m/s werden vorzeichenrichtig bilanziert; ungleiche Massen führen zu unterschiedlichen Geschwindigkeitsänderungen, ohne dass der Einzelimpuls erhalten sein muss.
  - Expected performance (EN): Initial momentum, component momenta, and units of kg m/s are balanced with correct signs; unequal masses lead to different velocity changes without requiring either individual momentum to be conserved.
  - Understanding focus (DE): Gesamtimpuls bleibt erhalten, Einzelimpulse werden durch innere Wechselwirkung umverteilt.
  - Understanding focus (EN): Total momentum is conserved while internal interaction redistributes component momenta.
- `two-carts-spring-recoil`
  - Task demand (DE): Zwei Wagen unterschiedlicher Masse stehen auf einer geraden reibungsarmen Bahn und stoßen sich durch eine zuvor zusammengedrückte Feder voneinander ab. Prognostiziere vor dem Lösen ihre Richtungen und welcher Wagen den größeren Geschwindigkeitsbetrag erhält. Prüfe anschließend gegebene oder gemessene Geschwindigkeiten mit einer eindimensionalen Impulsbilanz.
  - Task demand (EN): Two carts of different masses stand on a straight low-friction track and push apart through a previously compressed spring. Before release, predict their directions and which cart receives the greater speed magnitude. Then check supplied or measured velocities using a one-dimensional momentum balance.
  - Expected performance (DE): Die Richtungen werden entgegengesetzt prognostiziert; für das anfangs ruhende Gesamtsystem wird p1 + p2 näherungsweise null geprüft, wobei der leichtere Wagen den größeren Geschwindigkeitsbetrag hat. Einheit, Vorzeichen, Systemabgrenzung und begrenzte Messabweichungen werden plausibel berücksichtigt.
  - Expected performance (EN): Opposite directions are predicted; for the initially stationary total system, p1 + p2 is checked to be approximately zero, with the lighter cart having the greater speed magnitude. Units, signs, system boundary, and bounded measurement discrepancies are handled plausibly.
  - Understanding focus (DE): Ein einfacher Zweikörper-Rückstoß wird qualitativ erklärt und mit einer angemessenen Impulsbilanz geprüft.
  - Understanding focus (EN): A simple two-body recoil is explained qualitatively and checked with an appropriate momentum balance.
## Page 6: Impulserhaltung aus Newtonschen Axiomen (LK)

- Full learning-goal ID: `f524f05c-4456-4fc3-a1f7-f40741fc1f16`
- Goal fingerprint: `sha256:a037c48de3259664d4079a953bb464ade1b34c1c51d049034c61ca23c41bc17d`
- Page fingerprint: `sha256:c37fe4910327bb876fc9cd621fe34d410490ca951b9809df315f83c62e9f2f79`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann in einem Inertialsystem für ein materiell abgeschlossenes System aus Newtons zweitem und drittem Axiom herleiten, dass der Gesamtimpuls bei verschwindendem resultierendem äußerem Kraftstoß an den Intervallgrenzen gleich ist, und die Voraussetzungen für seine fortlaufende Erhaltung diskutieren.

### Visualization

/assets/goal-visualizations/physik/f524f05c-4456-4fc3-a1f7-f40741fc1f16/f524f05c-4456-4fc3-a1f7-f40741fc1f16.jpg

- original digest: `sha256:13b13ebf327ce3545960b7f979bc46c5608b66c0d31958740008328e78ef35c9`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen — `059c1adc-e4d2-5222-a923-15abc417d59f` (page 3)

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

Status: `needs_human_review`; profile fingerprint: `sha256:3ddc6c4974469577c8bcc881ed9ba77e12048fd945159875b34b0bdab88dd6d5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `proof`

**Positive understanding expectations**

- `selected-round-a-core`
  - Essential understanding (DE): Für ein materiell abgeschlossenes System im Inertialsystem ergibt das Summieren von Newtons zweitem Axiom über alle Körper die Änderung des vektoriellen Gesamtimpulses. Nach Newtons drittem Axiom heben sich die inneren Wechselwirkungskräfte paarweise auf, sodass nur der resultierende äußere Kraftstoß die Gesamtimpulsänderung bestimmt: $\Delta\vec P=\vec J_\mathrm{ext}$. Ein verschwindender äußerer Kraftstoß liefert gleichen Gesamtimpuls an den Intervallgrenzen; konstante Impulserhaltung zu jedem Zeitpunkt verlangt eine verschwindende resultierende äußere Kraft während des gesamten betrachteten Ablaufs.
  - Essential understanding (EN): For a materially closed system in an inertial frame, summing Newton's second law over all bodies gives the change in vector total momentum. By Newton's third law, the internal interaction forces cancel pairwise, so only the net external impulse determines the change in total momentum: $\Delta\vec P=\vec J_\mathrm{ext}$. Zero external impulse gives equal total momentum at the endpoints of the interval; constant momentum at every instant requires zero net external force throughout the process considered.
  - Observable performance (DE): Die lernende Person legt für ein Mehrkörpersystem Systemgrenze und Zeitintervall fest, klassifiziert Kräfte als innerlich oder äußerlich, summiert die Impulsgleichungen und zeigt nachvollziehbar die paarweise Aufhebung der inneren Kräfte. Sie leitet daraus $\Delta\vec P=\vec J_\mathrm{ext}$ her, prüft Vektorrichtungen und Einheiten und formuliert präzise, unter welchen Voraussetzungen der Gesamtimpuls zwischen zwei Zuständen beziehungsweise fortlaufend erhalten ist.
  - Observable performance (EN): For a multi-body system, the learner defines the system boundary and time interval, classifies forces as internal or external, sums the momentum equations, and explicitly shows the pairwise cancellation of internal forces. The learner derives $\Delta\vec P=\vec J_\mathrm{ext}$, checks vector directions and units, and states precisely the conditions under which total momentum is conserved between two states or continuously.
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
- `external-impulse-history`: Zu jeder Zeit null, nur über das Gesamtintervall null oder eindeutig von null verschieden / Zero at every instant, zero only over the full interval, or clearly nonzero
- `interaction-topology-and-frame`: Zwei oder mehrere Körper in verschiedenen Inertialsystemen und mit unterschiedlichen inneren Wechselwirkungen / Two or more bodies in different inertial frames and with different internal interactions

**Application cases**

- `two-cart-collision-and-narrower-system`
  - Task demand (DE): Leite für den Stoß zweier Wagen auf einer horizontalen Bahn die Impulsbilanz aus Newtons zweitem und drittem Axiom her. Wiederhole die Bilanz danach nur für einen Wagen und erkläre die veränderte Rolle der Stoßkraft.
  - Task demand (EN): For a collision of two carts on a horizontal track, derive the momentum balance from Newton's second and third laws. Then repeat the balance for only one cart and explain the changed role of the collision force.
  - Expected performance (DE): Im Zweier-System heben sich die gleichzeitigen inneren Stoßkräfte paarweise auf, sodass bei vernachlässigbarem äußerem Kraftstoß der Gesamtimpuls erhalten ist. Für einen Wagen ist die Stoßkraft äußerlich und sein Einzelimpuls im Allgemeinen nicht erhalten.
  - Expected performance (EN): In the two-cart system, simultaneous internal collision forces cancel pairwise, so total momentum is conserved when external impulse is negligible. For one cart, the collision force is external and its individual momentum is generally not conserved.
  - Understanding focus (DE): Die Herleitung und ihre Gültigkeit hängen ausdrücklich von der Systemgrenze ab.
  - Understanding focus (EN): The derivation and its validity depend explicitly on the system boundary.
- `opposite-external-pulses-at-different-times`
  - Task demand (DE): Auf ein abgeschlossen betrachtetes Wagensystem wirken nacheinander zwei gleich große entgegengesetzte äußere Kraftstöße. Leite die Gesamtimpulsänderung über das ganze Intervall und über beide Teilintervalle her und beurteile die Aussage Impuls bleibt erhalten.
  - Task demand (EN): A system of carts receives two equal and opposite external impulses at different times. Derive the total momentum change over the full interval and over each subinterval, then assess the statement momentum remains conserved.
  - Expected performance (DE): Über das Gesamtintervall ist der äußere Kraftstoß null und Anfangs- sowie Endimpuls sind gleich; zwischen den Pulsen ist der Gesamtimpuls verändert. Vektoren und Einheiten N s = kg m/s werden konsistent geführt.
  - Expected performance (EN): Over the full interval the external impulse is zero and initial and final momentum are equal; between the pulses total momentum is different. Vectors and units N s = kg m/s are handled consistently.
  - Understanding focus (DE): Endpunktgleichheit ist schwächer als fortlaufende Erhaltung.
  - Understanding focus (EN): Endpoint equality is weaker than continuous conservation.
