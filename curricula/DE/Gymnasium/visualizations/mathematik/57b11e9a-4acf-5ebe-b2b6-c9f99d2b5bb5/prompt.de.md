# Lernzielvisualisierung: Schnittwinkel über Richtungs- und Normalenvektoren bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5`
- Titel: Schnittwinkel über Richtungs- und Normalenvektoren bestimmen
- Beschreibung: Die lernende Person kann für eine gegebene Gerade-Ebene-Konfiguration den Schnittwinkel mithilfe von Richtungs- und Normalenvektoren berechnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5/57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5.jpg`

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

Titel: Schnittwinkel über Richtungs- und Normalenvektoren bestimmen
Beschreibung: Die lernende Person kann für eine gegebene Gerade-Ebene-Konfiguration den Schnittwinkel mithilfe von Richtungs- und Normalenvektoren berechnen.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration wegen Achsenfehler: Bei der Ebene E: z=0 muss die senkrechte Normalenrichtung als z-Achse beschriftet sein, nicht als y-Achse.
- Thema: Schnittwinkel zwischen Gerade und Ebene mit Richtungs- und Normalenvektor bestimmen.
- Verwende exakt:
  Ebene E: z=0,
  Normalenvektor n=(0; 0; 1),
  Gerade g: X=(0; 0; 0)+t*(1; 0; 1),
  Richtungsvektor v=(1; 0; 1).
- Zeichne:
  Die Ebene E als horizontale xy-Ebene.
  x- und y-Achse liegen in der Ebene E.
  Die z-Achse steht senkrecht nach oben; der Normalenvektor n=(0;0;1) liegt auf dieser z-Richtung.
  Die Gerade g steigt aus der Ebene heraus.
  Zeichne den Schnittwinkel alpha als Winkel zwischen der Geraden g und ihrer Projektion in der Ebene E.
- Berechnung:
  |v*n| = 1.
  |v|=sqrt(2), |n|=1.
  sin(alpha)=|v*n|/(|v|*|n|)=1/sqrt(2).
  alpha=45 Grad.
- Deutung:
  alpha=0 Grad bedeutet parallel zur Ebene.
  alpha=90 Grad bedeutet senkrecht zur Ebene.

Vermeiden:
- Die vertikale Achse nicht als y beschriften; sie muss z heissen.
- Nicht alpha als Winkel zwischen Normalenvektor n und Ebene zeichnen.
- Nicht alpha=0 Grad oder alpha=90 Grad als Ergebnis angeben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
