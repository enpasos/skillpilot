# Lernzielvisualisierung: Räumliche Objekte im Koordinatensystem verorten

## SkillPilot-Ziel

- SkillPilot-ID: `aae119f2-925f-5fc1-b795-b52c9e980863`
- Titel: Räumliche Objekte im Koordinatensystem verorten
- Beschreibung: Die lernende Person kann räumliche Objekte im dreidimensionalen Koordinatensystem verorten und geeignete Koordinatenbezüge wählen.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation
- Status: pilot
- Quellbild: `aae119f2-925f-5fc1-b795-b52c9e980863.png`
- Public Asset: `/assets/goal-visualizations/mathematik/aae119f2-925f-5fc1-b795-b52c9e980863/aae119f2-925f-5fc1-b795-b52c9e980863.png`

## Prompt

```text
Use case: precise-object-edit.
Input image 1 is the edit target: an existing friendly German classroom illustration of a cuboid in a three-dimensional coordinate system, with a light blue squared-paper background.
Make only the following local clarity corrections while retaining the cuboid's viewpoint and all eight correctly assigned coordinate labels:
1. Remove the two ambiguous labels "x = 4", the label "y = 3" beside the lower right oblique edge, and the label "z = 2". Replace them with unambiguous dimension annotations: a thin double-ended measurement arrow parallel to the segment from A to B, clearly anchored to those endpoints, labelled "AB = 4"; a thin double-ended measurement arrow directly below the front horizontal segment B to C, clearly anchored to B and C, labelled "BC = 3"; and a thin vertical double-ended measurement arrow just outside the right vertical edge D to H, labelled "Höhe = 2". Place the annotations in available space so they do not cross point labels. In particular, the horizontal front edge B–C is length 3, not 4; the oblique depth edge A–B is length 4, not 3.
2. Remove the unexplained extra dashed horizontal line that cuts across the cuboid's upper region and the extra dashed vertical line inside the right face. Retain only dashed HIDDEN CUBOID EDGES A–B, A–D and A–E. The cuboid must have no extra internal or cross-section lines.
Keep these labels and their point assignments exactly: "O = A = (0|0|0)", "B = (4|0|0)", "C = (4|3|0)", "D = (0|3|0)", "E = (0|0|2)", "F = (4|0|2)", "G = (4|3|2)", "H = (0|3|2)". The x-axis extends from A through B toward lower left, the y-axis extends from A through D toward the right, and z extends from A through E vertically upward. Preserve these axis directions and their x, y, z labels.
Keep the title "Räumliche Objekte im Koordinatensystem verorten", the light blue grid backdrop, friendly hand-drawn comic stroke character, overall landscape composition and correct corner geometry. Do not add extra content, equations, objects, technical IDs, logos or watermarks. Return a PNG raster image.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
