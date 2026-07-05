# Lernzielvisualisierung: Lorentztransformation anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `57ec031c-9a91-5331-81a7-6ef900f7c63e`
- Titel: Lorentztransformation anwenden
- Beschreibung: Die lernende Person kann Lorentztransformationen und Geschwindigkeitsaddition durchführen.

## Generator

- Provider: gemini-3-pro-image
- Status: accepted
- Quellbild: `57ec031c-9a91-5331-81a7-6ef900f7c63e.jpg`
- Public Asset: `/assets/goal-visualizations/physik/57ec031c-9a91-5331-81a7-6ef900f7c63e/57ec031c-9a91-5331-81a7-6ef900f7c63e.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Schulform-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Lorentztransformation anwenden
Beschreibung: Die lernende Person kann Lorentztransformationen und Geschwindigkeitsaddition durchführen.

Zusatzanweisung:
Pflichtinhalt:

- Do not include technical identifiers, filenames, watermarks, platform names, product names, or school/audience labels in the image.
- Create an appealing German cartoon learning image titled `Lorentztransformation anwenden`.
- Show two inertial frames as two clean coordinate panels: `System S` and `System S'`.
- In `System S`, show a small rocket moving to the right with label `v`.
- Mark one shared event as a small flash point labelled `Ereignis`.
- Add one compact formula card with exactly these three lines:
  `gamma = 1/sqrt(1-v^2/c^2)`
  `x' = gamma*(x - v*t)`
  `t' = gamma*(t - v*x/c^2)`
- Add a second small card exactly as: `u' = (u-v)/(1-u*v/c^2)`.
- Keep the formulas legible with straight baseline text; use ASCII symbols, not handwritten Greek.
- Visible learner text must be limited to the title, `System S`, `System S'`, `v`, `Ereignis`, the four formula lines, and axis labels `x`, `ct`, `x'`, `ct'`.

Vermeiden:

- Do not draw tilted Minkowski axes unless their orientation is mathematically consistent; parallel coordinate panels are safer.
- Do not use the Galilei transformation `x' = x - v*t` without the factor `gamma`.
- Do not write `1+u*v/c^2` in the denominator of the velocity addition formula.
- Do not reverse the sign convention while still showing the rocket moving right.
- Do not add many motion arrows; any shown arrow must match the rocket moving to the right.
- Do not add long explanatory text, internal instructions, or production guidance.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
