# Lernzielvisualisierung: Bruchgleichungen lösen und als Schnittprobleme deuten

## SkillPilot-Ziel

- SkillPilot-ID: `797ee047-b8dd-45cf-880e-98571a56c690`
- Titel: Bruchgleichungen lösen und als Schnittprobleme deuten
- Beschreibung: Die lernende Person kann Bruchgleichungen rechnerisch lösen und in einfachen Fällen als Schnittprobleme von Funktionsgraphen interpretieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `797ee047-b8dd-45cf-880e-98571a56c690.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/797ee047-b8dd-45cf-880e-98571a56c690/797ee047-b8dd-45cf-880e-98571a56c690.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Bruchgleichungen lösen und als Schnittprobleme deuten
Beschreibung: Die lernende Person kann Bruchgleichungen rechnerisch lösen und in einfachen Fällen als Schnittprobleme von Funktionsgraphen interpretieren.

Zusatzanweisung:
Pflichtinhalt:

Correct the existing educational illustration while preserving the friendly hand-drawn infographic style and the left calculation / right graph interpretation layout.

The central correction is the red graph of y = 2/(x+1). It must be mathematically correct wherever it appears.

Simplify the right side if needed: prefer one large combined intersection graph instead of three small graph panels. It is better to draw fewer graph panels than to include any wrong branch. If there is any risk of a wrong small panel, remove the small panels and keep only one large shared coordinate system.

Use the provided reference sketch for the mathematical shape of the shared graph: blue y = 1/x, red y = 2/(x+1), dashed vertical asymptotes x = 0 and x = -1, and the intersection S(1|1).

Graph requirements for the red function y = 2/(x+1):

- Vertical asymptote: x = -1, shown as a dashed vertical line.
- Horizontal asymptote: y = 0, the x-axis.
- For x > -1, the red branch is above the x-axis, decreases from +infinity near x = -1, passes through (0,2), passes through the intersection point (1,1), and approaches y = 0 from above.
- For x < -1, the red branch is below the x-axis, approaches y = 0 from below far to the left, and falls toward -infinity as x approaches -1 from the left.
- The red graph must never show a positive branch to the left of x = -1.
- The red graph must not cross the x-axis.

Graph requirements for the blue function y = 1/x:

- Vertical asymptote: x = 0.
- Horizontal asymptote: y = 0.
- It has one branch in quadrant I and one branch in quadrant III.
- It passes through the intersection point (1,1).

Combined Schnittproblem panel:

- Draw both functions on one shared coordinate system.
- Mark the intersection point exactly at S(1|1).
- The yellow star or marker must sit at x = 1 and y = 1.
- The red and blue curves must both pass through S(1|1).
- Keep the explanation that the solution is the x-coordinate of the intersection: x = 1.
- Check this combined panel independently from the small individual panels: the red left branch left of x = -1 must also be below the x-axis in the combined graph.
- Use a large combined coordinate system plus short formula labels. Fewer graph panels are acceptable, but every drawn branch must be mathematically correct.
- The red curve should visibly pass through (0,2) and S(1|1). It should approach the x-axis from above for large positive x.
- The blue curve should visibly pass through S(1|1) and have its vertical asymptote at x=0.

Keep the algebraic solution coherent:

- Equation: 1/x = 2/(x+1)
- Conditions: x != 0 and x != -1
- Multiplication by x(x+1), then x+1 = 2x, then x = 1.

Vermeiden:

- Do not draw the left branch of y = 2/(x+1) above the x-axis.
- Do not copy any combined graph where the red branch left of x = -1 is above the x-axis.
- Do not draw any separate mini graph that contradicts the large combined graph.
- Do not draw y = 2/(x+1) as if it had vertical asymptote x = 0.
- Do not let the red graph cross the x-axis.
- Do not place the intersection anywhere except S(1|1).
- Do not introduce wrong arrows, wrong labels, wrong denominator conditions, or inconsistent graph colors.
- Do not include technical IDs, file names, platform names, product names, internal paths, or school-form labels in the visible image.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
