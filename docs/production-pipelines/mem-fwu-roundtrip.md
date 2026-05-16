# MEM/FWU Roundtrip Pipeline

This pipeline tests whether a SkillPilot publication package can be represented as an RDF/OWL artifact based on the FWU Lehrplan-Ontologie and reconstructed afterwards without reading the original ZIP.

Initial input package:

`tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip`

## Goal

The primary test chain is semantic, not byte-identical:

```text
curricular SkillPilot landscape package
  -> clean MEM-compatible RDF/OWL representation based on FWU-DE/lehrplan-ontologie
  -> reconstructed SkillPilot knowledge-landscape content
  -> semantic validation against the original package
```

The first implemented roundtrip uses the FWU Lehrplan-Ontologie as the base vocabulary for curriculum, subject, school type, competencies, curricular elements, parts, and source references. SkillPilot-specific runtime semantics that are not explicit FWU terms are kept in a small SkillPilot roundtrip profile:

- `sp:didacticRequires` for SkillPilot prerequisite edges
- `sp:containsGoal` for SkillPilot graph containment
- `sp:hasCurricularPart` as a strict curricular part-whole relation mapped to `BFO_0000051` / `hat Teil` only where that semantics is intended
- `sp:CompositionView` for learner-facing view trees
- `sp:MappingRecord` and `sp:ReviewDecision` for canonical/state curriculum mappings
- `sp:SourceGoalReference` for official source text spans
- `sp:CardDeck` and `sp:Card` for memorization cards

The profile is intentionally small. It should make missing relations visible instead of hiding them in application code.

## Concept Alignment

The primary relation focus comes from the concept paper "Schulisch verantwortete KI-Lernbegleitung entlang der Lehrplaene", version 1.0:

<https://aifyer.com/ki-lernbegleitung/versions/v1.0/schulisch-verantwortete-ki-lernbegleitung-v1.0.pdf>

The paper describes a machine-readable learning-goal graph that covers learning-goal containment and prerequisite relations. In SkillPilot terms, those are the two core graph edges:

- `contains`: a goal or cluster comprises subgoals
- `requires`: a goal presupposes prerequisite goals

Therefore the first MEM/FWU modeling question is whether these two relations can be represented cleanly, explicitly, and inspectably in or alongside the FWU Lehrplan-Ontologie. View-to-canonical mapping relations are important, but they are a later modeling layer on top of the core graph.

## Quality Goal 1: Semantically Lossless MEM Roundtrip

The first quality goal is not an elegant RDF export in isolation. It is a clean semantic roundtrip that proves which SkillPilot knowledge-landscape information can be carried by a MEM-compatible representation based on the FWU Lehrplan-Ontologie.

The quality target is met when:

- the publication-oriented RDF is generated from `skillpilot-de-gymnasium-mathematik-v0.1.0.zip`
- the RDF uses FWU/MEM vocabulary wherever this is semantically correct
- the remaining SkillPilot profile terms are explicit, documented, and not hidden inside opaque JSON blobs
- reconstruction reads only the RDF bundle, not the original ZIP content
- all SkillPilot runtime-relevant data is reconstructed with semantic equivalence, not necessarily byte-identical ZIP layout
- the reconstructed data passes the SkillPilot validators and roundtrip comparison checks
- the profile terms that remain outside FWU/MEM are classified as either candidate MEM/FWU improvements, legitimate SkillPilot extensions, or purely technical reconstruction metadata

This gives the MEM/FWU discussion an evidence base: SkillPilot can show concrete data, transformation code, and validation reports instead of arguing abstractly about ontology gaps.

## Commands

Run the primary semantic roundtrip:

```bash
cd app
npm run roundtrip:mem-fwu:semantic
```

Run only the clean semantic MEM/FWU export without the lossless ZIP text carrier:

```bash
cd app
npm run roundtrip:mem-fwu:slim -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

Run only the semantic reconstruction check from the slim bundle:

```bash
cd app
npm run roundtrip:mem-fwu:semantic-reconstruct
```

Optional technical/debug lane: build the monolithic carrier RDF that can reconstruct the ZIP byte-for-byte:

```bash
cd app
npm run roundtrip:mem-fwu:to-rdf -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

Optional technical/debug lane: reconstruct plus validate the byte-carrier RDF:

```bash
cd app
npm run roundtrip:mem-fwu:validate -- \
  --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \
  --rdf tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/rdf/skillpilot-mem-fwu.nt
```

Run the semantic reconstruction check against an explicitly selected RDF file:

```bash
cd app
npm run roundtrip:mem-fwu:semantic-reconstruct -- \
  --rdf tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/slim/bundle.nt \
  --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

## Output

Default output directory:

`tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/`

Important files:

- `slim/` - clean semantic MEM/FWU bundle without the technical ZIP text carrier
- `slim/landscape.nt` - package metadata, canonical goals, program units, placements, `contains`, and `requires`
- `slim/sources.nt` - official source documents, source URLs, and exact source-goal spans
- `slim/mappings.nt` - reviewed source-to-canonical decisions and state mapping records
- `slim/views.nt` - learner-facing Bundesland and aggregate composition views
- `slim/cards.nt` - memorization card decks and cards
- `slim/bundle.nt` - concatenation of the slim semantic files for single-file RDF loaders
- `slim/skillpilot-mem-fwu-profile.ttl` - profile without carrier-only terms such as `sp:textLine`
- `slim/semantic-reconstructed/` - SkillPilot core artifacts reconstructed from the slim semantic RDF bundle
- `slim/semantic-reconstructed/semantic-reconstruction-report.*` - semantic reconstruction report
- `rdf/skillpilot-mem-fwu.nt` - optional monolithic technical/debug RDF with lossless text carrier
- `rdf/skillpilot-mem-fwu-profile.ttl` - profile for the monolithic technical/debug RDF
- `reconstructed/` - reconstructed package directory
- `skillpilot-de-gymnasium-mathematik-v0.1.0.roundtrip.zip` - reconstructed ZIP
- `roundtrip-report.json` and `roundtrip-report.md` - roundtrip result
- `package-validation/subject-export-package-validation-report.*` - independent SkillPilot package validation

## Representation Strategy

There are two RDF export forms with different purposes.

The slim MEM/FWU export under `slim/` is the publication-oriented representation. It represents the actual learning landscape:

- SkillPilot graph nodes as `sp:LearningGoal`
- semantically curricular atomic goals additionally as FWU `LP_0000263` competency specifications
- semantically curricular clusters additionally as FWU `LP_0000349` curricular areas
- runtime-only nodes such as memorization, practice, assessment, orientation, or program-structure nodes as SkillPilot profile classes without forced FWU competency typing
- the package and landscape as FWU `LP_0000438` curricula
- Mathematik via KIM school subject `http://w3id.org/kim/schulfaecher/s1017`
- Gymnasium as a school-type resource linked through FWU `LP_0000812`
- SkillPilot `contains` through `sp:containsGoal`
- strict curricular part-whole decomposition through `sp:hasCurricularPart` and `BFO_0000051` / `hat Teil` only where source and target are classified as curricular graph elements
- `requires` through `sp:didacticRequires`
- source goals and official text spans as `sp:SourceGoalReference` / FWU references
- composition views, mappings, review decisions, and card decks as explicit SkillPilot profile resources

The `FWU-DE/schulfach-ontologie` should be considered for the subject-identifier layer. The current export links Mathematik through the generic KIM subject IRI `http://w3id.org/kim/schulfaecher/s1017`; the school-subject ontology additionally provides state-specific subject individuals such as `https://w3id.org/schulfach/HE_0000027` with `skos:exactMatch` to that KIM IRI. This is relevant for full MEM/FWU alignment, but separate from the learning-goal graph relation proposal.

The slim export intentionally does not include:

- `sp:PackageFile`
- `sp:hasFile`
- `sp:textLine`
- `sp:lineText`
- file-path-derived SkillPilot resource IRIs such as `/file/...`
- embedded ZIP file lines
- the redundant `sp:sourceIndexSummaryJson` blob

The monolithic `rdf/skillpilot-mem-fwu.nt` keeps an additional carrier lane that stores every package file as RDF text-line resources. This is deliberately not the semantic model. It is a technical proof artifact for byte-identical ZIP reconstruction.

`sp:zipPath` may still appear in the slim bundle as a local package placement literal for deterministic reconstruction. It is not used as curriculum-source provenance; official source provenance is represented through source-document URLs and exact source-goal spans.

`requires` and `contains` are treated as unordered graph edges. The semantic comparison therefore compares them as sets. Stable ordering is only represented where it has actual meaning for a consumer, for example in learner-facing composition-view children and memorization cards.

## Current Validation Result

For `skillpilot-de-gymnasium-mathematik-v0.1.0.zip`, the optional monolithic byte-carrier run produced:

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

The slim MEM/FWU export generated on 2026-05-16 produced:

- `slim/bundle.nt`: 437,681 semantic triples, about 130 MB
- `slim/landscape.nt`: about 7.2 MB
- `slim/sources.nt`: about 65 MB
- `slim/mappings.nt`: about 44 MB
- `slim/views.nt`: about 9.9 MB
- `slim/cards.nt`: about 284 KB

The semantic reconstruction from `slim/bundle.nt` passed these content checks:

- landscape metadata, filters, program units, goal placements, and competency catalog match
- 1,037/1,037 goals reconstructed with all relevant fields
- 31/31 source collections and 9,797/9,797 source goals reconstructed
- 126/126 cards reconstructed
- 62/62 mapping file metadata records reconstructed
- 2,539/2,539 mapping records and 9,797/9,797 review decisions reconstructed
- all 16 state mapping lanes present
- 70/70 composition views reconstructed with 5,991/5,991 view goal refs
- all 16 state view lanes plus 5 DE aggregate views present

## Interpretation

This is a practical first proof that the current public SkillPilot mathematics package can survive a semantic RDF roundtrip without losing the data required by the SkillPilot runtime and publication validator.

The additional semantic reconstruction check proves more than byte-identical transport: the SkillPilot core landscape, source references, mappings, views, and cards can be rebuilt from explicit RDF triples.

For MEM-oriented publication, the `slim/` bundle is the preferred artifact. The large monolithic RDF file remains useful for reproducibility and byte-identical technical roundtrip testing, but it should not be treated as the clean MEM representation.

It still does not prove that the FWU Lehrplan-Ontologie alone already contains every SkillPilot relation. The test currently makes those gaps explicit through the SkillPilot roundtrip profile, especially for didactic prerequisite logic, learner-facing composition views, reviewed source mappings, and memorization cards.

## MEM/FWU Improvement Candidates

The current slim roundtrip is deliberately modeled as "FWU/MEM first, SkillPilot profile only where necessary". The profile terms should therefore be reviewed after every successful roundtrip.

Priority candidate areas for upstream discussion:

- Didactic prerequisites: `sp:didacticRequires` is not the same as a FWU `CE-Verweis`. A curriculum reference can point to a related element, while SkillPilot needs an explicit prerequisite relation for frontier and next-step logic.
- Learning-goal containment: `sp:containsGoal` preserves the SkillPilot graph. Only `sp:hasCurricularPart` is mapped to `BFO_0000051` / `hat Teil`, and only for genuine curricular part-whole relations. This must not be used for UI placement, ordering, loose topic association, state visibility, or view mappings. The upstream question is whether FWU/MEM wants to document `hat Teil` as the intended pattern for strict curricular goal decomposition or provide a more specific relation.
- Exact source spans: `sp:SourceGoalReference` connects a source URL and source-goal identity with exact official text spans, page or locator metadata, and extraction context. This is needed for independent validation of mapping decisions.
- Learner-facing composition views: `sp:CompositionView` and ordered composition nodes express scoped, single-occurrence user views over a canonical graph. This is different from the canonical curriculum graph itself and matters for Bundesland-specific views. This should come after `requires` and `contains`.
- Reviewed source-to-canonical mappings: `sp:MappingRecord` and `sp:ReviewDecision` express auditable mapping decisions, including evidence, status, and reviewer judgement. This is stronger than a loose source reference and becomes more important when composition views are mapped explicitly onto the canonical graph.
- Memorization cards: `sp:CardDeck` and `sp:Card` are probably a SkillPilot learning-runtime extension, not necessarily a MEM core concern, unless MEM wants to model fine-grained learning media or practice resources.

Potential GitHub contribution path:

1. Keep the SkillPilot roundtrip passing as the reproducible evidence artifact.
2. Check whether each remaining `sp:` term already has an appropriate FWU/MEM equivalent before proposing a new term.
3. Open a focused issue in `FWU-DE/lehrplan-ontologie` with the SkillPilot story, the concept-paper relation focus, RDF examples, and validation report.
4. If maintainers agree that a gap belongs in MEM/FWU, submit a small PR, preferably starting with `didacticRequires` and documented semantic guidance for `contains` / `hat Teil` as strict curricular goal composition.
