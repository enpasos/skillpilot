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
- the repository-backed BW Physics mapping file now carries `64` reviewed upper-secondary mappings across the first narrow field corridor, adjacent BF and LF electrodynamics follow-ons, one first BF follow-on on `Schwingungen`, one adjacent BF follow-on on `Wellen`, one first adjacent BF follow-on on `Wellenoptik`, one first adjacent BF follow-on on `Quantenphysik`, one first adjacent LF follow-on on `Schwingungen`, one first adjacent LF follow-on on `Wellen`, one widened adjacent LF follow-on on `Wellenoptik`, and one widened adjacent LF follow-on on `Quantenphysik`
- the first BW upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor from `1.1 Bildungswert des Faches Physik`
  - one Basisfach corridor on `3.4.2 Elektromagnetische Felder`
  - one adjacent Basisfach follow-on on the induction strip of `3.4.2.2 Elektrodynamik`
  - one adjacent Basisfach follow-on on `3.4.3 Schwingungen`
  - one adjacent Basisfach follow-on on `3.4.4 Wellen`
  - one first adjacent Basisfach follow-on on selected BF `3.4.5 Wellenoptik`
  - one first adjacent Basisfach follow-on on selected BF `3.4.6 Quantenphysik`
  - one Leistungsfach corridor on `3.6.2 Elektromagnetische Felder`
  - one adjacent Leistungsfach follow-on on `3.6.2.3 Elektrodynamik`
  - one first adjacent Leistungsfach follow-on on selected LF `3.6.3 Schwingungen`
  - one first adjacent Leistungsfach follow-on on selected LF `3.6.4 Wellen`
  - one widened adjacent Leistungsfach follow-on on selected LF `3.6.5 Wellenoptik`
  - one widened adjacent Leistungsfach follow-on on selected LF `3.6.6 Quantenphysik`
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
  - exact bridge from `Lineare Rueckstellkraft bei harmonischen mechanischen Schwingungen beschreiben` onto one new narrow canonical Q2 atom for linear restoring force as the harmonic-oscillation condition
  - exact bridge from `Mechanische und elektromagnetische Schwingungen vergleichen` onto one new narrow canonical Q2 atom for the cross-comparison of mechanical and electromagnetic oscillations
  - partial bridge from the retained Basisfach `Wellen` parent onto the canonical `Mechanische Wellen` cluster
  - conservative partial bridges from the retained Basisfach `Wellen` children onto the shared canonical atoms `Harmonische Wellen und ihre Groessen`, `Wellenphaenomene: Brechung, Reflexion, Beugung`, `Stehende Wellen und Wellenlaengenbestimmung`, `Ueberlagerung und Interferenz von Wellen`, `Huygens'sches Prinzip und Elementarwellen`, and `Spektrum elektromagnetischer Wellen`
  - no broad parent bridge from the retained Basisfach `Wellenoptik` parent, because the selected BF `3.4.5` slice still lands on one mixed strip of three exact optics leaves plus three conservative partial optics leaves
  - exact bridge from `Kohaerentes Licht als elektromagnetische Welle beschreiben` onto the existing narrow canonical BW optics atom of the same pedagogical surface, now surfaced for both `GK` and `LK`
  - exact bridge from `Strahlenmodell und Wellenmodell des Lichts vergleichen` onto the existing narrow canonical BW comparison atom
  - conservative partial bridge from `Interferenzphaenomene an Doppelspalt oder Gitter experimentell untersuchen` onto the existing broader BW optics experiment atom that still includes the LF-only single-slit residue
  - conservative partial bridge from `Struktur der Interferenzmuster und der Intensitaetsverteilung bei Doppelspalt und Gitter beschreiben` onto the existing broader BW optics pattern/intensity atom that still includes the LF-only single-slit residue
  - conservative partial bridge from `Lage von Interferenzminima beziehungsweise Interferenzmaxima bei Doppelspalt und Gitter in Fernfeldnaeherung berechnen` onto the existing broader BW optics far-field atom that still includes the LF-only single-slit residue
  - exact bridge from `Interferenzphaenomene im Alltag physikalisch beschreiben` onto the existing narrow canonical BW context atom on everyday interference phenomena, now surfaced for both `GK` and `LK`
  - no broad parent bridge from the retained Basisfach `Quantenphysik` parent, because the selected BF `3.4.6` slice spans the shared canonical Q3 `Welle-Teilchen-Dualismus` strip plus the narrow reviewed BW Q4 comparison / measurement strip
  - exact bridge from `Gemeinsamkeiten und Unterschiede von klassischen Wellen, klassischen Teilchen und Quantenobjekten am Doppelspalt beschreiben` onto the existing narrow canonical BW Q4 atom for the same double-slit comparison surface
  - exact bridge from `Wahrscheinlichkeitsaussagen statt klassischem Determinismus erlaeutern` onto the existing narrow canonical BW Q4 atom on probability interpretation
  - exact bridge from `Interferenz einzelner Quantenobjekte mit Wahrscheinlichkeitsaussagen beschreiben` onto the existing narrow canonical BW Q4 atom on single-quantum interference
  - exact bridge from `Komplementaritaet durch Interferenzfaehigkeit und Welcher-Weg-Information erlaeutern` onto the existing narrow canonical BW Q4 atom on complementarity
  - exact bridge from `Lichtelektrischen Effekt mit Einstein'scher Lichtquantenhypothese erklaeren` onto the existing shared canonical Q3 atom `Fotöffekt und Einstein-Deutung`
  - exact bridge from `Energie und Impuls von Photonen beschreiben` onto the existing shared canonical Q3 atom `Energie und Impuls von Photonen`
  - exact bridge from `De-Broglie-Wellenlaenge von Materiewellen erlaeutern` onto the existing shared canonical Q3 atom `De-Broglie-Wellen`
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
  - no broad parent bridge from the retained Leistungsfach `Wellenoptik` parent, because the selected LF `3.6.5` slice now covers seven exact leaves on a narrow reviewed interference strip but still does not justify a broader canonical optics-parent claim
  - exact bridge from `Kohaerentes Licht als elektromagnetische Welle beschreiben` onto one new narrow canonical LK atom of the same pedagogical surface
  - exact bridge from `Strahlenmodell und Wellenmodell des Lichts vergleichen` onto one new narrow canonical LK comparison atom
  - exact bridge from `Interferenzphaenomene an Einzelspalt, Doppelspalt und Gitter experimentell untersuchen` onto one new narrow canonical LK experiment atom of the same pedagogical surface
  - exact bridge from `Interferenzmuster und Intensitaetsverteilungen bei Einzelspalt, Doppelspalt und Gitter beschreiben` onto one new narrow canonical LK pattern-and-intensity atom of the same pedagogical surface
  - exact bridge from `Lage von Interferenzminima und Interferenzmaxima in Fernfeldnaeherung berechnen` onto one new narrow canonical LK far-field calculation atom
  - exact bridge from `Interferenzphaenomene im Alltag physikalisch beschreiben` onto one new narrow canonical LK context atom on everyday interference phenomena
  - exact bridge from `Geschichtliche Entwicklung von Modellvorstellungen des Lichts beschreiben` onto one new narrow canonical LK model-history atom
  - exact bridge from `Lichtelektrischen Effekt mit Einstein'scher Lichtquantenhypothese erklaeren` onto the existing shared canonical Q3 atom `Fotöffekt und Einstein-Deutung`
  - exact bridge from `Energie und Impuls von Photonen beschreiben` onto the existing shared canonical Q3 atom `Energie und Impuls von Photonen`, after narrowing that shared atom to the photon-relations core instead of a broader energy-mass sidetrack
  - exact bridge from `De-Broglie-Wellenlaenge von Materiewellen erlaeutern` onto the existing shared canonical Q3 atom `De-Broglie-Wellen`
  - exact bridge from `Klassische Wellen, klassische Teilchen und Quantenobjekte am Doppelspalt vergleichen` onto one new narrow canonical BW-only Q4 atom of the same pedagogical surface
  - exact bridge from `Wahrscheinlichkeitsaussagen statt klassischem Determinismus erlaeutern` onto one new narrow canonical BW-only Q4 atom on probability interpretation
  - exact bridge from `Interferenz einzelner Quantenobjekte mit Wahrscheinlichkeitsaussagen beschreiben` onto one new narrow canonical BW-only Q4 atom on single-quantum interference
  - exact bridge from `Komplementaritaet durch Interferenzfaehigkeit und Welcher-Weg-Information erlaeutern` onto one new narrow canonical BW-only Q4 atom on complementarity
  - exact bridge from `Orts-Impuls-Unbestimmtheit und Grenzen des Bahnbegriffs begruenden` onto one new narrow canonical BW-only Q4 atom on uncertainty and the limits of the classical trajectory concept
- the earlier narrow BW field/induction closure now also widens the committed applicability pass in the canonical Physics file onto the shared Q2 oscillation strip
- the four resulting BW-only `APV-202` findings on the newly committed Q2 oscillation atoms are intentionally accepted, because the reviewed BW `Schwingungen` bridges remain conservative `partial` alignments
- the widened BW Physics lane now also commits the shared mechanical-wave and first electromagnetic-spectrum surface for `DE-BW`; the five resulting BW-only `APV-202` findings on the imported `Wellen` atoms are intentionally accepted because the reviewed BW `Wellen` bridges remain conservative `partial` alignments
- the widened BW Physics lane now also commits the shared Q3 `Welle-Teilchen-Dualismus` strip plus the shared Q4 entry cluster and the shared `Quantenobjekte` cluster for `DE-BW`; the narrow BW Q4 comparison / measurement leaves stay BW-scoped, but the reused double-slit, probability, single-quantum-interference, and complementarity atoms now surface for both `GK` and `LK` inside that BW scope
- the new BF `Wellenoptik` and BF `Quantenphysik` slices and the earlier LF `Schwingungen`, LF `Wellen`, LF `Wellenoptik`, and LF `Quantenphysik` slices add no further accepted-warning debt, because the new BF optics partials only land on already-BW-scoped optics atoms and the remaining new reviewed BW bridges close through exact leaves rather than new partial-only applicability claims
- the active BW source snapshot now exact/partial-closes every retained source leaf in the current pilot cut
- no BW-specific Physics composition views are introduced in this step

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while widening the BW Physics source snapshot
- treat the first Basisfach-`Wellenoptik` strip, the first Basisfach-`Quantenphysik` strip, the adjacent Leistungsfach-`Wellenoptik`-Interferenzstreifen, and the first LF-`Quantenphysik` strip as covered; the current BW upper-secondary first-entry lane can now be treated as complete at the reviewed pilot-cut level, so active rollout focus may move to the next state lane
- if BW local widening returns at all, prefer only another clearly missing reviewed BW corridor outside the now-covered optics/quantum strips
- keep further canonical Physics applicability persistence for `DE-BW` tightly scoped to newly reviewed BW corridor growth; do not run broader state-wide sweeps before wider reviewed evidence exists
