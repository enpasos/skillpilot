# Lernzielvisualisierung: Gerade-Gerade-Abstände im Raum bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `509ae03b-96b1-4bb1-b015-b83d14569dae`
- Titel: Gerade-Gerade-Abstände im Raum bestimmen
- Beschreibung: Die lernende Person kann Gerade-Gerade-Abstände im Raum, insbesondere im windschiefen Fall, mithilfe analytischer Verfahren bestimmen und geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `509ae03b-96b1-4bb1-b015-b83d14569dae.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/509ae03b-96b1-4bb1-b015-b83d14569dae/509ae03b-96b1-4bb1-b015-b83d14569dae.jpg`

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

Titel: Gerade-Gerade-Abstände im Raum bestimmen
Beschreibung: Die lernende Person kann Gerade-Gerade-Abstände im Raum, insbesondere im windschiefen Fall, mithilfe analytischer Verfahren bestimmen und geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Gerade-Gerade-Abstand im Raum fuer windschiefe Geraden bestimmen.
- Erzeuge eine klare Lernkarte mit zwei Bereichen:
  links eine schematische 3D-Projektion, rechts die Rechnung.
- Verwende exakt diese Geraden:
  g: X=(0,0,0)+s*(1,0,0).
  h: X=(0,0,3)+t*(0,1,0).
- In der Skizze:
  - Zeichne g als blaue waagerechte Gerade durch G=P=(0,0,0).
  - Zeichne h als rote Gerade durch H=Q=(0,0,3), deutlich nicht parallel zu g, zum Beispiel schraeg in die Tiefe.
  - H muss direkt ueber G liegen, verbunden durch eine einzige violette senkrechte Lotstrecke.
  - Zeichne genau eine violette Strecke von G nach H.
  - Beschrifte diese violette Strecke mit:
    GH=(0,0,3)
    d=|GH|=3
  - Beschrifte auf g den Richtungsvektor u=(1,0,0).
  - Beschrifte auf h den Richtungsvektor v=(0,1,0).
  - Markiere rechte Winkel zwischen der violetten Lotstrecke und beiden Geraden.
- In der Rechnung:
  n=u x v=(0,0,1)
  Q-P=(0,0,3)
  d=|((Q-P)*n)|/|n|=|3|/1=3
- Deutung:
  Die Geraden sind windschief: nicht parallel, kein Schnittpunkt.
  Die Lotstrecke GH steht senkrecht zu beiden Richtungsvektoren.

Gestaltung:
- Die Skizze ist eine schematische 3D-Projektion, keine 2D-Koordinatenzeichnung.
- Keine vollstaendige Achsenzeichnung verwenden, wenn sie die Lage unklar macht.
- Verwende Farben konsequent: g blau, h rot, GH violett, Rechnung schwarz.
- Der Normalenvektor n soll in der Rechenbox stehen, nicht als zweite Strecke zwischen G und H.

Vermeiden:
- g und h duerfen visuell nicht parallel aussehen.
- Keine diagonale Strecke als GH zeichnen.
- Keine zweite farbige Verbindungsstrecke in der Hauptskizze.
- Nicht zwei verschiedene Punkte mit derselben Koordinate (0,0,3) zeichnen.
- Nicht zwei verschiedene Punkte mit derselben Koordinate (0,0,0) zeichnen.
- Nicht einen Stuetzpunkt (0,2,3) verwenden.
- Nicht den Abstand zwischen beliebigen Stuetzpunkten verwenden.
- Nicht behaupten, die Geraden schneiden sich oder seien parallel.
- Nicht einen Abstand 0, sqrt(13) oder eine andere Zahl als 3 angeben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
