# Lernzielvisualisierung: Relative Streuung binomialverteilter Zufallsgrößen berechnen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `5b54f272-f588-5009-8b42-eb15f846d3e2`
- Titel: Relative Streuung binomialverteilter Zufallsgrößen berechnen (LK)
- Beschreibung: Die lernende Person kann die relative Streuung (Variationskoeffizient) $\sigma/\mu$ einer Binomialverteilung berechnen und zeigen, dass sie bei festem $p$ mit wachsendem $n$ abnimmt (z. B. $\sigma/\mu = \sqrt{\frac{1-p}{n\,p}}$).

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `5b54f272-f588-5009-8b42-eb15f846d3e2.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/5b54f272-f588-5009-8b42-eb15f846d3e2/5b54f272-f588-5009-8b42-eb15f846d3e2.jpg`

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

Titel: Relative Streuung binomialverteilter Zufallsgrößen berechnen (LK)
Beschreibung: Die lernende Person kann die relative Streuung (Variationskoeffizient) $\sigma/\mu$ einer Binomialverteilung berechnen und zeigen, dass sie bei festem $p$ mit wachsendem $n$ abnimmt (z. B. $\sigma/\mu = \sqrt{\frac{1-p}{n\,p}}$).

Zusatzanweisung:
Additional correction for the relative-spread visualization:

- Do not include technical IDs in the image.
- The key conclusion must say: `Bei festem p nimmt die relative Streuung sigma/mu mit wachsendem n ab.`
- Do not write `bei festem n mit wachsendem n`; that is contradictory and wrong.
- Keep the example `X ~ B(16,0.25)`: `mu=4`, `sigma=sqrt(3) approx 1.73`, `sigma/mu approx 0.43`.
- For comparison at fixed `p=0.25`, the correct values are:
  - `n=4`: `mu=1`, `sigma=sqrt(0.75) approx 0.87`, `sigma/mu approx 0.87`
  - `n=16`: `mu=4`, `sigma=sqrt(3) approx 1.73`, `sigma/mu approx 0.43`
  - `n=64`: `mu=16`, `sigma=sqrt(12) approx 3.46`, `sigma/mu approx 0.22`
- If a formula is shown, use `sigma/mu = sqrt((1-p)/(n*p))`.
- Visual emphasis: absolute spread grows slowly, but relative spread compared with the mean becomes smaller as `n` grows.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
