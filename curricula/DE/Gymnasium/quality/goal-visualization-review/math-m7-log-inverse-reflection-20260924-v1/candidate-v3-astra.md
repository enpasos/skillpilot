# Bildkandidat V3 – Astra

- Goal: `06ce2b1b-e888-5322-9ed9-dfc6d322956a`
- Aktuelles Ziel: „Den natürlichen Logarithmus als Umkehrfunktion der e-Funktion erklären (LK)“.
- Status: **unapproved**, ungebunden. Keine kanonische Übernahme, keine QA-Freigabe. Eine unabhängige Zweitprüfung entscheidet über Gate V.
- Datum: 2026-09-24; Tool-Aufruf nach 05:38:16 UTC.
- Prompt und vorläufige Eigenprüfung: GPT-6-Astra; Bildgenerierung: integriertes `image_gen.imagegen` (`image_gen__imagegen`), genau ein Aufruf. Das tatsächliche Bildmodell wurde vom Tool nicht ausgewiesen.
- Ausgabe: `candidate-v3-astra.png`, PNG, RGB, **1254 × 1254 Pixel**, unveränderte Kopie des Tool-Outputs.
- SHA-256: `4b0efa5b760f34c2d46151768e3dc22edd0b3b9b2e13d9e9d9ab98ed005bc881`.
- Herkunft: `/home/enpasos/.codex/generated_images/01a0d1ea-fe14-7781-b4f7-c6adb9c2548a/exec-0b5002ef-c90b-419d-9570-c30f25e1254b.png`.
- Einzige Bildreferenz, ausschließlich Stil: `curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-four-lk-functions-png-20260924-v1/06ce2b1b-e888-5322-9ed9-dfc6d322956a/candidates/machine-v4-content-and-mobile-pass-unlinked.png`.
- Referenz-SHA-256: `479febd190329bb27e307e30d213fbcafdb222caca99bbc63ed0941184c5d56e`.
- Vorbereitung: `npm --prefix app run visualization:prepare -- 06ce2b1b-e888-5322-9ed9-dfc6d322956a --provider "OpenAI Codex imagegen (built-in)"`. Das erzeugte temporäre Standardpaket wurde nicht als Generationsprompt verwendet; der tatsächlich verwendete Spezialprompt steht vollständig unten.

## Vorab festgelegte Plot-Spezifikation

Ein quadratisches Fenster [-2,4] × [-2,4], ein gemeinsamer identischer Einheitsscale und eine echte 45°-Spiegelgerade y=x. Für die gewünschte 1536²-Ausgabe: Ursprung (600,900), 180 Pixel pro Einheit, Plotgrenzen x=240…1320/y=180…1260. eˣ durch (0,1),(1,e), oben bei (ln4,4) abgeschnitten; ln(x) als exakte Spiegelung durch (1,0),(e,1), unten bei (e⁻²,−2) abgeschnitten. Beide Asymptoten bleiben berührungsfrei. Vier markierte Punkte und nur 0/1/e als numerische Achsenbeschriftung. Diese Spezifikation entstand vor dem Generationsaufruf.

## Vorläufige Eigenprüfung am tatsächlichen Original

Original-PNG mit `view_image(detail="original")` vollständig bei 1254 × 1254 betrachtet. Die Tool-Rückgabe verwendete den MIME-Typ `application/octet-stream`; für die tatsächliche sichtbare Vollbilddarstellung wurde ausschließlich dieser Data-URL-MIME-Typ in `image/png` geändert, ohne Pixel zu verändern.

**Fachliche Bedenken; keine Empfehlung zur Freigabe:**

- Der vorgegebene gemeinsame gleichmäßige Maßstab wurde nicht eingehalten. Sichtbarer Ursprung ungefähr (485,766); x=−1 ungefähr bei306, x=1 bei626: links rund179 px, rechts rund141 px pro beschrifteter Einheit. Auf y liegt1 ungefähr bei634 (rund132 px Abstand). Das sichtbare Plotrechteck ist zudem ungefähr974 ×898 px statt quadratisch.
- Der obere blaue Punkt liegt ungefähr bei (655,395), deutlich rechts von der x=1-Gitterlinie bei626. Damit ist die geforderte Markierung (1,e) geometrisch verfehlt. Der obere orange Punkt bei ungefähr (898,634) steht ebenfalls rechts vom e-Tick bei ungefähr884.
- Die gestrichelte Linie läuft ungefähr von (140,1075) nach (1114,177), also nicht im geforderten 45°-Winkel. Zusammen mit dem uneinheitlichen Achsenmaßstab ist eine geometrisch korrekte Spiegelung nicht nachgewiesen.
- Mehr zusätzliche Zahlenbeschriftungen als bestellt (u. a. −2, −1, 2, 3, 4); die geringe Labelzahl der Vorgabe wurde nicht eingehalten.
- Positiv beobachtet: freundlicher Creme/Cyan/Orange-Stil, lesbarer Titel und korrekte Definitionsbereichs-Badges; Achsenschnittpunkte (0,1)/(1,0) plausibel, Kurven monoton und im sichtbaren Bereich passend gekrümmt. Keine sichtbare Kreuzung der asymptotischen Achsen durch die Kurven. Diese positiven Befunde beheben die geometrischen Fehler nicht.

Pixelkoordinaten sind visuelle Näherungen, keine subpixelgenaue Messung. Keine unabhängige Prüfung, keine mobile QA und keine Gate-V-Freigabe behauptet. V1/V2 wurden weder verändert noch als Generationsreferenz eingesetzt.

## Exakter verwendeter Prompt

Toolargumente: `prompt` = nachstehender unveränderter Text; `referenced_image_paths` = ausschließlich der oben genannte absolute Stilreferenzpfad; kein `num_last_images_to_include`.

```text
Use case: scientific-educational.
Create exactly ONE new square PNG educational illustration for German upper-secondary mathematics about the natural logarithm as the inverse of the exponential function. The provided reference image is STYLE REFERENCE ONLY: borrow its warm cream background, friendly rounded navy lettering, clear cyan/orange palette and approachable illustrated finish. Do not reproduce its machines, arrows, layout, examples, or text. This new image must be a precise coordinate plot.

Composition: square canvas, preferably 1536 × 1536. Large central square coordinate plot, generous clear margins. Title above, two small domain badges below. No characters or machinery. Tiny friendly rounded accent strokes may sit outside the plot. All mathematical geometry must stay precise, smooth, uncluttered, and flat, without perspective or hand-drawn distortion.

EXACT GEOMETRIC SPECIFICATION (coordinates below are construction instructions, NOT text to print):
Use ONE common Cartesian plane with equal physical lengths for one unit on x and y. Both displayed coordinate ranges are -2 to 4. At 1536 × 1536, plot square spans pixel x=240 to1320 and pixel y=180 to1260. Origin is pixel (600,900). Unit length exactly180 pixels. Pixel map: (X,Y)=(600+180*x,900-180*y). If you choose a different square image resolution, scale ALL these pixel positions uniformly. Preserve the exact square shape and equal axis scale.
Draw thin neutral navy horizontal and vertical axes through the origin; arrowheads only at their positive ends; label x and y. Very faint square grid at integer coordinate spacing; no dense minor grid.
Draw the straight neutral-gray dashed mirror line y=x from bottom-left (-2,-2) to top-right (4,4), a true 45-degree diagonal through the origin. Label it once "y = x" in an empty part near its top-right, without touching curves.

Draw cyan y=e^x as a smooth strictly increasing, strictly convex curve above the x-axis for ALL x. Exact visible endpoints (-2,0.135335) and (1.386294,4), clipped cleanly to the plot boundary. Anchor values: (-1,0.367879), (0,1), (0.5,1.648721), (1,2.718282). In specified pixel coordinates these include (240,875.64), (420,833.78), (600,720), (690,603.23), (780,410.71), (849.53,180). The left tail tends to y=0 from ABOVE and never touches or crosses the x-axis. Curve thickness about 7 pixels, so the 24-pixel gap between the left endpoint and x-axis remains clearly visible. Add a cyan filled point at (0,1) and another at (1,e). Label the curve once "eˣ" in cyan nearby in clear blank space.

Draw orange y=ln(x) as the EXACT reflection of that cyan curve across y=x. Defined ONLY for x>0. Smooth strictly increasing, strictly concave curve. Exact visible endpoints (0.135335,-2) and (4,1.386294), clipped cleanly to the plot boundary. Anchor values: (0.367879,-1), (1,0), (1.648721,0.5), (2.718282,1). In specified pixel coordinates these include (624.36,1260), (666.22,1080), (780,900), (896.77,810), (1089.29,720), (1320,650.47). The lower tail tends to x=0 from the RIGHT and never touches or crosses the y-axis. Add an orange filled point at (1,0) and another at (e,1). Label the curve once "ln(x)" in orange nearby in clear blank space.
The two curves MUST visibly be geometric mirror images. They never intersect one another or y=x. The e^x curve stays above y=x; the ln(x) curve stays below y=x.

Sparse labels only: show one shared "0" beside the origin, and tick labels "1" and "e" on EACH axis at their correct positions: x=1 at pixel780 and x=e at1089.29; y=1 at720 and y=e at410.71. All unit grid spacing remains equal; e is 2.7182818, never placed at2 or3. Do not print any other coordinate numbers or point-coordinate labels. The four colored point positions must be inferable from these ticks. The (0,1) dot is ON the vertical axis, the (1,0) dot is ON the horizontal axis; avoid label/dot collisions.

Exact visible title: "eˣ und ln(x): Spiegelbilder"
Exact bottom badge texts: cyan badge "eˣ: x ∈ ℝ" and orange badge "ln(x): x > 0".
Other permitted visible text only: "x", "y", "0", "1", "e", "y = x", "eˣ", "ln(x)" as specified above.
Use legible German-friendly typography, proper superscript x and mathematical ℝ. No extra explanation, coordinate labels, decorative equations, technical IDs, watermark, brand, or invented symbols. Mathematical correctness and reflected geometry take priority over decoration. Warm approachable style, spacious composition, strong mobile readability.
```
