# Lernzielvisualisierung: Exponentialfunktion durch Taylorpolynome annähern (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `1b664036-3c29-5d94-9f42-97069aaa2c53`
- Titel: Exponentialfunktion durch Taylorpolynome annähern (LK)
- Beschreibung: Die lernende Person kann die natürliche Exponentialfunktion durch Taylorpolynome annähern und die Approximation deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `1b664036-3c29-5d94-9f42-97069aaa2c53.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/1b664036-3c29-5d94-9f42-97069aaa2c53/1b664036-3c29-5d94-9f42-97069aaa2c53.jpg`

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

Titel: Exponentialfunktion durch Taylorpolynome annähern (LK)
Beschreibung: Die lernende Person kann die natürliche Exponentialfunktion durch Taylorpolynome annähern und die Approximation deuten.

Zusatzanweisung:
Pflichtinhalt:

Show Taylor polynomial approximation of the natural exponential function.
Use exactly this sequence:
- `e^x`
- `T_0(x) = 1`
- `T_1(x) = 1 + x`
- `T_2(x) = 1 + x + x^2/2`
- `T_3(x) = 1 + x + x^2/2 + x^3/6`

Use the value check at `x=1`:
- `e^1 ≈ 2.718`
- `T_0(1)=1`
- `T_1(1)=2`
- `T_2(1)=2.5`
- `T_3(1)≈2.667`

Use a table and a small graph near `x=0` showing that higher-degree Taylor polynomials better approximate `e^x` near `0`. The formula list must be a list, not an arrow chain.

For the graph:
- the common expansion/contact point is exactly `(0|1)`, because `e^0 = T_0(0) = T_1(0) = T_2(0) = T_3(0) = 1`
- draw and label the shared point as `P(0|1)`
- the shared point must be on the horizontal level `y=1`, not on the x-axis
- the origin `(0|0)` may be shown only below that point; do not label the shared point as `(0|0)`
- `T_0(x)=1` must be a horizontal line through `y=1`

Vermeiden:

Do not use `ln(x)`, `sin(x)`, or `cos(x)`.
Do not change the signs; all terms for `e^x` are positive.
Do not write `x^2/3` or `x^3/3`; the correct terms are `x^2/2` and `x^3/6`.
Do not claim `T_3(1)=e`.
Do not show the Taylor curves meeting at `(0|0)`.
Do not place `T_0(x)=1` on the x-axis.
Do not draw an arrow from `e^x` to `T_0` or from one polynomial to the next.
Do not add decorative arrows, magnifying glasses, checkmark columns, or pointer arrows. Only coordinate axes may have arrowheads.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
