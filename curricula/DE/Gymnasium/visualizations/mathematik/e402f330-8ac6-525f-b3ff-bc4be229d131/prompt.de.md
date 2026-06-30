# Lernzielvisualisierung: Streuungsmaße von Daten bestimmen und deuten

## SkillPilot-Ziel

- SkillPilot-ID: `e402f330-8ac6-525f-b3ff-bc4be229d131`
- Titel: Streuungsmaße von Daten bestimmen und deuten
- Beschreibung: Die lernende Person kann empirische Varianz und empirische Standardabweichung für Datensätze berechnen, beide Streuungsmaße in Bezug auf die Daten deuten und einfache Vergleiche zwischen Datensätzen anstellen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `e402f330-8ac6-525f-b3ff-bc4be229d131.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/e402f330-8ac6-525f-b3ff-bc4be229d131/e402f330-8ac6-525f-b3ff-bc4be229d131.jpg`

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

Titel: Streuungsmaße von Daten bestimmen und deuten
Beschreibung: Die lernende Person kann empirische Varianz und empirische Standardabweichung für Datensätze berechnen, beide Streuungsmaße in Bezug auf die Daten deuten und einfache Vergleiche zwischen Datensätzen anstellen.

Zusatzanweisung:
Additional mathematical constraints for this batch:

- Do not include technical IDs, filenames, watermarks, or product names in the image.
- Use German labels. Keep text short and legible.
- Prefer simple classroom contexts: dice, spinners, small measurement tables, class surveys, or histograms. Avoid unrealistic laboratory or finance imagery.
- Do not overload one image with many formulas. Use one clear worked idea plus one interpretation sentence.

For empirical/statistical probability:

- Show the difference between theoretical probability and estimated probability from relative frequency.
- Use notation such as `absolute Haeufigkeit`, `relative Haeufigkeit h = Treffer / n`, and `P(E) geschaetzt`.
- Correct idea: with many repetitions, relative frequency often stabilizes near the true probability, but it does not become guaranteed or exact.
- Safe example: fair die, event `6`, after `n=60` rolls maybe `11` sixes, so `h=11/60 approx 0.18`, close to theoretical `1/6 approx 0.17`.

For location parameters:

- If mean and median are shown, calculate them correctly.
- Safe simple example: data `2, 3, 3, 4, 8`; sorted data stays the same; median `3`; mean `(2+3+3+4+8)/5 = 4`.
- Use the interpretation: the mean can be pulled by an outlier, the median marks the middle of sorted data.
- Do not label the largest value as the median unless it is actually in the middle.

For spread measures:

- Show spread as distance from the center, not as vertical chart height alone.
- Safe comparison: data set A `4, 5, 6` and data set B `1, 5, 9`; both have mean `5`, but B has larger spread.
- It is okay to avoid exact variance values. If values are shown, keep them consistent.
- Use language such as `kleine Streuung`, `grosse Streuung`, `Standardabweichung als typische Entfernung vom Mittelwert`.

For comparing data with distributions:

- Show observed data as a histogram and a simple theoretical distribution as a smooth or bar-shaped model overlay.
- Emphasize model fit: similar center, width, and shape; deviations are normal in samples.
- Do not claim a model is proven by one matching histogram.

For planning random experiments:

- Show a clear plan: question, random device, fixed number of trials, recording table, relative frequency, evaluation.
- Make it clear that each trial must be under the same conditions.
- Avoid confusing random experiment planning with a survey.

For planning statistical surveys:

- Show population, sample, feature/variable, neutral question wording, data table, and short documentation.
- Avoid leading questions and biased samples. A good contrast is `neutral fragen` versus `Suggestivfrage vermeiden`.
- Do not imply a small convenience sample automatically represents the whole population.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
