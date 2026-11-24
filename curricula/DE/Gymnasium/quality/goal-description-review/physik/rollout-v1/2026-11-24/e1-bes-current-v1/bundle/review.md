# AI review input: Physik: beschleunigte Bewegung im aktuellen E.1-Schnitt

- Book ID: `de-gym-physik-e1-bes-current-v1-20261124`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:fca4e98b27bd06697a33b89e6bd20a288ae05ccc7e3812fd60ee30ee2a067e0c`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Gleichmäßig beschleunigte Bewegung und Beschleunigung

- Full learning-goal ID: `e4b38061-1f28-43ad-8371-a3e7c0e81856`
- Goal fingerprint: `sha256:70e4e02a89e3533891437bcd8ecdb5eebbf6844890928e623f32a6fbb2c2dd58`
- Page fingerprint: `sha256:fbf978e99187a35d8bd944051e52b316e332b78ee8151cecff43a41327f238b4`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.1 Bewegungen und ihre Beschreibung

### Canonical description

Die lernende Person kann das Modell der gleichmäßig beschleunigten Bewegung mit konstanter Beschleunigung erläutern und in t-s-, t-v- und t-a-Darstellungen beschreiben.

### Visualization

/assets/goal-visualizations/physik/e4b38061-1f28-43ad-8371-a3e7c0e81856/e4b38061-1f28-43ad-8371-a3e7c0e81856.jpg

- original digest: `sha256:fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Funktionswerte berechnen — `c65ecabf-d00b-4e2d-99ae-b64692325ffb` (outside this book)
- Flächeninhalte ebener Figuren berechnen — `87c55be5-06a9-41e2-a0d4-c60f7c8b8078` (outside this book)
- Durchschnitts- und Momentangeschwindigkeit unterscheiden — `bf8517a9-142b-5789-826a-767f3b277998` (outside this book)
- t-v-Diagramm und Ortsänderung als Fläche — `1e459a1b-4159-5049-84eb-9928129c1610` (outside this book)

### Direct reverse prerequisites outside this book

- Senkrechter Wurf: Vorzeichen, Scheitelpunkt und Rückkehr — `4ab1cf6d-b808-5b86-9291-85df0b9f2496` (outside this book)
- Physik im Straßenverkehr: Sicherheitsabstände bewerten — `4a2bf015-052b-4af0-aed7-324259fa1a8a` (outside this book)
- Newtons 1. Axiom (Trägheitsprinzip) — `31a2ef52-114b-4d2c-a720-6ef5a390b6dc` (outside this book)
- Bewegungen mit Videoanalyse untersuchen — `d67502e3-5e0a-595b-a24b-65b1c40de36e` (outside this book)
- Harmonische Schwingung verstehen — `d03f1cb6-c224-53db-ad91-76cc7827978d` (outside this book)
- Bewegungen mit Zeit-Ort- und Zeit-Geschwindigkeits-Gesetzen beschreiben — `262f807a-30d0-503e-986f-856cbd048e8e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:74aba488f111960ad359c02f34324f76284b60e939ad35d0d7bed89c2b3c95d4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `constant-acceleration`
  - Essential understanding (DE): Bei gleichmäßig beschleunigter eindimensionaler Bewegung ist a = Δv/Δt konstant; das Vorzeichen von a allein entscheidet nicht, ob der Geschwindigkeitsbetrag wächst.
  - Essential understanding (EN): In uniformly accelerated one-dimensional motion, a = Δv/Δt is constant; the sign of a alone does not determine whether speed increases.
  - Observable performance (DE): Begründet aus Geschwindigkeitsänderungen das konstante a mit Einheit m/s² und beschreibt anhand der Vorzeichen von v und a schneller oder langsamer werdende Bewegung.
  - Observable performance (EN): Justifies constant a from velocity changes with unit m/s² and uses the signs of v and a to describe speeding up or slowing down.
- `linked-three-graphs`
  - Essential understanding (DE): Konstantes a entspricht einer t-v-Geraden und einem waagerechten t-a-Graphen; bei a ≠ 0 ist der t-s-Graph parabelförmig. Seine Steigung beschreibt v, seine Krümmungsrichtung das Vorzeichen von a.
  - Essential understanding (EN): Constant a corresponds to a straight t-v graph and a horizontal t-a graph; for a ≠ 0 the t-s graph is parabolic. Its slope describes v and its concavity the sign of a.
  - Observable performance (DE): Erstellt aus neuen Bewegungsdaten zusammenpassende t-s-, t-v- und t-a-Darstellungen mit Achsen und Einheiten; begründet Steigung, Krümmung und die Übereinstimmung der Ortsänderungen mit t-v-Flächen ohne Differentialrechnung.
  - Observable performance (EN): Constructs consistent t-s, t-v, and t-a representations from fresh motion data with axes and units; explains slope, concavity, and agreement of displacement with t-v areas without calculus.
- `zero-velocity-and-validity`
  - Essential understanding (DE): v = 0 zu einem Zeitpunkt bedeutet nicht a = 0. Die Darstellungen beschreiben das angegebene Modellintervall und belegen allein keinen bestimmten Kraftmechanismus.
  - Essential understanding (EN): v = 0 at one instant does not mean a = 0. The representations describe the stated model interval and alone do not establish a particular force mechanism.
  - Observable performance (DE): Sagt bei geänderter Bewegungs- oder Beschleunigungsrichtung den Graphenverlauf voraus und erklärt einen möglichen Stillstandsmoment bei fortbestehender Beschleunigung; begrenzt die Aussage auf das Modellintervall.
  - Observable performance (EN): Predicts graph behavior when motion or acceleration direction changes and explains a possible instant of rest with continuing acceleration; limits the claim to the model interval.

**Coverage expectations**

- required expectations: `constant-acceleration`, `linked-three-graphs`, `zero-velocity-and-validity`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `relative-signs`: Geschwindigkeit und Beschleunigung gleichgerichtet gegenüber entgegengerichtet, einschließlich eines Richtungswechsels. / Velocity and acceleration in the same versus opposite directions, including a reversal.
- `starting-representation`: Orts- und Geschwindigkeitsdaten gegenüber einer beschriebenen t-v-Geraden als Ausgangsdarstellung. / Position and velocity data versus a described straight t-v graph as the starting representation.

**Application cases**

- `starting-from-rest`
  - Task demand (DE): Für ein Wagenmodell von 0 bis 3 s gelten bei t = 0; 1; 2; 3 s die Orte 0,20; 0,40; 1,00; 2,00 m und Geschwindigkeiten 0; 0,40; 0,80; 1,20 m/s. Erstelle und erkläre die drei Zeitdiagramme.
  - Task demand (EN): For a cart model from 0 to 3 s, at t = 0, 1, 2, 3 s positions are 0.20, 0.40, 1.00, 2.00 m and velocities are 0, 0.40, 0.80, 1.20 m/s. Construct and explain the three time graphs.
  - Expected performance (DE): Ermittelt a = +0,40 m/s², zeichnet t-v linear steigend, t-a konstant positiv und t-s zunehmend steil, nach oben gekrümmt. Prüft etwa Δs von 1 bis 2 s = 0,60 m an der Trapezfläche; erklärt, warum v(0) = 0 keine fehlende Beschleunigung bedeutet.
  - Expected performance (EN): Finds a = +0.40 m/s² and draws linearly increasing t-v, constant positive t-a, and increasingly steep, concave-up t-s. Checks, for example, Δs from 1 to 2 s = 0.60 m using the trapezoid area; explains why v(0) = 0 does not mean absent acceleration.
  - Understanding focus (DE): Konstante Beschleunigung bedeutet gleiche Geschwindigkeitszuwächse, bei wachsendem Geschwindigkeitsbetrag aber wachsende Ortszuwächse.
  - Understanding focus (EN): Constant acceleration means equal velocity increments, but increasing position increments when speed increases.
- `deceleration-through-reversal`
  - Task demand (DE): Ein t-v-Graph verläuft für 0 bis 4 s geradlinig von +1,0 auf −1,0 m/s; s(0) = 0. Entwickle unabhängig passende t-s- und t-a-Darstellungen und beschreibe die Bewegung vor und nach v = 0.
  - Task demand (EN): A t-v graph runs straight from +1.0 to −1.0 m/s over 0 to 4 s; s(0) = 0. Independently develop matching t-s and t-a representations and describe motion before and after v = 0.
  - Expected performance (DE): Erhält a = −0,50 m/s² und t-s-Punkte bei t = 0; 1; 2; 3; 4 s von 0; 0,75; 1,00; 0,75; 0 m. Erklärt Abbremsen bis 2 s, danach schnelleres Rückwärtsfahren, ein Ortsmaximum bei 2 s und durchgehend negatives a.
  - Expected performance (EN): Obtains a = −0.50 m/s² and t-s points at t = 0, 1, 2, 3, 4 s of 0, 0.75, 1.00, 0.75, 0 m. Explains slowing until 2 s, then increasing backward speed, a position maximum at 2 s, and negative a throughout.
  - Understanding focus (DE): Negatives a ist mit Abbremsen und mit wachsendem Geschwindigkeitsbetrag vereinbar; alle drei Diagramme müssen denselben Richtungswechsel darstellen.
  - Understanding focus (EN): Negative a can describe both slowing and increasing speed; all three graphs must represent the same reversal.
