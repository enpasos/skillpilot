# Lernzielvisualisierung: Matrix-Vektor-Produkte berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `6f09c97e-779b-500b-8092-3fb9696aa5bb`
- Titel: Matrix-Vektor-Produkte berechnen
- Beschreibung: Die lernende Person kann das Produkt einer Matrix mit einem Vektor bestimmen und das Ergebnis als neuen Zustandsvektor interpretieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `6f09c97e-779b-500b-8092-3fb9696aa5bb.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/6f09c97e-779b-500b-8092-3fb9696aa5bb/6f09c97e-779b-500b-8092-3fb9696aa5bb.jpg`

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

Titel: Matrix-Vektor-Produkte berechnen
Beschreibung: Die lernende Person kann das Produkt einer Matrix mit einem Vektor bestimmen und das Ergebnis als neuen Zustandsvektor interpretieren.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Matrix-Vektor-Produkt berechnen und als neuen Zustandsvektor deuten.
- Verwende exakt:
  P = [ [0,8, 0,3],
        [0,2, 0,7] ].
  x0 = [70; 30].
- Rechne:
  x1 = P*x0.
  Erste Komponente: 0,8*70 + 0,3*30 = 56 + 9 = 65.
  Zweite Komponente: 0,2*70 + 0,7*30 = 14 + 21 = 35.
  x1 = [65; 35].
- Visualisiere:
  Jede Zeile der Matrix wird mit dem Spaltenvektor verrechnet.
  Pfeile von der ersten Matrixzeile zur ersten Ergebnis-Komponente und von der zweiten Matrixzeile zur zweiten Ergebnis-Komponente.
- Deutung:
  Der neue Zustandsvektor hat die Komponenten 65 und 35.

Vermeiden:
- Nicht die Matrixeintraege nur einzeln neben den Vektor schreiben; die Zeilenprodukte muessen sichtbar sein.
- Nicht Zeilen und Spalten vertauschen.
- Nicht x1=[56;21] oder x1=[65;65] angeben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
