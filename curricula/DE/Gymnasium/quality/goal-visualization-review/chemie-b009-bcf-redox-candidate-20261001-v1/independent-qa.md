# Independent QA receipt — Chemie B009 redox PNG candidate

**Decision: HOLD.** This is an independent, read-only subject and visual check
of the inactive candidate for `bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a`.
The active JPG, canonical goal, registries and V-QA were not changed. HOLD is
about both a visible product-model defect and unresolved source depth; it
neither resolves the B009 description dissent nor grants an image or human
approval.

| Binding and display check | Result |
| --- | --- |
| Candidate | [bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a.png](bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a.png) |
| Actual SHA-256 | `eaf297c85bfe5483af4ee3c33bd3639ca9bcf271a2535cbe41bde5f4f4e825bd` (matches candidate self-review) |
| Original | 1672 × 941 px RGB PNG, effectively 16:9 |
| Phone | [360 × 203 px](preview-phone-360.png), inspected at its actual size |
| Desktop | [680 × 383 px](preview-desktop-680.png), inspected at its actual size; no 28 rem height crop |
| Current goal | “Oxidation und Reduktion bei einfachen Reaktionen erkennen”; current description interprets simple metal/non-metal redox reactions |

## What is correct

- Left: exactly two separately drawn Mg atoms and one O₂ molecule containing
  two O atoms. This is an appropriate example for the current metal/non-metal
  goal, although it is only one example.
- Middle: four gold electron dots, two beside each Mg. Four arrow paths end at
  the oxygen atoms: one electron from each Mg reaches each O. Thus each O
  receives two electrons; the depiction is consistent with
  `2 Mg → 2 Mg²⁺ + 4 e⁻` and `O₂ + 4 e⁻ → 2 O²⁻`. The O–O bond is absent in the
  product stage. No incorrect equation is printed.
- Right: there are two Mg²⁺ labels and two O²⁻ labels. Their total charge is
  zero and their 1:1 count matches `2 Mg + O₂ → 2 MgO`. The broad electron-loss
  and electron-gain story remains visible at 360 px. Superscript charges are
  marginally small at that width, so they should not be the sole carrier of
  meaning in a revision.
- The uncluttered 16:9 comic layout and large particles are materially easier
  to inspect at phone width than the historical dense lattice and small
  equations. The later B009 synthesis nevertheless left the current D review
  open and explicitly called for a renewed goal, J8 source, page and V check.

## Holding defect

The product panel draws **two isolated touching Mg²⁺/O²⁻ pairs**, each with a
clear gap to the other pair. At both 360 px and 680 px, those read as two
separate diatomic MgO entities. Solid magnesium oxide is an ionic lattice;
`MgO` gives the ion ratio, not a discrete MgO molecule. The self-review's
“schematic pairs” explanation and an alt text cannot correct that visual
inference for a learner who sees the image alone. Removing the old crowded
lattice has therefore introduced a different model risk. This is material to
the stated redox product and warrants HOLD despite the correct counts.

## Source depth and current-goal fit

The current canonical description broadly asks learners to interpret
oxidation and reduction in simple metal/non-metal reactions; its demand tag is
`AB1` and its raw applicability spans 16 jurisdictions. The PNG is a more
specific **electron-transfer model** for Mg/O₂. The checked [HE G9 8.2 PDF](../../../input/HE/lower-secondary/g9-chemie.pdf)
teaches oxidation in oxygen reactions and introduces reduction with synthesis
and decomposition of binary compounds, but does not expressly demand electron
loss/gain in that section. The [BY source extraction](../../../input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json)
does explicitly describe ion formation as electron transfer between metal and
non-metal atoms in C9; the inspected [BY mapping](../../../mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json)
has no direct edge from that aspect to this goal. The current [HE mapping](../../../mapping/DE-HE/lower-secondary/hessen_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json)
has `exact` edges to the goal whose coverage needs reconsideration if the
electron model becomes a required reading. Raw applicability is not a source
or view binding. The separate [source-scope audit](source-scope-audit.md)
documents this boundary in more detail. Thus even a visually corrected PNG
must remain inactive until the intended J8/other-stage depth, text, source
mapping and effective learner views are decided.

## Exact revision target

1. Keep the left and transfer story numerically fixed: two Mg, one O₂, four
   transferred electrons, two from each Mg and two received by each O. Keep
   product charges at Mg²⁺ and O²⁻, and do not leave an O–O bond between oxide
   ions.
2. Replace the two separate product pairs with **one compact, visibly
   continuous/cropped alternating ionic arrangement** containing at least the
   same two Mg²⁺ and two O²⁻ ions, without pairwise outlines or separation.
   Open/cropped edges should make its repeating solid structure clear. A
   simple formula-unit label may explain the 1:1 ratio, but must not turn the
   ions back into standalone molecules. Avoid the historical crowded lattice.
3. Inspect the actual revised original and 360 px/680 px displays. Keep
   charges and arrows legible at phone width. Update the alt text to state that
   the product arrangement is a small schematic excerpt of an ionic solid,
   not two molecules.
4. Independently decide whether the electron-transfer model is within the
   effective HE J8 and other applicable source/view scope of the **current or
   revised** goal. Then recheck asset hash, goal/page/source bindings and
   current D/P/A/M/V evidence for exactly that chosen text and image. Neither
   the BY C9 clause nor a raw `DE-BY` tag supplies this decision automatically.

The candidate stays inactive. No source, canonical, registry, publication, or
QA-gate file was edited in this review.
