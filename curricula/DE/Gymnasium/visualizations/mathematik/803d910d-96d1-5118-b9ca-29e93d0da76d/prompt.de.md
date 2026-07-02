# Lernzielvisualisierung: Parallelprojektionen auf Ursprungsebenen mit Matrizen darstellen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `803d910d-96d1-5118-b9ca-29e93d0da76d`
- Titel: Parallelprojektionen auf Ursprungsebenen mit Matrizen darstellen (LK)
- Beschreibung: Die lernende Person kann Abbildungsmatrizen für Parallelprojektionen auf beliebige Ursprungsebenen im $\mathbb{R}^3$ untersuchen und bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `803d910d-96d1-5118-b9ca-29e93d0da76d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/803d910d-96d1-5118-b9ca-29e93d0da76d/803d910d-96d1-5118-b9ca-29e93d0da76d.jpg`

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

Titel: Parallelprojektionen auf Ursprungsebenen mit Matrizen darstellen (LK)
Beschreibung: Die lernende Person kann Abbildungsmatrizen für Parallelprojektionen auf beliebige Ursprungsebenen im $\mathbb{R}^3$ untersuchen und bestimmen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Parallelprojektion auf eine Ursprungsebene im dreidimensionalen Raum mit einer Matrix darstellen.
- Verwende die Parallelprojektion auf die xy-Ebene entlang der z-Richtung.
- Zeige die Projektionsmatrix exakt:
  P_xy = [ [1, 0, 0],
           [0, 1, 0],
           [0, 0, 0] ].
- Zeige die Wirkung auf einen Punkt:
  A = (2, -1, 3).
  A' = P_xy * [2; -1; 3] = [2; -1; 0], also A'=(2,-1,0).
- Visualisiere:
  Die xy-Ebene als Ebene z=0.
  Punkt A oberhalb oder unterhalb der Ebene.
  Ein Projektionspfeil parallel zur z-Achse von A nach A'.
- Zeige eine zweite kurze Deutung:
  x und y bleiben gleich; z wird auf 0 gesetzt.
  Alle Punkte mit gleichen x- und y-Koordinaten landen auf demselben Bildpunkt.

Vermeiden:
- Nicht orthogonal auf eine Gerade projizieren; hier wird auf die xy-Ebene projiziert.
- Nicht auf die yz- oder xz-Ebene projizieren.
- Nicht A'=(0,-1,3) oder A'=(2,0,3) angeben; korrekt ist A'=(2,-1,0).
- Der Projektionspfeil muss parallel zur z-Achse wirken.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
