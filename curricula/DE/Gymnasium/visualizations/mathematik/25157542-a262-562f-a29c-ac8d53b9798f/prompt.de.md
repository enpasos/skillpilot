# Lernzielvisualisierung: Zustände in Markov-Ketten berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `25157542-a262-562f-a29c-ac8d53b9798f`
- Titel: Zustände in Markov-Ketten berechnen
- Beschreibung: Die lernende Person kann ausgehend von einem Anfangszustandsvektor mithilfe der Übergangsmatrix Zustände nach mehreren Schritten berechnen, auch rückwärts rechnen und die Ergebnisse im Kontext deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `25157542-a262-562f-a29c-ac8d53b9798f.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/25157542-a262-562f-a29c-ac8d53b9798f/25157542-a262-562f-a29c-ac8d53b9798f.jpg`

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

Titel: Zustände in Markov-Ketten berechnen
Beschreibung: Die lernende Person kann ausgehend von einem Anfangszustandsvektor mithilfe der Übergangsmatrix Zustände nach mehreren Schritten berechnen, auch rückwärts rechnen und die Ergebnisse im Kontext deuten.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration wegen Notationsrisiko: Das Bild muss die Zeilenvektor-Konvention konsequent zeigen.
- Thema: Zustaende in einer Markov-Kette berechnen.
- Verwende ausschliesslich die Zeilenvektor-Konvention:
  z_neu = z_alt * P.
- Zeichne alle Zustandsvektoren horizontal als Zeilenvektoren, nicht als Spaltenvektoren:
  z0 = [0,6  0,4].
  z1 = [0,50  0,50].
  z2 = [0,45  0,55].
- Verwende exakt:
  P = [ [0,7, 0,3],
        [0,2, 0,8] ].
- Rechne Schritt 1:
  z1 = z0*P.
  Erste Komponente: 0,6*0,7 + 0,4*0,2 = 0,42 + 0,08 = 0,50.
  Zweite Komponente: 0,6*0,3 + 0,4*0,8 = 0,18 + 0,32 = 0,50.
- Rechne Schritt 2:
  z2 = z1*P.
  Erste Komponente: 0,50*0,7 + 0,50*0,2 = 0,35 + 0,10 = 0,45.
  Zweite Komponente: 0,50*0,3 + 0,50*0,8 = 0,15 + 0,40 = 0,55.
- Deutung:
  Nach zwei Schritten liegen die Anteile bei 45 Prozent in Zustand A und 55 Prozent in Zustand B.
  Die Summe bleibt jeweils 1,0.

Vermeiden:
- Keine Zustandsvektoren als Spaltenvektoren zeichnen.
- Nicht P*z0 rechnen.
- Nicht die Reihenfolge zu z_neu = P*z_alt umdrehen.
- Nicht z1=[0,42 0,32] angeben; die Summanden muessen addiert werden.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
