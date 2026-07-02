# Goal Visualization Review - Physik Batch 007

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Physik`, seventh Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-007.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-007`

Context:

- This batch covers qualitative mechanics: Weg-Zeit diagrams, force and inertia, force-vector properties, friction, work/simple machines/efficiency, and mechanical energy forms.
- The review applied the strict arrow rule: every visible physical arrow, force vector, motion marker, path marker, connector, or dashed segment must have a coherent source and target. If an arrow can be read as a physical statement, it must be physically right.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `ae67bcf1-f3ee-50d6-9a12-25a159dff659` | initial Batch 007 candidate | `rejected_regenerated` | The lower Weg-Zeit graph was usable, but the upper position strip showed the accelerated motion with equal spacing instead of increasing spacing. Rejected because the visible representation contradicted acceleration. |
| `ae67bcf1-f3ee-50d6-9a12-25a159dff659` | Bewegungen mit Weg-Zeit-Diagrammen beschreiben | `accepted_pilot_after_regeneration` | The accepted image uses axes `t in s` and `s in m`, a straight rising line for uniform motion, and a convex rising curve for accelerated motion. The value table is consistent: uniform `s = 0, 2, 4, 6`, accelerated `s = 0, 1, 4, 9`. Only mathematical axis arrows are used. |
| `5ea765ac-c279-551a-8a94-a07da2381e5b` | initial Batch 007 candidate | `rejected_regenerated` | The force-arrow panel was acceptable, but the braking-bus inertia panel made the passenger lean in a direction that was not consistent with the vehicle front and braking situation. Rejected under the strict direction policy. |
| `5ea765ac-c279-551a-8a94-a07da2381e5b` | Kraefte und Traegheit qualitativ erklaeren | `accepted_pilot_after_regeneration` | The accepted image shows uniform continuation without a force arrow, a push force arrow starting on the cart and pointing right, and an inertia panel where a ball continues moving right after the cart stops. The motion arrow starts at the ball and points in the continued motion direction. |
| `10bb8262-fb0f-40cf-94ef-408420ec7cf2` | Kraefteeigenschaften qualitativ nutzen | `accepted_pilot` | The accepted image shows same-direction force addition with the resultant to the right, opposite unequal forces with the resultant toward the larger leftward force, and a dashed Wirkungslinie aligned with a force arrow. The visible force vectors and resultants have coherent directions; no vector points opposite to the stated physical situation. |
| `581c0766-b84b-54cb-b8b6-375310329a41` | Kraefte und Reibung qualitativ nutzen | `accepted_pilot` | The accepted image shows a block on a rough surface with `Zugkraft` to the right and `Reibungskraft` at the contact region to the left. The shoe examples use no force arrows. The friction arrow is opposite to the sliding/pulling direction and tied to the contact surface. |
| `327302e3-5b36-46f8-9c16-73f24583b0eb` | Arbeit, einfache Maschinen und Wirkungsgrad qualitativ deuten | `accepted_pilot` | The accepted image contrasts direct lifting with a short path and larger force against ramp use with smaller force and longer path. It includes `Arbeit: W = F · s` and an efficiency panel with input energy, useful energy, losses, and `Wirkungsgrad < 100 %`. Path and height markers point consistently with the shown movement/measurement. |
| `722857cf-f327-5740-8151-64eb92195ec8` | initial Batch 007 candidate | `rejected_regenerated` | The energy bars were broadly correct, but the top-row potential-energy panel contained an unnecessary loose arrow-like mark. Rejected because such a marker can be read as a physical arrow without a coherent source and target. |
| `722857cf-f327-5740-8151-64eb92195ec8` | Mechanische Energieformen qualitativ unterscheiden | `accepted_pilot_after_regeneration` | The accepted image separates potential, kinetic, and spring energy examples without arrowheads. The swing sequence has numbered positions and bars showing high potential/low kinetic energy at the high positions and low potential/high kinetic energy at the bottom. No force arrows or loose decorative arrow marks are present. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 007 goals were deferred as provider limitations.
- `3` initial Batch 007 candidates were rejected and regenerated before import.
- Every visible physical arrow, arrow-like marker, force vector, motion marker, path marker, connector, ray-like line, or dashed segment in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 007 asset used an SVG fallback as the final asset.
- No final Batch 007 provider prompt text contains the string `SkillPilot`.
- No final Batch 007 provider prompt text contains its canonical goal ID.
- No final Batch 007 provider prompt text contains `Mathematik`.
