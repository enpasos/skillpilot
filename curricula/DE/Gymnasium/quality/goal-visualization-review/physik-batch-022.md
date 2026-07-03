# Goal Visualization Review - Physik Batch 022

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twenty-second Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-022.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-022`

Context:

- This batch continues the entropy sequence with total entropy balances, the second law as a process-direction decision rule, the Clausius inequality, entropy production, macrostate/microstate interpretation, and the Boltzmann formula with simple counting models.
- The review applied the strict arrow rule: every visible heat-transfer arrow, process arrow, particle-motion arrow, graph/icon arrow, formula pointer, relation pointer, connector, path curve, and axis line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated a candidate without provider retry.
- One first candidate was rejected during fachlicher review because a visible macrostate example did not reliably show exactly four particles with `2 links, 2 rechts`.
- The first regeneration for that goal produced an accepted candidate.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `14099861-897c-53f4-8c6c-48d088ee9f01` | Entropie E08: Entropiebilanz für System + Umgebung | `accepted_pilot` | The accepted image states `Delta S_ges = Delta S_System + Delta S_Umgebung` and uses the checked heat-transfer example `Q=100 J`, `T_h=600 K`, `T_c=300 K`. The hot reservoir has `Delta S_heiss = -100/600 = -0.17 J/K`, the cold reservoir has `Delta S_kalt = +100/300 = +0.33 J/K`, and the total `Delta S_ges = +0.16 J/K > 0` is correct. No accepted heat arrow points in a wrong direction. |
| `be921c3b-7db9-50b5-a110-92f31673fc62` | Entropie E09: Der 2. Hauptsatz als Entscheidungsregel | `accepted_pilot` | The accepted image shows the rule `Delta S_ges >= 0` and separates the three decision cases correctly: `Delta S_ges > 0` irreversible/natural direction possible, `Delta S_ges = 0` reversible/ideal limiting case, and `Delta S_ges < 0` impossible for an isolated system/not by itself. The heat example is text-only and states hot-to-cold with `Delta S_ges > 0`. |
| `81a45dec-37be-529b-89ce-2f3101237293` | Entropie E10: Clausius-Ungleichung (Kreisprozess) | `accepted_pilot` | The accepted image states the Clausius inequality `oint delta Q / T <= 0`, notes that a cycle has identical initial and final state, and distinguishes `reversibel: oint delta Q_rev / T = 0` from `irreversibel: oint delta Q / T < 0`. The closed curves are pfeilfrei and do not encode a false cycle direction. The statement that a perfect heat-to-work machine without waste heat is impossible and that `Q_c > 0` is needed is consistent. |
| `616ac6cf-901b-509a-8cbb-bd422ddecf05` | Entropie E11: Entropieproduktion und Irreversibilität | `accepted_pilot` | The accepted image states `Delta S_ges = Delta S_Austausch + S_erzeugt` and `irreversibel: S_erzeugt > 0`. It lists the intended causes `Reibung`, `Mischung / Diffusion`, `endliche Temperaturdifferenz`, and `freie Expansion`, and concludes that these processes do not run backward by themselves. It contains no misleading reverse-process arrow. |
| `b61d233a-1902-526b-a9b5-6b3d553f4013` | initial Batch 022 candidate | `rejected_regenerated` | The first candidate was rejected because the visible macrostate example labelled `4 Teilchen: 2 links, 2 rechts` did not reliably show exactly four particles with exactly two on each side. For this learning goal, every shown microstate/macrostate count must match the stated count. |
| `b61d233a-1902-526b-a9b5-6b3d553f4013` | Entropie E12: Makrozustand und Mikrozustände | `accepted_pilot_after_regeneration` | The accepted regenerated image states the macro variables `p`, `V`, and `T`, gives the example `4 Teilchen: 2 links, 2 rechts`, and shows the macrostate plus three distinct microstate arrangements. Each drawn box has exactly four dots total, with exactly two dots left and exactly two dots right. The statement that many microstates can belong to the same macrostate is correct. |
| `b6dfd3e6-2dd3-5983-9a27-7e7db70e8db8` | Entropie E13: Boltzmann-Formel und Zählmodelle | `accepted_pilot` | The accepted image states `S = k_B ln(Omega)`, explains `k_B` and `Omega`, and gives a correct counting table for `N=4` particles by number left: `1, 4, 6, 4, 1` for `n=0,1,2,3,4`. The listed representative microstates match the binomial counts, the formula `Omega = binom(N,n)` is correct, and the conclusion that the equal distribution has the most microstates is correct. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 022 goals were deferred as provider limitations.
- `1` generated Batch 022 first candidate was rejected for a visible counting error.
- `0` generated Batch 022 regenerated candidates were rejected.
- `0` temporary provider failures occurred in Batch 022.
- Every visible heat-transfer arrow, process arrow, graph/icon arrow, relation pointer, connector, formula-flow arrow, path curve, or axis line in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 022 asset used an SVG fallback as the final asset.
- No final Batch 022 provider prompt text contains the string `SkillPilot`.
- No final Batch 022 provider prompt text contains its canonical goal ID.
- No final Batch 022 provider prompt text contains `Mathematik`.
