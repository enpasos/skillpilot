# Chemistry evidence-watch maintenance review — 7 October 2026

## Exact reviewed delta

The local Chemistry evidence watch reported `changed=2 added=0 removed=0`
after the independently reviewed Chemistry 18-goal integration. The two
watched inputs are the canonical Chemistry JSON and the Bavaria source-mapping
review. Their old watch hashes match the immutable pre-integration snapshots;
their current bytes match the guarded integration plan exactly.

The canonical graph retains all **479 nodes**, including **378
curricularAtomic goals**, with the same IDs, dependencies, containment and
applicability. The normalized watch delta consists of three already reviewed
goal corrections:

- `fd309753`: aqueous acidity/basicity depends on the relative predominance of
  hydronium or hydroxide, rather than their mere presence; DE and EN agree.
- `22133f29`: EN explicitly retains the aqueous-solution scope already stated
  in DE.
- `9751b6d8`: DE/EN name reversibility of proton transfer, and direct source
  provenance points to the already reviewed Bavarian C10-NTG.2.8 component.

The Bavaria review appends exactly two direct child routes. The
`597ac03c` route covers the acid/base structural-suitability component of
C10-HG_SG_MUG_WWG_SWG.4.6 and remains `partial`; its reversibility sibling is
separate. The `9751b6d8` route covers the qualitative reversible-proton-transfer
component of C10-NTG.2.8. All prior mapping rows and all other source decisions
and global summaries are unchanged. These component bindings do not close the
entire source groups or other open scientific work.

The four new PNG bindings belong to the separately reviewed visualization lane.
The unchanged watch contract excludes image presentation metadata from its
canonical evidence hash.

## Bounded baseline acknowledgement

Only the two corresponding baseline records and `updatedAt` advance. The other
**144 complete baseline records** remain exact, with the same 146 watched paths.
The manifest, normalization algorithm, checker and workflow remain unchanged;
future unacknowledged deltas still fail.

The [technical receipt](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemistry-evidence-watch-current18-bounded-acknowledgement-technical-20261007-v1/bounded-watch-baseline-acknowledgement.actual.receipt.json)
records the exact changed fields, existing reviewed plan operations and both
old/current watch hashes. The [complete prior baseline](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemistry-evidence-watch-current18-bounded-acknowledgement-technical-20261007-v1/before/chemistry-evidence-watch-baseline.json)
is retained unchanged. The
[actual guarded scientific integration](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-final18-reviewed-active-integration-root-20261007-v1/root-reviewed-and-actual-integrated-boundaries.receipt.json)
remains the integration lineage; this maintenance acknowledgement creates
**zero new scientific reviews or completions**. Current strict M7 totals require
the central report. Human approval, practical trials and release acceptance
remain separate.

## Local verification

The unchanged `bash scripts/run_canonical_chemistry_evidence_watch.sh` completed
with **Exit 0** at **09:30:15 UTC**, including its self-test,
`changed=0 added=0 removed=0` and `CHEMISTRY_EVIDENCE_WATCH=OK`. Both watch views
were regenerated natively. The
[completed command receipt](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemistry-evidence-watch-current18-bounded-acknowledgement-technical-20261007-v1/full-canonical-chemistry-evidence-watch-after-reviewed-delta.actual.terminal.receipt.json)
records the actual terminal result. This is local evidence; a new commit and
GitHub run must verify CI separately.
