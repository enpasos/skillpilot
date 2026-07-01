# Lernzielvisualisierung: Reale Gegenstände als Rotationskörper zur Volumenbestimmung modellieren (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `281e0c6e-d06d-580f-8443-4369f0ea524b`
- Titel: Reale Gegenstände als Rotationskörper zur Volumenbestimmung modellieren (LK)
- Beschreibung: Die lernende Person kann reale Gegenstände durch geeignete Rotationskörper beziehungsweise Randfunktionen modellieren, passende Integrale zur Volumenbestimmung aufstellen und die Modellannahmen im Kontext begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `281e0c6e-d06d-580f-8443-4369f0ea524b.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/281e0c6e-d06d-580f-8443-4369f0ea524b/281e0c6e-d06d-580f-8443-4369f0ea524b.jpg`

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

Titel: Reale Gegenstände als Rotationskörper zur Volumenbestimmung modellieren (LK)
Beschreibung: Die lernende Person kann reale Gegenstände durch geeignete Rotationskörper beziehungsweise Randfunktionen modellieren, passende Integrale zur Volumenbestimmung aufstellen und die Modellannahmen im Kontext begründen.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration focus: clean modelling axis labels and a simple rotational model.
- Use a simplified cone-shaped paper cup, not a mug with a handle.
- Model assumptions: height 6 cm, top radius 3 cm, wall thickness ignored, smooth cone, rotation around the central height axis.
- In the mathematical graph, the horizontal x-axis is the height axis from x=0 to x=6.
- The vertical axis is the radius r in cm, with r(6)=3.
- Use radius function r(x)=x/2 for 0 <= x <= 6.
- Show:
  V = pi * integral_0^6 (x/2)^2 dx
    = pi/4 * integral_0^6 x^2 dx
    = pi/4 * [x^3/3]_0^6
    = 18*pi cm^3.
- Explain: The integral gives the model volume; real shape deviations make it an approximation.

Vermeiden:
- Do not label the vertical radius axis as "x-Achse" or "Hoehe".
- Do not use a mug handle in the mathematical model.
- Do not confuse radius and diameter; the top radius is 3 cm.
- Do not compute surface area; this is volume in cm^3.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
