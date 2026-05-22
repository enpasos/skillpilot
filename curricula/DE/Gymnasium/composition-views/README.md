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

Recommended layout:

- `curricula/DE/Gymnasium/composition-views/<subject-key>/*.view.json`

Examples:

- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json`
- `curricula/DE/Gymnasium/composition-views/mathematik/de-by-sekii-lk.view.json`
