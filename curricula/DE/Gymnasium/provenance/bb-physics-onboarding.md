# BB Physics Onboarding Note

Status: `P4` (`first_reviewed_corridor`)

This note records the first Brandenburg Physics source-landscape identifier for the DE-level canonical Physics rollout.

Activated on `2026-04-15`:

- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `6759f46a-5642-41f7-8dc7-71fd1c335855`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_physics_upper_secondary_to_canonical_physics.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/BB/upper-secondary/source-json/DE_BRA_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the retained 2022/23 Berlin/Brandenburg upper-secondary Physics PDF is now also archived locally for the Brandenburg lane at:
  - `curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Physik.pdf`
- the Brandenburg upper-secondary Physics lane is now active in `source-landscape-registry.json`
- the first Brandenburg upper-secondary Physics snapshot now contributes real `goalIds` to `source-goal-membership-registry.json`
- the same snapshot now contributes atomic closures to `source-goal-closure-registry.json`
- the repository-backed Brandenburg Physics mapping file now carries `24` reviewed upper-secondary mappings
- the first Brandenburg upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor from the Bildungsbeitrag
  - one structural `Q1` anchor `Gravitationsfeld, elektrisches und magnetisches Feld`
  - one first reviewed `Q1` electric-field / capacitor corridor on current, voltage, capacitance, field strength in the plate capacitor, geometric/dielectric dependence, and field energy
  - one first reviewed retained `3.2.1` magnetic-field / Lorentz-force follow-on on field-line diagrams, conductor-force interpretation, long-coil field strength, and Lorentz force
  - one first reviewed retained `3.2.2` charged-particle-motion follow-on on electric particle motion, Millikan, magnetic circular trajectories, specific charge, crossed fields, Hall-Effekt, and Elektronenstrahlroehre, while `c0`, relativistic mass, and arbitrary entry angles stay source-led
- the reviewed Brandenburg Physics corridor stays intentionally conservative:
  - partial bridge from the Brandenburg source root onto the canonical Physics root
  - exact bridge on the shared motivation/orientation anchor
  - partial bridge from the structural Brandenburg `Q1` field anchor onto the shared canonical `Q1 Elektrisches und magnetisches Feld`
  - partial bridge from the retained Brandenburg corridor parent onto the shared canonical `Potenzial und Kondensator` cluster
  - exact bridge from `Stromstaerke als Ladungstransport beschreiben` onto the canonical atom of the same pedagogical surface
  - partial bridge from `Spannung als Arbeit pro Ladung im elektrischen Feld deuten` onto `Arbeit, Spannung und Potenzial im E-Feld`
  - partial bridges from the retained capacitance / plate-capacitor leaves onto `Kondensator und Feld im Plattenkondensator`
  - partial bridge from `Energie geladener Kondensatoren als Feldenergie beschreiben` onto `Energie des elektrischen Feldes`
  - partial bridge from the retained Brandenburg magnetic parent onto the shared canonical `Magnetisches Feld` cluster
  - exact bridge from `Feldlinienbilder von Permanentmagneten, geradem Leiter und Spule beschreiben` onto the canonical atom of the same pedagogical surface
  - partial bridge from `Magnetische Flussdichte ueber Leiterkraft deuten` onto `Kraft auf stromdurchflossene Leiter`
  - partial bridge from `Magnetische Flussdichte in der langen Spule und Materialeinfluss beschreiben` onto `Magnetfeld von geradem Leiter und Spule`
  - partial bridge from `Lorentzkraft auf bewegte Ladungen im Magnetfeld beschreiben` onto `Lorentzkraft auf freie Ladungen`
  - partial bridge from the retained electric-particle subcluster onto `Ladungen in Feldern`
  - partial bridges from longitudinal and transverse electric-field motion onto `Geladene Teilchen in homogenen elektrischen Feldern untersuchen`
  - partial bridge from `Millikan-Experiment im Schwebefall einordnen` onto `Millikan-Versuch und Elementarladung`
  - partial bridge from `Kreisbahnen geladener Teilchen im homogenen Magnetfeld berechnen` onto `Geladene Teilchen in homogenen magnetischen Feldern untersuchen`
  - partial bridges from `Spezifische Ladung des Elektrons bestimmen` and `Elektronenstrahlroehre zur Bestimmung der spezifischen Ladung einordnen` onto the shared measurement surface `Fadenstrahlroehre als Elektronen-Messverfahren einordnen`
  - partial bridge from `Geladene Teilchen in gekreuzten elektrischen und magnetischen Feldern beschreiben` onto `Geladene Teilchen in homogenen elektrischen Feldern untersuchen`
  - partial bridge from `Hall-Effekt und Hall-Spannung anwenden` onto the shared Hall-Effekt leaf
- no Brandenburg-specific canonical Physics atom is introduced in this step
- no committed Brandenburg applicability cut is introduced in this step
- no Brandenburg-specific Physics composition view is introduced in this step
- after Brandenburg now matches the reviewed Berlin retained `3.2.1` -> `3.2.2` cut, the remaining `c0` / relativistic-mass / arbitrary-entry-angle trio is no longer just a Brandenburg follow-on candidate
- it is now treated as an explicit shared BE/BB residue set with no reviewed bridge at the current canonical level:
  - the canonical Physics graph still has no reviewed narrow shared leaf for the `c0` clause without overclaiming into broader relativity packaging
  - the existing shared relativistic-mass leaf is still too Hessen-shaped in its linear-accelerator framing for the retained BE/BB wording
  - the existing shared magnetic-field particle-motion leaves still do not isolate the arbitrary-entry-angle clause tightly enough without overstating the current reviewed surface

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while widening the Brandenburg Physics source snapshot
- use the shared BE/BB upper-secondary source family explicitly: the Brandenburg retained `3.2.1` -> `3.2.2` route is now reviewed at the same narrow level as Berlin, so do not force another BE/BB-only bridge on the shared residue trio
- reopen Brandenburg only if that deferred shared BE/BB residue later becomes jointly reviewable or another later shared gap appears
- keep Brandenburg narrow and reviewed until broader retained evidence justifies an applicability pass or another shared canonical atom
