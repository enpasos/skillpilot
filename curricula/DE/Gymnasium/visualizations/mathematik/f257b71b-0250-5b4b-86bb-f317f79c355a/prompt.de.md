# Lernzielvisualisierung: Die Schwerpunktformel eines Dreiecks mit Ortsvektoren herleiten (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `f257b71b-0250-5b4b-86bb-f317f79c355a`
- Titel: Die Schwerpunktformel eines Dreiecks mit Ortsvektoren herleiten (LK)
- Beschreibung: Die lernende Person kann für ein Dreieck mit nicht kollinearen räumlichen Eckpunkten A, B und C aus Seitenmittelpunkten und Seitenhalbierenden die Formel $\overrightarrow{OS}=(\overrightarrow{OA}+\overrightarrow{OB}+\overrightarrow{OC})/3$ für den Schwerpunkt S herleiten und durch die Lage auf allen drei Seitenhalbierenden prüfen.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation (built-in image_gen; model not exposed)
- Status: pilot
- Quellbild: `f257b71b-0250-5b4b-86bb-f317f79c355a.png`
- Public Asset: `/assets/goal-visualizations/mathematik/f257b71b-0250-5b4b-86bb-f317f79c355a/f257b71b-0250-5b4b-86bb-f317f79c355a.png`

## Prompt

```text
# Tatsächliche Imagegen-Promptfolge

## Aufruf 1 — generation-prompt.md

# Actual provider-facing prompt for candidate 1

Use case: scientific-educational. Create a high-resolution, landscape PNG educational illustration for an advanced high-school mathematics learning goal. Friendly, abstract, clear and lightly comic-like, with warm white background, clean dark-blue outlines, and a restrained palette of blue, coral, teal and soft yellow. It must still be a precise geometric diagram, not a photorealistic scene or a sterile engineering blueprint.

Show a large nondegenerate triangle ABC in one oblique plane: A lower left, B lower right, C upper middle. Put M exactly halfway along side BC, N exactly halfway along side AC, and P exactly halfway along side AB. Use tiny matching tick marks on the two halves of each side, with a distinct marking style for each side, so the three midpoint relations are unambiguous. Draw median AM in blue and median BN in coral, plus median CP as a thinner teal dashed line; all three medians must intersect at exactly one point S inside the triangle. S must be at two thirds of the way from each vertex toward the opposite side midpoint. A small 2:1 brace along the A-to-M median may mark AS:SM, if it can be drawn correctly.

Keep labels A, B, C, M, N, P and S large and next to their correct points; S belongs to the one crossing of the three medians, not to a side midpoint. A simple, spacious formula panel on the right should show these exact relationships, rendered legibly: M = (B + C) / 2; S = A + (2/3)(M - A); and the final position-vector formula with arrow notation, vector OS = (vector OA + vector OB + vector OC) / 3. The three formulas describe one derivation; do not add numerical coordinates or extraneous results. Do not replace the 2/3 ratio with 1/2. Ensure all letters and signs are correct. If precise over-arrow vector notation is unreliable, omit the final formula rather than garble it; geometric correctness takes priority.

Give the image a short German title: „Schwerpunkt im Dreieck herleiten“. Avoid decorative characters, speech bubbles, thick shadows and excessive text. All shapes and text should remain readable when scaled down to a learning-goal book page.

## Aufruf 2 — edit-prompt-2.md

# Actual provider-facing targeted edit prompt for candidate 2

Edit the supplied educational triangle-centroid diagram with a single text correction. In the coral rounded heading inside the right-side panel, replace the current German wording “2. Schwerpunkt auf einer Medianen” with the exact shorter wording “2. Schwerpunkt auf AM”. Keep that coral heading's size, position, color, font style and all other pixels as close as possible to the original. Preserve the exact geometry: A, B, C, side midpoints M, N, P, the three medians crossing at S, tick marks, blue 2:1 brace, and all three formulas without any other change. Do not add or remove anything else.

## Aufruf 3 — edit-prompt-3.md

# Actual provider-facing targeted edit prompt for candidate 3

Edit the supplied educational triangle-centroid PNG. Keep its friendly clean style, German title, color palette, right-side three-step panel, exact final vector formula and general composition. Correct two mathematical details precisely:

1. In formula step 1, replace the point-name shorthand with full position-vector notation: vector OM equals (vector OB plus vector OC) divided by 2. Print visible right-pointing over-arrows over each two-letter vector symbol, just like the correct final formula already does. The mathematical content must be exactly →OM = (→OB + →OC)/2.

2. In formula step 2, use full position-vector notation: →OS = →OA + (2/3)(→OM − →OA). Give each two-letter vector symbol a visible right-pointing over-arrow; write the fraction two thirds clearly. It may use a little smaller type or two carefully aligned lines to fit. Do not write S=A+... without vector notation.

3. Correct the left triangle geometry so it visibly matches exact midpoints and the 2:1 median ratio. Use this layout geometry as a guide for a 1536×1024 image: A near (100,800), B near (880,800), C near (520,180); M on BC near (700,490), N on AC near (310,490), P on AB near (490,800), and S at the common intersection near (500,593). The target S is exactly two thirds along AM from A toward M, so AS:SM=2:1; it must also lie on BN and CP. Keep the paired equal-half tick marks and the blue 2:1 brace. Moving the midpoint dots and the three medians slightly is allowed to make all lines meet correctly.

Do not change the names of A, B, C, M, N, P and S, do not change the final position-vector formula in step 3, and do not add any unrelated illustration or wording. The image is a conceptual but geometrically faithful teaching diagram, not a coordinate exercise. Prioritize correct vector arrows, correct plus/minus signs and exact median concurrence over decorative polish.

## Aufruf 4 — edit-prompt-4.md

# Actual provider-facing targeted edit prompt for candidate 4

Edit only the left triangle geometry in the supplied diagram. The right panel's three full position-vector equations, all over-arrows, all words, fonts and colors are now correct and must remain unchanged.

The current drawn centroid S is slightly too high and too far right on the blue A-to-M median: its visible A-to-S to S-to-M length is about 2.3:1, while the blue brace and equation require exactly 2:1. Move the black S intersection dot slightly down and left, approximately from (515,580) to (500,600) in the 1536x1024 raster. For geometric consistency also move the side midpoint M slightly down toward (705,495), N slightly down and left toward (304,495), and P slightly left toward (486,810). Keep A near (84,810), B near (888,810), C near (524,180). Redraw the blue median A-M, coral median B-N and dashed teal median C-P so all three pass through the corrected S point. The corrected S must lie two thirds of the way from every vertex to the midpoint of its opposite side. Preserve the same names, paired side tick marks, point colors and clean visual language. Place the blue brace so its 2 part is visibly twice its 1 part. Do not change the title or the right formula panel.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
