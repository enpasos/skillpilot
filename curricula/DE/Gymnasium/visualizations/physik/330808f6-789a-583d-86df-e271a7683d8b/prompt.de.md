# Lernzielvisualisierung: Differenzialgleichung des RC-Kreises lösen

## SkillPilot-Ziel

- SkillPilot-ID: `330808f6-789a-583d-86df-e271a7683d8b`
- Titel: Differenzialgleichung des RC-Kreises lösen
- Beschreibung: Die lernende Person kann die Entladung eines Kondensators per Differentialgleichung beschreiben und Lösungen analysieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `330808f6-789a-583d-86df-e271a7683d8b.jpg`
- Public Asset: `/assets/goal-visualizations/physik/330808f6-789a-583d-86df-e271a7683d8b/330808f6-789a-583d-86df-e271a7683d8b.jpg`

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

Titel: Differenzialgleichung des RC-Kreises lösen
Beschreibung: Die lernende Person kann die Entladung eines Kondensators per Differentialgleichung beschreiben und Lösungen analysieren.

Zusatzanweisung:
Pflichtinhalt:

- Do not include technical identifiers, filenames, watermarks, platform names, product names, or school/audience labels in the image.
- Create an appealing German cartoon learning image titled `RC-Entladung als DGL`.
- Show a simple closed circuit with one resistor `R` and one initially charged capacitor `C`; do not draw current arrows.
- Show a graph with horizontal axis `t` and vertical axis `U_C(t)`.
- The graph must be a smooth decreasing exponential from `U0` at `t = 0` toward `0`, always above the time axis.
- Mark the point `t = R*C` with value about `0,37 U0`.
- Show the equation `dU_C/dt = - U_C/(R*C)` and the solution `U_C(t) = U0 * e^(-t/(R*C))`.
- The asymptote is the time axis `U_C = 0`; the curve must not cross below it.
- Visible learner text must be limited to the title, `R`, `C`, `t`, `U_C(t)`, `U0`, `t = R*C`, `0,37 U0`, and the two equations.

Vermeiden:

- Do not draw a linear discharge curve.
- Do not draw oscillation, charging growth, or a curve crossing below zero.
- Do not add current-direction arrows or decorative arrows.
- Do not use a wrong sign in the differential equation.
- Do not add long explanatory text, internal instructions, or production guidance.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
