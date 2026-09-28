# Kettenlinie: drei Bildkorrekturversuche und V-Pilotfreigabe

Das archivierte Ausgangsbild hat SHA-256
`3a6889e602122105fd46f27a0e91a672e8d2106136a9fe5dac9d5db13f6b5538`.
Die folgenden PNGs wurden mit dem eingebauten OpenAI/Codex-Bildgenerator
als Bearbeitung des jeweils genannten Eingabebilds erzeugt. Eine genaue
Modellvariante wurde vom Werkzeug nicht offengelegt; es wird keine geraten.
Die Kandidaten sind in `candidates/` archiviert. Nur Versuch 3 wurde nach
eigener Prüfung byte-identisch in Kanonik, Web- und Backend-Assets übernommen.
Das historische Ausgangsbild und die beiden HOLDs bleiben unverändert. Die
Erzeugung allein war keine QA-Freigabe.

| Versuch | SHA-256 | Eingabe | Sichtprüfung |
| --- | --- | --- | --- |
| `164921f6-attempt-1.png` | `d3882871114771edb525bab3dfb9a195724425942db4132f0fddfab09f86ac2a` | archiviertes Ausgangsbild | HOLD: beide Fachbegriffe korrigiert, aber lange Erklärsätze und Labels bei 360 px zu klein. |
| `164921f6-attempt-2.png` | `371aa88aba6abbd6884b045482e06e3e3a4e78f76a6df5581e1a50037a9fd12f` | Versuch 1 | HOLD: unteren Fließtext entfernt, doch Bildunterschrift, Aufhängepunkte und cosh-Identität bei 360 px noch zu klein. |
| `164921f6-attempt-3.png` | `7ce5bdfc29df7f57878c70eccf994320dcc65fb5699bb335db058115e41d3980` | Versuch 2 | Unabhängige Sichtprüfung Original und 360-px-Karte: `accepted_pilot`; danach als aktives Bild mit exakter V-QA-Hashbindung importiert. Keine menschliche Freigabe. |

Der aktuelle V-Entscheid steht im separaten Ledger
`mathematik-z-catenary-correction-20260926-v1.md` und im QA-Eintrag für die
Ziel-ID. Die vorbereitende Metadatenhilfe wurde erst nach den drei
Generierungsversuchen ausgeführt; maßgeblich für den Import ist der tatsächlich
verwendete Prompt in `candidates/164921f6-attempt-3.prompt.md`. D- und
P-Nachweise werden dadurch nicht automatisch erneuert.

## Tatsächliche Provider-Prompts

### Versuch 1

```text
Use case: text-localization. Asset type: an existing German upper-secondary mathematics goal illustration, to correct two wrong words. Image 1 is the edit target, not a style reference. Make only TWO text edits in Image 1: replace the complete headline with exactly „Hängende Kette – Kettenlinie als Modell“; replace the complete caption below the pictured chain with exactly „Eine flexible Kette hängt näherungsweise in Form einer Kettenlinie.“. The incorrect word „Katenoide“ must appear nowhere. Preserve all other pixels and content as closely as possible: hanging chain, both supports at equal height, right-side formula y=a·cosh(x/a)+c with a>0, the cosh exponential identity, both axes, red a=1 and blue a=2 curves, point markers and labels (0,1+c) and (0,2+c), bottom explanatory text, colors, positions, scaling, and composition. Do not redraw graphs or alter mathematics. Keep all typography legible at small mobile-card size. Deliver a PNG raster image. No added words, objects, logos, watermark, technical IDs, or photorealism.
```

### Versuch 2

```text
Use case: precise-object-edit. Asset type: a German upper-secondary math learning-card PNG that must be readable at 360 pixels wide. Image 1 is the edit target. Keep the corrected title exactly „Hängende Kette – Kettenlinie als Modell“ and the corrected caption exactly „Eine flexible Kette hängt näherungsweise in Form einer Kettenlinie.“; no „Katenoide“. Remove only the TWO long bullet paragraphs at the very bottom, leaving clean white space. Use the freed space and careful layout adjustment to increase the font size of the essential mathematical labels by about 50%: the y=a·cosh(x/a)+c formula, cosh(u)=(e^u+e^(−u))/2 identity, a=1 (red), a=2 (blue), (0,1+c) red minimum, and (0,2+c) blue minimum. Keep these labels separated and fully readable on a small card. Preserve the actual math and diagram geometry: equal-height chain supports, a hanging catenary rather than parabola; y-axis symmetry; red a=1 is steeper with lower minimum (0,1+c); blue a=2 is flatter with higher minimum (0,2+c); correct color-to-curve association. Preserve approachable clean illustration and white background, no new objects or text. No photorealism, logos, watermark, or technical IDs. Output a PNG.
```

### Versuch 3

```text
Use case: precise-object-edit. Image 1 is the edit target: a German educational PNG viewed as a 360-pixel-wide phone card. Make the picture less text-heavy WITHOUT changing its math or graph. Replace the two-line caption below the chain with exactly ONE large word, „Kettenlinie“, in bold dark-blue type at least as large as the red 'a=1' label. Remove the small two-line text „Aufhängepunkte auf gleicher Höhe“ above the dashed line entirely; the equal-height suspension remains clearly visible through the two hooks and dashed horizontal line. Enlarge the cosh identity in its box enough to read when the entire image is only 360 pixels wide, while retaining exactly cosh(u)=(e^u+e^(−u))/2. Keep the headline exactly „Hängende Kette – Kettenlinie als Modell“. Preserve everything else: the upper formula y=a·cosh(x/a)+c, a>0, chain curve, equal-height supports, coordinate axes, two y-axis-symmetric curves, red a=1 lower minimum (0,1+c), blue a=2 higher/flatter minimum (0,2+c), colors and geometry. There must be no bottom explanatory paragraphs, no 'Katenoide', no new text or objects. The word Kettenlinie in headline and below chain must both be clearly readable at 360 pixels width. Do not introduce photorealism, watermarks, logos, or technical IDs. Output PNG.
```
