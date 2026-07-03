# Goal Visualization Review - Physik Batch 004

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Physik`, fourth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed_with_user_review_correction`

Batch file: `tmp/goal-visualization-physik-batch-004.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-004`

Context:

- This batch covers the first atomic-structure and radiation learning goals, followed by the first optics goals on straight-line light propagation, ray diagrams, and reflection.
- The review applied the strict arrow rule from the mathematics rollout: every visible physical arrow, ray, connector, or dashed segment must have a coherent source and target. If an arrow can be read as a physical path, it must be physically right.
- Two optics assets were later replaced after user review: the point-source shadow diagram now uses a one-dimensional screen cross-section with a visibly larger shadow segment, and the aperture/ray-model diagram now shows all rays starting at the point source and passing through the aperture opening.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb` | initial Batch 004 candidate | `rejected_regenerated` | The first atom candidate was otherwise close, but small arrow-like marks next to electron dots could be read as electron motion or exact orbit arrows. Rejected under the strict arrow policy. |
| `2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb` | Kern und Hülle des Atoms qualitativ beschreiben | `accepted_pilot_after_regeneration` | The accepted image shows a small central `Kern` with red protons and gray neutrons, a much larger `Hülle`, and blue electron dots only in the shell region. Label lines have no arrowheads and do not imply exact electron paths. The scale note correctly states that the nucleus is very small, the shell is very large, and the atom is mostly empty space. |
| `f6f646db-3544-49ed-8f55-67bc684e80ce` | Radioaktive Strahlung nachweisen und Wirkungen einordnen | `accepted_pilot` | The accepted image distinguishes alpha, beta, and gamma radiation and connects them to paper, aluminium, and lead/concrete shielding in the correct qualitative order. The Geiger-Mueller counter is shown as a detector, not as a source. Radiation arrows run from the radioactive source toward shields or detector, and the protection icons for distance, shielding, and short exposure are coherent. |
| `979e0d0d-8933-4ace-814f-f28060ad280f` | Anwendungen und Risiken radioaktiver Strahlung beurteilen | `accepted_pilot` | The accepted image separates applications in medicine, material testing, and nuclear energy from risks such as tissue damage, waste/shielding, and accident risk. The balance graphic communicates qualitative weighing of benefit and risk. Visible arrows are evaluation, placement, distance, or protection markers; no accepted physical radiation path is shown in a wrong direction. |
| `dd7cdcea-0950-461b-96ac-ce49989fca47` | Licht, Schatten und geradlinige Ausbreitung beschreiben | `accepted_pilot` | The accepted image shows rays from a point-like light source toward the screen. The boundary rays pass the opaque object and reach lit regions on the screen; the central ray stops at the object. The shadow region is behind the object, and all ray arrows have source-target direction from lamp toward screen or object. |
| `dd7cdcea-0950-461b-96ac-ce49989fca47` | original Batch 004 accepted asset | `rejected_after_user_review_replaced` | Rejected after user review because the point-source shadow image on the screen was not robustly drawn as larger than the opaque object. For a point-like light source, the boundary rays diverge, so with the screen farther away than the object the shadow image must be larger, not smaller or equal-sized. |
| `dd7cdcea-0950-461b-96ac-ce49989fca47` | Licht, Schatten und geradlinige Ausbreitung beschreiben | `accepted_pilot_after_user_review_correction` | The corrected image uses a point-like light source, an opaque object, and a screen in one ray diagram. The two boundary rays start at the point source, touch the top and bottom object edges, continue straight to the screen, and define a `Schattenbild` that is visibly larger than the object. No ray passes through the object and no ray starts at the screen or shadow. |
| `dd7cdcea-0950-461b-96ac-ce49989fca47` | first user-review correction | `rejected_after_user_review_replaced` | Replaced after follow-up review because it still drew a two-dimensional screen surface although the shadow geometry was only reliable in the one-dimensional side-view cross-section. |
| `dd7cdcea-0950-461b-96ac-ce49989fca47` | Licht, Schatten und geradlinige Ausbreitung beschreiben | `accepted_pilot_after_user_review_correction` | The final accepted correction shows a flat 2D side-view cross-section with a point-like light source, an opaque circular object, and the screen only as a vertical line. The two straight boundary rays start at the point source, are tangent to the object, and end on the screen line. The dark `Schattenbild` segment on the screen line is visibly larger than the object diameter, and the bright `Licht` segments are above and below it. |
| `79cb1695-f985-443a-b93e-27b57ab474b7` | Lichtwege mit dem Strahlenmodell darstellen und vorhersagen | `accepted_pilot` | The accepted image shows straight light rays from a source through an aperture to a screen. Arrowheads point from the light source through the aperture toward the illuminated area on the screen. The rule `Strahlenmodell: gerade Linien zeigen den Lichtweg` is correct, and no ray points backward from the screen. |
| `79cb1695-f985-443a-b93e-27b57ab474b7` | original Batch 004 accepted asset | `rejected_after_user_review_replaced` | Rejected after user review because the light rays before the aperture did not cleanly start at the point source; the aperture principle must be represented by straight rays from the point source through the opening, with no ray passing through opaque parts of the barrier. |
| `79cb1695-f985-443a-b93e-27b57ab474b7` | Lichtwege mit dem Strahlenmodell darstellen und vorhersagen | `accepted_pilot_after_user_review_correction` | The corrected image uses a flat 2D side-view cross-section with a point-like light source, an aperture made of two opaque barrier parts, and the screen as a vertical line. All three visible rays start at the same point source, pass through the aperture opening, and end on the illuminated screen segment. No ray bends at the aperture, starts at the screen, or crosses an opaque part of the barrier. |
| `cca06d84-28fe-4b80-9bcd-968dda026e0e` | Reflexion untersuchen und Spiegelbilder deuten | `accepted_pilot` | The accepted image shows an incident ray toward the mirror, a reflected ray away from the mirror, the normal `Lot`, and equal marked angles `alpha` to the normal. The mirror-image panel places the image behind the mirror with equal-distance intent. The dashed distance marker is a measurement marker, not a light path. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 004 goals were deferred as provider limitations.
- `1` initial Batch 004 candidate was rejected and regenerated before import.
- `2` previously accepted Batch 004 assets were replaced after user review correction.
- Every visible physical arrow, arrow-like marker, pointer, connector, ray, or dashed segment in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 004 asset used an SVG fallback as the final asset.
- No final Batch 004 provider prompt text contains the string `SkillPilot`.
- No final Batch 004 provider prompt text contains its canonical goal ID.
- No final Batch 004 provider prompt text contains `Mathematik`.
