# AI review input: Kräftebilanz, Hangkomponenten, Reibung und Anwendungen

- Book ID: `physics-e2-forces-bg-final-20261126-description`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:9d5b4cfd29d2ffc7a9f12bcda7b3d6d8ee27c2140eb82dc8ff9bf70991543db4`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Kräfte auf einer Linie bilanzieren

- Full learning-goal ID: `6ba20688-8cbf-5db1-bda8-346893798d2f`
- Goal fingerprint: `sha256:d7f7c16a6c7b643e0523059b22a4d3b787a64bbb17cf9d67d1a5fc24381c0f47`
- Page fingerprint: `sha256:828c7e4d242a54e11509faa1f041f3c178cbf2482cb3c7511d22e7c052636df4`
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

- None

### Prerequisites outside this book

- Ganze Zahlen addieren — `4b67bed9-06da-40b2-a306-24e9e7dfd390` (outside this book)
- Kräfte und Trägheit qualitativ erklären — `5ea765ac-c279-551a-8a94-a07da2381e5b` (outside this book)
- Pfeile für gerichtete Größen lesen und zeichnen — `b77a7e93-22f9-5722-a4cc-f18a149ab030` (outside this book)

### Direct reverse prerequisites outside this book

- Grundlagenaufgaben zu Newton, Energie und Impuls lösen — `be6d4895-65ab-545b-8df9-84e5a308a5e3` (outside this book)
- Prüfungsaufgabe: Kräfte an einem Wagen auf einer Linie bilanzieren — `d513289a-80a3-5e48-95d3-5791736cddba` (outside this book)
- Geradlinige Bewegung mit Reibung modellieren — `30ddb2d7-b991-55fe-9e74-37ffe1048f9f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e5eab1ccb69ea2142c5a86fb6fd4a865368315a77f4a1b0910b5c7c10fa88025`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `one-body`
  - Essential understanding (DE): In die Summe gehen nur äußere Kräfte auf den gewählten Körper ein. Ihr Vorzeichen hängt von der positiven Achsenrichtung ab.
  - Essential understanding (EN): Only external forces on the chosen body enter the sum. Their signs depend on the positive axis.
  - Observable performance (DE): Die Person ordnet dem gewählten Körper die äußeren Kräfte zu, liest ihre Beträge aus dort beginnenden Pfeilen am angegebenen Kraftmaßstab ab und berechnet ihre vorzeichenbehaftete Summe.
  - Observable performance (EN): The learner identifies the external forces on the selected body, reads their magnitudes from arrows starting there using the given force scale, and computes their signed sum.
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
  - Task demand (DE): Ein Seil zieht einen Wagen mit 8 N nach Osten, zwei weitere äußere Kräfte wirken mit 3 N und 5 N nach Westen. Der Wagen zieht mit 8 N am Seil. Wähle den Wagen und eine Achse. Was folgt für einen anfangs ruhenden und einen nach Westen rollenden Wagen, solange die angegebenen Kräfte so wirken? Kontrolliere deine Zuordnung in einer Skizze: Setze die drei Kräfte auf den gewählten Wagen mit dem eigenen Kraftmaßstab 1 cm für 2 N an. Welche am Seil angreifende Kraft gehört nicht in diese Skizze?
  - Task demand (EN): A rope pulls a cart east with 8 N; two other external forces act west with 3 N and 5 N. The cart pulls on the rope with 8 N. Choose the cart and an axis. Compare a cart initially at rest and one rolling west while the stated forces persist. Check your assignment in a sketch: place the three forces on the selected cart using a force scale of 1 cm for 2 N. Which force on the rope must be left out of this sketch?
  - Expected performance (DE): Bei Osten positiv gilt +8−3−5=0 N. Die Kraft auf das Seil entfällt. Solange die Kräfte so wirken, bleibt der eine Wagen in Ruhe und der andere rollt gleichförmig nach Westen. Die drei Pfeile beginnen am Wagen: 4 cm nach Osten sowie 1,5 cm und 2,5 cm nach Westen. Die Gegenkraft am Seil gehört nicht zur Wagenbilanz. Die Pfeillängen stellen Kräfte dar und sind keine Wegstrecken.
  - Expected performance (EN): With east positive, +8−3−5=0 N. Exclude the force on the rope. While these forces persist, the stationary cart stays at rest and the other rolls west at constant speed. The three arrows start at the cart: 4 cm east and 1.5 cm and 2.5 cm west. The force on the rope is excluded from the cart balance. Arrow lengths represent forces, not distances.
  - Understanding focus (DE): Körperauswahl und zwei Bewegungszustände bei Gleichgewicht.
  - Understanding focus (EN): Isolate one body and distinguish two states of equilibrium.
- `reverse`
  - Task demand (DE): Ein Foto zeigt am Wagen einen 3 Teilstriche langen Kraftpfeil nach links und einen 1 Teilstrich langen nach rechts, beide vom Wagen aus. Ein Teilstrich entspricht 2 N. Der Wagen fährt nach links. Bestimme die Resultierende bei positiver Achse nach rechts, dann nach links.
  - Task demand (EN): At the cart two force arrows start on it. The leftward arrow spans three divisions, the rightward one spans one. Each division represents 2 N. The cart travels left. Calculate the net force with right positive and with left positive.
  - Expected performance (DE): Rechts positiv ergibt −6+2=−4 N; links positiv +6−2=+4 N. Die Kraft wirkt jeweils nach links.
  - Expected performance (EN): With right positive, −6+2=−4 N; with left positive, +6−2=+4 N. In both cases the net force points left.
  - Understanding focus (DE): Die physikalische Kraftrichtung bleibt bei umgekehrter Koordinatenrichtung gleich.
  - Understanding focus (EN): The physical force direction is invariant under reversal of the coordinate axis.
