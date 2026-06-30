# Lernzielvisualisierung: Normalverteilung als Approximation binomialer Modelle (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `44dba16e-2e86-56be-974b-a62093ef9211`
- Titel: Normalverteilung als Approximation binomialer Modelle (LK)
- Beschreibung: Die lernende Person kann Histogramme binomialverteilter Zufallsgrößen bei hinreichend großer Standardabweichung durch eine Normalverteilung approximieren, die Näherung fachlich begründen und den Bezug zu den Sigma-Regeln deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `44dba16e-2e86-56be-974b-a62093ef9211.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/44dba16e-2e86-56be-974b-a62093ef9211/44dba16e-2e86-56be-974b-a62093ef9211.jpg`

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

Titel: Normalverteilung als Approximation binomialer Modelle (LK)
Beschreibung: Die lernende Person kann Histogramme binomialverteilter Zufallsgrößen bei hinreichend großer Standardabweichung durch eine Normalverteilung approximieren, die Näherung fachlich begründen und den Bezug zu den Sigma-Regeln deuten.

Zusatzanweisung:
Additional correction for the binomial normal approximation visualization:

- Do not include technical IDs in the image.
- Focus only on normal approximation of a binomial model.
- Use the concrete example `X ~ B(100, 0.5)`.
- Show `mu = n*p = 50` and `sigma = sqrt(n*p*(1-p)) = 5`.
- The normal approximation should be `Y ~ N(50, 25)`.
- The condition should be stated as `n*p >= 5` and `n*(1-p) >= 5` or as "n large enough"; do not write that the condition is a "large standard deviation".
- If a sigma arrow is drawn, it must be horizontal from `mu=50` to `mu+sigma=55` only, or from `mu-sigma=45` to `mu=50` only. Do not draw one arrow from 45 to 55 and label it `sigma`.
- If the central one-sigma interval is shown, label it as `[mu-sigma, mu+sigma] = [45,55]`, not as a single sigma distance.
- Show continuity correction clearly: `P(45 <= X <= 55) approx P(44.5 <= Y <= 55.5)`.
- Do not mix in Poisson distribution on this image.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
