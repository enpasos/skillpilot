# Generation prompt — 326d45bf-9f77-57d5-a054-93e76b034dd5

Built-in `image_gen` edit with the active JPG as input image. This is the exact prompt used for the candidate.

```text
Use case: scientific-educational
Asset type: German learner-facing chemistry goal visualization, readable when displayed at only 360 pixels wide.
Input image: the supplied JPG is the edit target and visual reference. Preserve its friendly clean comic infographic style, white and pale blue background, blue identical round particles, clear dark outlines, red warming arrows and blue cooling arrows. Recompose the layout for mobile readability.
Primary request: Make a corrected 4:3 landscape PNG. Show exactly three clear particle-model boxes in one row across the upper half, each with one bold state label: "fest", "flüssig", "gasförmig". Solid particles densely and regularly packed; liquid particles still close together but irregular and able to slide; gas particles widely spaced with sparse small motion arrows. Every particle represents the SAME unchanged substance and has the SAME blue color and appearance in all three boxes.
Below the boxes, use the full image width for two clean horizontal arrow rows. The upper warming row has two separate thick RED right-pointing arrows: from fest to flüssig labeled "Schmelzen", and from flüssig to gasförmig labeled "Verdampfen". The lower cooling row has two separate thick BLUE left-pointing arrows: from gasförmig to flüssig labeled "Kondensieren", and from flüssig to fest labeled "Erstarren". Each transition label must be very large, high-contrast bold black German text, visually readable in a 360-pixel-wide thumbnail. Place the word directly above or inside its own arrow with generous clear space. The arrow direction must be unmistakeable. A tiny red sun and blue snowflake may mark the rows but are optional.
At top, a compact title "Aggregatzustände" if it fits without reducing transition-label size. Prioritize the four transition labels over title/decorations. Exact visible words only: "Aggregatzustände", "fest", "flüssig", "gasförmig", "Schmelzen", "Erstarren", "Verdampfen", "Kondensieren". Use correct umlauts and spelling.
Composition: carefully balanced educational diagram; 4:3 landscape rather than wide 16:9 so the two arrow rows have vertical room, yet keep generous horizontal margins. Flat illustration, sharp lettering, simple geometry, pale blue and white.
Scientific constraints: show only physical state changes of one substance, no chemical reaction, no molecule identity changes; do not reverse any arrows; avoid any sublimation/deposition arrows or extra state; no flames or beakers needed. No photorealism, no logos, no watermarks, no English text, no decorative small lettering.
```

## Aktive Fassung und Prüfung

- Generator: OpenAI / ChatGPT Codex imagegen als gezielte Bearbeitung des archivierten JPG.
- Aktives PNG: `326d45bf-9f77-57d5-a054-93e76b034dd5.png`, 1448 × 1086 Pixel (4:3), SHA-256 `28c7efb897e8baeffa23afb3807341180e70409dba2afa473d1566f1379f2190`.
- Formatentscheidung: Das höhere 4:3-Bild macht die vier Übergangsnamen bei 360 Pixel Breite lesbar; die alte 16:9-Fassung hatte dafür zu schmale Zwischenräume.
- Unabhängige fachliche und visuelle KI-Kandidatenprüfung in Originalgröße und bei 680/360 Pixeln: `quality/goal-visualization-review/chemie-b004t-326-mobile-correction-20260930-v1/independent-candidate-qa.json`. Keine menschliche Freigabe der neuen Fassung.
- Altes JPG, Prompt und damaliger QA-Record sind unter `quality/goal-visualization-review/chemie-b004t-326-mobile-correction-20260930-v1/historical-active-before-correction/` erhalten.
