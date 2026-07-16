# Lernzielvisualisierung: Modell gezielt anpassen

## SkillPilot-Ziel

- SkillPilot-ID: `909d8b16-5156-528b-a300-d9aee5405ba0`
- Titel: Modell gezielt anpassen
- Beschreibung: Die lernende Person kann ein Modell gezielt anpassen (z. B. Parameter ändern, zusätzliche Bedingungen ergänzen) und die Änderung nachvollziehbar begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `909d8b16-5156-528b-a300-d9aee5405ba0.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/909d8b16-5156-528b-a300-d9aee5405ba0/909d8b16-5156-528b-a300-d9aee5405ba0.jpg`

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

Titel: Modell gezielt anpassen
Beschreibung: Die lernende Person kann ein Modell gezielt anpassen (z. B. Parameter ändern, zusätzliche Bedingungen ergänzen) und die Änderung nachvollziehbar begründen.

Zusatzanweisung:
Pflichtinhalt:
- Erzeuge eine neue Infografik zur gezielten Modellanpassung mit dem Kontext Getränkebestellung.
- Ausgangsmodell: `K(x)=15+2x` für x Getränke.
- Neue Bedingung: `Ab dem 20. Getränk kosten weitere Getränke 1,80 Euro.`
- Angepasstes stetiges Modell: `K(x)=15+2x` für `0≤x≤20`; `K(x)=55+1,80·(x−20)` für `x>20`.
- Zeige im Graphen einen Knick bei `(20|55)` und erkläre: Bis 20 bleibt der alte Preis, danach wächst der Gesamtpreis langsamer.

Vermeiden:
- Nicht den Preisparameter für alle x global von 2 auf 1,80 ändern.
- Kein Sprung an x=20.
- Keine Dezimalpunkte oder zusätzlichen Bedingungen.

Korrekturhinweis: Der Knickpunkt liegt sichtbar bei `(20 | 55)`. Die waagerechte Hilfslinie durch den Knick ist an der y-Achse mit 55 beschriftet, niemals mit 45 oder 50. Beide Geraden treffen sich dort.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
