# Goal visualization review - Mathematik correction de393ab3

Date: 2026-07-06
Subject: Mathematik
Goal ID: de393ab3-d2af-5476-8b46-315185abb805
Title: Besondere Dreiecke untersuchen
Status: accepted_after_user_issue_correction

## User issue

In the right-triangle panel, the callout arrows had to point exactly to the intended mathematical objects:

- the right-angle arrow to the right angle,
- the Hypotenuse c arrow to the hypotenuse,
- the Kathete a and Kathete b arrows to the two legs.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Reference image: existing public asset for this goal.
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/de393ab3-d2af-5476-8b46-315185abb805.md`
- Accepted candidate: `tmp/goal-visualizations/de393ab3-d2af-5476-8b46-315185abb805/generated/de393ab3-d2af-5476-8b46-315185abb805.generated.2026-07-06T21-45-04-135Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/de393ab3-d2af-5476-8b46-315185abb805/de393ab3-d2af-5476-8b46-315185abb805.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/de393ab3-d2af-5476-8b46-315185abb805/de393ab3-d2af-5476-8b46-315185abb805.jpg`
- Asset hash: `sha256:4879a493d27544f81d966741ea54a06dbdddfc4766a153f315cf70c345f556b6`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Rejected candidates

- `2026-07-06T21-36-01-173Z`: rejected because the right-angle and `Kathete a` arrows were still too close and ambiguous.
- `2026-07-06T21-38-33-400Z`: rejected because the Katheten were mostly labels without clear arrows.
- `2026-07-06T21-41-23-755Z`: rejected because an upper `1 rechter Winkel (90°)` arrow pointed to the hypotenuse.
- `2026-07-06T21-43-00-484Z`: rejected because the upper right-angle arrow again pointed to the hypotenuse, and Katheten were not sufficiently arrow-marked.

## Review decision

Accepted.

- The upper wrong right-angle callout was removed from the right-triangle panel.
- `rechter Winkel (90°)` points to the angle square at the right angle.
- `Hypotenuse c` points to the slanted side opposite the right angle.
- `Kathete a` points to the vertical leg.
- `Kathete b` points to the horizontal leg.
- The Pythagoras relation remains correct: `a²+b²=c²`.
- Visible German text uses correct umlauts where applicable.
