# Goal Visualization Review - Mathematik AI Correction Shard 1

Review date: 2026-07-16

Scope: two bounded correction batches covering twelve rejected images from fresh AI review shard 1.

Status: `completed_with_two_deferred_provider_limitations`

## Outcome

| Goal ID | Decision | Final hash | Review |
| --- | --- | --- | --- |
| `ced4f794-9b42-4be4-bde5-7d44f134a140` | `accepted_pilot_after_second_attempt` | `sha256:fdb50375e130c39303296ea3f16598eee04f99dbf6c07c456d7867167d592bdc` | The accepted image explicitly defines `A(x)=∫₀ˣf(t)dt`, names continuity, shows the local strip argument, and reaches `A′(x)=f(x)` with a consistent linear example. |
| `ae483d98-54e0-5985-96d2-fc1351d22e4f` | `deferred_provider_limitation` | none | Three attempts corrected the original absolute-spread misconception by using `X/n`, but none simultaneously kept comparable-alpha decision boundaries and unambiguous alpha/beta region labels. The final attempt still pointed `β≈0` into a region right of the decision boundary. The active link and canonical, public, and backend asset copies were removed. |
| `377282dc-80b0-5bbf-bef2-a9f22e3919c1` | `accepted_pilot` | `sha256:521fd68c811d05d6c478ee87ea24296bcf687d6251ffe3ef572f18647ad2e112` | Implication, converse, contraposition, and equivalence are visibly separated and logically correct for the divisibility example. |
| `cf4fe700-dec2-502f-888b-90acefa307bb` | `accepted_pilot` | `sha256:1552085399dc6e440b37c6effea0eedcfbe91504d9af5be0930de83892fb9b22` | The visible slope triangle now has exact legs `Δx=2` and `Δy=4` between the plotted coordinates, consistent with `m=2`. |
| `2afba4a2-287d-5e8f-aeee-a3bcf8652236` | `accepted_pilot` | `sha256:24e25b5070d120dd9773f93177b19575dadabdd40f0bb47abb1f208dc563f4d3` | The time-axis wording is correct, and rate, area, units, water levels, and the reconstructed final stock are mutually consistent. |
| `0e8417d7-effb-5314-93ba-a571b01726ce` | `accepted_pilot_after_third_attempt` | `sha256:43fa6a5748a19e636131c2174d7ca9f6e7ed9900c04b207bdc44599e6bb5b901` | The final image has correct lowercase wording, a non-redundant product-rule verification, the correct antiderivative, and the exact definite integral and area. |

## Checks

- Every provider call used `--no-import`; candidates were inspected at original resolution before any import.
- Provider prompt append checks passed for all attempts.
- Prompt append text contains no technical IDs, file names, product/platform names, or school-form labels.
- No SVG or manual fallback asset was used.
- Detailed attempt paths, hashes, decisions, and concrete review notes are recorded in `tmp/fresh-ai-review/shard-1-corrections.jsonl`.

## Follow-up correction batch

| Goal ID | Decision | Final hash | Review |
| --- | --- | --- | --- |
| `24f21c0c-b506-56ec-ad17-39b209af4585` | `accepted_pilot` | `sha256:f03ea412f1eacc774ebe0d0bdd19cded49d28a16b83c1922531e0f41cfa562b2` | The graph of `f(t)=2t` now passes through the origin, and its accumulated triangular area, the integral definition, `F₀(x)=x²`, the marked values, and `F₀′(x)=f(x)` agree. |
| `0b162cb0-8507-5ac2-b9d6-57f40f4d3f35` | `accepted_pilot_after_second_attempt` | `sha256:532ff015057db5c336b05c7710accabc0d2a8879a218f31b2f5b69231050cce1` | Rate graph, shaded quantity, integral, units, and the final contextual sentence are correct and free of duplicated words or course labels. |
| `649b673c-1a74-5dc5-af01-b4c9e090b90d` | `accepted_pilot_after_third_attempt` | `sha256:79aa691ef2d905113f80097b91e7e42b198ee8d460ed79bab25c8acf2e43ab7f` | Both integral laws, every bound and result, and the trapezoid areas for `f(x)=x+1` are correct and no text artifact remains. |
| `7676b0f9-340d-4a91-ab1f-92745a8f88db` | `accepted_pilot_after_second_attempt` | `sha256:44657f853eb00939b45a74fca1ea65935c0c9bc977ba5c8c67fba2030fc2a7ac` | The parity contradiction, `√2∉ℚ`, number-set placement, and German decimal-comma approximation are all correct. |
| `7d41b805-0fd8-5ac3-980d-79112a27c1b4` | `accepted_pilot_after_second_attempt` | `sha256:f35926b9b8df4910b6643499588a70117646e4d96efa1351292a5b89c5670d8d` | Exactly 16 symbols are shown, and `n`, `p`, expectation, variance, standard deviation, interval labels, relative spread, and decimal commas are mutually consistent. |
| `05946a6a-b41e-5cec-8a39-237f889f4d93` | `deferred_provider_limitation` | none | Three targeted attempts alternated between shifted `μ=0` maxima, a false `k`-effect label, and an unpaired extra catenary branch. The active link and canonical, public, and backend asset copies were removed. |

All follow-up candidates were also generated with `--no-import` and inspected at original resolution. Five accepted assets were imported as technical pilots. The sixth goal was withdrawn after the third rejected attempt, with no SVG or manual fallback.
