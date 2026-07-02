# Lernzielvisualisierung: Primzahltests erläutern (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `d32f599e-3b38-5557-8ad3-565bcd99f4c6`
- Titel: Primzahltests erläutern (LK)
- Beschreibung: Die lernende Person kann die Funktionsweise eines Primzahltests, zum Beispiel des Miller-Rabin-Tests, fachsprachlich erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `d32f599e-3b38-5557-8ad3-565bcd99f4c6.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/d32f599e-3b38-5557-8ad3-565bcd99f4c6/d32f599e-3b38-5557-8ad3-565bcd99f4c6.jpg`

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

Titel: Primzahltests erläutern (LK)
Beschreibung: Die lernende Person kann die Funktionsweise eines Primzahltests, zum Beispiel des Miller-Rabin-Tests, fachsprachlich erläutern.

Zusatzanweisung:
Pflichtinhalt:

Explain a deterministic prime test by trial division up to the square root.
Use exactly the example `n = 29`.
Show `sqrt(29) < 6`, so test prime divisors `2, 3, 5`.
Show checks:
`29` is not divisible by `2`.
`29` is not divisible by `3`.
`29` is not divisible by `5`.
Conclusion: no divisor up to `sqrt(29)`, so `29` is prime.
Also include a small contrast box: `91 = 7 * 13`, therefore not prime.

Vermeiden:

Do not claim that testing only `2` and `3` is enough for `29`.
Do not say `1` is prime.
Do not use Miller-Rabin witness notation in this image.
Use no arrows; use checklist rows and a conclusion box.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
