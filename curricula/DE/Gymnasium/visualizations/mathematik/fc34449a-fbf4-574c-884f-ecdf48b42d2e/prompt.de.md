# Lernzielvisualisierung: Laufzeit tabellarisch näherungsweise bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `fc34449a-fbf4-574c-884f-ecdf48b42d2e`
- Titel: Laufzeit tabellarisch näherungsweise bestimmen
- Beschreibung: Die lernende Person kann mit einer Tabellenkalkulation die Laufzeit in einfachen Finanzsituationen näherungsweise bestimmen und das Ergebnis im Kontext prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `fc34449a-fbf4-574c-884f-ecdf48b42d2e.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/fc34449a-fbf4-574c-884f-ecdf48b42d2e/fc34449a-fbf4-574c-884f-ecdf48b42d2e.jpg`

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

Titel: Laufzeit tabellarisch näherungsweise bestimmen
Beschreibung: Die lernende Person kann mit einer Tabellenkalkulation die Laufzeit in einfachen Finanzsituationen näherungsweise bestimmen und das Ergebnis im Kontext prüfen.

Zusatzanweisung:
Pflichtinhalt:

Show how to estimate the time needed to reach a financial target with a spreadsheet-style table.
Use exactly this compound-interest situation:
- start capital: `1000 Euro`
- annual interest rate: `4%`
- target capital: `1200 Euro`
- model: `K_n = 1000 * 1.04^n`

Use a table with exactly these candidate rows:
- `n = 3 Jahre`, `K_n = 1124.86 Euro`, `unter Ziel`
- `n = 4 Jahre`, `K_n = 1169.86 Euro`, `unter Ziel`
- `n = 5 Jahre`, `K_n = 1216.65 Euro`, `über Ziel`

Conclusion card: `Ziel wird nach etwa 5 Jahren erreicht` and `Laufzeit liegt zwischen 4 und 5 Jahren`.

Vermeiden:

Do not use simple interest.
Do not change the start capital, interest rate, or target capital.
Do not claim 4 years is enough.
Do not write `K_5 = 1200 Euro`; the correct value is `1216.65 Euro`.
Do not add a graph or curve.
Do not add arrows or leader lines.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
