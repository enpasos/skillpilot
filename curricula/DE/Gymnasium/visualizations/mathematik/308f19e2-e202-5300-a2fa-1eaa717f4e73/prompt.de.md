# Exponentielle Lichtdämpfung: mobile Bildprompts

Provider/Tool: integriertes OpenAI/ChatGPT-Codex `image_gen`; Modellkennung nicht offengelegt. Ein älterer Lichtdämpfungsentwurf diente nur als Stil- und Konzeptreferenz. Der nachstehende Basisentwurf wurde anschließend gezielt am rechten Kurvenende editiert; dieses Edit-Ergebnis ist das aktive PNG.

## Neuer mobiler Basisentwurf

> Use case: scientific-educational. Create a NEW, simplified wide landscape PNG for a learner-facing German Jahrgang-10 mathematics goal about a horizontal exponential asymptote. The attached earlier image is a STYLE AND CONCEPT REFERENCE, not a layout template: retain its friendly pale-blue/cream comic aesthetic, clear blue curve and modest light/material motif, but remove the old small-print caption and rebuild the diagram for legibility at only 360 CSS pixels wide.
>
> Make one large white graph card occupying at least 80% of the whole image's width and 70% of its height. Oversized black/narrative formula across the top, typeset EXACTLY `I(d) = 100 · (1/2)^d` with d as a true superscript exponent. This is an idealized percentage of light intensity after traversing d centimetres of material, for d ≥ 0. The right-edge motif is tiny and word-free: one bright beam entering a pale translucent material slab and a visibly thinner/fainter beam leaving it. It must not compete with the graph.
>
> The graph has large clear labels `I (%)` on the upward vertical axis and `d (cm)` on the rightward horizontal axis. Use linear axes. Mark 100 at the y-axis start of a smooth descending, strictly convex-up blue exponential curve. Mark the origin 0. The horizontal axis IS the asymptote I=0. Add one large unobtrusive label `I = 0` near its right end, ABOVE the axis, but not over the blue curve. At the last visible finite d, the blue curve must remain clearly separated from the horizontal axis by at least about 25 pixels at full 1600-pixel image width, enough to remain distinct when downscaled to 360 pixels; no crossing, touching, or coincident drawing. The curve may end around d=4 where the model's value is about 6.25%, leaving a visible gap. The graph should visually show convergence toward zero without falsely showing zero attained.
>
> Keep every text element at least 32 px tall in a ~1600 px original image so it remains readable at 360 px; formula and key axis labels larger. No prose caption, no extra small labels, no "real materials" disclaimer in the image (that belongs in surrounding alt text), no ticks beyond the 100 and 0 essentials, no physical claim that all materials follow this law. No temperature, cup, plant, watermark, logos, private data, or technical IDs. Mathematical geometry, formula spelling and mobile clarity outrank decoration.

## Gezielter Edit des Kurvenendes

> Targeted visual edit of `candidate.png`: keep all existing formulas, text, axes, light/material motif, colours and style unchanged. Change only the rightmost portion of the blue descending exponential curve. It currently almost merges with the horizontal I=0 axis when shown at 360 CSS pixels. End the blue curve a little earlier and visibly HIGHER, with a clear vertical white gap of at least 50 original pixels above the black horizontal axis at the blue endpoint (roughly 10 mobile pixels). Let it still descend smoothly, remain strictly convex upward and suggest continued approach to zero. Do not draw the curve on, touch, or cross the black axis, do not add an arrow, dots, labels, or other marks, and do not alter its start at (0,100). The formula remains exactly `I(d) = 100 · (1/2)^d`.

Das Bild ist ein schematisches Modell für positive Dicke und illustriert nicht das vollständige Verhalten bei negativen Argumenten oder ein allgemeines physikalisches Gesetz.
