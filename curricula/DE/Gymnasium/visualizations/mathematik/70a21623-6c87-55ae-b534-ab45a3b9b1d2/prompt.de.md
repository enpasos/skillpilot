# Lernzielvisualisierung: Konvergenzgeschwindigkeit numerischer Verfahren vergleichen

## SkillPilot-Ziel

- SkillPilot-ID: `70a21623-6c87-55ae-b534-ab45a3b9b1d2`
- Titel: Konvergenzgeschwindigkeit numerischer Verfahren vergleichen
- Beschreibung: Die lernende Person kann Bisektionsverfahren, Newton-Verfahren und Regula falsi hinsichtlich Konvergenzgeschwindigkeit, Rechenaufwand und Voraussetzungen an Beispielen vergleichen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `70a21623-6c87-55ae-b534-ab45a3b9b1d2.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/70a21623-6c87-55ae-b534-ab45a3b9b1d2/70a21623-6c87-55ae-b534-ab45a3b9b1d2.jpg`

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

Titel: Konvergenzgeschwindigkeit numerischer Verfahren vergleichen
Beschreibung: Die lernende Person kann Bisektionsverfahren, Newton-Verfahren und Regula falsi hinsichtlich Konvergenzgeschwindigkeit, Rechenaufwand und Voraussetzungen an Beispielen vergleichen.

Zusatzanweisung:
Pflichtinhalt:

- Show three method lanes comparing convergence toward `sqrt(2)`:
  - `Bisektion`: intervals halve steadily;
  - `Regula falsi`: secant steps move toward the root;
  - `Newton`: tangent steps approach quickly when the start is good.
- Use a small table with columns `Voraussetzung`, `Schritt`, `Tempo`, `Risiko`.
- Keep entries short:
  - Bisektion: `Vorzeichenwechsel`, `halbiert`, `sicher, langsam`, `robust`;
  - Regula falsi: `Vorzeichenwechsel`, `Sekante`, `mittel`, `einseitig moeglich`;
  - Newton: `Startwert + Ableitung`, `Tangente`, `oft schnell`, `Startwert kritisch`.
- Avoid exact long decimal sequences; the image is about comparison.

Vermeiden:

- Do not claim Newton is always fastest or always safe.
- Do not claim bisection needs derivatives.
- Do not claim Regula falsi loses the enclosing sign-change interval.
- Do not include technical IDs, filenames, watermarks, or brand names.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
