# Goal Visualization Review - Mathematik Batch 002

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
| `25593605-5e13-55cc-9a05-8f3d737e15e9` | Punkte, Strecken, Geraden und Kreise im Koordinatensystem darstellen | `accepted_pilot` | Shows a coordinate grid with points, a segment, lines, and a circle. The layout is somewhat dense, but the represented objects are suitable for the goal and no gross mathematical error is visible. |
| `121e3fdf-54d2-4d46-bc2d-f6e725f10f41` | Figuren im Koordinatensystem darstellen und Koordinatendarstellungen geometrischen Situationen zuordnen | `accepted_pilot_after_regeneration` | First attempt was rejected because it mixed in transformations and extra topics beyond the goal. Regenerated as a first-quadrant rectangle with `A(1|1)`, `B(5|1)`, `C(5|4)`, `D(1|4)` and a matching school-garden context; current asset is focused and mathematically acceptable. |
| `2231c29b-eb4e-51ae-9cb1-eb033bf16099` | Lagebeziehungen geometrischer Objekte beschreiben | `accepted_pilot_after_regeneration` | First attempt was rejected for being too broad, especially distance, lot, and tangent content. Regenerated as four simple cases: point on a line, point not on a line, parallel lines, and intersecting lines; current asset is focused and acceptable. |
| `3e53a39b-1c75-4034-a647-8de85719e1fb` | Lagebeziehungen geometrischer Objekte fachsprachlich beschreiben | `accepted_pilot_after_regeneration` | First attempt was rejected because some line representations were visually ambiguous. Regenerated as four clean panels for `parallel`, `senkrecht`, `schneidend`, and a segment with midpoint; current asset is suitable for fachsprachliche Beschreibung. |
| `c31d3a7a-778b-5ae3-9aa4-7b5674047f83` | Parallele und senkrechte Geraden konstruieren | `accepted_pilot_after_regeneration` | First attempt contained unclear auxiliary construction marks. Regenerated as two explicit Geodreieck panels for constructing a parallel and a perpendicular line. Current asset shows straight parallel lines and a right angle. |

## Checks

- No current Batch 002 provider request contains a SkillPilot ID.
- No current Batch 002 provider request contains the string `SkillPilot`.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- Regenerated assets replaced both canonical and public image copies.

## Follow-Up

Batch 002 confirms that unconstrained geometry prompts often introduce extra content. For geometry goals, prefer a short regeneration constraint that names the exact objects to show and explicitly excludes nearby but non-target content such as transformations, tangent constructions, distance calculations, or compass constructions.
