# Batch-local visualization candidates — provenance and inspection

Date: 2026-09-24. These are generated **candidates only** for three goals whose current QA records say `missing/deferred_quality_review`. The current active image links and QA records were not changed. No candidate is counted as a visualization approval or strict M7 closure.

Provider: built-in OpenAI `image_gen.imagegen` (ChatGPT/Codex image generation). The tool returned no model/version identity, so none is claimed. No reference images or third-party assets were used. The original generated files remain in the local generated-image store; the byte-identical copies below are in this batch only.

All files are 1254 × 1254 RGBA PNG with transparent backgrounds. Each was inspected at full resolution. They use pastel fills, rounded dark outlines, and comic-style diagram drawing. They contain no numeric calculations, text formulas, logos, or watermarks. Their visual language is diagrammatic; an independent review should decide whether the comic style is sufficiently close to the existing body-image landscape before any import.

| Goal | Batch candidate | SHA-256 | Local original generated file |
|---|---|---|---|
| `944dd479-9f30-5acb-ab32-3ea0b6dc8e06` | [944… PNG](944dd479-9f30-5acb-ab32-3ea0b6dc8e06.candidate.png) | `c8d32c21fbf93e3499e15d9ffac0038bb027da3e1e8347d760071f4ab6391542` | `/home/enpasos/.codex/generated_images/01a0d1e0-cc79-7833-b1fe-3d6e1c3e9b98/exec-90e18a5e-6ccb-407e-984e-c2dea49086f5.png` |
| `a594dec0-3977-5c43-9432-d4254a7f6130` | [a594… PNG](a594dec0-3977-5c43-9432-d4254a7f6130.candidate.png) | `a0d016d213e2cc3383909009d5931777dab4479a8de629645da952453e94d446` | `/home/enpasos/.codex/generated_images/01a0d1e0-cc79-7833-b1fe-3d6e1c3e9b98/exec-1f4617a6-dbd6-416e-984e-c2dea49086f5.png` |
| `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2` | [b4fd… PNG](b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2.candidate.png) | `7312f69448ec5bf846e1a3c6e491356a223b5eff8c26025145838ea9209bc329` | `/home/enpasos/.codex/generated_images/01a0d1e0-cc79-7833-b1fe-3d6e1c3e9b98/exec-36904884-4cdc-4d68-9090-b9592cc78e82.png` |

## Technical and visual inspection

- `944…`: the three labeled arrow vectors `a`, `b`, and `c` meet at one vertex of a skew parallelepiped; opposite face pairs are parallel. The curved arrow is only an orientation cue and is not a signed-volume explanation or proof. The candidate does not itself display the scalar triple product, so it cannot repair the current printed TeX readability issue.
- `a594…`: the left body is a parallelepiped; the right body is a tetrahedron. The matching colored vectors start at a shared vertex in each body and preserve direction/length across the comparison. The dashed outline is a comparison cue, not a partition into six congruent tetrahedra. There is no volume formula or claim of equal volume in the picture.
- `b4fd…`: the body is a non-cubic rectangular cuboid. Three translucent mid-planes pass through its center, each parallel to a pair of opposite faces; three dashed center axes follow the three distinct edge directions. No diagonal symmetry is shown.

These checks found no visible mathematical contradiction in the depicted relationships. They are a batch-local AI inspection only. Style acceptance, small-card readability in the product, source/alt-text integration, and the current hash-bound AI visualization ledger review remain open. Do not set `aiApproved`, add `resourceLinks`, deploy, or replace an existing asset from this receipt.

## Actual provider prompts

### `944dd479-9f30-5acb-ab32-3ea0b6dc8e06`

```text
Use case: illustration-story
Asset type: learner-facing mathematics goal visualization, square PNG.
Primary request: a friendly, clear comic-style mathematical illustration for the scalar triple product. Show one parallelepiped spanned by exactly three linearly independent edge vectors that all start at the same lower-left vertex. Draw the three origin edges as arrow vectors, color-coded blue, orange, and green, and label only those arrows a, b, and c. Show the solid as a translucent, accurate skewed parallelepiped whose faces are parallel pairs. Add a small curved orientation arrow around the common starting corner to suggest that reversing vector order reverses orientation, without adding any equation or written explanation.
Scene/backdrop: simple pale warm background with generous margins.
Style/medium: polished hand-drawn comic illustration matching friendly school mathematics artwork; clear outlines, flat pastel fills, approachable and lively, not photorealistic and not sterile technical drawing.
Composition/framing: centered single solid in a three-quarter view, large and uncluttered; legible at a small learning-card size.
Text (verbatim): only the three lowercase vector labels “a”, “b”, “c”.
Constraints: exactly three vectors, all three originate at one common vertex; vector arrowheads point away from that vertex; opposite edges are parallel; geometry must be a parallelepiped. No formula, no numeric values, no extra objects.
Avoid: tetrahedra, cubes or rectangular boxes, wrong vector origins, mismatched labels, false geometric dissection, extra letters or words, watermark, logos, photorealism, technical blueprint styling.
```

### `a594dec0-3977-5c43-9432-d4254a7f6130`

```text
Use case: illustration-story
Asset type: learner-facing mathematics goal visualization, square PNG.
Primary request: a friendly comic-style diagram showing how the same three edge vectors determine the volumes of a skew parallelepiped and a tetrahedron. Place an accurate translucent skew parallelepiped on the left and an accurate triangular tetrahedron on the right. In each body, three independently colored edge arrows a, b, c must all start at one common vertex and have the same directions and lengths in both drawings, so the tetrahedron visibly uses one shared triad of edge vectors. Add a thin dotted outline of the corresponding parallelepiped behind the tetrahedron as a subtle comparison cue. Keep the shape large and uncluttered.
Scene/backdrop: warm pale cream with ample white space.
Style/medium: friendly hand-drawn school-math comic illustration, rounded ink outlines and cheerful pastel shading, in the same approachable family as a classroom cartoon; not a sterile blueprint and not photorealistic.
Composition/framing: two side-by-side solids in three-quarter view, enough separation to distinguish their faces; simple and legible when reduced.
Text (verbatim): only lowercase vector labels “a”, “b”, “c” beside their matching arrows.
Constraints: the left body is a parallelepiped with opposite faces parallel; the right body is a tetrahedron with four triangular faces. Each body's three labeled vectors meet at one vertex and correspond in direction and length across both bodies. No formula and no numeric values.
Avoid: showing six congruent tetrahedra, implying tetrahedron and full parallelepiped have equal volume, wrong face count, labels not matching vectors, extra letters/words, logos, watermarks, photorealism, technical blueprint styling.
```

### `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2`

```text
Use case: illustration-story
Asset type: learner-facing mathematics goal visualization, square PNG.
Primary request: a friendly, clear comic-style three-dimensional illustration that helps a student inspect symmetries of a non-cubic rectangular cuboid. Show one cuboid whose three edge lengths are visibly different. Pass exactly three thin translucent mirror planes through its center, each parallel to one pair of opposite faces, so each plane divides the cuboid into matching mirror halves. Also show exactly three dashed center axes through the cuboid, each parallel to one of its edge directions, indicating half-turn rotational symmetry. Use separate soft colors for the planes and axes and keep the solid geometry precise.
Scene/backdrop: quiet warm cream background, faint soft grounding shadow only.
Style/medium: approachable hand-drawn school-math comic illustration, rounded dark outlines, gentle pastel shading and subtly playful linework; clean and readable at small card size, not a sterile technical drawing and not photorealistic.
Composition/framing: centered three-quarter view; the full cuboid and all three planes/axes remain inside the frame, with clear visual separation between transparent planes and dashed axes.
Text (verbatim): no words, letters, numbers, formulas, or labels.
Constraints: rectangular cuboid is clearly not a cube; exactly three central mirror planes, each parallel to an opposite face pair; exactly three central axes, each parallel to a distinct edge direction; the planes and axes pass through the center. No other claimed symmetry is depicted.
Avoid: cube, sphere, cylinder, diagonal symmetry planes, axes along diagonals, more than three mirror planes, more than three axes, incorrect planes outside the body, labels, text, watermarks, logos, photorealism, blueprint-grid styling.
```

Prompt-preparation helper outputs are also retained beside the candidates as `*.prepared-prompt.de.md`. The actual prompts above, not the helper’s default provider prompt, were passed to the image generation tool.
