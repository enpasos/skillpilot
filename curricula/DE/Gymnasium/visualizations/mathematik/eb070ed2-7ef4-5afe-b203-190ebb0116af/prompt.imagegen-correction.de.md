# Bildkorrektur: Parallelkanten am Quader

- Ziel-ID: `eb070ed2-7ef4-5afe-b203-190ebb0116af`
- Provider: OpenAI / ChatGPT-Codex image generation (built-in image_gen; model not exposed)
- Verfahren: Bildbearbeitung des historischen JPG
- Historisches JPG: `eb070ed2-7ef4-5afe-b203-190ebb0116af.jpg`; ursprüngliche Prompt-Provenienz: `prompt.de.md`
- SHA-256 des historischen JPG: `28f183a43d3a12ac251786d4fcab8550dc3566e18742c06558e01e17d7f0d479`
- Aktuelles PNG: `eb070ed2-7ef4-5afe-b203-190ebb0116af.png`
- SHA-256 des aktuellen PNG: `f2466e2594b783ca21cd08c61b0e99bd8e1dc7603885946456ae0b7ca3af9a5d`
- Rechte und Prüfung: SkillPilot-kuratiertes didaktisches Medium unter CC-BY-4.0; Herkunft ist allein kein Lizenz- oder Qualitätsnachweis. Menschliche Freigabe wird nicht beansprucht.

Im früheren Bild waren die Markierungen von `EF` und `AD` vertauscht, obwohl die textlichen Parallelklassen richtig waren. Nach der ersten Korrektur zeigte eine unabhängige Sichtprüfung einen weiteren Annotationsfehler: Die rosa Seitenfläche ist `ADHE`, während der alte Text `ABFE` nannte; der Hinweis `AB ⟂ AE` zeigte nicht klar auf den rechten Winkel bei A. Eine zweite unabhängige Prüfung beanstandete die Zuordnung der beiden Flächen durch nur einen gemeinsamen Zeiger; die dritte Bearbeitung führt zwei getrennte Linien in rosa Seiten- und blaue Grundfläche. Das aktuelle PNG wurde in Originalgröße und bei 360 px auf die drei Kantenfamilien geprüft. Der ursprüngliche `prompt.de.md` bleibt als historische Provenienz unverändert.

## Verwendeter Edit-Prompt

```text
Use case: precise-object-edit / scientific-educational. Image 1 is the exact educational cuboid diagram to repair. Preserve its wide composition, German heading and all existing text verbatim, vertices A B C D E F G H in their exact positions, cuboid geometry, faces, white background, and all other edge markings. Correct ONLY TWO edge-family markings: the horizontal upper-front edge E–F must be BLUE with the same double-chevron parallel mark as A–B, D–C, and H–G (not green/triple); the slanting lower-left depth edge A–D must be GREEN with the same triple-chevron parallel mark as B–C, E–H, and F–G (not blue/double). All four edges in each family must match exactly; red vertical family A–E, B–F, C–G, D–H remains unchanged. Do not alter any labels, formula lines, orthogonality symbols, face text, or vertex placement. Make the correction geometrically exact and legible at original landscape aspect ratio. Output a polished bitmap image; no new elements, no watermark.
```

## Exakter Prompt der abschließenden Annotationskorrektur

```text
Use case: precise-object-edit, mathematical educational diagram. Edit the supplied SkillPilot German cuboid infographic. Preserve the exact wide composition, all vertices A B C D E F G H, all three correct edge-marker families and their exact chevron counts/colors: blue double on AB DC EF HG, green triple on AD BC EH FG, red single on AE BF CG DH. Preserve all other correct parallel statements, title, geometry and colors. Fix ONLY the two orthogonality annotation defects. At the left, change the side-face label from 'Seitenfläche ABFE ⟂ Grundfläche ABCD' to exactly 'Seitenfläche ADHE ⟂ Grundfläche ABCD', since the adjacent PINK SHADED face is ADHE; make its leader/reference clearly point into this pink side face and blue bottom ABCD face, not the unshaded front face. Keep the mathematical perpendicular symbol. At lower left, keep exact true statement 'AB ⟂ AE', but route its black pointer/leader to the actual right angle at vertex A between blue AB (horizontal to B) and red AE (vertical to E), not toward D or green AD. The black right-angle square at A should visibly be between AB and AE. Do not touch any other text, vertex positions, perspective, edge markings, arrowheads, face labels, or equations. Text and geometry must remain mathematically accurate, with no new labels or watermark. Keep the raster legible at 360-pixel width.
```

## Exakter Prompt für getrennte Flächenzeiger

```text
Precise object edit of the supplied wide German cuboid educational image. Do not change ANY geometry, vertices, text, arrows, edge markers, colors, or right-angle markers. All mathematical content is now correct. Repair ONLY the visual leader references for the two-line label at left: 'Seitenfläche ADHE ⟂' (upper line) and 'Grundfläche ABCD' (lower line). Remove the CURRENT SINGLE short black diagonal leader, which wrongly appears to start beside the lower line but ends in the pink side face. Replace it with TWO unmistakable, separate, thin black leader lines with small dots: leader ONE begins by the UPPER phrase 'Seitenfläche ADHE' and terminates well inside the PINK left side face ADHE; leader TWO begins by the LOWER phrase 'Grundfläche ABCD' and terminates well inside the BLUE bottom/base face ABCD. Route the leaders without hiding any text, vertex A/D/E/H, red edge AE, green AD edge, or the right-angle marker. Make the two line origins and different endpoints very obvious, even when reduced to 360px. The text 'AB ⟂ AE' and its separate leader must remain unchanged and must still point to the right angle at A. Preserve exact parallel families: blue double AB DC EF HG, green triple AD BC EH FG, red single AE BF CG DH. No extra symbols, no watermark.
```
