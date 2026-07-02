# Lernzielvisualisierung: Punkte und Geraden im räumlichen Koordinatensystem darstellen

## SkillPilot-Ziel

- SkillPilot-ID: `57f6d5e4-7c24-4e70-9cf6-737f01d79914`
- Titel: Punkte und Geraden im räumlichen Koordinatensystem darstellen
- Beschreibung: Die lernende Person kann Punkte und einfache Geraden in einem räumlichen kartesischen Koordinatensystem oder in passenden Schrägbildern darstellen und die Darstellung fachsprachlich erklären.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `57f6d5e4-7c24-4e70-9cf6-737f01d79914.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/57f6d5e4-7c24-4e70-9cf6-737f01d79914/57f6d5e4-7c24-4e70-9cf6-737f01d79914.jpg`

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

Titel: Punkte und Geraden im räumlichen Koordinatensystem darstellen
Beschreibung: Die lernende Person kann Punkte und einfache Geraden in einem räumlichen kartesischen Koordinatensystem oder in passenden Schrägbildern darstellen und die Darstellung fachsprachlich erklären.

Zusatzanweisung:
Pflichtinhalt:

Show points and a line in 3D coordinates with a table-first layout, avoiding ambiguous perspective.

Use exactly:
- point `P(2|3|4)`
- line `g: X = (1|1|0) + t*(2|0|1)`
- two points on the line:
  - for `t=0`: `A(1|1|0)`
  - for `t=1`: `B(3|1|1)`

Use three cards:
- `P(2|3|4)`: `x=2`, `y=3`, `z=4`
- `g`: start point `(1|1|0)`, direction vector `(2|0|1)`
- `Probe`: `B-A = (3-1 | 1-1 | 1-0) = (2|0|1)`

If a sketch is included, make it only a small schematic with labeled points `A` and `B` connected by a straight segment; do not draw full 3D axes.

Vermeiden:

Do not draw a full 3D coordinate system.
Do not place `P(2|3|4)` in a perspective position that contradicts the coordinate table.
Do not draw a z-axis-parallel line; `g` is not z-axis-parallel because its direction vector is `(2|0|1)`.
Do not swap coordinate order; always use `(x|y|z)`.
Do not add arrows or leader lines.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
