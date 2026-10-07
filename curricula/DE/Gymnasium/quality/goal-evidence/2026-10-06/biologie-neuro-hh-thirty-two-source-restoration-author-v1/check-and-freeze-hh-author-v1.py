#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal finished inert candidate inputs; never turn technical checks into review."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
FREEZE = OWN / 'hh-thirty-two-partial-source-author-v1.final.freeze.json'


def load(name):
    return json.loads((OWN / name).read_text())


def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


assert not FREEZE.exists(), 'Preserve a finished freeze; do not refresh historical decisions'
scope = load('HH.all-thirty-two-current-goal-primary-scope.decisions.author-v1.json')
source = load('HH.bounded-source-components.author-v1.candidate.json')
mapping = load('HH.bounded-component-mappings.author-v1.candidate.json')
guard = load('actual-author-input-and-protected-subject-preservation.json')
native = load('native-hh-current390-additive-atlas.author-v1.actual.receipt.json')
assert len(scope['componentCandidates']) == 21 and len(scope['openCurrentGoalScopeHolds']) == 11
assert len(source['sourceGoals']) == len(source['passages']) == len(mapping['mappings']) == len(mapping['decisions']) == 21
assert source['qualityReview']['status'] == 'author_candidate_awaiting_two_independent_reviews'
assert source['retainedOriginalSourceObligations']['originalWholeHoldDecision']['decision'] == 'needs_canonical_goal'
assert len({r['goalId'] for r in scope['componentCandidates'] + scope['openCurrentGoalScopeHolds']}) == 32
assert all(c['wholeCurrentCanonicalClaimApproved'] is False and c['scientificIndependentApproval'] is False
           for c in scope['componentCandidates'])
assert all(c['authorDecision'].startswith('HOLD_') for c in scope['openCurrentGoalScopeHolds'])
assert all(g['wholeOriginalBulletCoverage'] is False and g['isOfficialBullet'] is False
           and g['officialNumberingClaim'] is False and g['stage'] == 'SekI'
           and g['courseLevel'] == 'unspecified' for g in source['sourceGoals'])
assert all(d['matchType'] == 'partial' and d['independentReviewStatus'] == 'pending_two_independent_source_scope_reviews'
           and d['wholeOriginalSourceCoverage'] is False for d in mapping['decisions'])
assert native['candidateCounts']['canonicalCurricularAtomicGoals'] == 390
assert len(native['countryScopes']) == 22 and len(native['actualNewDirectHHComponentWitnesses']) == 21
assert native['exactCompleteCountryScopeTargetListsComparedAndPreserved'] is True
assert all(w['coverage'] == 'direct' and w['scopeKey'] == 'DE-HH/SekI/' for w in native['actualNewDirectHHComponentWitnesses'])
for b in guard['inputBindings'] + native['actualNativeInputBindings']:
    assert sha(ROOT / b['path']) == b['sha256'], f'Input drift at seal: {b["path"]}'
for r in scope['componentCandidates'] + scope['openCurrentGoalScopeHolds']:
    assert r['nativeVisibilityRestored'] is False and r['scientificIndependentApproval'] is False
for r in [native, guard, scope]:
    assert r['activeWrites'] is False and r['newStrictCompletions'] == 0 if 'newStrictCompletions' in r else r['activeWrites'] is False
    assert r['humanApproval'] is False and r['humanTrial'] is False
files = [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
         for p in sorted(OWN.iterdir()) if p.is_file() and p != FREEZE]
assert len(files) == 10
result = {
    'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'source AUTHOR candidate; two independent actual source-scope reviews pending',
    'files': files, 'allActualInputHashesRecheckedAtSeal': True,
    'counts': {'HHCurrentHistoricalPairs': 32, 'directPartialComponentCandidates': 21,
               'HHIndividualWholeGoalPairHolds': 11, 'otherHistoricalPairsNotTouched': 155,
               'currentCanonicalNodes': 472, 'currentCurricularAtomic': 390,
               'exactUnchangedFullCountryViewTargetSets': 22},
    'nativeCurrent390AdditiveAtlas': 'PASS_actual_pure_production_helper_run',
    'fullNeuro21HoldOverlayAndGoalBookPlacement': 'NOT_RUN; remains open',
    'wholeOriginalSourceHoldRetained': True,
    'residualUnboundRequirementsInside21PartialCandidatesRetained': True,
    'MathPhysicsChemistryCanonicalAnd112WholeBindingsPreserved': True,
    'separateTH19FrozenAuthorFilesUnchanged': True,
    'independentSourceApproval': False, 'nativeDPAApproval': False,
    'newStrictCompletions': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'activeWrites': False, 'gitMutation': False, 'humanApproval': False, 'humanTrial': False,
    'freezeMeaning': 'Finished exact inert AUTHOR candidates and actual native additive evidence; not integration, source-debt completion or M7.',
}
FREEZE.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
for b in files:
    assert sha(ROOT / b['path']) == b['sha256']
print(json.dumps({'freeze': str(FREEZE.relative_to(ROOT)), 'sha256': sha(FREEZE),
                  'ownFileCount': len(files), 'ownBytes': sum(b['bytes'] for b in files),
                  'candidate21': True, 'holds11': True, 'strictGain': 0}))
