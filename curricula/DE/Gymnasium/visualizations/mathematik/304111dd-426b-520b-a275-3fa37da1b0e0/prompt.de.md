# Lernzielvisualisierung: Matrizen multiplizieren

## SkillPilot-Ziel

- SkillPilot-ID: `304111dd-426b-520b-a275-3fa37da1b0e0`
- Titel: Matrizen multiplizieren
- Beschreibung: Die lernende Person kann Matrizenprodukte berechnen, Dimensionsbedingungen prüfen und typische Fehlerquellen bei der Reihenfolge vermeiden.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `304111dd-426b-520b-a275-3fa37da1b0e0.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/304111dd-426b-520b-a275-3fa37da1b0e0/304111dd-426b-520b-a275-3fa37da1b0e0.jpg`

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

Titel: Matrizen multiplizieren
Beschreibung: Die lernende Person kann Matrizenprodukte berechnen, Dimensionsbedingungen prüfen und typische Fehlerquellen bei der Reihenfolge vermeiden.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Matrizenprodukt berechnen und Dimensionsbedingung pruefen.
- Verwende exakt:
  A = [ [1, 2, 0],
        [3, 1, 2] ].
  B = [ [2, 1],
        [0, 3],
        [4, 2] ].
- Zeige:
  A ist 2x3, B ist 3x2, also ist A*B definiert und das Ergebnis ist 2x2.
- Rechne exakt:
  c11 = 1*2 + 2*0 + 0*4 = 2.
  c12 = 1*1 + 2*3 + 0*2 = 7.
  c21 = 3*2 + 1*0 + 2*4 = 14.
  c22 = 3*1 + 1*3 + 2*2 = 10.
  A*B = [ [2, 7],
          [14, 10] ].
- Visualisiere:
  Zeile mal Spalte, etwa mit einer farbigen Markierung fuer c12.

Vermeiden:
- Keine eintragsweise Multiplikation zeigen.
- Nicht behaupten, dass das Ergebnis 2x3 oder 3x2 ist.
- Nicht B*A berechnen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
