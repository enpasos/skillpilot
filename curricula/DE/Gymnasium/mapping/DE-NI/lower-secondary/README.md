# DE-NI Lower-Secondary Mapping Lane

This lane now carries the active Niedersachsen lower-secondary Gymnasium mappings into the shared DE-level canonical mathematics landscape.

## Chemie

Current chemistry status on `2026-05-11`:

- source extraction:
  `curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_CHEMIE_SEKI_KC2015.source-extraction.json`
- M3 review:
  `ni_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json`
- source:
  `curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf`
- MAPPING-1 complete: 14 official chemistry Basiskonzept competence-table passages from pages 51-64
- MAPPING-2 complete: 196 source goals from the official competency bullets
- MAPPING-3 complete: 196/196 source goals reviewed against canonical SkillPilot chemistry targets; 23 passgenau, 173 ueber 1:n-Zuordnungen, 0 offene Canonical-Gaps
- local count audit: 196 is intentionally accepted despite the HE/BW baseline deviation because Niedersachsen spells out Fachwissen, Erkenntnisgewinnung, Kommunikation, and Bewertung as separate competency bullets; appendix and implementation examples are excluded

## Mathematik

Current status on `2026-04-05`:

- repository-backed mapping fixture:
  `ni_math_lower_secondary_to_canonical_math.json`
- reserved `sourceLandscapeId`:
  `2b995085-dc5e-47c6-a563-9dcfc01fb74d`
- current mapping count: `53`
- active source snapshot:
  `curricula/DE/Gymnasium/input/NI/lower-secondary/source-json/DE_NDS_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the archived Niedersachsen lower-secondary pilot snapshot is now fully bridged on source-goal level across:
  - the motivation root
  - the arithmetic prerequisite strip
  - the first lower-secondary functions corridor
  - the imported `Elementare Termumformungen` strip
  - the imported `Laengen, Flaechen- und Rauminhalte und deren Terme` strip
  - the explicit lower-secondary `Daten und Zufall` corridor from the five real learning areas:
    - `Planung und Durchfuehrung statistischer Erhebungen`
    - `Masszahlen statistischer Erhebungen`
    - `Wahrscheinlichkeit`
    - `Ein- und mehrstufige Zufallsversuche`
    - `Baumdiagramme und Vierfeldertafeln`
  - the explicit later-Sek-I right-triangle / similarity follow-on
  - the explicit later-Sek-I quadratics follow-on
- the new data/chance slice now lands on the frozen canonical `D1-D5` surface without forcing new package churn:
  - survey planning and early data preparation stay on the early data routines surface
  - descriptive-statistics work sits on the existing `D1/D4` surface
  - probability-from-frequencies and Laplace work sit on `D2`
  - one-/multi-stage experiments plus simulation sit on `D3`
  - tree/vierfelder work sits on the linked-events side of `D3`

Expected use from here:

- canonical Gymnasium `Mathematik`
- shared `J5-J10` anchor alignment
- treat the active Niedersachsen lower-secondary pilot snapshot as closed across its imported functions, algebra, measurement, data/chance, geometry/trigonometry, and quadratics slices
- any further Niedersachsen widening should now wait for an intentionally imported new retained slice or for explicit `P6/F6` cutover work rather than reopening this closed pilot snapshot
