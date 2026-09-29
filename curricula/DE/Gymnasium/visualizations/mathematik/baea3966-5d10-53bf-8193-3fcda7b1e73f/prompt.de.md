# Lernzielvisualisierung: Kugelvolumen mit Cavalieri herleiten

## SkillPilot-Ziel

- SkillPilot-ID: `baea3966-5d10-53bf-8193-3fcda7b1e73f`
- Titel: Kugelvolumen mit Cavalieri herleiten
- Beschreibung: Die lernende Person kann die Formel $V=\frac43\pi r^3$ für das Kugelvolumen mit dem Satz von Cavalieri herleiten, indem sie Kugelquerschnitte mit gleich hohen Schnitten eines Zylinders (Radius $r$, Höhe $2r$) nach Herausnahme zweier Kegel (je Radius und Höhe $r$) vergleicht und das Volumen des Restkörpers berechnet.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation (built-in image_gen; model not exposed)
- Status: pilot
- Quellbild: `baea3966-5d10-53bf-8193-3fcda7b1e73f.png`
- Public Asset: `/assets/goal-visualizations/mathematik/baea3966-5d10-53bf-8193-3fcda7b1e73f/baea3966-5d10-53bf-8193-3fcda7b1e73f.png`

## Prompt

```text
Use case: scientific-educational
Asset type: friendly compact PNG for a German Gymnasium grade-10 learning-goal card
Primary request: Visualize Archimedes' Cavalieri derivation of the volume of ONE sphere without calculus. A sphere of radius r has the same horizontal cross-sectional area at every height as a cylinder of radius r and height 2r after TWO equal cones have been removed.
Style/medium: polished, friendly, abstract comic classroom illustration; warm cream background, rounded navy outlines, orange sphere, turquoise cylinder, pale white cutouts; visually continuous with approachable hand-drawn math illustrations, not photorealistic or sterile engineering CAD.
Composition: wide clean two-column infographic. Left: a precise axial section of a sphere, rendered as a true circle of radius r centered at a blue midpoint dot, fitting exactly inside a faint rectangle of width 2r and height 2r. Right: an identically sized cylinder axial section as a rectangle, with two white cone cross-sections removed: one triangle has its full base across the top edge and its apex EXACTLY at the rectangle center, the other has its full base across the bottom edge and its apex EXACTLY at the same center. The remaining cylinder material is turquoise. At the SAME marked height z above the center, one thin horizontal dashed navy cut line crosses each section. The z mark is measured upward from the common center, 0<z<r. A subtle curved arrow links the two equal-height sections.
Below the two sections, display their TRUE HORIZONTAL cross-sections viewed from above, not vertical silhouettes: below the sphere a filled orange circular disk of radius sqrt(r²−z²), below the cylinder-minus-cones a turquoise annulus with outer radius r and WHITE circular inner hole radius z. Show an equals sign between these two circular AREA views. The disk and annulus need not have equal outer diameter; they have equal area. Use Pythagoras internally to ensure the geometry is consistent.
At the bottom, show only one clearly typeset final formula, exactly: V = 2πr³ − 2·(⅓πr³) = ⁴⁄₃πr³
Text (verbatim; use only these short German labels): "Kugel"; "Zylinder − 2 Kegel"; "gleiche Schnittfläche"; "z"; "r". Ensure labels point to the described object; keep them small and legible.
Constraints: Both removed cones have radius r and height r; together their volumes equal 2·⅓πr³. The sphere and remainder both span height 2r. At z=0, the sphere cross-section fills the radius-r circle and the cone hole shrinks to a point; at z=r both cross-sections shrink to zero. No integral symbol, no invented measurements, no unrelated objects, no logos, no technical IDs, no watermark. Make the mathematics visually precise and the final text genuinely readable at card width.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
