# Lernzielvisualisierung: Ebenengleichung aus geometrischen Bedingungen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `ea4bd128-17ab-5a8b-ae98-29552d774fb0`
- Titel: Ebenengleichung aus geometrischen Bedingungen bestimmen
- Beschreibung: Die lernende Person kann eine Ebenengleichung aus Bedingungen wie drei Punkten, Punkt+Normalenvektor oder Punkt+zwei Richtungsvektoren bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `ea4bd128-17ab-5a8b-ae98-29552d774fb0.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ea4bd128-17ab-5a8b-ae98-29552d774fb0/ea4bd128-17ab-5a8b-ae98-29552d774fb0.jpg`

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

Titel: Ebenengleichung aus geometrischen Bedingungen bestimmen
Beschreibung: Die lernende Person kann eine Ebenengleichung aus Bedingungen wie drei Punkten, Punkt+Normalenvektor oder Punkt+zwei Richtungsvektoren bestimmen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Ebenengleichung aus drei geometrischen Bedingungen bestimmen.
- Gegeben sind drei Punkte:
  A=(1; 0; 1),
  B=(3; 1; 1),
  C=(1; 2; 2).
- Spannvektoren:
  u=AB=(2; 1; 0),
  v=AC=(0; 2; 1).
- Normalenvektor:
  n = u x v = (1; -2; 4).
- Punkt-Normalen-Form mit A:
  ((x; y; z) - (1; 0; 1)) * (1; -2; 4) = 0.
- Koordinatenform:
  (x-1) - 2y + 4(z-1) = 0.
  x - 2y + 4z = 5.
- Kontrolliere sichtbar:
  B: 3 - 2*1 + 4*1 = 5.
  C: 1 - 2*2 + 4*2 = 5.
- Zeige eine 3D-Skizze: Die drei Punkte A, B, C spannen die Ebene auf, u und v liegen in der Ebene, n steht senkrecht dazu.

Vermeiden:
- Nicht u=(2;1;1) oder v=(0;2;2) schreiben.
- Nicht x - 2y + 4z = 0 schreiben; rechte Seite ist 5.
- n nicht als Richtungsvektor in der Ebene zeichnen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
