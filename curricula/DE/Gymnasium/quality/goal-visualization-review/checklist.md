# Goal Visualization Review Checklist

Scope: canonical `DE Gymnasium Mathematik`, atomic goal visualizations.

## Review Rule

Generated images are never accepted automatically. Each image must be visually checked before it is considered curated pilot content.

## Required Checks

- The image targets exactly one atomic goal.
- All calculations, comparisons, units, coordinates, formulas, and labels are correct.
- The drawing matches the labels, for example marked digits, angle sizes, number-line positions, side marks, or coordinate points.
- No visual element teaches or reinforces a misconception.
- The image does not introduce distracting adjacent topics.
- The content fits the intended year level.
- Text is readable at cockpit card width and does not dominate the image.
- No SkillPilot ID appears inside the provider request or visible image.
- Provider-facing prompts avoid the platform name where possible; prefer neutral wording such as `technical IDs`.
- No watermark, provider artifact, protected character, copied worksheet, or third-party layout is visible.
- Alt text and JSON metadata are present in `resourceLinks`.

## Reject Or Regenerate

Reject or regenerate if any of these occur:

- wrong result, formula, notation, value, comparison, or unit conversion
- visually misleading representation despite correct text
- mismatch between a label and the marked object
- ambiguous geometry, especially angles, parallel/perpendicular lines, coordinates, or side properties
- wrong tool geometry or tool placement, for example a Geodreieck whose fixed 45-45-90 shape is changed or whose zero point is not placed on the angle vertex for angle measurement
- wrong or confusing rounding digit, place-value group, sign rule, or counterexample
- too much text for cockpit display
- target-age mismatch
- visible ID, watermark, or copied layout

## Decision Labels

- `accepted_pilot`: usable in controlled pilot after review
- `accepted_pilot_after_regeneration`: usable after rejected attempt was replaced
- `accepted_pilot_after_second_regeneration`: usable after two rejected attempts were replaced
- `rejected_regenerate`: not usable; create a targeted replacement
- `deferred_provider_limitation`: repeated Nano Banana Pro attempts stayed fachlich wrong; remove the active image link and revisit later
- `needs_external_review`: plausible but should not be promoted without external subject review

Record every batch under this directory and include rejected/regenerated attempts. Do not replace repeatedly wrong Nano Banana Pro images with hand-drawn SVG assets in this lane; defer the goal instead.
