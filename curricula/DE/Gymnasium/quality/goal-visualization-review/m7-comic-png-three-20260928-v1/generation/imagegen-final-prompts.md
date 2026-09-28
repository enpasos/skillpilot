# Imagegen prompts for the three selected PNG candidates

Tool: built-in `image_gen.imagegen` (reported only as ChatGPT/Codex built-in image generation; no model name was exposed). Paths below are the actual tool outputs. All references contain only public curriculum material. This is an internal prompt receipt, not a quality approval.

## Mean c1c80b80

Selected output: `/home/enpasos/.codex/generated_images/01a0e7b0-a428-7ad1-abed-04d1c0387935/exec-b0481879-66cf-4673-b7f5-a786b2119b72.png`

Initial input: `tmp/m7-20260928-continuation/c1c80b80-733f-599d-a2fc-f4dc50eabde2-reference.png` rendered from the temporary exact diagram and inspected before editing.

Initial prompt:

> Use case: scientific-educational. Asset type: final PNG learning-goal illustration for German Gymnasium mathematics. Edit target: the attached mathematically exact two-panel stock/mean diagram. Give it a warm, friendly, lightly comic-like classroom-illustration finish with approachable colors and clear lettering, while preserving the entire mathematical construction, scale, text, and placement. Critical invariant: the left curve is B(t)=10+t² for 0≤t≤3; it passes exactly through (0,10), (1,11), (2,14), (3,19), and its tangent at t=0 is HORIZONTAL (slope zero). The blue area under the curve and the orange 13 L by 3 min rectangle each represent 39 L·min at the same scales. Preserve correct German labels, numbers, units and equations; preserve the readable integral and mean notation. No altered numbers, no extra marks, no photorealism, no sterile engineering blueprint, no watermark. Make the output a polished raster PNG.

This produced `exec-fe30d82a-1e35-462e-9a55-9e0cc088abeb.png`. Its green note falsely equated the area under a stock graph with `Gesamtbestand`; the candidate was rejected for that defect.

First correction prompt on that rejected output:

> Use case: precise-object-edit. Asset type: final PNG mathematics classroom illustration. Remove ONLY the pale green sticky note at bottom left and all its text/rays; fill that local area with the existing plain warm off-white background. Preserve all other pixels and mathematical content as closely as possible: the exact two panels, blue curve with horizontal tangent at t=0, (0,10),(1,11),(2,14),(3,19), orange height 13 L rectangle, all axes, labels, central equality, bottom formula box, speech bubbles and cartoon learner. Do not rewrite any existing text, change geometry, change numbers, add objects or add a watermark.

This produced `exec-0f5f6976-4bb2-4ea0-83d6-6746e820c194.png`. Its left speech bubble falsely suggested the stock is constant initially; that candidate was rejected.

Final correction prompt on the latter output:

> Use case: precise-object-edit. Asset type: final PNG math illustration. Remove ONLY the blue speech bubble at upper left that says 'Zu Beginn ist der Bestand zunächst konstant (waagrechte Tangente).' and its curved pointer arrow. Replace that local area with the existing white background and visible thin chart grid as appropriate. Preserve the graph underneath: B(t)=10+t², blue curve with truly horizontal tangent at t=0, points 10 L, 11 L, 14 L, 19 L. Preserve all other text, math, layout, orange 13 L rectangle, bottom formula box, and cartoon figure unchanged. Do not alter any values or add anything.

The selected final output was independently inspected and accepted for the current goal; this is AI-only review.

## Vector addition/subtraction c63bbffd

Selected output: `/home/enpasos/.codex/generated_images/01a0e7b0-a428-7ad1-abed-04d1c0387935/exec-d9751e2b-196d-4e70-a82f-61a1637be6e0.png`

Input: `tmp/m7-20260928-continuation/c63bbffd-8d1c-5fe2-a428-db194e6fe592-reference.png` rendered from the temporary exact diagram and inspected before editing.

Prompt:

> Use case: scientific-educational. Asset type: final PNG for German Gymnasium mathematics. Edit target: attached exact two-panel vector addition/subtraction diagram. Redesign the visual finish as friendly, abstract, lightly comic-like classroom art with clean colored arrows and readable handwritten-style labels, while preserving the mathematics and two-panel layout exactly. LEFT: vector a=(2,1) blue from origin; vector b=(-1,2) green translated to the head of a; resultant a+b=(1,3) purple from origin. RIGHT: a=(2,1) blue; -b=(1,-2) orange translated to a's head; resultant a-b=(3,-1) purple from origin. Preserve visible head-to-tail directions and the exact two arithmetic lines '(2, 1) + (−1, 2) = (1, 3)' and '(2, 1) − (−1, 2) = (3, −1)'. The final line should read '(2, 1, 1) + (−1, 2, 3) = (1, 3, 4)'. Avoid any other formulas or extra arrows. No photorealism, no sterile technical blueprint, no watermark. Export polished raster PNG.

The selected output was independently inspected and accepted for the current goal; this is AI-only review.

## Scalar multiplication 571793bd

Current proposed output: `/home/enpasos/.codex/generated_images/01a0e7b0-a428-7ad1-abed-04d1c0387935/exec-ede41248-f5e1-4801-8257-bd837475d322.png` (final independent background/hash review pending when this receipt was written).

First grid-based variants were rejected because the green arrow did not originate at `(0,0)`, or its labeled `(4,2)` endpoint missed the x=4 gridline; `(1,0,5)` was ambiguous with German decimal comma. The final design uses separate cards without a grid so lengths and directions can be assessed directly.

Initial four-card prompt:

> Use case: scientific-educational. Asset type: friendly comic-like raster PNG for German Gymnasium mathematics, no photorealism. Design a clean FOUR-CARD educational illustration titled 'Vektor · Zahl'. Each card has its OWN small coordinate grid and an origin O, so arrows never overlap. Card 1: blue arrow from O(0,0) to (2,1), label 'a = (2, 1)'. Card 2: green arrow from O(0,0) to (4,2), label '2a = (4, 2)'. Card 3: purple arrow from O(0,0) to (1,0.5), label '½a = (1, 0,5)'. Card 4: orange arrow from O(0,0) to (−2,−1), label '−a = (−2, −1)'. Each grid must show accurate axes and the arrow from its own origin to the labeled endpoint, visibly longer/shorter/opposite as stated. Below the cards, include exactly one correct 3D example: '−2 · (2, 1, 3) = (−4, −2, −6)'. Warm white background, rounded colored card frames, charming but restrained classroom-comic style, very large legible German labels. No extra math claims, no person, no extra arrows, no watermark. PNG output.

That grid-based output `exec-86fc8522-9017-41f4-857d-0f76ff74f4e3.png` was rejected on review.

Gridless prompt:

> Use case: scientific-educational. Asset type: final friendly comic-style PNG for a German mathematics learning goal about multiplying a vector by a number. Design four horizontal cards on a warm white background, each with just a dot marked O and ONE arrow, with NO coordinate grids or axes: blue a points up-right to its endpoint and is medium length; green 2a points in exactly the SAME direction and is exactly twice as long; purple ½a points in exactly the same direction and is half as long; orange −a points down-left in exactly the opposite direction and is equal to blue a in length. The four arrows must be geometrically consistent by visible direction and relative length. Put these exact German labels in large clear lettering: 'a = (2; 1)', '2a = (4; 2)', '½a = (1; 0,5)', '−a = (−2; −1)'. Use semicolon between 2D coordinates so the decimal comma is unambiguous. Under the cards put exactly '−2 · (2; 1; 3) = (−4; −2; −6)'. Friendly colored rounded cards, light hand-drawn classroom illustration, clear and restrained. No speech bubbles, no coordinate grid, no additional equations, no photorealism, no watermark. Output PNG.

This produced `exec-0a7b0c86-fe3f-4e82-bb1f-437ea8e01d0f.png`; arrow lengths were not sufficiently proportional.

Arrow correction prompt:

> Use case: precise-object-edit. Edit this four-card vector illustration. Mathematical correction ONLY: keep all card sizes, labels, formula, colors and layout exactly as they are, but adjust arrow lengths so the green arrow 2a is exactly TWICE the blue a arrow length, purple ½a is exactly HALF the blue a arrow length, and orange −a is exactly the SAME length as blue a while pointing 180 degrees opposite. All arrow tails remain at their card's O dot. The blue arrow may be shortened within its card to make exact ratios fit. All four positive arrows must have the same slope up-right, and orange the exact opposite slope down-left. Do not alter any text or add axes. Keep warm friendly PNG style.

This produced `exec-b0f61596-bdcc-43eb-b100-30d9ba78e47a.png`, independently accepted for schematic geometry with ratios approximately `1 : 2.03 : 0.51 : 1.00`, but rejected technically because its exterior background was opaque black.

Final background correction prompt:

> Use case: precise-object-edit. Final PNG classroom math illustration. Replace ONLY the solid black outside background around and between the four colored cards and the bottom equation card with a clean warm off-white background (#fffdf8), matching the existing SkillPilot learning illustrations. Clean up the tiny white/yellow edge fringes caused by the black background. Preserve card borders, all text and symbols exactly, and preserve all four colored arrows' exact geometry, directions and relative lengths (blue : green : purple : orange = 1 : 2 : 0.5 : 1). Do not redraw or move the arrows or change any formula. No extra decorations, no watermark. Produce an opaque RGB PNG with warm off-white background.
