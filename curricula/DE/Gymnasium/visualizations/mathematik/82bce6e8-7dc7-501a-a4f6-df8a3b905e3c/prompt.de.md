# Lernzielvisualisierung: Gütefunktion und Teststärke untersuchen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c`
- Titel: Gütefunktion und Teststärke untersuchen (LK)
- Beschreibung: Die lernende Person kann für einen Hypothesentest die Operationscharakteristik beziehungsweise Gütefunktion grafisch darstellen oder skizzieren, Wahrscheinlichkeiten für das Beibehalten bzw. Verwerfen der Nullhypothese in Abhängigkeit vom wahren Wert der Trefferwahrscheinlichkeit p beschreiben und den Einfluss von Stichprobenumfang und Signifikanzniveau diskutieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/82bce6e8-7dc7-501a-a4f6-df8a3b905e3c/82bce6e8-7dc7-501a-a4f6-df8a3b905e3c.jpg`

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

Titel: Gütefunktion und Teststärke untersuchen (LK)
Beschreibung: Die lernende Person kann für einen Hypothesentest die Operationscharakteristik beziehungsweise Gütefunktion grafisch darstellen oder skizzieren, Wahrscheinlichkeiten für das Beibehalten bzw. Verwerfen der Nullhypothese in Abhängigkeit vom wahren Wert der Trefferwahrscheinlichkeit p beschreiben und den Einfluss von Stichprobenumfang und Signifikanzniveau diskutieren.

Zusatzanweisung:
Third correction for the power-function visualization:

- Do not include technical IDs in the image.
- Use very little text.
- Use ASCII labels only: `alpha`, `beta`, `p0`, `p1`. Do not use Greek letters.
- Do not write any full sentence at the bottom.
- Do not write `alpha alpha`, `alpha beta`, `p0 <= alpha`, or any comparison between parameter `p0` and `alpha`.
- Show one clean coordinate diagram:
  - x-axis label: `wahres p`
  - y-axis label: `G(p)=P_p(H0 verwerfen)`
  - increasing S-shaped curve from near 0 to near 1
  - vertical marker at `p0=0.10`
  - vertical marker at `p1>0.10`
- Near `p0`, write exactly: `G(p0) <= alpha`.
- At `p1`, split the vertical range into two clearly labeled parts:
  - lower part from `0` to `G(p1)`: `Teststaerke = G(p1) = 1 - beta`
  - upper part from `G(p1)` to `1`: `beta = 1 - G(p1)`
- Optional small side note only: `groesseres n -> steilere Kurve`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
