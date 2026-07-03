# Lernzielvisualisierung: Entropie E13: Boltzmann-Formel und Zählmodelle

## SkillPilot-Ziel

- SkillPilot-ID: `b6dfd3e6-2dd3-5983-9a27-7e7db70e8db8`
- Titel: Entropie E13: Boltzmann-Formel und Zählmodelle
- Beschreibung: Die lernende Person kennt die Boltzmann-Formel $S = k_B \ln\Omega$ explizit, nutzt sie sicher und berechnet $\Omega$ in einfachen Modellen (z. B. Teilchen links/rechts, Münzwurfmodell $\Omega = \binom{N}{n}$), um zu zeigen: Gleichverteilungen besitzen überwältigend viele Mikrozustände.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `b6dfd3e6-2dd3-5983-9a27-7e7db70e8db8.jpg`
- Public Asset: `/assets/goal-visualizations/physik/b6dfd3e6-2dd3-5983-9a27-7e7db70e8db8/b6dfd3e6-2dd3-5983-9a27-7e7db70e8db8.jpg`

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

Titel: Entropie E13: Boltzmann-Formel und Zählmodelle
Beschreibung: Die lernende Person kennt die Boltzmann-Formel $S = k_B \ln\Omega$ explizit, nutzt sie sicher und berechnet $\Omega$ in einfachen Modellen (z. B. Teilchen links/rechts, Münzwurfmodell $\Omega = \binom{N}{n}$), um zu zeigen: Gleichverteilungen besitzen überwältigend viele Mikrozustände.

Zusatzanweisung:
Pflichtinhalt:

- Do not include technical identifiers, filenames, watermarks, platform names, product names, or school/audience labels in the image.
- Create a German infographic titled `Boltzmann-Formel und Zaehlen`.
- Show the formula prominently: `S = k_B ln(Omega)`.
- Explain symbols with text badges:
  - `k_B: Boltzmann-Konstante`
  - `Omega: Anzahl der Mikrozustaende`
- Use a checked counting table for `N = 4` particles and `n = Anzahl links`:
  - `n = 0: Omega = 1`
  - `n = 1: Omega = 4`
  - `n = 2: Omega = 6`
  - `n = 3: Omega = 4`
  - `n = 4: Omega = 1`
- Show the combinatorics formula: `Omega = binom(N,n)`.
- Add conclusion: `Gleichverteilung hat die meisten Mikrozustaende`.
- Strict arrow rule: no arrows anywhere in the image. Use a table, formula cards, and text only.

Vermeiden:

- Do not draw arrows, connector arrows, comparison arrows, or formula-flow arrows.
- Do not write `Omega = N/n`.
- Do not give the wrong count for `N = 4, n = 2`; it must be `Omega = 6`.
- Do not claim maximum entropy occurs when all particles are on one side.
- Do not use a probability formula instead of the microstate count.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
