# MEM/FWU Roundtrip Plan

Status: concept plan  
Scope: SkillPilot curriculum landscapes as a practical compatibility probe for MEM-compatible RDF/OWL representations based on the FWU Lehrplan Ontology

## Purpose

SkillPilot should treat Metadata for Educational Media (MEM) and the `FWU-DE/lehrplan-ontologie` project as an adjacent semantic schema, metadata, and provenance layer, not as a competing model.

The practical question is:

> How can schema-level curriculum metadata and concrete curricular data become usable competence landscapes from which a rule-bound navigation logic can derive the next didactically justified learning step?

SkillPilot can serve as an open-source reference implementation and test bench for this question.

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

Candidate terms:

```text
skillpilot:LearningGoal
skillpilot:AtomicGoal
skillpilot:ClusterGoal
skillpilot:didacticRequires
skillpilot:containsGoal
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

## Deliverables

1. SkillPilot ZIP export format for the selected Gymnasium scope.
2. JSON schemas and SkillPilot validation command for the ZIP.
3. Transformation project A: SkillPilot ZIP to RDF/OWL.
4. Transformation project B: RDF/OWL to SkillPilot ZIP.
5. RDF/OWL profile documentation for the SkillPilot-specific terms.
6. Roundtrip comparison report.
7. List of ontology gaps or candidate relation additions for discussion in the FWU GitHub project.

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

