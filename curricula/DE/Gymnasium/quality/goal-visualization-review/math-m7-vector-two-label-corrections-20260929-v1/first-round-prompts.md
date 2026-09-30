# Imagegen-Vorversuche vom 29.09.2026

Die folgenden Aufrufe nutzten das eingebaute `image_gen` mit jeweils genau einer lokalen Referenzdatei. Sie erzeugten Kandidaten, keine Freigaben. Die spätere unabhängige Bildprüfung blockierte beide ersten Endkandidaten; deren Befunde führten zu den gezielten zweiten Korrekturen.

## d1352ce0: Ausgangs-JPG zu erster PNG-Fassung

Referenz: `app/public/assets/goal-visualizations/mathematik/d1352ce0-9502-5039-9af6-318fe385b6fd/d1352ce0-9502-5039-9af6-318fe385b6fd.jpg`

```text
Use case: text-localization / precise educational bitmap edit. Edit target: the supplied SkillPilot mathematics infographic about vector collinearity. Preserve the entire existing composition, vector arrows, magnifying glasses, grid, formulas, colors, comic-friendly style, header, and all labels except the two explanatory captions at the bottom of the left GEOMETRISCHE PRÜFUNG panel. Replace the caption below the green check with exactly 'Parallel: gleiche Richtung' on two lines if needed. Replace the caption below the red X with exactly 'Nicht parallel: andere Richtung' on two lines if needed. This fixes the mathematical error that free vectors need not lie on the same geometric line to be collinear. Do not change the right RECHNERISCHE PRÜFUNG panel, the examples, k values, or any math. German spelling must be exact, legible, and clean. Return a high-resolution raster PNG; preserve the existing friendly illustration rather than redesigning it.
```

Ergebnis: `exec-333612a1-99cc-4553-97c2-ccc7735bd8f4.png` (intermediär, nicht aktiv).

## d1352ce0: Korrektur der zu engen positiven Beschriftung

Referenz: `exec-333612a1-99cc-4553-97c2-ccc7735bd8f4.png` aus dem unmittelbar vorherigen Aufruf.

```text
Use case: precise-object-edit of an existing educational PNG. Change only the small bottom-left caption underneath the green check in the GEOMETRISCHE PRÜFUNG panel. It currently says 'Parallel: gleiche Richtung' and is incomplete as a general explanation of vector collinearity. Replace it exactly with 'Gleiche oder entgegengesetzte Richtung' in two or three clean lines, with enough space and legibility. Preserve all other pixels, examples, arrows, formulas, title, colors, style, and the adjacent caption 'Nicht parallel: andere Richtung' as closely as possible. Mathematically both same-direction and opposite-direction nonzero vectors can be collinear; do not imply only same-direction vectors are collinear. Return PNG.
```

Ergebnis: `exec-86ce8b42-c43c-4e37-a3b0-3b57c74371a5.png`, erster unabhängig geprüfter Kandidat. Die Prüfung fand die irreführende Beschriftung `Lösung: k=3 und k=0.5` im negativen Beispiel; deshalb BLOCK.

## 235ae698: Ausgangs-JPG zu erster PNG-Fassung

Referenz: `app/public/assets/goal-visualizations/mathematik/235ae698-369f-4dbe-b46f-87e8b65bb03d/235ae698-369f-4dbe-b46f-87e8b65bb03d.jpg`

```text
Use case: text-localization / precise educational bitmap edit. Edit target: supplied existing friendly SkillPilot mathematics infographic comparing a line and a line segment in 3D. Preserve its composition, hand-drawn colorful style, all coordinates A(1|2|0) and B(4|3|2), blue line and bounded segment, parameter bounds, formulas, and legible typography. Only fix a category error and one stray character in the RIGHT segment panel: (1) the label beside the bounded blue segment must read exactly 'Strecke AB' with NO vector arrow over AB; (2) in the orange right equation box, replace the left-hand object label with exactly 's:' (a segment label), while keeping the vector arrow above x and the rest of the formula as-is: s: x-vector = (1|2|0) + t · (3|1|2), 0 ≤ t ≤ 1; (3) remove the isolated stray 'V' beneath the center divider near the bottom. Keep the left line panel unchanged and all other wording unchanged. The finite segment itself must have no arrowhead; only the separate small black direction-vector arrow may have an arrowhead. Do not add a vector arrow over 'Strecke AB' or 's'. Return a high-resolution raster PNG with clean exact German math notation, no redesign.
```

Ergebnis: `exec-2c199f4e-07d3-40e2-a1d2-6cbf824cea3a.png`, erster unabhängig geprüfter Kandidat. Die Prüfung fand in beiden Panels den Punkt A(1|2|0) irreführend auf einer einzelnen grauen Koordinatenachse; deshalb BLOCK.
