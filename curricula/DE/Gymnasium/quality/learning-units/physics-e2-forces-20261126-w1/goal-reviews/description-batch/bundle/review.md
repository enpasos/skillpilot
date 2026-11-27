# AI review input: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

- Book ID: `physics-e2-forces-w1-20261126-description`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:a8a5613c187ee916d463ef70496f1fdf40f95e7519659034766c74023f431ea7`
- Selected goals: 7

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Kräfte auf einer Linie bilanzieren

- Full learning-goal ID: `6ba20688-8cbf-5db1-bda8-346893798d2f`
- Goal fingerprint: `sha256:fa1c7a89e460e20c899ec41794de458cf44953cff3ae6ada41248705a014bdf2`
- Page fingerprint: `sha256:4f69a193d0a46886bf58c4c3508800c95ab6b98c7ca80c1e64ebb8447e9bf5f1`
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

- Geradlinige Bewegung mit Reibung modellieren — `30ddb2d7-b991-55fe-9e74-37ffe1048f9f` (page 6)

### Prerequisites outside this book

- Ganze Zahlen addieren — `4b67bed9-06da-40b2-a306-24e9e7dfd390` (outside this book)
- Kräfte und Trägheit qualitativ erklären — `5ea765ac-c279-551a-8a94-a07da2381e5b` (outside this book)
- Pfeile für gerichtete Größen lesen und zeichnen — `b77a7e93-22f9-5722-a4cc-f18a149ab030` (outside this book)

### Direct reverse prerequisites outside this book

- Grundlagenaufgaben zu Newton, Energie und Impuls lösen — `be6d4895-65ab-545b-8df9-84e5a308a5e3` (outside this book)
- Prüfungsaufgabe: Kräfte an einem Wagen auf einer Linie bilanzieren — `d513289a-80a3-5e48-95d3-5791736cddba` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7435c9c9da5a2fd6ae71298f35f2725cb83edff8578bb94f9e4a1ea7623f5ab5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `one-body`
  - Essential understanding (DE): In die Summe gehen nur äußere Kräfte auf den gewählten Körper ein. Ihr Vorzeichen hängt von der positiven Achsenrichtung ab.
  - Essential understanding (EN): Only external forces on the chosen body enter the sum. Their signs depend on the positive axis.
  - Observable performance (DE): Die Person ordnet die Kräfte dem Körper zu und ermittelt die vorzeichenbehaftete Summe.
  - Observable performance (EN): The learner identifies the forces on the body and obtains their signed sum.
- `motion`
  - Essential understanding (DE): Die Resultierende gibt die Beschleunigungsrichtung an. Eine verschwindende Resultierende ist mit jeder konstanten Geschwindigkeit vereinbar.
  - Essential understanding (EN): The net force gives the direction of acceleration. Zero net force is compatible with any constant velocity.
  - Observable performance (DE): Sie begründet mit der Anfangsgeschwindigkeit, ob der Körper schneller oder langsamer wird oder seinen Bewegungszustand behält.
  - Observable performance (EN): The learner uses initial velocity to explain whether speed increases, decreases or stays constant.

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
  - Task demand (DE): Ein Seil zieht einen Wagen mit 8 N nach Osten, zwei Widerstände wirken mit 3 N und 5 N nach Westen. Der Wagen zieht mit 8 N am Seil. Wähle den Wagen und eine Achse. Was folgt für einen anfangs ruhenden und einen nach Westen rollenden Wagen?
  - Task demand (EN): A rope pulls a cart east with 8 N; two resistances act west with 3 N and 5 N. The cart pulls on the rope with 8 N. Choose the cart and an axis. Compare a cart initially at rest and one rolling west.
  - Expected performance (DE): Bei Osten positiv gilt +8−3−5=0 N. Die Kraft auf das Seil entfällt. Solange die Kräfte so wirken, bleibt der eine Wagen in Ruhe und der andere rollt gleichförmig nach Westen.
  - Expected performance (EN): With east positive, +8−3−5=0 N. Exclude the force on the rope. While these forces persist, the stationary cart stays at rest and the other rolls west at constant speed.
  - Understanding focus (DE): Körperauswahl und zwei Bewegungszustände bei Gleichgewicht.
  - Understanding focus (EN): Isolate one body and distinguish two states of equilibrium.
- `reverse`
  - Task demand (DE): Ein Foto zeigt am Wagen einen 3 Teilstriche langen Kraftpfeil nach links und einen 1 Teilstrich langen nach rechts, beide vom Wagen aus. Ein Teilstrich entspricht 2 N. Der Wagen fährt nach links. Bestimme die Resultierende bei positiver Achse nach rechts, dann nach links.
  - Task demand (EN): At the cart two force arrows start on it. The leftward arrow spans three divisions, the rightward one spans one. Each division represents 2 N. The cart travels left. Calculate the net force with right positive and with left positive.
  - Expected performance (DE): Rechts positiv ergibt −6+2=−4 N; links positiv +6−2=+4 N. Die Kraft wirkt jeweils nach links. Der Betrag der Geschwindigkeit nimmt zu, solange die Bewegung nach links anhält.
  - Expected performance (EN): With right positive, −6+2=−4 N; with left positive, +6−2=+4 N. In both cases the net force points left. The cart speeds up while moving left.
  - Understanding focus (DE): Vorzeichenwechsel und Bewegungsdeutung bei gleicher physikalischer Situation.
  - Understanding focus (EN): Reverse coordinates and interpret the same physical motion.
## Page 2: Die Gewichtskraft am Hang zeichnerisch zerlegen

- Full learning-goal ID: `77b44d13-4368-5950-a943-decb377c7302`
- Goal fingerprint: `sha256:de50c603d0d1ae1b6e83e4e1c341ab1ee758376845c7f745d7b1011d4d5ca7b4`
- Page fingerprint: `sha256:b4cc9eb7feb9d3593006cd31dd411be6577e6154a6b5f98920e6f75888a7b320`
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

- Die Gewichtskraftkomponenten am Hang berechnen — `43b2c500-bbd9-5c92-9f3e-618d310e5690` (page 3)

### Prerequisites outside this book

- Kräfte vektoriell zusammensetzen und Resultierende bestimmen — `41d35667-0296-5f84-bc12-202ffc440be0` (outside this book)
- Masse und Gewichtskraft unterscheiden — `9c328f68-41ed-55dd-9e02-34414a6246f2` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Gewichtskraft am Hang maßstäblich zerlegen — `4af06e7e-c566-566d-bc99-53ada98fbf0e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e3f786a820a43d5eeb0f5313e3d6c31f306d8acb05b3dca990e2bdd5f30c0b63`
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
  - Task demand (DE): Spiegle die Rampe nach links und baue sie steiler: vier Höhenkästchen auf drei waagerechte. Ein Körper wiegt 25 N, ein Kraftteilstrich bedeutet 5 N. Zeichne das Gewicht und seine Komponenten. Welche Kraft übt die Unterlage zusätzlich aus?
  - Task demand (EN): Mirror the ramp and make it steeper: four grid squares vertically for every three horizontally. The body weighs 25 N and a force division represents 5 N. Draw weight and components. What additional force does the surface exert?
  - Expected performance (DE): Grafisch rund 20 N hangabwärts, 15 N senkrecht in die Fläche. Die Rückaddition ergibt 25 N lotrecht nach unten. Die Kontakt-Normalkraft wirkt aus der Ebene und wird nicht zu den beiden Gewichtskomponenten mitaddiert, wenn das Gewicht rekonstruiert wird.
  - Expected performance (EN): Measure about 20 N downhill and 15 N into the surface. Their sum gives 25 N vertically down. The contact normal points out of the plane and is separate when reconstructing weight.
  - Understanding focus (DE): Gedrehter Kontext und Kontaktkraft.
  - Understanding focus (EN): Transfer the construction and distinguish the contact force.
## Page 3: Die Gewichtskraftkomponenten am Hang berechnen

- Full learning-goal ID: `43b2c500-bbd9-5c92-9f3e-618d310e5690`
- Goal fingerprint: `sha256:1938b5dcadafe1a7b06fca8862104f695080cb891cc9803240cb45c05262a6f1`
- Page fingerprint: `sha256:60ebcea5145f9d3ff0e2b1ecc491369247335ddcf31e6d1f95a1298eb5762ae3`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann für eine gegen die Waagerechte geneigte Ebene Achsen festlegen, aus dem rechtwinkligen Kräftedreieck die zur Ebene parallele und senkrechte Komponente mit Sinus und Kosinus bestimmen und Vorzeichen und Grenzfälle anhand der Skizze prüfen.

### Visualization

/assets/goal-visualizations/physik/43b2c500-bbd9-5c92-9f3e-618d310e5690/43b2c500-bbd9-5c92-9f3e-618d310e5690.jpg

- original digest: `sha256:c08d382cec06892584462d8580478a4931f0ba674ca3789a7807f1bba814631c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Die Gewichtskraft am Hang zeichnerisch zerlegen — `77b44d13-4368-5950-a943-decb377c7302` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Trigonometrie am rechtwinkligen Dreieck anwenden — `71a483ba-9680-4654-bb5e-5ab5427f0919` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Gewichtskomponenten mit Winkeln und Vorzeichen berechnen — `bd349d82-6bec-54b4-8aad-6b32cb62dc88` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:776b7d1aad92cc9dcbab6f04d2a8f4119a0fc5d1b08e6720a8e6f2055cb14d8f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `axes`
  - Essential understanding (DE): Die Neigung zur Horizontalen bestimmt die Lage der Gewichtskomponenten relativ zur Hypotenuse. Bei hangabwärts positiver Achse gilt parallel +W sin α, bei nach außen positiver Normale senkrecht −W cos α.
  - Essential understanding (EN): The inclination to the horizontal fixes the components relative to the hypotenuse. With downhill and outward positive, the components are +W sin α and −W cos α.
  - Observable performance (DE): Die Person legt Achsen fest, identifiziert Gegen- und Ankathete und berechnet beide Komponenten mit Vorzeichen.
  - Observable performance (EN): The learner declares axes, identifies opposite and adjacent sides and calculates both signed components.
- `limits`
  - Essential understanding (DE): Dreht man die Ebene zur Horizontalen oder Vertikalen, verschwindet jeweils eine andere Komponente.
  - Essential understanding (EN): Rotating the plane towards horizontal or vertical makes a different component vanish in each limit.
  - Observable performance (DE): Sie überprüft Zuordnung, Vorzeichen und Grenzwerte anhand ihrer Skizze.
  - Observable performance (EN): They use the sketch to check assignments, signs and limiting cases.

**Coverage expectations**

- required expectations: `axes`, `limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `angle`: Neigung zur Horizontalen oder Winkel zur Vertikalen vorgeben. / Give inclination to the horizontal or the complementary angle to the vertical.
- `orientation`: Spiegelung oder Umkehr einer positiven Achse. / Reflect the drawing or reverse one positive axis.

**Application cases**

- `hoist`
  - Task demand (DE): Eine geneigte Schiene steigt unter 30° zur Waagerechten an. Ein Schlitten hat Gewicht 80 N. Zeichne Achsen hangaufwärts und nach außen positiv. Begründe und berechne die beiden Gewichtskomponenten. Prüfe die waagerechte Schiene.
  - Task demand (EN): A rail rises 30° above the horizontal. A sled weighs 80 N. Take uphill and outward as positive. Justify and calculate both components of weight. Check the horizontal limit.
  - Expected performance (DE): Tangential −80 sin 30°=−40 N, normal −80 cos 30°≈−69,3 N. Die Gegenkathete liegt parallel zum Hang. Bei 0° ergeben sich 0 und −80 N.
  - Expected performance (EN): Tangential −80 sin 30°=−40 N; normal −80 cos 30°≈−69.3 N. The opposite side is parallel to the slope. At 0° the components are 0 and −80 N.
  - Understanding focus (DE): Achsen, Komponenten und Horizontalgrenze.
  - Understanding focus (EN): Axes, component assignment and horizontal limit.
- `tilt`
  - Task demand (DE): Bei einer fast senkrechten Platte beträgt der Winkel zur Vertikalen 20°. Ein Körper wiegt 50 N. Wähle hangabwärts und zur Platte hin positiv. Berechne die Komponenten ohne Kontaktkraft und prüfe die senkrechte Grenzlage.
  - Task demand (EN): A plate makes an angle of 20° to the vertical. A body weighs 50 N. Choose downhill and into the plate as positive. Calculate the weight components and check the vertical limit.
  - Expected performance (DE): Die Neigung zur Horizontalen beträgt 70°. Tangential +50 sin 70°≈47,0 N, normal +50 cos 70°≈17,1 N. An der senkrechten Platte liegen die vollen 50 N längs der Platte und 0 N senkrecht dazu.
  - Expected performance (EN): The inclination to the horizontal is 70°. Tangential +50 sin 70°≈47.0 N, normal +50 cos 70°≈17.1 N. At vertical, all 50 N are parallel to the plate and the normal component vanishes.
  - Understanding focus (DE): Komplementärwinkel und andere Vorzeichenkonvention.
  - Understanding focus (EN): Complementary angle and different sign convention.
## Page 4: Haften und Gleiten mit der Normalkraft beurteilen

- Full learning-goal ID: `3a2accd7-639f-50e1-a7b1-5a9d3c2432a6`
- Goal fingerprint: `sha256:10dbc8e96ace23dda6826b3ccaeda9ec14c4a6db8b89cfdb9818e40087c32d11`
- Page fingerprint: `sha256:cc1687f018298ce2605a9e7adca00107d124fbe745f52b9491a32038b6c4ced8`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann bei trockener Reibung die zum Haften erforderliche Tangentialkraft mit der maximalen Haftreibung vergleichen. Sie bestimmt Richtung und Betrag der angepassten Haftreibung beziehungsweise der Gleitreibung aus der Kontaktsituation, der Normalkraft und dem zugehörigen Reibungskoeffizienten. Den Reibungspfeil setzt sie am betrachteten Körper an.

### Visualization

/assets/goal-visualizations/physik/3a2accd7-639f-50e1-a7b1-5a9d3c2432a6/3a2accd7-639f-50e1-a7b1-5a9d3c2432a6.jpg

- original digest: `sha256:72d5b4bef9a2a25654ff6e31eae4bfd78abb95ab7b27f0589d8f85a0e96fedac`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einfache proportionale Sachaufgaben mit Dreisatz lösen — `596345cd-679e-5c7b-955f-e8cb1ec81e96` (outside this book)
- Reibung als Kontaktkraft deuten — `581c0766-b84b-54cb-b8b6-375310329a41` (outside this book)
- Pfeile für gerichtete Größen lesen und zeichnen — `b77a7e93-22f9-5722-a4cc-f18a149ab030` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Haftgrenze und Gleitreibung beurteilen — `bcc3adc6-867a-5d4f-86fb-a5abe69bf720` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:043b34238d66f8ea09fb0a82d3d3adabb6f18be947164a30d628217b589d4072`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `static`
  - Essential understanding (DE): Bei ruhendem Kontakt passt sich die tangentiale Haftreibung dem Bedarf bis zum Betrag μ_H N an. Gleichheit lässt Haften zu.
  - Essential understanding (EN): At rest relative to the surface, static friction adjusts to demand up to μₛN. At equality sticking remains possible.
  - Observable performance (DE): Die Person bestimmt die erforderliche Haftkraft, prüft die Grenze und benennt ein mögliches oder unmögliches Haftgleichgewicht.
  - Observable performance (EN): The learner computes the required static friction and decides whether sticking is possible, including equality.
- `sliding`
  - Essential understanding (DE): Beim Gleiten wirkt die Gleitreibung entgegen der Relativbewegung am Kontakt. Ihr Betrag im Modell ist μ_G N.
  - Essential understanding (EN): In sliding contact kinetic friction opposes relative motion and has magnitude μₖN in this model.
  - Observable performance (DE): Sie benennt die Richtung relativ zu beiden Kontaktflächen und berechnet den Betrag mit der tatsächlichen Normalkraft.
  - Observable performance (EN): They state the direction relative to the surfaces and use the actual normal force to find the magnitude.

**Coverage expectations**

- required expectations: `static`, `sliding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `normal`: Den gegebenen Betrag der Normalkraft bei unverändertem Tangentialbedarf verändern. / Change the given normal force while keeping tangential demand fixed.
- `relative-motion`: Ruhender Boden oder bewegtes Band mit eindeutig angegebener Relativbewegung. / Use stationary ground or a moving belt and specify relative motion.

**Application cases**

- `load`
  - Task demand (DE): Eine Kiste ruht zunächst auf trockenem Boden. N=200 N, μ_H=0,30, μ_G=0,20. Betrachte drei voneinander unabhängige Zugkräfte von 45, 60 und 75 N nach rechts. Beurteile jeden Anfangskontakt. Wie groß ist die Reibung bei bereits begonnener Gleitung nach rechts?
  - Task demand (EN): A box initially rests on a dry floor. N=200 N, μₛ=0.30 and μₖ=0.20. Consider separate rightward pulls of 45, 60 and 75 N. Judge each initial contact and find friction once the box is sliding right.
  - Expected performance (DE): Die Haftgrenze beträgt 60 N. Bei 45 N wirkt 45 N nach links, bei 60 N kann die Kiste mit 60 N nach links gerade noch haften. 75 N lassen kein Haftgleichgewicht zu. Beim Gleiten nach rechts wirken 40 N nach links.
  - Expected performance (EN): The static limit is 60 N. Friction acts left with 45 N in the first case. At 60 N it can still stick with 60 N left. At 75 N static equilibrium is impossible. When sliding right the friction is 40 N left.
  - Understanding focus (DE): Anpassung, Gleichheit, Überschreitung und Gleitfall.
  - Understanding focus (EN): Adjustment, equality, exceeded limit and sliding contact.
- `belt`
  - Task demand (DE): Ein Klotz gleitet relativ zu einem nach rechts laufenden Band nach links. Die Normalkraft ist mit Zusatzlast 150 N, μ_G=0,20, μ_H=0,40. Bestimme die Reibung am Klotz. Prüfe unabhängig einen ruhenden Kontakt mit N=100 N und einem erforderlichen Tangentialausgleich von 45 N.
  - Task demand (EN): A block slips left relative to a belt moving right. Its normal load is 150 N including additional loading, μₖ=0.20 and μₛ=0.40. Find the friction on the block. Separately test a sticking contact with N=100 N requiring 45 N tangential balance.
  - Expected performance (DE): Auf dem Band wirkt die Gleitreibung mit 30 N nach rechts auf den Klotz. Der ruhende Vergleichskontakt könnte höchstens 40 N übertragen; 45 N sind zu viel.
  - Expected performance (EN): On the belt the block experiences 30 N of kinetic friction to the right. The separate resting contact could provide only 40 N; 45 N is too much.
  - Understanding focus (DE): Kontaktbezug und unabhängige Normallast.
  - Understanding focus (EN): Contact reference and separate normal loading.
## Page 5: Grundgleichung der Mechanik anwenden

- Full learning-goal ID: `5f289cdc-fda1-4058-b44f-041ba1398e79`
- Goal fingerprint: `sha256:ae7f6d8977ab11ef78ac9f4d8d7030792d75085636eac73375b9598b7093d5a5`
- Page fingerprint: `sha256:c551a3e98c29e05d905d8b13b9818821fb03cd8149ac5c916ec2c2f3ed488059`
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
## Page 6: Geradlinige Bewegung mit Reibung modellieren

- Full learning-goal ID: `30ddb2d7-b991-55fe-9e74-37ffe1048f9f`
- Goal fingerprint: `sha256:bd202f6b04ea79c9f533b80d1603e4f0f3764d3bcfb98815541e425bfe804418`
- Page fingerprint: `sha256:e6d88b4f74f4eddc7adad36c208bc6e1777418161005f6c612f1b2e30d449508`
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

Status: `needs_human_review`; profile fingerprint: `sha256:69bbccb76d2df54e0255f1c1d22e059715bc78e1ee1e6dbdf8d1c6f43d312f89`
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
  - Task demand (DE): Ein Schlitten der Masse 3,0 kg startet auf einer horizontalen Strecke aus der Ruhe. Eine konstante Zugkraft von 12 N wirkt nach rechts, die Gleitreibung von 3 N nach links. Wähle eine Achse, formuliere die Modellannahmen, bilanziere die Kräfte und sage mit passenden einfachen Bewegungsgleichungen Geschwindigkeit und Ort nach 2,0 s voraus. Prüfe Richtung, Vorzeichen und Einheiten.
  - Task demand (EN): A 3.0 kg sled starts from rest on a horizontal track. A constant pulling force of 12 N acts to the right and sliding friction of 3 N to the left. Choose an axis, state the model assumptions, balance the forces, and use appropriate simple equations of motion to predict velocity and position after 2.0 s. Check direction, signs, and units.
  - Expected performance (DE): Die lernende Person wählt rechts positiv, behandelt Schlitten, Masse und horizontale Kräfte im betrachteten Zeitintervall als konstant und erhält F_res = 9 N sowie a = 3,0 m/s² nach rechts. Mit v_0 = 0 bestimmt sie v(2 s) = 6,0 m/s und x(2 s) - x_0 = 6,0 m. Kraftbild, positive Ergebnisse und Einheiten stimmen mit der qualitativen Prognose einer beschleunigten Bewegung nach rechts überein.
  - Expected performance (EN): The learner chooses right as positive, treats the sled, mass, and horizontal forces as constant over the interval considered, and obtains F_net = 9 N and a = 3.0 m/s² to the right. With v_0 = 0, the learner determines v(2 s) = 6.0 m/s and x(2 s) - x_0 = 6.0 m. The force diagram, positive results, and units agree with the qualitative prediction of accelerated motion to the right.
  - Understanding focus (DE): Der direkte Fall prüft die vollständige Kette von Modellannahmen über gerichtete Kräftebilanz bis zur konsistenten Bewegungsprognose, nicht bloß das Einsetzen in eine Formel.
  - Understanding focus (EN): The direct case tests the complete chain from modelling assumptions through directed force balance to a consistent motion prediction, not merely substitution into a formula.
- `cart-stops-and-reverses`
  - Task demand (DE): Ein Wagen der Masse 4,0 kg gleitet anfangs mit v_0 = -4,0 m/s nach links. Eine konstante äußere Kraft von 6 N wirkt nach rechts; die Gleitreibung hat den Betrag 2 N und wirkt jeweils entgegen der Bewegung relativ zum Boden. Rechts sei positiv. Sage den Bewegungsverlauf voraus, bestimme den Stillstandszeitpunkt und erkläre, wie Kräftebilanz und Bewegungsgleichung bei einer anschließenden Bewegung nach rechts neu angesetzt werden müssen.
  - Task demand (EN): A 4.0 kg cart initially slides to the left with v_0 = -4.0 m/s. A constant external force of 6 N acts to the right; sliding friction has magnitude 2 N and always acts opposite the motion relative to the ground. Take right as positive. Predict the course of motion, determine the stopping time, and explain how the force balance and equation of motion must be reformulated if motion subsequently proceeds to the right.
  - Expected performance (DE): Solange der Wagen nach links gleitet, wirken äußere Kraft und Reibung beide nach rechts: F_res = 8 N, a = 2,0 m/s² und v(t) = -4,0 m/s + 2,0 m/s² · t. Die Geschwindigkeit ist zunächst negativ und nimmt im Betrag ab; bei t = 2,0 s steht der Wagen. Für anschließendes Gleiten nach rechts kehrt die Reibung ihre Richtung um, sodass F_res = 6 N - 2 N = 4 N und a = 1,0 m/s² gelten; die zweite Gleichung beginnt am Übergangszeitpunkt mit den dortigen Anfangswerten.
  - Expected performance (EN): While the cart slides left, the external force and friction both act to the right: F_net = 8 N, a = 2.0 m/s², and v(t) = -4.0 m/s + 2.0 m/s² · t. The velocity is initially negative and decreases in magnitude; the cart stops at t = 2.0 s. For subsequent sliding to the right, friction reverses direction, so F_net = 6 N - 2 N = 4 N and a = 1.0 m/s²; the second equation begins at the transition time with the values then applicable.
  - Understanding focus (DE): Der unabhängige Transfer trennt Bewegungs- und Beschleunigungsrichtung und erzwingt beim Richtungswechsel eine neue Reibungsrichtung sowie ein neues gültiges Modellstück.
  - Understanding focus (EN): The independent transfer separates velocity and acceleration directions and requires a new friction direction and a new valid model segment at reversal.
## Page 7: Kurvenfahrten mit Haftreibung analysieren

- Full learning-goal ID: `e2da5eec-45de-5527-9ad7-16f41cacbe58`
- Goal fingerprint: `sha256:454a9eeade46e56e98dabccd96eb45c35cabdc3c2cd3901f954362cfb05b0cf0`
- Page fingerprint: `sha256:17e51c983d38ef532c53627f33e4d6fccb4f5ccdc99b1cfac1157beb4e19429f`
- Topic path: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

### Canonical description

Die lernende Person kann einfache Situationen wie Kurvenfahrten mit Haftreibung mithilfe der Zentripetalkraft quantitativ analysieren.

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
