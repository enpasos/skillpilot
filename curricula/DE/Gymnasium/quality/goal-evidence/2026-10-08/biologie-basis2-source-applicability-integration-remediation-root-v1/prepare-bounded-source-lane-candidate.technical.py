# SPDX-License-Identifier: Apache-2.0
"""Prepare the existing reviewed partial contributions in the ordinary mapping lane.

Only the isolated capsule is changed. Scientific judgments are reused from the
actual paired source reviews; this script performs no scientific review.
"""
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
PREP = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1'
CAP = ROOT / 'tmp/biologie-basis2-reviewed394-resumed-20261008-v1-capsule'
A_PATH = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-two-basic-source-native-independent-a-20261008-v2/source-nine-ten-partial-roles.independent-a.first.verdicts.json'
B_PATH = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-two-basic-source-placement-independent-b-20261008-v1/nine-duties-ten-bounded-roles-and-two-whole-scopes.source-b.first-verdict.json'
IDS = {'0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1'}


def read(path):
    return json.loads(Path(path).read_text())


def bind(path):
    path = Path(path)
    return dict(path=str(path.relative_to(ROOT)), sha256=hashlib.sha256(path.read_bytes()).hexdigest(), bytes=path.stat().st_size)


def put(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


guard = read(PREP / 'reviewed-basis2-current-final-adoption.guard.json')
for original in guard['before'].values():
    assert bind(ROOT / original['active']['path']) == original['active']
canonical = read(ROOT / guard['candidate']['canonical']['path'])
for goal in canonical['goals']:
    if goal['id'] in IDS:
        assert 'applicabilityMappingInheritance' not in goal['extendedData']
        goal['extendedData']['applicabilityMappingInheritance'] = 'boundary'
candidate_canon = OWN / 'candidate/canonical478.two-new-leaf-source-boundaries.json'
put(candidate_canon, canonical)

a = read(A_PATH)
b = read(B_PATH)
assert not a['blockingFindingsForTheseTenPartialRoles']
assert not b['sourceBlockingFindings']
aa = {(x['sourceGoalId'], x['goalId']): x for x in a['sourceVerdicts']}
bb = {(x['sourceGoalId'], x['goalId']): x for x in b['roles']}
assert set(aa) == set(bb) and len(aa) == 10
inputs = read(ROOT / guard['candidate']['sourceInputs']['path'])
installs = []
observed = []
now = datetime.now(timezone.utc).isoformat()
for mapping_path in inputs['mappingPaths']:
    mapping = read(ROOT / mapping_path)
    rows = [row for row in mapping.get('mappings', []) if row.get('canonicalGoalId') in IDS]
    if not rows:
        continue
    jurisdiction = mapping['jurisdiction']
    decisions = []
    for row in rows:
        key = (row['legacyGoalId'], row['canonicalGoalId'])
        av, bv = aa[key], bb[key]
        assert row['matchType'] == av['actualCurrentDecisionAndPartialRow']['wholePartnerRow']['matchType'] == bv['matchType'] == 'partial'
        assert row == av['actualCurrentDecisionAndPartialRow']['wholePartnerRow'] == bv['wholeActualPartnerRow']
        decisions.append(dict(
            sourceGoalId=key[0], decision='mapped', canonicalGoalIds=[key[1]], matchType='partial',
            reviewer='Root technical integration of paired independent Basis2 bounded-source decisions',
            reviewedAt=now, rationale=av['reasonDe'], sourceKind='boundedOriginalSourceContribution',
            wholeOriginalSourceCoverage=False, wholeCanonicalGoalApproval=False,
            independentSourceAReceipt=bind(A_PATH), independentSourceBReceipt=bind(B_PATH),
            independentSourceAReviewId=av['reviewId'],
            independentSourceBOriginalDecision=bv['roleDecision'],
            scientificReviewACompletedAtUtc=a['firstVerdictsAtUtc'],
            scientificReviewBCompletedAtUtc=b['createdAtUtc'],
        ))
        observed.append(dict(sourceGoalId=key[0], canonicalGoalId=key[1], jurisdiction=jurisdiction, matchType='partial'))
    source_name = jurisdiction.lower() + '_biology_basis2_bounded_source_contributions.reviewed-20261008-v1.review.json'
    destination = Path('curricula/DE/Gymnasium/mapping') / jurisdiction / 'source-components' / source_name
    candidate = OWN / 'candidate' / destination
    put(candidate, dict(
        schemaVersion=1, sourceLandscapeId=mapping['sourceLandscapeId'], targetLandscapeId=mapping['targetLandscapeId'],
        sourceExtractionPath=mapping['sourceExtractionPath'], jurisdiction=jurisdiction, subject='Biologie',
        reviewStatus='paired independent machine-reviewed bounded partial source contributions; whole original duties remain open',
        decisions=decisions, mappings=rows, wholeOriginalSourceCoverage=False,
        originalWholeDecisionAndAllOtherPartnersUnchanged=True,
        originalReviewedMappingSnapshot=bind(ROOT / mapping_path),
        newScientificReviewByIntegrator=False, humanApproval=False, humanTrial=False,
    ))
    assert not (ROOT / destination).exists()
    installs.append(dict(candidate=bind(candidate), destination=str(destination)))
assert len(installs) == 8 and len(observed) == 10 and len({x['sourceGoalId'] for x in observed}) == 9

# Detach the shared mapping directory before installing anything in the capsule.
mapping_dir = CAP / 'curricula/DE/Gymnasium/mapping'
assert mapping_dir.is_symlink()
mapping_source = mapping_dir.resolve()
mapping_dir.unlink()
shutil.copytree(mapping_source, mapping_dir, symlinks=True)
for install in installs:
    destination = CAP / install['destination']
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / install['candidate']['path'], destination)
shutil.copyfile(candidate_canon, CAP / guard['before']['canonical']['active']['path'])

old = read(ROOT / guard['candidate']['canonical']['path'])
old_goals = {g['id']: g for g in old['goals']}
for goal in canonical['goals']:
    expected = json.loads(json.dumps(old_goals[goal['id']]))
    if goal['id'] in IDS:
        expected['extendedData']['applicabilityMappingInheritance'] = 'boundary'
    assert goal == expected
for original in guard['before'].values():
    assert bind(ROOT / original['active']['path']) == original['active']
put(OWN / 'candidate-preparation.actual.json', dict(
    preparedAtUtc=now, ordinaryInheritanceBoundaryAppliedOnlyToNewTwoGoalIds=sorted(IDS),
    everyOtherWholeGoalFieldAndAll476PriorNodesExact=True,
    exactPairedPreviouslyReviewedPartialRows=observed,
    canonicalCandidate=bind(candidate_canon), ordinaryMappingInstalls=installs,
    independentSourceAReceipt=bind(A_PATH), independentSourceBReceipt=bind(B_PATH),
    originalNativeDPAndImagesNotChanged=True, wholeOriginalSourceCoverage=False,
    wholeSourceOperatorHoldsRetained=True, sourceContextFollowupPending=True,
    dependentLayerAChecksPending=True, activeWrites=0, activeStrictGainClaimed=0,
    newScientificReviewByIntegrator=False, humanApproval=False, humanTrial=False,
))
print('Prepared isolated two-boundary/eight-mapping candidate; ten genuine partial rows, active baseline unchanged.')
