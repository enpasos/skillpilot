# Lernzielvisualisierung: Signifikante Stellen korrekt verwenden

## SkillPilot-Ziel

- SkillPilot-ID: `b615830a-e8b0-5754-81e0-99da98343a8d`
- Titel: Signifikante Stellen korrekt verwenden
- Beschreibung: Die lernende Person kann signifikante Stellen in Rechenergebnissen korrekt bestimmen und konsistent anwenden.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `b615830a-e8b0-5754-81e0-99da98343a8d.jpg`
- Public Asset: `/assets/goal-visualizations/physik/b615830a-e8b0-5754-81e0-99da98343a8d/b615830a-e8b0-5754-81e0-99da98343a8d.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Physik; dieser Kontext dient nur der Stil- und Anspruchswahl und soll nicht als Bildtext erscheinen.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Signifikante Stellen korrekt verwenden
Beschreibung: Die lernende Person kann signifikante Stellen in Rechenergebnissen korrekt bestimmen und konsistent anwenden.

Zusatzanweisung:
Pflichtinhalt:

Show significant figures with a simple table and one rounding example.

Top title: `Signifikante Stellen`

Table columns:
- `Wert`
- `signifikante Stellen`
- `Hinweis`

Rows:
- `3,20 m` | `3` | `Endnull nach Komma zaehlt`
- `0,045 m` | `2` | `Fuehrende Nullen zaehlen nicht`
- `1200 m` | `unklar ohne Zusatz` | `Schreibweise klaeren`

Rounding box:
- write `4,56 cm + 1,2 cm = 5,8 cm`
- label `auf eine Nachkommastelle gerundet`

Vermeiden:

Do not claim that leading zeros are significant.
Do not claim that `3,20` has only two significant figures.
Do not claim that `0,045` has three significant figures.
Do not present `1200` as definitely two, three, or four significant figures without notation.
Do not use complex scientific notation examples.
Do not draw physical arrows.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
