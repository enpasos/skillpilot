# Lernzielvisualisierung: Geradlinige Bewegung mit Reibung modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `30ddb2d7-b991-55fe-9e74-37ffe1048f9f`
- Titel: Geradlinige Bewegung mit Reibung modellieren
- Beschreibung: Die lernende Person kann geradlinige Bewegungen mit Reibung mithilfe von Kräftegrößen und einfachen Bewegungsgleichungen beschreiben und qualitativ vorhersagen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `30ddb2d7-b991-55fe-9e74-37ffe1048f9f.jpg`
- Public Asset: `/assets/goal-visualizations/physik/30ddb2d7-b991-55fe-9e74-37ffe1048f9f/30ddb2d7-b991-55fe-9e74-37ffe1048f9f.jpg`

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

Titel: Geradlinige Bewegung mit Reibung modellieren
Beschreibung: Die lernende Person kann geradlinige Bewegungen mit Reibung mithilfe von Kräftegrößen und einfachen Bewegungsgleichungen beschreiben und qualitativ vorhersagen.

Zusatzanweisung:
Pflichtinhalt:

Show one-dimensional motion with kinetic friction and the resulting acceleration.

Title: `Bewegung mit Reibung modellieren`

Main visual:
- one block sliding to the right on a horizontal rough surface
- draw exactly three horizontal arrows:
  - rightward applied force on the block labelled `F_Zug = 10 N`
  - leftward friction force on the block labelled `F_R = 4 N`
  - rightward acceleration arrow above the block labelled `a`
- the rightward acceleration arrow must be shorter than the rightward applied-force arrow
- do not draw vertical arrows

Calculation box:
- `F_res = F_Zug - F_R`
- `F_res = 10 N - 4 N = 6 N`
- `m = 2 kg`
- `a = F_res / m = 3 m/s^2`

Prediction note:
- `F_Zug > F_R -> schneller nach rechts`
- `F_Zug = F_R -> v konstant`

Vermeiden:

Do not draw friction to the right.
Do not draw acceleration to the left in this case.
Do not add normal-force or weight arrows.
Do not write `a = m / F_res`.
Do not make the resultant force zero in the main calculation.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
