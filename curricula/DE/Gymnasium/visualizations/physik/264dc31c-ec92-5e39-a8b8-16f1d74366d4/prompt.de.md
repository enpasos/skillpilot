# Lernzielvisualisierung: Methode: Linearisierung von Messkurven

## SkillPilot-Ziel

- SkillPilot-ID: `264dc31c-ec92-5e39-a8b8-16f1d74366d4`
- Titel: Methode: Linearisierung von Messkurven
- Beschreibung: Die lernende Person kann nichtlineare Messdaten durch geeignete Transformationen linearisieren, Geraden anpassen und Parameter deuten (z. B. $s\sim t^2$, Einstein-Gerade).

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `264dc31c-ec92-5e39-a8b8-16f1d74366d4.jpg`
- Public Asset: `/assets/goal-visualizations/physik/264dc31c-ec92-5e39-a8b8-16f1d74366d4/264dc31c-ec92-5e39-a8b8-16f1d74366d4.jpg`

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

Titel: Methode: Linearisierung von Messkurven
Beschreibung: Die lernende Person kann nichtlineare Messdaten durch geeignete Transformationen linearisieren, Geraden anpassen und Parameter deuten (z. B. $s\sim t^2$, Einstein-Gerade).

Zusatzanweisung:
Pflichtinhalt:

Show linearisierung of a measurement curve in two side-by-side graphs.

Left graph: `Messkurve: s gegen t`
- horizontal axis `t`
- vertical axis `s`
- plot a smooth upward-curving curve through points approximately `(0,0)`, `(1,1)`, `(2,4)`, `(3,9)`
- label `nichtlinear`

Right graph: `Linearisierung: s gegen t^2`
- horizontal axis `t^2`
- vertical axis `s`
- plot the transformed points on a straight rising line through approximately `(0,0)`, `(1,1)`, `(4,4)`, `(9,9)`
- label `Gerade: Parameter aus Steigung`

Bottom note:
- `wenn s proportional t^2, dann s gegen t^2 auftragen`

Vermeiden:

Do not draw a straight line in the left `s gegen t` graph.
Do not draw a curved line in the right `s gegen t^2` graph.
Do not swap the axis labels.
Do not use `v` or `a` axes.
Do not draw physical arrows between points.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
