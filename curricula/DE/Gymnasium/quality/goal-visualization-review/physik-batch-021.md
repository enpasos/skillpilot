# Goal Visualization Review - Physik Batch 021

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twenty-first Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-021.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-021`

Context:

- This batch covers the next entropy goals: reversible, irreversible and quasistatic processes; why entropy is needed for process direction; the Clausius definition; entropy units and interpretation; standard entropy calculations; and the isothermal ideal-gas formula.
- The review applied the strict arrow rule: every visible heat-transfer arrow, process arrow, particle-motion arrow, graph/icon arrow, formula pointer, relation pointer, connector, path curve, and axis line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated a candidate without provider retry.
- Six first candidates were rejected during fachlicher review because they contained unnecessary or potentially ambiguous arrows, path arrows, relation arrows, or formula-flow arrows.
- The first regeneration produced accepted candidates for all six Batch 021 goals.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `0de2ca8c-7272-59ed-9c89-0971d6ce2f47` | Entropie E02: Reversibel, irreversibel, quasistatisch | `accepted_pilot_after_regeneration` | The first candidate was rejected because the free-expansion mini-icon contained small arrows that could be read as process arrows. The accepted regenerated image uses three clean panels for reversible, quasistatic, and irreversible processes, gives appropriate examples (`Reibung`, `T_heiss > T_kalt`, `freie Expansion`), and states that reversibility is an ideal limiting case. It contains no misleading process-direction arrow. |
| `239aac49-1137-5df5-b197-49e72292e40c` | Entropie E03: Warum Entropie überhaupt? | `accepted_pilot_after_regeneration` | The first candidate was rejected because a comparison panel used double-headed theoretical arrows that could be read as physical process arrows. The accepted regenerated image contrasts energy-conservation bookkeeping with the direction question for real processes. Its only physical arrow is the heat arrow `Q`, starting at `heiss` and ending at `kalt`, which matches the intended spontaneous heat-flow direction. |
| `e713dc34-beeb-5807-8a90-f872e049aa4e` | Entropie E04: Makroskopische Definition (Clausius) | `accepted_pilot_after_regeneration` | The first candidate was rejected because it contained unnecessary path/axis arrowheads and decorative arrows. The accepted regenerated image states `dS = delta Q_rev / T` and `Delta S = integral delta Q_rev / T`, warns that `Q_rev` is used for the calculation and not arbitrary `Q`, and shows state points `A` and `B` with real and reversible replacement paths. The process paths themselves are pfeilfrei; the visible coordinate-axis arrowheads point in the positive `p` and `V` directions and do not encode a false thermodynamic path. |
| `6e79ef4a-2666-5f7a-885c-b175954506f8` | Entropie E05: Einheiten und Bedeutung von S | `accepted_pilot_after_regeneration` | The first candidate was rejected because it used comparison arrows and a formula-flow arrow. The accepted regenerated image is pfeilfrei, states `S in J/K`, interprets entropy as bookkeeping for energy distribution, and compares the same energy input at `300 K` and `600 K`. The values `100 J / 300 K = 0.33 J/K` and `100 J / 600 K = 0.17 J/K` correctly show that the lower temperature gives the larger entropy change. |
| `741e7056-69e4-59be-a159-0e2583d748d1` | Entropie E06: Standardfälle sicher rechnen | `accepted_pilot_after_regeneration` | The first candidate was rejected because heat/phase-change mini-illustrations contained unnecessary arrows. The accepted regenerated image uses formula cards without physical arrows: reservoir heat exchange with `Delta S = Q/T` and phase transition at constant `T` with `Delta S = L/T`. The checked examples are numerically consistent: `500 J / 250 K = 2.0 J/K` and `334 kJ / 273 K = 1.22 kJ/K`. |
| `eaef821b-4dbe-52a4-a0e2-574e5ce2040d` | Entropie E07: Entropieänderung idealer Gase | `accepted_pilot_after_regeneration` | The first candidate was rejected because it contained connector/process arrows and a `->` style conclusion. The accepted regenerated image is pfeilfrei, states the isothermal ideal-gas formula `Delta S = n R ln(V_2/V_1)`, labels the quantities `n`, `R`, `V`, and `T`, and shows `V_2 > V_1`; the conclusion `Delta S > 0` for expansion is correct. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 021 goals were deferred as provider limitations.
- `6` generated Batch 021 first candidates were rejected for arrow-rule reasons.
- `0` generated Batch 021 regenerated candidates were rejected.
- `0` temporary provider failures occurred in Batch 021.
- Every visible heat-transfer arrow, process arrow, graph/icon arrow, relation pointer, connector, formula-flow arrow, path curve, or axis line in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 021 asset used an SVG fallback as the final asset.
- No final Batch 021 provider prompt text contains the string `SkillPilot`.
- No final Batch 021 provider prompt text contains its canonical goal ID.
- No final Batch 021 provider prompt text contains `Mathematik`.
