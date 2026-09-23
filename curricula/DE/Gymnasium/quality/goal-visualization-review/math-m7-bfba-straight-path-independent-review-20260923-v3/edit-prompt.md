# Bildkorrektur `bfbaedb9` – tatsächliche Prompts

Der erste Edit verwendete das bestehende kanonische JPG als Referenz und erzeugte die später wegen weiterhin gekrümmter Ballbahn zurückgehaltene `v2`-PNG. Der zweite Edit verwendete genau diese `v2`-PNG als Referenz und erzeugte `candidate-v3.png`. Beide Aufrufe erfolgten mit OpenAI/Codex-Bildgenerierung am 23.09.2026. Die Erzeugung ist keine QS-Freigabe; maßgeblich ist die unabhängige Originalbildprüfung neben diesem Dokument.

## Erster Edit (JPG → v2; HOLD)

Referenz: `curricula/DE/Gymnasium/visualizations/mathematik/bfbaedb9-b138-590a-87e8-4d87784dda0e/bfbaedb9-b138-590a-87e8-4d87784dda0e.jpg`

> Edit the supplied German educational comic illustration conservatively. Preserve its overall layout, friendly abstract cartoon style, whiteboard, colors, ball-on-ramp scene, exact German title and all readable labels and symbols. Fix ONE factual inconsistency in the bottom blue card labelled “gerade Bahn”: replace the curved blue trajectory next to the ruler with a clearly straight blue trajectory line, so the diagram agrees with the label. Avoid introducing any other changes, text mistakes, photorealism, new equations, extra icons, or altered arrows. Output as a clean PNG.

## Zweiter Edit (v2 → v3; KEEP-Kandidat)

Referenz: `curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-bfba-straight-path-independent-review-20260923-v2/candidate-v2.png`

> Conservative correction of this exact German educational cartoon, preserving the whole composition, fonts, title, labels, and friendly abstract style. The red ball rolls down a straight brown ramp. The dashed black trajectory starting next to the ball currently bends downward; replace it with ONE visibly straight dashed black arrow running diagonally down-right, parallel to the ramp's straight incline, so the motion path matches the blue card labelled 'gerade Bahn'. End that arrow at the ramp's lower right edge, not in empty space. In the yellow card 'Reibung vernachlässigt', replace the crossed-out running human pictogram with a small simple frictionless ball-on-ramp pictogram: a ball touching a short inclined plane, with no human and no misleading crossed-out person. Preserve the exact texts 'konstante Beschleunigung', 'Reibung vernachlässigt', 'gerade Bahn', 'Annahmen machen das Modell einfacher.', 'Idealisation ≠ Wirklichkeit', and 'Modellierung: Ball auf Rampe'. Do not add new mathematics, curves, labels or arrows. Output clean PNG.
