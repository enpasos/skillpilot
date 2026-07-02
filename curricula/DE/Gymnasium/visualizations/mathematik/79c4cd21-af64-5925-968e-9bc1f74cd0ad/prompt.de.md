# Lernzielvisualisierung: Lotfußpunktverfahren zur Punkt-Ebene-Abstandsbestimmung anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `79c4cd21-af64-5925-968e-9bc1f74cd0ad`
- Titel: Lotfußpunktverfahren zur Punkt-Ebene-Abstandsbestimmung anwenden
- Beschreibung: Die lernende Person kann ein Lotfußpunktverfahren erarbeiten und anwenden, um den Abstand eines Punktes von einer Ebene zu bestimmen und geometrisch zu begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `79c4cd21-af64-5925-968e-9bc1f74cd0ad.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/79c4cd21-af64-5925-968e-9bc1f74cd0ad/79c4cd21-af64-5925-968e-9bc1f74cd0ad.jpg`

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

Titel: Lotfußpunktverfahren zur Punkt-Ebene-Abstandsbestimmung anwenden
Beschreibung: Die lernende Person kann ein Lotfußpunktverfahren erarbeiten und anwenden, um den Abstand eines Punktes von einer Ebene zu bestimmen und geometrisch zu begründen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Lotfusspunktverfahren fuer den Abstand eines Punktes von einer Ebene.
- Zeige die Ebene
  E: x + 2y + 2z = 9
  mit Normalenvektor n = (1,2,2).
- Punkt:
  P(4|2|5).
- Lotgerade durch P:
  l: x = P + t*n = (4,2,5) + t*(1,2,2).
- Einsetzen in die Ebene:
  (4+t) + 2*(2+2t) + 2*(5+2t) = 9.
  18 + 9t = 9.
  t = -1.
- Lotfusspunkt:
  F = (4,2,5) - (1,2,2) = (3,0,3).
- Abstand:
  d(P,E) = |PF| = |(1,2,2)| = sqrt(1+4+4) = 3.
- Zeichne PF senkrecht zur Ebene und parallel zum Normalenvektor.
- Es darf nur einen Fusspunkt auf der Ebene geben: F=(3,0,3).
- Zeichne keine zusaetzliche senkrechte gestrichelte Projektion von P auf einen anderen Punkt der Ebene.
- Setze die Rechtwinkelsmarkierung direkt am Lotfusspunkt F.
- Wenn ein Normalenvektor-Pfeil gezeichnet wird, muss er exakt parallel zur Lotgeraden PF verlaufen und dieselbe sichtbare Richtung/Slope wie die Lotgerade haben.
- Wenn diese Parallelitaet in der 3D-Perspektive nicht eindeutig darstellbar ist, lasse den separaten Normalenvektor-Pfeil weg und zeige nur die Gleichung n=(1,2,2) im Rechenfeld.
- Finale Darstellungsprioritaet: Verwende lieber eine abstrakte 2D-Seitenansicht statt einer perspektivischen 3D-Ebene.
- In dieser 2D-Seitenansicht:
  - Ebene E als horizontales blaues Band oder horizontale Linie, beschriftet mit E: x+2y+2z=9 (schematische Seitenansicht).
  - P(4|2|5) liegt oberhalb der Ebene.
  - F(3|0|3) liegt direkt auf der Ebene.
  - Das einzige geometrische Verbindungssegment ist die rote Lotgerade PF.
  - PF steht mit Rechtwinkelsymbol bei F senkrecht auf der Ebene.
  - Der Normalenvektor n=(1,2,2) liegt entweder genau auf PF oder wird als kleiner Pfeil direkt parallel zu PF gezeichnet.
  - Keine Koordinatenachsen, keine 3D-Perspektive, keine weitere gestrichelte Hilfsstrecke.

Vermeiden:
- Den Lotfusspunkt nicht als beliebigen Punkt in der Ebene waehlen; er muss F=(3,0,3) sein.
- Keinen zweiten gruenden oder markierten Punkt auf der Ebene zeichnen, der als weiterer Lotfusspunkt verstanden werden koennte.
- Keinen Normalenvektor-Pfeil zeichnen, der eine andere Richtung als die Lotgerade PF hat.
- Keine vertikale Lotgerade zeichnen, wenn der Normalenvektor daneben eine andere Richtung hat.
- Das Vorzeichen t=-1 nicht zu t=1 machen.
- Den Abstand nicht als 9 oder sqrt(18) angeben; korrekt ist 3.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
