# Goal Visualization Review - Physik Batch 020

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twentieth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-020.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-020`

Context:

- This batch covers thermodynamics foundations: internal energy, kinetic gas theory and temperature, reversible and irreversible processes, the first and second laws, and the distinction between state variables and process quantities.
- The review applied the strict arrow rule: every visible heat-transfer arrow, work arrow, particle-motion arrow, graph/icon arrow, formula pointer, relation pointer, connector, path curve, and axis line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated a candidate without provider retry.
- Three first candidates were rejected during fachlicher review and regenerated with stricter prompt constraints.
- No regenerated Batch 020 candidate needed a second regeneration.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `88d07c80-5d7d-5c70-b385-b22769381e44` | Wärmeenergie als innere Energie deuten | `accepted_pilot` | The accepted image shows a bounded system with particles, labels the internal energy `U`, and explains the microscopic contribution from particle motion and interaction. The heat-transfer arrow `Q` starts at a warm reservoir and points into the system, matching the statement that supplied heat can raise `U`. The image does not equate temperature with `U` and includes the Joule note that heat and work are energy transfers. |
| `37b33812-d428-5953-852e-57a53a4347fe` | Kinetische Gastheorie & Temperatur | `accepted_pilot_after_regeneration` | The first candidate was rejected because it visibly included the text error `(optionall)`. The accepted regenerated image compares low and high temperature with shorter versus longer particle-motion streaks, states `<E_kin> proportional T`, and shows `<E_kin> = 3/2 k_B T`. It also notes that individual particles have different speeds. |
| `2088ccf0-48f4-51d4-be5f-67affd0fb099` | Reversible und irreversible Vorgänge unterscheiden | `accepted_pilot_after_regeneration` | The first candidate was rejected because the reversible column contained sand/loose material imagery that looked like a lasting material change rather than a quasi-static reversible process. The accepted regenerated image shows clean piston states for the reversible case and gas expansion into vacuum for the irreversible case. It does not claim that energy is destroyed and it contains no misleading process-direction arrows. |
| `5f17e992-fd07-56ee-80a0-567f45bbd10c` | Ersten Hauptsatz verstehen und mit Formel angeben | `accepted_pilot` | The accepted image states `Delta U = Q + W` and explicitly uses the sign convention `W: am System verrichtete Arbeit`. The heat-transfer arrow `Q` points from the warm reservoir into the system, and the work arrow `W` points from the pushed piston into the gas, consistent with positive `Q` and positive work done on the system. |
| `912a5489-abcc-55f9-8f1a-9ee1e2d7fd9d` | Zweiten Hauptsatz verstehen und mit Entropie-Formulierung angeben | `accepted_pilot` | The accepted image states `Delta S_ges >= 0`, distinguishes `reversibel: Delta S_ges = 0` from `irreversibel: Delta S_ges > 0`, and uses a warm/cold-to-temperature-balance example for a natural process. It does not show a cold-to-hot spontaneous heat-flow arrow and does not confuse entropy with energy. |
| `36c4590c-6032-5a37-b660-f15951dee076` | Entropie E01: Zustandsgrößen vs. Prozessgrößen | `accepted_pilot_after_regeneration` | The first candidate was rejected because it mixed English labels, had the text error `Q heiten`, and added extra arrows on the diagram. The accepted regenerated image lists state variables `p, V, T, U, S`, process quantities `Q, W`, and two pfeilfreie paths between state points `A` and `B` in a `p-V` diagram. It correctly states that `Delta U` and `Delta S` depend only on start and end state, while `Q` and `W` depend on the path. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 020 goals were deferred as provider limitations.
- `3` generated Batch 020 first candidates were rejected for text, example-choice, or arrow-rule reasons.
- `0` generated Batch 020 regenerated candidates were rejected.
- `0` temporary provider failures occurred in Batch 020.
- Every visible heat-transfer arrow, work arrow, particle-motion arrow, graph/icon arrow, relation pointer, connector, formula-flow arrow, path curve, or axis line in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 020 asset used an SVG fallback as the final asset.
- No final Batch 020 provider prompt text contains the string `SkillPilot`.
- No final Batch 020 provider prompt text contains its canonical goal ID.
- No final Batch 020 provider prompt text contains `Mathematik`.
