# Lernzielvisualisierung: Schiefen Wurf beschreiben

## SkillPilot-Ziel

- SkillPilot-ID: `fbecbd60-5db3-51e8-94be-d66b066ffa06`
- Titel: Schiefen Wurf beschreiben
- Beschreibung: Die lernende Person kann den schiefen Wurf als Überlagerung von waagerechtem Wurf und vertikaler Bewegung beschreiben und typische Flugbahnen qualitativ skizzieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `fbecbd60-5db3-51e8-94be-d66b066ffa06.jpg`
- Public Asset: `/assets/goal-visualizations/physik/fbecbd60-5db3-51e8-94be-d66b066ffa06/fbecbd60-5db3-51e8-94be-d66b066ffa06.jpg`

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

Titel: Schiefen Wurf beschreiben
Beschreibung: Die lernende Person kann den schiefen Wurf als Überlagerung von waagerechtem Wurf und vertikaler Bewegung beschreiben und typische Flugbahnen qualitativ skizzieren.

Zusatzanweisung:
Pflichtinhalt:

Show oblique projectile motion as superposition of horizontal and vertical motion.

Title: `Schiefer Wurf`

Main diagram:
- coordinate grid with horizontal axis `x/m` and vertical axis `y/m`
- origin at launch point
- draw one smooth parabolic trajectory from the origin up and to the right, then down to the ground
- no arrowhead on the trajectory
- mark five points:
  - `t=0 s` at `(0,0)`
  - `t=1 s` at `(2,15)`
  - `t=2 s` at `(4,20)`
  - `t=3 s` at `(6,15)`
  - `t=4 s` at `(8,0)`

Launch-vector inset:
- draw exactly two velocity component arrows at the origin:
  - horizontal arrow to the right labelled `v_x konstant`
  - vertical arrow upward labelled `v_y anfangs nach oben`

Formula box:
- `x = v_x * t`
- `y = v_y0 * t - 1/2 * g * t^2`
- `horizontal gleichfoermig + vertikal beschleunigt`

Vermeiden:

Do not draw force arrows.
Do not draw a gravity arrow along the trajectory.
Do not make the trajectory a straight line.
Do not make horizontal spacing unequal for equal time steps.
Do not add a diagonal arrow along the path.
Do not label the vertical component as constant.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
