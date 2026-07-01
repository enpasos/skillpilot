# Lernzielvisualisierung: Poisson-Verteilung als Modell seltener Ereignisse nutzen

## SkillPilot-Ziel

- SkillPilot-ID: `c9a897ca-a0a2-5895-bbc4-23b20840c548`
- Titel: Poisson-Verteilung als Modell seltener Ereignisse nutzen
- Beschreibung: Die lernende Person kann die Poisson-Verteilung als Näherung der Binomialverteilung für seltene Ereignisse motivieren, Situationen pro Zeit- oder Flächeneinheit modellieren, Parameter bestimmen und zugehörige Wahrscheinlichkeiten in konkreten Beispielen berechnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `c9a897ca-a0a2-5895-bbc4-23b20840c548.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/c9a897ca-a0a2-5895-bbc4-23b20840c548/c9a897ca-a0a2-5895-bbc4-23b20840c548.jpg`

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

Titel: Poisson-Verteilung als Modell seltener Ereignisse nutzen
Beschreibung: Die lernende Person kann die Poisson-Verteilung als Näherung der Binomialverteilung für seltene Ereignisse motivieren, Situationen pro Zeit- oder Flächeneinheit modellieren, Parameter bestimmen und zugehörige Wahrscheinlichkeiten in konkreten Beispielen berechnen.

Zusatzanweisung:
Required content:

- Show the Poisson distribution as a model for rare events per fixed time interval.
- Use one simple example: average `lambda = 2` bus arrivals per 10 minutes.
- State the model formula cleanly: `P(X=k) = e^(-lambda) * lambda^k / k!`.
- Compute one example exactly enough: `P(X=0) = e^(-2) approx 0.135`.
- Show a small bar chart for `k = 0, 1, 2, 3, 4` with approximate values:
  - `0: 0.135`
  - `1: 0.271`
  - `2: 0.271`
  - `3: 0.180`
  - `4: 0.090`
- Include one model-check note: suitable for rare, roughly independent events at a constant average rate.

Avoid:

- Do not use Poisson for common events without saying they are rare per interval.
- Do not make the bars sum to exactly 1 if only `k=0..4` are shown.
- Do not confuse `lambda` with probability `p`.
- Do not include technical IDs, filenames, watermarks, platform names, or product names.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
