# Lernzielvisualisierung: Trigonometrische Gleichungen lösen

## SkillPilot-Ziel

- SkillPilot-ID: `ecd13e54-ab0e-550f-9400-66e13306635d`
- Titel: Trigonometrische Gleichungen lösen
- Beschreibung: Die lernende Person kann einfache trigonometrische Gleichungen wie $\sin(x)=k$ oder $\cos(x)=k$ lösen, allgemeine Lösungsangaben formulieren und Lösungen im Einheitskreis veranschaulichen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `ecd13e54-ab0e-550f-9400-66e13306635d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ecd13e54-ab0e-550f-9400-66e13306635d/ecd13e54-ab0e-550f-9400-66e13306635d.jpg`

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

Titel: Trigonometrische Gleichungen lösen
Beschreibung: Die lernende Person kann einfache trigonometrische Gleichungen wie $\sin(x)=k$ oder $\cos(x)=k$ lösen, allgemeine Lösungsangaben formulieren und Lösungen im Einheitskreis veranschaulichen.

Zusatzanweisung:
Pflichtinhalt:

- Show the equation `sin(x)=1/2`.
- Unit circle: mark the two solutions in `[0,2pi]`: `x=pi/6` and `x=5pi/6`.
- Graph panel: horizontal line `y=1/2` crossing the sine curve at the same two points in `[0,2pi]`.
- Write the general solution: `x = pi/6 + 2k*pi` or `x = 5pi/6 + 2k*pi`, `k in Z`.
- Add a note: "zwei Loesungen pro Periode bei -1 <= k <= 1".

Vermeiden:

- Do not show only one solution.
- Do not put the second solution at `7pi/6` for `sin(x)=1/2`.
- Do not use degrees instead of radians.
- Do not omit the `+ 2k*pi` in the general solution.
- Do not include technical IDs, filenames, watermarks, or brand names.

Regeneration-Zusatz:

- In the graph panel, both solution points must lie on the horizontal line `y=1/2`.
- The two graph intersections in `[0,2pi]` must be before `pi`: first at `pi/6`, second at `5pi/6`.
- Do not draw any solution point below the x-axis.
- Keep the unit-circle solutions in quadrant I and quadrant II only.
- The graph panel should show no orange point near `3pi/2` for this equation.

Zweite Regeneration:

- Do not draw a full sine curve.
- Use a large unit circle and a simple horizontal number line from `0` to `2pi`.
- On the number line, place solution markers only at `pi/6` and `5pi/6`, both before `pi`.
- Mark `pi/2` between `pi/6` and `5pi/6`, and mark `pi` after `5pi/6`.
- Show the general solution in a formula box: `x = pi/6 + 2k*pi` or `x = 5pi/6 + 2k*pi`, `k in Z`.

Dritte Regeneration:

- Do not write a long general-solution formula.
- Instead, show a short text box exactly: "In [0;2pi]: pi/6 und 5pi/6".
- Show a second short text box exactly: "Weitere Loesungen: jeweils +2pi".
- Keep the unit circle and number line.
- Do not write `2k*p`, `2kp`, or any symbol that could be confused with `2k*pi`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
