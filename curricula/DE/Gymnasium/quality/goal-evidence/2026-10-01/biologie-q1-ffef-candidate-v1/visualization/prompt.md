# Image generation prompt and correction

**Mode:** built-in `image_gen`, new raster image followed by a targeted edit. The final candidate is `genmutationen-candidate.png`; the first generated version is intentionally not the selected workspace asset.

## Initial prompt

Use case: scientific-educational
Asset type: unpublished SkillPilot German Gymnasium biology learning-goal image candidate, landscape PNG close to 16:9.
Primary request: illustrate the four types of gene mutation in a SHORT SIMPLIFIED DNA BASE SEQUENCE. Friendly warm hand-drawn comic schoolbook style, cream opaque background, clean bold outlines, restrained teal, coral, yellow, violet and blue. Make one uncluttered 2-by-2 grid of four large cards with generous whitespace. Each card has one exact large German heading: top left “Substitution”, top right “Deletion”, bottom left “Insertion”, bottom right “Duplikation”. Under each heading show an easy-to-follow BEFORE → AFTER pair of short horizontal colored nucleotide-block sequences, with matching unchanged blocks staying the same color and position. Substitution: exactly one existing block changes color, sequence length unchanged. Deletion: exactly one block disappears, sequence gets shorter. Insertion: exactly one new block appears that is not copied from a neighboring segment, sequence gets longer. Duplikation: exactly one existing TWO-block segment is copied immediately beside itself, sequence gets longer; use a curved copy arrow from the original pair to the repeated pair. Each card must have only its one heading, no other words, letters, numbers, or small text. The differences must be obvious by color and count alone; maintain a consistent reference sequence across all four cards. This is a schematic model of sequence changes, not a claim that any pictured type always changes a protein or phenotype. No person, protein, organism, medical claim, laboratory, photorealism, watermark, or decorative DNA helix. Large motifs and headings must remain legible when the complete image is displayed at 360 px phone width and 680 px desktop width.

## Correction prompt

Use case: precise-object-edit
Asset type: correction of an unpublished 16:9 educational biology PNG candidate
Primary request: Change ONLY the visual emphasis in the top-right “Deletion” card. The five-block BEFORE sequence is blue, coral, yellow, teal, violet; the four-block AFTER sequence is blue, coral, teal, violet. The YELLOW third block is the deleted block. Remove the red emphasis rays around the unchanged coral block in the AFTER sequence. Instead put one clear small coral X over the YELLOW third block in the BEFORE sequence. Keep the AFTER sequence exactly four blocks with no empty placeholder. Preserve the title, all other cards, all block colors, block counts, arrows, positions, warm style, and wide 16:9 layout exactly. Do not change any other scientific content or text. Do not add labels, words, numbers, or a phenotype claim.

## Selection

The first output highlighted the unchanged coral block in the deletion AFTER sequence. The corrected output places an X on the deleted yellow BEFORE block and preserves the four-block AFTER sequence. Only the corrected output was copied into this package.
