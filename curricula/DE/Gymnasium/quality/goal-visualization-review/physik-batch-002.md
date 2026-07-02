# Goal Visualization Review - Physik Batch 002

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Physik`, second Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-002.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-002`

Context:

- This batch covers qualitative gas pressure-temperature relations, buoyancy, airfoil lift/drag, color dispersion, color mixing, and simple color perception.
- Review used the stricter arrow rule from the mathematics rollout: every visible physical arrow or pointer must have a coherent source and target, and candidates with misleading arrows, wrong counts, or wrong color relations are rejected.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `310b4f62-e261-46be-bb1b-1f125fc1699a` | initial Batch 002 candidate | `rejected_regenerated` | The image showed different visible particle counts in the two same-volume gas containers, which would visually confuse temperature increase with adding particles. Rejected. |
| `310b4f62-e261-46be-bb1b-1f125fc1699a` | Druck-Temperatur-Zusammenhänge qualitativ erklären | `accepted_pilot_after_regeneration` | The accepted image shows two equal-volume rigid containers with four gas particles in each. The left panel is labelled `20 °C` and `kleinerer Druck`; the right panel is labelled `60 °C` and `größerer Druck`. Motion/collision marks are stronger at higher temperature without changing particle count or volume. The rule card correctly states `gleiches Volumen`, faster particles, more/firmer wall collisions, and increasing pressure. |
| `e11b2ee9-e528-4857-9ecd-59bd460fba81` | Auftrieb mit dem archimedischen Prinzip erklären | `accepted_pilot` | The water panel shows an immersed object, displaced water, an upward `Auftrieb` force on the object, and a downward `Gewicht` force. The rule `Auftrieb = Gewicht der verdrängten Flüssigkeit` is correct. The air panel shows a balloon with displaced air, upward buoyancy through displaced air, and downward weight; the force arrows are vertical and source-target coherent. |
| `24b4686a-e8a6-4583-8952-33e6f653c2a3` | Auftrieb an Tragflächen und Luftwiderstand qualitativ einordnen | `accepted_pilot` | The accepted diagram has exactly the intended three physical arrows: movement to the right, lift upward on the wing, and drag to the left opposite motion. The note box states lift as an upward air force and drag as a force opposite motion. No Bernoulli-path oversimplification or false pressure values are shown. |
| `a4681378-ade4-4f20-bf77-fb020469510f` | initial Batch 002 candidate | `rejected_regenerated` | The prism and spectral order were mostly correct, but the image added a large decorative curved arrow with no physical role. Rejected under the strict arrow policy. |
| `a4681378-ade4-4f20-bf77-fb020469510f` | Entstehung und Zerlegung von Farben erklären | `accepted_pilot_after_regeneration` | The accepted image shows a white input ray entering a glass prism and six ordered spectral bands labelled `rot`, `orange`, `gelb`, `grün`, `blau`, `violett` from top to bottom. It correctly states that a prism splits white light and that white light is composed. The remaining small curved pointer links the label to the incoming ray and is an annotation, not a physical ray direction. No false physical arrow is present. |
| `cdab9fd1-5054-4a7e-8c9a-4474062ddd23` | initial Batch 002 candidate | `rejected_regenerated` | The additive side was usable, but the subtractive Venn circles had color/label mismatches, including labels that did not match the visible circle colors. Rejected. |
| `cdab9fd1-5054-4a7e-8c9a-4474062ddd23` | Additive und subtraktive Farbmischung unterscheiden | `accepted_pilot_after_regeneration` | The accepted image uses equation-style swatches instead of Venn circles. Additive equations are correct: `Rot + Grün = Gelb`, `Grün + Blau = Cyan`, `Blau + Rot = Magenta`, `Rot + Grün + Blau = Weiß`. Subtractive equations are correct: `Cyan + Magenta = Blau`, `Magenta + Gelb = Rot`, `Gelb + Cyan = Grün`, `Cyan + Magenta + Gelb = Schwarz`. Swatches match their labels. |
| `1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075` | Einfache Farbwahrnehmung beschreiben | `accepted_pilot` | The accepted image uses the same red apple in white light and green light. Under white light, a red ray from the apple to the eye is labelled `rotes Licht zum Auge` and the apple appears red. Under green light, the apple appears dark and the red reflection is marked as `kaum rotes Licht`. Light rays run from lamp to apple or apple to eye; the eye does not emit light. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 002 goals were deferred as provider limitations.
- Every visible physical arrow, arrow-like marker, pointer, connector, or dashed segment in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 002 asset used an SVG fallback as the final asset.
- No final Batch 002 provider prompt text contains the string `SkillPilot`.
- No final Batch 002 provider prompt text contains its canonical goal ID.
- No final Batch 002 provider prompt text contains `Mathematik`.
