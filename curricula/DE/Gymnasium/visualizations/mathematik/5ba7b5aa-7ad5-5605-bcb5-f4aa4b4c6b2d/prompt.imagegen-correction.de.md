# Bildkorrektur: Komplexe Zahlen algebraisch dividieren

- Ziel-ID: `5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d`
- Provider: OpenAI / ChatGPT-Codex image generation (built-in image_gen; model not exposed)
- Verfahren: Bildbearbeitung des historischen JPG; finale zweite Variante vereinfacht die Rechendarstellung für schmale Bildschirme
- Historisches JPG: `5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d.jpg`; ursprüngliche Prompt-Provenienz: `prompt.de.md`
- SHA-256 des historischen JPG: `f0afdea61e4021db8042a59f2f915993a59d3dacfe4f752c876dad0fd210cd96`
- Aktuelles PNG: `5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d.png`
- SHA-256 des aktuellen PNG: `94d1cc06ba4ac0492aa54dca1604a1b0254113ed665498fad7de317d8b204f7b`
- Rechte und Prüfung: SkillPilot-kuratiertes didaktisches Medium unter CC-BY-4.0; Herkunft ist allein kein Lizenz- oder Qualitätsnachweis. Menschliche Freigabe wird nicht beansprucht.

Das frühere Bild stellte zwei isolierte Gleichheitszeichen zwischen den Gesamtbruch und getrennte Zähler-/Nenner-Rechnungen. Damit suggerierte es falsche Gleichsetzungen. Das neue PNG hat eine einzige wahre Bruchgleichung, separat beschriftete Zwischenrechnungen und eine mathematisch richtige Ergebniskette. Der erste Korrekturversuch war bei 360 px zu kleinteilig; für das aktuelle PNG wurde eine zweite, vereinfachte Variante gewählt. Der ursprüngliche `prompt.de.md` bleibt als historische Provenienz unverändert.

## Inhaltliche Edit-Anweisung für die finale Variante

```text
Use case: precise-object-edit / scientific-educational. Image 1 is the existing wide German comic infographic about dividing complex numbers; preserve its pale-blue educational style, owl at lower left, frame, and landscape aspect ratio. Repair the mathematical layout and make the calculation readable at mobile width. REMOVE the large standalone equals signs between the main fraction and the separate Zähler/Nenner calculations; never equate a fraction with its numerator or denominator. Use one large valid main equation: (3+2i)/(1−i) = ((3+2i)(1+i))/((1−i)(1+i)). Show two clearly separate labeled notes: Zähler: (3+2i)(1+i) = 1+5i; Nenner: (1−i)(1+i) = 2. Show a large exact result chain: (3+2i)/(1−i) = (1+5i)/2 = 1/2 + (5/2)i. Render fractions with horizontal bars. Keep only the useful conjugate hint (1−i) → (1+i) and i² = −1. Make every numeral, i, sign, exponent, parenthesis, fraction bar and equality exact. Prefer fewer, larger elements to dense expansion text. No standalone equals signs, invented algebra, watermark or unrelated text.
```

Die Anweisung dokumentiert den fachlichen Zielinhalt der zweiten Bearbeitung; der exakte Wortlaut der zweiten Tool-Eingabe wurde nicht separat archiviert. In einer dritten Bearbeitung wurde die deutsche Unterzeile korrigiert; deren exakter Prompt folgt. Das finale Bild wurde in Originalgröße und bei 360 px geprüft. Gleichheitszeichen stehen nur in fachlich wahren Teilgleichungen; die einzelnen Zahlen sind bei 360 px noch erkennbar, kleine Beschreibungstexte deutlich eingeschränkt.

## Exakter Prompt der abschließenden Unterzeilen-Korrektur

```text
Use case: precise-object-edit / text-localization. Image 1 is the exact existing wide German SkillPilot comic infographic 'Komplexe Zahlen algebraisch dividieren'. Preserve the full original composition, owl, colors, all fraction bars, all mathematics, numerator/denominator equations, final result, i² = −1, and conjugate hint exactly. Correct ONLY the ungrammatical subtitle immediately under the large title. Replace it with this exact shorter, idiomatic German sentence in the same subtitle row: 'Ziel: Mit der konjugiert komplexen Zahl erweitern und das Ergebnis als a + bi darstellen.' Do not change title, labels 'Zähler' and 'Nenner', or any numbers or symbols. Keep text and formulas sharp at mobile width; no new decorations or watermark. The mathematical expressions in the input are correct and must not be redrawn incorrectly.
```
