# Lernzielvisualisierung: Transformierte Exponential- und trigonometrische Funktionen integrieren

## SkillPilot-Ziel

- SkillPilot-ID: `23589682-2028-54cb-9034-b468b42688f1`
- Titel: Transformierte Exponential- und trigonometrische Funktionen integrieren
- Beschreibung: Die lernende Person kann Funktionen der Form $e^{ax+b}$, $\sin(b\cdot(x-c))$ und $\cos(b\cdot(x-c))$ mithilfe der linearen inneren Transformation beziehungsweise der rückwärtigen Kettenregel integrieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `23589682-2028-54cb-9034-b468b42688f1.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/23589682-2028-54cb-9034-b468b42688f1/23589682-2028-54cb-9034-b468b42688f1.jpg`

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

Titel: Transformierte Exponential- und trigonometrische Funktionen integrieren
Beschreibung: Die lernende Person kann Funktionen der Form $e^{ax+b}$, $\sin(b\cdot(x-c))$ und $\cos(b\cdot(x-c))$ mithilfe der linearen inneren Transformation beziehungsweise der rückwärtigen Kettenregel integrieren.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration focus: show three clean examples, with no wrong sign in the sine derivative check.
- Example 1: integral of e^(2x+1) is exactly (1/2) e^(2x+1) + C. Check: d/dx[(1/2)e^(2x+1)] = e^(2x+1).
- Example 2: integral of cos(3(x-1)) is exactly (1/3) sin(3(x-1)) + C. Check: d/dx[(1/3)sin(3(x-1))] = cos(3(x-1)).
- Example 3: integral of sin(2(x-pi/4)) is exactly -1/2 cos(2(x-pi/4)) + C.
- The sine check must be written exactly as:
  d/dx[-1/2 cos(2(x-pi/4))]
  = -1/2 * (-sin(2(x-pi/4))) * 2
  = sin(2(x-pi/4)).
- It is better to show fewer formulas than to show a wrong derivative step.

Vermeiden:
- Do not omit the minus sign in the derivative of cos: d/dx cos(u) = -sin(u)*u'.
- Do not place any extra superscript, exponent, floating digit, dot, mark, or decoration between the 2 and (x-pi/4).
- Do not write 2^9, 2^0, 2*, 0.785..., or any decimal approximation for pi/4.
- No generic rule if it crowds the examples or risks notation errors.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
