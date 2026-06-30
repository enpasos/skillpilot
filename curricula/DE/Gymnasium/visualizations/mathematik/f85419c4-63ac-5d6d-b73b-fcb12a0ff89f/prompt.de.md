# Lernzielvisualisierung: Prognoseintervalle für relative Häufigkeiten bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `f85419c4-63ac-5d6d-b73b-fcb12a0ff89f`
- Titel: Prognoseintervalle für relative Häufigkeiten bestimmen
- Beschreibung: Die lernende Person kann von einer bekannten Trefferwahrscheinlichkeit der Grundgesamtheit auf relative Häufigkeiten in zukünftigen Stichproben schließen, auf Grundlage der Sigma-Regeln Prognoseintervalle der Form $\left[p-c\sqrt{\frac{p(1-p)}{n}};\ p+c\sqrt{\frac{p(1-p)}{n}}\right]$ in Sachzusammenhängen bestimmen und die Prognoseunsicherheit erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `f85419c4-63ac-5d6d-b73b-fcb12a0ff89f.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/f85419c4-63ac-5d6d-b73b-fcb12a0ff89f/f85419c4-63ac-5d6d-b73b-fcb12a0ff89f.jpg`

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

Titel: Prognoseintervalle für relative Häufigkeiten bestimmen
Beschreibung: Die lernende Person kann von einer bekannten Trefferwahrscheinlichkeit der Grundgesamtheit auf relative Häufigkeiten in zukünftigen Stichproben schließen, auf Grundlage der Sigma-Regeln Prognoseintervalle der Form $\left[p-c\sqrt{\frac{p(1-p)}{n}};\ p+c\sqrt{\frac{p(1-p)}{n}}\right]$ in Sachzusammenhängen bestimmen und die Prognoseunsicherheit erläutern.

Zusatzanweisung:
Additional mathematical constraints for this batch:

- Do not include technical IDs, filenames, watermarks, or product names in the image.
- Keep the visualization simple and didactic: one clear example, one interval drawing, and short labels are better than many formulas.
- Use probability notation consistently:
  - unknown true probability: `p`
  - sample size: `n`
  - observed relative frequency: `h`
  - standard error idea: `sqrt(p*(1-p)/n)` or `sqrt(h*(1-h)/n)`, only if legible.
- Distinguish the two interval types clearly:
  - Prognoseintervall: fixed known or assumed `p`; interval predicts where a future relative frequency `h` will usually land.
  - Konfidenzintervall: observed `h`; interval estimates plausible values for the unknown `p`.
- Do not write "95% probability that p lies in this concrete interval". Prefer: "Verfahren trifft p in etwa 95% der Stichproben" or "95% langfristige Trefferquote".
- A safe confidence interval example is `n=400`, `h=0.52`, `95% KI approx [0.47;0.57]`. Mark `h=0.52` in the center and `p` as unknown/plausible inside the interval.
- A safe prognosis interval example is `n=400`, assumed `p=0.50`, future `h` usually about `[0.45;0.55]`. Mark `p=0.50` as the model center and `h` as future relative frequency.
- For confidence level, show many repeated samples/intervalls as small horizontal bars; about 19 of 20 bars should cover a vertical line labelled `p`. One bar may miss. Explain as long-run coverage, not as certainty for one interval.
- For confidence diagrams, show stacked interval bars against a horizontal `p` axis. Students should read off which intervals contain the same possible `p` values. Avoid decorative graphs that look like a density curve unless the interval meaning is clear.
- For sample-size planning, show that larger `n` gives a narrower interval. Use side-by-side bars such as `n=100` wide and `n=400` narrower. Do not suggest that a larger sample changes the true `p`.
- Avoid false precision. Use rounded interval endpoints and approximate signs such as `approx` where appropriate.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
