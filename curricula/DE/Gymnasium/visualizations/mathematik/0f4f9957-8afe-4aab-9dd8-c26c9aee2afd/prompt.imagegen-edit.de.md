# Bildbearbeitung: Lagebeziehung zweier Ebenen untersuchen (LK)

- Ziel-ID: `0f4f9957-8afe-4aab-9dd8-c26c9aee2afd`
- Provider: OpenAI imagegen edit; SkillPilot curated
- Verfahren: OpenAI built-in imagegen, `text-localization`, Bearbeitung des bisherigen JPG
- Unverändertes historisches JPG: `../../../quality/goal-visualization-review/math-0f-plane-plane-title-20260927-v1/original/canonical-original.jpg`; ursprünglicher Prompt: `prompt.de.md`
- SHA-256 des historischen JPG: `3cbffc6b2ad80b1e5760065e7669fa45f05ba64f5b7b4c8d80de95f09ea4f230`
- Neues aktives PNG: `0f4f9957-8afe-4aab-9dd8-c26c9aee2afd.png`
- SHA-256 des PNG: `02716078e13c78735318f87001034b11daffe2d8bf0ad89de5cc04b8757562b7`
- Herkunft: OpenAI imagegen edit; SkillPilot curated. Das neue eigene didaktische Medium ist `CC-BY-4.0`; die Herkunftsangabe begründet keine Lizenz.
- QA: Unabhängige AI-Sichtprüfung in Originalgröße und bei 360 px am 27.09.2026; mathematische Gleichungen, Lösungsmenge und Schnittgerade geprüft. `humanApproved: no`. Bei 360 px sind die dichten Rechenschritte nur eingeschränkt lesbar; Titel und geometrische Kernaussage bleiben erkennbar.

## Exakter Edit-Prompt

```text
Use case: text-localization
Asset type: SkillPilot Gymnasium mathematics learning-goal infographic, final project raster.
Input images: Image 1 is the EDIT TARGET, the existing wide cartoon infographic about the relation of two planes.
Primary request: Replace ONLY the long German title in the very top bordered banner. It currently says "Lagebeziehungen von Ebenen sowie von Geraden und Ebenen untersuchen (LK)". The replacement must be exactly "Lagebeziehung zweier Ebenen untersuchen (LK)". Center the shorter title within the same banner, preserving the original black handwritten-cartoon typography, color, border, landscape crop, visual balance and approximate letter height.
Constraints: Every other element must remain exactly as in Image 1: second banner "Fokus: Lage zweier Ebenen (E1, E2)", both plane equations E1: x + y + z = 3 and E2: x - y + z = 1, normal vectors n1=(1;1;1) and n2=(1;-1;1), center LGS steps 2y=2 -> y=1, x+1+z=3 -> x+z=2, z=t, x=2-t, y=1, z=t, solution line X=(2;1;0)+t*(-1;0;1), t in R, labels, numbered steps, arrows, colors, 3D intersecting planes, and German interpretation. Do not introduce a line-plane relation. Do not change or add any other text, mathematical symbols, diagram geometry, or labels. Keep all image text sharp and readable at original size and 360-pixel width. No new logo or watermark.
```

Die Bearbeitung hat die Bildgröße und einige Strichdetails neu gerendert; „nur Titel“ bezeichnet die inhaltliche Änderungsabsicht, nicht Pixelgleichheit außerhalb der Überschrift. Das alte JPG war im dargestellten Ebene–Ebene-Beispiel mathematisch korrekt; korrigiert wurde die überbreite Titelbehauptung.
