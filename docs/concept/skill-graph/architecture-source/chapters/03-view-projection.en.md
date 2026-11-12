## View Projection and Goal Placement {#sec:sga-view-projection}

A careful reader must be able to reconstruct every visible learner-facing tree directly from documented JSON fields without inspecting runtime code or relying on title/`phase` heuristics.

### Four View Families and Five Non-Negotiable Projection Rules {#sec:sga-vp-families}

| View Family | Primary Question Answered | Exclusive Structural Source of Truth |
| --- | --- | --- |
| **Content tree** | What belongs under what in subject-matter terms? | `goals` + explicit `contains` edges (ordered by `contains` array). |
| **Program tree** | Where in the curriculum is a goal introduced, revisited, or assessed? | `programUnits` (`parentUnitId`, `order`) + `goalPlacements` (`primary` attaches; `secondary`/`assessed` render as badges/overlays, missing yields `unplacedInScope`; `own` records learning-unit ownership and attaches nothing). |
| **Competency view** | Along which capability or process axis is a goal classified? | `competencyCatalog` + `competencyRefs` (orthogonal taxonomy projection). |
| **Composition tree** | How does one resolved scope see the subject as one default tree? | Reviewed `*.view.json` (`structure` + `canonicalSubtree` / `goalEntry`) + canonical `contains` expansion. |
{cols="20%,36%,44%"}

Five binding rules govern all projections:

1. **Rule 1 (No heuristic inference):** Never infer parent-child edges from titles, localized labels, `phase`, `dimensionTags.phase`, or string similarity.
2. **Rule 2 (Explicit edge provenance):** Every visible edge originates from exactly one documented field (`contains`, `parentUnitId`, `goalPlacements`, `competencyRefs`, or composition-view `children`).
3. **Rule 3 (Single relation family per view):** Enrich views with badges or filters, never by silently mixing parent hierarchies.
4. **Rule 4 (Reviewed composition view wins):** When a scope-specific `.view.json` exists, it defines the default learner-facing tree while `programUnits`/`goalPlacements` remain valid for program views and diagnostics (`ALL` is a query-only sentinel, never serialized in placements or applicability).
5. **Rule 5 (Single-occurrence tree per resolved scope):** Within one resolved scope (such as `DE-HE / Gymnasium / SekII / LK`), each visible goal appears **at most once** under **at most one** visible parent; pairwise overlapping `canonicalSubtree` expansions are compile-time errors.

### Prerequisite Closure, Personal Learning Scope, and Canonical Identity {#sec:sga-vp-closure anchors="required-prerequisite-learning-scope"}

Under the Product Owner decisions of **9 November 2026**, **10 November 2026**, and **11 November 2026** ([Graph Definition §§5.1–5.2](repo:docs/concept/skill-graph/graph-definition.md)):

- **Unpruned prerequisite closure (9 Nov 2026) & learner-read resilience (11 Nov 2026):** Selecting atomic goals must preserve their complete transitive prerequisite demand on the unpruned canonical graph (`A requires B requires C` retains `B` even if `A` and `C` alone matched initial scope filters). Unknown IDs, cycles, or unaccounted required atoms remain hard errors in validation, curriculum QA, and native acceptance; on learner reads, when a learning context's canonical graph is not strictly compilable, the runtime keeps the reviewed seed scope without the derived closure, claims no learning basis, offers no goal whose demand is broken, and logs the failure once per curriculum and error code (errors in the seed selection itself remain hard errors).
- **Personal learning-scope basis $L$ (10 Nov 2026):** Necessary prerequisites belong to learning, progress, and completion, not merely hidden lookup support. Given valid reviewed atomic seed targets $S$, compile the fixed global target basis $L = S \cup \{p \in A \mid \exists t \in S : (t, p) \in R_{\mathrm{at}}^+\}$ on the unpruned canonical graph. $L$ depends solely on personal configuration and curriculum/projection revision, **never** on current mastery. Mastered atoms remain in $L$ as already satisfied; open prerequisites receive navigable acquisition targets in the full Personal Curriculum with explainable `required by` provenance (without inventing new source mappings, enrolling unrelated siblings, or mutating mastery). Level 3 focus equals the selected roots' descendant union intersected with $L$ (normal mode masks checks to focus *after* effective transitive reachability on canonical `requires`, without erasing paths through outside-focus intermediates).
- **Subject-local `projectionRole` specificity:** Authored view references carry `projectionRole: "target" | "prerequisiteOnly"` (default `"target"`). Specificity resolves overlaps via (1) direct `goalEntry` over `canonicalSubtree`, (2) deeper/nearest `canonicalSubtree` over broader ancestor subtrees, and (3) `"target"` on equal specificity. A goal marked `prerequisiteOnly` in one subject (for example Hessen Sek-II-LK Mathematics bridge/formula goals or Physics math support) still requires an acquisition target somewhere in the closed Personal Curriculum $L$ if genuinely required.
- **Preserved canonical atomicity:** Collapsing or referencing a canonical cluster never creates an opaque substitute atom and never transfers cluster results to children (see also the historical `DPK-006c-c` boundary in [Dual Package Implementation Status](repo:docs/dev/dual-curriculum-package-implementation-status.md) and tooling split in [Curriculum Authoring Editors](repo:docs/dev/curriculum-authoring-editors.md)).

### Learning Units in Projected Views {#sec:sga-vp-units anchors="learning-units-in-projected-views,curriculum-levels-in-projected-views"}

Learning units are declared in the placement layer of their skill landscape (Product Owner decision of 12 November 2026): a `programUnits` entry of kind `learningUnit` owns atomic goals through `goalPlacements` of relation `own` and names the unit that requires it as a child through `parentUnitId` ([Graph Definition §11.2](repo:docs/concept/skill-graph/learning-units.md#sec-unit-representation); [field reference](repo:docs/dev/landscape-json-field-reference.md)); `validate:learning-units` checks these declarations. The program-tree projection attaches goals only through `primary` placements, so an `own` placement changes no visible tree.

Projected [Learning Units](repo:docs/concept/skill-graph/learning-units.md) (target concept; runtime compiler pending) bind to the reviewed composition view or program projection:

1. **Single direct course owner:** Every planned atomic acquisition has exactly one directly owning unit in the resolved course; ancestors aggregate child obligations without duplicating ownership.
2. **Cross-subject identity:** Shared canonical goals (for example `target` in Mathematics and `prerequisiteOnly` in Physics) count once in the joint plan while retaining subject-local roles.
3. **Full prerequisite accounting:** Every required atom must be covered by the explicit entry basis or a planned acquisition no later than its dependent target.
4. **Local recognition & block ordering:** Implicit recognition evaluates only against each directly owning unit's reviewed contract; parent exams neither reopen completed child units nor pass protected child exams/cards, and [whole-unit progression](repo:docs/concept/skill-graph/learning-unit-progression.md) remains a separate explicit course policy.
