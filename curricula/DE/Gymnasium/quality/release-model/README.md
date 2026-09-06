# Semantic-kind decision profiles

The `profileId` in a semantic-kind ledger identifies the versioned decision
profile under which that ledger was reviewed. It is not, by itself, a file
reference or a trust anchor.

The mathematics ledger is additionally selected by the curriculum-package
ontology profile of the same ID. The Physics goal-book ledger is deliberately
self-contained: its `profileId` equals its `ledgerId`, and no unimplemented
Physics ontology-profile file is implied. Goal-book trust instead comes from
the closed ledger schema, exact source-landscape binding, the builder-pinned
`semantic-kind-source-fingerprint-v1` contract and its pinned
`semantic-normal-form-v1` bytes, plus a current fingerprint for every source
goal. A future Physics ontology export must introduce and validate a separate
ontology profile rather than reinterpret this decision-profile identifier.

Cross-landscape prerequisites keep two deliberately distinct bindings. The
optional `landscapeId` on a reference records its fachliche source and must
match a digest-bound `source.externalLandscapes` entry. Its `canonicalUrl`
still points into the containing learning-goal book: that context can resolve
the referenced goal from its external-relation index even when the source
landscape book has no curricular page for the referenced cluster.

The nationwide Physics atlas binds
`provenance/gymnasium-physics-duration-model-policy.json` as its complete,
authoritative 16-state duration-policy snapshot. The older shared
`gymnasium-duration-model-policy.json` remains the byte-stable mathematics and
legacy source. Its ten existing Physics decisions are retained unchanged and
must be canonical-JSON identical to the matching entries in the complete
Physics snapshot.

## Chemistry and Biology feedback books

The scoped Chemistry and Biology publication inputs live in the sibling
[`goal-book-publication`](../goal-book-publication/README.md) directory.
They must not be stored here, including in subdirectories: the composition-view
validator recursively discovers `*.semantic-kinds.json` files in `release-model`
and applies their authoritative classifications to **all** composition views.
Book-only type decisions must not implicitly change that global validation scope.
