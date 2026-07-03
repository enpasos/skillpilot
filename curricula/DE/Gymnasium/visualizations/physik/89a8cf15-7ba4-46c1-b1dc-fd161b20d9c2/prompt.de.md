# Lernzielvisualisierung: Waagerechter Wurf analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2`
- Titel: Waagerechter Wurf analysieren
- Beschreibung: Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.jpg`
- Public Asset: `/assets/goal-visualizations/physik/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.jpg`

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

Titel: Waagerechter Wurf analysieren
Beschreibung: Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

Zusatzanweisung:
Pflichtinhalt:

Show horizontal projectile motion as superposition of constant horizontal motion and vertical free fall.

Title: `Waagerechter Wurf`

Main diagram:
- coordinate grid with horizontal axis `x/m` and vertical axis `y/m`
- origin at launch point, y positive downward for this diagram
- draw one smooth parabolic trajectory from the launch point toward the lower right
- mark equal-time points `t=0 s`, `t=1 s`, `t=2 s`, `t=3 s`
- points must sit exactly on these grid intersections:
  - `(0,0)`
  - `(2,5)`
  - `(4,20)`
  - `(6,45)`
- the horizontal spacing between consecutive marked points must be exactly `2 m`
- no arrowheads on the trajectory

Component table:
- `x = v_x * t`
- `v_x = 2 m/s konstant`
- `y = 1/2 * g * t^2`
- `g = 10 m/s^2`

Arrows:
- draw no physical arrows except the two coordinate-axis arrowheads
- do not draw a curved connector arrow from the text box to the graph

Vermeiden:

Do not draw a straight-line trajectory.
Do not make horizontal spacing unequal for equal time steps.
Do not put `t=2 s` at `x=5 m` or `t=3 s` at `x=7 m`.
Do not make vertical spacing linear; it must grow like `t^2`.
Do not draw a horizontal force arrow.
Do not draw a diagonal force arrow along the trajectory.
Do not use upward-positive y labels while plotting downward-positive y values.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
