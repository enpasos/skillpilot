## Declared Units: Structure, Order, and Evidence {#sec:learning-units}

This chapter states the binding target model of decisions B1 to B16 of 14 November and the stage decisions of 15 November 2026. Its implementation boundary is explicit: the three existing subject units still use the contract of 12 November; the stage-plan foundation activates no real Land plan yet. Target model, existing structural validator, and production runtime are different evidence claims.

:::principle {title="Cluster, Unit, Unit With Assessments"}
A **cluster** structures goals. An explicitly declared **unit** is a cluster whose goals can be acquired as one continuous block in the intended learning flow. A **unit with assessments** additionally demonstrates independent application of its own content goals through own assessments with reviewed coverage. An assessment-free unit only orders goals and recognizes nothing. Not every cluster is a unit; subjects are filters, not units. Personalization levels, maturity tiers, and difficulty retain their meanings.
:::

:::principle {title="Target Model and Existing Contract"}
Subject units belong to the canonical landscape and hold across all Länder. **Plan units** structure the shared plan of one Land and duration model across the selected subjects, for example stages, years, and phases. Migration of subject units, their assessment clusters, package carriers, and production readers follows F8 (measurement) in F9 to F13. The development directory `contracts/curriculum-package/v1.3/` is not a published curriculum package and does not prove this migration.
:::

Necessary current subject-matter repairs of goals, prerequisites, tasks, rubrics, and coverage remain authorized now under delegated K1–K13. The F8 boundary concerns future unit introduction and its cluster, assessment, package, and runtime migration; it preserves no false edge or missing assessment. Each such repair needs its own current independent evidence.

### Motivation and Distinct Domain Claims {#sec:unit-claims}

A learning promise explains: what will I be able to do afterwards, and why is it useful? A motivational opening is a didactic function. Only a genuine orientation goal has its own result contract; a heading creates no goal, and derived completion asserts no actual conversation.

Unit boundaries follow a meaningful conceptual transition. Existing assessments, goal quotas, headings, and edge density do not define them. Sparse prerequisite chains can form strong units. A questionable edge is reviewed on subject-matter grounds rather than retained or changed to fit a desired grouping. Absence of a later consumer proves no completion. The [design criteria](repo:docs/concept/skill-graph/learning-unit-design-and-examples.md) continue to apply.

An aggregate groups children without a new own assessment. A synthesis assessment may demonstrate additional integration without artificial content goals or re-passing children. At full rollout own content goals need a responsible subject unit with assessments. Such a unit's assessments lie within its cluster and cover every own content goal under R1 to R5. This also applies to experimental content goals. Until full introduction assessment-free units may order own content goals; this grants no recognition.

Assessments must expose essential misconceptions. A gap leads to focused further learning and a fresh equivalent assessment under the ordinary grading contract. There is no hidden pass rule and no second outcome. Missing coverage is an **assessment gap**: it remains a failing finding and is repaired with suitable tasks, solutions, rubrics, and independent review, never through a fictitious prerequisite or relaxed gate.

### Own Goals, Child Units, and Total Scope {#sec:unit-own-children}

The target contract declares a unit in the placement layer and references its cluster. The atomic descendants of that cluster form $T(U)$. Direct child units are the declared units below it with no intervening unit between them and U. Their set is $\Children(U)$. The remaining atoms form $\Own(U)$; child units and own atoms together are the unit's **children**. Intervening clusters without a unit declaration are skipped.

:::equation {#eq:unit-targets}
T(U) = \Own(U) \cup \bigcup_{V \in \Children(U)} T(V).
:::

Total scope is non-empty. An aggregate may have no own goals when its children carry the scope. E1 makes each contained atom's smallest unit unique. Overlapping references create neither extra goals nor duplicate progress points. Goals and units without a parent unit are children of an imaginary root. In a full Land plan every goal lies inside one of the two stages; the nationwide canonical structure is no Land plan and may carry goals beside its top units.

#### Representation and Implementation Boundary. {#sec:unit-representation}

In the target model the unit entry names its cluster, learning promise, revision, `after`, and, where applicable, coverage reviews of own assessments. Own goals and child units derive from `contains`; existing `own` and `parentUnitId` are replaced only with F9/F10. A generic or expanded cluster does not declare itself a unit. Goals, prerequisites, and assessment data are not copied.

:::table {#tab:unit-representation caption="Existing representation and binding target model; no claim of completed migration." cols="30mm,46mm,X"}
| Item | Existing contract of 12 November | Binding target model |
| --- | --- | --- |
| Subject unit | `programUnits`, kind `learningUnit`, `promise`, `promiseEn`, `revision` | Declared cluster in the same placement layer; promise and revision remain. |
| Own goals and children | `goalPlacements` with `relation: own`, no `context`; `parentUnitId` | Derived from cluster scope and nested unit declarations; F9/F10 remain pending. |
| Coverage reviews | `coverageReviews`, at most one per own assessment, bound to task and rubric hashes and a review record | Still required for units with assessments; historical evidence is never rebound. |
| Plan units | Stage-plan foundation under `v1.3`, without an activated Land plan | One shared plan per Land and duration model; views are derived excerpts. |
| Completion and results | No stored unit mastery | Still derived; no writing back to goals and no recognition from `after`. |
:::

[Package contract 1.2](repo:contracts/curriculum-package/v1.2/README.md) carries the three existing units through `learningUnitsV1`; the [stage-plan foundation](repo:contracts/curriculum-package/v1.3/README.md) is separate. `validate:learning-units` continues checking the old contract, including R1, R3, and unique `own` assignment. It is not yet a general E1-to-E4 validator of the new model. Changed goals or assessments need current evidence; unchanged historical evidence and the frozen V9 reduction registry remain untouched. A normative change, new placement, or new unit writes no learner result.

### Completion Without Additional Stored Unit Mastery {#sec:unit-completion}

The full unit is complete exactly when its own goals are satisfied and all required child units are complete:

:::equation {#eq:unit-complete}
\Complete(U) \iff \bigl(\Own(U) \subseteq \Meff\bigr) \;\land\; \bigwedge_{V \in \Children(U)} \Complete(V).
:::

No `UnitMastery` is stored. Assessment and memory goals stay explicit; a parent assessment replaces neither a child assessment nor verified card recall. A synthesis assessment is an additional own obligation. A card collection alone proves no independent application; a child's recall obligation is not moved to the parent to manufacture child completion.

Completion of the **portion** required by the Personal Curriculum is not full completion of the whole unit. Only actually needed atoms enter $L$; displaying a unit adds no other assessments or content. The full-unit claim continues to be assessed over the whole $T(U)$.

::figure{id="fig:recursive-unit"}

### Recognition Before Overall Completion {#sec:unit-early-recognition}

The set computation in Section~@ref{sec:assessment} remains unchanged and is not yet a production global recognition contract. Recognition concerns only own ordinary goals of a valid, revision-bound local assessment contract. While an open own assessment or an open own memory goal still requires a competency, it remains in open demand. An independent card or child unit may stay open without revoking recognition that is already valid. A parent assessment never expands recognition to all descendants; an open synthesis never revokes valid child recognition. Without an own assessment contract a unit recognizes nothing.

### `after`, Atomic Demand, and Rules E1 to E4 {#sec:unit-progression}

`U after V` means: in the intended learning flow V is fully complete before U starts. It connects only units that are children of the same unit, including the imaginary root. It orders every atom in U after every atom in V. What is inherited is order, never demand. `requires`, by contrast, connects only atomic goals and requires the designated competency. It does not require whole-unit completion. In the target model no prerequisite points to an assessment goal.

:::table {#tab:unit-ordering caption="Binding ordering rules; each structure is checked separately." cols="14mm,X"}
| Rule | Requirement |
| --- | --- |
| E1 Tree | Units are nested or share no atoms; each contained goal has at most one smallest unit. In the full Land plan every goal has exactly one learning placement. R4 expresses this uniqueness in local assessment-contract terms. |
| E2 Learnable in one block | An ordering of all atoms exists that respects every direct and transitive demand and every `after`, with each unit forming one continuous block. |
| E3 Complete | If a requires b, inspect their smallest common unit, or the imaginary root. If a and b lie in two different child units there, the child of a must lie after the child of b through the declared `after` closure. If at least one child is an own atom, demand itself orders it. |
| E4 Sparse | Among the children of the same unit, no declared `after` follows already from the other `after` declarations there. Canonical and Land structures are checked separately. |
:::

E2 is checked at the children of every unit including the imaginary root. A directed edge from child X to child Y arises when X declares `after` Y or an atom in X requires an atom in Y. This child graph must be acyclic; internal child graphs are checked likewise. An atomic DAG alone is insufficient: $a\to b\to c$, $\Own(U)=\{a,c\}$, and $\Own(V)=\{b\}$ create a cycle between U and V. Regrouping or subject-matter-justified finer goals repair it; the diagnosis invents no whole-unit lock.

E3 compares actual atomic demand with declared order. A subject `after` does not become redundant merely because the Land's year order imposes the same order: E4 applies per declaration layer. Atomic normal form $R\subseteq A\times A$ and its transitive minimality remain separate obligations; the hard G17 check still covers the complete 21 canonical Gymnasium roots. This claims no new E4 gate.

:::principle {title="No Whole-Unit Lock; GD-U14 Is Superseded"}
The formerly open access profile `GD-U14` with `Open` and `Cleared` is retired in the binding target model by B9 of 14 November 2026. `after` changes neither frontier nor focus rules, direct assessment access, stored outcomes, or recognition. The planned learning mode “unit by unit” only ranks already reachable offers; explicit learner choice and learning-plan priority remain. This runtime selection F13 is not implemented yet. Retirement claims no completed removal of historical code paths.
:::

For full Land plans Sekundarstufe I and II are the only root children, II `after` I. No atom of the earlier stage may require an atom of the later stage, including transitively and as preparation. A finding is repaired through corrected prerequisites, splitting, evidenced earlier placement, or labeled preparation. No view weakens demand or hides backflows. Introduction follows reporting, cause repair, a ratchet, and a hard gate at zero violations; no new complete Land plan has thereby already been accepted.

:::sources
[Binding unit concept](repo:docs/concept/skill-graph/learning-unit-wiring-concept-2026-11-14.md); [Stage decisions and handover](repo:docs/dev/stage-plan-units-handover-2026-11-15.md); [Stage-plan foundation](repo:contracts/curriculum-package/v1.3/README.md); [Recognition and global completion](repo:docs/concept/skill-graph/assessment-gated-completion.md).
:::
