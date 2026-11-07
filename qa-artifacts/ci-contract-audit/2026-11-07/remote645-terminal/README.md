# Remote 645 terminal failure and bounded RAM repairs

Remote frame: CI run 42339158886, attempt 1, HEAD
645188035b9babb6e001eb9d29caee79ae030377, terminal failure.
https://github.com/enpasos/skillpilot/actions/runs/42339158886
Local frame: current intended source with fixed74 visualization authority and
root-owned reviewed PoWi prerequisite changes. This packet changes neither
canonical source nor QA approval/review evidence. Local results are not a new
remote CI result. No commit, push, merge or deployment was performed here.

## Two actual failures

1. Application frontend job 128308936240, step 39:
   npm run test:learner-map. Native projection and native product App UI PASSED.
   testFullCockpitPrototype.ts:167 timed out waiting for plan completion 2 von 2.
   LearnerView discards FULL_REFRESH events while another refresh is in flight
   or within its 800ms throttle, leaving the plan status at an earlier snapshot.
   A deterministic ordinary/completed event burst reproduces the same assertion
   against the original view. The same strengthened test passes with the candidate.
   No count or icon assertion was removed or relaxed.
   The prototype's preferences PUT also emitted PREFERENCES_UPDATED, whereas
   LearnerService publishes PREFERENCES_CHANGED; the candidate aligns the fixture.
2. Curriculum validation job 128308936257, step 42:
   npm run check:goal-source-rationales:math-public failed for stale description
   of 0c2ddfcd-1399-41ad-aaed-4f061812602a in the Math public runtime index.
   Reproduced exactly locally. The downstream all-relevant report has the same
   stale description, reproduced separately because remote CI skipped it.
   Ordinary current-source generators repair both and their dependent reports.
   There are no checker changes, warning baselines or QA bypasses.

## Candidate

RAM root: /dev/shm/skillpilot-remote645-fixes-zudo1f92
The candidate contains 11 files; candidate-files-sha256.json records original
and final candidate byte hashes. all-11-files.patch.gz is the complete patch,
including ordinarily regenerated assets. code-and-regression.patch isolates
three code/test files. Candidate copies are also retained at their ordinary
relative paths under the RAM root. Parent/root owns applying and committing.
The patch passed git apply --check --whitespace=error-all against the active
working tree without modifying files or the index.

The production repair retains a single in-flight refresh and the 800ms throttle.
It coalesces skipped events into one latest pending event, drains it after the
current request/throttle, and cancels pending work at learner scope change or
unmount. The regression delivers two normal preview change events in one turn;
all original completion, whole-subject, period-count and icon assertions remain.

## Ordinary asset regeneration commands (run from app)

npm run quality:goal-source-rationales:math-public
npm run quality:goal-source-rationales:math-all-relevant
npm run quality:goal-source-rationale-coverage
npm run quality:goal-source-rationale-gap-issues
npm run quality:goal-source-rationale-mapping-batch-01

These were run in the RAM overlay with ordinary current source inputs and the
live MEM endpoint. Math public index remains 754 items/classic routes and zero
classic gaps. The all-relevant report remains 807 items, 754 classic routes and 53
gaps. Current live MEM matching yields 260 consistent routes, up from 234 in the
old generated index. This is a real regenerated response, not a copied baseline.
Physics public index is unchanged at 435 items.

## Focused validation

PASS: strengthened full original Cockpit browser regression.
PASS: native product App map at desktop, 320px and 390px with isolated HTTP/SSE.
PASS: native map projection including real HE Sek II LK 723-entry scope.
PASS: map prototype 56-node/98-route navigation/camera/culling/search regression.
PASS: LearnerView startup, deduplication, quiet refresh and scope-isolation UI.
PASS: targeted ESLint on all three code/test files.
PASS: TypeScript app project, with build info confined to the RAM overlay.
PASS: all five source-rationale ordinary freshness/checker commands.
PASS: complete patch application check and final 11 candidate-file SHA matches.
NEGATIVE CONTROL: same strengthened full Cockpit test against original view
fails at the same 2-von-2 assertion. Fixed source restored afterwards and verified.

Exact decoded remote logs are retained as deterministic gzip files; decoded and
gzip SHA-256 values are recorded in log-sha256.json. Remote logs and local proof
logs are distinct files. Full local screenshots remain only in the RAM overlay.
