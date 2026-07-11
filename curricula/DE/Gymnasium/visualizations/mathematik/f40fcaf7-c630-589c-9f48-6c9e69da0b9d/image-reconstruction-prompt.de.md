# Bildrekonstruktionsprompt: Bisektionsverfahren zur Nullstellennäherung anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `f40fcaf7-c630-589c-9f48-6c9e69da0b9d`
- Titel: Bisektionsverfahren zur Nullstellennäherung anwenden
- Beschreibung: Die lernende Person kann für eine stetige Funktion ein Vorzeichenwechselintervall begründen, das Bisektionsverfahren schrittweise durchführen und die entstehende Intervallschachtelung als Nullstellennäherung deuten.

## Generator

- Provider: OpenAI built-in image generation
- Quellbild: `f40fcaf7-c630-589c-9f48-6c9e69da0b9d.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Use case: scientific-educational
Asset type: didactic mathematics infographic for upper-secondary learners
Primary request: Create a clean, mathematically exact, flat cartoon-style landscape infographic titled "Bisektionsverfahren". Use a warm-white background, dark blue title, three equally tall rounded panels, restrained blue/teal/orange colors, generous whitespace and highly legible mathematical typography.

Panel 1 heading: "Vorzeichenwechsel"
Show "f(x) = x² − 2". Beneath it place a blue card "f(1) = −1" and an orange card "f(2) = 2". Between/below the cards show a blue minus sign, a two-way arrow, an orange plus sign and the interval "[1; 2]". Do not draw a coordinate graph.

Panel 2 heading: "Zwei Bisektionsschritte"
Use three stacked white cards with teal outlines and downward arrows. Render exactly:
"Start: [1; 2]"
"m = 1,5; f(m) = 0,25  →  [1; 1,5]"
"m = 1,25; f(m) = −0,4375  →  [1,25; 1,5]"

Panel 3 heading: "Intervallschachtelung"
Use three centered boxes that become successively narrower, connected by downward arrows. Render exactly:
"1 < √2 < 2"
"1 < √2 < 1,5"
"1,25 < √2 < 1,5"
Below them render "√2 ≈ 1,414".

Constraints: German decimal commas only; semicolons inside intervals; every number, sign and inequality exactly correct; no number line; no coordinate graph; no tangent or secant; no extra calculations; no technical IDs; no filenames; no logos; no brands; no watermark.
```
