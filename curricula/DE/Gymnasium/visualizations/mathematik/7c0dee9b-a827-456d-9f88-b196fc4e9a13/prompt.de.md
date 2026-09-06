# Lernzielvisualisierung: Sekanten-, Tangenten- und Normalensteigungen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `7c0dee9b-a827-456d-9f88-b196fc4e9a13`
- Titel: Sekanten-, Tangenten- und Normalensteigungen bestimmen
- Beschreibung: Die lernende Person kann Sekanten-, Tangenten- und Normalensteigungen an Funktionsgraphen bestimmen und die berechneten Steigungen fachsprachlich deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro + SkillPilot SVG correction
- Status: pilot
- Quellbild: `7c0dee9b-a827-456d-9f88-b196fc4e9a13.png`
- Public Asset: `/assets/goal-visualizations/mathematik/7c0dee9b-a827-456d-9f88-b196fc4e9a13/7c0dee9b-a827-456d-9f88-b196fc4e9a13.png`

## Prompt

```text
# Importprovenienz der lokalen Bildkorrektur

## Ursprünglicher Providerprompt

Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Sekanten-, Tangenten- und Normalensteigungen bestimmen
Beschreibung: Die lernende Person kann Sekanten-, Tangenten- und Normalensteigungen an Funktionsgraphen bestimmen und die berechneten Steigungen fachsprachlich deuten.

Zusatzanweisung:
Erstelle eine neue, dreigeteilte Illustration an der Funktion f(x)=x² mit einer kleinen separaten Sonderfallkarte.

Pflichtinhalt:
- Panel 1 Sekante: Punkte P₁(0|0) und P₂(1|1), Sekante durch beide Punkte, „mₛ=(1−0)/(1−0)=1“ und Deutung „mittlere Änderungsrate“.
- Panel 2 Tangente und Normale bei P(1|1): Tangente mit „mₜ=f′(1)=2“ deutlich steigend; dazu senkrechte Normale deutlich fallend mit „mₙ=−1/mₜ=−0,5“.
- Markiere am Schnittpunkt einen rechten Winkel zwischen Tangente und Normale.
- Separate Sonderfallkarte: am Scheitel von g(x)=−x² eine waagerechte Tangente mit mₜ=0 und eine senkrechte Normale; Text „Steigung der Normalen nicht definiert“.
- Alle Dezimalzahlen verwenden deutsche Kommas.

Vermeiden:
- Im allgemeinen Fall niemals die Aussage, die Normalensteigung sei nicht definiert.
- Keine gemeinsame Kurve oder Achse für allgemeinen Fall und Sonderfall und keine Division durch null.
- Keine technischen Metadaten, Logos oder Wasserzeichen.

## Exakter lokaler Eingriff und verworfene Versuche

Dieses Dokument dokumentiert den bereits von Root festgelegten lokalen Import. Es ist kein zusätzlicher Provideraufruf und keine neue fachliche, AI- oder Human-Freigabe.

Ausgangspunkt ist das unveränderte ursprüngliche Nano-Banana-Bild; sein archivierter Prompt ist oben vollständig enthalten. Zwei gezielte Nano-Banana-Reparaturversuche wurden von Root verworfen. Die exakten Providerprompts und Bilder sind in provider-attempt-1.de.md, provider-attempt-2.de.md, rejected-attempt-1.jpg und rejected-attempt-2.jpg desselben Qualitätsordners archiviert. Der zweite Versuch (2026-09-06T09-49-51-248Z) enthält laut Root weiterhin ein falsch beschriftetes Δx=2, N(2|0,5) auf der gezeichneten y=0-Linie, inkonsistente Skalen und eine zum Scheitel versetzte Sonderfallnormale.

Der schmale lokale Fallback ersetzt nur die beiden rechten Diagrammregionen und restauriert einen durch die Abdeckung angeschnittenen dekorativen Blasenkreis. Die linke Sekantenhälfte und das übrige Original bleiben als eingebetteter Hintergrund erhalten. Das Hauptdiagramm verwendet im SVG die Koordinatenabbildung X=1135+104x, Y=730−104y. P(1|1) ist (1239,626), H(2|1) ist (1343,626), Q(2|3) ist (1343,418). Tangente y=2x−1, Normale y=−0,5x+1,5 und Parabel f(x)=x² teilen den Berührpunkt P. Das Steigungsdreieck hat Δx=1 und Δy=2. Die Normale und die waagerechte Tangente im kleinen Scheitelbild g(x)=−x² teilen exakt denselben Scheitel. Der senkrechten Normalen wird keine endliche Steigung zugeordnet.

SVG-Quelle: curricula/DE/Gymnasium/quality/goal-visualization-review/math-b037-local-slopes-correction-v1/local-geometry-fallback-v1.svg
Unverändert einzubauender PNG-Kandidat: tmp/math-b037-7c-local-geometry-fallback-v1.png
Kandidat SHA-256: sha256:c8e71e1f620c9330b078a6610dceb90c2ce881aac78b485f86affa1328fe0da6
Die Ausnahme dient der konkreten geometrischen Richtigkeit nach zwei erfolglosen gezielten Providerkorrekturen; sie ist kein neues Bildsystem und keine allgemeine Freigabe für einen Anbieterwechsel.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
