# Lernzielvisualisierung: Abbildungsmatrix aus Basisbildern bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `8dc2c87a-cfc6-5f15-89e5-634107f5c9c7`
- Titel: Abbildungsmatrix aus Basisbildern bestimmen
- Beschreibung: Die lernende Person kann die Abbildungsmatrix einer linearen Abbildung bezüglich der Standardbasis bestimmen, indem sie die Koordinatenvektoren der Bilder der geordneten Standardbasis in derselben Reihenfolge als Spalten anordnet.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `8dc2c87a-cfc6-5f15-89e5-634107f5c9c7.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/8dc2c87a-cfc6-5f15-89e5-634107f5c9c7/8dc2c87a-cfc6-5f15-89e5-634107f5c9c7.jpg`

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

Titel: Abbildungsmatrix aus Basisbildern bestimmen
Beschreibung: Die lernende Person kann die Abbildungsmatrix einer linearen Abbildung bezüglich der Standardbasis bestimmen, indem sie die Koordinatenvektoren der Bilder der geordneten Standardbasis in derselben Reihenfolge als Spalten anordnet.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Aus den Bildern der Basisvektoren die Abbildungsmatrix bestimmen.
- Erstelle eine tabellarische Infografik ohne Koordinatengitter und ohne geometrische Pfeile.
- Verwende Spaltenvektoren.
- Linke Tabelle: Basisvektor und Bildvektor
  e1 = [1; 0]  ->  f(e1) = u = [2; 1]
  e2 = [0; 1]  ->  f(e2) = v = [-1; 3]
- Mittlerer Merksatz:
  Die Bildvektoren der Basisvektoren werden als Spalten in die Matrix eingetragen.
- Rechte Matrix:
  A = [ u  v ] = [ [2, -1],
                   [1,  3] ].
  Markiere die erste Spalte [2;1] orange fuer u.
  Markiere die zweite Spalte [-1;3] violett fuer v.
- Untere Testrechnung:
  x = [4; 2]
  A*x = [ [2, -1],
          [1,  3] ] * [4; 2]
      = [2*4 + (-1)*2; 1*4 + 3*2]
      = [6; 10].

Vermeiden:
- Keine Koordinatengitter, keine Pfeile, keine gezeichneten Punkte; nur Tabellen, Spaltenvektoren und Matrixrechnung.
- Nicht die Basisbilder als Zeilen eintragen; sie muessen Spalten der Matrix sein.
- Nicht A = [ [2, 1], [-1, 3] ] schreiben.
- Nicht mit Zeilenvektoren rechnen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
