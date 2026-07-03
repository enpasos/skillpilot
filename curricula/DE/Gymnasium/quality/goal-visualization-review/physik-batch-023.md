# Goal Visualization Review - Physik Batch 023

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twenty-third Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-023.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-023`

Context:

- This batch continues the entropy and second-law sequence and adds a physics-based energy-saving evaluation goal.
- The review applied the strict arrow rule: every visible heat-transfer arrow, process arrow, graph/icon arrow, relation pointer, connector, formula-flow arrow, path curve, and axis line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- Most prompts intentionally requested text-card or balance-card layouts with no arrows, because misleading process arrows are a common provider failure mode in thermodynamics.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final live provider prompt text does not contain the string `SkillPilot`.
- Final live provider prompt text does not contain canonical goal IDs.
- Final live provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All six initial live Nano Banana Pro requests generated a candidate without temporary provider failure.
- The first candidate for `Entropie E16: Ordnung, Information und Zeitpfeil` was rejected because the open-system entropy balance used a misleading minus/inequality construction instead of the additive balance `Delta S_System + Delta S_Umgebung = Delta S_ges > 0`.
- The first candidate for `Zweiten Hauptsatz auf Waermekraftmaschinen anwenden` was rejected because decorative background formulas were visible and not part of the checked physics statement.
- Both rejected goals were regenerated after stricter prompt constraints and accepted after visual fachlicher review.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `77604656-7ffe-516c-8af3-7cbe7de2f2a4` | Entropie E14: Bruecke Makro <-> Mikro | `accepted_pilot` | The accepted image links the volume model to microstate counting with `Omega proportional V^N`, `Omega_2 / Omega_1 = (V_2 / V_1)^N`, `Delta S = k_B ln(Omega_2 / Omega_1)`, `Delta S = N k_B ln(V_2 / V_1)`, and `Delta S = n R ln(V_2 / V_1)`. It correctly states that larger volume means more possible microstates and uses no process arrow. |
| `d0cebf18-8b2a-52d6-857d-ef18cd64541c` | Entropie E15: Waermekraftmaschinen und Carnot-Grenze | `accepted_pilot` | The accepted image states `Q_h = W + Q_c`, `eta = W / Q_h`, and the Carnot limit `eta_max = 1 - T_c / T_h`. The numerical example with `T_h = 600 K` and `T_c = 300 K` gives `eta_max = 0,50`. The entropy-balance panel correctly distinguishes the reversible limit `Q_h/T_h = Q_c/T_c` from a real process with additional entropy production. |
| `161502b8-e52d-58d0-8f01-9f777b56d392` | initial Batch 023 candidate | `rejected_regenerated` | Rejected because the open-system example combined `Delta S_System < 0` and environment increase with a visible minus sign and `!= Delta S_ges > 0`. This could be read as a wrong entropy balance. The correct relationship must be additive. |
| `161502b8-e52d-58d0-8f01-9f777b56d392` | Entropie E16: Ordnung, Information und Zeitpfeil | `accepted_pilot_after_regeneration` | The accepted regenerated image states that entropy is not a vague disorder word, that macrostates with more microstates are statistically more probable, and that real processes have `Delta S_ges > 0`. The open-system example now uses the correct additive balance `Delta S_System + Delta S_Umgebung = Delta S_ges > 0`, with `Delta S_System < 0` for the refrigerator and a larger entropy increase in the environment. No heat-flow arrows are shown. |
| `91b20476-12cf-50d6-880a-ea509ffe8a9a` | Zweiten Hauptsatz auf Entropieerzeugung und Zeitpfeil anwenden | `accepted_pilot` | The accepted image states `Delta S_ges >= 0` and separates reversible processes with `S_erzeugt = 0` from irreversible processes with `S_erzeugt > 0`. The examples `Reibung`, `Mischung`, and `Waerme von warm nach kalt` are consistent with positive entropy production. No visible arrow encodes a wrong source or target. |
| `18058384-a1bc-5ba2-8f5d-1fe9498acbf0` | initial Batch 023 candidate | `rejected_regenerated` | Rejected because partially visible decorative background formulas were present outside the checked content. For this rollout, all visible formulas must be part of the reviewed physics statement or absent. |
| `18058384-a1bc-5ba2-8f5d-1fe9498acbf0` | Zweiten Hauptsatz auf Waermekraftmaschinen anwenden | `accepted_pilot_after_regeneration` | The accepted regenerated image uses a plain card layout without decorative formulas. It states that a heat engine needs two reservoirs, that waste heat satisfies `Q_c > 0`, and that efficiency is limited. The formulas `Q_h = W + Q_c`, `eta = W / Q_h`, `eta < 1`, and `eta <= 1 - T_c/T_h` are correct, and the example `T_h = 600 K`, `T_c = 300 K`, `eta <= 0,50` matches the Carnot bound. No process arrow is drawn. |
| `aed9161b-ddc4-559c-be8f-baeeddf224f3` | Energiesparmassnahmen physikalisch bewerten | `accepted_pilot` | The accepted image compares LED lighting, insulation, and heat pumps with appropriate physical criteria: less waste heat for LEDs, smaller heat flow through an insulated wall, and useful heat greater than electrical work for a heat pump. It shows `eta = E_nutz / E_zu`, `E_zu = E_nutz + E_verlust`, and `COP = Q_nutz / W_el`. The visible heat-flow markers in the insulation row are consistent with reduced heat flow after insulation. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 023 goals were deferred as provider limitations.
- `2` initial Batch 023 candidates were rejected and regenerated before import.
- `0` generated Batch 023 regenerated candidates were rejected.
- `0` temporary provider failures occurred in Batch 023.
- Every visible heat-transfer arrow, process arrow, graph/icon arrow, relation pointer, connector, formula-flow arrow, path curve, or axis line in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 023 asset used an SVG fallback as the final asset.
- No final live Batch 023 provider prompt text contains the string `SkillPilot`.
- No final live Batch 023 provider prompt text contains its canonical goal ID.
- No final live Batch 023 provider prompt text contains `Mathematik`.
