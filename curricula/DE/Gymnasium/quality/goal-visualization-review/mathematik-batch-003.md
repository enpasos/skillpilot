# Goal Visualization Review - Mathematik Batch 003

Review date: 2026-06-28

Scope: canonical `DE Gymnasium Mathematik`, atomic goals.

Generator:

- Provider: Google Gemini / Nano Banana Pro
- Model: `gemini-3-pro-image`
- MIME type: `image/jpeg`
- Aspect ratio: `16:9`
- Review status in JSON links: `pilot`

Prompt policy:

- Provider prompts use only title and learning-goal description plus targeted regeneration constraints where needed.
- SkillPilot IDs are not sent to the image model.
- IDs remain only in filenames, directories, JSON links, and prompt metadata.

## Reviewed Assets

| Goal ID | Title | Decision | Notes |
| --- | --- | --- | --- |
| `cba4cad7-926d-5035-a7dd-d450afccccb3` | Halbierende Geraden mit Geodreieck und Zirkel konstruieren | `accepted_pilot_after_regeneration` | First attempt was rejected because the angle-bisector panel was visually too busy and not clearly tied to a single angle. Regenerated as two focused panels for the perpendicular bisector of `AB` and the angle bisector of `ABC`; current asset is acceptable. |
| `31a89d59-7d45-5e60-a8e8-561001b05f2d` | Punktmengen mit Abstandsbedingungen kennzeichnen | `accepted_pilot` | Shows the correct core idea: points at fixed distance from one point form a circle, and points at fixed distance from a line form a pair of parallel lines. The image is text-heavy, but no gross mathematical error is visible. |
| `2331caf2-ccb2-5492-9fc6-48763b848bae` | Winkel messen, zeichnen und fachsprachlich beschreiben | `deferred_provider_limitation` | Withdrawn after user review: repeated Nano Banana Pro attempts represented angle measurement with the Geodreieck incorrectly or ambiguously. Fachliche requirement: the Geodreieck keeps its fixed 45-45-90 shape; for measuring, its zero point/midpoint lies on the angle vertex and the long base lies on one side of the angle. The active `resourceLinks` image reference and published asset copies were removed. Revisit when the provider handles precise tool-use diagrams more reliably. |
| `d98849c7-bd0b-50d4-90aa-6293a3adb211` | Vierecke erkennen, darstellen und Eigenschaften nutzen | `accepted_pilot_after_regeneration` | First attempt was rejected for unnecessary English header text and excessive learner-facing framing. Regenerated with six German panels for Quadrat, Rechteck, Parallelogramm, Raute, Drachenviereck, and Trapez; current asset is acceptable. |
| `f2e42af5-67a6-477e-82ea-e65b09cc6cb3` | Größen und Einheiten vergleichen und umrechnen | `accepted_pilot` | Shows suitable grade-5 examples for measuring, choosing units, converting `1 m = 100 cm`, `1 kg = 1000 g`, `1 min = 60 s`, and comparing converted quantities. Layout is dense but mathematically coherent. |

## Checks

- No current Batch 003 provider request contains a SkillPilot ID.
- No current Batch 003 provider request contains the string `SkillPilot`.
- Accepted reviewed assets do not visibly contain SkillPilot IDs.
- Accepted regenerated assets replaced both canonical and public image copies.
- The deferred angle-measurement visualization has no active canonical `resourceLinks` image reference and no published canonical/public asset copy.

## Follow-Up

Construction and angle goals need tightly constrained prompts. For future batches, name the exact construction object and include one concrete, correct target configuration instead of asking generally for a construction process. If repeated Nano Banana Pro attempts still misrepresent precise tool use, defer the visualization instead of substituting a hand-drawn SVG asset.
