# Lernzielvisualisierung: Rechtwinkligkeit mit dem Kehrsatz des Pythagoras prüfen

- Ziel-ID: `081c9802-6da7-5ae8-b78e-f99c2b2dbb14`
- Aktives Quellbild: `081c9802-6da7-5ae8-b78e-f99c2b2dbb14.png`
- SHA-256: `4d2d8170e20beca927eaa82696250221a1415439e4b3fdaa01b5b80b5d1996d7`
- Generator: OpenAI built-in imagegen (konkrete Modellkennung vom Tool nicht ausgegeben)
- Lizenz des SkillPilot-eigenen didaktischen Bildes: CC-BY-4.0
- Status: KI-geprüfter Pilotkandidat; keine menschliche Freigabe

Die früher aktive SVG-Datei `081c9802-6da7-5ae8-b78e-f99c2b2dbb14.svg` bleibt unverändert als historische Quelle erhalten. Deren ursprünglicher Prompt liegt in `prompt.svg-20260928-historical.de.md`. Die folgenden Prompts wurden bei der Erstellung des aktiven PNGs exakt in dieser Reihenfolge verwendet. Die lokale Referenz war jeweils eine SkillPilot-eigene Grafik.

## Versuch 1: rejected, corrected by next attempt

- Datei: `tmp/m7-20260928-continuation/pyth-converse-criterion-rejected-proportions.png`
- SHA-256: `278174ded60fc5300683680e5280f351184566da954ce316ca1c3e0f5eb2342b`
- Befund: The drawn 5-to-12 side ratios were substantially inconsistent with the labels, despite correct calculations; this could mislead learners about geometric side lengths.

```text
Use case: scientific-educational.
Asset type: landscape 16:9 PNG learning-goal illustration for German grade 9 mathematics, readable as a 360-pixel-wide card.
Primary request: Show how to APPLY the converse of the Pythagorean theorem to decide whether a triangle with GIVEN side lengths is right-angled. This is a comparison task, not a proof of the theorem.
Composition: friendly, abstract classroom-comic illustration on warm off-white, two large side-by-side rounded cards. At the top of each card, big readable side-length triple; below it a triangle with numbers written directly beside their correct sides; at bottom one short exact equality/inequality and conclusion.
LEFT green-blue card: a 5-12-13 right triangle. The vertical leg is exactly labelled "5", the horizontal leg exactly "12", and the diagonal longest side exactly "13"; a small square marks the right angle where 5 and 12 meet. Exact bottom text: "5²+12²=13²" and "rechtwinklig". Highlight the longest side 13 in coral.
RIGHT soft coral-blue card: a 5-12-14 non-right triangle. The long horizontal base is exactly labelled "14"; a shorter left sloping side is "5"; the other sloping side is "12". The apex angle opposite 14 is visibly obtuse, with NO right-angle square anywhere. Exact bottom text: "5²+12²≠14²" and "nicht rechtwinklig". Highlight the longest side 14 in coral.
Add one very short top instruction, exact German text: "Längste Seite finden · Quadratsummen vergleichen". Keep all three numbers clearly visible. Use consistent side-color logic in both cards (short side green, middle side blue, longest side coral).
Style: polished, inviting comic-like educational art, subtle paper texture, rounded dark navy outlines, large clean lettering, generous whitespace, consistent with modern SkillPilot math learning images. No photo, no sterile technical plot, no characters, no logo, no watermark, no IDs.
Accuracy: Both triples form valid triangles; 5²+12²=169=13², while 14²=196, so the second is not right. Never mark the 5-12-14 triangle as right. The right angle in the left triangle must be opposite its longest side 13. Place no extra numerical claims.
```

## Versuch 2: selected candidate

- Datei: `tmp/m7-20260928-continuation/pyth-converse-criterion-imagegen.png`
- SHA-256: `4d2d8170e20beca927eaa82696250221a1415439e4b3fdaa01b5b80b5d1996d7`
- Referenz: `tmp/m7-20260928-continuation/pythagoras-converse-criterion-exact.preview.png` (SHA-256 `542de29255f5687ca99389d0fd3611f023246eb147cf6a7e133d1d0a311fba73`)

```text
Use case: scientific-educational style-transfer.
Asset type: landscape PNG learning-goal illustration for German grade 9 math.
Input image role: a locally authored mathematically exact reference diagram. Re-illustrate it as a warm comic-like classroom image while preserving its mathematical structure precisely. This is an edit, not a new layout.
Primary request: retain EXACT triangle geometry and side relationships from the reference: left right triangle with perpendicular sides 5 and 12 in correct 5:12 pixel proportion and hypotenuse 13; right non-right triangle whose sides 5,12,14 are drawn at the exact relative proportions of the reference, with longest side 14 opposite an obtuse angle. Keep the correct square at left right angle only. The diagrams are the high-priority invariant. Keep all labels attached to the same sides, including formulas 5²+12²=13² and 5²+12²≠14², and conclusions "rechtwinklig" and "nicht rechtwinklig". Do not change numbers, relationships, vertices or angle markers.
Style changes only: replace sterile technical aesthetic with inviting but clear comic-like educational art. Rounded dark navy outlines, light warm paper texture, soft green and coral background cards, vivid but restrained blue-green-coral side colors, large legible lettering. Keep nearly all text of the original short and exact, avoid decorative additions. No photos, no characters, no watermark, no IDs.
At 360px card width the key triples, equations and conclusions must still be readable. Mathematical fidelity to reference is more important than visual novelty.
```

Die technische Kandidaten- und Fehlerdokumentation liegt unter `tmp/m7-20260928-continuation/pyth-converse-png-candidates.json`. Der eigenständige Bildreview liegt unter `curricula/DE/Gymnasium/quality/goal-visualization-review/m7-current-image-repairs-20260928-v1/`.
