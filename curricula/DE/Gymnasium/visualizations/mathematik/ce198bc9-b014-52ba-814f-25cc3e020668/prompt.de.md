# Lernzielvisualisierung: Einfache inverse Matrizen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `ce198bc9-b014-52ba-814f-25cc3e020668`
- Titel: Einfache inverse Matrizen bestimmen
- Beschreibung: Die lernende Person kann für einfache 2x2-Matrizen oder Diagonalmatrizen die Inverse bestimmen und das Ergebnis durch Multiplikation prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `ce198bc9-b014-52ba-814f-25cc3e020668.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ce198bc9-b014-52ba-814f-25cc3e020668/ce198bc9-b014-52ba-814f-25cc3e020668.jpg`

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

Titel: Einfache inverse Matrizen bestimmen
Beschreibung: Die lernende Person kann für einfache 2x2-Matrizen oder Diagonalmatrizen die Inverse bestimmen und das Ergebnis durch Multiplikation prüfen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Inverse einer einfachen 2x2-Matrix bestimmen und pruefen.
- Verwende exakt:
  A = [ [2, 1],
        [1, 1] ].
- Zeige den Determinantencheck:
  det(A) = 2*1 - 1*1 = 1, also ist A invertierbar.
- Verwende exakt:
  A^-1 = [ [1, -1],
           [-1, 2] ].
- Zeige die Probe:
  A*A^-1 =
  [ [2*1 + 1*(-1), 2*(-1) + 1*2],
    [1*1 + 1*(-1), 1*(-1) + 1*2] ]
  = [ [1, 0],
      [0, 1] ].
- Deutung:
  Eine Matrix und ihre Inverse ergeben bei der Multiplikation die Einheitsmatrix.

Vermeiden:
- Die Vorzeichen in A^-1 nicht vertauschen.
- Nicht det(A)=0 schreiben.
- Nicht A*A^-1=[0,1;1,0] oder eine andere Matrix als die Einheitsmatrix angeben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
