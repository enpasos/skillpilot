# V2 image edit prompt

**Mode:** built-in `image_gen` precise-object-edit, with v1 `genmutationen-candidate.png` as the local edit target. The v1 image was viewed before editing. The built-in tool produced the new PNG under its generated-images directory; the selected result was copied into this versioned package without replacing v1.

## Exact correction prompt

Use case: precise-object-edit
Asset type: correction of the unpublished SkillPilot biology mutation diagram
Change only the purple copy arrow in the bottom-right Duplikation card. The LEFT BEFORE strip in that card has five blocks: blue, coral, yellow, teal, violet. The RIGHT AFTER strip has seven blocks: blue, coral, yellow, teal, yellow, teal, violet. The source pair is the YELLOW–TEAL third and fourth blocks in the LEFT BEFORE strip. The new copied pair is the YELLOW–TEAL fifth and sixth blocks in the RIGHT AFTER strip. DELETE the old short purple arc above the right strip. Draw ONE thick, unambiguous purple curved copy arrow that STARTS directly above the source yellow–teal pair in the LEFT BEFORE strip, arches across the gap in open cream space, and ENDS with a downward arrowhead centered directly above the NEW yellow–teal pair (fifth and sixth blocks) in the RIGHT AFTER strip. The arrow must visibly connect the source pair to its copy. Preserve every heading and its exact spelling, all four panels, ALL block colors, counts and order, all black before-to-after arrows, the deletion X, image dimensions and warm hand-drawn style. Do not add any second copy arrow, words, numbers, blocks, DNA helix, protein or phenotype claims.

The base generation and first deletion-X correction prompts remain archived in v1 `visualization/prompt.md`.
