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

The Chemistry and Biology ledgers are self-contained node-type publication
profiles, using the same closed schema and fingerprint contract as Physics.
Their `authoritative` status binds the current **node type** for the native
book builder; it is not a human approval, a positive semantic-atomicity verdict,
or a description, memory, visualization, source-coverage or maturity upgrade.
The matching `*.goal-book-type-classification-v1.receipt.json` files record
the actual source bindings and separate existing atomicity evidence from newly
inspected ordinary technical content leaves. In particular, Chemistry's 177
type-only classifications do not create the missing atomicity review records.
Canonical goals and all existing QA ledgers remain unchanged.

These two review-mode books bind existing single composition views:

- `de-gym-chemie-lk`: `de-de-gym-chemistry-lk`, CrossStage/LK.
- `de-gym-biologie-gk`: `de-de-gym-biology-gk`, CrossStage/GK.

They are not nationwide atlas unions and do not claim complete Bundesland,
duration-model or original-source coverage. Their native original-source
sidecars contain no documents or evidence because these single-view models do
not publish an atlas applicability matrix. Empty sidecars do not mean that the
canonical goals have no curricular sources. The books publish only the goals
in their bound views; out-of-view goals do not acquire feedback bindings.

Biology currently has no primary goal visualizations. Its empty visualization
input lives with the book configuration, outside the global image-QA registry,
and creates neither image approvals nor a new visualization rollout. Chemistry
retains its existing visualization QA, including all human decisions. The two
Mathematics/Physics book artifact families remain byte-identical when these
scoped publications are added to the catalog.
