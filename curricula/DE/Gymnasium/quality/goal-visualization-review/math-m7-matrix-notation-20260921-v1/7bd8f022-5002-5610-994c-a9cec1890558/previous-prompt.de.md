# Lernzielvisualisierung: Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `7bd8f022-5002-5610-994c-a9cec1890558`
- Titel: Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)
- Beschreibung: Die lernende Person kann Abbildungsmatrizen für Drehungen um die Koordinatenachsen im $\mathbb{R}^3$ untersuchen und bestimmen sowie Bildpunkte berechnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `7bd8f022-5002-5610-994c-a9cec1890558.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/7bd8f022-5002-5610-994c-a9cec1890558/7bd8f022-5002-5610-994c-a9cec1890558.jpg`

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

Titel: Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)
Beschreibung: Die lernende Person kann Abbildungsmatrizen für Drehungen um die Koordinatenachsen im $\mathbb{R}^3$ untersuchen und bestimmen sowie Bildpunkte berechnen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Drehung um eine Koordinatenachse im dreidimensionalen Raum mit einer Matrix darstellen.
- Verwende die Drehung um die z-Achse um 90 Grad gegen den Uhrzeigersinn, von oben auf die xy-Ebene betrachtet.
- Zeige die Matrix exakt:
  R_z(90 Grad) = [ [0, -1, 0],
                   [1,  0, 0],
                   [0,  0, 1] ].
- Zeige die Wirkung auf Basisvektoren:
  e_x = (1,0,0) wird zu e_y = (0,1,0).
  e_y = (0,1,0) wird zu (-1,0,0).
  e_z = (0,0,1) bleibt (0,0,1).
- Teste mit einem Punkt:
  P = (2,1,3).
  P' = R_z * [2;1;3] = [-1;2;3], also P'=(-1,2,3).
- Visualisiere die Drehung in der xy-Ebene mit unveraenderter z-Hoehe.

Vermeiden:
- Nicht um die x- oder y-Achse drehen; es muss die z-Achse sein.
- Nicht das Vorzeichen vertauschen: korrekt ist P'=(-1,2,3), nicht (1,-2,3).
- Die z-Koordinate darf sich bei dieser Drehung nicht aendern.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
