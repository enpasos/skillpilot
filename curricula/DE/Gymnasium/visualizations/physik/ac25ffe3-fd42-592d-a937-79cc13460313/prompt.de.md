# Lernzielvisualisierung: Methode: Modellbildung mit Tabellenkalkulation

## SkillPilot-Ziel

- SkillPilot-ID: `ac25ffe3-fd42-592d-a937-79cc13460313`
- Titel: Methode: Modellbildung mit Tabellenkalkulation
- Beschreibung: Die lernende Person kann Bewegungen schrittweise in einer Tabellenkalkulation modellieren (Differenzenverfahren), Parameter variieren und Simulationsergebnisse interpretieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `ac25ffe3-fd42-592d-a937-79cc13460313.jpg`
- Public Asset: `/assets/goal-visualizations/physik/ac25ffe3-fd42-592d-a937-79cc13460313/ac25ffe3-fd42-592d-a937-79cc13460313.jpg`

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

Titel: Methode: Modellbildung mit Tabellenkalkulation
Beschreibung: Die lernende Person kann Bewegungen schrittweise in einer Tabellenkalkulation modellieren (Differenzenverfahren), Parameter variieren und Simulationsergebnisse interpretieren.

Zusatzanweisung:
Pflichtinhalt:

- Do not include technical identifiers, filenames, watermarks, platform names, or product names.
- Show methodical modelling of motion with a spreadsheet-like table and a small line plot.
- Use the title inside the image: `Bewegung schrittweise modellieren`.
- Required table columns: `n`, `t in s`, `x in m`, `v in m/s`, `a in m/s^2`.
- Use exactly this simple constant-acceleration example:
  - `Delta t = 0,1 s`
  - `a = 2,0 m/s^2`
  - row `n=0`: `t=0,0`, `x=0,000`, `v=0,0`, `a=2,0`
  - row `n=1`: `t=0,1`, `x=0,000`, `v=0,2`, `a=2,0`
  - row `n=2`: `t=0,2`, `x=0,020`, `v=0,4`, `a=2,0`
- Show the update formulas:
  - `t_neu = t_alt + Delta t`
  - `v_neu = v_alt + a*Delta t`
  - `x_neu = x_alt + v_alt*Delta t`
- Add a small note: `Parameter variieren -> Modell vergleichen`.
- If any arrows connect formula, table, and plot, they must point in the workflow direction `Formeln -> Tabelle -> Diagramm`.

Vermeiden:

- Do not add inconsistent extra rows, wrong units, or a graph that decreases while velocity is positive.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
