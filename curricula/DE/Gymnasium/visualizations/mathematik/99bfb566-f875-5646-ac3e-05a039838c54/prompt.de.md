# Lernzielvisualisierung: Termmerkmale aus Graphen ableiten

## SkillPilot-Ziel

- SkillPilot-ID: `99bfb566-f875-5646-ac3e-05a039838c54`
- Titel: Termmerkmale aus Graphen ableiten
- Beschreibung: Die lernende Person kann aus einem Graphen zentrale Termmerkmale wie Funktionsfamilie, Parameter, Nullstellen oder Symmetrie ableiten und fachsprachlich formulieren.

## Generator

- Provider: OpenAI GPT Image (built-in imagegen)
- Status: pilot
- Quellbild: `99bfb566-f875-5646-ac3e-05a039838c54.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/99bfb566-f875-5646-ac3e-05a039838c54/99bfb566-f875-5646-ac3e-05a039838c54.jpg`

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

Titel: Termmerkmale aus Graphen ableiten
Beschreibung: Die lernende Person kann aus einem Graphen zentrale Termmerkmale wie Funktionsfamilie, Parameter, Nullstellen oder Symmetrie ableiten und fachsprachlich formulieren.

Zusatzanweisung:
Required mathematical layout:
- Show deriving term features from a graph.
- Graph: straight rising line crossing the y-axis at 1 and passing through "(2|5)".
- Mark "(0|1)" exactly on the y-axis and "(2|5)" exactly above x = 2.
- Draw the rise/run triangle from (0|1) horizontally to (2|1) and then vertically to (2|5).
- Label the horizontal run with "2" and the vertical rise with "4".
- Keep the sparse coordinate scale unambiguous: label x = 0 at the y-axis, and project the triangle's vertical edge with a dashed line onto the x-axis where it is labeled x = 2. Label y = 1 and y = 5 at the two marked points.
- Feature cards:
  - "lineare Funktion"
  - "Steigung m = 2"
  - "y-Achsenabschnitt b = 1"
  - "Term: f(x) = 2x + 1"

Visual guidance:
- Use arrows from the graph to the feature cards.
- Make the y-intercept and rise/run triangle visually clear: rise 4, run 2, so m = 2.
- Ensure the x = 2 projection, the orange vertical edge, and the point "(2|5)" share one exact vertical alignment.

Avoid:
- Do not show a parabola or exponential curve.
- Do not use English text.
- Do not assign b = 0 or m = 1.
- Do not include a wrong equation.
- Do not draw three x-axis unit intervals for a horizontal run labelled 2.
- Do not place either marked point between or beside its stated coordinate value.
```

## Review-Notiz

Die korrigierte Pilotfassung wurde am 2026-08-06 bei voller Auflösung geprüft. Die ursprüngliche Darstellung zeigte für den mit `2` beschrifteten horizontalen Lauf drei sichtbare x-Intervalle. Die korrigierte Fassung bindet `(0|1)` an die y-Achse und projiziert die senkrechte Dreiecksseite sowie `(2|5)` eindeutig auf `x = 2`; damit stimmen `run = 2`, `rise = 4`, `m = 2` und `f(x) = 2x + 1` geometrisch und algebraisch überein.
