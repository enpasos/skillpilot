# Lernzielvisualisierung: Sigma-Regeln für Verteilungen anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d`
- Titel: Sigma-Regeln für Verteilungen anwenden
- Beschreibung: Die lernende Person kann an Histogrammen, Dichtegraphen und Diagrammen ungefähr symmetrischer Verteilungen ablesen, welcher Anteil der Werte in σ-Umgebungen um den Mittelwert liegt, und die Sigma-Regeln für $1\sigma$, $1{,}64\sigma$, $1{,}96\sigma$, $2\sigma$, $2{,}58\sigma$ und $3\sigma$ qualitativ erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d/8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d.jpg`

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

Titel: Sigma-Regeln für Verteilungen anwenden
Beschreibung: Die lernende Person kann an Histogrammen, Dichtegraphen und Diagrammen ungefähr symmetrischer Verteilungen ablesen, welcher Anteil der Werte in σ-Umgebungen um den Mittelwert liegt, und die Sigma-Regeln für $1\sigma$, $1{,}64\sigma$, $1{,}96\sigma$, $2\sigma$, $2{,}58\sigma$ und $3\sigma$ qualitativ erläutern.

Zusatzanweisung:
Additional mathematical constraints for this batch:

- Do not include technical IDs in the image.
- Keep hypothesis-test examples internally consistent and avoid unnecessary exact critical values.
- Use this default one-sided quality-control example when helpful:
  - `n=20`
  - `X = number of defective items`
  - `H0: p <= 0.10`
  - `H1: p > 0.10`
  - rejection region on the right: `X >= k`
- Type I error: reject `H0` although `H0` is true. Mark it as `alpha`.
- Type II error: do not reject `H0` although `H1` is true. Mark it as `beta`.
- Test power/test strength: `1 - beta`, i.e. probability of rejecting `H0` when the alternative is true.
- If alpha and beta are both shown, use two separate true-state distributions or clearly label the true parameter values; do not shade both on one unlabeled curve.
- When interpreting results, avoid saying "H0 is proven" or "H1 is proven". Use "H0 verwerfen" or "H0 nicht verwerfen; Daten reichen nicht aus".
- For changed sample size `n`, show the qualitative effect: larger `n` usually makes distributions narrower relative to the parameter difference and can increase test power at fixed alpha. Do not claim that larger `n` always reduces both error probabilities without conditions.
- For a power function, show a curve `G(p)=P_p(H0 verwerfen)` that is low under values in `H0` and rises under values in `H1`; label `alpha` near the boundary under `H0` and `1-beta` under a concrete alternative.
- For comparing tests, compare criteria such as alpha control, beta/power, sample size, one-sided/two-sided direction, and context costs of errors.
- For sigma rules, use a normal distribution with horizontal marks:
  - about `68%` in `[mu-sigma, mu+sigma]`
  - about `95%` in `[mu-2sigma, mu+2sigma]`
  - about `99.7%` in `[mu-3sigma, mu+3sigma]`
- Do not draw sigma as a vertical height.
- If using sigma rules outside normal distributions, explicitly mark it as approximation/check and avoid exact normal percentages.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
