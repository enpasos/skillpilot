# Tatsächliche Bildprompts

Werkzeug: eingebautes `image_gen` (OpenAI/Codex), konkretes Modell nicht ausgewiesen. Neu-Generierung ohne Bildreferenz; danach Bild-Edits mit jeweiligem vorherigem PNG als Editziel. Quelle und Zieltexte sind öffentliches Curriculum-Material; keine Lernenden-, Klassen-, Session- oder Chatdaten wurden an den Bildgenerator gegeben. Technische Goal-IDs wurden nicht gesendet.

## Versuch 1 — verworfen

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

## Versuch 2 — verworfen

Editziel: Versuch 1.

```text
Use case: scientific-educational precise-object-edit.
Edit the attached candidate image. Preserve the attractive friendly comic illustration, two axial sections, double cone geometry, headline labels, and mathematically correct bottom formula exactly as shown. Correct only the two horizontal cross-section insets and the contrast of their equality label.
The top dashed cut is at about z=0.4r above the central blue dots. Therefore the RIGHT turquoise annulus below must have an inner WHITE circular hole with radius about 0.4 times its outer radius r: shrink the existing white hole diameter by about 25% while leaving the annulus outer circle unchanged. The LEFT orange circular disk below must have radius sqrt(r²-z²) ≈ 0.916r: shrink the disk's whole diameter by about 8–9% relative to the turquoise annulus outer diameter, centered under its arrow. The two colored areas should now appear equal: orange disk area π(r²−z²), turquoise annular area πr²−πz². Keep the radius arrows and their exact labels properly attached to the newly sized shapes; the left arrow should end exactly at its new orange disk boundary, the right z arrow exactly at the smaller hole boundary, and the right r arrow exactly at the unchanged annulus outer boundary.
Change the central words "gleiche Schnittfläche" to high-contrast cream/white lettering clearly readable on the dark background, and the equals sign to high-contrast navy on a small pale lozenge if needed. Keep all other words, symbols and their spelling, especially "Kugel", "Zylinder − 2 Kegel", z, r, and the bottom equation V = 2πr³ − 2·(⅓πr³) = ⁴⁄₃πr³. No other redesign, no extra text, no watermark.
```

## Versuch 3 — verworfen nach unabhängiger Sichtung

Editziel: Versuch 2.

```text
Use case: scientific-educational precise-object-edit. Preserve all text, all top diagrams, navy/cream/turquoise/orange comic style, and the exact correct bottom volume equation from the attached image. One mathematical correction only in the bottom LEFT orange horizontal-section circle: it currently appears too large compared with the right annulus, despite the equals sign. Reduce the ENTIRE left orange disk, including its navy circular outline, by roughly SIX percent in diameter, centered on the same blue dot. Move the end of the horizontal sqrt(r²−z²) radius arrow to touch the newly reduced circle boundary. Do not shrink the turquoise annulus or its white inner hole. This makes colored areas visually equal: a disk of radius about 0.88 times the annulus outer radius and an annulus whose hole radius is about 0.47 times its outer radius. Keep the left orange disk visibly smaller in outer diameter than the right turquoise annulus. Keep the right hole white and the two hole/outer-radius arrows touching their proper boundaries. The label “gleiche Schnittfläche” must remain readable cream white, and the small central equals sign must remain clear. No extra text, no new symbols, no watermark.
```

## Versuch 4 — verworfen

Editziel: Versuch 3.

```text
Use case: scientific-educational precise-object-edit. Edit the supplied image, keep every other pixel of its layout and wording as close as possible. Fine-tune only the BOTTOM LEFT orange cross-sectional disk: its radius is now a little too small. Enlarge this orange disk and its navy circular outline by exactly about 4 percent in diameter, staying centered on its blue center dot. Extend its horizontal arrow so the arrow tip touches the enlarged circle boundary. Keep the turquoise annulus, its white hole, every other shape, all the top geometry, the cream 'gleiche Schnittfläche' label, and the correct bottom formula unchanged. The target is an orange disk outer diameter about 0.89 times the turquoise annulus outer diameter, so that the colored areas of orange disk and turquoise annulus match for the depicted z. Preserve the friendly comic classroom style. No extra text or symbols, no watermark.
```

## Versuch 5 — aktueller Kandidat

Editziel: Versuch 3. Die unabhängige Sichtung erkannte den falschen Ansatz des rechten `r`-Pfeils am Lochrand.

```text
Use case: scientific-educational precise-object-edit. Correct one mathematical arrow in the supplied sphere-versus-cylinder-minus-cones illustration. In the BOTTOM RIGHT turquoise annulus, the navy arrow labeled "r" is wrong: it currently starts at the inner hole's rim and ends at the outer rim, measuring ring thickness. Replace it with a clear straight navy radius arrow that STARTS EXACTLY at the common blue CENTER DOT of the annulus and ENDS EXACTLY at the OUTER CIRCLE boundary, passing visibly across the white central hole and the turquoise ring. Place the label "r" above the turquoise part of this full radius arrow. Keep the diagonal arrow labeled "z" starting at the same blue center dot and ending exactly at the INNER HOLE boundary; let it point toward upper right so the two arrows remain distinct. The orange disk radius arrow on the left remains unchanged.
Secondary gentle polish: lighten only the near-black vignette/background toward a warm cream or pale parchment classroom paper, preserving strong navy line and text contrast, orange/turquoise fill and friendly comic appearance. Avoid changing any mathematics: sphere, cylinder minus two cones, same-height dashed cuts, disk/annulus sizes, z and r labels, all correct bottom formula must stay as in supplied image. No extra labels, no watermark, no redesign.
```
