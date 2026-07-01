# Lernzielvisualisierung: Integrale ganzrationaler Funktionenscharen berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `d144a855-9139-55c7-a801-e8b85dab5f01`
- Titel: Integrale ganzrationaler Funktionenscharen berechnen
- Beschreibung: Die lernende Person kann Stammfunktionen und bestimmte Integrale ganzrationaler Funktionenscharen parameterabhängig berechnen und die Ergebnisse im Zusammenhang der Schar deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `d144a855-9139-55c7-a801-e8b85dab5f01.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/d144a855-9139-55c7-a801-e8b85dab5f01/d144a855-9139-55c7-a801-e8b85dab5f01.jpg`

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

Titel: Integrale ganzrationaler Funktionenscharen berechnen
Beschreibung: Die lernende Person kann Stammfunktionen und bestimmte Integrale ganzrationaler Funktionenscharen parameterabhängig berechnen und die Ergebnisse im Zusammenhang der Schar deuten.

Zusatzanweisung:
Fachlicher Fokus: bestimmtes Integral einer linearen Funktionenschar.

Verwende genau:
f_a(x) = a*x + 1
F_a(x) = (a/2)*x^2 + x
Integral von 0 bis 2: integral_0^2 (a*x + 1) dx = 2a + 2

Wichtig: Keine Wertetabelle zeichnen. Es sollen keine Tabellenzellen und keine zusaetzlichen Parameterwerte vorkommen. Insbesondere darf kein a = 3 erscheinen.

Rechte Bildhaelfte: genau drei getrennte Mini-Diagramme, alle mit x von 0 bis 2 und y-Achse bei x=0:
- Panel 1: a = 0, f_0(x) = 1, Endpunkte (0|1) und (2|1), gesamte Flaeche unter dem Graphen auf [0,2] schattiert, grosses Label A_0 = 2.
- Panel 2: a = 1, f_1(x) = x + 1, Endpunkte (0|1) und (2|3), gesamte Flaeche unter dem Graphen auf [0,2] schattiert, grosses Label A_1 = 4.
- Panel 3: a = 2, f_2(x) = 2x + 1, Endpunkte (0|1) und (2|5), gesamte Flaeche unter dem Graphen auf [0,2] schattiert, grosses Label A_2 = 6.

Linke Bildhaelfte: nur die kurze Rechnung:
- Stammfunktion F_a(x) = (a/2)*x^2 + x
- integral_0^2 (a*x + 1) dx = F_a(2) - F_a(0) = 2a + 2

Vermeiden:
- Keine ueberlappenden oder gestapelten Flaechen.
- Keine Wertetabelle.
- Keine Parameterwerte ausser a=0, a=1 und a=2.
- Keine falschen Punktkoordinaten.
- Keine Zusatzflaechen als Integralwert beschriften.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
