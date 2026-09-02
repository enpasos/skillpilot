# Lernzielvisualisierung: Tilgung oder Sparrate tabellarisch näherungsweise bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `f6574cdc-e29c-5a8f-a009-9f28b3bcf9be`
- Titel: Tilgung oder Sparrate tabellarisch näherungsweise bestimmen
- Beschreibung: Die lernende Person kann mit einer Tabellenkalkulation einen regelmäßigen Tilgungsbetrag oder eine regelmäßige Sparrate für ein vorgegebenes Finanzziel näherungsweise bestimmen und anhand der berechneten Restschuld- oder Guthabenentwicklung im Kontext prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `f6574cdc-e29c-5a8f-a009-9f28b3bcf9be.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/f6574cdc-e29c-5a8f-a009-9f28b3bcf9be/f6574cdc-e29c-5a8f-a009-9f28b3bcf9be.jpg`

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

Titel: Tilgung oder Sparrate tabellarisch näherungsweise bestimmen
Beschreibung: Die lernende Person kann mit einer Tabellenkalkulation einen regelmäßigen Tilgungsbetrag oder eine regelmäßige Sparrate für ein vorgegebenes Finanzziel näherungsweise bestimmen und anhand der berechneten Restschuld- oder Guthabenentwicklung im Kontext prüfen.

Zusatzanweisung:
Pflichtinhalt:

Show how to estimate a monthly savings rate with a spreadsheet-style table.
Use a simple no-interest savings model to keep the table transparent.

Use exactly this situation:
- target amount: `1250 Euro`
- time: `12 Monate`
- model: `Endbetrag = 12 * Sparrate`

Use a table with exactly these candidate rows:
- `Sparrate = 100 Euro`, `Endbetrag = 1200 Euro`, `Differenz = -50 Euro`
- `Sparrate = 103 Euro`, `Endbetrag = 1236 Euro`, `Differenz = -14 Euro`
- `Sparrate = 104 Euro`, `Endbetrag = 1248 Euro`, `Differenz = -2 Euro`
- `Sparrate = 105 Euro`, `Endbetrag = 1260 Euro`, `Differenz = +10 Euro`

Conclusion card: `Sparrate ungefähr 104 Euro pro Monat`.

Vermeiden:

Do not add interest in this example.
Do not change the target amount or number of months.
Do not claim `104 Euro` reaches the target exactly; it is a close approximation.
Do not show a loan amortization formula in this version.
Do not add a graph or curve.
Do not add arrows or leader lines.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
