# B036 positive V2 profile authorship — independent author record

Author started: 2026-09-06T08:37:51Z.
Candidate timestamp: 2026-09-06T08:58:02Z.
Native original-input checks completed: 2026-09-06T09:00:45Z.
Execution note completed: 2026-09-06T09:03:39Z.

## Scope and independence

Exactly the 20 ordered goals from the B036 description-batch config; 20 DE/EN profiles, two genuinely varied application cases each (40 cases), two explicit positive expectations each. Authoring-v2 prompt, physics profile criteria-v1, full closed profile/config schemas and production materializer were read. All 20 full immutable review-input JSONL pages, book model and the original bilingual input fields were read. No A/B decisions, other authored profiles, syntheses or previous canonical diffs were consulted for the authorship. The original bilingual input happens to reside below round-b; no result artifact there was accessed.

Primary candidate:
`curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-036-spectra-models-methods-20-v1.candidates.json`

New bounded config:
`curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-036-spectra-models-methods-20-v1.config.json`

The config names the conventional future central review path, but **that central review JSONL was not created**. No registry, canonical, visualization or global report was edited. All author writes used apply_patch.

## Bindings and native validation

Original GoalBook model digest:
`sha256:53447634cd068173c688d5a94822becaddb3f1ab6aa0c8520444a531332267b0`

Original bundle fingerprint:
`sha256:afe0b5764ffa9b1809d3590c235df4b2e4c924a39af9c1f31a884d4d3b480255`

Original review-input JSONL bytes:
`sha256:cf62ba6a5aa209d318e332f3424f4d261336c9f760764f92f75310f1e31a5612`

The helper `positive-evidence-author-check.mjs` recomputed the model digest through native stableGoalBookJson, checked all 12 manifest artifact byte hashes/lengths, exact ordered IDs, all DE/EN strings against then-current canonical goals, all original/native goal fingerprints, and authoritative curricularAtomic materialization. It performed 59 numerical/inequality assertions plus the documented qualitative checks. The complete file hashes and 20 per-goal goal/input/profile/criteria fingerprint bindings are in `positive-evidence-author-check-results.json`.

Native records are retained **only** at `positive-evidence-author-native-records.jsonl`; `positive-evidence-author-validation.config.json` differs from the new positive config only in pointing its reviewPath there.

At 09:00:45 UTC, both read-only checks exited 0:

```text
materializePositiveGoalEvidenceCandidates.ts --config <batch>/positive-evidence-author-validation.config.json --candidates <candidate>
Verified ...positive-evidence-author-native-records.jsonl: 20 current AI candidate profile(s).

positiveGoalEvidenceReview.ts --config=<batch>/positive-evidence-author-validation.config.json --mode=check
Configured goals: 20
Approved: 0
Needs human review: 20
Rejected: 0
Blocking issues: 0
```

AI authority remains needs_human_review / ai_candidate, E1/G1; reviewRunIds=[] and reviewedResourceTypes=[]. The author note is not a fabricated provider run manifest. No model snapshot, human approval, normative-source release, image approval or learner performance is claimed.

## Coordinated later canonical changes — original binding deliberately retained

After the successful original-input checks, the independently assigned translation writer was released to apply four bounded canonical corrections: badb0ef3, 84ddb244, 8ac61062 and ce14a7e7. The author candidates and original author records were not silently rehashed.

A second native read-only review after those writes, completed at 09:02:39 UTC, exited 1 with exactly eight messages: stale goalFingerprint and stale reviewInputFingerprint for each of those four IDs. The other 16 goals produced no errors. This is expected semantic-input drift, **not** an invalidity caused by needs_human_review. Exact output is preserved in `positive-evidence-author-post-translation-check.json`. Root owns the independently counterreviewed current derivation/rebinding. Re-running the original helper now intentionally fails its original/current text equality check.

## Fachliche checks and residual uncertainty

- Rydberg: 3→2 gives about 656.3 nm and 1.89 eV; 1→4 gives 97.23 nm and 12.75 eV; series limit about 91.16 nm. A rounding slip in the draft 1→4 result was corrected before materialization.
- X-ray lines: 8/9 keV and a second target's 13-keV line versus its 16-keV vacancy threshold. Pauli cases distinguish a spatial orbital from a degenerate energy level.
- Resonator: 500/250 MHz spacing, optically filled 500 MHz spacing and three candidate modes within the given band; round-trip intensity factor 0.935 means decay. Resonances do not supply pump energy.
- Lens model: near focus requires 18.52 mm; limited-accommodation cases require 16.67/18.75 mm and predict 21.95 mm for the limiting setting. Lens-screen cases predict 111.11/150 mm, consistent with their supplied uncertain measurements.
- Sound: pressure factor 10 versus intensity factor 100; equal simplified I·t exposure is not equal perceived loudness or medical safety. No normative health/exposure thresholds are asserted.
- Astronomy: dimensional conversions, roughly 126133 distance ratio, 3 pc≈9.78 ly, mass ratio 10 and luminosity ratio 2000. Pendulum means 1.01/1.42/2.01 s.
- Solar: all eight U/I pairs match their stated 100-Ω or 20-Ω loads. The original draft's incompatible equal per-module voltage/different current combination was removed before writing. Final unshaded per-module points permit decreasing I-V relations, and decisions have margins larger than supplied uncertainties. Data are explicitly teaching/model measurements, not laboratory observations; no universal doubling, complete I-V/MPP analysis or undocumented protection-diode behaviour is asserted.
- CERN cases are explicitly hypothetical: no dated current research source was supplied, so no actual discovery, facility cost or source clearance is claimed.
- The fluid goal retains precise dissent about bundled continuity/law/Re scope and uses Bernoulli as a selected law, not a new requirement to cover both Bernoulli and Stokes.
- Cross-stage eye/sound/SI goals preserve a common core. German fallback in the **original** English source fields is disclosed; later canonical translation does not retroactively change what the author read.
- The near-eye case describes hyperopic defocus (focus behind the model retina) under a stated limited refractive-power condition. This positional result alone is not a unique clinical diagnosis and cannot distinguish all physiological causes of near blur; that no-clinical-diagnosis boundary is explicit in expectations and dissent. Independent counterreview may prefer an additional relaxed-eye premise for clearer differentiation.
- Normative source passages and actual instrument/model implementations were not supplied; selected contexts and historical teaching dossiers must not be mistaken for normative-source approval. Images remain a separate QA lane and are not performance evidence.

The result is bounded authoring evidence, not approval, mastery evidence, an atomicity/identity decision or a release.
