# MEM/FWU Roundtrip Pipeline

This pipeline tests whether a SkillPilot publication package can be represented as an RDF/OWL artifact based on the FWU Lehrplan-Ontologie and reconstructed afterwards without reading the original ZIP.

Initial input package:

`tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip`

## Goal

The intended test chain is:

```text
curricular SkillPilot landscape package
  -> MEM-compatible RDF/OWL representation based on FWU-DE/lehrplan-ontologie
  -> reconstructed SkillPilot package
  -> validation
```

The first implemented roundtrip uses the FWU Lehrplan-Ontologie as the base vocabulary for curriculum, subject, school type, competencies, curricular elements, parts, and source references. SkillPilot-specific runtime semantics that are not explicit FWU terms are kept in a small SkillPilot roundtrip profile:

- `sp:didacticRequires` for SkillPilot prerequisite edges
- `sp:containsGoal` as a SkillPilot specialization of `BFO_0000051` / `hat Teil`
- `sp:CompositionView` for learner-facing view trees
- `sp:MappingRecord` and `sp:ReviewDecision` for canonical/state curriculum mappings
- `sp:SourceGoalReference` for official source text spans
- `sp:CardDeck` and `sp:Card` for memorization cards

The profile is intentionally small. It should make missing relations visible instead of hiding them in application code.

## Commands

Run the full roundtrip:

```bash
cd app
npm run roundtrip:mem-fwu -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

Run only the first transformation:

```bash
cd app
npm run roundtrip:mem-fwu:to-rdf -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

Run reconstruction from an existing RDF file:

```bash
cd app
npm run roundtrip:mem-fwu:from-rdf -- --rdf tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/rdf/skillpilot-mem-fwu.nt
```

Run reconstruction plus validation from an existing RDF file:

```bash
cd app
npm run roundtrip:mem-fwu:validate -- \
  --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \
  --rdf tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/rdf/skillpilot-mem-fwu.nt
```

Run the semantic reconstruction check. This rebuilds SkillPilot core artifacts from RDF triples and ignores the lossless `sp:textLine` carrier lane:

```bash
cd app
npm run roundtrip:mem-fwu:semantic-reconstruct -- \
  --rdf tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/rdf/skillpilot-mem-fwu.nt \
  --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

## Output

Default output directory:

`tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/`

Important files:

- `rdf/skillpilot-mem-fwu.nt` - RDF N-Triples artifact
- `rdf/skillpilot-mem-fwu-profile.ttl` - minimal SkillPilot roundtrip profile importing the FWU ontology
- `reconstructed/` - reconstructed package directory
- `skillpilot-de-gymnasium-mathematik-v0.1.0.roundtrip.zip` - reconstructed ZIP
- `roundtrip-report.json` and `roundtrip-report.md` - roundtrip result
- `package-validation/subject-export-package-validation-report.*` - independent SkillPilot package validation
- `semantic-reconstructed/` - SkillPilot core artifacts reconstructed from the semantic RDF lane only
- `semantic-reconstructed/semantic-reconstruction-report.*` - semantic reconstruction report

## Representation Strategy

The RDF artifact has two lanes.

The semantic lane represents the actual learning landscape:

- canonical goals as `sp:LearningGoal` plus FWU `LP_0000263` competency specifications or `LP_0000349` curricular areas
- the package and landscape as FWU `LP_0000438` curricula
- Mathematik via KIM school subject `http://w3id.org/kim/schulfaecher/s1017`
- Gymnasium as a school-type resource linked through FWU `LP_0000812`
- `contains` through `sp:containsGoal` and `BFO_0000051`
- `requires` through `sp:didacticRequires`
- source goals and official text spans as `sp:SourceGoalReference` / FWU references
- composition views, mappings, review decisions, and card decks as explicit SkillPilot profile resources

The carrier lane stores every package file as RDF text-line resources. This is deliberately not the semantic model, but it makes the reverse transformation publication-safe and reproducible: the reconstructed ZIP can be byte-identical at file level while the semantic lane remains queryable and inspectable.

`requires` and `contains` are treated as unordered graph edges. The semantic comparison therefore compares them as sets. Stable ordering is only represented where it has actual meaning for a consumer, for example in learner-facing composition-view children and memorization cards.

## Current Validation Result

For `skillpilot-de-gymnasium-mathematik-v0.1.0.zip`, the first implemented run produced:

- 163 reconstructed files
- 163 byte-identical files
- 1,037 canonical goals
- 1,142 `contains` edges
- 2,312 `requires` edges
- 70 composition views
- 2,539 canonical mapping records
- 9,797 review decisions
- 9,797 source-goal references with official text spans
- 10 card decks with 126 cards

The reconstructed ZIP passed `npm run export:subject-packages:validate`.

The semantic reconstruction from RDF triples, without using the `sp:textLine` carrier lane, also passed:

- 1,037/1,037 goals reconstructed with matching core fields
- 9,797/9,797 source-goal references reconstructed with official text spans
- 126/126 cards reconstructed
- 2,539/2,539 canonical mappings and 9,797/9,797 review decisions reconstructed
- 70/70 views reconstructed with 5,991/5,991 view goal references

## Interpretation

This is a practical first proof that the current public SkillPilot mathematics package can survive a complete RDF roundtrip without losing the data required by the SkillPilot runtime and publication validator.

The additional semantic reconstruction check proves more than byte-identical transport: the SkillPilot core landscape, source references, mappings, views, and cards can be rebuilt from explicit RDF triples.

It still does not prove that the FWU Lehrplan-Ontologie alone already contains every SkillPilot relation. The test currently makes those gaps explicit through the SkillPilot roundtrip profile, especially for didactic prerequisite logic, learner-facing composition views, reviewed source mappings, and memorization cards.
