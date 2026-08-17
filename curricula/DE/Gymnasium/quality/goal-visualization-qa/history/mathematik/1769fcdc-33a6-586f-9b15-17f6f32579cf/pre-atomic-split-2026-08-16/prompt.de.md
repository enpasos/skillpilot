# Lernzielvisualisierung: Zufallsexperimente beschreiben und Laplace-Wahrscheinlichkeiten vergleichen

## SkillPilot-Ziel

- SkillPilot-ID: `1769fcdc-33a6-586f-9b15-17f6f32579cf`
- Titel: Zufallsexperimente beschreiben und Laplace-Wahrscheinlichkeiten vergleichen
- Beschreibung: Die lernende Person kann Zufallsexperimente mit Ergebnis, Ergebnismenge und Ereignis beschreiben, Laplace-Wahrscheinlichkeiten bestimmen und sie an konkreten Beispielrechnungen (z. B. vierfacher Münzwurf: Anzahl "Kopf") mit relativen Häufigkeiten vergleichen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `1769fcdc-33a6-586f-9b15-17f6f32579cf.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/1769fcdc-33a6-586f-9b15-17f6f32579cf/1769fcdc-33a6-586f-9b15-17f6f32579cf.jpg`

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

Titel: Zufallsexperimente beschreiben und Laplace-Wahrscheinlichkeiten vergleichen
Beschreibung: Die lernende Person kann Zufallsexperimente mit Ergebnis, Ergebnismenge und Ereignis beschreiben, Laplace-Wahrscheinlichkeiten bestimmen und sie an konkreten Beispielrechnungen (z. B. vierfacher Münzwurf: Anzahl "Kopf") mit relativen Häufigkeiten vergleichen.

Zusatzanweisung:
Keep the probability examples mathematically simple and correct.
Use only small, checkable numbers.
Allowed example facts:
- Laplace probability: P(E) = favorable outcomes / all equally likely outcomes.
- Fair die: P(even number) = 3/6 = 1/2.
- Urn without replacement: 5 red and 3 blue balls, draw 2 without replacement.
  P(2 red) = C(5,2) / C(8,2) = 10/28 = 5/14.
  In a tree, after drawing red first the second red probability is 4/7, not 5/8.
- Urn with replacement / binomial model: 3 trials, success probability p = 0.4 each time.
  P(exactly 2 successes) = C(3,2) * 0.4^2 * 0.6 = 0.288.
  The branch probability p stays the same after each draw.
- Compare models: without replacement means branch probabilities change; with replacement means branch probabilities stay the same.
- Random variable table example: X = number of heads in two fair coin tosses.
  P(X=0)=1/4, P(X=1)=1/2, P(X=2)=1/4; sum = 1.
If a table or chart is shown, the probabilities must add to 1.
Do not invent additional numbers or inconsistent sums.
Avoid dense tiny equations; make labels readable.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
