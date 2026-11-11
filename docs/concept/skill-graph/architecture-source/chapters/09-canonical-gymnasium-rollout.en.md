## Canonical Gymnasium Rollout Policy {#sec:sga-gymnasium-rollout}

This chapter specifies the durable target architecture and rollout rules for converging German Gymnasium curricula across all 16 Bundesländer into one shared canonical skill graph per subject without duplicating competencies per state (execution plans and migration ledgers live in [Canonical Gymnasium Implementation Plan](repo:docs/dev/canonical-gymnasium-implementation-plan.md) and [Migration Status](repo:docs/dev/canonical-gymnasium-migration-status.md)).

### Nine Core Decisions and Scope Vocabulary {#sec:sga-gr-decisions}

1. **Canonical subject layer first:** One continuous `SkillLandscape` per subject under `curricula/DE/Gymnasium/canonical/` spanning Sekundarstufe I through Abitur readiness.
2. **Legacy continuity during transition:** Retired state trees survive as state-scoped audit/source inputs under `curricula/DE/Gymnasium/input/<STATE>/` (enforced by retirement validators in [Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md)) while compatibility mappings bridge learner progress.
3. **Minimal mapping layer:** Explicit `legacyGoalId -> canonicalGoalId` mapping files (`matchType: "exact" | "partial"`) instead of a second content universe.
4. **ISO 3166-2 state identifiers:** Metadata and filters standardize on `DE-HE`, `DE-BY`, ..., `DE-TH` (`ALL` is a query-only sentinel, never serialized).
5. **Stable coach/MCP APIs:** Backend/runtime code hides legacy-vs-canonical translation so AI coaches always see one learner state, one frontier, and one mastery model.
6. **Controlled cross-subject `requires`:** Canonical subject landscapes may author cross-subject edges directly (for example Physics goals requiring Mathematics atoms by their stable IDs) without cloning foreign subtrees; graph validators resolve these references across loaded landscapes, and `CQR-001` includes required foreign goals and their inheriting ancestors in its atomic-normal-form and transitive-minimality audit.
7. **Shared `Gymnasium (DE)` root & reviewed scope vocabulary:** One DE-level composition root exposes child subject landscapes governed by `jurisdiction` (`DE-*`), `schoolForm` (`Gymnasium`), `stage` (`SekI`, `SekII`), `durationModel` (`G8`, `G9`), and `courseProfile` (`GK`, `LK`, `GK+LK` union without duplicated IDs), backed by explicit state-scoped `.view.json` files (@ref{sec:sga-view-projection}).
8. **G9 Sek-I reference grid:** Canonical Sek-I authoring normalizes onto the shared `Jahrgang 5`–`Jahrgang 10` grid while preserving `G8`/`G9` source truth in provenance and view bindings.
9. **State-scoped retained inputs:** Non-canonical source extracts, Abitur blueprints (`curricula/DE/Gymnasium/input/HE/abi/`), and audit records remain strictly state-scoped under `input/<STATE>/`.

### Subtree Migration State Machine and Adoption Sequence {#sec:sga-gr-states}

The unit of convergence is a **didactically closed subtree** (never a forced big-bang rewrite), progressing monotonically through four states:

| State | Meaning & Learner-State Contract |
| --- | --- |
| `1. legacy_frozen` | Existing state curriculum JSON is read-only source input; runtime/mapping fixes allowed without rewriting legacy trees. |
| `2. subtree_adopted` | Closed `contains` subtree reconstructed in `canonical/` with explicit `exact`/`partial` mappings and bound prerequisites. |
| `3. cutover_ready` | Learner-state continuity, frontier coherence, and mapping coverage verified so canonical navigation can become default. |
| `4. legacy_view_retained` | Canonical subtree is the primary learner-facing route; compatibility views remain temporarily until formal retirement. |
{cols="26%,74%"}

Strategic adoption sequence: preserve Hessen learner continuity $\to$ establish Mathematics across Sek I and Sek II as the primary prerequisite spine $\to$ fold Bavaria and remaining states into canonical Mathematics via mappings and `.view.json` projections $\to$ widen multi-subject canonical navigation and cross-subject prerequisites.
