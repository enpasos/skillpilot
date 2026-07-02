# Lernzielvisualisierung: Anschlussbedingungen ohne Sprung und Knick modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `4b16fce6-84cc-52ae-98ca-f88cc518cc28`
- Titel: Anschlussbedingungen ohne Sprung und Knick modellieren
- Beschreibung: Die lernende Person kann Anschlussbedingungen ohne Sprung und ohne Knick durch geeignete ganzrationale Funktionen modellieren und fachlich deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `4b16fce6-84cc-52ae-98ca-f88cc518cc28.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/4b16fce6-84cc-52ae-98ca-f88cc518cc28/4b16fce6-84cc-52ae-98ca-f88cc518cc28.jpg`

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

Titel: Anschlussbedingungen ohne Sprung und Knick modellieren
Beschreibung: Die lernende Person kann Anschlussbedingungen ohne Sprung und ohne Knick durch geeignete ganzrationale Funktionen modellieren und fachlich deuten.

Zusatzanweisung:
Pflichtinhalt:

Show how to model a smooth connection without jump and without kink.
Use exactly this example:
- left piece: `p(x) = x + 1` for `x <= 2`
- right piece: `q(x) = 0.2*(x - 2)^2 + x + 1` for `x >= 2`
- connection point: `A(2|3)`
- no jump: `p(2) = 3` and `q(2) = 3`
- no kink: `p'(2) = 1` and `q'(2) = 1`

Use a graph with the straight left piece and the gently curved right piece meeting at `A(2|3)`. Add a two-row condition table:
`Funktionswert gleich: 3 = 3`; `Steigung gleich: 1 = 1`.

The graph curves themselves must be ordinary line strokes with rounded ends and no arrowheads. Only coordinate axes may have arrowheads.

Vermeiden:

Do not leave a visible gap at `x=2`.
Do not draw a sharp corner at `A`.
Do not change the connection point.
Do not write `q'(2)=0`; it must be `1`.
Do not add arrows on the function graph. Do not make the orange curve end in an arrowhead.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
