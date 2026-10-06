# Independent NI cluster schema metadata guard

Reviewer: `/root/chem_qa_native_guard`. Scope is the minimal metadata repair of
the already reviewed NI curricular-area cluster
`9cd0dbbc-9507-5879-8c4f-df54529969ec`. This reviewer writes only this additive
technical dossier. Root alone applied the two operative-file changes.

## Required change and actual application

The standard `docs/landscape-runtime.schema.json` requires every goal to have
an object `dimensionTags`, whose sole required property is `phase`. Actual
validation of `$defs.goal` found exactly one error in the old cluster:
`'dimensionTags' is a required property`. Adding only
`"dimensionTags": { "phase": "GLOBAL" }` removes that error. Every one of its
existing 20 children already uses `GLOBAL`; no framework, demand level, area,
topic, year, or additional subject claim is invented.

The cluster remains the same `curricularArea`, with the same 20 children,
prerequisite, DE-NI jurisdiction, inheritance boundary, text and other fields.
The native `semantic-kind-source-fingerprint-v1` deliberately includes
`/dimensionTags`. Its one authoritative cluster decision therefore requires
the following technical fingerprint replacement:

- Before: `sha256:953c6bcc319ea2dd2ef1d9fd02af1f90322ea126f1b6bcc379b186c5cfea6c31`.
- After: `sha256:b38a82a7a4714866f6fd031e7338b3cb5926337772d6c9678de4e2195d4b9a3f`.

The actual Root canonical file and semantic-kind ledger were checked against
their full preserved pre-application versions and the independently computed
minimal change. Only the cluster receives `dimensionTags`; only its decision
receives the computed `sourceFingerprint`. All 463 other whole canonical
objects and all 463 other whole semantic-kind decisions are exact. The complete
landscape still has 464 goals and exactly 383 `curricularAtomic` goals.

## Actual native binding comparison

`audit_native_cluster_schema.mts` imports unchanged production functions and
constructs before/after inputs in memory. It returned exit code 0 and proves:

- All 383 current atom objects, native semantic-kind source fingerprints,
  goal-evidence fingerprints, own review-input payloads and description
  canonical-context DTOs are identical.
- All 383 complete native atlas pages, including goal/page fingerprints,
  prerequisites, reverse references, breadcrumbs, source scopes and image
  bindings, are identical. Complete chapter and navigation objects are also
  identical.
- The native original-source compiler produces identical documents, evidence
  and per-goal scope rows. Its canonical traversal reads unchanged `contains`
  and inheritance-boundary data; the parent phase does not enter these rows.
- Rebuilding the actual existing D18 and D5 bilingual DTOs through
  `buildGoalDescriptionReviewInput` yields exactly the original complete inputs
  of both independent rounds, including their frozen batch/book/input digests.

Only the native full-book source fields `landscapeDigest` and
`semanticKindLedgerDigest` change. These change the outer full-book digest and
the citation index's outer `bookDigest`; a newly exported whole-book bundle
would therefore have a different outer binding. These outer publication
changes do not alter the preserved atomic pages or existing review DTOs and
do not warrant relabeling any old scientific review as new.

The positive-evidence functions additionally compare identical own-goal inputs
under one explicitly technical constant criteria value. This is an input
invariance check, not a newly reviewed positive profile. Existing D/P/A/M/V
records, cards and visibility inputs remain separate authoritative evidence.

## Historical integrity and limits

`audit_actual_root_metadata.py` returned exit code 0. It physically verifies the
unchanged 163-file NI integration freeze, 407-file Chemie integration freeze,
and ten independent NI science freezes containing another 964 entries:
**1534 exact historical file entries**. No historical freeze or science file
was edited. The current 72 D/P/A/M/V/card/visibility binding files were inventoried
truthfully after Root's application and remain exact since that inventory;
this inventory alone is not claimed as a pre-application comparison.

This package restores one technical cluster-classification binding and grants
**zero scientific completions, zero scientific approvals and zero human
approval or trial**. The full current central report, standard full schema run,
dependent Layer-A checks and protected maturity floors remain separate Root
checks. No runtime, source row, learner-facing view, or general validator was
changed by this reviewer.
