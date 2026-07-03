# Lernzielvisualisierung: 3. Kepler-Gesetz per Skalierungsargument herleiten (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `89cadf81-143b-5f6b-82bd-29ba20d92a1b`
- Titel: 3. Kepler-Gesetz per Skalierungsargument herleiten (LK)
- Beschreibung: Die lernende Person kann allein aus der Skalierung der Bewegungsgleichung im Newtonschen Gravitationsfeld (ohne explizite Bahnrechnung) das Verhältnis zwischen Umlaufzeit $T$ und Bahnradius $a$ bestimmen und so die Exponenten des dritten Kepler-Gesetzes herleiten ($T^2 \propto a^3$).

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `89cadf81-143b-5f6b-82bd-29ba20d92a1b.jpg`
- Public Asset: `/assets/goal-visualizations/physik/89cadf81-143b-5f6b-82bd-29ba20d92a1b/89cadf81-143b-5f6b-82bd-29ba20d92a1b.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Physik; dieser Kontext dient nur der Stil- und Anspruchswahl und soll nicht als Bildtext erscheinen.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: 3. Kepler-Gesetz per Skalierungsargument herleiten (LK)
Beschreibung: Die lernende Person kann allein aus der Skalierung der Bewegungsgleichung im Newtonschen Gravitationsfeld (ohne explizite Bahnrechnung) das Verhältnis zwischen Umlaufzeit $T$ und Bahnradius $a$ bestimmen und so die Exponenten des dritten Kepler-Gesetzes herleiten ($T^2 \propto a^3$).

Zusatzanweisung:
Pflichtinhalt:

- Do not include technical identifiers, filenames, watermarks, platform names, product names, or school/audience labels in the image.
- Create a German LK-level infographic for deriving the third Kepler law by scaling.
- Use a formula balance, not a detailed orbit simulation.
- Required formula chain:
  - `Gravitation: F_G ~ 1/a^2`
  - `Zentripetal: a_z ~ a/T^2`
  - `m*a/T^2 ~ G*M*m/a^2`
  - `T^2 ~ a^3`
  - `T^2/a^3 = konstant`
- Include a small check table:
  - `a = 1 -> T = 1`
  - `a = 4 -> T = 8`
  - both rows have `T^2/a^3 = 1`
- Optional visual: two circular orbit outlines with radii `a` and `4a`, no arrowheads.
- Add note: `M bleibt gleich; nur die Groessenskala a wird verglichen`.

Vermeiden:

- Do not write `T ~ a^3`.
- Do not write `T^3 ~ a^2`.
- Do not put `m` in the final constant; it cancels.
- Do not draw force arrows unless they point from a planet to the central mass.
- Do not add orbit direction arrows.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
