# Goal Visualization Review - Physik Batch 001

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Physik`, first Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-001.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-001`

Context:

- This batch starts the Physik visualization rollout after the Mathematik rollout reached full coverage.
- The common prompt builder was made subject-aware before generation so Physik requests use the Physik subject context instead of the previous Mathematik wording.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `2eecd0e2-a7ca-4568-9b12-3d47706c65fb` | initial Batch 001 candidate | `rejected_regenerated` | The conservation example was numerically usable, but the image contained decorative border arrows/gears and arrow-like elements without a physical source-target relation. Rejected under the strict arrow policy. |
| `2eecd0e2-a7ca-4568-9b12-3d47706c65fb` | Einfache Stossvorgaenge mit Impuls- und Energieerhaltung analysieren | `accepted_pilot_after_regeneration` | The accepted image shows a one-dimensional elastic collision of two equal masses. Before: `m_A = 1 kg`, `v_A = 2 m/s` to the right, `v_B = 0 m/s`. After: `v'_A = 0 m/s`, `v'_B = 2 m/s` to the right. The momentum calculations `p_vor = 1*2 + 1*0 = 2 kg m/s` and `p_nach = 1*0 + 1*2 = 2 kg m/s` are correct. The kinetic-energy calculations `1/2*1*2^2 = 2 J` before and after are correct. The only physical arrows are the two velocity arrows, both with correct source object and direction. |
| `940978fa-1f2d-4e54-9c28-081a6df9b76f` | Temperatur und Wärme unterscheiden | `accepted_pilot` | The image correctly distinguishes temperature as a measured state quantity from heat as energy transfer. Wood and metal are both labelled `20 °C`; the metal feels colder because it conducts energy away from the hand faster. The comparison table correctly states temperature unit `°C oder K`, heat unit `J`, and subjective thermal sensation depending on heat flow. Heat-flow arrows from the hand toward touched materials are directionally plausible. |
| `d27c8860-12a4-4d7d-9849-ccd8b7caca48` | initial Batch 001 candidate | `rejected_regenerated` | The basic thermal-expansion content was correct, but the image contained unnecessary vertical arrows and decorative tool/magnifier elements. Rejected to avoid ambiguous non-physical arrows. |
| `d27c8860-12a4-4d7d-9849-ccd8b7caca48` | Temperatur messen und Ausdehnung deuten | `accepted_pilot_after_regeneration` | The accepted image shows a thermometer reading between `20 °C` and `60 °C`, and three expansion examples: a solid rod labelled `10,0 cm` before and `10,1 cm` after heating, a liquid level rising from `20 °C` to `60 °C`, and a gas balloon with larger volume at `60 °C`. No misleading direction arrow is present. |
| `9ac4973a-21d5-48a5-90b4-eb90e10391ae` | initial Batch 001 candidate | `rejected_regenerated` | The image changed the visible particle count between cold and warm states. Heating was therefore visually misleading for a closed sample. |
| `9ac4973a-21d5-48a5-90b4-eb90e10391ae` | second candidate | `rejected_regenerated` | The regenerated image still did not show the same particle count in both boxes. Rejected because the count difference is fachlich central. |
| `9ac4973a-21d5-48a5-90b4-eb90e10391ae` | third candidate | `rejected_regenerated` | The prompt was reduced to eight particles, but the image showed nine blue particles in the cold box and eight red particles in the warm box. Rejected. |
| `9ac4973a-21d5-48a5-90b4-eb90e10391ae` | Teilchenmodell für Temperaturänderungen nutzen | `accepted_pilot_after_regeneration` | The accepted image uses a deliberately small closed-sample model: four blue particles at `20 °C` in the cold box and four red particles at `60 °C` in the warm box. The warm particles are farther apart and have longer motion marks. The labels `geringere mittlere Bewegungsenergie`, `größere mittlere Bewegungsenergie`, `Temperatur steigt`, `Teilchen bewegen sich im Mittel schneller`, and `Abstand kann größer werden` are consistent with the particle model. |
| `fbe0faae-7fba-482b-888e-341f926770f3` | Wärmeleitung, Konvektion und Wärmestrahlung unterscheiden | `accepted_pilot` | The three panels are fachlich consistent. Wärmeleitung shows energy through a solid spoon from hot tea toward the cooler hand. Konvektion shows warm fluid rising and cooler fluid sinking in a circulation pattern. Wärmestrahlung shows radiation from a source to a hand without material transport. All arrows have coherent source and target. |
| `5308de76-79f0-44f4-8cb7-fc9de4772217` | initial Batch 001 candidate | `rejected_regenerated` | The pressure formula and liquid example were mostly correct, but the gas panel contained external red gas arrows around the container with ambiguous source-target meaning. Rejected. |
| `5308de76-79f0-44f4-8cb7-fc9de4772217` | Druck in Flüssigkeiten und Gasen qualitativ beschreiben | `accepted_pilot_after_regeneration` | The accepted image correctly states `p = F/A`, shows the same force on a larger area producing smaller pressure and on a smaller area producing greater pressure, labels lower liquid depth as greater pressure, and shows gas-particle wall collisions as pressure. Visible arrows in the accepted image were checked for physical source-target consistency. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 001 goals were deferred as provider limitations.
- Every visible arrow, arrow-like marker, pointer, connector, or dashed segment in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 001 asset used an SVG fallback as the final asset.
- No final Batch 001 provider prompt text contains the string `SkillPilot`.
- No final Batch 001 provider prompt text contains its canonical goal ID.
- No final Batch 001 provider prompt text contains `Mathematik`.
