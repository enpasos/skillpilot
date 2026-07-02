# Goal Visualization Review - Physik Batch 006

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Physik`, sixth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-006.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-006`

Context:

- This batch covers current effects and current measurement, density, qualitative lens imaging, vision defects, and simple optical instruments.
- The review applied the strict arrow rule: every visible physical arrow, ray, connector, pointer, measurement marker, or dashed segment must have a coherent source and target. If a ray or arrow can be read as a physical path, it must be physically right.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.
- The vision-defect goal was not imported because repeated provider attempts kept producing misleading or physically wrong correction diagrams.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `a5f652cc-e091-4c90-bec2-c357ae54fcf1` | initial Batch 006 candidate | `rejected_regenerated` | The magnetic-effect panel did not clearly show the coil as a battery-powered closed current circuit and had no visible battery in that panel. Rejected. |
| `a5f652cc-e091-4c90-bec2-c357ae54fcf1` | Wirkungen des elektrischen Stroms qualitativ beschreiben | `accepted_pilot_after_regeneration` | The accepted image separates thermal, luminous, chemical, and magnetic effects. Each effect is connected to a plausible closed battery circuit or clear setup. The magnetic panel shows a coil connected to a battery and a compass response without current arrows or field arrows that could imply a wrong direction. |
| `f1a078ae-6262-4444-a4bc-a5ab275621cf` | Stromstärke in einfachen Stromkreisen messen | `accepted_pilot` | The accepted image shows the ammeter `A` in series in a simple closed circuit and a sample reading `I = 0,30 A`. The small wrong parallel placement is crossed out and cannot be read as the correct setup. Circuit connectors are coherent and no current-direction arrows are drawn. |
| `e41356c1-968b-435a-af25-b663f080ae5a` | Volumen, Masse und Dichte bestimmen und vergleichen | `accepted_pilot` | The accepted image uses `rho = m/V`, compares equal-volume cubes with `200 g / 100 cm^3 = 2 g/cm^3` and `50 g / 100 cm^3 = 0,5 g/cm^3`, and shows volume measurement in a cylinder. Measurement markers point to the measured quantities and do not imply false motion or force. |
| `078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5` | Linsenabbildungen qualitativ beschreiben und konstruieren | `accepted_pilot` | The accepted image shows a converging lens focusing parallel rays at the focal point and a diverging lens spreading rays with backward extensions toward the focal point on the incoming side. The image-construction panel uses two coherent construction rays to an inverted real image. All ray-like lines were checked for direction and target consistency. |
| `90e1e6cf-4092-41d6-81f7-5206f9d68f84` | initial Batch 006 candidate | `rejected_regenerated` | The short-sighted correction panel still showed the focus before the retina despite the correction. Rejected. |
| `90e1e6cf-4092-41d6-81f7-5206f9d68f84` | second candidate | `rejected_regenerated` | The correction lenses were drawn to the right of the eye, so the image could be read as a lens behind the eye instead of in front of it. Rejected. |
| `90e1e6cf-4092-41d6-81f7-5206f9d68f84` | Sehvorgang und Fehlsichtigkeiten qualitativ erklären | `deferred_provider_limitation` | The third candidate still introduced misleading correction content, including a correction cue in the normal-vision panel and ray/retina relationships that were not clean enough for a cockpit visualization. After repeated attempts the goal was deferred. No active image asset was imported and no `goal-visualization` link was added. |
| `6367d45e-919e-4c19-bcd9-7770a2d51139` | Einfache optische Instrumente beschreiben | `accepted_pilot` | The accepted image distinguishes telescope and microscope setups with objective and eyepiece. The ray-like lines run from object side through the optics toward the eye or image region, and the microscope panel includes an enlarged intermediate-image idea. Object arrows are object markers, not light rays. |

## Batch Checks

- `5` Physik learning-goal assets were imported and accepted.
- `1` Batch 006 goal was deferred as a provider limitation.
- `4` initial or intermediate Batch 006 candidates were rejected before final import/defer decisions.
- Every visible physical arrow, arrow-like marker, pointer, connector, circuit branch, ray-like line, or dashed segment in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 006 asset used an SVG fallback as the final asset.
- No final Batch 006 provider prompt text contains the string `SkillPilot`.
- No final Batch 006 provider prompt text contains its canonical goal ID.
- No final Batch 006 provider prompt text contains `Mathematik`.
