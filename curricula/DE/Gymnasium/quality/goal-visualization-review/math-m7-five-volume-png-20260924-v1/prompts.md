# Original image-generation prompts

Built-in ChatGPT/Codex image generation; each candidate remains subject to actual-pixel review.

## Prism (first candidate)

```text
Use case: precise-object-edit. Asset type: German Oberstufe mathematics learning-goal illustration, PNG. Edit target: the supplied friendly pastel comic-style prism-volume image. Make only these focused corrections: (1) The title must be exactly 'Volumen von Prismen berechnen' on one line, with no parenthetical addition. (2) Replace the open book on the upper right, especially its word 'FORMELSAMMLUNG', with a friendly small stack of three identical thin orange prism slices or layered identical base-area cards. Put the label 'gleiche Grundfläche G' near those layers, and show the relationship 'V = G · h' nearby as a conclusion derived from repeated congruent cross sections, not as a formula looked up in a book. Keep the overall prism drawing, blue/orange palette, black readable handwriting-like typography, dimensions length 5 cm, width 4 cm, height 7 cm, base area 20 cm², calculation V = 20 cm² · 7 cm = 140 cm³, and note about cm² vs cm³ intact and mathematically correct. Make labels clean and legible on a phone at about 360 CSS pixels. No 'Formelsammlung', no book icon, no extra numbers, no photorealism, no watermark. Maintain established warm abstract comic feel, not a sterile chart.
```

## Pyramid (first candidate)

```text
Use case: scientific-educational. Asset type: square PNG for the SkillPilot German upper-secondary mathematics goal 'Volumen von Pyramiden aus Grundfläche und Höhe bestimmen', readable at 360 CSS pixels. Create a friendly abstract pastel comic diagram, not photorealism or sterile vector chart. Key visual: at left a SOLID ORANGE square pyramid with square base 6 cm by 6 cm and clearly dashed PERPENDICULAR height h=9 cm from apex to the center of its base (not a sloping edge); at right a pale blue TRANSPARENT square prism with the SAME 6 cm by 6 cm base and SAME perpendicular height 9 cm. Place them side by side at comparable scale so their common base and height are obvious. Large header exactly 'Pyramide und Prisma'. Below the shapes use just three spacious cards with exact text: 'G = 36 cm²', 'Prisma: V = G · h = 324 cm³', 'Pyramide: V = ⅓ · G · h = 108 cm³'. Between the last two cards a big visually clear one-third comparison, maybe three equal orange volume tiles making the prism and one orange tile for the pyramid; label exactly 'ein Drittel'. Keep all values mathematically exact (36×9=324, one third of 324=108). The diagram can be schematic but may not imply that merely stacking three congruent pyramids geometrically tiles the prism; comparison tiles are volume units, not a physical decomposition. Use bold legible German type, soft sky blue, warm amber and cream, clean labels, subtle hand-drawn ink outlines. No 'Formelsammlung', no book, no extra measurements or formulas, no watermark.
```

## Prism (second candidate, rejected: crowded phone layout)

```text
Use case: scientific-educational. Asset type: square PNG (1:1) German SkillPilot mathematics learning-goal illustration, explicitly legible when displayed at 360×360 px. Goal: understand and calculate prism volume from base area and perpendicular height. Warm pastel cyan, cream, orange, friendly hand-drawn comic, opaque light background, not photorealism and not a sterile chart. Main visual: one large upright RECTANGULAR PRISM with its BOTTOM RECTANGULAR BASE highlighted orange and labeled 'G = 5 cm · 4 cm = 20 cm²'; two base edges clearly marked 5 cm and 4 cm, and a separate vertical arrow along the prism axis marked 'h = 7 cm'. The height arrow must be perpendicular to the base; do not label a sloping edge h. Beside it, show a few matching thin orange base-area slices stacked upward inside or next to the prism, schematic explanation that all cross sections have the same area. Large concise header exactly 'Prisma: gleiche Grundfläche'. Large high-contrast bottom result card exactly 'V = G · h = 140 cm³'. Small but readable footer exactly 'Fläche cm² · Höhe cm = Volumen cm³'. All math exact: 5×4=20, 20×7=140. Bold clean text, no tiny second calculations, no 'Formelsammlung', no book icon, no inaccurate dimensional cues, no watermark.
```

## Prism (third candidate, accepted)

```text
Use case: scientific-educational. Make a SQUARE 1:1 PNG for a SkillPilot mathematics learning-goal illustration. Minimal, charming, abstract COMIC with an entirely OPAQUE pale-blue/cream background. At 360 px display width the numbers and labels MUST be readable. No people, no speech bubbles, no notes, no decorative text. Only FOUR text regions are allowed: (1) top title exactly 'Prismenvolumen'; (2) in/near highlighted orange base exactly 'G = 20 cm²'; (3) next to a truly vertical height arrow exactly 'h = 7 cm'; (4) bottom large card exactly 'V = G · h = 140 cm³'. The single main visual takes most of the square: a clean upright rectangular prism with a highlighted ORANGE base that is 5 cm by 4 cm and a perpendicular height of 7 cm. Add small unobtrusive base-edge labels '5 cm' and '4 cm' (these are part of visual region 2). Show three faint horizontal congruent orange slices inside the prism to make the repeated-base idea obvious; no books or formula-sheet symbolism. A height arrow starts at base level and ends at top level, parallel to the vertical edges, not on a sloping depth edge. The base area 5×4=20 cm², volume 20×7=140 cm³; keep all labels/math exact. Layout uses large navy lettering, warm orange/cyan pastel and slightly hand-drawn outlines; clean white space around math. Do not add any other words or equations, no transparent pixels, no watermark, no photorealism.
```

## Pyramid (opaque-background edit, accepted)

```text
Use case: precise-object-edit. This is a complete friendly German math comic image of matching square pyramid and prism, formula cards and one-third volume comparison. Preserve EVERY foreground object, line, text, shape, number, size, position, and color exactly as in the target. Make only one technical/visual change: replace the translucent background and all partial alpha/transparency with a FULLY OPAQUE pale cream/sky-blue background across the entire square canvas, including edges and behind cards. Ensure no see-through pixels: it must look equally clear over dark and light SkillPilot themes. Keep the values 6 cm, h=9 cm, G=36 cm², prism 324 cm³, pyramid 108 cm³ and 'ein Drittel' unchanged, and do not add new math or text. Output PNG. No photorealism, no watermark.
```

## Cylinder (initial candidate)

```text
Use case: scientific-educational. Asset type: square PNG learning-goal illustration for German upper-secondary mathematics, readable at about 360 CSS pixels. Friendly abstract comic style with soft cyan and amber, hand-drawn but precise geometry, no photorealism. Goal: understand a cylinder volume as circular base area times perpendicular height, without a formula collection. Main central object: a transparent upright cylinder with a clearly ORANGE circular bottom base (ellipse only because of perspective); a radius arrow from center of bottom circle to the circular edge labeled 'r = 3 cm' (never diameter), and an external vertical height arrow parallel to cylinder axis labeled 'h = 10 cm'. Above/beside it show a simple stack of three congruent circular slices, clearly schematic, illustrating same base area along the height. Big header exactly 'Kreisfläche mal Höhe'. Two large spacious equation cards, exact text: 'G = πr² = 9π cm²' and 'V = G · h = 90π cm³'. Small footer exactly 'Zylinder: gleiche Kreisfläche in jeder Höhe'. Check math: r=3 cm, h=10 cm, G=9π cm², V=90π cm³. No other numeric values, no 'Formelsammlung', no book icon, no tiny decorative text, no watermark. Emphasize geometry and meaning, not lookup.
```

## Cylinder (opaque-background edit, final candidate)

```text
Use case: precise-object-edit. Edit this square German cylinder-volume comic. Essential change: replace EVERY transparent/black gutter and transparent outer pixel with a fully opaque warm pale-cream-to-sky-blue background across the entire square canvas, so the image works in both light and dark UI. Make the vertical dimension label 'h = 10 cm' next to the main cylinder/arrow large dark navy type inside a small rounded light label, clearly readable at 360px width. Preserve all other elements and exact math: orange base radius r = 3 cm from center to edge, height arrow vertical from cylinder bottom to top, G = πr² = 9π cm², V = G · h = 90π cm³, three congruent circular slices, and title/footer spelling. No new symbols, no Formelsammlung, no formula book, no photographic rendering or watermark.
```

## Cone (first candidate)

```text
Use case: scientific-educational. Asset type: square PNG learning-goal illustration for German SkillPilot upper-secondary mathematics, readable at 360 CSS px. Friendly warm abstract cartoon/hand-drawn style, opaque pale cream/sky-blue background, not photorealism. Show a large orange right circular CONE next to a pale-blue transparent right circular CYLINDER with exactly the SAME circular base radius r=3 cm and the SAME PERPENDICULAR height h=12 cm. For the cone, show a dashed vertical line from apex to center of base with a small right-angle mark at the base, and put 'h = 12 cm' beside this vertical line; NEVER put h on slanted outline or slant height. On both bases show r from center to edge, not across full diameter. Header exactly 'Kegel und Zylinder'. Below show three large clean equation/result cards with exact mathematically correct text: 'G = πr² = 9π cm²', 'Zylinder: V = 108π cm³', and 'Kegel: V = ⅓ · G · h = 36π cm³'. Between the last two cards or visually between the solids a prominent relationship 'Kegel = ⅓ Zylinder' clearly referring to volume under the same base and perpendicular height. Do not suggest 3 congruent cones literally tile a cylinder. All German text exact, no extra numbers, no approximation, no formula book or 'Formelsammlung', no watermark. Strong mobile legibility, geometry more prominent than text.
```

## Sphere (initial candidate)

```text
Use case: scientific-educational. Asset type: square PNG learning-goal image for German SkillPilot Oberstufe mathematics, visible at 360 CSS pixels. Friendly abstract clean cartoon with warm pastel orange and sky blue, opaque pale background, not photorealistic. Goal: Kugelvolumen aus dem RADIUS bestimmen und understand cubic dependence. Show one orange FULL solid sphere with a visible black dot at its true center and a single straight radius arrow from center to sphere surface labeled 'r = 3 cm' (not a diameter). Next to it show a blue second full sphere whose diameter is visibly EXACTLY TWICE the first sphere diameter, with center-to-surface radius 'r = 6 cm'. Place a simple 'Radius × 2' arrow between spheres and a separate 'Volumen × 8' comparison beneath them; do not show a misleading two-dimensional area-only relationship. Header exactly 'Kugelvolumen wächst kubisch'. Bottom two large high-contrast equation cards, exact text 'V = ⁴⁄₃ πr³' and 'r = 3 cm → V = 36π cm³'. Also include one small but readable bottom note exactly 'r = 6 cm → 288π cm³'. All calculations are exact: at r=3, 4/3·π·27=36π, at r=6, 4/3·π·216=288π, factor 8. No formula collection or book, no other numbers, no gibberish, no tiny filler labels, no watermark. Keep educational accuracy and warm comic feel.
```

## Sphere (scale correction, final candidate)

```text
Use case: precise-object-edit. Correct the geometric scale in this square sphere-volume comic while preserving all existing German words and formulas exactly. The blue sphere's drawn diameter is about 520 px and represents r=6 cm; the orange sphere represents r=3 cm and MUST have exactly HALF that drawn diameter, about 260 px (currently it is too large at about 340 px). Shrink only the complete orange sphere, its dashed equator, and its black center-to-surface radius arrow together so orange diameter becomes visually half blue diameter. Keep orange sphere centered near x=235, y=470, preserve its r=3 cm label close to the shortened radius arrow and keep its supporting shadow under it. The blue sphere, its r=6 cm label and radius arrow, orange 'Radius × 2' arrow, 'Volumen × 8' arrows and all equation cards remain otherwise unchanged. Result should show a true 1:2 diameter/radius visual comparison, not a merely slightly larger blue sphere. Preserve opaque pale background, friendly abstract comic style, high phone legibility; no photorealism, no watermark.
```
