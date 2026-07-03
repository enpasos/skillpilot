# Lernzielvisualisierung: Freier Fall experimentell untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `09029573-864f-40ca-bf8a-cee7bf6dcb73`
- Titel: Freier Fall experimentell untersuchen
- Beschreibung: Die lernende Person kann den freien Fall experimentell untersuchen, Messdaten grafisch darstellen, die Gravitationsbeschleunigung bestimmen und ein Zeit-Ort-Gesetz formulieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `09029573-864f-40ca-bf8a-cee7bf6dcb73.jpg`
- Public Asset: `/assets/goal-visualizations/physik/09029573-864f-40ca-bf8a-cee7bf6dcb73/09029573-864f-40ca-bf8a-cee7bf6dcb73.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Physik; dieser Kontext dient nur der Stil- und Anspruchswahl und soll nicht als Bildtext erscheinen.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Freier Fall experimentell untersuchen
Beschreibung: Die lernende Person kann den freien Fall experimentell untersuchen, Messdaten grafisch darstellen, die Gravitationsbeschleunigung bestimmen und ein Zeit-Ort-Gesetz formulieren.

Zusatzanweisung:
Pflichtinhalt:

Show a free-fall experiment with one consistent data set and a linearized graph.

Title: `Freier Fall experimentell untersuchen`

Left panel: experiment
- show a ball released next to a vertical ruler
- use downward distance `s` measured from the release point
- mark exactly four ball positions:
  - `t=0,0 s`, `s=0,00 m`
  - `t=0,2 s`, `s=0,20 m`
  - `t=0,4 s`, `s=0,78 m`
  - `t=0,6 s`, `s=1,77 m`
- do not draw velocity or force arrows on the ball

Right panel: graph
- show `s gegen t^2`
- horizontal axis `t^2/s^2`
- vertical axis `s/m`
- plot the points `(0,00|0,00)`, `(0,04|0,20)`, `(0,16|0,78)`, `(0,36|1,77)`
- draw a straight rising fit line through the points
- label `Steigung ca. 4,9 m/s^2`
- conclusion in German only: `g ca. 9,8 m/s^2, denn s = 1/2 * g * t^2`
- if coordinate labels are shown, separate x and y with a vertical bar, for example `(0,36 | 1,77)`, never as `(0,361,77)`

Vermeiden:

Do not draw air resistance.
Do not draw force arrows or velocity arrows on the ball.
Do not show equal distance gaps between the falling positions.
Do not plot `s gegen t` as a straight line.
Do not label the slope itself as `g`; the slope in `s gegen t^2` is `g/2`.
Do not add extra data points with inconsistent values.
Do not write English words such as `because`.
Do not use ambiguous coordinate labels without a separator between x and y.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
