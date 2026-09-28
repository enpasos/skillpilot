# Lernzielvisualisierung: Den Kehrsatz des Pythagoras beweisen

- Ziel-ID: `6a3502ee-b616-5db7-88fc-8951f33c9f63`
- Aktives Quellbild: `6a3502ee-b616-5db7-88fc-8951f33c9f63.png`
- SHA-256: `dd76447150b51af15d97264ef9eccd3d656ac51d2a380582a80028de145450c6`
- Generator: OpenAI built-in imagegen; konkrete Modellkennung vom Tool nicht ausgegeben
- Lizenz des SkillPilot-eigenen didaktischen Bildes: CC-BY-4.0
- Status: unabhängig KI-geprüfter Pilotkandidat; keine menschliche Freigabe

Die früher aktive SVG-Datei `6a3502ee-b616-5db7-88fc-8951f33c9f63.svg` bleibt unverändert als historische Quelle erhalten; deren ursprünglicher Prompt liegt in `prompt.svg-20260928-historical.de.md`. Für den finalen Bildgenerator wurde eine lokale geometrisch exakte Rastervorlage aus einem temporären SVG erzeugt; das aktive PNG selbst stammt aus imagegen und wurde unabhängig anhand der tatsächlichen Pixel nachgemessen. Das verworfene PNG mit nicht kongruenten Dreiecken liegt unter `curricula/DE/Gymnasium/quality/goal-visualization-review/m7-current-image-repairs-20260928-v1/rejected-converse-proof-geometry-b6bae.png` als Historie. Die unabhängigen KI-Reviews stehen unter `curricula/DE/Gymnasium/quality/goal-visualization-review/m7-current-image-repairs-20260928-v1/fresh-b-converse-proof-exact-png-independent-review.json` und `fresh-b-converse-png-independent-review.json`. Keine menschliche Freigabe wurde erteilt.

Die folgenden Prompts wurden bei der Erstellung der PNG-Kandidaten exakt in dieser Reihenfolge verwendet:

## Versuch 1: superseded

- Datei: `tmp/m7-20260928-continuation/pyth-converse-proof-superseded-initial.png`
- SHA-256: `01eb0b3322038162bab00b85573d81646d91946a1b6ce71473d8c944f64f800c`
- Befund: The condensed proof omitted the explicit Pythagoras step d²=a²+b² and the given/auxiliary triangle proportions were less faithful than in the exact local reference. It was not imported.

```text
Use case: scientific-educational.
Asset type: landscape 16:9 PNG learning-goal illustration for German grade 9 mathematics, legible when reduced to a 360-pixel-wide card.
Primary request: Illustrate the PROOF of the converse of the Pythagorean theorem via a constructed auxiliary right triangle and SSS congruence. Do not turn this into a mere numeric application exercise.
Scene: friendly, abstract classroom-comic diagram on a warm off-white background, two large rounded panels with generous spacing. Left panel: a given triangle ABC with side a opposite A, side b opposite B, side c opposite C; put a small question mark at angle C, NO right-angle marker on the left panel. Right panel: a carefully constructed right triangle A'B'C' whose legs are a and b, and whose hypotenuse is d, with a right-angle square at C'. Use the same side colors across both triangles (a blue, b green, c/d coral). The triangles must be consistently labelled: a and b meet at C and at C'; c/d are the opposite sides. Make the left triangle look like a different orientation of the same congruent right triangle while leaving its right angle unmarked.
Below the panels, a simple three-step visual reasoning ribbon. Exact short mathematical text only: "a²+b²=c²" then "d=c" then "SSS ⇒ ∠C=90°". Use readable conventional symbols, no extra formulas or prose. The right-angle conclusion is only in the final step.
Style: polished friendly comic-like educational illustration, soft lightly textured color fields, rounded dark navy lines, bright but restrained blue-green-coral palette. Flat editorial drawing, not photorealistic, not a sterile technical graph. No characters, rulers, logos, watermark or technical IDs.
Accuracy constraints: the equal sides and angle positions must make SSS and the final correspondence true. No 90° mark on the given triangle before the final conclusion. Exact spelling of labels and expressions. Favor correctness and generous clear linework over decorative details.
```

## Versuch 2: rejected, corrected by next attempt

- Datei: `tmp/m7-20260928-continuation/pyth-converse-proof-rejected-colors.png`
- SHA-256: `42877f4855f1c47fa2a89fb26af52040fd0d0a592da7d9007db2e5c833ab7ba9`
- Referenz: `tmp/m7-20260928-continuation/pythagoras-converse-proof-exact.preview.png` (SHA-256 `3bbdc0073972c0eee03839742676c4e1d71bf59fbe44237f533327f49e444499`)
- Befund: The given triangle's side strokes were all blue while the corresponding side labels and the helper triangle used distinct colors, weakening the SSS correspondence.

```text
Use case: scientific-educational style-transfer.
Asset type: landscape PNG learning-goal illustration for German grade 9 math, card-width legibility.
Input image role: locally authored mathematically exact reference proof diagram. Re-illustrate it as an inviting comic-like educational image while preserving its exact logical and geometric structure.
Primary request: explain the PROOF of the converse of the Pythagorean theorem by comparing the given triangle with a constructed right auxiliary triangle. Preserve EXACTLY the side labels a,b,c on the given triangle, a,b,d on the right auxiliary triangle, angle correspondence C/C', the right-angle square only at C' in the comparison step, and the reasoning: "d²=a²+b²=c² ⇒ d=c", then "SSS", then "∠C=90°". The original triangle's angle C is unknown until the conclusion. The right auxiliary triangle must have true perpendicular legs a and b. Side lengths and placements should be geometrically faithful to the reference.
Style changes only: warm off-white subtle paper texture, rounded navy outlines, soft blue and apricot panels, blue-green-coral side colors, polished friendly comic lettering. Keep the hierarchy simple and all mathematical text large enough to read at 360px card width. No photos, no sterile chart look, no characters, no logos or IDs.
Hard invariants: do not move or swap side labels; do not add any right-angle square to the original triangle; do not lose the equality d=c or the SSS conclusion; no erroneous notation or extra calculations.
```

## Versuch 3: superseded after 360-pixel card preview

- Datei: `tmp/m7-20260928-continuation/pyth-converse-proof-imagegen.png`
- SHA-256: `bfac9fd876cff791bd076078bbcd64ef9924d19cd4e1b19c3b9bc81a88166842`
- Referenz: `tmp/m7-20260928-continuation/pyth-converse-proof-rejected-colors.png` (SHA-256 `42877f4855f1c47fa2a89fb26af52040fd0d0a592da7d9007db2e5c833ab7ba9`)
- Befund: Its explanatory sentences and the intermediate formula were too small at 360-pixel goal-card width, despite correct mathematics.

```text
Precise-object-edit of the provided educational proof image. Change ONLY the three STROKE COLORS of the given triangle ABC in the LEFT panel to match the already colored labels and matching sides in the right panel: segment AC (side b) must be GREEN, segment CB (side a) must be BLUE, and segment AB (side c) must be CORAL RED. Keep vertices, triangle geometry, labels, formulas, all other text, right-panel triangle, all panels and layout unchanged pixel-for-pixel as far as possible. Do not add a 90° mark to left triangle. This color correction makes side correspondence in the SSS proof visually coherent. Preserve exact symbols, apostrophes, degree signs and equations.
```

## Versuch 4: rejected after independent geometric review

- Datei: `tmp/m7-20260928-continuation/pyth-converse-proof-compact-imagegen.png`
- SHA-256: `b6bae508244409c7c034af760591c0af1a8c3bba38f36eec999acd5df1953cd5`
- Referenz: `tmp/m7-20260928-continuation/pyth-converse-proof-superseded-initial.png` (SHA-256 `01eb0b3322038162bab00b85573d81646d91946a1b6ce71473d8c944f64f800c`)
- Befund: The SSS side proportions differ visibly between panels: a/b≈1.068 on the left versus≈0.986 on the right, and the helper angle is≈87° rather than 90°. Independent hold evidence: curricula/DE/Gymnasium/quality/goal-visualization-review/m7-current-image-repairs-20260928-v1/fresh-b-converse-png-independent-review.json.

```text
Precise-object-edit of the provided landscape educational math illustration. Keep both side-by-side triangle diagrams, all vertices, side labels, colors, right-angle marker only at C', panel positions, soft comic style, and final SSS conclusion unchanged. In the FIRST bottom reasoning box only, replace the existing expression "a²+b²=c²" with the exact complete expression "d²=a²+b²=c²". Widen that first box as much as needed while keeping three reasoning boxes and large legible type when the whole image is 360 pixels wide. Keep the MIDDLE box exactly "d=c". Keep the LAST box exactly "SSS ⇒ ∠C=90°". Do not change any other text or mathematical relationship. The new first box makes explicit that Pythagoras in the right auxiliary triangle gives d²=a²+b², equal to c² from the given premise.
```

## Versuch 5: pending independent geometric review; not active

- Datei: `tmp/m7-20260928-continuation/pyth-converse-proof-exact-imagegen.png`
- SHA-256: `dd76447150b51af15d97264ef9eccd3d656ac51d2a380582a80028de145450c6`
- Referenz: `tmp/m7-20260928-continuation/pyth-converse-proof-exact-translation-reference.png` (SHA-256 `715c029c3270c00c9cad0600620932bb2018ba954f565cd54949c559e578c005`)

```text
Use case: scientific-educational style-transfer.
Asset type: 1672×941 landscape PNG for a German grade 9 mathematics goal card. The supplied image is a locally authored exact GEOMETRY TEMPLATE, not the final art.
Primary request: repaint the template into warm, friendly, softly textured comic-style educational art, but STRICTLY TRACE the two geometric triangle diagrams, retaining every vertex and straight side at its current pixel position. Do not redraw the triangles at different proportions. The right triangle must be the LEFT triangle shifted horizontally by exactly 850 pixels, with NO rotation, reflection, or rescaling. The green b side, blue a side, and coral c/d side have exactly the same lengths in both panels.
Geometry lock from template: left vertices A=(100,500), B=(700,500), C=(484,212); right vertices A′=(950,500), B′=(1550,500), C′=(1334,212). Both have side lengths b=480px, a=360px and c or d=600px, a 3:4:5 right-triangle layout. These pixel measurements are ONLY for drawing precision and MUST NOT appear as numbers in the picture. The sides a and b are truly perpendicular at C and C′. Put a small question mark at C in the left given triangle, with NO right-angle marker there. Put the little right-angle square marker only at C′ in the right auxiliary triangle. Keep vertex names and symbolic side labels exactly as in the reference. The diagrams must be congruent, as the SSS reasoning requires.
Keep three large readable reasoning cards along the bottom with the exact short expressions "d²=a²+b²=c²", "d=c", and "SSS ⇒ ∠C=90°". These formulas should remain large enough to read when the entire image is 360px wide. Keep left caption "Ausgangsdreieck" and right caption "Rechtwinkliges Hilfsdreieck". Do not add 3,4,5 or any other concrete side numbers.
Visual style only: warm off-white paper, subtle textured soft pastel yellow left card and pastel blue right card, very slightly hand-drawn rounded navy borders, inviting comic-like color and gentle shaded fills. No photo, no sterile CAD chart, no characters, no logos, no watermark, no technical IDs.
Mathematical correctness and exact template geometry are more important than novel decoration. If a style change would move a side or vertex, leave that geometric stroke unchanged.
```
