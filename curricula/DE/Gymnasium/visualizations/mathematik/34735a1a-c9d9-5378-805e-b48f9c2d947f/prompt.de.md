# Lernzielvisualisierung: Bernoulli-Experimente und -Ketten beschreiben

## SkillPilot-Ziel

- SkillPilot-ID: `34735a1a-c9d9-5378-805e-b48f9c2d947f`
- Titel: Bernoulli-Experimente und -Ketten beschreiben
- Beschreibung: Die lernende Person kann Bernoulli-Experimente und Bernoulli-Ketten identifizieren, ihre Kenngrößen (Länge, Trefferwahrscheinlichkeit) angeben und die Formel $P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n-k}$ aus einem passenden Beispiel heraus begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `34735a1a-c9d9-5378-805e-b48f9c2d947f.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/34735a1a-c9d9-5378-805e-b48f9c2d947f/34735a1a-c9d9-5378-805e-b48f9c2d947f.jpg`

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

Titel: Bernoulli-Experimente und -Ketten beschreiben
Beschreibung: Die lernende Person kann Bernoulli-Experimente und Bernoulli-Ketten identifizieren, ihre Kenngrößen (Länge, Trefferwahrscheinlichkeit) angeben und die Formel $P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n-k}$ aus einem passenden Beispiel heraus begründen.

Zusatzanweisung:
Keep all stochastic examples mathematically simple and correct.
Use only small, checkable numbers.

Allowed example for random variables:
- Two fair coin tosses with outcomes ZZ, ZK, KZ, KK where K = Kopf and Z = Zahl.
- Random variable X = number of heads (Kopf).
- Mapping: ZZ -> 0, ZK -> 1, KZ -> 1, KK -> 2.
- Distribution: P(X=0)=1/4, P(X=1)=1/2, P(X=2)=1/4; sum = 1.

Allowed example for expectation, variance, standard deviation:
- Use the same distribution X = number of heads in two fair coin tosses.
- E(X) = 0*1/4 + 1*1/2 + 2*1/4 = 1.
- Var(X) = (0-1)^2*1/4 + (1-1)^2*1/2 + (2-1)^2*1/4 = 1/2.
- sigma = sqrt(1/2) approx 0.71.

Allowed example for Bernoulli chains:
- Success / failure, independent trials.
- n = 4, p = 0.5, q = 0.5.
- P(exactly 2 successes) = C(4,2) * 0.5^2 * 0.5^2 = 6/16 = 3/8.

Allowed facts about binomial distributions:
- P(X=k) = C(n,k) * p^k * (1-p)^(n-k).
- Increasing p shifts the distribution to the right.
- Increasing n creates more possible k values; the center is near n*p.
- For n=4, p=0.5, probabilities are 1/16, 4/16, 6/16, 4/16, 1/16.

If a histogram or bar chart is shown, bar heights must match the displayed table.
All probabilities in a table must add to 1.
Avoid dense tiny formulas and invented values.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
