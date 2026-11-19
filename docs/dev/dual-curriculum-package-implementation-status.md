# Dual Curriculum Package Implementation Status

As of **19 November 2026**. This page distinguishes the current repository contract from the completed technical evidence for the July candidate. It grants no new package publication approval and claims no new CI acceptance.

## Current Contracts and Content

| Area | Verified repository state |
| --- | --- |
| Package contracts 1.0 and 1.1 | Earlier contracts remain unchanged. New fields must not silently ship under an older profile. |
| Package contract 1.2 | Carries `learningUnitsV1` with the existing unit, ownership, and review definitions. This does not establish complete runtime implementation of the target model. |
| Common candidate 1.3 | Adds Land/duration stage plans, `assessmentMaterialsV1`, and source composition views 1.2 including `childOrder.after` and `acquisitionPlacement`. It remains an unpublished candidate. |
| Mathematics views | The current source inventory contains 100 `*.view.json` files. The frozen July package's 88 views are a historical package inventory; `publicationBaseViewCount` explicitly preserves it. |
| Subject quality | Mathematics is **M7** in the committed quality report dated 17 November. This is machine QA with bound content reviews, rather than human trials or approval of a new package. |
| Licensing and learning-goal book | Own learning content and learning-goal books use **CC-BY-4.0**; #163 displays their license and OER status. Software and technical contracts use Apache-2.0. Third-party rights and approval decisions remain separate. |

The [1.3 contract documentation](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1.3/README.md) states transport rules, explicit CLI selection, separate redistribution evidence, and outstanding integration. The [build profile](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1.3/profiles/de-gymnasium-mathematik-release-model-v1.3.profile.json) binds the current inventory. The [quality report](../qa-ci/status/curriculum-quality-status.json), [license allocation](https://github.com/enpasos/skillpilot/blob/main/LICENSING.md), and [management record](stage-plan-management-summary.md) provide the respective evidence.

A successful 1.3 JSON candidate build establishes neither an equivalent 1.3 FWU-OWL roundtrip, an activated real Land plan, a complete recognition runtime, nor production use. Existing R1–R5 contracts remain authoritative. The [19 November unit-completion proposal](../concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) does not change them automatically.

## Retained July Technical Closure

The [complete unchanged July record](https://github.com/enpasos/skillpilot/blob/6bdf9474025b390d7dc6432ce756c19792d41590/docs/dev/dual-curriculum-package-implementation-status.de.md) preserves P0–P2 and DPK-000 through DPK-008d with their original inputs, hashes, and local checks. Its last completed delivery reconstructs an installable JSON runtime package from an independently validated FWU-OWL ZIP without the original JSON or TypeScript forward exporter. Two hermetic runs produced identical outputs; independent validators checked packages and bound evidence. These results do not transfer to today's catalog.

| Historical milestone | Result and boundary |
| --- | --- |
| P0 | Package, profile, and equivalence contracts plus Mathematics conformance model. |
| P1 | Hermetic JSON package consumer with catalog, source, card, and resource resolution. |
| DPK-006c-c | Exact view/offering resolution for that package generation. A collapsed cluster does not thereby become an assessed subject atom; this historical consumer boundary does not waive atomic prerequisites. |
| P2 / DPK-008d | Core-first FWU-OWL, independent validator, and isolated reverse compiler; 111 logical artifacts and 757 byte-identical binary resources in that evidence. |
| P3–P6 | The July record lists them as `not_started`: common semantic dual-release closure, generalisation, signed operation, and complete decoupling. This page claims no later complete acceptance. |

## Next Verifiable Delivery

Outstanding dual-release gates must bind the original and reverse compilation under the same current contract version: a normalised `contentDigest`, independent equivalence report, and two reproducible representation pairs. An earlier DPK pass or current subject M7 does not replace these. Current unit/stage-plan work follows the [15 November mandate](stage-plan-units-handover-2026-11-15.md), with delivery recorded in the management summary.

Public packages additionally require the [human release reviews](../qa-ci/curriculum-package-human-review-gates.md), [readiness gates](../qa-ci/curriculum-package-readiness.md), and applicable rights decisions. Local package checks do not establish publication, deployment, or host acceptance.
