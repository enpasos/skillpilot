# Lernzielvisualisierung: Stichprobenumfang für vorgegebene Konfidenzniveaus planen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `410221ed-540c-5daf-8c42-d8dd12e9100a`
- Titel: Stichprobenumfang für vorgegebene Konfidenzniveaus planen (LK)
- Beschreibung: Die lernende Person kann auf Grundlage der Sigma-Regeln für vorgegebene Konfidenzniveaus und gewünschte Genauigkeit den benötigten Stichprobenumfang berechnen oder abschätzen und die Planung im Kontext begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `410221ed-540c-5daf-8c42-d8dd12e9100a.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/410221ed-540c-5daf-8c42-d8dd12e9100a/410221ed-540c-5daf-8c42-d8dd12e9100a.jpg`

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

Titel: Stichprobenumfang für vorgegebene Konfidenzniveaus planen (LK)
Beschreibung: Die lernende Person kann auf Grundlage der Sigma-Regeln für vorgegebene Konfidenzniveaus und gewünschte Genauigkeit den benötigten Stichprobenumfang berechnen oder abschätzen und die Planung im Kontext begründen.

Zusatzanweisung:
Additional correction for the sample-size planning visualization:

- Do not include technical IDs, filenames, watermarks, or product names in the image.
- Focus on the planning idea: larger sample size `n` means smaller standard error and therefore a narrower confidence interval.
- Show two side-by-side intervals with the same observed center `h`, for example:
  - `n=100`: wide interval
  - `n=400`: about half as wide
- If a formula is shown, use a correct conservative planning formula for proportions:
  - `n >= z^2 / (4*e^2)` for the worst case `p*(1-p) <= 1/4`
  - Example for 95% confidence and accuracy `e=0.05`: `n approx 385`
- Do not show `n approx (z/e)^2` without the factor `1/4`.
- If the full formula would make the image crowded, omit formulas and show only the qualitative relation `n larger -> interval narrower`.
- Do not imply that changing `n` changes the true probability `p`; only the estimation precision changes.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
