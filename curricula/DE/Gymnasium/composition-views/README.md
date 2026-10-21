# Composition Views

This directory holds learner-facing composition-view files for canonical DE Gymnasium subject graphs.

Conventions:

- keep composition views separate from canonical subject graphs
- use one `.view.json` file per reviewed resolved scope
- model G8/G9 as `scope.durationModel` (`"G8"` or `"G9"`) only when a reviewed learner-facing projection differs by duration model; duration-specific views are more specific and should beat duration-agnostic fallback views
- reference canonical goal roots instead of inlining authored atomic goals
- `canonicalSubtree` nodes may point to cluster roots or to atomic single-goal roots
- `canonicalSubtree` nodes may carry an optional `displayLabel` when the learner-facing tree should rename or prefix the visible root title without changing the canonical graph
- validate the compiled default tree before saving or using a view in runtime

Physics assessment collections must expand their existing canonical tasks; a
`goalEntry` on an exercise or Abitur cluster hides its children. In cross-stage
views where a Q4 task already has a reviewed Sek I placement, the
`physics-q4-practice` structure references the other canonical atomic tasks
individually as `goalEntry`. This preserves the existing Sek I folder and task
placement while showing each task only once; it does not duplicate or edit the
canonical tasks.
Tasks whose effective role is already `prerequisiteOnly` stay out of that
explicit target list. Adding a direct target `goalEntry` would otherwise
override the existing subtree role and silently widen the target scope.
In these views the old Q4 collection ID
`85bbad98-2f48-5d64-85c4-ab6cf67f24c2` is no longer an authored target or UI
entry. The backend retains it as a canonical ancestor and accepts an existing
focus on it as a scope alias for its applicable target descendants. The new UI
folder uses `composition:<viewId>:structure:physics-q4-practice`; its focus covers
only the tasks referenced there. Individual task IDs and stored mastery remain
unchanged. Removed, redundant Sek II supplement folders are synthetic UI
structures; a stored focus on a removed folder follows normal Level-3
revalidation, with the default visible root as fallback if no focus remains.

Recommended layout:

- `curricula/DE/Gymnasium/composition-views/<subject-key>/*.view.json`

Examples:

- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json`
- `curricula/DE/Gymnasium/composition-views/mathematik/de-by-sekii-lk.view.json`
