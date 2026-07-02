# Lernzielvisualisierung: Grundidee von Taylorpolynomen erläutern (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `3773bd34-3631-5fd2-b9b7-dfa01adf5abd`
- Titel: Grundidee von Taylorpolynomen erläutern (LK)
- Beschreibung: Die lernende Person kann die Grundidee von Taylorpolynomen an der Entwicklungsstelle 0 fachsprachlich erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `3773bd34-3631-5fd2-b9b7-dfa01adf5abd.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/3773bd34-3631-5fd2-b9b7-dfa01adf5abd/3773bd34-3631-5fd2-b9b7-dfa01adf5abd.jpg`

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

Titel: Grundidee von Taylorpolynomen erläutern (LK)
Beschreibung: Die lernende Person kann die Grundidee von Taylorpolynomen an der Entwicklungsstelle 0 fachsprachlich erläutern.

Zusatzanweisung:
Pflichtinhalt:

Explain the basic idea of Taylor polynomials at development point `0`.
Do not include a top title in the image. Start directly with the three content cards.
Use the general formula up to degree 3:
`T_3(x) = f(0) + f'(0)*x + f''(0)/2!*x^2 + f'''(0)/3!*x^3`

Visual meaning:
- `T_3` matches the value of `f` at `0`
- it also matches the first, second, and third derivative of `f` at `0`
- near `x=0`, the polynomial approximates the function

Use a simple layout with:
- one formula card for `T_3(x)`
- one small table with exactly these rows:
  - `Wert`: `f(0) = T_3(0)`
  - `1. Ableitung`: `f'(0) = T_3'(0)`
  - `2. Ableitung`: `f''(0) = T_3''(0)`
  - `3. Ableitung`: `f'''(0) = T_3'''(0)`
  - `nahe 0`: `T_3(x) ≈ f(x)`
- one simple note card: `Entwicklungsstelle: x=0`, `lokale Annäherung nahe 0`

Use a symbolic table-and-formula infographic in this version, not a plotted curve.
No leader lines from formula terms to any other element. No arrows between cards.

Vermeiden:

Do not use development point `1`; it must be `0`.
Do not omit the factorials `2!` and `3!`.
Do not claim the Taylor polynomial is globally equal to the function.
Do not add numerical derivative values unless they match a specific function.
Do not write `f'''` in a row named `Krümmung`; third derivative needs its own row.
Do not draw coordinate axes.
Do not draw a function graph.
Do not draw curves for `f(x)` or `T_3(x)`.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
Do not write `LK` or parentheses in a title.
Do not add a small header above the title.
Do not add decorative arrows, leader arrows, or pointer arrows.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
