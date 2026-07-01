# Lernzielvisualisierung: Schnittgerade zweier Ebenen bestimmen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `857c1c46-5d94-5dfb-9697-9a9fd04103c3`
- Titel: Schnittgerade zweier Ebenen bestimmen (LK)
- Beschreibung: Die lernende Person kann die Schnittgerade zweier Ebenen berechnen, in Parameterform angeben und die Lage begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `857c1c46-5d94-5dfb-9697-9a9fd04103c3.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/857c1c46-5d94-5dfb-9697-9a9fd04103c3/857c1c46-5d94-5dfb-9697-9a9fd04103c3.jpg`

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

Titel: Schnittgerade zweier Ebenen bestimmen (LK)
Beschreibung: Die lernende Person kann die Schnittgerade zweier Ebenen berechnen, in Parameterform angeben und die Lage begründen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Schnittgerade zweier Ebenen bestimmen.
- Verwende exakt:
  E1: x + y + z = 3,
  E2: x - y + z = 1.
- Normalenvektoren:
  n1=(1;1;1),
  n2=(1;-1;1).
  n1 und n2 sind keine Vielfachen, also schneiden sich die Ebenen in einer Geraden.
- Rechnung:
  E1 - E2: 2y = 2 -> y=1.
  In E1: x + 1 + z = 3 -> x + z = 2.
  Setze z=t.
  Dann x=2-t.
- Schnittgerade:
  s: X=(2;1;0)+t*(-1;0;1), t in R.
- Kontrolliere sichtbar:
  Fuer t=0 ist P=(2;1;0) und P liegt in beiden Ebenen.
  Richtungsvektor r=(-1;0;1) liegt in beiden Ebenen, denn n1*r=0 und n2*r=0.
- Zeige eine 3D-Skizze mit zwei Ebenen und einer deutlich markierten Schnittgeraden s.

Vermeiden:
- Nicht nur einen Schnittpunkt zeigen; zwei nicht parallele Ebenen schneiden sich in einer Geraden.
- Nicht r=(1;0;1) verwenden, denn dann gilt x+z nicht konstant 2.
- Nicht behaupten, die Ebenen seien parallel.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
