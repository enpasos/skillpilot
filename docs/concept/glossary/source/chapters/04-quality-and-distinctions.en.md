## Quality, review, and governance {#sec:quality-governance}

### Curriculum Champion {unnumbered=true}

*DE: Curriculum-Champion* — see [Champion Guide](repo:docs/qa-ci/champion-guide.md)

A subject specialist taking responsibility for the practical trial of a curriculum or a clearly scoped topic area: working through goals as a learner, reporting stumbling blocks directly on the goal or via GitHub, and supporting subject-matter refinement.

### Four-level champion model {unnumbered=true}

*DE: Vier-Stufen-Champion-Modell* — see [Four-Level Champion Model](repo:docs/qa-ci/four-level-champion-model.md)

The QA cascade separating machine verification from human trials: `1a` the automated CI pipeline (active today), `1b` static AI review agent and `1c` dynamic AI agent, and `2` independent human Champion trials.

### QA scope {unnumbered=true}

*DE: QA-Scope* — see [Curriculum Quality](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

An explicitly configured check profile covering one learner-facing curriculum section, defined by curriculum, label (such as `Sekundarstufe I`), motivation anchors, selected atomic goals, terminal autonomy areas, and cluster selector. A QA scope counts registered check profiles — neither paths in the graph nor exercise counts. The earlier label "Routen" has been retired.

### CQR rule {unnumbered=true}

*DE: CQR-Regel* — see [Curriculum Quality](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

A *Curriculum-Quality-Review* rule with a stable ID evaluated by the quality dashboard, for example `CQR-003` for bidirectional jurisdiction coverage or `CQR-101` for closed routes. CQR rules judge curriculum content quality.

### GVR rule {unnumbered=true}

*DE: GVR-Regel* — see [Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md)

A *Graph-Validation-Rollout* rule with a stable ID enforced by the CI validator, for example `GVR-001` (no goal may require its own `contains` ancestor). GVR rules enforce structural graph integrity.

### Maturity level {unnumbered=true}

*DE: Reifegrad* — see [Curriculum Quality](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md) and [Quality and Human-Trial Concept](repo:docs/concept/curriculum-quality-and-human-trial.md)

A cumulative, conservative rating (`M0`–`M7`) bound to an explicitly named scope and content revision. A single QA scope reaches at most `M3`; a curriculum can reach `M0` through `M7`. `M5` marks core automated readiness (sources captured, jurisdiction views proven bidirectionally, mandatory QA scopes route- and exam-complete). `M6` adds the reviewed memory layer; `M7` is the fully completed machine QA level across all five per-goal gates (`D` descriptions, `P` understanding profiles, `A` atomicity, `M` memory, `V` visualizations).

Human trials by Curriculum Champions are reported as a separate attribute (not `M8`); `M7` alone does not certify human approval or classroom effectiveness.

### Semantic atomicity {unnumbered=true}

*DE: semantische Atomarität* — see [Semantic Atomicity Review](repo:docs/qa-ci/semantic-atomicity-review.md)

The subject-matter review question of whether a learning goal truly expresses a single assessable competence rather than bundling multiple skills. Structural atomicity (no `contains` children) is necessary but not sufficient.

### Generated artifact {unnumbered=true}

*DE: generiertes Artefakt* — see [Documentation Guidelines](repo:docs/dev/documentation-guidelines.md)

A report, status snapshot, or documentation output produced by a script and carrying an explicit notice naming its generator, regeneration command, and source of truth. Substantive decisions belong in the canonical source files, never as manual edits to the generated artifact.

---

## Distinctions that are easy to get wrong {#sec:key-distinctions}

:::table{longtable=true cols="5.4cm,X"}
| These are not the same | Why it matters |
| --- | --- |
| `contains` vs `requires` | Containment bundles content hierarchically; `requires` sequences prerequisites. Only `requires` drives the frontier. |
| `contains` vs `goalPlacement` | Content composition vs program membership. A placement never re-parents the content tree. |
| `requires` vs effective prerequisites | `requires` records direct edges; effective prerequisites also include prerequisites inherited from ancestors during migration. |
| Atomic goal vs cluster goal | Mastery, frontier, and coverage counts are defined on atomic goals; clusters only aggregate. |
| Structural vs semantic atomicity | A leaf node without `contains` children can still bundle multiple competences. |
| `applicability` vs `projectionRole` | `applicability` decides *whether* a goal is visible in a scope; `projectionRole` decides whether it is a `target` or `prerequisiteOnly`. |
| `applicability` vs node type | `applicability` is contextual view metadata, not a fourth learning mode. |
| Entry scope vs personal curriculum | Entry scope narrows a query; the personal curriculum is the learner's durably committed scope. |
| Learning scope vs focus | Scope defines what is relevant overall; focus selects the active working corridor. |
| Frontier vs recommendation | The frontier is computed mathematically from graph and mastery; selection strategy and autopilot only order within it. |
| Optimistic vs strict mode | Same candidate goals, different prerequisite reach — strict mode is a diagnostic, not a stricter curriculum. |
| SRS practice vs verified recall | Practice schedules review intervals; only the unaided coach recall check closes a memorization goal. |
| SkillPilot ID vs learning session | Permanent backend-only pseudonymous identity vs fresh 24-hour key sent to the provider integration. |
| OAuth binding vs learning session | OAuth authenticates the app/integration; the learning session selects the learner context. |
| `phase` vs program unit | `phase` is compatibility metadata; only an explicit program unit forms a structural node. |
| Learning unit vs personalization level | A recursively composed educational whole with derived completion vs one of the four scope/state layers. |
| Learning unit vs goal difficulty | A unit of acquisition and completion vs the demand level of one goal (`level`). |
| Unit completion vs goal availability | Fulfilled child and own obligations vs prerequisites for starting work; a technical whole-unit gate requires a separate policy. |
| QA scope vs learning route | A QA scope is a registered check profile, not a single path walked by a learner. |
| CQR vs GVR rules | Content quality review vs structural graph validation. |
| Curriculum vs skill graph | Normative external document vs versioned operative graph model derived from it. |
| Skill graph vs skill landscape | Formal model and semantics vs one delimited, published subject instance with `landscapeId`, Champion, and maturity level. |
:::

---

## Maintenance {unnumbered=true shortMark="Maintenance"}

- `cd app && npm run check:terminology` rejects retired synonyms; add a rule there whenever a term is consolidated here.
- Add a term here once it is used across documents and its meaning is not immediately obvious from the code.
- Keep each entry to a concise definition plus delimitation; detailed rules belong in the linked normative document.
- If a summary here and a linked normative document ever disagree, the normative document wins and this entry must be updated.
