# ST Chemistry Onboarding Note

Status: `P4` (`source_backed_projection_clean`)

This note records the first Sachsen-Anhalt Chemistry source archive and source-extraction step for the DE-level canonical Chemistry rollout.

Archived on `2026-05-11`:

- current Gymnasium Chemistry source:
  - local file: `curricula/DE/Gymnasium/input/ST/FLP_Chemie_Gym_01082022_swd.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung_2022/FLP_Chemie_Gym_01082022_swd.pdf`
  - retained role: authoritative source for the first Sachsen-Anhalt Chemistry source-extraction pass
- previous Gymnasium Chemistry baseline:
  - local file: `curricula/DE/Gymnasium/input/ST/Chemie_FLP_Gym_01_07_2019.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung/Chemie_FLP_Gym_01_07_2019.pdf`
  - retained role: baseline for delta checks against the 2022 adaptation

Archive result:

- the Sachsen-Anhalt Chemistry input lane now has official local PDF sources
- the 2022 Fachlehrplan covers Schuljahrgaenge `7/8`, `9`, `10 (Einfuehrungsphase)`, and `11/12 (Qualifikationsphase)`
- lower-secondary source extraction:
  - file: `curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_CHEMIE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json`
  - sourceLandscapeId: `f9e8b305-d604-55c5-82b0-77a734925371`
  - result: `12` passages, `270` source goals
- upper-secondary source extraction:
  - file: `curricula/DE/Gymnasium/input/ST/upper-secondary/source-extraction/DE_ST_CHEMIE_SEKII_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json`
  - sourceLandscapeId: `86a99136-152f-5da7-84f2-3a0ed9f53697`
  - result: `15` passages, `324` source goals
- the two Sachsen-Anhalt Chemistry source-landscape registry entries are active
- lower-secondary source-to-canonical mapping:
  - file: `curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json`
  - result: `270/270` source goals reviewed and mapped; `55` exact mapping edges and `969` partial mapping edges
- upper-secondary source-to-canonical mapping:
  - file: `curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json`
  - result: `324/324` source goals reviewed and mapped; `40` exact mapping edges and `1413` partial mapping edges
- compiled `DE-ST` Chemistry applicability is persisted in the canonical Chemistry landscape
- Sachsen-Anhalt-specific learner-facing Chemistry composition views are active:
  - `curricula/DE/Gymnasium/composition-views/chemie/de-st-gk.view.json`
  - `curricula/DE/Gymnasium/composition-views/chemie/de-st-lk.view.json`
- quality status after the P4 cut:
  - unsupported assigned atomic goals: `0`
  - unmapped source atoms: `0`
  - source-backed view coverage for `DE-ST`: `100%`
  - reverse source coverage for `DE-ST`: `100%`

Operational rule from here:

- use the lower-secondary and upper-secondary source extractions as the only active Sachsen-Anhalt Chemistry source-goal inventories
- keep the 2019 PDF available as a retained baseline, not as a parallel active source lane unless a delta review requires it
- compile `DE-ST` Chemistry applicability only from the reviewed source-to-canonical mappings
- do not widen learner-facing Sachsen-Anhalt Chemistry views beyond the reviewed source-backed applicability surface unless a later horizontal Chemistry topic pass or source revision justifies it
