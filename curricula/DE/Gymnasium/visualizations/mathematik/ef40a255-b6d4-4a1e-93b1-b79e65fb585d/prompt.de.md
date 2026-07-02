# Lernzielvisualisierung: Sinus- und Kosinussatz begründen und anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `ef40a255-b6d4-4a1e-93b1-b79e65fb585d`
- Titel: Sinus- und Kosinussatz begründen und anwenden
- Beschreibung: Die lernende Person kann den Sinussatz nachvollziehen, den Satz des Pythagoras als Spezialfall des Kosinussatzes deuten und Anwendungsaufgaben in allgemeinen Dreiecken rechnerisch lösen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `ef40a255-b6d4-4a1e-93b1-b79e65fb585d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ef40a255-b6d4-4a1e-93b1-b79e65fb585d/ef40a255-b6d4-4a1e-93b1-b79e65fb585d.jpg`

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

Titel: Sinus- und Kosinussatz begründen und anwenden
Beschreibung: Die lernende Person kann den Sinussatz nachvollziehen, den Satz des Pythagoras als Spezialfall des Kosinussatzes deuten und Anwendungsaufgaben in allgemeinen Dreiecken rechnerisch lösen.

Zusatzanweisung:
Pflichtinhalt:

Show the correct side-angle correspondences for sine rule and cosine rule in a general triangle.
Use a table-first infographic. A small triangle is allowed only if the labels match exactly.

Use exactly these correspondences:
- side `a` is opposite angle `alpha`
- side `b` is opposite angle `beta`
- side `c` is opposite angle `gamma`

If a triangle is shown, use this exact layout:
- vertices `A` bottom left, `B` bottom right, `C` top
- angle `alpha` at vertex `A`
- angle `beta` at vertex `B`
- angle `gamma` at vertex `C`
- side `a` on segment `BC` only
- side `b` on segment `CA` only
- side `c` on segment `AB` only
- put side labels directly on the side midpoints, with no arrows

Show the formulas:
- `a/sin(alpha) = b/sin(beta) = c/sin(gamma)`
- `c^2 = a^2 + b^2 - 2ab*cos(gamma)`
- special case: `gamma = 90° => c^2 = a^2 + b^2`

Use one numeric sine-rule example:
- given `a=7`, `alpha=40°`, `beta=65°`
- `b = 7*sin(65°)/sin(40°) ≈ 9.87`

Vermeiden:

Do not pair side `a` with angle `beta` or `gamma`.
Do not pair side `b` with angle `alpha` or `gamma`.
Do not pair side `c` with angle `alpha` or `beta`.
Do not place side `a` next to angle `alpha`, side `b` next to angle `beta`, or side `c` next to angle `gamma`.
Do not use a right-triangle-only diagram as the main triangle.
Do not write `sin(40°)/7 = sin(65°)/b`; use the displayed form consistently.
Do not add arrows or leader lines between nonmatching sides and angles.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
