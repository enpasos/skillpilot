# Q2 Spatial eleven: substantive synthesis candidates

Status: batch-local machine synthesis candidates only. No canonical goal, central registry, or in-flight ledger was modified. This report does not claim approval, human review, classroom testing, or central strict completion.

## Current binding and independent runs

- v2 batch: `mathematik-m7-q2-spatial-eleven-current-20260924-v2`; 11 exact current goal IDs; current normalized review input fingerprint `sha256:e0e6fb83c796523505db636ad4f1d40a78a28de20ecaafabeaa0b5818a520db0`.
- Current GoalBook PDF digest: `sha256:b52ffbccaf41a8c818c630082fe9746c994e05ee40e24271945dfd3bff58e37e`.
- Source: official HMKB KCGO Mathematics, physical/printed pages 42–43. PDF digest `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`; exact extraction and digest are in `source-material/source-extraction-receipt.json`.
- A: local Codex CLI `gpt-6-sol`; B: separate local Codex CLI `gpt-6-luna`. The exact model flags and local catalog identities are recorded under each `round-*/run-context/` directory. Only the current rendered GoalBook pages 3–13 were attached, as page/text mapping context; illustrations were not judged.
- Both campaign validators passed 11/11. The dual-round validator passed `require_distinct_provider_or_model`, with distinct model identities. The batch check passed. `dual-summary.json` records 0 exact matches, 11 differences, and 11 requiring synthesis. Most are same decision with different wording/evidence; they are not 11 decision conflicts.
- No per-goal strict resolution was materialized. In particular, all seven revise/revise targets still require an authorized canonical wording change followed by a fresh exact-bound A/B review before strict D closure.

## Goal-by-goal synthesis

| Exact goal ID | A / B | Exact current source and synthesis candidate | Strict status / remaining issue |
|---|---|---|---|
| `baf7276f-60a0-4d96-b959-d63acfb929de` | revise / revise | p. 42 states the line–plane positional relationship and determining through-points. Candidate wording: distinguish one intersection, parallel/no intersection, and a line contained in the plane. | D wording candidate only. Current goal has no direct `sourceRef`; the supplied official text supports the content, but canonical mapping remains unverified. Needs text change and fresh A/B. |
| `8eb14d81-353a-4909-9464-61be7b1ba5b8` | revise / revise | p. 43 lists foot-point distance procedures among points, lines, and planes. Candidate wording: state that a nonzero object distance is the shortest perpendicular separation for parallel configurations, and that intersecting objects have distance zero. | D wording candidate only. Current goal has no direct `sourceRef`; mapping remains unverified. Needs text change and fresh A/B. |
| `18be713b-7d90-4f01-b60a-5582ac4df0e8` | revise / revise | Bound sourceRef points to p. 42 bullets 3 and 8: line–line, line–plane, and plane–plane angles. Candidate: name those object pairs and retain the actual-intersection condition for a Schnittwinkel. | D wording candidate only. Its separate P-v2 check reports stale `reviewInputFingerprint` (`expected sha256:43ccd76e…`); no fingerprint refresh was made. P block remains. |
| `6b2a1c04-8c28-51ff-905b-9c9492a26cc3` | keep / revise | p. 42 and 43 together support special line–plane and plane–plane positions. Candidate synthesis is to keep the present broad description: the B proposal narrows the titled line/plane family to line–plane alone. | Keep candidate only. No direct `sourceRef` is present; do not claim the canonical mapping is verified. Not formally resolved. |
| `0f4f9957-8afe-4aab-9dd8-c26c9aee2afd` | block / block | Bound sourceRef is p. 43 bullet 13, which supports two-plane positions. The title also claims line–plane positions while the current description and that direct sourceRef cover only two planes. | Open blocker: title/description/source scope conflict needs author/source-mapping resolution. No wording proposal. |
| `5f90df42-8a71-534d-b995-b8f7dcaf1661` | revise / revise | Bound sourceRef is p. 42 bullet 9; p. 42 bullet 8 supplies the stated angle pairs. Candidate: distinguish line–plane and plane–plane angles and require admissible parameter values for angle, orthogonality, parallelism, or positional conditions. | D wording candidate only. Needs text change and fresh A/B. |
| `79c4cd21-af64-5925-968e-9bc1f74cd0ad` | keep / revise | Bound sourceRef is p. 42 bullet 10, explicitly naming foot-point procedures for point–plane distance. The B proposal makes the shortest-distance justification explicit, as required by the math criterion. | Keep/revise dissent remains open here; recommend the bounded revision, then fresh A/B. No current strict resolution. |
| `c2c49659-5917-5be5-a3bd-e46f1b17126f` | split_review / split_review | Bound sourceRef p. 43 bullet 13 covers distance procedures broadly. Both reviews identify independently assessable point/line/plane pairs and distinct foot conditions; the current semantic-atomicity ledger says atomic, so evidence conflicts across gates. | Open atomicity conflict. Preserve the current ledger row; obtain a targeted semantic decision or split design before closure. |
| `fcd1d180-ddce-5408-8c5d-70e417b179e7` | revise / revise | Bound p. 43 bullet 13 supports general point reflection; current direct prerequisite names reflection of points at planes. Candidate: name the mirror plane and check perpendicular-bisector/midpoint conditions. | D wording candidate only. Needs text change and fresh A/B. |
| `a97c7cce-1343-5d04-926f-4a4f323b3c21` | revise / revise | Bound p. 43 bullet 13 supports general line reflection; point-reflection prerequisites support constructing the image line. Candidate: name the mirror plane and geometrically check the reflected line. | D wording candidate only. Needs text change and fresh A/B. |
| `985d5529-a586-50eb-bd7f-2db2be8906d1` | revise / revise | Bound p. 43 bullet 13 supports general plane reflection; point/line prerequisites and point–plane methods support a mirror-plane construction. Candidate: state reflection across a mirror plane and check the image plane via perpendicular-bisector conditions. | D wording candidate only. Needs text change and fresh A/B; B's raw `Bild-ebene` typo is not adopted. |

## Cross-gate status for these 11 targets

- Semantic atomicity check: current full mathematics ledger passed, 797/797 current atomic, 0 stale; all 11 exact target rows are `atomic`. The `c2c49659…` current D-round split recommendation still conflicts with that ledger and is not overridden here.
- Memory/card check: current full mathematics review passed with 797 ordinary atomic goals, 0 stale reviews/cards, 128 card rows and both visibility scopes complete. All 11 target rows currently say `no_memory_needed`.
- Positive-understanding-evidence-v2: current target records are AI candidates with truthful `needs_human_review` status; no human approval is inferred. The fresh D packet has `evidenceProfile: null` for all 11. Current profiles remain separately bound; three relevant P configs were checked. Two configs had no blockers; the 14-goal P config reports stale `reviewInputFingerprint` for `18be713b…` (and an unrelated out-of-batch goal). No hash-only rebinding was done.
- Visualization state in the current book pages: 10 images are `review_candidate` and `approvedForPublication=false`; `18be713b…` has no visualization. No image generation, image correctness review, or visualization approval was performed in this description-only task.
- Current sourceRef is null for `baf7276f…`, `8eb14d81…`, and `6b2a1c04…`. The exact official excerpts were supplied to A/B, but this report does not promote those content citations into canonical source mappings.

## Strict gain

- New strict per-goal D closures: 0. The only eligible keep/revise pairs remain synthesis candidates; the seven revise/revise pairs need applied text and fresh independent reviews; the two hard cases remain open.
- Net strict central gain: 0/797. No canonical, central Registry, or in-flight ledger file was changed.
- Separate human release gates remain separate: the P-v2 records say `needs_human_review`; this package does not claim they passed human review or release approval.
