# Deep-understanding rollout progress

This directory configures the deterministic progress report for the delegated
Mathematics and Physics deep-understanding rollout.

A curricular-atomic goal counts only when all five gates are current at once:

1. a fully validated dual-round description resolution reports
   `strictDescriptionComplete=true`;
2. a schema- and fingerprint-valid positive-understanding-evidence-v2 profile
   is either a human approval or an honest `ai_candidate` with
   `needs_human_review` (a rejection never counts);
3. the semantic-atomicity decision is current and `atomic`;
4. the memory-card decision is current and resolved; and
5. the visualization-QA record is current and passes the repository's existing
   coverage/approval semantics. A current
   `deferred_provider_limitation` record is accepted by that existing QA lane;
   an ordinary missing link, stale asset, stale text, or rejection is not.

The denominator is never configured manually. It is recomputed from the
authoritative semantic-kind ledger after checking complete canonical coverage,
declared counts, and every `semantic-kind-source-fingerprint-v1` binding.

Multiple resolution indexes and positive-evidence configs may be appended to a
subject. Repeated paths, repeated goal IDs, overlaps, or conflicting bindings
are blocking and the affected goals fail closed.

The ordinary strict-resolution case remains two current independent `keep`
records. A narrowly adjudicated `keep_current` case may also resolve one
current `keep` plus one current `revise` record when both bind the exact same
current goal, page, context, and canonical final text, and the synthesis binds
the proposed replacement verbatim as explicitly rejected revision dissent.
This permits the stronger review evidence to be retained without pretending
that its longer replacement sentence was adopted. Two `revise` records,
`split_review`, `block`, stale bindings, a changed final text, or unresolved
dissent remain open and never count.

New description-review work should use one schema-version-2 standalone index
per final batch. Such an index binds only its exact batch goals and artifacts;
it intentionally carries no live denominator. Legacy schema-version-1 indexes
retain their internally checked preparation-time denominator and percentage as
historical snapshot metadata. In both cases this report recomputes the only
current denominator and displayed percentage from the authoritative live
semantic-kind scope.

Run:

```bash
npm --prefix app run quality:deep-understanding-rollout:check
npm --prefix app run test:deep-understanding-rollout
npx --prefix app tsx app/scripts/reportDeepUnderstandingRollout.ts --format=json
```

The description-resolution, positive-evidence, and semantic-kind checks reuse
their exported production validators/fingerprint function. Semantic-atomicity
and memory-card review do not currently export their per-goal fingerprint
helpers; the report therefore runs both production check CLIs and mirrors their
published V1 goal-fingerprint payload only to compute the per-goal intersection.
The targeted test includes live parity assertions so contract drift fails
closed until those helpers can be exported centrally.
