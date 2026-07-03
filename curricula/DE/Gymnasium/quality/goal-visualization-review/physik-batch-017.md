# Goal Visualization Review - Physik Batch 017

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, seventeenth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-017.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-017`

Context:

- This batch covers the visual process and refractive errors, modelling motion with spreadsheet steps, numerical simulation of frictional motion, deterministic chaos, qualitative gravitational attraction, and gravitational field strength.
- The review applied the strict arrow rule: every visible light-ray arrow, force arrow, field arrow, measurement arrow, graph axis arrow, relation pointer, connector, and trajectory-like line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated a candidate without provider retry.
- Two first candidates were rejected during fachlicher review and regenerated with stricter prompt constraints.
- The visual-process goal required a second regeneration. The accepted version uses focus markers instead of slanted ray pairs because the first two ray-diagram candidates placed the far-sighted focus incorrectly.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `90e1e6cf-4092-41d6-81f7-5206f9d68f84` | Sehvorgang und Fehlsichtigkeiten qualitativ erklären | `accepted_pilot_after_second_regeneration` | The first candidate was rejected because the far-sighted panel visibly crossed the light rays inside the eye. The second candidate was rejected because the far-sighted focus was still effectively on the retina. The accepted candidate uses a simplified focus-marker representation: normal sight has the focus on the retina, short sight has the focus before the retina, and far sight has the focus behind the retina. The light-direction arrows point left-to-right, and the label pointers target the marked focus positions. |
| `ac25ffe3-fd42-592d-a937-79cc13460313` | Methode: Modellbildung mit Tabellenkalkulation | `accepted_pilot` | The accepted image shows `Delta t=0,1 s`, `a=2,0 m/s^2`, the update formulas, and the required table rows. The values are consistent with `v_neu=v_alt+a*Delta t` and `x_neu=x_alt+v_alt*Delta t`: `x=0,000`, `0,000`, `0,020` and `v=0,0`, `0,2`, `0,4`. Workflow arrows point from formulas to table to diagram, and the x-t plot does not contradict positive velocity. |
| `761a0879-fc15-5d0c-a2b7-2b439efecd5b` | Numerische Simulation von Bewegungen | `accepted_pilot` | The accepted image uses the model `F_R=-k*v`, `m=2 kg`, `k=0,4 kg/s`, `Delta t=1 s`, and `a_n=-0,2*v_n`. The table values `v=10, 8, 6,4, 5,12`, `x=0, 10, 18, 24,4`, and `a=-2,0, -1,6, -1,28` are coherent. The velocity arrow starts at the block and points right, while the friction arrow starts at the block and points left. |
| `76fd0ab2-079a-516e-a33b-170355336d40` | Grenzen der Vorhersagbarkeit (Chaos) | `accepted_pilot` | The accepted image shows two nearly equal initial angles, `20,0 Grad` and `20,1 Grad`, whose trajectories diverge later. The only global direction arrow is the time arrow from start to later. No force arrows are drawn on the pendulum, and the small graph for the distance between states starts near zero and increases. |
| `92d8f398-0c9f-523c-88d7-44165b6b4768` | Massenanziehung qualitativ beschreiben | `accepted_pilot_after_regeneration` | The first candidate was rejected because side mini-diagrams added extra one-way arrows. The accepted regenerated image uses one central diagram only. The two `F_G` arrows start at the centers of `m1` and `m2`, point toward the other mass along the connecting line, and have equal length. The distance marker `r` spans the mass centers, and the text correctly states stronger attraction for larger masses and weaker attraction for larger distance. |
| `156edddc-ce8d-580d-8d17-d9376d59e60e` | Gravitationsfeld als Feldgröße einführen | `accepted_pilot` | The accepted image shows radial gravitational field arrows pointing inward toward the central mass `M`. The local force arrow at the probe mass points toward `M`, and the field-strength relation `g=F_G/m_probe` is correct. No outward electric-field-style arrows or orbit arrows are included. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 017 goals were deferred as provider limitations.
- `2` generated Batch 017 first candidates were rejected for fachliche or arrow-rule reasons.
- `1` generated Batch 017 second candidate was rejected for a remaining optical focus-position error.
- `0` temporary provider failures occurred in Batch 017.
- Every visible light-ray arrow, physical arrow, field arrow, arrow-like marker, measurement arrow, diagram axis arrow, relation pointer, connector, ray-like line, or trajectory-like curve in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow or ray direction.
- No Batch 017 asset used an SVG fallback as the final asset.
- No final Batch 017 provider prompt text contains the string `SkillPilot`.
- No final Batch 017 provider prompt text contains its canonical goal ID.
- No final Batch 017 provider prompt text contains `Mathematik`.
