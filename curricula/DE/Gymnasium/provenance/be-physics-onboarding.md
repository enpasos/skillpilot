# Berlin Physics Onboarding Note

Status: `P4` (`first_reviewed_corridor`)

This note records the first Berlin Physics source-landscape identifier for the DE-level canonical Physics rollout.

Activated on `2026-04-15`, widened on `2026-04-15`:

- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `8e54a9e6-dd9d-4f5d-a632-734b4ef5c754`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_physics_upper_secondary_to_canonical_physics.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the retained 2022/23 Berlin/Brandenburg upper-secondary Physics PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Physik.pdf`
- the Berlin upper-secondary Physics lane is now active in `source-landscape-registry.json`
- the first Berlin upper-secondary Physics snapshot now contributes real `goalIds` to `source-goal-membership-registry.json`
- the same snapshot now contributes atomic closures to `source-goal-closure-registry.json`
- the repository-backed Berlin Physics mapping file now carries `24` reviewed upper-secondary mappings
- the first Berlin upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor from the Bildungsbeitrag
  - one structural `Q1` anchor `Gravitationsfeld, elektrisches und magnetisches Feld`
  - one first reviewed `Q1` electric-field / capacitor corridor on current, voltage, capacitance, field strength in the plate capacitor, geometric/dielectric dependence, and field energy
  - one first reviewed `3.2.1` magnetic-field / Lorentz-force follow-on on field line diagrams, magnetic flux density via conductor force, long-coil field strength, and Lorentz force
  - one first reviewed retained `3.2.2` charged-particle-motion follow-on on electric longitudinal/transverse fields, Millikan, circular motion in homogeneous magnetic fields, and specific electron charge
  - one explicit retained LK residue on mathematical field trajectories, relativity limit, arbitrary entry angles, crossed fields, Hall-Effekt, and Elektronenstrahlroehre
- the reviewed Berlin Physics corridor stays intentionally conservative:
  - partial bridge from the Berlin source root onto the canonical Physics root
  - exact bridge on the shared motivation/orientation anchor
  - partial bridge from the structural Berlin `Q1` field anchor onto the shared canonical `Q1 Elektrisches und magnetisches Feld`
  - partial bridge from the retained Berlin corridor parent onto the shared canonical `Potenzial und Kondensator` cluster
  - exact bridge from `Stromstaerke als Ladungstransport beschreiben` onto the canonical atom of the same pedagogical surface
  - partial bridge from `Spannung als Arbeit pro Ladung im elektrischen Feld deuten` onto `Arbeit, Spannung und Potenzial im E-Feld`
  - partial bridges from the retained capacitance / plate-capacitor leaves onto `Kondensator und Feld im Plattenkondensator`
  - partial bridge from `Energie geladener Kondensatoren als Feldenergie beschreiben` onto `Energie des elektrischen Feldes`
  - partial bridge from the retained Berlin magnetic follow-on parent onto the shared canonical cluster `Magnetisches Feld`
  - exact bridge from `Feldlinienbilder von Permanentmagneten, geradem Leiter und Spule beschreiben` onto `Magnetische Felder und Feldlinienbilder`
  - partial bridge from `Magnetische Flussdichte ueber Leiterkraft deuten` onto `Kraft auf stromdurchflossene Leiter`
  - partial bridge from `Magnetische Flussdichte in der langen Spule und Materialeinfluss beschreiben` onto `Magnetfeld von geradem Leiter und Spule`
  - partial bridge from `Lorentzkraft auf bewegte Ladungen im Magnetfeld beschreiben` onto `Lorentzkraft auf freie Ladungen`
  - partial bridge from the retained Berlin electric `3.2.2` subcluster onto the shared canonical cluster `Ladungen in Feldern`
  - partial bridges from the retained longitudinal- and transverse-field leaves onto `Geladene Teilchen in homogenen elektrischen Feldern untersuchen`
  - partial bridge from `Millikan-Experiment im Schwebefall einordnen` onto `Millikan-Versuch und Elementarladung`
  - partial bridge from `Kreisbahnen geladener Teilchen im homogenen Magnetfeld berechnen` onto `Geladene Teilchen in homogenen magnetischen Feldern untersuchen`
  - partial bridge from `Spezifische Ladung des Elektrons bestimmen` onto `Fadenstrahlrohr als Elektronen-Messverfahren einordnen`
  - partial bridge from `Geladene Teilchen in gekreuzten elektrischen und magnetischen Feldern beschreiben` onto `Geladene Teilchen in homogenen elektrischen Feldern untersuchen`
  - partial bridge from `Hall-Effekt und Hall-Spannung anwenden` onto `Hall-Effekt anwenden`
  - partial bridge from `Elektronenstrahlroehre zur Bestimmung der spezifischen Ladung einordnen` onto `Fadenstrahlrohr als Elektronen-Messverfahren einordnen`
- no Berlin-specific canonical Physics atom is introduced in this step
- no committed Berlin applicability cut is introduced in this step
- no Berlin-specific Physics composition view is introduced in this step
- `Vakuumlichtgeschwindigkeit c0 als Obergrenze fuer Geschwindigkeiten einordnen` stays intentionally source-led because the current shared canonical Physics graph still does not expose a reviewed narrow target for that clause
- `Relativistische Massenzunahme schnell bewegter Teilchen einordnen` and `Ladungstraeger in Magnetfeldern fuer beliebige Eintrittswinkel beschreiben` also stay intentionally source-led for the same reason
- the remaining Berlin source-led trio is now treated as an explicitly deferred shared BE/BB residue candidate rather than as an open Berlin-local mapping todo:
  - `Vakuumlichtgeschwindigkeit c0 als Obergrenze fuer Geschwindigkeiten einordnen`
  - `Relativistische Massenzunahme schnell bewegter Teilchen einordnen`
  - `Ladungstraeger in Magnetfeldern fuer beliebige Eintrittswinkel beschreiben`
- current target-review result for that trio:
  - the canonical Physics graph still has no reviewed narrow shared leaf for the `c0` clause without overclaiming into broader relativity packaging
  - the existing shared relativistic-mass leaf stays Hessen-only and is still too specific to linear-accelerator framing for the Berlin wording
  - the existing shared magnetic-field particle-motion leaves do not isolate the Berlin arbitrary-entry-angle clause tightly enough without overstating the current reviewed surface
- after Brandenburg has now matched the retained Berlin `3.2.1` -> `3.2.2` cut, the next clean move is therefore not another Berlin-only or BE/BB-only bridge
- treat the remaining trio as an explicit shared BE/BB residue set and only reopen it if later reviewed evidence really makes it jointly reviewable

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while widening the Berlin Physics source snapshot
- treat the retained `3.2.1` -> `3.2.2` Q1 field route as the current Berlin pilot cut and keep the remaining source-led `c0` / Relativitaet / Eintrittswinkel trio explicitly deferred until broader shared evidence justifies another reviewed move
- keep Berlin stable now that Brandenburg matches the same retained cut from the shared BE/BB source family, and do not force any further BE/BB-only canonical split on that trio
- keep Berlin narrow and reviewed until broader retained evidence justifies an applicability pass or another shared canonical atom
