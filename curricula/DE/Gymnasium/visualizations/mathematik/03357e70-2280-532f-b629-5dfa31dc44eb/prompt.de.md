# Lernzielvisualisierung: Tests vergleichen und bewerten (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `03357e70-2280-532f-b629-5dfa31dc44eb`
- Titel: Tests vergleichen und bewerten (LK)
- Beschreibung: Die lernende Person kann unterschiedliche Testverfahren oder Parametereinstellungen hinsichtlich Fehlerwahrscheinlichkeiten und Teststärke vergleichen und begründete Entscheidungen treffen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `03357e70-2280-532f-b629-5dfa31dc44eb.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/03357e70-2280-532f-b629-5dfa31dc44eb/03357e70-2280-532f-b629-5dfa31dc44eb.jpg`

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

Titel: Tests vergleichen und bewerten (LK)
Beschreibung: Die lernende Person kann unterschiedliche Testverfahren oder Parametereinstellungen hinsichtlich Fehlerwahrscheinlichkeiten und Teststärke vergleichen und begründete Entscheidungen treffen.

Zusatzanweisung:
Additional correction for the test-comparison visualization:

- Do not include technical IDs in the image.
- Focus on comparing tests, not on exact probability calculations.
- Use one-sided right-tail tests with `X >= k`.
- Smaller critical value `k` means easier/more aggressive rejection of `H0`; it increases `alpha`, lowers `beta`, and increases power.
- Larger critical value `k` means more cautious/stricter rejection of `H0`; it lowers `alpha`, raises `beta`, and lowers power.
- Do not write "stricter rejection" for small `k`.
- When comparing sample sizes, state that larger `n` can give better separation and higher power at fixed alpha, but costs more data/effort.
- Criteria to show: type-I-error risk `alpha`, type-II-error risk `beta`, power `1-beta`, sample size/cost, and which error is more serious in context.
- Use careful decision language: `H0 verwerfen` / `H0 nicht verwerfen`, not "prove".
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
