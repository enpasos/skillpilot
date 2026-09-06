# B033zb synthesis and source reconciliation: GPS and mass–energy

Date: 2026-09-05. Author: Codex source-reconciliation agent.

This is a synthesis/source-reconciliation recommendation after reading both
existing B033zb rounds. It is not an independent blind review, a human
adjudication, a source-verification attestation, a strict resolution, or an
approval. No canonical data, mappings, provenance, review records, evidence
profiles, image bytes, or image approval fields were edited. No review or build
was run for this note.

## Bound inputs

Canonical file:
`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`.

Both current rounds recommend `revise` for each of these two goals. Their
current DE/EN text matches the canonical text inspected for this note.

- Round A: `round-a/results/physik-rollout-v1-batch-033zb-relativity-current-context-recheck-9-v1-20260905-first-pass-a.batch-001.records.jsonl`, SHA-256 `b0e223bdaafee407e63956be6a8e749231b1bf1eea7a370ae37de4ba95f4c3b7`; records `physics-b033zb-blind-a-20260905-004` and `physics-b033zb-blind-a-20260905-009`.
- Round B: `round-b/results/physik-rollout-v1-batch-033zb-relativity-current-context-recheck-9-v1-20260905-first-pass-b.batch-001.records.jsonl`, SHA-256 `21b5424fb662b136affa062dce94fbef963a29e15108bbbe269619966a17426e`; records `physics-b033zb-blind-b-20260905.004` and `physics-b033zb-blind-b-20260905.009`.

## GPS: a9169a74-de19-54a9-a8ac-a2ce43c7342e

Current titles, recommended unchanged:

- DE: GPS und Relativitätstheorie
- EN: GPS and Relativity

Current descriptions:

- DE: Anwendung der Zeitdilatation im Alltag: Warum Navigationssysteme ohne die Korrekturen der speziellen (und allgemeinen) Relativitätstheorie nicht funktionieren würden.
- EN: Application of time dilation in everyday life: why navigation systems would not work without corrections from special (and general) relativity.

Recommended descriptions, exactly as proposed by round B:

- DE: Die lernende Person kann qualitativ erklären, wie Bewegung und Gravitation den Gang von GPS-Satellitenuhren gegenüber einer erdgebundenen Zeitreferenz beeinflussen und warum relativistische Zeitkorrekturen für eine präzise Positionsbestimmung erforderlich sind.
- EN: The learner can qualitatively explain how motion and gravity affect the rate of GPS satellite clocks relative to an Earth-based time reference and why relativistic time corrections are necessary for precise positioning.

The named satellite clocks and Earth-based reference make the qualitative
comparison explicit. The observable competence is one coherent explanation
linking clock rates and positioning accuracy. Motion and gravity already
belong to the existing special/general-relativity context. No quantitative
general-relativity derivation, orbit calculation, implementation task, or
additional assessment routine is introduced. Both reviewed drafts support
this correction; round B gives the more explicit reference for the clock
comparison. Numerical rates, competing signs, and unfamiliar orbits belong
in explanation and separate evidence candidates, not an expanded description.

Checked source routes:

1. The existing GPS context is inherited from retained source goal
   `a364aa86-6fa6-470e-b172-1c72752cd61a` in
   `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_PHYSIK.de.json.snapshot`.
   Its descriptions are exactly the current descriptions above. The exact
   legacy-to-canonical mapping is in
   `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json`.
   `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
   contains the same source-landscape/source-goal route. This is retained
   authoring provenance; it is not an original official sentence about GPS.
2. The partial RP mapping in
   `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`
   maps source goal `rp-phys-sek2-gravitational-time-dependence-evidence` to
   this GPS goal. The corresponding source-extraction file is
   `curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_PHYSIK_SEKII_MSS_SOURCE_EXTRACTION_DRAFT.source-extraction.json`.
   The original local PDF
   `curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf`, printed
   pp. 43 and 73, explicitly lists “Abhängigkeit der Zeit vom Gravitationsfeld”
   in the Relativistische Dynamik elective module. Its implementation guidance
   says “Den Grad der formalen Darstellung zugunsten eines grundlegenden Überblicks beschränken.”
   These are curriculum-scope anchors, not an explicit GPS prescription.
3. The local Hessen KC original, Q4.4, printed p. 46, lists time dilation and
   experimental evidence but does not name GPS in that block. A text search
   of the original local PDF found no GPS occurrence. No exact official
   Hessen GPS requirement is claimed.

As supplementary physical evidence, NIST explains the competing effects of
motion and gravity on GPS satellite clocks relative to terrestrial clocks
and the need for corrections for accurate terrestrial time. This supports
the proposed clock comparison; it is not a curriculum authority.
[NIST: Putting Einstein to the Test](https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test), accessed 2026-09-05.

## Mass–energy: bfea7a23-1ce1-4a42-badd-1fc9bf30124a

Current titles, recommended unchanged:

- DE: Masse-Energie-Äquivalenz einordnen
- EN: Classify Mass-Energy Equivalence

Current descriptions:

- DE: Die lernende Person kann die Masse-Energie-Äquivalenz E = mc² als relativistische Grundbeziehung fachlich einordnen und an qualitativen Beispielen deuten.
- EN: The learner can classify mass-energy equivalence E = mc² as a basic relativistic relation and interpret it using qualitative examples.

Recommended descriptions, exactly as proposed by round B:

- DE: Die lernende Person kann die Masse-Energie-Äquivalenz E₀ = m₀c² als Beziehung zwischen Ruheenergie und invarianter Masse fachlich einordnen und an qualitativen Beispielen deuten.
- EN: The learner can explain the physical meaning of mass-energy equivalence E₀ = m₀c² as the relation between rest energy and invariant mass and interpret it using qualitative examples.

This preserves qualitative interpretation. It identifies the quantities in
the existing relation and does not add reaction types, numerical mass-balance
exercises, or energy–momentum calculations. System boundaries, energy
retained within a container, and the distinction between a subsystem and a
complete system are appropriate evidence examples, not additional canonical
description requirements.

Checked source routes:

1. RP source goal `rp-phys-sek2-mass-energy-equivalence` maps partially to
   this canonical goal in the RP source-extraction review file named above.
   The original RP PDF, printed pp. 43 and 73, explicitly lists
   “Masse-Energie-Äquivalenz” within Relativistische Dynamik. The same
   overview/formalism guidance supports qualitative interpretation. The
   extraction's added operator wording is structured authoring; the
   original PDF does not prescribe the precise replacement sentence or
   the choice of subscript notation.
2. Hessen extraction source goal `he-phys-sekii-q4-4-b08-a01-070a8e3f`
   is partially mapped to this mass–energy goal in
   `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`.
   The original Q4.4 p. 46 clause is “relativistische Massenzunahme (nur phänomenologisch)”.
   Its LK continuation “Herleitung der relativistischen Massenzunahme” is
   source goal `he-phys-sekii-q4-4-b10-a01-6455866d`, mapped to adjacent
   canonical goal `79da5c34-86b2-5c10-9726-9de886ccef7d`. These inherited
   historical terms make explicit mass notation especially useful; the
   phenomenological clause by itself is not an exact rest-energy statement.

The adjacent canonical goal already defines the historical convention
`m_rel = gamma m_0 = E/c^2`, with `E` total energy and `m_0` fixed invariant
rest mass. Using `E₀ = m₀c²` here makes the rest-energy relation compatible
with those same symbols. Round A's `E₀ = mc²`, with `m` explicitly invariant,
is also physically valid; choosing `m₀` is a local notation decision and
does not require changing the adjacent goal.

As supplementary physical evidence, L. B. Okun explicitly distinguishes
rest energy `E₀` in `E₀ = mc²` from total energy and discusses the misleading
identification of speed-dependent energy with invariant mass. The paper
supports the meaning of the quantities, while this note's `m₀` is chosen
for the existing local notation.
[Okun, The Einstein formula: E₀=mc² (2008)](https://arxiv.org/abs/0808.0437), accessed 2026-09-05.

## Dependencies of any later canonical adoption

- Preserve IDs, titles, `requires`, `contains`, tags, applicability, demand
  levels and image bytes. The inspected scopes are qualitative explanation
  and interpretation. This note is not a nationwide mapping or projection
  audit and grants no coverage beyond the checked source routes.
- Both goals currently require
  `19aef2ed-eb46-55b1-9486-ee83f7520bb6` (Zeitdilatation erläutern) and sit
  under `157c404a-e14b-598a-9389-6924f8f9262e` (Spezielle Relativitätstheorie).
  In the inspected B033zb input, the time-dilation page refers back to the
  two goals using IDs, unchanged titles, anchors and page numbers only.
  Changing descriptions alone therefore does not itself alter that page's
  reference text. The two edited goal/page contexts, bundle and book digests
  must change. Any later full current-context comparison must decide actual
  affected pages rather than assume all nine changed.
- Outside this nine-goal subset, GPS feeds the practice goal
  `f532c772-7b6e-59aa-ad65-e0eeafc3767f`, and both feed the Q4 assessment goal
  `4a58df57-f791-502f-8b8d-9ba155e46035`. Those existing edges need no change
  for the proposed wording. Any artifact carrying copied descriptions or
  semantic fingerprints still needs its own currentness check.
- Both goals have `atomic` decisions in
  `curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl`
  and `no_memory_needed` decisions in
  `curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl`.
  A semantic description edit stales these fingerprints. Reassess the two
  decisions against the exact final text and record actual AI provenance;
  do not label a fingerprint-only rewrite as a new human review.
- In `curricula/DE/Gymnasium/release-model/physik.semantic-kinds.json`, the
  two description edits also stale the corresponding `sourceFingerprint`
  values. Refresh those bindings after checking the final goal semantics;
  the classification remains `curricularAtomic` after fachliche Prüfung.
- Existing round A/B records must remain historical revision evidence if
  the text is adopted. They cannot become final current reviews of changed
  descriptions. A later post-revision package requires fresh independent
  current rounds under the established rollout contract. Positive evidence
  stays a separately fingerprint-bound AI candidate until authorized by
  its own lane.
- The canonical accessibility text and the matching rows of
  `curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json`
  currently repeat the old descriptions. A later text update should reconcile
  those textual snapshots while preserving the source/public images and
  honest image-review state. Both current QA rows have `aiApproved: yes`
  and `humanApproved: no`; this note supplies no new visual review.
- Existing source image SHA-256 values, verified directly for this note:
  GPS `8229e3ed8c6b93b9519ea7cc6d9fd2c7d68238a845f75c32aea5a8ce32c2407e`;
  mass–energy `acbbb9f0592b4bb5102e8a38254215219c4a015b95d72c38abe6f07cb1b1fcbc`.
  Existing QA notes describe the latter's `E = mc²` as rest energy. A
  well-defined alternative image notation does not by itself require image
  regeneration merely to match the canonical subscript convention.
- Curriculum-quality status regeneration and the protected M6/maturity floor
  gate remain required for any subsequent implementation. This source note
  performs neither and makes no new maturity claim. The frozen OpenAI V1
  contract and runtime workflow are outside this recommendation.

Concrete downstream commands, identified from current package scripts and
configurations; listed for a later implementation, not executed here:

```bash
npm --prefix app run quality:semantic-atomicity:check -- --config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.config.json
npm --prefix app run quality:memory-card-review:check -- --config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.config.json
npm --prefix app run quality:memory-card-review:report -- --config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.config.json
npm --prefix app run quality:curriculum-status
npm --prefix app run quality:curriculum-status:check
```

`validate-authoring-change-set.mjs` is hard-wired to the historical Math33
receipt dated 2026-08-16. It does not validate this new Physics pair and is
therefore not included in the applicable commands above.

The memory report destination is
`docs/qa-ci/status/memory-card-review-canonical-physics-full.md`; regenerate it
from the ledger. Both goals currently have no required memory deck and no
card-origin record in `canonical-physics-full.cards.review.jsonl`, so the
description clarification does not itself require a card/deck edit.
`quality:curriculum-status:check` also invokes the protected maturity-floor
checker. Use the final description-edit lane's current-source check for the
new pair's review package and the existing seven unchanged pages; do not
replace a currentness comparison with a new review of unchanged text.

## Original local source copies inspected

- Hessen: `curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf`, SHA-256 `46f3e728b5d9fc6b5901f191247951a4a9d9c3df641afa60ca8b17a2e049813f`; registry URL [Hessen KC Physik 2024](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-physik.pdf).
- RP: `curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf`, SHA-256 `3bf220e5e409fc4ae057b3327dfa3d445a8f27ad6961925aae5eb16f2d1c12cc`; registry URL [Rheinland-Pfalz Lehrplan Physik MSS](https://static.bildung-rp.de/lehrplaene/naturwissenschaften/Lehrplan_Physik-Web.pdf).

Original PDF text was read locally using `pdftotext`; whole-document extracted
text was not written into the repository. The registry URLs identify those
sources; this note does not claim a fresh remote-byte equality check or a
human source verification.
