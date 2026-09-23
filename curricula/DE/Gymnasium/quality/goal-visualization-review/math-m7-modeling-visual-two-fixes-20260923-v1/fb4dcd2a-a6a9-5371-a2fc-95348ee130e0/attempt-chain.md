# Modellverbesserung Taxi: tatsächliche Bildversuche

Provider für alle fünf Edits: OpenAI/ChatGPT-Codex, eingebautes `image_gen__imagegen`. Jede Ausgabe war Referenz des folgenden Versuchs; Versuch 01 nutzte das aktive Original-JPG (`sha256:7691ae3afd25226959e57b201d9929c1c6a4f0a37d875e973fd8918b61fc7465`). Alle Ausgaben sind PNGs mit 1672 × 941 Pixeln. Das Original wurde nicht gelöscht.

| Versuch | Datei-Digest (SHA-256) | Sichtentscheidung |
| --- | --- | --- |
| 01 | `b21e06c5a22bc860ca4324aec2c3d65f926aeb0faf5dfe7f3f940696d6ec0cb1` | HOLD: alte Sprechblase „oft ungenau“ bleibt unbelegt. |
| 02 | `4b2d59f01c725bdd8c3d800fe4fdd2f2e5907784b681638c43e552aac51cd5e2` | HOLD: „2 € pro km + G“ addiert in der Kurzform Größen unterschiedlicher Einheit. |
| 03 | `9edc35d73383dff8a50202730be43a881d286d26a6869a89f2258469a04a8023` | HOLD: gleiche Rate behauptet, aber Graphen sichtbar verschieden steil. |
| 04 | `93c6997dc9a41b270eed546106f1e937460dc6c1391a6443d34b715c3a84dd27` | HOLD: Graphen trotz gleicher Rate weiterhin sichtbar verschieden steil. |
| 05 | `9c51468c08c6f883e8f3112d962a0bf6a5f046d33ee840f657e504b623af97f0` | Kandidat: beide Streckenpreis-Belege gleich, rechts nur Grundpreis G ergänzt; keine unbewiesene Gütebehauptung. |

## Prompt 01 (Original-JPG als Referenz)

```text
Edit the referenced German upper-secondary educational comic about proposing model improvements, keeping its friendly abstract clean comic look, split left/right before/after taxi scene, warm blue palette, two yellow taxis, and wide landscape composition. Correct the pedagogical claims. Left old fare model: a simple line graph through the origin and a compact readable label 'Ohne Grundpreis' plus '2 € pro km'. Right proposed model: a parallel line graph starting above zero, and compact readable labels 'Mit Grundpreis G' and '2 € pro km + G'. Use a simple upward arrow between scenes labeled 'Vorschlag'. Do NOT assert the revised model is automatically closer to reality or always more accurate. Instead add one short neutral question in a bubble, exactly 'Passt das zu echten Preisen?' and a small caption 'An Daten prüfen'. Make clear that adding a base fare changes the intercept, while the distance rate stays the same. Graphs use the same axes and scale: x is Strecke (km), y is Preis (€); no fabricated data points or unsupported fit verdict. Correct German spelling, no extra formulas or text, no clipped panels, generous safe margins. Preserve school-comic friendliness and clarity; not photorealistic and not a sterile technical diagram. PNG 16:9 landscape.
```

## Prompt 02 (Versuch 01 als Referenz)

```text
Perform one precise edit on the referenced educational comic image. Keep the entire illustration, layout, panels, taxis, graphs, labels, colors, typography and safe margins unchanged. In the upper left speech bubble, replace the unsupported text 'Einfach, aber oft ungenau.' with the neutral two-line text 'Ein einfaches Modell ohne Grundpreis.' Do not alter any other wording, numbers, graph scales, axes, rates, intercepts or labels. The image should still ask whether the proposed taxi-price model fits real prices and say to check against data. No new text, no clipped content. Output crisp 16:9 landscape PNG.
```

## Prompt 03 (Versuch 02 als Referenz)

```text
Make exactly one correction to the referenced German school-comic image, preserving all else point-for-point as closely as possible. On the white price card beneath the RIGHT taxi, keep the first line 'Mit Grundpreis G' and change only its second line from '2 € pro km + G' to the dimensionally clear phrase 'Streckenpreis + G'. The green graph already labels the unchanged slope '2 € pro km' and the intercept 'G'; preserve those labels and geometry exactly. Keep all other German text, both taxis, two graph scales, panels, title, questions, colors, crisp legibility and full uncropped 16:9 PNG composition unchanged. Add no text and make no other alterations.
```

## Prompt 04 (Versuch 03 als Referenz)

```text
Correct one mathematical geometry error in the referenced school-comic taxi fare comparison while keeping the same friendly illustration and all exact German text. In the bottom two coordinate plots, the left red line and right green line both represent the SAME 2 € per km distance rate on identically scaled axes. Therefore draw the two rising straight lines visibly PARALLEL, with the right green line simply shifted vertically up by the positive intercept G. Make their angle to the horizontal identical and their line lengths comparable. The left red line begins at the origin. The right green line begins on its y-axis at G above zero. Preserve both taxis, panels, labels 'Streckenpreis + G', '2 € pro km', 'G', 'An Daten prüfen', the neutral question about real prices, no claims of automatic fit. No other wording or content changes. Ensure no cropped text and full clean 16:9 landscape PNG.
```

## Prompt 05 (ausgewählter Belegbild-Edit; Versuch 04 als Referenz)

```text
Revise the referenced friendly German school-comic image to avoid any mathematically misleading graph geometry. Keep the two yellow taxis, split before/after panels, top title and speech bubbles, German text about proposal and checking real prices, colors and 16:9 landscape style. Remove BOTH bottom coordinate graphs and all axes entirely. Replace the bottom half with a very simple two-panel visual receipt comparison. Left receipt under 'Ohne Grundpreis': one blue distance-charge token labelled 'Streckenpreis'. Right receipt under 'Mit Grundpreis G': the SAME blue distance-charge token labelled 'Streckenpreis', a plus sign, and one green fixed-fee token labelled 'Grundpreis G'. This makes the new model exactly the old distance charge plus one fixed base fee; no numeric amounts or unverifiable fit/ranking claims. Keep a small separate neutral callout 'An Daten prüfen'. Correctly spelled German; no duplicate captions, no new formulas, no graph, no clipped content. Friendly abstract clear comic, not photorealistic or sterile.
```

Alle fünf tatsächlichen Ausgaben liegen mit übereinstimmender Nummer im Paket. Nur Versuch 05 ist fachlich als Importkandidat vorgesehen; die anderen Versuche bleiben nachvollziehbare HOLDs.
