import datetime
import hashlib
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[5]
base = '9975a142f7a26f1c4ff31c46a70e149d82a3fce5'
physics = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
task_id = '3b7b2b62-e39c-5936-b0d8-5406206e57b6'
parent_id = 'bf980fff-b62b-4ea4-a20d-31681a7ad785'

def old_bytes(path):
    return subprocess.check_output(['git', 'show', f'{base}:{path}'], cwd=root)

paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', base, '--',
    'curricula/DE/Gymnasium/canonical', 'curricula/DE/Gymnasium/input',
    'curricula/DE/Gymnasium/provenance'], cwd=root, text=True).splitlines()
protected = [p for p in paths if '/canonical/' in p or '/input/' in p
    or 'prerequisite-reduction-proof-registry' in p]
diff_names = subprocess.check_output(['git', 'diff', '--name-only', base, '--',
    'curricula/DE/Gymnasium/canonical', 'curricula/DE/Gymnasium/input',
    'curricula/DE/Gymnasium/provenance'], cwd=root, text=True).splitlines()
changed = [p for p in protected if p in set(diff_names)]
assert changed == [physics], changed
old = json.loads(old_bytes(physics))
new = json.loads((root / physics).read_bytes())
assert {k: v for k, v in old.items() if k != 'goals'} == {k: v for k, v in new.items() if k != 'goals'}
old_goals = {g['id']: g for g in old['goals']}
new_goals = {g['id']: g for g in new['goals']}
assert set(new_goals) - set(old_goals) == {task_id}
assert not set(old_goals) - set(new_goals)
changed_goals = [i for i in old_goals if old_goals[i] != new_goals[i]]
assert changed_goals == [parent_id], changed_goals
expected_parent = dict(old_goals[parent_id])
expected_parent['contains'] = expected_parent['contains'] + [task_id]
assert new_goals[parent_id] == expected_parent
candidate_path = root / 'tmp/pipeline/laender-stufen/gesamt/review/lens-eye-reviewed-candidate/lens-eye-two-model-simulations.goal.json'
candidate = json.loads(candidate_path.read_text())
assert candidate['examData']['reviewStatus'] == 'needs_review'
candidate['examData']['reviewStatus'] = 'released'
review_note = new_goals[task_id]['examData'].get('reviewNote')
assert isinstance(review_note, str)
assert 'independent-review/content-review.actual.json' in review_note
assert 'included in the final reviewed candidate' in review_note
candidate['examData']['reviewNote'] = review_note
assert candidate == new_goals[task_id], 'Released task differs from the independently reviewed candidate beyond release metadata.'
report = {
    'schema': 'skillpilot-final-protected-input-comparison-v1',
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'baseCommit': base,
    'status': 'PASS',
    'protectedExistingFiles': len(protected),
    'gitUnchangedExistingFiles': len(protected) - 1,
    'changedCatalog': physics,
    'unchangedExistingPhysicsGoals': len(old_goals) - 1,
    'structuralLinkOnly': {'parentId': parent_id, 'addedChild': task_id},
    'newAssessment': {'id': task_id, 'reviewedCandidate': str(candidate_path.relative_to(root)),
        'candidateSha256': hashlib.sha256(candidate_path.read_bytes()).hexdigest(),
        'allowedDelta': ['examData.reviewStatus: needs_review -> released', 'examData.reviewNote: reviewed release attribution'],
        'reviewNote': review_note},
    'preserved': ['All existing competency text and requires', 'All retained source bytes',
        'All tracked prerequisite reduction registry versions, including V9 and its parent'],
    'physicsCatalogSha256': hashlib.sha256((root / physics).read_bytes()).hexdigest(),
}
output = Path(__file__).with_name('final-protected-inputs.actual.json')
output.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
