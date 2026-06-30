# Lernzielvisualisierung: Parameter periodischer Funktionen deuten

## SkillPilot-Ziel

- SkillPilot-ID: `ea8e3dfb-7fd7-5d49-ae07-01864e6aa464`
- Titel: Parameter periodischer Funktionen deuten
- Beschreibung: Die lernende Person kann Amplitude, Periodenlänge, Phasenverschiebung und vertikale Verschiebung interpretieren und entsprechende Parameter in Termen $y = a \cdot \sin(bx+c)+d$ bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `ea8e3dfb-7fd7-5d49-ae07-01864e6aa464.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ea8e3dfb-7fd7-5d49-ae07-01864e6aa464/ea8e3dfb-7fd7-5d49-ae07-01864e6aa464.jpg`

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

Titel: Parameter periodischer Funktionen deuten
Beschreibung: Die lernende Person kann Amplitude, Periodenlänge, Phasenverschiebung und vertikale Verschiebung interpretieren und entsprechende Parameter in Termen $y = a \cdot \sin(bx+c)+d$ bestimmen.

Zusatzanweisung:
Pflichtinhalt:

- Show the general form `y = a * sin(bx + c) + d`.
- Use one concrete example: `y = 2*sin(0,5x - pi/2) + 1`.
- Label `a=2` as amplitude `2`, vertical distance from midline `y=1` to peak `y=3`.
- Label `d=1` as vertical shift / midline `y=1`.
- Label `b=0,5` with period `T = 2pi / 0,5 = 4pi`.
- Label `c=-pi/2` as phase shift to the right by `pi`.
- Draw a sine wave matching these labels: midline `y=1`, maximum `3`, minimum `-1`, period `4pi`.

Vermeiden:

- Do not mark amplitude as peak-to-trough height `4`.
- Do not use period `2pi` for this example.
- Do not put the midline at `y=0`.
- Do not shift the graph left when the note says right by `pi`.
- Do not include technical IDs, filenames, watermarks, or brand names.

Regeneration-Zusatz:

- The graph must match `y = 2*sin(0,5x - pi/2) + 1` exactly.
- Mark these key points explicitly: `(pi,1)` rising through the midline, `(2pi,3)` maximum, `(3pi,1)` falling through the midline, `(4pi,-1)` minimum, `(5pi,1)` rising through the midline, `(6pi,3)` next maximum.
- Draw the period bracket only from `x=2pi` to `x=6pi`, labeled `4pi`.
- Do not place a minimum at `3pi`.
- Do not place a second maximum before `6pi`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
