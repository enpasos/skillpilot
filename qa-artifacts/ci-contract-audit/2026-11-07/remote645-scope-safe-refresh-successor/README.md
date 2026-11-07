# Scope-safe successor to the unapplied remote645 refresh candidate

The sealed first candidate and its original evidence remain unchanged at
../remote645-terminal/. This successor addresses the independently reproduced
A-to-B queue-loss countercase. It is a local candidate, not a new remote CI result,
merge, deployment or host acceptance. Active code/source/Git were not modified.
Root HEAD at patch checking: bc106e1a7bc35a34143a46bb414b4c4e864e6ebd.

RAM root: /dev/shm/skillpilot-remote645-scope-safe-6ohwblvg

## Minimal correction

Only LearnerView.tsx and the targeted addition to testLearnerViewStartupUi.ts
change relative to the first candidate. A queued refresh now carries its scope
and its own continuation. An old request's finally resumes current pending work
through that continuation, rather than using its old captured learner callback.
The existing one-request limit and 800ms throttle remain. Scope cleanup resets
that scope's throttle, and an obsolete timer checks its own identity before
reading or clearing any current pending work. Stale-scope callbacks and final UI
refresh dispatches are rejected. Pending work is cleared on scope cleanup/unmount.

## Actual controls

- The exact root native countercase ran again against first candidate SHA
  10556043ccca63e4849fa4445da34cac16d34a4d326889c86e03252ef33cda39:
  B receives 0 refreshes instead of 1. Its test exits 0 because it asserts that defect.
- The actual successor callback and actual cleanup were extracted/transpiled and
  run with native deferred promises: B receives exactly 1 refresh, pending/timer
  are empty, and only B receives a final UI refresh dispatch. A separate controlled
  timer countercase invokes an already runnable obsolete A timer while B owns
  pending work: B's queue survives, then B receives its initial and one coalesced
  trailing refresh. That case finishes with no pending/timer/in-flight work.
- The same new Chromium regression ran against the first candidate and successor.
  A state read stays open; the real fixture changes learner A to B; B queues a
  FULL_REFRESH; then A returns a wrong focus, setup request and 999 counters.
  The first candidate fails waiting 5s for B's missing response. The successor
  issues exactly one additional B state read and plan read, keeps B profile reads
  at 1, renders B's updated active goal and 1-of-1 plan, and never flashes A's goal,
  setup or counters in the observed DOM history. No assertions were relaxed.
- The complete existing startup/deduplication/quiet-refresh/scope-isolation suite
  plus the new browser case passes. Existing within-scope burst/full Cockpit,
  targeted ESLint, app TypeScript and full patch application check also pass.

Native callback execution and real browser lifecycle validation are separate
logs. browser-focused-control.actual.ts preserves the exact focused script used
in both browser controls; it was executed from each RAM app/scripts directory.
The same new case is included in the existing ordinary CI startup test script.

## Application material

full-12-files.patch.gz is the complete candidate patch against the active tree.
It includes the original eleven candidate files plus the targeted startup test.
original-11-files-aftermap.json supplies the requested complete eleven-file SHA
aftermap. full-12-files-aftermap.json includes the new test too and records
active-before, first-candidate and successor hashes. Final candidate hashes were
verified directly: zero mismatches. successor-vs-first-candidate.patch isolates
the two-file correction for review. Root owns application and committing.

All eight generated source-rationale artifacts are byte-identical to the first
candidate. The prototype preference-event spelling and strengthened within-scope
burst test from that candidate also remain unchanged. No generated-report checker,
quality threshold, package manifest or testDeepUnderstandingRollout.ts is part
of this successor correction. No source or QA approval/review evidence changed.

checks.json records terminal exit codes, including the intentional negative
control. packet-sha256.json seals this separate bounded packet. The old packet's
seal was checked again with zero mismatches. Full source copies, caches and
screenshots remain in RAM.
