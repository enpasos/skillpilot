# Lernzielvisualisierung: Methode: Videoanalyse von Bewegungen

## SkillPilot-Ziel

- SkillPilot-ID: `d67502e3-5e0a-595b-a24b-65b1c40de36e`
- Titel: Methode: Videoanalyse von Bewegungen
- Beschreibung: Digitale Erfassung von Ortskoordinaten in Videos. Standard-Szenarien: 1. Gleichförmige Bewegung (Fahrrad), 2. Wurfbewegung (Kugelstoß/Ballwurf) zur Analyse der Parabelbahn.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `d67502e3-5e0a-595b-a24b-65b1c40de36e.jpg`
- Public Asset: `/assets/goal-visualizations/physik/d67502e3-5e0a-595b-a24b-65b1c40de36e/d67502e3-5e0a-595b-a24b-65b1c40de36e.jpg`

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

Titel: Methode: Videoanalyse von Bewegungen
Beschreibung: Digitale Erfassung von Ortskoordinaten in Videos. Standard-Szenarien: 1. Gleichförmige Bewegung (Fahrrad), 2. Wurfbewegung (Kugelstoß/Ballwurf) zur Analyse der Parabelbahn.

Zusatzanweisung:
Pflichtinhalt:

Show the method of video analysis of motion using a simple bicycle example.

Title: `Videoanalyse von Bewegungen`

Left panel:
- show a simplified video frame with a horizontal meter scale; do not draw a detailed bicycle if it risks adding extra wheel points
- overlay exactly four red tracked points for one and the same moving marker, labelled `t=0 s`, `t=1 s`, `t=2 s`, `t=3 s`
- use only these four red points in the entire left panel; no other red dots, no red ground markers, no red vertical helper points
- the four tracked points should lie on a straight horizontal path with increasing `x`
- each time label must belong to exactly one red point
- do not use arrows between the tracked points

Middle panel:
- show a coordinate table:
  `t/s | x/m | y/m`
  `0 | 0 | 0`
  `1 | 2 | 0`
  `2 | 4 | 0`
  `3 | 6 | 0`

Right panel:
- show an `x-t-Diagramm` with horizontal axis `t/s` and vertical axis `x/m`
- plot the points `(0,0)`, `(1,2)`, `(2,4)`, `(3,6)` on a straight rising line
- do not add an extra point at `(4,8)`
- write `Steigung = Geschwindigkeit`

Vermeiden:

Regeneration correction: do not mark the front wheel and rear wheel of one bicycle as two different times. A time series must track one identical point through time.
Second regeneration correction: if necessary, omit the bicycle completely. A plain video frame with a ruler and exactly four red tracking dots is better than a detailed but ambiguous bicycle drawing.
Do not draw more than four red dots in the left panel.
Do not draw a curved path for the bicycle example.
Do not add arrowheads between video positions.
Do not draw leader arrows from text to graph points; use labels placed directly near the graph.
Do not swap `x` and `y` values in the table.
Do not make `y` increase for the horizontal bicycle motion.
Do not draw force arrows or acceleration arrows.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
