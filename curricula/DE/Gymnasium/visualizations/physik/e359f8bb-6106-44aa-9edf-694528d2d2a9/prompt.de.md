# Lernzielvisualisierung: Erhaltung der mechanischen Energie tiefer verstehen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `e359f8bb-6106-44aa-9edf-694528d2d2a9`
- Titel: Erhaltung der mechanischen Energie tiefer verstehen (LK)
- Beschreibung: Die lernende Person kann die Energieerhaltung aus den Newtonschen Axiomen herleiten und die Voraussetzungen dieser Herleitung benennen. Ausgangspunkt ist die Grundgleichung der Mechanik, die mit der Geschwindigkeit skalar multipliziert wird. Dabei ist für die kinetische Energie eine konstante Masse vorausgesetzt. Für konservative Kräfte wird die Kraft als Gradient eines Potenzials aufgefasst, sodass sich der entsprechende Term als Zeitableitung der potenziellen Energie schreiben lässt. Auf diese Weise gelangt die lernende Person zur Erhaltung der mechanischen Energie.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `e359f8bb-6106-44aa-9edf-694528d2d2a9.jpg`
- Public Asset: `/assets/goal-visualizations/physik/e359f8bb-6106-44aa-9edf-694528d2d2a9/e359f8bb-6106-44aa-9edf-694528d2d2a9.jpg`

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

Titel: Erhaltung der mechanischen Energie tiefer verstehen (LK)
Beschreibung: Die lernende Person kann die Energieerhaltung aus den Newtonschen Axiomen herleiten und die Voraussetzungen dieser Herleitung benennen. Ausgangspunkt ist die Grundgleichung der Mechanik, die mit der Geschwindigkeit skalar multipliziert wird. Dabei ist für die kinetische Energie eine konstante Masse vorausgesetzt. Für konservative Kräfte wird die Kraft als Gradient eines Potenzials aufgefasst, sodass sich der entsprechende Term als Zeitableitung der potenziellen Energie schreiben lässt. Auf diese Weise gelangt die lernende Person zur Erhaltung der mechanischen Energie.

Zusatzanweisung:
Pflichtinhalt:

Show the derivation idea for conservation of mechanical energy from Newton's equation.

Title: `Mechanische Energie herleiten`

Use a formula ladder, not a motion scene.

Formula ladder:
- `m * a = F_cons`
- `m * a · v = F_cons · v`
- `d/dt (1/2 * m * v^2) = F_cons · v`
- `F_cons = - grad E_pot`
- `F_cons · v = - dE_pot/dt`
- `d/dt (E_kin + E_pot) = 0`
- `E_mech = E_kin + E_pot = konstant`

Assumptions box:
- `konstante Masse`
- `Inertialsystem`
- `nur konservative Kraefte`

Visual style:
- clean academic blackboard or worksheet
- use downward step connectors only between consecutive formula lines
- no physical arrows and no object scene

Vermeiden:

Do not draw force arrows.
Do not write `F_cons = + grad E_pot`; the minus sign is required.
Do not omit `konstante Masse`.
Do not claim the result holds with friction or non-conservative forces.
Do not confuse `E_kin` and `E_pot`.
Do not write `d/dt(E_kin + E_pot) = E_mech`.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
