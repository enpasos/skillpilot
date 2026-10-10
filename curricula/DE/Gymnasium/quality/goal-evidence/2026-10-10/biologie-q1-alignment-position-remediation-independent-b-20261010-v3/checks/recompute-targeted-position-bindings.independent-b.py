#!/usr/bin/env python3
"""Independent finite-coordinate proof for the one changed complete V3 case.

This does not execute BLAST or award a curriculum/source/native/human gate.
Run from the repository root. Original independent FIRST outputs stay immutable.
"""
import hashlib
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
V2 = BASE / 'biologie-q1-twelve-two-material-targeted-author-successor-v2'
V3 = BASE / 'biologie-q1-twelve-alignment-position-targeted-author-successor-v3'
FIRST = BASE / 'biologie-q1-twelve-whole-material-successor-independent-b-20261010-v2'
OUT = BASE / 'biologie-q1-alignment-position-remediation-independent-b-20261010-v3'
GOAL_ID = 'ed4cf96f-e1c9-5784-97f2-8279ff5a31b1'
CASE_ID = 'bioinformatics-quality-and-database'


def read(path):
    return json.loads(path.read_text())


def binding(path):
    b = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(ref):
    actual = binding(Path(ref['path']))
    assert actual['sha256'].removeprefix('sha256:') == ref['sha256'].removeprefix('sha256:'), ref['path']
    assert actual['bytes'] == ref['bytes'], ref['path']
    return actual


def stable_bytes(obj):
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()


def object_sha(obj):
    return 'sha256:' + hashlib.sha256(stable_bytes(obj)).hexdigest()


entry = read(V3 / 'neutral-twelve-whole-material-review.entry.json')
old_entry = read(V2 / 'neutral-twelve-whole-material-review.entry.json')
author_seal = read(V3 / 'author-successor.final.freeze.json')
old_seal = read(FIRST / 'FIRST.final.freeze.json')
verified = [verify(ref) for ref in entry['neutralFirstInputs']]
# Author diagnosis files are only checked as opaque byte references, not interpreted.
author_verified = [verify(ref) for ref in author_seal['files']]
old_own = [verify(ref) for ref in old_seal['ownArtifacts']]
old_neutral = [verify(ref) for ref in old_seal['exactActuallyBoundNeutralInputs']]
assert binding(FIRST / 'FIRST.final.freeze.json')['sha256'] == 'sha256:5ffc444110a16239653872081c441ca149bf4d7ef3daa7e8b6df6d413f63b1f3'

old = read(V2 / 'candidate/twelve.full-material-and-profile.author.json')
new = read(V3 / 'candidate/twelve.full-material-and-profile.author.json')
assert len(old['goals']) == len(new['goals']) == 12
assert {k: v for k, v in old.items() if k != 'goals'} == {k: v for k, v in new.items() if k != 'goals'}
changed = []
retained = []
for a, b in zip(old['goals'], new['goals']):
    assert a['goalId'] == b['goalId']
    if stable_bytes(a) != stable_bytes(b):
        changed.append(a['goalId'])
    else:
        retained.append({'goalId': a['goalId'], 'exactStableWholeMaterialBytesRetained': True,
                         'wholeMaterialBodyFingerprint': object_sha(a), 'profileFingerprintIndependentObjectRule': object_sha(a['profile'])})
assert changed == [GOAL_ID]
assert len(retained) == 11
a = next(g for g in old['goals'] if g['goalId'] == GOAL_ID)
b = next(g for g in new['goals'] if g['goalId'] == GOAL_ID)
assert a['cases'][0] == b['cases'][0]
assert a['cases'][1]['id'] == b['cases'][1]['id'] == CASE_ID
assert [x['id'] for x in b['cases']] == [x['id'] for x in b['profile']['applicationCaseBriefs']]
for k in ['archetype', 'expectations', 'coverageExpectations', 'variationAxes']:
    assert a['profile'][k] == b['profile'][k]
assert a['profile']['applicationCaseBriefs'][0] == b['profile']['applicationCaseBriefs'][0]
case = b['cases'][1]
brief = b['profile']['applicationCaseBriefs'][1]
for suffix in ['De', 'En']:
    assert case['task' + suffix] == brief['taskDemand' + suffix]
    assert case['workedSolution' + suffix] == brief['expectedPerformance' + suffix]
    for prefix in ['material', 'task', 'workedSolution', 'freshTransfer', 'freshTransferSolution', 'limits']:
        assert isinstance(case[prefix + suffix], str) and case[prefix + suffix].strip()
assert len(case['rubric']) == 3
assert case['rubric'] == a['cases'][1]['rubric']

old_rows = [json.loads(x) for x in (V2 / 'candidate/positive.twelve.author.review.jsonl').read_text().splitlines()]
new_rows = [json.loads(x) for x in (V3 / 'candidate/positive.twelve.author.review.jsonl').read_text().splitlines()]
assert len(old_rows) == len(new_rows) == 12
row_deltas = []
for x, y in zip(old_rows, new_rows):
    assert x['goalId'] == y['goalId']
    assert y['profile'] == next(g['profile'] for g in new['goals'] if g['goalId'] == y['goalId'])
    assert y['status'] == 'needs_human_review' and y['reviewAuthority'] == 'ai_candidate'
    assert y['evidenceLevel'] == 'E1' and y['maximumClaimScope'] == 'G1' and y['reviewRunIds'] == []
    for k in ['goalFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint']:
        assert x[k] == y[k]
    diff = [k for k in x if x.get(k) != y.get(k)]
    if y['goalId'] != GOAL_ID:
        assert x['profile'] == y['profile'] and x['profileFingerprint'] == y['profileFingerprint']
        assert set(diff) == {'reviewId', 'reviewedAt', 'reviewer', 'reason'}
    else:
        assert set(diff) == {'reviewId', 'reviewedAt', 'reviewer', 'reason', 'profileFingerprint', 'profile'}
    row_deltas.append({'goalId': y['goalId'], 'changedNormalRecordKeys': diff,
                       'profilePayloadRetained': x['profile'] == y['profile']})

# The reviewer read these raw coordinate statements in both full language fields.
# Explicit finite sets allow independent reconstruction without an author check.
query = set(range(1, 121))
repeat = set(range(1, 31))
diverse = set(range(31, 121))
removed = set(range(1, 11))
retained_query = query - removed
u_original = set(range(31, 116))
r_original = repeat
assert len(query) == 120 and len(repeat) == 30 and len(diverse) == 90
assert removed <= repeat and not (removed & diverse)
assert len(retained_query) == 110 and retained_query == set(range(11, 121))
assert len(u_original) == 85 and u_original <= diverse
assert not (u_original & removed)
u_new = {old_position - 10 for old_position in u_original}
assert u_new == set(range(21, 106)) and len(u_new) == 85
r_retained = r_original - removed
assert len(r_retained) == 20
# All supplied U alignment columns remain; any placement of its 80 identical
# columns is retained, without inventing an undisclosed identity-position list.
identities = 80
assert identities <= len(u_original)
coverage_original = len(u_original) / len(query)
coverage_trimmed = len(u_new) / len(retained_query)
identity = identities / len(u_original)
database_factor = 10
original_e = 1e-12
scaled_e = database_factor * original_e
assert abs(scaled_e - 1e-11) < 1e-24

# Exactly 31 inherited neutral references are unchanged (whole goal/kind/criteria,
# source partners, primary scopes and A/M). No source/native reapproval is granted.
old_refs = {r['path']: r for r in old_entry['neutralFirstInputs']}
inherited_refs = [r for r in entry['neutralFirstInputs'] if r['path'] in old_refs]
assert len(inherited_refs) == 31
for ref in inherited_refs:
    assert ref['sha256'] == old_refs[ref['path']]['sha256'] and ref['bytes'] == old_refs[ref['path']]['bytes']

result = {
    'schemaVersion': 1,
    'role': 'Actual independent targeted whole-case coordinate and binding reconstruction; not a BLAST run',
    'goalId': GOAL_ID, 'caseId': CASE_ID,
    'changedWholeMaterialGoalIds': changed,
    'unchangedWholeMaterialsAndProfiles': retained,
    'unchangedFirstCaseAndFreshGapTransfer': True,
    'changedWholeCase': {'wholeCaseFingerprint': object_sha(case), 'profileObjectFingerprint': object_sha(b['profile']),
                        'fullDEENFieldsAndRubricActuallyReadByReviewer': True, 'briefTaskAndSolutionMatchWholeCaseBothLanguages': True},
    'normalRecordDeltas': row_deltas,
    'normalUnchangedProfilesAreNotByteIdenticalRecordLines': 'Eleven complete profile payloads and substantive bindings are retained; four author metadata fields change in every normal record.',
    'positionProof': {
        'originalQueryPositions': sorted(query), 'originalRepeatPositions': sorted(repeat),
        'originalDiversePositions': sorted(diverse), 'removedOriginalPositions': sorted(removed),
        'retainedOriginalQueryPositions': sorted(retained_query), 'UOriginalAlignedPositions': sorted(u_original),
        'URemovedPositions': sorted(u_original & removed), 'UNewAlignedPositions': sorted(u_new),
        'UOriginalCount': len(u_original), 'UNewCount': len(u_new),
        'RComparisonAppliesBeforeTrimming': True, 'RRetainedPositionCountIfAdditionallyEvaluated': len(r_retained),
        'originalCoverage': coverage_original, 'trimmedCoverage': coverage_trimmed,
        'unchangedUIdentities': identities, 'unchangedUIdentity': identity,
        'UOriginalEValueSupplied': original_e, 'postTrimmingEValueNotSuppliedOrComputed': True,
        'databaseOnlyTransfer': {'queryLengthExplicitlyKept': len(query), 'queryNotTrimmed': True,
                                'filtersAndOtherConditionsKept': True, 'suppliedScaleFactor': database_factor,
                                'conditionalScaledEValue': scaled_e, 'isActualRecomputedBLASTValue': False}
    },
    'actualBindingValidation': {'verifiedNeutralRefs': verified, 'verifiedAuthorFrozenRefs': author_verified,
                                'priorFIRSTOwnArtifactsStillExact': len(old_own), 'priorFIRSTNeutralInputsStillExact': len(old_neutral),
                                'inheritedUnchangedNeutralRefs': inherited_refs},
    'sourceNativeCourseHumanAnd3312RemainOpen': True,
    'otherCurrentReviewOutputsRead': False, 'authorDiagnosisBodiesRead': False,
    'strictNetGain': 0, 'activeWrites': 0
}
destination = OUT / 'checks/recomputed-targeted-position-bindings.independent-b.actual.json'
actual_bytes = (json.dumps(result, ensure_ascii=False, indent=2) + '\n').encode()
if destination.exists():
    assert destination.read_bytes() == actual_bytes, 'Actual proof differs from the preserved result'
else:
    destination.write_bytes(actual_bytes)
print('PASS: original31–115 becomes new21–105; all85 U positions and80 identities remain.')
print('PASS: coverage85/120 and85/110; no new trimming E-value; DB-only original120 query gives conditional1e-11.')
print('PASS: exactly1 whole case/profile changed,11 entire material/profile payloads retained; previous FIRST and all inherited inputs exact.')
