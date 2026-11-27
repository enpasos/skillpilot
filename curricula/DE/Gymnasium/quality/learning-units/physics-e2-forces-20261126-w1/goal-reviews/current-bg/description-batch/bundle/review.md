# AI review input: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

- Book ID: `physics-e2-forces-bg-20261126-description`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:a8dbb2430cd55ca0506f01e42c13e98e7090a168317eb17828f17ad86e27ef2f`
- Selected goals: 5

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Kräfte auf einer Linie bilanzieren

- Full learning-goal ID: `6ba20688-8cbf-5db1-bda8-346893798d2f`
- Goal fingerprint: `sha256:fa1c7a89e460e20c899ec41794de458cf44953cff3ae6ada41248705a014bdf2`
- Page fingerprint: `sha256:b44d8fe4baf61ffc759c01213a3eff4f9cbf09de93aa1283c64ed1f017c253d6`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann für einen gewählten Körper eine positive Richtung festlegen, seine kollinearen äußeren Kräfte mit Vorzeichen addieren und die resultierende Kraft bestimmen. Bei einer von null verschiedenen Summe gibt sie auch deren Richtung an. Sie erklärt, warum die Kraftsumme null zu Ruhe wie zu geradlinig gleichförmiger Bewegung passt. In der Skizze beginnen die Kraftpfeile am Körper. Ihre Länge liest sie am angegebenen Kraftmaßstab ab.

### Visualization

/assets/goal-visualizations/physik/6ba20688-8cbf-5db1-bda8-346893798d2f/6ba20688-8cbf-5db1-bda8-346893798d2f.jpg

- original digest: `sha256:44693ef3627170d5930ca1914dba4162fa8367bed41afd88e7bf382d21b5f5c3`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Geradlinige Bewegung mit Reibung modellieren — `30ddb2d7-b991-55fe-9e74-37ffe1048f9f` (page 4)

### Prerequisites outside this book

- Ganze Zahlen addieren — `4b67bed9-06da-40b2-a306-24e9e7dfd390` (outside this book)
- Kräfte und Trägheit qualitativ erklären — `5ea765ac-c279-551a-8a94-a07da2381e5b` (outside this book)
- Pfeile für gerichtete Größen lesen und zeichnen — `b77a7e93-22f9-5722-a4cc-f18a149ab030` (outside this book)

### Direct reverse prerequisites outside this book

- Grundlagenaufgaben zu Newton, Energie und Impuls lösen — `be6d4895-65ab-545b-8df9-84e5a308a5e3` (outside this book)
- Prüfungsaufgabe: Kräfte an einem Wagen auf einer Linie bilanzieren — `d513289a-80a3-5e48-95d3-5791736cddba` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4ff347b30a49225f90c7991b7709abb8bceab867bfb0e5d91f38871ed1254789`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `one-body`
  - Essential understanding (DE): In die Summe gehen nur äußere Kräfte auf den gewählten Körper ein. Ihr Vorzeichen hängt von der positiven Achsenrichtung ab.
  - Essential understanding (EN): Only external forces on the chosen body enter the sum. Their signs depend on the positive axis.
  - Observable performance (DE): Die Person ordnet die Kräfte dem Körper zu und ermittelt die vorzeichenbehaftete Summe.
  - Observable performance (EN): The learner identifies the forces on the body and obtains their signed sum.
- `motion`
  - Essential understanding (DE): Eine verschwindende Resultierende ist mit Ruhe und mit konstanter Geschwindigkeit auf einer Geraden vereinbar. Eine von null verschiedene Summe besitzt eine Richtung relativ zur gewählten Achse.
  - Essential understanding (EN): Zero net force is consistent both with rest and with constant velocity along a line. A nonzero sum points in a direction relative to the chosen axis.
  - Observable performance (DE): Die Person begründet beide möglichen Bewegungszustände bei verschwindender Resultierender und deutet die Richtung einer von null verschiedenen Summe auch bei umgekehrter Achse.
  - Observable performance (EN): The learner explains both states of motion possible at zero net force and interprets the direction of a nonzero sum even when the axis is reversed.

**Coverage expectations**

- required expectations: `one-body`, `motion`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `axis`: Vorzeichenachse oder Bewegungsrichtung umkehren. / Reverse the positive axis or the direction of motion.
- `object`: Wagen und Zugseil als verschiedene Körper kennzeichnen. / Distinguish the cart from the rope pulling it.

**Application cases**

- `towing`
  - Task demand (DE): Ein Seil zieht einen Wagen mit 8 N nach Osten, zwei weitere äußere Kräfte wirken mit 3 N und 5 N nach Westen. Der Wagen zieht mit 8 N am Seil. Wähle den Wagen und eine Achse. Was folgt für einen anfangs ruhenden und einen nach Westen rollenden Wagen, solange die angegebenen Kräfte so wirken?
  - Task demand (EN): A rope pulls a cart east with 8 N; two other external forces act west with 3 N and 5 N. The cart pulls on the rope with 8 N. Choose the cart and an axis. Compare a cart initially at rest and one rolling west while the stated forces persist.
  - Expected performance (DE): Bei Osten positiv gilt +8−3−5=0 N. Die Kraft auf das Seil entfällt. Solange die Kräfte so wirken, bleibt der eine Wagen in Ruhe und der andere rollt gleichförmig nach Westen.
  - Expected performance (EN): With east positive, +8−3−5=0 N. Exclude the force on the rope. While these forces persist, the stationary cart stays at rest and the other rolls west at constant speed.
  - Understanding focus (DE): Körperauswahl und zwei Bewegungszustände bei Gleichgewicht.
  - Understanding focus (EN): Isolate one body and distinguish two states of equilibrium.
- `reverse`
  - Task demand (DE): Ein Foto zeigt am Wagen einen 3 Teilstriche langen Kraftpfeil nach links und einen 1 Teilstrich langen nach rechts, beide vom Wagen aus. Ein Teilstrich entspricht 2 N. Der Wagen fährt nach links. Bestimme die Resultierende bei positiver Achse nach rechts, dann nach links.
  - Task demand (EN): At the cart two force arrows start on it. The leftward arrow spans three divisions, the rightward one spans one. Each division represents 2 N. The cart travels left. Calculate the net force with right positive and with left positive.
  - Expected performance (DE): Rechts positiv ergibt −6+2=−4 N; links positiv +6−2=+4 N. Die Kraft wirkt jeweils nach links.
  - Expected performance (EN): With right positive, −6+2=−4 N; with left positive, +6−2=+4 N. In both cases the net force points left.
  - Understanding focus (DE): Die physikalische Kraftrichtung bleibt bei umgekehrter Koordinatenrichtung gleich.
  - Understanding focus (EN): The physical force direction is invariant under reversal of the coordinate axis.
## Page 2: Die Gewichtskraft am Hang zeichnerisch zerlegen

- Full learning-goal ID: `77b44d13-4368-5950-a943-decb377c7302`
- Goal fingerprint: `sha256:de50c603d0d1ae1b6e83e4e1c341ab1ee758376845c7f745d7b1011d4d5ca7b4`
- Page fingerprint: `sha256:7db31d2f181db668a2fc3861fcfd4e24953515c84289dbb923e43d0a8c32c162`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann am Körper den Gewichtskraftpfeil ansetzen und seine Komponenten parallel und senkrecht zur geneigten Ebene maßstäblich konstruieren. Sie liest die Beträge am Kraftmaßstab ab und prüft, dass ihre Vektorsumme den ursprünglichen Pfeil ergibt.

### Visualization

/assets/goal-visualizations/physik/77b44d13-4368-5950-a943-decb377c7302/77b44d13-4368-5950-a943-decb377c7302.jpg

- original digest: `sha256:167ad565c69d50908b0169b5641dfbe55262ea8e3c9b95fb82410c7121a4c374`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Kräfte vektoriell zusammensetzen und Resultierende bestimmen — `41d35667-0296-5f84-bc12-202ffc440be0` (outside this book)
- Masse und Gewichtskraft unterscheiden — `9c328f68-41ed-55dd-9e02-34414a6246f2` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Gewichtskraft am Hang maßstäblich zerlegen — `4af06e7e-c566-566d-bc99-53ada98fbf0e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:80241f68235d9b50be22068b0e38095a4a84574f578f7b80a8da1f119c2e3ef9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `geometric-components`
  - Essential understanding (DE): Gewicht und Gewichtskomponenten gehören zum selben Körper. Eine Komponente verläuft hangabwärts, die andere senkrecht in die Ebene.
  - Essential understanding (EN): Weight and its components belong to the same body. One component points downhill and the other perpendicular into the plane.
  - Observable performance (DE): Die Person konstruiert aus einem lotrechten Gewichtspfeil beide Komponenten mit Parallelen zu den Achsen.
  - Observable performance (EN): The learner constructs both components of a vertical weight arrow using lines parallel to the axes.
- `check`
  - Essential understanding (DE): Die Vektorsumme der Komponenten ergibt den Gewichtspfeil. Die Normalkraft des Kontakts ist eine eigenständige Kraft.
  - Essential understanding (EN): The components add to the weight vector. The contact normal force is a separate force.
  - Observable performance (DE): Sie liest beide Beträge am Kraftmaßstab ab, ergänzt das Parallelogramm und unterscheidet die Kontaktkraft von der Gewichtskomponente.
  - Observable performance (EN): They read both magnitudes using the force scale, complete the parallelogram and distinguish the contact force from the weight component.

**Coverage expectations**

- required expectations: `geometric-components`, `check`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `slope`: Neigung und Hangrichtung ändern. / Vary slope angle and orientation.
- `scale`: Gewicht und Kraftmaßstab unabhängig variieren. / Vary weight and force scale independently.

**Application cases**

- `ramp`
  - Task demand (DE): Zeige eine Rampe, die auf vier waagerechte Kästchen um drei Kästchen ansteigt. Auf ihr liegt ein Klotz mit Gewicht 50 N. Ein Teilstrich des getrennten Kraftmaßstabs bedeutet 10 N. Konstruiere grafisch und kontrolliere beide Komponenten.
  - Task demand (EN): Show a ramp rising three grid squares for every four horizontal squares. A block on it weighs 50 N. A division on the separate force scale represents 10 N. Construct both components graphically and check them.
  - Expected performance (DE): Am Körper entsteht ein lotrechter Gewichtspfeil über fünf Kraftteilungen. Parallelen ergeben etwa 30 N hangabwärts und 40 N senkrecht hinein. Das Parallelogramm schließt am Ende des ursprünglichen Pfeils.
  - Expected performance (EN): Draw a vertical weight arrow of five force divisions at the body. Parallels yield about 30 N downhill and 40 N into the plane. The parallelogram closes at the original tip.
  - Understanding focus (DE): Grafischer Maßstab und invertierte Vektoraddition.
  - Understanding focus (EN): Use the force scale to reverse vector addition.
- `mirror`
  - Task demand (DE): Spiegle die Rampe nach links und baue sie steiler: vier Höhenkästchen auf drei waagerechte. Ein Körper wiegt 25 N, ein Kraftteilstrich bedeutet 5 N. Zeichne das Gewicht und seine Komponenten. Ist die senkrechte Gewichtskomponente bereits die Kontakt-Normalkraft der Unterlage? Begründe.
  - Task demand (EN): Mirror the ramp and make it steeper: four grid squares vertically for every three horizontally. The body weighs 25 N and a force division represents 5 N. Draw weight and components. Is the perpendicular weight component already the surface's contact normal force? Explain.
  - Expected performance (DE): Grafisch rund 20 N hangabwärts, 15 N senkrecht in die Fläche. Die Rückaddition ergibt 25 N lotrecht nach unten. Die Kontakt-Normalkraft wirkt aus der Ebene und wird nicht zu den beiden Gewichtskomponenten mitaddiert, wenn das Gewicht rekonstruiert wird.
  - Expected performance (EN): Measure about 20 N downhill and 15 N into the surface. Their sum gives 25 N vertically down. The contact normal points out of the plane and is separate when reconstructing weight.
  - Understanding focus (DE): Gedrehter Kontext und Kontaktkraft.
  - Understanding focus (EN): Transfer the construction and distinguish the contact force.
## Page 3: Grundgleichung der Mechanik anwenden

- Full learning-goal ID: `5f289cdc-fda1-4058-b44f-041ba1398e79`
- Goal fingerprint: `sha256:ae7f6d8977ab11ef78ac9f4d8d7030792d75085636eac73375b9598b7093d5a5`
- Page fingerprint: `sha256:eac29070b4f7b4309d4ab68d7115d0ee78485d6cf5ec30ee57a81f5241f7bd73`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann für einfache eindimensionale Bewegungen eines Körpers konstanter Masse in einem Inertialsystem bei gegebener Resultierenden oder gegebener Beschleunigung die Beziehung $\sum F_\mathrm{ext}=m\cdot a$ mit einer gewählten Vorzeichenrichtung anwenden und Kräftegleichgewicht ($\sum F_\mathrm{ext}=0$) von beschleunigter Bewegung unterscheiden.

### Visualization

/assets/goal-visualizations/physik/5f289cdc-fda1-4058-b44f-041ba1398e79/5f289cdc-fda1-4058-b44f-041ba1398e79.jpg

- original digest: `sha256:a40495487cbf56bf854c1844aaf66b90b5f5b2cc08eaa5cedd7f03f858ab588f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Newtons 2. Axiom (Grundgleichung der Mechanik) — `a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20` (outside this book)

### Direct reverse prerequisites outside this book

- Mechanische Arbeit als Energieänderung — `c1c71daa-042b-4f4c-8c31-0ac366f5149e` (outside this book)
- Impulserhaltung aus Newtonschen Axiomen (LK) — `f524f05c-4456-4fc3-a1f7-f40741fc1f16` (outside this book)
- Zentripetalkraft als Resultierende herleiten — `e918b31f-6f39-5dee-ade6-3617080fb24f` (outside this book)
- Reibungskräfte qualitativ verstehen — `5fd45dbc-0eb1-591b-99a9-7386336f1456` (outside this book)
- Fallbewegung mit Luftwiderstand und Grenzgeschwindigkeit — `12260012-cf04-5409-b57d-f5b3a46d9126` (outside this book)
- Grenzen der Vorhersagbarkeit (Chaos) — `76fd0ab2-079a-516e-a33b-170355336d40` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:260366d765e3aa4d38f07d71a404639c473a805f71eb61e3886a4a57bfaa838a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `given-net-force`
  - Essential understanding (DE): Die Beschleunigung eines Körpers konstanter Masse im Inertialsystem folgt aus der gegebenen resultierenden Kraft und seiner Masse.
  - Essential understanding (EN): For a constant-mass body in an inertial frame, the given net force and mass determine the acceleration.
  - Observable performance (DE): Die Person berechnet mit festgelegter Achse die Beschleunigung aus der Resultierenden oder umgekehrt die Resultierende aus der Beschleunigung.
  - Observable performance (EN): The learner declares an axis and obtains acceleration from net force or net force from acceleration.
- `equilibrium`
  - Essential understanding (DE): Eine resultierende Kraft von null ist mit jeder konstanten Geschwindigkeit vereinbar. Bei gleichem Kraftbetrag ist die Beschleunigung umgekehrt proportional zur Masse.
  - Essential understanding (EN): Zero net force is consistent with any constant velocity. At equal net force, acceleration is inversely proportional to mass.
  - Observable performance (DE): Sie vergleicht zwei Massen oder Achsenrichtungen und deutet den Sonderfall der verschwindenden Resultierenden.
  - Observable performance (EN): They compare two masses or axis choices and interpret zero net force.

**Coverage expectations**

- required expectations: `given-net-force`, `equilibrium`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `sign`: Positive Achse oder Anfangsgeschwindigkeit umkehren. / Reverse the positive axis or initial velocity.
- `inverse`: Kraft und Beschleunigung wechselseitig als gegeben einsetzen. / Alternate between given force and given acceleration.

**Application cases**

- `lift`
  - Task demand (DE): Ein 400-kg-Aufzug fährt aufwärts. Die resultierende äußere Kraft ist gegeben und beträgt 800 N nach unten. Wähle aufwärts positiv. Berechne die Beschleunigung, deute die Bewegung und vergleiche mit einer Resultierenden von null.
  - Task demand (EN): A 400 kg lift moves upwards. The given net external force is 800 N downwards. Take up as positive. Find its acceleration, interpret its motion and compare with zero net force.
  - Expected performance (DE): a=−800/400 m/s²=−2 m/s². Zunächst wird der Aufzug langsamer. Bei einer Resultierenden von null fährt er mit unveränderter Geschwindigkeit weiter.
  - Expected performance (EN): a=−800/400 m/s²=−2 m/s². The rising lift initially slows down. With zero net force it continues at constant velocity.
  - Understanding focus (DE): Vorzeichen der Beschleunigung gegenüber der Geschwindigkeit.
  - Understanding focus (EN): Sign of acceleration versus velocity.
- `reverse`
  - Task demand (DE): Im Labor beschleunigt ein 2-kg-Wagen mit 3 m/s² nach links. Bestimme die nötige resultierende Kraft und die Beschleunigung eines 4-kg-Wagens unter derselben Kraft. Kehre die positive Richtung um.
  - Task demand (EN): In a laboratory a 2 kg cart accelerates left at 3 m/s². Find the required net force and the acceleration of a 4 kg cart under the same force. Reverse the positive direction.
  - Expected performance (DE): Bei rechts positiv: −6 N bzw. −1,5 m/s². Bei links positiv: +6 N bzw. +1,5 m/s². Die physikalischen Richtungen bleiben gleich.
  - Expected performance (EN): With right positive the results are −6 N and −1.5 m/s². With left positive they are +6 N and +1.5 m/s². Their physical directions are unchanged.
  - Understanding focus (DE): Umkehraufgabe und Trägheit.
  - Understanding focus (EN): Inverse problem and inertia.
## Page 4: Geradlinige Bewegung mit Reibung modellieren

- Full learning-goal ID: `30ddb2d7-b991-55fe-9e74-37ffe1048f9f`
- Goal fingerprint: `sha256:bd202f6b04ea79c9f533b80d1603e4f0f3764d3bcfb98815541e425bfe804418`
- Page fingerprint: `sha256:f0ba064b7e4cb42f0c9a20c0c7eeb1e502012a8b809d46b4f533bfc31944dd00`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann geradlinige Bewegungen mit Reibung unter klar benannten einfachen Modellannahmen modellieren, indem sie die wirkenden Kräfte mit einer konsistent gewählten positiven Richtung bilanziert, aus der resultierenden Kraft die Beschleunigung bestimmt und den Bewegungsverlauf mit passenden einfachen Bewegungsgleichungen beschreibt und qualitativ vorhersagt.

### Visualization

/assets/goal-visualizations/physik/30ddb2d7-b991-55fe-9e74-37ffe1048f9f/30ddb2d7-b991-55fe-9e74-37ffe1048f9f.jpg

- original digest: `sha256:42fe079d127a52d36f28934e12c0e1e94b0812d09bc8ebad7f4419fb38efdb33`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Kräfte auf einer Linie bilanzieren — `6ba20688-8cbf-5db1-bda8-346893798d2f` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Reibungskräfte qualitativ verstehen — `5fd45dbc-0eb1-591b-99a9-7386336f1456` (outside this book)

### Direct reverse prerequisites outside this book

- Methode: Modellbildung mit Tabellenkalkulation — `ac25ffe3-fd42-592d-a937-79cc13460313` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:70aadac347487be3bba22ffe2481f321aff87f49b90be4e97dcf57c7b658e5de`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `explicit-one-dimensional-model`
  - Essential understanding (DE): Ein einfaches Modell geradliniger Bewegung legt System, Bewegungsachse, positive Richtung und vereinfachende Annahmen fest. Bewegungsgleichungen mit konstanter Beschleunigung gelten nur in einem Zeitabschnitt, in dem Masse und resultierende Kraft beziehungsweise Beschleunigung als konstant behandelt werden dürfen.
  - Essential understanding (EN): A simple model of rectilinear motion specifies the system, motion axis, positive direction, and simplifying assumptions. Constant-acceleration equations apply only over an interval in which mass and the net force or acceleration may be treated as constant.
  - Observable performance (DE): Die lernende Person benennt für eine neue Reibungssituation den betrachteten Körper, wählt eine Achse und positive Richtung, nennt die für das einfache Modell vernachlässigten oder konstant gesetzten Größen und begrenzt die verwendete Bewegungsgleichung auf den passenden Zeitabschnitt.
  - Observable performance (EN): For a new friction situation, the learner identifies the body considered, chooses an axis and positive direction, states which quantities are neglected or held constant in the simple model, and limits the equation of motion to the appropriate time interval.
- `directed-force-balance-to-acceleration`
  - Essential understanding (DE): Betrag und Richtung jeder Kraft werden relativ zur gewählten Achse durch Vorzeichen erfasst. Ihre gerichtete Summe ist die resultierende Kraft und bestimmt über F_res = ma Betrag und Richtung der Beschleunigung; die Reibungsrichtung folgt dem jeweiligen relativen Gleiten.
  - Essential understanding (EN): The magnitude and direction of each force are represented by signs relative to the chosen axis. Their directed sum is the net force and, through F_net = ma, determines the magnitude and direction of acceleration; the friction direction follows the current relative sliding.
  - Observable performance (DE): Die lernende Person erstellt eine richtungskonsistente Kräftebilanz, bestimmt resultierende Kraft und Beschleunigung mit Vorzeichen und Einheiten und prüft ihre Richtung an einem Kraftbild oder einer verbalen Prognose.
  - Observable performance (EN): The learner constructs a direction-consistent force balance, determines net force and acceleration with signs and units, and checks their direction against a force diagram or verbal prediction.
- `connect-acceleration-and-motion-course`
  - Essential understanding (DE): Die Beschleunigungsrichtung allein gibt nicht die momentane Bewegungsrichtung an. Beschleunigung gleichgerichtet zur Geschwindigkeit vergrößert deren Betrag, entgegengerichtete Beschleunigung verringert ihn; beim Stillstand oder Richtungswechsel muss die Reibungsrichtung und damit gegebenenfalls das Gleichungsstück neu bestimmt werden.
  - Essential understanding (EN): The acceleration direction alone does not give the current direction of motion. Acceleration in the same direction as velocity increases its magnitude, whereas opposite acceleration decreases it; at rest or reversal, the friction direction and hence, where necessary, the equation segment must be determined anew.
  - Observable performance (DE): Die lernende Person nutzt passende einfache Bewegungsgleichungen, um Geschwindigkeit und Ort qualitativ oder quantitativ vorherzusagen, vergleicht dabei die Vorzeichen von Geschwindigkeit und Beschleunigung und erkennt einen Zeitpunkt, an dem das bisherige Modellstück wegen Stillstand oder Richtungswechsel neu angesetzt werden muss.
  - Observable performance (EN): The learner uses appropriate simple equations of motion to predict velocity and position qualitatively or quantitatively, compares the signs of velocity and acceleration, and identifies a time at which the current model segment must be reformulated because of stopping or reversal.

**Coverage expectations**

- required expectations: `explicit-one-dimensional-model`, `directed-force-balance-to-acceleration`, `connect-acceleration-and-motion-course`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `initial-motion`: Start aus der Ruhe oder Anfangsgeschwindigkeit gleich- beziehungsweise entgegengerichtet zur Beschleunigung / Start from rest or initial velocity in the same or opposite direction as acceleration
- `directed-force-balance`: Zugkraft größer, gleich oder kleiner als die entgegengerichtete Reibungskraft / Pulling force greater than, equal to, or smaller than the opposing frictional force
- `model-interval`: Ein Zeitabschnitt mit konstanter Kraftrichtung oder ein Richtungswechsel, an dem Reibung und Gleichung neu angesetzt werden müssen / One interval with constant force direction or a reversal at which friction and the equation must be reformulated
- `representation-check`: Kräftebild, Geschwindigkeits-Zeit-Verlauf oder verbale Bewegungsprognose als unabhängige Kontrolle / Force diagram, velocity-time course, or verbal motion prediction as an independent check

**Application cases**

- `sled-pulled-from-rest`
  - Task demand (DE): Ein Schlitten der Masse 3,0 kg startet auf einer horizontalen Strecke aus der Ruhe. Die maximale Haftkraft liegt unter 12 N, sodass ab dem Start Gleiten einsetzt. Eine konstante Zugkraft von 12 N wirkt nach rechts, die Gleitreibung von 3 N nach links. Wähle eine Achse, formuliere die Modellannahmen, bilanziere die Kräfte und sage mit passenden einfachen Bewegungsgleichungen Geschwindigkeit und Ort nach 2,0 s voraus. Prüfe Richtung, Vorzeichen und Einheiten.
  - Task demand (EN): A 3.0 kg sled starts from rest on a horizontal track. The maximum static friction is below 12 N, so sliding begins at release. A constant pulling force of 12 N acts to the right and sliding friction of 3 N to the left. Choose an axis, state the model assumptions, balance the forces, and use appropriate simple equations of motion to predict velocity and position after 2.0 s. Check direction, signs, and units.
  - Expected performance (DE): Die lernende Person wählt rechts positiv, behandelt Schlitten, Masse und horizontale Kräfte im betrachteten Zeitintervall als konstant und erhält F_res = 9 N sowie a = 3,0 m/s² nach rechts. Mit v_0 = 0 bestimmt sie v(2 s) = 6,0 m/s und x(2 s) - x_0 = 6,0 m. Kraftbild, positive Ergebnisse und Einheiten stimmen mit der qualitativen Prognose einer beschleunigten Bewegung nach rechts überein.
  - Expected performance (EN): The learner chooses right as positive, treats the sled, mass, and horizontal forces as constant over the interval considered, and obtains F_net = 9 N and a = 3.0 m/s² to the right. With v_0 = 0, the learner determines v(2 s) = 6.0 m/s and x(2 s) - x_0 = 6.0 m. The force diagram, positive results, and units agree with the qualitative prediction of accelerated motion to the right.
  - Understanding focus (DE): Der direkte Fall prüft die vollständige Kette von Modellannahmen über gerichtete Kräftebilanz bis zur konsistenten Bewegungsprognose, nicht bloß das Einsetzen in eine Formel.
  - Understanding focus (EN): The direct case tests the complete chain from modelling assumptions through directed force balance to a consistent motion prediction, not merely substitution into a formula.
- `cart-stops-and-reverses`
  - Task demand (DE): Ein Wagen der Masse 4,0 kg gleitet anfangs mit v_0 = -4,0 m/s nach links. Eine konstante äußere Kraft von 6 N wirkt nach rechts; die Gleitreibung hat den Betrag 2 N und wirkt jeweils entgegen der Bewegung relativ zum Boden. Rechts sei positiv. Sage den Bewegungsverlauf voraus, bestimme den Stillstandszeitpunkt und erkläre, wie Kräftebilanz und Bewegungsgleichung bei einer anschließenden Bewegung nach rechts neu angesetzt werden müssen.
  - Task demand (EN): A 4.0 kg cart initially slides to the left with v_0 = -4.0 m/s. A constant external force of 6 N acts to the right; sliding friction has magnitude 2 N and always acts opposite the motion relative to the ground. Take right as positive. Predict the course of motion, determine the stopping time, and explain how the force balance and equation of motion must be reformulated if motion subsequently proceeds to the right.
  - Expected performance (DE): Solange der Wagen nach links gleitet, wirken äußere Kraft und Reibung beide nach rechts: F_res = 8 N, a = 2,0 m/s² und v(t) = -4,0 m/s + 2,0 m/s² · t. Die Geschwindigkeit ist zunächst negativ und nimmt im Betrag ab; bei t = 2,0 s steht der Wagen. Für anschließendes Gleiten nach rechts kehrt die Reibung ihre Richtung um, sodass F_res = 6 N - 2 N = 4 N und a = 1,0 m/s² gelten; die zweite Gleichung beginnt am Übergangszeitpunkt mit den dortigen Anfangswerten. Ob der Wagen nach dem Stillstand tatsächlich nach rechts zu gleiten beginnt, lässt sich ohne Angabe der Haftgrenze nicht entscheiden.
  - Expected performance (EN): While the cart slides left, the external force and friction both act to the right: F_net = 8 N, a = 2.0 m/s², and v(t) = -4.0 m/s + 2.0 m/s² · t. The velocity is initially negative and decreases in magnitude; the cart stops at t = 2.0 s. For subsequent sliding to the right, friction reverses direction, so F_net = 6 N - 2 N = 4 N and a = 1.0 m/s²; the second equation begins at the transition time with the values then applicable. Without the static friction limit, one cannot decide whether the cart actually starts sliding right after it stops.
  - Understanding focus (DE): Der unabhängige Transfer trennt Bewegungs- und Beschleunigungsrichtung und erzwingt beim Richtungswechsel eine neue Reibungsrichtung sowie ein neues gültiges Modellstück.
  - Understanding focus (EN): The independent transfer separates velocity and acceleration directions and requires a new friction direction and a new valid model segment at reversal.
## Page 5: Kurvenfahrten mit Haftreibung analysieren

- Full learning-goal ID: `e2da5eec-45de-5527-9ad7-16f41cacbe58`
- Goal fingerprint: `sha256:08e6479d94eea0a4344fad2bb638a063b2df325946f2d03de7c968a237b7b06d`
- Page fingerprint: `sha256:3c4dabe36a2526d065db13fc80221e3a23938db103ffe857eebf21e069c83057`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann für eine gleichförmige Kurvenfahrt auf ebener Fahrbahn ohne tangentiale Antriebs- oder Bremskraft die erforderliche Haftkraft mv²/r bestimmen und mit einem vorgegebenen verfügbaren Höchstwert vergleichen. Sie erklärt, dass die Haftkraft am Fahrzeug zum Kreismittelpunkt wirkt, hier die Zentripetalkraft liefert und sich bis zur Haftgrenze dem Bedarf anpasst.

### Visualization

/assets/goal-visualizations/physik/e2da5eec-45de-5527-9ad7-16f41cacbe58/e2da5eec-45de-5527-9ad7-16f41cacbe58.jpg

- original digest: `sha256:f92783a92f5902ff4dde48ae12b1268981cfc78701b84a75281f7ef1ffcc9d2d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Kreisbewegung mit Zentripetalkraft anwenden — `accb1d9e-cd48-5983-bcef-9b9bca4a9114` (outside this book)
- Reibungskräfte qualitativ verstehen — `5fd45dbc-0eb1-591b-99a9-7386336f1456` (outside this book)

### Direct reverse prerequisites outside this book

- Kreisbewegung, Gravitation und Gasmodell — `5773ccbe-cd20-5ba0-99a5-7ccd5f42be51` (outside this book)
- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Überhöhte Kurve und Grenzgeschwindigkeiten — `8320bb17-e6ab-50ea-a965-aa331bfd33e1` (outside this book)
- Mehrschrittige Bewegungsmodelle mit Reibung und Chaos analysieren — `dd99528a-bae5-5b78-89e6-c6092c927f8d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7d2ea1e21573643d3902987047269afd726f8a745c35a855fe38aadd6e96c345`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `turning`
  - Essential understanding (DE): Auf ebener Fahrbahn liefert in einer stationären Kurvenfahrt ohne Antrieb oder Bremsung die Haftreibung die horizontale Kraft zum Kreismittelpunkt.
  - Essential understanding (EN): On a level road during a steady turn without braking or driving force, static friction supplies the horizontal inward force.
  - Observable performance (DE): Die Person berechnet den Bedarf aus Masse, Geschwindigkeit und Radius und benennt die Richtung.
  - Observable performance (EN): The learner obtains the required inward force from mass, speed and radius.
- `available`
  - Essential understanding (DE): Die für die Kurve erforderliche Haftkraft muss innerhalb des verfügbaren Höchstwerts liegen. Unterhalb der Grenze passt sich die Haftkraft dem Bedarf an.
  - Essential understanding (EN): The required static friction must fit within its available maximum. Below the limit, static friction adjusts to the demand.
  - Observable performance (DE): Sie vergleicht Bedarf und gegebene Grenze und begründet eine mögliche Änderung von Tempo oder Radius.
  - Observable performance (EN): They compare demand with the given limit and justify how a change of speed or radius would help.

**Coverage expectations**

- required expectations: `turning`, `available`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `road`: Gemessene Höchstkraft je nach Fahrbahnbelag angeben. / Give the measured maximum for different road surfaces.
- `criterion`: Bei gegebenem Radius Tempo prüfen oder bei gegebenem Tempo Mindestradius bestimmen. / Check speed for a given radius or obtain the minimum radius for a given speed.

**Application cases**

- `track`
  - Task demand (DE): Ein 800-kg-Fahrzeug fährt auf einem ebenen Kreis mit Radius 40 m bei 10 m/s. Der gemessene Höchstbetrag der seitlichen Haftkraft beträgt 2500 N. Berechne die tatsächliche Kraft und prüfe, ob 12 m/s möglich wären.
  - Task demand (EN): An 800 kg vehicle takes a steady level turn of radius 40 m at 10 m/s. The measured maximum lateral static force is 2500 N. Find the actual force and test a speed of 12 m/s.
  - Expected performance (DE): Benötigt und verfügbar sind bei 10 m/s 2000 N nach innen bzw. höchstens 2500 N. Bei 12 m/s wären 2880 N erforderlich; die vorgegebene Kreisbahn ist damit nicht haltbar.
  - Expected performance (EN): At 10 m/s 2000 N inward is needed and supplied, below the available 2500 N. At 12 m/s 2880 N would be required, so the same steady turn cannot be maintained.
  - Understanding focus (DE): Tatsächliche Kraft gegen vorgegebenen Höchstwert prüfen.
  - Understanding focus (EN): Distinguish actual force from its stated maximum.
- `radius`
  - Task demand (DE): Eine 500-kg-Versuchsplattform fährt bei 6 m/s eine ebene Kurve. Seitlich stehen höchstens 900 N zur Verfügung. Bestimme den kleinsten Radius, bei dem Haften möglich ist, und vergleiche die Kraft bei doppeltem Radius.
  - Task demand (EN): A 500 kg experimental vehicle makes a level turn at 6 m/s. At most 900 N of lateral force is available. Find the minimum radius permitting a steady turn without sliding and compare the force at twice that radius.
  - Expected performance (DE): Der Mindestwert ist 500·36/900 m=20 m. Bei 20 m ist die Grenze erreicht, Haften ist möglich. Bei 40 m genügen 450 N zum Kreismittelpunkt.
  - Expected performance (EN): The minimum is 500×36/900 m=20 m. At 20 m the limit is reached and sticking is possible. At 40 m only 450 N inward is needed.
  - Understanding focus (DE): Grenzfall und umgekehrte Abhängigkeit vom Radius.
  - Understanding focus (EN): Limiting case and inverse dependence on radius.
