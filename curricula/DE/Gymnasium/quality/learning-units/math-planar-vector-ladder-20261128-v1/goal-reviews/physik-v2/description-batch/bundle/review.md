# AI review input: Physik: neue Vektorrouten

- Book ID: `v1-planar-vector-physik-20261128-v2-selected`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:958b6d069b8efcf7f09d0a421a6cb048ec68f9008710da893a5e7930735b70ff`
- Selected goals: 9

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Kräfte vektoriell zusammensetzen und Resultierende bestimmen

- Full learning-goal ID: `41d35667-0296-5f84-bc12-202ffc440be0`
- Goal fingerprint: `sha256:adb241e4277a0d42f8e36a57ab1adb9e796fe465327271e4b885aa344760fe87`
- Page fingerprint: `sha256:efc5bec067ab8bad65cdeb572951f90fde504e42e8e3c3b18be985ec62966d31`
- Topic path: Physik

### Canonical description

Die lernende Person kann mehrere an einem Körper angreifende Kräfte maßstäblich als Vektoren darstellen, grafisch zu einer resultierenden Kraft zusammensetzen und deren Betrag und Richtung im Kontext deuten.

### Visualization

/assets/goal-visualizations/physik/41d35667-0296-5f84-bc12-202ffc440be0/41d35667-0296-5f84-bc12-202ffc440be0.png

- original digest: `sha256:f631200a4f5f4ae96f42202013fe2f27735707ad5262c1b1eaca4ec9d780de23`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einfache proportionale Sachaufgaben mit Dreisatz lösen — `596345cd-679e-5c7b-955f-e8cb1ec81e96` (outside this book)
- Verschiebungen zeichnen und verketten — `06194412-59dc-5768-96e0-71ca206b473c` (outside this book)
- Kräfte und Trägheit qualitativ erklären — `5ea765ac-c279-551a-8a94-a07da2381e5b` (outside this book)
- Pfeile für gerichtete Größen lesen und zeichnen — `b77a7e93-22f9-5722-a4cc-f18a149ab030` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Kräfte an einer Aufhängung vektoriell bilanzieren — `8f62ab5e-20fc-562f-8121-63c082313e6e` (outside this book)
- Prüfungsaufgabe: Kräfte experimentell und grafisch untersuchen — `d8bad724-03ea-510a-8415-928332ed4979` (outside this book)
- Arbeit und einfache Maschinen qualitativ deuten — `327302e3-5b36-46f8-9c16-73f24583b0eb` (outside this book)
- Die Gewichtskraft am Hang zeichnerisch zerlegen — `77b44d13-4368-5950-a943-decb377c7302` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0cb6e2b4b04ad56ac769ef7f0eceed7c9914435020a2fee1bf23105e70f45d69`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `force-vector-encoding`
  - Essential understanding (DE): Ein Kraftpfeil codiert Betrag durch seine maßstäbliche Länge und Richtung durch seine Orientierung; Kräfte dürfen nur dann wie Skalare addiert werden, wenn ihre Richtungen dies rechtfertigen.
  - Essential understanding (EN): A force arrow encodes magnitude by its scale length and direction by its orientation; forces may be added as scalars only when their directions justify it.
  - Observable performance (DE): Die lernende Person wählt einen Kraftmaßstab, zeichnet mehrere Kräfte an einem unbekannten Körper mit korrekten Längen und Richtungen und liest Beträge mit Einheit zurück.
  - Observable performance (EN): The learner chooses a force scale, draws several forces on an unfamiliar object with correct lengths and directions, and reads magnitudes back with units.
- `resultant-construction-and-meaning`
  - Essential understanding (DE): Die Resultierende ist die Vektorsumme aller Kräfte und bestimmt die translatorische Bewegungsänderung des Körpers; mögliche Drehwirkungen lassen sich ohne zusätzliche Angaben zu Angriffspunkten und Wirkungslinien nicht aus ihr allein bestimmen. Bei entgegengesetzten gleich großen Kräften ist die Resultierende null, obwohl einzelne Kräfte wirken.
  - Essential understanding (EN): The resultant is the vector sum of all forces and determines the object's translational change of motion; possible rotational effects cannot be determined from it alone without additional information about points and lines of action. For equal opposing forces, the resultant is zero even though individual forces still act.
  - Observable performance (DE): Die lernende Person konstruiert die Resultierende grafisch, deutet Betrag und Richtung für die translatorische Bewegungsänderung und widerlegt sowohl die Gleichsetzung von Resultierende null mit Kraftfreiheit als auch eine unbegründete Aussage zur Drehung.
  - Observable performance (EN): The learner constructs the resultant graphically, interprets its magnitude and direction for translational change of motion, and refutes both equating zero resultant with absence of forces and making an unsupported claim about rotation.

**Coverage expectations**

- required expectations: `force-vector-encoding`, `resultant-construction-and-meaning`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `force-angle`: Gleichgerichtete, entgegengesetzte oder winklige Kräfte / Codirectional, opposite, or angled forces
- `resultant-state`: Resultierende ungleich null oder null mit ausdrücklich benannter Grenze für Drehwirkungen / Nonzero or zero resultant with an explicitly stated limit concerning rotational effects

**Application cases**

- `scaled-two-rope-resultant`
  - Task demand (DE): Zwei Seile ziehen einen Ring mit 30 N nach Osten und 40 N nach Norden. Die Kräfte und Resultierende sind im Maßstab 1 cm : 10 N zu konstruieren.
  - Task demand (EN): Two ropes pull a ring with 30 N east and 40 N north. Construct the forces and resultant at a scale of 1 cm : 10 N.
  - Expected performance (DE): Die lernende Person zeichnet 3-cm- und 4-cm-Pfeil, schließt das Vektordreieck zu 5 cm nach Nordost und deutet 50 N mit Richtung statt 70 N.
  - Expected performance (EN): The learner draws 3 cm and 4 cm arrows, closes the vector triangle to 5 cm northeast, and interprets 50 N with direction rather than 70 N.
  - Understanding focus (DE): Maßstab und nichtkollineare Vektoraddition verhindern bloße Betragsaddition.
  - Understanding focus (EN): Scale and non-collinear vector addition prevent mere addition of magnitudes.
- `balanced-forces-countercase`
  - Task demand (DE): An einem Ring greifen am selben Punkt zwei kollineare Kräfte von jeweils 25 N nach links beziehungsweise rechts an. Resultierende und Aussage „Es wirkt keine Kraft“ sind zu beurteilen.
  - Task demand (EN): Two collinear forces of 25 N act at the same point on a ring, one to the left and one to the right. Evaluate the resultant and the statement “No force acts.”
  - Expected performance (DE): Die lernende Person erhält die Resultierende 0 N, zeigt beide weiterhin vorhandenen Kraftpfeile und erklärt, dass daraus keine translatorische Bewegungsänderung folgt, der Ring aber nicht kraftfrei ist.
  - Expected performance (EN): The learner obtains a resultant of 0 N, shows both forces still acting, and explains that no translational change of motion follows while the ring is not force-free.
  - Understanding focus (DE): Der Grenzfall trennt Nullresultierende von Kraftfreiheit, ohne aus der Vektorsumme allein eine Aussage über Drehwirkungen abzuleiten.
  - Understanding focus (EN): The limiting case separates zero resultant from absence of forces without inferring rotational effects from the vector sum alone.
## Page 2: Impulserhaltung aus Newtonschen Axiomen (LK)

- Full learning-goal ID: `f524f05c-4456-4fc3-a1f7-f40741fc1f16`
- Goal fingerprint: `sha256:a037c48de3259664d4079a953bb464ade1b34c1c51d049034c61ca23c41bc17d`
- Page fingerprint: `sha256:8482c68c341a8a22459169b50da4b5b89175cd244b60f7a45c4fa4c9f544ff4b`
- Topic path: Physik

### Canonical description

Die lernende Person kann in einem Inertialsystem für ein materiell abgeschlossenes System aus Newtons zweitem und drittem Axiom herleiten, dass der Gesamtimpuls bei verschwindendem resultierendem äußerem Kraftstoß an den Intervallgrenzen gleich ist, und die Voraussetzungen für seine fortlaufende Erhaltung diskutieren.

### Visualization

/assets/goal-visualizations/physik/f524f05c-4456-4fc3-a1f7-f40741fc1f16/f524f05c-4456-4fc3-a1f7-f40741fc1f16.jpg

- original digest: `sha256:13b13ebf327ce3545960b7f979bc46c5608b66c0d31958740008328e78ef35c9`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Integralterme interpretieren und begründen — `34604a97-0c64-5b06-81e2-6ac818732d60` (outside this book)
- Newtons 3. Axiom anwenden — `a0aaedcb-41f8-4891-af77-a69a76b8c10d` (outside this book)
- Grundgleichung der Mechanik anwenden — `5f289cdc-fda1-4058-b44f-041ba1398e79` (outside this book)
- Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen — `059c1adc-e4d2-5222-a923-15abc417d59f` (outside this book)

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
## Page 3: Bezugssysteme und Geschwindigkeitsüberlagerung

- Full learning-goal ID: `68c90ba6-c438-463c-9a53-cf61062d416a`
- Goal fingerprint: `sha256:1a8df2f516b4dd0164c664f2b6145cc196613a01378b47b1c240aef736207f1e`
- Page fingerprint: `sha256:48bb5024c6612ff3f6ea4bad5b188343635bbcb20e37a1d54888291de359dbe6`
- Topic path: Physik

### Canonical description

Die lernende Person kann für eine Bewegung ein geeignetes Bezugssystem wählen und Relativgeschwindigkeiten vektoriell überlagern, um die resultierende Bewegung zu bestimmen und zu erklären.

### Visualization

/assets/goal-visualizations/physik/68c90ba6-c438-463c-9a53-cf61062d416a/68c90ba6-c438-463c-9a53-cf61062d416a.jpg

- original digest: `sha256:b30fc73b54dc509102b84ff73b77952f2933fc11546738b96cd9b592e1434b3f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Geschwindigkeit beim waagerechten Wurf als Vektor bestimmen — `0fee53f2-1c02-5b12-9b6c-aa9fa462d921` (page 4)

### Prerequisites outside this book

- Verschiebungen zeichnen und verketten — `06194412-59dc-5768-96e0-71ca206b473c` (outside this book)
- Gleichförmige Bewegung und Geschwindigkeit — `971beafa-6ba5-4c82-ac8b-7ebf66eec3dd` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9b7aba22c3fdd8601f71e89fc6b3f6e471f1c5dd30bbe741d226278c80e38594`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `frame-choice-and-relative-quantity`
  - Essential understanding (DE): Eine Geschwindigkeit beschreibt die Bewegung eines Körpers relativ zu einem gewählten Bezugssystem. Welche Geschwindigkeit erklärt werden soll, bestimmt daher, welche Körper, Beobachter und Bezugssysteme unterschieden und welcher Bezug begründet gewählt werden müssen.
  - Essential understanding (EN): A velocity describes the motion of a body relative to a chosen reference frame. The velocity to be explained therefore determines which bodies, observers, and frames must be distinguished and which reference must be chosen with justification.
  - Observable performance (DE): Die lernende Person kennzeichnet in einer neuen Bewegungssituation die beteiligten Körper und Bezugssysteme, formuliert die gesuchte relative Geschwindigkeit und wählt ein Bezugssystem, dessen Eignung sie für diese Frage begründet.
  - Observable performance (EN): In a new motion situation, the learner identifies the bodies and reference frames involved, states the relative velocity being sought, and chooses a frame whose suitability is justified for that question.
- `directed-vector-combination`
  - Essential understanding (DE): Relativgeschwindigkeiten sind gerichtete Größen. Die Geschwindigkeit eines Körpers in einem gewählten Bezugssystem ergibt sich aus einer konsistent gerichteten Vektor- oder Komponentenüberlagerung, sodass Vorzeichen, Richtung und Betrag zur beschriebenen Bewegung passen müssen.
  - Essential understanding (EN): Relative velocities are directed quantities. The velocity of a body in a chosen frame results from a consistently directed vector or component combination, so sign, direction, and magnitude must fit the motion being described.
  - Observable performance (DE): Die lernende Person konstruiert oder erläutert passende Geschwindigkeitsvektoren beziehungsweise Komponenten, überlagert sie nachvollziehbar und prüft das Ergebnis durch eine qualitative Richtungsprognose und eine Erklärung aus dem gewählten Bezugssystem.
  - Observable performance (EN): The learner constructs or explains suitable velocity vectors or components, combines them transparently, and checks the result through a qualitative direction prediction and an explanation from the chosen reference frame.
- `changed-observer-transfer`
  - Essential understanding (DE): Bei einem Wechsel des Beobachterbezugs oder bei nicht parallelen Bewegungen muss die Bewegungsbeschreibung neu aus den relativen Vektoren aufgebaut werden. Unterschiedliche Geschwindigkeitsangaben sind dann verschiedene, jeweils konsistente Beschreibungen derselben Bewegung und kein Widerspruch.
  - Essential understanding (EN): When the observer frame changes or the motions are not parallel, the motion description must be rebuilt from the relative vectors. Different velocity statements are then different, internally consistent descriptions of the same motion rather than a contradiction.
  - Observable performance (DE): Für einen veränderten Beobachter oder eine zweidimensionale Bewegungsanordnung sagt die lernende Person zunächst die erwartete Bewegungsrichtung voraus, bestimmt anschließend die resultierende Geschwindigkeit und erklärt, warum sich ihre Beschreibung gegenüber einem anderen Bezugssystem ändert.
  - Observable performance (EN): For a changed observer or a two-dimensional motion arrangement, the learner first predicts the expected direction of motion, then determines the resulting velocity and explains why its description changes relative to another reference frame.

**Coverage expectations**

- required expectations: `frame-choice-and-relative-quantity`, `directed-vector-combination`, `changed-observer-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `observer-frame`: Ufer-, Fahrzeug- oder mitbewegtes Bezugssystem mit jeweils anderer gesuchter Relativgeschwindigkeit / Shore, vehicle, or co-moving reference frame with a different relative velocity sought in each case
- `motion-geometry`: Parallele Bewegungen auf einer Linie oder nicht parallele Bewegungen mit zwei Komponenten / Parallel motions on one line or non-parallel motions with two components
- `available-representation`: Verbale Situationsbeschreibung, Vektorskizze oder tabellarisch gegebene Komponenten, die erst einer Bewegungsbeschreibung zugeordnet werden müssen / Verbal situation description, vector sketch, or tabulated components that must first be assigned to a motion description

**Application cases**

- `walker-on-moving-train`
  - Task demand (DE): Ein Zug fährt gleichförmig mit 18 m/s nach Osten. Eine Person geht im Zug mit 1,5 m/s nach Osten. Beschreibe die Geschwindigkeit der Person aus Sicht des Zuges und aus Sicht des Bodens, kennzeichne die Bezugssysteme und begründe die jeweilige Vektorüberlagerung.
  - Task demand (EN): A train travels uniformly eastward at 18 m/s. A person walks eastward in the train at 1.5 m/s. Describe the person's velocity from the train and ground frames, identify the reference frames, and justify the vector combination in each case.
  - Expected performance (DE): Die lernende Person trennt Gehgeschwindigkeit relativ zum Zug und Zuggeschwindigkeit relativ zum Boden, ordnet beide gerichteten Größen derselben Ost-Richtung zu, bestimmt 1,5 m/s beziehungsweise 19,5 m/s in den passenden Bezugssystemen und erklärt, warum beide Angaben gleichzeitig zutreffen.
  - Expected performance (EN): The learner separates walking velocity relative to the train from train velocity relative to the ground, assigns both directed quantities to the same eastward direction, determines 1.5 m/s and 19.5 m/s in the appropriate frames, and explains why both statements are simultaneously valid.
  - Understanding focus (DE): Der lineare Fall prüft die explizite Referenzwahl und die Bedeutung der relativen Größen, nicht bloß eine Addition ohne Bezug.
  - Understanding focus (EN): The one-dimensional case tests explicit frame selection and the meaning of relative quantities, not merely addition without a reference.
- `boat-crossing-current`
  - Task demand (DE): Ein Boot fährt relativ zum Wasser mit 3,0 m/s nach Norden. Das Wasser strömt relativ zum Ufer mit 2,0 m/s nach Osten. Benenne die Bezugssysteme, sage die Bewegungsrichtung vom Ufer aus voraus und konstruiere die Verkettung gesondert mit einem angegebenen Pfeilmaßstab, etwa 1 cm ≙ 1 m/s. Bestimme die Geschwindigkeit relativ zum Ufer durch Ablesen und begründe eine passende Ablesetoleranz.
  - Task demand (EN): A boat moves north at 3.0 m/s relative to the water, which flows east at 2.0 m/s relative to the bank. Identify both frames, predict the direction as seen from the bank, and construct the head-to-tail chain in a separate sketch at a stated arrow scale such as 1 cm ≙ 1 m/s. Read off the velocity relative to the bank and justify an appropriate reading tolerance.
  - Expected performance (DE): Die Person verkettet Boot relativ zum Wasser mit Wasser relativ zum Ufer. Das Ergebnis weist nach Nordosten. Bei 1 cm ≙ 1 m/s liest sie rund 3,6 cm und somit ungefähr 3,6 m/s ab, nach Bedarf einen Winkel von rund 34° östlich von Nord. Eine Abweichung um etwa 0,2 m/s beziehungsweise wenige Grad ist bei nachvollziehbarer Raster-/Lineal-/Winkelmesser-Auflösung und passender Skizze vertretbar. Eine trigonometrische Winkelrechnung ist nicht erforderlich.
  - Expected performance (EN): The learner chains boat relative to water with water relative to the bank. The resultant points northeast. At 1 cm ≙ 1 m/s, it measures about 3.6 cm, corresponding to about 3.6 m/s, and, if read, about 34° east of north. Around 0.2 m/s or a few degrees is acceptable when supported by the grid, ruler or protractor resolution and a consistent sketch. Trigonometric angle calculation is not required.
  - Understanding focus (DE): Der neue zweidimensionale Fall prüft unabhängigen Transfer der gerichteten Überlagerung statt Wiedererkennen einer vorgegebenen Darstellung.
  - Understanding focus (EN): The fresh two-dimensional case tests independent transfer of directed combination rather than recognition of a supplied representation.
## Page 4: Geschwindigkeit beim waagerechten Wurf als Vektor bestimmen

- Full learning-goal ID: `0fee53f2-1c02-5b12-9b6c-aa9fa462d921`
- Goal fingerprint: `sha256:66699dfd044926734a00687ffe0994949e43b0142d6bcf447e08c94452ebd872`
- Page fingerprint: `sha256:992032746f78e828dad4bd5d912893691b6b620eb7b29f1e6f9a2411f71e60a9`
- Topic path: Physik

### Canonical description

Die lernende Person kann die Geschwindigkeit beim waagerechten Wurf aus waagerechter und senkrechter Komponente zusammensetzen und Betrag und Richtung bestimmen, etwa den Auftreffwinkel.

### Visualization

/assets/goal-visualizations/physik/0fee53f2-1c02-5b12-9b6c-aa9fa462d921/0fee53f2-1c02-5b12-9b6c-aa9fa462d921.png

- original digest: `sha256:a3774aafdfe4e727d8fe84a750eedb33598e1dd02c0dfe3f8042934107d1b1a8`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Bezugssysteme und Geschwindigkeitsüberlagerung — `68c90ba6-c438-463c-9a53-cf61062d416a` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Den Betrag eines ebenen Vektors bestimmen — `3b6fa042-af1e-5c48-a9d0-798a2ab876d0` (outside this book)
- Waagerechter Wurf analysieren — `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Geschwindigkeit beim waagerechten Wurf als Pfeil bestimmen — `4ea1b93f-2dba-59ac-87ab-29af6c55cc37` (outside this book)
- Schiefen Wurf beschreiben — `fbecbd60-5db3-51e8-94be-d66b066ffa06` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:49a83d88e8e04b6a59ca06438645a613588d73a6cf31285b817d8ae5bc612dd3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `simultaneous-components`
  - Essential understanding (DE): Beim waagerechten Wurf ohne Luftwiderstand und mit konstantem g bleibt die horizontale Geschwindigkeitskomponente konstant, während die anfangs verschwindende vertikale Komponente nach unten wächst. Beide gehören zum selben Zeitpunkt und ergeben gemeinsam die Geschwindigkeit.
  - Essential understanding (EN): In horizontal projection without air resistance and with constant g, the horizontal velocity component remains constant while the initially zero vertical component grows downward. Both refer to the same instant and together give the velocity.
  - Observable performance (DE): Legt Achsen und Vorzeichen fest, gewinnt gleichzeitige Komponenten aus Bewegungsangaben oder Komponentendarstellungen und konstruiert daraus eigenständig einen konsistenten Geschwindigkeitspfeil.
  - Observable performance (EN): Defines axes and signs, obtains simultaneous components from motion information or component representations and independently constructs a consistent velocity arrow.
- `magnitude-and-direction`
  - Essential understanding (DE): Der Betrag folgt aus den senkrechten Komponenten. In einer maßstäblichen Zusammensetzung lassen sich Richtung, Bezugsrichtung und Winkel aus dem Pfeil ablesen. Der Geschwindigkeitspfeil zeigt die momentane Bewegungsrichtung und bezeichnet weder Ort noch Beschleunigung.
  - Essential understanding (EN): The magnitude follows from perpendicular components. A scale construction gives the direction and angle relative to a named reference direction. The velocity arrow shows the instantaneous direction of motion and represents neither position nor acceleration.
  - Observable performance (DE): Berechnet den Betrag, gibt Achsen und Pfeilmaßstab an, liest den Winkel aus der Zeichnung ab oder berechnet ihn mit geeignetem vorhandenen Verfahren und begründet Richtung und Ablesetoleranz. Deutet bei umgekehrter Wurfrichtung die Vorzeichen eigenständig.
  - Observable performance (EN): Calculates the magnitude, states the axes and arrow scale, reads the angle from the drawing or calculates it using a suitable available method, and justifies the direction and reading tolerance. Interprets the signs independently for the reversed launch direction.

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
  - Task demand (DE): Ein Körper wird mit 3,00 m/s waagerecht nach rechts gestartet. Ohne Luftwiderstand gilt g = 9,81 m/s². Bestimme seine Geschwindigkeitskomponenten nach 0,400 s bei x nach rechts und y nach oben. Konstruiere den Geschwindigkeitspfeil mit einem angegebenen Pfeilmaßstab, berechne den Betrag und ermittle den Winkel gegen die Waagerechte zeichnerisch oder rechnerisch.
  - Task demand (EN): An object is launched horizontally to the right at 3.00 m/s. Neglect air resistance and use g = 9.81 m/s². Find its velocity components after 0.400 s with x to the right and y upwards. Use a stated arrow scale to construct the velocity arrow, calculate its magnitude and find the angle from the horizontal by measurement or calculation.
  - Expected performance (DE): Erhält v = (3,00; −3,924) m/s und berechnet mit Pythagoras ungefähr 4,94 m/s. Eine maßstäbliche Konstruktion, etwa 1 cm ≙ 1 m/s, weist nach rechts unten; der gemessene Winkel liegt bei rund 53° unter der Horizontalen nach rechts. Wenige Grad Abweichung sind bei passend begründeter Auflösung der Zeichnung und des Winkelmessers vertretbar.
  - Expected performance (EN): Finds v = (3.00, −3.924) m/s and calculates about 4.94 m/s using Pythagoras. A scale drawing, for instance at 1 cm ≙ 1 m/s, points down and right; the measured angle is about 53° below the rightward horizontal. A deviation of a few degrees is acceptable when justified by the drawing and protractor resolution.
  - Understanding focus (DE): Die gleichförmige horizontale und beschleunigte vertikale Komponente bilden eine momentane Geschwindigkeit.
  - Understanding focus (EN): The uniform horizontal and accelerated vertical components form one instantaneous velocity.
- `leftward-impact`
  - Task demand (DE): Die Komponentenaufzeichnungen verwenden x nach rechts und y nach oben. Der vx-Graph ist konstant bei −2,00 m/s; der vy-Graph fällt bis zum Auftreffen auf −1,50 m/s. Konstruiere den Auftreffgeschwindigkeitspfeil mit angegebenem Pfeilmaßstab, berechne seinen Betrag und bestimme seine Richtung zeichnerisch oder rechnerisch.
  - Task demand (EN): The component records use x to the right and y upwards. The vx graph stays at −2.00 m/s, while vy falls to −1.50 m/s at impact. Construct the impact velocity arrow at a stated arrow scale, calculate its magnitude and find its direction by measurement or calculation.
  - Expected performance (DE): Konstruiert v = (−2,00; −1,50) m/s und berechnet 2,50 m/s. Der Vektor weist nach links unten, ungefähr 37° unter der Linkshorizontalen. Ein größerer Pfeil, zum Beispiel 2 cm ≙ 1 m/s, verbessert die Ablesung. Die Person begründet eine Toleranz von wenigen Grad anhand von Maßstab und Messauflösung und unterscheidet negative Komponenten vom positiven Betrag.
  - Expected performance (EN): Constructs v = (−2.00, −1.50) m/s and calculates 2.50 m/s. The arrow points down and left, about 37° below the leftward horizontal. A larger arrow at, for example, 2 cm ≙ 1 m/s improves readability. The learner justifies a tolerance of a few degrees from scale and measurement resolution and distinguishes negative components from the positive magnitude.
  - Understanding focus (DE): Die geänderte Startrichtung verändert Komponenten und Winkelbezug; die rechtwinklige Vektoraddition bleibt anwendbar.
  - Understanding focus (EN): Changed launch direction changes components and angle references; perpendicular vector addition remains applicable.
## Page 5: Gravitationsfeld als Feldgröße einführen

- Full learning-goal ID: `156edddc-ce8d-580d-8d17-d9376d59e60e`
- Goal fingerprint: `sha256:9a2e0d5e3a9aec58df5928d6342af8627c1eb08e35cc56601077f6b3cd9e2a6b`
- Page fingerprint: `sha256:9ba46b4951fd71244ffc5ea341315845e613d155685e72e0c39b771c3130a3e6`
- Topic path: Physik

### Canonical description

Die lernende Person kann das Gravitationsfeld als ortsabhängige Vektorgröße erklären, die der Gravitationskraft auf einen Probekörper pro Masse dieses Probekörpers entspricht, und das radialsymmetrische Feld einer zentralen Masse durch nach innen gerichtete Feldlinien darstellen.

### Visualization

/assets/goal-visualizations/physik/156edddc-ce8d-580d-8d17-d9376d59e60e/156edddc-ce8d-580d-8d17-d9376d59e60e.jpg

- original digest: `sha256:9ffd7e7130e73f0a8e24116412328c9cc94447f60b34a68d2d39d7cef18ace4a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Massenanziehung qualitativ beschreiben — `92d8f398-0c9f-523c-88d7-44165b6b4768` (outside this book)

### Direct reverse prerequisites outside this book

- Gravitation und Weltbilder in GK-Aufgaben verknüpfen — `7e0308d8-a239-5c0f-b2c0-724f21e4da60` (outside this book)
- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4d0c1062d10968f963d875801f001fb1feaa759b7204da5429cc1091ccb73803`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `selected-blind-review-core`
  - Essential understanding (DE): Das Gravitationsfeld ordnet jedem Ort einen Vektor g zu. Im idealisierten Probekörpermodell gilt g = F_G/m_P, sodass das Feld am Ort von der erzeugenden Massenverteilung und nicht von der Masse des Probekörpers abhängt. Bei einer zentralen Masse zeigt g radial nach innen; Feldlinien stellen diese Richtung dar und sind keine materiellen Bahnen.
  - Essential understanding (EN): The gravitational field assigns a vector g to every position. In the idealized test-body model, g = F_G/m_P, so the field at a position depends on the source mass distribution rather than on the test body's mass. Around a central mass, g points radially inward; field lines represent this direction and are not material paths.
  - Observable performance (DE): Die lernende Person zeichnet selbstständig für vorgegebene Orte um eine zentrale Masse passende Feldvektoren und ein radialsymmetrisches, nach innen gerichtetes Feldlinienbild, erläutert die Richtungsinformation der Darstellung und verbindet unterschiedliche Kräfte auf Probekörper über F_G = m_P g mit demselben örtlichen Feldvektor.
  - Observable performance (EN): The learner independently draws appropriate field vectors and a radially symmetric, inward-pointing field-line diagram for given positions around a central mass, explains the directional information encoded by the representation, and relates different forces on test bodies through F_G = m_P g to the same local field vector.
- `local-field-is-independent-of-test-body-mass`
  - Essential understanding (DE): Zwei ideale Probekörper verschiedener Masse bestimmen am selben Ort denselben Feldvektor g, obwohl auf sie verschieden große Gravitationskräfte wirken. Die Division durch die jeweilige Probekörpermasse trennt die Eigenschaft des Feldortes von der Eigenschaft des eingesetzten Probekörpers.
  - Essential understanding (EN): Two ideal test bodies of different mass determine the same field vector g at the same position even though the gravitational forces on them have different magnitudes. Dividing by each test-body mass separates the property of the field position from the property of the chosen test body.
  - Observable performance (DE): Die lernende Person vergleicht an einem unveränderten Feldort mindestens zwei Probekörpermassen, ordnet den unterschiedlichen Kraftvektoren denselben Quotientenvektor g zu und korrigiert eine Darstellung, die die Feldpfeillänge fälschlich von der Probekörpermasse abhängig macht.
  - Observable performance (EN): At one unchanged field position, the learner compares at least two test-body masses, assigns the same quotient vector g to the different force vectors, and corrects a representation that incorrectly makes the field-arrow length depend on test-body mass.

**Coverage expectations**

- required expectations: `selected-blind-review-core`, `local-field-is-independent-of-test-body-mass`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `central-mass-position`: Die zentrale Masse liegt im Ursprung, außerhalb des Ursprungs oder in einer gedrehten Darstellung. / The central mass is at the origin, away from the origin, or in a rotated diagram.
- `test-body-mass-and-force`: Am selben Ort werden verschiedene Probekörpermassen und entsprechend verschiedene Kraftbeträge verglichen. / Different test-body masses and corresponding force magnitudes are compared at the same position.
- `representation-and-error-type`: Die Evidenz wechselt zwischen Einzelvektoren, Feldlinienbild, verbaler Erklärung und Fehleranalyse. / Evidence varies among individual vectors, a field-line diagram, verbal explanation, and error analysis.

**Application cases**

- `shifted-central-mass-with-two-test-bodies`
  - Task demand (DE): Eine zentrale Masse liegt an einem neuen Punkt eines Koordinatensystems. Markiere an vier unsymmetrisch gewählten Orten die Richtung von g und zeichne daraus ein radialsymmetrisches Feldlinienbild. Am selben fünften Ort werden nacheinander Probekörper der Massen m und 3m eingesetzt; erläutere mit F_G = m_P g, wie sich Kraft- und Feldvektor unterscheiden.
  - Task demand (EN): A central mass is located at a new point in a coordinate system. Mark the direction of g at four asymmetrically chosen positions and use them to draw a radially symmetric field-line diagram. Test bodies of masses m and 3m are then placed successively at the same fifth position; use F_G = m_P g to explain how the force and field vectors differ.
  - Expected performance (DE): Die lernende Person richtet jeden g-Pfeil auf die zentrale Masse, führt die Feldlinien radial nach innen und verwechselt sie nicht mit Umlaufbahnen. Für die beiden Probekörper zeichnet oder beschreibt sie bei identischem g einen dreifachen Kraftbetrag für 3m und zeigt, dass die Division durch die jeweilige Masse wieder denselben örtlichen Feldvektor ergibt.
  - Expected performance (EN): The learner directs every g arrow toward the central mass, draws the field lines radially inward, and does not confuse them with orbits. For the two test bodies, the learner draws or describes a threefold force magnitude for 3m at identical g and shows that division by the respective mass yields the same local field vector.
  - Understanding focus (DE): Geprüft werden neue räumliche Konstruktion, Richtungsinformation und die Trennung zwischen Feldgröße und Probekörperkraft.
  - Understanding focus (EN): This tests construction in a new spatial arrangement, directional information, and the distinction between field quantity and test-body force.
- `audit-three-flawed-field-representations`
  - Task demand (DE): Drei fremde Skizzen zeigen ein Zentralfeld: In einer weisen die Linien nach außen, in einer erhalten schwere Probekörper am selben Ort längere g-Pfeile, und in einer werden geschlossene Feldlinien als mögliche Umlaufbahnen gezeichnet. Benenne und korrigiere jeden Fehler und begründe die Korrektur mit Feldrichtung beziehungsweise g = F_G/m_P.
  - Task demand (EN): Three unfamiliar sketches show a central field: in one the lines point outward, in one heavier test bodies at the same position receive longer g arrows, and in one closed field lines are drawn as possible orbits. Identify and correct each error and justify the correction using the field direction or g = F_G/m_P.
  - Expected performance (DE): Die lernende Person ersetzt auswärts gerichtete durch radial einwärts gerichtete Linien, zeichnet am selben Ort unabhängig von der Probekörpermasse denselben g-Pfeil und trennt Feldlinien ausdrücklich von Bewegungsbahnen. Sie erklärt zugleich, dass die Kraft auf den schwereren Probekörper größer sein kann, ohne dass sich dadurch das vorgegebene Feld ändert.
  - Expected performance (EN): The learner replaces outward-pointing lines with radially inward-pointing ones, draws the same g arrow at the same position independently of test-body mass, and explicitly separates field lines from trajectories. The learner also explains that the force on the heavier test body can be larger without changing the given field.
  - Understanding focus (DE): Geprüft werden drei typische Fehlvorstellungen in einer neuen Darstellung statt bloßer Reproduktion eines bekannten Bildes.
  - Understanding focus (EN): This tests three common misconceptions in a new representation rather than reproduction of a familiar image.
## Page 6: Superposition elektrischer Felder

- Full learning-goal ID: `4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe`
- Goal fingerprint: `sha256:03e4b1b6c3855d484e98012f64e62568a7d1f957c17aba39ec410f1541bd7221`
- Page fingerprint: `sha256:96882583bbec3a88e8a41c993386ac7543f664b6024c707616ff17e4221ca65e`
- Topic path: Physik

### Canonical description

Die lernende Person kann die Beiträge zur elektrischen Feldstärke an demselben markierten Feldpunkt als dort ansetzende Pfeile mit einem gemeinsamen Feldstärkemaßstab darstellen. Sie addiert die Beiträge grafisch und deutet das resultierende Feld an diesem Punkt.

### Visualization

/assets/goal-visualizations/physik/4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe/4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe.jpg

- original digest: `sha256:a163d4664239d8c1ddf397adf133efd3154ebd768bed48497af319bdfea66ba3`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Quantitative Superposition elektrischer Felder — `455c65ca-814a-56ad-918a-013155883c52` (page 8)

### Prerequisites outside this book

- Verschiebungen zeichnen und verketten — `06194412-59dc-5768-96e0-71ca206b473c` (outside this book)
- Pfeile für gerichtete Größen lesen und zeichnen — `b77a7e93-22f9-5722-a4cc-f18a149ab030` (outside this book)
- Radialsymmetrische elektrische Felder beschreiben — `98e42cda-9e5d-5910-b2c0-3e631fd20c78` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Radialfelder zeichnen und überlagern — `908a7f3d-0e2e-56e3-b04e-bff50c899309` (outside this book)
- Feldlinienbilder von Ladungs- und Leiteranordnungen deuten — `f3de5922-dd45-4fb6-87c1-525d1952dd89` (outside this book)
- Elektrische Dipolfelder mit dem EKG verknüpfen — `e19fccd7-6a35-5c9e-86e1-dcca76481e9c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a2a44c465426c9daae7656ea6b752b865cea730f2e7376db6718917ee6dc402a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `construct-vector-superposition`
  - Essential understanding (DE): Die Gesamtfeldstärke an einem Ort ist die Vektorsumme der dortigen Einzelbeiträge. Jeder Beitrag wird zunächst unabhängig aus Quellenzeichen, Geometrie und relativer Stärke bestimmt; Beträge allein dürfen nicht addiert werden.
  - Essential understanding (EN): The total field at a location is the vector sum of the individual contributions there. Each contribution is first determined independently from source sign, geometry, and relative magnitude; magnitudes alone must not be added.
  - Observable performance (DE): Die lernende Person zeichnet alle Beitragsvektoren an einem gemeinsamen Angriffspunkt und Maßstab, führt Polygon- oder Parallelogrammaddition aus und begründet Richtung sowie relative Größe des Resultats.
  - Observable performance (EN): The learner draws all component vectors at a common point and scale, performs polygon or parallelogram addition, and justifies the direction and relative magnitude of the resultant.
- `use-symmetry-and-predict-changes`
  - Essential understanding (DE): Symmetrie kann Komponenten aufheben oder verstärken, doch dies gilt nur für die betreffenden Richtungen und Beträge. Eine verschobene Quelle oder ein umgekehrtes Vorzeichen verändert die Beitragsvektoren und damit mögliche Nullstellen.
  - Essential understanding (EN): Symmetry can cancel or reinforce components, but only for the relevant directions and magnitudes. Moving a source or reversing a sign changes the component vectors and hence possible zero points.
  - Observable performance (DE): Die lernende Person sagt vor der Konstruktion qualitative Änderungen voraus, nutzt Symmetrie begründet und überprüft die Vorhersage mit einer neuen Vektoraddition.
  - Observable performance (EN): The learner predicts qualitative changes before construction, uses symmetry with justification, and checks the prediction with a fresh vector addition.

**Coverage expectations**

- required expectations: `construct-vector-superposition`, `use-symmetry-and-predict-changes`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `source-signs`: Gleiche oder ungleiche Ladungsvorzeichen / Like or unlike charge signs
- `geometry`: Symmetrische, verschobene oder nichtkollineare Anordnung / Symmetric, displaced, or non-collinear arrangement
- `field-point`: Mittelpunkt, Achsenpunkt oder allgemeiner Punkt / Midpoint, axial point, or general point

**Application cases**

- `two-like-charges-midpoint-and-offset`
  - Task demand (DE): Zwei gleiche positive Ladungen liegen symmetrisch. Konstruiere das Gesamtfeld zuerst im Mittelpunkt und dann an einem seitlich versetzten Punkt; erkläre, welche Komponenten sich jeweils aufheben oder addieren.
  - Task demand (EN): Two equal positive charges are arranged symmetrically. Construct the total field first at the midpoint and then at a laterally displaced point; explain which components cancel or add in each case.
  - Expected performance (DE): Die lernende Person zeichnet im Mittelpunkt gleich große entgegengesetzte Beiträge und erhält null; am versetzten Punkt nutzt sie gleichen Maßstab, zerlegt gegebenenfalls Komponenten und begründet ein nichtverschwindendes Resultat.
  - Expected performance (EN): The learner draws equal opposed contributions at the midpoint and obtains zero; at the displaced point, they use a common scale, resolve components if needed, and justify a nonzero resultant.
  - Understanding focus (DE): Der Fall prüft Symmetrie als Ergebnis der Vektoraddition, nicht als Merksatz.
  - Understanding focus (EN): The case assesses symmetry as a result of vector addition rather than a memorized rule.
- `dipole-sign-reversal`
  - Task demand (DE): An einem vorgegebenen Punkt neben zwei Ladungen wird zunächst ein Dipolfeld grafisch addiert. Danach wird das negative Ladungsvorzeichen umgekehrt. Sage die Änderung voraus und konstruiere beide Resultierenden im selben Maßstab.
  - Task demand (EN): At a specified point beside two charges, a dipole field is first added graphically. The negative charge is then reversed. Predict the change and construct both resultants to the same scale.
  - Expected performance (DE): Die lernende Person bestimmt für jede Quelle die korrekte Feldrichtung, erkennt die grundlegende Änderung von Dipol- zu Gleichzeichenanordnung und erklärt Verstärkung beziehungsweise Abschwächung aus den Vektoren.
  - Expected performance (EN): The learner determines the correct field direction for each source, recognizes the fundamental change from a dipole to a like-charge arrangement, and explains reinforcement or reduction from the vectors.
  - Understanding focus (DE): Der unabhängige Transfer prüft Vorzeichen- und Geometrieverständnis.
  - Understanding focus (EN): The independent transfer assesses understanding of sign and geometry.
## Page 7: Antimaterie und Paarvernichtung

- Full learning-goal ID: `48e3d6c2-00bf-5afd-8846-ba3dbd01e96d`
- Goal fingerprint: `sha256:221e889f371f1de26daf65a8beaee0cc1226bae469fafa4cda50b51a48fd649e`
- Page fingerprint: `sha256:646cbc94cc6fe56b24aa1311bedf93082f4299ee0bf6652d6eae46f0b4692b2c`
- Topic path: Physik

### Canonical description

Die lernende Person kann das Positron als Antiteilchen des Elektrons beschreiben und erklären, wie bei der Vernichtung eines annähernd ruhenden Elektron-Positron-Paares unter Energie- und Impulserhaltung zwei nahezu entgegengesetzt ausgesandte Photonen entstehen, die in der PET als Messsignal genutzt werden.

### Visualization

/assets/goal-visualizations/physik/48e3d6c2-00bf-5afd-8846-ba3dbd01e96d/48e3d6c2-00bf-5afd-8846-ba3dbd01e96d.jpg

- original digest: `sha256:0d2326744840b5fc96d76fdfb8be696fab21e18201ef6140d66589993aff4011`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Impulserhaltung — `839ecc8f-3a60-418b-bc92-64bfeef33824` (outside this book)
- Energie und Impuls von Photonen — `d2860d7f-32ff-5d74-b2f8-b7bfc8d75aec` (outside this book)

### Direct reverse prerequisites outside this book

- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Quantenobjekte, Unbestimmtheit und Messproblem — `b585ff81-6332-5d11-ae63-ee6a9928c00d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4882413979ea2e879d7465ee32b821696bc8a13a68f7b2c13f8a8c093641c310`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `positron-is-electron-antiparticle`
  - Essential understanding (DE): Das Positron ist das Antiteilchen des Elektrons: Es besitzt dieselbe Ruhemasse und den gleichen Betrag, aber das entgegengesetzte Vorzeichen der elektrischen Ladung. Diese Zuordnung ist eine Teilcheneigenschaft und keine Aussage darüber, dass ein einzelnes Positron bereits vernichtet sein muss.
  - Essential understanding (EN): The positron is the electron's antiparticle: it has the same rest mass and the same magnitude but opposite sign of electric charge. This assignment is a particle property and does not state that an individual positron must already have annihilated.
  - Observable performance (DE): Die lernende Person liest aus einer neuen Teilchentabelle Masse und Ladung ab, identifiziert das Positron begründet als Elektron-Antiteilchen, hält Betragsgleichheit und Vorzeichenwechsel auseinander und verwirft eine Zuordnung nur aufgrund ähnlicher Namen oder Energiewerte.
  - Observable performance (EN): From a fresh particle table, the learner reads mass and charge, justifiably identifies the positron as the electron's antiparticle, keeps equal magnitude distinct from reversed sign, and rejects an assignment based only on similar names or energy values.
- `rest-energy-balance-gives-near-511-kev-photons`
  - Essential understanding (DE): Bei der Vernichtung eines im Schwerpunktsystem annähernd ruhenden Elektron-Positron-Paares geht die Ruheenergie von ungefähr 2m_e c² in Photonenenergie über. Im dominierenden Zwei-Photonen-Fall besitzen die Photonen bei vernachlässigbarer Anfangsbewegung jeweils ungefähr 511 keV; kleine Anfangs- oder Bindungsbeiträge begrenzen die Exaktheit dieser Angabe.
  - Essential understanding (EN): When an electron–positron pair approximately at rest in its center-of-momentum frame annihilates, rest energy of about 2m_e c² becomes photon energy. In the dominant two-photon case, negligible initial motion gives each photon about 511 keV; small initial-motion or binding contributions limit the exactness of this value.
  - Observable performance (DE): Die lernende Person stellt für ein unabhängig gegebenes annähernd ruhendes Paar die Energiegleichung mit Einheiten auf, bestimmt die ungefähre Energie pro Photon und nennt die Ruhe- und Zwei-Photonen-Annahmen, statt den Zahlenwert ohne System- und Zustandsbezug einzusetzen.
  - Observable performance (EN): For an independently given pair that is approximately at rest, the learner sets up the energy equation with units, determines the approximate energy per photon, and states the rest and two-photon assumptions rather than substituting the number without reference to the system and state.
- `vector-momentum-controls-photon-directions`
  - Essential understanding (DE): Energieerhaltung allein bestimmt die Richtungen nicht. Bei nahezu verschwindendem Anfangsimpuls muss der Vektorimpuls der beiden Photonen nahezu null ergeben, weshalb sie nahezu entgegengesetzt ausgesandt werden; bei kleinem Gesamtimpuls können Richtungen und Energien im Laborsystem abweichen, während die Gesamtbilanz erhalten bleibt.
  - Essential understanding (EN): Energy conservation alone does not determine the directions. When initial momentum is nearly zero, the vector sum of the two photon momenta must be nearly zero, so they are emitted in nearly opposite directions; with small total momentum, their directions and energies can differ in the laboratory frame while the total balance remains conserved.
  - Observable performance (DE): Die lernende Person konstruiert aus frischen Energie- und Impulsangaben ein beschriftetes Vektordiagramm, prüft zwei vorgeschlagene Photonenkonfigurationen gegen beide Erhaltungssätze und erklärt für einen Fall mit von null verschiedenem Gesamtimpuls qualitativ die Abweichung von exakt gegenläufigen gleichenergetischen Photonen.
  - Observable performance (EN): From fresh energy and momentum data, the learner constructs a labelled vector diagram, checks two proposed photon configurations against both conservation laws, and qualitatively explains the departure from exactly opposite equal-energy photons when total momentum is nonzero.
- `pet-uses-annihilation-photons-only-as-measurement-signals`
  - Essential understanding (DE): Die bei der Paarvernichtung entstehenden Photonen können in der PET als detektierbare Messsignale dienen. Sie liefern das hier beanspruchte physikalische Signal, sind aber weder die Energieversorgung des Scanners noch selbst ein unmittelbar sichtbares PET-Bild; weitere Orts- und Rekonstruktionsverfahren gehören nicht zu diesem Ziel.
  - Essential understanding (EN): The photons produced in pair annihilation can serve as detectable measurement signals in PET. They provide the physical signal claimed here but are neither the scanner's energy supply nor themselves a directly visible PET image; further localization and reconstruction procedures are outside this goal.
  - Observable performance (DE): Die lernende Person ordnet in einem neuen PET-Ereignisprotokoll zwei energiemäßig passende Detektionssignale der Paarvernichtung zu, erklärt ihre physikalische Herkunft und begrenzt die Aussage auf die Rolle als Messsignal, ohne Energieversorgung, Ortsbestimmung oder Bildinhalt zu erfinden.
  - Observable performance (EN): In a fresh PET event record, the learner associates two energy-compatible detection signals with pair annihilation, explains their physical origin, and limits the conclusion to their role as measurement signals without inventing energy supply, localization, or image content.

**Coverage expectations**

- required expectations: `positron-is-electron-antiparticle`, `rest-energy-balance-gives-near-511-kev-photons`, `vector-momentum-controls-photon-directions`, `pet-uses-annihilation-photons-only-as-measurement-signals`
- alternative expectation groups: None
- minimum independent demonstrations: 3
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `initial-pair-momentum`: Annähernd ruhendes Paar im Schwerpunktsystem oder Paar mit kleinem, aber von null verschiedenem Gesamtimpuls im Laborsystem / Pair approximately at rest in its center-of-momentum frame or pair with small but nonzero total momentum in the laboratory frame
- `conservation-representation`: Ruheenergie- und Photonenenergiebilanz, Vektorimpulsdiagramm, Teilchentabelle oder geprüftes Ereignisprotokoll / Rest-energy and photon-energy balance, vector-momentum diagram, particle table, or supplied event record
- `photon-outcome`: Nahezu gleiche oder unterschiedliche Photonenergien sowie exakt angenäherte oder leicht abweichende Gegenrichtung / Nearly equal or unequal photon energies and approximately exact or slightly deviating opposite directions
- `claim-boundary`: Antiteilcheneigenschaft, Paarvernichtungsbilanz und PET-Messsignal gegenüber Energiequelle oder unmittelbar sichtbarem Bildinhalt / Antiparticle property, pair-annihilation balance, and PET measurement signal contrasted with an energy source or directly visible image content

**Application cases**

- `stationary-pair-energy-and-momentum-balance`
  - Task demand (DE): Ein bereitgestelltes Modell setzt Elektron und Positron im Schwerpunktsystem näherungsweise in Ruhe und gibt m_e c² = 511 keV an. Stelle Energie- und Vektorimpulsbilanz für den dominierenden Zwei-Photonen-Fall auf, bestimme die Photonenergien und zeichne zulässige Richtungen.
  - Task demand (EN): A supplied model treats an electron and positron as approximately at rest in their center-of-momentum frame and gives m_e c² = 511 keV. Set up the energy and vector-momentum balance for the dominant two-photon case, determine the photon energies, and draw allowed directions.
  - Expected performance (DE): Die lernende Person erhält ungefähr 1022 keV Gesamtenergie und 511 keV pro Photon, zeichnet nahezu gleich große entgegengesetzte Impulsvektoren, übernimmt die vorgegebene Photonenzahl des Zwei-Photonen-Falls und begründet Energien und Richtungen gemeinsam aus beiden Erhaltungssätzen und den genannten Näherungen.
  - Expected performance (EN): The learner obtains about 1022 keV total energy and 511 keV per photon, draws nearly equal opposite momentum vectors, uses the supplied photon count of the two-photon case and jointly justifies the energies and directions from both conservation laws and the stated approximations.
  - Understanding focus (DE): Der Ruhefall prüft, ob Ruheenergie und Vektorimpuls eine zusammenhängende physikalische Erklärung statt zweier Merksätze bilden.
  - Understanding focus (EN): The rest case tests whether rest energy and vector momentum form one coherent physical explanation rather than two memorized statements.
- `moving-pair-candidate-outcomes`
  - Task demand (DE): Für ein Elektron-Positron-Paar mit kleinem vorgegebenem Gesamtimpuls werden drei mögliche Zwei-Photonen-Ausgänge als Energie- und Vektordaten angeboten. Verwende die vorgegebene Photonenbeziehung |p⃗| = E/c. Wähle die mit Energie- und Impulserhaltung vereinbare Konfiguration und erkläre, warum beide Photonen nicht zugleich exakt gegenläufig und gleichenergetisch sein können.
  - Task demand (EN): For an electron–positron pair with a small given total momentum, three possible two-photon outcomes are supplied as energy and vector data. Use the supplied photon relation |p⃗| = E/c. Select the outcome satisfying energy and momentum conservation and explain why the two photons cannot be exactly opposite and equal in energy at the same time.
  - Expected performance (DE): Die Person prüft im selben Bezugssystem getrennt E₁ + E₂ = E_gesamt und die Vektorsumme p⃗₁ + p⃗₂ = p⃗_gesamt, mit vorgegebener Photonenbeziehung |p⃗ᵢ| = Eᵢ/c. Das ist die Energie- und Impulsbilanz desselben Prozesses. Bei nicht verschwindendem Anfangsimpuls ist die Kombination aus gleichenergetisch und gegenläufig ausgeschlossen. Je nach vorgegebenen Daten kann sich die Bilanz durch eine Richtungsabweichung, einen Energieunterschied oder beides erfüllen.
  - Expected performance (EN): In the same reference frame, the learner checks E₁ + E₂ = E_total and the vector sum p⃗₁ + p⃗₂ = p⃗_total separately, using the supplied photon relation |p⃗ᵢ| = Eᵢ/c. These are the energy and momentum balances of the same process. A nonzero initial momentum rules out the combination of equal energy and opposite directions. Depending on the supplied data, the balance can be satisfied through departure from opposite directions, unequal energies or both.
  - Understanding focus (DE): Der geänderte Bezugsfall erzwingt Transfer der beiden Erhaltungssätze jenseits der symmetrischen 511-keV-Situation.
  - Understanding focus (EN): The changed reference case requires transfer of both conservation laws beyond the symmetric 511 keV situation.
- `bounded-pet-detection-record`
  - Task demand (DE): Ein simuliertes PET-Protokoll enthält zwei einem bereitgestellten Vernichtungsereignis zugeordnete Detektionssignale mit Energien nahe 511 keV. Eine Aussage bezeichnet die Photonen als Energiequelle des Scanners, eine zweite bereits als das fertige sichtbare Bild. Erkläre die physikalische Herkunft und die begrenzte Rolle der Signale.
  - Task demand (EN): A simulated PET record contains two detection signals assigned to a supplied annihilation event, with energies near 511 keV. One statement calls the photons the scanner's energy source and another calls them the finished visible image. Explain the physical origin and bounded role of the signals.
  - Expected performance (DE): Die lernende Person deutet die Signale als detektierte Vernichtungsphotonen, verbindet ihre Größenordnung mit der Paar-Ruheenergie und weist Energiequellen- und Fertigbildbehauptung zurück. Sie bleibt beim Messsignal und führt keine Orts- oder Rekonstruktionsmethode ein.
  - Expected performance (EN): The learner interprets the signals as detected annihilation photons, connects their energy scale with the pair rest energy, and rejects both the energy-source and finished-image claims. The learner stops at the measurement signal and introduces no localization or reconstruction method.
  - Understanding focus (DE): Der PET-Fall prüft ausschließlich die enge Anwendung der Vernichtungsphotonen als Messsignal.
  - Understanding focus (EN): The PET case tests only the narrow application of annihilation photons as measurement signals.
## Page 8: Quantitative Superposition elektrischer Felder

- Full learning-goal ID: `455c65ca-814a-56ad-918a-013155883c52`
- Goal fingerprint: `sha256:2a3674a1c5be0c8da7608041fd7a8aa57e63183d79be11b2b83fcfd4e1034a46`
- Page fingerprint: `sha256:0c690a99aad85536c45f83d1ff10545d2dd0f9333e1767605085040529108adb`
- Topic path: Physik

### Canonical description

Die lernende Person kann elektrische Feldstärken vektoriell addieren und Fälle mit parallelen oder orthogonalen Feldern berechnen.

### Visualization

/assets/goal-visualizations/physik/455c65ca-814a-56ad-918a-013155883c52/455c65ca-814a-56ad-918a-013155883c52.jpg

- original digest: `sha256:a0548671007329ef45f9f90794e5175b6b09c41583c1c6da878754e3a8059abb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Superposition elektrischer Felder — `4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe` (page 6)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Den Betrag eines ebenen Vektors bestimmen — `3b6fa042-af1e-5c48-a9d0-798a2ab876d0` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Feldvektoren mit Richtung berechnen — `5307fc57-f913-5e44-893d-b9130f656cf5` (outside this book)
- Elektrostatik und Potenzial — `841edfdb-5e12-5a37-ab12-552a1d8e92ca` (outside this book)
- Vorschlag A (LK) - Adaptive Ladespur (Felder/Induktion) — `86015397-23c4-5ed7-b893-bc619ec961a8` (outside this book)
- Vorschlag A (LK) - Feldregelung und Transformatorwirkungsgrad — `cf892388-6cb4-5981-adf2-7168aeb948b1` (outside this book)
- Q1-Klausuraufgaben Physik selbstständig lösen — `d441ee2f-9230-5751-832b-5b0b5cf14605` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:bdba88ccb6b1ac0f8f508499272ba29e7a90d1b2f4df6de1a65df7d22016f176`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `vector-law`
  - Essential understanding (DE): Elektrische Feldstärken am selben Ort addieren sich vektoriell; Richtung und Vorzeichen gehören zum Feld, nicht nur der Betrag.
  - Essential understanding (EN): Electric field strengths at the same location add vectorially; direction and sign belong to the field, not just magnitude.
  - Observable performance (DE): Wählt ein Koordinatensystem, begründet E_ges=E₁+E₂ und führt eine konsistente Komponenten- oder Pfeilrechnung durch.
  - Observable performance (EN): Chooses coordinates, justifies E_total=E₁+E₂ and performs a consistent component or arrow calculation.
- `result-meaning`
  - Essential understanding (DE): Resultierender Betrag und Richtung müssen zur Geometrie passen; bei Gegenrichtung kann der Betrag kleiner werden, bei orthogonalen Feldern folgt er aus den Komponenten.
  - Essential understanding (EN): Resultant magnitude and direction must fit the geometry; opposite directions can reduce magnitude, while orthogonal fields determine it through their components.
  - Observable performance (DE): Gibt Betrag mit N/C und Richtung an und prüft das Ergebnis durch Vektorskizze, Grenzfall oder Komponentenrückprüfung.
  - Observable performance (EN): Reports magnitude in N/C and direction and checks using a vector sketch, limiting case or component reconstruction.

**Coverage expectations**

- required expectations: `vector-law`, `result-meaning`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `field-geometry`: Gegenläufige kollineare Felder gegenüber orthogonalen Feldern; Vorzeichen statt Addition bloßer Beträge. / Opposing collinear fields versus orthogonal fields; signs rather than addition of magnitudes alone.

**Application cases**

- `opposing-fields`
  - Task demand (DE): Am selben Punkt zeigen 300 N/C nach Osten und 500 N/C nach Westen. Bestimme und begründe das Gesamtfeld.
  - Task demand (EN): At the same point, 300 N/C points east and 500 N/C west. Determine and justify the total field.
  - Expected performance (DE): Wählt z. B. Osten positiv: 300−500=−200 N/C, also 200 N/C nach Westen. Erklärt Teilkompensation und nicht 800 N/C.
  - Expected performance (EN): Chooses, for example, east positive: 300−500=−200 N/C, hence 200 N/C west. Explains partial cancellation rather than 800 N/C.
  - Understanding focus (DE): Richtungsgerechte Superposition und physikalisches Vorzeichen.
  - Understanding focus (EN): Direction-sensitive superposition and physical sign.
- `orthogonal-fields`
  - Task demand (DE): Am selben Punkt wirken 300 N/C nach Osten und 400 N/C nach Norden. Konstruiere das Gesamtfeld mit Betrag und Richtung.
  - Task demand (EN): At the same point there are 300 N/C east and 400 N/C north. Construct the total field with magnitude and direction.
  - Expected performance (DE): Erhält Komponenten (300,400) N/C und Betrag 500 N/C. Beschreibt die Richtung nordöstlich mit Komponentenverhältnis 4:3 oder Winkel etwa 53,1° nördlich von Osten; prüft durch Skizze.
  - Expected performance (EN): Obtains components (300,400) N/C and magnitude 500 N/C. Describes the northeast direction with component ratio 4:3 or angle about 53.1° north of east; checks by sketch.
  - Understanding focus (DE): Geometrie der Vektorsumme statt skalarer Betragsaddition.
  - Understanding focus (EN): Geometry of vector addition rather than scalar addition of magnitudes.
## Page 9: Geschwindigkeitspfeile aus einer Video-Bildfolge bestimmen und vergleichen

- Full learning-goal ID: `d61ea362-f6c3-5eab-ac30-2d0e265ac0f6`
- Goal fingerprint: `sha256:3a17b2639cc809d5d32caf34f5220dc584c4b6ff73e58190783bc2577d8d1ac8`
- Page fingerprint: `sha256:846e8a37065c5ab43ab9576f2023eeb9adb7148209eec2ee020237b90839e6ca`
- Topic path: Physik

### Canonical description

Die lernende Person kann in einer zeitlich und räumlich kalibrierten Bildfolge einer ebenen Bewegung aus den Ortsänderungen über kurze, gleich lange Zeitintervalle Geschwindigkeitspfeile bestimmen. Sie zeichnet jeden Pfeil am zugehörigen Ort des Körpers mit einem eigenen Geschwindigkeitsmaßstab, erklärt die näherungsweise Zuordnung zum jeweiligen Zeitpunkt und bestimmt die Geschwindigkeitsänderung in einer getrennten grafischen Differenzkonstruktion.

### Visualization

/assets/goal-visualizations/physik/d61ea362-f6c3-5eab-ac30-2d0e265ac0f6/d61ea362-f6c3-5eab-ac30-2d0e265ac0f6.jpeg

- original digest: `sha256:2a85126c257d807e8f51fb092b68243912f29cd361b918918b64e98a199973f3`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Verschiebungen zeichnen und verketten — `06194412-59dc-5768-96e0-71ca206b473c` (outside this book)
- Pfeile für gerichtete Größen lesen und zeichnen — `b77a7e93-22f9-5722-a4cc-f18a149ab030` (outside this book)
- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Geschwindigkeitspfeile in einem echten Bewegungsvideo konstruieren — `fbaeed34-81a0-5955-9777-bf103002feee` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:dd5fd37c8643e5a9551afb39601b06b581bdee6fbbc3e4f29e94c6123bfbbf66`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `scaled-local-velocity`
  - Essential understanding (DE): Eine Ortsänderung über ein kurzes bekanntes Zeitfenster liefert einen Geschwindigkeitspfeil mit Bewegungsrichtung und maßstäblichem Betrag; ein Intervallmittel ist nur näherungsweise ein Zeitpunktwert.
  - Essential understanding (EN): A displacement over a short known window gives a velocity arrow with motion direction and scaled magnitude; an interval average only approximates an instantaneous value.
  - Observable performance (DE): Die Person nutzt die vorgegebene räumliche und zeitliche Kalibrierung. Für zwei kurze gleich lange Zeitfenster bestimmt sie die jeweiligen mittleren Geschwindigkeiten Δr/Δt. Sie ordnet jeden Mittelwert näherungsweise der Fenstermitte zu und begründet die Näherung. Am Körperort zum betreffenden Zeitpunkt zeichnet sie mit einer eigenen Geschwindigkeitslegende einen Pfeil zum bestimmten Betrag und in Bewegungsrichtung.
  - Observable performance (EN): The learner uses the supplied position and time calibration. For two short equal time windows they determine the mean velocities Δr/Δt. They assign each average approximately to the window midpoint and explain the approximation. At the body position for that instant they draw the velocity in its direction and to magnitude using a separate velocity legend.
- `graphical-velocity-change`
  - Essential understanding (DE): Der Änderungspfeil läuft bei gemeinsamem Anfangspunkt von der ersten zur zweiten Geschwindigkeitsspitze. Eine Richtungsänderung genügt auch bei gleichem Betrag für eine Änderung.
  - Essential understanding (EN): With common tails, the change arrow runs from the first velocity arrowhead to the second. A direction change gives velocity change even at equal magnitude.
  - Observable performance (DE): In einer als Konstruktion gekennzeichneten Nebenskizze überträgt die Person die beiden Geschwindigkeiten desselben Körpers im selben Bezugssystem mit unverändertem Maßstab an einen gemeinsamen Anfang. Sie zeichnet Δv von der ersten zur zweiten Spitze und deutet Richtung und Betrag der Geschwindigkeitsänderung.
  - Observable performance (EN): In a separate diagram labelled as a construction, the learner transfers the two velocities of the same body in the same frame to a common tail using the same velocity scale. They draw Δv from the first tip to the second and interpret the direction and magnitude of the change in velocity.

**Coverage expectations**

- required expectations: `scaled-local-velocity`, `graphical-velocity-change`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `direction-and-speed`: Zwei neue reale Clips mit geänderten Geschwindigkeiten und unabhängig einem näherungsweise gleichen Betrag bei Richtungswechsel. / Two fresh real clips with changed velocities and independently approximately equal magnitude with direction change.

**Application cases**

- `real-turning-clip`
  - Task demand (DE): Untersuche einen neuen kalibrierten Videoclip vor und nach einer Kurve. Bestimme aus zwei gleich langen kurzen Zeitfenstern die Geschwindigkeiten, erläutere ihre zeitliche Zuordnung und zeichne die Geschwindigkeitspfeile. Konstruiere die Geschwindigkeitsänderung in einer gekennzeichneten Nebenskizze.
  - Task demand (EN): Analyze a fresh calibrated video before and after a turn. Use two short equal-duration windows to find the velocities, explain their time assignment and draw the velocity arrows. Construct the change in velocity in a labelled separate diagram.
  - Expected performance (DE): Zwei Quotienten Δr/Δt liefern Intervallmittel. Bei hinreichend kleinen Änderungen innerhalb des Fensters nähern sie die Geschwindigkeit in seiner Mitte an. Die Pfeile sitzen an den jeweiligen Körperorten und tragen Richtung und Länge gemäß Geschwindigkeitsmaßstab. Erst die Nebenkonstruktion überträgt sie an einen gemeinsamen Anfang und verbindet die Spitzen in zeitlicher Reihenfolge.
  - Expected performance (EN): Two quotients Δr/Δt give interval averages. If the velocities vary sufficiently little within the windows, these approximate their midpoint values. The arrows start at the respective body positions and follow the directions and the velocity scale. The separate construction transfers them to a common tail and connects their tips in time order.
  - Understanding focus (DE): Eigene Auswertung eines realen Artefakts.
  - Understanding focus (EN): Own analysis of a real artifact.
- `fresh-equal-speed-direction`
  - Task demand (DE): Werte einen zweiten neuen echten Clip mit ähnlichem Betrag und anderer Richtung aus. Die räumliche/zeitliche Kalibrierung wird passend mitgegeben; wende sie nachvollziehbar an.
  - Task demand (EN): Analyze a second fresh real clip with similar magnitude and a changed direction. Appropriate spatial/temporal calibration is supplied; apply it traceably.
  - Expected performance (DE): Die Person zeichnet beide Geschwindigkeiten an den jeweiligen Körperorten mit gleicher Geschwindigkeitslegende. Trotz ähnlicher Beträge liegen die Spitzen der beiden Pfeile bei gemeinsamem Anfang in der gekennzeichneten Nebenkonstruktion auseinander. Die Verbindung von der ersten zur zweiten Spitze ergibt Δv.
  - Expected performance (EN): The learner draws the velocities at their respective body positions using the same velocity legend. Despite similar speeds, the two tips remain separated when the arrows are copied to a common tail in a labelled separate construction. Joining the first tip to the second gives Δv.
  - Understanding focus (DE): Unabhängiger Richtungs-/Betragstransfer.
  - Understanding focus (EN): Independent direction/magnitude transfer.
