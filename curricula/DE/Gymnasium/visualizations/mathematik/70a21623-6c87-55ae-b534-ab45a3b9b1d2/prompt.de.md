# Lernzielvisualisierung: Konvergenzgeschwindigkeit numerischer Verfahren vergleichen

## SkillPilot-Ziel

- SkillPilot-ID: `70a21623-6c87-55ae-b534-ab45a3b9b1d2`
- Titel: Konvergenzgeschwindigkeit numerischer Verfahren vergleichen
- Beschreibung: Die lernende Person kann Bisektionsverfahren, Newton-Verfahren und Regula falsi hinsichtlich Konvergenzgeschwindigkeit, Rechenaufwand und Voraussetzungen an Beispielen vergleichen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `70a21623-6c87-55ae-b534-ab45a3b9b1d2.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/70a21623-6c87-55ae-b534-ab45a3b9b1d2/70a21623-6c87-55ae-b534-ab45a3b9b1d2.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Konvergenzgeschwindigkeit numerischer Verfahren vergleichen
Beschreibung: Die lernende Person kann Bisektionsverfahren, Newton-Verfahren und Regula falsi hinsichtlich Konvergenzgeschwindigkeit, Rechenaufwand und Voraussetzungen an Beispielen vergleichen.

Zusatzanweisung:
Pflichtinhalt:
- Erzeuge eine neue, tabellenbasierte Vergleichsinfografik für `f(x)=x²−2` und die Nullstelle `√2`.
- Bisektion mit Startintervall `[1;2]`: `[1;2] → [1;1,5] → [1,25;1,5]`; Voraussetzung Vorzeichenwechsel; robust, aber linear und eher langsam.
- Regula falsi: erste Näherungen `1,333…` und `1,4`; Voraussetzung Vorzeichenwechsel; meist schneller, kann einseitig stagnieren.
- Newton mit `x₀=1,5`: `x₁≈1,4167`, `x₂≈1,4142`; benötigt Ableitung und geeigneten Startwert; nahe der Nullstelle sehr schnell.
- Vergleiche Rechenaufwand, Voraussetzung, Tempo und Risiko in klaren Zeilen.

Vermeiden:
- Keine komplexen Iterationsgraphen mit mehrfach oder falsch beschrifteten Punkten.
- Keine Gleichsetzung von Tempo und garantierter Sicherheit.
- Keine Dezimalpunkte.

Korrekturhinweis: Beschreibe Regula falsi als `meist schneller als Bisektion, aber weiterhin typischerweise linear`. Schreibe niemals `schneller als linear`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
