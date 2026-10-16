"""Verify the finite archived inputs without using ignored execution capsules."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
manifest = json.loads((HERE / 'MANIFEST.inactive-current438.json').read_text())
assert manifest['activation'] is False and manifest['M7Claim'] is False
repo_root = HERE.parents[6]
normal = repo_root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert hashlib.sha256(normal.read_bytes()).hexdigest() == manifest['normalChemistrySha256']
seen = set()
json_files = jsonl_records = total = 0
for row in manifest['files']:
    path = HERE / row['storedPath']
    assert path.is_relative_to(HERE)
    assert path.is_file() and not path.is_symlink(), path
    assert row['storedPath'] not in seen, path
    seen.add(row['storedPath'])
    data = path.read_bytes()
    assert len(data) == row['bytes'], path
    assert hashlib.sha256(data).hexdigest() == row['sha256'], path
    total += len(data)
    if path.suffix == '.json':
        json.loads(data)
        json_files += 1
    elif path.suffix == '.jsonl':
        for line in data.decode().splitlines():
            if line.strip():
                json.loads(line)
                jsonl_records += 1
candidate = HERE / 'candidate-delta/curricula/DE/Gymnasium'
goals = json.loads((candidate / 'canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text())['goals']
semantic = json.loads((candidate / 'quality/goal-book-publication/chemie.semantic-kinds.json').read_text())['decisions']
goal_ids = {goal['id'] for goal in goals}
assert len(goals) == len(goal_ids) == manifest['candidateWholeGoals'] == 640
assert sum(row['goalId'] in goal_ids and row['semanticKind'] == 'curricularAtomic'
           for row in semantic) == manifest['candidateCurricularAtomicGoals'] == 438
assert manifest['currentL6CentralResult'] is None
assert manifest['activeNetNewStrictClosures'] == 0
print(json.dumps({'result': 'PASS', 'files': len(seen), 'bytes': total,
                  'JSONFiles': json_files, 'JSONLRecords': jsonl_records,
                  'normalChemistryUnchanged': True, 'M7Claim': False}))
