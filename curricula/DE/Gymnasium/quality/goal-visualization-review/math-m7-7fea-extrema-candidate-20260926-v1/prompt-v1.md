# Extremstellen mit Parameter: tatsächliche Bildprompts

The built-in `image_gen.imagegen` tool generated the first raster without an image input. A second call used only that first generated PNG as its edit target. The archived held JPG and two neighbouring mathematics images were inspected for defect and style context; they were not sent to the image provider. The tool did not expose an exact model version, seed, or model-side generation parameters.

## First generation (verbatim)

```text
Use case: scientific-educational
Asset type: landscape PNG illustration for a German upper-secondary mathematics learning goal, legible when reduced to a 360-pixel-wide card.
Primary request: Explain visually how a parameter changes the position of an extremum, using one mathematically exact but simple function family and a derivative-based check.
Scene/backdrop: clean pale blue background, generous whitespace, no photograph.
Style/medium: friendly clear hand-drawn comic infographic, dark navy ink, blue graph curves, restrained orange highlights, soft rounded cards; approachable like a polished classroom illustration, with crisp mathematical strokes.
Composition/framing: wide 16:9 canvas. Large two-line heading at top: "Extremstellen mit Parameter a". Below, three large reading zones left to right: (1) function family and schematic graph, (2) derivative gives candidate, (3) second derivative confirms minimum. Keep every math label big enough to read at 360 px.
Exact mathematics: Show f_a(x)=(x−a)². In the graph, show exactly two identical upward-opening parabolas shifted horizontally only. Their vertices lie exactly on the SAME drawn x-axis (y=0), one left and one right. Do not show numeric ticks or numeric coordinates. Put a short rightward arrow between the vertices labelled "a wächst"; it indicates only the minimum's horizontal position changes. The graph is schematic but must not imply a vertical change of the minimum. For the derivative, show "f′_a(x)=2(x−a)" and below "f′_a(x)=0 ⇒ x=a". For the check, show "f″_a(x)=2>0" and below "Tiefpunkt: T_a=(a|0)" with a simple orange check mark.
Text (verbatim, no other words or formulas): "Extremstellen mit Parameter a"; "f_a(x)=(x−a)²"; "a wächst"; "f′_a(x)=2(x−a)"; "f′_a(x)=0 ⇒ x=a"; "f″_a(x)=2>0"; "Tiefpunkt: T_a=(a|0)".
Constraints: The visual and formulas must agree exactly. Both marked vertices must touch the horizontal x-axis. Draw no table, no numbered parameter values, no point coordinate callouts on the graph, no third curve. Do not draw a vertex below or above the x-axis. Do not confuse a stationary candidate with a confirmed minimum: the positive second derivative is the reason for the conclusion. Straight axis, smooth symmetric parabolas, precise subscripts and primes, German spelling exactly. No decorative mathematical claims, no watermark, no logo, no technical IDs.
```

## Opaque-background edit (verbatim)

```text
Use case: precise-object-edit
Asset type: landscape PNG educational mathematics illustration.
Input image: Image 1 is the edit target.
Primary request: Replace ONLY the fully transparent canvas pixels outside and between the existing title and three cards with a soft solid pale blue background, RGB approximately #DDF1FB. Keep the entire foreground illustration pixel-identical in appearance: every letter, subscript, prime, equation, arrow, card, x/y axis, parabola, vertex, position, color, and layout must remain exactly as in Image 1.
Mathematical invariants: f_a(x)=(x−a)²; f′_a(x)=2(x−a); f′_a(x)=0 ⇒ x=a; f″_a(x)=2>0; Tiefpunkt: T_a=(a|0). The two parabolas remain identical up-opening curves shifted only horizontally, both vertices exactly on the x-axis.
Constraints: Opaque uniform light-blue canvas to all four edges; no transparency, no new text, no retouching of foreground, no crop, no extra icons, no watermark.
```

The edit target was the first generated image, SHA-256 `725178f0b3efd1ddb5c3e1bbcb42957d9428ecd921cedd1e55286ea9de6b4687` (1672 × 941, RGBA). Its transparent background reduced contrast on a dark surface. The edited opaque output is `candidate-v1.png`.
