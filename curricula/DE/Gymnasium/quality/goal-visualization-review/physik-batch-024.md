# Goal Visualization Review - Physik Batch 024

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twenty-fourth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed_with_user_review_correction`

Batch file: `tmp/goal-visualization-physik-batch-024.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-024`

Context:

- This batch covers climate impacts of energy decisions and the first ideal-gas process goals: state variables, isochoric/isobaric/isothermal processes, adiabatic processes, process work in p-V diagrams, and heat quantities with `C_V` and `C_P`.
- The review applied the strict arrow rule: every visible physical arrow, graph axis arrow, pointer, connector, process marker, curve direction cue, and formula marker was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final live provider prompt text does not contain the string `SkillPilot`.
- Final live provider prompt text does not contain canonical goal IDs.
- Final live provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All six live Nano Banana Pro requests generated a candidate without temporary provider failure.
- No generated Batch 024 candidate required regeneration.
- Some accepted p-V diagrams contain graph-axis arrowheads despite the prompt asking for axes without arrowheads. These were accepted only after checking that they indicate the positive p and V directions and do not encode a process direction.
- The original isochoric/isobaric/isothermal process asset was later replaced after user review because the drawn isotherm visually approached the colored isobar/isochore instead of the p and V axes.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `f322c268-dc16-5d50-82dd-209834f20208` | Klimawirkungen von Energieentscheidungen fachlich diskutieren | `accepted_pilot` | The accepted image uses a table to connect energy decisions with physics-based evaluation and climate impact. It states `CO2e = Energiebedarf * Emissionsfaktor`, `E_zu = E_nutz / eta`, and comparison with equal useful energy. The image avoids absolute climate-neutral claims and uses no causal climate arrows. |
| `cd1903a5-d70a-5320-9124-b6b24917ba14` | Zustandsgroessen und ideales Gasgesetz anwenden | `accepted_pilot` | The accepted image states `pV = nRT`, gives the correct SI units `p` in `Pa`, `V` in `m^3`, `n` in `mol`, `T` in `K`, and `R = 8,314 J/(mol K)`. The check card correctly requires Kelvin and SI units. Pointer lines label the gas container but do not imply pressure, motion, or force paths. |
| `fb73c94b-6a23-5351-8fef-db2c2533e361` | Isochore, isobare und isotherme Zustandsaenderungen berechnen | `accepted_pilot` | The accepted image distinguishes `isochor: V konstant, p/T konstant`, `isobar: p konstant, V/T konstant`, and `isotherm: T konstant, pV konstant`. The p-V diagram has p vertical and V horizontal, with a vertical isochore, a horizontal isobar, and a decreasing hyperbolic isotherm. Axis arrows point only in the positive coordinate directions and do not encode a process direction. |
| `fb73c94b-6a23-5351-8fef-db2c2533e361` | original Batch 024 accepted asset | `rejected_after_user_review_replaced` | Rejected after user review because the isotherm visually flattened toward the colored isobaric line and visually rose along the colored isochoric line. For an ideal-gas isotherm in a p-V diagram, the curve is a hyperbola with the p-axis and V-axis as asymptotes; arbitrary isobars and isochores are not asymptotes. |
| `fb73c94b-6a23-5351-8fef-db2c2533e361` | Isochore, isobare und isotherme Zustandsaenderungen berechnen | `accepted_pilot_after_user_review_correction` | The corrected image shows p vertical and V horizontal. The orange isotherm is a decreasing hyperbola in the first quadrant and visibly approaches the black p and V axes. The colored isobar and isochore are only example lines and are not drawn as asymptotes; the curve crosses them instead of flattening toward them. Axis arrows point only in positive coordinate directions. |
| `7fe3022f-fad0-5f41-af1c-d55ff214ebc6` | Adiabatische Zustandsaenderungen | `accepted_pilot` | The accepted image states `Q = 0`, no heat exchange with the environment, `p V^kappa = konstant`, and `bei Expansion: T sinkt`. The p-V comparison shows the adiabat steeper and below the isotherm for larger V, which is correct for expansion from the same start point. The diagram axis arrows point only to positive p and V. No heat arrows are shown. |
| `7982cd8e-2151-59e7-858d-c1361c5d249e` | Prozessarbeit bei Volumenaenderungen bestimmen | `accepted_pilot` | The accepted image shows process work as the shaded area under `p(V)` in a p-V diagram. The isobaric rectangle is under the horizontal line between `V_1` and `V_2`. The formulas `W = integral p dV`, `W = p * Delta V`, and `Delta V = V_2 - V_1` are correct for the displayed case. The numeric example `p = 2,0 * 10^5 Pa`, `Delta V = 0,020 m^3`, `W = 4,0 * 10^3 J` is correct. Axis arrows point only in the positive coordinate directions. |
| `93ece389-78c5-5141-9ef1-c68bd558306e` | Waermemengen mit C_V und C_P berechnen | `accepted_pilot` | The accepted image correctly separates `isochor: V konstant` with `Q = n C_V Delta T` from `isobar: p konstant` with `Q = n C_P Delta T`. It gives the correct units for `n`, `Delta T`, and the molar heat capacities and correctly states `C_P > C_V` for an ideal gas. No arrows or process-direction markers are shown. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 024 goals were deferred as provider limitations.
- `0` generated Batch 024 candidates were rejected during initial batch review.
- `1` originally accepted Batch 024 asset was rejected and replaced after user review.
- `0` generated Batch 024 regenerated candidates were rejected.
- `0` temporary provider failures occurred in Batch 024.
- Every visible physical arrow, graph axis arrow, pointer, connector, curve, formula marker, or axis line in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 024 asset used an SVG fallback as the final asset.
- No final live Batch 024 provider prompt text contains the string `SkillPilot`.
- No final live Batch 024 provider prompt text contains its canonical goal ID.
- No final live Batch 024 provider prompt text contains `Mathematik`.
