# Composition Views

This directory holds learner-facing composition-view files for canonical DE Gymnasium subject graphs.

Conventions:

- keep composition views separate from canonical subject graphs
- use one `.view.json` file per reviewed resolved scope
- reference canonical subtree roots instead of inlining authored atomic goals
- validate the compiled default tree before saving or using a view in runtime

Recommended layout:

- `curricula/DE/Gymnasium/composition-views/<subject-key>/*.view.json`

Examples:

- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json`
- `curricula/DE/Gymnasium/composition-views/mathematik/de-by-sekii-lk.view.json`
