# Tatsächlicher Provider-Prompt: Versuch 3

Provider/Werkzeug: eingebautes OpenAI/Codex-Bildwerkzeug. Eine genaue Modellvariante wurde nicht offengelegt. Eingabe: archiviertes HOLD-JPG als Stilreferenz; 944dd479-geometry-reference.png als Geometrie-Referenz. Der folgende Text wurde als Prompt unverändert an das Werkzeug übergeben; technische Ziel-IDs standen nur in den lokalen Dateinamen, nicht im Prompt.

```text
Use case: scientific-educational
Asset type: final-friendly German upper-secondary mathematics goal illustration, landscape PNG raster.
Input image 1 is a rejected old image: use ONLY its warm comic palette and approachable mood, never its axes or geometry.
Input image 2 is an exact eight-vertex GEOMETRY reference sketch: use its left-hand 3D construction literally (vertex locations and edge directions), but redraw it in a polished friendly comic style. Do NOT copy its reference heading, instructional note, "/ x" shorthand, giant arrowheads, or blank right side.
Primary request: one clear transparent pale-yellow parallelepiped ("Spat") with three straight colored arrows from a single O. Red a=(2,0,0) exactly along x down-right; green b=(0,3,0) exactly along y down-left; blue c=(0,0,4) exactly along z upward. Each of the 12 Spat edges follows one of the THREE parallel edge families from Image 2. The four vertical edges all have the SAME length; the top face is the EXACT upward translation of the lower face. No bent vector, no swapped axis label, no 2D right-angle marks. Colored arrows should have neat modest arrowheads and line up with the corresponding edges. Label the x, y, z directions plainly and separately without crowding O.
Layout: large diagram on left, four very large clean formula cards on right; plenty of white space. At 360 pixels wide, the diagram and first/last formula cards must remain understandable. Minimal title "Spatprodukt" above. Use exactly these math statements with precise arrow accents, clear scalar dot and cross sign:
"[a⃗,b⃗,c⃗] = a⃗·(b⃗×c⃗)"
"b⃗×c⃗ = (12,0,0)"
"[a⃗,b⃗,c⃗] = +24"
"V = |[a⃗,b⃗,c⃗]| = 24"
The plus sign indicates chosen orientation; the bars indicate volume. Do not write signed volume as the general volume rule. Use true German spelling, no extra sentences, no additional calculations.
Style: friendly abstract clear comic-like educational visual with warm color coding, bold dark lettering, clean white background. No sterile blueprint look, no decorative hand, no logos, watermark, technical IDs, or source-reference text. Output only the new raster PNG.
```
