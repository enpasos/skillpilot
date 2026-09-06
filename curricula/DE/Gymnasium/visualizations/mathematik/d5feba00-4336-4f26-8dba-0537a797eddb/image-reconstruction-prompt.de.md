# Bildrekonstruktionsprompt: Notwendige und hinreichende Bedingungen für Extrem- und Wendestellen unterscheiden

## SkillPilot-Ziel

- SkillPilot-ID: `d5feba00-4336-4f26-8dba-0537a797eddb`
- Titel: Notwendige und hinreichende Bedingungen für Extrem- und Wendestellen unterscheiden
- Beschreibung: Die lernende Person kann bei Extrem- und Wendestellen zwischen notwendigen und hinreichenden Bedingungen unterscheiden und typische Fehlschlüsse fachlich begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `d5feba00-4336-4f26-8dba-0537a797eddb.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, didaktisches Diagramm im Stil einer Lehrtafel, das in einem 2x2-Raster vier separate Informationsfelder präsentiert. Der obere Bereich des Bildes enthält eine zentrale Überschrift in großer, fetter, schwarzer serifenloser Schrift: "Extrem- und Wendestellen: Notwendige & Hinreichende Bedingungen".

**Oberes linkes Feld: "EXTREMSTELLE: NOTWENDIGE BEDINGUNG"**
Dieses Feld hat eine dunkelblaue Kopfzeile mit weißem Text und einen hellblauen Hintergrund im Inhaltsbereich. Es zeigt ein Koordinatensystem mit einer schwarzen, durchgehenden Kurve, die einen lokalen Hochpunkt aufweist. Die Achsen sind mit "x" und "f(x)" beschriftet und haben schwarze Pfeile. Ein schwarzer Punkt markiert den lokalen Hochpunkt auf der Kurve. Eine gestrichelte vertikale Linie verbindet diesen Punkt mit "x₀" auf der x-Achse. Eine orangefarbene, horizontale Linie ist als Tangente an den Hochpunkt gezeichnet. Ein schwarzer Pfeil zeigt von der Kurve auf die große, fette, schwarze mathematische Gleichung "f'(x₀) = 0", die zentral über dem Diagramm platziert ist. Rechts unten im Feld befindet sich ein kleineres, separates Koordinatensystem mit der schwarzen Kurve der Funktion f(x) = x³, die durch den Ursprung verläuft. Darüber steht "f(x) = x³". Ein großes rotes "X" ist über dem Ursprung platziert. Darunter befindet sich ein Textfeld mit dem schwarzen Text: "Nicht hinreichend (z.B. Sattelpunkt, f(x)=x³ bei x₀=0)".

**Oberes rechtes Feld: "EXTREMSTELLE: HINREICHENDE BEDINGUNG"**
Dieses Feld hat eine dunkelgrüne Kopfzeile mit weißem Text und einen hellgrünen Hintergrund im Inhaltsbereich. Es ist in zwei vertikale Unterabschnitte unterteilt.
Der linke Unterabschnitt zeigt oben ein Koordinatensystem mit einer nach unten geöffneten Parabel (lokales Maximum). Eine gestrichelte vertikale Linie ist bei "x₀" eingezeichnet. Darunter befindet sich eine horizontale Achse, die mit "f'" beschriftet ist. Eine gestrichelte vertikale Linie markiert "x₀" auf dieser Achse. Links von "x₀" steht ein "+" und rechts ein "-". Ein geschwungener schwarzer Pfeil unter der Achse zeigt von links nach rechts unter "x₀" hindurch. Darunter steht der Text: "VZW von f' (+ → -)".
Der rechte Unterabschnitt zeigt oben ein Koordinatensystem mit einer nach oben geöffneten Parabel (lokales Minimum). Eine gestrichelte vertikale Linie ist bei "x₀" eingezeichnet. Darunter befindet sich eine horizontale Achse, die mit "f'" beschriftet ist. Eine gestrichelte vertikale Linie markiert "x₀" auf dieser Achse. Links von "x₀" steht ein "-" und rechts ein "+". Ein geschwungener schwarzer Pfeil unter der Achse zeigt von links nach rechts unter "x₀" hindurch. Darunter steht der Text: "VZW von f' (- → +)".

**Unteres linkes Feld: "WENDESTELLE: NOTWENDIGE BEDINGUNG"**
Dieses Feld hat eine dunkelviolette Kopfzeile mit weißem Text und einen hellvioletten Hintergrund im Inhaltsbereich. Es zeigt ein Koordinatensystem mit einer schwarzen, durchgehenden Kurve, die einen Wendepunkt aufweist. Die Achsen sind mit "x" und "f(x)" beschriftet und haben schwarze Pfeile. Ein schwarzer Punkt markiert den Wendepunkt auf der Kurve. Eine gestrichelte vertikale Linie verbindet diesen Punkt mit "x₀" auf der x-Achse. Ein schwarzer Pfeil zeigt von der Kurve auf die große, fette, schwarze mathematische Gleichung "f''(x₀) = 0", die zentral über dem Diagramm platziert ist. Rechts unten im Feld befindet sich ein kleineres, separates Koordinatensystem mit der schwarzen Kurve der Funktion f(x) = x⁴, die einen Flachpunkt im Ursprung hat. Darüber steht "f(x) = x⁴". Ein großes rotes "X" ist über dem Ursprung platziert. Darunter befindet sich ein Textfeld mit dem schwarzen Text: "Nicht hinreichend (z.B. Flachstelle, f(x)=x⁴ bei x₀=0)".

**Unteres rechtes Feld: "WENDESTELLE: HINREICHENDE BEDINGUNG"**
Dieses Feld hat eine dunkelblaue Kopfzeile mit weißem Text und einen hellblauen Hintergrund im Inhaltsbereich. Es ist in zwei vertikale Unterabschnitte unterteilt.
Der linke Unterabschnitt zeigt oben ein Koordinatensystem mit einer schwarzen Kurve, die von einer Rechtskrümmung zu einer Linkskrümmung übergeht. Ein schwarzer Punkt markiert den Wendepunkt. Eine gestrichelte vertikale Linie ist bei "x₀" eingezeichnet. Darunter befindet sich eine horizontale Achse, die mit "f''" beschriftet ist. Eine gestrichelte vertikale Linie markiert "x₀" auf dieser Achse. Links von "x₀" steht ein "-" und rechts ein "+". Ein geschwungener schwarzer Pfeil unter der Achse zeigt von links nach rechts unter "x₀" hindurch. Darunter steht der Text: "f'' wechselt das Vorzeichen".
Der rechte Unterabschnitt zeigt oben ein Koordinatensystem mit einer schwarzen Kurve, die von einer Linkskrümmung zu einer Rechtskrümmung übergeht. Ein schwarzer Punkt markiert den Wendepunkt. Eine gestrichelte vertikale Linie ist bei "x₀" eingezeichnet. Darunter befindet sich ein Textfeld mit dem schwarzen Text: "ODER: f''(x₀) = 0 und f'''(x₀) ≠ 0".

Der Gesamtstil ist klar, präzise und informativ, mit sauber gezeichneten Graphen und gut lesbaren Beschriftungen und mathematischen Formeln. Die Farben der Felder sind pastellfarben und unterscheiden sich deutlich voneinander.
```
