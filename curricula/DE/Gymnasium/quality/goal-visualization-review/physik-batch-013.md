# Goal Visualization Review - Physik Batch 013

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, thirteenth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-013.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-013`

Context:

- This batch covers potential energy, potential, friction energy, energy conservation, energy degradation versus everyday energy consumption, and momentum conservation.
- The review applied the strict arrow rule: every visible physical arrow, measurement arrow, relation pointer, connector, and trajectory-like line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All six live Nano Banana Pro requests generated a candidate without provider retry.
- No generated Batch 013 candidate was rejected for fachliche reasons.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `6affc2ea-ecd2-4fcd-8877-3ffa15b0425b` | Potenzielle Energie (Lageenergie) | `accepted_pilot` | The accepted image shows one box with `m=1 kg`, `g=10 N/kg`, and a height marker `h=2 m` from the dashed reference level to the object/shelf level. The calculation `E_pot=m*g*h=1 kg*10 N/kg*2 m=20 J` is correct. The downward `g` marker is a labelled field-direction marker, not an unlabelled force arrow. |
| `594f7f21-6b8a-531c-8424-5f1dcbaf0f23` | Potenzielle Energie und Potential | `accepted_pilot` | The accepted image uses `Phi=g*h` and `E_pot=m*Phi` with `m=2 kg`, `g=10 N/kg`, and `h=3 m`. It correctly gives `Phi=30 J/kg` and `E_pot=60 J`. The comparison table distinguishes `Bezugsebene unten` from `Bezugsebene am Ball`; the height arrow runs between the lower reference line and the ball level. |
| `253a71d2-e751-4c63-acbe-238b71463cd8` | Reibungsenergie | `accepted_pilot` | The accepted image shows before/after energy bars with total energy `100 J` in both panels. Mechanical energy changes from `100 J` to `70 J`, internal energy changes from `0 J` to `30 J`, and `E_reib=30 J` is identified as conversion into internal energy. The only physical motion arrow points in the block's stated direction of motion; the red connector points from the after-state energy account to the `E_reib` label and is not a force arrow. |
| `91c49019-ea51-4ce5-a919-c91c45b25e83` | Energieerhaltung | `accepted_pilot` | The accepted image shows three same-height energy-account bars, each labelled `E_ges=100 J`. Start has `E_pot=100 J`, middle has `E_pot=40 J` and `E_kin=60 J`, and end has `E_kin=100 J`; `E_innen=0 J` in all three states. The formula `E_ges=E_pot+E_kin+E_innen` and the constant-energy statement are correct. |
| `cbdc0b5f-8a48-5ade-be53-ab6aacaa3e73` | Energieentwertung vs. Energieverbrauch | `accepted_pilot` | The accepted image keeps total energy at `E_ges=100 J` before and after. It correctly shows useful energy decreasing from `100 J` to `30 J` while thermal energy increases from `0 J` to `70 J`. The text correctly states that energy is not consumed, becomes less usable, and entropy increases; no process arrow suggests energy leaving the system. |
| `839ecc8f-3a60-418b-bc92-64bfeef33824` | Impulserhaltung | `accepted_pilot` | The accepted image shows a recoil situation with `p_ges=0` before and after. The after panel has exactly two momentum arrows: the blue skater's arrow is anchored at that skater and points left with `p_A=-2 kg m/s`; the red skater's arrow is anchored at that skater and points right with `p_B=+2 kg m/s`. The two arrows are opposite and balanced, and no force or velocity arrows are added. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 013 goals were deferred as provider limitations.
- `0` generated Batch 013 candidates were rejected for fachliche reasons.
- `0` temporary provider failures occurred in Batch 013.
- Every visible physical arrow, arrow-like marker, measurement arrow, relation pointer, connector, ray-like line, or trajectory-like curve in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 013 asset used an SVG fallback as the final asset.
- No final Batch 013 provider prompt text contains the string `SkillPilot`.
- No final Batch 013 provider prompt text contains its canonical goal ID.
- No final Batch 013 provider prompt text contains `Mathematik`.
