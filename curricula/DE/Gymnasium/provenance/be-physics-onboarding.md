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
- the repository-backed Berlin Physics mapping file now carries `15` reviewed upper-secondary mappings
- the first Berlin upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor from the Bildungsbeitrag
  - one structural `Q1` anchor `Gravitationsfeld, elektrisches und magnetisches Feld`
  - one first reviewed `Q1` electric-field / capacitor corridor on current, voltage, capacitance, field strength in the plate capacitor, geometric/dielectric dependence, and field energy
  - one first reviewed `3.2.1` magnetic-field / Lorentz-force follow-on on field line diagrams, magnetic flux density via conductor force, long-coil field strength, and Lorentz force
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
- no Berlin-specific canonical Physics atom is introduced in this step
- no committed Berlin applicability cut is introduced in this step
- no Berlin-specific Physics composition view is introduced in this step

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while widening the Berlin Physics source snapshot
- treat the retained `3.2.1` field route as covered for the current pilot cut and extend the same Berlin lane into `3.2.2 Bewegung von geladenen Teilchen in Feldern` before opening another new Physics state
- keep Berlin narrow and reviewed until broader retained evidence justifies an applicability pass or another shared canonical atom
