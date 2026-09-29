# Fixpunkte einer affinen Spiegelung

- Ziel: `1a63bf83-1dd5-4eb2-bd8e-f9cfa02f4c42`
- Verfahren: eingebaute OpenAI / ChatGPT-Codex image generation; keine API-Modellversion behauptet
- Finale Datei: `1a63bf83-1dd5-4eb2-bd8e-f9cfa02f4c42.png`
- Fachliches Beispiel: Spiegelung an `x=2`, also `x'=4−x` und `y'=y`; die Fixpunktmenge ist die ganze Gerade `x=2`.

## Generierungsprompt des finalen Bildes

```text
Use case: scientific-educational
Asset type: compact SkillPilot math learning-goal PNG for German Gymnasium, landscape
Primary request: A friendly, mathematically accurate image of the FIXED-POINT SET of one affine transformation: mirror reflection across the vertical line x=2. The transformation is x'=4−x and y'=y, so the translation term is nonzero, and every point on x=2 is fixed.
Composition: On a clean pale ivory background, show a vertical green mirror line in the CENTER of the image labelled x=2. Draw THREE blue fixed dots F1, F2, F3 exactly ON that green line, separated vertically. Put an orange dot P to its left and a matching orange dot P' to its right at the EXACT SAME HEIGHT and EQUAL DISTANCE from the green line; add a small curved arrow from P to P'. No coordinate axes, no grid, and no other geometric elements. Place a short title and one small formula card in separate clear white areas.
Text (verbatim, only these): title "Fixpunkte einer affinen Spiegelung"; mirror label "x=2"; point labels "P", "P'", "F₁", "F₂", "F₃"; formula card "x'=4−x" and "y'=y". No other text.
Style/medium: cheerful but restrained SkillPilot classroom comic infographic; off-white ground, pale blue panel, smooth flat colors, thick crisp navy outlines, green fixed line, orange moving point pair. Clear and readable when reduced to goal-card width. NO dark vignette or shadow behind small text; no photorealism or sterile technical aesthetic.
Mathematical constraints: P and P' MUST be at the same height. Green x=2 line MUST be the perpendicular bisector of the segment PP'. All F dots must be directly on the line. Do not put any F dot off the line. No other numbers, no integrals, no copied layout, no watermark, no technical IDs.
```

## Gezielte Korrektur des generierten Bildes

Der erste Kandidat dieses Prompts hatte dunkle, störende Schatten. Die finale
PNG entstand mit folgender Bildkorrektur unter Verwendung genau dieses
Kandidaten als Bildvorlage:

```text
Edit the previous image only in its BACKGROUND and lighting. Preserve every mathematical element exactly in place: text, formula card, centered green x=2 line, all three blue F points on it, the orange P and P' pair at equal distances, the horizontal dotted segment, and the curved orange arrow. Remove all dark blurry smudges, black vignetting, and smoky shadows in the left and lower middle. Replace the interior background with a uniformly pale sky-blue or warm ivory flat fill, with subtle clean comic-card texture at most. Keep all lettering crisp and high contrast; do not shift, remove, add, or redraw the mathematics. The result should be bright, friendly, and easily readable at a small card size.
```
