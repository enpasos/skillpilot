# Lernzielvisualisierung: Eigenschaften von Funktionssummen graphisch begründen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `ebc41c8b-5754-5161-9b07-f4525b9fd9b4`
- Titel: Eigenschaften von Funktionssummen graphisch begründen (LK)
- Beschreibung: Die lernende Person kann Eigenschaften von Funktionssummen wie $f(x)+g(x)$ anhand der Graphen von $f$ und $g$ skizzieren und begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `ebc41c8b-5754-5161-9b07-f4525b9fd9b4.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ebc41c8b-5754-5161-9b07-f4525b9fd9b4/ebc41c8b-5754-5161-9b07-f4525b9fd9b4.jpg`

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

Titel: Eigenschaften von Funktionssummen graphisch begründen (LK)
Beschreibung: Die lernende Person kann Eigenschaften von Funktionssummen wie $f(x)+g(x)$ anhand der Graphen von $f$ und $g$ skizzieren und begründen.

Zusatzanweisung:
Pflichtinhalt:

Show pointwise graphical addition of two functions without drawing full function curves.
Use a clean value-column diagram plus a value table.

Use exactly this example:
- `f(x)=x^2`
- `g(x)=x`
- `h(x)=f(x)+g(x)=x^2+x`

Use exactly these two x-values:
- for `x=1`: `f(1)=1`, `g(1)=1`, `h(1)=2`
- for `x=2`: `f(2)=4`, `g(2)=2`, `h(2)=6`

Left panel:
- title `Punktweise Addition`
- two vertical value columns labelled `x=1` and `x=2`
- each column starts at a baseline labelled `0`
- blue lower segment represents `f(x)`
- green segment is stacked directly above the blue segment and represents `g(x)`
- red endpoint at the top represents `h(x)`
- in the `x=1` column, the blue segment has height `1`, the green segment has height `1`, and the red endpoint is at height `2`
- in the `x=2` column, the blue segment has height `4`, the green segment has height `2`, and the red endpoint is at height `6`

Right panel:
- a table with columns `x`, `f(x)`, `g(x)`, `h(x)=f(x)+g(x)`
- rows exactly `1 | 1 | 1 | 2` and `2 | 4 | 2 | 6`
- a conclusion card: `h-Wert = f-Wert + g-Wert`

Vermeiden:

Do not draw a continuous coordinate graph, parabola, or straight line.
Do not draw `g(x)` as a curve or a non-straight line.
Do not draw `h(x)=x^2+x` as a curve.
Do not draw any arrows whose start and end values are not explicitly labelled.
Do not draw an arrow for `h(1)=2`; the top point must simply sit at height `2`.
Do not include any graphing-calculator UI.
Do not add extra formulas, extra x-values, or unlabelled points.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
