# SPDX-License-Identifier: Apache-2.0
"""Conservatively pair completed independent science; create no new verdicts."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = next(p for p in OWN.parents if (p / '.git').exists() and (p / 'AGENTS.md').is_file())
BASE = OWN.parent
CHECKED = {}


def read(p):
    return json.loads(p.read_text())


def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(ref):
    p = ROOT / ref['path']
    actual = bind(p)
    assert actual['sha256'] == 'sha256:' + ref['sha256'].removeprefix('sha256:'), p
    assert 'bytes' not in ref or actual['bytes'] == ref['bytes'], p
    CHECKED[ref['path']] = actual
    return p


def verify_tree(v):
    if isinstance(v, dict):
        if isinstance(v.get('path'), str) and isinstance(v.get('sha256'), str):
            verify(v)
        for child in v.values():
            verify_tree(child)
    elif isinstance(v, list):
        for child in v:
            verify_tree(child)


def put(p, v):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')


root_v3_path = BASE / 'chemie-b008-source-view-v3-targeted-independent-a-root-v1/five-affected-source-model-EN-candidates.independent-A.identifier-corrected-first.verdict.json'
b_entry_path = BASE / 'chemie-b008-partner-preserving-views-independent-b-v1/remediation-v3-independent-followup-v1/completed-five-affected-source-model-EN-candidates.independent-b.review.entry.json'
root_v3 = read(root_v3_path)
b_entry = read(b_entry_path)
for j in (root_v3, b_entry):
    verify_tree(j)
b_v3_path = verify(b_entry['immutableFirstVerdict'])
b_v3 = read(b_v3_path)
verify_tree(read(verify(b_entry['independentFirstSeal'])))
assert b_v3['independence']['freshSource22v2AndV3PeerJudgmentsReadBeforeThisFirst'] is False
root_reviews = root_v3['reviews']
b_reviews = b_v3['wholeFiveTargetedScientificDecisions']
assert len(root_reviews) == len(b_reviews) == 5
v3_pairs = []
for i, (a, b) in enumerate(zip(root_reviews, b_reviews)):
    assert a['actualPrimaryPhysicalPage'] == b['actualPrimaryPhysicalPage']
    if i < 3:
        assert a['entryIndices'] == b['entryIndices']
        assert b['scientificPartialContributionCompatible'] is True
    else:
        assert a['goalId'] == b['goalId']
    if i == 3:
        assert a['wholeAfterGoal'] == b['wholeGoalActuallyRead']
    v3_pairs.append({'rootItem': a['item'], 'peerReviewKey': b['reviewKey'],
        'goalId': a.get('goalId', b.get('targetGoalId')), 'entryIndices': a.get('entryIndices'),
        'actualPrimaryPhysicalPage': a['actualPrimaryPhysicalPage'],
        'rootVerdict': a['verdict'], 'peerVerdict': b.get('operativeSourceRoleVerdict', b.get('scientificVerdict')),
        'wholeRootReasons': a['reasonsDe'], 'wholePeerReason': b['reason'],
        'pairedState': 'HOLD_v3_RP_operative_rationale' if i == 0 else 'ACCEPT_BOUNDED_v3_CANDIDATE',
        'wholeSourceApproval': False, 'currentNativeApproval': False,
        'remainingRootObligations': a['remainingObligations']})

root_v4_path = BASE / 'chemie-b008-RP-two-text-v4-independent-root-v1/RP-two-text-v4.independent-root.first.verdict.json'
root_v4_freeze_path = root_v4_path.with_name('RP-two-text-v4.independent-root.first.freeze.json')
a_v4_entry_path = BASE / 'chemie-b008-RP-two-text-v4-independent-a-v1/neutral-RP-v4-two-text.independent-A.review.entry.json'
root_v4 = read(root_v4_path)
verify_tree(root_v4)
verify_tree(read(root_v4_freeze_path))
a_v4_entry = read(a_v4_entry_path)
verify_tree(a_v4_entry)
a_v4_path = verify(a_v4_entry['ownFirstVerdict'])
a_v4 = read(a_v4_path)
verify_tree(read(verify(a_v4_entry['ownFirstFreeze'])))
assert root_v4['independence']['freshV4PeerJudgmentsReadBeforeOwnFirst'] is False
assert a_v4['independence']['freshV4PeerOrRootJudgmentsRead'] is False
assert a_v4['verdict'] == 'ACCEPT_BOUNDED_TWO_TEXT_SUCCESSOR'
assert len(root_v4['reviews']) == 2 and all(r['decision'].startswith('accept_bounded_') for r in root_v4['reviews'])
assert a_v4['judgmentLimits']['twoTextRemedyAccepted'] is True
assert a_v4['judgmentLimits']['wholeCourseApproval'] is False
pair_path = OWN / 'five-source-model-v3-and-two-RP-v4-texts.conservative-independent-pair.actual.json'
put(pair_path, {'schemaVersion': 1, 'pairedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Technical pairing of five completed v3 science firsts and two genuine RP v4 targeted text firsts',
    'v3IndependentFirsts': [bind(root_v3_path), bind(b_v3_path)],
    'v3Pairs': v3_pairs, 'v3RPDisagreementPreserved': True,
    'v4IndependentFirsts': [bind(root_v4_path), bind(a_v4_path)],
    'v4IndependentSeals': [bind(root_v4_freeze_path), bind(verify(a_v4_entry['ownFirstFreeze']))],
    'v4WholeRootReasons': root_v4['reviews'], 'v4WholePeerCriteria': a_v4['criteria'],
    'v4PairedState': 'ACCEPT_BOUNDED_TWO_ACTUAL_TEXT_SUCCESSOR_ONLY',
    'actualVerifiedBindings': list(CHECKED.values()),
    'v4RemainingIndependentHolds': a_v4['remainingHolds'],
    'v3RemainingIndependentHolds': b_v3['remainingHolds'],
    'actualFiniteModelReviewerProof': b_entry['actualReviewerFiniteModelReceipt'],
    'unchangedSN_TH_EN_MVNoHistoricalReviewRestart': True,
    'twoCurrentNativeMVWholeCaseAndProfileBindingsStillRequired': True,
    'additionalEN2fddOutsideProtected177NeedsCurrentBindings': True,
    'originalSourceExtractionNotChanged': True,
    'sourceAtlasFull395And17OpaqueViewsNotApproved': True,
    'wholeSourceApproval': False, 'wholeCourseApproval': False, 'nativeApproval': False,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': [],
    'newM7Closures': 0, 'restoredM7Bindings': 0, 'netStrictGain': 0})
put(OWN / 'five-source-model-v3-and-two-RP-v4-texts.conservative-independent-pair.first.freeze.json',
    {'schemaVersion': 1, 'role': 'First immutable conservative pair', 'pair': bind(pair_path), 'script': bind(Path(__file__).resolve())})
print(json.dumps({'pair': bind(pair_path), 'boundedCurrentCandidates': 5, 'v3DissentPreserved': True, 'netStrictGain': 0}))
