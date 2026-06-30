# Lernzielvisualisierung: Binomialverteilungen in Kontexten nutzen

## SkillPilot-Ziel

- SkillPilot-ID: `66f432e9-22d3-51a9-8787-35f91db30616`
- Titel: Binomialverteilungen in Kontexten nutzen
- Beschreibung: Die lernende Person kann geeignete Situationen als binomialverteilte Zufallsgrößen modellieren, anhand von Histogrammen typische Eigenschaften erkennen und die Eignung des Modells kritisch beurteilen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `66f432e9-22d3-51a9-8787-35f91db30616.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/66f432e9-22d3-51a9-8787-35f91db30616/66f432e9-22d3-51a9-8787-35f91db30616.jpg`

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

Titel: Binomialverteilungen in Kontexten nutzen
Beschreibung: Die lernende Person kann geeignete Situationen als binomialverteilte Zufallsgrößen modellieren, anhand von Histogrammen typische Eigenschaften erkennen und die Eignung des Modells kritisch beurteilen.

Zusatzanweisung:
Additional mathematical constraints for this batch:

- Do not include technical IDs in the image.
- Prefer one small, internally consistent example instead of many unrelated examples.
- For binomial distributions, use the notation `X ~ B(n,p)` only when the experiment has fixed `n`, independent trials, exactly two outcomes, and constant success probability `p`.
- If a full binomial table is shown, use this exact reference example: `X ~ B(4,0.5)` with probabilities `P(X=0)=1/16`, `P(X=1)=4/16`, `P(X=2)=6/16`, `P(X=3)=4/16`, `P(X=4)=1/16`.
- Clearly distinguish point probability `P(X=2)`, interval probability `P(1 <= X <= 3)`, and cumulative probability `P(X <= 2)`. Do not label one type as another.
- For a binomial expectation and spread example, use `X ~ B(16,0.25)`: `mu = n*p = 4`, `Var(X)=n*p*(1-p)=3`, `sigma=sqrt(3) approx 1.73`.
- For relative spread, use `sigma/mu`. With `X ~ B(16,0.25)`, show `sqrt(3)/4 approx 0.43` only if the quotient is displayed.
- For a contextual binomial model, state or visibly imply the assumptions: fixed number of trials, independent trials, two outcomes, constant success probability.
- For normal density, show a smooth bell curve symmetric around `mu`. The maximum is at `mu`; the curve approaches the x-axis but does not cross it.
- Mark `sigma` horizontally as a distance from `mu` to `mu+sigma` or from `mu-sigma` to `mu`. Do not draw `sigma` as a vertical height.
- If inflection points are shown, place them at `mu-sigma` and `mu+sigma`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
