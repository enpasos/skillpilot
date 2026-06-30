# Lernzielvisualisierung: Bedingte Wahrscheinlichkeiten berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `c3b9c561-dd83-5903-9ec6-49c7f51bafd5`
- Titel: Bedingte Wahrscheinlichkeiten berechnen
- Beschreibung: Die lernende Person kann bedingte Wahrscheinlichkeiten in Sachzusammenhängen identifizieren und sie mit Baumdiagrammen sowie Vier- oder Mehrfeldertafeln aus absoluten oder relativen Häufigkeiten berechnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `c3b9c561-dd83-5903-9ec6-49c7f51bafd5.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/c3b9c561-dd83-5903-9ec6-49c7f51bafd5/c3b9c561-dd83-5903-9ec6-49c7f51bafd5.jpg`

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

Titel: Bedingte Wahrscheinlichkeiten berechnen
Beschreibung: Die lernende Person kann bedingte Wahrscheinlichkeiten in Sachzusammenhängen identifizieren und sie mit Baumdiagrammen sowie Vier- oder Mehrfeldertafeln aus absoluten oder relativen Häufigkeiten berechnen.

Zusatzanweisung:
Use one clean German title only: "Bedingte Wahrscheinlichkeiten berechnen".
Use exactly this consistent two-way table. Rows: B, nicht B, Summe. Columns: A, nicht A, Summe.
Absolute frequencies:
- B row: A = 30, nicht A = 20, Summe = 50.
- nicht B row: A = 10, nicht A = 40, Summe = 50.
- Summe row: A = 40, nicht A = 60, Summe = 100.
Relative frequencies:
- B row: A = 0.30, nicht A = 0.20, Summe = 0.50.
- nicht B row: A = 0.10, nicht A = 0.40, Summe = 0.50.
- Summe row: A = 0.40, nicht A = 0.60, Summe = 1.00.
Explain the calculation with the correct denominator:
- P(A|B) = P(A∩B)/P(B) = 0.30/0.50 = 30/50 = 0.60.
- P(B|A) = P(A∩B)/P(A) = 0.30/0.40 = 30/40 = 0.75.
If a tree diagram is shown, it must match the same conditional meaning: first B, then A/not A for P(A|B), or first A, then B/not B for P(B|A).
Do not invent any other table values or inconsistent sums.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
