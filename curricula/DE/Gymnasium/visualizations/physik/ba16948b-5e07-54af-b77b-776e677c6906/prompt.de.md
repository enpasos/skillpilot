# Lernzielvisualisierung: Gravitationswellen und elektromagnetische Wellen vergleichen

## SkillPilot-Ziel

- SkillPilot-ID: `ba16948b-5e07-54af-b77b-776e677c6906`
- Titel: Gravitationswellen und elektromagnetische Wellen vergleichen
- Beschreibung: Die lernende Person kann Gemeinsamkeiten und Unterschiede elektromagnetischer Wellen und Gravitationswellen qualitativ beschreiben.

## Erzeugung und Korrektur

- Basis: Google Gemini / Nano Banana Pro (`gemini-3-pro-image`)
- Korrektur: deterministische, lokal begrenzte SVG-Überlagerung nach wiederholten
  unzureichenden Referenzbildkorrekturen
- Status: pilot; vom Product Owner am 29. August 2026 als hinreichend gut bestätigt
- Geometriequelle: `em-wave-geometry-correction-v2.svg`
- Public Asset: `/assets/goal-visualizations/physik/ba16948b-5e07-54af-b77b-776e677c6906/ba16948b-5e07-54af-b77b-776e677c6906.jpg`
- Asset-SHA-256:
  `db637dbe6ca80ebc329d60ed64da7db656bb686ef275357632b6afbb8001c08a`

## Gebundene Geometrie

Die Ausbreitungsachse verwendet fünf gemeinsame Nullstellen für beide Felder:

```text
Z0=(1700,571)  Z1=(1880,638)  Z2=(2060,705)
Z3=(2240,772)  Z4=(2420,839)
```

Damit liegen genau vier aufeinanderfolgende E- und B-Halbwellen in denselben
Phasenintervallen. Die B-Pfeile wechseln von links unten nach rechts oben,
links unten und rechts oben. Insbesondere ist das dritte B-Bündel auf `Z2–Z3`
begrenzt; es endet auf `k`, bevor das vierte Bündel beginnt. Die schwarze
Ausbreitungsachse wird über den Feldflächen gezeichnet.

## Review-Notiz

Die unabhängige Physikprüfung in Originalauflösung ist bestanden. Eine getrennte
visuelle Prüfung dokumentierte die sichtbare lokale Überlagerung und den etwas
glatteren Stil als verbleibende Schönheitsfehler. Der Product Owner hat genau
diese Variante anschließend ausdrücklich als nicht perfekt, aber hinreichend gut
für den Zwischenstand bestätigt. Details stehen in `physik-batch-087.md`.
