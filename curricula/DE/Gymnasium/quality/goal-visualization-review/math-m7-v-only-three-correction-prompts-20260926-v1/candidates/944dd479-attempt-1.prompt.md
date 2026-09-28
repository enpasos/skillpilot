# Tatsächlicher Provider-Prompt: Versuch 1

Provider/Werkzeug: eingebautes OpenAI/Codex-Bildwerkzeug. Eine genaue Modellvariante wurde nicht offengelegt. Eingabe: archiviertes HOLD-JPG als Farb- und Stilreferenz. Der folgende Text wurde als Prompt unverändert an das Werkzeug übergeben; technische Ziel-IDs standen nur in den lokalen Dateinamen, nicht im Prompt.

```text
Use case: scientific-educational
Asset type: compact German Gymnasium mathematics goal visualization, landscape PNG raster infographic.
Input image 1 role: style and palette reference ONLY. It is a rejected HOLD image. Rebuild all geometry and lettering; never copy its axes, vector paths, or content layout.
Primary request: Erzeuge eine fachlich korrigierte, freundliche, abstrakte und klare comicartige Infografik über das Spatprodukt.
Scene/backdrop: white airy field, one transparent pale-yellow parallelepiped, a single spatial coordinate system from O; no visual clutter.
Geometry: Right-handed 3D axes, projected x down-right, y down-left, z straight up. Three straight thick colored vector arrows begin at exactly the same O: RED a=(2,0,0) lies exactly along positive x; GREEN b=(0,3,0) lies exactly along positive y; BLUE c=(0,0,4) lies exactly along positive z. Each axis label is placed on its matching axis at the outer tip; no swapped axis labels. Their three edge families are straight, parallel within each family, and form one coherent transparent parallelepiped. No broken vector line, especially no bent green line. 3D perspective permits oblique projected angles; no 2D right-angle markers.
Composition: large simple geometric scene on left, generous white space, two large formula cards on right. At 360 px total width, geometry and two central equations should still convey the key idea. Keep all text sparse and large. Include only the following text, with mathematically exact vector arrow accents (no alternate calculation):
"Spatprodukt"
"a⃗=(2,0,0)"
"b⃗=(0,3,0)"
"c⃗=(0,0,4)"
"[a⃗,b⃗,c⃗] = a⃗·(b⃗×c⃗)"
"b⃗×c⃗ = (12,0,0)"
"[a⃗,b⃗,c⃗] = +24"
"V = |[a⃗,b⃗,c⃗]| = 24"
Optional short note only if enough space: "Reihenfolge tauschen: Vorzeichen wechselt; Volumen bleibt 24".
Meaning: +24 is the signed orientation for the ordered vectors; absolute value is the volume. Keep cross × and scalar dot · distinct and clear. Do not imply that signed +24 is a general volume formula.
Style: approachable crisp comic infographic, hand-drawn warmth but mathematically straight edges; red/green/blue arrows and pastel transparent yellow Spat; readable dark typography. The diagram is the primary subject; avoid photorealism and sterile chart style.
Avoid: decorative hand, magnifier, extra arrows/axes, extra formulas, incorrect numbers, logos, watermarks, technical IDs. Deliver only the new raster image.
```
