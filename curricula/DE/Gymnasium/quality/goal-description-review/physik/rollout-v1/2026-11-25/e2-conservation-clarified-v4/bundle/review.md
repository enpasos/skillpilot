# AI review input: Impulserhaltung – präzisierte System-, Inertialsystem- und Endpunktbedingungen

- Book ID: `physics-e2-conservation-clarified-description-review-20261125-v4`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:94c1152d30df5f302c22dc8a1a479aea4608882ddbae4f79c6f43190bb553f15`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Impulserhaltung

- Full learning-goal ID: `839ecc8f-3a60-418b-bc92-64bfeef33824`
- Goal fingerprint: `sha256:a2c87d2e6c3734f57de9f44c607137a7716bf80c75c8e082ec11323d7ef3e96c`
- Page fingerprint: `sha256:c03fde779d89d45baf0f828fbee7fc98b3c15bbffd333ff1979b05f2fd15e34d`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.2 Newton'sche Axiome und Erhaltungssätze > Erhaltungssätze > Impuls

### Canonical description

Die lernende Person kann in einem Inertialsystem die vektoriellen Gesamtimpulse derselben Körper vor und nach einer Wechselwirkung gleichsetzen, wenn der resultierende äußere Kraftstoß auf diese Körper in der betrachteten Zeit null ist, und damit einfache Rückstoßsituationen qualitativ begründen.

### Visualization

/assets/goal-visualizations/physik/839ecc8f-3a60-418b-bc92-64bfeef33824/839ecc8f-3a60-418b-bc92-64bfeef33824.jpg

- original digest: `sha256:948ae3321871d95501d0f99614bab22c129185fd66efb0bb088092c1583af64c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen — `53afbda1-5776-502b-8867-471975d7b766` (outside this book)
- Grundgleichung der Mechanik anwenden — `5f289cdc-fda1-4058-b44f-041ba1398e79` (outside this book)
- Newtons 3. Axiom anwenden — `a0aaedcb-41f8-4891-af77-a69a76b8c10d` (outside this book)

### Direct reverse prerequisites outside this book

- Kraftstoß — `e790de73-f8e5-4027-bc05-9f12a0e8c9cb` (outside this book)
- Inelastische Stöße — `0da13365-02c2-44f1-8a81-d524ca0ac3ae` (outside this book)
- Einfache Stossvorgaenge mit Impuls- und Energieerhaltung analysieren — `2eecd0e2-a7ca-4568-9b12-3d47706c65fb` (outside this book)
- Elastische Stöße — `d168ae5d-f36f-4ad4-b070-d5931f8d70d1` (outside this book)
- Drehimpuls als Erhaltungsgröße — `37f17e7e-9fcf-5dca-ac10-e94cb8420be5` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ee939dbf6fcdcee75abeade8174968fbbd5cebcbf10d48f2568b2dafbaac107a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `fixed-system-endpoints`
  - Essential understanding (DE): Für dieselben Körper in einem gemeinsamen Inertialsystem gilt: Wenn der resultierende äußere Kraftstoß über das betrachtete Intervall null ist, sind die vektoriellen Gesamtimpulse vor und nach der Wechselwirkung gleich. Innere Wechselwirkungen können die Teilimpulse verändern.
  - Essential understanding (EN): For the same bodies in one common inertial frame, zero net external impulse over the interval implies equal vector total momenta before and after the interaction. Internal interactions can change the individual momenta.
  - Observable performance (DE): Die Person benennt die betrachteten Körper, das gemeinsame Bezugssystem und die beiden Vergleichszeitpunkte. Sie begründet, wann der äußere Kraftstoß vernachlässigbar ist, und nutzt eine qualitative gerichtete Vorher-Nachher-Bilanz zur Erklärung eines Rückstoßes.
  - Observable performance (EN): The learner identifies the bodies, common reference frame and two comparison instants. They justify when external impulse is negligible and use a qualitative directed before-and-after balance to explain recoil.
- `unequal-masses-and-drift`
  - Essential understanding (DE): Bei einem anfangs ruhenden Paar entstehen gleich große entgegengesetzte Teilimpulse. Bei ungleichen Massen ist der leichtere Körper deshalb schneller. Bei anfänglicher Drift müssen die Endgeschwindigkeiten nicht entgegengesetzt gerichtet sein.
  - Essential understanding (EN): For an initially resting pair, the final individual momenta have equal magnitudes and opposite directions. The lighter body therefore moves faster when masses differ. With initial drift, the final velocities need not point in opposite directions.
  - Observable performance (DE): Die Person prognostiziert Rückstoßrichtungen aus der Ruhe und den qualitativen Einfluss ungleicher Massen. Bei einem bereits driftenden Paar unterscheidet sie die Richtung einer Impulsänderung von einer nicht eindeutig bestimmten Endbewegungsrichtung. Numerische Inversion und ein exaktes Geschwindigkeitsverhältnis sind keine Pflicht.
  - Observable performance (EN): The learner predicts recoil directions from rest and the qualitative effect of unequal masses. For an already drifting pair, they distinguish the direction of momentum change from a final motion direction that is not uniquely determined. Numerical inversion and an exact speed ratio are not required.

**Coverage expectations**

- required expectations: `fixed-system-endpoints`, `unequal-masses-and-drift`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `initial-total-momentum`: Paar anfangs in Ruhe oder gemeinsam nach rechts driftend; Bilanz in einem gemeinsamen Inertialsystem. / Pair initially at rest or drifting together rightward; balance in one common inertial frame.
- `mass-and-system`: Gleiche oder ungleiche Massen; richtige Systemabgrenzung und Begründung eines vernachlässigbaren äußeren Kraftstoßes. / Equal or unequal masses; correct system boundary and justification for negligible external impulse.

**Application cases**

- `astronaut-tool-recoil`
  - Task demand (DE): Eine Astronautin und ein Werkzeugpaket driften gemeinsam nach rechts. Im betrachteten gemeinsamen Inertialsystem erhöht ein Abstoßen den nach rechts gerichteten Impuls des Pakets. Äußere Kraftstöße sind vernachlässigbar. Betrachte dieselben beiden Körper vor und nach dem Abstoßen. Erkläre die Richtung der Impulsänderung der Astronautin und beurteile, ob daraus zwingend folgt, dass sie danach nach links fliegt.
  - Task demand (EN): An astronaut and tool package drift together to the right. In the common inertial frame being considered, a push increases the package’s rightward momentum. External impulses are negligible. Consider the same two bodies before and after the push. Explain the direction of the astronaut’s momentum change and assess whether this necessarily means she subsequently moves left.
  - Expected performance (DE): Die Impulsänderung der Astronautin ist nach links gerichtet und gleicht die nach rechts gerichtete Änderung des Pakets näherungsweise aus. Ihre Endbewegung kann weiterhin nach rechts, in Ruhe oder nach links sein; ohne Betrag der Änderung ist das nicht festgelegt. Begründet werden Systemgrenze, vernachlässigbarer äußerer Kraftstoß und näherungsweise gleiche Gesamtimpulsvektoren an den beiden Vergleichszeitpunkten.
  - Expected performance (EN): The astronaut’s momentum change is leftward and approximately balances the package’s rightward change. Her final motion may still be rightward, at rest or leftward; the change’s magnitude is needed to decide. The explanation identifies the system, negligible external impulse and approximately equal total momentum vectors at the two comparison instants.
  - Understanding focus (DE): Gesamtbilanz, Impulsänderung und Endbewegungsrichtung unterscheiden.
  - Understanding focus (EN): Distinguish total balance, momentum change and final motion direction.
- `two-carts-spring-recoil`
  - Task demand (DE): Zwei unterschiedlich schwere Wagen stehen auf einer geraden horizontalen reibungsarmen Bahn. Eine idealisierte Feder vernachlässigbarer Masse drückt sie auseinander. Betrachte beide Wagen und die Feder im gemeinsamen Inertialsystem der Bahn. Begründe die Vernachlässigung des äußeren horizontalen Kraftstoßes, prognostiziere die Richtungen nach dem Lösen und erkläre, welcher Wagen schneller ist.
  - Task demand (EN): Two unequal-mass carts are at rest on a straight horizontal low-friction track. An idealized negligible-mass spring pushes them apart. Consider both carts and spring in the common inertial frame of the track. Justify neglecting external horizontal impulse, predict their directions after release and explain which cart moves faster.
  - Expected performance (DE): Beide Wagen bewegen sich entgegengesetzt. Ihre Endimpulse sind näherungsweise gleich groß und entgegengesetzt, da der Anfangsgesamtimpuls null ist und der Federimpuls vernachlässigt wird. Der leichtere Wagen ist schneller. Gelieferte Zahlen oder Messdaten dürfen die qualitative Bilanz optional prüfen; eine exakte Verhältnisrechnung ist keine Pflicht. Eine nur vernachlässigbare äußere Wirkung führt zu einer näherungsweisen, nicht behauptet exakten Messgleichheit.
  - Expected performance (EN): The carts move in opposite directions. Their final momenta are approximately equal and opposite because initial total momentum is zero and spring momentum is neglected. The lighter cart moves faster. Supplied numbers or measurements may optionally check the qualitative balance; an exact ratio calculation is not required. Negligible external influence gives approximate equality rather than an assertion of exact equality for measured data.
  - Understanding focus (DE): Qualitativer Rückstoß aus der Ruhe bei ungleichen Massen und offengelegtem Federidealmodell.
  - Understanding focus (EN): Qualitative recoil from rest with unequal masses and an explicit ideal-spring model.
