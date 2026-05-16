# MEM/FWU Roundtrip Plan

Status: concept plan  
Scope: SkillPilot curriculum landscapes as a practical compatibility probe for MEM-compatible RDF/OWL representations based on the FWU Lehrplan Ontology

## Purpose

SkillPilot should treat Metadata for Educational Media (MEM) and the `FWU-DE/lehrplan-ontologie` project as an adjacent semantic schema, metadata, and provenance layer, not as a competing model.

The practical question is:

> How can schema-level curriculum metadata and concrete curricular data become usable competence landscapes from which a rule-bound navigation logic can derive the next didactically justified learning step?

SkillPilot can serve as an open-source reference implementation and test bench for this question.

Reference concept paper:

<https://aifyer.com/ki-lernbegleitung/versions/v1.0/schulisch-verantwortete-ki-lernbegleitung-v1.0.pdf>

## Framing

MEM and the FWU Lehrplan Ontology are understood as important infrastructure for:

- machine-readable curriculum references
- educational standards
- validity scopes such as Bundesland, Schulart, Fach, Jahrgangsstufe, Niveau, and Bildungsgang
- source and provenance records
- cross-state comparability

SkillPilot starts from the adjacent runtime need:

- concrete competence landscapes
- explicit `requires` dependencies
- learner-facing composition views
- validation rules for DAG integrity and route quality
- frontier logic for the next sensible learning steps

The integration work should therefore ask what a MEM-compatible representation must carry so that AI-supported learning guidance can do more than identify curriculum references: it must also derive next learning steps in a traceable way.

## Planned Test

The core validation mechanism is a roundtrip test:

```text
SkillPilot curricular competence landscape
    ->
MEM-compatible RDF/OWL representation based on FWU Lehrplan Ontology
    ->
reconstructed SkillPilot curricular competence landscape
    ->
SkillPilot validation
```

The second transformation must reconstruct the SkillPilot landscape from the RDF/OWL representation without reading or relying on the original SkillPilot ZIP input.

## First Quality Goal

The first quality goal is a semantically lossless MEM/FWU roundtrip for the mathematics Gymnasium publication package:

```text
skillpilot-de-gymnasium-mathematik-v0.1.0.zip
    ->
FWU/MEM-first RDF representation with a minimal SkillPilot profile
    ->
reconstructed SkillPilot knowledge-landscape data
    ->
semantic validation
```

The goal is not to reconstruct the ZIP byte-for-byte. The goal is to reconstruct all content that is required to use, validate, and independently inspect the SkillPilot knowledge landscape.

This makes the roundtrip a concrete quality gate and a concrete MEM/FWU compatibility probe. If the remaining SkillPilot profile terms point to reusable ontology gaps, the result should be turned into a focused issue and, where feasible, a small PR in `FWU-DE/lehrplan-ontologie`.

## Initial Scope

The first test scope should be conservative:

- German Gymnasium landscapes
- initially canonical Gymnasium data in SkillPilot
- later additional German school forms
- later broader school and curriculum scopes if the first roundtrip is successful

The first export package should be a simple ZIP containing:

- SkillPilot landscape JSON files
- JSON schemas
- composition views
- mapping and provenance files
- validation configuration or reports

Individual learner state and personal mastery data are out of scope for the first public roundtrip.

## Required Semantic Coverage

The roundtrip is meaningful only if the RDF/OWL representation can preserve all SkillPilot-required data, including:

- goal identity: `id`, `shortKey`, title, description
- goal classification: atomic/cluster, node kind, core/extension where applicable
- graph structure: `contains`
- didactic dependencies: `requires`
- progression metadata: `weight`, phase/topic/course-level metadata where relevant
- program structure: `programUnits`
- placements: `goalPlacements`
- competency axes: `competencyCatalog`, `competencyRefs`
- learner-facing structure: composition views
- source and provenance references
- validation-relevant metadata

The RDF/OWL representation must not simply embed the original SkillPilot JSON as an opaque blob. It must express the data semantically enough that an independent reverse transformation can reconstruct the package.

## Expected Ontology Profile

The current FWU Lehrplan Ontology already covers many curriculum metadata concepts, but it does not directly define all SkillPilot runtime semantics.

The roundtrip will likely require a small SkillPilot profile or extension vocabulary aligned with the FWU ontology.

The first profile focus should be the two graph relations that are explicit in the concept paper's learning-goal graph:

- `requires` / didactic prerequisite
- `contains` / learning-goal composition

Mappings from learner-facing views to the canonical graph are a later extension layer. They should be added once the core graph relations roundtrip cleanly.

Candidate terms:

```text
skillpilot:LearningGoal
skillpilot:AtomicGoal
skillpilot:ClusterGoal
skillpilot:didacticRequires
skillpilot:containsGoal
skillpilot:hasCurricularPart
skillpilot:masteryWeight
skillpilot:core
skillpilot:shortKey
skillpilot:ProgramUnit
skillpilot:GoalPlacement
skillpilot:CompositionView
```

Important modeling constraint:

> FWU `CE-Verweis` must not be treated as SkillPilot `requires`.

A curriculum reference is not automatically a didactic prerequisite. SkillPilot needs an explicit prerequisite relation for frontier and learning-path logic.

Likewise, plain parthood must be checked for domain fit. SkillPilot `contains` should be preserved as application graph containment. It may be materialized as `BFO_0000051` / `hat Teil` only through a stricter relation such as `skillpilot:hasCurricularPart`, and only when the relation is a genuine curricular part-whole relation: a cluster or goal comprises subgoals that are semantic parts of that cluster or goal. It must not be used for UI placement, ordering, loose topic association, state visibility, memorization/practice nodes, or view mappings. If FWU/MEM treats `hat Teil` as the intended relation for this strict pattern, the roundtrip should document this explicitly; otherwise a curriculum-specific relation should be discussed before being introduced.

## Deliverables

1. SkillPilot ZIP export format for the selected Gymnasium scope.
2. JSON schemas and SkillPilot validation command for the ZIP.
3. Transformation project A: SkillPilot ZIP to RDF/OWL.
4. Transformation project B: RDF/OWL to SkillPilot ZIP.
5. RDF/OWL profile documentation for the SkillPilot-specific terms.
6. Roundtrip comparison report.
7. List of ontology gaps or candidate relation additions for discussion in the FWU GitHub project.
8. Draft issue or PR text backed by the current roundtrip evidence, if the test reveals a generally useful MEM/FWU modeling improvement.

## Success Criteria

The first roundtrip is successful when:

- the reconstructed ZIP validates with the existing SkillPilot validators
- graph invariants are preserved:
  - no `requires` cycles
  - no `contains` cycles
  - referential integrity
  - valid composition views
- all SkillPilot-required fields are reconstructed deterministically
- canonicalized source and reconstructed JSON are equivalent for required data
- RDF/OWL and SHACL validation pass for the intermediate representation
- the transformation does not depend on hidden copies of the original JSON

## Collaboration Channel

Findings that concern modeling, interfaces, validation, or missing relations should be contributed through the open channels of the FWU project:

<https://github.com/FWU-DE/lehrplan-ontologie>

The intended stance is collaborative:

> SkillPilot is not a counter-model to MEM. It is a concrete test bench for checking which information a MEM-compatible structure must carry so that curriculum-aware AI tutoring can derive traceable next learning steps.
