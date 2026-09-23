# Lernzielvisualisierung: Begrenzte Wachstums- und Zerfallsprozesse aus Daten modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `4ae9e316-509f-517d-bd94-a165817af24f`
- Titel: Begrenzte Wachstums- und Zerfallsprozesse aus Daten modellieren
- Beschreibung: Die lernende Person kann zu experimentellen Daten ein Modell für begrenztes Wachstum oder begrenzten Zerfall aufstellen, die Begrenzungsgröße und weitere Modellparameter bestimmen und die Modellannahmen im Kontext deuten.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation
- Status: pilot
- Quellbild: `4ae9e316-509f-517d-bd94-a165817af24f.png`
- Public Asset: `/assets/goal-visualizations/mathematik/4ae9e316-509f-517d-bd94-a165817af24f/4ae9e316-509f-517d-bd94-a165817af24f.png`

## Prompt

```text
Use case: scientific-educational
Asset type: one wide PNG learning-goal illustration for upper-secondary mathematics
Primary request: Show how experimental observations can be represented by a bounded-growth model. Use a friendly, clear, abstract comic look matching approachable existing SkillPilot learning-goal art.
Scene/backdrop: A tidy, lightly colored classroom greenhouse, without logos or decorative clutter.
Subject: On the left, a student measures the height of one potted plant with a ruler and records successive observations as five small blue dots on a nearby clipboard. On the right, make the data-to-model idea unmistakable with one large simple graph: horizontal time axis pointing right, vertical measured-height axis pointing up, exactly five blue observation dots rising and then leveling off, and one smooth green fitted curve following them. The curve must be monotonically increasing, concave down, and approach—but never touch or cross—a clearly dashed horizontal limiting line. The line represents a growth ceiling, not a measured data series. A small mature plant silhouette near the ceiling can reinforce the real-world meaning.
Style/medium: polished 2D comic illustration, warm and kind, clean outlines, restrained color, readable at a small cockpit-card size. The graph is friendly and integral to the illustration, not a sterile technical chart.
Composition/framing: wide landscape; student and plant on left, graph on right; uncluttered and visually balanced.
Text: no headings, formulas, numerical tick labels, units, or paragraphs. If short axis labels are necessary, use only the exact German words "Zeit" and "Höhe".
Constraints: The graph's five points and fitted curve must tell one consistent bounded-growth story. No decreasing section, oscillation, sigmoid inflection, straight-line continuation, extra curves, extra dots, or curve crossing the limit. No photorealism, watermarks, copied worksheet, provider artifacts, or technical IDs.

Targeted edit of the first generated candidate (which was rejected because the dashed limit was too far above the nearly flat curve):
Use case: precise-object-edit
Input images: Image 1 is the edit target, a friendly comic educational illustration of bounded plant growth.
Primary request: Correct ONLY the dashed horizontal limiting line in the graph. Move that dashed line down so that it sits only a very small visible distance above the green fitted curve at the far-right edge, approximately 8–10 image pixels, while still remaining strictly above the green curve and all five blue data points. The dashed line must read unmistakably as the value that this green curve approaches from below, not as a remote unrelated line.
Constraints: Preserve the entire illustration's composition, student, plant, clipboard, five blue plotted data points, single smooth increasing concave-down green curve, both axis labels spelled exactly "Höhe" and "Zeit", colors, comic style, and the mature plant motif. Do not move the graph curve or its points; change only the y-position of the dashed horizontal limit line. No new text, numbers, curves, points, watermarks, or other objects. Keep a clear nonzero gap between curve and dashed line.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
