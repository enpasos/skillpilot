# AI review input: Gewichtskraft am Hang zeichnerisch zerlegen

- Book ID: `physics-e2-forces-g-geography-20261126-description`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:115bd41ce2ae68da6fb0f64e0659146875971d430f4182f88982f3baebc8428c`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Die Gewichtskraft am Hang zeichnerisch zerlegen

- Full learning-goal ID: `77b44d13-4368-5950-a943-decb377c7302`
- Goal fingerprint: `sha256:de50c603d0d1ae1b6e83e4e1c341ab1ee758376845c7f745d7b1011d4d5ca7b4`
- Page fingerprint: `sha256:b8492f6d8d00b15d3f58d159ef6ee55ea385bad24648b8a369685b84085ae3c8`
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
