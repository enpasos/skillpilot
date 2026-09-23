# Lernzielvisualisierung: Winkel zwischen zwei Ebenen berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `bda6a659-9640-53a5-8be0-24705ab623ef`
- Titel: Winkel zwischen zwei Ebenen berechnen
- Beschreibung: Die lernende Person kann den Winkel zwischen zwei Ebenen mithilfe geeigneter Normalenvektoren berechnen und als Schnittwinkel der Ebenen geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `bda6a659-9640-53a5-8be0-24705ab623ef.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/bda6a659-9640-53a5-8be0-24705ab623ef/bda6a659-9640-53a5-8be0-24705ab623ef.jpg`

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

Titel: Winkel zwischen zwei Ebenen berechnen
Beschreibung: Die lernende Person kann den Winkel zwischen zwei Ebenen mithilfe geeigneter Normalenvektoren berechnen und als Schnittwinkel der Ebenen geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Winkel zwischen zwei Ebenen mit Normalenvektoren berechnen.
- Zeige zwei Ebenen:
  E: x = 0 mit Normalenvektor n_E = (1,0,0).
  F: x + y = 0 mit Normalenvektor n_F = (1,1,0).
- Die Ebenen schneiden sich in der z-Achse.
- Beschrifte die Schnittgerade eindeutig als g: x = 0, y = 0 (z-Achse).
- Beschrifte x + y = 0 ausschliesslich als Gleichung der Ebene F, niemals als Gleichung der Schnittgeraden.
- Berechnung:
  cos(phi) = |n_E * n_F| / (|n_E| * |n_F|).
  n_E * n_F = 1.
  |n_E| = 1.
  |n_F| = sqrt(2).
  cos(phi) = 1/sqrt(2).
  phi = 45 Grad.
- Deutung:
  Der Ebenenwinkel ist der spitze Winkel zwischen den Ebenen, gemessen senkrecht zur Schnittgeraden.
- Zeichne die Normalenvektoren und den Ebenenwinkel nicht als beliebigen Raumwinkel, sondern passend zur Schnittgeraden.
- Bevorzuge eine klare Zweiteilung:
  1. Links eine Schnittansicht senkrecht zur z-Achse beziehungsweise in der xy-Ebene: Spur von E ist x=0, Spur von F ist x+y=0, markierter Winkel 45 Grad.
  2. Rechts ein separates Normalenvektor-Diagramm in der xy-Ebene: n_E=(1,0,0) zeigt exakt in positive x-Richtung; n_F=(1,1,0) zeigt diagonal zwischen positiver x- und positiver y-Richtung.
- Falls du zusaetzlich eine 3D-Skizze der Ebenen zeichnest, zeichne dort keine Normalenvektoren ein. Die Normalenvektoren gehoeren dann nur ins separate 2D-Vektordiagramm.
- Finale Darstellungsprioritaet: Verwende am besten nur ein sauberes 2D-Normalenvektor-Diagramm plus Rechnung, keine 3D-Szene und keine linke Schnittansicht mit falsch gesetztem Winkelbogen.
- Im 2D-Normalenvektor-Diagramm:
  - x-Achse waagerecht nach rechts, y-Achse senkrecht nach oben.
  - n_E=(1,0,0) als Pfeil exakt auf der positiven x-Achse.
  - n_F=(1,1,0) als Pfeil exakt diagonal bei 45 Grad zwischen positiver x- und y-Achse.
  - Markiere phi=45 Grad ausschliesslich als Winkel zwischen n_E und n_F.
  - Erwaehne die Schnittgerade nur als Text: g: x=0, y=0 (z-Achse).

Vermeiden:
- Nicht 90 Grad angeben.
- Nicht den Winkel zwischen einer Ebene und einer Achse berechnen.
- Die Normalenvektoren nicht mit Richtungsvektoren der Schnittgeraden verwechseln.
- Die Schnittgerade nicht nur mit x + y = 0 beschriften; das ist fachlich unvollstaendig und irrefuehrend.
- n_E=(1,0,0) niemals vertikal, niemals parallel zur z-Achse und niemals innerhalb der Ebene E zeichnen.
- n_F=(1,1,0) niemals als Vektor mit z-Anteil zeichnen.
- Keinen 45-Grad-Winkelbogen zwischen x- und y-Achse zeichnen, wenn damit nicht exakt der Winkel zwischen n_E und n_F gemeint ist.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
