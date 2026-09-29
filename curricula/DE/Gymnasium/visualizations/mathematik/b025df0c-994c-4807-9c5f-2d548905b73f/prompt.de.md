# Lernzielvisualisierung: Lagebeziehungen und Schnittpunkte von Geraden im Raum untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `b025df0c-994c-4807-9c5f-2d548905b73f`
- Titel: Lagebeziehungen und Schnittpunkte von Geraden im Raum untersuchen
- Beschreibung: Die lernende Person kann in einfachen Fällen bestimmen, ob zwei Geraden im Raum identisch, echt parallel, sich schneidend oder windschief sind, und bei sich schneidenden Geraden den Schnittpunkt rechnerisch bestimmen.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation (built-in image_gen; model not exposed)
- Status: pilot
- Quellbild: `b025df0c-994c-4807-9c5f-2d548905b73f.png`
- Public Asset: `/assets/goal-visualizations/mathematik/b025df0c-994c-4807-9c5f-2d548905b73f/b025df0c-994c-4807-9c5f-2d548905b73f.png`

## Prompt

```text
# Tatsächliche Imagegen-Edit-Promptfolge

## Aufruf 1 — edit-prompt-1.md

# Actual provider-facing prompt for corrected PNG candidate 1

Edit the supplied German educational infographic about the positions of two straight lines in space. Keep its friendly, clear cartoon infographic style, its exact headline, the blue line g and red line h crossing at yellow S, the two displayed parametric equations, the component-equation calculation, the exact intersection S(1/2|1/2|0), and the right-hand four-case overview. Preserve all numbers and signs. Output a high-resolution PNG, not a photorealistic or technical wireframe redesign.

Correct one mathematically misleading part of the main drawing: the blue line is labeled g: x=(0|0|0)+s*(1|1|0), but in the supplied image its visible drawn path does not pass through the labeled origin O(0|0|0). Remove the entire x/y/z coordinate-axis drawing and the O(0|0|0) label from the central picture. Do not draw any new origin or axes. The blue and red lines may then remain an abstract perspective sketch of two intersecting lines, while the correct algebra determines their coordinate intersection. Keep the background soft and uncluttered after axis removal; a pale grid is okay. Avoid arrows, labels or spatial cues that assert an unverified coordinate placement. The color association g=blue, h=red and their meeting at S must remain clear.

All math in the result must be legible and exact: g: x=(0|0|0)+s*(1|1|0), h: x=(1|0|0)+t*(-1|1|0), s=1-t, s=t, 0=0, s=t=1/2, S(1/2|1/2|0). The four-case labels are schneidend, parallel, identisch, windschief. Do not invent another line equation or change the solution.

## Aufruf 2 — edit-prompt-2.md

# Actual provider-facing targeted edit prompt for corrected PNG candidate 2

Edit the supplied no-axes German line-relationship infographic, preserving its friendly style and the correct main equations, crossing lines, S(1/2|1/2|0), component equations, solution, colors, title and layout. Fix these two exact visual/notation defects only:

1. In the calculation subtitle, replace “(Gleichsetzen: g = h)” with the mathematically precise “(Punkte gleichsetzen: g(s) = h(t))”. The equality is between points at parameters s and t, not a claim that the two lines g and h are identical sets. Make the new subtitle fit and remain legible.

2. In the right-side row labeled “identisch”, the blue and red strokes currently lie side by side with a visible gap, falsely resembling distinct parallel lines. Redraw that icon as a **single shared straight geometric path**: the blue and red lines occupy exactly the same locus for their whole shown length. Show both colors by overlapping strokes with a short alternating blue/red dash pattern on that same centerline, not as two separated parallel strokes. Keep the “identisch” label.

The right-side “windschief” row should remain distinct from “parallel”: if a small depth cue can be added without clutter, give its two non-intersecting lines different depth levels or a subtle 3D plane cue. Do not let them intersect in the drawing. Do not reintroduce coordinate axes or an origin. All other equations and numbers must remain unchanged.

## Aufruf 3 — edit-prompt-3.md

# Actual provider-facing targeted edit prompt for corrected PNG candidate 3

Edit only the bottom “windschief” pictogram in the right-hand “Mögliche Fälle” box of the supplied PNG. The rest of the image is mathematically and visually correct and must remain unchanged, including every equation, number, label, main crossing, the “parallel” row and the single alternating-color path in the “identisch” row.

The current windschief pictogram wrongly looks like another pair of parallel lines. Replace it with a tiny, friendly but geometrically clear 3D schematic: a blue line on a pale blue elevated tilted plane and a red line on a separate lower pale coral tilted plane. The two planes are visibly separated in depth; the blue and red lines have clearly **different** directions, are not parallel, and do not touch or share a point. Small perspective rhombi for the two planes are allowed. Keep the existing “windschief” label immediately below the icon. Do not make the lines cross at a yellow dot; this case has no intersection point. Preserve the rest of the right box and all main algebra perfectly.

## Aufruf 4 — edit-prompt-4.md

# Actual provider-facing targeted edit prompt for corrected PNG candidate 4

Edit the supplied German infographic **only inside the bottom right “windschief” pictogram**. Keep the two separated translucent spatial planes, the upper pale-blue plane and lower pale-coral plane, and all other image content and text pixel-close to the supplied image.

The two line directions inside those planes are still almost parallel in the current pictogram. Make the blue line on the upper blue plane clearly slope upward to the right, while the red line on the lower coral plane clearly slopes **downward to the right**. They should form strongly different directions, roughly a wide X when imagined in one flat projection, but the two colored planes and the lines must stay visibly separated in depth, with no shared point. In the small right-panel icon, the blue line should remain above the red line and should not touch it. Keep the label “windschief”. Do not change the nearby “identisch” single shared path or “parallel” parallel strokes. Do not alter the main g/h example, formulas or solution.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
