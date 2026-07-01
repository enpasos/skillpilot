# Lernzielvisualisierung: Volumen von Spaten und Tetraedern mit Spatprodukt berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `a594dec0-3977-5c43-9432-d4254a7f6130`
- Titel: Volumen von Spaten und Tetraedern mit Spatprodukt berechnen
- Beschreibung: Die lernende Person kann Volumina von Spaten (Parallelepipeden) und Tetraedern aus Koordinaten mithilfe des Spatprodukts bestimmen ($V_{Spat} = |\vec{a} \cdot (\vec{b} \times \vec{c})|$, $V_{Tet} = \frac{1}{6} V_{Spat}$) und passende Kantenvektoren wählen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `a594dec0-3977-5c43-9432-d4254a7f6130.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/a594dec0-3977-5c43-9432-d4254a7f6130/a594dec0-3977-5c43-9432-d4254a7f6130.jpg`

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

Titel: Volumen von Spaten und Tetraedern mit Spatprodukt berechnen
Beschreibung: Die lernende Person kann Volumina von Spaten (Parallelepipeden) und Tetraedern aus Koordinaten mithilfe des Spatprodukts bestimmen ($V_{Spat} = |\vec{a} \cdot (\vec{b} \times \vec{c})|$, $V_{Tet} = \frac{1}{6} V_{Spat}$) und passende Kantenvektoren wählen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Volumen von Spat und Tetraeder mit dem Spatprodukt berechnen.
- Zeige drei Kantenvektoren von einem gemeinsamen Punkt O:
  a=(2,0,0),
  b=(0,3,0),
  c=(0,0,4).
- Zeige links den aufgespannten Spat als transparenten Quader.
- Zeige rechts das Tetraeder mit den Eckpunkten O, A, B, C.
- Rechnung:
  b x c=(12,0,0).
  a*(b x c)=24.
  V_Spat=|a*(b x c)|=24.
  V_Tet=1/6*V_Spat=4.
- Beschrifte die Kantenvektoren und die beiden Volumina klar.

Vermeiden:
- Das Tetraedervolumen nicht als 1/3 des Spatvolumens angeben.
- Nicht den Betrag beim Spatvolumen vergessen.
- Nicht 12 oder 24 als Tetraedervolumen angeben.
- Keine Pyramidenformel ohne Bezug zum Spatprodukt als Hauptrechnung.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
