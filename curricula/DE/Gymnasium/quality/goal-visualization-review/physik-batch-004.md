# Goal Visualization Review - Physik Batch 004

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Physik`, fourth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-004.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-004`

Context:

- This batch covers the first atomic-structure and radiation learning goals, followed by the first optics goals on straight-line light propagation, ray diagrams, and reflection.
- The review applied the strict arrow rule from the mathematics rollout: every visible physical arrow, ray, connector, or dashed segment must have a coherent source and target. If an arrow can be read as a physical path, it must be physically right.
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
| `79cb1695-f985-443a-b93e-27b57ab474b7` | Lichtwege mit dem Strahlenmodell darstellen und vorhersagen | `accepted_pilot` | The accepted image shows straight light rays from a source through an aperture to a screen. Arrowheads point from the light source through the aperture toward the illuminated area on the screen. The rule `Strahlenmodell: gerade Linien zeigen den Lichtweg` is correct, and no ray points backward from the screen. |
| `cca06d84-28fe-4b80-9bcd-968dda026e0e` | Reflexion untersuchen und Spiegelbilder deuten | `accepted_pilot` | The accepted image shows an incident ray toward the mirror, a reflected ray away from the mirror, the normal `Lot`, and equal marked angles `alpha` to the normal. The mirror-image panel places the image behind the mirror with equal-distance intent. The dashed distance marker is a measurement marker, not a light path. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 004 goals were deferred as provider limitations.
- `1` initial Batch 004 candidate was rejected and regenerated before import.
- Every visible physical arrow, arrow-like marker, pointer, connector, ray, or dashed segment in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 004 asset used an SVG fallback as the final asset.
- No final Batch 004 provider prompt text contains the string `SkillPilot`.
- No final Batch 004 provider prompt text contains its canonical goal ID.
- No final Batch 004 provider prompt text contains `Mathematik`.
