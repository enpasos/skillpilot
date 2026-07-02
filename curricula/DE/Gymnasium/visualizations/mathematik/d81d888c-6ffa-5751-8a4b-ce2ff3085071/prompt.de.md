# Lernzielvisualisierung: Punkte im Raum mit Koordinaten beschreiben

## SkillPilot-Ziel

- SkillPilot-ID: `d81d888c-6ffa-5751-8a4b-ce2ff3085071`
- Titel: Punkte im Raum mit Koordinaten beschreiben
- Beschreibung: Die lernende Person kann Punkte im Raum mithilfe von Koordinaten fachsprachlich beschreiben und in Darstellungen verorten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `d81d888c-6ffa-5751-8a4b-ce2ff3085071.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/d81d888c-6ffa-5751-8a4b-ce2ff3085071/d81d888c-6ffa-5751-8a4b-ce2ff3085071.jpg`

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

Titel: Punkte im Raum mit Koordinaten beschreiben
Beschreibung: Die lernende Person kann Punkte im Raum mithilfe von Koordinaten fachsprachlich beschreiben und in Darstellungen verorten.

Zusatzanweisung:
Pflichtinhalt:

Show how a point in 3D is described by coordinates. Use a table-first explanation, not a perspective construction.
Use the title exactly once: `Punkte im Raum mit Koordinaten beschreiben`.
Use exactly this example:
- point: `P(3|2|4)`
- coordinate meaning:
  - `x = 3`: three units in x-direction
  - `y = 2`: two units in y-direction
  - `z = 4`: four units upward
- optional floor projection: `Q(3|2|0)`

Use a clean layout with:
- a large coordinate triple `P(3|2|4)`
- three color-coded cards: `x=3`, `y=2`, `z=4`
- a table explaining that coordinates are read in the order `(x|y|z)`

The table must have exactly these meaning rows:
- `x-Koordinate` | `x` | `3 (rot)`
- `y-Koordinate` | `y` | `2 (blau)`
- `z-Koordinate` | `z` | `4 (grün)`

If there is a row for reading order, its value must be exactly `3|2|4`, not a single coordinate value.

Do not use a coordinate-axis sketch in this version. Do not show `Q(3|2|0)` unless it is only in a table row, not as a plotted point.

Vermeiden:

Do not draw a full cuboid.
Do not draw coordinate axes.
Do not add extra named points besides optional table row `Q(3|2|0)`.
Do not swap coordinate order; always use `(x|y|z)`.
Do not label the point as `(2|3|4)`, `(3|4|2)`, or `(4|2|3)`.
Do not put `4 (grün)` or any single coordinate value into the reading-order row.
Do not repeat any word in the title; especially do not write `beschreiben beschreiben`.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
Do not add arrows or leader lines.
Do not draw a line segment unless its endpoints are exactly the intended points.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
