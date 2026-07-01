# Lernzielvisualisierung: Zufallsexperimente mit Software simulieren

## SkillPilot-Ziel

- SkillPilot-ID: `4aa70ad4-171d-5671-a864-c0c7758fa0ed`
- Titel: Zufallsexperimente mit Software simulieren
- Beschreibung: Die lernende Person kann Zufallsexperimente mit geeigneter Software (z. B. Tabellenkalkulation) simulieren, absolute und relative Häufigkeiten auswerten und die Ergebnisse grafisch darstellen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `4aa70ad4-171d-5671-a864-c0c7758fa0ed.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/4aa70ad4-171d-5671-a864-c0c7758fa0ed/4aa70ad4-171d-5671-a864-c0c7758fa0ed.jpg`

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

Titel: Zufallsexperimente mit Software simulieren
Beschreibung: Die lernende Person kann Zufallsexperimente mit geeigneter Software (z. B. Tabellenkalkulation) simulieren, absolute und relative Häufigkeiten auswerten und die Ergebnisse grafisch darstellen.

Zusatzanweisung:
Required content:

- Show a generic spreadsheet simulation of a fair die, without any software brand logo.
- Use a simple workflow: random numbers generate die rolls, copy many rows, count frequencies, compute relative frequencies, draw a chart.
- Use exactly `n = 1000` simulated rolls and this results table:
  - 1: 166
  - 2: 171
  - 3: 160
  - 4: 170
  - 5: 166
  - 6: 167
  - Summe: 1000
- For result `6`, show `h(6) = 167 / 1000 = 0.167`.
- Compare briefly with the fair-die model `P(6) = 1/6 approx 0.167`.
- State that simulation results fluctuate and become more stable with many trials, but are not guaranteed exact.

Avoid:

- Do not show a branded spreadsheet interface or logo.
- Do not imply the simulation proves fairness.
- Do not show a frequency table whose values do not sum to `1000`.
- Do not include technical IDs, filenames, watermarks, platform names, or product names.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
