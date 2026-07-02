# Lernzielvisualisierung: Räumliche Objekte im Koordinatensystem verorten

## SkillPilot-Ziel

- SkillPilot-ID: `aae119f2-925f-5fc1-b795-b52c9e980863`
- Titel: Räumliche Objekte im Koordinatensystem verorten
- Beschreibung: Die lernende Person kann räumliche Objekte im dreidimensionalen Koordinatensystem verorten und geeignete Koordinatenbezüge wählen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `aae119f2-925f-5fc1-b795-b52c9e980863.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/aae119f2-925f-5fc1-b795-b52c9e980863/aae119f2-925f-5fc1-b795-b52c9e980863.jpg`

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

Titel: Räumliche Objekte im Koordinatensystem verorten
Beschreibung: Die lernende Person kann räumliche Objekte im dreidimensionalen Koordinatensystem verorten und geeignete Koordinatenbezüge wählen.

Zusatzanweisung:
Pflichtinhalt:

Show how a rectangular box can be located in a three-dimensional coordinate system using coordinates, but do not draw a 3D coordinate system or a cuboid sketch.
Use a table-first infographic with no geometric arrows.

Use exactly this rectangular box:
- length in x-direction: `4`
- depth in y-direction: `3`
- height in z-direction: `2`

Use exactly these vertex coordinates:
- `A(0|0|0)`
- `B(4|0|0)`
- `C(4|3|0)`
- `D(0|3|0)`
- `E(0|0|2)`
- `F(4|0|2)`
- `G(4|3|2)`
- `H(0|3|2)`

Main table:
- columns `Punkt`, `x`, `y`, `z`, `Bedeutung`
- include all eight rows `A` through `H`
- for `A`: `0 | 0 | 0 | Ursprung`
- for `B`: `4 | 0 | 0 | 4 in x`
- for `D`: `0 | 3 | 0 | 3 in y`
- for `E`: `0 | 0 | 2 | 2 in z`
- for the other points, use their coordinate sums, for example `G: 4 | 3 | 2 | x+y+z`

Add a small rule card:
- plain text only, no icons
- `x`: rechts/links
- `y`: Tiefe
- `z`: Höhe
- `Koordinaten immer als (x|y|z)`

Add a check card with exactly:
- `B-A=(4|0|0)`
- `D-A=(0|3|0)`
- `E-A=(0|0|2)`

Vermeiden:

Do not draw a 3D coordinate system.
Do not draw axes, axis arrows, grid planes, diagonal x/y/z axes, or arrowheads.
Do not draw a cuboid, cube, prism, wireframe, or any connecting edge between points.
Do not use geometric arrows or leader lines.
Do not use arrow symbols, arrow icons, direction icons, pushpin icons, magnifying-glass icons, or decorative symbols.
Do not use checkmark icons; write the three check expressions as plain text lines.
Do not invent extra points or omit any of `A` through `H`.
Do not swap the order of coordinates; always use `(x|y|z)`.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
