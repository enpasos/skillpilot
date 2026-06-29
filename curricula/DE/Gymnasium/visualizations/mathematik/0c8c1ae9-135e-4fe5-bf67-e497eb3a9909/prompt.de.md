# Lernzielvisualisierung: Sinussatz herleiten

## SkillPilot-Ziel

- SkillPilot-ID: `0c8c1ae9-135e-4fe5-bf67-e497eb3a9909`
- Titel: Sinussatz herleiten
- Beschreibung: Die lernende Person kann den Sinussatz in einem allgemeinen Dreieck mithilfe von Höhenzerlegungen herleiten und die entstehenden Seiten-Winkel-Verhältnisse nachvollziehbar begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `0c8c1ae9-135e-4fe5-bf67-e497eb3a9909.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/0c8c1ae9-135e-4fe5-bf67-e497eb3a9909/0c8c1ae9-135e-4fe5-bf67-e497eb3a9909.jpg`

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

Titel: Sinussatz herleiten
Beschreibung: Die lernende Person kann den Sinussatz in einem allgemeinen Dreieck mithilfe von Höhenzerlegungen herleiten und die entstehenden Seiten-Winkel-Verhältnisse nachvollziehbar begründen.

Zusatzanweisung:
Erzeuge eine fachlich genaue Infografik zur Herleitung des Sinussatzes.

Pflichtinhalt:
- Zeige ein allgemeines, nicht rechtwinkliges Dreieck `ABC`.
- Beschrifte wie ueblich:
  - Seite `a = BC` gegenueber Winkel `alpha` bei `A`
  - Seite `b = CA` gegenueber Winkel `beta` bei `B`
  - Seite `c = AB` gegenueber Winkel `gamma` bei `C`
- Zeichne die Hoehe `h` von `C` auf die Grundseite `AB`; der Fusspunkt ist `H`.
- Zerlege das Dreieck dadurch in zwei rechtwinklige Dreiecke.
- Zeige die beiden Gleichungen:
  - `sin(alpha) = h / b`, also `h = b * sin(alpha)`
  - `sin(beta) = h / a`, also `h = a * sin(beta)`
- Fuehre daraus sichtbar her:
  - `a * sin(beta) = b * sin(alpha)`
  - `a / sin(alpha) = b / sin(beta)`
- Zeige als Zielzeile: `a/sin(alpha) = b/sin(beta) = c/sin(gamma)`.

Vermeiden:
- Nicht so tun, als sei das Ausgangsdreieck rechtwinklig.
- Vertausche Seiten und Gegenwinkel nicht.
- Benutze keine Kosinusformel und keinen Pythagoras als Hauptidee.
- Keine falsche Zielzeile wie `sin(alpha)/a = b/sin(beta)` ohne erkennbare Gleichwertigkeit.
- Keine technischen IDs, keine Wasserzeichen.

Layout:
- Schuelerfreundlicher Tafelstil mit farbiger Hoehe `h` und klarer Ableitung in drei kurzen Zeilen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
