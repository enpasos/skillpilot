# Lernzielvisualisierung: Konfidenzniveau interpretieren

## SkillPilot-Ziel

- SkillPilot-ID: `aa14d9e4-5790-5d94-a245-2ff9a70bf633`
- Titel: Konfidenzniveau interpretieren
- Beschreibung: Die lernende Person kann die Bedeutung des Konfidenzniveaus in Worten erklären, typische Fehlinterpretationen vermeiden und dies an Beispielen begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `aa14d9e4-5790-5d94-a245-2ff9a70bf633.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/aa14d9e4-5790-5d94-a245-2ff9a70bf633/aa14d9e4-5790-5d94-a245-2ff9a70bf633.jpg`

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

Titel: Konfidenzniveau interpretieren
Beschreibung: Die lernende Person kann die Bedeutung des Konfidenzniveaus in Worten erklären, typische Fehlinterpretationen vermeiden und dies an Beispielen begründen.

Zusatzanweisung:
Additional correction for the confidence-level visualization:

- Do not include technical IDs, filenames, watermarks, or product names in the image.
- The core visual must show many horizontal confidence intervals and one vertical red line labelled `wahres p`.
- Use green bars for intervals that contain `p` and red bars only for intervals that clearly miss `p`.
- Every red "verfehlt p" interval must lie entirely to the left or entirely to the right of the vertical `p` line. A red interval must never touch or cross the `p` line.
- About 19 of 20 intervals should be green and contain the `p` line; one interval may be red and miss it.
- State the meaning as long-run coverage: `Das Verfahren trifft p in etwa 95% der Stichproben.`
- Explicitly avoid the false statement `95% Wahrscheinlichkeit, dass p in diesem einen Intervall liegt`.
- Keep the concrete interval example `n=400`, `h=0.52`, `95% KI approx [0.47;0.57]` if it fits, but make clear that `p` is unknown and only plausible inside the interval.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
