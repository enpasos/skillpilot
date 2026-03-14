# DE Gymnasium Compatibility Archive Lane

This directory holds frozen compatibility-archive metadata and later archival artifacts that must survive after live legacy learner routes are retired.

Current scope:

- frozen curriculum summaries for retired Hessen upper-secondary compatibility views
- frozen top-level topic summaries for retired Hessen upper-secondary compatibility curricula
- stable archive-lane metadata that lets the backend export learner archives without reading a live legacy landscape tree

Rules:

- keep archive metadata state-scoped where useful, but anchored at the DE-level archive path
- store only the minimal frozen metadata needed to describe retired compatibility curricula
- do not depend on active legacy landscape JSON files to describe retired compatibility views during archive export
- do not depend on active legacy landscape JSON files to describe retired compatibility views in overview/topic listing endpoints
- dynamic learner archive payloads may still be assembled from persisted learner data, but the curriculum summary must come from this frozen lane

Current active lanes:

- `compatibility-landscape-registry.json`
- `compatibility-topic-summary-registry.json`
- `DE-HE/upper-secondary/`
