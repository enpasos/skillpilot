# SPDX-License-Identifier: Apache-2.0
"""Correct the current config routing, preserving the genuine reviewed P10 bytes."""
from pathlib import Path
import copy
import hashlib
import json
import shutil

D = Path(__file__).resolve().parent
R = D.parents[6]
T = D.parent / 'biologie-he7-ten-reviewed-integration-preparation-technical-20261008-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
old_path = T / 'positive/current10.future-active.config.json'
old = read(old_path)
plan = read(T / 'ready-root-reviewed-guarded-integration-plan.technical.json')
actual = read(R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
selected = set(plan['selectedGoalIds'])
prepared = read(R / plan['futureCanonicalSource'])
assert actual == prepared
old_whole = read(R / old['landscapePath'])
old_by = {g['id']: g for g in old_whole['goals']}
new_by = {g['id']: g for g in actual['goals']}
for gid in selected:
    before = copy.deepcopy(old_by[gid])
    after = copy.deepcopy(new_by[gid])
    before.pop('resourceLinks', None)
    after.pop('resourceLinks', None)
    assert before == after, gid
records_path = R / old['reviewPath']
records = [json.loads(line) for line in records_path.read_text().splitlines() if line]
assert len(records) == 10 and {r['goalId'] for r in records} == selected
assert all(r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate' and r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1' for r in records)
criteria_path = R / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'
assert (R / old['reviewCriteriaPath']).read_bytes() == criteria_path.read_bytes()
for op in plan['assetOperations']:
    assert sha(R / op['target']) == op['sourceSha256'].removeprefix('sha256:')
new = copy.deepcopy(old)
new['landscapePath'] = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
new['semanticKindLedgerPath'] = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
new['reviewCriteriaPath'] = str(criteria_path.relative_to(R))
new['reviewedResourceTypes'] = ['goal-visualization']
new_path = D / 'positive/current10.current-reviewed.future-active.correct-config-v2.json'
new_path.parent.mkdir(parents=True, exist_ok=True)
with new_path.open('x') as f:
    json.dump(new, f, ensure_ascii=False, indent=2)
    f.write('\n')
receipt = {
    'error': 'Final config inherited source-first no-raster input routing',
    'originalConfig': {'path': str(old_path.relative_to(R)), 'sha256': sha(old_path)},
    'correctOperationalConfig': {'path': str(new_path.relative_to(R)), 'sha256': sha(new_path)},
    'genuineReviewedP10Records': {'path': str(records_path.relative_to(R)), 'sha256': sha(records_path)},
    'sourceFirstWholeGoalsEqualExceptExactlyReviewedNewRasterLinks': True,
    'sameActualReviewedCriteriaBytes': True,
    'sameActualIndependentlyReviewedPNGBytes': True,
    'goalFingerprintChanges': 0, 'reviewInputFingerprintChanges': 0,
    'profileOrMaterialCaseChanges': 0, 'newScientificReviewsClaimed': 0,
    'originalSealedConfigAndFailedCLILogRetained': True,
    'registryPointerChange': 'pending successful standard P10 CLI',
    'humanApproval': False, 'strictGainClaimed': 0,
}
with (D / 'operational-P10-config-routing-only-correction-v2.actual.json').open('x') as f:
    json.dump(receipt, f, indent=2)
    f.write('\n')
print(json.dumps(receipt))
