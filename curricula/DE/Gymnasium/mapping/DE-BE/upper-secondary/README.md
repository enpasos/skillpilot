# DE-BE Upper-Secondary Mapping Lane

This lane now carries the first Berlin upper-secondary structural mappings, the first reviewed Q1 differential corridor, the first reviewed Q2 integral corridor, the first reviewed Q2 stochastics corridor, the first reviewed Q2 data-and-survey corridor, and the first reviewed Q4 distribution-and-binomial corridor into the shared DE-level canonical mathematics landscape.

Current status on `2026-03-21`:

- repository-backed mapping fixture now exists:
  `be_math_upper_secondary_to_canonical_math.json`
- reserved `sourceLandscapeId`:
  `5aafcc55-e89f-4dd5-ab17-9455e3c103b7`
- current mapping count: `52`
- the first Berlin upper-secondary math source PDF is now archived locally:
  `curricula/DE/Gymnasium/input/BE/upper-secondary/rahmenlehrplan-mathematik_go-teil-c.pdf`
- the first Berlin upper-secondary source snapshot is now active:
  `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_MATHEMATIK.de.json.snapshot`

Current use:

- canonical Gymnasium `Mathematik`
- upper-secondary phase bridge `E/Q1/Q2/Q3/Q4` is mapped
- first reviewed Berlin `Q1` differential corridor is mapped
- first reviewed Berlin `Q2` integral corridor is mapped
- first reviewed Berlin `Q2` stochastics corridor is mapped
- first reviewed Berlin `Q2` data-and-survey corridor is mapped
- first reviewed Berlin `Q4` distribution-and-binomial corridor is mapped
- next step: widen the Berlin upper-secondary lane from the active `Q4` distribution-and-binomial strip toward the first `Q4` inference, tests, and normal-approximation follow-on corridor

## Physics

Current status on `2026-05-10`:

- repository-backed Source-Extraction and M3 review now exist:
  `curricula/DE/Gymnasium/input/BE/upper-secondary/source-extraction/DE_BE_PHYSIK_SEKII_RLP_GOST_2022.source-extraction.json`
  `be_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`
- reserved `sourceLandscapeId`:
  `8e54a9e6-dd9d-4f5d-a632-734b4ef5c754`
- current Source-Ziel count: `175`
- the first Berlin upper-secondary physics source PDF is now archived locally:
  `curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Physik.pdf`
- the earlier Berlin upper-secondary physics source snapshot is retained only as historical pilot bridge:
  `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot`

Current use:

- canonical Gymnasium `Physik`
- standards `2.2.1` through `2.3.4` and sections `3.1.1` through `3.2.7` from the official RLP GOST 2022 PDF are extracted as source goals
- the old `31`-goal pilot snapshot was treated as an under-coverage signal and replaced by the official source-extraction lane
- content, process-standard, basiskonzept, and experiment rows are mapped to the shared canonical Physics graph; `partial` in the review denotes subtree or 1:n coverage, not an open fachliche gap
- no Berlin-specific canonical Physics atom is introduced in this step
- DE-BE GK/LK composition views are generated from the reviewed canonical Physics view shape so the source mappings have a visible jurisdictional target
- next step: validate dashboard status and then move on to the next open Physics Bundesland
