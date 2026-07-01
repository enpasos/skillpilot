# Lernzielvisualisierung: Bildpunkte mit Matrizen berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `4d331ba0-56d6-5730-a51b-e3d1126b31ba`
- Titel: Bildpunkte mit Matrizen berechnen
- Beschreibung: Die lernende Person kann zu einer gegebenen Abbildungsmatrix Bildpunkte berechnen, indem sie Vektoren mit der Matrix multipliziert.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `4d331ba0-56d6-5730-a51b-e3d1126b31ba.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/4d331ba0-56d6-5730-a51b-e3d1126b31ba/4d331ba0-56d6-5730-a51b-e3d1126b31ba.jpg`

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

Titel: Bildpunkte mit Matrizen berechnen
Beschreibung: Die lernende Person kann zu einer gegebenen Abbildungsmatrix Bildpunkte berechnen, indem sie Vektoren mit der Matrix multipliziert.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration wegen Darstellungsrisiko: Keine Flaechen, keine Polygone, keine zusaetzlichen Eckpunkte. Zeige nur die drei gegebenen Punkte und ihre drei Bildpunkte.
- Thema: Bildpunkte mit einer Abbildungsmatrix berechnen.
- Verwende exakt die Scherungsmatrix:
  A = [ [1, 1],
        [0, 1] ].
- Verwende Spaltenvektoren fuer Punkte:
  P = (2,1), Q = (0,2), R = (-1,1).
- Berechne:
  P' = A*[2;1] = [1*2 + 1*1; 0*2 + 1*1] = [3;1], also P'=(3,1).
  Q' = A*[0;2] = [1*0 + 1*2; 0*0 + 1*2] = [2;2], also Q'=(2,2).
  R' = A*[-1;1] = [1*(-1) + 1*1; 0*(-1) + 1*1] = [0;1], also R'=(0,1).
- Visualisiere:
  Links nur drei einzelne Originalpunkte P, Q, R in einem Koordinatensystem.
  Rechts nur drei einzelne Bildpunkte P', Q', R' in einem Koordinatensystem.
  Kleine Pfeile zeigen P->P', Q->Q', R->R'.
  Die y-Koordinaten bleiben gleich: 1, 2, 1.
- Deutung:
  Die Matrix berechnet zu jedem Punkt seinen Bildpunkt.

Vermeiden:
- Keine gefuellte Flaeche, kein Dreieck, kein Viereck, kein Parallelogramm.
- Keine unbeschrifteten Zusatzpunkte.
- Nicht mit Zeilenvektoren rechnen; hier werden Punkte als Spaltenvektoren benutzt.
- Nicht P'=(2,1), Q'=(0,2) oder R'=(-2,1) angeben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
