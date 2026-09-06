# Scoped goal-book publication inputs

These inputs are loaded only by explicit `semanticKindLedgerPath` references in
the Chemistry and Biology book configurations under
`app/scripts/config/goal-books/`. Keep them outside the entire `release-model`
directory tree: global composition-view validation recursively discovers ledgers
there, while these decisions are limited to the public book projections.

The ledger and receipt bytes were moved unchanged from `release-model` after
their unintended global discovery caused CPV-009 errors in Chemistry views.
The validation rule and canonical composition views remain unchanged. Moving
an input path changes the book model digest, so regenerate the affected model,
PDF, render manifest, source sidecar and publication index together; it must not
change goal/page fingerprints or book coverage by itself. The separately
requested nationwide atlas expansion adds source-backed scope and navigation,
so its native page bindings must be regenerated normally.

`test:goal-book-model` checks this isolation, including nested global paths and
renamed copies of book-only classifications. Any future global semantic-kind
rollout requires its own composition-view review, not a relocation of these files.

## Publication scope

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

The public editions are `de-gym-chemie-bundesweit` and
`de-gym-biologie-bundesweit`, using the same native national-atlas model,
canonical chapter navigation, applicability matrix, original-source sidecar,
PDF renderer and feedback bindings as Mathematics and Physics. They replace
the initial single-profile LK/GK selections, not the canonical curriculum.

The book-local source projections are derived from existing reviewed mappings
and explicit source scope metadata. They do not add learner-facing composition
views or change global applicability. One canonical learning goal is published
only once; its matrix can retain multiple source-backed state/stage/profile
scopes. Mapped cluster evidence stays distinguishable from direct goal evidence
in the original-source index. Unknown scope must not be guessed from canonical
phase, course labels or another subject's policy.

Nationwide means a union of the currently documented sources, not a claim that
every state/stage curriculum has complete coverage. In particular, Biology has
Sek-I sources for all 16 states, but current Sek-II source mappings only for
Hesse and Bavaria. No upper-secondary assignments are invented for the other
14 states. The public feedback entry states this limitation, and the goal
matrix/source links show the individual bindings.

The current Chemistry union contains 358 of 376 ordinary content goals. Eight
additional goals have only unresolved source-scope evidence (Bavarian
Biologisch-chemisches Praktikum); ten have no reviewed mapped source witness.
Their IDs and reasons remain listed in the generated
`source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json`.
They are not silently assigned to a state, stage or course profile. Biology's
source union contains all 355 current ordinary goals. These are publication
coverage counts, not semantic-quality or completion percentages.

Compared with the former 334-goal Chemistry LK selection, the national book
adds 34 source-supported goals and does not carry forward the ten goals without
a reviewed mapped source witness. Their canonical content is unchanged and
remains available in the curriculum; their book-feedback bindings are not
silently remapped. The old scoped publication IDs are retired, so historical
feedback links retain the existing fail-closed behavior instead of being
rewritten to a different seven-field binding. Old files remain recoverable from
Git history. Biology retains all goals from its previous 355-goal book.

## Rebuild and verification

Use the repository's `.nvmrc` Node version. From `app/`, regenerate the
book-local source inputs with:

```bash
npx tsx scripts/buildGoalBookSourceAtlasInputs.ts --config app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json
npx tsx scripts/buildGoalBookSourceAtlasInputs.ts --config app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json
```

The config argument is repository-relative, independent of the working
directory. Append `--check` for a read-only comparison. Then rebuild the native
models, PDFs, render manifests, original-source sidecars and public index using
the corresponding `*-national-atlas.json` book configurations.

`test:goal-book-model` exercises isolation, source-scope negative cases and
current coverage. `check:goal-book-publication` also requires current generated
source inputs before checking either atlas, so CI and deployment both reject
stale mapping/source bindings. Missing companions or mismatched book, landscape,
ledger, manifest and source-view bindings fail closed. The explicit mapping
lists are intentional: newly reviewed source collections must be added and
inspected, not automatically treated as new publication coverage.

Original PDFs under `curricula/` are deliberately gitignored authoring downloads.
The two `.inputs.json` configurations therefore pin those document snapshots by
repository-relative cache path, official URL and SHA-256. The initial pins are
the exact hashes already recorded in the published source-projection receipts,
verified against the existing local downloads. They preserve archived document
identity, not a claim that CI downloaded or re-reviewed the current remote PDF.
Source extraction JSON, reviewed mappings and all other derivation inputs remain
mandatory and freshly hash-checked. If a pinned PDF is locally present, its bytes
must match; if absent, the same committed snapshot binding is used offline.
Missing, malformed, duplicate, unused or URL-mismatched snapshot metadata fails
closed; missing inputs without a snapshot still fail. No network download or
bulk addition of third-party PDFs is required for CI or deployment.
The regression copies both real atlas input sets into isolated directories
without any PDF downloads and requires exactly identical generated outputs.

Biology currently has no primary goal visualizations. Its empty visualization
input lives with the book configuration, outside the global image-QA registry,
and creates neither image approvals nor a new visualization rollout. Chemistry
retains its existing visualization QA, including all human decisions. The two
Mathematics/Physics book artifact families remain byte-identical when these
scoped publications are added to the catalog.
