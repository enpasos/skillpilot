# Lernzielvisualisierung: Faktor- und Summenregel beweisen und anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `dde9ae98-d97d-598b-92f4-f1616f4d75c8`
- Titel: Faktor- und Summenregel beweisen und anwenden
- Beschreibung: Die lernende Person kann Faktor- und Summenregel für Ableitungen begründen, in Rechnungen anwenden und die einzelnen Ableitungsschritte nachvollziehbar darstellen.

## Generator

- Provider: OpenAI image_gen tool
- Status: accepted
- Quellbild: `dde9ae98-d97d-598b-92f4-f1616f4d75c8.png`
- Public Asset: `/assets/goal-visualizations/mathematik/dde9ae98-d97d-598b-92f4-f1616f4d75c8/dde9ae98-d97d-598b-92f4-f1616f4d75c8.png`

## Prompt

```text
Use case: scientific-educational, edit of an existing bitmap.
Input image: the supplied local JPG is the EDIT TARGET, not merely a loose style reference.
Correct the mathematical content while preserving the friendly cartoon style, turquoise palette, robots, gears, chalkboard, rounded text panels, horizontal two-column layout and title. Produce a crisp wide landscape raster image with readable mathematical typography and unclipped panels.

Keep the exact top title: "Faktor- und Summenregel beweisen und anwenden".
Keep left heading "Beweisen & Begründen" and right heading "Anwenden & Darstellen".

RIGHT HALF: replace EVERY occurrence of sin(x), cos(x), trigonometric content and their derivatives with the following single polynomial worked example. Preserve its visual flow: thought bubble at top, decomposition, two derivative boxes, then recombination/result. Render these exact equations:
Top thought bubble: "h(x) = 3x² + x³"
Middle decomposition box: "h′(x) = (3x²)′ + (x³)′"
Lower left box: "(3x²)′ = 3 · (2x) = 6x"
Lower right box: "(x³)′ = 3x²"
Bottom result box: "h′(x) = 6x + 3x²"
Keep labels "Regeln erkennen (Faktor & Summe)", "Anwenden", "Schritte darstellen (Einzelableitungen)" and "Ergebnis", adjusting their line breaks only for legibility. All flow arrows on the RIGHT may remain as organizational arrows.

LEFT CHALKBOARD: replace the existing proof formula areas with a correct compact difference-quotient justification. Include the small assumption text "c konstant; f und g differenzierbar". All limits explicitly use h → 0 beneath "lim". Use EQUALITY signs to join equivalent mathematical expressions, not implication arrows or standalone arrows. Use stacked fractions with h as denominator. The two derivations, displayed with generous spacing and sensible line breaks, are:
"Faktorregel"
lim_{h→0} [c·f(x+h) − c·f(x)]/h
= c · lim_{h→0} [f(x+h) − f(x)]/h
= c · f′(x)

"Summenregel"
lim_{h→0} [(f+g)(x+h) − (f+g)(x)]/h
= lim_{h→0} [f(x+h) − f(x)]/h
  + lim_{h→0} [g(x+h) − g(x)]/h
= f′(x) + g′(x)

The plus term on the second sum-rule equality is a continuation of the same right-hand side; align it clearly under that right-hand side, without another equals sign before the plus. Keep the proof areas free of overlapping callouts: move or remove redundant external "Begründung" labels if needed to fit the complete equations. Retain the left chalkboard and lower friendly gears/"Fundament der Regeln" motif.

Constraints: correct prime marks, superscripts ²/³, brackets, plus/minus signs and equals signs. Preserve the title and visual focus. No trigonometry, no exponential functions, no additional mathematics, no added characters, no logos, no watermark. Text and equations must remain legible when viewed as a learning illustration.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
