# Lernzielvisualisierung: Integralterme interpretieren und begründen

## SkillPilot-Ziel

- SkillPilot-ID: `34604a97-0c64-5b06-81e2-6ac818732d60`
- Titel: Integralterme interpretieren und begründen
- Beschreibung: Die lernende Person kann Integralterme sprachlich und grafisch deuten, ihre Bedeutung im Kontext erläutern und mit ihnen argumentieren, zum Beispiel beim Vergleichen von Größen oder beim Begründen von Aussagen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `34604a97-0c64-5b06-81e2-6ac818732d60.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/34604a97-0c64-5b06-81e2-6ac818732d60/34604a97-0c64-5b06-81e2-6ac818732d60.jpg`

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

Titel: Integralterme interpretieren und begründen
Beschreibung: Die lernende Person kann Integralterme sprachlich und grafisch deuten, ihre Bedeutung im Kontext erläutern und mit ihnen argumentieren, zum Beispiel beim Vergleichen von Größen oder beim Begründen von Aussagen.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration focus: the shaded area must match the integral interval exactly.
- Use f(x)=3-x on the interval [0,2].
- In the main graph, draw a visible vertical boundary at x=2 and shade only the area under f(x)=3-x from x=0 to x=2.
- The graph may continue to the x-intercept at x=3, but the part from x=2 to x=3 must stay unshaded.
- Show:
  integral_0^2 (3-x) dx = [3x - 1/2*x^2]_0^2 = 6 - 2 = 4.
- Show the interpretation in language: "aufsummierte Hoehe der Funktion zwischen 0 und 2".
- Show the comparison:
  0 <= 3-x <= 3 on [0,2], so 0 <= integral_0^2 (3-x) dx <= integral_0^2 3 dx = 6.

Vermeiden:
- Do not shade the interval from x=2 to x=3.
- Do not make the big green area equal to the full triangle from 0 to 3.
- Do not write approximately 4; the value is exactly 4.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
