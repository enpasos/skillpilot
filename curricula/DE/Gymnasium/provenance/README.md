# DE Gymnasium Provenance Registry

This directory holds provenance metadata that must remain available even when legacy source trees move toward compatibility-only status or later deletion.

Current scope:

- source-landscape jurisdiction metadata needed for audit and applicability/state filtering
- source-goal atomic-closure metadata needed for champion/topic metrics without live legacy-tree expansion
- source-goal membership metadata needed for Hessen upper-secondary cutover when only archived legacy goal IDs remain in stored planned/active learner state
- canonical-goal provenance metadata needed when canonical subject graphs must stay free of embedded state/source provenance while backend/runtime lookups still resolve legacy source references
- canonical-goal applicability override metadata needed when reviewed scope exceptions must remain available outside the canonical subject graph JSON

Rules:

- keep the registry state-scoped where useful, but stable at the DE-level archive path
- use this registry for durable provenance/audit lookups that must not depend on active legacy source trees
- do not duplicate whole legacy landscapes here; store only the minimal metadata needed for stable resolution
- do not add planned state-onboarding entries to the active shared registries until a real archived source-landscape snapshot with stable source goal IDs exists; keep reserved IDs in a separate onboarding note until then
- once that snapshot exists, activate `source-landscape`, `source-goal-membership`, and `source-goal-closure` together in the same step so archived goal IDs and closures stay consistent from the first live registry state
- backend canonical state filtering and the applicability compiler may resolve `sourceLandscapeId -> jurisdiction` from this registry instead of relying on a still-loaded legacy landscape file
- backend canonical state filtering and the applicability compiler may resolve reviewed canonical `applicabilityOverrides` from this registry instead of embedding state-specific exceptions in canonical graph JSON
- backend champion/topic aggregation may resolve `sourceLandscapeId + sourceGoalId -> atomic legacy closure` from this registry instead of recursively traversing a live legacy landscape tree
- backend Hessen cutover may resolve `legacyGoalId -> sourceLandscapeId` from this registry instead of inferring subject membership from a still-loaded legacy landscape graph
