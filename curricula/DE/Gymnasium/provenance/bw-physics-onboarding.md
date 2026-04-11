# BW Physics Onboarding Note

Status: `P4` (`first_reviewed_corridor`)

This note records the first Baden-Wuerttemberg Physics source-landscape identifier for the DE-level canonical Physics rollout.

Activated on `2026-04-11`:

- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `eee2dc63-f96b-42c3-a2c9-b906432ccf5d`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the official Baden-Wuerttemberg Gymnasium physics source PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_PH.pdf`
- the BW upper-secondary Physics lane is now active in `source-landscape-registry.json`
- the first BW upper-secondary Physics snapshot now contributes real `goalIds` to `source-goal-membership-registry.json`
- the same snapshot now contributes atomic closures to `source-goal-closure-registry.json`
- the repository-backed BW Physics mapping file now carries `36` reviewed upper-secondary mappings across the first narrow field corridor, adjacent BF and LF electrodynamics follow-ons, one first BF follow-on on `Schwingungen`, one adjacent BF follow-on on `Wellen`, one first adjacent LF follow-on on `Schwingungen`, one first adjacent LF follow-on on `Wellen`, and one first adjacent LF follow-on on `Wellenoptik`
- the first BW upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor from `1.1 Bildungswert des Faches Physik`
  - one Basisfach corridor on `3.4.2 Elektromagnetische Felder`
  - one adjacent Basisfach follow-on on the induction strip of `3.4.2.2 Elektrodynamik`
  - one adjacent Basisfach follow-on on `3.4.3 Schwingungen`
  - one Leistungsfach corridor on `3.6.2 Elektromagnetische Felder`
  - one adjacent Leistungsfach follow-on on `3.6.2.3 Elektrodynamik`
  - one first adjacent Leistungsfach follow-on on selected LF `3.6.3 Schwingungen`
  - one first adjacent Leistungsfach follow-on on selected LF `3.6.5 Wellenoptik`
- the reviewed BW Physics corridor stays intentionally conservative:
  - partial bridge from the BW source root onto the canonical Physics root
  - exact bridge on the shared motivation/orientation anchor
  - partial bridges from the Basisfach and Leistungsfach corridor parents onto the shared canonical Q1 field surface
  - partial bridge from the retained Basisfach child `Elektrische und magnetische Felder im Basisfach beschreiben` onto the shared canonical Q1 field surface
  - partial bridge from the retained Basisfach electrodynamics parent onto the canonical induction cluster
  - exact bridge from `Bewegungsinduktion und Ladungstrennung im Basisfach` onto the canonical induction atom of the same pedagogical surface
  - partial bridge from `Induktionsgesetz und Lenz'sche Regel im Basisfach` onto the canonical induction-law atom
  - partial bridge from `Selbstinduktion und Induktivitaet im Basisfach` onto the canonical self-induction atom
  - exact bridge from `Technische Anwendungen des Induktionsgesetzes im Basisfach beschreiben` onto one new narrow canonical induction-applications atom
  - exact bridge from `Elektromagnetische Felder im Maxwell-Ueberblick beschreiben` onto one new narrow canonical Maxwell-overview atom
  - partial bridge from the retained Basisfach `Schwingungen` parent onto the shared canonical Q2 `Schwingungen, Induktion und mechanische Wellen` surface
  - conservative partial bridges from the retained Basisfach `Schwingungen` children onto the shared canonical Q2 entry atoms for periodic/harmonic descriptions, characteristic quantities, energy in mechanical oscillations, and the electromagnetic oscillating circuit
  - the retained Basisfach source children on `lineare Rueckstellkraft` and on the explicit cross-comparison of mechanical versus electromagnetic oscillations stay intentionally source-led
  - partial bridge from the retained Basisfach `Wellen` parent onto the canonical `Mechanische Wellen` cluster
  - conservative partial bridges from the retained Basisfach `Wellen` children onto the shared canonical atoms `Harmonische Wellen und ihre Groessen`, `Wellenphaenomene: Brechung, Reflexion, Beugung`, `Stehende Wellen und Wellenlaengenbestimmung`, `Ueberlagerung und Interferenz von Wellen`, `Huygens'sches Prinzip und Elementarwellen`, and `Spektrum elektromagnetischer Wellen`
  - partial bridge from `Elektrisches Feld im Leistungsfach untersuchen` onto the canonical `Elektrisches Feld` cluster
  - partial bridge from `Magnetisches Feld im Leistungsfach untersuchen` onto the canonical `Magnetisches Feld` cluster
  - exact bridge from `Bewegungsinduktion und Ladungstrennung` onto the canonical induction atom of the same pedagogical surface
  - exact bridge from `Induktionsgesetz und Lenz'sche Regel` onto the canonical induction-law atom
  - exact bridge from `Selbstinduktion und Induktivitaet` onto the canonical self-induction atom
  - partial bridge from the retained Leistungsfach `Schwingungen` parent onto the shared canonical Q2 `Schwingungen, Induktion und mechanische Wellen` surface
  - exact bridge from `Ungedaempfte mechanische Schwingungsdifferentialgleichungen mit Ansatz loesen` onto the existing canonical LK atom `Schwingungsgleichung loesen`
  - exact bridge from `Differentialgleichung eines elektromagnetischen Schwingkreises mit Ansatz loesen` onto one new narrow canonical Q2 atom of the same pedagogical surface
  - exact bridge from `Ueberlagerungen unabhaengiger Schwingungen und Schwebungen qualitativ beschreiben` onto one new narrow canonical Q2 atom on independent-oscillation superposition
  - no broad parent bridge from the retained Leistungsfach `Wellen` parent, because the first selected LF `3.6.4` slice spans one Q2 wave-modeling atom and one Q3 electromagnetic-radiation atom
  - exact bridge from `Fortschreitende ebene Transversalwellen und Momentanbilder beschreiben` onto one new narrow canonical LK atom of the same pedagogical surface
  - exact bridge from `Hertz'schen Dipol und die Abstrahlung elektromagnetischer Wellen in Grundzuegen beschreiben` onto one new narrow canonical LK atom on the Schwingkreis-to-radiation transfer
  - no broad parent bridge from the retained Leistungsfach `Wellenoptik` parent, because the first selected LF `3.6.5` slice currently only opens the conceptual entry on coherent light and on the comparison of ray and wave model
  - exact bridge from `Kohaerentes Licht als elektromagnetische Welle beschreiben` onto one new narrow canonical LK atom of the same pedagogical surface
  - exact bridge from `Strahlenmodell und Wellenmodell des Lichts vergleichen` onto one new narrow canonical LK comparison atom
- the earlier narrow BW field/induction closure now also widens the committed applicability pass in the canonical Physics file onto the shared Q2 oscillation strip
- the four resulting BW-only `APV-202` findings on the newly committed Q2 oscillation atoms are intentionally accepted, because the reviewed BW `Schwingungen` bridges remain conservative `partial` alignments
- the widened BW Physics lane now also commits the shared mechanical-wave and first electromagnetic-spectrum surface for `DE-BW`; the five resulting BW-only `APV-202` findings on the imported `Wellen` atoms are intentionally accepted because the reviewed BW `Wellen` bridges remain conservative `partial` alignments
- the new LF `Schwingungen`, LF `Wellen`, and LF `Wellenoptik` slices add no further accepted-warning debt, because their new reviewed BW bridges close through exact leaves rather than new partial-only applicability claims
- no BW-specific Physics composition views are introduced in this step

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while widening the BW Physics source snapshot
- prefer the next BW follow-on on the adjacent Leistungsfach-`Wellenoptik`-Interferenzstreifen before opening state-specific Physics composition views
- keep further canonical Physics applicability persistence for `DE-BW` tightly scoped to newly reviewed BW corridor growth; do not run broader state-wide sweeps before wider reviewed evidence exists
