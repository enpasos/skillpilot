# DE Gymnasium Provenance Registry

This directory holds provenance metadata that must remain available even when legacy source trees move toward compatibility-only status or later deletion.

Current scope:

- source-landscape jurisdiction metadata needed for audit and applicability/state filtering
- source-goal atomic-closure metadata needed for champion/topic metrics without live legacy-tree expansion

Rules:

- keep the registry state-scoped where useful, but stable at the DE-level archive path
- use this registry for durable provenance/audit lookups that must not depend on active legacy source trees
- do not duplicate whole legacy landscapes here; store only the minimal metadata needed for stable resolution
- backend canonical state filtering and the applicability compiler may resolve `sourceLandscapeId -> jurisdiction` from this registry instead of relying on a still-loaded legacy landscape file
- backend champion/topic aggregation may resolve `sourceLandscapeId + sourceGoalId -> atomic legacy closure` from this registry instead of recursively traversing a live legacy landscape tree
