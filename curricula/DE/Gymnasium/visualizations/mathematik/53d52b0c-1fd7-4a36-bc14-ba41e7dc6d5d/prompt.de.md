# Als Menge invariante und punktweise fixe Gerade

- Ziel: `53d52b0c-1fd7-4a36-bc14-ba41e7dc6d5d`
- Verfahren: eingebaute OpenAI / ChatGPT-Codex image generation; keine API-Modellversion behauptet
- Finale Datei: `53d52b0c-1fd7-4a36-bc14-ba41e7dc6d5d.png`
- Fachliches Beispiel: links Verschiebung längs einer Geraden (Menge invariant, Punkte nicht fix), rechts Spiegelung an derselben Geraden (jeder Punkt der Geraden fix).

## Generierungsprompt des finalen Bildes

```text
Use case: scientific-educational
Asset type: compact SkillPilot mathematics PNG, wide landscape card for German upper secondary
Primary request: A CLEAN ABSTRACT TWO-PANEL COMIC DIAGRAM, not a scene, comparing two affine transformations of a horizontal line. Left panel: translation along the horizontal blue line, so the line stays as a set but no marked point stays in place. Right panel: reflection across a horizontal blue line, so each point on it stays exactly where it is.
Visual construction: The two panels have equal size and a simple pale blue or cream background, separated by a navy vertical divider. In each panel put a THICK horizontal blue line across the middle. On the left put exactly three pairs of dots ON the line: each faint translucent old dot followed a short distance to the right by a solid dot of the same color, joined by a short right-pointing arrow ON the line. Colors of the three pairs are orange, green, violet. On the right put exactly three solid dots on its line, with small green halo rings around each but NO arrows. Make diagrams LARGE and central; they occupy at least half the image height. Caption left: "Gerade bleibt als Menge" then "Punkte wandern". Caption right: "Gerade punktweise fix" then "Jeder Punkt bleibt". Optional compact heading at top "Invariante oder fixe Gerade?". Text precisely as quoted, no other words.
Style/medium: friendly abstract flat comic infographic, rounded panels, thick crisp contours, cheerful but restrained blue/green/orange/violet palette. Clear at reduced goal-card width. No people, no faces, no hands, no sky, no clouds, no grassy scenery, no decorative clipart, no photorealism.
Accuracy: All arrows and both endpoints of each arrow must be on the same horizontal line. In the left panel, each of the three old dots and its corresponding solid dot have exactly the same vertical coordinate and different horizontal coordinates. In the right panel, all marked points lie directly on the line and do not move. Do not draw off-line points or arbitrary movement symbols. No equations, integrals, watermarks, technical IDs.
```

## Gezielte Korrektur des generierten Bildes

Der erste Kandidat dieses Prompts hatte transparente Ränder und
Farb-Artefakte an den Panelkanten. Die finale PNG entstand mit folgender
Bildkorrektur unter Verwendung dieses Kandidaten als Bildvorlage:

```text
Edit the previous two-panel abstract math infographic with only a visual clean-up. Keep every German word, dot, arrow, line, and the two-panel mathematical layout unchanged. Make the whole PNG a solid fully OPAQUE pale ivory or very light sky-blue card background, including all outer corners and the gap under the title. Remove the jagged bright-blue stray pixels and black transparent seams around panel borders and beneath the title banner. Keep smooth navy borders, no clipped or duplicated lines, no people or scenery. The point motions on the left and fixed point rings on the right must remain exactly as they are. Do not add or modify any mathematics or wording.
```
