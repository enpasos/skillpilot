# Image generation prompts

## Candidate V1 (rejected)

Use case: scientific-educational.
Asset type: optional square learning-goal visualization for upper-secondary German Gymnasium mathematics.
Input image: Image 1 is style reference only. Match its friendly, abstract, colorful comic-like line art and clear cream/light-blue palette. Do not copy its content or wording.
Primary request: Draw one mathematically accurate coordinate-plane illustration showing that the graphs of f(x)=e^x and g(x)=ln(x) are reflections of each other across the line y=x.
Composition: One large uncluttered square graph with x- and y-axes using the same unit scale, equal aspect ratio and clearly matching tick intervals. Draw y=x as a straight 45-degree diagonal through the origin. Draw the increasing exponential curve y=e^x for all real x: it passes through (0,1), (1,e), and (-1,1/e), stays above the x-axis, and approaches y=0 on the left. Draw the increasing logarithm curve y=ln(x) only for x>0: it passes through (1,0), (e,1), and (1/e,-1), and approaches a vertical asymptote at x=0 from the right. Use three pairs of small matching colored points that are exact coordinate swaps: (0,1) ↔ (1,0), (1,e) ↔ (e,1), (-1,1/e) ↔ (1/e,-1). Use thin dashed perpendicular connectors between swapped point pairs only if they clearly meet the y=x diagonal at their midpoint. Use a faint friendly mirror motif on the diagonal, but never distort the graph geometry.
Text (verbatim, only these labels): “eˣ”, “ln(x)”, “y = x”, “x”, “y”, “1”, “e”, “1/e”, “−1”, “x > 0”.
Constraints: Prioritize correct graph geometry and readable labels over decoration. The axes must have equal spacing; the diagonal is exactly y=x, not a generic slanted line. Keep each curve on its mathematically correct domain and asymptote. Use the same units on both axes so the curves are true reflections. Put eˣ and ln(x) labels on their own curves. Use a warm, approachable comic-illustration style, bold clean lines, sparse color accents, high contrast, no realism and no sterile technical-dashboard appearance. Large labels suitable for mobile viewing.
Avoid: inconsistent axis scale, wrong or extra points, eˣ crossing the x-axis, ln(x) shown at x≤0, a logarithm vertical curve, swapping labels, false numerical annotations, arrows that imply a different mapping, perspective distortion, excessive text, watermark, border frame, photorealism, gradients that hide curves, tiny type.

## Candidate V2 (current candidate, independently rejected)

Use case: scientific-educational.
Asset type: optional square learning-goal visualization for upper-secondary German Gymnasium mathematics.
Input image: Image 1 is only a style reference for friendly, abstract, colorful comic-like line art and a warm cream/light-blue palette. Do not reuse its content.
Primary request: A mathematically precise, uncluttered square coordinate plot showing that the graphs of f(x)=e^x and g(x)=ln(x) are reflections across y=x.
Graph geometry is the priority: use a truly square plotting area with equal aspect ratio, identical units per grid square on the horizontal and vertical axes, and identical tick spacing. The line y=x must be a 45-degree diagonal from bottom-left to top-right. Draw y=e^x as a smooth blue curve for all x, passing through (0,1), rising through (1,e), and approaching the x-axis without touching it to the left. Draw y=ln(x) as a smooth orange curve only for x>0, passing through (1,0) and (e,1), rising slowly, and approaching the y-axis from the right as a vertical asymptote. The two curves must be exact coordinate-swapped mirror images across the diagonal; do not stretch either axis. Mark the swapped pair (0,1) on the blue curve and (1,0) on the orange curve with matching dot colors and one thin dotted connector of slope -1 that crosses y=x at its midpoint.
Composition: The graph occupies almost all the canvas. Use a light square grid, plain x and y axes, and no perspective. Minimal comic accents may appear in small curve badges, but they must not overlap the graph or labels. Keep mobile legibility.
Text (verbatim, only these labels): “eˣ”, “ln(x)”, “y = x”, “x”, “y”, “0”, “1”, “x > 0”.
Constraints: Each grid square represents the same length on both axes. Keep y=x exactly at 45 degrees. Preserve the correct domains and asymptotes. No other marked points, values, arrows, equations, captions, or decorative objects. Friendly hand-inked comic illustration, clear warm colors, bold smooth curves, abstract and approachable rather than realistic or sterile.
Avoid: unequal x/y scale, non-square graph, incorrect reflection, extra or misplaced points, eˣ touching/crossing x-axis, ln(x) drawn for x≤0, a logarithm curve that looks like an exponential, connector that is not perpendicular to y=x, mislabeled axes or curves, tiny text, extra formulas, gradient/glow hiding tick positions, watermark, photorealism, technical dashboard styling.

## Candidate V4 (rejected after visual mathematics review)

Generator: built-in `image_gen__imagegen`; exact image-model identifier unavailable. Input references: V3 as the graph subject and the existing function-machine PNG as a style-only reference. Output: `candidate-v4-square-axes.png`, 1254×1254 PNG, SHA-256 `58d2641737ea7dcd7f3db4f0bdd910ec53b603dc89bb150a29ad511cf534fe49`.

Review: HOLD/reject. The plotting box remains visibly non-square, with x-unit spacing larger than y-unit spacing. The blue point intended as (1,e) is to the right of the x=1 gridline, the orange point intended as (e,1) is left of the e position, and the blue endpoint labelled (ln(4),4) is visibly too far right of x≈1.386. The mirror claim is therefore not visually established. Candidate remains unlinked and is not a V approval.

Exact generation prompt:

```text
Create a corrected new square PNG educational illustration based on the attached drafts. Preserve the friendly, colorful, comic-like visual style of the second reference. The first reference's graph is the subject, but its graph geometry has errors: correct them. This is a mathematically precise graphic, so prioritize exact geometry and legible labels over decoration. Keep a clean warm cream background, navy axes and text, cyan blue f(x)=e^x curve, orange f(x)=ln(x) curve, and grey dashed reflection line y=x. Title in German: “eˣ und ln(x): Spiegelbilder”.

CRITICAL PLOT GEOMETRY: The plot frame itself must be a perfect square, with coordinate window x from -2 to 4 AND y from -2 to 4. Use identical pixel distance for one x-unit and one y-unit. Draw square grid lines for every integer from -2 through 4 in both directions, all equally spaced in pixels. Put x=0 at exactly one third of the frame width from its left edge. Put y=0 at exactly two thirds of the frame height from its top edge. Draw the line y=x as a true 45-degree diagonal from the bottom-left corner (-2,-2) to top-right corner (4,4), not flatter or steeper. Label ticks with -2, -1, 0, 1, 2, 3, 4 as needed; do not distort intervals.

Plot the functions accurately on this same grid. Blue y=e^x passes exactly through (0,1) and (1,e≈2.718), is smooth and strictly increasing, and stops at x=ln(4) where y=4. Orange y=ln(x) is defined only for x>0, passes exactly through (1,0) and (e≈2.718,1), is smooth and increasing, approaches the vertical asymptote x=0 from the right, and ends at (4, ln(4)≈1.386). They must be mirror images across y=x. Mark the four points accurately with small dots and compact labels: blue (0,1), (1,e); orange (1,0), (e,1). Draw the x=0 asymptote as a thin dashed blue vertical line below y=0 if useful, without obscuring the y-axis.

Use a large plot square centered on the canvas, with enough margins for labels. No perspective, no 3D, no perspective grid, no unequal scales, no curved grid, no misplaced points, no invented extra curves, no decorative objects over the plot. Make tick numbers and all labels readable at 360-pixel display size. Output one polished square illustration.
```
