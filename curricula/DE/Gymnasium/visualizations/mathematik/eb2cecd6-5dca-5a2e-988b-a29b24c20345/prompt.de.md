# Lernzielvisualisierung: Testkennzahlen und Testvariablen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `eb2cecd6-5dca-5a2e-988b-a29b24c20345`
- Titel: Testkennzahlen und Testvariablen bestimmen
- Beschreibung: Die lernende Person kann für Hypothesentests bei Anteilen eine geeignete Zufallsgröße definieren, deren Verteilung unter der Nullhypothese angeben und zu Beobachtungen passende Testkennzahlen bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `eb2cecd6-5dca-5a2e-988b-a29b24c20345.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/eb2cecd6-5dca-5a2e-988b-a29b24c20345/eb2cecd6-5dca-5a2e-988b-a29b24c20345.jpg`

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

Titel: Testkennzahlen und Testvariablen bestimmen
Beschreibung: Die lernende Person kann für Hypothesentests bei Anteilen eine geeignete Zufallsgröße definieren, deren Verteilung unter der Nullhypothese angeben und zu Beobachtungen passende Testkennzahlen bestimmen.

Zusatzanweisung:
Additional mathematical constraints for this batch:

- Do not include technical IDs in the image.
- Keep examples small, consistent, and readable.
- For additional continuous distributions, show only one clear example such as a uniform distribution on `[0,10]` or an exponential waiting-time density. Emphasize that probabilities are areas under a density curve, not heights.
- For hypothesis tests, use the standard logic:
  - formulate `H0` as the baseline assumption
  - formulate `H1` as the alternative to be supported by the data
  - choose a test variable before observing data
  - define a rejection region for `H0`
  - compare the observed test statistic with the rejection region
  - make a decision in context
- Safe binomial test example: quality-control check with `n=20` items and `X = number of defective items`.
- One-sided right-tail example: `H0: p <= 0.10`, `H1: p > 0.10`. Large values of `X` speak against `H0`; the rejection region is on the right.
- Avoid exact numeric critical values unless they are internally consistent. It is acceptable to write a schematic rejection region such as `X >= k`.
- If alpha is shown, label it as the probability of rejecting `H0` although `H0` is true: type I error.
- If beta is shown, label it as the probability of not rejecting `H0` although `H1` is true: type II error.
- Do not draw alpha and beta as the same area under the same distribution. Use two curves or clearly separate true states if both are shown.
- A test statistic/test variable is a rule such as `X = number of successes/defects`, not the final decision itself.
- Avoid saying that a non-rejection "proves H0"; use "H0 nicht verwerfen" or "Daten reichen nicht gegen H0".
- Avoid using normal-density diagrams for binomial tests unless the approximation is explicitly stated.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
