# Lernzielvisualisierung: Informationen aus Darstellungen entnehmen

## SkillPilot-Ziel

- SkillPilot-ID: `cf4fe700-dec2-502f-888b-90acefa307bb`
- Titel: Informationen aus Darstellungen entnehmen
- Beschreibung: Die lernende Person kann aus einer Darstellung relevante Informationen entnehmen (z. B. Nullstellen, Steigungen, Schnittpunkte) und in Worten oder Symbolen formulieren.

## Generator

- Provider: OpenAI integrierte Bildgenerierung (image_gen)
- Status: pilot
- Quellbild: `cf4fe700-dec2-502f-888b-90acefa307bb.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/cf4fe700-dec2-502f-888b-90acefa307bb/cf4fe700-dec2-502f-888b-90acefa307bb.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Informationen aus Darstellungen entnehmen
Beschreibung: Die lernende Person kann aus einer Darstellung relevante Informationen entnehmen (z. B. Nullstellen, Steigungen, Schnittpunkte) und in Worten oder Symbolen formulieren.

Zusatzanweisung:
Pflichtinhalt:
- Korrigiere die Vorlage zu einer klaren Infografik über das Ablesen von Informationen aus einem linearen Graphen.
- Sichtbare Überschrift exakt: "Informationen aus einem Graphen ablesen".
- Zeichne die Gerade "y = 2x + 1" exakt durch die markierten Punkte "(0|1)" und "(2|5)".
- Das Steigungsdreieck muss geometrisch exakt passen: waagerechte Strecke von (0|1) nach (2|1) mit Label "Δx = 2"; senkrechte Strecke von (2|1) nach (2|5) mit Label "Δy = 4"; rechter Winkel bei (2|1).
- Zeige neben dem Dreieck exakt "m = Δy / Δx = 4 / 2 = 2".
- Drei kurze Ergebnisfelder rechts, nach der Höhe ihres jeweiligen Belegs angeordnet: oben "Punkt bei x = 2: (2|5)", mittig "Steigung: 2", unten "y-Achsenabschnitt: 1".
- Verbinde jeden Beleg genau mit seiner Aussage: Der obere Pfeil beginnt direkt am markierten Punkt `(2|5)`, der mittlere direkt rechts neben der Steigungsrechnung und der untere direkt am markierten Punkt `(0|1)`.
- Jeder Pfeil beginnt mit einem flachen oder weich gerundeten Schaftende und besitzt genau eine Pfeilspitze an der zugehörigen Ergebnisbox. Die Pfeile dürfen sich nicht kreuzen.
- Achsen, Skala, Punkte, Rechnung, Pfeilquellen und Ergebnisfelder müssen eindeutig zusammenpassen.

Vermeiden:
- Keine Steigungsdreiecke, deren gezeichnete Längen nicht zu Δx = 2 und Δy = 4 passen.
- Keine zusätzlichen Punkte, Nullstellen, Schnittpunkte oder Zahlen.
- Keine falsch verbundenen Pfeile, Pfeilspitzen an den Belegseiten oder redundanten Beschriftungen.
- Keine technischen IDs, Marken, Logos, Kurs- oder Schulbezeichnungen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
