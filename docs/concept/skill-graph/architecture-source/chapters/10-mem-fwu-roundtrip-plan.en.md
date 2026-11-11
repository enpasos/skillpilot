## MEM/FWU Roundtrip Plan {#sec:sga-mem-fwu-plan}

SkillPilot treats Metadata for Educational Media (`MEM`) and [`FWU-DE/lehrplan-ontologie`](https://github.com/FWU-DE/lehrplan-ontologie) as an adjacent semantic metadata and provenance layer rather than a competing model, acting as a practical open-source test bench for traceable AI learning-step navigation (see the operational pipeline in [MEM/FWU Roundtrip Pipeline](repo:docs/production-pipelines/mem-fwu-roundtrip.md) and reference paper <https://aifyer.com/ki-lernbegleitung/versions/v1.0/schulisch-verantwortete-ki-lernbegleitung-v1.0.pdf>).

### Semantic Roundtrip Probe and Required Coverage {#sec:sga-mf-probe}

```text
SkillPilot skill landscape (JSON export ZIP)
  -> MEM/FWU-first RDF/OWL bundle + hashed binary sidecars
  -> Reconstructed SkillPilot skill-landscape data (no source JSON access)
  -> Deterministic SkillPilot graph, view, and asset validation
```

Without embedding opaque JSON blobs or Base64 media literals, the semantic bundle preserves:

- Goal identity (`id`, `shortKey`, `title`, `description`), atomic/cluster classification, `weight`, `core`, and dimension metadata;
- Direct `contains` composition and didactic `requires` prerequisites;
- Program structure (`programUnits`), `goalPlacements`, competency axes (`competencyCatalog`, `competencyRefs`), and learner-facing composition views;
- Official source/provenance references plus `goal-visualization` references (`schema:ImageObject`) paired with byte-identical SHA-256 image sidecars (learner mastery state stays strictly outside public curriculum bundles).

### Core-First FWU Alignment and Application Profile {#sec:sga-mf-profile}

| Relation / Concept | Core-First RDF/OWL Representation & Constraints |
| --- | --- |
| **Didactic `requires`** | Specialized reified `LP_0000554` resource attached via `LP_0030071` (`hat Verweis`) and pointing to the prerequisite via `LP_0030072` (`verweist auf`, introduced in `FWU-DE/lehrplan-ontologie#9`). Generic `CE-Verweis` links must **never** be misread as prerequisites. |
| **Curricular `contains`** | `BFO_0000051` (`hat Teil`) only for genuine curricular part-whole relations, paired with `skillpilot:containsGoal` on every authored direct edge so transitive BFO reasoner inferences never obscure direct edges (mixed practice/exam/memory/navigation edges use only `skillpilot:containsGoal`). |
| **Minimal application terms** | `skillpilot:{LearningGoal,AtomicGoal,ClusterGoal,containsGoal,weight,core,shortKey,ProgramUnit,GoalPlacement,CompositionView,GoalVisualizationReference}` plus `schema:ImageObject` for binary sidecars. |
{cols="28%,72%"}

Success requires full SkillPilot validator conformance (acyclic `requires`/`contains`, referential integrity, valid composition views), deterministic field equivalence, OWL 2 DL / structural core validation, and byte-identical image SHA-256 verification without hidden access to the original JSON input.
