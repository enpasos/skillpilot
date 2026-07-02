# Lernzielvisualisierung: Zinssatz tabellarisch näherungsweise bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `1842da92-ca2c-5fed-a946-e6413a6285bb`
- Titel: Zinssatz tabellarisch näherungsweise bestimmen
- Beschreibung: Die lernende Person kann mit einer Tabellenkalkulation den Zinssatz in einfachen Finanzsituationen näherungsweise bestimmen und das Ergebnis im Kontext prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `1842da92-ca2c-5fed-a946-e6413a6285bb.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/1842da92-ca2c-5fed-a946-e6413a6285bb/1842da92-ca2c-5fed-a946-e6413a6285bb.jpg`

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

Titel: Zinssatz tabellarisch näherungsweise bestimmen
Beschreibung: Die lernende Person kann mit einer Tabellenkalkulation den Zinssatz in einfachen Finanzsituationen näherungsweise bestimmen und das Ergebnis im Kontext prüfen.

Zusatzanweisung:
Pflichtinhalt:

Show how to estimate an interest rate with a spreadsheet-style table.
Use exactly this financial situation:
- start capital: `1000 Euro`
- time: `3 Jahre`
- target final capital: `1158 Euro`
- annual compound interest model: `K_3 = 1000 * (1+p)^3`

Use a table with exactly these candidate rows:
- `p = 4.8%`, `K_3 = 1151.02 Euro`, `Differenz = -6.98 Euro`
- `p = 4.9%`, `K_3 = 1154.32 Euro`, `Differenz = -3.68 Euro`
- `p = 5.0%`, `K_3 = 1157.63 Euro`, `Differenz = -0.37 Euro`
- `p = 5.1%`, `K_3 = 1160.94 Euro`, `Differenz = +2.94 Euro`

Conclusion card: `Zinssatz ungefähr 5.0%`.

Vermeiden:

Do not use simple interest; this is compound interest.
Do not change the start capital, target capital, or time.
Do not write `p=50%` or `p=0.5%`.
Do not claim the target is matched exactly.
Do not add a graph or curve.
Do not add arrows or leader lines.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
