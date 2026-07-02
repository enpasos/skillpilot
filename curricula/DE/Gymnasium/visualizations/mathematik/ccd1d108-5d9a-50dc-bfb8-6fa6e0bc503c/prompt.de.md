# Lernzielvisualisierung: Zusammensetzungen als Matrixprodukt darstellen

## SkillPilot-Ziel

- SkillPilot-ID: `ccd1d108-5d9a-50dc-bfb8-6fa6e0bc503c`
- Titel: Zusammensetzungen als Matrixprodukt darstellen
- Beschreibung: Die lernende Person kann hintereinander ausgeführte lineare Abbildungen als Matrixprodukt in der korrekten Reihenfolge darstellen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `ccd1d108-5d9a-50dc-bfb8-6fa6e0bc503c.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ccd1d108-5d9a-50dc-bfb8-6fa6e0bc503c/ccd1d108-5d9a-50dc-bfb8-6fa6e0bc503c.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Mathematik.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible mathematische Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Zusammensetzungen als Matrixprodukt darstellen
Beschreibung: Die lernende Person kann hintereinander ausgeführte lineare Abbildungen als Matrixprodukt in der korrekten Reihenfolge darstellen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Hintereinander ausgefuehrte lineare Abbildungen als Matrixprodukt in der richtigen Reihenfolge darstellen.
- Verwende Spaltenvektoren und zwei 2D-Matrizen.
- Erste Abbildung: Scherung
  A = [ [1, 1],
        [0, 1] ].
- Zweite Abbildung: Streckung in x-Richtung
  B = [ [2, 0],
        [0, 1] ].
- Zeige deutlich:
  Erst A, dann B bedeutet Gesamtmatrix B*A, nicht A*B.
- Berechne:
  B*A = [ [2, 0],
          [0, 1] ] * [ [1, 1],
                       [0, 1] ]
      = [ [2, 2],
          [0, 1] ].
- Teste mit x = [1; 2]:
  A*x = [3; 2].
  B*(A*x) = [6; 2].
  (B*A)*x = [6; 2].
- Visualisiere als Pfeilkette: x -> A*x -> B(A*x), daneben die Gesamtmatrix.

Vermeiden:
- Nicht die Reihenfolge vertauschen; bei Spaltenvektoren steht die spaeter ausgefuehrte Matrix links.
- Nicht A*B als Gesamtmatrix fuer "erst A, dann B" angeben.
- Nicht mit Zeilenvektoren rechnen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
